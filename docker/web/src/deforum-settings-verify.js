/**
 * Heuristic checks for Deforum settings before save / preview / play.
 */

const SCHEDULE_FIELD_KEYS = [
  'zoom',
  'angle',
  'translation_x',
  'translation_y',
  'translation_z',
  'rotation_3d_x',
  'rotation_3d_y',
  'rotation_3d_z',
  'noise_schedule',
  'strength_schedule',
  'keyframe_strength_schedule',
  'contrast_schedule',
  'cfg_scale_schedule',
  'distilled_cfg_scale_schedule',
  'steps_schedule',
];

const CN_WEIGHT_KEYS = ['cn_1_weight', 'cn_2_weight', 'cn_3_weight', 'cn_4_weight', 'cn_5_weight'];

function parseScheduleKeyframes(raw) {
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

function scheduleLooksLikeDeforum(raw) {
  if (raw == null || raw === '') return true;
  const text = String(raw).trim();
  if (/\d+\s*:\s*\(?/.test(text)) return true;
  if (/^\([\d.eE+\-]+\)$/.test(text)) return true;
  return false;
}

function scheduleIsFlatZero(raw) {
  const kfs = parseScheduleKeyframes(raw);
  return kfs.every((k) => Math.abs(k.value) < 1e-6);
}

function scheduleHasNonZero(raw) {
  const kfs = parseScheduleKeyframes(raw);
  return kfs.some((k) => Math.abs(k.value) > 1e-6);
}

function primaryPromptText(settings) {
  const prompts = settings && settings.prompts;
  if (prompts && typeof prompts === 'object') {
    const from0 = prompts['0'] ?? prompts[0];
    if (from0 != null && String(from0).trim()) return String(from0).trim();
    const first = Object.values(prompts).find((v) => v != null && String(v).trim());
    if (first) return String(first).trim();
  }
  const pos = settings && settings.positive_prompts;
  if (pos != null && String(pos).trim()) return String(pos).trim();
  return '';
}

function pushIssue(list, field, message, hint) {
  const row = { field, message };
  if (hint) row.hint = hint;
  list.push(row);
}

/**
 * @param {object} settings
 * @param {{ onlyDefinedKeys?: boolean }} [opts] — when true, skip checks for keys omitted from payload (e.g. disabled UI fields)
 * @returns {{ ok: boolean, errors: Array<{field:string,message:string,hint?:string}>, warnings: Array<{field:string,message:string,hint?:string}> }}
 */
export function verifyDeforumSettings(settings, opts = {}) {
  const onlyDefined = !!opts.onlyDefinedKeys;
  const hasKey = (key) => !onlyDefined || (settings && Object.prototype.hasOwnProperty.call(settings, key));
  const errors = [];
  const warnings = [];

  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    pushIssue(errors, 'settings', 'Settings must be a JSON object');
    return { ok: false, errors, warnings };
  }

  const w = Number(settings.W);
  const h = Number(settings.H);
  if (hasKey('W') && (!Number.isFinite(w) || w < 64)) {
    pushIssue(errors, 'W', 'Width must be at least 64 pixels');
  } else if (hasKey('W') && w % 8 !== 0) {
    pushIssue(warnings, 'W', 'Width is not a multiple of 8 — SD/Deforum often works best with divisible-by-8 sizes', 'Try 768, 832, 1024…');
  }
  if (hasKey('H') && (!Number.isFinite(h) || h < 64)) {
    pushIssue(errors, 'H', 'Height must be at least 64 pixels');
  } else if (hasKey('H') && h % 8 !== 0) {
    pushIssue(warnings, 'H', 'Height is not a multiple of 8', 'Try 432, 576, 768…');
  }
  if (Number.isFinite(w) && Number.isFinite(h) && w * h > 1920 * 1080) {
    pushIssue(warnings, 'W×H', `Canvas ${w}×${h} is large — may be slow or OOM on consumer GPUs`, 'Consider 1280×720 or 1024×576 for iteration');
  }

  const maxFrames = Number(settings.max_frames);
  if (hasKey('max_frames') && (!Number.isFinite(maxFrames) || maxFrames < 1)) {
    pushIssue(errors, 'max_frames', 'max_frames must be at least 1');
  } else if (maxFrames > 8000) {
    pushIssue(warnings, 'max_frames', `${maxFrames} frames is very long`, 'Long runs are costly; confirm duration and disk space');
  }

  const fps = Number(settings.fps);
  if (hasKey('fps') && (!Number.isFinite(fps) || fps < 1)) {
    pushIssue(errors, 'fps', 'FPS must be at least 1');
  } else if (fps > 60) {
    pushIssue(warnings, 'fps', `${fps} FPS is unusually high for Deforum`, '24–30 FPS is typical');
  }

  const steps = Number(settings.steps);
  const model = String(settings.sd_model_name || '').toLowerCase();
  if (hasKey('steps') && (!Number.isFinite(steps) || steps < 1)) {
    pushIssue(errors, 'steps', 'Steps must be at least 1');
  } else if (steps < 2 && /lightning|turbo|lcm/.test(model)) {
    pushIssue(warnings, 'steps', `Only ${steps} step(s) with a fast/lightning checkpoint`, 'Lightning models often expect 2–8 steps');
  } else if (steps > 60) {
    pushIssue(warnings, 'steps', `${steps} steps per frame is high`, 'Try 4–20 unless you need maximum quality');
  }

  const batch = String(settings.batch_name || '').trim();
  if (!batch) {
    pushIssue(warnings, 'batch_name', 'Batch name is empty', 'Outputs may be harder to find in the runs browser');
  } else if (!/^[a-zA-Z0-9_.-]+$/.test(batch)) {
    pushIssue(warnings, 'batch_name', 'Batch name has spaces or special characters', 'Use letters, numbers, underscore, hyphen');
  }

  if (!primaryPromptText(settings)) {
    pushIssue(errors, 'prompts', 'No positive prompt — add text under Prompts or prompts["0"]');
  }

  if (settings.use_init && !String(settings.init_image || '').trim()) {
    pushIssue(errors, 'init_image', 'use_init is enabled but init_image is missing');
  }
  if (settings.use_init) {
    const strength = Number(settings.strength);
    if (!Number.isFinite(strength) || strength < 0 || strength > 1.5) {
      pushIssue(warnings, 'strength', 'Init strength is outside 0–1.5', 'Typical img2img strength is 0.3–0.85');
    }
  }

  const mode = String(settings.animation_mode || '2D').trim().toUpperCase();
  if (!['2D', '3D'].includes(mode)) {
    pushIssue(warnings, 'animation_mode', `Unknown animation mode "${settings.animation_mode}"`, 'Use 2D or 3D');
  }

  if (mode === '2D') {
    if (scheduleHasNonZero(settings.translation_z)) {
      pushIssue(warnings, 'translation_z', '3D zoom schedule is non-zero while mode is 2D', 'Ignored in 2D — use zoom / angle instead');
    }
    for (const key of ['rotation_3d_x', 'rotation_3d_y', 'rotation_3d_z']) {
      if (scheduleHasNonZero(settings[key])) {
        pushIssue(warnings, key, '3D rotation schedule is active in 2D mode', 'Switch to 3D mode or zero this schedule');
      }
    }
  } else if (mode === '3D') {
    const has3d =
      scheduleHasNonZero(settings.translation_z)
      || scheduleHasNonZero(settings.rotation_3d_x)
      || scheduleHasNonZero(settings.rotation_3d_y)
      || scheduleHasNonZero(settings.rotation_3d_z);
    const has2d =
      scheduleHasNonZero(settings.translation_x)
      || scheduleHasNonZero(settings.translation_y)
      || scheduleHasNonZero(settings.zoom)
      || scheduleHasNonZero(settings.angle);
    if (!has3d && !has2d) {
      pushIssue(warnings, 'motion', 'No camera motion in schedules', 'Add translation, zoom, or 3D rotation keyframes');
    }
  }

  for (const key of SCHEDULE_FIELD_KEYS) {
    const raw = settings[key];
    if (raw == null || raw === '') continue;
    if (!scheduleLooksLikeDeforum(raw)) {
      pushIssue(warnings, key, 'Value does not look like a Deforum schedule', 'Use frame:value pairs, e.g. 0:(1.0) or 0: (0), 24: (1.02)');
    }
  }

  if (scheduleIsFlatZero(settings.cfg_scale_schedule) && scheduleIsFlatZero(settings.distilled_cfg_scale_schedule)) {
    pushIssue(warnings, 'cfg_scale_schedule', 'CFG schedule is zero everywhere', 'Deforum may produce blank or weak results — try 0:(7) or similar');
  }

  if (scheduleIsFlatZero(settings.strength_schedule) && !settings.use_init) {
    pushIssue(warnings, 'strength_schedule', 'Strength schedule is flat at 0', 'Usually keep strength > 0 for generation');
  }

  const stepsSched = String(settings.steps_schedule || '');
  if (stepsSched && scheduleLooksLikeDeforum(stepsSched)) {
    const schedSteps = parseScheduleKeyframes(stepsSched)[0]?.value;
    if (Number.isFinite(steps) && Number.isFinite(schedSteps) && Math.round(steps) !== Math.round(schedSteps)) {
      pushIssue(warnings, 'steps', `UI steps (${steps}) differs from steps_schedule (${schedSteps})`, 'Align steps and steps_schedule');
    }
  }

  for (let i = 1; i <= 5; i += 1) {
    const enabled = settings[`cn_${i}_enabled`];
    if (!enabled) continue;
    const mod = String(settings[`cn_${i}_module`] || '').toLowerCase();
    const cnModel = String(settings[`cn_${i}_model`] || '').toLowerCase();
    if (!mod || mod === 'none') {
      pushIssue(warnings, `cn_${i}_module`, 'ControlNet enabled but module is None');
    }
    if (!cnModel || cnModel === 'none') {
      pushIssue(warnings, `cn_${i}_model`, 'ControlNet enabled but model is None');
    }
    const vid = String(settings[`cn_${i}_vid_path`] || '').trim();
    if (/video|temporal|animated/i.test(mod + cnModel) && !vid) {
      pushIssue(warnings, `cn_${i}_vid_path`, 'Video/temporal ControlNet without cn_*_vid_path');
    }
  }

  for (const key of CN_WEIGHT_KEYS) {
    if (settings[key.replace('_weight', '_enabled')] && scheduleIsFlatZero(settings[key])) {
      pushIssue(warnings, key, 'ControlNet weight schedule is zero while unit is enabled');
    }
  }

  if (!String(settings.sd_model_name || '').trim()) {
    pushIssue(warnings, 'sd_model_name', 'No checkpoint selected');
  }

  if (settings.skip_video_creation === false) {
    pushIssue(warnings, 'skip_video_creation', 'Video export enabled', 'Encoding adds time; enable only when you need an MP4');
  }

  return { ok: errors.length === 0, errors, warnings };
}
