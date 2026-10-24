from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.models.schemas import GenerateHandoffRequest, GenerateHandoffResponse
from app.services.context_service import aggregate_context, ContextConfigRequest
from app.services.ai import ollama_service

router = APIRouter(prefix="/api/ai", tags=["AI Inference"])

@router.get("/status")
async def get_ai_status():
    """Checks local Ollama service health and installed models."""
    return await ollama_service.check_availability()

@router.post("/generate", response_model=GenerateHandoffResponse)
async def generate_handoff(request: GenerateHandoffRequest):
    """
    Coordinates context collection and LLM inference to generate
    a strictly typed, privacy-preserving handoff note.
    """
    # 1. Collect sanitized context
    config = ContextConfigRequest(
        repo_path=request.repo_path,
        include_git=request.include_git,
        include_terminal=request.include_terminal,
        include_browser=request.include_browser,
        terminal_command_count=request.terminal_command_count,
    )
    context = aggregate_context(config)

    # 2. Invoke local Gemma inference
    try:
        note = await ollama_service.generate_handoff_note(
            context=context,
            user_notes=request.user_notes or "",
            model_override=request.model
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(e)}"
        )

    return GenerateHandoffResponse(
        status="success",
        model_used=request.model or ollama_service.model,
        note=note,
        raw_context_summary=f"Git: {bool(context.get('git'))}, Terminal: {len(context.get('terminal', {}).get('commands', []))} cmds, Browser: {len(context.get('browser', {}).get('tabs', []))} tabs"
    )
