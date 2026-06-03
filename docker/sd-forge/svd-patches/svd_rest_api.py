# Defora REST wrapper for Forge sd_forge_svd (Stable Video Diffusion).
# Registers /svd_api/checkpoints and /svd_api/generate on the Forge FastAPI app.

import base64
import io
import logging
import os
import pathlib
import traceback
from typing import Any, Dict, Optional

import gradio as gr
import numpy as np
import torch
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from PIL import Image

log = logging.getLogger(__name__)

SVD_ROOT = None


def _svd_root():
    global SVD_ROOT
    if SVD_ROOT is None:
        from modules.paths import models_path
        SVD_ROOT = os.path.join(models_path, "svd")
        os.makedirs(SVD_ROOT, exist_ok=True)
    return SVD_ROOT


def _list_checkpoints():
    from modules import shared
    root = _svd_root()
    return sorted(
        pathlib.Path(x).name
        for x in shared.walk_files(root, allowed_extensions=[".pt", ".ckpt", ".safetensors"])
    )


def _decode_init_image(raw: Optional[str]):
    if not raw:
        return None
    text = str(raw).strip()
    if text.startswith("data:"):
        text = text.split(",", 1)[-1]
    data = base64.b64decode(text)
    img = Image.open(io.BytesIO(data)).convert("RGB")
    return np.array(img)


@torch.inference_mode()
@torch.no_grad()
def _predict_svd(
    filename,
    width,
    height,
    video_frames,
    motion_bucket_id,
    fps,
    augmentation_level,
    sampling_seed,
    sampling_steps,
    sampling_cfg,
    sampling_sampler_name,
    sampling_scheduler,
    sampling_denoise,
    guidance_min_cfg,
    input_image,
):
    from modules_forge.forge_util import numpy_to_pytorch, pytorch_to_numpy, write_images_to_mp4
    from ldm_patched.modules.sd import load_checkpoint_guess_config
    from ldm_patched.contrib.external_video_model import VideoLinearCFGGuidance, SVD_img2vid_Conditioning
    from ldm_patched.contrib.external import KSampler, VAEDecode

    op_video_linear = VideoLinearCFGGuidance()
    op_svd_cond = SVD_img2vid_Conditioning()
    op_ksampler = KSampler()
    op_vae_decode = VAEDecode()

    path = os.path.join(_svd_root(), filename)
    model_raw, _, vae, clip_vision = load_checkpoint_guess_config(
        path, output_vae=True, output_clip=False, output_clipvision=True
    )
    model = op_video_linear.patch(model_raw, guidance_min_cfg)[0]
    init_image = numpy_to_pytorch(input_image)
    positive, negative, latent_image = op_svd_cond.encode(
        clip_vision, init_image, vae, width, height, video_frames, motion_bucket_id, fps, augmentation_level
    )
    output_latent = op_ksampler.sample(
        model,
        sampling_seed,
        sampling_steps,
        sampling_cfg,
        sampling_sampler_name,
        sampling_scheduler,
        positive,
        negative,
        latent_image,
        sampling_denoise,
    )[0]
    output_pixels = op_vae_decode.decode(vae, output_latent)[0]
    outputs = pytorch_to_numpy(output_pixels)
    video_filename = write_images_to_mp4(outputs, fps=fps)
    return outputs, video_filename


def _run_svd(payload: Dict[str, Any]):
    checkpoint = str(payload.get("checkpoint") or "").strip()
    if not checkpoint:
        names = _list_checkpoints()
        if not names:
            raise ValueError("No SVD checkpoints in models/svd — add svd_xt_1_1.safetensors")
        checkpoint = names[0]

    init_image = _decode_init_image(payload.get("init_image"))
    if init_image is None:
        raise ValueError("init_image required (base64 PNG/JPEG)")

    outputs, video_filename = _predict_svd(
        checkpoint,
        int(payload.get("width") or 1024),
        int(payload.get("height") or 576),
        int(payload.get("video_frames") or 25),
        int(payload.get("motion_bucket_id") or 127),
        int(payload.get("fps") or 6),
        float(payload.get("augmentation_level") or 0),
        int(payload.get("sampling_seed") or 12345),
        int(payload.get("sampling_steps") or 25),
        float(payload.get("sampling_cfg") or 2.5),
        str(payload.get("sampling_sampler_name") or "euler"),
        str(payload.get("sampling_scheduler") or "karras"),
        float(payload.get("sampling_denoise") if payload.get("sampling_denoise") is not None else 1.0),
        float(payload.get("guidance_min_cfg") or 1.0),
        init_image,
    )

    first_frame_path = None
    if outputs is not None and len(outputs) > 0:
        try:
            from modules.images import save_image
            first_frame_path = save_image(outputs[0], "", "", -1, "", False, None)
        except Exception:
            first_frame_path = None

    return {
        "ok": True,
        "video_path": video_filename,
        "path": first_frame_path,
        "first_frame_path": first_frame_path,
        "frame_count": len(outputs) if outputs is not None else 0,
        "checkpoint": checkpoint,
    }


def svd_rest_api(_: gr.Blocks, app: FastAPI):
    @app.get("/svd_api/checkpoints")
    async def svd_checkpoints():
        try:
            names = _list_checkpoints()
            xt11 = [
                n for n in names
                if any(tag in n.lower() for tag in ("1_1", "xt-1.1", "xt_1_1", "img2vid-xt-1.1"))
            ]
            return JSONResponse(content={"checkpoints": names, "xt11_available": len(xt11) > 0, "xt11": xt11})
        except Exception as exc:
            log.exception("svd checkpoints")
            return JSONResponse(status_code=500, content={"error": str(exc)})

    @app.post("/svd_api/generate")
    async def svd_generate(request):
        try:
            body = await request.json()
            if not isinstance(body, dict):
                return JSONResponse(status_code=400, content={"error": "JSON body required"})
            result = _run_svd(body)
            return JSONResponse(content=result)
        except Exception as exc:
            log.exception("svd generate")
            traceback.print_exc()
            return JSONResponse(status_code=500, content={"error": str(exc)})


try:
    import modules.script_callbacks as script_callbacks

    script_callbacks.on_app_started(svd_rest_api)
except Exception:
    pass
