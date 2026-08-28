from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = Field(default="learner", pattern="^(learner|trainer|admin)$")
    department: Optional[str] = "Labour Statistics"
    designation: Optional[str] = "Statistical Officer"
    cadre: Optional[str] = "Indian Statistical Service"
    cadre_grade: Optional[str] = "STS"
    posting: Optional[str] = "New Delhi"
    current_assignment: Optional[str] = None
    educational_qualification: Optional[str] = None
    years_of_experience: Optional[float] = 5.0
    preferred_learning_mode: Optional[str] = "Blended Academy"
    preferred_language: Optional[str] = "EN"


class UserProfileResponse(UserBase):
    id: str
    phone: Optional[str] = None
    learning_hours: float = 0.0
    courses_completed: int = 0
    certifications_count: int = 0
    onboarding_completed: bool = True
    created_at: Optional[datetime] = None


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    cadre: Optional[str] = None
    cadre_grade: Optional[str] = None
    posting: Optional[str] = None
    current_assignment: Optional[str] = None
    educational_qualification: Optional[str] = None
    years_of_experience: Optional[float] = None
    preferred_learning_mode: Optional[str] = None
    preferred_language: Optional[str] = None


class AuthenticatedUser(BaseModel):
    id: str
    email: str
    role: str
    profile: Optional[UserProfileResponse] = None
