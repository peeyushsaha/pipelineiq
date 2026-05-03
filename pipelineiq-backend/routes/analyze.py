import json
import os
import re
from collections import Counter

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from routes.fetch_logs import fetch_logs, RepoRequest
from utils.log_parser import clean_log, chunk_log, summarize_chunks
from utils.llm_engine import analyze_log

router = APIRouter()


class AnalyzeRequest(BaseModel):
    input_type: str  # "raw_log" or "repo_url"
    content: str


def _build_summary(errors: list[dict]) -> str:
    """Build a human-readable summary line from the error list."""
    if not errors:
        return "No errors found."
    counts = Counter(e.get("category", "Unknown Error") for e in errors)
    parts = [f"{v} {k}" for k, v in counts.items()]
    return f"Found {len(errors)} error(s): {', '.join(parts)}"


def _estimate_fix_time(errors: list[dict]) -> str:
    """Rough time estimate based on error count and confidence."""
    if not errors:
        return "0 minutes"
    high = sum(1 for e in errors if e.get("confidence") == "High")
    med = sum(1 for e in errors if e.get("confidence") == "Medium")
    low = sum(1 for e in errors if e.get("confidence") == "Low")
    minutes = high * 5 + med * 8 + low * 12
    upper = minutes + 5 * len(errors)
    return f"{minutes}-{upper} minutes"


@router.post("/analyze")
async def analyze(payload: AnalyzeRequest):
    # --- 1. Validate input ---------------------------------------------------
    if payload.input_type not in ("raw_log", "repo_url"):
        raise HTTPException(
            status_code=400,
            detail="input_type must be 'raw_log' or 'repo_url'.",
        )
    if not payload.content or not payload.content.strip():
        raise HTTPException(
            status_code=400,
            detail="content field is required and cannot be empty.",
        )

    # --- 2. Obtain raw log ---------------------------------------------------
    try:
        if payload.input_type == "repo_url":
            result = await fetch_logs(RepoRequest(repo_url=payload.content))
            raw_log = result["raw_log"]
        else:
            raw_log = payload.content
    except HTTPException:
        raise  # re-raise 404 / 429 from fetch_logs as-is
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch logs: {str(exc)}",
        )

    # --- 3. Clean → Chunk → Summarize ----------------------------------------
    try:
        cleaned = clean_log(raw_log)
        if not cleaned.strip():
            raise HTTPException(
                status_code=400,
                detail="No relevant error lines found in the provided log.",
            )
        chunks = chunk_log(cleaned)
        final_text = summarize_chunks(chunks)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Log processing error: {str(exc)}",
        )

    # --- 4. LLM analysis ----------------------------------------------------
    try:
        errors = analyze_log(final_text)
    except RuntimeError as exc:
        # Quota / rate-limit errors surface as RuntimeError from llm_engine
        detail = str(exc)
        if "rate-limited" in detail.lower() or "quota" in detail.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exhausted. Please wait a few minutes and try again.",
            )
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {detail}")
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"LLM analysis failed: {str(exc)}",
        )

    # --- 5. Build response ---------------------------------------------------
    return {
        "total_errors": len(errors),
        "errors": errors,
        "summary": _build_summary(errors),
        "estimated_fix_time": _estimate_fix_time(errors),
    }


# ── POST /generate-yml ──────────────────────────────────────────────────────


class GenerateYmlRequest(BaseModel):
    errors: list[dict]


_YML_PROMPT_TEMPLATE = """\
You are a GitHub Actions workflow expert.
Generate a corrected GitHub Actions .yml file that fixes all these errors.

Errors and their fixes:
{errors_json}

Requirements for the .yml file:
- Use ubuntu-latest as runner
- Fix dependency installation based on errors found
- Fix environment variable issues if any found
- Add correct permissions block if permission errors found
- Include working build and test steps
- Must be complete and valid GitHub Actions YAML syntax

Return ONLY raw YAML content starting with "name:". \
Nothing else. No markdown. No backticks. No explanation."""


@router.post("/generate-yml")
async def generate_yml(payload: GenerateYmlRequest):
    # --- 1. Validate input ---------------------------------------------------
    if not payload.errors:
        raise HTTPException(
            status_code=400,
            detail="errors array is required and cannot be empty.",
        )

    # --- 2. Call Gemini for YAML generation -----------------------------------
    try:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = _YML_PROMPT_TEMPLATE.format(
            errors_json=json.dumps(payload.errors, indent=2)
        )
        response = model.generate_content(prompt)
        yml_text = response.text.strip()

        # Strip markdown fences if the model wrapped the YAML
        yml_text = re.sub(r"^```(?:ya?ml)?\s*", "", yml_text, flags=re.MULTILINE)
        yml_text = re.sub(r"```\s*$", "", yml_text, flags=re.MULTILINE)
        yml_text = yml_text.strip()

    except RuntimeError as exc:
        detail = str(exc)
        if "rate-limited" in detail.lower() or "quota" in detail.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exhausted. Please wait a few minutes and try again.",
            )
        raise HTTPException(status_code=500, detail=f"YAML generation failed: {detail}")
    except google_exceptions.ResourceExhausted:
        raise HTTPException(
            status_code=429,
            detail="Gemini API quota exhausted. Please wait a few minutes and try again.",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"YAML generation failed: {str(exc)}",
        )

    # --- 3. Return response --------------------------------------------------
    return {
        "yml_content": yml_text,
        "filename": "fixed-pipeline.yml",
    }

