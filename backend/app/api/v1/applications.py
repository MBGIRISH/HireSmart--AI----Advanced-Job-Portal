"""
Application API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.application import Application
from app.models.parsed_profile import ParsedProfile
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate, ApplicationWithCandidateResponse
from app.schemas.user import UserResponse
from app.schemas.profile import ParsedProfileResponse
from app.services.matching_service import MatchingService

router = APIRouter()
matching_service = MatchingService()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a job (Job Seeker only)"""
    # Check if user is a job seeker
    if current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job seekers can apply to jobs"
        )
    
    # Check if job exists
    job = db.query(Job).filter(Job.id == application_data.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if already applied
    existing_application = db.query(Application).filter(
        Application.job_id == application_data.job_id,
        Application.user_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Get user's parsed profile
    parsed_profile = db.query(ParsedProfile).filter(
        ParsedProfile.user_id == current_user.id
    ).first()
    
    if not parsed_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload your resume before applying to jobs"
        )
    
    # Calculate match score
    resume_text = current_user.resume_text or ""
    match_score, match_analysis, _ = matching_service.calculate_match_score(
        job, parsed_profile, resume_text
    )
    
    # Create application
    new_application = Application(
        job_id=application_data.job_id,
        user_id=current_user.id,
        match_score=match_score,
        match_analysis=match_analysis,
        status="Pending"
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return ApplicationResponse.model_validate(new_application)


@router.get("/my-applications", response_model=List[ApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications by the current user"""
    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).order_by(Application.applied_at.desc()).all()
    
    return [ApplicationResponse.model_validate(app) for app in applications]


@router.get("/job/{job_id}/applicants", response_model=List[ApplicationWithCandidateResponse])
async def get_job_applicants(
    job_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all applicants for a job (Recruiter/Admin only)"""
    # Check if job exists and user has permission
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view applicants for this job"
        )
    
    # Get applications sorted by match score
    applications = db.query(Application).filter(
        Application.job_id == job_id
    ).order_by(Application.match_score.desc()).all()
    
    # Enrich with candidate details
    result = []
    for app in applications:
        # Get user details
        user = db.query(User).filter(User.id == app.user_id).first()
        # Get parsed profile
        profile = db.query(ParsedProfile).filter(ParsedProfile.user_id == app.user_id).first()
        
        app_dict = {
            "id": app.id,
            "job_id": app.job_id,
            "user_id": app.user_id,
            "status": app.status,
            "match_score": app.match_score,
            "match_analysis": app.match_analysis,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
            "candidate": UserResponse.model_validate(user) if user else None,
            "profile": ParsedProfileResponse.model_validate(profile) if profile else None,
            "resume_text": user.resume_text if user else None
        }
        result.append(ApplicationWithCandidateResponse(**app_dict))
    
    return result


@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    application_data: ApplicationUpdate,
    current_user: User = Depends(require_role([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Update application status (Recruiter/Admin only)"""
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check if user has permission (owns the job or is admin)
    job = db.query(Job).filter(Job.id == application.job_id).first()
    if job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this application"
        )
    
    if application_data.status:
        application.status = application_data.status
    
    db.commit()
    db.refresh(application)
    
    return ApplicationResponse.model_validate(application)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific application"""
    application = db.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permission: user owns the application or is recruiter/admin for the job
    if application.user_id != current_user.id:
        job = db.query(Job).filter(Job.id == application.job_id).first()
        if not job or (job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this application"
            )
    
    return ApplicationResponse.model_validate(application)

