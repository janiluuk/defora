"""
Optimal CLI defaults for each Defora animation engine.

Mirrors docker/web engine config (LCM Deforum, Wan Turbo, SVD XT 1.1, AnimateLCM).
"""

from __future__ import annotations

from typing import Any, Dict, Optional, Tuple

DEFAULT_DURATION_SEC = 5.0
DEFAULT_PROMPT = "cinematic abstract motion, rich color, high detail, smooth camera drift"
DEFAULT_NEGATIVE = "static, blurry, low quality, watermark, text, logo"

# Forge animation plugins (see docker/web/src/animation-plugins/registry.mjs)
ENGINE_IDS = ("deforum", "deforum-lcm", "wan", "animatelcm", "svd", "webgl")

# Representative WebGL standby modes for CLI capture demos
WEBGL_DEMO_MODES = (
    "transition",
    "protoplanet",
    "periodic_table",
    "instancing",
    "ocean",
    "marching",
)

LCM_FORGE_MODEL = "SDXL/sd_xl_turbo_1.0_fp16.safetensors"
LCM_LORA_TAG = "<lora:lcm-lora-ssd-1b:1>"


def frames_for_duration(duration_sec: float, fps: int) -> int:
    return max(1, round(float(duration_sec) * int(fps)))


def timing_for_engine(engine: str, duration_sec: float = DEFAULT_DURATION_SEC) -> Tuple[int, int]:
    """Return (max_frames, fps) for ~duration_sec seconds."""
    eng = (engine or "deforum").lower()
    if eng == "wan":
        fps = 12
    elif eng == "svd":
        fps = 6
    else:
        fps = 24
    return frames_for_duration(duration_sec, fps), fps


def optimal_deforum_lcm(
    prompt: str = DEFAULT_PROMPT,
    negative: str = DEFAULT_NEGATIVE,
    duration_sec: float = DEFAULT_DURATION_SEC,
) -> Dict[str, Any]:
    """UI-aligned LCM Deforum (deforum-settings-schema.mjs)."""
    max_frames, fps = timing_for_engine("deforum-lcm", duration_sec)
    pos = prompt.strip()
    if LCM_LORA_TAG not in pos:
        pos = f"{pos}, {LCM_LORA_TAG}" if pos else LCM_LORA_TAG
    return {
        "animation_mode": "2D",
        "max_frames": max_frames,
        "fps": fps,
        "W": 512,
        "H": 512,
        "steps": 4,
        "sampler": "Euler",
        "scheduler": "sgm_uniform",
        "scale": 1.0,
        "cfg_scale_schedule": "0:(1)",
        "steps_schedule": "0:(4)",
        "strength": 0.60,
        "strength_schedule": "0:(0.60)",
        "noise_schedule": "0:(0.065)",
        "zoom": "0:(1.02)",
        "sd_model_name": LCM_FORGE_MODEL,
        "skip_video_creation": False,
        "animation_prompts_positive": pos,
        "animation_prompts_negative": negative,
        "prompts": {"0": pos},
    }


def optimal_wan_engine(duration_sec: float = DEFAULT_DURATION_SEC) -> Dict[str, Any]:
    """Turbo preset — fast 5s CLI demos (wan-engine-config.mjs)."""
    return {
        "wan_speed_preset": "Turbo",
        "wan_motion_preset": "Dolly",
        "wan_inference_steps": 8,
        "wan_flash_attention_mode": "Force Flash Attention",
        "wan_enable_interpolation": False,
        "wan_guidance_scale": 6,
        "wan_guidance_override": True,
        "wan_frame_overlap": 1,
        "wan_motion_strength": 1.0,
        "wan_motion_strength_override": True,
        "wan_movement_sensitivity": 1.0,
        "wan_t2v_model": "1.3B VACE",
        "wan_resolution": "864x480 (Landscape)",
        "wan_auto_download": True,
    }


def optimal_animatelcm_engine() -> Dict[str, Any]:
    return {
        "motion_type": "pan",
        "alcm_steps": 4,
        "alcm_cfg": 7.0,
        "alcm_strength": 0.75,
        "alcm_noise": 0.05,
        "alcm_motion_amount": 1.0,
        "alcm_zoom": 1.02,
    }


def optimal_svd_engine(duration_sec: float = DEFAULT_DURATION_SEC) -> Dict[str, Any]:
    """SVD XT 1.1 — 30 frames @ 6 fps ≈ 5 s."""
    _, fps = timing_for_engine("svd", duration_sec)
    frames = frames_for_duration(duration_sec, fps)
    return {
        "svd_preset": "XT 1.1",
        "svd_checkpoint": "svd_xt_1_1.safetensors",
        "svd_resolution": "1024×576 (XT 1.1 landscape)",
        "width": 1024,
        "height": 576,
        "video_frames": frames,
        "motion_bucket_id": 127,
        "fps": fps,
        "augmentation_level": 0,
        "sampling_steps": 25,
        "sampling_cfg": 2.5,
        "sampling_denoise": 1,
        "guidance_min_cfg": 1,
        "sampling_sampler_name": "euler",
        "sampling_scheduler": "karras",
        "sampling_seed": -1,
    }


def engine_cli_summary(engine: str, duration_sec: float = DEFAULT_DURATION_SEC) -> Dict[str, Any]:
    eng = (engine or "deforum").lower()
    max_frames, fps = timing_for_engine(eng, duration_sec)
    return {
        "engine": eng,
        "duration_sec": duration_sec,
        "max_frames": max_frames,
        "fps": fps,
    }
