import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base


class MLModelRegistry(Base):
    __tablename__ = "ml_models_registry"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_identifier: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    task_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    architecture: Mapped[str] = mapped_column(String(100), nullable=False)
    framework: Mapped[str] = mapped_column(String(50), default="PyTorch/OpenCV")
    
    input_spec: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    output_spec: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    license: Mapped[str] = mapped_column(String(100), default="MIT/Apache-2.0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    inference_logs: Mapped[list["ModelInferenceLog"]] = relationship(
        "ModelInferenceLog", back_populates="model", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<MLModelRegistry {self.model_identifier} v{self.version}>"


class ModelInferenceLog(Base):
    __tablename__ = "model_inference_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("ml_models_registry.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assessment_session_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("assessment_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    execution_status: Mapped[str] = mapped_column(String(50), default="SUCCESS")
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    frames_processed: Mapped[int] = mapped_column(Integer, default=0)
    error_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    model: Mapped["MLModelRegistry"] = relationship("MLModelRegistry", back_populates="inference_logs")

    def __repr__(self) -> str:
        return f"<ModelInferenceLog model_id={self.model_id} status={self.execution_status}>"
