"""
Profile API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.parsed_profile import ParsedProfile
from app.schemas.profile import ParsedProfileResponse, ProfileUpdate
from app.services.resume_parser import ResumeParser
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)
resume_parser = ResumeParser()


@router.get("/me", response_model=ParsedProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's parsed profile"""
    parsed_profile = db.query(ParsedProfile).filter(
        ParsedProfile.user_id == current_user.id
    ).first()
    
    if not parsed_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please upload a resume first."
        )
    
    return ParsedProfileResponse.model_validate(parsed_profile)


@router.post("/upload-resume", response_model=ParsedProfileResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and parse resume"""
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    # Read file content
    try:
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
            )
        
        # Extract text from PDF
        resume_text = resume_parser.extract_text_from_pdf(file_content)
        
        # Parse resume
        parsed_data = resume_parser.parse_resume(resume_text)
        
        # Update or create parsed profile
        parsed_profile = db.query(ParsedProfile).filter(
            ParsedProfile.user_id == current_user.id
        ).first()
        
        if parsed_profile:
            # Update existing profile
            parsed_profile.skills = parsed_data["skills"]
            parsed_profile.experience = parsed_data["experience"]
            parsed_profile.education = parsed_data["education"]
            parsed_profile.summary = parsed_data["summary"]
        else:
            # Create new profile
            parsed_profile = ParsedProfile(
                user_id=current_user.id,
                skills=parsed_data["skills"],
                experience=parsed_data["experience"],
                education=parsed_data["education"],
                summary=parsed_data["summary"]
            )
            db.add(parsed_profile)
        
        # Update user's resume text
        current_user.resume_text = resume_text
        
        db.commit()
        db.refresh(parsed_profile)
        
        logger.info(f"Resume parsed successfully for user {current_user.id}")
        
        return ParsedProfileResponse.model_validate(parsed_profile)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process resume"
        )


@router.put("/me", response_model=ParsedProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    if profile_data.name:
        current_user.name = profile_data.name
    if profile_data.avatar:
        current_user.avatar = profile_data.avatar
    
    db.commit()
    db.refresh(current_user)
    
    # Return parsed profile if exists
    parsed_profile = db.query(ParsedProfile).filter(
        ParsedProfile.user_id == current_user.id
    ).first()
    
    if not parsed_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return ParsedProfileResponse.model_validate(parsed_profile)

