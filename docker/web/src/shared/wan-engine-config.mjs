/** Wan 2.1 video engine (sd-forge-deforum `animation_mode: "Wan Video"`). */

import { MOTION_LORAS } from '../animation-plugins/motion-loras.mjs';

export const WAN_ANIMATION_MODE = "Wan Video";

/** Reuse Deforum motion LoRA ids — injected into Wan animation_prompts schedule. */
export const WAN_MOTION_LORAS = MOTION_LORAS;

export const WAN_SPEED_PRESET_NAMES = ['Turbo', 'Fast', 'Balanced', 'Quality'];

/** LCM-like fast paths: fewer steps + flash attention (Forge Wan docs: 5–15 for tests). */
export const WAN_SPEED_PRESETS = {
  Turbo: {
    wan_speed_preset: 'Turbo',
    wan_inference_steps: 8,
    wan_flash_attention_mode: 'Force Flash Attention',
    wan_enable_interpolation: false,
    wan_guidance_scale: 6,
    wan_frame_overlap: 1,
  },
  Fast: {
    wan_speed_preset: 'Fast',
    wan_inference_steps: 12,
    wan_flash_attention_mode: 'Force Flash Attention',
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.35,
    wan_guidance_scale: 7,
    wan_frame_overlap: 2,
  },
  Balanced: {
    wan_speed_preset: 'Balanced',
    wan_inference_steps: 20,
    wan_flash_attention_mode: 'Auto (Recommended)',
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.5,
    wan_guidance_scale: 7.5,
    wan_frame_overlap: 2,
  },
  Quality: {
    wan_speed_preset: 'Quality',
    wan_inference_steps: 35,
    wan_flash_attention_mode: 'Auto (Recommended)',
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.65,
    wan_guidance_scale: 8,
    wan_frame_overlap: 3,
  },
};

export const WAN_MOTION_PRESET_NAMES = ['Static', 'Dolly', 'Pan', 'Handheld', 'Cinematic'];

export const WAN_MOTION_PRESETS = {
  Static: {
    wan_motion_preset: 'Static',
    wan_motion_strength: 0.45,
    wan_motion_strength_override: true,
    wan_movement_sensitivity: 0.6,
    wan_frame_overlap: 1,
    wan_enable_interpolation: false,
  },
  Dolly: {
    wan_motion_preset: 'Dolly',
    wan_motion_strength: 1.0,
    wan_motion_strength_override: true,
    wan_movement_sensitivity: 1.0,
    wan_frame_overlap: 2,
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.45,
  },
  Pan: {
    wan_motion_preset: 'Pan',
    wan_motion_strength: 0.9,
    wan_motion_strength_override: true,
    wan_movement_sensitivity: 1.15,
    wan_frame_overlap: 2,
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.5,
  },
  Handheld: {
    wan_motion_preset: 'Handheld',
    wan_motion_strength: 0.75,
    wan_motion_strength_override: true,
    wan_movement_sensitivity: 1.35,
    wan_frame_overlap: 3,
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.55,
  },
  Cinematic: {
    wan_motion_preset: 'Cinematic',
    wan_motion_strength: 1.1,
    wan_motion_strength_override: true,
    wan_movement_sensitivity: 0.85,
    wan_frame_overlap: 4,
    wan_enable_interpolation: true,
    wan_interpolation_strength: 0.7,
  },
};

