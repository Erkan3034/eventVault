"""
Upload models for Mirra.
All images are auto-converted to WebP (quality=82) on save.
All thumbnails are WebP (quality=80).
EXIF metadata is stripped for privacy.
"""

import uuid
import os
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from apps.albums.models import Album

User = get_user_model()


def upload_path(instance, filename):
    """
    Generate upload path for files.
    Extension is always .webp for images; original ext preserved for video/audio.
    Path: uploads/{album_access_code}/{uuid}.{ext}
    """
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'bin'
    new_filename = f"{uuid.uuid4()}.{ext}"
    return f"uploads/{instance.album.access_code}/{new_filename}"


def thumbnail_path(instance, filename):
    return f"thumbnails/{instance.album.access_code}/{filename}"


class Upload(models.Model):
    """
    File uploads to Mirra albums.
    Images are always stored as WebP after processing.
    """

    FILE_TYPES = [
        ('image', _('Image')),
        ('video', _('Video')),
        ('audio', _('Audio')),
        ('document', _('Document')),
        ('other', _('Other')),
    ]

    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected')),
        ('processing', _('Processing')),
    ]

    # ── Identity ──────────────────────────────────────────────
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        related_name='uploads',
        verbose_name=_('album'),
    )

    # ── File ─────────────────────────────────────────────────
    file = models.FileField(_('file'), upload_to=upload_path)
    original_filename = models.CharField(_('original filename'), max_length=255)
    file_type = models.CharField(_('file type'), max_length=20, choices=FILE_TYPES)
    file_size = models.PositiveIntegerField(_('file size (bytes)'), default=0)
    mime_type = models.CharField(_('MIME type'), max_length=100, blank=True)
    file_hash = models.CharField(_('SHA-256 hash'), max_length=64, blank=True)

    # ── Media metadata ────────────────────────────────────────
    thumbnail = models.ImageField(
        _('thumbnail'), upload_to=thumbnail_path, blank=True, null=True
    )
    width = models.PositiveIntegerField(_('width'), null=True, blank=True)
    height = models.PositiveIntegerField(_('height'), null=True, blank=True)
    duration = models.FloatField(_('duration (seconds)'), null=True, blank=True)

    # ── Uploader ──────────────────────────────────────────────
    uploader_name = models.CharField(_('uploader name'), max_length=100, blank=True)
    uploader_email = models.EmailField(_('uploader email'), blank=True)
    uploader_phone = models.CharField(_('uploader phone'), max_length=20, blank=True)
    uploader_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploads',
        verbose_name=_('uploader user'),
    )

    # ── Content ───────────────────────────────────────────────
    caption = models.TextField(_('caption'), blank=True)
    message = models.TextField(_('message'), blank=True)

    # ── Metadata ──────────────────────────────────────────────
    location_data = models.JSONField(_('location data'), default=dict, blank=True)
    # Note: EXIF is intentionally NOT stored — stripped for user privacy.

    # ── Moderation ────────────────────────────────────────────
    status = models.CharField(
        _('status'), max_length=20, choices=STATUS_CHOICES, default='approved'
    )
    moderation_note = models.TextField(_('moderation note'), blank=True)
    moderated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_uploads',
        verbose_name=_('moderated by'),
    )
    moderated_at = models.DateTimeField(_('moderated at'), null=True, blank=True)

    # ── Stats ─────────────────────────────────────────────────
    view_count = models.PositiveIntegerField(_('view count'), default=0)
    like_count = models.PositiveIntegerField(_('like count'), default=0)
    download_count = models.PositiveIntegerField(_('download count'), default=0)

    # ── Timestamps ────────────────────────────────────────────
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'uploads'
        verbose_name = _('Upload')
        verbose_name_plural = _('Uploads')
        ordering = ['-created_at']

    def __str__(self):
        uploader = self.uploader_display_name
        return f"{self.original_filename} by {uploader}"

    # ── Lifecycle ─────────────────────────────────────────────

    def save(self, *args, **kwargs):
        is_create = self._state.adding
        if self.file and (is_create or not self.file_type):
            # UUID pk is set before insert, so do not use `not self.pk` here
            self._process_new_upload()
        elif self.file and not self.file_size:
            self.file_size = self.file.size

        super().save(*args, **kwargs)

        # Generate thumbnail after DB row exists
        if self.file and self.file_type == 'image' and not self.thumbnail:
            self._generate_thumbnail()

        # Broadcast to Supabase Realtime subscribers
        from utils.supabase import broadcast_new_media
        broadcast_new_media(str(self.album_id), {
            'id': str(self.id),
            'uploader_name': self.uploader_display_name,
            'media_type': self.file_type,
            'thumbnail_url': None,  # filled in after thumbnail generation
        })

    def _process_new_upload(self):
        """
        Called once on the very first save.
        1. Determine file type (magic bytes check)
        2. If image: convert to WebP, strip EXIF
        3. Hash the file for scan logging
        4. Set file_size
        """
        from utils.image_processor import (
            validate_magic_bytes,
            process_image,
            scan_file,
        )
        from django.conf import settings

        raw_name = self.file.name if self.file else ''
        ext = raw_name.rsplit('.', 1)[-1].lower() if '.' in raw_name else ''

        # Store original filename for display
        if not self.original_filename:
            self.original_filename = os.path.basename(raw_name)

        # Determine file type
        self._set_file_type(ext)

        # Magic bytes validation
        if not validate_magic_bytes(self.file, ext):
            raise ValidationError(
                f"Dosya türü doğrulanamadı. Lütfen geçerli bir {ext.upper()} dosyası yükleyin."
            )

        # Scan (logs hash; ClamAV-ready)
        scan_result = scan_file(self.file)
        self.file_hash = scan_result.get('hash', '')

        # Image processing → WebP
        if self.file_type == 'image' and getattr(settings, 'MIRRA_CONVERT_TO_WEBP', True):
            webp_bytes = process_image(self.file)
            if webp_bytes:
                from django.core.files.base import ContentFile
                webp_name = f"{uuid.uuid4()}.webp"
                self.file.save(webp_name, ContentFile(webp_bytes.read()), save=False)
                self.mime_type = 'image/webp'
            else:
                self.mime_type = f'image/{ext}'
        elif self.file_type == 'video':
            self.mime_type = f'video/{ext}'
        elif self.file_type == 'audio':
            self.mime_type = f'audio/{ext}'

        # Always update file_size after potential conversion
        self.file_size = self.file.size

    def _set_file_type(self, ext: str):
        """Map file extension to file_type field."""
        image_exts = {'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'heic'}
        video_exts = {'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'}
        audio_exts = {'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'}
        doc_exts = {'pdf', 'doc', 'docx', 'txt', 'rtf'}

        if ext in image_exts:
            self.file_type = 'image'
        elif ext in video_exts:
            self.file_type = 'video'
        elif ext in audio_exts:
            self.file_type = 'audio'
        elif ext in doc_exts:
            self.file_type = 'document'
        else:
            self.file_type = 'other'

    def _generate_thumbnail(self):
        """Generate a WebP thumbnail after the file is saved."""
        if self.file_type != 'image':
            return
        try:
            from utils.image_processor import generate_thumbnail_webp
            thumb_bytes = generate_thumbnail_webp(self.file)
            if thumb_bytes:
                thumb_name = f"thumb_{self.id}.webp"
                self.thumbnail.save(thumb_name, thumb_bytes, save=False)
                # Update only thumbnail column — avoid re-triggering full save()
                Upload.objects.filter(pk=self.pk).update(thumbnail=self.thumbnail.name)
        except Exception as e:
            import logging
            logging.getLogger("mirra.uploads").warning(
                "Thumbnail generation failed for upload %s: %s", self.id, e
            )

    # ── Validation ────────────────────────────────────────────

    def clean(self):
        """Validate upload constraints against album settings."""
        if not self.album_id:
            return

        can_upload, message = self.album.can_upload()
        if not can_upload:
            raise ValidationError(message)

        if self.file and self.file.size:
            from django.conf import settings

            # Per-type size limits
            limits = {
                'image': settings.MAX_UPLOAD_SIZE_IMAGE,
                'video': settings.MAX_UPLOAD_SIZE_VIDEO,
                'audio': settings.MAX_UPLOAD_SIZE_AUDIO,
            }
            limit = limits.get(self.file_type, settings.MAX_UPLOAD_SIZE_IMAGE)
            if self.file.size > limit:
                raise ValidationError(
                    f"Dosya boyutu izin verilen limiti aşıyor ({limit // (1024*1024)} MB)."
                )

    # ── Properties ────────────────────────────────────────────

    @property
    def file_size_mb(self) -> float:
        return round(self.file_size / (1024 * 1024), 2)

    @property
    def uploader_display_name(self) -> str:
        if self.uploader_user:
            return self.uploader_user.full_name
        return self.uploader_name or 'Anonim'

    @property
    def is_image(self) -> bool:
        return self.file_type == 'image'

    @property
    def is_video(self) -> bool:
        return self.file_type == 'video'

    @property
    def is_audio(self) -> bool:
        return self.file_type == 'audio'


class UploadComment(models.Model):
    """Comments on uploads."""

    upload = models.ForeignKey(
        Upload, on_delete=models.CASCADE, related_name='comments', verbose_name=_('upload')
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='upload_comments', verbose_name=_('author')
    )
    content = models.TextField(_('content'))
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='replies', verbose_name=_('parent comment'),
    )
    is_approved = models.BooleanField(_('is approved'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'upload_comments'
        verbose_name = _('Upload Comment')
        verbose_name_plural = _('Upload Comments')
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.full_name} on {self.upload.original_filename}"


class UploadLike(models.Model):
    """Likes on uploads — also supports anonymous (cookie-based) likes."""

    upload = models.ForeignKey(
        Upload, on_delete=models.CASCADE, related_name='likes', verbose_name=_('upload')
    )
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='upload_likes', verbose_name=_('user'),
    )
    # For anonymous guests: store cookie session ID
    session_key = models.CharField(_('session key'), max_length=64, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'upload_likes'
        verbose_name = _('Upload Like')
        verbose_name_plural = _('Upload Likes')

    def __str__(self):
        name = self.user.full_name if self.user else 'Anonim'
        return f"{name} likes {self.upload.original_filename}"


class UploadReport(models.Model):
    """Reports for inappropriate content."""

    REASON_CHOICES = [
        ('inappropriate', _('Inappropriate Content')),
        ('spam', _('Spam')),
        ('copyright', _('Copyright Violation')),
        ('harassment', _('Harassment')),
        ('other', _('Other')),
    ]

    upload = models.ForeignKey(
        Upload, on_delete=models.CASCADE, related_name='reports', verbose_name=_('upload')
    )
    reporter = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='upload_reports', verbose_name=_('reporter')
    )
    reason = models.CharField(_('reason'), max_length=20, choices=REASON_CHOICES)
    description = models.TextField(_('description'), blank=True)
    is_resolved = models.BooleanField(_('is resolved'), default=False)
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='resolved_reports', verbose_name=_('resolved by'),
    )
    resolved_at = models.DateTimeField(_('resolved at'), null=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'upload_reports'
        unique_together = ['upload', 'reporter']
        verbose_name = _('Upload Report')
        verbose_name_plural = _('Upload Reports')

    def __str__(self):
        return f"Report by {self.reporter.full_name} on {self.upload.original_filename}"