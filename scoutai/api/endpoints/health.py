from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from scoutai.api.deps import get_db_session
from scoutai.config import settings

router = APIRouter(tags=["Health & Status"])


@router.get("/health", summary="Basic service health check")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/db", summary="Database connectivity check")
def db_health_check(db: Session = Depends(get_db_session)):
    try:
        # Run a simple query to verify connection
        db.execute(text("SELECT 1"))
        dialect = db.bind.dialect.name if db.bind else "unknown"
        return {
            "status": "connected",
            "database_dialect": dialect,
            "database_url_type": "sqlite" if "sqlite" in settings.DATABASE_URL else "postgresql",
            "message": "Database connection verified successfully.",
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connectivity check failed: {str(e)}",
        )
