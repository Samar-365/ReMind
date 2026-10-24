import pytest
from app.core.sanitizer import scrub_secrets, truncate_diff_content
from app.collectors.git import GitCollector
from app.collectors.terminal import TerminalCollector
from app.collectors.browser import BrowserCollector, BrowserTab
from app.services.context_service import aggregate_context, ContextConfigRequest

def test_secret_scrubbing():
    raw = "sk-12345678901234567890abcdef and API_KEY = 'super_secret_token_123456'"
    scrubbed = scrub_secrets(raw)
    assert "sk-" not in scrubbed
    assert "super_secret_token_123456" not in scrubbed
    assert "[REDACTED" in scrubbed

def test_diff_truncation():
    large_diff = "diff --git a/test.py b/test.py\n" + ("+ line of changed code\n" * 300)
    truncated = truncate_diff_content(large_diff, max_chars_per_file=500)
    assert len(truncated) < len(large_diff)
    assert "[Diff truncated:" in truncated

def test_git_collector():
    collector = GitCollector()
    assert collector.is_git_repo() is True
    data = collector.collect()
    assert data["is_repo"] is True
    assert "status" in data
    assert "recent_commits" in data

def test_browser_collector():
    collector = BrowserCollector()
    collector.update_tabs([
        BrowserTab(title="Dashboard - sk-12345678901234567890", url="https://example.com/api?token=secret_key_1234567890")
    ])
    result = collector.collect()
    assert result["available"] is True
    assert len(result["tabs"]) == 1
    assert "secret_key_1234567890" not in result["tabs"][0]["url"]

def test_aggregate_context():
    config = ContextConfigRequest(include_git=True, include_terminal=True, include_browser=True)
    res = aggregate_context(config)
    assert "git" in res
    assert "terminal" in res
    assert "browser" in res

if __name__ == "__main__":
    test_secret_scrubbing()
    test_diff_truncation()
    test_git_collector()
    test_browser_collector()
    test_aggregate_context()
    print("All Phase 2 collector and sanitizer tests passed successfully!")
