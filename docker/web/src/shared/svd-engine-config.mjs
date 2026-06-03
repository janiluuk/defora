/** Stable Video Diffusion (Forge sd_forge_svd tab). XT 1.1 tuned defaults. */

export const SVD_XT_11_CHECKPOINT_HINTS = [
  'svd_xt_1_1.safetensors',
  'svd_xt.safetensors',
  'svd_img2vid_xt_1_1.safetensors',
];

export const SVD_PRESET_NAMES = ['XT 1.1', 'XT', 'Low motion', 'High motion'];

/** Recommended Img2Vid-XT-1.1 settings (1024×576, 25 frames, motion 127, 6 fps). */
export const SVD_PRESETS = {
  'XT 1.1': {
    svd_preset: 'XT 1.1',
    svd_checkpoint: 'svd_xt_1_1.safetensors',
    width: 1024,
    height: 576,
    video_frames: 25,
    motion_bucket_id: 127,
    fps: 6,
    augmentation_level: 0,
    sampling_steps: 25,
    sampling_cfg: 2.5,
    sampling_denoise: 1,
    guidance_min_cfg: 1,
    sampling_sampler_name: 'euler',
    sampling_scheduler: 'karras',
  },
  XT: {
    svd_preset: 'XT',
    svd_checkpoint: 'svd_xt.safetensors',
    width: 1024,
    height: 576,
    video_frames: 25,
    motion_bucket_id: 127,
    fps: 6,
    augmentation_level: 0,
    sampling_steps: 25,
    sampling_cfg: 2.5,
    sampling_denoise: 1,
    guidance_min_cfg: 1,
    sampling_sampler_name: 'euler',
    sampling_scheduler: 'karras',
  },
  'Low motion': {
    svd_preset: 'Low motion',
    motion_bucket_id: 80,
    augmentation_level: 0,
    fps: 6,
  },
  'High motion': {
    svd_preset: 'High motion',
    motion_bucket_id: 180,
    augmentation_level: 0.05,
    fps: 6,
  },
};

export const SVD_SAMPLER_OPTIONS = [
  'euler',
  'euler_ancestral',
  'heun',
  'heunpp2',
  'dpm_2',
  'dpm_2_ancestral',
  'lms',
  'dpm_fast',
  'dpm_adaptive',
  'dpmpp_2s_ancestral',
  'dpmpp_sde',
  'dpmpp_sde_gpu',
  'dpmpp_2m',
  'dpmpp_2m_sde',
  'dpmpp_2m_sde_gpu',
  'dpmpp_3m_sde',
  'dpmpp_3m_sde_gpu',
  'ddpm',
  'lcm',
  'ddim',
  'uni_pc',
  'uni_pc_bh2',
];

export const SVD_SCHEDULER_OPTIONS = [
  'normal',
  'karras',
  'exponential',
  'sgm_uniform',
  'simple',
  'ddim_uniform',
];

export const SVD_RESOLUTION_PRESETS = [
  '1024×576 (XT 1.1 landscape)',
  '576×1024 (XT 1.1 portrait)',
];

export const DEFAULT_SVD_ENGINE = {
  svd_preset: 'XT 1.1',
  svd_checkpoint: 'svd_xt_1_1.safetensors',
  svd_resolution: '1024×576 (XT 1.1 landscape)',
  width: 1024,
  height: 576,
  video_frames: 25,
  motion_bucket_id: 127,
  fps: 6,
  augmentation_level: 0,
  sampling_steps: 25,
  sampling_cfg: 2.5,
  sampling_denoise: 1,
  guidance_min_cfg: 1,
  sampling_sampler_name: 'euler',
  sampling_scheduler: 'karras',
  sampling_seed: -1,
  svd_init_image: null,
};

/** UI control definitions for LIVE → Engine controls (SVD layer). */
export const SVD_ENGINE_CONTROL_FIELDS = [
  {
    key: 'svd_checkpoint',
    label: 'SVD checkpoint',
    type: 'text',
    hint: 'File in Forge models/svd (e.g. svd_xt_1_1.safetensors)',
  },
  {
    key: 'svd_resolution',
    label: 'Resolution preset',
    type: 'select',
    options: SVD_RESOLUTION_PRESETS,
  },
  { key: 'width', label: 'Width', type: 'number', min: 16, max: 8192, step: 8 },
  { key: 'height', label: 'Height', type: 'number', min: 16, max: 8192, step: 8 },
  { key: 'video_frames', label: 'Video frames', type: 'number', min: 1, max: 4096, step: 1 },
  { key: 'motion_bucket_id', label: 'Motion bucket ID', type: 'number', min: 1, max: 1023, step: 1 },
  { key: 'fps', label: 'FPS', type: 'number', min: 1, max: 1024, step: 1 },
  {
    key: 'augmentation_level',
    label: 'Augmentation level',
    type: 'number',
    min: 0,
    max: 10,
    step: 0.01,
  },
  { key: 'sampling_steps', label: 'Sampling steps', type: 'number', min: 1, max: 200, step: 1 },
  { key: 'sampling_cfg', label: 'CFG scale', type: 'number', min: 0, max: 50, step: 0.1 },
  { key: 'sampling_denoise', label: 'Sampling denoise', type: 'number', min: 0, max: 1, step: 0.01 },
  { key: 'guidance_min_cfg', label: 'Guidance min CFG', type: 'number', min: 0, max: 100, step: 0.5 },
  {
    key: 'sampling_sampler_name',
    label: 'Sampler',
    type: 'select',
    options: SVD_SAMPLER_OPTIONS,
  },
  {
    key: 'sampling_scheduler',
    label: 'Scheduler',
    type: 'select',
    options: SVD_SCHEDULER_OPTIONS,
  },
  { key: 'sampling_seed', label: 'Seed', type: 'number', min: -1, max: 2147483647, step: 1 },
];

