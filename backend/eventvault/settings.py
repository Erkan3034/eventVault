"""
Django settings for Mirra project.
"""

from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1,testserver',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'storages',
]

LOCAL_APPS = [
    'apps.authentication',
    'apps.albums',
    'apps.uploads',
    'apps.notifications',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'eventvault.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'eventvault.wsgi.application'

# ─────────────────────────────────────────────────────────────
# Database — Supabase PostgreSQL
# Set USE_SQLITE=True in .env for local development without Supabase
# ─────────────────────────────────────────────────────────────
USE_SQLITE = config('USE_SQLITE', default=True, cast=bool)

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='mirra'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='db.xxxxx.supabase.co'),
            'PORT': config('DB_PORT', default='5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
        }
    }

# ─────────────────────────────────────────────────────────────
# Supabase
# ─────────────────────────────────────────────────────────────
SUPABASE_URL = config('SUPABASE_URL', default='')
SUPABASE_KEY = config('SUPABASE_KEY', default='')
SUPABASE_SERVICE_KEY = config('SUPABASE_SERVICE_KEY', default='')

# ─────────────────────────────────────────────────────────────
# Storage — Cloudflare R2 (S3-compatible)
# ─────────────────────────────────────────────────────────────
USE_R2 = config('USE_R2', default=False, cast=bool)

if USE_R2:
    DEFAULT_FILE_STORAGE = 'storage.r2.PrivateMediaStorage'
    AWS_ACCESS_KEY_ID = config('CLOUDFLARE_R2_ACCESS_KEY', default='')
    AWS_SECRET_ACCESS_KEY = config('CLOUDFLARE_R2_SECRET_KEY', default='')
    AWS_STORAGE_BUCKET_NAME = config('CLOUDFLARE_R2_BUCKET', default='mirra-media')
    AWS_S3_ENDPOINT_URL = config('CLOUDFLARE_R2_ENDPOINT', default='')
    AWS_S3_REGION_NAME = config('CLOUDFLARE_R2_REGION', default='eeur')
    AWS_DEFAULT_ACL = 'private'
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = True  # Signed URLs
    AWS_QUERYSTRING_EXPIRE = 3600  # 1 hour
else:
    # Local development: store files in media/ folder
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'tr-tr'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_TZ = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# ─────────────────────────────────────────────────────────────
# REST Framework — JWT
# ─────────────────────────────────────────────────────────────
from datetime import timedelta

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ─────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True

# ─────────────────────────────────────────────────────────────
# Email
# ─────────────────────────────────────────────────────────────
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@mirra.com.tr')

# ─────────────────────────────────────────────────────────────
# Mirra App Settings
# ─────────────────────────────────────────────────────────────
MIRRA_APP_URL = config('MIRRA_APP_URL', default='http://localhost:3000')
MIRRA_APP_NAME = 'Mirra'

# File upload limits
MAX_UPLOAD_SIZE_IMAGE = 20 * 1024 * 1024   # 20MB (before WebP conversion)
MAX_UPLOAD_SIZE_VIDEO = 100 * 1024 * 1024  # 100MB
MAX_UPLOAD_SIZE_AUDIO = 20 * 1024 * 1024   # 20MB

# Image processing
MIRRA_CONVERT_TO_WEBP = True
MIRRA_WEBP_QUALITY = 82            # Quality for photo uploads
MIRRA_THUMB_WEBP_QUALITY = 80      # Quality for thumbnails
MIRRA_MAX_IMAGE_WIDTH = 2400       # Resize if wider than this (px)

# Allowed upload extensions (magic-bytes validated separately)
ALLOWED_UPLOAD_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.heic',  # images
    '.mp4', '.mov', '.avi', '.mkv', '.webm',    # videos
    '.mp3', '.wav', '.aac', '.m4a', '.ogg',     # audio
]

MAX_ALBUM_SIZE = config('MAX_ALBUM_SIZE', default=100, cast=int)

# Rate limiting (django-ratelimit)
MIRRA_UPLOAD_RATE = '20/h'   # per IP
MIRRA_LOGIN_RATE = '5/m'     # per IP
MIRRA_QR_RATE = '100/h'      # per album