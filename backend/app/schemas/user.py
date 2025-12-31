"""
User Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid

from app.models.user import UserRole as ModelUserRole

# Re-export UserRole for convenience
UserRole = ModelUserRole


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8, max_length=100)
    role: str = Field(default="JOB_SEEKER")


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: uuid.UUID
    role: str
    avatar: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        # For Pydantic v2 compatibility
        orm_mode = True


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

