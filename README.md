# ScoutAI — AI-Powered Cricket Talent Scouting & Assessment Backend

ScoutAI is an AI/ML-driven computer vision and biomechanical analysis backend designed to assist cricket talent scouts, coaches, and academies. It automates technical stroke assessment, action legality monitoring, movement kinematics, cohort benchmarking, and scouting evaluation management.

---

## 1. System Architecture & Rationale

ScoutAI connects computer vision pose estimation, cricket action recognition, biomechanical feature extraction, performance metric generation, and relational database persistence into a modular pipeline.

```
[Video / Dataset Source]
          │
          ▼
   [Validation & Storage]  --> MediaAsset & ClipSegment
          │
          ▼
[Skeletal Pose Estimation] --> OpenCV Kinematics / 2D/3D COCO-17 Keypoints
          │
          ▼
[Cricket Action Recognition]--> Temporal phase segmentation (Stance, Backlift, Impact, Follow-through)
          │
          ▼
[Biomechanical Extraction] --> Vector joint angles, stride ratio, head alignment, elbow extension
          │
          ▼
  [Metric Generation]      --> Standardized metrics (deg, ratio, ms) with confidence & origins
          │
          ▼
[Provisional Technique]    --> Interpretable composite score (0 - 100)
          │
          ▼
 [Database Persistence]    --> PostgreSQL / SQLite Relational Schema
          │
          ▼
    [REST API Layer]       --> FastAPI with OpenAPI/Swagger documentation
```

### Engineering Principles
- **No Scientific Pretense**: Monocular video cannot reliably provide calibrated physical measurements without ground-truth calibration. All automated technique scores are transparently tagged with `is_provisional=True` and `origin=AUTO_DETECTED`.
- **Relational Integrity**: Built on SQLAlchemy 2.0 with full support for PostgreSQL (production/Supabase-ready) and zero-dependency local SQLite.
- **Adapter-Based Dataset Ingestion**: Ingests disparate sports datasets (video, skeletal keypoints, temporal phases, statistical CSVs) into unified database models with full source attribution and licensing tracking.
- **Separation of Concerns**: Decouples model inference from business logic, metric normalization, and API routes.

---

## 2. Directory Layout

