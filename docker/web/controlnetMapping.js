const CONTROLNET_PRESETS = {
  CN1: { weight: 0.4, enabled: 1, bypass: 0 },
  CN2: { weight: 0.4, enabled: 1, bypass: 0 },
  CN3: { weight: 0.4, enabled: 1, bypass: 0 },
  CN4: { weight: 0.4, enabled: 1, bypass: 0 },
  CN5: { weight: 0.4, enabled: 1, bypass: 0 },
};

function controlnetPayload(slot, overrides = {}) {
  const key = slot || "CN1";
  const base = CONTROLNET_PRESETS[key] || {};
  return { slot: key, ...base, ...overrides };
}

module.exports = { CONTROLNET_PRESETS, controlnetPayload };
