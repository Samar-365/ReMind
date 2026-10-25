from typing import List, Optional
from pydantic import BaseModel, Field

class ProblemArea(BaseModel):
    hypothesis: str = Field(description="Evidence-backed hypothesis about a potential bug or issue location.")
    cited_evidence: str = Field(description="Directly quoted or cited evidence from git diff, status, or terminal errors.")

class HandoffNote(BaseModel):
    current_task: str = Field(description="What the developer was actively working on during this session.")
    progress: List[str] = Field(default_factory=list, description="Concrete progress and modifications made.")
    current_state: str = Field(description="What is working vs what remains incomplete or in-progress.")
    blockers: List[str] = Field(default_factory=list, description="Known errors, failing tests, or unresolved roadblocks.")
    likely_problem_areas: List[ProblemArea] = Field(default_factory=list, description="Evidence-backed hypotheses about potential problem locations.")
    next_steps: List[str] = Field(default_factory=list, description="Prioritized list of recommended actionable next steps.")
    relevant_files: List[str] = Field(default_factory=list, description="Relevant modified or referenced file paths.")
    relevant_commands: List[str] = Field(default_factory=list, description="Helpful resume commands (e.g. test, run, build).")

class GenerateHandoffRequest(BaseModel):
    repo_path: Optional[str] = None
    user_notes: Optional[str] = None
    model: Optional[str] = None
    include_git: bool = True
    include_terminal: bool = True
    include_browser: bool = True
    include_windows: bool = True
    terminal_command_count: int = 20

class GenerateHandoffResponse(BaseModel):
    status: str
    model_used: str
    note: HandoffNote
    raw_context_summary: Optional[str] = None
