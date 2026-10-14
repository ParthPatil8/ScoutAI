from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from scoutai.api.deps import get_db_session
from scoutai.schemas.media import MediaAssetResponse, ClipSegmentResponse
from scoutai.services.media_service import MediaService

router = APIRouter(prefix="/media", tags=["Media Management"])


class ClipCreateRequest(BaseModel):
    start_frame: int
    end_frame: int
    start_time_sec: float
    end_time_sec: float
    action_label: Optional[str] = None
    phase_label: Optional[str] = None


@router.post("/upload", response_model=MediaAssetResponse, status_code=status.HTTP_201_CREATED, summary="Upload video clip for assessment")
def upload_video(
    file: UploadFile = File(...),
    is_synthetic: bool = Form(False),
    db: Session = Depends(get_db_session),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")
    
    asset = MediaService.save_upload(
        db=db,
        file_obj=file.file,
        original_filename=file.filename,
        is_synthetic=is_synthetic,
    )
    return asset


@router.get("", response_model=List[MediaAssetResponse], summary="List media assets")
def list_media(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db_session),
):
    return MediaService.list_media(db, skip=skip, limit=limit)


@router.get("/{media_id}", response_model=MediaAssetResponse, summary="Get media metadata by ID")
def get_media(media_id: str, db: Session = Depends(get_db_session)):
    media = MediaService.get_media(db, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")
    return media


@router.post("/{media_id}/clips", response_model=ClipSegmentResponse, summary="Annotate clip boundary segment")
def create_clip(
    media_id: str,
    data: ClipCreateRequest,
    db: Session = Depends(get_db_session),
):
    media = MediaService.get_media(db, media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media asset not found")
    
    clip = MediaService.create_clip_segment(
        db=db,
        media_id=media_id,
        start_frame=data.start_frame,
        end_frame=data.end_frame,
        start_time_sec=data.start_time_sec,
        end_time_sec=data.end_time_sec,
        action_label=data.action_label,
        phase_label=data.phase_label,
    )
    return clip
