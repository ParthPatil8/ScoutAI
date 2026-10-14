from scoutai.pipeline.biomechanics import calculate_angle_2d, CricketBiomechanicsExtractor
from scoutai.pipeline.pose_engine import OpenCVSkeletonPoseEstimator
from scoutai.pipeline.action_detector import CricketActionRecognizer
from scoutai.pipeline.metric_generator import CricketMetricGenerator
from scoutai.pipeline.interfaces import Keypoint


def test_angle_2d_calculation():
    # 90-degree right angle: p1=(0,1), p2=(0,0), p3=(1,0)
    p1 = Keypoint("a", 0.0, 1.0)
    p2 = Keypoint("vertex", 0.0, 0.0)
    p3 = Keypoint("c", 1.0, 0.0)

    angle = calculate_angle_2d(p1, p2, p3)
    assert abs(angle - 90.0) < 1e-4

    # 180-degree straight line: p1=(-1,0), p2=(0,0), p3=(1,0)
    p_left = Keypoint("l", -1.0, 0.0)
    angle_180 = calculate_angle_2d(p_left, p2, p3)
    assert abs(angle_180 - 180.0) < 1e-4


def test_pose_estimation_and_action_recognition():
    pose_estimator = OpenCVSkeletonPoseEstimator()
    frames = pose_estimator.estimate_pose(max_frames=30)
    assert len(frames) == 30
    assert "nose" in frames[0].keypoints
    assert "left_knee" in frames[0].keypoints

    recognizer = CricketActionRecognizer()
    actions = recognizer.recognize_actions(frames, assessment_type="BATTING_TECHNIQUE")
    assert len(actions) == 1
    assert actions[0].action_label == "COVER_DRIVE"
    assert "impact" in actions[0].phases


def test_biomechanics_and_metric_generation():
    pose_estimator = OpenCVSkeletonPoseEstimator()
    frames = pose_estimator.estimate_pose(max_frames=30)
    recognizer = CricketActionRecognizer()
    actions = recognizer.recognize_actions(frames, assessment_type="BATTING_TECHNIQUE")

    extractor = CricketBiomechanicsExtractor()
    bio_output = extractor.extract_features(frames, actions, {"player_id": "test_p"})
    assert "front_knee_flexion_angle" in bio_output.features
    assert "front_foot_stride_ratio" in bio_output.features

    generator = CricketMetricGenerator()
    metrics, score = generator.generate_metrics(bio_output, "BATTING_TECHNIQUE", {})
    assert len(metrics) > 0
    assert 0.0 <= score <= 100.0
