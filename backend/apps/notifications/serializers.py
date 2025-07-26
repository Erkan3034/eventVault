from rest_framework import serializers
from .models import NotificationTemplate, Notification, EmailNotification, NotificationPreference, NotificationDigest


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for NotificationTemplate model"""
    
    class Meta:
        model = NotificationTemplate
        fields = (
            'id', 'name', 'subject_template', 'html_template', 'text_template',
            'notification_type', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = (
            'id', 'recipient', 'recipient_name', 'notification_type', 'title',
            'message', 'is_read', 'album', 'upload', 'created_at'
        )
        read_only_fields = ('id', 'recipient', 'recipient_name', 'created_at')


class EmailNotificationSerializer(serializers.ModelSerializer):
    """Serializer for EmailNotification model"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = EmailNotification
        fields = (
            'id', 'template', 'template_name', 'recipient_email', 'subject',
            'context', 'status', 'error_message', 'sent_at', 'created_at'
        )
        read_only_fields = ('id', 'template_name', 'sent_at', 'created_at')


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for NotificationPreference model"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = NotificationPreference
        fields = (
            'id', 'user', 'user_name', 'email_notifications', 'push_notifications',
            'sms_notifications', 'notification_types', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'user_name', 'created_at', 'updated_at')


class NotificationDigestSerializer(serializers.ModelSerializer):
    """Serializer for NotificationDigest model"""
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)
    
    class Meta:
        model = NotificationDigest
        fields = (
            'id', 'recipient', 'recipient_name', 'digest_type', 'notifications',
            'is_sent', 'sent_at', 'created_at'
        )
        read_only_fields = ('id', 'recipient', 'recipient_name', 'sent_at', 'created_at')


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer for notification statistics"""
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    recent_notifications = NotificationSerializer(many=True)


class EmailNotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating email notifications"""
    
    class Meta:
        model = EmailNotification
        fields = ('template', 'recipient_email', 'context')
    
    def create(self, validated_data):
        template = validated_data['template']
        context = validated_data.get('context', {})
        
        # Render email content
        from django.template.loader import render_to_string
        subject = render_to_string(f'emails/{template.name}_subject.txt', context).strip()
        
        return EmailNotification.objects.create(
            template=template,
            recipient_email=validated_data['recipient_email'],
            subject=subject,
            context=context,
            status='pending'
        )


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = ('recipient', 'notification_type', 'title', 'message', 'album', 'upload')
    
    def create(self, validated_data):
        notification = Notification.objects.create(**validated_data)
        
        # Send email notification if user has email notifications enabled
        user = validated_data['recipient']
        try:
            preference = user.notification_preferences
            if preference.email_notifications:
                # Create email notification
                EmailNotificationCreateSerializer(data={
                    'template': self.get_email_template(validated_data['notification_type']),
                    'recipient_email': user.email,
                    'context': {
                        'user': user,
                        'notification': notification,
                        'album': validated_data.get('album'),
                        'upload': validated_data.get('upload')
                    }
                }).save()
        except:
            pass  # Ignore if user has no preferences
        
        return notification
    
    def get_email_template(self, notification_type):
        """Get email template for notification type"""
        try:
            return NotificationTemplate.objects.get(
                notification_type=notification_type,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            return None 