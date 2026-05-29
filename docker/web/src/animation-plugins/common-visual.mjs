/**
 * Shared 8-macro visual strip — per-plugin field mapping.
 * Modulation keys: `{pluginId}.common.{paramId}` e.g. `deforum.common.strength`
 */

export const COMMON_VISUAL_PARAMS = [
  { id: 'strength', label: 'Strength', min: 0, max: 1.5, step: 0.01, default: 0.65 },
  { id: 'motion', label: 'Motion', min: 0, max: 2.5, step: 0.01, default: 0.75 },
  { id: 'noise', label: 'Noise', min: 0, max: 1, step: 0.01, default: 0.2 },
  { id: 'contrast', label: 'Contrast', min: 0, max: 2, step: 0.01, default: 1 },
  { id: 'cfg', label: 'CFG', min: 0, max: 30, step: 0.1, default: 6 },
  { id: 'zoom', label: 'Zoom', min: -5, max: 5, step: 0.05, default: 0 },
  { id: 'pan_x', label: 'Pan X', min: -10, max: 10, step: 0.05, default: 0 },
  { id: 'pan_y', label: 'Pan Y', min: -10, max: 10, step: 0.05, default: 0 },
];

/** @typedef {{ type: 'animation', field: string } | { type: 'schedule', key: string } | { type: 'scalar', key: string } | { type: 'wan', key: string } | { type: 'animatelcm', key: string } | { type: 'disabled' }} CommonVisualBinding */

/** @type {Record<string, Record<string, CommonVisualBinding>>} */
export const COMMON_VISUAL_BINDINGS = {
  webgl: {
    strength: { type: 'animation', field: 'glow' },
    motion: { type: 'animation', field: 'speed' },
    noise: { type: 'animation', field: 'spread' },
    contrast: { type: 'animation', field: 'pulse' },
    cfg: { type: 'animation', field: 'hue' },
    zoom: { type: 'animation', field: 'orbit' },
    pan_x: { type: 'disabled' },
    pan_y: { type: 'disabled' },
  },
  deforum: {
    strength: { type: 'schedule', key: 'strength_schedule' },
    motion: { type: 'schedule', key: 'translation_z' },
    noise: { type: 'schedule', key: 'noise_schedule' },
    contrast: { type: 'schedule', key: 'contrast_schedule' },
    cfg: { type: 'schedule', key: 'cfg_scale_schedule' },
    zoom: { type: 'schedule', key: 'zoom' },
    pan_x: { type: 'schedule', key: 'translation_x' },
    pan_y: { type: 'schedule', key: 'translation_y' },
  },
  wan: {
    strength: { type: 'wan', key: 'wan_fixed_strength' },
    motion: { type: 'wan', key: 'wan_motion_strength' },
    noise: { type: 'wan', key: 'wan_movement_sensitivity' },
    contrast: { type: 'wan', key: 'wan_interpolation_strength' },
    cfg: { type: 'wan', key: 'wan_guidance_scale' },
    zoom: { type: 'disabled' },
    pan_x: { type: 'disabled' },
    pan_y: { type: 'disabled' },
  },
  animatelcm: {
    strength: { type: 'animatelcm', key: 'alcm_strength' },
    motion: { type: 'animatelcm', key: 'alcm_motion_amount' },
    noise: { type: 'animatelcm', key: 'alcm_noise' },
    contrast: { type: 'animatelcm', key: 'alcm_contrast' },
    cfg: { type: 'animatelcm', key: 'alcm_cfg' },
    zoom: { type: 'animatelcm', key: 'alcm_zoom' },
    pan_x: { type: 'animatelcm', key: 'alcm_pan_x' },
    pan_y: { type: 'animatelcm', key: 'alcm_pan_y' },
  },
};

export function commonVisualModKey(pluginId, paramId) {
  return `${pluginId}.common.${paramId}`;
}

export function parseCommonVisualModKey(key) {
  const m = String(key || '').match(/^([a-z]+)\.common\.([a-z_]+)$/);
  if (!m) return null;
  return { pluginId: m[1], paramId: m[2] };
}

export function bindingFor(pluginId, paramId) {
  return COMMON_VISUAL_BINDINGS[pluginId]?.[paramId] || { type: 'disabled' };
}

export function isCommonVisualEnabled(pluginId, paramId) {
  const b = bindingFor(pluginId, paramId);
  return b.type !== 'disabled';
}

export function buildCommonVisualModulationTargets(pluginId, pluginLabel) {
  return COMMON_VISUAL_PARAMS.map((p) => {
    const binding = bindingFor(pluginId, p.id);
    if (binding.type === 'disabled') return null;
    return {
      key: commonVisualModKey(pluginId, p.id),
      label: `${pluginLabel} · ${p.label}`,
      min: p.min,
      max: p.max,
      step: p.step,
      default: p.default,
      group: `${pluginLabel} · Common`,
      pluginId,
      paramId: p.id,
    };
  }).filter(Boolean);
}
