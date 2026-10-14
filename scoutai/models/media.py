import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base
from scoutai.models.enums import MediaProcessingStatus


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mime_type: Mapped[str] = mapped_column(String(100), default="video/mp4")
    
    duration_sec: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fps: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    frame_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    width: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    checksum_sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    storage_provider: Mapped[str] = mapped_column(String(50), default="LOCAL")
    processing_status: Mapped[MediaProcessingStatus] = mapped_column(
        SAEnum(MediaProcessingStatus), default=MediaProcessingStatus.UPLOADED, index=True
    )
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    clip_segments: Mapped[List["ClipSegment"]] = relationship(
        "ClipSegment", back_populates="media_asset", cascade="all, delete-orphan"
    )
    assessments: Mapped[List["AssessmentSession"]] = relationship(
        "AssessmentSession", back_populates="media_asset"
    )

    def __repr__(self) -> str:
        return f"<MediaAsset {self.original_filename} [{self.processing_status}]>"


class ClipSegment(Base):
    __tablename__ = "clip_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    media_asset_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_frame: Mapped[int] = mapped_column(Integer, nullable=False)
    end_frame: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time_sec: Mapped[float] = mapped_column(Float, nullable=False)
    end_time_sec: Mapped[float] = mapped_column(Float, nullable=False)
    
    action_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    phase_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    media_asset: Mapped["MediaAsset"] = relationship("MediaAsset", back_populates="clip_segments")

    def __repr__(self) -> str:
        return f"<ClipSegment {self.action_label} frames {self.start_frame}-{self.end_frame}>"