```
d:\ScoutAI\
├── .env.example                 # Environment configuration template
├── .env                         # Local configuration
├── .gitignore                   # Ignore rules for DB, uploaded videos, Python caches
├── README.md                    # System documentation
├── requirements.txt             # Locked Python dependencies
├── pytest.ini                   # Pytest configuration
├── scoutai/
│   ├── config.py                # Pydantic Settings (DB URLs, storage paths)
│   ├── database.py              # SQLAlchemy engine, session maker, dialect handling
│   ├── models/                  # SQLAlchemy ORM Models
│   │   ├── enums.py             # CricketRole, AssessmentStatus, MetricOrigin, etc.
│   │   ├── player.py            # PlayerProfile
│   │   ├── media.py             # MediaAsset, ClipSegment
│   │   ├── dataset.py           # DatasetSource, Version, Sample, Annotation, ImportJob
│   │   ├── assessment.py        # AssessmentSession
│   │   ├── cv_result.py         # ComputerVisionResult, Pose, Action, Biomechanics
│   │   ├── metric.py            # PerformanceMetric
│   │   ├── model_registry.py    # MLModelRegistry, ModelInferenceLog
│   │   └── scouting.py          # ScoutEvaluation, PlayerBenchmark, ComparisonLog
│   ├── schemas/                 # Pydantic v2 Request/Response validation models
│   ├── datasets/                # Adapter-based dataset ingestion pipeline
│   │   ├── base.py              # BaseDatasetImporter abstract class
│   │   ├── uj_aqa_cricket.py    # UJ-AQA-CricketVision importer
│   │   ├── cricpose360.py       # CricPose360 2D/3D pose skeleton importer
│   │   ├── cricshot10.py        # CricShot10 10-shot classification importer
│   │   ├── batting_shots.py     # IPL/T20 match stroke clip importer
│   │   ├── statistics.py        # Public cricket performance statistics importer
│   │   └── registry.py          # Dataset adapter registry and discovery
│   ├── pipeline/                # Computer Vision & Biomechanics Pipeline
│   │   ├── interfaces.py        # Abstract interfaces for pose, action, and features
│   │   ├── pose_engine.py       # OpenCV video decoder & kinematic pose estimator
│   │   ├── action_detector.py   # Cricket temporal phase & stroke classifier
│   │   ├── biomechanics.py      # Vector joint angles & kinematic ratios
│   │   ├── metric_generator.py  # Cricket metric generator & provisional scoring
│   │   └── assessment_runner.py # End-to-end pipeline coordinator
│   ├── services/                # Business logic and database operations
│   │   ├── player_service.py
│   │   ├── dataset_service.py
│   │   ├── media_service.py
│   │   ├── assessment_service.py
│   │   ├── scouting_service.py
│   │   └── analytics_service.py
│   ├── api/                     # FastAPI REST API routes
│   │   ├── deps.py              # Session injection
│   │   ├── router.py            # Aggregated API router
│   │   └── endpoints/           # players, media, assessments, cv, scouting, analytics
│   └── main.py                  # FastAPI entry point with CORS and lifespan events
├── scripts/
│   ├── init_db.py               # Clean database schema initialization
│   ├── seed_data.py             # Comprehensive seeder (benchmarks, datasets, synthetic demo)
│   ├── run_sample_assessment.py # CLI demonstration of complete assessment flow
│   └── sample_data/             # Concrete sample files for all 5 dataset adapters
│       ├── cricshot10_sample.csv
│       ├── uj_aqa_sample.json
│       ├── cricpose360_sample.json
│       ├── batting_shots_sample.csv
│       └── cricket_stats_sample.csv
├── storage/                     # Local file and media storage
│   ├── videos/                  # Uploaded MP4 videos
│   ├── frames/                  # Extracted keyframes
│   └── keypoints/               # Cached pose keypoints
└── tests/                       # Automated test suite (16 unit and integration tests)
    ├── conftest.py              # Test database and client fixtures
    ├── test_database.py         # ORM models and cascade tests
    ├── test_dataset_importers.py# Dataset adapter tests
    ├── test_pipeline.py         # Biomechanics and kinematics tests
    └── test_api_endpoints.py    # REST API endpoints tests
```

---

## 3. Supported Cricket Datasets

ScoutAI includes configurable, adapter-based importers for five key cricket datasets identified in literature:

| Dataset | Type / Modality | Importer Slug | Key Annotations / Metrics |
|---|---|---|---|
| **UJ-AQA-CricketVision** | Video + AQA Scores | `uj-aqa-cricketvision` | Action quality score, temporal phases, technical error flags |
| **CricPose360** | Multi-View 2D/3D Skeletons | `cricpose360` | 17/25 COCO keypoints, 3D joint coordinates, camera azimuth |
| **CricShot10** | Broadcast Video Clips | `cricshot10` | 10 shot classes (Drive, Pull, Cut, Sweep, Scoop, Defense, etc.) |
| **IPL Batting Shots** | Match Clips & Logs | `cricket-batting-shots-ipl` | Batsman, bowler, stroke type, match outcome (4, 6, dot, wicket) |
| **Public Cricket Stats** | Tabular Career Statistics | `cricket-public-stats` | Batting avg, strike rate, wickets, bowling avg, economy, catches |

Sample templates for each dataset are provided in `scripts/sample_data/` so that tests and verification run immediately without downloading multi-gigabyte archives.

---

## 4. Biomechanical Metrics & Provisional Scoring

### Extracted Biomechanical Indicators
- **Front Knee Flexion Angle (`deg`)**: $2\text{D}$ joint angle between hip, knee, and ankle at the impact frame. (Optimal range: $135^\circ - 150^\circ$).
- **Front Foot Stride Ratio (`ratio`)**: Separation between ankles normalized by shoulder-to-hip span. (Optimal range: $0.65 - 0.85$).
- **Head Over Ball Alignment Score (`0.0 - 1.0`)**: Horizontal offset between head vertex and lead knee at contact. (Optimal: $\ge 0.80$).
- **Backlift Angle (`deg`)**: Thoracic-humeral elevation angle of top hand during backswing arc.
- **Bowling Lead Knee Brace (`deg`)**: Front leg extension angle at delivery foot contact (FFC). High-pace leverage benchmark: $\ge 165^\circ$.
- **Bowling Elbow Extension (`deg`)**: Elbow deviation from straight arm during delivery swing. Measured against ICC legal threshold ($\le 15^\circ$).

