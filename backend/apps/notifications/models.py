import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from apps.albums.models import Album
from apps.uploads.models import Upload

User = get_user_model()


class NotificationTemplate(models.Model):
    """
    Email notification templates
    """
    TEMPLATE_TYPES = [
        ('new_upload', _('New Upload')),
        ('album_created', _('Album Created')),
        ('album_shared', _('Album Shared')),
        ('upload_approved', _('Upload Approved')),
        ('upload_rejected', _('Upload Rejected')),
        ('welcome', _('Welcome')),
        ('password_reset', _('Password Reset')),
    ]

    name = models.CharField(_('name'), max_length=100, unique=True)
    template_type = models.CharField(_('template type'), max_length=50, choices=TEMPLATE_TYPES)
    subject = models.CharField(_('subject'), max_length=200)
    html_content = models.TextField(_('HTML content'))
    text_content = models.TextField(_('text content'), blank=True)
    
    # Template variables (JSON format)
    available_variables = models.JSONField(
        _('available variables'), 
        default=list, 
        help_text="List of variables available in this template"
    )
    
    is_active = models.BooleanField(_('is active'), default=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'notification_templates'
        verbose_name = _('Notification Template')
        verbose_name_plural = _('Notification Templates')

    def __str__(self):
        return f"{self.name} ({self.template_type})"


class Notification(models.Model):
    """
    User notifications (in-app notifications)
    """
    NOTIFICATION_TYPES = [
        ('upload', _('New Upload')),
        ('comment', _('New Comment')),
        ('like', _('New Like')),
        ('album_shared', _('Album Shared')),
        ('system', _('System Notification')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('recipient')
    )
    
    notification_type = models.CharField(_('type'), max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(_('title'), max_length=200)
    message = models.TextField(_('message'))
    
    # Related objects
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_('album')
    )
    upload = models.ForeignKey(
        Upload,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_('upload')
    )
    
    # Notification data (JSON format for flexibility)
    data = models.JSONField(_('data'), default=dict, blank=True)
    
    # Status
    is_read = models.BooleanField(_('is read'), default=False)
    read_at = models.DateTimeField(_('read at'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.full_name}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class EmailNotification(models.Model):
    """
    Email notifications sent to users
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('sent', _('Sent')),
        ('failed', _('Failed')),
        ('delivered', _('Delivered')),
        ('bounced', _('Bounced')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Recipient information
    recipient_email = models.EmailField(_('recipient email'))
    recipient_name = models.CharField(_('recipient name'), max_length=200, blank=True)
    recipient_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_notifications',
        verbose_name=_('recipient user')
    )
    
    # Email content
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_notifications',
        verbose_name=_('template')
    )
    subject = models.CharField(_('subject'), max_length=200)
    html_content = models.TextField(_('HTML content'))
    text_content = models.TextField(_('text content'), blank=True)
    
    # Related objects
    album = models.ForeignKey(
        Album,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='email_notifications',
        verbose_name=_('album')
    )
    upload = models.ForeignKey(
        Upload,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='email_notifications',
        verbose_name=_('upload')
    )
    
    # Template context data
    context_data = models.JSONField(_('context data'), default=dict, blank=True)
    
    # Sending status
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(_('error message'), blank=True)
    
    # Delivery tracking
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)
    opened_at = models.DateTimeField(_('opened at'), null=True, blank=True)
    clicked_at = models.DateTimeField(_('clicked at'), null=True, blank=True)
    
    # Retry logic
    retry_count = models.PositiveIntegerField(_('retry count'), default=0)
    max_retries = models.PositiveIntegerField(_('max retries'), default=3)
    next_retry_at = models.DateTimeField(_('next retry at'), null=True, blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'email_notifications'
        verbose_name = _('Email Notification')
        verbose_name_plural = _('Email Notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} to {self.recipient_email}"

    def can_retry(self):
        """Check if email can be retried"""
        return self.status == 'failed' and self.retry_count < self.max_retries

    def mark_as_sent(self):
        """Mark email as sent"""
        from django.utils import timezone
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])

    def mark_as_failed(self, error_message=""):
        """Mark email as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.retry_count += 1
        
        if self.can_retry():
            from django.utils import timezone
            from datetime import timedelta
            # Exponential backoff: wait 2^retry_count minutes
            wait_minutes = 2 ** self.retry_count
            self.next_retry_at = timezone.now() + timedelta(minutes=wait_minutes)
        
        self.save(update_fields=['status', 'error_message', 'retry_count', 'next_retry_at'])


class NotificationPreference(models.Model):
    """
    User notification preferences
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        verbose_name=_('user')
    )
    
    # Email notifications
    email_new_upload = models.BooleanField(_('email on new upload'), default=True)
    email_new_comment = models.BooleanField(_('email on new comment'), default=True)
    email_album_shared = models.BooleanField(_('email on album shared'), default=True)
    email_marketing = models.BooleanField(_('marketing emails'), default=False)
    
    # In-app notifications
    app_new_upload = models.BooleanField(_('app notification on new upload'), default=True)
    app_new_comment = models.BooleanField(_('app notification on new comment'), default=True)
    app_album_shared = models.BooleanField(_('app notification on album shared'), default=True)
    
    # Frequency settings
    digest_frequency = models.CharField(
        _('digest frequency'),
        max_length=20,
        choices=[
            ('immediate', _('Immediate')),
            ('daily', _('Daily')),
            ('weekly', _('Weekly')),
            ('never', _('Never')),
        ],
        default='immediate'
    )
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        db_table = 'notification_preferences'
        verbose_name = _('Notification Preference')
        verbose_name_plural = _('Notification Preferences')

    def __str__(self):
        return f"Preferences for {self.user.full_name}"


class NotificationDigest(models.Model):
    """
    Digest notifications for users who prefer batched notifications
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notification_digests',
        verbose_name=_('user')
    )
    
    digest_type = models.CharField(
        _('digest type'),
        max_length=20,
        choices=[
            ('daily', _('Daily')),
            ('weekly', _('Weekly')),
        ]
    )
    
    # Content
    subject = models.CharField(_('subject'), max_length=200)
    html_content = models.TextField(_('HTML content'))
    text_content = models.TextField(_('text content'), blank=True)
    
    # Stats
    notification_count = models.PositiveIntegerField(_('notification count'), default=0)
    
    # Status
    is_sent = models.BooleanField(_('is sent'), default=False)
    sent_at = models.DateTimeField(_('sent at'), null=True, blank=True)
    
    # Date range
    start_date = models.DateTimeField(_('start date'))
    end_date = models.DateTimeField(_('end date'))
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        db_table = 'notification_digests'
        verbose_name = _('Notification Digest')
        verbose_name_plural = _('Notification Digests')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.digest_type.title()} digest for {self.user.full_name}" 