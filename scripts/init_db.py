import sys
from pathlib import Path

# Ensure root directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from scoutai.database import Base, engine
import scoutai.models  # Ensures all models are registered
from scoutai.config import settings


def init_database() -> None:
    print(f"Initializing ScoutAI Database on: {settings.DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_database()
