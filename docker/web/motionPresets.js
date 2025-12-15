const MOTION_PRESETS = {
  Static: { translation_x: 0, translation_y: 0, translation_z: 0, rotation_y: 0, rotation_z: 0, fov: 70 },
  Orbit: { translation_z: -0.5, rotation_y: 5, rotation_z: 0, fov: 70 },
  Tunnel: { translation_z: 0.8, rotation_y: 0, rotation_z: 0, fov: 90 },
  Handheld: { translation_x: 0.1, translation_y: 0.05, rotation_y: 1.2, rotation_z: 0.8 },
  Chaos: { translation_x: 0.4, translation_y: -0.3, rotation_y: 8, rotation_z: 6, translation_z: 0.5 },
};

function motionPresetPayload(name, intensity = 1) {
  const base = MOTION_PRESETS[name];
  if (!base) return {};
  const payload = {};
  Object.entries(base).forEach(([k, v]) => {
    const val = typeof v === "number" ? v * intensity : v;
    payload[k] = val;
  });
  return payload;
}

module.exports = { MOTION_PRESETS, motionPresetPayload };
