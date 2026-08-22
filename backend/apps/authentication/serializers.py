from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'is_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'username', 'is_verified', 'created_at', 'updated_at')


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('avatar', 'bio', 'website', 'location', 'birth_date',
                  'notification_preferences', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class UserWithProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'phone', 'is_verified', 'profile',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'username', 'is_verified', 'created_at', 'updated_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name',
                  'password', 'password_confirm', 'phone')
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        password_confirm = attrs.get('password_confirm')
        if password_confirm is not None and attrs['password'] != password_confirm:
            raise serializers.ValidationError(
                {"password_confirm": "Şifreler eşleşmiyor."}
            )
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu e-posta ile kayıtlı bir kullanıcı zaten var.")
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        username = (validated_data.get('username') or '').strip()
        if not username:
            base = validated_data['email'].split('@')[0][:20] or 'user'
            username = base
            suffix = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{suffix}"
                suffix += 1
        validated_data['username'] = username

        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('E-posta ve şifre zorunludur.')

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError('E-posta veya şifre hatalı.')

        if not user.is_active:
            raise serializers.ValidationError('Bu hesap devre dışı bırakılmış.')

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password_confirm": "Yeni şifreler eşleşmiyor."}
            )
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mevcut şifre hatalı.")
        return value
