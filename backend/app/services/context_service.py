import os
import re
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.collectors.git import GitCollector
from app.collectors.terminal import TerminalCollector
from app.collectors.browser import browser_collector

class ContextConfigRequest(BaseModel):
    repo_path: Optional[str] = None
    include_git: bool = True
    include_terminal: bool = True
    include_browser: bool = True
    terminal_command_count: int = 25

class ProjectWorkspaceInfo(BaseModel):
    name: str
    path: str
    branch: str = "main"
    staged: int = 0
    modified: int = 0
    untracked: int = 0
    is_active: bool = False

def detect_recent_workspaces() -> List[Dict[str, Any]]:
    """
    Scans recent terminal history and current directories to find all
    active Git repositories the user worked on during this session.
    """
    detected = []
    seen_paths = set()

    # 1. Current workspace
    current_repo_root = os.path.abspath(os.path.join(os.getcwd(), ".."))
    c_curr = GitCollector(repo_path=current_repo_root)
    if c_curr.is_git_repo():
        norm = os.path.normcase(os.path.realpath(current_repo_root))
        seen_paths.add(norm)
        status = c_curr.get_status_porcelain()
        detected.append({
            "name": c_curr.get_repo_name(),
            "path": current_repo_root,
            "branch": c_curr.get_current_branch(),
            "staged": len(status.get("staged", [])),
            "modified": len(status.get("unstaged", [])),
            "untracked": len(status.get("untracked", [])),
            "is_active": True,
        })

    # 2. Check recent PowerShell history cd commands
    appdata = os.getenv("APPDATA")
    if appdata:
        ps_history = os.path.join(appdata, r"Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt")
        if os.path.exists(ps_history):
            try:
                with open(ps_history, "r", encoding="utf-8", errors="replace") as f:
                    lines = [line.strip() for line in f.readlines() if line.strip()]
                for line in reversed(lines[-250:]):
                    clean = line.strip()
                    if clean.lower().startswith("cd "):
                        raw_path = clean[3:].strip().strip('"\'')
                        if os.path.isabs(raw_path) and os.path.isdir(raw_path):
                            norm = os.path.normcase(os.path.realpath(raw_path))
                            if norm not in seen_paths:
                                c = GitCollector(repo_path=raw_path)
                                if c.is_git_repo():
                                    seen_paths.add(norm)
                                    status = c.get_status_porcelain()
                                    detected.append({
                                        "name": c.get_repo_name(),
                                        "path": raw_path,
                                        "branch": c.get_current_branch(),
                                        "staged": len(status.get("staged", [])),
                                        "modified": len(status.get("unstaged", [])),
                                        "untracked": len(status.get("untracked", [])),
                                        "is_active": False,
                                    })
            except Exception:
                pass

    return detected

def aggregate_context(config: ContextConfigRequest) -> Dict[str, Any]:
    """
    Coordinates context collection across Git, Terminal, and Browser.
    Includes active workspaces list for multi-project switching.
    """
    workspaces = detect_recent_workspaces()
    resolved_repo_path = config.repo_path

    if not resolved_repo_path or resolved_repo_path == ".":
        # Default to first active workspace if available
        if workspaces:
            resolved_repo_path = workspaces[0]["path"]

    aggregated: Dict[str, Any] = {
        "repo_path": resolved_repo_path,
        "workspaces": workspaces,
        "git": None,
        "terminal": None,
        "browser": None,
    }

    if config.include_git:
        git_coll = GitCollector(repo_path=resolved_repo_path)
        aggregated["git"] = git_coll.collect()

    if config.include_terminal:
        term_coll = TerminalCollector(max_commands=config.terminal_command_count)
        aggregated["terminal"] = term_coll.collect()

    if config.include_browser:
        aggregated["browser"] = browser_collector.collect()

    return aggregated
