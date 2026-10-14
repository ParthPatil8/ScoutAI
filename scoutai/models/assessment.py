import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Float, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base
from scoutai.models.enums import AssessmentType, AssessmentStatus


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("player_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    media_asset_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    session_name: Mapped[str] = mapped_column(String(200), nullable=False)
    assessment_type: Mapped[AssessmentType] = mapped_column(
        SAEnum(AssessmentType), default=AssessmentType.BATTING_TECHNIQUE, index=True
    )
    status: Mapped[AssessmentStatus] = mapped_column(
        SAEnum(AssessmentStatus), default=AssessmentStatus.DRAFT, index=True
    )
    assessment_date: Mapped[date] = mapped_column(Date, default=func.current_date(), nullable=False)
    
    execution_duration_sec: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_provisional_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    scout_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    player: Mapped["PlayerProfile"] = relationship("PlayerProfile", back_populates="assessments")
    media_asset: Mapped[Optional["MediaAsset"]] = relationship("MediaAsset", back_populates="assessments")
    
    cv_results: Mapped[List["ComputerVisionResult"]] = relationship(
        "ComputerVisionResult", back_populates="assessment_session", cascade="all, delete-orphan"
    )
    metrics: Mapped[List["PerformanceMetric"]] = relationship(
        "PerformanceMetric", back_populates="assessment_session", cascade="all, delete-orphan"
    )
    evaluations: Mapped[List["ScoutEvaluation"]] = relationship(
        "ScoutEvaluation", back_populates="assessment_session"
    )

    def __repr__(self) -> str:
        return f"<AssessmentSession {self.session_name} [{self.status}]>"
