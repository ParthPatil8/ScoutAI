import uuid
from datetime import datetime
from typing import Optional, List, Any, Dict
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from scoutai.database import Base
from scoutai.models.enums import DataSplit, ImportJobStatus


class DatasetSource(Base):
    __tablename__ = "dataset_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    website_url: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    paper_citation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    license_type: Mapped[str] = mapped_column(String(100), default="Research Only", nullable=False)
    license_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_official_candidate: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    versions: Mapped[List["DatasetVersion"]] = relationship(
        "DatasetVersion", back_populates="source", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<DatasetSource {self.slug}>"


class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_source_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("dataset_sources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_tag: Mapped[str] = mapped_column(String(50), nullable=False)
    release_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    format_type: Mapped[str] = mapped_column(String(50), default="JSON_ANNOTATIONS")
    total_samples: Mapped[int] = mapped_column(Integer, default=0)
    metadata_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    source: Mapped["DatasetSource"] = relationship("DatasetSource", back_populates="versions")
    samples: Mapped[List["DatasetSample"]] = relationship(
        "DatasetSample", back_populates="version", cascade="all, delete-orphan"
    )
    import_jobs: Mapped[List["ImportJob"]] = relationship(
        "ImportJob", back_populates="dataset_version", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<DatasetVersion {self.version_tag}>"


class DatasetSample(Base):
    __tablename__ = "dataset_samples"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("dataset_versions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sample_identifier: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    split: Mapped[DataSplit] = mapped_column(SAEnum(DataSplit), default=DataSplit.UNSPECIFIED, index=True)
    media_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_sec: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fps: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    resolution: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    provenance_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    version: Mapped["DatasetVersion"] = relationship("DatasetVersion", back_populates="samples")
    annotations: Mapped[List["DatasetAnnotation"]] = relationship(
        "DatasetAnnotation", back_populates="sample", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<DatasetSample {self.sample_identifier} [{self.split}]>"


class DatasetAnnotation(Base):
    __tablename__ = "dataset_annotations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("dataset_samples.id", ondelete="CASCADE"), nullable=False, index=True
    )
    annotation_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    start_frame: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_frame: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Flexible structured keypoint or action payload
    keypoints_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    raw_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    sample: Mapped["DatasetSample"] = relationship("DatasetSample", back_populates="annotations")

    def __repr__(self) -> str:
        return f"<DatasetAnnotation {self.annotation_type}: {self.label}>"


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("dataset_versions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    importer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    source_path: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[ImportJobStatus] = mapped_column(
        SAEnum(ImportJobStatus), default=ImportJobStatus.PENDING, index=True
    )
    total_records: Mapped[int] = mapped_column(Integer, default=0)
    imported_records: Mapped[int] = mapped_column(Integer, default=0)
    failed_records: Mapped[int] = mapped_column(Integer, default=0)
    error_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logs: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    dataset_version: Mapped["DatasetVersion"] = relationship("DatasetVersion", back_populates="import_jobs")

    def __repr__(self) -> str:
        return f"<ImportJob {self.importer_name} [{self.status}]>"
