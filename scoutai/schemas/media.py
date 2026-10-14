from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from scoutai.models.enums import MediaProcessingStatus


class ClipSegmentResponse(BaseModel):
    id: str
    media_asset_id: str
    start_frame: int
    end_frame: int
    start_time_sec: float
    end_time_sec: float
    action_label: Optional[str] = None
    phase_label: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MediaAssetResponse(BaseModel):
    id: str
    original_filename: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    duration_sec: Optional[float] = None
    fps: Optional[float] = None
    frame_count: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    checksum_sha256: Optional[str] = None
    storage_provider: str
    processing_status: MediaProcessingStatus
    is_synthetic: bool
    created_at: datetime
    clip_segments: List[ClipSegmentResponse] = []

    model_config = ConfigDict(from_attributes=True)
