import sys
from pathlib import Path

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from scoutai.database import SessionLocal
from scoutai.models.player import PlayerProfile
from scoutai.models.enums import AssessmentType
from scoutai.schemas.assessment import AssessmentCreate
from scoutai.schemas.scouting import PlayerComparisonRequest
from scoutai.services.assessment_service import AssessmentService
from scoutai.services.analytics_service import AnalyticsService


def run_demo():
    print("=" * 70)
    print("SCOUTAI — FULL PIPELINE END-TO-END DEMONSTRATION")
    print("=" * 70)

    db = SessionLocal()
    try:
        # 1. Fetch player
        player = db.query(PlayerProfile).filter(PlayerProfile.primary_role == "BATSMAN").first()
        if not player:
            print("No batsman found. Please run scripts/seed_data.py first.")
            return

        print(f"\n1. Selected Player: {player.display_name} ({player.primary_role.value})")
        print(f"   Team: {player.current_team} | Batting: {player.batting_hand.value}")

        # 2. Create Assessment Session
        create_req = AssessmentCreate(
            player_id=player.id,
            session_name="Live Net Session - Front Foot Drive Technique",
            assessment_type=AssessmentType.BATTING_TECHNIQUE,
            is_synthetic=True,
        )
        assessment = AssessmentService.create_assessment(db, create_req)
        print(f"\n2. Created Assessment Session: {assessment.id}")
        print(f"   Status: {assessment.status.value}")

        # 3. Process Pipeline
        print("\n3. Executing Computer Vision & Biomechanical Assessment Pipeline...")
        processed = AssessmentService.process_assessment(
            db=db,
            assessment_id=assessment.id,
            model_identifier="cricket-kinematics-v1",
        )
        print(f"   Execution Status: {processed.status.value}")
        print(f"   Duration: {processed.execution_duration_sec}s")
        print(f"   Provisional Score: {processed.overall_provisional_score}/100.0 (Provisional)")
        print(f"   Summary: {processed.scout_summary}")

        # 4. Display Extracted Performance Metrics
        print("\n4. Generated Performance Metrics:")
        metrics = processed.metrics
        for m in metrics:
            print(f"   - {m.metric_name}: {m.value} {m.unit} (Percentile: {m.benchmark_percentile}th, Origin: {m.origin.value})")
            print(f"     Interpretation: {m.interpretation}")

        # 5. Cohort Benchmark Comparison
        print("\n5. Running Cohort Benchmark Comparison...")
        comp_req = PlayerComparisonRequest(player_id=player.id)
        comp_res = AnalyticsService.compare_player(db, comp_req)
        print(f"   Verdict: {comp_res.scout_verdict}")
        print("   Coaching Priority Areas:")
        for p in comp_res.coaching_priority_areas:
            print(f"     * {p}")

        print("\n" + "=" * 70)
        print("PIPELINE DEMONSTRATION COMPLETE SUCCESSFULLY!")
        print("=" * 70)

    finally:
        db.close()


if __name__ == "__main__":
    run_demo()
