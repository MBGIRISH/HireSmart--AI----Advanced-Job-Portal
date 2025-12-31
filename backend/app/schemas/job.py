"""
Job Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class JobBase(BaseModel):
    """Base job schema"""
    title: str = Field(..., min_length=1, max_length=255)
    company: str = Field(..., min_length=1, max_length=255)
    location: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern="^(Full-time|Part-time|Remote|Contract)$")
    description: str = Field(..., min_length=10)
    requirements: List[str] = Field(default_factory=list)
    salary_range: Optional[str] = None


class JobCreate(JobBase):
    """Schema for job creation"""
    pass


class JobUpdate(BaseModel):
    """Schema for job update"""
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    salary_range: Optional[str] = None
    is_active: Optional[bool] = None


class JobResponse(JobBase):
    """Schema for job response"""
    id: uuid.UUID
    recruiter_id: uuid.UUID
    posted_at: datetime
    updated_at: Optional[datetime] = None
    is_active: str
    
    class Config:
        from_attributes = True
        orm_mode = True