/** HuggingFace packages Forge Wan auto-download can fetch (see sd-forge-deforum docs/wan). */
export const WAN_DOWNLOAD_PACKAGES = [
  {
    id: 'vace-1.3b',
    label: 'VACE 1.3B (~17GB)',
    hfRepo: 'Wan-AI/Wan2.1-VACE-1.3B',
    t2vModel: '1.3B VACE',
    preferredSize: '1.3B VACE (Recommended)',
    hfCommand: 'huggingface-cli download Wan-AI/Wan2.1-VACE-1.3B --local-dir models/wan',
  },
  {
    id: 'vace-14b',
    label: 'VACE 14B (~75GB)',
    hfRepo: 'Wan-AI/Wan2.1-VACE-14B',
    t2vModel: '14B VACE',
    preferredSize: '14B VACE',
    hfCommand: 'huggingface-cli download Wan-AI/Wan2.1-VACE-14B --local-dir models/wan',
  },
  {
    id: 't2v-1.3b',
    label: 'T2V 1.3B (~17GB)',
    hfRepo: 'Wan-AI/Wan2.1-T2V-1.3B',
    t2vModel: '1.3B T2V',
    preferredSize: 'Legacy Models',
    hfCommand: 'huggingface-cli download Wan-AI/Wan2.1-T2V-1.3B --local-dir models/wan',
  },
  {
    id: 'i2v-1.3b',
    label: 'I2V 1.3B (~17GB)',
    hfRepo: 'Wan-AI/Wan2.1-I2V-1.3B',
    i2vModel: '1.3B I2V',
    preferredSize: 'Legacy Models',
    hfCommand: 'huggingface-cli download Wan-AI/Wan2.1-I2V-1.3B --local-dir models/wan',
  },
  {
    id: 'i2v-14b',
    label: 'I2V 14B (~75GB)',
    hfRepo: 'Wan-AI/Wan2.1-I2V-14B',
    i2vModel: '14B I2V',
    preferredSize: 'Legacy Models',
    hfCommand: 'huggingface-cli download Wan-AI/Wan2.1-I2V-14B --local-dir models/wan',
  },
  {
    id: 'qwen-3b',
    label: 'Qwen 2.5-VL-3B (prompt enhancer)',
    kind: 'qwen',
    qwenModel: 'Qwen2.5-VL-3B',
    hfRepo: 'Qwen/Qwen2.5-VL-3B-Instruct',
    hfCommand: 'huggingface-cli download Qwen/Qwen2.5-VL-3B-Instruct --local-dir models/qwen',
  },
];

const _WAN_MOTION_LORA_IDS = new Set(WAN_MOTION_LORAS.map((l) => l.id));
const _WAN_UI_ONLY_KEYS = new Set([
  'wan_speed_preset',
  'wan_motion_preset',
  'motion_loras',
  'motion_lora_weight',
  'wan_use_init_image',
  'wan_init_image',
  'wan_i2v_init_strength',
]);

export function getWanDownloadPackage(id) {
  return WAN_DOWNLOAD_PACKAGES.find((p) => p.id === id) || WAN_DOWNLOAD_PACKAGES[0];
}

export function getWanSpeedPreset(name) {
  return WAN_SPEED_PRESETS[name] || WAN_SPEED_PRESETS.Balanced;
}

export function getWanMotionPreset(name) {
  return WAN_MOTION_PRESETS[name] || WAN_MOTION_PRESETS.Static;
}

export const DEFAULT_WAN_ENGINE = {
  wan_speed_preset: 'Balanced',
  wan_motion_preset: 'Static',
  motion_loras: [],
  motion_lora_weight: 0.8,
  wan_use_init_image: false,
  wan_init_image: null,
  wan_i2v_init_strength: 0.85,
  wan_t2v_model: "1.3B VACE",
  wan_i2v_model: "Use Primary Model",
  wan_auto_download: true,
  wan_preferred_size: "1.3B VACE (Recommended)",
  wan_model_path: "models/wan",
  wan_resolution: "864x480 (Landscape)",
  wan_seed: -1,
  wan_inference_steps: 20,
  wan_strength_override: true,
  wan_fixed_strength: 1.0,
  wan_guidance_override: true,
  wan_guidance_scale: 7.5,
  wan_frame_overlap: 2,
  wan_motion_strength: 1.0,
  wan_motion_strength_override: false,
  wan_enable_interpolation: true,
  wan_interpolation_strength: 0.5,
  wan_flash_attention_mode: "Auto (Recommended)",
  wan_qwen_model: "Auto-Select",
  wan_qwen_auto_download: false,
  wan_qwen_language: "English",
  wan_movement_sensitivity: 1.0,
};

