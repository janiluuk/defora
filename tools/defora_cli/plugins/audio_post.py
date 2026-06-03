"""Example post-plugin for ``audio_reactive_modulator`` (identity + optional clamp)."""

from __future__ import annotations

from typing import Dict, List


def process(schedule: Dict[str, List[float]]) -> Dict[str, List[float]]:
    """Pass-through schedule (replace with custom transforms)."""
    return {k: list(v) for k, v in schedule.items()}


def clamp_outputs(schedule: Dict[str, List[float]], limit: float = 1.5) -> Dict[str, List[float]]:
    """Clamp every sample to ``[-limit, limit]`` (simple safety example)."""
    out: Dict[str, List[float]] = {}
    for k, series in schedule.items():
        out[k] = [max(-limit, min(limit, float(x))) for x in series]
    return out
