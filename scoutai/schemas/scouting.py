from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from scoutai.models.enums import ScoutRecommendation, BenchmarkLevel, CricketRole


class ScoutEvaluationBase(BaseModel):
    evaluator_name: str = Field(..., max_length=150)
    evaluator_organization: Optional[str] = Field(None, max_length=150)
    evaluation_date: Optional[date] = None
    technical_rating: float = Field(..., ge=1.0, le=10.0)
    tactical_rating: float = Field(..., ge=1.0, le=10.0)
    physical_rating: float = Field(..., ge=1.0, le=10.0)
    mental_rating: float = Field(..., ge=1.0, le=10.0)
    overall_rating: float = Field(..., ge=1.0, le=10.0)
    scout_recommendation: ScoutRecommendation = ScoutRecommendation.MONITOR
    strengths: Optional[str] = None
    development_areas: Optional[str] = None
    detailed_notes: Optional[str] = None
    is_synthetic: bool = False


class ScoutEvaluationCreate(ScoutEvaluationBase):
    player_id: str
    assessment_session_id: Optional[str] = None


class ScoutEvaluationResponse(ScoutEvaluationBase):
    id: str
    player_id: str
    assessment_session_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlayerBenchmarkResponse(BaseModel):
    id: str
    role: CricketRole
    level: BenchmarkLevel
    metric_name: str
    p10: float
    p25: float
    p50: float
    p75: float
    p90: float
    unit: str
    sample_size: int
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlayerComparisonRequest(BaseModel):
    player_id: str
    target_player_id: Optional[str] = None
    benchmark_level: Optional[BenchmarkLevel] = None


class ComparisonMetricItem(BaseModel):
    metric_name: str
    category: str
    unit: str
    player_value: float
    target_value: Optional[float] = None
    benchmark_median: Optional[float] = None
    percentile_rank: Optional[float] = None
    gap: Optional[float] = None
    status: str  # ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE, ELITE


class PlayerComparisonResponse(BaseModel):
    primary_player: Dict[str, Any]
    comparison_target: Dict[str, Any]
    compared_at: datetime
    metrics: List[ComparisonMetricItem]
    scout_verdict: str
    coaching_priority_areas: List[str]
