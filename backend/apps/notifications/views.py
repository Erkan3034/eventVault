from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import NotificationTemplate, Notification, EmailNotification
from .serializers import (
    NotificationTemplateSerializer,
    NotificationSerializer,
    EmailNotificationSerializer
)


class NotificationTemplateView(generics.ListCreateAPIView):
    """List and create notification templates"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return NotificationTemplate.objects.all()


class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage specific notification template"""
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

    def get_queryset(self):
        return NotificationTemplate.objects.all()


class NotificationListView(generics.ListAPIView):
    """List user's notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """View and mark notification as read"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return super().update(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all user notifications as read"""
    user = request.user
    Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
    return Response({'message': 'Tüm bildirimler okundu olarak işaretlendi.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_email_notification(request):
    """Send email notification"""
    template_name = request.data.get('template_name')
    recipient_email = request.data.get('recipient_email')
    context = request.data.get('context', {})
    
    try:
        template = get_object_or_404(NotificationTemplate, name=template_name)
        
        # Render email content
        subject = render_to_string(f'emails/{template_name}_subject.txt', context).strip()
        html_message = render_to_string(f'emails/{template_name}.html', context)
        plain_message = render_to_string(f'emails/{template_name}.txt', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        # Create email notification record
        EmailNotification.objects.create(
            template=template,
            recipient_email=recipient_email,
            subject=subject,
            context=context,
            status='sent'
        )
        
        return Response({'message': 'E-posta başarıyla gönderildi.'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Create failed notification record
        if 'template' in locals():
            EmailNotification.objects.create(
                template=template,
                recipient_email=recipient_email,
                subject='',
                context=context,
                status='failed',
                error_message=str(e)
            )
        
        return Response(
            {'error': 'E-posta gönderilemedi.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_stats(request):
    """Get user notification statistics"""
    user = request.user
    
    total_notifications = Notification.objects.filter(recipient=user).count()
    unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()
    recent_notifications = Notification.objects.filter(recipient=user).order_by('-created_at')[:5]
    
    stats = {
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'recent_notifications': NotificationSerializer(recent_notifications, many=True).data
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_in_app_notification(request):
    """Create in-app notification"""
    recipient_id = request.data.get('recipient_id')
    notification_type = request.data.get('notification_type')
    title = request.data.get('title')
    message = request.data.get('message')
    
    try:
        from apps.authentication.models import User
        recipient = get_object_or_404(User, id=recipient_id)
        
        notification = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message
        )
        
        return Response(
            NotificationSerializer(notification).data, 
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': 'Bildirim oluşturulamadı.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


class EmailNotificationListView(generics.ListAPIView):
    """List email notifications (admin only)"""
    serializer_class = EmailNotificationSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return EmailNotification.objects.all().order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def retry_failed_email(request, email_id):
    """Retry sending failed email"""
    email_notification = get_object_or_404(EmailNotification, id=email_id, status='failed')
    
    try:
        # Re-send email
        send_mail(
            subject=email_notification.subject,
            message=email_notification.plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email_notification.recipient_email],
            html_message=email_notification.html_message,
            fail_silently=False,
        )
        
        email_notification.status = 'sent'
        email_notification.error_message = ''
        email_notification.save()
        
        return Response({'message': 'E-posta başarıyla yeniden gönderildi.'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        email_notification.error_message = str(e)
        email_notification.save()
        
        return Response(
            {'error': 'E-posta gönderilemedi.'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 