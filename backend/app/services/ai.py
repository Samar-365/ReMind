import json
import re
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.prompts import HANDOFF_SYSTEM_PROMPT, build_handoff_user_prompt
from app.models.schemas import HandoffNote

class OllamaService:
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL

    async def check_availability(self) -> Dict[str, Any]:
        """Checks if Ollama daemon is reachable and lists available models."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    return {
                        "available": True,
                        "models": models,
                        "selected_model": self.model,
                        "model_present": self.model in models or any(self.model in m for m in models)
                    }
                return {"available": False, "error": f"Status code {res.status_code}"}
        except Exception as e:
            return {"available": False, "error": str(e)}

    def _extract_json(self, raw_text: str) -> Dict[str, Any]:
        """Extracts JSON substring from LLM response if wrapped in markdown code blocks."""
        clean = raw_text.strip()
        # Look for ```json ... ``` blocks
        match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', clean)
        if match:
            clean = match.group(1).strip()
        
        # If still failing, find the outer brackets
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1:
            clean = clean[start:end+1]

        return json.loads(clean)

    async def generate_handoff_note(
        self,
        context: Dict[str, Any],
        user_notes: str = "",
        model_override: Optional[str] = None
    ) -> HandoffNote:
        """
        Sends structured developer context to Ollama (Gemma) and parses
        into a validated HandoffNote Pydantic model.
        """
        target_model = model_override or self.model
        prompt = build_handoff_user_prompt(context, user_notes)

        payload = {
            "model": target_model,
            "system": HANDOFF_SYSTEM_PROMPT,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2, # Low temperature for factual, grounded output
                "top_p": 0.9,
            }
        }

        async with httpx.AsyncClient(timeout=180.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                raw_response = result.get("response", "")
            except httpx.ConnectError:
                raise RuntimeError("Could not connect to Ollama on http://localhost:11434. Please ensure Ollama is running.")
            except httpx.TimeoutException:
                raise RuntimeError("Ollama model response timed out. The model may still be loading into RAM.")
            except httpx.HTTPError as e:
                err_detail = e.response.text if hasattr(e, "response") and e.response else str(e)
                raise RuntimeError(f"Ollama generation request failed: {err_detail}")

        # Parse and validate schema
        try:
            parsed_data = self._extract_json(raw_response)
            return HandoffNote.model_validate(parsed_data)
        except Exception as e:
            # Fallback graceful parsing if model returned partial or malformed structure
            raise ValueError(f"Failed to parse or validate Gemma output against schema: {str(e)}\nRaw Response: {raw_response[:500]}")

ollama_service = OllamaService()
