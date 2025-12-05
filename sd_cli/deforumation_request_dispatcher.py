#!/usr/bin/env python3
"""
Dispatcher/helper for deforum runs:
  - Execute rerun/continue requests produced by deforumation_runs_cli, or
  - Start a new run from CLI arguments/preset/prompt.

Usage:
  python -m sd_cli.deforumation_request_dispatcher --request /path/to/rerun_request.json

Behavior:
  - Loads the request and base manifest
  - Merges overrides
  - Prints a suggested payload and forge_cli-style command that could be used
    to submit a deforum job (informational; does not call Forge by default)
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, Optional

DEFAULT_FORGE_CLI = Path(__file__).resolve().parent / "forge_cli.py"


def load_request(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def merge_payload(manifest_path: Path, overrides: Dict[str, Any]) -> Dict[str, Any]:
    with manifest_path.open("r", encoding="utf-8") as handle:
        manifest = json.load(handle)
    payload = {
        "prompt_positive": manifest.get("prompt_positive", ""),
        "prompt_negative": manifest.get("prompt_negative", ""),
        "seed": manifest.get("seed"),
        "steps": manifest.get("steps"),
        "strength": manifest.get("strength"),
        "cfg": manifest.get("cfg"),
        "frame_count": manifest.get("frame_count"),
        "model": manifest.get("model"),
    }
    payload.update({k: coerce_number(v) for k, v in (overrides or {}).items()})
    return payload


def coerce_number(value: Any) -> Any:
    if isinstance(value, (int, float)):
        return value
    if isinstance(value, str):
        try:
            if "." in value:
                return float(value)
            return int(value)
        except Exception:
            return value
    return value


def forge_cli_command(
    mode: str, payload: Dict[str, Any], last_frame: str | None, forge_cli_path: str | Path = DEFAULT_FORGE_CLI
) -> str:
    """Return a human-friendly command string (informational only)."""
    forge_path = str(forge_cli_path)
    prompts = payload.get("prompt_positive", "")
    neg = payload.get("prompt_negative", "")
    steps = payload.get("steps") or 24
    strength = payload.get("strength") or 0.65
    cfg = payload.get("cfg") or 6.5
    frames = payload.get("frame_count") or 120
    base = (
        f'"{sys.executable}" "{forge_path}" deforum -f {frames} --fps 24 --steps {steps} '
        f'--cfg {cfg} --strength {strength} "{prompts}"'
    )
    if neg:
        base += f' -N "{neg}"'
    if mode == "continue" and last_frame:
        base += f' --init-image "{last_frame}"'
    if payload.get("seed") is not None:
        base += f" --seed {payload['seed']}"
    return base


def forge_cli_args(
    mode: str, payload: Dict[str, Any], last_frame: str | None, forge_cli_path: str | Path = DEFAULT_FORGE_CLI
) -> list[str]:
    forge_path = str(forge_cli_path)
    prompts = payload.get("prompt_positive", "")
    neg = payload.get("prompt_negative", "")
    steps = payload.get("steps") or 24
    strength = payload.get("strength") or 0.65
    cfg = payload.get("cfg") or 6.5
    frames = payload.get("frame_count") or 120
    args = [
        sys.executable,
        forge_path,
        "deforum",
        "-f",
        str(frames),
        "--fps",
        "24",
        "--steps",
        str(steps),
        "--cfg",
        str(cfg),
        "--strength",
        str(strength),
        prompts,
    ]
    if neg:
        args.extend(["-N", neg])
    if mode == "continue" and last_frame:
        args.extend(["--init-image", last_frame])
    if payload.get("seed") is not None:
        args.extend(["--seed", str(payload["seed"])])
    return args


def main():
    parser = argparse.ArgumentParser(description="Dispatch deforum run (rerun/continue or ad-hoc).")
    parser.add_argument("--request", help="Path to rerun/continue request JSON")
    parser.add_argument("--mode", choices=["rerun", "continue"], default="rerun", help="Mode when not using --request")
    parser.add_argument("--prompt", help="Positive prompt (ad-hoc mode)")
    parser.add_argument("--negative", help="Negative prompt (ad-hoc mode)")
    parser.add_argument("--preset", help="Deforum JSON preset to merge (ad-hoc mode)")
    parser.add_argument("--init-image", help="Init image for continue mode (ad-hoc)")
    parser.add_argument("--frame-count", type=int, help="Frames to render")
    parser.add_argument("--steps", type=int, help="Steps")
    parser.add_argument("--strength", type=float, help="Strength")
    parser.add_argument("--cfg", type=float, help="CFG")
    parser.add_argument("--seed", type=int, help="Seed")
    parser.add_argument("--execute", action="store_true", help="Actually run forge_cli with merged payload")
    parser.add_argument(
        "--forge-cli",
        default=str(DEFAULT_FORGE_CLI),
        help="Path to forge_cli.py (defaults to the copy inside this repo)",
    )
    parser.add_argument("--fps", type=int, default=24, help="FPS to use when constructing commands (informational)")
    args = parser.parse_args()
    if args.request:
        req_path = Path(args.request)
        req = load_request(req_path)
        mode = req.get("mode")
        manifest_path = Path(req["manifest"])
        overrides = req.get("overrides") or {}
        payload = merge_payload(manifest_path, overrides)
        last_frame = req.get("last_frame")
    else:
        mode = args.mode
        payload = build_payload_from_args(args)
        last_frame = args.init_image
    cmd = forge_cli_command(mode, payload, last_frame, forge_cli_path=args.forge_cli)
    if args.execute:
        args_list = forge_cli_args(mode, payload, last_frame, forge_cli_path=args.forge_cli)
        print("Executing:", " ".join(args_list))
        result = subprocess.run(args_list, text=True)
        raise SystemExit(result.returncode)
    else:
        print("Payload:", json.dumps(payload, indent=2))
        print("\nSuggested command (edit as needed):")
        print(cmd)


def build_payload_from_args(args: argparse.Namespace) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "prompt_positive": args.prompt or "",
        "prompt_negative": args.negative or "",
        "frame_count": args.frame_count,
        "steps": args.steps,
        "strength": args.strength,
        "cfg": args.cfg,
        "seed": args.seed,
    }
    if args.preset:
        with open(args.preset, "r", encoding="utf-8") as preset_file:
            preset_blob = json.load(preset_file)
        for key in ("prompt_positive", "prompt_negative", "frame_count", "steps", "strength", "cfg", "seed", "model"):
            if key in preset_blob and payload.get(key) in (None, "", 0):
                payload[key] = preset_blob[key]
    return payload


if __name__ == "__main__":
    main()
