"""
Cloudflare R2 private storage backend for Mirra.
All uploaded files are private — access via signed URLs only.
"""

from decouple import config


class PrivateMediaStorage:
    """
    Lazy proxy that returns an S3Boto3Storage configured for R2.
    Defined as a class (not an instance) so Django can import it as a dotted path.

    Usage in settings:
        DEFAULT_FILE_STORAGE = 'storage.r2.PrivateMediaStorage'
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        # Singleton: share one boto3 session across all Django workers
        if cls._instance is None:
            from storages.backends.s3boto3 import S3Boto3Storage
            from django.conf import settings

            class _R2Storage(S3Boto3Storage):
                access_key = settings.AWS_ACCESS_KEY_ID
                secret_key = settings.AWS_SECRET_ACCESS_KEY
                bucket_name = settings.AWS_STORAGE_BUCKET_NAME
                endpoint_url = settings.AWS_S3_ENDPOINT_URL
                region_name = settings.AWS_S3_REGION_NAME
                default_acl = 'private'
                file_overwrite = False
                querystring_auth = True          # Generate pre-signed URLs
                querystring_expire = 3600        # 1 hour

                # Never expose the bucket URL in any serializer
                custom_domain = None

            cls._instance = _R2Storage()
        return cls._instance


def generate_presigned_url(file_path: str, expires_in: int = 3600) -> str | None:
    """
    Generate a pre-signed GET URL for a private R2 file.

    Args:
        file_path: Relative path within the bucket (e.g., 'uploads/ABC/uuid.webp')
        expires_in: Seconds until the URL expires (default 1 hour)

    Returns:
        Pre-signed URL string, or None on failure
    """
    try:
        import boto3
        from django.conf import settings

        client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
        url = client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': file_path,
            },
            ExpiresIn=expires_in,
        )
        return url
    except Exception as e:
        import logging
        logging.getLogger("mirra.r2").warning(
            "Could not generate presigned URL for %s: %s", file_path, e
        )
        return None


def delete_r2_file(file_path: str) -> bool:
    """
    Delete a single file from R2.
    Used during account deletion / album expiry cleanup.
    """
    try:
        import boto3
        from django.conf import settings

        client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
        client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=file_path,
        )
        return True
    except Exception as e:
        import logging
        logging.getLogger("mirra.r2").warning(
            "Could not delete R2 file %s: %s", file_path, e
        )
        return False


def delete_r2_folder(prefix: str) -> int:
    """
    Delete all objects under a path prefix (e.g., 'uploads/ALBUM_CODE/').
    Used when an album is permanently deleted.

    Returns:
        Number of files deleted
    """
    try:
        import boto3
        from django.conf import settings

        client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        paginator = client.get_paginator('list_objects_v2')
        objects_to_delete = []

        for page in paginator.paginate(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Prefix=prefix,
        ):
            for obj in page.get('Contents', []):
                objects_to_delete.append({'Key': obj['Key']})

        if objects_to_delete:
            client.delete_objects(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Delete={'Objects': objects_to_delete},
            )

        return len(objects_to_delete)
    except Exception as e:
        import logging
        logging.getLogger("mirra.r2").error(
            "Could not delete R2 folder %s: %s", prefix, e
        )
        return 0
