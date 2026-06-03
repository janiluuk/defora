/**
 * Animation engine plugins — one layer each, mixable via compositor.
 */

import { buildCommonVisualModulationTargets } from './common-visual.mjs';
import { ANIMATELCM_CONTROL_FIELDS } from './animatelcm-engine-config.mjs';
import { WAN_ENGINE_CONTROL_FIELDS } from '../shared/wan-engine-config.mjs';
import { SVD_ENGINE_CONTROL_FIELDS } from '../shared/svd-engine-config.mjs';

/** @type {import('./types').AnimationPluginDef[]} */
export const ANIMATION_PLUGINS = [
  {
    id: 'webgl',
    label: 'WebGL',
    layerKind: 'webgl',
    layerId: 'webgl',
    backend: 'webgl',
    builtin: true,
    mixable: true,
    panel: 'WebGLPluginPanel',
  },
  {
    id: 'deforum',
    label: 'Deforum',
    layerKind: 'deforum',
    layerId: 'deforum',
    backend: 'forge-deforum',
    builtin: true,
    mixable: true,
    panel: 'DeforumPluginPanel',
  },
  {
    id: 'wan',
    label: 'WAN Video',
    layerKind: 'wan',
    layerId: 'wan',
    backend: 'forge-wan',
    builtin: true,
    mixable: true,
    panel: 'WanPluginPanel',
  },
  {
    id: 'animatelcm',
    label: 'AnimateLCM',
    layerKind: 'animatelcm',
    layerId: 'animatelcm',
    backend: 'forge-animatelcm',
    builtin: true,
    mixable: true,
    panel: 'AnimateLcmPluginPanel',
  },
  {
    id: 'svd',
    label: 'SVD',
    layerKind: 'svd',
    layerId: 'svd',
    backend: 'forge-svd',
    builtin: true,
    mixable: true,
    panel: 'SvdPluginPanel',
  },
];

/** Compositor / input layers — not animation plugins but listed in layer picker */
export const COMPOSITOR_LAYERS = [
  { id: 'blend', kind: 'blend', label: 'Both', builtin: true },
  { id: 'input', kind: 'input', label: 'Input', builtin: true },
];

export function pluginById(id) {
  return ANIMATION_PLUGINS.find((p) => p.id === id) || null;
}

export function pluginByLayerKind(kind) {
  return ANIMATION_PLUGINS.find((p) => p.layerKind === kind) || null;
}

export function pluginByLayerId(layerId) {
  return ANIMATION_PLUGINS.find((p) => p.layerId === layerId) || null;
}

export function isAnimationPluginLayer(layer) {
  return !!(layer && pluginByLayerKind(layer.kind));
}

function wanModTargets() {
  return WAN_ENGINE_CONTROL_FIELDS.filter((f) => f.type === 'number').map((f) => ({
    key: `wan.${f.key}`,
    label: `WAN · ${f.label}`,
    min: f.min ?? 0,
    max: f.max ?? 1,
    step: f.step ?? 0.01,
    default: f.type === 'number' ? (f.min ?? 0) : 0,
    group: 'WAN Video',
    pluginId: 'wan',
  }));
}

function animatelcmModTargets() {
  return ANIMATELCM_CONTROL_FIELDS.filter((f) => f.type === 'number').map((f) => ({
    key: `animatelcm.${f.key}`,
    label: `AnimateLCM · ${f.label}`,
    min: f.min ?? 0,
    max: f.max ?? 1,
    step: f.step ?? 0.01,
    default: 0,
    group: 'AnimateLCM',
    pluginId: 'animatelcm',
  }));
}

function svdModTargets() {
  return SVD_ENGINE_CONTROL_FIELDS.filter((f) => f.type === 'number').map((f) => ({
    key: `svd.${f.key}`,
    label: `SVD · ${f.label}`,
    min: f.min ?? 0,
    max: f.max ?? 1,
    step: f.step ?? 0.01,
    default: 0,
    group: 'SVD',
    pluginId: 'svd',
  }));
}

/** All plugin-scoped modulation targets for LFO / macros / MIDI */
export function allPluginModulationTargets() {
  const out = [];
  for (const plugin of ANIMATION_PLUGINS) {
    out.push(...buildCommonVisualModulationTargets(plugin.id, plugin.label));
  }
  out.push(...wanModTargets());
  out.push(...animatelcmModTargets());
  out.push(...svdModTargets());
  return out;
}

export function legacyModKeyAliases() {
  const aliases = {};
  for (const t of allPluginModulationTargets()) {
    if (t.key.startsWith('deforum.common.')) {
      const paramId = t.key.replace('deforum.common.', '');
      if (paramId === 'strength') aliases.strength = t.key;
      if (paramId === 'cfg') aliases.cfg = t.key;
      if (paramId === 'noise') aliases.noise_multiplier = t.key;
    }
    if (t.key === 'deforum.common.pan_x') aliases.panx = t.key;
    if (t.key === 'deforum.common.pan_y') aliases.pany = t.key;
    if (t.key === 'deforum.common.zoom') aliases.zoom = t.key;
  }
  return aliases;
}