export const WAN_T2V_MODEL_OPTIONS = [
  "Auto-Detect",
  "1.3B VACE",
  "14B VACE",
  "1.3B T2V",
  "14B T2V",
  "Custom Path",
];

export const WAN_I2V_MODEL_OPTIONS = [
  "Use Primary Model",
  "Use T2V Model (No Continuity)",
  "1.3B VACE",
  "14B VACE",
  "1.3B I2V",
  "14B I2V",
];

export const WAN_RESOLUTION_OPTIONS = [
  "864x480 (Landscape)",
  "480x864 (Portrait)",
  "1280x720 (Landscape HD)",
  "720x1280 (Portrait HD)",
  "854x480",
  "480x854",
];

export const WAN_FLASH_ATTENTION_OPTIONS = [
  "Auto (Recommended)",
  "Force Flash Attention",
  "Force PyTorch",
];

export const WAN_QWEN_MODEL_OPTIONS = [
  "Auto-Select",
  "Qwen2.5-VL-3B",
  "Qwen2.5-VL-7B",
  "Qwen-VL-Chat",
];

/** UI control definitions for LIVE → Animation Engine (WAN layer). */
export const WAN_ENGINE_CONTROL_FIELDS = [
  {
    key: "wan_t2v_model",
    label: "T2V model",
    type: "select",
    options: WAN_T2V_MODEL_OPTIONS,
  },
  {
    key: "wan_i2v_model",
    label: "I2V model",
    type: "select",
    options: WAN_I2V_MODEL_OPTIONS,
  },
  {
    key: "wan_resolution",
    label: "Resolution",
    type: "select",
    options: WAN_RESOLUTION_OPTIONS,
  },
  {
    key: "wan_inference_steps",
    label: "Inference steps",
    type: "number",
    min: 5,
    max: 100,
    step: 1,
  },
  {
    key: "wan_guidance_scale",
    label: "Guidance scale",
    type: "number",
    min: 1,
    max: 20,
    step: 0.5,
    when: (wan) => wan.wan_guidance_override !== false,
  },
  {
    key: "wan_guidance_override",
    label: "Override guidance",
    type: "boolean",
  },
  {
    key: "wan_fixed_strength",
    label: "I2V strength",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
    when: (wan) => wan.wan_strength_override !== false,
  },
  {
    key: "wan_strength_override",
    label: "Override strength schedule",
    type: "boolean",
  },
  {
    key: "wan_frame_overlap",
    label: "Frame overlap",
    type: "number",
    min: 0,
    max: 10,
    step: 1,
  },
  {
    key: "wan_motion_strength",
    label: "Motion strength",
    type: "number",
    min: 0,
    max: 2,
    step: 0.05,
  },
  {
    key: "wan_motion_strength_override",
    label: "Fixed motion strength",
    type: "boolean",
  },
  {
    key: "wan_movement_sensitivity",
    label: "Movement sensitivity",
    type: "number",
    min: 0.1,
    max: 2,
    step: 0.05,
  },
  {
    key: "wan_interpolation_strength",
    label: "Interpolation strength",
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
    when: (wan) => wan.wan_enable_interpolation !== false,
  },
  {
    key: "wan_enable_interpolation",
    label: "Clip interpolation",
    type: "boolean",
  },
  {
    key: "wan_seed",
    label: "Wan seed",
    type: "number",
    min: -1,
    max: 2147483647,
    step: 1,
  },
  {
    key: "wan_auto_download",
    label: "Auto-download models",
    type: "boolean",
  },
  {
    key: "wan_flash_attention_mode",
    label: "Flash attention",
    type: "select",
    options: WAN_FLASH_ATTENTION_OPTIONS,
  },
  {
    key: "wan_preferred_size",
    label: "Preferred size",
    type: "select",
    options: ["1.3B VACE (Recommended)", "14B VACE", "Legacy Models"],
  },
  {
    key: "wan_model_path",
    label: "Model path",
    type: "text",
    when: (wan) => String(wan.wan_t2v_model || "").includes("Custom"),
  },
  {
    key: "wan_qwen_model",
    label: "Qwen enhancer",
    type: "select",
    options: WAN_QWEN_MODEL_OPTIONS,
  },
  {
    key: "wan_qwen_auto_download",
    label: "Qwen auto-download",
    type: "boolean",
  },
  {
    key: "wan_qwen_language",
    label: "Qwen language",
    type: "select",
    options: ["English", "Chinese"],
  },
];

