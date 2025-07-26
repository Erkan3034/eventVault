from rest_framework import serializers
from .models import Album, EventType, AlbumCollaborator, AlbumSettings


class EventTypeSerializer(serializers.ModelSerializer):
    """Serializer for EventType model"""
    
    class Meta:
        model = EventType
        fields = '__all__'


class AlbumSettingsSerializer(serializers.ModelSerializer):
    """Serializer for AlbumSettings model"""
    
    class Meta:
        model = AlbumSettings
        fields = '__all__'


class AlbumCollaboratorSerializer(serializers.ModelSerializer):
    """Serializer for AlbumCollaborator model"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = AlbumCollaborator
        fields = ('id', 'user', 'user_name', 'user_email', 'role', 'invited_by', 'created_at')
        read_only_fields = ('invited_by', 'created_at')


class AlbumListSerializer(serializers.ModelSerializer):
    """Serializer for album list view"""
    event_type = EventTypeSerializer(read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    total_uploads = serializers.ReadOnlyField()
    total_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = Album
        fields = (
            'id', 'title', 'slug', 'event_type', 'event_date', 'event_location',
            'owner', 'owner_name', 'status', 'privacy', 'total_uploads',
            'total_size_mb', 'view_count', 'created_at'
        )
        read_only_fields = ('id', 'slug', 'total_uploads', 'total_size_mb', 'view_count', 'created_at')


class AlbumDetailSerializer(serializers.ModelSerializer):
    """Serializer for album detail view"""
    event_type = EventTypeSerializer(read_only=True)
    owner = serializers.CharField(source='owner.full_name', read_only=True)
    collaborators = AlbumCollaboratorSerializer(many=True, read_only=True)
    settings = AlbumSettingsSerializer(read_only=True)
    total_uploads = serializers.ReadOnlyField()
    total_size_mb = serializers.ReadOnlyField()
    upload_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Album
        fields = (
            'id', 'title', 'slug', 'description', 'event_type', 'event_date',
            'event_location', 'owner', 'status', 'privacy', 'max_files_per_user',
            'allowed_file_types', 'max_file_size_mb', 'require_approval',
            'enable_comments', 'qr_code', 'access_code', 'collaborators',
            'settings', 'total_uploads', 'total_size_mb', 'upload_url',
            'view_count', 'download_count', 'created_at', 'updated_at',
            'expires_at'
        )
        read_only_fields = (
            'id', 'slug', 'access_code', 'qr_code', 'total_uploads',
            'total_size_mb', 'upload_url', 'view_count', 'download_count',
            'created_at', 'updated_at'
        )


class AlbumCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating albums"""
    event_type_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Album
        fields = (
            'title', 'description', 'event_type_id', 'event_date',
            'event_location', 'privacy', 'max_files_per_user',
            'allowed_file_types', 'max_file_size_mb', 'require_approval',
            'enable_comments', 'expires_at'
        )
    
    def validate_event_type_id(self, value):
        try:
            EventType.objects.get(id=value)
        except EventType.DoesNotExist:
            raise serializers.ValidationError("Geçersiz etkinlik türü.")
        return value
    
    def create(self, validated_data):
        event_type_id = validated_data.pop('event_type_id')
        event_type = EventType.objects.get(id=event_type_id)
        
        album = Album.objects.create(
            event_type=event_type,
            owner=self.context['request'].user,
            **validated_data
        )
        
        # Create default settings
        AlbumSettings.objects.create(album=album)
        
        return album


class AlbumUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating albums"""
    
    class Meta:
        model = Album
        fields = (
            'title', 'description', 'event_location', 'privacy',
            'max_files_per_user', 'allowed_file_types', 'max_file_size_mb',
            'require_approval', 'enable_comments', 'expires_at'
        )
    
    def update(self, instance, validated_data):
        # Only allow updates if user is owner or has admin role
        user = self.context['request'].user
        if instance.owner != user:
            # Check if user is collaborator with admin role
            try:
                collaborator = instance.collaborators.get(user=user)
                if collaborator.role != 'admin':
                    raise serializers.ValidationError("Bu albümü düzenleme yetkiniz yok.")
            except AlbumCollaborator.DoesNotExist:
                raise serializers.ValidationError("Bu albümü düzenleme yetkiniz yok.")
        
        return super().update(instance, validated_data)


class AlbumQRCodeSerializer(serializers.ModelSerializer):
    """Serializer for QR code generation"""
    qr_code_url = serializers.SerializerMethodField()
    upload_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Album
        fields = ('id', 'title', 'access_code', 'qr_code', 'qr_code_url', 'upload_url')
        read_only_fields = ('id', 'title', 'access_code', 'qr_code', 'qr_code_url', 'upload_url')
    
    def get_qr_code_url(self, obj):
        if obj.qr_code:
            return self.context['request'].build_absolute_uri(obj.qr_code.url)
        return None


class AlbumStatsSerializer(serializers.ModelSerializer):
    """Serializer for album statistics"""
    total_uploads = serializers.ReadOnlyField()
    total_size_mb = serializers.ReadOnlyField()
    recent_uploads = serializers.SerializerMethodField()
    
    class Meta:
        model = Album
        fields = (
            'id', 'title', 'total_uploads', 'total_size_mb', 'view_count',
            'download_count', 'recent_uploads', 'created_at'
        )
        read_only_fields = ('id', 'title', 'total_uploads', 'total_size_mb', 'view_count', 'download_count', 'created_at')
    
    def get_recent_uploads(self, obj):
        from apps.uploads.models import Upload
        recent = obj.uploads.order_by('-created_at')[:5]
        return [
            {
                'id': upload.id,
                'filename': upload.original_filename,
                'file_type': upload.file_type,
                'uploader': upload.uploader_display_name,
                'created_at': upload.created_at
            }
            for upload in recent
        ] 