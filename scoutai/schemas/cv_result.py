from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PoseEstimationResponse(BaseModel):
    id: str
    cv_result_id: str
    frame_number: int
    timestamp_sec: float
    keypoints_json: Dict[str, Any]
    bounding_box: Optional[Dict[str, Any]] = None
    pose_confidence: float

    model_config = ConfigDict(from_attributes=True)


class DetectedActionResponse(BaseModel):
    id: str
    cv_result_id: str
    action_category: str
    action_label: str
    start_frame: int
    end_frame: int
    confidence: float
    temporal_phases: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class BiomechanicalFeatureResponse(BaseModel):
    id: str
    cv_result_id: str
    feature_name: str
    feature_value: float
    unit: str
    frame_reference: Optional[int] = None
    confidence: float
    metadata_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ComputerVisionResultResponse(BaseModel):
    id: str
    assessment_session_id: str
    media_asset_id: Optional[str] = None
    model_name: str
    model_version: str
    frames_analyzed: int
    fps_detected: Optional[float] = None
    execution_time_sec: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime
    detected_actions: List[DetectedActionResponse] = []
    biomechanical_features: List[BiomechanicalFeatureResponse] = []

    model_config = ConfigDict(from_attributes=True)
