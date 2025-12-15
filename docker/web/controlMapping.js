const PARAM_FLAGS = {
  strength: "should_use_deforumation_strength",
  cfg: "should_use_deforumation_cfg",
  cadence: "should_use_deforumation_cadence",
  noise_multiplier: "should_use_deforumation_noise",
  translation_x: "should_use_deforumation_panning",
  translation_y: "should_use_deforumation_panning",
  translation_z: "should_use_deforumation_zoom",
  rotation_x: "should_use_deforumation_rotation",
  rotation_y: "should_use_deforumation_rotation",
  rotation_z: "should_use_deforumation_tilt",
  fov: "should_use_deforumation_fov",
};

const PROMPT_FIELDS = new Set([
  "positive_prompt",
  "negative_prompt",
  "positive_prompt_1",
  "positive_prompt_2",
  "negative_prompt_1",
  "prompt_mix",
  "should_use_deforumation_prompts",
  "should_use_before_deforum_prompt",
  "should_use_after_deforum_prompt",
  "should_use_deforumation_prompt_scheduling",
]);

const LIVE_ALLOWED = new Set([...Object.keys(PARAM_FLAGS), "steps", "seed", "start_frame", "should_resume"]);
const SYNC_KEYS = new Set(["lfo_sync"]);
const PROMPT_SCHEDULE_KEYS = new Set(["prompt_schedule"]);

const toNumber = (val) => {
  const num = typeof val === "string" && val.trim() !== "" ? Number(val) : Number(val);
  return Number.isFinite(num) ? num : null;
};

function mapControl(controlType, payload = {}) {
  if (controlType === "liveParam") {
    const clean = {};
    for (const [k, v] of Object.entries(payload || {})) {
      if (!LIVE_ALLOWED.has(k)) continue;
      const num = toNumber(v);
      if (num === null) continue;
      clean[k] = num;
    }
    return { controlType, payload: clean, valid: Object.keys(clean).length > 0, detail: "liveParam" };
  }

  if (controlType === "prompts") {
    const clean = {};
    for (const [k, v] of Object.entries(payload || {})) {
      if (!PROMPT_FIELDS.has(k)) continue;
      if (typeof v === "boolean" || typeof v === "number") {
        clean[k] = v;
      } else if (typeof v === "string") {
        clean[k] = v;
      }
    }
    if (Array.isArray(payload.prompt_schedule)) {
      clean.prompt_schedule = payload.prompt_schedule
        .map((slot) => ({
          t: Number(slot.t),
          mix: Number(slot.mix),
        }))
        .filter((s) => Number.isFinite(s.t) && Number.isFinite(s.mix));
    }
    return { controlType, payload: clean, valid: Object.keys(clean).length > 0, detail: "prompts" };
  }

  if (controlType === "transport") {
    const clean = {};
    if (payload.action) clean.action = String(payload.action).toLowerCase();
    if (payload.start_frame != null) {
      const num = toNumber(payload.start_frame);
      if (num !== null) clean.start_frame = num;
    }
    return { controlType, payload: clean, valid: Object.keys(clean).length > 0, detail: "transport" };
  }

  if (controlType === "motionPreset" || controlType === "paramSource" || controlType === "motionStyle") {
    return { controlType, payload: payload || {}, valid: true, detail: controlType };
  }

  return { controlType, payload: {}, valid: false, detail: "unknown" };
}

module.exports = { mapControl, PARAM_FLAGS };
