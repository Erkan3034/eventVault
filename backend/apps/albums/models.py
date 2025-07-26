import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
User = get_user_model()


class EventType(models.Model):
    """
    Types of events (Wedding, Birthday, Graduation, etc.)
    """
    name = models.CharField(_('name'), max_length=100, unique=True)
    name_tr = models.CharField(_('turkish name'), max_length=100)
    slug = models.SlugField(_('slug'), unique=True, blank=True)
    description = models.TextField(_('description'), blank=True)
    icon = models.CharField(_('icon'), max_length=50, blank=True)  # FontAwesome icon name
    color = models.CharField(_('color'), max_length=7, default='#3B82F6')  # Hex color
    is_active = models.BooleanField(_('is active'), default=True)
    sort_order = models.PositiveIntegerField(_('sort order'), default=0)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'event_types'
        verbose_name = _('Event Type')
        verbose_name_plural = _('Event Types')
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name_tr or self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Album(models.Model):
    """
    Main album model for events
    """
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('active', _('Active')),
        ('completed', _('Completed')),
        ('archived', _('Archived')),
    ]

    PRIVACY_CHOICES = [
        ('public', _('Public')),
        ('private', _('Private')),
        ('password_protected', _('Password Protected')),
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True, blank=True)
    description = models.TextField(_('description'), blank=True)
    
    # Event Details
    event_type = models.ForeignKey(
        EventType, 
        on_delete=models.CASCADE, 
        related_name='albums',
        verbose_name=_('event type')
    )
    event_date = models.DateField(_('event date'))
    event_location = models.CharField(_('event location'), max_length=200, blank=True)
    
    # Owner and Settings
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='owned_albums',
        verbose_name=_('owner')
    )
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='draft')
    privacy = models.CharField(_('privacy'), max_length=20, choices=PRIVACY_CHOICES, default='public')
    password = models.CharField(_('password'), max_length=128, blank=True)
    
    # Upload Settings
    max_files_per_user = models.PositiveIntegerField(_('max files per user'), default=10)
    allowed_file_types = models.JSONField(_('allowed file types'), default=list)
    max_file_size_mb = models.PositiveIntegerField(_('max file size (MB)'), default=50)
    
    # Moderation Settings
    require_approval = models.BooleanField(_('require approval'), default=False)
    enable_comments = models.BooleanField(_('enable comments'), default=True)
    
    # QR Code and Access
    qr_code = models.ImageField(_('QR code'), upload_to='qr_codes/', blank=True, null=True)
    access_code = models.CharField(_('access code'), max_length=20, unique=True, blank=True)
    
    # Stats
    view_count = models.PositiveIntegerField(_('view count'), default=0)
    download_count = models.PositiveIntegerField(_('download count'), default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    expires_at = models.DateTimeField(_('expires at'), null=True, blank=True)

    class Meta:
        db_table = 'albums'
        verbose_name = _('Album')
        verbose_name_plural = _('Albums')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.event_type}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        if not self.access_code:
            self.access_code = self.generate_access_code()
        
        # Set default allowed file types if empty
        if not self.allowed_file_types:
            self.allowed_file_types = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'mp3', 'wav']
        
        super().save(*args, **kwargs)
        
        # Generate QR code after saving
        if not self.qr_code:
            self.generate_qr_code()

    def generate_access_code(self):
        """Generate unique 8-character access code"""
        import random
        import string
        
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Album.objects.filter(access_code=code).exists():
                return code

    def generate_qr_code(self):
        """Generate QR code for album access"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # QR code will contain the upload URL
        upload_url = f"https://eventvault.com/upload/{self.access_code}"
        qr.add_data(upload_url)
        qr.make(fit=True)

        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR code image
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        buffer.seek(0)
        
        filename = f"qr_code_{self.access_code}.png"
        self.qr_code.save(filename, File(buffer), save=False)
        buffer.close()
        
        # Save without triggering save() again
        Album.objects.filter(pk=self.pk).update(qr_code=self.qr_code)

    @property
    def upload_url(self):
        """Get the upload URL for this album"""
        return f"/upload/{self.access_code}/"

    @property
    def total_uploads(self):
        """Get total number of uploads in this album"""
        return self.uploads.count()

    @property
    def total_size_mb(self):
        """Get total size of all uploads in MB"""
        total_bytes = sum(upload.file.size for upload in self.uploads.all() if upload.file)
        return round(total_bytes / (1024 * 1024), 2)

    def can_upload(self, user=None):
        """Check if upload is allowed"""
        from django.utils import timezone
        
        if self.status != 'active':
            return False, "Album is not active"
        
        if self.expires_at and timezone.now() > self.expires_at:
            return False, "Album has expired"
        
        return True, "Upload allowed"


class AlbumCollaborator(models.Model):
    """
    Users who can manage the album (besides the owner)
    """
    ROLE_CHOICES = [
        ('viewer', _('Viewer')),
        ('moderator', _('Moderator')),
        ('admin', _('Admin')),
    ]

    album = models.ForeignKey(
        Album, 
        on_delete=models.CASCADE, 
        related_name='collaborators'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='collaborated_albums'
    )
    role = models.CharField(_('role'), max_length=20, choices=ROLE_CHOICES, default='viewer')
    invited_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='album_invitations_sent'
    )
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'album_collaborators'
        unique_together = ['album', 'user']
        verbose_name = _('Album Collaborator')
        verbose_name_plural = _('Album Collaborators')

    def __str__(self):
        return f"{self.user.full_name} - {self.album.title} ({self.role})"


class AlbumSettings(models.Model):
    """
    Additional settings for albums
    """
    album = models.OneToOneField(
        Album, 
        on_delete=models.CASCADE, 
        related_name='advanced_settings'
    )
    
    # Email Notifications
    notify_on_upload = models.BooleanField(_('notify on upload'), default=True)
    notification_email = models.EmailField(_('notification email'), blank=True)
    
    # UI Customization
    theme_color = models.CharField(_('theme color'), max_length=7, default='#3B82F6')
    cover_image = models.ImageField(_('cover image'), upload_to='album_covers/', blank=True, null=True)
    welcome_message = models.TextField(_('welcome message'), blank=True)
    thank_you_message = models.TextField(_('thank you message'), blank=True)
    
    # Advanced Features
    enable_geolocation = models.BooleanField(_('enable geolocation'), default=False)
    enable_face_detection = models.BooleanField(_('enable face detection'), default=False)
    auto_organize_by_date = models.BooleanField(_('auto organize by date'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'album_settings'
        verbose_name = _('Album Settings')
        verbose_name_plural = _('Album Settings')

    def __str__(self):
        return f"Settings for {self.album.title}" 