### Transparent Scoring Formula
Technique scores ($0 - 100$) are calculated via interpretable rules:
$$\text{Batting Score} = 50 + (\text{Head Alignment} \times 20) + \text{Stride Bonus} (0\text{--}15) + \text{Knee Flex Bonus} (0\text{--}15)$$
$$\text{Bowling Score} = 60 + \text{Knee Brace Bonus} (0\text{--}20) + \text{Elbow Compliance} (+20 \text{ or } -25 \text{ penalty if } >15^\circ)$$

Every metric is tagged with its **Origin**:
`DIRECT_OBSERVATION` | `AUTO_DETECTED` | `MODEL_ESTIMATED` | `MANUAL_EVALUATION` | `SYNTHETIC_DEMO`.

---

## 5. Quickstart & Step-by-Step Execution

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Initialize Database Schema
Initializes all database tables in SQLite (or PostgreSQL if `DATABASE_URL` is configured in `.env`):
```bash
python scripts/init_db.py
```

### Step 3: Seed Synthetic Demonstration Data & Datasets
Populates role benchmarks, ML model registries, sample dataset records, synthetic cricketers (Arjun Verma, Kabir Khan, Devendra Patel), assessments, and coach reviews:
```bash
python scripts/seed_data.py
```

### Step 4: Run the CLI Assessment Demonstration
Demonstrates the full end-to-end pipeline (pose estimation -> action recognition -> biomechanical extraction -> metric calculation -> cohort benchmarking):
```bash
python scripts/run_sample_assessment.py
```

### Step 5: Run Automated Tests
Executes the full test suite (16 tests covering DB models, dataset adapters, kinematics, and REST API endpoints):
```bash
python -m pytest
```

### Step 6: Launch the Backend Server
```bash
uvicorn scoutai.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 6. API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health`, `/health/db` | Health check and database connectivity verification |
| `GET` | `/api/v1/players` | List cricketers with filters (`role`, `search`, `is_synthetic`) |
| `POST` | `/api/v1/players` | Create player profile |
| `GET` | `/api/v1/players/{id}` | Retrieve player profile |
| `PUT` | `/api/v1/players/{id}` | Update player profile |
| `GET` | `/api/v1/players/{id}/metrics` | Retrieve player's historical metrics |
| `GET` | `/api/v1/datasets/summary` | Aggregated dataset summary counts |
| `GET` | `/api/v1/datasets/supported` | List supported dataset adapters and expected schemas |
| `POST` | `/api/v1/datasets/import` | Trigger dataset ingestion job from disk |
| `GET` | `/api/v1/datasets/samples` | List dataset samples with pagination |
| `POST` | `/api/v1/media/upload` | Upload video file and probe resolution/FPS with OpenCV |
| `POST` | `/api/v1/assessments` | Create assessment session |
| `POST` | `/api/v1/assessments/{id}/process` | Execute computer vision & biomechanical assessment |
| `GET` | `/api/v1/assessments/{id}` | Get full assessment detail (metrics, CV results, evaluations) |
| `GET` | `/api/v1/assessments/{id}/cv-results`| Get computer vision runs and detected action phases |
| `GET` | `/api/v1/assessments/{id}/poses` | Get frame-by-frame 2D/3D pose keypoints |
| `POST` | `/api/v1/evaluations` | Log coach/scout qualitative feedback and ratings (1-10) |
| `GET` | `/api/v1/analytics/benchmarks` | Retrieve role-specific cohort benchmarks (p10, p25, p50, p75, p90) |
| `POST` | `/api/v1/analytics/compare` | Compare player metrics against benchmarks or another player |
| `GET` | `/api/v1/models` | List active models in ML Model Registry |

---

## 7. Connecting to PostgreSQL / Supabase

To connect ScoutAI to a PostgreSQL instance or Supabase project:
1. Open `.env`.
2. Update `DATABASE_URL`:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]
   ```
3. Run `python scripts/init_db.py` to create tables.
4. Run `python scripts/seed_data.py` to seed benchmarks and demo data.
