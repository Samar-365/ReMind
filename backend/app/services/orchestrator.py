import json
from typing import Optional, Dict, Any
from app.models.schemas import (
    GenerateHandoffRequest,
    HandoffNote,
)
from app.models.db import HandoffRecord, engine
from sqlmodel import Session
from app.services.context_service import aggregate_context, ContextConfigRequest
from app.services.ai import ollama_service

class HandoffOrchestrator:
    async def create_and_persist_handoff(
        self,
        request: GenerateHandoffRequest,
        session: Session
    ) -> HandoffRecord:
        """
        Executes end-to-end pipeline:
        1. Collects & sanitizes Git, Terminal, Browser contexts
        2. Invokes local Gemma inference via Ollama
        3. Validates against 7-section schema
        4. Persists record in SQLite
        """
        # 1. Aggregate sanitized context
        config = ContextConfigRequest(
            repo_path=request.repo_path,
            include_git=request.include_git,
            include_terminal=request.include_terminal,
            include_browser=request.include_browser,
            terminal_command_count=request.terminal_command_count,
        )
        context = aggregate_context(config)

        repo_name = "workspace"
        repo_path = request.repo_path or "."
        branch = "unknown"

        if context.get("git") and context["git"].get("is_repo"):
            repo_name = context["git"].get("repo_name", "workspace")
            branch = context["git"].get("branch", "unknown")

        # 2. Invoke AI inference
        model_name = request.model or ollama_service.model
        note: HandoffNote = await ollama_service.generate_handoff_note(
            context=context,
            user_notes=request.user_notes or "",
            model_override=request.model
        )

        # 3. Create raw context summary string
        git_stat = context.get("git", {}).get("diff_stat", "No diffs") if context.get("git") else "Git disabled"
        term_count = len(context.get("terminal", {}).get("commands", [])) if context.get("terminal") else 0
        tab_count = len(context.get("browser", {}).get("tabs", [])) if context.get("browser") else 0
        raw_summary = f"Branch: {branch} | Diffs: {git_stat.strip()[:60]} | Terminal: {term_count} cmds | Tabs: {tab_count}"

        # 4. Save to Database
        record = HandoffRecord(
            repo_name=repo_name,
            repo_path=repo_path,
            branch=branch,
            handoff_json=note.model_dump_json(),
            raw_context_summary=raw_summary,
            user_notes=request.user_notes,
            model_used=model_name,
        )

        session.add(record)
        session.commit()
        session.refresh(record)

        return record

handoff_orchestrator = HandoffOrchestrator()
