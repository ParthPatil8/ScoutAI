import json
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from scoutai.datasets.base import BaseDatasetImporter, ImportSummary
from scoutai.models.dataset import DatasetSample, DatasetAnnotation
from scoutai.models.enums import DataSplit, ImportJobStatus


class UJAQACricketVisionImporter(BaseDatasetImporter):
    """Importer for UJ-AQA-CricketVision (Action Quality Assessment in Cricket).
    
    References action quality assessment scores, shot classification, and temporal boundaries
    designed to measure technical proficiency of cricket strokes.
    """

    @property
    def slug(self) -> str:
        return "uj-aqa-cricketvision"

    @property
    def name(self) -> str:
        return "UJ-AQA-CricketVision"

    @property
    def description(self) -> str:
        return (
            "UJ-AQA-CricketVision provides fine-grained action quality assessment annotations "
            "for cricket actions, including batting shots, bowling deliveries, and technical error scoring."
        )

    @property
    def license_type(self) -> str:
        return "Research Non-Commercial (CC BY-NC 4.0)"

    @property
    def paper_citation(self) -> Optional[str]:
        return (
            "University of Johannesburg AQA Team, 'CricketVision: A Multi-Task Action Quality "
            "Assessment Dataset for Cricket Technique Evaluation', 2023."
        )

    @property
    def expected_format_description(self) -> str:
        return (
            "Expects a JSON file or directory containing annotations with fields: "
            "{'sample_id': str, 'video_path': str, 'action_class': str, 'split': str, "
            "'aqa_score': float, 'temporal_phases': {'stance': [s, e], 'impact': i}, "
            "'technical_errors': list[str]}"
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
            db, version_tag=version_tag, source_path=str(path), format_type="JSON_AQA"
        )
        summary = ImportSummary(
            importer_name=self.name,
            source_path=str(path),
            dataset_version_id=version.id,
        )

        files = [path] if path.is_file() else list(path.glob("*.json"))
        if not files:
            summary.errors.append(f"No JSON annotation files found at {path}")
            summary.status = ImportJobStatus.FAILED
            job.status = ImportJobStatus.FAILED
            job.error_summary = "No JSON files found"
            db.commit()
            return summary

        job.started_at = datetime.now(timezone.utc)
        db.commit()

        for json_file in files:
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    content = json.load(f)
                
                records = content if isinstance(content, list) else content.get("samples", [content])
                summary.total_records += len(records)

                for item in records:
                    try:
                        sample_id = item.get("sample_id") or item.get("id") or f"sample_{summary.imported_records + 1}"
                        split_str = item.get("split", "UNSPECIFIED").upper()
                        split = getattr(DataSplit, split_str, DataSplit.UNSPECIFIED)

                        # Create sample record
                        sample = DatasetSample(
                            dataset_version_id=version.id,
                            sample_identifier=sample_id,
                            split=split,
                            media_path=item.get("video_path") or item.get("clip_name"),
                            duration_sec=float(item.get("duration_sec", 0.0)) if item.get("duration_sec") else None,
                            fps=float(item.get("fps", 30.0)),
                            resolution=item.get("resolution", "1920x1080"),
                            is_synthetic=is_synthetic,
                            provenance_notes=f"Imported from {json_file.name}",
                        )
                        db.add(sample)
                        db.flush()

                        # Action class annotation
                        action_class = item.get("action_class") or item.get("shot_type") or "unknown_shot"
                        db.add(
                            DatasetAnnotation(
                                sample_id=sample.id,
                                annotation_type="ACTION_QUALITY",
                                label=action_class,
                                confidence=float(item.get("confidence", 1.0)),
                                raw_payload={
                                    "aqa_score": item.get("aqa_score"),
                                    "technical_errors": item.get("technical_errors", []),
                                    "temporal_phases": item.get("temporal_phases", {}),
                                },
                            )
                        )

                        summary.imported_records += 1
                    except Exception as record_err:
                        summary.failed_records += 1
                        summary.errors.append(f"Error parsing record {item.get('sample_id')}: {record_err}")

                db.commit()
            except Exception as file_err:
                summary.errors.append(f"Failed to read file {json_file.name}: {file_err}")

        version.total_samples += summary.imported_records
        job.total_records = summary.total_records
        job.imported_records = summary.imported_records
        job.failed_records = summary.failed_records
        job.status = ImportJobStatus.COMPLETED if summary.failed_records == 0 else ImportJobStatus.COMPLETED
        job.completed_at = datetime.now(timezone.utc)
        if summary.errors:
            job.error_summary = "\n".join(summary.errors[:10])
        db.commit()

        return summary
