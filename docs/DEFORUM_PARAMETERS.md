## Deforum Modulation Parameters (Official Deforum Docs)

This list is compiled from the official Deforum documentation and the Deforum
animation settings reference. It also includes the official gradient
conditioning parameters from the Deforum gradient conditioning reference.

Sources:
- https://deforum.github.io/
- https://github.com/deforum-art/sd-webui-deforum/wiki/Animation-Settings
- https://docs.google.com/spreadsheets/d/1mQEAFejPdHPFrvrX3fobq7uRFcbdDL77z7ZCdwe1DC0/edit

Parameters are grouped by category, using the official Deforum parameter names.

---

## Core Generation

| Key | Description |
| --- | --- |
| `width` | Output width in pixels. |
| `height` | Output height in pixels. |
| `max_frames` | Total frames to render. |
| `sampler_name` | Sampler choice (e.g. Euler, DPM++, DDIM). |
| `scheduler` | Scheduler choice (e.g. karras, exponential, simple). |
| `seed_schedule` | Seed per frame (supports keyframing). |
| `seed_behavior` | Fixed or randomized seed behavior. |

---

## Prompt Weighting

| Key | Description |
| --- | --- |
| `prompt_weighting` | Enable weighted subprompts. |
| `normalize_prompt_weights` | Normalize prompt weights to sum to 1. |
| `log_weighted_subprompts` | Log weighted subprompts for debugging. |

---

## Animation Modes

| Key | Description |
| --- | --- |
| `animation_mode` | Animation mode (2D, 3D, Video Input). |
| `border` | Border handling mode for frames (wrap, mirror, replicate, etc.). |

---

## 2D Motion (Animation Settings)

| Key | Description |
| --- | --- |
| `angle` | 2D rotation angle per frame. |
| `zoom` | 2D zoom level per frame. |
| `translation_x` | X translation per frame. |
| `translation_y` | Y translation per frame. |

---

## 3D Motion (Animation Settings)

| Key | Description |
| --- | --- |
| `translation_z` | Z translation per frame. |
| `rotation_3d_x` | 3D rotation around X axis. |
| `rotation_3d_y` | 3D rotation around Y axis. |
| `rotation_3d_z` | 3D rotation around Z axis. |
| `fov` | Field of view for 3D camera. |

---

## Animation Quality & Consistency

| Key | Description |
| --- | --- |
| `diffusion_cadence` | Frames between diffusion steps. |
| `noise_schedule` | Noise amount per frame (keyframable). |
| `contrast_schedule` | Contrast per frame (keyframable). |
| `color_coherence` | Color consistency mode across frames. |
| `color_coherence_video_every_N_frames` | Re-apply color coherence every N frames for video. |

---

## Strength & CFG Schedules

| Key | Description |
| --- | --- |
| `strength_schedule` | Denoising strength per frame (keyframable). |
| `cfg_scale_schedule` | CFG scale per frame (keyframable). |

---

## Depth & 3D Settings

| Key | Description |
| --- | --- |
| `midas_weight` | Depth estimation influence when using 3D. |
| `padding_mode` | Padding strategy for depth warping. |
| `sampling_mode` | Sampling strategy for depth warping. |
| `save_depth_maps` | Save depth maps alongside frames. |

---

## Video Input

| Key | Description |
| --- | --- |
| `video_init_path` | Path to a video used as init input. |
| `extract_nth_frame` | Frame skip interval when sampling the input video. |

---

## Gradient Conditioning (GC)

| Key | Description |
| --- | --- |
| `mean_scale` | Mean scale for gradient conditioning. |
| `var_scale` | Variance scale for gradient conditioning. |
| `exposure_scale` | Exposure scale for gradient conditioning. |
| `exposure_target` | Exposure target for gradient conditioning. |
| `colormatch_scale` | Color match scale for gradient conditioning. |
| `colormatch_image` | Reference image for color match. |
| `colormatch_n_colors` | Number of colors for color match clustering. |
| `ignore_sat_weight` | Weight for ignoring saturation during color match. |
| `clip_name` | CLIP model name for gradient conditioning. |
| `clip_scale` | Scale for CLIP gradient conditioning. |
| `aesthetics_scale` | Scale for aesthetics model conditioning. |
| `cutn` | Number of CLIP cuts. |
| `cut_pow` | Power for CLIP cut weighting. |
| `gradient_wrt` | Target for gradient computation. |
| `gradient_add_to` | Where to apply gradients. |
| `decode_method` | Decoder method for gradient conditioning. |
| `grad_threshold_type` | Threshold type for gradient conditioning. |

---

## Keyframing Notes

Any parameter documented as a `*_schedule` in Deforum supports keyframing with
frame/value syntax such as `0:(value), 1:(value)`, including math expressions.
See the official animation settings documentation for the full schedule list.

