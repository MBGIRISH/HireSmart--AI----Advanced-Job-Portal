"""
Profile Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid


class ExperienceItem(BaseModel):
    """Experience item schema"""
    title: str
    company: str
    duration: str
    description: str


class EducationItem(BaseModel):
    """Education item schema"""
    degree: str
    institution: str
    year: str


class ParsedProfileResponse(BaseModel):
    """Schema for parsed profile response"""
    id: uuid.UUID
    user_id: uuid.UUID
    skills: List[str]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    summary: Optional[str] = None
    
    class Config:
        from_attributes = True
        orm_mode = True


class ProfileUpdate(BaseModel):
    """Schema for profile update"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar: Optional[str] = None

