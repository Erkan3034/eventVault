from django.urls import path
from . import views

app_name = 'administration'

urlpatterns = [
    path('stats/', views.admin_stats, name='stats'),
    path('users/', views.AdminUserListView.as_view(), name='users'),
    path('users/<int:id>/', views.AdminUserDetailView.as_view(), name='user_detail'),
    path('albums/', views.AdminAlbumListView.as_view(), name='albums'),
    path('albums/<uuid:id>/', views.AdminAlbumDetailView.as_view(), name='album_detail'),
    path('uploads/', views.AdminUploadListView.as_view(), name='uploads'),
    path('uploads/<uuid:id>/', views.AdminUploadDetailView.as_view(), name='upload_detail'),
    path('reports/', views.AdminReportListView.as_view(), name='reports'),
    path('reports/<int:pk>/', views.AdminReportDetailView.as_view(), name='report_detail'),
    path('event-types/', views.AdminEventTypeListCreateView.as_view(), name='event_types'),
    path('event-types/<int:pk>/', views.AdminEventTypeDetailView.as_view(), name='event_type_detail'),
]
