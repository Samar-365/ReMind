import asyncio
import logging
from datetime import datetime, timezone, date
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlmodel import Session, select, col
from app.core.config import settings
from app.models.db import engine, HandoffRecord
from app.models.schemas import GenerateHandoffRequest
from app.services.orchestrator import handoff_orchestrator
from app.services.notifier import send_desktop_notification

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def has_handoff_generated_today(session: Session) -> bool:
    """Checks if a handoff was already created today to prevent redundant auto-triggers."""
    today = datetime.now(timezone.utc).date()
    # Check latest records
    records = session.exec(
        select(HandoffRecord).order_by(col(HandoffRecord.created_at).desc()).limit(10)
    ).all()
    for r in records:
        if r.created_at.date() == today:
            return True
    return False

def scheduled_handoff_job():
    """Runs scheduled end-of-day handoff generation automatically and sends notification."""
    logger.info("Executing scheduled end-of-day handoff job...")
    try:
        with Session(engine) as session:
            req = GenerateHandoffRequest(
                user_notes="[Scheduled End-of-Day Auto-Generation]"
            )
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            record = loop.run_until_complete(
                handoff_orchestrator.create_and_persist_handoff(req, session)
            )
            loop.close()

            logger.info(f"Successfully generated scheduled handoff #{record.id} for {record.repo_name}")
            
            # Send desktop notification
            send_desktop_notification(
                title="Tomorrow-Me Handoff Ready 🌙",
                message=f"End-of-day handoff note generated for {record.repo_name}. Open dashboard to review."
            )
    except Exception as e:
        logger.error(f"Scheduled handoff failed: {str(e)}")

def check_offline_missed_schedule():
    """
    FR-07 Graceful offline handling:
    If the daemon boots up after the scheduled time and no note has been generated today,
    prompt or trigger recovery if auto-schedule is enabled.
    """
    if not settings.AUTO_GENERATE_SCHEDULE:
        return

    try:
        time_parts = settings.SCHEDULED_TIME.split(":")
        scheduled_hour = int(time_parts[0])
        now = datetime.now()

        if now.hour >= scheduled_hour:
            with Session(engine) as session:
                if not has_handoff_generated_today(session):
                    logger.info("Missed scheduled handoff while daemon was offline. Dispatching recovery job...")
                    scheduled_handoff_job()
    except Exception as e:
        logger.warning(f"Offline schedule check failed: {str(e)}")

def start_scheduler():
    """Configures and starts background scheduler based on settings."""
    if not settings.AUTO_GENERATE_SCHEDULE:
        logger.info("Automated scheduled handoff is disabled in configuration.")
        return

    try:
        time_parts = settings.SCHEDULED_TIME.split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1]) if len(time_parts) > 1 else 0

        scheduler.add_job(
            scheduled_handoff_job,
            trigger=CronTrigger(hour=hour, minute=minute),
            id="end_of_day_handoff",
            name="Daily Developer Handoff",
            replace_existing=True
        )
        scheduler.start()
        logger.info(f"Handoff scheduler active: daily at {hour:02d}:{minute:02d}")

        # Check if missed today during offline/sleep state
        check_offline_missed_schedule()
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
