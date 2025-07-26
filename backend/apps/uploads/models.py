import uuid
import os
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from PIL import Image
from apps.albums.models import Album

User = get_user_model()


def upload_path(instance, filename):
    """Generate upload path for files"""
    # Get file extension
    ext = filename.split('.')[-1].lower()
    # Generate new filename with UUID
    new_filename = f"{uuid.uuid4()}.{ext}"
    # Create path: uploads/album_access_code/new_filename
    return f"uploads/{instance.album.access_code}/{new_filename}"


class Upload(models.Model):
    """
    File uploads to albums
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

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    album = models.ForeignKey(
        Album, 
        on_delete=models.CASCADE, 
        related_name='uploads',
        verbose_name=_('album')
    )
    
    # File Information
    file = models.FileField(_('file'), upload_to=upload_path)
    original_filename = models.CharField(_('original filename'), max_length=255)
    file_type = models.CharField(_('file type'), max_length=20, choices=FILE_TYPES)
    file_size = models.PositiveIntegerField(_('file size (bytes)'), default=0)
    mime_type = models.CharField(_('MIME type'), max_length=100, blank=True)
    
    # Media-specific Information
    thumbnail = models.ImageField(_('thumbnail'), upload_to='thumbnails/', blank=True, null=True)
    width = models.PositiveIntegerField(_('width'), null=True, blank=True)
    height = models.PositiveIntegerField(_('height'), null=True, blank=True)
    duration = models.FloatField(_('duration (seconds)'), null=True, blank=True)
    
    # Upload Information
    uploader_name = models.CharField(_('uploader name'), max_length=100, blank=True)
    uploader_email = models.EmailField(_('uploader email'), blank=True)
    uploader_phone = models.CharField(_('uploader phone'), max_length=20, blank=True)
    uploader_user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='uploads',
        verbose_name=_('uploader user')
    )
    
    # Content
    caption = models.TextField(_('caption'), blank=True)
    message = models.TextField(_('message'), blank=True)
    
    # Metadata
    exif_data = models.JSONField(_('EXIF data'), default=dict, blank=True)
    location_data = models.JSONField(_('location data'), default=dict, blank=True)
    
    # Moderation
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='approved')
    moderation_note = models.TextField(_('moderation note'), blank=True)
    moderated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_uploads',
        verbose_name=_('moderated by')
    )
    moderated_at = models.DateTimeField(_('moderated at'), null=True, blank=True)
    
    # Stats
    view_count = models.PositiveIntegerField(_('view count'), default=0)
    like_count = models.PositiveIntegerField(_('like count'), default=0)
    download_count = models.PositiveIntegerField(_('download count'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'uploads'
        verbose_name = _('Upload')
        verbose_name_plural = _('Uploads')
        ordering = ['-created_at']

    def __str__(self):
        uploader = self.uploader_name or self.uploader_user.full_name if self.uploader_user else 'Anonymous'
        return f"{self.original_filename} by {uploader}"

    def save(self, *args, **kwargs):
        if self.file:
            # Set file size if not set
            if not self.file_size:
                self.file_size = self.file.size
            
            # Set original filename if not set
            if not self.original_filename:
                self.original_filename = os.path.basename(self.file.name)
            
            # Determine file type and process accordingly
            self.determine_file_type()
            
        super().save(*args, **kwargs)
        
        # Generate thumbnail after saving
        if self.file and not self.thumbnail:
            self.generate_thumbnail()

    def determine_file_type(self):
        """Determine file type based on file extension and MIME type"""
        if not self.file:
            return
        
        ext = self.original_filename.split('.')[-1].lower()
        
        # Image files
        if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff']:
            self.file_type = 'image'
            if ext in ['jpg', 'jpeg', 'png']:
                self.extract_image_metadata()
        
        # Video files
        elif ext in ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm']:
            self.file_type = 'video'
        
        # Audio files
        elif ext in ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']:
            self.file_type = 'audio'
        
        # Document files
        elif ext in ['pdf', 'doc', 'docx', 'txt', 'rtf']:
            self.file_type = 'document'
        
        else:
            self.file_type = 'other'

    def extract_image_metadata(self):
        """Extract metadata from image files"""
        try:
            with Image.open(self.file.path) as img:
                self.width, self.height = img.size
                
                # Extract EXIF data
                if hasattr(img, '_getexif'):
                    exif = img._getexif()
                    if exif:
                        self.exif_data = dict(exif)
        except Exception as e:
            print(f"Error extracting image metadata: {e}")

    def generate_thumbnail(self):
        """Generate thumbnail for images and videos"""
        if self.file_type == 'image':
            self.generate_image_thumbnail()
        elif self.file_type == 'video':
            self.generate_video_thumbnail()

    def generate_image_thumbnail(self):
        """Generate thumbnail for image files"""
        try:
            with Image.open(self.file.path) as img:
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Create thumbnail
                img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                
                # Save thumbnail
                thumb_name = f"thumb_{self.id}.jpg"
                thumb_path = f"thumbnails/{thumb_name}"
                
                from django.core.files.base import ContentFile
                from io import BytesIO
                
                thumb_io = BytesIO()
                img.save(thumb_io, format='JPEG', quality=85)
                thumb_io.seek(0)
                
                self.thumbnail.save(
                    thumb_name,
                    ContentFile(thumb_io.read()),
                    save=False
                )
                
        except Exception as e:
            print(f"Error generating thumbnail: {e}")

    def generate_video_thumbnail(self):
        """Generate thumbnail for video files (placeholder for now)"""
        # TODO: Implement video thumbnail generation using ffmpeg
        pass

    @property
    def file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)

    @property
    def uploader_display_name(self):
        """Get display name for uploader"""
        if self.uploader_user:
            return self.uploader_user.full_name
        return self.uploader_name or 'Anonymous'

    def clean(self):
        """Validate upload constraints"""
        if self.album:
            # Check if album accepts uploads
            can_upload, message = self.album.can_upload()
            if not can_upload:
                raise ValidationError(message)
            
            # Check file size limit
            max_size = self.album.max_file_size_mb * 1024 * 1024  # Convert to bytes
            if self.file and self.file.size > max_size:
                raise ValidationError(f"File size exceeds limit of {self.album.max_file_size_mb}MB")
            
            # Check file type
            if self.original_filename:
                ext = self.original_filename.split('.')[-1].lower()
                if ext not in self.album.allowed_file_types:
                    raise ValidationError(f"File type '{ext}' is not allowed for this album")


class UploadComment(models.Model):
    """
    Comments on uploads
    """
    upload = models.ForeignKey(
        Upload, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name=_('upload')
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='upload_comments',
        verbose_name=_('author')
    )
    content = models.TextField(_('content'))
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name=_('parent comment')
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
    """
    Likes on uploads
    """
    upload = models.ForeignKey(
        Upload, 
        on_delete=models.CASCADE, 
        related_name='likes',
        verbose_name=_('upload')
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='upload_likes',
        verbose_name=_('user')
    )
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'upload_likes'
        unique_together = ['upload', 'user']
        verbose_name = _('Upload Like')
        verbose_name_plural = _('Upload Likes')

    def __str__(self):
        return f"{self.user.full_name} likes {self.upload.original_filename}"


class UploadReport(models.Model):
    """
    Reports for inappropriate content
    """
    REASON_CHOICES = [
        ('inappropriate', _('Inappropriate Content')),
        ('spam', _('Spam')),
        ('copyright', _('Copyright Violation')),
        ('harassment', _('Harassment')),
        ('other', _('Other')),
    ]

    upload = models.ForeignKey(
        Upload, 
        on_delete=models.CASCADE, 
        related_name='reports',
        verbose_name=_('upload')
    )
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='upload_reports',
        verbose_name=_('reporter')
    )
    reason = models.CharField(_('reason'), max_length=20, choices=REASON_CHOICES)
    description = models.TextField(_('description'), blank=True)
    
    is_resolved = models.BooleanField(_('is resolved'), default=False)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reports',
        verbose_name=_('resolved by')
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