#!/usr/bin/env python3
"""
Simple streaming helper to push frames to RTMP/SRT/WHIP using ffmpeg.

Usage:
  python -m defora_cli.stream_helper start --source /path/to/frames --target rtmp://example/live/streamkey
  python -m defora_cli.stream_helper status
  python -m defora_cli.stream_helper stop
  python -m defora_cli.stream_helper record --source /path/to/frames --output recording.mp4

Notes:
  - Expects frames named in sequence (e.g., frame_%05d.png) under --source.
  - Uses a low-latency H.264 preset (zerolatency, small GOP).
  - Supports overlays, transitions, and recording while streaming.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from typing import Optional, List, Dict

PROC_FILE = Path(".stream_helper.pid")
RECORD_PROC_FILE = Path(".stream_helper_record.pid")
CONFIG_FILE = Path(".stream_helper_config.json")


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


def build_ffmpeg_cmd(source: Path, target: str, fps: int, resolution: Optional[str], protocol: Optional[str] = None, 
                     overlay: Optional[str] = None, transition: Optional[str] = None) -> list[str]:
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
    ]
    
    # Add overlay if specified
    filter_complex = []
    if overlay:
        filter_complex.append(f"[0:v][1:v]overlay=0:0[out]")
        cmd.extend(["-i", overlay])
    
    # Add transition if specified
    if transition:
        if transition == "fade":
            filter_complex.append(f"[0:v]fade=t=in:st=0:d=1[out]")
        elif transition == "wipe":
            filter_complex.append(f"[0:v]wipe=t=right:duration=1[out]")
        elif transition == "dissolve":
            filter_complex.append(f"[0:v]dissolve=duration=1[out]")
    
    if filter_complex:
        cmd.extend(["-filter_complex", ";".join(filter_complex)])
    
    cmd.extend([
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
    ])
    
    if resolution:
        cmd.extend(["-s", resolution])
    
    # Protocol-specific output options
    if protocol == "rtmp":
        cmd.extend(["-f", "flv", target])
    elif protocol == "srt":
        cmd.extend([
            "-f", "mpegts",
            "-flush_packets", "0",
            "-fflags", "+genpts",
            target
        ])
    elif protocol == "whip":
        cmd.extend([
            "-f", "mp4",
            "-movflags", "frag_keyframe+empty_moov+default_base_moof",
            "-method", "POST",
            target
        ])
    else:
        cmd.extend(["-f", "flv", target])
    
    return cmd


def build_record_cmd(source: Path, output: Path, fps: int, resolution: Optional[str] = None, 
                      codec: str = "libx264", quality: str = "medium") -> list[str]:
    """Build ffmpeg command for recording to file."""
    pattern = str(source / "frame_%05d.png")
    
    quality_presets = {
        "low": {"crf": "28", "preset": "veryfast"},
        "medium": {"crf": "23", "preset": "medium"},
        "high": {"crf": "18", "preset": "slow"},
        "ultra": {"crf": "12", "preset": "slow"},
    }
    
    q = quality_presets.get(quality, quality_presets["medium"])
    
    cmd = [
        "ffmpeg",
        "-framerate",
        str(fps),
        "-i",
        pattern,
        "-vcodec",
        codec,
        "-preset",
        q["preset"],
        "-crf",
        q["crf"],
        "-pix_fmt",
        "yuv420p",
    ]
    
    if resolution:
        cmd.extend(["-s", resolution])
    
    cmd.extend(["-movflags", "+faststart", str(output)])
    
    return cmd


def start_stream(source: Path, target: str, fps: int, resolution: Optional[str], protocol: Optional[str] = None,
                 overlay: Optional[str] = None, transition: Optional[str] = None) -> None:
    if PROC_FILE.exists():
        raise SystemExit("Stream already running (pid file exists). Stop first.")
    
    detected_protocol = protocol or detect_protocol(target)
    print(f"Starting stream with protocol: {detected_protocol}")
    
    cmd = build_ffmpeg_cmd(source, target, fps, resolution, detected_protocol, overlay, transition)
    print(f"Command: {' '.join(cmd)}")
    
    proc = subprocess.Popen(cmd)
    PROC_FILE.write_text(str(proc.pid))
    print(f"Started stream pid {proc.pid}")
    
    # Save config for recording while streaming
    config = {
        "source": str(source),
        "fps": fps,
        "resolution": resolution,
    }
    CONFIG_FILE.write_text(json.dumps(config))


def start_record(source: Path, output: Path, fps: int, resolution: Optional[str] = None,
                 codec: str = "libx264", quality: str = "medium") -> None:
    if RECORD_PROC_FILE.exists():
        raise SystemExit("Recording already running (pid file exists). Stop first.")
    
    print(f"Starting recording to {output}")
    
    cmd = build_record_cmd(source, output, fps, resolution, codec, quality)
    print(f"Command: {' '.join(cmd)}")
    
    proc = subprocess.Popen(cmd)
    RECORD_PROC_FILE.write_text(str(proc.pid))
    print(f"Started recording pid {proc.pid}")


def stop_record() -> None:
    if not RECORD_PROC_FILE.exists():
        print("No recording pid file found.")
        return
    pid = int(RECORD_PROC_FILE.read_text().strip())
    try:
        subprocess.run(["kill", str(pid)], check=False)
        print(f"Stopped recording pid {pid}")
    finally:
        RECORD_PROC_FILE.unlink(missing_ok=True)


def record_status() -> None:
    if RECORD_PROC_FILE.exists():
        pid = RECORD_PROC_FILE.read_text().strip()
        print(f"Recording running (pid {pid})")
    else:
        print("Recording not running")



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
    
    record_status()


def main():
    parser = argparse.ArgumentParser(description="Stream frames via ffmpeg with RTMP/SRT/WHIP support.")
    sub = parser.add_subparsers(dest="command", required=True)

    start = sub.add_parser("start", help="Start streaming")
    start.add_argument("--source", required=True, help="Directory containing frames frame_%05d.png")
    start.add_argument("--target", required=True, help="Target URL (rtmp://..., srt://..., https://... for WHIP)")
    start.add_argument("--fps", type=int, default=24, help="Framerate")
    start.add_argument("--resolution", help="Optional WxH (e.g., 1280x720)")
    start.add_argument("--protocol", choices=["rtmp", "srt", "whip"], help="Force specific protocol (auto-detected if not specified)")
    start.add_argument("--overlay", help="Path to overlay image (PNG with transparency)")
    start.add_argument("--transition", choices=["fade", "wipe", "dissolve"], help="Transition effect to apply")

    sub.add_parser("stop", help="Stop streaming")
    sub.add_parser("status", help="Show streaming status")
    
    record = sub.add_parser("record", help="Start recording to file")
    record.add_argument("--source", required=True, help="Directory containing frames frame_%05d.png")
    record.add_argument("--output", required=True, help="Output file path (e.g., recording.mp4)")
    record.add_argument("--fps", type=int, default=24, help="Framerate")
    record.add_argument("--resolution", help="Optional WxH (e.g., 1280x720)")
    record.add_argument("--codec", default="libx264", help="Video codec (default: libx264)")
    record.add_argument("--quality", choices=["low", "medium", "high", "ultra"], default="medium", help="Recording quality")
    
    sub.add_parser("stop-record", help="Stop recording")
    sub.add_parser("record-status", help="Show recording status")

    args = parser.parse_args()
    if args.command == "start":
        start_stream(Path(args.source), args.target, args.fps, args.resolution, 
                     getattr(args, "protocol", None), getattr(args, "overlay", None), 
                     getattr(args, "transition", None))
    elif args.command == "stop":
        stop_stream()
    elif args.command == "status":
        status()
    elif args.command == "record":
        start_record(Path(args.source), Path(args.output), args.fps, args.resolution, 
                     args.codec, args.quality)
    elif args.command == "stop-record":
        stop_record()
    elif args.command == "record-status":
        record_status()


if __name__ == "__main__":
    main()
