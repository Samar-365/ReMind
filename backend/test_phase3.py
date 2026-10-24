import asyncio
import httpx
from app.models.schemas import HandoffNote, ProblemArea
from app.core.prompts import build_handoff_user_prompt
from app.services.ai import ollama_service

def test_prompt_generation():
    mock_context = {
        "git": {
            "is_repo": True,
            "repo_name": "ReMind",
            "branch": "main",
            "status": {"staged": ["backend/app/main.py"], "unstaged": [], "untracked": []},
            "diff_stat": " 1 file changed, 10 insertions(+)",
            "diff_content": "+ from app.api.context import router",
            "recent_commits": ["b66a4d1 feat: phase 2 context collectors"]
        },
        "terminal": {
            "available": True,
            "commands": ["git status", "pytest test_phase2.py"]
        },
        "browser": {
            "available": True,
            "tabs": [{"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com"}]
        }
    }
    prompt = build_handoff_user_prompt(mock_context, "Finishing phase 2 collectors")
    assert "ReMind" in prompt
    assert "FastAPI Docs" in prompt
    assert "pytest test_phase2.py" in prompt

def test_schema_validation():
    mock_json = {
        "current_task": "Building local AI handoff notes",
        "progress": ["Implemented Git, Terminal and Browser collectors"],
        "current_state": "Collectors working, testing AI schema",
        "blockers": [],
        "likely_problem_areas": [
            {
                "hypothesis": "Ollama model timeout on large diffs",
                "cited_evidence": "Diff truncator caps diffs at 24k chars"
            }
        ],
        "next_steps": ["Mount AI endpoints in FastAPI"],
        "relevant_files": ["backend/app/services/ai.py"],
        "relevant_commands": ["pytest test_phase3.py"]
    }
    note = HandoffNote.model_validate(mock_json)
    assert note.current_task == "Building local AI handoff notes"
    assert len(note.likely_problem_areas) == 1
    assert note.likely_problem_areas[0].hypothesis.startswith("Ollama model")

async def test_live_ollama_generation():
    status = await ollama_service.check_availability()
    print("Ollama status:", status)
    assert status["available"] is True

    mock_context = {
        "git": {
            "is_repo": True,
            "repo_name": "ReMind",
            "branch": "main",
            "status": {"staged": ["backend/app/services/ai.py"], "unstaged": [], "untracked": []},
            "diff_stat": " 1 file changed, 50 insertions(+)",
            "diff_content": "+ async def generate_handoff_note(self): pass",
            "recent_commits": ["b66a4d1 feat: complete phase 2 context collectors"]
        },
        "terminal": {
            "available": True,
            "commands": ["git commit -m 'feat: phase 2'", "git push origin main"]
        },
        "browser": {
            "available": False,
            "tabs": []
        }
    }
    print("Testing live Gemma 2:2b generation via Ollama...")
    note = await ollama_service.generate_handoff_note(
        context=mock_context,
        user_notes="Implemented Phase 3 schemas and Ollama client"
    )
    print("\n--- GENERATED HANDOFF NOTE ---")
    print("Task:", note.current_task)
    print("Current State:", note.current_state)
    print("Next Steps:", note.next_steps)
    print("------------------------------\n")
    assert isinstance(note, HandoffNote)
    assert note.current_task is not None

if __name__ == "__main__":
    test_prompt_generation()
    test_schema_validation()
    asyncio.run(test_live_ollama_generation())
    print("Phase 3 AI tests passed successfully!")
