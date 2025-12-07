#!/usr/bin/env python3
"""
Simple streaming helper to push frames to RTMP/SRT/WHIP using ffmpeg.

Usage:
  python -m defora_cli.stream_helper start --source /path/to/frames --target rtmp://example/live/streamkey
  python -m defora_cli.stream_helper status
  python -m defora_cli.stream_helper stop

Notes:
  - Expects frames named in sequence (e.g., frame_%05d.png) under --source.
  - Uses a low-latency H.264 preset (zerolatency, small GOP).
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path
from typing import Optional

PROC_FILE = Path(".stream_helper.pid")


def build_ffmpeg_cmd(source: Path, target: str, fps: int, resolution: Optional[str]) -> list[str]:
    pattern = str(source / "frame_%05d.png")
    cmd = [
        "ffmpeg",
        "-re",
        "-framerate",
        str(fps),
        "-i",
        pattern,
        "-vcodec",
        "libx264",
        "-preset",
        "veryfast",
        "-tune",
        "zerolatency",
        "-g",
        str(fps * 2),
        "-keyint_min",
        str(fps),
        "-sc_threshold",
        "0",
        "-pix_fmt",
        "yuv420p",
    ]
    if resolution:
        cmd.extend(["-s", resolution])
    cmd.extend(["-f", "flv", target])
    return cmd


def start_stream(source: Path, target: str, fps: int, resolution: Optional[str]) -> None:
    if PROC_FILE.exists():
        raise SystemExit("Stream already running (pid file exists). Stop first.")
    cmd = build_ffmpeg_cmd(source, target, fps, resolution)
    proc = subprocess.Popen(cmd)
    PROC_FILE.write_text(str(proc.pid))
    print(f"Started stream pid {proc.pid}")


def stop_stream() -> None:
    if not PROC_FILE.exists():
        print("No stream pid file found.")
        return
    pid = int(PROC_FILE.read_text().strip())
    try:
        subprocess.run(["kill", str(pid)], check=False)
        print(f"Stopped stream pid {pid}")
    finally:
        PROC_FILE.unlink(missing_ok=True)


def status() -> None:
    if PROC_FILE.exists():
        pid = PROC_FILE.read_text().strip()
        print(f"Stream running (pid {pid})")
    else:
        print("Stream not running")


def main():
    parser = argparse.ArgumentParser(description="Stream frames via ffmpeg.")
    sub = parser.add_subparsers(dest="command", required=True)

    start = sub.add_parser("start", help="Start streaming")
    start.add_argument("--source", required=True, help="Directory containing frames frame_%05d.png")
    start.add_argument("--target", required=True, help="Target URL (rtmp://..., srt://..., etc.)")
    start.add_argument("--fps", type=int, default=24, help="Framerate")
    start.add_argument("--resolution", help="Optional WxH (e.g., 1280x720)")

    sub.add_parser("stop", help="Stop streaming")
    sub.add_parser("status", help="Show streaming status")

    args = parser.parse_args()
    if args.command == "start":
        start_stream(Path(args.source), args.target, args.fps, args.resolution)
    elif args.command == "stop":
        stop_stream()
    elif args.command == "status":
        status()


if __name__ == "__main__":
    main()
