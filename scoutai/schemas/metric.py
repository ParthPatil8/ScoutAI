from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from scoutai.models.enums import MetricCategory, MetricOrigin


class PerformanceMetricBase(BaseModel):
    metric_name: str = Field(..., max_length=100)
    category: MetricCategory = MetricCategory.BATTING
    value: float
    unit: str = Field(..., max_length=40)
    benchmark_percentile: Optional[float] = Field(None, ge=0.0, le=100.0)
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    origin: MetricOrigin = MetricOrigin.MODEL_ESTIMATED
    is_provisional: bool = True
    methodology: Optional[str] = None
    interpretation: Optional[str] = None


class PerformanceMetricCreate(PerformanceMetricBase):
    assessment_session_id: str
    player_id: str


class PerformanceMetricResponse(PerformanceMetricBase):
    id: str
    assessment_session_id: str
    player_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
