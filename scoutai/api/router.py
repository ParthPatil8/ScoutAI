from fastapi import APIRouter

from scoutai.api.endpoints.health import router as health_router
from scoutai.api.endpoints.players import router as players_router
from scoutai.api.endpoints.datasets import router as datasets_router
from scoutai.api.endpoints.media import router as media_router
from scoutai.api.endpoints.assessments import router as assessments_router
from scoutai.api.endpoints.cv_results import router as cv_results_router
from scoutai.api.endpoints.metrics import router as metrics_router
from scoutai.api.endpoints.scouting import router as scouting_router
from scoutai.api.endpoints.analytics import router as analytics_router
from scoutai.api.endpoints.models import router as models_router

api_router = APIRouter()

# Health endpoints at root and under api
api_router.include_router(health_router)

# Sub-resources
api_router.include_router(players_router)
api_router.include_router(datasets_router)
api_router.include_router(media_router)
api_router.include_router(assessments_router)
api_router.include_router(cv_results_router)
api_router.include_router(metrics_router)
api_router.include_router(scouting_router)
api_router.include_router(analytics_router)
api_router.include_router(models_router)
