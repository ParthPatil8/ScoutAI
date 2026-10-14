from datetime import date
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload

from scoutai.models.assessment import AssessmentSession
from scoutai.models.metric import PerformanceMetric
from scoutai.models.enums import AssessmentType, AssessmentStatus
from scoutai.schemas.assessment import AssessmentCreate, AssessmentUpdate
from scoutai.pipeline.assessment_runner import AssessmentRunner


class AssessmentService:
    runner = AssessmentRunner()

    @staticmethod
    def get_assessment(db: Session, assessment_id: str) -> Optional[AssessmentSession]:
        return (
            db.query(AssessmentSession)
            .options(
                joinedload(AssessmentSession.player),
                joinedload(AssessmentSession.media_asset),
                joinedload(AssessmentSession.metrics),
                joinedload(AssessmentSession.cv_results),
                joinedload(AssessmentSession.evaluations),
            )
            .filter(AssessmentSession.id == assessment_id)
            .first()
        )

    @staticmethod
    def list_assessments(
        db: Session,
        player_id: Optional[str] = None,
        assessment_type: Optional[AssessmentType] = None,
        status: Optional[AssessmentStatus] = None,
        is_synthetic: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[AssessmentSession], int]:
        query = db.query(AssessmentSession)
        if player_id:
            query = query.filter(AssessmentSession.player_id == player_id)
        if assessment_type:
            query = query.filter(AssessmentSession.assessment_type == assessment_type)
        if status:
            query = query.filter(AssessmentSession.status == status)
        if is_synthetic is not None:
            query = query.filter(AssessmentSession.is_synthetic == is_synthetic)

        total = query.count()
        items = query.order_by(AssessmentSession.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def create_assessment(db: Session, data: AssessmentCreate) -> AssessmentSession:
        assessment = AssessmentSession(
            player_id=data.player_id,
            media_asset_id=data.media_asset_id,
            session_name=data.session_name,
            assessment_type=data.assessment_type,
            assessment_date=data.assessment_date or date.today(),
            status=AssessmentStatus.DRAFT,
            is_synthetic=data.is_synthetic,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def update_assessment(db: Session, assessment_id: str, data: AssessmentUpdate) -> Optional[AssessmentSession]:
        assessment = db.query(AssessmentSession).filter(AssessmentSession.id == assessment_id).first()
        if not assessment:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(assessment, key, val)
        
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def process_assessment(
        db: Session,
        assessment_id: str,
        model_identifier: str = "cricket-kinematics-v1",
        force_reprocess: bool = False,
    ) -> AssessmentSession:
        return AssessmentService.runner.run(
            db=db,
            assessment_id=assessment_id,
            model_identifier=model_identifier,
            force_reprocess=force_reprocess,
        )

    @staticmethod
    def get_player_history(db: Session, player_id: str) -> List[AssessmentSession]:
        return (
            db.query(AssessmentSession)
            .filter(AssessmentSession.player_id == player_id)
            .order_by(AssessmentSession.assessment_date.asc())
            .all()
        )
