from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from scoutai.models.dataset import DatasetSource, DatasetVersion, ImportJob
from scoutai.models.enums import ImportJobStatus


@dataclass
class ImportSummary:
    importer_name: str
    source_path: str
    dataset_version_id: str
    total_records: int = 0
    imported_records: int = 0
    failed_records: int = 0
    errors: List[str] = field(default_factory=list)
    logs: List[str] = field(default_factory=list)
    status: ImportJobStatus = ImportJobStatus.COMPLETED


class BaseDatasetImporter(ABC):
    """Abstract base class for all ScoutAI cricket dataset importers."""

    @property
    @abstractmethod
    def slug(self) -> str:
        """Unique slug identifier for the dataset."""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of the dataset."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Comprehensive description of the dataset."""
        pass

    @property
    @abstractmethod
    def license_type(self) -> str:
        """License designation (e.g. CC BY-NC 4.0, Research Only)."""
        pass

    @property
    @abstractmethod
    def paper_citation(self) -> Optional[str]:
        """Academic citation or reference publication."""
        pass

    @property
    @abstractmethod
    def expected_format_description(self) -> str:
        """Description of expected input structure, files, and schemas."""
        pass

    @abstractmethod
    def validate_source(self, path: Path) -> bool:
        """Check if the provided path or directory satisfies importer requirements."""
        pass

    def get_or_create_source(self, db: Session) -> DatasetSource:
        """Get or create the top-level DatasetSource record in DB."""
        source = db.query(DatasetSource).filter_by(slug=self.slug).first()
        if not source:
            source = DatasetSource(
                name=self.name,
                slug=self.slug,
                description=self.description,
                license_type=self.license_type,
                paper_citation=self.paper_citation,
                is_official_candidate=True,
            )
            db.add(source)
            db.commit()
            db.refresh(source)
        return source

    def create_version_and_job(
        self, db: Session, version_tag: str, source_path: str, format_type: str
    ) -> tuple[DatasetVersion, ImportJob]:
        """Initialize version and import job tracking."""
        source = self.get_or_create_source(db)
        version = (
            db.query(DatasetVersion)
            .filter_by(dataset_source_id=source.id, version_tag=version_tag)
            .first()
        )
        if not version:
            version = DatasetVersion(
                dataset_source_id=source.id,
                version_tag=version_tag,
                format_type=format_type,
                total_samples=0,
            )
            db.add(version)
            db.commit()
            db.refresh(version)

        job = ImportJob(
            dataset_version_id=version.id,
            importer_name=self.name,
            source_path=str(source_path),
            status=ImportJobStatus.RUNNING,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return version, job

    @abstractmethod
    def import_data(
        self,
        db: Session,
        path: Path,
        version_tag: str = "v1.0",
        is_synthetic: bool = False,
    ) -> ImportSummary:
        """Execute ingestion from disk into database."""
        pass
