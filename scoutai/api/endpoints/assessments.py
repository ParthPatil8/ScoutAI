from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.enums import AssessmentType, AssessmentStatus
from scoutai.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
    AssessmentDetailResponse,
    AssessmentProcessRequest,
    AssessmentProcessResponse,
)
from scoutai.services.assessment_service import AssessmentService

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.get("", summary="List assessment sessions with optional filters")
def list_assessments(
    player_id: Optional[str] = Query(None),
    assessment_type: Optional[AssessmentType] = Query(None),
    status: Optional[AssessmentStatus] = Query(None),
    is_synthetic: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db_session),
):
    items, total = AssessmentService.list_assessments(
        db,
        player_id=player_id,
        assessment_type=assessment_type,
        status=status,
        is_synthetic=is_synthetic,
        skip=skip,
        limit=limit,
    )
    return {
        "total": total,
        "items": [AssessmentResponse.model_validate(a) for a in items],
    }


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED, summary="Create new assessment session")
def create_assessment(data: AssessmentCreate, db: Session = Depends(get_db_session)):
    return AssessmentService.create_assessment(db, data)


@router.get("/player/{player_id}/history", response_model=List[AssessmentResponse], summary="Retrieve player's historical assessments")
def get_player_history(player_id: str, db: Session = Depends(get_db_session)):
    return AssessmentService.get_player_history(db, player_id)


@router.get("/{assessment_id}", response_model=AssessmentDetailResponse, summary="Get full assessment details with metrics and CV outputs")
def get_assessment(assessment_id: str, db: Session = Depends(get_db_session)):
    assessment = AssessmentService.get_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.put("/{assessment_id}", response_model=AssessmentResponse, summary="Update assessment metadata")
def update_assessment(assessment_id: str, data: AssessmentUpdate, db: Session = Depends(get_db_session)):
    assessment = AssessmentService.update_assessment(db, assessment_id, data)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("/{assessment_id}/process", response_model=AssessmentProcessResponse, summary="Execute computer vision & biomechanical analysis pipeline")
def process_assessment(
    assessment_id: str,
    req: AssessmentProcessRequest,
    db: Session = Depends(get_db_session),
):
    try:
        assessment = AssessmentService.process_assessment(
            db=db,
            assessment_id=assessment_id,
            model_identifier=req.model_identifier or "cricket-kinematics-v1",
            force_reprocess=req.force_reprocess,
        )
        return AssessmentProcessResponse(
            assessment_id=assessment.id,
            status=assessment.status,
            message="Assessment pipeline executed successfully.",
            execution_duration_sec=assessment.execution_duration_sec or 0.0,
            metrics_generated=len(assessment.metrics),
            frames_analyzed=assessment.cv_results[0].frames_analyzed if assessment.cv_results else 0,
            overall_score=assessment.overall_provisional_score,
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment processing failed: {str(e)}")
