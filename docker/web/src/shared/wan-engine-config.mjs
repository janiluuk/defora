/** Wan 2.1 video engine (sd-forge-deforum `animation_mode: "Wan Video"`). */

export const WAN_ANIMATION_MODE = "Wan Video";

export const DEFAULT_WAN_ENGINE = {
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
  return merged;
}

export function normalizeWanEngine(raw = {}) {
  const out = { ...DEFAULT_WAN_ENGINE };
  for (const key of Object.keys(DEFAULT_WAN_ENGINE)) {
    if (raw[key] === undefined) continue;
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
  return out;
}

export function visibleWanControlFields(wanEngine) {
  const wan = wanEngine || DEFAULT_WAN_ENGINE;
  return WAN_ENGINE_CONTROL_FIELDS.filter((field) => {
    if (typeof field.when === "function") return field.when(wan);
    return true;
  });
}
