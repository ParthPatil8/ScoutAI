from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.enums import DataSplit
from scoutai.schemas.dataset import (
    DatasetSourceCreate,
    DatasetSourceResponse,
    DatasetSampleResponse,
    DatasetSummaryResponse,
    ImportJobResponse,
)
from scoutai.services.dataset_service import DatasetService
from scoutai.datasets.registry import DatasetRegistry

router = APIRouter(prefix="/datasets", tags=["Datasets"])


class ImportTriggerRequest(BaseModel):
    importer_slug: str
    source_path: str
    version_tag: str = "v1.0"
    is_synthetic: bool = False


@router.get("/summary", response_model=DatasetSummaryResponse, summary="Summary statistics of all datasets")
def get_datasets_summary(db: Session = Depends(get_db_session)):
    return DatasetService.get_summary(db)


@router.get("/supported", summary="List supported dataset adapters and expected formats")
def list_supported_datasets():
    return {
        "supported_datasets": DatasetRegistry.list_supported_datasets()
    }


@router.get("/sources", response_model=List[DatasetSourceResponse], summary="List registered dataset sources")
def list_sources(db: Session = Depends(get_db_session)):
    return DatasetService.list_sources(db)


@router.post("/sources", response_model=DatasetSourceResponse, status_code=status.HTTP_201_CREATED, summary="Register a dataset source")
def create_source(data: DatasetSourceCreate, db: Session = Depends(get_db_session)):
    return DatasetService.create_source(db, data)


@router.get("/samples", summary="List dataset samples with pagination")
def list_samples(
    version_id: Optional[str] = Query(None),
    split: Optional[DataSplit] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db_session),
):
    items, total = DatasetService.list_samples(db, version_id=version_id, split=split, skip=skip, limit=limit)
    return {
        "total": total,
        "items": [DatasetSampleResponse.model_validate(s) for s in items],
    }


@router.get("/samples/{sample_id}", response_model=DatasetSampleResponse, summary="Get dataset sample and annotations")
def get_sample(sample_id: str, db: Session = Depends(get_db_session)):
    sample = DatasetService.get_sample(db, sample_id)
    if not sample:
        raise HTTPException(status_code=404, detail="Dataset sample not found")
    return sample


@router.post("/import", summary="Execute dataset import job")
def trigger_import(req: ImportTriggerRequest, db: Session = Depends(get_db_session)):
    try:
        summary = DatasetService.run_import(
            db=db,
            importer_slug=req.importer_slug,
            source_path=req.source_path,
            version_tag=req.version_tag,
            is_synthetic=req.is_synthetic,
        )
        return {
            "status": summary.status.value,
            "importer": summary.importer_name,
            "total_records": summary.total_records,
            "imported_records": summary.imported_records,
            "failed_records": summary.failed_records,
            "errors": summary.errors[:5],
            "dataset_version_id": summary.dataset_version_id,
        }
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=400, detail=str(fnf))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import execution error: {str(e)}")


@router.get("/jobs", response_model=List[ImportJobResponse], summary="List dataset import jobs")
def list_jobs(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db_session)):
    return DatasetService.list_jobs(db, limit=limit)


@router.get("/jobs/{job_id}", response_model=ImportJobResponse, summary="Get import job status")
def get_job(job_id: str, db: Session = Depends(get_db_session)):
    job = DatasetService.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")
    return job
