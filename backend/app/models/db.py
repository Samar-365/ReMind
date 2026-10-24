import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, create_engine, Session
from app.core.config import settings

class HandoffRecord(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    repo_name: str = Field(index=True)
    repo_path: str
    branch: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    
    # Serialized JSON representations
    handoff_json: str  # Validated HandoffNote stored as JSON string
    raw_context_summary: Optional[str] = None
    user_notes: Optional[str] = None
    
    # Metadata & Flags
    model_used: str = Field(default="gemma2:2b")
    is_favorite: bool = Field(default=False)
    tags: Optional[str] = Field(default="")

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
