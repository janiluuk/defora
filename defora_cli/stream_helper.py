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


def detect_protocol(target: str) -> str:
    """Detect streaming protocol from target URL."""
    if target.startswith("rtmp://") or target.startswith("rtmps://"):
        return "rtmp"
    elif target.startswith("srt://"):
        return "srt"
    elif target.startswith("http://") or target.startswith("https://"):
        # Assume WHIP for HTTP(S) endpoints
        return "whip"
    else:
        # Default to RTMP
        return "rtmp"


def build_ffmpeg_cmd(source: Path, target: str, fps: int, resolution: Optional[str], protocol: Optional[str] = None) -> list[str]:
    """Build ffmpeg command based on target protocol."""
    if protocol is None:
        protocol = detect_protocol(target)
    
    pattern = str(source / "frame_%05d.png")
    
    # Base command for input
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
    
    # Protocol-specific output options
    if protocol == "rtmp":
        cmd.extend(["-f", "flv", target])
    elif protocol == "srt":
        # SRT requires specific parameters for low latency
        cmd.extend([
            "-f", "mpegts",
            "-flush_packets", "0",
            "-fflags", "+genpts",
            target
        ])
    elif protocol == "whip":
        # WHIP (WebRTC HTTP Ingest Protocol) uses HTTP POST with fragmented MP4
        # Note: This requires ffmpeg with WHIP support or additional tools
        cmd.extend([
            "-f", "mp4",
            "-movflags", "frag_keyframe+empty_moov+default_base_moof",
            "-method", "POST",
            target
        ])
    else:
        # Fallback to FLV for unknown protocols
        cmd.extend(["-f", "flv", target])
    
    return cmd


def start_stream(source: Path, target: str, fps: int, resolution: Optional[str], protocol: Optional[str] = None) -> None:
    if PROC_FILE.exists():
        raise SystemExit("Stream already running (pid file exists). Stop first.")
    
    detected_protocol = protocol or detect_protocol(target)
    print(f"Starting stream with protocol: {detected_protocol}")
    
    cmd = build_ffmpeg_cmd(source, target, fps, resolution, detected_protocol)
    print(f"Command: {' '.join(cmd)}")
    
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
    parser = argparse.ArgumentParser(description="Stream frames via ffmpeg with RTMP/SRT/WHIP support.")
    sub = parser.add_subparsers(dest="command", required=True)

    start = sub.add_parser("start", help="Start streaming")
    start.add_argument("--source", required=True, help="Directory containing frames frame_%05d.png")
    start.add_argument("--target", required=True, help="Target URL (rtmp://..., srt://..., https://... for WHIP)")
    start.add_argument("--fps", type=int, default=24, help="Framerate")
    start.add_argument("--resolution", help="Optional WxH (e.g., 1280x720)")
    start.add_argument("--protocol", choices=["rtmp", "srt", "whip"], help="Force specific protocol (auto-detected if not specified)")

    sub.add_parser("stop", help="Stop streaming")
    sub.add_parser("status", help="Show streaming status")

    args = parser.parse_args()
    if args.command == "start":
        start_stream(Path(args.source), args.target, args.fps, args.resolution, getattr(args, "protocol", None))
    elif args.command == "stop":
        stop_stream()
    elif args.command == "status":
        status()


if __name__ == "__main__":
    main()
