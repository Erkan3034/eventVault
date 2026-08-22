from rest_framework import serializers
from .models import NotificationTemplate, Notification, EmailNotification, NotificationPreference, NotificationDigest


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = (
            'id', 'name', 'template_type', 'subject', 'html_content', 'text_content',
            'available_variables', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.full_name', read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id', 'recipient', 'recipient_name', 'notification_type', 'title',
            'message', 'is_read', 'album', 'upload', 'created_at'
        )
        read_only_fields = ('id', 'recipient', 'recipient_name', 'created_at')


class EmailNotificationSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = EmailNotification
        fields = (
            'id', 'template', 'template_name', 'recipient_email', 'subject',
            'context_data', 'status', 'error_message', 'sent_at', 'created_at'
        )
        read_only_fields = ('id', 'template_name', 'sent_at', 'created_at')


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = NotificationPreference
        fields = (
            'id', 'user', 'user_name',
            'email_new_upload', 'email_new_comment', 'email_album_shared', 'email_marketing',
            'app_new_upload', 'app_new_comment', 'app_album_shared',
            'digest_frequency', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'user_name', 'created_at', 'updated_at')


class NotificationDigestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = NotificationDigest
        fields = (
            'id', 'user', 'user_name', 'digest_type', 'subject',
            'notification_count', 'is_sent', 'sent_at', 'created_at'
        )
        read_only_fields = ('id', 'user', 'user_name', 'sent_at', 'created_at')


class NotificationStatsSerializer(serializers.Serializer):
    total_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    recent_notifications = NotificationSerializer(many=True)


class EmailNotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = ('template', 'recipient_email', 'context_data')

    def create(self, validated_data):
        template = validated_data.get('template')
        context = validated_data.get('context_data', {})
        subject = template.subject if template else 'Bildirim'
        return EmailNotification.objects.create(
            template=template,
            recipient_email=validated_data['recipient_email'],
            subject=subject,
            html_content=template.html_content if template else '',
            text_content=template.text_content if template else '',
            context_data=context,
            status='pending',
        )


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('recipient', 'notification_type', 'title', 'message', 'album', 'upload')
