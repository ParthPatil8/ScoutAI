import csv
import json
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from scoutai.datasets.base import BaseDatasetImporter, ImportSummary
from scoutai.models.dataset import DatasetSample, DatasetAnnotation
from scoutai.models.enums import DataSplit, ImportJobStatus


class CricketBattingShotsImporter(BaseDatasetImporter):
    """Importer for Cricket Batting Shots & IPL Footage Datasets.
    
    Contains video clips from competitive matches with batsman, bowler, shot type,
    pitch trajectory, and outcome labels (dot, 1, 2, 4, 6, wicket).
    """

    @property
    def slug(self) -> str:
        return "cricket-batting-shots-ipl"

    @property
    def name(self) -> str:
        return "Cricket Batting Shots & IPL Broadcast Clips"

    @property
    def description(self) -> str:
        return (
            "A comprehensive broadcast video dataset containing labeled batting strokes "
            "from competitive cricket (including IPL and T20 fixtures) annotated with batsman, "
            "bowler, shot type, and outcome."
        )

    @property
    def license_type(self) -> str:
        return "Fair Use for Educational Research (Broadcast Rights Reserved)"

    @property
    def paper_citation(self) -> Optional[str]:
        return (
            "Cricket Vision Analytics Group, 'Fine-Grained Action and Stroke Recognition "
            "in Broadcast Cricket Video Streams', Sports Analytics Workshop, 2022."
        )

    @property
    def expected_format_description(self) -> str:
        return (
            "Expects a CSV or JSON file containing: "
            "[clip_id, match_id, batsman_name, bowler_name, shot_type, outcome, "
            "start_time_sec, end_time_sec, video_filename]"
        )

    def validate_source(self, path: Path) -> bool:
        if not path.exists():
            return False
        if path.is_file() and path.suffix.lower() in [".csv", ".json"]:
            return True
        if path.is_dir() and (any(path.glob("*.csv")) or any(path.glob("*.json"))):
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
            db, version_tag=version_tag, source_path=str(path), format_type="CSV_BROADCAST_SHOTS"
        )
        summary = ImportSummary(
            importer_name=self.name,
            source_path=str(path),
            dataset_version_id=version.id,
        )

        job.started_at = datetime.now(timezone.utc)
        db.commit()

        target_file = path
        if path.is_dir():
            csvs = list(path.glob("*.csv"))
            jsons = list(path.glob("*.json"))
            target_file = csvs[0] if csvs else (jsons[0] if jsons else None)

        if not target_file:
            summary.errors.append("No valid CSV or JSON found")
            summary.status = ImportJobStatus.FAILED
            job.status = ImportJobStatus.FAILED
            db.commit()
            return summary

        if target_file.suffix.lower() == ".csv":
            self._parse_csv(db, target_file, version, summary, is_synthetic)
        else:
            self._parse_json(db, target_file, version, summary, is_synthetic)

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

    def _parse_csv(self, db: Session, file_path: Path, version, summary: ImportSummary, is_synthetic: bool):
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                summary.total_records += 1
                try:
                    clip_id = row.get("clip_id") or f"clip_{summary.imported_records + 1}"
                    start_t = float(row.get("start_time_sec", 0.0))
                    end_t = float(row.get("end_time_sec", 4.0))

                    sample = DatasetSample(
                        dataset_version_id=version.id,
                        sample_identifier=clip_id,
                        split=DataSplit.TRAIN,
                        media_path=row.get("video_filename") or f"{clip_id}.mp4",
                        duration_sec=end_t - start_t if end_t > start_t else 4.0,
                        fps=30.0,
                        resolution="1920x1080",
                        is_synthetic=is_synthetic,
                        provenance_notes=f"Batsman: {row.get('batsman_name')}, Bowler: {row.get('bowler_name')}",
                    )
                    db.add(sample)
                    db.flush()

                    db.add(
                        DatasetAnnotation(
                            sample_id=sample.id,
                            annotation_type="MATCH_STROKE",
                            label=row.get("shot_type", "unspecified_stroke"),
                            confidence=1.0,
                            raw_payload={
                                "batsman": row.get("batsman_name"),
                                "bowler": row.get("bowler_name"),
                                "outcome": row.get("outcome"),
                                "match_id": row.get("match_id"),
                            },
                        )
                    )
                    summary.imported_records += 1
                except Exception as e:
                    summary.failed_records += 1
                    summary.errors.append(f"Row parsing error: {e}")
            db.commit()

    def _parse_json(self, db: Session, file_path: Path, version, summary: ImportSummary, is_synthetic: bool):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        items = data if isinstance(data, list) else data.get("clips", [])
        summary.total_records += len(items)
        for item in items:
            try:
                clip_id = item.get("clip_id") or f"clip_{summary.imported_records + 1}"
                sample = DatasetSample(
                    dataset_version_id=version.id,
                    sample_identifier=clip_id,
                    split=DataSplit.TRAIN,
                    media_path=item.get("video_filename"),
                    duration_sec=item.get("duration_sec", 4.0),
                    fps=30.0,
                    resolution="1920x1080",
                    is_synthetic=is_synthetic,
                    provenance_notes=f"Batsman: {item.get('batsman_name')}, Bowler: {item.get('bowler_name')}",
                )
                db.add(sample)
                db.flush()

                db.add(
                    DatasetAnnotation(
                        sample_id=sample.id,
                        annotation_type="MATCH_STROKE",
                        label=item.get("shot_type", "unspecified_stroke"),
                        confidence=1.0,
                        raw_payload=item,
                    )
                )
                summary.imported_records += 1
            except Exception as e:
                summary.failed_records += 1
                summary.errors.append(f"JSON item error: {e}")
        db.commit()
