import re
from typing import Dict, Any

# Common high-entropy secret patterns
SECRET_PATTERNS = [
    # Generic API Key / Token / Secret assignments
    (re.compile(r'(?i)(api[_-]?key|auth[_-]?token|secret[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{12,})["\']?'), r'\1="[REDACTED_SECRET]"'),
    # Bearer tokens
    (re.compile(r'(?i)bearer\s+([a-zA-Z0-9_\-\.]{16,})'), r'Bearer [REDACTED_TOKEN]'),
    # OpenAI API Keys
    (re.compile(r'sk-[a-zA-Z0-9]{20,T3BlbkFJ[a-zA-Z0-9]{20,}'), '[REDACTED_OPENAI_KEY]'),
    (re.compile(r'sk-[a-zA-Z0-9_-]{20,}'), '[REDACTED_API_KEY]'),
    # GitHub Personal Access Tokens
    (re.compile(r'gh[pousr]_[A-Za-z0-9_]{36,255}'), '[REDACTED_GITHUB_TOKEN]'),
    # AWS Access Keys
    (re.compile(r'(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}'), '[REDACTED_AWS_KEY]'),
    # Private Key Headers
    (re.compile(r'-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'), '[REDACTED_PRIVATE_KEY]'),
    # Query parameter tokens & secrets (e.g. ?token=..., &access_token=..., ?key=...)
    (re.compile(r'(?i)([?&](?:token|key|api_key|apikey|secret|auth)=)([^&\s]+)'), r'\1[REDACTED_QUERY_PARAM]'),
    # Passwords in URLs / Connection strings
    (re.compile(r'([a-zA-Z]+://[^:]+:)([^@/]+)(@)'), r'\1[REDACTED_PASSWORD]\3'),
    # Standard password assignments
    (re.compile(r'(?i)(password|passwd|pwd)\s*[:=]\s*["\']?([^"\'\s]{4,})["\']?'), r'\1="[REDACTED_PASSWORD]"'),
]

DEFAULT_CHAR_BUDGET_PER_FILE = 4000
DEFAULT_TOTAL_CHAR_BUDGET = 24000

def scrub_secrets(text: str) -> str:
    """Mask credentials, tokens, and secrets from input text."""
    if not text:
        return ""
    scrubbed = text
    for pattern, replacement in SECRET_PATTERNS:
        scrubbed = pattern.sub(replacement, scrubbed)
    return scrubbed

def truncate_diff_content(diff_text: str, max_chars_per_file: int = DEFAULT_CHAR_BUDGET_PER_FILE, total_max_chars: int = DEFAULT_TOTAL_CHAR_BUDGET) -> str:
    """
    Truncates large diffs per file and within a global budget,
    preserving structural context while avoiding token exhaustion.
    """
    if not diff_text:
        return ""

    file_chunks = re.split(r'(?=diff --git )', diff_text)
    processed_chunks = []
    current_total = 0

    for chunk in file_chunks:
        if not chunk.strip():
            continue

        # Check if file is a lockfile or generated asset
        is_low_priority = any(lockfile in chunk[:200] for lockfile in [
            "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock", "Pipfile.lock", "Cargo.lock"
        ])

        limit = 1000 if is_low_priority else max_chars_per_file

        if len(chunk) > limit:
            truncated_chunk = chunk[:limit] + f"\n... [Diff truncated: {len(chunk) - limit} characters omitted for brevity] ...\n"
        else:
            truncated_chunk = chunk

        if current_total + len(truncated_chunk) > total_max_chars:
            remaining = total_max_chars - current_total
            if remaining > 200:
                processed_chunks.append(truncated_chunk[:remaining] + "\n... [Remaining diffs truncated due to total context limit] ...\n")
            else:
                processed_chunks.append("\n... [Remaining diffs omitted due to total context limit] ...\n")
            break

        processed_chunks.append(truncated_chunk)
        current_total += len(truncated_chunk)

    return "".join(processed_chunks)
