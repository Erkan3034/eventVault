from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import models

from apps.albums.models import Album
from .models import Upload, UploadComment, UploadLike, UploadReport
from .serializers import (
    UploadSerializer, UploadListSerializer, UploadDetailSerializer,
    UploadCreateSerializer, UploadCommentSerializer, UploadLikeSerializer,
    UploadReportSerializer, UploadModerationSerializer
)


class UploadListView(generics.ListAPIView):
    serializer_class = UploadListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['original_filename', 'caption', 'message', 'uploader_name']
    ordering_fields = ['created_at', 'view_count', 'like_count']
    ordering = ['-created_at']

    def get_queryset(self):
        album_id = self.kwargs.get('album_id')
        return Upload.objects.filter(album_id=album_id, album__owner=self.request.user)


class UploadDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UploadDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        album_id = self.kwargs.get('album_id')
        return Upload.objects.filter(album_id=album_id, album__owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        upload = self.get_object()
        upload.view_count += 1
        upload.save(update_fields=['view_count'])
        return super().retrieve(request, *args, **kwargs)


class AnonymousUploadView(generics.CreateAPIView):
    serializer_class = UploadCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        access_code = self.kwargs.get('access_code')
        album = get_object_or_404(Album, access_code=access_code, is_active=True)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            upload = serializer.save(album=album)
            
            # Send notification to album owner
            try:
                from apps.notifications.models import Notification
                Notification.objects.create(
                    recipient=album.owner,
                    notification_type='new_upload',
                    title='Yeni Dosya Yüklendi',
                    message=f'"{album.title}" albümüne yeni bir dosya yüklendi.',
                    album=album,
                    upload=upload
                )
            except:
                pass  # Ignore notification errors
            
            return Response({
                'message': 'Dosya başarıyla yüklendi!',
                'upload': UploadSerializer(upload).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UploadCommentView(generics.ListCreateAPIView):
    serializer_class = UploadCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        upload_id = self.kwargs.get('upload_id')
        return UploadComment.objects.filter(upload_id=upload_id)

    def perform_create(self, serializer):
        upload_id = self.kwargs.get('upload_id')
        upload = get_object_or_404(Upload, id=upload_id)
        serializer.save(upload=upload, user=self.request.user)


class UploadLikeView(generics.CreateAPIView):
    serializer_class = UploadLikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        upload_id = self.kwargs.get('upload_id')
        upload = get_object_or_404(Upload, id=upload_id)
        
        # Check if user already liked
        existing_like = UploadLike.objects.filter(upload=upload, user=request.user).first()
        if existing_like:
            existing_like.delete()
            upload.like_count = max(0, upload.like_count - 1)
            upload.save()
            return Response({'message': 'Beğeni kaldırıldı.'}, status=status.HTTP_200_OK)
        
        # Create new like
        UploadLike.objects.create(upload=upload, user=request.user)
        upload.like_count += 1
        upload.save()
        
        return Response({'message': 'Beğenildi!'}, status=status.HTTP_201_CREATED)


class UploadReportView(generics.CreateAPIView):
    serializer_class = UploadReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        upload_id = self.kwargs.get('upload_id')
        upload = get_object_or_404(Upload, id=upload_id)
        serializer.save(upload=upload, reporter=self.request.user)


class UploadModerationView(generics.UpdateAPIView):
    serializer_class = UploadModerationSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

    def get_queryset(self):
        return Upload.objects.all()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upload_stats(request, album_id):
    album = get_object_or_404(Album, id=album_id, owner=request.user)
    uploads = Upload.objects.filter(album=album)
    
    stats = {
        'total_uploads': uploads.count(),
        'total_views': uploads.aggregate(total=models.Sum('view_count'))['total'] or 0,
        'total_likes': uploads.aggregate(total=models.Sum('like_count'))['total'] or 0,
        'file_type_breakdown': uploads.values('file_type').annotate(count=models.Count('id')),
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def bulk_upload_moderation(request, album_id):
    upload_ids = request.data.get('upload_ids', [])
    action = request.data.get('action')  # 'approve', 'reject', 'delete'
    
    if action not in ['approve', 'reject', 'delete']:
        return Response({'error': 'Geçersiz işlem.'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploads = Upload.objects.filter(id__in=upload_ids, album_id=album_id)
    
    if action == 'approve':
        uploads.update(status='approved')
    elif action == 'reject':
        uploads.update(status='rejected')
    elif action == 'delete':
        uploads.delete()
    
    return Response({'message': f'{uploads.count()} dosya {action} edildi.'}, status=status.HTTP_200_OK) 