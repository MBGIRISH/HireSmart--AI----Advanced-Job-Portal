"""
Script to view database contents
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models import User, Job, Application, ParsedProfile
from sqlalchemy import text

def view_database():
    """Display database contents"""
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("HireSmart AI - Database Contents")
        print("=" * 60)
        
        # Users
        users = db.query(User).all()
        print(f"\n📊 USERS ({len(users)} total):")
        print("-" * 60)
        for user in users:
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email}")
            print(f"  Name: {user.name}")
            print(f"  Role: {user.role.value}")
            print(f"  Created: {user.created_at}")
            print()
        
        # Jobs
        jobs = db.query(Job).all()
        print(f"\n💼 JOBS ({len(jobs)} total):")
        print("-" * 60)
        for job in jobs:
            print(f"  ID: {job.id}")
            print(f"  Title: {job.title}")
            print(f"  Company: {job.company}")
            print(f"  Location: {job.location}")
            print(f"  Type: {job.type}")
            print(f"  Posted: {job.posted_at}")
            print(f"  Active: {job.is_active}")
            print()
        
        # Applications
        applications = db.query(Application).all()
        print(f"\n📝 APPLICATIONS ({len(applications)} total):")
        print("-" * 60)
        for app in applications:
            print(f"  ID: {app.id}")
            print(f"  Job ID: {app.job_id}")
            print(f"  User ID: {app.user_id}")
            print(f"  Status: {app.status}")
            print(f"  Match Score: {app.match_score}%")
            print(f"  Applied: {app.applied_at}")
            print()
        
        # Parsed Profiles
        profiles = db.query(ParsedProfile).all()
        print(f"\n👤 PARSED PROFILES ({len(profiles)} total):")
        print("-" * 60)
        for profile in profiles:
            print(f"  User ID: {profile.user_id}")
            print(f"  Skills: {len(profile.skills) if profile.skills else 0} skills")
            print(f"  Experience: {len(profile.experience) if profile.experience else 0} entries")
            print(f"  Education: {len(profile.education) if profile.education else 0} entries")
            print()
        
        # Statistics
        print("\n📈 STATISTICS:")
        print("-" * 60)
        result = db.execute(text("""
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM jobs) as total_jobs,
                (SELECT COUNT(*) FROM applications) as total_applications,
                (SELECT COUNT(*) FROM parsed_profiles) as total_profiles,
                (SELECT AVG(match_score) FROM applications) as avg_match_score
        """))
        stats = result.fetchone()
        print(f"  Total Users: {stats[0]}")
        print(f"  Total Jobs: {stats[1]}")
        print(f"  Total Applications: {stats[2]}")
        print(f"  Total Profiles: {stats[3]}")
        print(f"  Average Match Score: {stats[4]:.2f}%" if stats[4] else "  Average Match Score: N/A")
        
    finally:
        db.close()

if __name__ == "__main__":
    view_database()

