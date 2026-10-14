from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from scoutai.models.enums import DataSplit, ImportJobStatus


class DatasetSourceBase(BaseModel):
    name: str = Field(..., max_length=150)
    slug: str = Field(..., max_length=100)
    description: str
    website_url: Optional[str] = None
    paper_citation: Optional[str] = None
    license_type: str = "Research Only"
    license_text: Optional[str] = None
    is_official_candidate: bool = True


class DatasetSourceCreate(DatasetSourceBase):
    pass


class DatasetSourceResponse(DatasetSourceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DatasetVersionBase(BaseModel):
    version_tag: str = Field(..., max_length=50)
    release_date: Optional[str] = None
    format_type: str = "JSON_ANNOTATIONS"
    total_samples: int = 0
    metadata_payload: Optional[Dict[str, Any]] = None


class DatasetVersionCreate(DatasetVersionBase):
    dataset_source_id: str


class DatasetVersionResponse(DatasetVersionBase):
    id: str
    dataset_source_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DatasetAnnotationResponse(BaseModel):
    id: str
    sample_id: str
    annotation_type: str
    label: str
    start_frame: Optional[int] = None
    end_frame: Optional[int] = None
    confidence: Optional[float] = None
    keypoints_json: Optional[Dict[str, Any]] = None
    raw_payload: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DatasetSampleResponse(BaseModel):
    id: str
    dataset_version_id: str
    sample_identifier: str
    split: DataSplit
    media_path: Optional[str] = None
    duration_sec: Optional[float] = None
    fps: Optional[float] = None
    resolution: Optional[str] = None
    is_synthetic: bool
    provenance_notes: Optional[str] = None
    created_at: datetime
    annotations: List[DatasetAnnotationResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ImportJobCreate(BaseModel):
    dataset_version_id: str
    importer_name: str
    source_path: str


class ImportJobResponse(BaseModel):
    id: str
    dataset_version_id: str
    importer_name: str
    source_path: str
    status: ImportJobStatus
    total_records: int
    imported_records: int
    failed_records: int
    error_summary: Optional[str] = None
    logs: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DatasetSummaryResponse(BaseModel):
    total_sources: int
    total_versions: int
    total_samples: int
    total_annotations: int
    sources: List[DatasetSourceResponse]
