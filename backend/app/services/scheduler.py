import asyncio
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.core.config import settings
from app.models.db import engine
from sqlmodel import Session
from app.models.schemas import GenerateHandoffRequest
from app.services.orchestrator import handoff_orchestrator

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def scheduled_handoff_job():
    """Runs scheduled end-of-day handoff generation automatically."""
    logger.info("Executing scheduled end-of-day handoff job...")
    try:
        with Session(engine) as session:
            req = GenerateHandoffRequest(
                user_notes="[Scheduled End-of-Day Auto-Generation]"
            )
            # Run async orchestrator in synchronous worker
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            record = loop.run_until_complete(
                handoff_orchestrator.create_and_persist_handoff(req, session)
            )
            loop.close()
            logger.info(f"Successfully generated scheduled handoff #{record.id} for {record.repo_name}")
    except Exception as e:
        logger.error(f"Scheduled handoff failed: {str(e)}")

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
    except Exception as e:
        logger.error(f"Failed to start scheduler: {str(e)}")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