const _RESOLUTION_MAP = {
  '1024×576 (XT 1.1 landscape)': { width: 1024, height: 576 },
  '576×1024 (XT 1.1 portrait)': { width: 576, height: 1024 },
};

export function parseSvdResolution(value) {
  const preset = _RESOLUTION_MAP[String(value || '').trim()];
  if (preset) return { ...preset };
  const match = String(value || '').match(/(\d+)\s*[×x]\s*(\d+)/i);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

export function pickSvdResolutionForSize(w, h) {
  const width = Number(w);
  const height = Number(h);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return '1024×576 (XT 1.1 landscape)';
  }
  return width >= height
    ? '1024×576 (XT 1.1 landscape)'
    : '576×1024 (XT 1.1 portrait)';
}

export function getSvdPreset(name) {
  return SVD_PRESETS[String(name || '').trim()] || null;
}

export function visibleSvdControlFields(svdEngine = {}) {
  return SVD_ENGINE_CONTROL_FIELDS.filter((field) => {
    if (typeof field.when === 'function') return field.when(svdEngine);
    return true;
  });
}

export function normalizeSvdEngine(raw = {}) {
  const out = { ...DEFAULT_SVD_ENGINE };
  for (const field of SVD_ENGINE_CONTROL_FIELDS) {
    if (raw[field.key] === undefined) continue;
    if (field.type === 'number') {
      const num = Number(raw[field.key]);
      if (Number.isFinite(num)) out[field.key] = num;
    } else {
      out[field.key] = String(raw[field.key]);
    }
  }
  if (raw.svd_preset !== undefined) out.svd_preset = String(raw.svd_preset);
  if (raw.svd_init_image === null || typeof raw.svd_init_image === 'string') {
    out.svd_init_image = raw.svd_init_image;
  }
  const parsed = parseSvdResolution(out.svd_resolution);
  if (parsed) {
    out.width = parsed.width;
    out.height = parsed.height;
  }
  out.video_frames = Math.max(1, Math.min(4096, Math.round(Number(out.video_frames) || 25)));
  out.motion_bucket_id = Math.max(1, Math.min(1023, Math.round(Number(out.motion_bucket_id) || 127)));
  out.fps = Math.max(1, Math.min(1024, Math.round(Number(out.fps) || 6)));
  return out;
}

/** Build Forge /svd_api/generate JSON body from UI state. */
export function buildSvdGeneratePayload(svdEngine, { initImageBase64 = null, preview = false } = {}) {
  const svd = normalizeSvdEngine(svdEngine || {});
  const initImage = initImageBase64 || svd.svd_init_image || null;
  const frames = preview
    ? Math.max(1, Math.min(4, Number(svd.video_frames) || 25))
    : Number(svd.video_frames) || 25;
  const seedRaw = Number(svd.sampling_seed);
  const seed = Number.isFinite(seedRaw) && seedRaw >= 0 ? seedRaw : Math.floor(Math.random() * 2147483647);
  return {
    checkpoint: String(svd.svd_checkpoint || DEFAULT_SVD_ENGINE.svd_checkpoint).trim(),
    width: Math.round(Number(svd.width) || 1024),
    height: Math.round(Number(svd.height) || 576),
    video_frames: frames,
    motion_bucket_id: Math.round(Number(svd.motion_bucket_id) || 127),
    fps: Math.round(Number(svd.fps) || 6),
    augmentation_level: Number(svd.augmentation_level) || 0,
    sampling_steps: Math.max(1, Math.round(Number(svd.sampling_steps) || 25)),
    sampling_cfg: Number(svd.sampling_cfg) || 2.5,
    sampling_denoise: Number(svd.sampling_denoise) ?? 1,
    guidance_min_cfg: Number(svd.guidance_min_cfg) || 1,
    sampling_sampler_name: String(svd.sampling_sampler_name || 'euler'),
    sampling_scheduler: String(svd.sampling_scheduler || 'karras'),
    sampling_seed: seed,
    init_image: initImage,
    preview: !!preview,
    model_family: 'svd_xt_1_1',
  };
}

export function isSvdXt11Engine(svdEngine = {}) {
  const ckpt = String(svdEngine.svd_checkpoint || '').toLowerCase();
  const preset = String(svdEngine.svd_preset || '').trim();
  if (preset === 'XT 1.1') return true;
  return /xt.?1.?1|xt_1_1|img2vid.?xt.?1/.test(ckpt);
}

export function svdEngineSummary(svdEngine = {}) {
  const svd = normalizeSvdEngine(svdEngine);
  const xt = isSvdXt11Engine(svd);
  return {
    supported: true,
    modelFamily: xt ? 'SVD XT 1.1' : 'SVD',
    checkpoint: svd.svd_checkpoint,
    resolution: `${svd.width}×${svd.height}`,
    frames: svd.video_frames,
    motionBucketId: svd.motion_bucket_id,
    fps: svd.fps,
  };
}
