export type CricketRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
export type BattingHand = 'RIGHT_HAND' | 'LEFT_HAND';
export type BowlingStyle = 
  | 'RIGHT_ARM_FAST'
  | 'RIGHT_ARM_FAST_MEDIUM'
  | 'RIGHT_ARM_MEDIUM'
  | 'RIGHT_ARM_OFF_SPIN'
  | 'RIGHT_ARM_LEG_SPIN'
  | 'LEFT_ARM_FAST'
  | 'LEFT_ARM_FAST_MEDIUM'
  | 'LEFT_ARM_ORTHODOX'
  | 'LEFT_ARM_WRIST_SPIN'
  | 'NONE';

export type AssessmentType = 
  | 'BATTING_TECHNIQUE'
  | 'BOWLING_BIOMECHANICS'
  | 'FIELDING_AGILITY'
  | 'COMPREHENSIVE';

export type AssessmentStatus = 'DRAFT' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type MetricCategory = 'BATTING' | 'BOWLING' | 'FIELDING' | 'FITNESS' | 'TACTICAL';

export type MetricOrigin = 
  | 'DIRECT_OBSERVATION'
  | 'AUTO_DETECTED'
  | 'MODEL_ESTIMATED'
  | 'MANUAL_EVALUATION'
  | 'SYNTHETIC_DEMO';

export type ScoutRecommendation = 
  | 'SHORTLIST'
  | 'ACADEMY_SELECT'
  | 'MONITOR'
  | 'DEVELOPMENT_POOL'
  | 'REJECT';

export type BenchmarkLevel = 'INTERNATIONAL' | 'FIRST_CLASS' | 'ACADEMY' | 'CLUB';

export interface PlayerProfile {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  date_of_birth?: string | null;
  primary_role: CricketRole;
  secondary_role?: CricketRole | null;
  batting_hand: BattingHand;
  bowling_style: BowlingStyle;
  height_cm?: number | null;
  weight_kg?: number | null;
  nationality: string;
  current_team?: string | null;
  scout_notes?: string | null;
  is_synthetic: boolean;
  created_at: string;
  updated_at: string;
  latest_score?: number;
  assessment_count?: number;
  avatar_url?: string;
}

export interface PerformanceMetric {
  id: string;
  assessment_session_id: string;
  player_id: string;
  metric_name: string;
  category: MetricCategory;
  value: number;
  unit: string;
  benchmark_percentile?: number | null;
  confidence: number;
  origin: MetricOrigin;
  is_provisional: boolean;
  methodology?: string | null;
  interpretation?: string | null;
  created_at?: string;
}

export interface PoseKeyframe {
  frame_number: number;
  timestamp_sec: number;
  keypoints: Record<string, [number, number, number]>; // [x, y, confidence]
  confidence: number;
}

export interface DetectedActionItem {
  id: string;
  action_category: string;
  action_label: string;
  start_frame: number;
  end_frame: number;
  confidence: number;
  temporal_phases?: Record<string, [number, number] | number>;
}

export interface ComputerVisionResult {
  id: string;
  assessment_session_id: string;
  media_asset_id?: string | null;
  model_name: string;
  model_version: string;
  frames_analyzed: number;
  fps_detected?: number | null;
  execution_time_sec?: number | null;
  created_at: string;
  detected_actions?: DetectedActionItem[];
}

export interface AssessmentSession {
  id: string;
  player_id: string;
  media_asset_id?: string | null;
  session_name: string;
  assessment_type: AssessmentType;
  status: AssessmentStatus;
  assessment_date: string;
  execution_duration_sec?: number | null;
  overall_provisional_score?: number | null;
  confidence_score?: number | null;
  scout_summary?: string | null;
  is_synthetic: boolean;
  created_at: string;
  updated_at: string;
  player?: PlayerProfile;
  metrics?: PerformanceMetric[];
  cv_results?: ComputerVisionResult[];
  evaluations?: ScoutEvaluation[];
}

export interface ScoutEvaluation {
  id: string;
  player_id: string;
  assessment_session_id?: string | null;
  evaluator_name: string;
  evaluator_organization?: string | null;
  evaluation_date: string;
  technical_rating: number;
  tactical_rating: number;
  physical_rating: number;
  mental_rating: number;
  overall_rating: number;
  scout_recommendation: ScoutRecommendation;
  strengths?: string | null;
  development_areas?: string | null;
  detailed_notes?: string | null;
  is_synthetic: boolean;
  created_at: string;
}

export interface PlayerBenchmark {
  id: string;
  role: CricketRole;
  level: BenchmarkLevel;
  metric_name: string;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  unit: string;
  sample_size: number;
  description?: string | null;
}

export interface ComparisonMetricItem {
  metric_name: string;
  category: string;
  unit: string;
  player_value: number;
  target_value?: number | null;
  benchmark_median?: number | null;
  percentile_rank?: number | null;
  gap?: number | null;
  status: 'ELITE' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';
}

export interface PlayerComparisonResponse {
  primary_player: {
    id: string;
    name: string;
    role: string;
  };
  comparison_target: {
    type: 'PLAYER' | 'BENCHMARK';
    name: string;
  };
  compared_at: string;
  metrics: ComparisonMetricItem[];
  scout_verdict: string;
  coaching_priority_areas: string[];
}

export interface DatasetSource {
  id: string;
  name: string;
  slug: string;
  description: string;
  website_url?: string | null;
  paper_citation?: string | null;
  license_type: string;
  is_official_candidate: boolean;
  created_at: string;
  total_samples?: number;
}

export interface MLModel {
  id: string;
  model_identifier: string;
  name: string;
  task_type: string;
  version: string;
  architecture: string;
  framework: string;
  license: string;
  is_active: boolean;
}

export type UserRole = 'SCOUT' | 'PLAYER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  organization?: string;
  playerId?: string;
  avatarUrl?: string;
}

