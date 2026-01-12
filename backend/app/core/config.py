"""
Application configuration using Pydantic settings
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/hiresmart_db"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-change-this-in-production-use-openssl-rand-hex-32"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # OpenAI (Optional)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Server
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Get CORS origins as a list"""
        # Default origins for development
        default_origins = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
        cors_str = os.getenv("CORS_ORIGINS", default_origins)
        origins = [origin.strip() for origin in cors_str.split(",")]
        # In development, also allow any localhost/127.0.0.1 origin
        if os.getenv("ENVIRONMENT", "development") == "development":
            origins.append("*")  # Allow all origins in development
        return origins
    
    # File upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads/resumes"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

