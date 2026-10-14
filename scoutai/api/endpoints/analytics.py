from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.enums import CricketRole, BenchmarkLevel
from scoutai.schemas.scouting import (
    PlayerBenchmarkResponse,
    PlayerComparisonRequest,
    PlayerComparisonResponse,
)
from scoutai.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & Comparison"])


@router.get("/benchmarks", response_model=List[PlayerBenchmarkResponse], summary="List role-specific performance benchmarks")
def list_benchmarks(
    role: Optional[CricketRole] = Query(None, description="Filter by role: BATSMAN, BOWLER, etc."),
    level: Optional[BenchmarkLevel] = Query(None, description="Filter by level: INTERNATIONAL, ACADEMY, etc."),
    db: Session = Depends(get_db_session),
):
    return AnalyticsService.list_benchmarks(db, role=role, level=level)


@router.post("/compare", response_model=PlayerComparisonResponse, summary="Compare player against cohort benchmark or another player")
def compare_players(req: PlayerComparisonRequest, db: Session = Depends(get_db_session)):
    try:
        return AnalyticsService.compare_player(db, req)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
