import os
import json
import re
import logging

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are an expert CI/CD debugging assistant. "
    "Analyze CI/CD pipeline logs and return structured JSON only. "
    "Never return markdown, never return explanation outside JSON."
)

_USER_PROMPT_TEMPLATE = """\
Analyze this CI/CD log and find all errors.
For each error found, classify and return a JSON array.

Each item in array must have exactly these fields:
{{
  "category": one of ["Build Failure", "Dependency Conflict", \
"Environment Misconfiguration", "Test Failure", \
"Permission Error", "Unknown Error"],
  "error_line": "exact line from log showing the error",
  "explanation": "2-3 simple sentences, no jargon, for junior developer",
  "fix_steps": ["step 1 with exact command", "step 2", "step 3"],
  "confidence": one of ["High", "Medium", "Low"]
}}

Return ONLY the JSON array. No extra text. No markdown. No backticks.

LOG:
{cleaned_log}"""

_RETRY_PROMPT = (
    "Return ONLY valid JSON array. No markdown. No backticks. "
    "Previous response was not valid JSON."
)

_DEFAULT_RESULT = [
    {
        "category": "Unknown Error",
        "error_line": "Could not parse log",
        "explanation": "Log analysis failed. Try a shorter or cleaner log.",
        "fix_steps": ["Paste a shorter log and try again"],
        "confidence": "Low",
    }
]

# Models to try in order (fallback chain)
_MODEL_CHAIN = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-pro"]


def _configure_client(model_name: str = None) -> genai.GenerativeModel:
    """Configure the Gemini client and return a GenerativeModel instance."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in .env")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=model_name or _MODEL_CHAIN[0],
        system_instruction=_SYSTEM_PROMPT,
    )


def _extract_json(text: str) -> list[dict]:
    """Try to parse a JSON array from the model response text.

    Handles cases where the model wraps the JSON in markdown fences.
    """
    # Strip markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
    return json.loads(cleaned.strip())


def _try_model(model_name: str, cleaned_log: str) -> list[dict] | None:
    """Attempt analysis with a specific model. Returns None on quota errors."""
    try:
        model = _configure_client(model_name)
        user_message = _USER_PROMPT_TEMPLATE.format(cleaned_log=cleaned_log)

        chat = model.start_chat()
        response = chat.send_message(user_message)

        try:
            return _extract_json(response.text)
        except (json.JSONDecodeError, TypeError, ValueError):
            pass

        # Retry with stricter prompt
        retry_response = chat.send_message(_RETRY_PROMPT)
        try:
            return _extract_json(retry_response.text)
        except (json.JSONDecodeError, TypeError, ValueError):
            return _DEFAULT_RESULT

    except google_exceptions.ResourceExhausted:
        logger.warning("Quota exhausted for model %s, trying fallback...", model_name)
        return None  # Signal to try next model
    except google_exceptions.GoogleAPICallError as exc:
        logger.error("Google API error with model %s: %s", model_name, exc)
        return None


def analyze_log(cleaned_log: str) -> list[dict]:
    """Send cleaned CI/CD log to Gemini and return structured error analysis.

    Returns a list of dicts, each with: category, error_line, explanation,
    fix_steps, and confidence.

    Tries multiple models in a fallback chain if quota is exhausted.
    Falls back to a default result if all models fail.
    """
    last_error = None

    for model_name in _MODEL_CHAIN:
        logger.info("Trying model: %s", model_name)
        try:
            result = _try_model(model_name, cleaned_log)
            if result is not None:
                return result
        except Exception as exc:
            last_error = exc
            logger.warning("Model %s failed: %s", model_name, exc)
            continue

    # All models exhausted — raise a clear error
    raise RuntimeError(
        "All Gemini API models are currently rate-limited. "
        "Please wait a few minutes and try again, or check your API quota at "
        "https://ai.google.dev/gemini-api/docs/rate-limits"
    )
