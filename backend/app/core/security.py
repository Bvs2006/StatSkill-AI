from typing import Optional, Dict, Any
import jwt
from app.core.config import settings
from app.core.exceptions import CredentialsException


def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a Supabase JWT token.
    In development / test mode without JWT secret verification, validates standard claims.
    """
    try:
        if settings.ENVIRONMENT == "development":
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_aud": False},
                algorithms=["HS256", "RS256"],
            )
        else:
            payload = jwt.decode(
                token,
                key=settings.SUPABASE_JWT_SECRET,
                options={"verify_signature": True, "verify_aud": False},
                algorithms=["HS256", "RS256"],
            )
        return payload
    except jwt.PyJWTError as e:
        raise CredentialsException(f"Invalid authentication token: {str(e)}")


def extract_user_role(payload: Dict[str, Any]) -> str:
    """
    Extracts the user's role from user_metadata, app_metadata, or root claims.
    Defaults to 'learner'.
    """
    app_metadata = payload.get("app_metadata", {})
    user_metadata = payload.get("user_metadata", {})

    role = app_metadata.get("role") or user_metadata.get("role") or payload.get("role")
    if role in ("learner", "trainer", "admin"):
        return role
    return "learner"
