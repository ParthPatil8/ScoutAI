import csv
import json
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from scoutai.datasets.base import BaseDatasetImporter, ImportSummary
from scoutai.models.dataset import DatasetSample, DatasetAnnotation
from scoutai.models.enums import DataSplit, ImportJobStatus


VALID_CRICSHOT10_CLASSES = {
    "drive", "leg_glance", "pull", "sweep", "flick",
    "cut", "scoop", "defense", "hook", "lofted"
}


class CricShot10Importer(BaseDatasetImporter):
    """Importer for CricShot10 (10-Class Cricket Batting Shot Classification Dataset)."""

    @property
    def slug(self) -> str:
        return "cricshot10"

    @property
    def name(self) -> str:
        return "CricShot10"

    @property
    def description(self) -> str:
        return (
            "CricShot10 is a fine-grained cricket video dataset classifying 10 distinctive "
            "batting shots: Drive, Leg Glance, Pull, Sweep, Flick, Cut, Scoop, Defense, Hook, Lofted."
        )

    @property
    def license_type(self) -> str:
        return "Research Use Only (Academic Citation Required)"

    @property
    def paper_citation(self) -> Optional[str]:
        return (
            "Sen et al., 'CricShot10: A Fine-Grained Dataset for Cricket Batting Shot "
            "Recognition in Broadcast Video', Pattern Recognition Letters, 2021."
        )

    @property
    def expected_format_description(self) -> str:
        return (
            "Expects either: (1) A CSV with columns: [video_id, clip_path, shot_label, split, duration, fps], "
            "or (2) A JSON list of records with keys: {'clip_id': str, 'shot_class': str, 'split': str, 'file_path': str}, "
            "or (3) A directory organized with class subfolders (e.g., /drive, /pull, etc.)."
        )

    def validate_source(self, path: Path) -> bool:
        if not path.exists():
            return False
        if path.is_file() and path.suffix.lower() in [".csv", ".json"]:
            return True
        if path.is_dir():
            # Check if directory contains class folders or csv/json
            subdirs = {p.name.lower() for p in path.iterdir() if p.is_dir()}
            if any(cls in subdirs for cls in VALID_CRICSHOT10_CLASSES):
                return True
            if any(path.glob("*.csv")) or any(path.glob("*.json")):
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
            db, version_tag=version_tag, source_path=str(path), format_type="VIDEO_SHOT_10"
        )
        summary = ImportSummary(
            importer_name=self.name,
            source_path=str(path),
            dataset_version_id=version.id,
        )

        job.started_at = datetime.now(timezone.utc)
        db.commit()

        if path.is_file() and path.suffix.lower() == ".csv":
            self._import_from_csv(db, path, version, summary, is_synthetic)
        elif path.is_file() and path.suffix.lower() == ".json":
            self._import_from_json(db, path, version, summary, is_synthetic)
        elif path.is_dir():
            csv_files = list(path.glob("*.csv"))
            json_files = list(path.glob("*.json"))
            if csv_files:
                self._import_from_csv(db, csv_files[0], version, summary, is_synthetic)
            elif json_files:
                self._import_from_json(db, json_files[0], version, summary, is_synthetic)
            else:
                self._import_from_folders(db, path, version, summary, is_synthetic)

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

    def _import_from_csv(
        self, db: Session, csv_path: Path, version, summary: ImportSummary, is_synthetic: bool
    ):
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                summary.total_records += 1
                try:
                    clip_id = row.get("video_id") or row.get("clip_id") or f"cricshot_{summary.imported_records + 1}"
                    shot_raw = (row.get("shot_label") or row.get("shot_class") or "defense").lower().strip()
                    shot_label = shot_raw if shot_raw in VALID_CRICSHOT10_CLASSES else "drive"
                    split_str = (row.get("split") or "TRAIN").upper().strip()
                    split = getattr(DataSplit, split_str, DataSplit.TRAIN)

                    sample = DatasetSample(
                        dataset_version_id=version.id,
                        sample_identifier=clip_id,
                        split=split,
                        media_path=row.get("clip_path") or row.get("file_path"),
                        duration_sec=float(row.get("duration", 2.0)),
                        fps=float(row.get("fps", 30.0)),
                        resolution=row.get("resolution", "1280x720"),
                        is_synthetic=is_synthetic,
                        provenance_notes=f"CricShot10 CSV: {csv_path.name}",
                    )
                    db.add(sample)
                    db.flush()

                    db.add(
                        DatasetAnnotation(
                            sample_id=sample.id,
                            annotation_type="SHOT_CLASS",
                            label=shot_label,
                            confidence=1.0,
                            raw_payload={"source_row": row},
                        )
                    )
                    summary.imported_records += 1
                except Exception as e:
                    summary.failed_records += 1
                    summary.errors.append(f"CSV row error: {e}")
            db.commit()

    def _import_from_json(
        self, db: Session, json_path: Path, version, summary: ImportSummary, is_synthetic: bool
    ):
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        records = data if isinstance(data, list) else data.get("samples", [])
        summary.total_records += len(records)
        for item in records:
            try:
                clip_id = item.get("clip_id") or item.get("id") or f"cricshot_{summary.imported_records + 1}"
                shot_raw = (item.get("shot_class") or item.get("label") or "defense").lower().strip()
                shot_label = shot_raw if shot_raw in VALID_CRICSHOT10_CLASSES else "drive"
                split_str = item.get("split", "TRAIN").upper()
                split = getattr(DataSplit, split_str, DataSplit.TRAIN)

                sample = DatasetSample(
                    dataset_version_id=version.id,
                    sample_identifier=clip_id,
                    split=split,
                    media_path=item.get("file_path"),
                    duration_sec=float(item.get("duration_sec", 2.0)),
                    fps=float(item.get("fps", 30.0)),
                    resolution=item.get("resolution", "1280x720"),
                    is_synthetic=is_synthetic,
                    provenance_notes=f"CricShot10 JSON: {json_path.name}",
                )
                db.add(sample)
                db.flush()

                db.add(
                    DatasetAnnotation(
                        sample_id=sample.id,
                        annotation_type="SHOT_CLASS",
                        label=shot_label,
                        confidence=1.0,
                        raw_payload=item,
                    )
                )
                summary.imported_records += 1
            except Exception as e:
                summary.failed_records += 1
                summary.errors.append(f"JSON record error: {e}")
        db.commit()

    def _import_from_folders(
        self, db: Session, dir_path: Path, version, summary: ImportSummary, is_synthetic: bool
    ):
        video_extensions = {".mp4", ".avi", ".mov", ".mkv"}
        for folder in dir_path.iterdir():
            if folder.is_dir() and folder.name.lower() in VALID_CRICSHOT10_CLASSES:
                shot_label = folder.name.lower()
                for video_file in folder.iterdir():
                    if video_file.suffix.lower() in video_extensions:
                        summary.total_records += 1
                        try:
                            sample = DatasetSample(
                                dataset_version_id=version.id,
                                sample_identifier=f"{shot_label}_{video_file.stem}",
                                split=DataSplit.TRAIN,
                                media_path=str(video_file),
                                is_synthetic=is_synthetic,
                                provenance_notes=f"CricShot10 directory scan: {folder.name}",
                            )
                            db.add(sample)
                            db.flush()

                            db.add(
                                DatasetAnnotation(
                                    sample_id=sample.id,
                                    annotation_type="SHOT_CLASS",
                                    label=shot_label,
                                    confidence=1.0,
                                )
                            )
                            summary.imported_records += 1
                        except Exception as e:
                            summary.failed_records += 1
                            summary.errors.append(f"Folder video error: {e}")
        db.commit()
