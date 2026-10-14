from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from scoutai.models.enums import AssessmentType, AssessmentStatus
from scoutai.schemas.player import PlayerProfileResponse
from scoutai.schemas.media import MediaAssetResponse
from scoutai.schemas.metric import PerformanceMetricResponse
from scoutai.schemas.cv_result import ComputerVisionResultResponse
from scoutai.schemas.scouting import ScoutEvaluationResponse


class AssessmentCreate(BaseModel):
    player_id: str
    media_asset_id: Optional[str] = None
    session_name: str = Field(..., max_length=200)
    assessment_type: AssessmentType = AssessmentType.BATTING_TECHNIQUE
    assessment_date: Optional[date] = None
    is_synthetic: bool = False


class AssessmentUpdate(BaseModel):
    session_name: Optional[str] = Field(None, max_length=200)
    scout_summary: Optional[str] = None
    overall_provisional_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    status: Optional[AssessmentStatus] = None


class AssessmentResponse(BaseModel):
    id: str
    player_id: str
    media_asset_id: Optional[str] = None
    session_name: str
    assessment_type: AssessmentType
    status: AssessmentStatus
    assessment_date: date
    execution_duration_sec: Optional[float] = None
    overall_provisional_score: Optional[float] = None
    confidence_score: Optional[float] = None
    scout_summary: Optional[str] = None
    is_synthetic: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentDetailResponse(AssessmentResponse):
    player: Optional[PlayerProfileResponse] = None
    media_asset: Optional[MediaAssetResponse] = None
    metrics: List[PerformanceMetricResponse] = []
    cv_results: List[ComputerVisionResultResponse] = []
    evaluations: List[ScoutEvaluationResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentProcessRequest(BaseModel):
    model_identifier: Optional[str] = "cricket-kinematics-v1"
    force_reprocess: bool = False
    custom_fps: Optional[float] = None


class AssessmentProcessResponse(BaseModel):
    assessment_id: str
    status: AssessmentStatus
    message: str
    execution_duration_sec: float
    metrics_generated: int
    frames_analyzed: int
    overall_score: Optional[float] = None
