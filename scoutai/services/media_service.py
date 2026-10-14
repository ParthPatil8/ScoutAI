import hashlib
import uuid
import shutil
from pathlib import Path
from typing import Optional, List
import cv2
from sqlalchemy.orm import Session

from scoutai.models.media import MediaAsset, ClipSegment
from scoutai.models.enums import MediaProcessingStatus
from scoutai.config import settings


class MediaService:
    @staticmethod
    def save_upload(
        db: Session,
        file_obj,
        original_filename: str,
        is_synthetic: bool = False,
    ) -> MediaAsset:
        ext = Path(original_filename).suffix.lower() or ".mp4"
        asset_id = str(uuid.uuid4())
        dest_filename = f"{asset_id}{ext}"
        dest_path = settings.video_dir / dest_filename

        # Write to disk and calculate SHA256 simultaneously
        hasher = hashlib.sha256()
        file_size = 0
        with open(dest_path, "wb") as out_f:
            while chunk := file_obj.read(1024 * 1024):  # 1MB chunks
                hasher.update(chunk)
                file_size += len(chunk)
                out_f.write(chunk)

        sha256 = hasher.hexdigest()

        # Probe video properties with OpenCV
        duration_sec = None
        fps = None
        frame_count = None
        width = None
        height = None

        try:
            cap = cv2.VideoCapture(str(dest_path))
            if cap.isOpened():
                fps = float(cap.get(cv2.CAP_PROP_FPS) or 30.0)
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
                if fps > 0 and frame_count > 0:
                    duration_sec = round(frame_count / fps, 2)
                cap.release()
        except Exception:
            pass  # Fall back to None if non-video file or probe failed

        asset = MediaAsset(
            id=asset_id,
            original_filename=original_filename,
            file_path=str(dest_path),
            file_size_bytes=file_size,
            mime_type="video/mp4" if ext in [".mp4", ".mov", ".avi", ".mkv"] else "application/octet-stream",
            duration_sec=duration_sec,
            fps=fps,
            frame_count=frame_count,
            width=width,
            height=height,
            checksum_sha256=sha256,
            storage_provider="LOCAL",
            processing_status=MediaProcessingStatus.UPLOADED,
            is_synthetic=is_synthetic,
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)
        return asset

    @staticmethod
    def get_media(db: Session, media_id: str) -> Optional[MediaAsset]:
        return db.query(MediaAsset).filter(MediaAsset.id == media_id).first()

    @staticmethod
    def list_media(db: Session, skip: int = 0, limit: int = 50) -> List[MediaAsset]:
        return db.query(MediaAsset).order_by(MediaAsset.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create_clip_segment(
        db: Session,
        media_id: str,
        start_frame: int,
        end_frame: int,
        start_time_sec: float,
        end_time_sec: float,
        action_label: Optional[str] = None,
        phase_label: Optional[str] = None,
    ) -> ClipSegment:
        clip = ClipSegment(
            media_asset_id=media_id,
            start_frame=start_frame,
            end_frame=end_frame,
            start_time_sec=start_time_sec,
            end_time_sec=end_time_sec,
            action_label=action_label,
            phase_label=phase_label,
        )
        db.add(clip)
        db.commit()
        db.refresh(clip)
        return clip
