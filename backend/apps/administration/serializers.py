from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.albums.models import Album, EventType
from apps.uploads.models import Upload, UploadReport

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    album_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'is_active', 'is_staff', 'is_superuser', 'is_verified',
            'album_count', 'created_at',
        )
        read_only_fields = ('id', 'email', 'username', 'full_name', 'album_count', 'created_at')

    def validate(self, attrs):
        request = self.context['request']
        if 'is_staff' in attrs or 'is_superuser' in attrs:
            if not request.user.is_superuser:
                raise serializers.ValidationError('Personel yetkisini yalnızca süper yönetici değiştirebilir.')
        return attrs


class AdminAlbumSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    event_type_name = serializers.SerializerMethodField()
    upload_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Album
        fields = (
            'id', 'title', 'status', 'privacy', 'require_approval', 'enable_comments',
            'owner_name', 'owner_email', 'event_type_name', 'event_date',
            'event_location', 'access_code', 'upload_count', 'view_count', 'created_at',
        )
        read_only_fields = (
            'id', 'title', 'owner_name', 'owner_email', 'event_type_name',
            'event_date', 'event_location', 'access_code', 'upload_count',
            'view_count', 'created_at',
        )

    def get_event_type_name(self, obj):
        if not obj.event_type:
            return ''
        return obj.event_type.name_tr or obj.event_type.name


class AdminUploadSerializer(serializers.ModelSerializer):
    album_title = serializers.CharField(source='album.title', read_only=True)
    album_id = serializers.UUIDField(source='album.id', read_only=True)
    uploader_display_name = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = (
            'id', 'original_filename', 'file_type', 'status', 'message',
            'uploader_display_name', 'album_id', 'album_title',
            'file_url', 'thumbnail_url', 'like_count', 'created_at',
        )
        read_only_fields = fields

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None

    def get_thumbnail_url(self, obj):
        return obj.thumbnail.url if obj.thumbnail else None


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    filename = serializers.CharField(source='upload.original_filename', read_only=True)
    album_title = serializers.CharField(source='upload.album.title', read_only=True)
    album_id = serializers.UUIDField(source='upload.album.id', read_only=True)
    upload_id = serializers.UUIDField(source='upload.id', read_only=True)
    upload_status = serializers.CharField(source='upload.status', read_only=True)

    class Meta:
        model = UploadReport
        fields = (
            'id', 'reason', 'description', 'is_resolved', 'created_at',
            'reporter_name', 'filename', 'album_title', 'album_id',
            'upload_id', 'upload_status', 'resolved_at',
        )
        read_only_fields = (
            'id', 'reason', 'description', 'created_at', 'reporter_name',
            'filename', 'album_title', 'album_id', 'upload_id', 'upload_status',
            'resolved_at',
        )

    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.full_name or obj.reporter.email
        return 'Anonim'


class AdminEventTypeSerializer(serializers.ModelSerializer):
    album_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = EventType
        fields = (
            'id', 'name', 'name_tr', 'slug', 'description', 'icon', 'color',
            'is_active', 'sort_order', 'album_count',
        )
        read_only_fields = ('id', 'slug', 'album_count')
