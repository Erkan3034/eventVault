from django.urls import path, include
from . import views

app_name = 'albums'

urlpatterns = [
    # Event types
    path('event-types/', views.EventTypeListView.as_view(), name='event_types'),
    
    # Albums
    path('', views.AlbumListCreateView.as_view(), name='album_list_create'),
    path('<uuid:id>/', views.AlbumDetailView.as_view(), name='album_detail'),
    path('<uuid:id>/qr/', views.AlbumQRCodeView.as_view(), name='album_qr'),
    path('<uuid:id>/stats/', views.AlbumStatsView.as_view(), name='album_stats'),
    path('<uuid:id>/activate/', views.album_activate, name='album_activate'),
    path('<uuid:id>/deactivate/', views.album_deactivate, name='album_deactivate'),
    
    # Public album view
    path('public/<str:access_code>/', views.AlbumPublicView.as_view(), name='album_public'),
    
    # Collaborators
    path('<uuid:album_id>/collaborators/', views.AlbumCollaboratorView.as_view(), name='album_collaborators'),
    path('<uuid:album_id>/collaborators/<int:pk>/', views.AlbumCollaboratorDetailView.as_view(), name='album_collaborator_detail'),
    
    # User stats
    path('user/stats/', views.user_albums_stats, name='user_albums_stats'),
] 