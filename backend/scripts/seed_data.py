"""
Seed script to populate database with sample data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.parsed_profile import ParsedProfile
from datetime import datetime, timedelta

# Create tables
Base.metadata.create_all(bind=engine)

db: Session = SessionLocal()


def seed_users():
    """Seed sample users"""
    users_data = [
        {
            "email": "admin@hiresmart.com",
            "name": "Admin User",
            "password": "admin123",
            "role": UserRole.ADMIN
        },
        {
            "email": "recruiter1@hiresmart.com",
            "name": "John Recruiter",
            "password": "recruiter123",
            "role": UserRole.RECRUITER
        },
        {
            "email": "recruiter2@hiresmart.com",
            "name": "Jane Recruiter",
            "password": "recruiter123",
            "role": UserRole.RECRUITER
        },
        {
            "email": "jobseeker1@hiresmart.com",
            "name": "Alice Developer",
            "password": "seeker123",
            "role": UserRole.JOB_SEEKER
        },
        {
            "email": "jobseeker2@hiresmart.com",
            "name": "Bob Engineer",
            "password": "seeker123",
            "role": UserRole.JOB_SEEKER
        },
    ]
    
    for user_data in users_data:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            user = User(
                email=user_data["email"],
                name=user_data["name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)
            print(f"Created user: {user_data['email']}")
    
    db.commit()
    print("Users seeded successfully!")


def seed_jobs():
    """Seed sample jobs"""
    recruiter1 = db.query(User).filter(User.email == "recruiter1@hiresmart.com").first()
    recruiter2 = db.query(User).filter(User.email == "recruiter2@hiresmart.com").first()
    
    if not recruiter1 or not recruiter2:
        print("Recruiters not found. Please seed users first.")
        return
    
    jobs_data = [
        {
            "title": "Senior Full Stack Developer",
            "company": "TechCorp Inc.",
            "location": "San Francisco, CA",
            "type": "Full-time",
            "description": "We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.",
            "requirements": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
            "salary_range": "$120,000 - $150,000",
            "recruiter_id": recruiter1.id
        },
        {
            "title": "Frontend Developer",
            "company": "WebSolutions Ltd.",
            "location": "Remote",
            "type": "Remote",
            "description": "Join our remote team as a Frontend Developer. You'll work on building beautiful and responsive user interfaces using React and TypeScript.",
            "requirements": ["React", "TypeScript", "CSS", "HTML", "JavaScript", "Git"],
            "salary_range": "$80,000 - $110,000",
            "recruiter_id": recruiter1.id
        },
        {
            "title": "Backend Engineer",
            "company": "DataSystems",
            "location": "New York, NY",
            "type": "Full-time",
            "description": "We need a Backend Engineer to design and implement scalable APIs and microservices. Experience with Python and FastAPI is preferred.",
            "requirements": ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "REST API"],
            "salary_range": "$100,000 - $130,000",
            "recruiter_id": recruiter2.id
        },
        {
            "title": "DevOps Engineer",
            "company": "CloudTech",
            "location": "Austin, TX",
            "type": "Full-time",
            "description": "Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. AWS and Kubernetes experience required.",
            "requirements": ["AWS", "Kubernetes", "Docker", "Jenkins", "Terraform", "Linux"],
            "salary_range": "$110,000 - $140,000",
            "recruiter_id": recruiter2.id
        },
        {
            "title": "Machine Learning Engineer",
            "company": "AI Innovations",
            "location": "Seattle, WA",
            "type": "Full-time",
            "description": "Join our ML team to build and deploy machine learning models. Experience with TensorFlow or PyTorch is essential.",
            "requirements": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Data Analysis", "SQL"],
            "salary_range": "$130,000 - $160,000",
            "recruiter_id": recruiter1.id
        },
    ]
    
    for job_data in jobs_data:
        existing_job = db.query(Job).filter(
            Job.title == job_data["title"],
            Job.company == job_data["company"]
        ).first()
        
        if not existing_job:
            job = Job(**job_data)
            db.add(job)
            print(f"Created job: {job_data['title']} at {job_data['company']}")
    
    db.commit()
    print("Jobs seeded successfully!")


def seed_profiles():
    """Seed sample parsed profiles for job seekers"""
    jobseeker1 = db.query(User).filter(User.email == "jobseeker1@hiresmart.com").first()
    jobseeker2 = db.query(User).filter(User.email == "jobseeker2@hiresmart.com").first()
    
    if not jobseeker1 or not jobseeker2:
        print("Job seekers not found. Please seed users first.")
        return
    
    profiles_data = [
        {
            "user_id": jobseeker1.id,
            "skills": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
            "experience": [
                {
                    "title": "Full Stack Developer",
                    "company": "TechStart Inc.",
                    "duration": "2020 - Present",
                    "description": "Developed and maintained web applications using React and Node.js. Implemented REST APIs and managed PostgreSQL databases."
                },
                {
                    "title": "Junior Developer",
                    "company": "WebDev Co.",
                    "duration": "2018 - 2020",
                    "description": "Worked on frontend development using React and JavaScript. Collaborated with backend team on API integration."
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science in Computer Science",
                    "institution": "State University",
                    "year": "2018"
                }
            ],
            "summary": "Experienced Full Stack Developer with 5+ years of experience building web applications. Proficient in React, Node.js, and cloud technologies."
        },
        {
            "user_id": jobseeker2.id,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "AWS"],
            "experience": [
                {
                    "title": "Backend Engineer",
                    "company": "DataCorp",
                    "duration": "2019 - Present",
                    "description": "Designed and implemented scalable backend services using Python and FastAPI. Managed containerized deployments with Docker and Kubernetes."
                }
            ],
            "education": [
                {
                    "degree": "Master of Science in Software Engineering",
                    "institution": "Tech University",
                    "year": "2019"
                }
            ],
            "summary": "Backend Engineer specializing in Python and cloud infrastructure. Strong experience with microservices architecture and DevOps practices."
        }
    ]
    
    for profile_data in profiles_data:
        existing_profile = db.query(ParsedProfile).filter(
            ParsedProfile.user_id == profile_data["user_id"]
        ).first()
        
        if not existing_profile:
            profile = ParsedProfile(**profile_data)
            db.add(profile)
            print(f"Created profile for user: {profile_data['user_id']}")
    
    db.commit()
    print("Profiles seeded successfully!")


def main():
    """Main seed function"""
    print("Starting database seeding...")
    seed_users()
    seed_jobs()
    seed_profiles()
    print("Database seeding completed!")
    db.close()


if __name__ == "__main__":
    main()

