from fastapi import APIRouter
from app.core.config import settings
from app.services.scheduler import scheduler, scheduled_handoff_job
from app.services.notifier import send_desktop_notification
from pydantic import BaseModel

router = APIRouter(prefix="/api/scheduler", tags=["Scheduler"])

class SchedulerStatusResponse(BaseModel):
    is_active: bool
    scheduled_time: str
    auto_generate: bool
    jobs: list[str]

@router.get("/status", response_model=SchedulerStatusResponse)
def get_scheduler_status():
    """Returns current scheduler state and configured cron jobs."""
    job_names = [j.name for j in scheduler.get_jobs()] if scheduler.running else []
    return SchedulerStatusResponse(
        is_active=scheduler.running,
        scheduled_time=settings.SCHEDULED_TIME,
        auto_generate=settings.AUTO_GENERATE_SCHEDULE,
        jobs=job_names,
    )

@router.post("/test-notification")
def trigger_test_notification():
    """Dispatches a test desktop notification to verify OS integration."""
    send_desktop_notification(
        title="Tomorrow-Me Notification Test 🔔",
        message="Desktop notification system is connected and working properly!"
    )
    return {"status": "success", "message": "Notification dispatched"}
