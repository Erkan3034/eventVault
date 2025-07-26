from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notification templates (admin only)
    path('templates/', views.NotificationTemplateView.as_view(), name='template_list'),
    path('templates/<int:id>/', views.NotificationTemplateDetailView.as_view(), name='template_detail'),
    
    # User notifications
    path('', views.NotificationListView.as_view(), name='notification_list'),
    path('<int:id>/', views.NotificationDetailView.as_view(), name='notification_detail'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark_all_read'),
    path('stats/', views.notification_stats, name='notification_stats'),
    
    # Email notifications
    path('send-email/', views.send_email_notification, name='send_email'),
    path('create/', views.create_in_app_notification, name='create_notification'),
    
    # Email notification management (admin only)
    path('emails/', views.EmailNotificationListView.as_view(), name='email_list'),
    path('emails/<int:email_id>/retry/', views.retry_failed_email, name='retry_email'),
] 