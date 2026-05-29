/**
 * Deforum settings UI schema + defaults for the hidden LIVE panel.
 * Full JSON is persisted; only grouped fields are shown in the minimal editor.
 */

export const DEFORUM_DEFAULT_SETTINGS = {
  W: 768,
  H: 432,
  show_info_on_ui: false,
  tiling: false,
  restore_faces: false,
  seed_resize_from_w: 0,
  seed_resize_from_h: 0,
  seed: 1693,
  sampler: 'Euler',
  scheduler: 'sgm_uniform',
  steps: 2,
  batch_name: 'floral_neu',
  seed_behavior: 'random',
  seed_iter_N: 1,
  use_init: false,
  strength: 1.0,
  strength_0_no_init: true,
  init_image: null,
  use_mask: false,
  animation_mode: '2D',
  max_frames: 120,
  border: 'replicate',
  angle: '0: (0)',
  zoom: '0: (1.0)',
  translation_x: '0: (0)',
  translation_y: '0: (0.0)',
  translation_z: '0: (0.0)',
  transform_center_x: '0: (0.5)',
  transform_center_y: '0: (0.5)',
  rotation_3d_x: '0: (0)',
  rotation_3d_y: '0: (0)',
  rotation_3d_z: '0: (0)',
  noise_schedule: '0: (0.065)',
  strength_schedule: '0: (0.60)',
  keyframe_strength_schedule: '0: (0.50)',
  contrast_schedule: '0: (1.0)',
  cfg_scale_schedule: '0:(1)',
  distilled_cfg_scale_schedule: '0: (1)',
  enable_steps_scheduling: false,
  steps_schedule: '0: (2)',
  prompts: {
    '0':
      '<lora:floralv2:1.2>silhouette black big wild flowers and wild plants and berries, red background, many different flowers, layered silhouettes, folk art style floral graphics, flat folk art style illustration, layered composition, detailed composition, natural colors, medium high contrast',
  },
  positive_prompts: '',
  negative_prompts:
    'star, star shape, watermark, signature, dreamstime, logo, writing, text, poster element, year, number, date, label, vignette, glow, symbol, alphabet, number, freepik, blurry, low quality, ugly',
  fps: 24,
  sd_model_name: 'SDXL/sd_xl_turbo_1.0_fp16.safetensors',
  skip_video_creation: true,
  cn_1_enabled: false,
  cn_1_weight: '0:(2)',
  cn_1_guidance_start: '0:(0.0)',
  cn_1_guidance_end: '0:(1.0)',
  cn_1_module: 'None',
  cn_1_model: 'temporalnetversion2 [b554c208]',
  cn_1_overwrite_frames: true,
  cn_1_vid_path: '',
  cn_1_mask_vid_path: '',
  cn_1_low_vram: false,
  cn_1_pixel_perfect: false,
  cn_1_processor_res: 64,
  cn_1_threshold_a: 64,
  cn_1_threshold_b: 64,
  cn_1_resize_mode: 'Inner Fit (Scale to Fit)',
  cn_1_control_mode: 'Balanced',
  cn_1_loopback_mode: false,
  cn_2_overwrite_frames: true,
  cn_2_vid_path: '',
  cn_2_mask_vid_path: '',
  cn_2_enabled: false,
  cn_2_low_vram: false,
  cn_2_pixel_perfect: false,
  cn_2_module: 'none',
  cn_2_model: 'None',
  cn_2_weight: '0:(1)',
  cn_2_guidance_start: '0:(0.0)',
  cn_2_guidance_end: '0:(1.0)',
  cn_2_processor_res: 64,
  cn_2_threshold_a: 64,
  cn_2_threshold_b: 64,
  cn_2_resize_mode: 'Inner Fit (Scale to Fit)',
  cn_2_control_mode: 'Balanced',
  cn_2_loopback_mode: false,
  cn_3_overwrite_frames: true,
  cn_3_vid_path: '',
  cn_3_mask_vid_path: '',
  cn_3_enabled: false,
  cn_3_low_vram: false,
  cn_3_pixel_perfect: false,
  cn_3_module: 'none',
  cn_3_model: 'None',
  cn_3_weight: '0:(1)',
  cn_3_guidance_start: '0:(0.0)',
  cn_3_guidance_end: '0:(1.0)',
  cn_3_processor_res: 64,
  cn_3_threshold_a: 64,
  cn_3_threshold_b: 64,
  cn_3_resize_mode: 'Inner Fit (Scale to Fit)',
  cn_3_control_mode: 'Balanced',
  cn_3_loopback_mode: false,
  cn_4_overwrite_frames: true,
  cn_4_vid_path: '',
  cn_4_mask_vid_path: '',
  cn_4_enabled: false,
  cn_4_low_vram: false,
  cn_4_pixel_perfect: false,
  cn_4_module: 'none',
  cn_4_model: 'None',
  cn_4_weight: '0:(1)',
  cn_4_guidance_start: '0:(0.0)',
  cn_4_guidance_end: '0:(1.0)',
  cn_4_processor_res: 64,
  cn_4_threshold_a: 64,
  cn_4_threshold_b: 64,
  cn_4_resize_mode: 'Inner Fit (Scale to Fit)',
  cn_4_control_mode: 'Balanced',
  cn_4_loopback_mode: false,
  cn_5_overwrite_frames: true,
  cn_5_vid_path: '',
  cn_5_mask_vid_path: '',
  cn_5_enabled: false,
  cn_5_low_vram: false,
  cn_5_pixel_perfect: false,
  cn_5_module: 'none',
  cn_5_model: 'None',
  cn_5_weight: '0:(1)',
  cn_5_guidance_start: '0:(0.0)',
  cn_5_guidance_end: '0:(1.0)',
  cn_5_processor_res: 64,
  cn_5_threshold_a: 64,
  cn_5_threshold_b: 64,
  cn_5_resize_mode: 'Inner Fit (Scale to Fit)',
  cn_5_control_mode: 'Balanced',
  cn_5_loopback_mode: false,
};

