import time
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from scoutai.models.assessment import AssessmentSession
from scoutai.models.media import MediaAsset
from scoutai.models.cv_result import (
    ComputerVisionResult,
    PoseEstimationResult,
    DetectedAction,
    BiomechanicalFeature,
)
from scoutai.models.metric import PerformanceMetric
from scoutai.models.model_registry import MLModelRegistry, ModelInferenceLog
from scoutai.models.enums import AssessmentStatus, MediaProcessingStatus
from scoutai.pipeline.pose_engine import OpenCVSkeletonPoseEstimator
from scoutai.pipeline.action_detector import CricketActionRecognizer
from scoutai.pipeline.biomechanics import CricketBiomechanicsExtractor
from scoutai.pipeline.metric_generator import CricketMetricGenerator


class AssessmentRunner:
    """Coordinates the end-to-end computer vision and biomechanical cricket assessment pipeline."""

    def __init__(self):
        self.pose_estimator = OpenCVSkeletonPoseEstimator()
        self.action_recognizer = CricketActionRecognizer()
        self.biomechanics_extractor = CricketBiomechanicsExtractor()
        self.metric_generator = CricketMetricGenerator()

    def run(
        self,
        db: Session,
        assessment_id: str,
        model_identifier: str = "cricket-kinematics-v1",
        force_reprocess: bool = False,
    ) -> AssessmentSession:
        start_time = time.time()
        assessment = db.query(AssessmentSession).filter_by(id=assessment_id).first()
        if not assessment:
            raise ValueError(f"Assessment with id {assessment_id} not found.")

        if assessment.status == AssessmentStatus.COMPLETED and not force_reprocess:
            return assessment

        # Set status to PROCESSING
        assessment.status = AssessmentStatus.PROCESSING
        db.commit()

        # Find or create model record in registry
        ml_model = db.query(MLModelRegistry).filter_by(model_identifier=model_identifier).first()
        if not ml_model:
            ml_model = MLModelRegistry(
                model_identifier=model_identifier,
                name="Cricket Biomechanical Kinematics Engine",
                task_type="BIOMECHANICAL_ANALYSIS",
                version="1.0.0",
                architecture="OpenCV-Kinematics-VectorAngle-Pipeline",
                framework="OpenCV/NumPy",
                license="Apache-2.0",
                is_active=True,
            )
            db.add(ml_model)
            db.commit()
            db.refresh(ml_model)

        try:
            # 1. Video input & validation
            video_path = None
            if assessment.media_asset_id:
                media = db.query(MediaAsset).filter_by(id=assessment.media_asset_id).first()
                if media:
                    video_path = media.file_path
                    media.processing_status = MediaProcessingStatus.PROCESSING
                    db.commit()

            # 2. Pose estimation
            pose_frames = self.pose_estimator.estimate_pose(video_path=video_path, max_frames=60)

            # 3. Action recognition & temporal phase segmentation
            actions = self.action_recognizer.recognize_actions(
                pose_frames, assessment_type=assessment.assessment_type.value
            )

            # 4. Biomechanical feature extraction
            player_context = {
                "player_id": assessment.player_id,
                "role": assessment.player.primary_role.value if assessment.player else "BATSMAN",
            }
            bio_output = self.biomechanics_extractor.extract_features(
                pose_frames, actions, player_context=player_context
            )

            # 5. Metric generation & provisional scoring
            metrics_data, overall_score = self.metric_generator.generate_metrics(
                bio_output, assessment.assessment_type.value, player_context
            )

            # 6. Database persistence
            duration_sec = round(time.time() - start_time, 2)

            # Create CV Result
            cv_res = ComputerVisionResult(
                assessment_session_id=assessment.id,
                media_asset_id=assessment.media_asset_id,
                model_name=ml_model.name,
                model_version=ml_model.version,
                frames_analyzed=len(pose_frames),
                fps_detected=30.0,
                execution_time_sec=duration_sec,
            )
            db.add(cv_res)
            db.flush()

            # Save sample keyframes (saving every 5th frame for storage efficiency)
            for i, pf in enumerate(pose_frames):
                if i % 5 == 0 or i == len(pose_frames) // 2:
                    kps_dict = {k: [round(v.x, 1), round(v.y, 1), round(v.confidence, 2)] for k, v in pf.keypoints.items()}
                    db.add(
                        PoseEstimationResult(
                            cv_result_id=cv_res.id,
                            frame_number=pf.frame_number,
                            timestamp_sec=round(pf.timestamp_sec, 3),
                            keypoints_json=kps_dict,
                            bounding_box=pf.bounding_box,
                            pose_confidence=pf.overall_confidence,
                        )
                    )

            # Save Detected Actions
            for act in actions:
                db.add(
                    DetectedAction(
                        cv_result_id=cv_res.id,
                        action_category=act.action_category,
                        action_label=act.action_label,
                        start_frame=act.start_frame,
                        end_frame=act.end_frame,
                        confidence=act.confidence,
                        temporal_phases=act.phases,
                    )
                )

            # Save Biomechanical Features
            for fname, fval in bio_output.features.items():
                db.add(
                    BiomechanicalFeature(
                        cv_result_id=cv_res.id,
                        feature_name=fname,
                        feature_value=fval,
                        unit=bio_output.units.get(fname, ""),
                        frame_reference=bio_output.frame_references.get(fname),
                        confidence=bio_output.confidences.get(fname, 0.90),
                    )
                )

            # Delete old metrics for this assessment session if re-processing
            db.query(PerformanceMetric).filter_by(assessment_session_id=assessment.id).delete()

            # Save Performance Metrics
            for m in metrics_data:
                db.add(
                    PerformanceMetric(
                        assessment_session_id=assessment.id,
                        player_id=assessment.player_id,
                        metric_name=m["metric_name"],
                        category=m["category"],
                        value=m["value"],
                        unit=m["unit"],
                        confidence=m["confidence"],
                        benchmark_percentile=m["benchmark_percentile"],
                        origin=m["origin"],
                        is_provisional=m["is_provisional"],
                        methodology=m["methodology"],
                        interpretation=m["interpretation"],
                    )
                )

            # Log inference
            db.add(
                ModelInferenceLog(
                    model_id=ml_model.id,
                    assessment_session_id=assessment.id,
                    execution_status="SUCCESS",
                    latency_ms=round(duration_sec * 1000.0, 1),
                    frames_processed=len(pose_frames),
                )
            )

            # Finalize Assessment
            assessment.status = AssessmentStatus.COMPLETED
            assessment.overall_provisional_score = overall_score
            assessment.confidence_score = 0.90
            assessment.execution_duration_sec = duration_sec
            assessment.scout_summary = (
                f"Automated biomechanical evaluation complete ({len(pose_frames)} frames analyzed). "
                f"Provisional technique score: {overall_score}/100. "
                f"Key action identified: {actions[0].action_label if actions else 'Standard Stroke'}."
            )

            if assessment.media_asset_id and media:
                media.processing_status = MediaProcessingStatus.COMPLETED

            db.commit()
            db.refresh(assessment)
            return assessment

        except Exception as e:
            db.rollback()
            assessment.status = AssessmentStatus.FAILED
            assessment.scout_summary = f"Pipeline execution failed: {str(e)}"
            db.add(
                ModelInferenceLog(
                    model_id=ml_model.id,
                    assessment_session_id=assessment.id,
                    execution_status="FAILED",
                    latency_ms=round((time.time() - start_time) * 1000.0, 1),
                    error_details=str(e),
                )
            )
            db.commit()
            raise
