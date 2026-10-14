import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey, JSON, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base
from scoutai.models.enums import ScoutRecommendation, BenchmarkLevel, CricketRole


class ScoutEvaluation(Base):
    __tablename__ = "scout_evaluations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("player_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assessment_session_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("assessment_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    evaluator_name: Mapped[str] = mapped_column(String(150), nullable=False)
    evaluator_organization: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    evaluation_date: Mapped[date] = mapped_column(Date, default=func.current_date(), nullable=False)
    
    technical_rating: Mapped[float] = mapped_column(Float, nullable=False)  # 1.0 - 10.0
    tactical_rating: Mapped[float] = mapped_column(Float, nullable=False)   # 1.0 - 10.0
    physical_rating: Mapped[float] = mapped_column(Float, nullable=False)   # 1.0 - 10.0
    mental_rating: Mapped[float] = mapped_column(Float, nullable=False)     # 1.0 - 10.0
    overall_rating: Mapped[float] = mapped_column(Float, nullable=False)    # 1.0 - 10.0
    
    scout_recommendation: Mapped[ScoutRecommendation] = mapped_column(
        SAEnum(ScoutRecommendation), default=ScoutRecommendation.MONITOR, index=True
    )
    
    strengths: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    development_areas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    detailed_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    player: Mapped["PlayerProfile"] = relationship("PlayerProfile", back_populates="evaluations")
    assessment_session: Mapped[Optional["AssessmentSession"]] = relationship(
        "AssessmentSession", back_populates="evaluations"
    )

    def __repr__(self) -> str:
        return f"<ScoutEvaluation {self.evaluator_name} on player_id={self.player_id} [{self.scout_recommendation}]>"


class PlayerBenchmark(Base):
    __tablename__ = "player_benchmarks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role: Mapped[CricketRole] = mapped_column(SAEnum(CricketRole), nullable=False, index=True)
    level: Mapped[BenchmarkLevel] = mapped_column(
        SAEnum(BenchmarkLevel), default=BenchmarkLevel.ACADEMY, index=True
    )
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    p10: Mapped[float] = mapped_column(Float, nullable=False)
    p25: Mapped[float] = mapped_column(Float, nullable=False)
    p50: Mapped[float] = mapped_column(Float, nullable=False)  # Median
    p75: Mapped[float] = mapped_column(Float, nullable=False)
    p90: Mapped[float] = mapped_column(Float, nullable=False)
    
    unit: Mapped[str] = mapped_column(String(40), nullable=False)
    sample_size: Mapped[int] = mapped_column(Integer, default=100)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<PlayerBenchmark {self.role.value} {self.level.value} - {self.metric_name}>"


class PlayerComparisonLog(Base):
    __tablename__ = "player_comparison_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    primary_player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("player_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_player_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("player_profiles.id", ondelete="CASCADE"), nullable=True, index=True
    )
    benchmark_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    comparison_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    coach_feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<PlayerComparisonLog {self.primary_player_id} vs {self.target_player_id or self.benchmark_level}>"
