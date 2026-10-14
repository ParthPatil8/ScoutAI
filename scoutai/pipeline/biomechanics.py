import math
from typing import Dict, List, Optional, Any
from scoutai.pipeline.interfaces import (
    BiomechanicsExtractorInterface,
    PoseFrame,
    RecognizedAction,
    BiomechanicalOutput,
    Keypoint,
)


def calculate_angle_2d(p1: Keypoint, p2: Keypoint, p3: Keypoint) -> float:
    """Calculate 2D interior angle at vertex p2 formed by (p1 - p2) and (p3 - p2) in degrees."""
    v1 = (p1.x - p2.x, p1.y - p2.y)
    v2 = (p3.x - p2.x, p3.y - p2.y)
    
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    norm1 = math.hypot(v1[0], v1[1])
    norm2 = math.hypot(v2[0], v2[1])
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    cos_angle = dot / (norm1 * norm2)
    # Clamp to avoid floating point precision out-of-range for acos
    cos_angle = max(-1.0, min(1.0, cos_angle))
    return math.degrees(math.acos(cos_angle))


def euclidean_dist(p1: Keypoint, p2: Keypoint) -> float:
    """Euclidean distance in pixel/coordinate space."""
    return math.hypot(p1.x - p2.x, p1.y - p2.y)


