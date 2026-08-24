from rest_framework import serializers
from .models import Upload, UploadComment, UploadLike, UploadReport


class UploadSerializer(serializers.ModelSerializer):
    """Serializer for Upload model"""
    uploader_display_name = serializers.ReadOnlyField()
    file_size_mb = serializers.ReadOnlyField()
    
    class Meta:
        model = Upload
        fields = (
            'id', 'album', 'file', 'original_filename', 'file_type', 'file_size',
            'file_size_mb', 'mime_type', 'thumbnail', 'width', 'height', 'duration',
            'uploader_name', 'uploader_email', 'uploader_phone', 'uploader_user',
            'uploader_display_name', 'caption', 'message',
            'location_data', 'status', 'moderation_note', 'view_count',
            'like_count', 'download_count', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'file_size', 'file_size_mb', 'mime_type', 'thumbnail',
            'width', 'height', 'duration', 'location_data',
            'status', 'moderation_note', 'view_count', 'like_count',
            'download_count', 'created_at', 'updated_at'
        )


class UploadListSerializer(serializers.ModelSerializer):
    """Serializer for upload list view"""
    uploader_display_name = serializers.ReadOnlyField()
    file_size_mb = serializers.ReadOnlyField()
    thumbnail_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = (
            'id', 'original_filename', 'file_type', 'mime_type', 'file_size_mb',
            'uploader_display_name', 'caption', 'message', 'thumbnail_url', 'file_url',
            'view_count', 'like_count', 'download_count', 'comment_count',
            'is_liked_by_user', 'status', 'created_at'
        )
        read_only_fields = (
            'id', 'file_size_mb', 'uploader_display_name', 'view_count',
            'like_count', 'download_count', 'comment_count', 'is_liked_by_user',
            'status', 'created_at',
        )

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

    def get_is_liked_by_user(self, obj):
        liked_ids = self.context.get('liked_ids')
        if liked_ids is not None:
            return obj.id in liked_ids
        user = self.context.get('request') and self.context['request'].user
        if user and user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False

    def get_comment_count(self, obj):
        if hasattr(obj, 'comment_count') and obj.comment_count is not None:
            return obj.comment_count
        return obj.comments.count()


class UploadDetailSerializer(serializers.ModelSerializer):
    """Serializer for upload detail view"""
    uploader_display_name = serializers.ReadOnlyField()
    file_size_mb = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Upload
        fields = (
            'id', 'album', 'file', 'file_url', 'original_filename', 'file_type',
            'file_size', 'file_size_mb', 'mime_type', 'thumbnail', 'thumbnail_url',
            'width', 'height', 'duration', 'uploader_name', 'uploader_email',
            'uploader_phone', 'uploader_user', 'uploader_display_name', 'caption',
            'message', 'location_data', 'status', 'moderation_note',
            'view_count', 'like_count', 'download_count', 'is_liked_by_user',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'album', 'file_size', 'file_size_mb', 'mime_type', 'thumbnail',
            'width', 'height', 'duration', 'location_data',
            'status', 'moderation_note', 'view_count', 'like_count',
            'download_count', 'is_liked_by_user', 'created_at', 'updated_at'
        )
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return None
    
    def get_is_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False


class UploadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating uploads (anonymous upload)"""
    
    class Meta:
        model = Upload
        fields = (
            'file', 'uploader_name', 'uploader_email', 'uploader_phone',
            'caption', 'message'
        )
    
    def validate(self, attrs):
        album = self.context.get('album')
        if not album:
            raise serializers.ValidationError("Albüm bulunamadı.")
        
        # Check if album accepts uploads
        can_upload, message = album.can_upload()
        if not can_upload:
            raise serializers.ValidationError(message)
        
        # Check file size
        file = attrs.get('file')
        if file and file.size > album.max_file_size_mb * 1024 * 1024:
            raise serializers.ValidationError(f"Dosya boyutu {album.max_file_size_mb}MB'dan büyük olamaz.")
        
        # Check file type
        if file:
            import os
            ext = os.path.splitext(file.name)[1][1:].lower()
            if ext not in album.allowed_file_types:
                raise serializers.ValidationError(f"'{ext}' dosya türü bu albüm için desteklenmiyor.")
        
        return attrs
    
    def create(self, validated_data):
        album = self.context['album']
        status_value = 'pending' if album.require_approval else 'approved'
        upload = Upload.objects.create(album=album, status=status_value, **validated_data)

        album.view_count += 1
        album.save(update_fields=['view_count'])

        return upload


class UploadCommentSerializer(serializers.ModelSerializer):
    """Serializer for UploadComment model"""
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = UploadComment
        fields = (
            'id', 'author_name', 'content', 'parent',
            'is_approved', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'author_name', 'is_approved', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.full_name or obj.author.email
        return 'Anonim'


class UploadLikeSerializer(serializers.ModelSerializer):
    """Serializer for UploadLike model"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = UploadLike
        fields = ('id', 'upload', 'user', 'user_name', 'created_at')
        read_only_fields = ('id', 'user', 'user_name', 'created_at')


class UploadReportSerializer(serializers.ModelSerializer):
    """Serializer for UploadReport model"""
    reporter_name = serializers.CharField(source='reporter.full_name', read_only=True)
    
    class Meta:
        model = UploadReport
        fields = (
            'id', 'upload', 'reporter', 'reporter_name', 'reason', 'description',
            'is_resolved', 'resolved_by', 'resolved_at', 'created_at'
        )
        read_only_fields = ('id', 'reporter', 'reporter_name', 'is_resolved', 'resolved_by', 'resolved_at', 'created_at')


class UploadModerationSerializer(serializers.ModelSerializer):
    """Serializer for upload moderation"""
    
    class Meta:
        model = Upload
        fields = ('status', 'moderation_note')
    
    def update(self, instance, validated_data):
        instance.moderated_by = self.context['request'].user
        from django.utils import timezone
        instance.moderated_at = timezone.now()
        return super().update(instance, validated_data) 