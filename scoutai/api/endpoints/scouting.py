from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.schemas.scouting import ScoutEvaluationCreate, ScoutEvaluationResponse
from scoutai.services.scouting_service import ScoutingService

router = APIRouter(prefix="/evaluations", tags=["Scouting & Evaluations"])


@router.get("", response_model=List[ScoutEvaluationResponse], summary="List scout evaluations")
def list_evaluations(
    player_id: Optional[str] = Query(None),
    assessment_id: Optional[str] = Query(None),
    db: Session = Depends(get_db_session),
):
    return ScoutingService.list_evaluations(db, player_id=player_id, assessment_id=assessment_id)


@router.post("", response_model=ScoutEvaluationResponse, status_code=status.HTTP_201_CREATED, summary="Create coach/scout evaluation")
def create_evaluation(data: ScoutEvaluationCreate, db: Session = Depends(get_db_session)):
    return ScoutingService.create_evaluation(db, data)


@router.get("/{evaluation_id}", response_model=ScoutEvaluationResponse, summary="Get scout evaluation by ID")
def get_evaluation(evaluation_id: str, db: Session = Depends(get_db_session)):
    eval_record = ScoutingService.get_evaluation(db, evaluation_id)
    if not eval_record:
        raise HTTPException(status_code=404, detail="Scout evaluation not found")
    return eval_record
