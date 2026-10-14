import os
import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from scoutai.database import Base
from scoutai.main import app
from scoutai.api.deps import get_db_session
from scoutai.models.enums import CricketRole, BenchmarkLevel
from scoutai.models.scouting import PlayerBenchmark

TEST_DB_URL = "sqlite:///./scoutai_test.db"

test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Pre-seed minimal benchmarks for tests
    db = TestingSessionLocal()
    b = PlayerBenchmark(
        role=CricketRole.BATSMAN,
        level=BenchmarkLevel.ACADEMY,
        metric_name="front_knee_flexion_angle",
        p10=125.0,
        p25=132.0,
        p50=142.0,
        p75=148.0,
        p90=154.0,
        unit="deg",
    )
    db.add(b)
    db.commit()
    db.close()
    
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./scoutai_test.db"):
        try:
            os.remove("./scoutai_test.db")
        except Exception:
            pass


@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db_session] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
