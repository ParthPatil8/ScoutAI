from pathlib import Path
from scoutai.datasets.registry import DatasetRegistry
from scoutai.datasets.cricshot10 import CricShot10Importer
from scoutai.datasets.uj_aqa_cricket import UJAQACricketVisionImporter
from scoutai.datasets.cricpose360 import CricPose360Importer
from scoutai.datasets.batting_shots import CricketBattingShotsImporter
from scoutai.datasets.statistics import CricketStatisticsImporter
from scoutai.models.enums import ImportJobStatus

SAMPLE_DIR = Path(__file__).resolve().parent.parent / "scripts" / "sample_data"


def test_registry_discovery():
    supported = DatasetRegistry.list_supported_datasets()
    assert len(supported) >= 5
    slugs = [d["slug"] for d in supported]
    assert "cricshot10" in slugs
    assert "uj-aqa-cricketvision" in slugs
    assert "cricpose360" in slugs
    assert "cricket-batting-shots-ipl" in slugs
    assert "cricket-public-stats" in slugs


def test_cricshot10_import(db):
    importer = CricShot10Importer()
    csv_file = SAMPLE_DIR / "cricshot10_sample.csv"
    assert importer.validate_source(csv_file)

    summary = importer.import_data(db, csv_file, version_tag="test_v1", is_synthetic=True)
    assert summary.status == ImportJobStatus.COMPLETED
    assert summary.imported_records > 0
    assert summary.total_records == summary.imported_records


def test_uj_aqa_import(db):
    importer = UJAQACricketVisionImporter()
    json_file = SAMPLE_DIR / "uj_aqa_sample.json"
    assert importer.validate_source(json_file)

    summary = importer.import_data(db, json_file, version_tag="test_v1", is_synthetic=True)
    assert summary.status == ImportJobStatus.COMPLETED
    assert summary.imported_records == 3


def test_cricpose360_import(db):
    importer = CricPose360Importer()
    json_file = SAMPLE_DIR / "cricpose360_sample.json"
    assert importer.validate_source(json_file)

    summary = importer.import_data(db, json_file, version_tag="test_v1", is_synthetic=True)
    assert summary.status == ImportJobStatus.COMPLETED
    assert summary.imported_records == 2


def test_cricket_stats_import(db):
    importer = CricketStatisticsImporter()
    csv_file = SAMPLE_DIR / "cricket_stats_sample.csv"
    assert importer.validate_source(csv_file)

    summary = importer.import_data(db, csv_file, version_tag="test_v1", is_synthetic=True)
    assert summary.status == ImportJobStatus.COMPLETED
    assert summary.imported_records == 6


def test_missing_file_error_handling(db):
    importer = CricShot10Importer()
    fake_path = Path("non_existent_cricket_file.csv")
    assert not importer.validate_source(fake_path)
