/**
 * Parse and sample Deforum schedule strings, e.g. "0: (0), 30: (10)".
 */

export function parseDeforumSchedule(raw) {
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

export function sampleSchedule(keyframes, frame) {
  if (!Array.isArray(keyframes) || !keyframes.length) return 0;
  const f = Number(frame) || 0;
  if (f <= keyframes[0].frame) return keyframes[0].value;
  for (let i = 1; i < keyframes.length; i += 1) {
    const prev = keyframes[i - 1];
    const next = keyframes[i];
    if (f <= next.frame) {
      const span = next.frame - prev.frame || 1;
      const t = (f - prev.frame) / span;
      return prev.value + (next.value - prev.value) * t;
    }
  }
  return keyframes[keyframes.length - 1].value;
}

export function constantSchedule(value) {
  const num = Number(value) || 0;
  return [{ frame: 0, value: num }];
}

export function scheduleFromSettings(settings, key, liveOverride) {
  if (liveOverride != null && Number.isFinite(Number(liveOverride))) {
    return constantSchedule(liveOverride);
  }
  return parseDeforumSchedule(settings && settings[key]);
}

const DEG = Math.PI / 180;

/**
 * Integrate Deforum 3D motion schedules into a camera path (world-space positions).
 * @param {object} options
 * @param {object} [options.settings] deforum settings object
 * @param {object} [options.live] live overrides { translation_x, translation_y, translation_z, rotation_3d_x, ... }
 * @param {number} [options.frameCount]
 */
export function buildCameraPath({
  settings = {},
  live = {},
  frameCount = 120,
} = {}) {
  const frames = Math.max(2, Math.min(9999, Number(frameCount) || 120));
  const tx = scheduleFromSettings(settings, 'translation_x', live.translation_x);
  const ty = scheduleFromSettings(settings, 'translation_y', live.translation_y);
  const tz = scheduleFromSettings(settings, 'translation_z', live.translation_z);
  const rx = scheduleFromSettings(settings, 'rotation_3d_x', live.rotation_3d_x);
  const ry = scheduleFromSettings(settings, 'rotation_3d_y', live.rotation_3d_y);
  const rz = scheduleFromSettings(settings, 'rotation_3d_z', live.rotation_3d_z);

  const points = [];
  let px = 0;
  let py = 0;
  let pz = 0;
  let yaw = 0;
  let pitch = 0;
  let roll = 0;

  points.push({ frame: 0, x: px, y: py, z: pz, yaw, pitch, roll });

  for (let f = 1; f <= frames; f += 1) {
    pitch += sampleSchedule(rx, f) * DEG;
    yaw += sampleSchedule(ry, f) * DEG;
    roll += sampleSchedule(rz, f) * DEG;

    const dx = sampleSchedule(tx, f);
    const dy = sampleSchedule(ty, f);
    const dz = sampleSchedule(tz, f);

    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    px += dx * cosY * cosP + dz * sinY;
    py += -dy;
    pz += -dx * sinY * cosP + dz * cosY;

    points.push({ frame: f, x: px, y: py, z: pz, yaw, pitch, roll });
  }

  return points;
}
