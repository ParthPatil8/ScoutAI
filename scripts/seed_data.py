import sys
from pathlib import Path
from datetime import date, datetime, timedelta

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from scoutai.database import Base, SessionLocal, engine
from scoutai.config import settings
from scoutai.models.enums import (
    CricketRole,
    BattingHand,
    BowlingStyle,
    AssessmentType,
    AssessmentStatus,
    MetricCategory,
    MetricOrigin,
    ScoutRecommendation,
    BenchmarkLevel,
    MediaProcessingStatus,
)
from scoutai.models.player import PlayerProfile
from scoutai.models.media import MediaAsset, ClipSegment
from scoutai.models.assessment import AssessmentSession
from scoutai.models.cv_result import (
    ComputerVisionResult,
    PoseEstimationResult,
    DetectedAction,
    BiomechanicalFeature,
)
from scoutai.models.metric import PerformanceMetric
from scoutai.models.scouting import ScoutEvaluation, PlayerBenchmark
from scoutai.models.model_registry import MLModelRegistry
from scoutai.services.dataset_service import DatasetService


def seed_benchmarks(db):
    print("Seeding role-specific benchmarks...")
    benchmarks_data = [
        # Batting Academy
        (CricketRole.BATSMAN, BenchmarkLevel.ACADEMY, "front_knee_flexion_angle", 125.0, 132.0, 142.0, 148.0, 154.0, "deg", "Lead knee bend at impact for front foot drives"),
        (CricketRole.BATSMAN, BenchmarkLevel.ACADEMY, "front_foot_stride_ratio", 0.58, 0.66, 0.74, 0.82, 0.88, "ratio", "Ankle separation divided by shoulder-height proxy"),
        (CricketRole.BATSMAN, BenchmarkLevel.ACADEMY, "head_over_ball_alignment_score", 0.60, 0.72, 0.85, 0.92, 0.96, "score_0_to_1", "Alignment of head vertex over front knee at contact"),
        (CricketRole.BATSMAN, BenchmarkLevel.ACADEMY, "backlift_angle", 22.0, 28.0, 35.0, 42.0, 48.0, "deg", "Top-hand backswing elevation angle"),
        # Bowling Academy
        (CricketRole.BOWLER, BenchmarkLevel.ACADEMY, "front_knee_brace_angle", 145.0, 158.0, 168.0, 174.0, 178.0, "deg", "Lead leg extension angle at front foot contact"),
        (CricketRole.BOWLER, BenchmarkLevel.ACADEMY, "bowling_elbow_extension_angle", 6.0, 8.5, 10.8, 13.2, 14.8, "deg", "Elbow extension deviation (ICC legality limit < 15.0 deg)"),
        (CricketRole.BOWLER, BenchmarkLevel.ACADEMY, "shoulder_counter_rotation", 18.0, 24.0, 30.0, 36.0, 42.0, "deg", "Thoracic rotation angle at delivery release"),
        # Fielding / Keeper
        (CricketRole.WICKET_KEEPER, BenchmarkLevel.ACADEMY, "reaction_time_ms", 320.0, 280.0, 240.0, 210.0, 185.0, "ms", "First movement latency upon ball off bat"),
    ]

    for role, level, name, p10, p25, p50, p75, p90, unit, desc in benchmarks_data:
        exists = db.query(PlayerBenchmark).filter_by(role=role, level=level, metric_name=name).first()
        if not exists:
            db.add(
                PlayerBenchmark(
                    role=role,
                    level=level,
                    metric_name=name,
                    p10=p10,
                    p25=p25,
                    p50=p50,
                    p75=p75,
                    p90=p90,
                    unit=unit,
                    sample_size=150,
                    description=desc,
                )
            )
    db.commit()


def seed_ml_models(db):
    print("Seeding ML model registry...")
    models = [
        MLModelRegistry(
            model_identifier="cricket-kinematics-v1",
            name="ScoutAI Cricket Kinematics & Pose Analyzer",
            task_type="BIOMECHANICAL_ANALYSIS",
            version="1.0.0",
            architecture="OpenCV-Kinematics-2DVector-JointAngle",
            framework="OpenCV/NumPy",
            license="Apache-2.0",
            is_active=True,
            input_spec={"media_type": "video/mp4", "min_resolution": "1280x720", "min_fps": 30.0},
            output_spec={"joint_angles": ["front_knee_flexion", "backlift_angle", "elbow_extension"], "provisional_score": "0-100"},
        ),
        MLModelRegistry(
            model_identifier="cricshot10-classifier-resnet",
            name="CricShot10 Batting Stroke Classifier",
            task_type="ACTION_RECOGNITION",
            version="1.2.0",
            architecture="ResNet50-3D-Temporal",
            framework="PyTorch",
            license="Research Only",
            is_active=True,
            input_spec={"frames": 16, "resolution": "224x224"},
            output_spec={"classes": 10, "top_k": 3},
        ),
    ]
    for m in models:
        exists = db.query(MLModelRegistry).filter_by(model_identifier=m.model_identifier).first()
        if not exists:
            db.add(m)
    db.commit()


