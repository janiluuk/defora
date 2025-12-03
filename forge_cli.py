#!/usr/bin/env python3

"""
forge_cli.py — tiny Linux command-line client for Stable Diffusion WebUI Forge

Features
--------
- Generate still images via txt2img with **model-aware defaults**.
- List and inspect available models (`models` subcommand).
- Optional **auto-switch** to Flux1-schnell (or a chosen model).
- Submit **Deforum** animation batches (when Forge is started with --deforum-api).
- Optional **Deforum JSON preset** support.
- **Audioreactive** animations: map audio frequency bands to Deforum parameters.

Usage examples
--------------

# 1) Quick still image, auto model (tries to use Flux1-schnell if present)
./forge_cli.py "a synthwave city at night, neon, wide shot"

# 2) Explicit img subcommand with some overrides
./forge_cli.py img -W 832 -H 1216 -n 2 \
  "moody portrait, cinematic lighting"

# 3) See which models are installed and their detected profiles
./forge_cli.py models

# 4) Switch to a specific model by substring (see `models` output)
./forge_cli.py --model "revAnimated" img "anime girl in a city"

# 5) Deforum animation with sane defaults (no preset)
./forge_cli.py deforum -f 240 --fps 24 \
  "surreal biomechanical landscape, slowly zooming"

# 6) Deforum with a JSON preset exported from the Deforum UI.
#    Only prompts (+ optional frames/fps/size if you specify flags) are overridden.
./forge_cli.py deforum --preset my_deforum_preset.json \
  "cosmic fractal cathedral" \
  -N "lowres, text, watermark"

# 7) Audioreactive Deforum: map audio to zoom and rotation
./forge_cli.py deforum -f 240 --fps 24 \
  --audio music.mp3 \
  --audio-map-zoom-low 0.05 \
  --audio-map-angle-high 2.0 \
  "pulsating cosmic energy, abstract art"

Environment variables
---------------------
FORGE_API_BASE   Base URL of Forge API (default: http://127.0.0.1:7860)
FORGE_OUT_DIR    Where to save images (default: forge_cli_output)
"""

import argparse
import base64
import json
import os
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

import requests

DEFAULT_BASE_URL = os.getenv("FORGE_API_BASE", "http://127.0.0.1:7860")
DEFAULT_OUT_DIR = os.getenv("FORGE_OUT_DIR", "forge_cli_output")

# Audio analysis dependencies (optional)
try:
    import librosa
    import numpy as np
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False


# --- Model detection + defaults -------------------------------------------------


MODEL_DEFAULTS: Dict[str, Dict[str, Any]] = {
    # Flux1-schnell style models: very few steps, tiny CFG
    "flux_schnell": {
        "label": "Flux1-schnell / speed-optimised Flux",
        "img_steps": 6,
        "img_cfg": 1.0,
        "img_sampler": "Euler",
        "def_steps": 6,
        "def_cfg": 1.0,
        "def_sampler": "Euler a",
    },
    # Other Flux variants – still lower CFG and smaller step counts than SD1.5/SDXL
    "flux_other": {
        "label": "Other Flux-style model",
        "img_steps": 12,
        "img_cfg": 2.0,
        "img_sampler": "Euler",
        "def_steps": 12,
        "def_cfg": 2.0,
        "def_sampler": "Euler a",
    },
    # Classic SD 1.5 style checkpoints
    "sd15": {
        "label": "Stable Diffusion 1.5-style model",
        "img_steps": 20,
        "img_cfg": 7.0,
        "img_sampler": "DPM++ 2M Karras",
        "def_steps": 18,
        "def_cfg": 7.0,
        "def_sampler": "Euler a",
    },
    # SDXL & friends
    "sdxl": {
        "label": "SDXL / XL-style model",
        "img_steps": 30,
        "img_cfg": 5.0,
        "img_sampler": "DPM++ 2M Karras",
        "def_steps": 24,
        "def_cfg": 5.5,
        "def_sampler": "Euler a",
    },
    # Fallback if we can't guess anything better
    "other": {
        "label": "Unknown model type (generic defaults)",
        "img_steps": 20,
        "img_cfg": 6.5,
        "img_sampler": "Euler",
        "def_steps": 18,
        "def_cfg": 6.5,
        "def_sampler": "Euler a",
    },
}


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


# --- Audio analysis for audioreactive animations --------------------------------

# Audio analysis constants
STFT_HOP_LENGTH = 512  # Hop length for Short-Time Fourier Transform
STFT_N_FFT = 2048  # FFT window size for Short-Time Fourier Transform
NORMALIZATION_EPSILON = 1e-10  # Small value to avoid division by zero


