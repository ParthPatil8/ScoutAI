from datetime import date
from scoutai.models.player import PlayerProfile
from scoutai.models.assessment import AssessmentSession
from scoutai.models.media import MediaAsset
from scoutai.models.metric import PerformanceMetric
from scoutai.models.scouting import ScoutEvaluation
from scoutai.models.enums import CricketRole, BattingHand, BowlingStyle, AssessmentType, MetricCategory, MetricOrigin


def test_player_creation_and_relationships(db):
    player = PlayerProfile(
        first_name="Ravi",
        last_name="Shastri",
        display_name="Ravi Shastri",
        date_of_birth=date(1990, 5, 27),
        primary_role=CricketRole.ALL_ROUNDER,
        batting_hand=BattingHand.RIGHT_HAND,
        bowling_style=BowlingStyle.LEFT_ARM_ORTHODOX,
        nationality="India",
        is_synthetic=True,
    )
    db.add(player)
    db.commit()

    assert player.id is not None
    assert player.primary_role == CricketRole.ALL_ROUNDER

    # Create assessment
    assessment = AssessmentSession(
        player_id=player.id,
        session_name="Net Practice 1",
        assessment_type=AssessmentType.BATTING_TECHNIQUE,
    )
    db.add(assessment)
    db.commit()

    assert len(player.assessments) == 1
    assert player.assessments[0].session_name == "Net Practice 1"

    # Add metric
    metric = PerformanceMetric(
        assessment_session_id=assessment.id,
        player_id=player.id,
        metric_name="front_knee_flexion_angle",
        category=MetricCategory.BATTING,
        value=142.5,
        unit="deg",
        origin=MetricOrigin.AUTO_DETECTED,
        is_provisional=True,
    )
    db.add(metric)
    db.commit()

    assert len(assessment.metrics) == 1
    assert assessment.metrics[0].value == 142.5


def test_media_and_clip_segment(db):
    media = MediaAsset(
        original_filename="sample_clip.mp4",
        file_path="storage/videos/sample.mp4",
        file_size_bytes=1024,
        mime_type="video/mp4",
    )
    db.add(media)
    db.commit()
    assert media.id is not None
