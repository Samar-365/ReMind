import os
import re
import subprocess
from typing import Optional, List, Dict, Any
from datetime import datetime
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

def _is_ignored_path(path: str) -> bool:
    """Filter out home directory root and system paths that aren't real projects."""
    norm = os.path.normpath(path).lower()
    home = os.path.normpath(os.path.expanduser("~")).lower()
    if norm == home:
        return True
    ignored_prefixes = [
        os.path.join(home, "appdata").lower(),
        r"c:\windows",
        r"c:\program files",
        r"c:\programdata",
    ]
    return any(norm.startswith(p) for p in ignored_prefixes)

def detect_active_workspace_path() -> Optional[str]:
    """
    Detects the last git repository the user was working in before signing off.
    Traces forward through terminal history so the final cd-to-repo wins.
    Filters out the user's home directory and system paths.
    """
    appdata = os.getenv("APPDATA")
    if not appdata:
        return None

    ps_history = os.path.join(appdata, r"Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt")
    if not os.path.exists(ps_history):
        return None

    try:
        with open(ps_history, "r", encoding="utf-8", errors="replace") as f:
            lines = [line.strip() for line in f.readlines() if line.strip()]
    except Exception:
        return None

    last_repo = None

    # Trace forward through the last 300 commands — the final match is the
    # repository the user was in right before they signed off.
    for line in lines[-300:]:
        match = re.match(r'(?i)^(?:cd|pushd|Set-Location)\s+["\']?([^"\'\n\r]+)["\']?', line)
        if match:
            raw_dir = match.group(1).strip()
            raw_dir = os.path.expanduser(raw_dir)
            if os.path.isabs(raw_dir) and os.path.isdir(raw_dir):
                if _is_ignored_path(raw_dir):
                    continue
                git_coll = GitCollector(repo_path=raw_dir)
                if git_coll.is_git_repo():
                    last_repo = raw_dir

    return last_repo

def _get_today_commit_count(repo_path: str) -> int:
    """Returns the number of commits made today in the given repository."""
    if not repo_path:
        return 0
    try:
        today_str = datetime.now().strftime("%Y-%m-%d 00:00:00")
        result = subprocess.run(
            ["git", "log", f"--since={today_str}", "--oneline"],
            cwd=repo_path, capture_output=True, text=True, timeout=5,
            encoding="utf-8", errors="replace"
        )
        return len([l for l in result.stdout.splitlines() if l.strip()])
    except Exception:
        return 0

def discover_all_active_projects() -> List[Dict[str, Any]]:
    """
    Discovers ALL git repositories the user worked on today by scanning:
    1. Current workspace and app repository
    2. The last active repository from terminal history
    3. All git repositories mentioned in PowerShell history (cd targets, file paths, etc.)
    4. Sibling repositories in active project folders
    Checks each repo for commits made today and uncommitted changes.
    """
    visited_repos = set()

    # 1. Current workspace / app directory root
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for p in [os.getcwd(), backend_dir]:
        try:
            res = subprocess.run(
                ["git", "rev-parse", "--show-toplevel"],
                cwd=p, capture_output=True, text=True, timeout=2,
                encoding="utf-8", errors="replace"
            )
            if res.returncode == 0 and res.stdout.strip():
                root = os.path.normpath(res.stdout.strip())
                if not _is_ignored_path(root):
                    visited_repos.add(root)
        except Exception:
            pass

    # 2. Last active workspace
    last_active = detect_active_workspace_path()
    if last_active and not _is_ignored_path(last_active):
        visited_repos.add(os.path.normpath(last_active))

    # 3. Scan PowerShell history for any directories and cd targets
    appdata = os.getenv("APPDATA")
    if appdata:
        ps_history = os.path.join(appdata, r"Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt")
        if os.path.exists(ps_history):
            try:
                with open(ps_history, "r", encoding="utf-8", errors="replace") as f:
                    lines = [line.strip() for line in f.readlines() if line.strip()]
                for line in lines[-1000:]:
                    # Extract cd/pushd/Set-Location paths
                    cd_match = re.match(r'(?i)^(?:cd|pushd|Set-Location)\s+["\']?([^"\'\n\r]+)["\']?', line)
                    candidate_paths = []
                    if cd_match:
                        candidate_paths.append(cd_match.group(1).strip())
                    
                    # Also find any absolute drive paths in the line
                    candidate_paths.extend(re.findall(r'[a-zA-Z]:\\[a-zA-Z0-9_.\-\\\s]+', line))

                    for raw_path in candidate_paths:
                        raw_path = os.path.expanduser(raw_path.strip().rstrip('\\'))
                        if os.path.isabs(raw_path) and os.path.isdir(raw_path):
                            if _is_ignored_path(raw_path):
                                continue
                            try:
                                res = subprocess.run(
                                    ["git", "rev-parse", "--show-toplevel"],
                                    cwd=raw_path, capture_output=True, text=True, timeout=2,
                                    encoding="utf-8", errors="replace"
                                )
                                if res.returncode == 0 and res.stdout.strip():
                                    root = os.path.normpath(res.stdout.strip())
                                    if not _is_ignored_path(root):
                                        visited_repos.add(root)
                            except Exception:
                                pass
            except Exception:
                pass

    today_str = datetime.now().strftime("%Y-%m-%d 00:00:00")
    active_projects = []

    for repo_path in visited_repos:
        if not os.path.isdir(repo_path):
            continue

        # Today's commits (short hash + message)
        try:
            res = subprocess.run(
                ["git", "log", f"--since={today_str}", "--format=%h %s"],
                cwd=repo_path, capture_output=True, text=True, timeout=5,
                encoding="utf-8", errors="replace"
            )
            commits = [l.strip() for l in res.stdout.splitlines() if l.strip()]
        except Exception:
            commits = []

        # Current branch
        try:
            res = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=repo_path, capture_output=True, text=True, timeout=3,
                encoding="utf-8", errors="replace"
            )
            branch = res.stdout.strip() or "unknown"
        except Exception:
            branch = "unknown"

        # Uncommitted change count
        try:
            res = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=repo_path, capture_output=True, text=True, timeout=3,
                encoding="utf-8", errors="replace"
            )
            changes = len([l for l in res.stdout.splitlines() if l.strip()])
        except Exception:
            changes = 0

        # Skip repos with zero activity today
        if len(commits) == 0 and changes == 0:
            continue

        active_projects.append({
            "repo_name": os.path.basename(repo_path),
            "repo_path": repo_path,
            "branch": branch,
            "commits_today": commits,
            "commit_count": len(commits),
            "uncommitted_changes": changes,
        })

    # Most active project first
    active_projects.sort(key=lambda x: x["commit_count"], reverse=True)
    return active_projects

def aggregate_context(config: ContextConfigRequest) -> Dict[str, Any]:
    """
    Coordinates context collection across Git, Terminal, and Browser
    with user-defined toggles and sanitization applied.
    Automatically resolves the active repo path if not explicitly provided.
    """
    resolved_repo_path = config.repo_path
    if not resolved_repo_path or resolved_repo_path == ".":
        detected = detect_active_workspace_path()
        if detected:
            resolved_repo_path = detected

    today_commits = _get_today_commit_count(resolved_repo_path)
    active_projects = discover_all_active_projects()

    aggregated: Dict[str, Any] = {
        "repo_path": resolved_repo_path,
        "today_commits": today_commits,
        "active_projects": active_projects,
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
