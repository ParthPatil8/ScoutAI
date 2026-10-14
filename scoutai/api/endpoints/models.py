from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.models.model_registry import MLModelRegistry
from scoutai.schemas.model_registry import (
    MLModelRegistryCreate,
    MLModelRegistryResponse,
)

router = APIRouter(prefix="/models", tags=["Model Registry"])


@router.get("", response_model=List[MLModelRegistryResponse], summary="List registered computer vision models")
def list_models(db: Session = Depends(get_db_session)):
    return db.query(MLModelRegistry).filter_by(is_active=True).all()


@router.post("", response_model=MLModelRegistryResponse, status_code=status.HTTP_201_CREATED, summary="Register new ML model specification")
def register_model(data: MLModelRegistryCreate, db: Session = Depends(get_db_session)):
    existing = db.query(MLModelRegistry).filter_by(model_identifier=data.model_identifier).first()
    if existing:
        raise HTTPException(status_code=400, detail="Model identifier already registered")

    model = MLModelRegistry(
        model_identifier=data.model_identifier,
        name=data.name,
        task_type=data.task_type,
        version=data.version,
        architecture=data.architecture,
        framework=data.framework,
        input_spec=data.input_spec,
        output_spec=data.output_spec,
        license=data.license,
        is_active=data.is_active,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


@router.get("/{model_id}", response_model=MLModelRegistryResponse, summary="Get model metadata by ID")
def get_model(model_id: str, db: Session = Depends(get_db_session)):
    model = db.query(MLModelRegistry).filter_by(id=model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model
