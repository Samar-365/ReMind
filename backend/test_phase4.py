import pytest
from sqlmodel import Session, select
from app.models.db import init_db, engine, HandoffRecord
from app.models.schemas import HandoffNote, ProblemArea
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_db_initialization_and_crud():
    init_db()
    with Session(engine) as session:
        # Create
        note = HandoffNote(
            current_task="Unit testing Phase 4 persistence",
            progress=["Created DB schema and CRUD endpoints"],
            current_state="Database tables functioning correctly",
            blockers=[],
            likely_problem_areas=[
                ProblemArea(hypothesis="Potential lock with SQLite concurrency", cited_evidence="check_same_thread=False")
            ],
            next_steps=["Test REST endpoints"],
            relevant_files=["backend/app/models/db.py"],
            relevant_commands=["pytest test_phase4.py"]
        )
        record = HandoffRecord(
            repo_name="ReMind",
            repo_path=".",
            branch="main",
            handoff_json=note.model_dump_json(),
            user_notes="Testing DB layer"
        )
        session.add(record)
        session.commit()
        session.refresh(record)

        assert record.id is not None
        record_id = record.id

        # Read
        fetched = session.get(HandoffRecord, record_id)
        assert fetched is not None
        assert fetched.repo_name == "ReMind"

        # Update
        fetched.is_favorite = True
        session.add(fetched)
        session.commit()

        # Verify
        updated = session.get(HandoffRecord, record_id)
        assert updated.is_favorite is True

        # Clean up
        session.delete(updated)
        session.commit()

def test_rest_api_endpoints():
    # 1. Health endpoint
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

    # 2. List endpoint
    res = client.get("/api/handoff/list")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # 3. Aggregated context
    res = client.post("/api/context/aggregate", json={"include_git": True, "include_terminal": True, "include_browser": True})
    assert res.status_code == 200
    assert "git" in res.json()

if __name__ == "__main__":
    test_db_initialization_and_crud()
    test_rest_api_endpoints()
    print("Phase 4 persistence and API tests passed successfully!")
