import json
from typing import Dict, Any

HANDOFF_SYSTEM_PROMPT = """You are Tomorrow-Me, an intelligent developer handoff synthesizer for the ReMind platform.
Your purpose is to look at the developer's work session artifacts (active Git branch, modified files, diffs, recent terminal commands, research tabs, and user session notes) and write a crystal-clear, highly accurate morning resumption brief.

### RULES FOR ACCURACY (MANDATORY):
1. RELEVANT RESUME COMMANDS:
   - Provide only practical, helpful commands to resume work tomorrow (e.g. `npm run dev`, `uvicorn app.main:app --port 8001`, `git status`).
   - DO NOT fabricate fictitious script names like `llama.js` or `llama_inference.js` that do not exist.
2. RELEVANT FILES:
   - List ONLY the real files mentioned in the Git file status, diffs, or commits provided below (e.g. `frontend/src/App.jsx`, `backend/app/services/ai.py`).
   - NEVER make up or guess imaginary files (like `style.css` or `llama.js`). If no files were uncommitted, list the files from recent commits or leave empty.
3. GROUNDING:
   - Ground all task descriptions in the provided commit messages and diffs.
4. STRICT JSON:
   - Return strictly a single valid JSON object adhering to the schema below without markdown formatting outside JSON.

### REQUIRED JSON SCHEMA:
{
  "current_task": "Concise summary of what the developer was working on during this session",
  "progress": ["Specific changes, features, or fixes completed during this session"],
  "current_state": "Clear overview of what is currently working vs what remains in-progress",
  "blockers": ["Specific errors, failing tests, or hurdles detected, if any"],
  "likely_problem_areas": [
    {
      "hypothesis": "Plausible reason for the issue or bug",
      "cited_evidence": "Quoted line or file reference from diff/terminal/status"
    }
  ],
  "next_steps": ["Ordered list of immediate steps to take upon resuming work tomorrow"],
  "relevant_files": ["Relative paths to files actively touched or needing attention"],
  "relevant_commands": ["Concrete CLI commands to run to start the servers, run tests, or verify work"]
}
"""

def build_handoff_user_prompt(context: Dict[str, Any], user_notes: str = "") -> str:
    """Formats aggregated development context into a clean prompt for Gemma."""
    parts = ["## DEVELOPER CONTEXT FOR TODAY'S SESSION\n"]

    if user_notes and user_notes.strip():
        parts.append(f"### Developer Notes:\n{user_notes.strip()}\n")

    # All active projects worked on today
    active_projects = context.get("active_projects", [])
    if active_projects:
        parts.append("### All Projects Worked On Today:")
        for proj in active_projects:
            parts.append(f"\n**{proj['repo_name']}** (branch: {proj['branch']}) — {proj['commit_count']} commits today")
            if proj.get("uncommitted_changes", 0) > 0:
                parts.append(f"Uncommitted changes: {proj['uncommitted_changes']}")
            if proj.get("commits_today"):
                for commit in proj["commits_today"][:8]:
                    parts.append(f"  - {commit}")
                if len(proj["commits_today"]) > 8:
                    parts.append(f"  ... and {len(proj['commits_today']) - 8} more")
        parts.append("")

    # Primary repo detailed diffs
    # Git
    git_data = context.get("git")
    if git_data and git_data.get("is_repo"):
        parts.append(f"### Active Git Repository: {git_data.get('repo_name', 'Unknown')}")
        parts.append(f"Branch: {git_data.get('branch', 'unknown')}\n")

        status = git_data.get("status", {})
        if status.get("staged") or status.get("unstaged") or status.get("untracked"):
            parts.append("#### File Status:")
            if status.get("staged"):
                parts.append(f"- Staged for commit: {', '.join(status['staged'])}")
            if status.get("unstaged"):
                parts.append(f"- Unstaged modifications: {', '.join(status['unstaged'])}")
            if status.get("untracked"):
                parts.append(f"- Untracked files: {', '.join(status['untracked'])}")
            parts.append("")

        if git_data.get("diff_stat"):
            parts.append(f"#### Diff Stat:\n{git_data['diff_stat']}\n")

        if git_data.get("diff_content"):
            parts.append(f"#### Code Modifications (Diffs):\n```diff\n{git_data['diff_content']}\n```\n")

        if git_data.get("recent_commits"):
            parts.append("#### Recent Commits:")
            for commit in git_data["recent_commits"]:
                parts.append(f"- {commit}")
            parts.append("")
    else:
        parts.append("### Git Repository: No git repository detected.\n")

    # Terminal
    term_data = context.get("terminal")
    if term_data and term_data.get("available") and term_data.get("commands"):
        parts.append("### Recent Terminal Commands Executed:")
        for cmd in term_data["commands"]:
            parts.append(f"$ {cmd}")
        parts.append("")

    # Browser
    browser_data = context.get("browser")
    if browser_data and browser_data.get("available") and browser_data.get("tabs"):
        parts.append("### Active Research Browser Tabs:")
        for tab in browser_data["tabs"]:
            parts.append(f"- [{tab.get('title', 'Tab')}]({tab.get('url', '')})")
        parts.append("")

    parts.append("Synthesize this session data into the required JSON handoff note with grounded next steps, active files, and helpful resume commands.")
    return "\n".join(parts)
