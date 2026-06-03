"""CLI engine default timing and LCM/WAN/SVD presets."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

from defora_cli.engine_defaults import (
    DEFAULT_DURATION_SEC,
    ENGINE_IDS,
    LCM_LORA_TAG,
    frames_for_duration,
    optimal_animatelcm_engine,
    optimal_deforum_lcm,
    optimal_svd_engine,
    optimal_wan_engine,
    timing_for_engine,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
MERGE_SCRIPT = REPO_ROOT / "tools" / "scripts" / "merge-engine-settings.mjs"


def test_engine_ids_cover_all_cli_engines():
    assert set(ENGINE_IDS) == {"deforum", "deforum-lcm", "wan", "animatelcm", "svd", "webgl"}


def test_timing_for_five_second_clips():
    assert timing_for_engine("deforum", 5) == (120, 24)
    assert timing_for_engine("deforum-lcm", 5) == (120, 24)
    assert timing_for_engine("animatelcm", 5) == (120, 24)
    assert timing_for_engine("wan", 5) == (60, 12)
    assert timing_for_engine("svd", 5) == (30, 6)


def test_frames_for_duration_rounds():
    assert frames_for_duration(5, 24) == 120
    assert frames_for_duration(5, 12) == 60
    assert frames_for_duration(5, 6) == 30


def test_optimal_deforum_lcm_matches_ui_fast_preset():
    settings = optimal_deforum_lcm("test prompt", duration_sec=DEFAULT_DURATION_SEC)
    assert settings["steps"] == 4
    assert settings["sampler"] == "Euler"
    assert settings["scheduler"] == "sgm_uniform"
    assert settings["scale"] == 1.0
    assert settings["max_frames"] == 120
    assert settings["fps"] == 24
    assert LCM_LORA_TAG in settings["animation_prompts_positive"]


def test_optimal_wan_turbo_preset():
    wan = optimal_wan_engine(5)
    assert wan["wan_speed_preset"] == "Turbo"
    assert wan["wan_inference_steps"] == 8
    assert wan["wan_flash_attention_mode"] == "Force Flash Attention"


def test_optimal_animatelcm_four_steps():
    alcm = optimal_animatelcm_engine()
    assert alcm["alcm_steps"] == 4
    assert alcm["motion_type"] == "pan"


def test_optimal_svd_xt_landscape_five_seconds():
    svd = optimal_svd_engine(5)
    assert svd["svd_preset"] == "XT 1.1"
    assert svd["video_frames"] == 30
    assert svd["fps"] == 6
    assert svd["sampling_sampler_name"] == "euler"
    assert svd["sampling_scheduler"] == "karras"


@pytest.mark.skipif(not MERGE_SCRIPT.is_file(), reason="merge script missing")
def test_merge_engine_settings_wan_outputs_deforum_mode():
    payload = {
        "engine": "wan",
        "prompt": "ocean waves",
        "negative": "blur",
        "durationSec": 5,
        "wanEngine": optimal_wan_engine(5),
    }
    proc = subprocess.run(
        ["node", str(MERGE_SCRIPT)],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        check=True,
        cwd=str(REPO_ROOT),
    )
    merged = json.loads(proc.stdout)
    assert merged["kind"] == "deforum"
    assert merged["settings"]["animation_mode"] == "Wan Video"
    assert merged["maxFrames"] == 60
    assert merged["fps"] == 12


@pytest.mark.skipif(not MERGE_SCRIPT.is_file(), reason="merge script missing")
def test_merge_engine_settings_animatelcm():
    payload = {
        "engine": "animatelcm",
        "prompt": "motion test",
        "durationSec": 5,
        "animateLcmEngine": optimal_animatelcm_engine(),
    }
    proc = subprocess.run(
        ["node", str(MERGE_SCRIPT)],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        check=True,
        cwd=str(REPO_ROOT),
    )
    merged = json.loads(proc.stdout)
    assert merged["kind"] == "deforum"
    assert merged["settings"]["animation_mode"] == "AnimateLCM"
    assert merged["settings"]["steps"] == 4


@pytest.mark.skipif(not MERGE_SCRIPT.is_file(), reason="merge script missing")
def test_merge_engine_settings_svd_payload():
    payload = {
        "engine": "svd",
        "prompt": "landscape",
        "durationSec": 5,
        "svdEngine": optimal_svd_engine(5),
        "initImageBase64": "aGVsbG8=",
    }
    proc = subprocess.run(
        ["node", str(MERGE_SCRIPT)],
        input=json.dumps(payload),
        capture_output=True,
        text=True,
        check=True,
        cwd=str(REPO_ROOT),
    )
    merged = json.loads(proc.stdout)
    assert merged["kind"] == "svd"
    assert merged["payload"]["video_frames"] == 30
    assert merged["payload"]["fps"] == 6
