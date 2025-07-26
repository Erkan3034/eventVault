from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Album, EventType, AlbumCollaborator
from .serializers import (
    EventTypeSerializer, AlbumListSerializer, AlbumDetailSerializer,
    AlbumCreateSerializer, AlbumUpdateSerializer, AlbumQRCodeSerializer,
    AlbumStatsSerializer, AlbumCollaboratorSerializer
)


class EventTypeListView(generics.ListAPIView):
    queryset = EventType.objects.filter(is_active=True)
    serializer_class = EventTypeSerializer
    permission_classes = [permissions.AllowAny]


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


class AlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlbumDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AlbumUpdateSerializer
        return AlbumDetailSerializer


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
            is_active=True
        )


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
    album.is_active = True
    album.save()
    return Response({'message': 'Albüm aktifleştirildi.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def album_deactivate(request, id):
    album = get_object_or_404(Album, id=id, owner=request.user)
    album.is_active = False
    album.save()
    return Response({'message': 'Albüm deaktifleştirildi.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_albums_stats(request):
    user = request.user
    total_albums = Album.objects.filter(owner=user).count()
    active_albums = Album.objects.filter(owner=user, is_active=True).count()
    
    from apps.uploads.models import Upload
    total_uploads = Upload.objects.filter(album__owner=user).count()
    
    stats = {
        'total_albums': total_albums,
        'active_albums': active_albums,
        'total_uploads': total_uploads,
    }
    
    return Response(stats, status=status.HTTP_200_OK) 