def analyze_audio_frequencies(
    audio_path: str,
    fps: int,
    num_frames: int,
    low_freq: Tuple[float, float] = (100, 300),
    mid_freq: Tuple[float, float] = (300, 3000),
    high_freq: Tuple[float, float] = (3000, 8000),
) -> Dict[str, List[float]]:
    """
    Analyze audio file and extract frequency band energies for each frame.
    
    Args:
        audio_path: Path to audio file
        fps: Frames per second for the animation
        num_frames: Total number of frames
        low_freq: Low frequency range (min, max) in Hz
        mid_freq: Mid frequency range (min, max) in Hz
        high_freq: High frequency range (min, max) in Hz
    
    Returns:
        Dictionary with 'low', 'mid', 'high' keys, each containing a list of
        normalized energy values (0.0 to 1.0) for each frame.
    """
    if not AUDIO_AVAILABLE:
        raise RuntimeError(
            "Audio analysis requires librosa and numpy. "
            "Install them with: pip install librosa numpy"
        )
    
    # Load audio file
    y, sr = librosa.load(audio_path, sr=None)
    
    # Calculate duration per frame
    frame_duration = 1.0 / fps
    total_duration = num_frames * frame_duration
    
    # If audio is shorter than needed, pad with silence
    required_samples = int(total_duration * sr)
    if len(y) < required_samples:
        y = np.pad(y, (0, required_samples - len(y)), mode='constant')
    
    # Compute Short-Time Fourier Transform
    D = np.abs(librosa.stft(y, n_fft=STFT_N_FFT, hop_length=STFT_HOP_LENGTH))
    
    # Get frequency bins
    freqs = librosa.fft_frequencies(sr=sr, n_fft=STFT_N_FFT)
    
    # Find frequency bin indices for each band
    low_bins = np.where((freqs >= low_freq[0]) & (freqs < low_freq[1]))[0]
    mid_bins = np.where((freqs >= mid_freq[0]) & (freqs < mid_freq[1]))[0]
    high_bins = np.where((freqs >= high_freq[0]) & (freqs < high_freq[1]))[0]
    
    # Extract energy for each frequency band over time
    low_energy = np.sum(D[low_bins, :], axis=0) if len(low_bins) > 0 else np.zeros(D.shape[1])
    mid_energy = np.sum(D[mid_bins, :], axis=0) if len(mid_bins) > 0 else np.zeros(D.shape[1])
    high_energy = np.sum(D[high_bins, :], axis=0) if len(high_bins) > 0 else np.zeros(D.shape[1])
    
    # Convert from STFT frames to animation frames
    def resample_to_frames(energy: np.ndarray, num_frames: int) -> List[float]:
        # Calculate how many STFT frames correspond to each animation frame
        stft_frames_per_anim_frame = len(energy) / num_frames
        
        result = []
        for i in range(num_frames):
            start_idx = int(i * stft_frames_per_anim_frame)
            end_idx = int((i + 1) * stft_frames_per_anim_frame)
            if end_idx > len(energy):
                end_idx = len(energy)
            
            # Average energy over this frame's time window
            if start_idx < end_idx:
                frame_energy = np.mean(energy[start_idx:end_idx])
            else:
                frame_energy = energy[start_idx] if start_idx < len(energy) else 0.0
            
            result.append(float(frame_energy))
        
        return result
    
    low_values = resample_to_frames(low_energy, num_frames)
    mid_values = resample_to_frames(mid_energy, num_frames)
    high_values = resample_to_frames(high_energy, num_frames)
    
    # Normalize each band to 0.0-1.0 range
    def normalize(values: List[float]) -> List[float]:
        if not values:
            return values
        min_val = min(values)
        max_val = max(values)
        if max_val - min_val < NORMALIZATION_EPSILON:  # Avoid division by zero
            return [0.5] * len(values)
        return [(v - min_val) / (max_val - min_val) for v in values]
    
    return {
        'low': normalize(low_values),
        'mid': normalize(mid_values),
        'high': normalize(high_values),
    }


def create_schedule_from_values(
    values: List[float],
    base_value: float,
    modulation_strength: float,
) -> str:
    """
    Create a Deforum schedule string from a list of values.
    
    Args:
        values: List of normalized values (0.0 to 1.0) for each frame
        base_value: Base value for the parameter
        modulation_strength: How much the parameter should vary (± from base)
    
    Returns:
        Schedule string like "0:(value0), 10:(value1), 20:(value2), ..."
    """
    if not values:
        return f"0:({base_value})"
    
    schedule_parts = []
    for frame_idx, norm_val in enumerate(values):
        # Map normalized value (0-1) to (base - modulation, base + modulation)
        actual_val = base_value + (norm_val - 0.5) * 2 * modulation_strength
        schedule_parts.append(f"{frame_idx}:({actual_val:.4f})")
    
    return ", ".join(schedule_parts)


def apply_audioreactive_modulation(
    settings: Dict[str, Any],
    audio_path: str,
    mappings: Dict[str, Dict[str, Any]],
    low_freq: Tuple[float, float] = (100, 300),
    mid_freq: Tuple[float, float] = (300, 3000),
    high_freq: Tuple[float, float] = (3000, 8000),
) -> Dict[str, Any]:
    """
    Apply audioreactive modulation to Deforum settings.
    
    Args:
        settings: Deforum settings dictionary
        audio_path: Path to audio file
        mappings: Dictionary mapping frequency bands to parameters.
                  Format: {
                      'low': {'param_name': {'base': float, 'modulation': float}},
                      'mid': {'param_name': {'base': float, 'modulation': float}},
                      'high': {'param_name': {'base': float, 'modulation': float}},
                  }
        low_freq: Low frequency range tuple (min, max) in Hz
        mid_freq: Mid frequency range tuple (min, max) in Hz
        high_freq: High frequency range tuple (min, max) in Hz
    
    Returns:
        Modified settings dictionary
    """
    fps = settings.get('fps', 24)
    num_frames = settings.get('max_frames', 120)
    
    # Analyze audio
    freq_data = analyze_audio_frequencies(
        audio_path, fps, num_frames, low_freq, mid_freq, high_freq
    )
    
    # Apply mappings for each frequency band
    for band in ['low', 'mid', 'high']:
        if band not in mappings or band not in freq_data:
            continue
        
        band_mappings = mappings[band]
        band_values = freq_data[band]
        
        for param_name, param_config in band_mappings.items():
            base_value = param_config['base']
            modulation = param_config['modulation']
            
            # Create schedule string
            schedule = create_schedule_from_values(band_values, base_value, modulation)
            
            # Update settings
            settings[param_name] = schedule
    
    return settings


# --- Low-level API helpers ------------------------------------------------------


def api_get(base_url: str, path: str, timeout: int = 30) -> Any:
    r = requests.get(f"{base_url}{path}", timeout=timeout)
    r.raise_for_status()
    return r.json()


def api_post(base_url: str, path: str, payload: Any, timeout: int = 120) -> Any:
    r = requests.post(f"{base_url}{path}", json=payload, timeout=timeout)
    r.raise_for_status()
    return r.json()


def query_models(base_url: str) -> List[Dict[str, Any]]:
    try:
        return api_get(base_url, "/sdapi/v1/sd-models", timeout=20)
    except Exception as e:  # noqa: BLE001
        print(f"[error] Could not query /sdapi/v1/sd-models: {e}", file=sys.stderr)
        return []


def get_options(base_url: str) -> Dict[str, Any]:
    try:
        return api_get(base_url, "/sdapi/v1/options", timeout=20)
    except Exception as e:  # noqa: BLE001
        print(f"[warn] Could not query /sdapi/v1/options: {e}", file=sys.stderr)
        return {}


def set_model_checkpoint(base_url: str, title: str) -> None:
    try:
        api_post(base_url, "/sdapi/v1/options", {"sd_model_checkpoint": title}, timeout=30)
    except Exception as e:  # noqa: BLE001
        print(f"[warn] Could not set sd_model_checkpoint to '{title}': {e}", file=sys.stderr)


def get_current_model_name(base_url: str) -> Optional[str]:
    opts = get_options(base_url)
    name = opts.get("sd_model_checkpoint")
    if isinstance(name, str) and name.strip():
        return name
    return None


