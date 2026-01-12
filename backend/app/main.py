"""
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, jobs, applications, profiles, admin, analytics
from app.middleware.logging_middleware import LoggingMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting HireSmart AI Job Portal API...")
    # Note: Database migrations should be run manually using: alembic upgrade head
    # This ensures proper version control and migration history
    logger.info("Database migrations should be run with: alembic upgrade head")
    yield
    # Shutdown
    logger.info("Shutting down HireSmart AI Job Portal API...")


app = FastAPI(
    title="HireSmart AI - Job Portal API",
    description="Production-ready AI-powered job portal with resume matching",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware - allow all origins in development
cors_origins = settings.CORS_ORIGINS
# In development, allow all origins
if settings.ENVIRONMENT == "development" or "*" in cors_origins:
    cors_origins = ["*"]
    allow_credentials = False  # Can't use credentials with wildcard
else:
    allow_credentials = True
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom logging middleware
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(profiles.router, prefix="/api/v1/profiles", tags=["Profiles"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["Applications"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return JSONResponse({
        "message": "HireSmart AI Job Portal API",
        "version": "1.0.0",
        "status": "healthy"
    })


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return JSONResponse({
        "status": "healthy",
        "service": "HireSmart AI Job Portal API"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

