import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base
from scoutai.models.enums import MetricCategory, MetricOrigin


class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessment_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    player_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("player_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[MetricCategory] = mapped_column(
        SAEnum(MetricCategory), nullable=False, default=MetricCategory.BATTING, index=True
    )
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(40), nullable=False)  # deg, ratio, ms, score_0_to_100, mps2
    
    benchmark_percentile: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    
    origin: Mapped[MetricOrigin] = mapped_column(
        SAEnum(MetricOrigin), nullable=False, default=MetricOrigin.MODEL_ESTIMATED, index=True
    )
    is_provisional: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    methodology: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    interpretation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    assessment_session: Mapped["AssessmentSession"] = relationship("AssessmentSession", back_populates="metrics")
    player: Mapped["PlayerProfile"] = relationship("PlayerProfile", back_populates="metrics")

    def __repr__(self) -> str:
        return f"<PerformanceMetric {self.metric_name}={self.value}{self.unit} ({self.origin})>"
