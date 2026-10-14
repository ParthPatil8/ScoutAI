from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.metric import PerformanceMetric
from scoutai.models.assessment import AssessmentSession
from scoutai.schemas.metric import PerformanceMetricCreate, PerformanceMetricResponse

router = APIRouter(prefix="/assessments/{assessment_id}/metrics", tags=["Performance Metrics"])


@router.get("", response_model=List[PerformanceMetricResponse], summary="Get performance metrics for an assessment session")
def get_assessment_metrics(assessment_id: str, db: Session = Depends(get_db_session)):
    assessment = db.query(AssessmentSession).filter_by(id=assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    metrics = (
        db.query(PerformanceMetric)
        .filter_by(assessment_session_id=assessment_id)
        .order_by(PerformanceMetric.category.asc())
        .all()
    )
    return metrics


@router.post("", response_model=PerformanceMetricResponse, status_code=status.HTTP_201_CREATED, summary="Attach manual/calibrated performance metric")
def create_assessment_metric(
    assessment_id: str,
    data: PerformanceMetricCreate,
    db: Session = Depends(get_db_session),
):
    assessment = db.query(AssessmentSession).filter_by(id=assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    metric = PerformanceMetric(
        assessment_session_id=assessment_id,
        player_id=assessment.player_id,
        metric_name=data.metric_name,
        category=data.category,
        value=data.value,
        unit=data.unit,
        benchmark_percentile=data.benchmark_percentile,
        confidence=data.confidence,
        origin=data.origin,
        is_provisional=data.is_provisional,
        methodology=data.methodology,
        interpretation=data.interpretation,
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric
