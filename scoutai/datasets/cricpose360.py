import json
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from scoutai.datasets.base import BaseDatasetImporter, ImportSummary
from scoutai.models.dataset import DatasetSample, DatasetAnnotation
from scoutai.models.enums import DataSplit, ImportJobStatus


class CricPose360Importer(BaseDatasetImporter):
    """Importer for CricPose360 (Multi-view 2D/3D Cricket Pose Skeleton Dataset).
    
    Provides 360-degree multi-view camera pose captures with skeletal joint coordinates
    for batting and bowling actions.
    """

    @property
    def slug(self) -> str:
        return "cricpose360"

    @property
    def name(self) -> str:
        return "CricPose360"

    @property
    def description(self) -> str:
        return (
            "CricPose360 is a benchmark cricket pose dataset featuring synchronized multi-camera "
            "views, 2D/3D skeletal keypoint annotations, joint angles, and temporal action phases."
        )

    @property
    def license_type(self) -> str:
        return "Academic Research License (CC BY 4.0)"

    @property
    def paper_citation(self) -> Optional[str]:
        return (
            "CricPose360 Consortium, 'CricPose360: A Multi-View Synchronized 3D Human Pose "
            "Dataset for Cricket Biomechanics', CVPRW, 2023."
        )

    @property
    def expected_format_description(self) -> str:
        return (
            "Expects JSON files or directory containing pose sequences: "
            "{'sequence_id': str, 'camera_view': str, 'action_type': str, 'frame_count': int, "
            "'keypoints_2d': list[list[float]], 'keypoints_3d': list[list[float]], "
            "'joint_names': list[str], 'split': 'TRAIN'|'VAL'|'TEST'}"
        )

    def validate_source(self, path: Path) -> bool:
        if not path.exists():
            return False
        if path.is_file() and path.suffix.lower() == ".json":
            return True
        if path.is_dir() and any(path.glob("*.json")):
            return True
        return False

    def import_data(
        self,
        db: Session,
        path: Path,
        version_tag: str = "v1.0",
        is_synthetic: bool = False,
    ) -> ImportSummary:
        version, job = self.create_version_and_job(
            db, version_tag=version_tag, source_path=str(path), format_type="COCO_POSE_3D"
        )
        summary = ImportSummary(
            importer_name=self.name,
            source_path=str(path),
            dataset_version_id=version.id,
        )

        files = [path] if path.is_file() else list(path.glob("*.json"))
        if not files:
            summary.errors.append(f"No CricPose360 JSON files found at {path}")
            summary.status = ImportJobStatus.FAILED
            job.status = ImportJobStatus.FAILED
            db.commit()
            return summary

        job.started_at = datetime.now(timezone.utc)
        db.commit()

        for json_file in files:
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    content = json.load(f)

                records = content if isinstance(content, list) else content.get("sequences", [content])
                summary.total_records += len(records)

                for item in records:
                    try:
                        seq_id = item.get("sequence_id") or item.get("id") or f"cricpose_{summary.imported_records + 1}"
                        split_str = item.get("split", "TRAIN").upper()
                        split = getattr(DataSplit, split_str, DataSplit.TRAIN)

                        sample = DatasetSample(
                            dataset_version_id=version.id,
                            sample_identifier=seq_id,
                            split=split,
                            media_path=item.get("video_path") or f"sequences/{seq_id}.mp4",
                            duration_sec=float(item.get("duration_sec", 2.5)),
                            fps=float(item.get("fps", 60.0)),
                            resolution=item.get("resolution", "1920x1080"),
                            is_synthetic=is_synthetic,
                            provenance_notes=f"CricPose360 view={item.get('camera_view', 'front')} from {json_file.name}",
                        )
                        db.add(sample)
                        db.flush()

                        # Pose skeleton annotation
                        db.add(
                            DatasetAnnotation(
                                sample_id=sample.id,
                                annotation_type="POSE_SKELETON_3D",
                                label=item.get("action_type", "batting_drive"),
                                confidence=float(item.get("confidence", 0.95)),
                                keypoints_json={
                                    "joint_names": item.get("joint_names", []),
                                    "keypoints_2d": item.get("keypoints_2d", []),
                                    "keypoints_3d": item.get("keypoints_3d", []),
                                    "camera_view": item.get("camera_view", "front_angle"),
                                },
                                raw_payload={
                                    "joint_angles": item.get("joint_angles", {}),
                                    "frame_count": item.get("frame_count", 60),
                                },
                            )
                        )

                        summary.imported_records += 1
                    except Exception as record_err:
                        summary.failed_records += 1
                        summary.errors.append(f"Error in CricPose record {item.get('sequence_id')}: {record_err}")

                db.commit()
            except Exception as file_err:
                summary.errors.append(f"Failed to read file {json_file.name}: {file_err}")

        version.total_samples += summary.imported_records
        job.total_records = summary.total_records
        job.imported_records = summary.imported_records
        job.failed_records = summary.failed_records
        job.status = ImportJobStatus.COMPLETED
        job.completed_at = datetime.now(timezone.utc)
        if summary.errors:
            job.error_summary = "\n".join(summary.errors[:10])
        db.commit()

        return summary
