from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session

from scoutai.models.dataset import (
    DatasetSource,
    DatasetVersion,
    DatasetSample,
    DatasetAnnotation,
    ImportJob,
)
from scoutai.models.enums import DataSplit, ImportJobStatus
from scoutai.schemas.dataset import DatasetSourceCreate, DatasetVersionCreate
from scoutai.datasets.registry import DatasetRegistry
from scoutai.datasets.base import ImportSummary


class DatasetService:
    @staticmethod
    def get_summary(db: Session) -> Dict[str, Any]:
        sources = db.query(DatasetSource).all()
        return {
            "total_sources": len(sources),
            "total_versions": db.query(DatasetVersion).count(),
            "total_samples": db.query(DatasetSample).count(),
            "total_annotations": db.query(DatasetAnnotation).count(),
            "sources": sources,
        }

    @staticmethod
    def list_sources(db: Session) -> List[DatasetSource]:
        return db.query(DatasetSource).all()

    @staticmethod
    def get_source_by_slug(db: Session, slug: str) -> Optional[DatasetSource]:
        return db.query(DatasetSource).filter(DatasetSource.slug == slug).first()

    @staticmethod
    def create_source(db: Session, data: DatasetSourceCreate) -> DatasetSource:
        source = DatasetSource(
            name=data.name,
            slug=data.slug,
            description=data.description,
            website_url=data.website_url,
            paper_citation=data.paper_citation,
            license_type=data.license_type,
            license_text=data.license_text,
            is_official_candidate=data.is_official_candidate,
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        return source

    @staticmethod
    def create_version(db: Session, data: DatasetVersionCreate) -> DatasetVersion:
        version = DatasetVersion(
            dataset_source_id=data.dataset_source_id,
            version_tag=data.version_tag,
            release_date=data.release_date,
            format_type=data.format_type,
            total_samples=data.total_samples,
            metadata_payload=data.metadata_payload,
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        return version

    @staticmethod
    def list_samples(
        db: Session,
        version_id: Optional[str] = None,
        split: Optional[DataSplit] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[DatasetSample], int]:
        query = db.query(DatasetSample)
        if version_id:
            query = query.filter(DatasetSample.dataset_version_id == version_id)
        if split:
            query = query.filter(DatasetSample.split == split)
        
        total = query.count()
        items = query.order_by(DatasetSample.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_sample(db: Session, sample_id: str) -> Optional[DatasetSample]:
        return db.query(DatasetSample).filter(DatasetSample.id == sample_id).first()

    @staticmethod
    def run_import(
        db: Session,
        importer_slug: str,
        source_path: str,
        version_tag: str = "v1.0",
        is_synthetic: bool = False,
    ) -> ImportSummary:
        importer = DatasetRegistry.get_importer(importer_slug)
        if not importer:
            raise ValueError(f"No importer found for slug '{importer_slug}'.")

        path = Path(source_path)
        if not path.exists():
            raise FileNotFoundError(f"Source file or directory does not exist: {source_path}")

        return importer.import_data(db, path, version_tag=version_tag, is_synthetic=is_synthetic)

    @staticmethod
    def list_jobs(db: Session, limit: int = 20) -> List[ImportJob]:
        return db.query(ImportJob).order_by(ImportJob.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_job(db: Session, job_id: str) -> Optional[ImportJob]:
        return db.query(ImportJob).filter(ImportJob.id == job_id).first()
