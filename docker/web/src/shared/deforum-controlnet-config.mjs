/**
 * Deforum ControlNet (CN1–CN5) module presets and plugin-specific field metadata.
 */

export const DEFORUM_CN_SLOT_COUNT = 5;

export const CN_CONTROL_MODES = [
  'Balanced',
  'My prompt is more important',
  'ControlNet is more important',
];

export const CN_RESIZE_MODES = [
  'Just Resize',
  'Crop and Resize',
  'Resize and Fill',
  'Inner Fit (Scale to Fit)',
];

/** @typedef {{ id: string, label: string, module: string, category: string, fields: string[], modelHints: string[], defaults?: Record<string, unknown> }} CnModulePreset */

/** @type {CnModulePreset[]} */
export const CN_MODULE_PRESETS = [
  {
    id: 'none',
    label: 'None (disabled)',
    module: 'none',
    category: 'none',
    fields: [],
    modelHints: [],
  },
  {
    id: 'canny',
    label: 'Canny edge',
    module: 'canny',
    category: 'edge',
    fields: ['processor_res', 'threshold_a', 'threshold_b', 'pixel_perfect'],
    modelHints: ['canny', 'control'],
    defaults: { threshold_a: 100, threshold_b: 200, processor_res: 512 },
  },
  {
    id: 'depth',
    label: 'Depth (Midas)',
    module: 'depth_midas',
    category: 'depth',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['depth'],
    defaults: { processor_res: 512 },
  },
  {
    id: 'openpose',
    label: 'OpenPose',
    module: 'openpose',
    category: 'pose',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['openpose', 'pose'],
    defaults: { processor_res: 512 },
  },
  {
    id: 'lineart',
    label: 'Line art',
    module: 'lineart_realistic',
    category: 'line',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['lineart', 'line'],
    defaults: { processor_res: 512 },
  },
  {
    id: 'scribble',
    label: 'Scribble / soft edge',
    module: 'softedge_hed',
    category: 'line',
    fields: ['processor_res', 'threshold_a', 'threshold_b', 'pixel_perfect'],
    modelHints: ['scribble', 'hed', 'softedge'],
    defaults: { processor_res: 512, threshold_a: 64, threshold_b: 128 },
  },
  {
    id: 'mlsd',
    label: 'M-LSD lines',
    module: 'mlsd',
    category: 'line',
    fields: ['processor_res', 'threshold_a', 'threshold_b', 'pixel_perfect'],
    modelHints: ['mlsd'],
    defaults: { processor_res: 512, threshold_a: 64, threshold_b: 64 },
  },
  {
    id: 'normal',
    label: 'Normal map',
    module: 'normal_map',
    category: 'depth',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['normal'],
    defaults: { processor_res: 512 },
  },
  {
    id: 'tile',
    label: 'Tile / blur',
    module: 'tile_colorfix',
    category: 'style',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['tile', 'blur'],
    defaults: { processor_res: 512 },
  },
  {
    id: 'temporal',
    label: 'Temporal / video',
    module: 'None',
    category: 'temporal',
    fields: ['vid_path', 'mask_vid_path', 'overwrite_frames', 'loopback_mode', 'processor_res'],
    modelHints: ['temporal', 'svd', 'video'],
    defaults: { overwrite_frames: true, loopback_mode: false, processor_res: 512 },
  },
  {
    id: 'ip2p',
    label: 'Instruct pix2pix',
    module: 'ip2p',
    category: 'other',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['ip2p', 'instruct'],
    defaults: { processor_res: 512 },
  },
  {
    id: 'reference',
    label: 'Reference only',
    module: 'reference_only',
    category: 'other',
    fields: ['processor_res', 'pixel_perfect'],
    modelHints: ['reference'],
    defaults: { processor_res: 512 },
  },
];

export const CN_PLUGIN_FIELD_META = {
  processor_res: { label: 'Processor resolution', type: 'slider', min: 64, max: 2048, step: 64 },
  threshold_a: { label: 'Threshold A', type: 'slider', min: 0, max: 255, step: 1 },
  threshold_b: { label: 'Threshold B', type: 'slider', min: 0, max: 255, step: 1 },
  pixel_perfect: { label: 'Pixel perfect', type: 'bool' },
  low_vram: { label: 'Low VRAM', type: 'bool' },
  overwrite_frames: { label: 'Overwrite frames', type: 'bool' },
  loopback_mode: { label: 'Loopback mode', type: 'bool' },
  vid_path: { label: 'Input video path', type: 'text', hint: 'Path on Forge host or uploaded clip' },
  mask_vid_path: { label: 'Mask video path', type: 'text' },
  control_mode: { label: 'Control mode', type: 'select', options: CN_CONTROL_MODES },
  resize_mode: { label: 'Resize mode', type: 'select', options: CN_RESIZE_MODES },
};

