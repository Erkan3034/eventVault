from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Album, EventType, AlbumCollaborator, AlbumSettings
from .export import (
    DRIVE_SCOPE,
    DriveExportError,
    build_album_zip,
    exportable_uploads,
    mark_album_downloaded,
    push_album_to_drive,
    zip_response,
)
from .serializers import (
    EventTypeSerializer, AlbumListSerializer, AlbumDetailSerializer,
    AlbumCreateSerializer, AlbumUpdateSerializer, AlbumQRCodeSerializer,
    AlbumStatsSerializer, AlbumCollaboratorSerializer
)


class EventTypeListView(generics.ListAPIView):
    queryset = EventType.objects.filter(is_active=True)
    serializer_class = EventTypeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class AlbumListCreateView(generics.ListCreateAPIView):
    serializer_class = AlbumListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'event_location']
    ordering_fields = ['created_at', 'event_date', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AlbumCreateSerializer
        return AlbumListSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        album = serializer.instance
        return Response(
            AlbumDetailSerializer(album, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class AlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlbumDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)

    def get_object(self):
        album = super().get_object()
        AlbumSettings.objects.get_or_create(album=album)
        return album

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AlbumUpdateSerializer
        return AlbumDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance.refresh_from_db()
        return Response(
            AlbumDetailSerializer(instance, context={'request': request}).data
        )


class AlbumQRCodeView(generics.RetrieveAPIView):
    serializer_class = AlbumQRCodeSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)


class AlbumStatsView(generics.RetrieveAPIView):
    serializer_class = AlbumStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)


class AlbumPublicView(generics.RetrieveAPIView):
    serializer_class = AlbumDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'access_code'
    lookup_url_kwarg = 'access_code'

    def get_queryset(self):
        return Album.objects.filter(
            access_code=self.kwargs.get('access_code'),
            status='active',
        )

    def get_object(self):
        album = super().get_object()
        AlbumSettings.objects.get_or_create(album=album)
        return album


class AlbumCollaboratorView(generics.ListCreateAPIView):
    serializer_class = AlbumCollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        album_id = self.kwargs.get('album_id')
        return AlbumCollaborator.objects.filter(album_id=album_id, album__owner=self.request.user)

    def perform_create(self, serializer):
        album_id = self.kwargs.get('album_id')
        album = get_object_or_404(Album, id=album_id, owner=self.request.user)
        serializer.save(album=album)


class AlbumCollaboratorDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlbumCollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        album_id = self.kwargs.get('album_id')
        return AlbumCollaborator.objects.filter(album_id=album_id, album__owner=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def album_activate(request, id):
    album = get_object_or_404(Album, id=id, owner=request.user)
    album.status = 'active'
    album.save(update_fields=['status'])
    return Response({'message': 'Albüm aktifleştirildi.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def album_deactivate(request, id):
    album = get_object_or_404(Album, id=id, owner=request.user)
    album.status = 'archived'
    album.save(update_fields=['status'])
    return Response({'message': 'Albüm arşivlendi.', 'status': album.status}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_albums_stats(request):
    user = request.user
    total_albums = Album.objects.filter(owner=user).count()
    active_albums = Album.objects.filter(owner=user, status='active').count()

    from apps.uploads.models import Upload
    from django.db.models import Sum
    uploads = Upload.objects.filter(album__owner=user)
    total_bytes = uploads.aggregate(total=Sum('file_size'))['total'] or 0

    stats = {
        'total_albums': total_albums,
        'active_albums': active_albums,
        'total_uploads': uploads.count(),
        'total_size_mb': round(total_bytes / (1024 * 1024), 2),
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def album_export_zip(request, id):
    album = get_object_or_404(Album, id=id, owner=request.user)
    if not exportable_uploads(album).exists():
        return Response({'error': 'Dışa aktarılacak dosya yok.'}, status=status.HTTP_400_BAD_REQUEST)
    tmp, count = build_album_zip(album)
    mark_album_downloaded(album, count)
    return zip_response(album, tmp)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def album_export_drive(request, id):
    album = get_object_or_404(Album, id=id, owner=request.user)
    if request.method == 'GET':
        client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '') or ''
        return Response({
            'enabled': bool(client_id),
            'client_id': client_id,
            'scope': DRIVE_SCOPE,
        })

    if not exportable_uploads(album).exists():
        return Response({'error': 'Dışa aktarılacak dosya yok.'}, status=status.HTTP_400_BAD_REQUEST)

    token = (request.data.get('access_token') or '').strip()
    if not token:
        return Response({'error': 'Google hesabı bağlanmadı.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = push_album_to_drive(album, token)
    except DriveExportError as exc:
        status_code = exc.status_code if exc.status_code >= 400 else status.HTTP_400_BAD_REQUEST
        return Response({'error': exc.message}, status=status_code)

    return Response(result, status=status.HTTP_200_OK) 