/** @type {{ id: string, label: string, fields: Array<{ key: string, label: string, type?: string, min?: number, max?: number, step?: number, rows?: number, options?: string[] }> }>[]} */
export const DEFORUM_FIELD_GROUPS = [
  {
    id: 'canvas',
    label: 'Canvas',
    fields: [
      { key: 'W', label: 'Width', type: 'number', min: 256, max: 4096, step: 64 },
      { key: 'H', label: 'Height', type: 'number', min: 256, max: 4096, step: 64 },
      { key: 'fps', label: 'FPS', type: 'select', options: ['8', '12', '24', '30'] },
      { key: 'max_frames', label: 'Max frames', type: 'number', min: 1, max: 99999, step: 1 },
      { key: 'batch_name', label: 'Batch name', type: 'text' },
    ],
  },
  {
    id: 'sampling',
    label: 'Sampling',
    fields: [
      { key: 'seed', label: 'Seed', type: 'number', min: -1, max: 2147483647, step: 1 },
      { key: 'sampler', label: 'Sampler', type: 'select' },
      { key: 'scheduler', label: 'Scheduler', type: 'select' },
      { key: 'steps', label: 'Steps', type: 'slider', min: 2, max: 150, step: 1 },
      { key: 'sd_model_name', label: 'Checkpoint', type: 'text' },
    ],
  },
  {
    id: 'prompts',
    label: 'Prompts',
    fields: [
      { key: 'prompts.0', label: 'Prompt @ 0', type: 'textarea', rows: 4 },
      { key: 'negative_prompts', label: 'Negative', type: 'textarea', rows: 3 },
      { key: 'positive_prompts', label: 'Positive (extra)', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'init',
    label: 'Init',
    fields: [
      { key: 'use_init', label: 'Use init image', type: 'bool' },
      { key: 'strength', label: 'Strength', type: 'number', min: 0, max: 1.5, step: 0.01 },
      { key: 'init_image', label: 'Init image URL/path', type: 'text' },
    ],
  },
  {
    id: 'motion',
    label: 'Motion 2D',
    fields: [
      { key: 'zoom', label: 'Zoom schedule', type: 'text' },
      { key: 'translation_x', label: 'Pan X schedule', type: 'text' },
      { key: 'translation_y', label: 'Pan Y schedule', type: 'text' },
      { key: 'angle', label: 'Angle schedule', type: 'text' },
    ],
  },
  {
    id: 'motion3d',
    label: 'Motion 3D',
    fields: [
      { key: 'translation_z', label: 'Zoom Z schedule', type: 'text' },
      { key: 'rotation_3d_x', label: 'Rotate X schedule', type: 'text' },
      { key: 'rotation_3d_y', label: 'Rotate Y schedule', type: 'text' },
      { key: 'rotation_3d_z', label: 'Rotate Z schedule', type: 'text' },
    ],
  },
  {
    id: 'schedules',
    label: 'Schedules',
    fields: [
      { key: 'noise_schedule', label: 'Noise', type: 'text' },
      { key: 'strength_schedule', label: 'Strength', type: 'text' },
      { key: 'cfg_scale_schedule', label: 'CFG', type: 'text' },
      { key: 'steps_schedule', label: 'Steps', type: 'text' },
    ],
  },
  {
    id: 'controlnet',
    label: 'ControlNet 1',
    fields: [
      { key: 'cn_1_enabled', label: 'Enabled', type: 'bool' },
      { key: 'cn_1_weight', label: 'Weight schedule', type: 'text' },
      { key: 'cn_1_guidance_start', label: 'Guidance start', type: 'text' },
      { key: 'cn_1_guidance_end', label: 'Guidance end', type: 'text' },
      { key: 'cn_1_module', label: 'Module', type: 'text' },
      { key: 'cn_1_model', label: 'Model', type: 'text' },
      { key: 'cn_1_processor_res', label: 'Processor res', type: 'slider', min: 64, max: 2048, step: 1 },
      { key: 'cn_1_threshold_a', label: 'Threshold A', type: 'slider', min: 0, max: 255, step: 1 },
      { key: 'cn_1_threshold_b', label: 'Threshold B', type: 'slider', min: 0, max: 255, step: 1 },
    ],
  },
];

export const DEFORUM_FIELD_KEYS = DEFORUM_FIELD_GROUPS.flatMap((group) =>
  group.fields.map((field) => field.key)
);

/** Engine fields that should stay editable without schedule on/off toggles. */
/** Schedules ignored in 2D animation_mode (see deforum-settings-verify). */
export const DEFORUM_3D_ONLY_FIELD_KEYS = new Set([
  'translation_z',
  'rotation_3d_x',
  'rotation_3d_y',
  'rotation_3d_z',
]);

export const DEFORUM_MOTION_3D_GROUP_ID = 'motion3d';

export function normalizeDeforumMode2d3d(animationMode) {
  const mode = String(animationMode || '2D').trim().toUpperCase();
  return mode === '3D' ? '3D' : '2D';
}

export function isDeforum3dOnlyFieldKey(keyPath) {
  return DEFORUM_3D_ONLY_FIELD_KEYS.has(keyPath);
}

export const DEFORUM_NON_TOGGLEABLE_KEYS = new Set([
  'sampler',
  'scheduler',
  'sd_model_name',
  'seed',
  'steps',
  'W',
  'H',
  'fps',
  'max_frames',
  'batch_name',
]);

export const FALLBACK_FORGE_SAMPLERS = [
  'Euler',
  'Euler a',
  'DPM++ 2M',
  'DPM++ SDE',
  'DDIM',
  'Heun',
];

export const FALLBACK_FORGE_SCHEDULERS = [
  'automatic',
  'uniform',
  'sgm_uniform',
  'karras',
  'normal',
  'exponential',
];

export function createDeforumFieldEnabledMap(overrides = {}) {
  const map = {};
  DEFORUM_FIELD_KEYS.forEach((key) => {
    map[key] = overrides[key] !== false;
  });
  return map;
}

export function getNestedValue(obj, keyPath) {
  if (!keyPath || !obj) return undefined;
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function setNestedValue(obj, keyPath, value) {
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

export function removeNestedValue(obj, keyPath) {
  if (!keyPath || !obj) return;
  const parts = String(keyPath).split('.');
  const stack = [];
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (cur == null || typeof cur !== 'object' || !(part in cur)) return;
    stack.push({ parent: cur, key: part });
    cur = cur[part];
  }
  if (cur == null || typeof cur !== 'object') return;
  delete cur[parts[parts.length - 1]];
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const { parent, key } = stack[i];
    const value = parent[key];
    if (!value || typeof value !== 'object' || Array.isArray(value)) break;
    if (Object.keys(value).length) break;
    delete parent[key];
  }
}

export function parseScheduleKeyframes(raw) {
  if (raw == null || raw === '') return [{ frame: 0, value: 0 }];
  const text = String(raw).trim();
  const keyframes = [];
  const regex = /(\d+)\s*:\s*\(?\s*([-\d.eE+]+)\s*\)?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    keyframes.push({ frame: Number(match[1]), value: Number(match[2]) });
  }
  if (!keyframes.length) {
    const plain = Number(text.replace(/[()]/g, '').trim());
    if (Number.isFinite(plain)) return [{ frame: 0, value: plain }];
    return [{ frame: 0, value: 0 }];
  }
  keyframes.sort((a, b) => a.frame - b.frame);
  return keyframes;
}

function formatScheduleNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 1000) / 1000;
  return String(rounded);
}