export function parseWanResolution(value) {
  const match = String(value || "").match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/** Pick closest Wan resolution preset for an init image aspect ratio. */
export function pickWanResolutionForSize(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) return null;
  const aspect = w / h;
  let best = WAN_RESOLUTION_OPTIONS[0];
  let bestScore = Infinity;
  for (const opt of WAN_RESOLUTION_OPTIONS) {
    const size = parseWanResolution(opt);
    if (!size) continue;
    const optAspect = size.width / size.height;
    const aspectDiff = Math.abs(Math.log(aspect / optAspect));
    const sizeDiff = Math.abs(size.width - w) + Math.abs(size.height - h);
    const score = aspectDiff * 1000 + sizeDiff;
    if (score < bestScore) {
      bestScore = score;
      best = opt;
    }
  }
  return best;
}

export function buildAnimationPromptsJson(settings, positiveFallback = "") {
  const existing = settings?.animation_prompts;
  if (typeof existing === "string" && existing.trim().startsWith("{")) {
    return existing.trim();
  }
  const prompts = settings?.prompts;
  if (prompts && typeof prompts === "object" && !Array.isArray(prompts)) {
    const normalized = {};
    for (const [frame, text] of Object.entries(prompts)) {
      const key = String(frame).trim();
      if (!key) continue;
      normalized[key] = String(text ?? "").trim();
    }
    if (Object.keys(normalized).length) {
      return JSON.stringify(normalized);
    }
  }
  const fallback = String(positiveFallback || "").trim() || "cinematic scene, high quality";
  return JSON.stringify({ 0: fallback });
}

export function mergeWanEngineIntoDeforumSettings(settings, wanEngine, { positivePrompt = "" } = {}) {
  const wan = { ...DEFAULT_WAN_ENGINE, ...(wanEngine || {}) };
  const promptSchedule =
    settings?.prompts && typeof settings.prompts === "object" && !Array.isArray(settings.prompts)
      ? { ...settings.prompts }
      : {};
  const primary = String(positivePrompt || "").trim();
  if (primary) promptSchedule["0"] = primary;

  const loraTags = (Array.isArray(wan.motion_loras) ? wan.motion_loras : [])
    .filter((id) => _WAN_MOTION_LORA_IDS.has(id))
    .map((id) => `<lora:${id}:${Number(wan.motion_lora_weight ?? 0.8).toFixed(2)}>`)
    .join(' ');
  if (loraTags) {
    for (const frame of Object.keys(promptSchedule)) {
      promptSchedule[frame] = `${String(promptSchedule[frame] || '').trimEnd()} ${loraTags}`.trimStart();
    }
  }

  const merged = {
    ...settings,
    animation_mode: WAN_ANIMATION_MODE,
    skip_video_creation: false,
    animation_prompts: Object.keys(promptSchedule).length
      ? JSON.stringify(promptSchedule)
      : buildAnimationPromptsJson(settings, positivePrompt),
    animation_prompts_positive: settings?.animation_prompts_positive
      ?? settings?.positive_prompts
      ?? "",
    animation_prompts_negative: settings?.animation_prompts_negative
      ?? settings?.negative_prompts
      ?? "",
  };
  for (const key of Object.keys(DEFAULT_WAN_ENGINE)) {
    if (_WAN_UI_ONLY_KEYS.has(key)) continue;
    if (wan[key] !== undefined) merged[key] = wan[key];
  }
  const size = parseWanResolution(wan.wan_resolution);
  if (size) {
    merged.W = size.width;
    merged.H = size.height;
  }
  if (wan.wan_seed != null && Number.isFinite(Number(wan.wan_seed))) {
    merged.seed = Number(wan.wan_seed);
  }
  const initImage = String(wan.wan_init_image || merged.init_image || '').trim();
  if (wan.wan_use_init_image && initImage) {
    merged.use_init = true;
    merged.init_image = initImage;
    const initStrength = Number(wan.wan_i2v_init_strength);
    if (Number.isFinite(initStrength)) {
      merged.strength = Math.max(0, Math.min(1, initStrength));
    }
    if (wan.wan_strength_override !== false) {
      merged.wan_strength_override = true;
      merged.wan_fixed_strength = merged.strength;
    }
  } else if (wan.wan_use_init_image === false) {
    merged.use_init = false;
  }
  return merged;
}

