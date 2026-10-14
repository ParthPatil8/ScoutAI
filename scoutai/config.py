from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """ScoutAI Application Configuration."""

    APP_NAME: str = "ScoutAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    API_V1_STR: str = "/api/v1"

    # Database
    # Default uses SQLite for zero-config local run; supports PostgreSQL / Supabase
    DATABASE_URL: str = "sqlite:///./scoutai.db"

    # File and media storage paths
    STORAGE_DIR: str = "./storage"
    MAX_UPLOAD_SIZE_BYTES: int = 500 * 1024 * 1024  # 500 MB

    # Model inference settings
    CV_DEVICE: str = "cpu"
    CONFIDENCE_THRESHOLD: float = 0.50

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def storage_path(self) -> Path:
        p = Path(self.STORAGE_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def video_dir(self) -> Path:
        p = self.storage_path / "videos"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def frames_dir(self) -> Path:
        p = self.storage_path / "frames"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def keypoints_dir(self) -> Path:
        p = self.storage_path / "keypoints"
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