export function formatScheduleKeyframes(keyframes) {
  return (keyframes || [])
    .map((kf) => `${Math.max(0, Math.round(Number(kf.frame) || 0))}: (${formatScheduleNumber(kf.value)})`)
    .join(', ');
}

export function readScheduleValueAtFrame(raw, frame) {
  const kfs = parseScheduleKeyframes(raw);
  const f = Math.max(0, Math.round(Number(frame) || 0));
  let value = kfs[0]?.value ?? 0;
  for (const kf of kfs) {
    if (kf.frame <= f) value = kf.value;
    else break;
  }
  return value;
}

/**
 * Linear ramp over `frameCount` frames starting at `startFrame`.
 * Example: start 0, end 1, count 10 → frames 0..9 with 0, 0.111…, …, 1.
 */
export function buildLinearScheduleRamp(startFrame, frameCount, startValue, endValue, existingRaw = '') {
  const start = Math.max(0, Math.round(Number(startFrame) || 0));
  const count = Math.max(1, Math.round(Number(frameCount) || 1));
  const from = Number(startValue);
  const to = Number(endValue);
  const begin = Number.isFinite(from) ? from : 0;
  const finish = Number.isFinite(to) ? to : begin;
  const end = start + count - 1;

  const ramp = [];
  if (count === 1) {
    ramp.push({ frame: start, value: finish });
  } else {
    for (let i = 0; i < count; i += 1) {
      const t = i / (count - 1);
      ramp.push({ frame: start + i, value: begin + (finish - begin) * t });
    }
  }

  const kept = parseScheduleKeyframes(existingRaw).filter(
    (kf) => kf.frame < start || kf.frame > end
  );
  const merged = [...kept, ...ramp].sort((a, b) => a.frame - b.frame);
  return formatScheduleKeyframes(merged);
}

export function patchFromKeyPath(keyPath, value) {
  const parts = String(keyPath).split('.');
  if (parts.length === 1) return { [parts[0]]: value };
  const root = parts[0];
  const inner = {};
  let cur = inner;
  for (let i = 1; i < parts.length - 1; i++) {
    cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return { [root]: inner };
}

export function mergeDeforumSettings(base, patch) {
  const out = { ...base, ...patch };
  if (patch.prompts && typeof patch.prompts === 'object') {
    out.prompts = { ...(base.prompts || {}), ...patch.prompts };
  }
  for (let i = 1; i <= 5; i += 1) {
    for (const suffix of ['weight', 'guidance_start', 'guidance_end']) {
      const key = `cn_${i}_${suffix}`;
      if (out[key] == null || out[key] === '') out[key] = base[key];
    }
  }
  return out;
}
