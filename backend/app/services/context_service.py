from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.collectors.git import GitCollector
from app.collectors.terminal import TerminalCollector
from app.collectors.browser import browser_collector, BrowserTab

class ContextConfigRequest(BaseModel):
    repo_path: Optional[str] = None
    include_git: bool = True
    include_terminal: bool = True
    include_browser: bool = True
    terminal_command_count: int = 20

def aggregate_context(config: ContextConfigRequest) -> Dict[str, Any]:
    """
    Coordinates context collection across Git, Terminal, and Browser
    with user-defined toggles and sanitization applied.
    """
    aggregated: Dict[str, Any] = {
        "repo_path": config.repo_path,
        "git": None,
        "terminal": None,
        "browser": None,
    }

    if config.include_git:
        git_coll = GitCollector(repo_path=config.repo_path)
        aggregated["git"] = git_coll.collect()

    if config.include_terminal:
        term_coll = TerminalCollector(max_commands=config.terminal_command_count)
        aggregated["terminal"] = term_coll.collect()

    if config.include_browser:
        aggregated["browser"] = browser_collector.collect()

    return aggregated
