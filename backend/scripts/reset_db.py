"""
Script to reset database and apply migrations properly
WARNING: This will drop all existing tables and data!
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine
from app.core.config import settings

def reset_database():
    """Drop all tables and reset database"""
    print("⚠️  WARNING: This will delete all data!")
    confirm = input("Type 'yes' to confirm: ")
    
    if confirm.lower() != 'yes':
        print("Cancelled.")
        return
    
    print("Dropping all tables...")
    with engine.connect() as conn:
        # Drop all tables
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        conn.commit()
    
    print("✅ Database reset complete!")
    print("Now run: alembic upgrade head")

if __name__ == "__main__":
    reset_database()

