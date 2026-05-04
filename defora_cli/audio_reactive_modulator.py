#!/usr/bin/env python3
"""
Audio-reactive modulator for Deforumation.

Given an audio file and band→parameter mappings, produces per-frame values for
mediator parameters (strength, cfg, xyz, etc.) and can optionally stream them
live to the mediator at a target FPS.

Example (offline schedule):
  python -m defora_cli.audio_reactive_modulator --audio song.wav --fps 24 \
    --mapping '[{"param":"translation_x","freq_min":20,"freq_max":200,"out_min":-1.0,"out_max":1.0}]' \
    --output audio_modulation.json

Example (live send to mediator):
  python -m defora_cli.audio_reactive_modulator --audio song.wav --fps 24 --live \
    --mediator-host 127.0.0.1 --mediator-port 8766 --mapping mappings.json
"""
from __future__ import annotations

import argparse
import importlib
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


# Named Hz ranges for quick CLI layouts (Phase 3)
BAND_HZ = {
    "sub": (20.0, 60.0),
    "bass": (60.0, 250.0),
    "lowmid": (250.0, 500.0),
    "mid": (500.0, 2000.0),
    "high": (2000.0, 8000.0),
    "air": (8000.0, 16000.0),
}


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


def smooth_series(values: List[float], amount: float) -> List[float]:
    """One-pole smoothing on mapped parameter curves (0 = off)."""
    if amount <= 0 or len(values) < 2:
        return values
    coef = min(1.0, max(0.0, amount))
    out: List[float] = [values[0]]
    for i in range(1, len(values)):
        out.append(coef * values[i] + (1 - coef) * out[-1])
    return out


def envelope_follow_series(
    values: List[float], fps: float, attack_sec: float, release_sec: float
) -> List[float]:
    """Asymmetric envelope follower (requires attack_sec > 0 to enable)."""
    if not values or attack_sec <= 0:
        return values
    fps = max(1e-6, fps)
    a_up = 1.0 - math.exp(-1.0 / max(1e-6, attack_sec * fps))
    a_dn = 1.0 - math.exp(-1.0 / max(1e-6, max(release_sec, 1e-6) * fps))
    out: List[float] = []
    prev = values[0]
    for v in values:
        coef = a_up if v > prev else a_dn
        prev = coef * v + (1 - coef) * prev
        out.append(prev)
    return out


def apply_output_processing(
    schedule: Dict[str, List[float]],
    fps: float,
    smooth: float,
    attack_sec: float,
    release_sec: float,
) -> Dict[str, List[float]]:
    out: Dict[str, List[float]] = {}
    for key, series in schedule.items():
        vals = list(series)
        if attack_sec > 0:
            vals = envelope_follow_series(vals, fps, attack_sec, release_sec)
        if smooth > 0:
            vals = smooth_series(vals, smooth)
        out[key] = vals
    return out


def run_post_plugin(spec: Optional[str], schedule: Dict[str, List[float]]) -> Dict[str, List[float]]:
    """
    Optional extension hook: ``module.path:callable`` receiving the schedule dict
    and returning a new schedule (same shape). Used for Phase 4 plugin groundwork.
    """
    if not spec or not str(spec).strip():
        return schedule
    mod_part, _, fn_part = str(spec).strip().partition(":")
    if not mod_part or not fn_part:
        raise ValueError("--post-plugin must be module:function")
    mod = importlib.import_module(mod_part)
    fn = getattr(mod, fn_part)
    out = fn(schedule)
    if not isinstance(out, dict):
        raise TypeError("post-plugin must return a dict[str, list[float]]")
    return out


def parse_mappings(mapping_arg: Optional[str], band_layout: str = "default") -> List[BandMapping]:
    if mapping_arg is None:
        if band_layout == "bass_mid_high":
            b, m, h = BAND_HZ["bass"], BAND_HZ["mid"], BAND_HZ["high"]
            return [
                BandMapping("translation_x", b[0], b[1], -1.0, 1.0),
                BandMapping("translation_y", m[0], m[1], -1.0, 1.0),
                BandMapping("translation_z", h[0], h[1], -1.0, 1.0),
            ]
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
    parser.add_argument(
        "--band-layout",
        choices=("default", "bass_mid_high"),
        default="default",
        help="When --mapping is omitted, pick default FFT band routing (default = legacy triple split)",
    )
    parser.add_argument(
        "--smooth",
        type=float,
        default=0.0,
        help="Output smoothing 0..1 (one-pole low-pass on mapped curves; 0 = off)",
    )
    parser.add_argument(
        "--envelope-attack-sec",
        type=float,
        default=0.0,
        help="Envelope follower attack time in seconds (0 = disable asymmetric smoothing)",
    )
    parser.add_argument(
        "--envelope-release-sec",
        type=float,
        default=0.08,
        help="Envelope follower release time in seconds (used when attack is enabled)",
    )
    parser.add_argument(
        "--post-plugin",
        default=None,
        help="Python hook ``module:function`` to transform the schedule dict after smoothing (plugin MVP).",
    )
    args = parser.parse_args()

    if args.fps <= 0:
        raise SystemExit("fps must be greater than zero")
    mappings = parse_mappings(args.mapping, args.band_layout)
    audio, sr = load_audio_mono(Path(args.audio))
    schedule = compute_modulations(audio, sr, args.fps, mappings)
    schedule = apply_output_processing(
        schedule,
        float(args.fps),
        max(0.0, args.smooth),
        max(0.0, args.envelope_attack_sec),
        max(1e-6, args.envelope_release_sec),
    )
    if args.post_plugin:
        try:
            schedule = run_post_plugin(args.post_plugin, schedule)
        except Exception as exc:  # noqa: BLE001
            raise SystemExit(f"--post-plugin failed: {exc}") from exc

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
