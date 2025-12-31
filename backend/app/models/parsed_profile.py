"""
ParsedProfile model for storing extracted resume data
"""
from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class ParsedProfile(Base):
    """Parsed resume profile model"""
    __tablename__ = "parsed_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    skills = Column(JSON, nullable=False, default=list)  # Array of strings
    experience = Column(JSON, nullable=False, default=list)  # Array of experience objects
    education = Column(JSON, nullable=False, default=list)  # Array of education objects
    summary = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="parsed_profile")
    
    def __repr__(self):
        return f"<ParsedProfile(id={self.id}, user_id={self.user_id})>"

