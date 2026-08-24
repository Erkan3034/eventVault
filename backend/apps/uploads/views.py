from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.db.models import Count, F, Sum, Value
from django.db.models.functions import Greatest
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.albums.models import Album
from .models import Upload, UploadComment, UploadLike
from .serializers import (
    UploadSerializer, UploadListSerializer, UploadDetailSerializer,
    UploadCreateSerializer, UploadCommentSerializer, UploadLikeSerializer,
    UploadReportSerializer, UploadModerationSerializer,
)


def album_for_owner(request, album_id):
    return get_object_or_404(Album, id=album_id, owner=request.user)


def upload_for_owner(request, album_id, upload_id):
    return get_object_or_404(
        Upload,
        id=upload_id,
        album_id=album_id,
        album__owner=request.user,
    )


class UploadListView(generics.ListAPIView):
    serializer_class = UploadListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['original_filename', 'caption', 'message', 'uploader_name']
    ordering_fields = ['created_at', 'view_count', 'like_count']
    ordering = ['-created_at']

    def get_queryset(self):
        album = album_for_owner(self.request, self.kwargs.get('album_id'))
        queryset = Upload.objects.filter(album=album).annotate(
            comment_count=Count('comments'),
        )
        status_filter = self.request.query_params.get('status')
        if status_filter in {'pending', 'approved', 'rejected', 'processing'}:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        album_id = self.kwargs.get('album_id')
        context['liked_ids'] = set(
            UploadLike.objects.filter(
                upload__album_id=album_id,
                user=self.request.user,
            ).values_list('upload_id', flat=True)
        )
        return context


class UploadDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UploadDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        album_id = self.kwargs.get('album_id')
        return Upload.objects.filter(album_id=album_id, album__owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        upload = self.get_object()
        Upload.objects.filter(pk=upload.pk).update(view_count=F('view_count') + 1)
        upload.refresh_from_db(fields=['view_count'])
        return super().retrieve(request, *args, **kwargs)


class AnonymousUploadView(generics.CreateAPIView):
    serializer_class = UploadCreateSerializer
    permission_classes = [permissions.AllowAny]

    def get_album(self):
        if not hasattr(self, '_album'):
            self._album = get_object_or_404(
                Album,
                access_code=self.kwargs.get('access_code'),
                status='active',
            )
        return self._album

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['album'] = self.get_album()
        return context

    def create(self, request, *args, **kwargs):
        album = self.get_album()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        upload = serializer.save()

        try:
            from apps.notifications.models import Notification
            if upload.status == 'pending':
                title = 'Onay bekleyen yükleme'
                message = f'"{album.title}" albümüne onay bekleyen bir dosya yüklendi.'
            else:
                title = 'Yeni Dosya Yüklendi'
                message = f'"{album.title}" albümüne yeni bir dosya yüklendi.'
            Notification.objects.create(
                recipient=album.owner,
                notification_type='upload',
                title=title,
                message=message,
                album=album,
                upload=upload,
            )
        except Exception:
            pass

        return Response({
            'message': 'Dosya başarıyla yüklendi!' if upload.status != 'pending'
            else 'Dosya yüklendi. Albüm sahibi onayladıktan sonra galeride görünür.',
            'status': upload.status,
            'upload': UploadSerializer(upload, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)


class UploadCommentView(generics.ListCreateAPIView):
    serializer_class = UploadCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_upload(self):
        return upload_for_owner(
            self.request,
            self.kwargs.get('album_id'),
            self.kwargs.get('upload_id'),
        )

    def get_queryset(self):
        upload = self.get_upload()
        return UploadComment.objects.filter(upload=upload).select_related('author')

    def perform_create(self, serializer):
        upload = self.get_upload()
        if not upload.album.enable_comments:
            raise ValidationError({'detail': 'Bu albümde yorumlar kapalı.'})
        serializer.save(upload=upload, author=self.request.user)


class UploadLikeView(generics.CreateAPIView):
    serializer_class = UploadLikeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        upload = upload_for_owner(
            request,
            self.kwargs.get('album_id'),
            self.kwargs.get('upload_id'),
        )
        existing_like = UploadLike.objects.filter(upload=upload, user=request.user).first()
        if existing_like:
            existing_like.delete()
            Upload.objects.filter(pk=upload.pk).update(
                like_count=Greatest(F('like_count') - 1, Value(0))
            )
            upload.refresh_from_db(fields=['like_count'])
            return Response({
                'liked': False,
                'like_count': upload.like_count,
                'message': 'Beğeni kaldırıldı.',
            }, status=status.HTTP_200_OK)

        UploadLike.objects.create(upload=upload, user=request.user)
        Upload.objects.filter(pk=upload.pk).update(like_count=F('like_count') + 1)
        upload.refresh_from_db(fields=['like_count'])
        return Response({
            'liked': True,
            'like_count': upload.like_count,
            'message': 'Beğenildi!',
        }, status=status.HTTP_201_CREATED)


class UploadReportView(generics.CreateAPIView):
    serializer_class = UploadReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        upload = upload_for_owner(
            self.request,
            self.kwargs.get('album_id'),
            self.kwargs.get('upload_id'),
        )
        serializer.save(upload=upload, reporter=self.request.user)


class UploadModerationView(generics.UpdateAPIView):
    serializer_class = UploadModerationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Upload.objects.filter(album__owner=self.request.user)

    def update(self, request, *args, **kwargs):
        upload = self.get_object()
        next_status = request.data.get('status')
        if next_status not in {'approved', 'rejected', 'pending'}:
            return Response(
                {'error': 'Geçersiz durum. approved, rejected veya pending olmalı.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(upload, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        upload.refresh_from_db()
        return Response(UploadListSerializer(upload, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upload_download(request, album_id, upload_id):
    upload = upload_for_owner(request, album_id, upload_id)
    if not upload.file:
        return Response({'error': 'Dosya bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
    Upload.objects.filter(pk=upload.pk).update(download_count=F('download_count') + 1)
    Album.objects.filter(pk=upload.album_id).update(download_count=F('download_count') + 1)
    return FileResponse(
        upload.file.open('rb'),
        as_attachment=True,
        filename=upload.original_filename or 'download',
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upload_stats(request, album_id):
    album = album_for_owner(request, album_id)
    uploads = Upload.objects.filter(album=album)

    stats = {
        'total_uploads': uploads.count(),
        'pending_uploads': uploads.filter(status='pending').count(),
        'approved_uploads': uploads.filter(status='approved').count(),
        'rejected_uploads': uploads.filter(status='rejected').count(),
        'total_views': uploads.aggregate(total=Sum('view_count'))['total'] or 0,
        'total_likes': uploads.aggregate(total=Sum('like_count'))['total'] or 0,
        'file_type_breakdown': uploads.values('file_type').annotate(count=Count('id')),
    }

    return Response(stats, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_upload_moderation(request, album_id):
    album_for_owner(request, album_id)
    upload_ids = request.data.get('upload_ids', [])
    action = request.data.get('action')

    if action not in ['approve', 'reject', 'delete']:
        return Response({'error': 'Geçersiz işlem.'}, status=status.HTTP_400_BAD_REQUEST)

    uploads = Upload.objects.filter(id__in=upload_ids, album_id=album_id, album__owner=request.user)
    count = uploads.count()

    if action == 'approve':
        uploads.update(
            status='approved',
            moderated_by=request.user,
            moderated_at=timezone.now(),
        )
    elif action == 'reject':
        uploads.update(
            status='rejected',
            moderated_by=request.user,
            moderated_at=timezone.now(),
        )
    elif action == 'delete':
        uploads.delete()

    return Response({'message': f'{count} dosya işlendi.', 'count': count}, status=status.HTTP_200_OK)
