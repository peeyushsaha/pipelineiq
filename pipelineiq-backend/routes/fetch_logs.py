import os
import re
import zipfile
import io

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

GITHUB_API_BASE = "https://api.github.com"


class RepoRequest(BaseModel):
    repo_url: str


def _extract_owner_repo(url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    pattern = r"github\.com[/:]([^/]+)/([^/.]+)"
    match = re.search(pattern, url.strip().rstrip("/"))
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid URL format. Expected: https://github.com/owner/repo",
        )
    return match.group(1), match.group(2)


def _github_headers() -> dict:
    """Build authorization headers for the GitHub API."""
    token = os.getenv("GITHUB_TOKEN", "")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


@router.post("/fetch-logs")
async def fetch_logs(payload: RepoRequest):
    owner, repo = _extract_owner_repo(payload.repo_url)
    headers = _github_headers()

    async with httpx.AsyncClient(timeout=30.0) as client:
        # --- 1. Get workflow runs (failed, most recent) ----------------------
        runs_url = (
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs"
            f"?status=completed&conclusion=failure&per_page=1"
        )
        runs_resp = await client.get(runs_url, headers=headers)

        if runs_resp.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Repository '{owner}/{repo}' not found on GitHub.",
            )
        if runs_resp.status_code == 403 and "rate limit" in runs_resp.text.lower():
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN to .env.",
            )
        if runs_resp.status_code != 200:
            raise HTTPException(
                status_code=runs_resp.status_code,
                detail=f"GitHub API error: {runs_resp.text}",
            )

        runs_data = runs_resp.json()
        if runs_data.get("total_count", 0) == 0 or not runs_data.get("workflow_runs"):
            raise HTTPException(
                status_code=404,
                detail=f"No failed workflow runs found for '{owner}/{repo}'.",
            )

        latest_run = runs_data["workflow_runs"][0]
        run_id = latest_run["id"]
        workflow_name = latest_run.get("name", "Unknown workflow")

        # --- 2. Download logs for that run -----------------------------------
        logs_url = (
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs/{run_id}/logs"
        )
        logs_resp = await client.get(logs_url, headers=headers, follow_redirects=True)

        if logs_resp.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"Logs not available for run {run_id}. They may have expired.",
            )
        if logs_resp.status_code == 403 and "rate limit" in logs_resp.text.lower():
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit exceeded. Try again later or add a GITHUB_TOKEN to .env.",
            )
        if logs_resp.status_code != 200:
            raise HTTPException(
                status_code=logs_resp.status_code,
                detail=f"Failed to download logs: {logs_resp.text}",
            )

        # --- 3. Extract .txt files from the zip and merge --------------------
        raw_log = _extract_logs_from_zip(logs_resp.content)

        if not raw_log.strip():
            raise HTTPException(
                status_code=404,
                detail="Log archive was empty — no .txt files found inside.",
            )

    return {
        "raw_log": raw_log,
        "run_id": run_id,
        "workflow_name": workflow_name,
    }


def _extract_logs_from_zip(zip_bytes: bytes) -> str:
    """Open a zip archive in memory and concatenate all .txt files."""
    merged: list[str] = []
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            for name in sorted(zf.namelist()):
                if name.endswith(".txt"):
                    content = zf.read(name).decode("utf-8", errors="replace")
                    merged.append(f"--- {name} ---\n{content}")
    except zipfile.BadZipFile:
        raise HTTPException(
            status_code=500,
            detail="GitHub returned an invalid zip archive for the logs.",
        )
    return "\n".join(merged)
