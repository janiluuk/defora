#!/usr/bin/env python3
"""JSON stdin/stdout bridge for AI assistant routes (audit A-11)."""
from __future__ import annotations

import json
import sys

from defora_cli.ai_assistant import DeforaAIAssistant


def main() -> None:
    req = json.load(sys.stdin)
    op = req.get("op")
    assistant = DeforaAIAssistant()
    if op == "prompt_suggestions":
        out = assistant.get_prompt_suggestions(
            req["current_prompt"],
            req.get("category") or "",
            int(req.get("limit") or 5),
        )
    elif op == "improve_prompt":
        out = assistant.improve_prompt(req["current_prompt"], req.get("style") or "enhance")
    elif op == "parameter_recommendations":
        out = assistant.get_parameter_recommendations(
            req["current_params"],
            req.get("style") or "photorealistic",
        )
    elif op == "auto_tune":
        out = assistant.auto_tune_parameters(req["current_params"], float(req["feedback_score"]))
    elif op == "style_recommendations":
        out = assistant.get_style_recommendations(req["current_prompt"], int(req.get("limit") or 3))
    elif op == "apply_style":
        out = assistant.apply_style_transfer(
            req["current_prompt"],
            req.get("current_negative") or "",
            req["style_name"],
        )
    elif op == "analyze_frame":
        out = assistant.analyze_frame(req["frame_data"])
    elif op == "anomaly_summary":
        out = assistant.get_anomaly_summary(req.get("frames") or [])
    else:
        raise ValueError(f"unknown op: {op}")
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
