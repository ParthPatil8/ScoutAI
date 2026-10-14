from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.cv_result import ComputerVisionResult, PoseEstimationResult
from scoutai.schemas.cv_result import (
    ComputerVisionResultResponse,
    PoseEstimationResponse,
)

router = APIRouter(prefix="/assessments/{assessment_id}", tags=["Computer Vision & Poses"])


@router.get("/cv-results", response_model=List[ComputerVisionResultResponse], summary="Get computer vision runs and detected actions")
def get_assessment_cv_results(assessment_id: str, db: Session = Depends(get_db_session)):
    results = (
        db.query(ComputerVisionResult)
        .filter_by(assessment_session_id=assessment_id)
        .order_by(ComputerVisionResult.created_at.desc())
        .all()
    )
    return results


@router.get("/poses", response_model=List[PoseEstimationResponse], summary="Get extracted skeletal pose keyframes")
def get_assessment_poses(
    assessment_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db_session),
):
    # Find latest CV result for assessment
    cv_res = (
        db.query(ComputerVisionResult)
        .filter_by(assessment_session_id=assessment_id)
        .order_by(ComputerVisionResult.created_at.desc())
        .first()
    )
    if not cv_res:
        raise HTTPException(status_code=404, detail="No CV results found for this assessment")

    poses = (
        db.query(PoseEstimationResult)
        .filter_by(cv_result_id=cv_res.id)
        .order_by(PoseEstimationResult.frame_number.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return poses
