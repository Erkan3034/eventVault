from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone

from apps.albums.models import Album, EventType
from apps.uploads.models import Upload, UploadReport
from .serializers import (
    AdminUserSerializer, AdminAlbumSerializer, AdminUploadSerializer,
    AdminReportSerializer, AdminEventTypeSerializer,
)

User = get_user_model()


class StaffPermission(permissions.IsAdminUser):
    """Staff users (is_staff) can access the React admin API."""


@api_view(['GET'])
@permission_classes([StaffPermission])
def admin_stats(request):
    return Response({
        'users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'staff_users': User.objects.filter(is_staff=True).count(),
        'albums': Album.objects.count(),
        'active_albums': Album.objects.filter(status='active').count(),
        'uploads': Upload.objects.count(),
        'pending_uploads': Upload.objects.filter(status='pending').count(),
        'rejected_uploads': Upload.objects.filter(status='rejected').count(),
        'open_reports': UploadReport.objects.filter(is_resolved=False).count(),
        'event_types': EventType.objects.filter(is_active=True).count(),
    })


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [StaffPermission]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-created_at']

    def get_queryset(self):
        return User.objects.annotate(album_count=Count('owned_albums'))


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [StaffPermission]
    lookup_field = 'id'

    def get_queryset(self):
        return User.objects.annotate(album_count=Count('owned_albums'))

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if user.pk == request.user.pk and request.data.get('is_staff') is False:
            return Response(
                {'error': 'Kendi yönetici yetkinizi kaldıramazsınız.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'error': 'Kendinizi silemezsiniz.'}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser and not request.user.is_superuser:
            return Response({'error': 'Süper yöneticiyi silemezsiniz.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class AdminAlbumListView(generics.ListAPIView):
    serializer_class = AdminAlbumSerializer
    permission_classes = [StaffPermission]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'access_code', 'owner__email', 'owner__first_name']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Album.objects.select_related('owner', 'event_type').annotate(
            upload_count=Count('uploads'),
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class AdminAlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminAlbumSerializer
    permission_classes = [StaffPermission]
    lookup_field = 'id'

    def get_queryset(self):
        return Album.objects.select_related('owner', 'event_type').annotate(
            upload_count=Count('uploads'),
        )


class AdminUploadListView(generics.ListAPIView):
    serializer_class = AdminUploadSerializer
    permission_classes = [StaffPermission]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['original_filename', 'uploader_name', 'message', 'album__title']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Upload.objects.select_related('album')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset


class AdminUploadDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUploadSerializer
    permission_classes = [StaffPermission]
    lookup_field = 'id'
    queryset = Upload.objects.select_related('album')

    def update(self, request, *args, **kwargs):
        upload = self.get_object()
        next_status = request.data.get('status')
        if next_status not in {'approved', 'rejected', 'pending'}:
            return Response({'error': 'Geçersiz durum.'}, status=status.HTTP_400_BAD_REQUEST)
        upload.status = next_status
        upload.moderated_by = request.user
        upload.moderated_at = timezone.now()
        upload.save(update_fields=['status', 'moderated_by', 'moderated_at'])
        return Response(self.get_serializer(upload).data)


class AdminReportListView(generics.ListAPIView):
    serializer_class = AdminReportSerializer
    permission_classes = [StaffPermission]
    pagination_class = None
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = UploadReport.objects.select_related('reporter', 'upload', 'upload__album')
        resolved = self.request.query_params.get('resolved')
        if resolved == 'true':
            queryset = queryset.filter(is_resolved=True)
        elif resolved == 'false':
            queryset = queryset.filter(is_resolved=False)
        return queryset


class AdminReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminReportSerializer
    permission_classes = [StaffPermission]
    queryset = UploadReport.objects.select_related('reporter', 'upload', 'upload__album')

    def update(self, request, *args, **kwargs):
        report = self.get_object()
        if request.data.get('is_resolved') is True:
            report.is_resolved = True
            report.resolved_by = request.user
            report.resolved_at = timezone.now()
            report.save(update_fields=['is_resolved', 'resolved_by', 'resolved_at'])
        action = request.data.get('action')
        if action == 'reject_upload' and report.upload_id:
            report.upload.status = 'rejected'
            report.upload.moderated_by = request.user
            report.upload.moderated_at = timezone.now()
            report.upload.save(update_fields=['status', 'moderated_by', 'moderated_at'])
            report.is_resolved = True
            report.resolved_by = request.user
            report.resolved_at = timezone.now()
            report.save(update_fields=['is_resolved', 'resolved_by', 'resolved_at'])
        elif action == 'delete_upload' and report.upload_id:
            report.upload.delete()
            return Response({'message': 'Yükleme silindi, rapor kapatıldı.'})
        report.refresh_from_db()
        return Response(self.get_serializer(report).data)


class AdminEventTypeListCreateView(generics.ListCreateAPIView):
    serializer_class = AdminEventTypeSerializer
    permission_classes = [StaffPermission]
    pagination_class = None
    queryset = EventType.objects.annotate(album_count=Count('albums')).order_by('sort_order', 'name')


class AdminEventTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminEventTypeSerializer
    permission_classes = [StaffPermission]
    queryset = EventType.objects.annotate(album_count=Count('albums'))

    def destroy(self, request, *args, **kwargs):
        event_type = self.get_object()
        if event_type.albums.exists():
            event_type.is_active = False
            event_type.save(update_fields=['is_active'])
            return Response({'message': 'Türe bağlı albümler var; tür pasif yapıldı.'})
        return super().destroy(request, *args, **kwargs)
