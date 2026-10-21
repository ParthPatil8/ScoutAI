import {
  PlayerProfile,
  AssessmentSession,
  ScoutEvaluation,
  PlayerBenchmark,
  DatasetSource,
  MLModel,
  PlayerComparisonResponse
} from '../types';

export const DEMO_PLAYERS: PlayerProfile[] = [
  {
    id: 'p-arjun-verma',
    first_name: 'Arjun',
    last_name: 'Verma',
    display_name: 'Arjun Verma',
    date_of_birth: '2005-04-18',
    primary_role: 'BATSMAN',
    secondary_role: null,
    batting_hand: 'RIGHT_HAND',
    bowling_style: 'RIGHT_ARM_OFF_SPIN',
    height_cm: 178,
    weight_kg: 71,
    nationality: 'India',
    current_team: 'National Cricket Academy U-19',
    scout_notes: 'High-potential classical stroke player. Clean bat swing arc through the off-side. Exemplary head alignment over front knee at impact.',
    is_synthetic: true,
    created_at: '2026-07-15T10:00:00Z',
    updated_at: '2026-10-10T14:30:00Z',
    latest_score: 87.0,
    assessment_count: 2,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-kabir-khan',
    first_name: 'Kabir',
    last_name: 'Khan',
    display_name: 'Kabir Khan',
    date_of_birth: '2004-08-22',
    primary_role: 'BOWLER',
    secondary_role: null,
    batting_hand: 'RIGHT_HAND',
    bowling_style: 'RIGHT_ARM_FAST',
    height_cm: 188,
    weight_kg: 80,
    nationality: 'India',
    current_team: 'Delhi Colts State Academy',
    scout_notes: 'Express pace prospect (138-142 km/h). Strong front-knee brace (172.5 deg) creating rigid kinetic lever. Delivery elbow extension 10.4 deg (fully ICC compliant).',
    is_synthetic: true,
    created_at: '2026-08-01T11:00:00Z',
    updated_at: '2026-10-02T16:45:00Z',
    latest_score: 89.5,
    assessment_count: 1,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-devendra-patel',
    first_name: 'Devendra',
    last_name: 'Patel',
    display_name: 'Devendra Patel',
    date_of_birth: '2006-01-10',
    primary_role: 'ALL_ROUNDER',
    secondary_role: 'BOWLER',
    batting_hand: 'LEFT_HAND',
    bowling_style: 'LEFT_ARM_ORTHODOX',
    height_cm: 174,
    weight_kg: 68,
    nationality: 'India',
    current_team: 'Gujarat U-19 Development Pool',
    scout_notes: 'Disciplined finger spinner and aggressive lower-middle order batsman. Rapid hand speed in downswing; shows exceptional hip torque rotation.',
    is_synthetic: true,
    created_at: '2026-08-15T09:30:00Z',
    updated_at: '2026-09-28T12:00:00Z',
    latest_score: 78.4,
    assessment_count: 1,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-rohan-iyer',
    first_name: 'Rohan',
    last_name: 'Iyer',
    display_name: 'Rohan Iyer',
    date_of_birth: '2005-11-04',
    primary_role: 'WICKET_KEEPER',
    secondary_role: 'BATSMAN',
    batting_hand: 'RIGHT_HAND',
    bowling_style: 'NONE',
    height_cm: 176,
    weight_kg: 70,
    nationality: 'India',
    current_team: 'Karnataka Colts',
    scout_notes: 'Agile gloveman with sub-220ms lateral reaction time. Crisp back-foot punch technique and stable center of gravity during crouch stance.',
    is_synthetic: true,
    created_at: '2026-09-01T14:15:00Z',
    updated_at: '2026-10-12T09:20:00Z',
    latest_score: 82.0,
    assessment_count: 1,
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-sameer-deshmukh',
    first_name: 'Sameer',
    last_name: 'Deshmukh',
    display_name: 'Sameer Deshmukh',
    date_of_birth: '2006-06-19',
    primary_role: 'BOWLER',
    secondary_role: null,
    batting_hand: 'RIGHT_HAND',
    bowling_style: 'RIGHT_ARM_LEG_SPIN',
    height_cm: 180,
    weight_kg: 72,
    nationality: 'India',
    current_team: 'Maharashtra Academy',
    scout_notes: 'Attacking wrist-spinner with high rev rate (2150 RPM). Good pivot over front hip with 28 deg shoulder counter-rotation.',
    is_synthetic: true,
    created_at: '2026-09-10T15:00:00Z',
    updated_at: '2026-10-08T18:10:00Z',
    latest_score: 84.5,
    assessment_count: 1,
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  }
];