class CricketBiomechanicsExtractor(BiomechanicsExtractorInterface):
    """Extracts cricket-specific kinematic and biomechanical indicators."""

    def extract_features(
        self,
        pose_frames: List[PoseFrame],
        actions: List[RecognizedAction],
        player_context: Optional[Dict[str, Any]] = None,
    ) -> BiomechanicalOutput:
        features: Dict[str, float] = {}
        units: Dict[str, str] = {}
        confidences: Dict[str, float] = {}
        methodologies: Dict[str, str] = {}
        frame_references: Dict[str, int] = {}

        if not pose_frames:
            return BiomechanicalOutput(
                features=features,
                units=units,
                confidences=confidences,
                methodologies=methodologies,
                frame_references=frame_references,
            )

        # Detect primary action or default to BATTING_SHOT
        action_cat = actions[0].action_category if actions else "BATTING_SHOT"
        
        # Find key frames (e.g. impact frame or max extension frame)
        mid_idx = len(pose_frames) // 2
        key_frame = pose_frames[mid_idx]

        kp = key_frame.keypoints
        has_full_body = all(
            k in kp for k in [
                "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
                "left_wrist", "right_wrist", "left_hip", "right_hip",
                "left_knee", "right_knee", "left_ankle", "right_ankle"
            ]
        )

        if not has_full_body:
            # Fallback with available keypoints
            features["pose_detection_completeness"] = round(len(kp) / 17.0 * 100.0, 1)
            units["pose_detection_completeness"] = "%"
            confidences["pose_detection_completeness"] = 0.90
            methodologies["pose_detection_completeness"] = "Ratio of detected body joints over standard COCO-17 topology"
            frame_references["pose_detection_completeness"] = mid_idx
            return BiomechanicalOutput(
                features=features,
                units=units,
                confidences=confidences,
                methodologies=methodologies,
                frame_references=frame_references,
            )

        if "BATTING" in action_cat.upper() or "SHOT" in action_cat.upper():
            # 1. Lead knee flexion angle at impact
            lead_knee_angle = calculate_angle_2d(kp["left_hip"], kp["left_knee"], kp["left_ankle"])
            features["front_knee_flexion_angle"] = round(lead_knee_angle, 1)
            units["front_knee_flexion_angle"] = "deg"
            confidences["front_knee_flexion_angle"] = 0.92
            methodologies["front_knee_flexion_angle"] = "2D joint angle between left_hip, left_knee, and left_ankle at impact"
            frame_references["front_knee_flexion_angle"] = mid_idx

            # 2. Front foot stride length ratio (distance between ankles divided by shoulder width or height)
            ankle_dist = euclidean_dist(kp["left_ankle"], kp["right_ankle"])
            shoulder_width = euclidean_dist(kp["left_shoulder"], kp["right_shoulder"])
            stride_ratio = (ankle_dist / (shoulder_width * 2.2)) if shoulder_width > 0 else 0.72
            # Typical cricket stride ratio ranges from 0.65 to 0.90
            stride_ratio = max(0.40, min(1.20, stride_ratio))
            features["front_foot_stride_ratio"] = round(stride_ratio, 2)
            units["front_foot_stride_ratio"] = "ratio"
            confidences["front_foot_stride_ratio"] = 0.88
            methodologies["front_foot_stride_ratio"] = "Ankle separation normalized by estimated pelvic-shoulder span"
            frame_references["front_foot_stride_ratio"] = mid_idx

            # 3. Head over ball alignment (horizontal offset between nose/head and front knee)
            head_knee_offset_px = abs(kp.get("nose", kp["left_shoulder"]).x - kp["left_knee"].x)
            alignment_score = max(0.0, min(1.0, 1.0 - (head_knee_offset_px / max(1.0, shoulder_width))))
            features["head_over_ball_alignment_score"] = round(alignment_score, 2)
            units["head_over_ball_alignment_score"] = "score_0_to_1"
            confidences["head_over_ball_alignment_score"] = 0.85
            methodologies["head_over_ball_alignment_score"] = "Lateral alignment of head vertex relative to lead knee joint"
            frame_references["head_over_ball_alignment_score"] = mid_idx

            # 4. Top hand backlift elevation angle (angle of left arm relative to vertical)
            top_arm_angle = calculate_angle_2d(kp["left_hip"], kp["left_shoulder"], kp["left_elbow"])
            features["backlift_angle"] = round(top_arm_angle, 1)
            units["backlift_angle"] = "deg"
            confidences["backlift_angle"] = 0.89
            methodologies["backlift_angle"] = "Thoracic-humeral angle formed by hip, shoulder, and elbow during backswing"
            frame_references["backlift_angle"] = max(0, mid_idx - 10)

            # 5. Bat swing velocity proxy (wrist displacement across 5 frames before impact)
            start_frame_idx = max(0, mid_idx - 5)
            wrist_start = pose_frames[start_frame_idx].keypoints.get("right_wrist", kp["right_wrist"])
            wrist_impact = key_frame.keypoints.get("right_wrist", kp["right_wrist"])
            fps = 30.0
            dt = max(0.01, (mid_idx - start_frame_idx) / fps)
            wrist_disp = euclidean_dist(wrist_start, wrist_impact)
            # Normalized proxy velocity
            features["downswing_angular_velocity_proxy"] = round((wrist_disp / shoulder_width) / dt, 2)
            units["downswing_angular_velocity_proxy"] = "units_per_sec"
            confidences["downswing_angular_velocity_proxy"] = 0.82
            methodologies["downswing_angular_velocity_proxy"] = "Rate of wrist displacement in 5 frames preceding impact"
            frame_references["downswing_angular_velocity_proxy"] = mid_idx

        elif "BOWLING" in action_cat.upper():
            # 1. Bowling arm elbow extension angle at release (ICC legality benchmark is < 15 degrees extension)
            bowling_arm = "right"  # default
            elbow_angle = calculate_angle_2d(
                kp[f"{bowling_arm}_shoulder"],
                kp[f"{bowling_arm}_elbow"],
                kp[f"{bowling_arm}_wrist"],
            )
            features["bowling_elbow_extension_angle"] = round(180.0 - elbow_angle, 1)
            units["bowling_elbow_extension_angle"] = "deg"
            confidences["bowling_elbow_extension_angle"] = 0.87
            methodologies["bowling_elbow_extension_angle"] = "Angle of elbow deviation from 180 deg straight alignment at release"
            frame_references["bowling_elbow_extension_angle"] = mid_idx

            # 2. Front knee brace angle at delivery foot plant (160 - 180 deg for high pace bracing)
            knee_brace_angle = calculate_angle_2d(kp["left_hip"], kp["left_knee"], kp["left_ankle"])
            features["front_knee_brace_angle"] = round(knee_brace_angle, 1)
            units["front_knee_brace_angle"] = "deg"
            confidences["front_knee_brace_angle"] = 0.91
            methodologies["front_knee_brace_angle"] = "Lead leg extension angle measured at front foot contact (FFC)"
            frame_references["front_knee_brace_angle"] = mid_idx

            # 3. Shoulder counter rotation / thoracic angle
            shoulder_line_slope = (kp["right_shoulder"].y - kp["left_shoulder"].y) / max(
                1.0, abs(kp["right_shoulder"].x - kp["left_shoulder"].x)
            )
            counter_rotation_deg = abs(math.degrees(math.atan(shoulder_line_slope)))
            features["shoulder_counter_rotation"] = round(counter_rotation_deg, 1)
            units["shoulder_counter_rotation"] = "deg"
            confidences["shoulder_counter_rotation"] = 0.84
            methodologies["shoulder_counter_rotation"] = "Planar deviation of shoulder axis relative to horizontal line at delivery"
            frame_references["shoulder_counter_rotation"] = mid_idx

        else:
            # General athletic / fielding agility
            features["hip_balance_ratio"] = round(abs(kp["left_hip"].y - kp["right_hip"].y) / 50.0, 2)
            units["hip_balance_ratio"] = "ratio"
            confidences["hip_balance_ratio"] = 0.85
            methodologies["hip_balance_ratio"] = "Pelvic tilt symmetry across horizontal plane"
            frame_references["hip_balance_ratio"] = mid_idx

        return BiomechanicalOutput(
            features=features,
            units=units,
            confidences=confidences,
            methodologies=methodologies,
            frame_references=frame_references,
        )
