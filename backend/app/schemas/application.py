"""
Application Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from app.schemas.user import UserResponse
from app.schemas.profile import ParsedProfileResponse


class ApplicationCreate(BaseModel):
    """Schema for application creation"""
    job_id: uuid.UUID


class ApplicationUpdate(BaseModel):
    """Schema for application update"""
    status: Optional[str] = Field(None, pattern="^(Pending|Reviewing|Interviewed|Rejected|Accepted)$")


class ApplicationResponse(BaseModel):
    """Schema for application response"""
    id: uuid.UUID
    job_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    match_score: int
    match_analysis: Optional[str] = None
    applied_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        orm_mode = True


class ApplicationWithCandidateResponse(BaseModel):
    """Schema for application response with candidate details (for recruiters)"""
    id: uuid.UUID
    job_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    match_score: int
    match_analysis: Optional[str] = None
    applied_at: datetime
    updated_at: Optional[datetime] = None
    candidate: Optional[UserResponse] = None
    profile: Optional[ParsedProfileResponse] = None
    resume_text: Optional[str] = None
    
    class Config:
        from_attributes = True
        orm_mode = True

