"""
Minimal validator for Deforumation run manifests.

Expected shape (JSON):
{
  "status": "completed|aborted|running|unknown",
  "started_at": "<iso-ish string>",
  "model": "<model name>",
  "frame_count": <int>,
  "last_frame": "<path-to-last-frame>" (optional),
  "prompt_positive": "<string>" (optional),
  "prompt_negative": "<string>" (optional),
  "seed": <int> (optional),
  "steps": <int> (optional),
  "strength": <float> (optional),
  "cfg": <float> (optional),
  "tag": "<string>" (optional)
}
"""
from __future__ import annotations

from typing import Any, Dict


def _require_type(blob: Dict[str, Any], key: str, types, allow_missing: bool = False):
    if allow_missing and key not in blob:
        return
    if key not in blob:
        raise ValueError(f"Missing required field: {key}")
    if not isinstance(blob[key], types):
        raise ValueError(f"Field '{key}' must be of type {types}, got {type(blob[key])}")


def validate_run_manifest(blob: Dict[str, Any]) -> Dict[str, Any]:
    """Raise ValueError if the blob does not conform."""
    _require_type(blob, "status", str)
    _require_type(blob, "started_at", str)
    _require_type(blob, "model", str)
    _require_type(blob, "frame_count", int)
    _require_type(blob, "last_frame", str, allow_missing=True)
    _require_type(blob, "prompt_positive", str, allow_missing=True)
    _require_type(blob, "prompt_negative", str, allow_missing=True)
    _require_type(blob, "seed", int, allow_missing=True)
    _require_type(blob, "steps", int, allow_missing=True)
    _require_type(blob, "strength", (int, float), allow_missing=True)
    _require_type(blob, "cfg", (int, float), allow_missing=True)
    _require_type(blob, "tag", str, allow_missing=True)
    return blob