# --- Model classification / selection ------------------------------------------


def _combined_model_text(m: Dict[str, Any]) -> str:
    return " ".join(
        str(m.get(k, "")) for k in ("title", "model_name", "filename", "hash", "sha256")
    ).lower()


def detect_model_class_from_text(text: str) -> str:
    t = text.lower()

    if "flux" in t and "schnell" in t:
        return "flux_schnell"
    if "flux" in t:
        return "flux_other"
    # crude SDXL detection
    if "sdxl" in t or "xl-" in t or "xl_" in t or "xl base" in t:
        return "sdxl"
    # crude SD1.5 detection
    if "1.5" in t or "v1-5" in t or "sd15" in t:
        return "sd15"
    return "other"


def get_profile_for_model(
    model_title: Optional[str],
    models: List[Dict[str, Any]],
) -> Tuple[str, Dict[str, Any]]:
    """
    Given a model title (as shown in options) and the list of models,
    return (model_class_key, profile_dict).
    """
    if not model_title:
        return "other", MODEL_DEFAULTS["other"]

    lower_title = model_title.lower()
    text = lower_title
    for m in models:
        # Compare against title or filename to find a close match
        mt = str(m.get("title") or m.get("model_name") or m.get("filename") or "").lower()
        if mt == lower_title or lower_title in mt:
            text = _combined_model_text(m)
            break

    cls = detect_model_class_from_text(text)
    return cls, MODEL_DEFAULTS.get(cls, MODEL_DEFAULTS["other"])


def choose_model(
    base_url: str,
    model_hint: Optional[str],
    no_auto_model: bool,
    verbose: bool = True,
) -> Tuple[Optional[str], str, Dict[str, Any]]:
    """
    Decide which model to use, optionally switching checkpoint.

    Returns: (chosen_title_or_current, model_class_key, profile_dict)
    """
    models = query_models(base_url)
    current = get_current_model_name(base_url)

    if no_auto_model:
        cls_key, profile = get_profile_for_model(current, models)
        if verbose:
            print(
                f"[info] Keeping current model: {current or 'unknown'} "
                f"({profile['label']})",
                file=sys.stderr,
            )
        return current, cls_key, profile

    chosen: Optional[str] = None

    # User explicitly specified something
    if model_hint:
        hint = model_hint.lower()
        candidates: List[Dict[str, Any]] = []
        for m in models:
            text = _combined_model_text(m)
            if hint in text:
                candidates.append(m)

        if not candidates:
            print(
                f"[warn] No model matched hint '{model_hint}'. "
                f"Staying on current: {current or 'unknown'}",
                file=sys.stderr,
            )
            chosen = current
        else:
            m0 = candidates[0]
            chosen = (
                m0.get("title")
                or m0.get("model_name")
                or m0.get("filename")
                or m0.get("hash")
            )
            if verbose:
                print(
                    f"[info] Switching model to first match for '{model_hint}': {chosen}",
                    file=sys.stderr,
                )
            if chosen and chosen != current:
                set_model_checkpoint(base_url, chosen)

    else:
        # No explicit hint: prefer Flux1-schnell if available.
        flux_candidate: Optional[str] = None
        for m in models:
            text = _combined_model_text(m)
            if "flux" in text and "schnell" in text:
                flux_candidate = (
                    m.get("title")
                    or m.get("model_name")
                    or m.get("filename")
                    or m.get("hash")
                )
                break

        if flux_candidate:
            chosen = flux_candidate
            if verbose:
                print(
                    f"[info] Auto-selecting Flux1-schnell-like model: {chosen}",
                    file=sys.stderr,
                )
            if chosen and chosen != current:
                set_model_checkpoint(base_url, chosen)
        else:
            chosen = current
            if verbose:
                print(
                    "[info] No Flux1-schnell-like model found; "
                    f"using current checkpoint: {current or 'unknown'}",
                    file=sys.stderr,
                )

    cls_key, profile = get_profile_for_model(chosen, models)
    if verbose:
        print(
            f"[info] Model profile: {cls_key} — {profile['label']}",
            file=sys.stderr,
        )
    return chosen, cls_key, profile


# --- Image utilities -----------------------------------------------------------


def decode_and_save_images(images_b64: List[str], out_dir: str, prefix: str = "img") -> List[str]:
    ensure_dir(out_dir)
    paths: List[str] = []
    ts = time.strftime("%Y%m%d-%H%M%S")

    for idx, img_b64 in enumerate(images_b64):
        # Sometimes the API returns data:image/png;base64,xxxx
        if "," in img_b64:
            img_b64 = img_b64.split(",", 1)[1]

        data = base64.b64decode(img_b64)
        fname = f"{prefix}-{ts}-{idx:03d}.png"
        fpath = os.path.join(out_dir, fname)
        with open(fpath, "wb") as f:
            f.write(data)
        paths.append(fpath)

    return paths


# --- Command: models -----------------------------------------------------------


def cmd_models(args: argparse.Namespace) -> None:
    base_url = args.base_url
    models = query_models(base_url)
    current = get_current_model_name(base_url)

    if not models:
        print("No models returned by /sdapi/v1/sd-models.", file=sys.stderr)
        return

    print("Available models:")
    print("")
    header = f"{'#':>3}  {'*':1}  {'Title':40}  {'Class':10}  {'Note'}"
    print(header)
    print("-" * len(header))

    for idx, m in enumerate(models):
        title = str(m.get("title") or m.get("model_name") or m.get("filename") or "<?>")
        text = _combined_model_text(m)
        cls_key = detect_model_class_from_text(text)
        profile = MODEL_DEFAULTS.get(cls_key, MODEL_DEFAULTS["other"])
        star = "*" if current and current.lower() in title.lower() else " "
        note = profile["label"]
        print(f"{idx:3d}  {star}  {title[:40]:40}  {cls_key:10}  {note}")

    print("")
    print("Legend:")
    for key, prof in MODEL_DEFAULTS.items():
        print(f"  - {key:10}: {prof['label']}")
    print("")
    print(
        "Hint: Use `--model <substring>` with `img` or `deforum` to switch to "
        "a specific checkpoint (substring is matched against title/filename).",
    )


# --- Command: img --------------------------------------------------------------


