import os
import subprocess
from typing import Dict, Any, List
from app.core.sanitizer import scrub_secrets, truncate_diff_content

class GitCollector:
    def __init__(self, repo_path: str = None):
        self.repo_path = repo_path or os.getcwd()

    def _run_git_cmd(self, args: List[str]) -> str:
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                timeout=10,
                encoding="utf-8",
                errors="replace"
            )
            return result.stdout.strip()
        except Exception as e:
            return ""

    def is_git_repo(self) -> bool:
        res = self._run_git_cmd(["rev-parse", "--is-inside-work-tree"])
        return res == "true"

    def get_repo_name(self) -> str:
        root = self._run_git_cmd(["rev-parse", "--show-toplevel"])
        if root:
            return os.path.basename(root)
        return os.path.basename(self.repo_path)

    def get_current_branch(self) -> str:
        return self._run_git_cmd(["branch", "--show-current"]) or "unknown"

    def get_status_porcelain(self) -> Dict[str, List[str]]:
        raw_status = self._run_git_cmd(["status", "--porcelain"])
        staged, unstaged, untracked = [], [], []

        for line in raw_status.splitlines():
            if len(line) < 3:
                continue
            index_code = line[0]
            worktree_code = line[1]
            file_path = line[3:].strip()

            if index_code in ("M", "A", "D", "R"):
                staged.append(file_path)
            if worktree_code in ("M", "D"):
                unstaged.append(file_path)
            if index_code == "?" and worktree_code == "?":
                untracked.append(file_path)

        return {
            "staged": staged,
            "unstaged": unstaged,
            "untracked": untracked,
        }

    def get_diff_stat(self) -> str:
        return self._run_git_cmd(["diff", "--stat"])

    def get_diff_content(self) -> str:
        """Collect uncommitted diffs (both unstaged and staged) safely scrubbed and truncated."""
        # Unstaged diffs
        unstaged_diff = self._run_git_cmd(["diff", "--no-color"])
        # Staged diffs
        staged_diff = self._run_git_cmd(["diff", "--cached", "--no-color"])

        combined = ""
        if staged_diff:
            combined += f"# --- STAGED CHANGES ---\n{staged_diff}\n"
        if unstaged_diff:
            combined += f"# --- UNSTAGED CHANGES ---\n{unstaged_diff}\n"

        sanitized = scrub_secrets(combined)
        return truncate_diff_content(sanitized)

    def get_recent_commits(self, count: int = 5) -> List[str]:
        raw_log = self._run_git_cmd(["log", f"-n{count}", "--oneline"])
        if not raw_log:
            return []
        return [line.strip() for line in raw_log.splitlines() if line.strip()]

    def collect(self) -> Dict[str, Any]:
        if not self.is_git_repo():
            return {
                "is_repo": False,
                "repo_path": self.repo_path,
                "message": "Not a valid git repository"
            }

        status = self.get_status_porcelain()
        return {
            "is_repo": True,
            "repo_name": self.get_repo_name(),
            "branch": self.get_current_branch(),
            "status": status,
            "diff_stat": self.get_diff_stat(),
            "diff_content": self.get_diff_content(),
            "recent_commits": self.get_recent_commits(5),
        }
