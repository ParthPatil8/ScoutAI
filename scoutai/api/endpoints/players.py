from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.enums import CricketRole
from scoutai.models.metric import PerformanceMetric
from scoutai.schemas.player import (
    PlayerProfileCreate,
    PlayerProfileUpdate,
    PlayerProfileResponse,
    PlayerListResponse,
)
from scoutai.schemas.metric import PerformanceMetricResponse
from scoutai.services.player_service import PlayerService

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("", response_model=PlayerListResponse, summary="List cricketers with optional filters")
def list_players(
    role: Optional[CricketRole] = Query(None, description="Filter by primary role"),
    search: Optional[str] = Query(None, description="Search by name or team"),
    is_synthetic: Optional[bool] = Query(None, description="Filter synthetic demonstration records"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db_session),
):
    items, total = PlayerService.list_players(
        db, role=role, search=search, is_synthetic=is_synthetic, skip=skip, limit=limit
    )
    return PlayerListResponse(total=total, items=items)


@router.post("", response_model=PlayerProfileResponse, status_code=status.HTTP_201_CREATED, summary="Register new player")
def create_player(
    data: PlayerProfileCreate,
    db: Session = Depends(get_db_session),
):
    return PlayerService.create_player(db, data)


@router.get("/{player_id}", response_model=PlayerProfileResponse, summary="Get player profile by ID")
def get_player(
    player_id: str,
    db: Session = Depends(get_db_session),
):
    player = PlayerService.get_player(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.put("/{player_id}", response_model=PlayerProfileResponse, summary="Update player profile")
def update_player(
    player_id: str,
    data: PlayerProfileUpdate,
    db: Session = Depends(get_db_session),
):
    player = PlayerService.update_player(db, player_id, data)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete player profile")
def delete_player(
    player_id: str,
    db: Session = Depends(get_db_session),
):
    success = PlayerService.delete_player(db, player_id)
    if not success:
        raise HTTPException(status_code=404, detail="Player not found")
    return None


@router.get("/{player_id}/metrics", response_model=List[PerformanceMetricResponse], summary="Get player's full metric history")
def get_player_metrics(
    player_id: str,
    db: Session = Depends(get_db_session),
):
    player = PlayerService.get_player(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    metrics = (
        db.query(PerformanceMetric)
        .filter_by(player_id=player_id)
        .order_by(PerformanceMetric.created_at.desc())
        .all()
    )
    return metrics
