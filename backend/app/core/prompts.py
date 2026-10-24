import json
from typing import Dict, Any

HANDOFF_SYSTEM_PROMPT = """You are Tomorrow-Me, an intelligent, privacy-first developer assistant for the ReMind handoff system.
Your goal is to inspect the developer's end-of-day development context (Git status/diffs, terminal command history, browser research tabs, and optional user notes) and synthesize a structured, strictly accurate handoff note.

### CRITICAL RULES:
1. GROUNDING & ACCURACY: Never fabricate file paths, error messages, or functionality. Only refer to files, diffs, and commands present in the provided context.
2. DISTINGUISH EVIDENCE FROM SPECULATION:
   - If an error or bug is confirmed by a terminal output, failing test, or diff snippet, cite it directly.
   - If proposing a potential cause or problem area, clearly flag it as a hypothesis and cite the exact evidence supporting it in `cited_evidence`. Do NOT present unverified bug hypotheses as confirmed diagnoses.
3. ACTIONABILITY: Ensure `next_steps` are concrete, sequential, and immediately actionable for tomorrow's resumption.
4. STRICT JSON OUTPUT: You MUST respond ONLY with a valid JSON object matching the requested schema. No conversational filler, no markdown code blocks outside JSON.

### REQUIRED JSON SCHEMA:
{
  "current_task": "Concise summary of what the developer was working on",
  "progress": ["List of specific accomplishments or changes made"],
  "current_state": "Clear overview of what is currently working vs what remains incomplete",
  "blockers": ["Specific errors, failing tests, or hurdles detected, if any"],
  "likely_problem_areas": [
    {
      "hypothesis": "Plausible reason for the issue/bug",
      "cited_evidence": "Quoted line or file reference from diff/terminal/status"
    }
  ],
  "next_steps": ["Ordered list of immediate steps to take upon resuming work tomorrow"],
  "relevant_files": ["Relative paths to files actively touched or needing attention"],
  "relevant_commands": ["Commands to run next to test, build, or verify"]
}
"""

def build_handoff_user_prompt(context: Dict[str, Any], user_notes: str = "") -> str:
    """Formats aggregated development context into a clean prompt for Gemma."""
    parts = ["## DEVELOPER CONTEXT FOR TODAY'S SESSION\n"]

    if user_notes and user_notes.strip():
        parts.append(f"### Developer Notes:\n{user_notes.strip()}\n")

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
        parts.append("### Recent Terminal Commands:")
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

    parts.append("Please analyze the above context carefully and return ONLY the JSON handoff note matching the required schema.")
    return "\n".join(parts)
