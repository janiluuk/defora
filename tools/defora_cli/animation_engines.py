"""Submit animation jobs to Forge / Defora web APIs."""

from __future__ import annotations

import base64
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, Optional

import requests

from defora_cli.engine_defaults import (
    DEFAULT_NEGATIVE,
    DEFAULT_PROMPT,
    optimal_animatelcm_engine,
    optimal_deforum_lcm,
    optimal_svd_engine,
    optimal_wan_engine,
    timing_for_engine,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
MERGE_SCRIPT = REPO_ROOT / "tools" / "scripts" / "merge-engine-settings.mjs"


class EngineSkip(Exception):
    """Engine unavailable (Forge down, missing checkpoint, etc.)."""


def merge_engine_via_node(
    engine: str,
    *,
    prompt: str = DEFAULT_PROMPT,
    negative: str = DEFAULT_NEGATIVE,
    duration_sec: float = 5.0,
    max_frames: Optional[int] = None,
    fps: Optional[int] = None,
    wan_engine: Optional[Dict[str, Any]] = None,
    svd_engine: Optional[Dict[str, Any]] = None,
    animatelcm_engine: Optional[Dict[str, Any]] = None,
    init_image_base64: Optional[str] = None,
    preview: bool = False,
) -> Dict[str, Any]:
    if not MERGE_SCRIPT.is_file():
        raise FileNotFoundError(f"Missing merge script: {MERGE_SCRIPT}")
    mf, default_fps = timing_for_engine(engine, duration_sec)
    payload: Dict[str, Any] = {
        "engine": engine,
        "prompt": prompt,
        "negative": negative,
        "durationSec": duration_sec,
        "maxFrames": max_frames if max_frames is not None else mf,
        "fps": fps if fps is not None else default_fps,
        "initImageBase64": init_image_base64,
        "preview": preview,
    }
    if engine == "wan":
        payload["wanEngine"] = wan_engine or optimal_wan_engine(duration_sec)
    if engine == "svd":
        payload["svdEngine"] = svd_engine or optimal_svd_engine(duration_sec)
    if engine == "animatelcm":
        payload["animateLcmEngine"] = animatelcm_engine or optimal_animatelcm_engine()
    payload = {k: v for k, v in payload.items() if v is not None}
    try:
        proc = subprocess.run(
            ["node", str(MERGE_SCRIPT)],
            input=json.dumps(payload),
            capture_output=True,
            text=True,
            check=False,
            cwd=str(REPO_ROOT),
        )
    except FileNotFoundError as exc:
        raise EngineSkip("node not found — install Node.js to merge engine settings") from exc
    if proc.returncode != 0:
        raise RuntimeError(f"merge-engine-settings failed: {proc.stderr.strip() or proc.stdout}")
    return json.loads(proc.stdout)


def forge_reachable(base_url: str, timeout: float = 3.0) -> bool:
    try:
        r = requests.get(f"{base_url.rstrip('/')}/sdapi/v1/sd-models", timeout=timeout)
        return r.status_code == 200
    except requests.RequestException:
        return False


def encode_image_file(path: str) -> str:
    return base64.b64encode(Path(path).read_bytes()).decode("ascii")


def submit_deforum_batch(base_url: str, settings: Dict[str, Any], timeout: int = 120) -> Dict[str, Any]:
    r = requests.post(
        f"{base_url.rstrip('/')}/deforum_api/batches",
        json={"deforum_settings": settings, "options_overrides": {}},
        timeout=timeout,
    )
    if r.status_code == 404:
        raise EngineSkip("Deforum API not found — start Forge with --deforum-api")
    if r.status_code != 202:
        raise RuntimeError(f"Deforum submit failed {r.status_code}: {r.text[:500]}")
    return r.json()


def submit_svd_generate(base_url: str, payload: Dict[str, Any], timeout: int = 600) -> Dict[str, Any]:
    r = requests.post(
        f"{base_url.rstrip('/')}/svd_api/generate",
        json=payload,
        timeout=timeout,
    )
    if r.status_code == 404:
        raise EngineSkip("SVD API not found — install sd_forge_svd extension")
    if r.status_code != 200:
        raise RuntimeError(f"SVD generate failed {r.status_code}: {r.text[:500]}")
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(f"SVD generate error: {data}")
    return data


def poll_deforum_batch(
    base_url: str,
    batch_id: str,
    interval: float = 10.0,
    max_wait: float = 3600.0,
) -> Dict[str, Any]:
    deadline = time.time() + max_wait
    while time.time() < deadline:
        time.sleep(interval)
        r = requests.get(f"{base_url.rstrip('/')}/deforum_api/batches/{batch_id}", timeout=30)
        if r.status_code != 200:
            continue
        data = r.json()
        status = str(data.get("status") or data.get("state") or "").lower()
        print(f"  status: {status}", file=sys.stderr)
        if status in {"completed", "failed", "cancelled", "canceled", "done"}:
            return data
    raise TimeoutError(f"Batch {batch_id} did not finish within {max_wait}s")


def generate_init_still(
    base_url: str,
    prompt: str,
    width: int = 1024,
    height: int = 576,
    steps: int = 6,
    cfg: float = 1.0,
) -> str:
    payload = {
        "prompt": prompt,
        "negative_prompt": DEFAULT_NEGATIVE,
        "width": width,
        "height": height,
        "steps": steps,
        "cfg_scale": cfg,
        "sampler_name": "Euler",
        "batch_size": 1,
        "n_iter": 1,
    }
    r = requests.post(f"{base_url.rstrip('/')}/sdapi/v1/txt2img", json=payload, timeout=300)
    r.raise_for_status()
    images = r.json().get("images") or []
    if not images:
        raise RuntimeError("txt2img returned no images for SVD init")
    return images[0]


def run_engine_job(
    engine: str,
    base_url: str,
    *,
    prompt: str = DEFAULT_PROMPT,
    negative: str = DEFAULT_NEGATIVE,
    duration_sec: float = 5.0,
    init_image_path: Optional[str] = None,
    poll: bool = True,
    poll_interval: float = 10.0,
) -> Dict[str, Any]:
    eng = engine.lower()
    if not forge_reachable(base_url):
        raise EngineSkip(f"Forge not reachable at {base_url}")

    if eng == "deforum-lcm":
        settings = optimal_deforum_lcm(prompt, negative, duration_sec)
        if init_image_path:
            settings["use_init"] = True
            settings["init_image"] = encode_image_file(init_image_path)
        result = submit_deforum_batch(base_url, settings)
        if poll and result.get("batch_id"):
            result["final"] = poll_deforum_batch(base_url, result["batch_id"], poll_interval)
        return {"engine": eng, "kind": "deforum", "result": result, "settings": settings}

    if eng == "wan":
        merged = merge_engine_via_node("wan", prompt=prompt, negative=negative, duration_sec=duration_sec)
        settings = merged["settings"]
        if init_image_path:
            settings["use_init"] = True
            settings["init_image"] = encode_image_file(init_image_path)
        result = submit_deforum_batch(base_url, settings)
        if poll and result.get("batch_id"):
            result["final"] = poll_deforum_batch(base_url, result["batch_id"], poll_interval)
        return {"engine": "wan", "kind": "deforum", "result": result, "settings": settings}

    if eng == "animatelcm":
        merged = merge_engine_via_node("animatelcm", prompt=prompt, negative=negative, duration_sec=duration_sec)
        settings = merged["settings"]
        if init_image_path:
            settings["use_init"] = True
            settings["init_image"] = encode_image_file(init_image_path)
        result = submit_deforum_batch(base_url, settings)
        if poll and result.get("batch_id"):
            result["final"] = poll_deforum_batch(base_url, result["batch_id"], poll_interval)
        return {"engine": "animatelcm", "kind": "deforum", "result": result, "settings": settings}

    if eng == "svd":
        init_b64 = encode_image_file(init_image_path) if init_image_path else None
        if not init_b64:
            print("  generating SVD init still via txt2img…", file=sys.stderr)
            init_b64 = generate_init_still(base_url, prompt)
        merged = merge_engine_via_node(
            "svd",
            prompt=prompt,
            duration_sec=duration_sec,
            init_image_base64=init_b64,
        )
        payload = merged["payload"]
        result = submit_svd_generate(base_url, payload)
        return {"engine": "svd", "kind": "svd", "result": result, "payload": payload}

    if eng == "webgl":
        raise EngineSkip("WebGL is browser-only — run: node docker/web/scripts/capture-webgl-demos.mjs")

    raise ValueError(f"Unknown engine: {engine}")
