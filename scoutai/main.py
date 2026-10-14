from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scoutai.config import settings
from scoutai.database import Base, engine
import scoutai.models  # Ensure all ORM models are registered
from scoutai.api.router import api_router
from scoutai.api.endpoints.health import router as root_health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Ensure database schema is initialized
    Base.metadata.create_all(bind=engine)
    # Ensure storage paths exist
    _ = settings.video_dir
    _ = settings.frames_dir
    _ = settings.keypoints_dir
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "ScoutAI: AI-Powered Cricket Talent Scouting and Performance Assessment Backend. "
        "Provides REST APIs for dataset management, video pose estimation, biomechanical "
        "metric extraction, scout evaluations, and cohort benchmarking."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root health endpoints
app.include_router(root_health_router)

# API v1 endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", summary="ScoutAI Service Root")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "documentation": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
    }
