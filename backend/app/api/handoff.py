import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, col
from app.models.db import HandoffRecord, get_session
from app.models.schemas import (
    GenerateHandoffRequest,
    HandoffNote,
)
from app.services.orchestrator import handoff_orchestrator
from pydantic import BaseModel

router = APIRouter(prefix="/api/handoff", tags=["Handoff Notes"])

class HandoffListItem(BaseModel):
    id: int
    repo_name: str
    repo_path: str
    branch: Optional[str]
    created_at: datetime
    model_used: str
    is_favorite: bool
    current_task: str
    raw_context_summary: Optional[str]

class HandoffDetail(BaseModel):
    id: int
    repo_name: str
    repo_path: str
    branch: Optional[str]
    created_at: datetime
    model_used: str
    is_favorite: bool
    user_notes: Optional[str]
    raw_context_summary: Optional[str]
    note: HandoffNote

class UpdateHandoffRequest(BaseModel):
    note: Optional[HandoffNote] = None
    user_notes: Optional[str] = None
    is_favorite: Optional[bool] = None

@router.post("/generate", response_model=HandoffDetail)
async def generate_and_save_handoff(
    request: GenerateHandoffRequest,
    session: Session = Depends(get_session)
):
    """
    Triggers end-to-end pipeline: extracts context, invokes Gemma 2, validates schema,
    persists in SQLite, and returns stored note.
    """
    try:
        record = await handoff_orchestrator.create_and_persist_handoff(request, session)
        parsed_note = HandoffNote.model_validate_json(record.handoff_json)
        return HandoffDetail(
            id=record.id,
            repo_name=record.repo_name,
            repo_path=record.repo_path,
            branch=record.branch,
            created_at=record.created_at,
            model_used=record.model_used,
            is_favorite=record.is_favorite,
            user_notes=record.user_notes,
            raw_context_summary=record.raw_context_summary,
            note=parsed_note
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Handoff generation failed: {str(e)}")

@router.get("/list", response_model=List[HandoffListItem])
def list_handoffs(
    repo_name: Optional[str] = Query(None, description="Filter by repository name"),
    search: Optional[str] = Query(None, description="Search keyword in task summary"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session)
):
    """Retrieves paginated handoff notes history with optional search and repo filtering."""
    query = select(HandoffRecord).order_by(col(HandoffRecord.created_at).desc())

    if repo_name:
        query = query.where(col(HandoffRecord.repo_name).ilike(f"%{repo_name}%"))

    records = session.exec(query.offset(offset).limit(limit)).all()

    items = []
    for r in records:
        task = "Unknown task"
        try:
            parsed = json.loads(r.handoff_json)
            task = parsed.get("current_task", "No task summary")
        except Exception:
            pass

        if search and search.lower() not in task.lower() and search.lower() not in (r.user_notes or "").lower():
            continue

        items.append(
            HandoffListItem(
                id=r.id,
                repo_name=r.repo_name,
                repo_path=r.repo_path,
                branch=r.branch,
                created_at=r.created_at,
                model_used=r.model_used,
                is_favorite=r.is_favorite,
                current_task=task,
                raw_context_summary=r.raw_context_summary
            )
        )
    return items

@router.get("/{id}", response_model=HandoffDetail)
def get_handoff(id: int, session: Session = Depends(get_session)):
    """Retrieves a single handoff note by ID."""
    record = session.get(HandoffRecord, id)
    if not record:
        raise HTTPException(status_code=404, detail="Handoff note not found")

    parsed_note = HandoffNote.model_validate_json(record.handoff_json)
    return HandoffDetail(
        id=record.id,
        repo_name=record.repo_name,
        repo_path=record.repo_path,
        branch=record.branch,
        created_at=record.created_at,
        model_used=record.model_used,
        is_favorite=record.is_favorite,
        user_notes=record.user_notes,
        raw_context_summary=record.raw_context_summary,
        note=parsed_note
    )

@router.put("/{id}", response_model=HandoffDetail)
def update_handoff(
    id: int,
    updates: UpdateHandoffRequest,
    session: Session = Depends(get_session)
):
    """Updates, annotates, or favorites an existing handoff note."""
    record = session.get(HandoffRecord, id)
    if not record:
        raise HTTPException(status_code=404, detail="Handoff note not found")

    if updates.note is not None:
        record.handoff_json = updates.note.model_dump_json()

    if updates.user_notes is not None:
        record.user_notes = updates.user_notes

    if updates.is_favorite is not None:
        record.is_favorite = updates.is_favorite

    session.add(record)
    session.commit()
    session.refresh(record)

    parsed_note = HandoffNote.model_validate_json(record.handoff_json)
    return HandoffDetail(
        id=record.id,
        repo_name=record.repo_name,
        repo_path=record.repo_path,
        branch=record.branch,
        created_at=record.created_at,
        model_used=record.model_used,
        is_favorite=record.is_favorite,
        user_notes=record.user_notes,
        raw_context_summary=record.raw_context_summary,
        note=parsed_note
    )

@router.delete("/{id}")
def delete_handoff(id: int, session: Session = Depends(get_session)):
    """Deletes a handoff note."""
    record = session.get(HandoffRecord, id)
    if not record:
        raise HTTPException(status_code=404, detail="Handoff note not found")

    session.delete(record)
    session.commit()
    return {"status": "success", "message": f"Deleted note #{id}"}
