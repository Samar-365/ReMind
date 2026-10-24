import pytest
from app.core.prompts import build_handoff_user_prompt
from app.models.schemas import HandoffNote, ProblemArea

def test_mock_repo_1_broken_test_suite():
    context = {
        "git": {
            "is_repo": True,
            "repo_name": "payment-service",
            "branch": "fix/stripe-webhook",
            "status": {
                "staged": [],
                "unstaged": ["services/stripe.py", "tests/test_webhook.py"],
                "untracked": []
            },
            "diff_stat": "2 files changed, 25 insertions(+), 12 deletions(-)",
            "diff_content": """diff --git a/services/stripe.py b/services/stripe.py
--- a/services/stripe.py
+++ b/services/stripe.py
@@ -10,2 +10,4 @@ def verify_signature(payload, sig):
+    # Missing timestamp drift tolerance
+    return stripe.Webhook.construct_event(payload, sig, secret)
""",
            "recent_commits": ["a1b2c3d chore: initial webhook implementation"]
        },
        "terminal": {
            "available": True,
            "commands": ["pytest tests/test_webhook.py", "FAIL: SignatureVerificationError: Timestamp outside tolerance"]
        },
        "browser": {
            "available": True,
            "tabs": [{"title": "Stripe Webhook Signatures Docs", "url": "https://stripe.com/docs/webhooks/signatures"}]
        }
    }
    prompt = build_handoff_user_prompt(context, "Investigating webhook timestamp failure")
    assert "payment-service" in prompt
    assert "SignatureVerificationError" in prompt
    assert "Stripe Webhook Signatures Docs" in prompt

def test_mock_repo_2_mid_refactor_state():
    context = {
        "git": {
            "is_repo": True,
            "repo_name": "ecommerce-frontend",
            "branch": "refactor/cart-store",
            "status": {
                "staged": ["src/stores/cart.js"],
                "unstaged": ["src/components/Checkout.jsx", "src/components/Navbar.jsx"],
                "untracked": ["src/stores/cart-types.d.ts"]
            },
            "diff_stat": "3 files changed, 140 insertions(+), 88 deletions(-)",
            "diff_content": "+ export const useCartStore = create((set) => ({ items: [] }));",
            "recent_commits": ["9876abc refactor: migrate redux to zustand"]
        },
        "terminal": {
            "available": True,
            "commands": ["npm run build", "Error: TS2304: Cannot find name 'CartItem'"]
        },
        "browser": {
            "available": False,
            "tabs": []
        }
    }
    prompt = build_handoff_user_prompt(context, "Halfway through Zustand migration")
    assert "ecommerce-frontend" in prompt
    assert "Cannot find name 'CartItem'" in prompt

def test_mock_repo_3_clean_unstaged_state():
    context = {
        "git": {
            "is_repo": True,
            "repo_name": "data-pipeline",
            "branch": "main",
            "status": {
                "staged": [],
                "unstaged": [],
                "untracked": []
            },
            "diff_stat": "",
            "diff_content": "",
            "recent_commits": ["1234567 feat: daily ETL cron job deployed"]
        },
        "terminal": {
            "available": True,
            "commands": ["python etl.py --run-all", "Pipeline succeeded with 104,200 records"]
        },
        "browser": {
            "available": False,
            "tabs": []
        }
    }
    prompt = build_handoff_user_prompt(context, "All tests passed and clean commit pushed")
    assert "data-pipeline" in prompt
    assert "Pipeline succeeded" in prompt

if __name__ == "__main__":
    test_mock_repo_1_broken_test_suite()
    test_mock_repo_2_mid_refactor_state()
    test_mock_repo_3_clean_unstaged_state()
    print("All 3 mock repository quality benchmark prompt scenarios validated successfully!")
