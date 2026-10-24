from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="Tomorrow-Me Handoff API",
    description="Local daemon service for generating intelligent end-of-day developer handoff notes.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
