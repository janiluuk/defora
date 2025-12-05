#!/usr/bin/env python3
"""
Audio-reactive modulator for Deforumation.

Given an audio file and band→parameter mappings, produces per-frame values for
mediator parameters (strength, cfg, xyz, etc.) and can optionally stream them
live to the mediator at a target FPS.

Example (offline schedule):
  python -m sd_cli.audio_reactive_modulator --audio song.wav --fps 24 \
    --mapping '[{"param":"translation_x","freq_min":20,"freq_max":200,"out_min":-1.0,"out_max":1.0}]' \
    --output audio_modulation.json

Example (live send to mediator):
  python -m sd_cli.audio_reactive_modulator --audio song.wav --fps 24 --live \
    --mediator-host 127.0.0.1 --mediator-port 8766 --mapping mappings.json
"""
from __future__ import annotations

import argparse
import json
import math
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

try:
    import numpy as np
except ImportError:  # pragma: no cover - optional dependency
    np = None
try:
    from scipy.io import wavfile
except ImportError:  # pragma: no cover
    wavfile = None

from .mediator_client import MediatorClient


@dataclass
class BandMapping:
    param: str
    freq_min: float
    freq_max: float
    out_min: float
    out_max: float


def load_audio_mono(path: Path) -> tuple[np.ndarray, int]:
    if wavfile is None or np is None:
        raise ImportError("numpy and scipy are required for audio loading")
    sr, data = wavfile.read(path)
    if data.ndim > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float32)
    # normalize to -1..1 if integer
    if data.dtype.kind in ("i", "u"):
        peak = np.iinfo(data.dtype).max
        data = data / peak
    return data, sr


def compute_modulations(
    audio: np.ndarray, sample_rate: int, fps: int, mappings: List[BandMapping]
) -> Dict[str, List[float]]:
    if np is None:
        raise ImportError("numpy is required for compute_modulations")
    if fps <= 0:
        raise ValueError("fps must be > 0")
    samples_per_frame = max(1, int(sample_rate / fps))
    frame_count = math.ceil(len(audio) / samples_per_frame)
    spectra: Dict[str, List[float]] = {m.param: [] for m in mappings}
    freqs = np.fft.rfftfreq(samples_per_frame, d=1.0 / sample_rate)

    for frame_idx in range(frame_count):
        start = frame_idx * samples_per_frame
        end = start + samples_per_frame
        chunk = audio[start:end]
        if len(chunk) == 0:
            break
        # zero-pad to fixed size for consistent freq bins
        if len(chunk) < samples_per_frame:
            pad = np.zeros(samples_per_frame - len(chunk))
            chunk = np.concatenate([chunk, pad])
        spectrum = np.abs(np.fft.rfft(chunk))
        for m in mappings:
            mask = (freqs >= m.freq_min) & (freqs <= m.freq_max)
            energy = float(spectrum[mask].mean()) if mask.any() else 0.0
            spectra[m.param].append(energy)

    # Normalize each param's energy to 0..1 and map to out range
    output: Dict[str, List[float]] = {}
    for m in mappings:
        energies = spectra[m.param]
        if not energies:
            output[m.param] = []
            continue
        max_e = max(energies) or 1e-6
        vals = []
        for e in energies:
            norm = min(max(e / max_e, 0.0), 1.0)
            out_val = m.out_min + norm * (m.out_max - m.out_min)
            vals.append(out_val)
        output[m.param] = vals
    return output


def save_schedule(schedule: Dict[str, List[float]], path: Path) -> None:
    with path.open("w", encoding="utf-8") as handle:
        json.dump(schedule, handle, indent=2)


def live_send(schedule: Dict[str, List[float]], fps: int, host: str, port: str) -> None:
    client = MediatorClient(host, port)
    frame_count = max(len(v) for v in schedule.values())
    frame_time = 1.0 / fps
    for idx in range(frame_count):
        for param, series in schedule.items():
            if idx < len(series):
                try:
                    client.write(param, series[idx])
                except Exception:
                    pass
        time.sleep(frame_time)


def parse_mappings(mapping_arg: Optional[str]) -> List[BandMapping]:
    if mapping_arg is None:
        return [
            BandMapping("translation_x", 20, 200, -1.0, 1.0),
            BandMapping("translation_y", 200, 800, -1.0, 1.0),
            BandMapping("translation_z", 800, 2000, -1.0, 1.0),
        ]
    if Path(mapping_arg).exists():
        blob = json.loads(Path(mapping_arg).read_text())
    else:
        blob = json.loads(mapping_arg)
    mappings = []
    for m in blob:
        mappings.append(
            BandMapping(
                param=m["param"],
                freq_min=float(m["freq_min"]),
                freq_max=float(m["freq_max"]),
                out_min=float(m.get("out_min", 0.0)),
                out_max=float(m.get("out_max", 1.0)),
            )
        )
    return mappings


def main():
    parser = argparse.ArgumentParser(description="Audio-reactive modulator for Deforumation.")
    parser.add_argument("--audio", required=True, help="Path to audio file (wav recommended)")
    parser.add_argument("--fps", type=int, default=24, help="Target frames per second (must be > 0)")
    parser.add_argument("--mapping", help="JSON file or inline JSON array of band mappings")
    parser.add_argument("--output", help="Path to write schedule JSON (offline mode)")
    parser.add_argument("--live", action="store_true", help="Send values live to mediator")
    parser.add_argument("--mediator-host", default="localhost", help="Mediator host")
    parser.add_argument("--mediator-port", default="8766", help="Mediator port")
    args = parser.parse_args()

    if args.fps <= 0:
        raise SystemExit("fps must be greater than zero")
    mappings = parse_mappings(args.mapping)
    audio, sr = load_audio_mono(Path(args.audio))
    schedule = compute_modulations(audio, sr, args.fps, mappings)

    if args.output:
        save_schedule(schedule, Path(args.output))
        print(f"Saved schedule to {args.output}")
    if args.live:
        print(f"Streaming live to mediator {args.mediator_host}:{args.mediator_port} at {args.fps} fps...")
        live_send(schedule, args.fps, args.mediator_host, args.mediator_port)
    if not args.output and not args.live:
        print(json.dumps(schedule, indent=2))


if __name__ == "__main__":
    main()