export function normalizeWanEngine(raw = {}) {
  const out = { ...DEFAULT_WAN_ENGINE };
  for (const key of Object.keys(DEFAULT_WAN_ENGINE)) {
    if (raw[key] === undefined) continue;
    if (key === 'motion_loras' && Array.isArray(raw.motion_loras)) {
      out.motion_loras = raw.motion_loras.filter((id) => _WAN_MOTION_LORA_IDS.has(id));
      continue;
    }
    if (key === 'wan_init_image') {
      const img = raw.wan_init_image;
      out.wan_init_image = img == null || img === '' ? null : String(img);
      continue;
    }
    if (key === 'wan_use_init_image') {
      out.wan_use_init_image = !!raw.wan_use_init_image && !!String(raw.wan_init_image || '').trim();
      continue;
    }
    if (key === 'wan_i2v_init_strength') {
      const num = Number(raw.wan_i2v_init_strength);
      if (Number.isFinite(num)) out.wan_i2v_init_strength = Math.max(0, Math.min(1, num));
      continue;
    }
    const field = WAN_ENGINE_CONTROL_FIELDS.find((f) => f.key === key);
    if (field?.type === "boolean") {
      out[key] = !!raw[key];
    } else if (field?.type === "number") {
      const num = Number(raw[key]);
      if (Number.isFinite(num)) out[key] = num;
    } else {
      out[key] = String(raw[key]);
    }
  }
  if (!String(out.wan_init_image || '').trim()) {
    out.wan_init_image = null;
    out.wan_use_init_image = false;
  }
  return out;
}

export function visibleWanControlFields(wanEngine) {
  const wan = wanEngine || DEFAULT_WAN_ENGINE;
  const hasInit = wan.wan_use_init_image && String(wan.wan_init_image || '').trim();
  return WAN_ENGINE_CONTROL_FIELDS.filter((field) => {
    if (_WAN_UI_ONLY_KEYS.has(field.key)) return false;
    if (hasInit && field.key === 'wan_i2v_model') return false;
    if (typeof field.when === "function") return field.when(wan);
    return true;
  });
}

export function wanEngineForDownloadPackage(packageId, base = {}) {
  const pkg = getWanDownloadPackage(packageId);
  const patch = {
    ...base,
    wan_auto_download: true,
    wan_model_path: base.wan_model_path || 'models/wan',
  };
  if (pkg.kind === 'qwen') {
    patch.wan_qwen_auto_download = true;
    patch.wan_qwen_model = pkg.qwenModel || 'Qwen2.5-VL-3B';
    return patch;
  }
  if (pkg.t2vModel) patch.wan_t2v_model = pkg.t2vModel;
  if (pkg.i2vModel) patch.wan_i2v_model = pkg.i2vModel;
  if (pkg.preferredSize) patch.wan_preferred_size = pkg.preferredSize;
  return patch;
}
