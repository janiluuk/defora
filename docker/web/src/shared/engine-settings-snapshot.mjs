/**
 * Fixed engine-settings snapshot slots (opacity, preset, per-engine parameters).
 */

export const ENGINE_SETTINGS_SLOT_COUNT = 6;

export function buildEngineSettingsSnapshot(state) {
  const s = state && typeof state === 'object' ? state : {};
  return {
    v: 1,
    savedAt: Date.now(),
    activeVideoLayerId: String(s.activeVideoLayerId || ''),
    videoLayerOpacity: { ...(s.videoLayerOpacity || {}) },
    videoLayerPreviewVisible: { ...(s.videoLayerPreviewVisible || {}) },
    currentPreset: s.currentPreset != null ? String(s.currentPreset) : null,
    defaultAnimation: s.defaultAnimation && typeof s.defaultAnimation === 'object'
      ? { ...s.defaultAnimation }
      : {},
    deforumSettings: s.deforumSettings && typeof s.deforumSettings === 'object'
      ? { ...s.deforumSettings }
      : {},
    lcmEngine: s.lcmEngine && typeof s.lcmEngine === 'object' ? { ...s.lcmEngine } : {},
    wanEngine: s.wanEngine && typeof s.wanEngine === 'object' ? { ...s.wanEngine } : {},
    animateLcmEngine: s.animateLcmEngine && typeof s.animateLcmEngine === 'object'
      ? { ...s.animateLcmEngine }
      : {},
    svdEngine: s.svdEngine && typeof s.svdEngine === 'object' ? { ...s.svdEngine } : {},
  };
}

export function normalizeEngineSettingsSlot(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const opacity = raw.videoLayerOpacity && typeof raw.videoLayerOpacity === 'object'
    ? raw.videoLayerOpacity
    : {};
  const preview = raw.videoLayerPreviewVisible && typeof raw.videoLayerPreviewVisible === 'object'
    ? raw.videoLayerPreviewVisible
    : {};
  return buildEngineSettingsSnapshot({
    activeVideoLayerId: raw.activeVideoLayerId,
    videoLayerOpacity: opacity,
    videoLayerPreviewVisible: preview,
    currentPreset: raw.currentPreset,
    defaultAnimation: raw.defaultAnimation,
    deforumSettings: raw.deforumSettings,
    lcmEngine: raw.lcmEngine,
    wanEngine: raw.wanEngine,
    animateLcmEngine: raw.animateLcmEngine,
    svdEngine: raw.svdEngine,
  });
}

export function normalizeEngineSettingsSlots(raw) {
  const out = Array.from({ length: ENGINE_SETTINGS_SLOT_COUNT }, () => null);
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < ENGINE_SETTINGS_SLOT_COUNT; i += 1) {
    out[i] = normalizeEngineSettingsSlot(raw[i]);
  }
  return out;
}

const LAYER_LABELS = {
  webgl: 'WebGL',
  deforum: 'Deforum',
  wan: 'WAN',
  animatelcm: 'AnimateLCM',
  svd: 'SVD',
  blend: 'Blend',
};

export function engineSettingsSlotLabel(snapshot) {
  if (!snapshot) return '';
  const layerId = String(snapshot.activeVideoLayerId || '').trim();
  const layer = LAYER_LABELS[layerId] || layerId || 'Engine';
  const preset = snapshot.currentPreset ? String(snapshot.currentPreset).trim() : '';
  if (preset) return `${layer} · ${preset}`.slice(0, 18);
  const mode = snapshot.defaultAnimation?.mode;
  if (layerId === 'webgl' && mode) {
    return `${layer} · ${mode}`.slice(0, 18);
  }
  return layer.slice(0, 18);
}

export function engineSettingsSlotTitle(snapshot, index) {
  if (!snapshot) return `Slot ${index + 1}: empty — click to save current engine settings`;
  const when = snapshot.savedAt
    ? new Date(snapshot.savedAt).toLocaleString()
    : 'unknown time';
  return `Slot ${index + 1}: ${engineSettingsSlotLabel(snapshot)} — saved ${when}. Click to load. Shift+click to overwrite.`;
}
