from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session

from scoutai.models.scouting import ScoutEvaluation
from scoutai.schemas.scouting import ScoutEvaluationCreate


class ScoutingService:
    @staticmethod
    def create_evaluation(db: Session, data: ScoutEvaluationCreate) -> ScoutEvaluation:
        evaluation = ScoutEvaluation(
            player_id=data.player_id,
            assessment_session_id=data.assessment_session_id,
            evaluator_name=data.evaluator_name,
            evaluator_organization=data.evaluator_organization,
            evaluation_date=data.evaluation_date or date.today(),
            technical_rating=data.technical_rating,
            tactical_rating=data.tactical_rating,
            physical_rating=data.physical_rating,
            mental_rating=data.mental_rating,
            overall_rating=data.overall_rating,
            scout_recommendation=data.scout_recommendation,
            strengths=data.strengths,
            development_areas=data.development_areas,
            detailed_notes=data.detailed_notes,
            is_synthetic=data.is_synthetic,
        )
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        return evaluation

    @staticmethod
    def get_evaluation(db: Session, evaluation_id: str) -> Optional[ScoutEvaluation]:
        return db.query(ScoutEvaluation).filter(ScoutEvaluation.id == evaluation_id).first()

    @staticmethod
    def list_evaluations(
        db: Session, player_id: Optional[str] = None, assessment_id: Optional[str] = None
    ) -> List[ScoutEvaluation]:
        query = db.query(ScoutEvaluation)
        if player_id:
            query = query.filter(ScoutEvaluation.player_id == player_id)
        if assessment_id:
            query = query.filter(ScoutEvaluation.assessment_session_id == assessment_id)
        return query.order_by(ScoutEvaluation.evaluation_date.desc()).all()
