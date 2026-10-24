import os
import platform
import subprocess
from typing import List, Dict, Any
from app.core.sanitizer import scrub_secrets

class TerminalCollector:
    def __init__(self, max_commands: int = 25):
        self.max_commands = max_commands

    def _get_powershell_history_path(self) -> str:
        """Returns standard path to PowerShell history file on Windows."""
        appdata = os.getenv("APPDATA")
        if appdata:
            path = os.path.join(
                appdata, "Microsoft", "Windows", "PowerShell", "PSReadLine", "ConsoleHost_history.txt"
            )
            if os.path.exists(path):
                return path
        return ""

    def _get_bash_history_path(self) -> str:
        """Returns standard path to bash or zsh history file."""
        home = os.path.expanduser("~")
        for candidate in [".bash_history", ".zsh_history"]:
            path = os.path.join(home, candidate)
            if os.path.exists(path):
                return path
        return ""

    def collect(self) -> Dict[str, Any]:
        """Collects the most recent terminal commands and scrubs them."""
        history_path = None
        shell_type = "unknown"

        if platform.system() == "Windows":
            history_path = self._get_powershell_history_path()
            shell_type = "powershell"

        if not history_path or not os.path.exists(history_path):
            history_path = self._get_bash_history_path()
            shell_type = "bash" if history_path else "none"

        if not history_path or not os.path.exists(history_path):
            return {
                "available": False,
                "shell_type": shell_type,
                "commands": [],
                "message": "No terminal history file found or accessible."
            }

        try:
            with open(history_path, "r", encoding="utf-8", errors="replace") as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]

            # Deduplicate consecutive identical commands while preserving order
            deduped = []
            for line in lines:
                if not deduped or deduped[-1] != line:
                    deduped.append(line)

            # Filter out noisy single-character commands or clear screen
            meaningful = [c for c in deduped if c.lower() not in ("cls", "clear", "exit", "ls", "dir", "cd ..", "cd.", "w")]

            # Extract last N commands
            recent = meaningful[-self.max_commands:] if meaningful else deduped[-self.max_commands:]

            # Filter & scrub each command
            scrubbed_commands = []
            for cmd in recent:
                clean_cmd = scrub_secrets(cmd)
                scrubbed_commands.append(clean_cmd)

            return {
                "available": True,
                "shell_type": shell_type,
                "history_path": history_path,
                "commands": scrubbed_commands,
            }
        except Exception as e:
            return {
                "available": False,
                "shell_type": shell_type,
                "commands": [],
                "error": str(e),
            }
