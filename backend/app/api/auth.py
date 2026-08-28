from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, require_role
from app.schemas.user import AuthenticatedUser, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.get("/me", response_model=AuthenticatedUser, summary="Get Current Authenticated User Context")
async def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns the currently authenticated user identity and profile claims from Supabase Auth.
    """
    return current_user


@router.get("/verify-learner", summary="Verify Learner Role Permission")
async def verify_learner(user: AuthenticatedUser = Depends(require_role(["learner", "admin"]))):
    return {"status": "authorized", "role": user.role, "userId": user.id}


@router.get("/verify-trainer", summary="Verify Trainer Role Permission")
async def verify_trainer(user: AuthenticatedUser = Depends(require_role(["trainer", "admin"]))):
    return {"status": "authorized", "role": user.role, "userId": user.id}


@router.get("/verify-admin", summary="Verify Administrator Role Permission")
async def verify_admin(user: AuthenticatedUser = Depends(require_role(["admin"]))):
    return {"status": "authorized", "role": user.role, "userId": user.id}