export function cnPrefix(unit) {
  return `cn_${unit}_`;
}

export function cnUnitFromSlotId(slotId) {
  const m = String(slotId || '').match(/^CN(\d+)$/i);
  if (!m) return null;
  const unit = parseInt(m[1], 10);
  return unit >= 1 && unit <= DEFORUM_CN_SLOT_COUNT ? unit : null;
}

export function scheduleFromScalar(value, fallback = 0) {
  const n = Number(value);
  const v = Number.isFinite(n) ? n : fallback;
  return `0:(${v})`;
}

export function scalarFromSchedule(raw, fallback = null) {
  const text = String(raw ?? '').trim();
  const m = text.match(/\(([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\)/i);
  if (!m) return fallback;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : fallback;
}

export function modulePresetById(id) {
  return CN_MODULE_PRESETS.find((p) => p.id === id) || null;
}

export function modulePresetForModule(moduleName) {
  const mod = String(moduleName || '').trim().toLowerCase();
  if (!mod || mod === 'none') return modulePresetById('none');
  return CN_MODULE_PRESETS.find((p) => p.module.toLowerCase() === mod)
    || CN_MODULE_PRESETS.find((p) => mod.includes(p.module.toLowerCase()) && p.id !== 'none')
    || null;
}

export function inferModulePresetId(settings, unit) {
  const p = cnPrefix(unit);
  const module = String(settings?.[`${p}module`] || '').trim();
  const model = String(settings?.[`${p}model`] || '').toLowerCase();
  const preset = modulePresetForModule(module);
  if (preset && preset.id !== 'none') return preset.id;
  if (/temporal|video|animated/.test(model)) return 'temporal';
  if (/canny|edge/.test(model)) return 'canny';
  if (/depth/.test(model)) return 'depth';
  if (/openpose|pose/.test(model)) return 'openpose';
  if (/lineart|line/.test(model)) return 'lineart';
  if (/tile|blur/.test(model)) return 'tile';
  return module && module !== 'none' ? 'reference' : 'none';
}

export function pluginFieldsForPreset(preset) {
  if (!preset || preset.id === 'none') return [];
  const base = ['control_mode', 'resize_mode', 'low_vram'];
  return [...new Set([...(preset.fields || []), ...base])];
}

export function filterModelsForModule(models, moduleName) {
  const list = Array.isArray(models) ? models : [];
  const preset = modulePresetForModule(moduleName);
  if (!preset || preset.id === 'none' || !preset.modelHints.length) return list;
  const hints = preset.modelHints.map((h) => h.toLowerCase());
  const filtered = list.filter((m) => {
    const name = String(m?.name || m || '').toLowerCase();
    return hints.some((h) => name.includes(h));
  });
  return filtered.length ? filtered : list;
}

export function applyModulePresetToSettings(settings, unit, presetId) {
  const preset = modulePresetById(presetId) || modulePresetById('none');
  const p = cnPrefix(unit);
  const next = { ...(settings || {}) };
  next[`${p}module`] = preset.module;
  next[`${p}enabled`] = preset.id !== 'none';
  if (preset.defaults) {
    Object.entries(preset.defaults).forEach(([key, value]) => {
      next[`${p}${key}`] = value;
    });
  }
  return next;
}

export function syncCnSlotFromDeforumUnit(settings, unit, slot) {
  const p = cnPrefix(unit);
  const base = slot && typeof slot === 'object' ? { ...slot } : {};
  base.enabled = !!settings?.[`${p}enabled`];
  base.weight = scalarFromSchedule(settings?.[`${p}weight`], base.weight ?? 1) ?? 1;
  base.start = scalarFromSchedule(settings?.[`${p}guidance_start`], base.start ?? 0) ?? 0;
  base.end = scalarFromSchedule(settings?.[`${p}guidance_end`], base.end ?? 1) ?? 1;
  const model = settings?.[`${p}model`];
  if (model && String(model).toLowerCase() !== 'none') base.model = model;
  base.modulePreset = inferModulePresetId(settings, unit);
  return base;
}

export function syncDeforumUnitFromCnSlot(settings, unit, slot) {
  const p = cnPrefix(unit);
  const next = { ...(settings || {}) };
  if (!slot) return next;
  next[`${p}enabled`] = !!slot.enabled;
  next[`${p}weight`] = scheduleFromScalar(slot.weight, 1);
  next[`${p}guidance_start`] = scheduleFromScalar(slot.start, 0);
  next[`${p}guidance_end`] = scheduleFromScalar(slot.end, 1);
  if (slot.model) next[`${p}model`] = slot.model;
  if (slot.modulePreset) {
    const preset = modulePresetById(slot.modulePreset);
    if (preset) next[`${p}module`] = preset.module;
  }
  return next;
}
