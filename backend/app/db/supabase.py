from typing import Optional
from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns the singleton Supabase client using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY / ANON_KEY.
    """
    global _supabase_client
    if _supabase_client is None:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        if not key or not settings.SUPABASE_URL:
            logger.error("Supabase credentials not fully configured in settings.")
            return None
        _supabase_client = create_client(settings.SUPABASE_URL, key)
    return _supabase_client