export const DEMO_ASSESSMENTS: AssessmentSession[] = [
  {
    id: 'a-arjun-baseline',
    player_id: 'p-arjun-verma',
    session_name: 'Arjun Verma - Off-Side Technique Baseline',
    assessment_type: 'BATTING_TECHNIQUE',
    status: 'COMPLETED',
    assessment_date: '2026-07-16',
    execution_duration_sec: 1.45,
    overall_provisional_score: 71.5,
    confidence_score: 0.90,
    scout_summary: 'Baseline assessment: Shows good intent but tends to under-stride on front foot drives (0.61 ratio), causing slight head tilt away from delivery line.',
    is_synthetic: true,
    created_at: '2026-07-16T10:30:00Z',
    updated_at: '2026-07-16T10:35:00Z',
    metrics: [
      {
        id: 'm-1',
        assessment_session_id: 'a-arjun-baseline',
        player_id: 'p-arjun-verma',
        metric_name: 'front_knee_flexion_angle',
        category: 'BATTING',
        value: 128.5,
        unit: 'deg',
        benchmark_percentile: 52.0,
        confidence: 0.90,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Sub-optimal knee bend causing elevated posture at impact.'
      },
      {
        id: 'm-2',
        assessment_session_id: 'a-arjun-baseline',
        player_id: 'p-arjun-verma',
        metric_name: 'front_foot_stride_ratio',
        category: 'BATTING',
        value: 0.61,
        unit: 'ratio',
        benchmark_percentile: 42.0,
        confidence: 0.88,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Under-striding on full deliveries, restricting forward weight transfer.'
      },
      {
        id: 'm-3',
        assessment_session_id: 'a-arjun-baseline',
        player_id: 'p-arjun-verma',
        metric_name: 'head_over_ball_alignment_score',
        category: 'BATTING',
        value: 0.72,
        unit: 'score_0_to_1',
        benchmark_percentile: 68.0,
        confidence: 0.85,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Head slightly behind vertical plane at contact.'
      },
      {
        id: 'm-4',
        assessment_session_id: 'a-arjun-baseline',
        player_id: 'p-arjun-verma',
        metric_name: 'backlift_angle',
        category: 'BATTING',
        value: 31.0,
        unit: 'deg',
        benchmark_percentile: 78.0,
        confidence: 0.89,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Sound backlift elevation arc.'
      }
    ],
    cv_results: [
      {
        id: 'cv-1',
        assessment_session_id: 'a-arjun-baseline',
        model_name: 'ScoutAI Cricket Kinematics Engine',
        model_version: '1.0.0',
        frames_analyzed: 105,
        fps_detected: 30.0,
        execution_time_sec: 1.45,
        created_at: '2026-07-16T10:32:00Z',
        detected_actions: [
          {
            id: 'act-1',
            action_category: 'BATTING_SHOT',
            action_label: 'COVER_DRIVE',
            start_frame: 10,
            end_frame: 95,
            confidence: 0.94,
            temporal_phases: {
              stance: [10, 25],
              backlift: [26, 48],
              impact: 58,
              follow_through: [59, 95]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'a-arjun-recent',
    player_id: 'p-arjun-verma',
    session_name: 'Arjun Verma - Quarterly Technique Progress Review',
    assessment_type: 'BATTING_TECHNIQUE',
    status: 'COMPLETED',
    assessment_date: '2026-10-09',
    execution_duration_sec: 1.52,
    overall_provisional_score: 87.0,
    confidence_score: 0.92,
    scout_summary: 'Significant improvement: Stride ratio expanded from 0.61 to 0.77 (+26%), head firmly locked over front knee at contact (0.91 score). Cleanest off-side drive arc in cohort.',
    is_synthetic: true,
    created_at: '2026-10-09T14:00:00Z',
    updated_at: '2026-10-09T14:05:00Z',
    metrics: [
      {
        id: 'm-5',
        assessment_session_id: 'a-arjun-recent',
        player_id: 'p-arjun-verma',
        metric_name: 'front_knee_flexion_angle',
        category: 'BATTING',
        value: 142.0,
        unit: 'deg',
        benchmark_percentile: 88.0,
        confidence: 0.92,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Optimal lead knee flex (142°); stable low center of gravity at impact.'
      },
      {
        id: 'm-6',
        assessment_session_id: 'a-arjun-recent',
        player_id: 'p-arjun-verma',
        metric_name: 'front_foot_stride_ratio',
        category: 'BATTING',
        value: 0.77,
        unit: 'ratio',
        benchmark_percentile: 86.0,
        confidence: 0.91,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Well-balanced stride length providing reach and fluid weight transfer.'
      },
      {
        id: 'm-7',
        assessment_session_id: 'a-arjun-recent',
        player_id: 'p-arjun-verma',
        metric_name: 'head_over_ball_alignment_score',
        category: 'BATTING',
        value: 0.91,
        unit: 'score_0_to_1',
        benchmark_percentile: 92.0,
        confidence: 0.90,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Eyes level directly above impact point. Minimal lateral head leakage.'
      },
      {
        id: 'm-8',
        assessment_session_id: 'a-arjun-recent',
        player_id: 'p-arjun-verma',
        metric_name: 'backlift_angle',
        category: 'BATTING',
        value: 36.5,
        unit: 'deg',
        benchmark_percentile: 84.0,
        confidence: 0.89,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Fluid downswing plane through fourth stump channel.'
      },
      {
        id: 'm-9',
        assessment_session_id: 'a-arjun-recent',
        player_id: 'p-arjun-verma',
        metric_name: 'downswing_angular_velocity_proxy',
        category: 'BATTING',
        value: 4.8,
        unit: 'units_per_sec',
        benchmark_percentile: 85.0,
        confidence: 0.86,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Sharp bat acceleration initiated from trigger foot plant.'
      }
    ],
    cv_results: [
      {
        id: 'cv-2',
        assessment_session_id: 'a-arjun-recent',
        model_name: 'ScoutAI Cricket Kinematics Engine',
        model_version: '1.0.0',
        frames_analyzed: 114,
        fps_detected: 30.0,
        execution_time_sec: 1.52,
        created_at: '2026-10-09T14:02:00Z',
        detected_actions: [
          {
            id: 'act-2',
            action_category: 'BATTING_SHOT',
            action_label: 'COVER_DRIVE',
            start_frame: 12,
            end_frame: 104,
            confidence: 0.96,
            temporal_phases: {
              stance: [12, 28],
              backlift: [29, 52],
              impact: 64,
              follow_through: [65, 104]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'a-kabir-bowling',
    player_id: 'p-kabir-khan',
    session_name: 'Kabir Khan - Pace Bowling Biomechanics & Action Legality',
    assessment_type: 'BOWLING_BIOMECHANICS',
    status: 'COMPLETED',
    assessment_date: '2026-10-02',
    execution_duration_sec: 1.65,
    overall_provisional_score: 89.5,
    confidence_score: 0.91,
    scout_summary: 'Solid fast bowling mechanics. Lead knee brace is 172.5 deg (elite pace leverage), delivery elbow extension 10.4 deg (fully compliant below ICC 15-deg threshold).',
    is_synthetic: true,
    created_at: '2026-10-02T16:00:00Z',
    updated_at: '2026-10-02T16:05:00Z',
    metrics: [
      {
        id: 'm-10',
        assessment_session_id: 'a-kabir-bowling',
        player_id: 'p-kabir-khan',
        metric_name: 'front_knee_brace_angle',
        category: 'BOWLING',
        value: 172.5,
        unit: 'deg',
        benchmark_percentile: 91.0,
        confidence: 0.91,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Elite lead leg brace creating clean lever for upper body deceleration and ball release.'
      },
      {
        id: 'm-11',
        assessment_session_id: 'a-kabir-bowling',
        player_id: 'p-kabir-khan',
        metric_name: 'bowling_elbow_extension_angle',
        category: 'BOWLING',
        value: 10.4,
        unit: 'deg',
        benchmark_percentile: 88.0,
        confidence: 0.91,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Compliant delivery action: safely below 15.0 degree ICC legal threshold.'
      },
      {
        id: 'm-12',
        assessment_session_id: 'a-kabir-bowling',
        player_id: 'p-kabir-khan',
        metric_name: 'shoulder_counter_rotation',
        category: 'BOWLING',
        value: 31.0,
        unit: 'deg',
        benchmark_percentile: 82.0,
        confidence: 0.88,
        origin: 'SYNTHETIC_DEMO',
        is_provisional: true,
        interpretation: 'Controlled thoracic counter-rotation within safe spinal load parameters.'
      }
    ]
  }
];

export const DEMO_EVALUATIONS: ScoutEvaluation[] = [
  {
    id: 'eval-1',
    player_id: 'p-arjun-verma',
    assessment_session_id: 'a-arjun-recent',
    evaluator_name: 'R. Sridhar (Senior National Scout)',
    evaluator_organization: 'BCCI Talent Identification Wing',
    evaluation_date: '2026-10-09',
    technical_rating: 8.8,
    tactical_rating: 8.2,
    physical_rating: 8.5,
    mental_rating: 8.0,
    overall_rating: 8.4,
    scout_recommendation: 'SHORTLIST',
    strengths: 'Clean front-foot presentation, exceptional balance at point of impact, high boundary conversion through covers.',
    development_areas: 'Back-foot punch against express short-pitched bowling requires higher backlift cocking.',
    detailed_notes: 'Candidate shows elite trajectory from baseline to recent assessment. Stride ratio expanded by 26%. Strongly recommend for Zonal High Performance Camp.',
    is_synthetic: true,
    created_at: '2026-10-09T15:00:00Z'
  },
  {
    id: 'eval-2',
    player_id: 'p-kabir-khan',
    assessment_session_id: 'a-kabir-bowling',
    evaluator_name: 'Bharat Arun (Bowling Specialist Consultant)',
    evaluator_organization: 'National Pace Foundation',
    evaluation_date: '2026-10-04',
    technical_rating: 9.0,
    tactical_rating: 7.8,
    physical_rating: 9.2,
    mental_rating: 8.2,
    overall_rating: 8.6,
    scout_recommendation: 'ACADEMY_SELECT',
    strengths: 'Textbook front-knee bracing (172.5°), generates steep bounce from good length, repeatably clean legal arm extension.',
    development_areas: 'Wrist seam position consistency on older ball; needs slight work on follow-through deceleration path.',
    detailed_notes: 'One of the cleanest fast-bowling biomechanical actions in the current U-19 cohort. Prime candidate for specialized fast bowling camp.',
    is_synthetic: true,
    created_at: '2026-10-04T12:00:00Z'
  }
];

export const DEMO_BENCHMARKS: PlayerBenchmark[] = [
  {
    id: 'b-1',
    role: 'BATSMAN',
    level: 'ACADEMY',
    metric_name: 'front_knee_flexion_angle',
    p10: 125.0,
    p25: 132.0,
    p50: 142.0,
    p75: 148.0,
    p90: 154.0,
    unit: 'deg',
    sample_size: 150,
    description: 'Lead knee bend at impact for front foot drives'
  },
  {
    id: 'b-2',
    role: 'BATSMAN',
    level: 'ACADEMY',
    metric_name: 'front_foot_stride_ratio',
    p10: 0.58,
    p25: 0.66,
    p50: 0.74,
    p75: 0.82,
    p90: 0.88,
    unit: 'ratio',
    sample_size: 150,
    description: 'Ankle separation divided by shoulder-height proxy'
  },
  {
    id: 'b-3',
    role: 'BATSMAN',
    level: 'ACADEMY',
    metric_name: 'head_over_ball_alignment_score',
    p10: 0.60,
    p25: 0.72,
    p50: 0.85,
    p75: 0.92,
    p90: 0.96,
    unit: 'score_0_to_1',
    sample_size: 150,
    description: 'Alignment of head vertex over front knee at contact'
  },
  {
    id: 'b-4',
    role: 'BATSMAN',
    level: 'ACADEMY',
    metric_name: 'backlift_angle',
    p10: 22.0,
    p25: 28.0,
    p50: 35.0,
    p75: 42.0,
    p90: 48.0,
    unit: 'deg',
    sample_size: 150,
    description: 'Top-hand backswing elevation angle'
  },
  {
    id: 'b-5',
    role: 'BOWLER',
    level: 'ACADEMY',
    metric_name: 'front_knee_brace_angle',
    p10: 145.0,
    p25: 158.0,
    p50: 168.0,
    p75: 174.0,
    p90: 178.0,
    unit: 'deg',
    sample_size: 150,
    description: 'Lead leg extension angle at front foot contact'
  },
  {
    id: 'b-6',
    role: 'BOWLER',
    level: 'ACADEMY',
    metric_name: 'bowling_elbow_extension_angle',
    p10: 6.0,
    p25: 8.5,
    p50: 10.8,
    p75: 13.2,
    p90: 14.8,
    unit: 'deg',
    sample_size: 150,
    description: 'Elbow extension deviation (ICC legality limit < 15.0 deg)'
  },
  {
    id: 'b-7',
    role: 'BOWLER',
    level: 'ACADEMY',
    metric_name: 'shoulder_counter_rotation',
    p10: 18.0,
    p25: 24.0,
    p50: 30.0,
    p75: 36.0,
    p90: 42.0,
    unit: 'deg',
    sample_size: 150,
    description: 'Thoracic rotation angle at delivery release'
  }
];

export const DEMO_DATASETS: DatasetSource[] = [
  {
    id: 'ds-cricshot10',
    slug: 'cricshot10',
    name: 'CricShot10',
    description: 'Fine-grained cricket video dataset classifying 10 distinctive batting shots: Drive, Leg Glance, Pull, Sweep, Flick, Cut, Scoop, Defense, Hook, Lofted.',
    paper_citation: 'Sen et al., CricShot10: A Fine-Grained Dataset for Cricket Batting Shot Recognition in Broadcast Video, Pattern Recognition Letters, 2021.',
    license_type: 'Research Use Only',
    is_official_candidate: true,
    created_at: '2026-06-01T00:00:00Z',
    total_samples: 10
  },
  {
    id: 'ds-uj-aqa',
    slug: 'uj-aqa-cricketvision',
    name: 'UJ-AQA-CricketVision',
    description: 'Provides fine-grained action quality assessment annotations for cricket actions, including batting shots, bowling deliveries, and technical error scoring.',
    paper_citation: 'University of Johannesburg AQA Team, CricketVision: A Multi-Task Action Quality Assessment Dataset for Cricket Technique Evaluation, 2023.',
    license_type: 'Research Non-Commercial (CC BY-NC 4.0)',
    is_official_candidate: true,
    created_at: '2026-06-01T00:00:00Z',
    total_samples: 3
  },
  {
    id: 'ds-cricpose360',
    slug: 'cricpose360',
    name: 'CricPose360',
    description: 'Multi-view synchronized 3D human pose dataset featuring synchronized multi-camera views, 2D/3D skeletal keypoint annotations, joint angles, and temporal action phases.',
    paper_citation: 'CricPose360 Consortium, CricPose360: A Multi-View Synchronized 3D Human Pose Dataset for Cricket Biomechanics, CVPRW, 2023.',
    license_type: 'Academic Research License (CC BY 4.0)',
    is_official_candidate: true,
    created_at: '2026-06-01T00:00:00Z',
    total_samples: 2
  },
  {
    id: 'ds-ipl-shots',
    slug: 'cricket-batting-shots-ipl',
    name: 'Cricket Batting Shots & IPL Broadcast Clips',
    description: 'Broadcast video dataset containing labeled batting strokes from competitive cricket (including IPL and T20 fixtures) annotated with batsman, bowler, shot type, and outcome.',
    paper_citation: 'Cricket Vision Analytics Group, Fine-Grained Action and Stroke Recognition in Broadcast Cricket Video Streams, Sports Analytics Workshop, 2022.',
    license_type: 'Fair Use for Educational Research',
    is_official_candidate: true,
    created_at: '2026-06-01T00:00:00Z',
    total_samples: 5
  },
  {
    id: 'ds-public-stats',
    slug: 'cricket-public-stats',
    name: 'Public Cricket Performance Statistics',
    description: 'Historical and tournament career metrics for professional, domestic, and youth cricketers. Used to contextualize computer vision biomechanical metrics with statistical match outcomes.',
    paper_citation: 'ESPNcricinfo & Kaggle Open Cricket Archive, Aggregated Multi-Format Player Career and Delivery-by-Delivery Metrics, 2023.',
    license_type: 'Public Domain / Open Data',
    is_official_candidate: true,
    created_at: '2026-06-01T00:00:00Z',
    total_samples: 6
  }
];

export const DEMO_MODELS: MLModel[] = [
  {
    id: 'm-kinematics-1',
    model_identifier: 'cricket-kinematics-v1',
    name: 'ScoutAI Cricket Kinematics & Pose Analyzer',
    task_type: 'BIOMECHANICAL_ANALYSIS',
    version: '1.0.0',
    architecture: 'OpenCV-Kinematics-2DVector-JointAngle',
    framework: 'OpenCV / NumPy',
    license: 'Apache-2.0',
    is_active: true
  },
  {
    id: 'm-resnet-1',
    model_identifier: 'cricshot10-classifier-resnet',
    name: 'CricShot10 Batting Stroke Classifier',
    task_type: 'ACTION_RECOGNITION',
    version: '1.2.0',
    architecture: 'ResNet50-3D-Temporal',
    framework: 'PyTorch',
    license: 'Research Only',
    is_active: true
  }
];

export function generateDemoComparison(
  player1: PlayerProfile,
  player2?: PlayerProfile | null
): PlayerComparisonResponse {
  const isBowler = player1.primary_role === 'BOWLER';
  const targetName = player2 ? player2.display_name : 'Academy Benchmark Median';

  const metrics = isBowler
    ? [
        {
          metric_name: 'front_knee_brace_angle',
          category: 'BOWLING',
          unit: 'deg',
          player_value: 172.5,
          target_value: player2 ? 165.0 : 168.0,
          benchmark_median: 168.0,
          percentile_rank: 91.0,
          gap: player2 ? 7.5 : 4.5,
          status: 'ELITE' as const
        },
        {
          metric_name: 'bowling_elbow_extension_angle',
          category: 'BOWLING',
          unit: 'deg',
          player_value: 10.4,
          target_value: player2 ? 12.1 : 10.8,
          benchmark_median: 10.8,
          percentile_rank: 88.0,
          gap: player2 ? -1.7 : -0.4,
          status: 'ELITE' as const
        },
        {
          metric_name: 'shoulder_counter_rotation',
          category: 'BOWLING',
          unit: 'deg',
          player_value: 31.0,
          target_value: player2 ? 26.5 : 30.0,
          benchmark_median: 30.0,
          percentile_rank: 82.0,
          gap: player2 ? 4.5 : 1.0,
          status: 'ABOVE_AVERAGE' as const
        }
      ]
    : [
        {
          metric_name: 'front_knee_flexion_angle',
          category: 'BATTING',
          unit: 'deg',
          player_value: 142.0,
          target_value: player2 ? 134.0 : 142.0,
          benchmark_median: 142.0,
          percentile_rank: 88.0,
          gap: player2 ? 8.0 : 0.0,
          status: 'ELITE' as const
        },
        {
          metric_name: 'front_foot_stride_ratio',
          category: 'BATTING',
          unit: 'ratio',
          player_value: 0.77,
          target_value: player2 ? 0.65 : 0.74,
          benchmark_median: 0.74,
          percentile_rank: 86.0,
          gap: player2 ? 0.12 : 0.03,
          status: 'ABOVE_AVERAGE' as const
        },
        {
          metric_name: 'head_over_ball_alignment_score',
          category: 'BATTING',
          unit: 'score_0_to_1',
          player_value: 0.91,
          target_value: player2 ? 0.75 : 0.85,
          benchmark_median: 0.85,
          percentile_rank: 92.0,
          gap: player2 ? 0.16 : 0.06,
          status: 'ELITE' as const
        },
        {
          metric_name: 'backlift_angle',
          category: 'BATTING',
          unit: 'deg',
          player_value: 36.5,
          target_value: player2 ? 29.0 : 35.0,
          benchmark_median: 35.0,
          percentile_rank: 84.0,
          gap: player2 ? 7.5 : 1.5,
          status: 'ABOVE_AVERAGE' as const
        }
      ];

  return {
    primary_player: {
      id: player1.id,
      name: player1.display_name,
      role: player1.primary_role
    },
    comparison_target: {
      type: player2 ? 'PLAYER' : 'BENCHMARK',
      name: targetName
    },
    compared_at: new Date().toISOString(),
    metrics,
    scout_verdict: `${player1.display_name} demonstrates superior technical stability (+${(metrics.reduce((acc, m) => acc + (m.gap || 0), 0) / metrics.length).toFixed(1)} unit aggregate advantage) across key biomechanical indicators compared to ${targetName}.`,
    coaching_priority_areas: isBowler
      ? ['Maintain front-foot brace stability in late spells', 'Monitor wrist seam presentation on older ball']
      : ['Maintain front-foot stride expansion', 'Refine back-foot cocking against short-pitched deliveries']
  };
}