def resolve_img_params(
    args: argparse.Namespace,
    profile: Dict[str, Any],
) -> Dict[str, Any]:
    steps = args.steps if args.steps is not None else profile["img_steps"]
    cfg = args.cfg_scale if args.cfg_scale is not None else profile["img_cfg"]
    sampler = args.sampler if args.sampler is not None else profile["img_sampler"]

    return {
        "steps": steps,
        "cfg_scale": cfg,
        "sampler": sampler,
    }


def cmd_img(args: argparse.Namespace) -> None:
    base_url = args.base_url

    # Model choice + profile
    model_title, cls_key, profile = choose_model(
        base_url,
        model_hint=args.model,
        no_auto_model=args.no_auto_model,
        verbose=not args.quiet,
    )
    params = resolve_img_params(args, profile)

    if not args.quiet:
        print(
            f"[info] Using model: {model_title or 'unknown'} "
            f"({cls_key}, img steps={params['steps']}, cfg={params['cfg_scale']}, "
            f"sampler={params['sampler']})",
            file=sys.stderr,
        )

    payload = {
        "prompt": args.prompt,
        "negative_prompt": args.negative or "",
        "width": args.width,
        "height": args.height,
        "steps": int(params["steps"]),
        "cfg_scale": float(params["cfg_scale"]),
        "sampler_name": params["sampler"],
        "batch_size": args.num_images,
        "n_iter": 1,
        "seed": args.seed,
    }

    data = api_post(base_url, "/sdapi/v1/txt2img", payload, timeout=600)
    images = data.get("images", [])

    if not images:
        print("No images returned, raw response:", data, file=sys.stderr)
        sys.exit(1)

    outdir = os.path.join(args.outdir, "img")
    paths = decode_and_save_images(images, outdir, prefix="img")
    for p in paths:
        print(p)


# --- Command: deforum ----------------------------------------------------------


def build_deforum_settings_from_scratch(
    prompt: str,
    negative: str,
    frames: int,
    fps: int,
    width: int,
    height: int,
    steps: int,
    cfg_scale: float,
    sampler: str,
    seed: int,
    zoom: float,
    noise: float,
    strength: float,
) -> Dict[str, Any]:
    """
    Build a minimal-but-sane Deforum settings dict for /deforum_api/batches.

    This mirrors the idea of the DeforumAPIParams example, but keeps things tiny.
    """
    s: Dict[str, Any] = {}

    # Core animation parameters
    s["animation_mode"] = "2D"
    s["max_frames"] = frames
    s["W"] = width
    s["H"] = height
    s["seed"] = seed
    s["sampler"] = sampler
    s["steps"] = steps
    s["scale"] = cfg_scale
    s["strength"] = strength

    # Basic camera + motion schedules
    s["angle"] = "0:(0)"
    s["zoom"] = f"0:({zoom})"
    s["translation_x"] = "0:(0)"
    s["translation_y"] = "0:(0)"
    s["translation_z"] = "0:(1.75)"
    s["transform_center_x"] = "0:(0.5)"
    s["transform_center_y"] = "0:(0.5)"
    s["rotation_3d_x"] = "0:(0)"
    s["rotation_3d_y"] = "0:(0)"
    s["rotation_3d_z"] = "0:(0)"

    # Quality / noise schedules
    s["noise_schedule"] = f"0:({noise})"
    s["strength_schedule"] = f"0:({strength})"
    s["contrast_schedule"] = "0:(1.0)"
    s["cfg_scale_schedule"] = f"0:({cfg_scale})"
    s["steps_schedule"] = f"0:({steps})"
    s["fov_schedule"] = "0:(70)"
    s["aspect_ratio_schedule"] = "0:(1)"
    s["near_schedule"] = "0:(200)"
    s["far_schedule"] = "0:(10000)"
    s["image_strength_schedule"] = "0:(0.75)"
    s["blendFactorMax"] = "0:(0.35)"
    s["blendFactorSlope"] = "0:(0.25)"
    s["tweening_frames_schedule"] = "0:(0)"
    s["color_correction_factor"] = "0:(0.075)"

    # Prompting + timing
    s["fps"] = fps
    s["animation_prompts"] = {}
    s["animation_prompts_positive"] = prompt
    s["animation_prompts_negative"] = negative or ""
    s["prompts"] = {"0": prompt}

    # ControlNet and other advanced knobs are left at server defaults.
    return s


def resolve_deforum_params(
    args: argparse.Namespace,
    profile: Dict[str, Any],
) -> Dict[str, Any]:
    steps = args.steps if args.steps is not None else profile["def_steps"]
    cfg = args.cfg_scale if args.cfg_scale is not None else profile["def_cfg"]
    sampler = args.sampler if args.sampler is not None else profile["def_sampler"]

    # Generic base defaults when no preset is used
    frames = args.frames if args.frames is not None else 120
    fps = args.fps if args.fps is not None else 24
    width = args.width if args.width is not None else 1024
    height = args.height if args.height is not None else 576
    zoom = args.zoom if args.zoom is not None else 1.02
    noise = args.noise if args.noise is not None else 0.065
    strength = args.strength if args.strength is not None else 0.65

    return {
        "steps": int(steps),
        "cfg_scale": float(cfg),
        "sampler": sampler,
        "frames": int(frames),
        "fps": int(fps),
        "width": int(width),
        "height": int(height),
        "zoom": float(zoom),
        "noise": float(noise),
        "strength": float(strength),
    }


