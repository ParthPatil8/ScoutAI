from pathlib import Path


def test_health_endpoints(client):
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"

    r2 = client.get("/health/db")
    assert r2.status_code == 200
    assert r2.json()["status"] == "connected"


def test_player_endpoints(client):
    # 1. Create player
    payload = {
        "first_name": "Surya",
        "last_name": "Kumar",
        "primary_role": "BATSMAN",
        "batting_hand": "RIGHT_HAND",
        "bowling_style": "RIGHT_ARM_MEDIUM",
        "height_cm": 177.0,
        "weight_kg": 72.0,
        "is_synthetic": True,
    }
    res = client.post("/api/v1/players", json=payload)
    assert res.status_code == 201
    player_data = res.json()
    player_id = player_data["id"]
    assert player_data["display_name"] == "Surya Kumar"

    # 2. Get player
    get_res = client.get(f"/api/v1/players/{player_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == player_id

    # 3. List players
    list_res = client.get("/api/v1/players?role=BATSMAN")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 4. Update player
    update_res = client.put(f"/api/v1/players/{player_id}", json={"scout_notes": "360-degree stroke maker"})
    assert update_res.status_code == 200
    assert update_res.json()["scout_notes"] == "360-degree stroke maker"


def test_datasets_endpoints(client):
    # Supported datasets
    sup_res = client.get("/api/v1/datasets/supported")
    assert sup_res.status_code == 200
    assert len(sup_res.json()["supported_datasets"]) >= 5

    # Summary
    sum_res = client.get("/api/v1/datasets/summary")
    assert sum_res.status_code == 200


def test_assessment_flow_and_processing(client):
    # 1. Create a player for the assessment
    p_res = client.post("/api/v1/players", json={
        "first_name": "Rahul",
        "last_name": "Dravid",
        "primary_role": "BATSMAN",
        "is_synthetic": True,
    })
    player_id = p_res.json()["id"]

    # 2. Create assessment session
    a_res = client.post("/api/v1/assessments", json={
        "player_id": player_id,
        "session_name": "Defensive Technique Analysis",
        "assessment_type": "BATTING_TECHNIQUE",
        "is_synthetic": True,
    })
    assert a_res.status_code == 201
    assessment_id = a_res.json()["id"]
    assert a_res.json()["status"] == "DRAFT"

    # 3. Process assessment pipeline
    proc_res = client.post(f"/api/v1/assessments/{assessment_id}/process", json={
        "model_identifier": "cricket-kinematics-v1",
        "force_reprocess": True,
    })
    assert proc_res.status_code == 200
    proc_data = proc_res.json()
    assert proc_data["status"] == "COMPLETED"
    assert proc_data["metrics_generated"] > 0
    assert proc_data["overall_score"] is not None

    # 4. Retrieve assessment detail
    det_res = client.get(f"/api/v1/assessments/{assessment_id}")
    assert det_res.status_code == 200
    det_data = det_res.json()
    assert det_data["status"] == "COMPLETED"
    assert len(det_data["metrics"]) > 0
    assert len(det_data["cv_results"]) > 0

    # 5. Check CV results and poses endpoint
    cv_res = client.get(f"/api/v1/assessments/{assessment_id}/cv-results")
    assert cv_res.status_code == 200
    assert len(cv_res.json()) >= 1

    poses_res = client.get(f"/api/v1/assessments/{assessment_id}/poses")
    assert poses_res.status_code == 200
    assert len(poses_res.json()) > 0


def test_scout_evaluations_and_analytics(client):
    # Create player
    p_res = client.post("/api/v1/players", json={
        "first_name": "Jasprit",
        "last_name": "Bumrah",
        "primary_role": "BOWLER",
        "bowling_style": "RIGHT_ARM_FAST",
        "is_synthetic": True,
    })
    player_id = p_res.json()["id"]

    # Post evaluation
    eval_res = client.post("/api/v1/evaluations", json={
        "player_id": player_id,
        "evaluator_name": "Coach Gillespie",
        "technical_rating": 9.5,
        "tactical_rating": 9.2,
        "physical_rating": 9.0,
        "mental_rating": 9.6,
        "overall_rating": 9.4,
        "scout_recommendation": "SHORTLIST",
        "strengths": "Unique hyperextension whip action, deadly yorker precision",
        "is_synthetic": True,
    })
    assert eval_res.status_code == 201
    assert eval_res.json()["scout_recommendation"] == "SHORTLIST"

    # List evaluations
    list_eval = client.get(f"/api/v1/evaluations?player_id={player_id}")
    assert list_eval.status_code == 200
    assert len(list_eval.json()) == 1

    # Benchmarks
    b_res = client.get("/api/v1/analytics/benchmarks")
    assert b_res.status_code == 200

    # Comparison
    comp_res = client.post("/api/v1/analytics/compare", json={
        "player_id": player_id,
        "benchmark_level": "ACADEMY",
    })
    assert comp_res.status_code == 200
    assert "metrics" in comp_res.json()
    assert "scout_verdict" in comp_res.json()
