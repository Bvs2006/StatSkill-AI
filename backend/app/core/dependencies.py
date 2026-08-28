from typing import Optional, List, Callable
from fastapi import Depends, Header
from app.core.security import decode_supabase_jwt, extract_user_role
from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.schemas.user import AuthenticatedUser, UserProfileResponse
from app.db.supabase import get_supabase_client


async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer <supabase_access_token>"),
) -> AuthenticatedUser:
    """
    Validates Supabase Bearer token, extracts user claims, and optionally looks up the profile table.
    """
    if not authorization:
        # For development ease / demo accounts without live token, provide a fallback demo user
        return AuthenticatedUser(
            id="00000000-0000-0000-0000-000000000001",
            email="rajesh.sharma@nic.in",
            role="learner",
            profile=UserProfileResponse(
                id="00000000-0000-0000-0000-000000000001",
                email="rajesh.sharma@nic.in",
                name="Dr. Rajesh Sharma, ISS",
                role="learner",
                department="Labour Statistics",
                designation="Statistical Officer",
                cadre="Indian Statistical Service",
                cadre_grade="STS",
                posting="Sardar Patel Bhawan, New Delhi",
                current_assignment="Periodic Labour Force Survey (PLFS) Urban Multiplier Recalibration",
                years_of_experience=5.0,
                learning_hours=42.0,
                courses_completed=7,
                certifications_count=3,
                onboarding_completed=True,
            ),
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise CredentialsException("Authorization header must be in 'Bearer <token>' format")

    token = parts[1]
    payload = decode_supabase_jwt(token)
    user_id = payload.get("sub") or payload.get("id")
    email = payload.get("email", "user@nic.in")
    role = extract_user_role(payload)

    if not user_id:
        raise CredentialsException("Token missing subject claim ('sub')")

    # Optionally query Supabase for profile
    profile_data = None
    try:
        sb = get_supabase_client()
        res = sb.table("profiles").select("*").eq("id", user_id).execute()
        if res.data and len(res.data) > 0:
            p = res.data[0]
            profile_data = UserProfileResponse(
                id=p["id"],
                email=p["email"],
                name=p["name"],
                role=p.get("role", role),
                department=p.get("department_id"),
                designation=p.get("designation"),
                cadre=p.get("cadre"),
                cadre_grade=p.get("cadre_grade"),
                posting=p.get("posting"),
                current_assignment=p.get("current_assignment"),
                years_of_experience=p.get("years_of_experience", 5.0),
                learning_hours=p.get("learning_hours", 0.0),
                courses_completed=p.get("courses_completed", 0),
                certifications_count=p.get("certifications_count", 0),
                onboarding_completed=p.get("onboarding_completed", True),
            )
    except Exception:
        # Fallback profile
        pass

    return AuthenticatedUser(
        id=user_id,
        email=email,
        role=role,
        profile=profile_data,
    )


def require_role(allowed_roles: List[str]) -> Callable:
    """
    FastAPI dependency factory to enforce RBAC permissions.
    """
    async def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedException(
                f"Role '{current_user.role}' is not authorized. Allowed roles: {allowed_roles}"
            )
        return current_user

    return role_checker
