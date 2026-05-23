/**
 * Deforum settings UI schema + defaults for the hidden LIVE panel.
 * Full JSON is persisted; only grouped fields are shown in the minimal editor.
 */

const DEFORUM_DEFAULT_SETTINGS = {
  W: 1920,
  H: 540,
  show_info_on_ui: false,
  tiling: false,
  restore_faces: false,
  seed_resize_from_w: 0,
  seed_resize_from_h: 0,
  seed: 1693,
  sampler: 'HeunPP2',
  scheduler: 'Normal',
  steps: 10,
  batch_name: 'floral_neu',
  seed_behavior: 'random',
  seed_iter_N: 1,
  use_init: false,
  strength: 1.0,
  strength_0_no_init: true,
  init_image: null,
  use_mask: false,
  animation_mode: '2D',
  max_frames: 9999,
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
  noise_schedule: '0: (0.01)',
  strength_schedule: '0: (0.7)',
  keyframe_strength_schedule: '0: (0.50)',
  contrast_schedule: '0: (1.0)',
  cfg_scale_schedule: '0:(9)',
  distilled_cfg_scale_schedule: '0: (1.5)',
  enable_steps_scheduling: false,
  steps_schedule: '0: (6)',
  prompts: {
    '0':
      ' <lora:floral_dreamshaper:1.5>silhouette black  big wild flowers and  wild plants and berries , red background, many different flowers, layered silhouettes, folk art style floral graphics, flat folk art style illustration, layered composition, detailed composition,   natural colors, medium high contrast    --neg star, star shape, watermark, signature , dreamstime, logo, writing, text, poster element, year, number, date, label,   vignette, glow, , symbol, alphabet, number, freepik',
  },
  positive_prompts: '',
  negative_prompts:
    'star, star shape, watermark, signature , dreamstime, logo, writing, text, poster element, year, number, date, label,   vignette, glow, , symbol, alphabet, number, freepik',
  fps: 25,
  sd_model_name: 'nightvisionxl_v0811.safetensors',
  skip_video_creation: true,
  cn_1_enabled: false,
  cn_1_weight: '0:(2)',
  cn_1_module: 'None',
  cn_1_model: 'temporalnetversion2 [b554c208]',
};

/** @type {{ id: string, label: string, fields: Array<{ key: string, label: string, type?: string, min?: number, max?: number, step?: number, rows?: number, options?: string[] }> }>[]} */
const DEFORUM_FIELD_GROUPS = [
  {
    id: 'canvas',
    label: 'Canvas',
    fields: [
      { key: 'W', label: 'Width', type: 'number', min: 256, max: 4096, step: 64 },
      { key: 'H', label: 'Height', type: 'number', min: 256, max: 4096, step: 64 },
      { key: 'fps', label: 'FPS', type: 'number', min: 1, max: 60, step: 1 },
      { key: 'max_frames', label: 'Max frames', type: 'number', min: 1, max: 99999, step: 1 },
      { key: 'batch_name', label: 'Batch name', type: 'text' },
    ],
  },
  {
    id: 'sampling',
    label: 'Sampling',
    fields: [
      { key: 'seed', label: 'Seed', type: 'number', min: -1, max: 2147483647, step: 1 },
      { key: 'sampler', label: 'Sampler', type: 'text' },
      { key: 'scheduler', label: 'Scheduler', type: 'text' },
      { key: 'steps', label: 'Steps', type: 'number', min: 1, max: 150, step: 1 },
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
      { key: 'animation_mode', label: 'Mode', type: 'text' },
      { key: 'zoom', label: 'Zoom schedule', type: 'text' },
      { key: 'translation_x', label: 'Pan X schedule', type: 'text' },
      { key: 'translation_y', label: 'Pan Y schedule', type: 'text' },
      { key: 'angle', label: 'Angle schedule', type: 'text' },
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
      { key: 'cn_1_module', label: 'Module', type: 'text' },
      { key: 'cn_1_model', label: 'Model', type: 'text' },
    ],
  },
];

function getNestedValue(obj, keyPath) {
  if (!keyPath || !obj) return undefined;
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setNestedValue(obj, keyPath, value) {
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function patchFromKeyPath(keyPath, value) {
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

function mergeDeforumSettings(base, patch) {
  const out = { ...base, ...patch };
  if (patch.prompts && typeof patch.prompts === 'object') {
    out.prompts = { ...(base.prompts || {}), ...patch.prompts };
  }
  return out;
}

module.exports = {
  DEFORUM_DEFAULT_SETTINGS,
  DEFORUM_FIELD_GROUPS,
  getNestedValue,
  setNestedValue,
  patchFromKeyPath,
  mergeDeforumSettings,
};