def load_preset(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError("Preset JSON must be an object representing Deforum settings.")
    return data


def cmd_deforum(args: argparse.Namespace) -> None:
    base_url = args.base_url

    # Model choice + profile (used for sensible defaults in no-preset case)
    model_title, cls_key, profile = choose_model(
        base_url,
        model_hint=args.model,
        no_auto_model=args.no_auto_model,
        verbose=not args.quiet,
    )

    if args.preset:
        if not args.quiet:
            print(
                f"[info] Using Deforum preset: {args.preset} "
                f"(model: {model_title or 'current'}, class={cls_key})",
                file=sys.stderr,
            )
        try:
            settings = load_preset(args.preset)
        except Exception as e:  # noqa: BLE001
            print(f"[error] Could not load preset '{args.preset}': {e}", file=sys.stderr)
            sys.exit(1)

        # Only override a few obvious things. Leave schedules & exotic options as preset-defined.
        settings["animation_prompts_positive"] = args.prompt
        settings["prompts"] = settings.get("prompts", {})
        settings["prompts"]["0"] = args.prompt

        if args.negative:
            settings["animation_prompts_negative"] = args.negative

        # These overrides are applied ONLY if user explicitly provides them.
        if args.frames is not None:
            settings["max_frames"] = int(args.frames)
        if args.fps is not None:
            settings["fps"] = int(args.fps)
        if args.width is not None:
            settings["W"] = int(args.width)
        if args.height is not None:
            settings["H"] = int(args.height)
        if args.seed is not None:
            settings["seed"] = int(args.seed)

    else:
        params = resolve_deforum_params(args, profile)
        if not args.quiet:
            print(
                "[info] Deforum params "
                f"(model={model_title or 'unknown'}, class={cls_key}): "
                f"frames={params['frames']}, fps={params['fps']}, "
                f"steps={params['steps']}, cfg={params['cfg_scale']}, "
                f"sampler={params['sampler']}, zoom={params['zoom']}, "
                f"noise={params['noise']}, strength={params['strength']}",
                file=sys.stderr,
            )

        settings = build_deforum_settings_from_scratch(
            prompt=args.prompt,
            negative=args.negative or "",
            frames=params["frames"],
            fps=params["fps"],
            width=params["width"],
            height=params["height"],
            steps=params["steps"],
            cfg_scale=params["cfg_scale"],
            sampler=params["sampler"],
            seed=args.seed,
            zoom=params["zoom"],
            noise=params["noise"],
            strength=params["strength"],
        )

    # Apply audioreactive modulation if audio file is provided
    if hasattr(args, 'audio') and args.audio:
        if not AUDIO_AVAILABLE:
            print(
                "[error] Audioreactive features require librosa and numpy. "
                "Install with: pip install librosa numpy",
                file=sys.stderr,
            )
            sys.exit(1)
        
        if not os.path.exists(args.audio):
            print(f"[error] Audio file not found: {args.audio}", file=sys.stderr)
            sys.exit(1)
        
        if not args.quiet:
            print(f"[info] Applying audioreactive modulation from: {args.audio}", file=sys.stderr)
        
        # Parse frequency ranges if provided
        low_freq = (args.audio_low_min, args.audio_low_max)
        mid_freq = (args.audio_mid_min, args.audio_mid_max)
        high_freq = (args.audio_high_min, args.audio_high_max)
        
        # Build mappings from command-line arguments
        mappings: Dict[str, Dict[str, Dict[str, float]]] = {'low': {}, 'mid': {}, 'high': {}}
        
        # Helper to parse mapping arguments
        def add_mapping(band: str, param: str, base: float, mod: float) -> None:
            if mod > 0:  # Only add if modulation is specified
                mappings[band][param] = {'base': base, 'modulation': mod}
        
        # Strength mappings
        if hasattr(args, 'audio_map_strength_low') and args.audio_map_strength_low > 0:
            add_mapping('low', 'strength_schedule', params['strength'], args.audio_map_strength_low)
        if hasattr(args, 'audio_map_strength_mid') and args.audio_map_strength_mid > 0:
            add_mapping('mid', 'strength_schedule', params['strength'], args.audio_map_strength_mid)
        if hasattr(args, 'audio_map_strength_high') and args.audio_map_strength_high > 0:
            add_mapping('high', 'strength_schedule', params['strength'], args.audio_map_strength_high)
        
        # Zoom mappings
        if hasattr(args, 'audio_map_zoom_low') and args.audio_map_zoom_low > 0:
            add_mapping('low', 'zoom', params['zoom'], args.audio_map_zoom_low)
        if hasattr(args, 'audio_map_zoom_mid') and args.audio_map_zoom_mid > 0:
            add_mapping('mid', 'zoom', params['zoom'], args.audio_map_zoom_mid)
        if hasattr(args, 'audio_map_zoom_high') and args.audio_map_zoom_high > 0:
            add_mapping('high', 'zoom', params['zoom'], args.audio_map_zoom_high)
        
        # Rotation mappings (angle)
        if hasattr(args, 'audio_map_angle_low') and args.audio_map_angle_low > 0:
            add_mapping('low', 'angle', 0.0, args.audio_map_angle_low)
        if hasattr(args, 'audio_map_angle_mid') and args.audio_map_angle_mid > 0:
            add_mapping('mid', 'angle', 0.0, args.audio_map_angle_mid)
        if hasattr(args, 'audio_map_angle_high') and args.audio_map_angle_high > 0:
            add_mapping('high', 'angle', 0.0, args.audio_map_angle_high)
        
        # Translation X mappings
        if hasattr(args, 'audio_map_translation_x_low') and args.audio_map_translation_x_low > 0:
            add_mapping('low', 'translation_x', 0.0, args.audio_map_translation_x_low)
        if hasattr(args, 'audio_map_translation_x_mid') and args.audio_map_translation_x_mid > 0:
            add_mapping('mid', 'translation_x', 0.0, args.audio_map_translation_x_mid)
        if hasattr(args, 'audio_map_translation_x_high') and args.audio_map_translation_x_high > 0:
            add_mapping('high', 'translation_x', 0.0, args.audio_map_translation_x_high)
        
        # Translation Y mappings
        if hasattr(args, 'audio_map_translation_y_low') and args.audio_map_translation_y_low > 0:
            add_mapping('low', 'translation_y', 0.0, args.audio_map_translation_y_low)
        if hasattr(args, 'audio_map_translation_y_mid') and args.audio_map_translation_y_mid > 0:
            add_mapping('mid', 'translation_y', 0.0, args.audio_map_translation_y_mid)
        if hasattr(args, 'audio_map_translation_y_high') and args.audio_map_translation_y_high > 0:
            add_mapping('high', 'translation_y', 0.0, args.audio_map_translation_y_high)
        
        # Translation Z mappings
        if hasattr(args, 'audio_map_translation_z_low') and args.audio_map_translation_z_low > 0:
            add_mapping('low', 'translation_z', 1.75, args.audio_map_translation_z_low)
        if hasattr(args, 'audio_map_translation_z_mid') and args.audio_map_translation_z_mid > 0:
            add_mapping('mid', 'translation_z', 1.75, args.audio_map_translation_z_mid)
        if hasattr(args, 'audio_map_translation_z_high') and args.audio_map_translation_z_high > 0:
            add_mapping('high', 'translation_z', 1.75, args.audio_map_translation_z_high)
        
        # 3D Rotation mappings
        if hasattr(args, 'audio_map_rotation_3d_x_low') and args.audio_map_rotation_3d_x_low > 0:
            add_mapping('low', 'rotation_3d_x', 0.0, args.audio_map_rotation_3d_x_low)
        if hasattr(args, 'audio_map_rotation_3d_x_mid') and args.audio_map_rotation_3d_x_mid > 0:
            add_mapping('mid', 'rotation_3d_x', 0.0, args.audio_map_rotation_3d_x_mid)
        if hasattr(args, 'audio_map_rotation_3d_x_high') and args.audio_map_rotation_3d_x_high > 0:
            add_mapping('high', 'rotation_3d_x', 0.0, args.audio_map_rotation_3d_x_high)
        
        if hasattr(args, 'audio_map_rotation_3d_y_low') and args.audio_map_rotation_3d_y_low > 0:
            add_mapping('low', 'rotation_3d_y', 0.0, args.audio_map_rotation_3d_y_low)
        if hasattr(args, 'audio_map_rotation_3d_y_mid') and args.audio_map_rotation_3d_y_mid > 0:
            add_mapping('mid', 'rotation_3d_y', 0.0, args.audio_map_rotation_3d_y_mid)
        if hasattr(args, 'audio_map_rotation_3d_y_high') and args.audio_map_rotation_3d_y_high > 0:
            add_mapping('high', 'rotation_3d_y', 0.0, args.audio_map_rotation_3d_y_high)
        
        if hasattr(args, 'audio_map_rotation_3d_z_low') and args.audio_map_rotation_3d_z_low > 0:
            add_mapping('low', 'rotation_3d_z', 0.0, args.audio_map_rotation_3d_z_low)
        if hasattr(args, 'audio_map_rotation_3d_z_mid') and args.audio_map_rotation_3d_z_mid > 0:
            add_mapping('mid', 'rotation_3d_z', 0.0, args.audio_map_rotation_3d_z_mid)
        if hasattr(args, 'audio_map_rotation_3d_z_high') and args.audio_map_rotation_3d_z_high > 0:
            add_mapping('high', 'rotation_3d_z', 0.0, args.audio_map_rotation_3d_z_high)
        
        # Noise mappings
        if hasattr(args, 'audio_map_noise_low') and args.audio_map_noise_low > 0:
            add_mapping('low', 'noise_schedule', params['noise'], args.audio_map_noise_low)
        if hasattr(args, 'audio_map_noise_mid') and args.audio_map_noise_mid > 0:
            add_mapping('mid', 'noise_schedule', params['noise'], args.audio_map_noise_mid)
        if hasattr(args, 'audio_map_noise_high') and args.audio_map_noise_high > 0:
            add_mapping('high', 'noise_schedule', params['noise'], args.audio_map_noise_high)
        
        # CFG scale mappings
        if hasattr(args, 'audio_map_cfg_low') and args.audio_map_cfg_low > 0:
            add_mapping('low', 'cfg_scale_schedule', params['cfg_scale'], args.audio_map_cfg_low)
        if hasattr(args, 'audio_map_cfg_mid') and args.audio_map_cfg_mid > 0:
            add_mapping('mid', 'cfg_scale_schedule', params['cfg_scale'], args.audio_map_cfg_mid)
        if hasattr(args, 'audio_map_cfg_high') and args.audio_map_cfg_high > 0:
            add_mapping('high', 'cfg_scale_schedule', params['cfg_scale'], args.audio_map_cfg_high)
        
        if not any(mappings.values()):
            print("[warn] No audioreactive mappings specified. Use --audio-map-* flags.", file=sys.stderr)
        else:
            try:
                settings = apply_audioreactive_modulation(
                    settings, args.audio, mappings, low_freq, mid_freq, high_freq
                )
                if not args.quiet:
                    print("[info] Audioreactive modulation applied successfully", file=sys.stderr)
            except (RuntimeError, ValueError, OSError) as e:
                print(f"[error] Failed to apply audioreactive modulation: {e}", file=sys.stderr)
                sys.exit(1)

    payload = {
        "deforum_settings": settings,
        "options_overrides": {},
    }

    try:
        resp = requests.post(
            f"{base_url}/deforum_api/batches",
            json=payload,
            timeout=120,
        )
    except requests.exceptions.RequestException as e:  # noqa: BLE001
        print(f"[error] Deforum API call failed: {e}", file=sys.stderr)
        sys.exit(1)

    if resp.status_code != 202:
        print(f"[error] Deforum API error {resp.status_code}:", resp.text, file=sys.stderr)
        sys.exit(1)

    data = resp.json()
    batch_id = data.get("batch_id")
    job_ids = data.get("job_ids") or []

    print("Deforum batch submitted.")
    print(f"Batch ID: {batch_id}")
    if job_ids:
        print("Job IDs:", ", ".join(job_ids))

    if args.poll and batch_id:
        while True:
            time.sleep(args.poll_interval)
            try:
                sresp = requests.get(
                    f"{base_url}/deforum_api/batches/{batch_id}",
                    timeout=30,
                )
            except requests.exceptions.RequestException as e:  # noqa: BLE001
                print("[warn] Error polling batch status:", e, file=sys.stderr)
                break

            if sresp.status_code != 200:
                print(
                    "Status error:",
                    sresp.status_code,
                    sresp.text,
                    file=sys.stderr,
                )
                break

            sdata = sresp.json()
            status = sdata.get("status") or sdata.get("state")
            print("Status:", status)

            if status in {"completed", "failed", "cancelled", "canceled", "done"}:
                print("Final status payload:")
                print(sdata)
                break

        print(
            "Note: Deforum writes frames/video to its normal output directory "
            "(usually outputs/deforum) inside your Forge install.",
            file=sys.stderr,
        )


# --- CLI parser ----------------------------------------------------------------


def make_parser() -> argparse.ArgumentParser:
    epilog = """
Examples:

  forge_cli.py "a synthwave city at night"
      Quick txt2img with auto model choice (prefers Flux1-schnell).

  forge_cli.py --model "flux" img -n 4 "dreamy portrait, cinematic"
      Switch to first model whose name contains 'flux' and render 4 images.

  forge_cli.py models
      List all known checkpoints, their detected class and which one is active.

  forge_cli.py deforum "cosmic fractal cathedral"
      Fire a Deforum run with model-aware defaults (no preset, server must be started with --deforum-api).

  forge_cli.py deforum --preset preset.json "dreamlike forest"
      Use a Deforum JSON preset file and only override prompts (+ optional frames/fps/size if given).
"""
    parser = argparse.ArgumentParser(
        prog="forge-cli",
        description=(
            "Command-line client for Stable Diffusion WebUI Forge.\n\n"
            "Subcommands:\n"
            "  img       Generate still images (txt2img) with model-aware defaults.\n"
            "  deforum   Submit Deforum animation batches (supports JSON presets).\n"
            "  models    List available models and their detected profiles.\n"
        ),
        epilog=epilog,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help="Base URL of Forge API (e.g. http://127.0.0.1:7860)",
    )
    parser.add_argument(
        "--outdir",
        default=DEFAULT_OUT_DIR,
        help="Directory where txt2img results will be stored.",
    )
    parser.add_argument(
        "--model",
        help=(
            "Model name or substring to switch to before running a command. "
            "Matched against title/model_name/filename. "
            "See `forge-cli models` for candidates."
        ),
    )
    parser.add_argument(
        "--no-auto-model",
        "--no-flux",
        dest="no_auto_model",
        action="store_true",
        help=(
            "Disable all automatic model selection. "
            "Keeps the currently loaded checkpoint and uses generic defaults."
        ),
    )
    parser.add_argument(
        "-q",
        "--quiet",
        action="store_true",
        help="Silence informational logs; only print essential output.",
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # ------- img --------
    p_img = subparsers.add_parser(
        "img",
        help="Generate one or more images with txt2img.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description=(
            "Generate images via /sdapi/v1/txt2img.\n\n"
            "Steps, CFG and sampler are picked automatically based on the active model profile\n"
            "(Flux, SD1.5, SDXL, etc.), unless you override them with flags."
        ),
    )
    p_img.add_argument("prompt", help="Positive prompt.")
    p_img.add_argument(
        "-n",
        "--num-images",
        type=int,
        default=1,
        help="Number of images in one batch.",
    )
    p_img.add_argument(
        "-N",
        "--negative",
        default="",
        help="Negative prompt.",
    )
    p_img.add_argument(
        "-W",
        "--width",
        type=int,
        default=1024,
        help="Image width (pixels).",
    )
    p_img.add_argument(
        "-H",
        "--height",
        type=int,
        default=1024,
        help="Image height (pixels).",
    )
    p_img.add_argument(
        "--steps",
        type=int,
        default=None,
        help=(
            "Sampling steps. If omitted, a model-aware default is used "
            "(e.g. Flux1-schnell ~6, SD1.5 ~20, SDXL ~30)."
        ),
    )
    p_img.add_argument(
        "--cfg-scale",
        type=float,
        default=None,
        help=(
            "Classifier-free guidance scale. If omitted, a model-aware default is used "
            "(e.g. Flux1-schnell ~1.0, SD1.5 ~7.0, SDXL ~5.0)."
        ),
    )
    p_img.add_argument(
        "--sampler",
        default=None,
        help=(
            "Sampler name as shown in Forge. If omitted, a model-aware default is used "
            "(e.g. Euler or DPM++ 2M Karras depending on model)."
        ),
    )
    p_img.add_argument(
        "--seed",
        type=int,
        default=-1,
        help="-1 = random seed (delegated to Forge).",
    )
    p_img.set_defaults(func=cmd_img)

    # ------- deforum --------
    p_def = subparsers.add_parser(
        "deforum",
        help="Submit a Deforum animation batch (requires Forge --deforum-api).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description=(
            "Submit a Deforum animation batch via /deforum_api/batches.\n\n"
            "Without --preset, a compact set of settings is built with model-aware defaults.\n"
            "With --preset, a Deforum JSON preset file is used and only prompts (and optional\n"
            "frames/fps/size if you provide flags) are overridden."
        ),
    )
    p_def.add_argument("prompt", help="Positive prompt for the animation.")
    p_def.add_argument(
        "-N",
        "--negative",
        default="",
        help="Negative prompt.",
    )
    p_def.add_argument(
        "--preset",
        help=(
            "Path to a JSON file containing Deforum 'deforum_settings' (exported from Deforum UI). "
            "When provided, these settings are sent as-is except that prompts are replaced, and "
            "frames/fps/size/seed are overridden only if you pass the corresponding flags."
        ),
    )
    p_def.add_argument(
        "-f",
        "--frames",
        type=int,
        default=None,
        help="Number of frames to render. Default 120 (no preset); with preset, only overrides if set.",
    )
    p_def.add_argument(
        "--fps",
        type=int,
        default=None,
        help="Frames per second for the resulting video. Default 24 (no preset).",
    )
    p_def.add_argument(
        "-W",
        "--width",
        type=int,
        default=None,
        help="Frame width. Default 1024 (no preset).",
    )
    p_def.add_argument(
        "-H",
        "--height",
        type=int,
        default=None,
        help="Frame height. Default 576 (no preset).",
    )
    p_def.add_argument(
        "--steps",
        type=int,
        default=None,
        help=(
            "Sampling steps per frame. If omitted (and no preset), a model-aware default is used "
            "(e.g. Flux ~6, SD1.5 ~18, SDXL ~24)."
        ),
    )
    p_def.add_argument(
        "--cfg-scale",
        type=float,
        default=None,
        help=(
            "CFG scale. If omitted (and no preset), a model-aware default is used "
            "(e.g. Flux ~1.0–2.0, SD1.5 ~7.0, SDXL ~5.5)."
        ),
    )
    p_def.add_argument(
        "--sampler",
        default=None,
        help=(
            "Sampler name as shown in Forge. If omitted (and no preset), a model-aware default is used "
            "(e.g. Euler a or DPM++ 2M Karras)."
        ),
    )
    p_def.add_argument(
        "--seed",
        type=int,
        default=-1,
        help="-1 = random seed (delegated to Forge); overrides preset seed if provided.",
    )
    p_def.add_argument(
        "--zoom",
        type=float,
        default=None,
        help="Constant zoom per-frame (schedule 0:(zoom)). Default 1.02 if no preset.",
    )
    p_def.add_argument(
        "--noise",
        type=float,
        default=None,
        help="Base noise schedule value. Default 0.065 if no preset.",
    )
    p_def.add_argument(
        "--strength",
        type=float,
        default=None,
        help="Base strength schedule value. Default 0.65 if no preset.",
    )
    p_def.add_argument(
        "--poll",
        action="store_true",
        help="Poll Deforum API for batch status until finished.",
    )
    p_def.add_argument(
        "--poll-interval",
        type=float,
        default=10.0,
        help="Seconds between status checks when --poll is set.",
    )
    
    # Audioreactive arguments
    p_def.add_argument(
        "--audio",
        help="Path to audio file for audioreactive animation. Requires librosa and numpy.",
    )
    
    # Frequency range configuration
    p_def.add_argument(
        "--audio-low-min",
        type=float,
        default=100.0,
        help="Minimum frequency for low band (Hz). Default: 100",
    )
    p_def.add_argument(
        "--audio-low-max",
        type=float,
        default=300.0,
        help="Maximum frequency for low band (Hz). Default: 300",
    )
    p_def.add_argument(
        "--audio-mid-min",
        type=float,
        default=300.0,
        help="Minimum frequency for mid band (Hz). Default: 300",
    )
    p_def.add_argument(
        "--audio-mid-max",
        type=float,
        default=3000.0,
        help="Maximum frequency for mid band (Hz). Default: 3000",
    )
    p_def.add_argument(
        "--audio-high-min",
        type=float,
        default=3000.0,
        help="Minimum frequency for high band (Hz). Default: 3000",
    )
    p_def.add_argument(
        "--audio-high-max",
        type=float,
        default=8000.0,
        help="Maximum frequency for high band (Hz). Default: 8000",
    )
    
    # Strength mappings
    p_def.add_argument(
        "--audio-map-strength-low",
        type=float,
        default=0.0,
        help="Modulation amount for strength from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-strength-mid",
        type=float,
        default=0.0,
        help="Modulation amount for strength from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-strength-high",
        type=float,
        default=0.0,
        help="Modulation amount for strength from high frequency band (0 = disabled).",
    )
    
    # Zoom mappings
    p_def.add_argument(
        "--audio-map-zoom-low",
        type=float,
        default=0.0,
        help="Modulation amount for zoom from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-zoom-mid",
        type=float,
        default=0.0,
        help="Modulation amount for zoom from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-zoom-high",
        type=float,
        default=0.0,
        help="Modulation amount for zoom from high frequency band (0 = disabled).",
    )
    
    # Rotation (angle) mappings
    p_def.add_argument(
        "--audio-map-angle-low",
        type=float,
        default=0.0,
        help="Modulation amount for 2D rotation angle from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-angle-mid",
        type=float,
        default=0.0,
        help="Modulation amount for 2D rotation angle from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-angle-high",
        type=float,
        default=0.0,
        help="Modulation amount for 2D rotation angle from high frequency band (0 = disabled).",
    )
    
    # Translation X mappings
    p_def.add_argument(
        "--audio-map-translation-x-low",
        type=float,
        default=0.0,
        help="Modulation amount for translation X from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-translation-x-mid",
        type=float,
        default=0.0,
        help="Modulation amount for translation X from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-translation-x-high",
        type=float,
        default=0.0,
        help="Modulation amount for translation X from high frequency band (0 = disabled).",
    )
    
    # Translation Y mappings
    p_def.add_argument(
        "--audio-map-translation-y-low",
        type=float,
        default=0.0,
        help="Modulation amount for translation Y from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-translation-y-mid",
        type=float,
        default=0.0,
        help="Modulation amount for translation Y from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-translation-y-high",
        type=float,
        default=0.0,
        help="Modulation amount for translation Y from high frequency band (0 = disabled).",
    )
    
    # Translation Z mappings
    p_def.add_argument(
        "--audio-map-translation-z-low",
        type=float,
        default=0.0,
        help="Modulation amount for translation Z from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-translation-z-mid",
        type=float,
        default=0.0,
        help="Modulation amount for translation Z from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-translation-z-high",
        type=float,
        default=0.0,
        help="Modulation amount for translation Z from high frequency band (0 = disabled).",
    )
    
    # 3D Rotation X mappings
    p_def.add_argument(
        "--audio-map-rotation-3d-x-low",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation X from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-rotation-3d-x-mid",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation X from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-rotation-3d-x-high",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation X from high frequency band (0 = disabled).",
    )
    
    # 3D Rotation Y mappings
    p_def.add_argument(
        "--audio-map-rotation-3d-y-low",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation Y from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-rotation-3d-y-mid",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation Y from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-rotation-3d-y-high",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation Y from high frequency band (0 = disabled).",
    )
    
    # 3D Rotation Z mappings
    p_def.add_argument(
        "--audio-map-rotation-3d-z-low",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation Z from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-rotation-3d-z-mid",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation Z from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-rotation-3d-z-high",
        type=float,
        default=0.0,
        help="Modulation amount for 3D rotation Z from high frequency band (0 = disabled).",
    )
    
    # Noise mappings
    p_def.add_argument(
        "--audio-map-noise-low",
        type=float,
        default=0.0,
        help="Modulation amount for noise from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-noise-mid",
        type=float,
        default=0.0,
        help="Modulation amount for noise from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-noise-high",
        type=float,
        default=0.0,
        help="Modulation amount for noise from high frequency band (0 = disabled).",
    )
    
    # CFG scale mappings
    p_def.add_argument(
        "--audio-map-cfg-low",
        type=float,
        default=0.0,
        help="Modulation amount for CFG scale from low frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-cfg-mid",
        type=float,
        default=0.0,
        help="Modulation amount for CFG scale from mid frequency band (0 = disabled).",
    )
    p_def.add_argument(
        "--audio-map-cfg-high",
        type=float,
        default=0.0,
        help="Modulation amount for CFG scale from high frequency band (0 = disabled).",
    )
    
    p_def.set_defaults(func=cmd_deforum)

    # ------- models --------
    p_models = subparsers.add_parser(
        "models",
        help="List available models (checkpoints) and their detected profiles.",
    )
    p_models.set_defaults(func=cmd_models)

    return parser


# --- Entry point ---------------------------------------------------------------


def main() -> None:
    # Convenience: allow `forge-cli.py "a cat in space"` without subcommand,
    # defaulting to `img`.
    if len(sys.argv) > 1 and sys.argv[1] not in {
        "img",
        "deforum",
        "models",
        "-h",
        "--help",
    }:
        sys.argv.insert(1, "img")

    parser = make_parser()
    args = parser.parse_args()

    try:
        args.func(args)
    except requests.exceptions.ConnectionError as e:
        print(
            f"[error] Could not reach Forge at {args.base_url}: {e}",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
