from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from contextlib import asynccontextmanager
from app.models.db import init_db
from app.services.scheduler import start_scheduler, stop_scheduler
from app.api.context import router as context_router
from app.api.ai import router as ai_router
from app.api.handoff import router as handoff_router
from app.api.scheduler import router as scheduler_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Init database tables and start background scheduler
    init_db()
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()

app = FastAPI(
    title="Tomorrow-Me Handoff API",
    description="Local daemon service for generating intelligent end-of-day developer handoff notes.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(context_router)
app.include_router(ai_router)
app.include_router(handoff_router)
app.include_router(scheduler_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Tomorrow-Me Handoff Daemon",
        "model": settings.OLLAMA_MODEL,
        "ollama_url": settings.OLLAMA_BASE_URL,
    }

@app.get("/")
def root():
    return {
        "message": "Tomorrow-Me Handoff (ReMind) Backend is running.",
        "docs_url": "/docs",
    }

