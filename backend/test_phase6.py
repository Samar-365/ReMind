from app.services.notifier import send_desktop_notification
from app.services.scheduler import has_handoff_generated_today, scheduler
from app.models.db import init_db, engine
from sqlmodel import Session
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_notification_dispatch():
    # Should execute without throwing any exception across operating systems
    send_desktop_notification(
        title="Test Title",
        message="Test message from unit test"
    )

def test_has_handoff_today():
    init_db()
    with Session(engine) as session:
        # Check function doesn't crash
        res = has_handoff_generated_today(session)
        assert isinstance(res, bool)

def test_scheduler_api():
    res = client.get("/api/scheduler/status")
    assert res.status_code == 200
    data = res.json()
    assert "scheduled_time" in data
    assert "auto_generate" in data

    # Test notification trigger endpoint
    notif_res = client.post("/api/scheduler/test-notification")
    assert notif_res.status_code == 200
    assert notif_res.json()["status"] == "success"

if __name__ == "__main__":
    test_notification_dispatch()
    test_has_handoff_today()
    test_scheduler_api()
    print("Phase 6 automation and scheduler tests passed successfully!")
