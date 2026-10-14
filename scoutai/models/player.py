import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Date, Float, Boolean, DateTime, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base
from scoutai.models.enums import CricketRole, BattingHand, BowlingStyle


class PlayerProfile(Base):
    __tablename__ = "player_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    primary_role: Mapped[CricketRole] = mapped_column(
        SAEnum(CricketRole), nullable=False, default=CricketRole.BATSMAN, index=True
    )
    secondary_role: Mapped[Optional[CricketRole]] = mapped_column(SAEnum(CricketRole), nullable=True)
    batting_hand: Mapped[BattingHand] = mapped_column(
        SAEnum(BattingHand), nullable=False, default=BattingHand.RIGHT_HAND
    )
    bowling_style: Mapped[BowlingStyle] = mapped_column(
        SAEnum(BowlingStyle), nullable=False, default=BowlingStyle.NONE
    )

    height_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nationality: Mapped[str] = mapped_column(String(100), default="India", index=True)
    current_team: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    scout_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    assessments: Mapped[List["AssessmentSession"]] = relationship(
        "AssessmentSession", back_populates="player", cascade="all, delete-orphan"
    )
    evaluations: Mapped[List["ScoutEvaluation"]] = relationship(
        "ScoutEvaluation", back_populates="player", cascade="all, delete-orphan"
    )
    metrics: Mapped[List["PerformanceMetric"]] = relationship(
        "PerformanceMetric", back_populates="player", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<PlayerProfile {self.display_name} ({self.primary_role})>"
