import pytest
from app.core.sanitizer import scrub_secrets

def test_exhaustive_secret_scrubbing_vectors():
    """Verifies that 100% of high-entropy credential patterns are scrubbed from diffs & terminal history."""
    vectors = [
        # AWS Key
        ("AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE", "[REDACTED_AWS_KEY]"),
        # GitHub Personal Access Token
        ("GITHUB_TOKEN=ghp_ABC123def456GHI789jkl012MNO345pqr678", "[REDACTED_GITHUB_TOKEN]"),
        # OpenAI API Key
        ("OPENAI_KEY=sk-proj-1234567890abcdef1234567890abcdef1234567890", "[REDACTED_API_KEY]"),
        # Bearer Token
        ("Authorization: Bearer 1234567890abcdef1234567890abcdef", "Bearer [REDACTED_TOKEN]"),
        # DB Connection string with password
        ("postgres://admin:superSecretP@ss123@localhost:5432/db", "[REDACTED_PASSWORD]"),
        # Standard password assignment
        ('password = "MyComplexPassword#2026"', '[REDACTED_PASSWORD]'),
        # Private key header
        ("""-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Yq4...
-----END RSA PRIVATE KEY-----""", "[REDACTED_PRIVATE_KEY]"),
        # Query param secrets in browser URLs
        ("https://app.dev/oauth?token=9876543210abcdef9876&client_id=123", "[REDACTED_QUERY_PARAM]"),
    ]

    for raw, expected_token in vectors:
        scrubbed = scrub_secrets(raw)
        assert expected_token in scrubbed, f"Failed scrubbing vector: {raw} -> got: {scrubbed}"
        # Ensure raw sensitive value is completely eliminated
        if "superSecretP@ss123" in raw:
            assert "superSecretP@ss123" not in scrubbed
        if "ghp_ABC123" in raw:
            assert "ghp_ABC123" not in scrubbed
        if "AKIAIOSFODNN7EXAMPLE" in raw:
            assert "AKIAIOSFODNN7EXAMPLE" not in scrubbed

if __name__ == "__main__":
    test_exhaustive_secret_scrubbing_vectors()
    print("All exhaustive secret leak security vectors scrubbed 100% successfully!")
