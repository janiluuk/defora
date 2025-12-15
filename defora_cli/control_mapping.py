#!/usr/bin/env python3
"""
Shared control mapping for mediator writes.

Converts higher-level control types (from web/TUI) into concrete mediator
parameter writes, including the deforumation "should_use_*" flags needed for
live tweaks to take effect.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Sequence, Tuple

# Parameters that require a corresponding "should_use" flag to be enabled.
PARAM_FLAGS: Dict[str, str] = {
    "strength": "should_use_deforumation_strength",
    "cfg": "should_use_deforumation_cfg",
    "cadence": "should_use_deforumation_cadence",
    "noise_multiplier": "should_use_deforumation_noise",
    "translation_x": "should_use_deforumation_panning",
    "translation_y": "should_use_deforumation_panning",
    "translation_z": "should_use_deforumation_zoom",
    "rotation_x": "should_use_deforumation_rotation",
    "rotation_y": "should_use_deforumation_rotation",
    "rotation_z": "should_use_deforumation_tilt",
    "fov": "should_use_deforumation_fov",
}

# Prompt fields that the mediator understands (same keys as DeforumationSendConfig).
PROMPT_FIELDS = {
    "positive_prompt",
    "negative_prompt",
    "positive_prompt_1",
    "positive_prompt_2",
    "negative_prompt_1",
    "prompt_mix",
    "should_use_deforumation_prompts",
    "should_use_before_deforum_prompt",
    "should_use_after_deforum_prompt",
    "should_use_deforumation_prompt_scheduling",
}


@dataclass
class ControlResult:
    writes: List[Tuple[str, Any]]
    detail: str = ""


def _flagged_writes(payload: Dict[str, Any], allowed: Iterable[str]) -> List[Tuple[str, Any]]:
    writes: List[Tuple[str, Any]] = []
    for key, value in payload.items():
        if key not in allowed:
            continue
        flag = PARAM_FLAGS.get(key)
        if flag:
            writes.append((flag, 1))
        writes.append((key, value))
    return writes


def handle_live_params(payload: Dict[str, Any]) -> ControlResult:
    allowed = set(PARAM_FLAGS.keys()) | {"steps", "seed", "start_frame", "should_resume"}
    writes = _flagged_writes(payload, allowed)
    # start_frame/should_resume are optional helpers for transport-style payloads
    if "start_frame" in payload:
        writes.append(("start_frame", int(payload["start_frame"])))
    if "should_resume" in payload and payload.get("should_resume"):
        writes.append(("should_resume", 1))
    return ControlResult(writes=writes, detail="liveParam")


def handle_prompts(payload: Dict[str, Any]) -> ControlResult:
    writes = []
    for key in PROMPT_FIELDS:
        if key in payload:
            writes.append((key, payload[key]))
    return ControlResult(writes=writes, detail="prompts")


def handle_transport(payload: Dict[str, Any]) -> ControlResult:
    action = str(payload.get("action", "")).lower()
    writes: List[Tuple[str, Any]] = []
    if "start_frame" in payload:
        writes.append(("start_frame", int(payload["start_frame"])))
    if action in ("start", "resume", "toggle"):
        writes.append(("should_resume", 1))
    if action == "stop":
        writes.append(("is_paused_rendering", 1))
    return ControlResult(writes=writes, detail="transport")


CONTROL_HANDLERS = {
    "liveParam": handle_live_params,
    "prompts": handle_prompts,
    "transport": handle_transport,
    # Recognized but mediator-agnostic control types (validated upstream)
    "motionPreset": lambda payload: ControlResult(writes=[], detail="motionPreset"),
    "paramSource": lambda payload: ControlResult(writes=[], detail="paramSource"),
    "motionStyle": lambda payload: ControlResult(writes=[], detail="motionStyle"),
}


def map_control(control_type: str, payload: Dict[str, Any]) -> ControlResult:
    handler = CONTROL_HANDLERS.get(control_type)
    if not handler:
        return ControlResult(writes=[], detail=f"unknown:{control_type}")
    return handler(payload or {})


def write_control(client, control_type: str, payload: Dict[str, Any]) -> List[str]:
    """Apply the mapped writes to a mediator client; returns written keys."""
    result = map_control(control_type, payload)
    written: List[str] = []
    for key, value in result.writes:
        try:
            client.write(key, value)
            written.append(key)
        except Exception:
            # Degrade gracefully; higher layer can log if needed.
            continue
    return written
