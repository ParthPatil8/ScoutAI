import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base


class ComputerVisionResult(Base):
    __tablename__ = "computer_vision_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("assessment_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    media_asset_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("media_assets.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    frames_analyzed: Mapped[int] = mapped_column(Integer, default=0)
    fps_detected: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    execution_time_sec: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    assessment_session: Mapped["AssessmentSession"] = relationship("AssessmentSession", back_populates="cv_results")
    pose_results: Mapped[List["PoseEstimationResult"]] = relationship(
        "PoseEstimationResult", back_populates="cv_result", cascade="all, delete-orphan"
    )
    detected_actions: Mapped[List["DetectedAction"]] = relationship(
        "DetectedAction", back_populates="cv_result", cascade="all, delete-orphan"
    )
    biomechanical_features: Mapped[List["BiomechanicalFeature"]] = relationship(
        "BiomechanicalFeature", back_populates="cv_result", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<ComputerVisionResult {self.model_name} {self.model_version} ({self.frames_analyzed} frames)>"


class PoseEstimationResult(Base):
    __tablename__ = "pose_estimation_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cv_result_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("computer_vision_results.id", ondelete="CASCADE"), nullable=False, index=True
    )
    frame_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    timestamp_sec: Mapped[float] = mapped_column(Float, nullable=False)
    
    # 2D/3D Keypoints JSON: { "nose": [x,y,c], "left_shoulder": [x,y,c], ... }
    keypoints_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    bounding_box: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    pose_confidence: Mapped[float] = mapped_column(Float, default=1.0)

    cv_result: Mapped["ComputerVisionResult"] = relationship("ComputerVisionResult", back_populates="pose_results")

    def __repr__(self) -> str:
        return f"<PoseEstimationResult frame={self.frame_number} conf={self.pose_confidence:.2f}>"


class DetectedAction(Base):
    __tablename__ = "detected_actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cv_result_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("computer_vision_results.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action_category: Mapped[str] = mapped_column(String(50), nullable=False)  # BATTING_SHOT, BOWLING_ACTION, FIELDING
    action_label: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    start_frame: Mapped[int] = mapped_column(Integer, nullable=False)
    end_frame: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    
    # Temporal phases (e.g., {"backlift": [5, 18], "stride": [12, 22], "impact": 24, "follow_through": [25, 45]})
    temporal_phases: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    cv_result: Mapped["ComputerVisionResult"] = relationship("ComputerVisionResult", back_populates="detected_actions")

    def __repr__(self) -> str:
        return f"<DetectedAction {self.action_label} ({self.confidence:.2f})>"


class BiomechanicalFeature(Base):
    __tablename__ = "biomechanical_features"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cv_result_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("computer_vision_results.id", ondelete="CASCADE"), nullable=False, index=True
    )
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    feature_value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    frame_reference: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    cv_result: Mapped["ComputerVisionResult"] = relationship(
        "ComputerVisionResult", back_populates="biomechanical_features"
    )

    def __repr__(self) -> str:
        return f"<BiomechanicalFeature {self.feature_name}={self.feature_value} {self.unit}>"
