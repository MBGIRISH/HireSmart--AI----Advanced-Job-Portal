"""
Analytics API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.application import Application

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_analytics(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get dashboard analytics (Admin only)"""
    # Total users by role
    users_by_role = db.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(User.role).all()
    
    users_stats = {role.value: count for role, count in users_by_role}
    
    # Total jobs
    total_jobs = db.query(func.count(Job.id)).scalar()
    active_jobs = db.query(func.count(Job.id)).filter(Job.is_active == "true").scalar()
    
    # Total applications
    total_applications = db.query(func.count(Application.id)).scalar()
    
    # Applications by status
    applications_by_status = db.query(
        Application.status,
        func.count(Application.id).label('count')
    ).group_by(Application.status).all()
    
    applications_stats = {status: count for status, count in applications_by_status}
    
    # Average match score
    avg_match_score = db.query(func.avg(Application.match_score)).scalar() or 0
    
    # Top jobs by application count
    top_jobs = db.query(
        Job.id,
        Job.title,
        Job.company,
        func.count(Application.id).label('application_count')
    ).join(Application, Job.id == Application.job_id).group_by(
        Job.id, Job.title, Job.company
    ).order_by(func.count(Application.id).desc()).limit(10).all()
    
    top_jobs_list = [
        {
            "id": str(job_id),
            "title": title,
            "company": company,
            "application_count": count
        }
        for job_id, title, company, count in top_jobs
    ]
    
    return {
        "users": {
            "total": sum(users_stats.values()),
            "by_role": users_stats
        },
        "jobs": {
            "total": total_jobs,
            "active": active_jobs,
            "inactive": total_jobs - active_jobs
        },
        "applications": {
            "total": total_applications,
            "by_status": applications_stats,
            "average_match_score": round(float(avg_match_score), 2)
        },
        "top_jobs": top_jobs_list
    }


@router.get("/recruiter/stats", response_model=Dict[str, Any])
async def get_recruiter_stats(
    current_user: User = Depends(require_role([UserRole.RECRUITER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get recruiter-specific statistics"""
    # Jobs posted by recruiter
    my_jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).all()
    total_jobs = len(my_jobs)
    active_jobs = len([j for j in my_jobs if j.is_active == "true"])
    
    # Applications for my jobs
    my_job_ids = [job.id for job in my_jobs]
    total_applications = db.query(func.count(Application.id)).filter(
        Application.job_id.in_(my_job_ids)
    ).scalar()
    
    # Applications by status
    applications_by_status = db.query(
        Application.status,
        func.count(Application.id).label('count')
    ).filter(Application.job_id.in_(my_job_ids)).group_by(
        Application.status
    ).all()
    
    applications_stats = {status: count for status, count in applications_by_status}
    
    # Average match score for my jobs
    avg_match_score = db.query(func.avg(Application.match_score)).filter(
        Application.job_id.in_(my_job_ids)
    ).scalar() or 0
    
    return {
        "jobs": {
            "total": total_jobs,
            "active": active_jobs
        },
        "applications": {
            "total": total_applications,
            "by_status": applications_stats,
            "average_match_score": round(float(avg_match_score), 2)
        }
    }