def seed_datasets(db):
    print("Importing sample cricket datasets...")
    samples_dir = root_dir / "scripts" / "sample_data"
    
    datasets_to_import = [
        ("cricshot10", samples_dir / "cricshot10_sample.csv"),
        ("uj-aqa-cricketvision", samples_dir / "uj_aqa_sample.json"),
        ("cricpose360", samples_dir / "cricpose360_sample.json"),
        ("cricket-batting-shots-ipl", samples_dir / "batting_shots_sample.csv"),
        ("cricket-public-stats", samples_dir / "cricket_stats_sample.csv"),
    ]

    for slug, path in datasets_to_import:
        if path.exists():
            try:
                DatasetService.run_import(db, importer_slug=slug, source_path=str(path), version_tag="v1.0", is_synthetic=True)
                print(f"  [OK] Ingested sample dataset: {slug}")
            except Exception as e:
                print(f"  [WARN] Failed to import sample {slug}: {e}")


def seed_synthetic_players_and_assessments(db):
    print("Seeding synthetic cricketers, assessments, and scout reviews...")

    # Player 1: Arjun Verma (Top Order Batsman)
    arjun = db.query(PlayerProfile).filter_by(display_name="Arjun Verma (Synthetic)").first()
    if not arjun:
        arjun = PlayerProfile(
            first_name="Arjun",
            last_name="Verma",
            display_name="Arjun Verma (Synthetic)",
            date_of_birth=date(2005, 4, 18),
            primary_role=CricketRole.BATSMAN,
            secondary_role=None,
            batting_hand=BattingHand.RIGHT_HAND,
            bowling_style=BowlingStyle.RIGHT_ARM_OFF_SPIN,
            height_cm=178.0,
            weight_kg=71.0,
            nationality="India",
            current_team="National Cricket Academy U-19",
            scout_notes="High-potential classical stroke player. Clean bat swing arc through the off-side.",
            is_synthetic=True,
        )
        db.add(arjun)
        db.flush()

    # Player 2: Kabir Khan (Fast Bowler)
    kabir = db.query(PlayerProfile).filter_by(display_name="Kabir Khan (Synthetic)").first()
    if not kabir:
        kabir = PlayerProfile(
            first_name="Kabir",
            last_name="Khan",
            display_name="Kabir Khan (Synthetic)",
            date_of_birth=date(2004, 8, 22),
            primary_role=CricketRole.BOWLER,
            secondary_role=None,
            batting_hand=BattingHand.RIGHT_HAND,
            bowling_style=BowlingStyle.RIGHT_ARM_FAST,
            height_cm=188.0,
            weight_kg=80.0,
            nationality="India",
            current_team="Delhi Colts State Academy",
            scout_notes="Express pace prospect (138-142 km/h). Strong front-knee brace at crease contact.",
            is_synthetic=True,
        )
        db.add(kabir)
        db.flush()

    # Player 3: Devendra Patel (Spin All-Rounder)
    devendra = db.query(PlayerProfile).filter_by(display_name="Devendra Patel (Synthetic)").first()
    if not devendra:
        devendra = PlayerProfile(
            first_name="Devendra",
            last_name="Patel",
            display_name="Devendra Patel (Synthetic)",
            date_of_birth=date(2006, 1, 10),
            primary_role=CricketRole.ALL_ROUNDER,
            secondary_role=CricketRole.BOWLER,
            batting_hand=BattingHand.LEFT_HAND,
            bowling_style=BowlingStyle.LEFT_ARM_ORTHODOX,
            height_cm=174.0,
            weight_kg=68.0,
            nationality="India",
            current_team="Gujarat U-19 Development Pool",
            scout_notes="Disciplined finger spinner and attacking lower-middle order batsman.",
            is_synthetic=True,
        )
        db.add(devendra)
        db.flush()

    # Media assets for Arjun
    media_arjun_1 = MediaAsset(
        original_filename="arjun_verma_baseline_nets.mp4",
        file_path="storage/videos/arjun_verma_baseline.mp4",
        file_size_bytes=14200000,
        mime_type="video/mp4",
        duration_sec=3.5,
        fps=30.0,
        frame_count=105,
        width=1920,
        height=1080,
        checksum_sha256="synth_sha256_arjun_baseline_001",
        storage_provider="LOCAL",
        processing_status=MediaProcessingStatus.COMPLETED,
        is_synthetic=True,
    )
    media_arjun_2 = MediaAsset(
        original_filename="arjun_verma_progress_evaluation.mp4",
        file_path="storage/videos/arjun_verma_progress.mp4",
        file_size_bytes=15800000,
        mime_type="video/mp4",
        duration_sec=3.8,
        fps=30.0,
        frame_count=114,
        width=1920,
        height=1080,
        checksum_sha256="synth_sha256_arjun_progress_002",
        storage_provider="LOCAL",
        processing_status=MediaProcessingStatus.COMPLETED,
        is_synthetic=True,
    )
    db.add(media_arjun_1)
    db.add(media_arjun_2)
    db.flush()

    # Assessment 1 for Arjun (Baseline - 90 days ago)
    date_baseline = date.today() - timedelta(days=90)
    sess_1 = AssessmentSession(
        player_id=arjun.id,
        media_asset_id=media_arjun_1.id,
        session_name="Arjun Verma - Off-Side Technique Baseline",
        assessment_type=AssessmentType.BATTING_TECHNIQUE,
        status=AssessmentStatus.COMPLETED,
        assessment_date=date_baseline,
        execution_duration_sec=1.45,
        overall_provisional_score=71.5,
        confidence_score=0.90,
        scout_summary="Baseline assessment: Shows good intent but tends to under-stride on front foot drives, causing slight head tilt.",
        is_synthetic=True,
    )
    db.add(sess_1)
    db.flush()

    # Metrics for Assessment 1
    m1_list = [
        ("front_knee_flexion_angle", MetricCategory.BATTING, 128.5, "deg", 52.0, "Sub-optimal knee bend causing elevated posture"),
        ("front_foot_stride_ratio", MetricCategory.BATTING, 0.61, "ratio", 42.0, "Under-striding on full deliveries"),
        ("head_over_ball_alignment_score", MetricCategory.BATTING, 0.72, "score_0_to_1", 68.0, "Head slightly behind vertical plane at contact"),
        ("backlift_angle", MetricCategory.BATTING, 31.0, "deg", 78.0, "Sound backlift elevation arc"),
    ]
    for m_name, cat, val, unit, pct, interp in m1_list:
        db.add(
            PerformanceMetric(
                assessment_session_id=sess_1.id,
                player_id=arjun.id,
                metric_name=m_name,
                category=cat,
                value=val,
                unit=unit,
                benchmark_percentile=pct,
                confidence=0.90,
                origin=MetricOrigin.SYNTHETIC_DEMO,
                is_provisional=True,
                interpretation=interp,
            )
        )

    # Assessment 2 for Arjun (Follow-up - Recent)
    date_recent = date.today() - timedelta(days=5)
    sess_2 = AssessmentSession(
        player_id=arjun.id,
        media_asset_id=media_arjun_2.id,
        session_name="Arjun Verma - Quarterly Technique Progress Review",
        assessment_type=AssessmentType.BATTING_TECHNIQUE,
        status=AssessmentStatus.COMPLETED,
        assessment_date=date_recent,
        execution_duration_sec=1.52,
        overall_provisional_score=87.0,
        confidence_score=0.92,
        scout_summary="Significant improvement: Stride length expanded by 18%, head firmly positioned over front knee at contact.",
        is_synthetic=True,
    )
    db.add(sess_2)
    db.flush()

    # Metrics for Assessment 2
    m2_list = [
        ("front_knee_flexion_angle", MetricCategory.BATTING, 142.0, "deg", 88.0, "Optimal lead knee flex; stable low center of gravity"),
        ("front_foot_stride_ratio", MetricCategory.BATTING, 0.77, "ratio", 86.0, "Well-balanced stride length providing reach and weight transfer"),
        ("head_over_ball_alignment_score", MetricCategory.BATTING, 0.91, "score_0_to_1", 92.0, "Eyes level directly above impact point"),
        ("backlift_angle", MetricCategory.BATTING, 36.5, "deg", 84.0, "Fluid downswing plane through off-stump line"),
    ]
    for m_name, cat, val, unit, pct, interp in m2_list:
        db.add(
            PerformanceMetric(
                assessment_session_id=sess_2.id,
                player_id=arjun.id,
                metric_name=m_name,
                category=cat,
                value=val,
                unit=unit,
                benchmark_percentile=pct,
                confidence=0.92,
                origin=MetricOrigin.SYNTHETIC_DEMO,
                is_provisional=True,
                interpretation=interp,
            )
        )

    # Scout evaluation on Arjun's recent assessment
    eval_arjun = ScoutEvaluation(
        player_id=arjun.id,
        assessment_session_id=sess_2.id,
        evaluator_name="R. Sridhar (Senior National Scout)",
        evaluator_organization="BCCI Talent Identification Wing",
        evaluation_date=date_recent,
        technical_rating=8.8,
        tactical_rating=8.2,
        physical_rating=8.5,
        mental_rating=8.0,
        overall_rating=8.4,
        scout_recommendation=ScoutRecommendation.SHORTLIST,
        strengths="Clean front-foot presentation, exceptional balance at point of impact, high boundary conversion through covers.",
        development_areas="Back-foot punch against express short-pitched bowling requires higher backlift cocking.",
        detailed_notes="Candidate shows elite trajectory from baseline to recent assessment. Recommend for Zonal High Performance Camp.",
        is_synthetic=True,
    )
    db.add(eval_arjun)

    # Assessment for Kabir Khan (Bowling Biomechanics)
    sess_kabir = AssessmentSession(
        player_id=kabir.id,
        session_name="Kabir Khan - Pace Bowling Biomechanics & Action Legality",
        assessment_type=AssessmentType.BOWLING_BIOMECHANICS,
        status=AssessmentStatus.COMPLETED,
        assessment_date=date.today() - timedelta(days=12),
        execution_duration_sec=1.65,
        overall_provisional_score=89.5,
        confidence_score=0.91,
        scout_summary="Solid fast bowling mechanics. Lead knee brace is 172 deg (elite pace leverage), delivery elbow extension 10.4 deg (fully compliant).",
        is_synthetic=True,
    )
    db.add(sess_kabir)
    db.flush()

    m_kabir_list = [
        ("front_knee_brace_angle", MetricCategory.BOWLING, 172.5, "deg", 91.0, "Elite lead leg brace creating clean lever for arm acceleration"),
        ("bowling_elbow_extension_angle", MetricCategory.BOWLING, 10.4, "deg", 88.0, "Compliant delivery action: safely below 15-deg ICC legal limit"),
        ("shoulder_counter_rotation", MetricCategory.BOWLING, 31.0, "deg", 82.0, "Moderate counter-rotation within safe spinal load parameters"),
    ]
    for m_name, cat, val, unit, pct, interp in m_kabir_list:
        db.add(
            PerformanceMetric(
                assessment_session_id=sess_kabir.id,
                player_id=kabir.id,
                metric_name=m_name,
                category=cat,
                value=val,
                unit=unit,
                benchmark_percentile=pct,
                confidence=0.91,
                origin=MetricOrigin.SYNTHETIC_DEMO,
                is_provisional=True,
                interpretation=interp,
            )
        )

    eval_kabir = ScoutEvaluation(
        player_id=kabir.id,
        assessment_session_id=sess_kabir.id,
        evaluator_name="Bharat Arun (Bowling Specialist Consultant)",
        evaluator_organization="Pace Foundation",
        evaluation_date=date.today() - timedelta(days=10),
        technical_rating=9.0,
        tactical_rating=7.8,
        physical_rating=9.2,
        mental_rating=8.2,
        overall_rating=8.6,
        scout_recommendation=ScoutRecommendation.ACADEMY_SELECT,
        strengths="Textbook front-knee bracing, generates steep bounce from good length, repeatably clean legal arm extension.",
        development_areas="Wrist seam position consistency on older ball; needs slight work on follow-through deceleration.",
        detailed_notes="One of the cleanest fast-bowling biomechanical actions in the current U-19 cohort. Prime candidate for specialized fast bowling camp.",
        is_synthetic=True,
    )
    db.add(eval_kabir)

    db.commit()
    print("Synthetic players, assessments, metrics, and scouting reviews seeded successfully!")


def main():
    print(f"Connecting to ScoutAI database: {settings.DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_benchmarks(db)
        seed_ml_models(db)
        seed_datasets(db)
        seed_synthetic_players_and_assessments(db)
        print("Database initialization and seed complete!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
