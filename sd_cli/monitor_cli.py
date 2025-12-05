#!/usr/bin/env python3
"""
Simple monitor that shows the latest frame (optional ASCII) and live values via mediator.

Usage:
  python -m sd_cli.monitor_cli --frames runs/<id>/frames --host 127.0.0.1 --port 8766
"""
from __future__ import annotations

import argparse
import asyncio
import os
from pathlib import Path
from typing import Dict, Optional

from .mediator_client import MediatorClient

ASCII_PREVIEW = os.getenv("DEFORUMATION_ASCII_PREVIEW", "0") == "1"


def latest_frame(frames_dir: Path) -> Path | None:
    pngs = sorted(frames_dir.glob("*.png"))
    return pngs[-1] if pngs else None


def ascii_from_image(path: Path, width: int = 80, height: int = 40) -> str:
    try:
        from PIL import Image
    except Exception:
        return "(install Pillow for ASCII preview)"
    try:
        img = Image.open(path).convert("L")
        img.thumbnail((width, height))
        pixels = img.load()
        chars = "@%#*+=-:. "
        lines = []
        for iy in range(img.height):
            line_chars = []
            for ix in range(img.width):
                val = pixels[ix, iy] / 255.0
                line_chars.append(chars[int(val * (len(chars) - 1))])
            lines.append("".join(line_chars))
        return "\n".join(lines)
    except Exception:
        return "(could not render preview)"


async def fetch_live_values(client: MediatorClient) -> Dict[str, str]:
    keys = ["strength", "cfg", "translation_x", "translation_y", "translation_z", "rotation_x", "rotation_y", "rotation_z", "fov"]
    values = {}
    loop = asyncio.get_event_loop()
    for k in keys:
        try:
            # run in thread to reuse sync client
            values[k] = await loop.run_in_executor(None, client.read, k)
        except Exception:
            values[k] = "?"
    return values


async def main_async(args):
    client = MediatorClient(args.host, args.port)
    frames_dir = detect_frames_dir(args.frames)
    if not frames_dir or not frames_dir.exists():
        raise SystemExit(f"Frames directory not found: {frames_dir}")
    last_printed = None
    while True:
        lf = latest_frame(frames_dir)
        if lf and lf != last_printed:
            print(f"\nLatest frame: {lf}")
            if ASCII_PREVIEW:
                print(ascii_from_image(lf))
            live = await fetch_live_values(client)
            print("Live:", live)
            last_printed = lf
        await asyncio.sleep(args.interval)


def main():
    parser = argparse.ArgumentParser(description="Monitor latest frame and live values.")
    parser.add_argument("--frames", help="Path to frames directory (defaults to latest runs/*/frames or env DEFORUMATION_FRAMES_DIR)")
    parser.add_argument("--host", default="localhost", help="Mediator host")
    parser.add_argument("--port", default="8766", help="Mediator port")
    parser.add_argument("--interval", type=float, default=1.0, help="Polling interval seconds")
    args = parser.parse_args()
    asyncio.run(main_async(args))


def detect_frames_dir(arg_path: Optional[str]) -> Optional[Path]:
    if arg_path:
        return Path(arg_path).resolve()
    env = os.getenv("DEFORUMATION_FRAMES_DIR")
    if env:
        return Path(env).resolve()
    runs = sorted(Path("runs").glob("*/frames"))
    if runs:
        return runs[-1].resolve()
    return None


if __name__ == "__main__":
    main()
