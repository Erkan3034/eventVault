from django.urls import path
from . import views

app_name = 'uploads'

urlpatterns = [
    # Anonymous upload
    path('<str:access_code>/', views.AnonymousUploadView.as_view(), name='anonymous_upload'),
    
    # Album uploads
    path('album/<uuid:album_id>/', views.UploadListView.as_view(), name='album_uploads'),
    path('album/<uuid:album_id>/<uuid:id>/', views.UploadDetailView.as_view(), name='upload_detail'),
    path('album/<uuid:album_id>/stats/', views.upload_stats, name='upload_stats'),
    path('album/<uuid:album_id>/bulk-moderate/', views.bulk_upload_moderation, name='bulk_moderation'),
    
    # Upload interactions
    path('album/<uuid:album_id>/<uuid:upload_id>/comments/', views.UploadCommentView.as_view(), name='upload_comments'),
    path('album/<uuid:album_id>/<uuid:upload_id>/like/', views.UploadLikeView.as_view(), name='upload_like'),
    path('album/<uuid:album_id>/<uuid:upload_id>/report/', views.UploadReportView.as_view(), name='upload_report'),
    
    # Moderation
    path('moderate/<uuid:id>/', views.UploadModerationView.as_view(), name='upload_moderation'),
] 