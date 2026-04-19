"""
Image processing utilities for Mirra.
Handles WebP conversion, EXIF stripping, auto-rotation, resizing, and magic-byte validation.
"""

import io
import hashlib
import logging
from django.conf import settings
from django.core.files.base import ContentFile

logger = logging.getLogger("mirra.image_processor")

# ─────────────────────────────────────────────────────────────
# Magic byte signatures for allowed file types
# ─────────────────────────────────────────────────────────────
MAGIC_BYTES = {
    # Images
    'jpeg': [(0, b'\xff\xd8\xff')],
    'jpg':  [(0, b'\xff\xd8\xff')],
    'png':  [(0, b'\x89PNG\r\n\x1a\n')],
    'webp': [(0, b'RIFF'), (8, b'WEBP')],
    'gif':  [(0, b'GIF87a'), (0, b'GIF89a')],
    'heic': [(4, b'ftyp')],  # simplified check
    # Video
    'mp4':  [(4, b'ftyp')],
    'mov':  [(4, b'ftyp')],
    'avi':  [(0, b'RIFF')],
    'webm': [(0, b'\x1a\x45\xdf\xa3')],
    'mkv':  [(0, b'\x1a\x45\xdf\xa3')],
    # Audio
    'mp3':  [(0, b'\xff\xfb'), (0, b'\xff\xf3'), (0, b'ID3')],
    'wav':  [(0, b'RIFF')],
    'aac':  [(0, b'\xff\xf1'), (0, b'\xff\xf9')],
    'm4a':  [(4, b'ftyp')],
    'ogg':  [(0, b'OggS')],
}


def validate_magic_bytes(file_obj, claimed_ext: str) -> bool:
    """
    Validate that the first bytes of a file match the claimed extension.
    Prevents MIME spoofing (e.g., a renamed .exe uploaded as .jpg).

    Args:
        file_obj: Django UploadedFile or file-like object
        claimed_ext: lowercase extension WITHOUT dot (e.g., 'jpg')

    Returns:
        True if magic bytes match, False otherwise
    """
    ext = claimed_ext.lower().lstrip('.')
    signatures = MAGIC_BYTES.get(ext)

    if not signatures:
        # Unknown extension — reject
        logger.warning("validate_magic_bytes: unknown extension '%s'", ext)
        return False

    try:
        file_obj.seek(0)
        header = file_obj.read(16)
        file_obj.seek(0)

        for offset, magic in signatures:
            if header[offset: offset + len(magic)] == magic:
                return True

        logger.warning(
            "validate_magic_bytes: magic mismatch for ext='%s', header=%s",
            ext, header[:12].hex()
        )
        return False
    except Exception as e:
        logger.error("validate_magic_bytes error: %s", e)
        return False


def process_image(file_obj, quality: int = None) -> ContentFile | None:
    """
    Full image processing pipeline for Mirra uploads:
      1. Open with Pillow
      2. Auto-rotate based on EXIF orientation
      3. Strip ALL EXIF metadata (privacy)
      4. Resize if width > MIRRA_MAX_IMAGE_WIDTH (maintains aspect ratio)
      5. Convert to WebP with the configured quality

    Args:
        file_obj: Django UploadedFile or file-like object
        quality: WebP quality override (default: settings.MIRRA_WEBP_QUALITY)

    Returns:
        ContentFile with WebP bytes, or None on failure
    """
    try:
        from PIL import Image, ExifTags

        q = quality or getattr(settings, 'MIRRA_WEBP_QUALITY', 82)
        max_width = getattr(settings, 'MIRRA_MAX_IMAGE_WIDTH', 2400)

        file_obj.seek(0)
        img = Image.open(file_obj)

        # ── 1. Auto-rotate using EXIF orientation ──────────────
        try:
            exif = img._getexif()
            if exif:
                orient_tag = next(
                    (k for k, v in ExifTags.TAGS.items() if v == 'Orientation'),
                    None
                )
                if orient_tag and orient_tag in exif:
                    orientation = exif[orient_tag]
                    rotation_map = {
                        3: Image.ROTATE_180,
                        6: Image.ROTATE_270,
                        8: Image.ROTATE_90,
                    }
                    if orientation in rotation_map:
                        img = img.transpose(rotation_map[orientation])
        except Exception:
            pass  # No EXIF or rotation info — continue

        # ── 2. Strip EXIF (create new image without metadata) ──
        data = list(img.getdata())
        clean_img = Image.new(img.mode, img.size)
        clean_img.putdata(data)
        img = clean_img

        # ── 3. Resize if too wide ───────────────────────────────
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # ── 4. Convert to RGB (WebP doesn't support all modes) ─
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        # ── 5. Encode to WebP ───────────────────────────────────
        output = io.BytesIO()
        img.save(output, format='WEBP', quality=q, method=4)
        output.seek(0)

        return ContentFile(output.read())

    except Exception as e:
        logger.error("process_image failed: %s", e)
        return None


def generate_thumbnail_webp(file_obj, size: tuple = (400, 400)) -> ContentFile | None:
    """
    Generate a WebP thumbnail for an image file.

    Args:
        file_obj: file-like object pointing to original image
        size: max bounding box (width, height)

    Returns:
        ContentFile with WebP thumbnail bytes, or None on failure
    """
    try:
        from PIL import Image

        q = getattr(settings, 'MIRRA_THUMB_WEBP_QUALITY', 80)

        file_obj.seek(0)
        img = Image.open(file_obj)

        # Convert to RGB for WebP compatibility
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        img.thumbnail(size, Image.Resampling.LANCZOS)

        output = io.BytesIO()
        img.save(output, format='WEBP', quality=q, method=4)
        output.seek(0)

        return ContentFile(output.read())

    except Exception as e:
        logger.error("generate_thumbnail_webp failed: %s", e)
        return None


def hash_file(file_obj) -> str:
    """
    Compute SHA-256 hash of a file for virus scan logging
    and QR token storage.

    Args:
        file_obj: file-like object

    Returns:
        Hex digest string
    """
    sha = hashlib.sha256()
    file_obj.seek(0)
    for chunk in iter(lambda: file_obj.read(8192), b''):
        sha.update(chunk)
    file_obj.seek(0)
    return sha.hexdigest()


def scan_file(file_obj) -> dict:
    """
    Virus scan placeholder — logs file hash.
    Ready for ClamAV integration (replace body with pyclamd call).

    Returns:
        dict: {'clean': True, 'hash': sha256_hex}
    """
    file_hash = hash_file(file_obj)
    logger.info("scan_file: hash=%s (ClamAV not yet integrated)", file_hash)
    # TODO: integrate pyclamd
    # import pyclamd
    # cd = pyclamd.ClamdUnixSocket()
    # result = cd.scan_file(file_path)
    # return {'clean': result is None, 'hash': file_hash}
    return {'clean': True, 'hash': file_hash}
