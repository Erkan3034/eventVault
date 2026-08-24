"""Build an album ZIP and push files to a user's Google Drive folder."""

import json
import mimetypes
import re
import shutil
import tempfile
import zipfile
from urllib.parse import quote
from zoneinfo import ZoneInfo

import requests
from django.db.models import F
from django.http import FileResponse
from django.utils.text import slugify

from apps.uploads.models import Upload
from .models import Album

DRIVE_FILES = 'https://www.googleapis.com/drive/v3/files'
DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files'
DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
ISTANBUL = ZoneInfo('Europe/Istanbul')


class DriveExportError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = 401 if status_code in (401, 403) else status_code


def exportable_uploads(album):
    qs = Upload.objects.filter(album=album).order_by('created_at')
    if album.require_approval:
        return qs.filter(status='approved')
    return qs.exclude(status='rejected')


def safe_filename(value, fallback='dosya'):
    text = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', (value or '').strip())
    text = re.sub(r'\s+', ' ', text).strip(' .')
    return (text[:120] or fallback)


def unique_name(name, used):
    if name not in used:
        used.add(name)
        return name
    stem, dot, ext = name.rpartition('.')
    if not dot:
        stem, ext = name, ''
    else:
        ext = f'.{ext}'
    index = 2
    while True:
        candidate = f'{stem} ({index}){ext}'
        if candidate not in used:
            used.add(candidate)
            return candidate
        index += 1


def zip_basename(album):
    base = slugify(album.title, allow_unicode=False) or 'album'
    return f'{base[:80]}.zip'


def _note_block(upload, filename):
    created = upload.created_at.astimezone(ISTANBUL).strftime('%d.%m.%Y %H:%M') if upload.created_at else ''
    lines = [
        f'--- {filename} ---',
        f'Yükleyen: {upload.uploader_display_name or "Anonim"}',
        f'Tarih: {created}',
    ]
    note = (upload.message or upload.caption or '').strip()
    if note:
        lines.append(f'Not: {note}')
    return '\n'.join(lines)


def _open_upload_file(upload):
    if not upload.file:
        return None
    try:
        return upload.file.open('rb')
    except Exception:
        return None


def build_album_zip(album):
    uploads = list(exportable_uploads(album))
    tmp = tempfile.TemporaryFile()
    used = set()
    notes = [
        f'Albüm: {album.title}',
        f'Tarih: {album.event_date or "—"}',
        f'Konum: {album.event_location or "—"}',
        f'Dosya sayısı: {len(uploads)}',
        '',
    ]
    folder = safe_filename(album.title, 'album')

    with zipfile.ZipFile(tmp, 'w', compression=zipfile.ZIP_DEFLATED, allowZip64=True) as archive:
        for index, upload in enumerate(uploads, start=1):
            original = safe_filename(upload.original_filename or '', '')
            if not original:
                ext = 'txt' if (upload.message or upload.caption) else 'bin'
                original = f'yukleme.{ext}'
            filename = unique_name(f'{index:03d}_{original}', used)
            handle = _open_upload_file(upload)
            if handle is not None:
                try:
                    with archive.open(f'{folder}/{filename}', 'w') as dest:
                        shutil.copyfileobj(handle, dest, length=1024 * 1024)
                finally:
                    handle.close()
            elif (upload.message or upload.caption):
                archive.writestr(
                    f'{folder}/{filename if filename.endswith(".txt") else filename + ".txt"}',
                    (upload.message or upload.caption).encode('utf-8'),
                )
            else:
                continue
            notes.append(_note_block(upload, filename))
            notes.append('')

        archive.writestr(f'{folder}/album.txt', '\n'.join(notes).encode('utf-8'))

    tmp.seek(0)
    return tmp, len(uploads)


def zip_response(album, tmp):
    filename = zip_basename(album)
    response = FileResponse(tmp, as_attachment=True, filename=filename)
    response['Content-Type'] = 'application/zip'
    response['Content-Disposition'] = (
        f"attachment; filename=\"{filename}\"; filename*=UTF-8''{quote(filename)}"
    )
    return response


def mark_album_downloaded(album, extra=0):
    Album.objects.filter(pk=album.pk).update(download_count=F('download_count') + max(extra, 1))


def _drive_headers(token):
    return {'Authorization': f'Bearer {token}'}


def _drive_error_message(response):
    try:
        payload = response.json()
        return payload.get('error', {}).get('message') or response.text
    except ValueError:
        return response.text or 'Google Drive yanıt vermedi.'


def _raise_drive_http(response):
    if response.status_code in (401, 403):
        raise DriveExportError(
            'Google Drive izni yok veya oturum süresi doldu. Tekrar bağlanın.',
            response.status_code,
        )
    raise DriveExportError(_drive_error_message(response), response.status_code)


def create_drive_folder(token, name):
    try:
        response = requests.post(
            DRIVE_FILES,
            headers={**_drive_headers(token), 'Content-Type': 'application/json'},
            params={'fields': 'id,name,webViewLink'},
            json={
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder',
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        raise DriveExportError('Google Drive şu anda yanıt vermiyor. Biraz sonra tekrar deneyin.', 502) from exc
    if response.status_code >= 400:
        _raise_drive_http(response)
    return response.json()


def upload_file_to_drive(token, folder_id, filename, handle, mime_type):
    metadata = json.dumps({'name': filename, 'parents': [folder_id]}).encode('utf-8')
    try:
        response = requests.post(
            DRIVE_UPLOAD,
            headers=_drive_headers(token),
            params={'uploadType': 'multipart', 'fields': 'id'},
            files={
                'metadata': ('metadata', metadata, 'application/json; charset=UTF-8'),
                'file': (filename, handle, mime_type or 'application/octet-stream'),
            },
            timeout=180,
        )
    except requests.RequestException as exc:
        raise DriveExportError('Google Drive yüklemesi kesildi. Biraz sonra tekrar deneyin.', 502) from exc
    if response.status_code >= 400:
        _raise_drive_http(response)
    return response.json()


def push_album_to_drive(album, access_token):
    uploads = list(exportable_uploads(album))
    if not uploads:
        raise DriveExportError('Dışa aktarılacak dosya yok.', 400)

    folder_name = f'EventVault — {safe_filename(album.title, "album")}'
    if album.event_date:
        folder_name = f'{folder_name} ({album.event_date})'

    folder = create_drive_folder(access_token, folder_name)
    used = set()
    uploaded = 0
    skipped = 0

    for index, upload in enumerate(uploads, start=1):
        original = safe_filename(upload.original_filename or '', f'yukleme-{index}')
        filename = unique_name(f'{index:03d}_{original}', used)
        handle = _open_upload_file(upload)
        if handle is None:
            skipped += 1
            continue
        mime = upload.mime_type or mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        try:
            upload_file_to_drive(access_token, folder['id'], filename, handle, mime)
            uploaded += 1
        finally:
            handle.close()

    mark_album_downloaded(album, uploaded)
    return {
        'folder_id': folder.get('id'),
        'folder_url': folder.get('webViewLink') or f"https://drive.google.com/drive/folders/{folder.get('id')}",
        'folder_name': folder.get('name') or folder_name,
        'uploaded': uploaded,
        'skipped': skipped,
        'total': len(uploads),
    }
