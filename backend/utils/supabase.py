"""
Supabase client singleton for Mirra.
Used for Realtime subscriptions and direct DB access alongside Django ORM.
"""

from django.conf import settings

_supabase_client = None
_supabase_admin_client = None


def get_supabase_client():
    """
    Returns the anon-key Supabase client (respects RLS).
    Lazy-initialised on first call.
    """
    global _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None

    if _supabase_client is None:
        try:
            from supabase import create_client
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY,
            )
        except ImportError:
            # supabase package not installed (local dev without it)
            return None

    return _supabase_client


def get_supabase_admin():
    """
    Returns the service-role Supabase client (bypasses RLS).
    Use only in server-side admin operations (e.g., account deletion).
    """
    global _supabase_admin_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None

    if _supabase_admin_client is None:
        try:
            from supabase import create_client
            _supabase_admin_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY,
            )
        except ImportError:
            return None

    return _supabase_admin_client


def broadcast_new_media(album_id: str, media_data: dict) -> bool:
    """
    Broadcast a new media upload event to all album subscribers.
    Used by the upload view after a successful save.

    Args:
        album_id: UUID string of the album
        media_data: dict with keys: id, uploader_name, media_type, thumbnail_url

    Returns:
        True if broadcast succeeded, False otherwise
    """
    client = get_supabase_admin()
    if not client:
        return False

    try:
        client.channel(f"album:{album_id}").send({
            "type": "broadcast",
            "event": "new_media",
            "payload": {
                "album_id": album_id,
                **media_data,
            }
        })
        return True
    except Exception as e:
        import logging
        logging.getLogger("mirra.supabase").warning(
            "Supabase broadcast failed: %s", e
        )
        return False
