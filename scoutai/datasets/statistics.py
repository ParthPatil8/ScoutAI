import csv
import json
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from scoutai.datasets.base import BaseDatasetImporter, ImportSummary
from scoutai.models.dataset import DatasetSample, DatasetAnnotation
from scoutai.models.enums import DataSplit, ImportJobStatus


class CricketStatisticsImporter(BaseDatasetImporter):
    """Importer for Public Cricket Performance Statistics (Cricinfo / Kaggle data).
    
    Ingests career batting, bowling, and fielding metrics, strike rates, economy rates,
    and dot ball percentages for talent baseline benchmarking.
    """

    @property
    def slug(self) -> str:
        return "cricket-public-stats"

    @property
    def name(self) -> str:
        return "Public Cricket Performance Statistics"

    @property
    def description(self) -> str:
        return (
            "Historical and tournament career metrics for professional, domestic, and youth cricketers. "
            "Used to contextualize computer vision biomechanical metrics with statistical match outcomes."
        )

    @property
    def license_type(self) -> str:
        return "Public Domain / Open Data (Attribution Required)"

    @property
    def paper_citation(self) -> Optional[str]:
        return (
            "ESPNcricinfo & Kaggle Open Cricket Archive, 'Aggregated Multi-Format Player Career "
            "and Delivery-by-Delivery Metrics', 2023."
        )

    @property
    def expected_format_description(self) -> str:
        return (
            "Expects CSV or JSON file containing player rows: "
            "[player_name, role, matches, runs, batting_avg, strike_rate, wickets, bowling_avg, economy, catches]"
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
            db, version_tag=version_tag, source_path=str(path), format_type="CSV_STATISTICS"
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
            summary.errors.append("No valid statistics file found")
            summary.status = ImportJobStatus.FAILED
            job.status = ImportJobStatus.FAILED
            db.commit()
            return summary

        if target_file.suffix.lower() == ".csv":
            self._import_csv(db, target_file, version, summary, is_synthetic)
        else:
            self._import_json(db, target_file, version, summary, is_synthetic)

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

    def _import_csv(self, db: Session, path: Path, version, summary: ImportSummary, is_synthetic: bool):
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                summary.total_records += 1
                try:
                    player_name = row.get("player_name") or f"player_{summary.imported_records + 1}"
                    sample = DatasetSample(
                        dataset_version_id=version.id,
                        sample_identifier=f"stats_{player_name.lower().replace(' ', '_')}",
                        split=DataSplit.UNSPECIFIED,
                        is_synthetic=is_synthetic,
                        provenance_notes=f"Stats record for {player_name} from {path.name}",
                    )
                    db.add(sample)
                    db.flush()

                    db.add(
                        DatasetAnnotation(
                            sample_id=sample.id,
                            annotation_type="CAREER_STATISTICS",
                            label=row.get("role", "CRICKETER"),
                            confidence=1.0,
                            raw_payload={
                                "player_name": player_name,
                                "matches": int(row.get("matches", 0)),
                                "runs": int(row.get("runs", 0)),
                                "batting_avg": float(row.get("batting_avg", 0.0)),
                                "strike_rate": float(row.get("strike_rate", 0.0)),
                                "wickets": int(row.get("wickets", 0)),
                                "bowling_avg": float(row.get("bowling_avg", 0.0)),
                                "economy": float(row.get("economy", 0.0)),
                                "catches": int(row.get("catches", 0)),
                            },
                        )
                    )
                    summary.imported_records += 1
                except Exception as e:
                    summary.failed_records += 1
                    summary.errors.append(f"Stats CSV row error: {e}")
            db.commit()

    def _import_json(self, db: Session, path: Path, version, summary: ImportSummary, is_synthetic: bool):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        records = data if isinstance(data, list) else data.get("players", [])
        summary.total_records += len(records)
        for item in records:
            try:
                name = item.get("player_name") or f"player_{summary.imported_records + 1}"
                sample = DatasetSample(
                    dataset_version_id=version.id,
                    sample_identifier=f"stats_{name.lower().replace(' ', '_')}",
                    split=DataSplit.UNSPECIFIED,
                    is_synthetic=is_synthetic,
                    provenance_notes=f"Stats JSON from {path.name}",
                )
                db.add(sample)
                db.flush()

                db.add(
                    DatasetAnnotation(
                        sample_id=sample.id,
                        annotation_type="CAREER_STATISTICS",
                        label=item.get("role", "CRICKETER"),
                        confidence=1.0,
                        raw_payload=item,
                    )
                )
                summary.imported_records += 1
            except Exception as e:
                summary.failed_records += 1
                summary.errors.append(f"Stats JSON error: {e}")
        db.commit()
