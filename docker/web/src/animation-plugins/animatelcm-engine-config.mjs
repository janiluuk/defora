/** AnimateLCM video engine (Forge Deforum animation_mode). */

export const ANIMATELCM_ANIMATION_MODE = 'AnimateLCM';

export const ANIMATELCM_MOTION_TYPES = [
  { id: 'static', label: 'Static' },
  { id: 'pan', label: 'Pan' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'handheld', label: 'Handheld' },
  { id: 'custom', label: 'Custom' },
];

export const DEFAULT_ANIMATELCM_ENGINE = {
  motion_type: 'pan',
  motion_preset: 'Static',
  alcm_motion_amount: 1.0,
  alcm_strength: 0.75,
  alcm_cfg: 7.0,
  alcm_steps: 4,
  alcm_noise: 0.05,
  alcm_contrast: 1.0,
  alcm_zoom: 1.0,
  alcm_pan_x: 0,
  alcm_pan_y: 0,
  alcm_seed: -1,
};

export const ANIMATELCM_CONTROL_FIELDS = [
  { key: 'motion_type', label: 'Motion type', type: 'select', options: ANIMATELCM_MOTION_TYPES.map((t) => t.id) },
  { key: 'motion_preset', label: 'Motion preset', type: 'text' },
  { key: 'alcm_motion_amount', label: 'Motion amount', type: 'number', min: 0, max: 2, step: 0.05 },
  { key: 'alcm_strength', label: 'Strength', type: 'number', min: 0, max: 1.5, step: 0.01 },
  { key: 'alcm_cfg', label: 'CFG', type: 'number', min: 0, max: 30, step: 0.1 },
  { key: 'alcm_steps', label: 'AnimateLCM steps', type: 'number', min: 1, max: 20, step: 1 },
  { key: 'alcm_noise', label: 'Noise', type: 'number', min: 0, max: 0.5, step: 0.005 },
  { key: 'alcm_contrast', label: 'Contrast', type: 'number', min: 0, max: 2, step: 0.01 },
  { key: 'alcm_zoom', label: 'Zoom', type: 'number', min: 0.5, max: 2, step: 0.01 },
  { key: 'alcm_pan_x', label: 'Pan X', type: 'number', min: -10, max: 10, step: 0.05 },
  { key: 'alcm_pan_y', label: 'Pan Y', type: 'number', min: -10, max: 10, step: 0.05 },
  { key: 'alcm_seed', label: 'Seed', type: 'number', min: -1, max: 2147483647, step: 1 },
];

export function normalizeAnimateLcmEngine(raw = {}) {
  const out = { ...DEFAULT_ANIMATELCM_ENGINE };
  for (const field of ANIMATELCM_CONTROL_FIELDS) {
    if (raw[field.key] === undefined) continue;
    if (field.type === 'number') {
      const num = Number(raw[field.key]);
      if (Number.isFinite(num)) out[field.key] = num;
    } else {
      out[field.key] = String(raw[field.key]);
    }
  }
  return out;
}

export function mergeAnimateLcmIntoDeforumSettings(settings, animateLcmEngine, { positivePrompt = '' } = {}) {
  const alcm = { ...DEFAULT_ANIMATELCM_ENGINE, ...(animateLcmEngine || {}) };
  const promptSchedule =
    settings?.prompts && typeof settings.prompts === 'object' && !Array.isArray(settings.prompts)
      ? { ...settings.prompts }
      : {};
  const primary = String(positivePrompt || '').trim();
  if (primary) promptSchedule['0'] = primary;
  const merged = {
    ...settings,
    animation_mode: ANIMATELCM_ANIMATION_MODE,
    skip_video_creation: false,
  };
  if (Object.keys(promptSchedule).length) {
    merged.prompts = promptSchedule;
  }
  for (const key of Object.keys(DEFAULT_ANIMATELCM_ENGINE)) {
    if (alcm[key] !== undefined) merged[key] = alcm[key];
  }
  if (alcm.alcm_seed != null && Number.isFinite(Number(alcm.alcm_seed))) {
    merged.seed = Number(alcm.alcm_seed);
  }
  if (Number.isFinite(Number(alcm.alcm_steps))) {
    merged.steps = Math.max(1, Math.round(Number(alcm.alcm_steps)));
    merged.steps_schedule = `0: (${merged.steps})`;
  }
  return merged;
}
