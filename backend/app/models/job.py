"""
Job model for database
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class Job(Base):
    """Job posting model"""
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # Full-time, Part-time, Remote, Contract
    description = Column(Text, nullable=False)
    requirements = Column(ARRAY(String), nullable=False, default=list)
    salary_range = Column(String(100), nullable=True)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(String(10), default="true", nullable=False)  # Store as string for simplicity
    
    # Relationships
    recruiter = relationship("User", back_populates="jobs", foreign_keys=[recruiter_id])
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Job(id={self.id}, title={self.title}, company={self.company})>"

