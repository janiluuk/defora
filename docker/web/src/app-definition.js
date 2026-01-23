// Auto-generated from App.vue — run: npm run sync-app-definition (audit A-01)

// --- inlined from morph-utils.js (ESM source; do not edit) ---
/** Cross-type morph helpers for the performance crossfader (t: 0 = A, 1 = B). */

function clamp01(t) {
  const n = Number(t);
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

/** Smoothstep easing for perceptually smoother blends. */
function smoothstep(t) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function lerpNum(a, b, t) {
  const st = smoothstep(t);
  const hasA = a !== null && a !== undefined && a !== "";
  const hasB = b !== null && b !== undefined && b !== "";
  if (!hasA && !hasB) return null;
  if (!hasA) return Number(b);
  if (!hasB) return Number(a);
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return hasB ? b : a;
  return na + (nb - na) * st;
}

function morphPrompt(a, b, t) {
  const sa = a != null ? String(a).trim() : "";
  const sb = b != null ? String(b).trim() : "";
  if (!sa && !sb) return "";
  if (!sa) return sb;
  if (!sb) return sa;
  const st = smoothstep(t);
  if (st <= 0.02) return sa;
  if (st >= 0.98) return sb;
  const wa = (1 - st).toFixed(2);
  const wb = st.toFixed(2);
  return `(${sa}:${wa}) (${sb}:${wb})`;
}

function morphBoolean(a, b, t) {
  const hasA = a !== null && a !== undefined;
  const hasB = b !== null && b !== undefined;
  if (!hasA && !hasB) return null;
  if (!hasA) return !!b;
  if (!hasB) return !!a;
  return smoothstep(t) >= 0.5 ? !!b : !!a;
}

function morphLoraSlot(a, b, t) {
  const st = smoothstep(t);
  const parse = (v) => {
    if (!v) return null;
    if (typeof v === "object") return v;
    return { name: String(v), strength: 1 };
  };
  const pa = parse(a);
  const pb = parse(b);
  if (!pa && !pb) return null;
  if (!pa) return pb;
  if (!pb) return pa;
  if (st < 0.5) {
    return { name: pa.name, strength: (pa.strength ?? 1) * (1 - st * 2) };
  }
  return { name: pb.name, strength: (pb.strength ?? 1) * ((st - 0.5) * 2) };
}

function morphControlNetSlot(a, b, t) {
  const st = smoothstep(t);
  const norm = (v) => {
    if (!v || typeof v !== "object") return null;
    return {
      slotId: v.slotId || v.id || "CN1",
      weight: Number(v.weight ?? 0.4),
      start: Number(v.start ?? 0),
      end: Number(v.end ?? 0.9),
      enabled: v.enabled !== false,
    };
  };
  const pa = norm(a);
  const pb = norm(b);
  if (!pa && !pb) return null;
  if (!pa) return pb;
  if (!pb) return pa;
  return {
    slotId: st < 0.5 ? pa.slotId : pb.slotId,
    weight: lerpNum(pa.weight, pb.weight, st),
    start: lerpNum(pa.start, pb.start, st),
    end: lerpNum(pa.end, pb.end, st),
    enabled: morphBoolean(pa.enabled, pb.enabled, st),
  };
}

/**
 * @param {{ type: string, valueA?: unknown, valueB?: unknown }} slot
 * @param {number} t crossfader 0..1
 */
function morphSlotValue(slot, t) {
  if (!slot) return null;
  const st = clamp01(t);
  switch (slot.type) {
    case "prompt":
      return morphPrompt(slot.valueA, slot.valueB, st);
    case "param":
      return lerpNum(slot.valueA, slot.valueB, st);
    case "lora":
      return morphLoraSlot(slot.valueA, slot.valueB, st);
    case "controlnet":
      return morphControlNetSlot(slot.valueA, slot.valueB, st);
    default:
      return lerpNum(slot.valueA, slot.valueB, st);
  }
}

const CROSSFADE_SLOT_TYPES = [
  { id: "prompt", label: "Prompt" },
  { id: "param", label: "Parameter" },
  { id: "lora", label: "LoRA" },
  { id: "controlnet", label: "ControlNet" },
];
// --- inlined from deforum-settings-schema.js (ESM source; do not edit) ---
/**
 * Deforum settings UI schema + defaults for the hidden LIVE panel.
 * Full JSON is persisted; only grouped fields are shown in the minimal editor.
 */

const DEFORUM_DEFAULT_SETTINGS = {
  W: 1920,
  H: 540,
  show_info_on_ui: false,
  tiling: false,
  restore_faces: false,
  seed_resize_from_w: 0,
  seed_resize_from_h: 0,
  seed: 1693,
  sampler: 'HeunPP2',
  scheduler: 'Normal',
  steps: 10,
  batch_name: 'floral_neu',
  seed_behavior: 'random',
  seed_iter_N: 1,
  use_init: false,
  strength: 1.0,
  strength_0_no_init: true,
  init_image: null,
  use_mask: false,
  animation_mode: '2D',
  max_frames: 9999,
  border: 'replicate',
  angle: '0: (0)',
  zoom: '0: (1.0)',
  translation_x: '0: (0)',
  translation_y: '0: (0.0)',
  translation_z: '0: (0.0)',
  transform_center_x: '0: (0.5)',
  transform_center_y: '0: (0.5)',
  rotation_3d_x: '0: (0)',
  rotation_3d_y: '0: (0)',
  rotation_3d_z: '0: (0)',
  noise_schedule: '0: (0.01)',
  strength_schedule: '0: (0.7)',
  keyframe_strength_schedule: '0: (0.50)',
  contrast_schedule: '0: (1.0)',
  cfg_scale_schedule: '0:(9)',
  distilled_cfg_scale_schedule: '0: (1.5)',
  enable_steps_scheduling: false,
  steps_schedule: '0: (6)',
  prompts: {
    '0':
      ' <lora:floral_dreamshaper:1.5>silhouette black  big wild flowers and  wild plants and berries , red background, many different flowers, layered silhouettes, folk art style floral graphics, flat folk art style illustration, layered composition, detailed composition,   natural colors, medium high contrast    --neg star, star shape, watermark, signature , dreamstime, logo, writing, text, poster element, year, number, date, label,   vignette, glow, , symbol, alphabet, number, freepik',
  },
  positive_prompts: '',
  negative_prompts:
    'star, star shape, watermark, signature , dreamstime, logo, writing, text, poster element, year, number, date, label,   vignette, glow, , symbol, alphabet, number, freepik',
  fps: 25,
  sd_model_name: 'nightvisionxl_v0811.safetensors',
  skip_video_creation: true,
  cn_1_enabled: false,
  cn_1_weight: '0:(2)',
  cn_1_module: 'None',
  cn_1_model: 'temporalnetversion2 [b554c208]',
};

/** @type {{ id: string, label: string, fields: Array<{ key: string, label: string, type?: string, min?: number, max?: number, step?: number, rows?: number, options?: string[] }> }>[]} */
const DEFORUM_FIELD_GROUPS = [
  {
    id: 'canvas',
    label: 'Canvas',
    fields: [
      { key: 'W', label: 'Width', type: 'number', min: 256, max: 4096, step: 64 },
      { key: 'H', label: 'Height', type: 'number', min: 256, max: 4096, step: 64 },
      { key: 'fps', label: 'FPS', type: 'number', min: 1, max: 60, step: 1 },
      { key: 'max_frames', label: 'Max frames', type: 'number', min: 1, max: 99999, step: 1 },
      { key: 'batch_name', label: 'Batch name', type: 'text' },
    ],
  },
  {
    id: 'sampling',
    label: 'Sampling',
    fields: [
      { key: 'seed', label: 'Seed', type: 'number', min: -1, max: 2147483647, step: 1 },
      { key: 'sampler', label: 'Sampler', type: 'text' },
      { key: 'scheduler', label: 'Scheduler', type: 'text' },
      { key: 'steps', label: 'Steps', type: 'number', min: 1, max: 150, step: 1 },
      { key: 'sd_model_name', label: 'Checkpoint', type: 'text' },
    ],
  },
  {
    id: 'prompts',
    label: 'Prompts',
    fields: [
      { key: 'prompts.0', label: 'Prompt @ 0', type: 'textarea', rows: 4 },
      { key: 'negative_prompts', label: 'Negative', type: 'textarea', rows: 3 },
      { key: 'positive_prompts', label: 'Positive (extra)', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'init',
    label: 'Init',
    fields: [
      { key: 'use_init', label: 'Use init image', type: 'bool' },
      { key: 'strength', label: 'Strength', type: 'number', min: 0, max: 1.5, step: 0.01 },
      { key: 'init_image', label: 'Init image URL/path', type: 'text' },
    ],
  },
  {
    id: 'motion',
    label: 'Motion 2D',
    fields: [
      { key: 'animation_mode', label: 'Mode', type: 'text' },
      { key: 'zoom', label: 'Zoom schedule', type: 'text' },
      { key: 'translation_x', label: 'Pan X schedule', type: 'text' },
      { key: 'translation_y', label: 'Pan Y schedule', type: 'text' },
      { key: 'angle', label: 'Angle schedule', type: 'text' },
    ],
  },
  {
    id: 'schedules',
    label: 'Schedules',
    fields: [
      { key: 'noise_schedule', label: 'Noise', type: 'text' },
      { key: 'strength_schedule', label: 'Strength', type: 'text' },
      { key: 'cfg_scale_schedule', label: 'CFG', type: 'text' },
      { key: 'steps_schedule', label: 'Steps', type: 'text' },
    ],
  },
  {
    id: 'controlnet',
    label: 'ControlNet 1',
    fields: [
      { key: 'cn_1_enabled', label: 'Enabled', type: 'bool' },
      { key: 'cn_1_weight', label: 'Weight schedule', type: 'text' },
      { key: 'cn_1_module', label: 'Module', type: 'text' },
      { key: 'cn_1_model', label: 'Model', type: 'text' },
    ],
  },
];

function getNestedValue(obj, keyPath) {
  if (!keyPath || !obj) return undefined;
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function setNestedValue(obj, keyPath, value) {
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function patchFromKeyPath(keyPath, value) {
  const parts = String(keyPath).split('.');
  if (parts.length === 1) return { [parts[0]]: value };
  const root = parts[0];
  const inner = {};
  let cur = inner;
  for (let i = 1; i < parts.length - 1; i++) {
    cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return { [root]: inner };
}

function mergeDeforumSettings(base, patch) {
  const out = { ...base, ...patch };
  if (patch.prompts && typeof patch.prompts === 'object') {
    out.prompts = { ...(base.prompts || {}), ...patch.prompts };
  }
  return out;
}
// --- inlined from api-utils.js (ESM source; do not edit) ---
/**
 * Fetch helper with structured console errors (audit post-remediation polish).
 */
const CONTROL_TOKEN_STORAGE_KEY = 'defora_control_token';
let fetchInterceptorInstalled = false;

function getStoredControlToken() {
  if (typeof localStorage === 'undefined') return '';
  try {
    return localStorage.getItem(CONTROL_TOKEN_STORAGE_KEY) || '';
  } catch (_) {
    return '';
  }
}

function shouldAttachApiToken(input) {
  if (typeof window === 'undefined' || typeof URL === 'undefined') return false;
  const rawUrl = typeof input === 'string' || input instanceof URL
    ? input
    : input && typeof input.url === 'string'
      ? input.url
      : null;
  if (!rawUrl) return false;
  try {
    const url = new URL(rawUrl, window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith('/api');
  } catch (_) {
    return false;
  }
}

function withControlTokenHeaders(input, options = {}) {
  const token = getStoredControlToken();
  if (!token || !shouldAttachApiToken(input) || typeof Headers === 'undefined') {
    return options;
  }
  const headers = new Headers(options.headers || undefined);
  if (!headers.has('Authorization') && !headers.has('X-API-Token') && !headers.has('X-Control-Token')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return {
    ...options,
    headers,
  };
}

function installApiTokenFetchInterceptor() {
  if (fetchInterceptorInstalled || typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return;
  }
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, options = {}) => nativeFetch(input, withControlTokenHeaders(input, options));
  fetchInterceptorInstalled = true;
}

async function apiFetch(url, options = {}, context = 'API') {
  const label = context || url;
  try {
    const res = await fetch(url, withControlTokenHeaders(url, options));
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }
    } else {
      const text = await res.text();
      if (text) data = { _raw: text.slice(0, 200) };
    }
    if (!res.ok) {
      const detail = (data && (data.error || data.message)) || res.statusText || `HTTP ${res.status}`;
      console.error(`[Defora ${label}] ${res.status}: ${detail}`, data || '');
      const err = new Error(detail);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return { res, data };
  } catch (err) {
    if (err.status) throw err;
    console.error(`[Defora ${label}] Network error: ${err.message}`);
    throw err;
  }
}

function modelSourceLabel(source) {
  if (source === 'sd-forge') return 'Forge';
  if (source === 'cache') return 'Cache';
  if (source === 'placeholder') return 'Placeholder';
  return source || 'Unknown';
}

module.exports = {
  template: "<div id=\"app\">\n    <header>\n      <div class=\"tabs\">\n        <button class=\"tab\" v-for=\"tab in tabs\" :key=\"tab.id\" :class=\"{active: currentTab===tab.id}\" @click=\"switchTab(tab.id)\">\n          {{ tab.label }}\n        </button>\n      </div>\n      <div style=\"display:flex; gap:8px; align-items:center; justify-content:flex-end; flex-wrap:wrap;\">\n        <button class=\"btn\" :class=\"{playing: deforumPlaying}\" @click=\"toggleDeforumPlay\" :title=\"deforumPlaying ? 'Pause Deforum' : 'Play Deforum animation'\">\n          {{ deforumPlaying ? '⏸ Anim' : '▶ Anim' }}\n        </button>\n        <button class=\"btn ghost\" @click=\"stopDeforumPlay\" title=\"Stop animation\">⏹</button>\n        <button class=\"btn ghost\" :class=\"{recording: isRecording}\" @click=\"toggleStreamRecord\">{{ isRecording ? '⏹ Rec' : '● Rec' }}</button>\n        <div class=\"pill\" :class=\"{'danger': apiHealth.sdForge && apiHealth.sdForge.available === false}\" v-if=\"apiHealth.sdForge\" :title=\"apiHealth.sdForge.lastChecked ? ('SD-Forge last check: ' + apiHealth.sdForge.lastChecked) : 'SD-Forge status'\">\n          <span class=\"dot\"></span><span>Forge</span><strong>{{ apiHealth.sdForge.available == null ? '…' : (apiHealth.sdForge.available ? 'up' : 'down') }}</strong>\n        </div>\n        <div class=\"pill\" v-if=\"midi.supported\">\n          <span class=\"dot\"></span><span>MIDI</span><strong>{{ midi.selected ? 'on' : 'off' }}</strong>\n        </div>\n        <div class=\"pill\">\n          <span class=\"dot\"></span><span>WS</span><strong>{{ wsStatus }}</strong>\n        </div>\n        <div class=\"pill\">\n          <span class=\"dot\"></span><span>Session</span><strong>{{ session }}</strong>\n        </div>\n      </div>\n    </header>\n\n    <div class=\"layout\">\n      <!-- Left: video + mini timeline -->\n      <div class=\"preview\">\n        <div class=\"video-wrap\">\n          <video id=\"player\" ref=\"videoEl\" autoplay muted playsinline></video>\n          <div class=\"overlay\">\n            <div>\n              <div class=\"timecode\">{{ timecode }}</div>\n              <div style=\"font-size:11px; color:var(--muted);\">Seed {{ hud.seed }}</div>\n            </div>\n            <div style=\"text-align:right;\">\n              <div>{{ stats.fps }} fps</div>\n              <div style=\"font-size:11px; color:var(--muted);\">lat {{ stats.lat }}ms</div>\n            </div>\n          </div>\n        </div>\n\n        <!-- Local blob URL only; used to align reference audio with HLS video timeline -->\n        <audio ref=\"avSyncAudio\" data-testid=\"av-sync-audio\" :src=\"audio.objectUrl || undefined\" preload=\"auto\" style=\"display:none;\"></audio>\n\n        <div class=\"timeline\" style=\"margin-top: 4px;\">\n          <template v-if=\"audio.objectUrl\">\n            <div class=\"thumbs\">\n              <div class=\"thumb-card\" v-for=\"f in thumbs.slice(0, 12)\" :key=\"f.name\">\n                <img class=\"thumb\" :src=\"f.url\" :alt=\"f.name\" />\n                <div class=\"thumb-label\">{{ f.name }}</div>\n              </div>\n            </div>\n          </template>\n          <template v-else>\n            <div class=\"thumbs\">\n              <div class=\"thumb-card\" v-for=\"i in 6\" :key=\"i\">\n                <div class=\"thumb-placeholder\">\n                  <svg viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" stroke=\"currentColor\" stroke-width=\"2\" rx=\"2\"/>\n                    <circle cx=\"8\" cy=\"8\" r=\"2\" fill=\"currentColor\"/>\n                    <path d=\"M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z\" fill=\"currentColor\" opacity=\"0.5\"/>\n                  </svg>\n                </div>\n              </div>\n            </div>\n          </template>\n        </div>\n\n        <!-- Custom video controls -->\n        <div class=\"preview-bar-container\">\n          <div class=\"preview-bar-header\">\n            <span class=\"preview-bar-title\">Frames</span>\n            <button class=\"preview-bar-toggle\" @click=\"showFrames = !showFrames\">{{ showFrames ? '▲' : '▼' }}</button>\n          </div>\n          <div class=\"preview-bar\" :class=\"{collapsed: !showFrames}\">\n            <div class=\"thumb-card\" v-for=\"f in thumbs\" :key=\"'bar-'+f.name\">\n              <img class=\"thumb\" :src=\"f.url\" :alt=\"f.name\" />\n              <div class=\"thumb-label\">{{ f.name }}</div>\n            </div>\n            <div v-if=\"!thumbs.length\" class=\"thumb-card\">\n              <div class=\"thumb-placeholder\">\n                <svg viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                  <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" stroke=\"currentColor\" stroke-width=\"2\" rx=\"2\"/>\n                  <circle cx=\"8\" cy=\"8\" r=\"2\" fill=\"currentColor\"/>\n                  <path d=\"M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z\" fill=\"currentColor\" opacity=\"0.5\"/>\n                </svg>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"video-controls-panel\">\n          <div class=\"video-controls\">\n            <button class=\"control-btn\" :class=\"{playing: deforumPlaying}\" @click=\"toggleDeforumPlay\" data-testid=\"deforum-play\">\n              {{ deforumPlaying ? '⏸ Pause' : '▶ Play' }}\n            </button>\n            <button class=\"control-btn\" @click=\"generatePreviewFrame\" :disabled=\"previewGenerating || deforumPlaying\" data-testid=\"preview-frame\">\n              {{ previewGenerating ? '⏳ Frame…' : '🖼 Frame' }}\n            </button>\n            <button class=\"control-btn\" :class=\"{recording: isRecording}\" @click=\"toggleStreamRecord\" data-testid=\"stream-record\">\n              {{ isRecording ? '⏹ Stop Rec' : '● Record' }}\n            </button>\n            <span class=\"perf-mode-badge\" :class=\"deforumPlaying ? 'mode-animate' : 'mode-preview'\">\n              {{ deforumPlaying ? 'Animating' : 'Preview' }}\n            </span>\n          </div>\n          <div class=\"stream-link\">\n            <a href=\"/hls/live/deforum.m3u8\" target=\"_blank\">📡 HLS Stream</a>\n            <span style=\"color:#5a8fb8;\">|</span>\n            <a href=\"rtmp://localhost:1935/live/deforum\" target=\"_blank\">📡 RTMP</a>\n          </div>\n        </div>\n      </div>\n\n      <!-- Right: control rack per tab -->\n      <div>\n        <div v-if=\"currentTab==='LIVE'\">\n          <div class=\"rack performance-deck\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🎛 <span class=\"framesync-accent\">Performance</span></div>\n                <span class=\"perf-mode-badge\" :class=\"deforumPlaying ? 'mode-animate' : 'mode-preview'\">\n                  {{ deforumPlaying ? 'Deforum playing' : 'Single-frame preview' }}\n                </span>\n              </div>\n\n              <div class=\"framesync-stack\" style=\"margin-top:10px;\">\n                <div class=\"framesync-subtitle\">Generic prompt</div>\n                <textarea class=\"framesync-input\" v-model=\"performance.genericPrompt\" rows=\"2\" placeholder=\"Base prompt for this session…\" @input=\"onPerformanceInput\"></textarea>\n              </div>\n\n              <div class=\"crossfade-deck\" style=\"margin-top:14px;\">\n                <div class=\"crossfade-deck-head\">\n                  <span class=\"framesync-subtitle\" style=\"margin:0;\">Morph slots</span>\n                  <select class=\"framesync-select\" style=\"max-width:140px;\" v-model=\"performance.newSlotType\">\n                    <option v-for=\"st in crossfadeSlotTypes\" :key=\"st.id\" :value=\"st.id\">{{ st.label }}</option>\n                  </select>\n                  <button type=\"button\" class=\"framesync-button\" @click=\"addCrossfadeSlot\">+ Add</button>\n                </div>\n\n                <div v-if=\"!performance.slots.length\" class=\"crossfade-empty\">Add prompts, parameters, LoRAs, or ControlNet values on side A and/or B.</div>\n\n                <div v-for=\"slot in performance.slots\" :key=\"slot.id\" class=\"crossfade-slot-row\">\n                  <div class=\"crossfade-side crossfade-side-a\">\n                    <span class=\"crossfade-side-label\">A</span>\n                    <template v-if=\"slot.type === 'prompt'\">\n                      <input class=\"framesync-input\" v-model=\"slot.valueA\" placeholder=\"Prompt A (optional)\" @input=\"onPerformanceInput\">\n                    </template>\n                    <template v-else-if=\"slot.type === 'param'\">\n                      <select class=\"framesync-select\" v-model=\"slot.paramKey\" @change=\"onPerformanceInput\">\n                        <option v-for=\"t in lfoTargets\" :key=\"'a-'+slot.id+t.key\" :value=\"t.key\">{{ t.label }}</option>\n                      </select>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"slot.valueA\" step=\"any\" placeholder=\"Value A\" @input=\"onPerformanceInput\">\n                    </template>\n                    <template v-else-if=\"slot.type === 'lora'\">\n                      <select class=\"framesync-select\" v-model=\"slot.valueA\" @change=\"onPerformanceInput\">\n                        <option :value=\"null\">— none —</option>\n                        <option v-for=\"l in loras.available\" :key=\"'la-'+slot.id+l.id\" :value=\"l.name\">{{ l.name }}</option>\n                      </select>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"slot.loraStrengthA\" min=\"0\" max=\"2\" step=\"0.01\" placeholder=\"Str A\" @input=\"onPerformanceInput\">\n                    </template>\n                    <template v-else-if=\"slot.type === 'controlnet'\">\n                      <select class=\"framesync-select\" v-model=\"slot.cnSlotId\" @change=\"onPerformanceInput\">\n                        <option v-for=\"s in cn.slots\" :key=\"'cna-'+slot.id+s.id\" :value=\"s.id\">{{ s.label }}</option>\n                      </select>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"slot.valueA\" min=\"0\" max=\"2\" step=\"0.01\" placeholder=\"Weight A\" @input=\"onPerformanceInput\">\n                    </template>\n                  </div>\n\n                  <div class=\"crossfade-slot-meta\">\n                    <span class=\"crossfade-type-pill\">{{ slotTypeLabel(slot.type) }}</span>\n                    <button type=\"button\" class=\"framesync-button\" style=\"padding:2px 6px;\" @click=\"removeCrossfadeSlot(slot.id)\">✕</button>\n                  </div>\n\n                  <div class=\"crossfade-side crossfade-side-b\">\n                    <span class=\"crossfade-side-label\">B</span>\n                    <template v-if=\"slot.type === 'prompt'\">\n                      <input class=\"framesync-input\" v-model=\"slot.valueB\" placeholder=\"Prompt B (optional)\" @input=\"onPerformanceInput\">\n                    </template>\n                    <template v-else-if=\"slot.type === 'param'\">\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"slot.valueB\" step=\"any\" placeholder=\"Value B\" @input=\"onPerformanceInput\">\n                    </template>\n                    <template v-else-if=\"slot.type === 'lora'\">\n                      <select class=\"framesync-select\" v-model=\"slot.valueB\" @change=\"onPerformanceInput\">\n                        <option :value=\"null\">— none —</option>\n                        <option v-for=\"l in loras.available\" :key=\"'lb-'+slot.id+l.id\" :value=\"l.name\">{{ l.name }}</option>\n                      </select>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"slot.loraStrengthB\" min=\"0\" max=\"2\" step=\"0.01\" placeholder=\"Str B\" @input=\"onPerformanceInput\">\n                    </template>\n                    <template v-else-if=\"slot.type === 'controlnet'\">\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"slot.valueB\" min=\"0\" max=\"2\" step=\"0.01\" placeholder=\"Weight B\" @input=\"onPerformanceInput\">\n                    </template>\n                  </div>\n\n                  <div class=\"crossfade-morphed\" v-if=\"slotMorphedPreview(slot) !== null\">\n                    <span class=\"framesync-subtitle\" style=\"margin:0;font-size:9px;\">→</span>\n                    <code class=\"crossfade-morphed-val\">{{ formatMorphedPreview(slot) }}</code>\n                  </div>\n                </div>\n\n                <div class=\"crossfade-center\" style=\"margin-top:16px;\">\n                  <div class=\"framesync-subtitle\" style=\"text-align:center;\">Crossfader</div>\n                  <div class=\"framesync-gradient-bar\"></div>\n                  <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" v-model.number=\"performance.crossfader\" class=\"framesync-input\" data-testid=\"performance-crossfader\" @input=\"onCrossfaderInput\">\n                  <div class=\"crossfade-labels\">\n                    <span>A {{ ((1 - performance.crossfader) * 100).toFixed(0) }}%</span>\n                    <span>B {{ (performance.crossfader * 100).toFixed(0) }}%</span>\n                  </div>\n                </div>\n              </div>\n\n              <div v-if=\"performance.status\" class=\"framesync-subtitle\" style=\"margin-top:10px;text-align:center;color:#5af2a9;\">{{ performance.status }}</div>\n              <div v-if=\"performance.lastPreviewPath\" style=\"margin-top:8px;\">\n                <img :src=\"performance.lastPreviewPath\" alt=\"Last preview frame\" class=\"preview-frame-thumb\">\n              </div>\n            </div>\n          </div>\n\n          <div class=\"rack param-drawer\">\n            <button type=\"button\" class=\"param-drawer-toggle\" @click=\"paramPanelOpen = !paramPanelOpen; saveSessionState()\">\n              <span>⚙️ Parameters</span>\n              <span class=\"model-status-pill\" :class=\"'model-' + modelStatusKind\" :title=\"modelStatusLabel\">\n                <span class=\"model-status-dot\"></span>\n                {{ modelStatusLabel }}\n              </span>\n              <span>{{ paramPanelOpen ? '▲' : '▼' }}</span>\n            </button>\n            <div v-show=\"paramPanelOpen\" class=\"param-drawer-body\">\n              <div class=\"model-bar\">\n                <label class=\"framesync-subtitle\">Checkpoint</label>\n                <select class=\"framesync-select\" v-model=\"forge.selectedModel\" :disabled=\"forge.switching || modelStatusKind === 'offline'\" @change=\"onModelSelectChange\">\n                  <option value=\"\">— select model —</option>\n                  <option v-for=\"m in forge.models\" :key=\"m.model_name || m.title\" :value=\"m.model_name || m.title\">{{ m.title || m.model_name }}</option>\n                </select>\n                <span v-if=\"forge.modelsSource\" class=\"model-source-pill\" :class=\"'src-' + forge.modelsSource\" :title=\"'Model list from ' + forge.modelsSource\">\n                  ● {{ modelSourceLabel(forge.modelsSource) }}\n                </span>\n                <span v-if=\"forge.switching\" class=\"model-loading\">Loading model…</span>\n                <span v-else-if=\"forge.lastModel\" class=\"model-last\">Last: {{ forge.lastModel }}</span>\n              </div>\n\n              <div v-for=\"group in paramPanelGroups\" :key=\"group.label\" class=\"param-group\">\n                <div class=\"framesync-subtitle\">{{ group.label }}</div>\n                <div class=\"param-group-grid\">\n                  <div class=\"framesync-stack\" v-for=\"p in group.items\" :key=\"p.key\" :class=\"{'param-locked': isParamLocked(p.key)}\">\n                    <div class=\"framesync-subtitle\" style=\"font-size:10px; display:flex; align-items:center; gap:6px;\">\n                      <span>{{ p.label }}</span>\n                      <button type=\"button\" class=\"param-lock-btn\" :class=\"{active: isParamLockedByMe(p.key)}\" :title=\"paramLockTitle(p.key)\" @click.stop=\"toggleParamLock(p.key)\">🔒</button>\n                    </div>\n                    <input type=\"range\" :min=\"p.min\" :max=\"p.max\" :step=\"p.step\" :value=\"p.val\" :disabled=\"isParamLocked(p.key) && !isParamLockedByMe(p.key)\" @input=\"updateParam(p,$event)\" class=\"framesync-input\">\n                  </div>\n                </div>\n              </div>\n\n              <div class=\"framesync-footer\" style=\"margin-top:10px;\">\n                <button class=\"framesync-button\" @click=\"resetVibeParams\">↺ Reset vibe</button>\n                <button class=\"framesync-button\" @click=\"resetCameraParams\">↺ Reset camera</button>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"rack param-drawer deforum-settings-drawer\" data-testid=\"deforum-settings-panel\">\n            <button type=\"button\" class=\"param-drawer-toggle\" @click=\"deforumPanelOpen = !deforumPanelOpen; saveSessionState()\">\n              <span>🎬 Deforum settings</span>\n              <span class=\"deforum-settings-hint\">{{ deforumSettingsStatus || 'Hidden panel' }}</span>\n              <span>{{ deforumPanelOpen ? '▲' : '▼' }}</span>\n            </button>\n            <div v-show=\"deforumPanelOpen\" class=\"param-drawer-body deforum-settings-body\">\n              <div class=\"deforum-settings-toolbar\">\n                <button type=\"button\" class=\"framesync-button\" @click=\"loadDeforumSettings\">↻ Reload</button>\n                <button type=\"button\" class=\"framesync-button\" @click=\"saveDeforumSettings\">💾 Save</button>\n                <button type=\"button\" class=\"framesync-button\" :disabled=\"previewGenerating\" @click=\"generateDeforumPreviewFrame\">🖼 Regenerate frame</button>\n                <label class=\"deforum-advanced-toggle\">\n                  <input type=\"checkbox\" v-model=\"deforumAdvancedOpen\"> JSON\n                </label>\n              </div>\n\n              <div v-if=\"deforumAdvancedOpen\" class=\"deforum-advanced-json\">\n                <textarea\n                  class=\"framesync-input deforum-json-editor\"\n                  v-model=\"deforumSettingsJson\"\n                  rows=\"12\"\n                  spellcheck=\"false\"\n                  @blur=\"applyDeforumSettingsJson\"\n                ></textarea>\n                <p v-if=\"deforumSettingsJsonError\" class=\"deforum-json-error\">{{ deforumSettingsJsonError }}</p>\n              </div>\n\n              <div v-else class=\"deforum-settings-groups\">\n                <details\n                  v-for=\"group in deforumFieldGroups\"\n                  :key=\"group.id\"\n                  class=\"deforum-settings-group\"\n                  :open=\"deforumSectionOpen[group.id] !== false\"\n                  @toggle=\"onDeforumSectionToggle(group.id, $event)\"\n                >\n                  <summary class=\"deforum-settings-group-title\">{{ group.label }}</summary>\n                  <div class=\"deforum-settings-grid\">\n                    <label\n                      v-for=\"field in group.fields\"\n                      :key=\"field.key\"\n                      class=\"deforum-field\"\n                      :class=\"'deforum-field-' + (field.type || 'text')\"\n                    >\n                      <span class=\"deforum-field-label\">{{ field.label }}</span>\n                      <input\n                        v-if=\"field.type === 'number'\"\n                        type=\"number\"\n                        class=\"framesync-input\"\n                        :min=\"field.min\"\n                        :max=\"field.max\"\n                        :step=\"field.step || 1\"\n                        :value=\"getDeforumField(field.key)\"\n                        @input=\"onDeforumFieldInput(field.key, $event.target.value, 'number')\"\n                      />\n                      <input\n                        v-else-if=\"field.type === 'bool'\"\n                        type=\"checkbox\"\n                        :checked=\"!!getDeforumField(field.key)\"\n                        @change=\"onDeforumFieldInput(field.key, $event.target.checked, 'bool')\"\n                      />\n                      <textarea\n                        v-else-if=\"field.type === 'textarea'\"\n                        class=\"framesync-input\"\n                        :rows=\"field.rows || 3\"\n                        :value=\"getDeforumField(field.key) ?? ''\"\n                        @input=\"onDeforumFieldInput(field.key, $event.target.value, 'text')\"\n                      />\n                      <input\n                        v-else\n                        type=\"text\"\n                        class=\"framesync-input\"\n                        :value=\"getDeforumField(field.key) ?? ''\"\n                        @input=\"onDeforumFieldInput(field.key, $event.target.value, 'text')\"\n                      />\n                    </label>\n                  </div>\n                </details>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='PROMPTS'\">\n          <div class=\"sub-pills\">\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.PROMPTS==='PROMPTS'}\" @click=\"switchSubTab('PROMPTS','PROMPTS')\">PROMPTS</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.PROMPTS==='LORA'}\" @click=\"switchSubTab('PROMPTS','LORA')\">LORA</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.PROMPTS==='CONTROLNET'}\" @click=\"switchSubTab('PROMPTS','CONTROLNET')\">CONTROLNET</button>\n          </div>\n          <div v-if=\"currentSubTab.PROMPTS==='PROMPTS'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">✍️ Prompt <span class=\"framesync-accent\">Morphing</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <button class=\"framesync-button\" :class=\"{active: prompts.morphOn}\" @click=\"setMorph(true)\">☑ Enabled</button>\n                  <button class=\"framesync-button\" :class=\"{active: !prompts.morphOn}\" @click=\"setMorph(false)\">☐ Disabled</button>\n                  <button class=\"framesync-button\" @click=\"morphCollapsed = !morphCollapsed\">{{ morphCollapsed ? '▼ Show' : '▲ Hide' }}</button>\n                  <button class=\"framesync-button\" @click=\"applyLoras\" style=\"padding:6px 16px;\">✓ Apply All</button>\n                </div>\n              </div>\n\n              <div v-if=\"!morphCollapsed\">\n              <div class=\"morph-blend-bar\" style=\"margin-top:14px;\">\n                <div class=\"framesync-subtitle\">Prompt morph blend</div>\n                <div class=\"framesync-gradient-bar\"></div>\n                <input\n                  type=\"range\"\n                  min=\"0\"\n                  max=\"1\"\n                  step=\"0.01\"\n                  v-model.number=\"prompts.morphBlend\"\n                  class=\"framesync-input\"\n                  data-testid=\"prompt-morph-blend\"\n                  @input=\"onPromptMorphBlendInput\"\n                />\n                <div class=\"morph-blend-labels\">\n                  <span>A {{ ((1 - prompts.morphBlend) * 100).toFixed(0) }}%</span>\n                  <span>B {{ (prompts.morphBlend * 100).toFixed(0) }}%</span>\n                </div>\n              </div>\n              <div v-if=\"prompts.morphOn\" class=\"morph-slot-weights\" style=\"margin-top:12px;\">\n                <div\n                  v-for=\"slot in morphSlots\"\n                  :key=\"'mw-' + slot.id\"\n                  class=\"morph-slot-weight-row\"\n                  :class=\"{ inactive: !slot.on || !morphSlotInRange(slot) }\"\n                >\n                  <label class=\"morph-slot-weight-name\">\n                    <input type=\"checkbox\" v-model=\"slot.on\" @change=\"applyPromptMorphing\" />\n                    {{ slot.name }}\n                  </label>\n                  <span class=\"morph-slot-range\">{{ slot.range }}</span>\n                  <input\n                    type=\"range\"\n                    min=\"0\"\n                    max=\"1\"\n                    step=\"0.01\"\n                    v-model.number=\"slot.weight\"\n                    class=\"framesync-input morph-slot-weight-slider\"\n                    :disabled=\"!slot.on\"\n                    @input=\"onMorphSlotWeightInput(slot)\"\n                  />\n                  <code class=\"morph-slot-preview\">{{ morphSlotPreview(slot) }}</code>\n                </div>\n              </div>\n              <div style=\"margin-top:20px; display:grid; grid-template-columns: 1fr 2fr 1fr; gap:16px; align-items:stretch;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">A Group</div>\n                  <div v-for=\"lora in loras.groupA.slice(0, 3)\" :key=\"'a-'+lora.id\" style=\"background:#0b1526; border:1px solid #13233d; border-radius:8px; padding:8px; margin-bottom:6px;\">\n                    <div style=\"font-size:12px; color:#cfe5f5; font-weight:600;\">{{ lora.name }}</div>\n                    <input type=\"range\" min=\"0\" max=\"2\" step=\"0.01\" :value=\"lora.strength\" @input=\"lora.strength=parseFloat($event.target.value)\" class=\"framesync-input\" style=\"margin-top:4px;\">\n                    <div style=\"font-size:10px; color:#7fb3d6; margin-top:2px;\">{{ lora.strength.toFixed(2) }}</div>\n                  </div>\n                  <div v-if=\"loras.groupA.length === 0\" style=\"flex:1; display:flex; align-items:center; justify-content:center; color:#7fb3d6; font-size:11px; text-align:center;\">\n                    No LoRAs in A group\n                  </div>\n                  <div v-else-if=\"loras.groupA.length > 3\" style=\"font-size:10px; color:#9bc4e2; text-align:center; padding:4px;\">\n                    +{{ loras.groupA.length - 3 }} more\n                  </div>\n                </div>\n\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Crossfader</div>\n                  <div class=\"framesync-gradient-bar\"></div>\n                  <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" :value=\"prompts.crossfaderValue\" @input=\"prompts.crossfaderValue=parseFloat($event.target.value)\" class=\"framesync-input\" style=\"margin-top:8px;\">\n                  <div style=\"display:flex; justify-content:space-between; font-size:10px; color:#7fb3d6; margin-top:4px;\">\n                    <span>A: {{ ((1-prompts.crossfaderValue)*100).toFixed(0) }}%</span>\n                    <span>B: {{ (prompts.crossfaderValue*100).toFixed(0) }}%</span>\n                  </div>\n                </div>\n\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">B Group</div>\n                  <div v-for=\"lora in loras.groupB.slice(0, 3)\" :key=\"'b-'+lora.id\" style=\"background:#0b1526; border:1px solid #13233d; border-radius:8px; padding:8px; margin-bottom:6px;\">\n                    <div style=\"font-size:12px; color:#cfe5f5; font-weight:600;\">{{ lora.name }}</div>\n                    <input type=\"range\" min=\"0\" max=\"2\" step=\"0.01\" :value=\"lora.strength\" @input=\"lora.strength=parseFloat($event.target.value)\" class=\"framesync-input\" style=\"margin-top:4px;\">\n                    <div style=\"font-size:10px; color:#7fb3d6; margin-top:2px;\">{{ lora.strength.toFixed(2) }}</div>\n                  </div>\n                  <div v-if=\"loras.groupB.length === 0\" style=\"flex:1; display:flex; align-items:center; justify-content:center; color:#7fb3d6; font-size:11px; text-align:center;\">\n                    No LoRAs in B group\n                  </div>\n                  <div v-else-if=\"loras.groupB.length > 3\" style=\"font-size:10px; color:#9bc4e2; text-align:center; padding:4px;\">\n                    +{{ loras.groupB.length - 3 }} more\n                  </div>\n                </div>\n              </div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🖼 img2img <span class=\"framesync-accent\">(Forge)</span></div>\n                <button class=\"framesync-button\" @click=\"img2img.show = !img2img.show\">{{ img2img.show ? '▲ Hide' : '▼ Show' }}</button>\n              </div>\n              <div v-if=\"img2img.show\">\n              <div class=\"framesync-subtitle\" style=\"margin-top:8px;\">\n                Reference image → <code>/api/img2img</code> (SD-Forge). Optional <strong>mask</strong> enables inpainting (white = repaint, black = keep). Output under <code>/uploads/</code>.\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Reference image</div>\n                  <input type=\"file\" accept=\"image/*\" @change=\"onImg2imgFile\" class=\"framesync-input\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Mask image (optional)</div>\n                  <input type=\"file\" accept=\"image/*\" @change=\"onImg2imgMaskFile\" class=\"framesync-input\">\n                </div>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:10px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Mask blur</div>\n                  <input type=\"number\" class=\"framesync-input\" v-model.number=\"img2img.maskBlur\" min=\"0\" max=\"64\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Inpainting fill</div>\n                  <select class=\"framesync-select\" v-model.number=\"img2img.inpaintingFill\">\n                    <option value=\"0\">Fill</option>\n                    <option value=\"1\">Original</option>\n                    <option value=\"2\">Latent noise</option>\n                    <option value=\"3\">Latent nothing</option>\n                  </select>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Denoising strength</div>\n                  <input type=\"number\" class=\"framesync-input\" v-model.number=\"img2img.denoisingStrength\" min=\"0\" max=\"1\" step=\"0.01\">\n                </div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:10px;\">\n                <button class=\"framesync-button\" @click=\"runImg2img\">🚀 Run img2img</button>\n              </div>\n              <div v-if=\"img2img.status\" class=\"framesync-subtitle\" style=\"margin-top:8px; text-align:center;\">{{ img2img.status }}</div>\n              <div v-if=\"img2img.lastPath\" class=\"framesync-subtitle\" style=\"margin-top:4px; text-align:center;\">\n                Output: <a :href=\"img2img.lastPath\" target=\"_blank\" style=\"color:#ff8a1a;\">{{ img2img.lastPath }}</a>\n              </div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">📚 Plugins <span class=\"framesync-accent\">Registry</span></div>\n                <button class=\"framesync-button\" @click=\"refreshPlugins\">🔄 Refresh</button>\n              </div>\n              <ul v-if=\"pluginsRegistry.length\" class=\"framesync-list\" style=\"margin-top:4px; font-size:11px; padding-left:16px;\">\n                <li v-for=\"p in pluginsRegistry\" :key=\"p.id || p.name\">{{ p.name || p.id }}<span v-if=\"p.description\"> — {{ p.description }}</span></li>\n              </ul>\n            </div>\n          </div>\n          </div>\n\n          <div v-else-if=\"currentSubTab.PROMPTS==='LORA'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">📚 LoRA <span class=\"framesync-accent\">Browser</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <span class=\"source\" v-if=\"loras.source\" style=\"font-size:10px;\">\n                    <span v-if=\"loras.source==='sd-forge'\" style=\"color:#5af2a9;\">● Forge</span>\n                    <span v-else-if=\"loras.source==='cache'\" style=\"color:#fbbf24;\">● Cache</span>\n                    <span v-else-if=\"loras.source==='placeholder'\" style=\"color:#ff4d6d;\">● Placeholder</span>\n                    <span v-else style=\"color:#7fb3d6;\">● {{ loras.source }}</span>\n                  </span>\n                  <button class=\"framesync-button\" @click=\"refreshLoras\">🔄 Refresh</button>\n                </div>\n              </div>\n              <div style=\"margin-top:12px; display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:12px; max-height:400px; overflow-y:auto;\">\n                <div v-for=\"lora in loras.available\" :key=\"lora.id\"\n                     style=\"background:#0b1526; border:1px solid #13233d; border-radius:10px; overflow:hidden; cursor:pointer;\"\n                     @click=\"toggleLoraSelection(lora)\">\n                  <div style=\"position:relative; width:100%; height:180px; background:#031b2d;\">\n                    <img v-if=\"lora.thumbnail\" :src=\"lora.thumbnail\" style=\"width:100%; height:100%; object-fit:cover;\" :alt=\"lora.name\" />\n                    <div v-else style=\"display:flex; align-items:center; justify-content:center; height:100%; color:#7fb3d6;\">\n                      <svg viewBox=\"0 0 24 24\" style=\"width:48px; height:48px; opacity:0.3;\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" stroke=\"currentColor\" stroke-width=\"2\" rx=\"2\"/>\n                        <circle cx=\"8\" cy=\"8\" r=\"2\" fill=\"currentColor\"/>\n                        <path d=\"M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z\" fill=\"currentColor\" opacity=\"0.5\"/>\n                      </svg>\n                    </div>\n                    <div v-if=\"lora.selected\" style=\"position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.8); border:1px solid #ff8a1a; border-radius:4px; padding:4px 8px; font-size:10px; color:#ff8a1a; font-weight:700;\">\n                      ✓ {{ lora.group }}\n                    </div>\n                  </div>\n                  <div style=\"padding:10px;\">\n                    <div style=\"font-size:13px; color:#cfe5f5; font-weight:600; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;\">\n                      {{ lora.name }}\n                    </div>\n                    <div style=\"font-size:10px; color:#7fb3d6; margin-bottom:8px;\">\n                      {{ lora.path }}\n                    </div>\n                    <div class=\"framesync-stack\">\n                      <div class=\"framesync-subtitle\">Strength</div>\n                      <input type=\"range\" min=\"0\" max=\"2\" step=\"0.01\" :value=\"lora.strength\" @input=\"lora.strength=parseFloat($event.target.value)\" class=\"framesync-input\">\n                      <div style=\"font-size:10px; color:#7fb3d6; margin-top:2px;\">{{ lora.strength.toFixed(2) }}</div>\n                    </div>\n                    <div class=\"framesync-footer\" style=\"margin-top:8px;\">\n                      <button class=\"framesync-button\" :class=\"{active: lora.group==='A'}\" @click.stop=\"assignLoraToGroup(lora,'A')\">A</button>\n                      <button class=\"framesync-button\" :class=\"{active: lora.group==='B'}\" @click.stop=\"assignLoraToGroup(lora,'B')\">B</button>\n                      <button class=\"framesync-button\" v-if=\"lora.group\" @click.stop=\"unassignLora(lora)\">✕</button>\n                    </div>\n                  </div>\n                </div>\n              </div>\n              <div v-if=\"loras.available.length === 0\" style=\"margin-top:20px; text-align:center; color:#7fb3d6; font-size:12px;\">\n                No LoRA models found. Refresh or check SD-Forge connection.\n              </div>\n            </div>\n          </div>\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🎛 Active <span class=\"framesync-accent\">LoRAs</span></div>\n              </div>\n              <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;\">\n                <div>\n                  <div style=\"font-size:12px; color:#5af2a9; margin-bottom:8px; font-weight:600;\">A GROUP ({{ loras.groupA.length }})</div>\n                  <div style=\"background:#031b2d; border:1px solid #0c3048; border-radius:8px; padding:8px;\">\n                    <div v-for=\"lora in loras.groupA\" :key=\"lora.id\"\n                         style=\"display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #0c3048;\">\n                      <span style=\"font-size:12px; color:#cfe5f5;\">{{ lora.name }}</span>\n                      <span style=\"font-size:10px; color:#7fb3d6;\">{{ lora.strength.toFixed(2) }}</span>\n                    </div>\n                    <div v-if=\"loras.groupA.length === 0\" style=\"font-size:11px; color:#7fb3d6; padding:8px; text-align:center;\">\n                      No LoRAs in A group\n                    </div>\n                  </div>\n                </div>\n                <div>\n                  <div style=\"font-size:12px; color:#2de2ff; margin-bottom:8px; font-weight:600;\">B GROUP ({{ loras.groupB.length }})</div>\n                  <div style=\"background:#031b2d; border:1px solid #0c3048; border-radius:8px; padding:8px;\">\n                    <div v-for=\"lora in loras.groupB\" :key=\"lora.id\"\n                         style=\"display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #0c3048;\">\n                      <span style=\"font-size:12px; color:#cfe5f5;\">{{ lora.name }}</span>\n                      <span style=\"font-size:10px; color:#7fb3d6;\">{{ lora.strength.toFixed(2) }}</span>\n                    </div>\n                    <div v-if=\"loras.groupB.length === 0\" style=\"font-size:11px; color:#7fb3d6; padding:8px; text-align:center;\">\n                      No LoRAs in B group\n                    </div>\n                  </div>\n                </div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                <button class=\"framesync-button\" @click=\"applyLoras\">✓ Apply LoRAs</button>\n                <button class=\"framesync-button\" @click=\"exportLoraPreset\">💾 Export preset</button>\n              </div>\n            </div>\n          </div>\n          </div>\n\n          <div v-else-if=\"currentSubTab.PROMPTS==='CONTROLNET'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🎯 ControlNet <span class=\"framesync-accent\">Slots</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <span class=\"source\" v-if=\"cn.source\" style=\"font-size:10px;\">\n                    <span v-if=\"cn.source==='sd-forge'\" style=\"color:#5af2a9;\">● Forge</span>\n                    <span v-else-if=\"cn.source==='cache'\" style=\"color:#fbbf24;\">● Cache</span>\n                    <span v-else-if=\"cn.source==='placeholder'\" style=\"color:#ff4d6d;\">● Placeholder</span>\n                    <span v-else style=\"color:#7fb3d6;\">● {{ cn.source }}</span>\n                  </span>\n                  <button class=\"framesync-button\" @click=\"loadControlNetModels\">🔄 Refresh</button>\n                </div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                <button class=\"framesync-button\" v-for=\"slot in cn.slots\" :key=\"slot.id\" :class=\"{active: cn.active===slot.id}\" @click=\"cn.active=slot.id\">{{ slot.label }}</button>\n              </div>\n            </div>\n          </div>\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">⚙️ <span class=\"framesync-accent\">{{ activeSlot.label }}</span> Settings</div>\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div class=\"framesync-subtitle\">Model</div>\n                <select class=\"framesync-select\" v-model=\"activeSlot.model\" @change=\"updateControlNet(activeSlot)\">\n                  <option v-for=\"m in cn.availableModels\" :key=\"m.id\" :value=\"m.name\">{{ m.name }}</option>\n                </select>\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div class=\"framesync-subtitle\">Image source</div>\n                <div style=\"display:flex; gap:8px; flex-wrap:wrap;\">\n                  <button type=\"button\" class=\"framesync-button\" :class=\"{active: activeSlot.imageSource==='file'}\" @click=\"activeSlot.imageSource='file'\">📁 File</button>\n                  <button type=\"button\" class=\"framesync-button\" :class=\"{active: activeSlot.imageSource==='webcam'}\" @click=\"activeSlot.imageSource='webcam'\">📷 Webcam</button>\n                  <button type=\"button\" class=\"framesync-button\" :class=\"{active: activeSlot.imageSource==='screen'}\" @click=\"activeSlot.imageSource='screen'\">🖥️ Screen</button>\n                </div>\n                <input ref=\"cnImageInput\" type=\"file\" accept=\"image/*\" style=\"display:none;\" @change=\"onControlNetFileSelected\">\n              </div>\n              <div v-if=\"activeSlot.imageSource==='webcam'\" class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div class=\"framesync-subtitle\">Webcam input</div>\n                <video ref=\"webcamVideo\" autoplay playsinline style=\"width:100%; max-width:320px; border-radius:6px; border:1px solid #0c3048; display:none;\"></video>\n                <canvas ref=\"webcamCanvas\" style=\"display:none;\"></canvas>\n                <div style=\"display:flex; gap:8px; margin-top:8px;\">\n                  <button type=\"button\" class=\"framesync-button\" :class=\"{active: cn.webcamActive}\" @click=\"toggleWebcam\">{{ cn.webcamActive ? '⏹ Stop' : '▶ Start' }} Webcam</button>\n                  <select class=\"framesync-input\" v-model.number=\"webcamCaptureRate\" style=\"max-width:120px; font-size:11px;\">\n                    <option :value=\"1000\">1 fps</option>\n                    <option :value=\"500\">2 fps</option>\n                    <option :value=\"200\">5 fps</option>\n                    <option :value=\"100\">10 fps</option>\n                  </select>\n                </div>\n              </div>\n              <div v-if=\"activeSlot.imageSource==='screen'\" class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div class=\"framesync-subtitle\">Screen capture</div>\n                <button type=\"button\" class=\"framesync-button\" @click=\"startScreenCapture\">🖥️ Start screen capture</button>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:10px;\">\n                <button type=\"button\" class=\"framesync-button\" @click=\"uploadControlNetImage(activeSlot)\">📁 Upload image</button>\n                <button type=\"button\" class=\"framesync-button\" :class=\"{active: activeSlot.enabled}\" @click=\"activeSlot.enabled=!activeSlot.enabled; updateControlNet(activeSlot)\">{{ activeSlot.enabled ? 'Enabled' : 'Disabled' }}</button>\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div style=\"display:flex; justify-content:space-between; align-items:center;\">\n                  <div class=\"framesync-subtitle\">Weight</div>\n                  <span style=\"color:#cfe5f5; font-size:12px;\">{{ activeSlot.weight.toFixed(2) }}</span>\n                </div>\n                <input type=\"range\" min=\"0\" max=\"2\" step=\"0.01\" v-model.number=\"activeSlot.weight\" @input=\"updateControlNet(activeSlot)\" class=\"framesync-input\">\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div style=\"display:flex; justify-content:space-between; align-items:center;\">\n                  <div class=\"framesync-subtitle\">Start step</div>\n                  <span style=\"color:#cfe5f5; font-size:12px;\">{{ activeSlot.start.toFixed(2) }}</span>\n                </div>\n                <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" v-model.number=\"activeSlot.start\" @input=\"updateControlNet(activeSlot)\" class=\"framesync-input\">\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div style=\"display:flex; justify-content:space-between; align-items:center;\">\n                  <div class=\"framesync-subtitle\">End step</div>\n                  <span style=\"color:#cfe5f5; font-size:12px;\">{{ activeSlot.end.toFixed(2) }}</span>\n                </div>\n                <input type=\"range\" min=\"0\" max=\"1\" step=\"0.01\" v-model.number=\"activeSlot.end\" @input=\"updateControlNet(activeSlot)\" class=\"framesync-input\">\n              </div>\n            </div>\n          </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='MOTION'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">📐 Motion <span class=\"framesync-accent\">Presets</span></div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                <button class=\"framesync-button\" v-for=\"p in Object.keys(motionPresets)\" :key=\"p\" @click=\"sendPreset(p)\">{{ p }}</button>\n              </div>\n            </div>\n          </div>\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🎮 XY <span class=\"framesync-accent\">Pad</span></div>\n                <span style=\"font-size:10px; color:#7fb3d6;\">Pan X / Pan Y</span>\n              </div>\n              <div\n                class=\"xy-pad\"\n                :style=\"{ width: xyPad.padSize + 'px', height: xyPad.padSize + 'px' }\"\n                @mousedown=\"xyPadMouseDown\"\n                @mousemove=\"xyPadMouseMove\"\n                @mouseup=\"xyPadMouseUp\"\n                @mouseleave=\"xyPadMouseUp\"\n                @touchstart.prevent=\"xyPadMouseDown\"\n                @touchmove.prevent=\"xyPadMouseMove\"\n                @touchend.prevent=\"xyPadMouseUp\"\n              >\n                <div\n                  class=\"xy-dot framesync\"\n                  :style=\"{ left: (xyPad.x - 6) + 'px', top: (xyPad.y - 6) + 'px' }\"\n                ></div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='MODULATION'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🌊 LFO <span class=\"framesync-accent\">Modulators</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <button class=\"framesync-button\" :class=\"{active: lfoOn}\" @click=\"lfoOn=!lfoOn\">{{ lfoOn ? 'ON' : 'OFF' }}</button>\n                  <button class=\"framesync-button\" @click=\"resetLfos\">↺ Reset</button>\n                </div>\n              </div>\n              <div class=\"lfo-grid\" style=\"margin-top:12px;\">\n                <div class=\"lfo-card\" v-for=\"lfo in lfos\" :key=\"'lfo-'+lfo.id\">\n                  <h4>\n                    <label class=\"switch\"><input type=\"checkbox\" v-model=\"lfo.on\"> LFO {{ lfo.id }}</label>\n                    <canvas :ref=\"el => lfoCanvasRefs[lfo.id] = el\" width=\"200\" height=\"60\" style=\"width:100%; height:60px; border-radius:4px; background:#031b2d;\"></canvas>\n                  </h4>\n                  <div class=\"meta\">Targets: {{ lfo.targets.join(', ') || 'none' }}</div>\n                  <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px;\">\n                    <div>\n                      <div class=\"framesync-subtitle\">Shape</div>\n                      <select class=\"framesync-select\" v-model=\"lfo.shape\">\n                        <option v-for=\"s in lfoShapes\" :key=\"s\" :value=\"s\">{{ s }}</option>\n                      </select>\n                    </div>\n                    <div>\n                      <div class=\"framesync-subtitle\">BPM</div>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"lfo.bpm\" min=\"20\" max=\"300\">\n                    </div>\n                    <div>\n                      <div class=\"framesync-subtitle\">Speed</div>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"lfo.speed\" min=\"0.1\" max=\"10\" step=\"0.1\">\n                    </div>\n                    <div>\n                      <div class=\"framesync-subtitle\">Depth</div>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"lfo.depth\" min=\"0\" max=\"1\" step=\"0.01\">\n                    </div>\n                  </div>\n                  <div style=\"margin-top:8px;\">\n                    <div class=\"framesync-subtitle\">Targets</div>\n                    <div style=\"display:flex; flex-wrap:wrap; gap:4px;\">\n                      <button class=\"framesync-button\" v-for=\"t in lfoTargets\" :key=\"'lt-'+t.key\" :class=\"{active: lfo.targets.includes(t.key)}\" @click=\"toggleLfoTarget(lfo, t.key)\" style=\"padding:2px 6px; font-size:9px;\">{{ t.label }}</button>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🥁 Beat <span class=\"framesync-accent\">Macros</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <button class=\"framesync-button\" :class=\"{active: beatMacroOn}\" @click=\"beatMacroOn=!beatMacroOn\">{{ beatMacroOn ? 'ON' : 'OFF' }}</button>\n                </div>\n              </div>\n              <div class=\"lfo-grid\" style=\"margin-top:12px;\">\n                <div class=\"lfo-card\" v-for=\"(m, idx) in macrosRack\" :key=\"'mac'+idx\">\n                  <h4>\n                    <label class=\"switch\"><input type=\"checkbox\" v-model=\"m.on\"> Macro {{ idx+1 }}</label>\n                  </h4>\n                  <div class=\"meta\">Target: {{ m.target || 'none' }} · {{ m.shape }}</div>\n                  <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px;\">\n                    <div>\n                      <div class=\"framesync-subtitle\">Target</div>\n                      <select class=\"framesync-select\" v-model=\"m.target\">\n                        <option value=\"\">None</option>\n                        <option v-for=\"t in lfoTargets\" :key=\"'mac'+t.key\" :value=\"t.key\">{{ t.label }}</option>\n                      </select>\n                    </div>\n                    <div>\n                      <div class=\"framesync-subtitle\">Shape</div>\n                      <select class=\"framesync-select\" v-model=\"m.shape\">\n                        <option v-for=\"s in [...lfoShapes, 'Noise']\" :key=\"s\" :value=\"s\">{{ s }}</option>\n                      </select>\n                    </div>\n                    <div>\n                      <div class=\"framesync-subtitle\">BPM</div>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"m.bpm\" min=\"20\" max=\"300\" style=\"font-size:11px; padding:4px;\">\n                    </div>\n                    <div>\n                      <div class=\"framesync-subtitle\">Depth</div>\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"m.depth\" min=\"0\" max=\"1\" step=\"0.01\" style=\"font-size:11px; padding:4px;\">\n                    </div>\n                  </div>\n                </div>\n                <button class=\"framesync-button\" @click=\"addMacro\" v-if=\"macrosRack.length<6\">➕ Add Macro</button>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='AUDIO'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🔊 Reference <span class=\"framesync-accent\">A/V sync</span></div>\n                <button class=\"framesync-button\" @click=\"avSyncCollapsed = !avSyncCollapsed\">{{ avSyncCollapsed ? '▼ Show' : '▲ Hide' }}</button>\n              </div>\n              <div v-if=\"!avSyncCollapsed\">\n              <div class=\"framesync-subtitle\" style=\"margin-top:8px;\">\n                Play the same track you use for modulation, locked to the HLS clock. If the music feels <em>ahead</em> of the pictures (normal for live HLS + encoder delay), raise <strong>Video lead</strong> until it lines up.\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Upload track</div>\n                  <input type=\"file\" accept=\"audio/*\" ref=\"audioFileInput\" @change=\"onAudioUpload\" class=\"framesync-input\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Video lead (sec)</div>\n                  <label class=\"framesync-checkbox\" style=\"margin-top:6px;\">\n                    <input type=\"checkbox\" data-testid=\"av-sync-enable\" v-model=\"avSyncEnabled\" :disabled=\"!audio.objectUrl\"> Enable sync (needs uploaded audio)\n                  </label>\n                  <input type=\"number\" data-testid=\"av-sync-lead\" class=\"framesync-input\" v-model.number=\"avSyncLeadSec\" min=\"0\" max=\"120\" step=\"0.25\" style=\"max-width:120px;\">\n                  <div class=\"framesync-subtitle\" style=\"margin-top:4px; font-size:10px;\">≈ encoder buffer + HLS fragments (often 2–10s).</div>\n                </div>\n              </div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🎵 Audio <span class=\"framesync-accent\">Reactive</span></div>\n                <button class=\"framesync-button\" @click=\"startAudioStream\">{{ audioStatus === 'Streaming' ? '⏹ Stop' : '▶ Start' }}</button>\n              </div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:8px;\">\n                Map frequency bands to parameters. Live audio from mic/system → frequency analysis → parameter modulation.\n              </div>\n              <div class=\"audio-map-grid\" style=\"margin-top:12px;\">\n                <div class=\"audio-map-card\" v-for=\"(m, idx) in audioMappings\" :key=\"'amap-'+idx\">\n                  <div style=\"display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;\">\n                    <div class=\"framesync-subtitle\" style=\"margin:0;\">{{ m.param || 'unassigned' }}</div>\n                    <button class=\"framesync-button\" style=\"padding:2px 6px; font-size:9px;\" @click=\"audioMappings.splice(idx,1)\">✕</button>\n                  </div>\n                  <div style=\"display:grid; gap:6px;\">\n                    <div class=\"framesync-subtitle\">Freq range</div>\n                    <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:6px;\">\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"m.freq_min\" min=\"20\" max=\"20000\" style=\"font-size:10px; padding:4px;\">\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"m.freq_max\" min=\"20\" max=\"20000\" style=\"font-size:10px; padding:4px;\">\n                    </div>\n                    <div class=\"framesync-subtitle\">Output range</div>\n                    <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:6px;\">\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"m.out_min\" step=\"any\" style=\"font-size:10px; padding:4px;\">\n                      <input type=\"number\" class=\"framesync-input\" v-model.number=\"m.out_max\" step=\"any\" style=\"font-size:10px; padding:4px;\">\n                    </div>\n                  </div>\n                </div>\n                <button class=\"framesync-button\" @click=\"audioMappings.push({param:'',freq_min:20,freq_max:200,out_min:0,out_max:1})\">+ Add mapping</button>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:10px;\">\n                <div class=\"framesync-subtitle\">Quick band presets</div>\n                <div style=\"display:flex; flex-wrap:wrap; gap:4px;\">\n                  <button class=\"framesync-button\" v-for=\"chip in audioBandChips\" :key=\"chip.key\" @click=\"applyAudioBandPreset(chip)\" style=\"padding:2px 6px; font-size:9px;\">{{ chip.label }}</button>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='RUNS'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">📁 Runs <span class=\"framesync-accent\">Browser</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <span style=\"font-size:11px; color:#7fb3d6;\">{{ runsFiltered.length }} / {{ runsAll.length }}</span>\n                  <button class=\"framesync-button\" @click=\"refreshRuns\">🔄 Refresh</button>\n                </div>\n              </div>\n\n              <!-- Filters -->\n              <div style=\"margin-top:12px; display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap:8px;\">\n                <input type=\"text\" class=\"framesync-input\" v-model.trim=\"runsFilter.search\" placeholder=\"Search (id, tag, model, prompt, notes)\" @input=\"applyRunsFilters\">\n                <select class=\"framesync-select\" v-model=\"runsFilter.status\" @change=\"applyRunsFilters\">\n                  <option value=\"\">All Status</option>\n                  <option value=\"completed\">Completed</option>\n                  <option value=\"failed\">Failed</option>\n                  <option value=\"running\">Running</option>\n                  <option value=\"queued\">Queued</option>\n                </select>\n                <input type=\"text\" class=\"framesync-input\" v-model.trim=\"runsFilter.tag\" placeholder=\"Filter by tag\" @input=\"applyRunsFilters\">\n                <input type=\"text\" class=\"framesync-input\" v-model.trim=\"runsFilter.model\" placeholder=\"Filter by model\" @input=\"applyRunsFilters\">\n              </div>\n\n              <!-- Sort controls -->\n              <div style=\"margin-top:8px; display:flex; gap:8px; align-items:center;\">\n                <span style=\"font-size:11px; color:#7fb3d6;\">Sort:</span>\n                <select class=\"framesync-select\" v-model=\"runsSort.field\" @change=\"applyRunsFilters\" style=\"max-width:140px;\">\n                  <option value=\"started_at\">Date</option>\n                  <option value=\"run_id\">Run ID</option>\n                  <option value=\"model\">Model</option>\n                  <option value=\"frame_count\">Frames</option>\n                  <option value=\"status\">Status</option>\n                  <option value=\"tag\">Tag</option>\n                </select>\n                <button class=\"framesync-button\" @click=\"runsSort.order = runsSort.order === 'desc' ? 'asc' : 'desc'; applyRunsFilters();\" style=\"padding:4px 10px;\">\n                  {{ runsSort.order === 'desc' ? '↓ Desc' : '↑ Asc' }}\n                </button>\n                <div style=\"flex:1;\"></div>\n                <button class=\"framesync-button\" @click=\"exportRuns('json')\" style=\"padding:4px 10px;\">📥 JSON</button>\n                <button class=\"framesync-button\" @click=\"exportRuns('csv')\" style=\"padding:4px 10px;\">📥 CSV</button>\n              </div>\n\n              <!-- Runs table -->\n              <div style=\"margin-top:12px; max-height:500px; overflow-y:auto; border:1px solid #0c3048; border-radius:8px;\">\n                <table style=\"width:100%; border-collapse:collapse; font-size:11px;\">\n                  <thead style=\"position:sticky; top:0; background:#0b1526; z-index:1;\">\n                    <tr style=\"border-bottom:1px solid #13233d;\">\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Thumb</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Run ID</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Status</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Model</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Frames</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Seed</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Tag</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Date</th>\n                      <th style=\"padding:8px; text-align:left; color:#7fb3d6; font-weight:600;\">Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr v-for=\"run in runsFiltered\" :key=\"run.run_id\" style=\"border-bottom:1px solid #0c3048;\" :class=\"{'runs-row-selected': runsSelected.includes(run.run_id)}\" @click=\"toggleRunSelect(run.run_id)\">\n                      <td style=\"padding:6px;\">\n                        <img v-if=\"run.has_thumbnail\" :src=\"`/api/runs/${run.run_id}/thumb`\" style=\"width:48px; height:48px; object-fit:cover; border-radius:4px;\" alt=\"\">\n                        <div v-else style=\"width:48px; height:48px; background:#0c3048; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#3a5a78; font-size:10px;\">No img</div>\n                      </td>\n                      <td style=\"padding:6px; font-family:monospace; font-size:10px;\">{{ run.run_id }}</td>\n                      <td style=\"padding:6px;\">\n                        <span class=\"status-chip\" :class=\"'status-' + run.status\">{{ run.status }}</span>\n                      </td>\n                      <td style=\"padding:6px; font-size:10px;\">{{ run.model || '-' }}</td>\n                      <td style=\"padding:6px; font-size:10px;\">{{ run.frame_count || run.length_frames || '-' }}</td>\n                      <td style=\"padding:6px; font-family:monospace; font-size:10px;\">{{ run.seed || '-' }}</td>\n                      <td style=\"padding:6px; font-size:10px;\">{{ run.tag || '-' }}</td>\n                      <td style=\"padding:6px; font-size:10px; color:#7fb3d6;\">{{ formatDate(run.started_at) }}</td>\n                      <td style=\"padding:6px;\">\n                        <button class=\"framesync-button\" style=\"padding:2px 6px; font-size:9px;\" @click.stop=\"showRunDetails(run)\" title=\"Details\">👁</button>\n                        <button class=\"framesync-button\" style=\"padding:2px 6px; font-size:9px;\" @click.stop=\"rerunRun(run)\" title=\"Rerun\">🔄</button>\n                        <button class=\"framesync-button\" style=\"padding:2px 6px; font-size:9px;\" @click.stop=\"deleteRun(run)\" title=\"Delete\">🗑</button>\n                      </td>\n                    </tr>\n                    <tr v-if=\"runsFiltered.length === 0\">\n                      <td colspan=\"9\" style=\"padding:20px; text-align:center; color:#7fb3d6; font-size:12px;\">\n                        No runs found. Adjust filters or refresh.\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n\n          <!-- Run details modal -->\n          <div v-if=\"runsDetailView\" style=\"margin-top:12px; border:1px solid #0c3048; border-radius:8px; background:#0b1526; padding:16px;\">\n            <div style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;\">\n              <div class=\"framesync-title\">📋 Run Details: <span style=\"font-family:monospace; font-size:12px;\">{{ runsDetailView.run_id }}</span></div>\n              <button class=\"framesync-button\" @click=\"runsDetailView = null\">✕ Close</button>\n            </div>\n            <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:11px;\">\n              <div>\n                <div class=\"framesync-subtitle\">Status</div>\n                <span class=\"status-chip\" :class=\"'status-' + runsDetailView.status\">{{ runsDetailView.status }}</span>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">Model</div>\n                <div>{{ runsDetailView.model || '-' }}</div>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">Frames</div>\n                <div>{{ runsDetailView.frame_count || runsDetailView.length_frames || '-' }}</div>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">Seed</div>\n                <div style=\"font-family:monospace;\">{{ runsDetailView.seed || '-' }}</div>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">Steps</div>\n                <div>{{ runsDetailView.steps || '-' }}</div>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">Strength</div>\n                <div>{{ runsDetailView.strength || '-' }}</div>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">CFG</div>\n                <div>{{ runsDetailView.cfg || '-' }}</div>\n              </div>\n              <div>\n                <div class=\"framesync-subtitle\">Tag</div>\n                <div>{{ runsDetailView.tag || '-' }}</div>\n              </div>\n              <div style=\"grid-column: span 2;\">\n                <div class=\"framesync-subtitle\">Positive Prompt</div>\n                <div style=\"max-height:80px; overflow-y:auto; font-size:10px; color:#cfe5f5;\">{{ runsDetailView.prompt_positive || '-' }}</div>\n              </div>\n              <div style=\"grid-column: span 2;\">\n                <div class=\"framesync-subtitle\">Negative Prompt</div>\n                <div style=\"max-height:80px; overflow-y:auto; font-size:10px; color:#cfe5f5;\">{{ runsDetailView.prompt_negative || '-' }}</div>\n              </div>\n              <div style=\"grid-column: span 2;\">\n                <div class=\"framesync-subtitle\">Notes</div>\n                <textarea class=\"framesync-input\" v-model=\"runsDetailView.notes\" style=\"min-height:60px; font-size:10px;\" placeholder=\"Add notes...\"></textarea>\n                <button class=\"framesync-button\" style=\"margin-top:6px; padding:4px 12px;\" @click=\"saveRunNotes(runsDetailView)\">💾 Save Notes</button>\n              </div>\n            </div>\n\n            <!-- Frame thumbnails -->\n            <div v-if=\"runsDetailView.frames && runsDetailView.frames.length\" style=\"margin-top:12px;\">\n              <div class=\"framesync-subtitle\">Frames ({{ runsDetailView.frames.length }})</div>\n              <div style=\"display:flex; flex-wrap:wrap; gap:4px; max-height:200px; overflow-y:auto;\">\n                <img v-for=\"f in runsDetailView.frames.slice(0, 50)\" :key=\"f\" :src=\"`/api/runs/${runsDetailView.run_id}/frames/${f}`\" style=\"width:64px; height:64px; object-fit:cover; border-radius:4px; border:1px solid #0c3048;\" :alt=\"f\">\n              </div>\n            </div>\n          </div>\n\n          <!-- Comparison view -->\n          <div v-if=\"runsSelected.length >= 2\" style=\"margin-top:12px; border:1px solid #0c3048; border-radius:8px; background:#0b1526; padding:16px;\">\n            <div style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;\">\n              <div class=\"framesync-title\">⚖️ Compare Runs ({{ runsSelected.length }})</div>\n              <div style=\"display:flex; gap:6px;\">\n                <button class=\"framesync-button\" style=\"padding:4px 10px; font-size:10px;\" @click=\"exportRunComparison('json')\">📥 JSON</button>\n                <button class=\"framesync-button\" style=\"padding:4px 10px; font-size:10px;\" @click=\"exportRunComparison('csv')\">📥 CSV</button>\n                <button class=\"framesync-button\" @click=\"runsSelected = []\">✕ Clear</button>\n              </div>\n            </div>\n            <div style=\"overflow-x:auto;\">\n              <table style=\"width:100%; border-collapse:collapse; font-size:10px;\">\n                <thead>\n                  <tr style=\"border-bottom:1px solid #13233d;\">\n                    <th style=\"padding:6px; text-align:left; color:#7fb3d6;\">Property</th>\n                    <th v-for=\"runId in runsSelected\" :key=\"runId\" style=\"padding:6px; text-align:left; color:#7fb3d6; font-family:monospace;\">{{ runId }}</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  <tr v-for=\"prop in runsCompareFields\" :key=\"prop\" style=\"border-bottom:1px solid #0c3048;\">\n                    <td style=\"padding:4px; color:#7fb3d6;\">{{ prop }}</td>\n                    <td v-for=\"runId in runsSelected\" :key=\"runId\" style=\"padding:4px; font-family:monospace;\">\n                      {{ getRunProp(runId, prop) }}\n                    </td>\n                  </tr>\n                </tbody>\n              </table>\n            </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='SETTINGS'\">\n          <div class=\"sub-pills\">\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='ENGINE'}\" @click=\"switchSubTab('SETTINGS','ENGINE')\">ENGINE</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='FORGE'}\" @click=\"switchSubTab('SETTINGS','FORGE')\">FORGE</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='MIDI'}\" @click=\"switchSubTab('SETTINGS','MIDI')\">MIDI</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='BINDINGS'}\" @click=\"switchSubTab('SETTINGS','BINDINGS')\">🔗 BINDINGS</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='PRESETS'}\" @click=\"switchSubTab('SETTINGS','PRESETS')\">PRESETS</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='GPUS'}\" @click=\"switchSubTab('SETTINGS','GPUS')\">🖥️ GPUS</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='COLLAB'}\" @click=\"switchSubTab('SETTINGS','COLLAB')\">👥 COLLAB</button>\n            <button class=\"sub-pill\" :class=\"{active: currentSubTab.SETTINGS==='KEYS'}\" @click=\"switchSubTab('SETTINGS','KEYS')\">⌨️ KEYS</button>\n          </div>\n          <div v-if=\"currentSubTab.SETTINGS==='ENGINE'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">⚙️ <span class=\"framesync-accent\">Engine</span></div>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Resolution</div>\n                  <select class=\"framesync-select\"><option>1024x576</option><option>1280x720</option></select>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">FPS</div>\n                  <select class=\"framesync-select\"><option>24</option><option selected>30</option><option>60</option></select>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Steps</div>\n                  <select class=\"framesync-select\"><option>24</option><option>30</option><option>40</option></select>\n                </div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                <button class=\"framesync-button\">Seed: 42490527</button>\n                <button class=\"framesync-button\">Sampler: DPM++ 2M Karras</button>\n              </div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='FORGE'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🔌 <span class=\"framesync-accent\">Connection</span></div>\n                <button class=\"framesync-button\" @click=\"refreshApiHealth\">🔄 Refresh</button>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: repeat(2, 1fr); gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">SD-Forge Host</div>\n                  <input class=\"framesync-input\" :value=\"forgeHost\" readonly>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Status</div>\n                  <div style=\"font-size:14px; color:#5af2a9; padding:6px 0;\">{{ apiHealth.sdForge?.available ? '✅ Connected' : '❌ Disconnected' }}</div>\n                </div>\n              </div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='MIDI'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🎹 Controllers <span class=\"framesync-accent\">(WebMIDI)</span></div>\n              </div>\n              <div v-if=\"!midi.supported\" style=\"color:#9bc4e2; margin-top:12px; font-size:12px;\">WebMIDI not supported or not enabled.</div>\n              <div v-else>\n                <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                  <button class=\"framesync-button\" v-for=\"d in midi.devices\" :key=\"d.id\" :class=\"{active: midi.selected===d.id}\" @click=\"midi.selected=d.id\">{{ d.name }}</button>\n                  <button class=\"framesync-button\" @click=\"scanMidi()\">Rescan</button>\n                </div>\n                <div class=\"framesync-footer\" style=\"margin-top:8px;\">\n                  <button class=\"framesync-button\">Learn mode</button>\n                  <button class=\"framesync-button\" @click=\"addMidiMapping\">+ Add Mapping</button>\n                  <button class=\"framesync-button\">Status: {{ midiStatus }}</button>\n                </div>\n                <div style=\"margin-top:12px; background:#031b2d; border:1px solid #0c3048; border-radius:8px; overflow:hidden;\">\n                  <table class=\"table\">\n                    <thead><tr><th>Control</th><th>CC</th><th>Target</th><th>Actions</th></tr></thead>\n                    <tbody>\n                      <tr v-for=\"(m, idx) in midi.mappings\" :key=\"'midi'+idx\">\n                        <td><input class=\"framesync-input\" v-model=\"m.control\" @change=\"saveMidiMappings\" style=\"width:100px; padding:4px;\"></td>\n                        <td><input class=\"framesync-input\" type=\"number\" v-model.number=\"m.cc\" @change=\"saveMidiMappings\" style=\"width:60px; padding:4px;\"></td>\n                        <td>\n                          <select class=\"framesync-select\" v-model=\"m.key\" @change=\"saveMidiMappings\" style=\"width:120px; padding:4px;\">\n                            <option value=\"\">None</option>\n                            <option v-for=\"t in lfoTargets\" :key=\"'mopt'+t.key\" :value=\"t.key\">{{ t.label }}</option>\n                          </select>\n                        </td>\n                        <td><button class=\"framesync-button\" @click=\"deleteMidiMapping(idx)\" style=\"padding:4px 8px; cursor:pointer;\">Delete</button></td>\n                      </tr>\n                    </tbody>\n                  </table>\n                </div>\n              </div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='BINDINGS'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🔗 Parameter <span class=\"framesync-accent\">Bindings</span></div>\n                <div style=\"display:flex; gap:8px; align-items:center;\">\n                  <button class=\"framesync-button\" :class=\"{active: bindingLearnMode}\" @click=\"toggleBindingLearn\">{{ bindingLearnMode ? '🔴 Stop Learn' : '🎯 Learn' }}</button>\n                  <button class=\"framesync-button\" @click=\"resetBindings\">↺ Defaults</button>\n                </div>\n              </div>\n              <div v-if=\"bindingLearnMode\" style=\"margin-top:8px; padding:8px 12px; background:#1a0a2e; border:1px solid #ff53d9; border-radius:6px; font-size:12px; color:#ff53d9;\">\n                Learn mode active. Press a key or move a MIDI controller, then click a parameter to bind.\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: repeat(2, 1fr); gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\" v-for=\"group in bindingGroups\" :key=\"group.label\">\n                  <div class=\"framesync-subtitle\">{{ group.label }}</div>\n                  <div style=\"background:#031b2d; border:1px solid #0c3048; border-radius:6px; overflow:hidden;\">\n                    <table style=\"width:100%; font-size:11px; border-collapse:collapse;\">\n                      <thead><tr style=\"color:#5a8fb8; border-bottom:1px solid #0c3048;\">\n                        <th style=\"text-align:left; padding:4px 8px;\">Parameter</th>\n                        <th style=\"text-align:left; padding:4px 8px;\">Key</th>\n                        <th style=\"text-align:left; padding:4px 8px;\">MIDI CC</th>\n                        <th style=\"padding:4px 8px;\">Actions</th>\n                      </tr></thead>\n                      <tbody>\n                        <tr v-for=\"t in group.items\" :key=\"t.key\" style=\"border-bottom:1px solid #0c3048;\">\n                          <td style=\"padding:4px 8px; color:#cfe5f5;\">{{ t.label }}</td>\n                          <td style=\"padding:4px 8px;\">\n                            <span v-if=\"getKeyBinding(t.key)\" style=\"display:inline-flex; align-items:center; gap:4px;\">\n                              <kbd style=\"background:#13233d; border:1px solid #2a4a6b; border-radius:3px; padding:2px 6px; font-family:monospace; font-size:10px; color:#5af2a9;\">{{ getKeyBinding(t.key) }}</kbd>\n                              <button style=\"border:none; background:transparent; color:#ff4d6d; cursor:pointer; padding:0; font-size:9px;\" @click=\"clearKeyBinding(t.key)\">✕</button>\n                            </span>\n                            <span v-else style=\"color:#3a5a78;\">—</span>\n                          </td>\n                          <td style=\"padding:4px 8px;\">\n                            <span v-if=\"getMidiBinding(t.key)\" style=\"display:inline-flex; align-items:center; gap:4px;\">\n                              <span style=\"background:#13233d; border:1px solid #2a4a6b; border-radius:3px; padding:2px 6px; font-size:10px; color:#fbbf24;\">CC {{ getMidiBinding(t.key) }}</span>\n                              <button style=\"border:none; background:transparent; color:#ff4d6d; cursor:pointer; padding:0; font-size:9px;\" @click=\"clearMidiBinding(t.key)\">✕</button>\n                            </span>\n                            <span v-else style=\"color:#3a5a78;\">—</span>\n                          </td>\n                          <td style=\"padding:4px 8px; text-align:center;\">\n                            <button v-if=\"bindingLearnMode\" class=\"framesync-button\" style=\"padding:2px 6px; font-size:9px;\" @click=\"bindingTargetKey=t.key\">Bind here</button>\n                          </td>\n                        </tr>\n                      </tbody>\n                    </table>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='PRESETS'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">💾 Preset <span class=\"framesync-accent\">Management</span></div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                <button class=\"framesync-button\" v-for=\"p in availablePresets\" :key=\"p\" :class=\"{active: currentPreset===p}\" @click=\"loadPreset(p)\">{{ p }}</button>\n                <button class=\"framesync-button\" @click=\"refreshPresets\">🔄 Refresh</button>\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div class=\"framesync-subtitle\">New preset name</div>\n                <input class=\"framesync-input\" v-model=\"newPresetName\" placeholder=\"my-preset\">\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:10px;\">\n                <button class=\"framesync-button\" @click=\"saveCurrentPreset\">💾 Save current as preset</button>\n                <button class=\"framesync-button\" v-if=\"currentPreset\" @click=\"deletePreset(currentPreset)\" style=\"border-color:#ff4d6d; color:#ff4d6d;\">🗑 Delete {{ currentPreset }}</button>\n              </div>\n              <div v-if=\"presetStatus\" class=\"framesync-subtitle\" style=\"margin-top:8px; text-align:center;\">{{ presetStatus }}</div>\n\n              <div class=\"framesync-header\" style=\"margin-top:20px; padding-top:12px; border-top:1px solid #13233d;\">\n                <div class=\"framesync-title\">🌐 Shared <span class=\"framesync-accent\">Presets</span></div>\n                <button class=\"framesync-button\" @click=\"refreshSharedPresets\">🔄 Refresh</button>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Share as</div>\n                  <input class=\"framesync-input\" v-model=\"sharedPresetName\" placeholder=\"shared-preset-name\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Your name</div>\n                  <input class=\"framesync-input\" v-model=\"collab.userName\" placeholder=\"Performer\" @change=\"saveCollabUserName\">\n                </div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:8px;\">\n                <button class=\"framesync-button\" @click=\"shareCurrentPreset\">📤 Share current state</button>\n              </div>\n              <ul v-if=\"sharedPresets.length\" class=\"framesync-list\" style=\"margin-top:10px; font-size:11px; padding-left:16px;\">\n                <li v-for=\"sp in sharedPresets\" :key=\"sp.name\" style=\"margin-bottom:6px; display:flex; flex-wrap:wrap; gap:6px; align-items:center;\">\n                  <strong>{{ sp.name }}</strong>\n                  <span style=\"color:#7fb3d6;\">by {{ sp.sharedBy }}</span>\n                  <button class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px;\" @click=\"loadSharedPreset(sp.name)\">Load</button>\n                  <button class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px; border-color:#ff4d6d; color:#ff4d6d;\" @click=\"deleteSharedPreset(sp.name)\">Delete</button>\n                </li>\n              </ul>\n              <div v-else style=\"margin-top:10px; font-size:11px; color:#7fb3d6;\">No shared presets yet.</div>\n              <div v-if=\"sharedPresetsStatus\" class=\"framesync-subtitle\" style=\"margin-top:8px;\">{{ sharedPresetsStatus }}</div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='GPUS'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\" data-testid=\"gpu-pool-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">🖥️ GPU <span class=\"framesync-accent\">Pool</span></div>\n                <label class=\"gpu-pool-enable\">\n                  <input type=\"checkbox\" v-model=\"gpuPool.enabled\" @change=\"saveGpuPoolSettings\">\n                  Load balancing\n                </label>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Strategy</div>\n                  <select class=\"framesync-select\" v-model=\"gpuPool.strategy\" @change=\"saveGpuPoolSettings\" :disabled=\"gpuPool.loading\">\n                    <option value=\"round_robin\">Round robin</option>\n                    <option value=\"least_busy\">Least busy</option>\n                    <option value=\"priority\">Priority</option>\n                    <option value=\"random\">Random</option>\n                  </select>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Healthy / total</div>\n                  <div style=\"font-size:13px; color:#5af2a9; padding:6px 0;\">{{ gpuPool.healthyNodes }} / {{ gpuPool.nodes.length }}</div>\n                </div>\n                <div class=\"framesync-stack\" style=\"justify-content:flex-end;\">\n                  <button class=\"framesync-button\" @click=\"refreshGpuPool(true)\" :disabled=\"gpuPool.loading\">🔄 Refresh stats</button>\n                </div>\n              </div>\n              <p style=\"font-size:11px; color:#7fb3d6; margin:12px 0 0;\">\n                Add SD-Forge (A1111 API) or ComfyUI instances. Disable a node to edit or remove it.\n                Generation load balancing uses enabled <strong>SD-Forge</strong> nodes for img2img/txt2img/Deforum.\n              </p>\n\n              <div class=\"gpu-pool-add\" style=\"margin-top:14px; padding:12px; border:1px solid #13233d; border-radius:10px;\">\n                <div class=\"framesync-subtitle\">Add instance (saved disabled — enable after editing)</div>\n                <div class=\"framesync-row\" style=\"grid-template-columns: 2fr 1fr 1fr; gap:8px; margin-top:8px;\">\n                  <input class=\"framesync-input\" v-model=\"gpuPool.draft.url\" placeholder=\"http://host:7860 or :8188\" :disabled=\"gpuPool.loading\">\n                  <input class=\"framesync-input\" v-model=\"gpuPool.draft.name\" placeholder=\"Name\" :disabled=\"gpuPool.loading\">\n                  <select class=\"framesync-select\" v-model=\"gpuPool.draft.backend\" :disabled=\"gpuPool.loading\">\n                    <option value=\"sd-forge\">SD-Forge</option>\n                    <option value=\"comfyui\">ComfyUI</option>\n                  </select>\n                </div>\n                <div class=\"framesync-footer\" style=\"margin-top:8px;\">\n                  <button class=\"framesync-button\" @click=\"addGpuNode\" :disabled=\"gpuPool.loading || !gpuPool.draft.url\">+ Add instance</button>\n                </div>\n              </div>\n\n              <div v-if=\"gpuPool.nodes.length\" class=\"gpu-pool-table-wrap\" style=\"margin-top:14px;\">\n                <table class=\"gpu-pool-table\">\n                  <thead>\n                    <tr>\n                      <th>Name</th>\n                      <th>Backend</th>\n                      <th>Status</th>\n                      <th>Model</th>\n                      <th>VRAM</th>\n                      <th>GPU %</th>\n                      <th>Jobs</th>\n                      <th>Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr v-for=\"n in gpuPool.nodes\" :key=\"n.id\" :class=\"{ 'gpu-row-disabled': !n.enabled }\">\n                      <td>\n                        <template v-if=\"gpuPool.editId === n.id\">\n                          <input class=\"framesync-input\" v-model=\"gpuPool.editDraft.name\" style=\"font-size:11px; margin-bottom:4px;\">\n                          <input class=\"framesync-input\" v-model=\"gpuPool.editDraft.url\" style=\"font-size:10px;\">\n                        </template>\n                        <template v-else>{{ n.name }}</template>\n                        <div style=\"font-size:9px; color:#5a8fb8; word-break:break-all;\">{{ n.url }}</div>\n                      </td>\n                      <td>\n                        <template v-if=\"gpuPool.editId === n.id\">\n                          <select class=\"framesync-select\" v-model=\"gpuPool.editDraft.backend\" style=\"font-size:11px;\">\n                            <option value=\"sd-forge\">SD-Forge</option>\n                            <option value=\"comfyui\">ComfyUI</option>\n                          </select>\n                        </template>\n                        <span v-else>{{ n.backend }}</span>\n                      </td>\n                      <td><span class=\"gpu-status-pill\" :class=\"'st-' + (n.enabled ? n.status : 'disabled')\">{{ n.enabled ? n.status : 'disabled' }}</span></td>\n                      <td style=\"max-width:140px; overflow:hidden; text-overflow:ellipsis;\" :title=\"n.currentModel || ''\">{{ n.currentModel || '—' }}</td>\n                      <td>{{ formatGpuMemory(n) }}</td>\n                      <td>{{ n.gpuUtilization != null ? n.gpuUtilization + '%' : '—' }}</td>\n                      <td>{{ n.activeJobs }}</td>\n                      <td>\n                        <div class=\"framesync-footer\" style=\"flex-wrap:wrap; gap:4px;\">\n                          <template v-if=\"n.enabled\">\n                            <button class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px;\" @click=\"disableGpuNode(n)\">Disable</button>\n                          </template>\n                          <template v-else>\n                            <button class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px;\" @click=\"enableGpuNode(n)\">Enable</button>\n                            <button v-if=\"gpuPool.editId !== n.id\" class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px;\" @click=\"startEditGpuNode(n)\">Edit</button>\n                            <button v-else class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px;\" @click=\"saveGpuNodeEdit(n)\">Save</button>\n                            <button class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px; border-color:#ff4d6d; color:#ff4d6d;\" @click=\"removeGpuNode(n)\">Remove</button>\n                          </template>\n                        </div>\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n              </div>\n              <div v-else style=\"margin-top:14px; font-size:12px; color:#7fb3d6;\">No GPU instances configured.</div>\n              <div v-if=\"gpuPool.status\" class=\"framesync-subtitle\" style=\"margin-top:10px;\">{{ gpuPool.status }}</div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='COLLAB'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">👥 <span class=\"framesync-accent\">Collaboration</span></div>\n                <span class=\"pill\" :style=\"wsStatus === 'connected' ? { color: 'var(--success)', borderColor: 'rgba(90,242,169,0.4)' } : {}\">{{ wsStatus === 'connected' ? 'WS connected' : 'WS ' + wsStatus }}</span>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Display name</div>\n                  <input class=\"framesync-input\" v-model=\"collab.userName\" @change=\"saveCollabUserName; collabIdentify()\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Your session ID</div>\n                  <input class=\"framesync-input\" :value=\"collab.userId || '—'\" readonly>\n                </div>\n              </div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:14px;\">Connected users ({{ collab.users.length }})</div>\n              <ul v-if=\"collab.users.length\" class=\"framesync-list\" style=\"font-size:11px; padding-left:16px; margin-top:6px;\">\n                <li v-for=\"u in collab.users\" :key=\"u.id\">\n                  {{ u.name }}\n                  <span v-if=\"u.lockedParams && u.lockedParams.length\" style=\"color:#fbbf24;\"> — locks: {{ u.lockedParams.join(', ') }}</span>\n                </li>\n              </ul>\n              <div v-else style=\"font-size:11px; color:#7fb3d6; margin-top:6px;\">Only you (open another browser tab to test multi-user).</div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:14px;\">Session recording</div>\n              <div class=\"framesync-footer\" style=\"margin-top:8px;\">\n                <button class=\"framesync-button\" :class=\"{active: collab.recording}\" @click=\"toggleSessionRecording\">\n                  {{ collab.recording ? '⏹ Stop recording' : '● Start recording' }}\n                </button>\n                <button class=\"framesync-button\" @click=\"listSessionRecordings\">📂 List recordings</button>\n              </div>\n              <ul v-if=\"collab.recordings.length\" class=\"framesync-list\" style=\"margin-top:8px; font-size:11px; padding-left:16px;\">\n                <li v-for=\"r in collab.recordings\" :key=\"r.filename\" style=\"display:flex; gap:8px; align-items:center;\">\n                  {{ r.filename }}\n                  <button class=\"framesync-button\" style=\"padding:2px 8px; font-size:10px;\" @click=\"playbackSessionRecording(r.filename)\">Play</button>\n                </li>\n              </ul>\n              <div v-if=\"collab.status\" class=\"framesync-subtitle\" style=\"margin-top:10px; color:#5af2a9;\">{{ collab.status }}</div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:14px;\">Parameter locks (click param label in LIVE drawer)</div>\n              <div v-if=\"Object.keys(collab.locks).length\" style=\"font-size:11px; margin-top:6px;\">\n                <span v-for=\"(who, param) in collab.locks\" :key=\"param\" class=\"pill\" style=\"margin:2px 4px 2px 0;\">\n                  {{ param }} → {{ who }}\n                  <button type=\"button\" style=\"border:none;background:transparent;color:#ff4d6d;cursor:pointer;margin-left:4px;\" @click=\"unlockParam(param)\">✕</button>\n                </span>\n              </div>\n              <div v-else style=\"font-size:11px; color:#7fb3d6; margin-top:6px;\">No active locks.</div>\n            </div>\n          </div>\n          </div>\n          <div v-else-if=\"currentSubTab.SETTINGS==='KEYS'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">⌨️ <span class=\"framesync-accent\">Keyboard Shortcuts</span></div>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: repeat(2, 1fr); gap:10px; margin-top:12px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Navigation</div>\n                  <div style=\"font-size:12px; color:var(--muted); line-height:1.8;\">\n                    <div><kbd>1</kbd>–<kbd>7</kbd> Switch tabs (LIVE→GENERATE)</div>\n                  </div>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">LIVE Tab</div>\n                  <div style=\"font-size:12px; color:var(--muted); line-height:1.8;\">\n                    <div><kbd>Space</kbd> Generate image</div>\n                    <div><kbd>R</kbd> Reset Vibe & Camera params</div>\n                  </div>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">PROMPTS Tab</div>\n                  <div style=\"font-size:12px; color:var(--muted); line-height:1.8;\">\n                    <div><kbd>M</kbd> Toggle prompt morphing</div>\n                  </div>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">MODULATION Tab</div>\n                  <div style=\"font-size:12px; color:var(--muted); line-height:1.8;\">\n                    <div><kbd>L</kbd> Toggle LFO</div>\n                    <div><kbd>B</kbd> Toggle Beat Macro</div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n          </div>\n        </div>\n\n        <div v-else-if=\"currentTab==='GENERATE'\">\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">⏱ Animation <span class=\"framesync-accent\">Sequencer</span></div>\n                <div class=\"pill\" :class=\"{'danger': sequencerPlaying}\">\n                  <span class=\"dot\"></span>{{ sequencerPlaying ? 'Playing' : 'Stopped' }}\n                </div>\n              </div>\n              <div class=\"framesync-row\" style=\"grid-template-columns: repeat(4, 1fr); gap:10px; margin-top:12px; align-items:end;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Duration (s)</div>\n                  <input type=\"number\" class=\"framesync-input\" v-model.number=\"sequencer.durationSec\" min=\"0.5\" max=\"600\" step=\"0.5\" @change=\"clampSequencerPlayhead\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">FPS</div>\n                  <input type=\"number\" class=\"framesync-input\" v-model.number=\"sequencer.fps\" min=\"1\" max=\"60\" step=\"1\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Loop</div>\n                  <label class=\"framesync-list\" style=\"display:flex; align-items:center; gap:8px; margin-top:6px;\"><input type=\"checkbox\" v-model=\"sequencer.loop\"> Repeat timeline</label>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">BPM Sync</div>\n                  <label class=\"framesync-list\" style=\"display:flex; align-items:center; gap:8px; margin-top:6px;\"><input type=\"checkbox\" v-model=\"sequencer.bpmSync\"> Sync to audio BPM</label>\n                </div>\n              </div>\n              <div v-if=\"sequencer.bpmSync\" class=\"framesync-row\" style=\"grid-template-columns: repeat(4, 1fr); gap:10px; margin-top:8px; align-items:end;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">BPM</div>\n                  <input type=\"number\" class=\"framesync-input\" v-model.number=\"sequencer.bpm\" min=\"20\" max=\"300\" step=\"0.1\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Bars</div>\n                  <input type=\"number\" class=\"framesync-input\" v-model.number=\"sequencer.bars\" min=\"1\" max=\"128\" step=\"1\">\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Beats/Bar</div>\n                  <select class=\"framesync-select\" v-model.number=\"sequencer.beatsPerBar\">\n                    <option value=\"4\">4/4</option>\n                    <option value=\"3\">3/4</option>\n                    <option value=\"6\">6/8</option>\n                  </select>\n                </div>\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Calculated</div>\n                  <div style=\"font-size:12px; color:#5af2a9; padding:6px 0;\">{{ sequencerCalculatedDuration }}s</div>\n                </div>\n              </div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:12px;\">Playhead (s)</div>\n              <input type=\"range\" class=\"framesync-input\" style=\"width:100%;\" min=\"0\" :max=\"Math.max(0.01, sequencer.durationSec)\" step=\"0.01\" v-model.number=\"sequencerPlayhead\" @input=\"previewSequencerFrame\">\n              <div v-if=\"Number(sequencer.durationSec) > 0\" style=\"position:relative; min-height:40px; margin-top:8px; border-radius:6px; background:#031b2d; border:1px solid #0c3048; overflow:visible;\" title=\"Scene markers (click to jump)\">\n                <div style=\"position:absolute; inset:0; border-radius:6px; background:linear-gradient(90deg, rgba(45,226,255,0.06), rgba(255,83,217,0.06)); pointer-events:none;\"></div>\n                <div v-for=\"(m, mi) in sortedSequencerMarkers\" :key=\"'mk-'+mi+'-'+(m.t || 0)\" style=\"position:absolute; top:4px; bottom:4px; width:0; transform:translateX(-50%); z-index:2;\" :style=\"{ left: (100 * (m.t / Math.max(1e-6, Number(sequencer.durationSec)))) + '%' }\">\n                  <button type=\"button\" class=\"framesync-button\" style=\"padding:2px 6px; font-size:9px; white-space:nowrap;\" @click=\"jumpToSequencerMarker(m)\">{{ m.name }}</button>\n                </div>\n                <div v-if=\"sortedSequencerMarkers.length === 0\" style=\"position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#3a5a78; font-size:11px;\">\n                  No markers yet\n                </div>\n                <div style=\"position:absolute; top:0; bottom:0; width:2px; background:#fff; z-index:3; pointer-events:none;\" :style=\"{ left: (100 * (sequencerPlayhead / Math.max(1e-6, Number(sequencer.durationSec)))) + '%' }\"></div>\n              </div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:12px;\">Scene markers</div>\n              <div style=\"display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:6px;\">\n                <input type=\"text\" class=\"framesync-input\" style=\"max-width:160px; font-size:11px;\" v-model.trim=\"sequencerMarkerName\" maxlength=\"48\" placeholder=\"Label\" title=\"1–48 chars: letters, digits, space, _ - .\">\n                <button type=\"button\" class=\"framesync-button\" @click=\"addSequencerMarker\">+ Marker @ playhead</button>\n              </div>\n              <div v-if=\"sortedSequencerMarkers.length\" style=\"font-size:11px; color:#7fb3d6;\">\n                <div v-for=\"(m, mi) in sortedSequencerMarkers\" :key=\"'mrow-'+mi+'-'+(m.t||0)\" style=\"display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap; padding:4px 6px; background:#031b2d; border-radius:4px;\">\n                  <button type=\"button\" class=\"framesync-button\" style=\"font-size:10px; padding:2px 6px;\" @click=\"jumpToSequencerMarker(m)\">{{ m.name }} @ {{ m.t.toFixed(2) }}s</button>\n                  <select class=\"framesync-input\" style=\"font-size:10px; max-width:100px; padding:2px 4px;\" :value=\"m.action || 'jump'\" @change=\"setMarkerAction(m, $event.target.value)\">\n                    <option value=\"jump\">↦ Jump</option>\n                    <option value=\"preset\">🎨 Preset</option>\n                    <option value=\"generate\">⏱ Generate</option>\n                    <option value=\"morph\">🔄 Morph</option>\n                    <option value=\"param\">🎛 Params</option>\n                    <option value=\"pause\">⏸ Pause</option>\n                  </select>\n                  <input v-if=\"m.action && m.action !== 'jump' && m.action !== 'generate' && m.action !== 'pause'\" type=\"text\" class=\"framesync-input\" style=\"font-size:10px; max-width:140px; padding:2px 4px;\" :value=\"m.target || ''\" :placeholder=\"markerActionPlaceholder(m.action)\" @change=\"setMarkerTarget(m, $event.target.value)\" :title=\"markerActionTitle(m.action)\">\n                  <span v-if=\"m.action === 'jump'\" style=\"font-size:9px; color:#5a8fb8;\">jump to time</span>\n                  <span v-if=\"m.action === 'generate'\" style=\"font-size:9px; color:#5a8fb8;\">trigger generation</span>\n                  <span v-if=\"m.action === 'pause'\" style=\"font-size:9px; color:#5a8fb8;\">pause playback</span>\n                  <button type=\"button\" style=\"border:none; background:transparent; color:#ff4d6d; cursor:pointer; padding:0;\" title=\"Remove\" @click=\"removeSequencerMarker(mi)\">✕</button>\n                </div>\n              </div>\n              <div v-else class=\"framesync-list\" style=\"font-size:11px; font-style:italic;\">No markers yet</div>\n              <div style=\"display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;\">\n                <button type=\"button\" class=\"framesync-button\" @click=\"toggleSequencerPlayback\">{{ sequencerPlaying ? '⏹ Stop' : '▶ Play' }}</button>\n                <button type=\"button\" class=\"framesync-button\" @click=\"previewSequencerFrame\">Preview frame</button>\n                <button type=\"button\" class=\"framesync-button\" @click=\"saveSequencerTimeline\">💾 Save</button>\n                <button type=\"button\" class=\"framesync-button\" @click=\"exportSequencerDownload\">⬇ Export JSON</button>\n                <select class=\"framesync-input\" style=\"max-width:160px; font-size:11px;\" v-model=\"sequencerLoadPick\" @change=\"loadSequencerTimeline\">\n                  <option value=\"\">Load saved…</option>\n                  <option v-for=\"n in sequencerList\" :key=\"'seq-'+n\" :value=\"n\">{{ n }}</option>\n                </select>\n              </div>\n              <div class=\"framesync-subtitle\" style=\"margin-top:14px;\">Tracks</div>\n              <div v-if=\"sequencer.tracks.length\" style=\"margin-top:8px; border:1px solid #0c3048; border-radius:8px; background:#031b2d; overflow:hidden;\">\n                <div style=\"padding:6px 10px; font-size:10px; color:#5a8fb8; border-bottom:1px solid #0c3048; display:flex; justify-content:space-between; align-items:center;\">\n                  <span>TIMELINE</span>\n                  <span>{{ sequencer.tracks.length }} track{{ sequencer.tracks.length > 1 ? 's' : '' }} · {{ sequencer.durationSec }}s</span>\n                </div>\n                <div style=\"position:relative;\" ref=\"timelineContainer\">\n                  <canvas ref=\"timelineCanvas\" style=\"width:100%; display:block; cursor:pointer;\" @click=\"seekTimeline\" @mousemove=\"hoverTimeline\"></canvas>\n                  <div v-if=\"timelineHoverTime !== null\" style=\"position:absolute; top:0; bottom:0; width:1px; background:rgba(255,255,255,0.3); pointer-events:none; z-index:3;\" :style=\"{ left: timelineHoverPercent + '%' }\"></div>\n                </div>\n              </div>\n              <div style=\"display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:8px;\">\n                <select class=\"framesync-input\" style=\"min-width:140px; font-size:11px;\" v-model=\"sequencerNewParam\">\n                  <option v-for=\"opt in sequencerParamOptions\" :key=\"'sp-'+opt.key\" :value=\"opt.key\">{{ opt.label }}</option>\n                </select>\n                <button type=\"button\" class=\"framesync-button\" @click=\"addSequencerTrack\">+ Track</button>\n                <span class=\"framesync-list\" style=\"font-size:11px;\">Keyframe value</span>\n                <input type=\"number\" class=\"framesync-input\" style=\"width:100px; font-size:11px;\" v-model.number=\"sequencerKeyframeVal\" step=\"any\">\n                <button type=\"button\" class=\"framesync-button\" @click=\"addSequencerKeyframe\">+ Keyframe @ playhead</button>\n              </div>\n              <div v-for=\"tr in sequencer.tracks\" :key=\"tr.id\" style=\"border:1px solid #0c3048; border-radius:8px; padding:10px; margin-bottom:8px; background:#031b2d;\">\n                <div style=\"display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;\">\n                  <strong style=\"color:#ff8a1a; font-size:13px;\">{{ tr.param }}</strong>\n                  <label style=\"font-size:11px; color:#9bc4e2;\">\n                    <input type=\"radio\" :value=\"tr.id\" v-model=\"sequencerSelectedTrackId\"> edit\n                  </label>\n                  <button type=\"button\" class=\"framesync-button\" style=\"padding:4px 8px; font-size:10px;\" @click=\"removeSequencerTrack(tr.id)\">Remove track</button>\n                </div>\n                <div style=\"font-size:11px; color:#7fb3d6; margin-top:6px;\">\n                  <span v-for=\"(kf, ki) in sortedKeyframes(tr)\" :key=\"tr.id+'-'+ki+'-'+(kf.t||0)\" style=\"display:inline-flex; align-items:center; gap:4px; margin-right:10px; flex-wrap:wrap;\">\n                    t={{ kf.t.toFixed(2) }} → {{ kf.v.toFixed(3) }}\n                    <select class=\"framesync-input\" style=\"font-size:10px; max-width:110px; padding:2px 4px;\" :value=\"kf.easing || 'linear'\" title=\"Easing to next keyframe\" @change=\"setKeyframeEasing(kf, $event.target.value)\">\n                      <option value=\"linear\">linear</option>\n                      <option value=\"easeIn\">easeIn</option>\n                      <option value=\"easeOut\">easeOut</option>\n                      <option value=\"easeInOut\">easeInOut</option>\n                    </select>\n                    <button type=\"button\" style=\"border:none; background:transparent; color:#ff4d6d; cursor:pointer; padding:0;\" title=\"Remove\" @click=\"removeSequencerKeyframe(tr.id, ki)\">✕</button>\n                  </span>\n                  <span v-if=\"!tr.keyframes.length\" style=\"font-style:italic;\">No keyframes</span>\n                </div>\n              </div>\n              <div v-if=\"sequencerStatus\" class=\"framesync-list\" style=\"margin-top:8px; color:#5af2a9;\">{{ sequencerStatus }}</div>\n            </div>\n          </div>\n\n          <!-- Generator Settings -->\n          <div class=\"rack\">\n            <div class=\"framesync-panel\">\n              <div class=\"framesync-header\">\n                <div class=\"framesync-title\">✨ Story <span class=\"framesync-accent\">Generator</span></div>\n                <button class=\"framesync-button\" :disabled=\"generator.isGenerating\" @click=\"generateStory\" style=\"min-width:120px;\">\n                  {{ generator.isGenerating ? '⏳ Generating…' : '▶ Generate' }}\n                </button>\n              </div>\n              <div class=\"framesync-stack\" style=\"margin-top:12px;\">\n                <div class=\"framesync-subtitle\">Theme / Story concept</div>\n                <input class=\"framesync-input\" v-model=\"generator.theme\" placeholder=\"e.g. A Space Traveler, Ancient Forest, Cyberpunk City…\" style=\"width:100%;\">\n              </div>\n              <div style=\"display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;\">\n                <div class=\"framesync-stack\">\n                  <div class=\"framesync-subtitle\">Style preset</div>\n                  <select class=\"framesync-select\" v-model=\"generator.stylePreset\">\n                    <option value=\"Masterpiece, Realistic\">Masterpiece Realistic</option>\n                    <option value=\"Masterpiece, Cinematic\">Cinematic</option>\n                    <option value=\"Masterpiece, best quality, anime\">Anime</option>\n                    <option value=\"oil painting, impressionism\">Oil Painting</option>\n                    <option value=\"digital art, concept art, surrealistic\">Surrealist</option>\n                    <option value=\"watercolor, illustration\">Watercolor</option>\n                    <option value=\"custom\">Custom…</option>\n                  </select>\n                </div>\n                <div class=\"framesync-stack\" v-if=\"generator.stylePreset === 'custom'\">\n                  <div class=\"framesync-subtitle\">Custom style</div>\n                  <input class=\"framesync-input\" v-model=\"generator.customStyle\" placeholder=\"your style keywords\">\n                </div>\n              </div>\n              <div class=\"framesync-footer\" style=\"margin-top:12px;\">\n                <button class=\"framesync-button\" @click=\"generateStory\">▶ Generate Story</button>\n                <button class=\"framesync-button\" @click=\"generateImage\">🖼 Generate Image</button>\n              </div>\n              <div v-if=\"generator.status\" class=\"framesync-subtitle\" style=\"margin-top:8px; text-align:center;\">{{ generator.status }}</div>\n              <div v-if=\"generator.lastPath\" :style=\"storyResultCollapsed ? '' : 'margin-top:12px;'\">\n                <div class=\"framesync-header\" style=\"margin-bottom:8px;\">\n                  <div class=\"framesync-subtitle\" style=\"margin:0;\">Result</div>\n                  <button class=\"framesync-button\" @click=\"storyResultCollapsed = !storyResultCollapsed\">{{ storyResultCollapsed ? '▼ Show' : '▲ Hide' }}</button>\n                </div>\n                <div v-if=\"!storyResultCollapsed\">\n                  <img v-if=\"generator.lastPath\" :src=\"generator.lastPath\" style=\"width:100%; border-radius:8px; border:1px solid #0c3048;\">\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <!-- Bottom context panel -->\n    <div class=\"context\">\n      <div v-if=\"currentTab==='LIVE'\">\n        <h4>Performance</h4>\n        <div class=\"chips\">\n          <span class=\"chip\">Crossfader: {{ performance.crossfader.toFixed(2) }}</span>\n          <span class=\"chip\">Slots: {{ performance.slots.length }}</span>\n          <span class=\"chip\">Model: {{ modelStatusLabel }}</span>\n        </div>\n        <h4 style=\"margin-top:12px;\">Beat & MIDI status</h4>\n        <div style=\"display:flex; gap:12px; flex-wrap:wrap;\">\n          <div style=\"min-width:240px;\">\n            <strong>Beat macros ({{ macrosRack.length }})</strong>\n            <div v-for=\"m in macrosRack\" :key=\"m.target\" style=\"font-size:12px; color:var(--muted);\">\n              • {{ m.target }} – {{ m.shape }} @ {{ m.speed }} – Depth {{ (m.depth*100).toFixed(0) }}%\n            </div>\n          </div>\n          <div style=\"min-width:240px;\">\n            <strong>MIDI mappings</strong>\n            <div style=\"font-size:12px; color:var(--muted);\">\n              • LaunchControl CC21 → Vibe<br/>\n              • LaunchControl CC22 → Strength<br/>\n              • LaunchControl CC23 → Zoom\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div v-else-if=\"currentTab==='PROMPTS'\">\n        <h4>Prompts & Parameters</h4>\n        <div v-if=\"currentSubTab.PROMPTS==='PROMPTS'\">\n          <table class=\"table\">\n            <thead><tr><th>ID</th><th>On</th><th>Name</th><th>A prompt</th><th>B prompt</th><th>Range</th></tr></thead>\n            <tbody>\n              <tr v-for=\"slot in morphSlots\" :key=\"slot.id\">\n                <td>{{ slot.id }}</td>\n                <td>{{ slot.on ? '●' : '○' }}</td>\n                <td>{{ slot.name }}</td>\n                <td>{{ slot.a }}</td>\n                <td>{{ slot.b }}</td>\n                <td>{{ slot.range }}</td>\n              </tr>\n            </tbody>\n          </table>\n          <div class=\"chips\"><span class=\"chip\">+ Add morph</span><span class=\"chip\">Copy from preset</span></div>\n        </div>\n        <div v-else-if=\"currentSubTab.PROMPTS==='LORA'\">\n          <div class=\"chips\">\n            <span class=\"chip\">LoRA: {{ loras.groupA.length }}A / {{ loras.groupB.length }}B</span>\n            <span class=\"chip\">Crossfader: {{ prompts.crossfaderValue.toFixed(2) }}</span>\n          </div>\n        </div>\n        <div v-else-if=\"currentSubTab.PROMPTS==='CONTROLNET'\">\n          <div class=\"chips\">\n            <span class=\"chip\">ControlNet: {{ cn.active }}</span>\n            <span class=\"chip\">Slots: {{ cn.slots.length }}</span>\n          </div>\n        </div>\n      </div>\n\n      <div v-else-if=\"currentTab==='MOTION'\">\n        <h4>Sequencer status</h4>\n        <div class=\"chips\">\n          <span class=\"chip\" v-for=\"(s, name) in motionStylesSaved\" :key=\"'ctx-saved-'+name\">💾 {{ name }}</span>\n          <span class=\"chip\">Tracks: {{ sequencer.tracks.length }}</span>\n          <span class=\"chip\">Markers: {{ sequencer.markers?.length || 0 }}</span>\n        </div>\n      </div>\n\n      <div v-else-if=\"currentTab==='MODULATION'\">\n        <h4>Modulation</h4>\n        <div class=\"chips\">\n          <span class=\"chip\" v-for=\"(m, idx) in macrosRack.filter(x => x.on)\" :key=\"'ctx-mac'+idx\">Macro {{ idx+1 }}: {{ m.target }} ({{ m.shape }})</span>\n          <span class=\"chip\">LFOs: {{ lfos.filter(l => l.on).length }}/{{ lfos.length }}</span>\n        </div>\n      </div>\n\n      <div v-else-if=\"currentTab==='AUDIO'\">\n        <h4>Audio</h4>\n        <div v-if=\"audio.uploadedFile\" style=\"margin-top:8px;\">\n          <div class=\"chips\">\n            <span class=\"chip\">File: {{ audio.uploadedFile }}</span>\n            <span class=\"chip\">BPM: {{ audio.bpm }}</span>\n          </div>\n          <div style=\"margin-top:8px;\">\n            <img v-if=\"audioSpectrogramDataUrl\" :src=\"audioSpectrogramDataUrl\" class=\"spectral-preview\" alt=\"Spectrogram\">\n          </div>\n        </div>\n      </div>\n\n      <div v-else-if=\"currentTab==='SETTINGS'\">\n        <h4>Settings</h4>\n        <div v-if=\"currentSubTab.SETTINGS==='MIDI'\">\n          <table class=\"table\">\n            <thead><tr><th>Control</th><th>CC</th><th>Target</th></tr></thead>\n            <tbody>\n              <tr v-for=\"m in midi.mappings\" :key=\"m.control+'ctx'\">\n                <td>{{ m.control }}</td>\n                <td>{{ m.cc }}</td>\n                <td>\n                  <select class=\"select\" v-model=\"m.key\" @change=\"updateMidiMapping(m)\">\n                    <option value=\"\">None</option>\n                    <option v-for=\"t in lfoTargets\" :key=\"'map'+t.key\" :value=\"t.key\">{{ t.label }}</option>\n                  </select>\n                </td>\n              </tr>\n            </tbody>\n          </table>\n        </div>\n      </div>\n\n      <div v-else-if=\"currentTab==='GENERATE'\">\n        <h4>Generator</h4>\n        <div class=\"chips\">\n          <span class=\"chip\">Theme: {{ generator.theme || '—' }}</span>\n          <span class=\"chip\">Style: {{ generator.stylePreset }}</span>\n        </div>\n      </div>\n    </div>\n  </div>",
  name: 'App',
  data() {
    return {
       showFrames: true,
       isPlaying: false,
       isRecording: false,
       deforumPlaying: false,
       previewGenerating: false,
       previewDebounceTimer: null,
       framesRefreshBackoffMs: 5000,
       apiHealthBackoffMs: 15000,
       paramPanelOpen: false,
       deforumPanelOpen: false,
       deforumSettings: { ...DEFORUM_DEFAULT_SETTINGS },
       deforumFieldGroups: DEFORUM_FIELD_GROUPS,
       deforumSectionOpen: {},
       deforumAdvancedOpen: false,
       deforumSettingsJson: '',
       deforumSettingsJsonError: '',
       deforumSettingsStatus: '',
       deforumSaveTimer: null,
       deforumPreviewTimer: null,
       crossfadeSlotTypes: CROSSFADE_SLOT_TYPES,
       performance: {
         genericPrompt: '',
         crossfader: 0.5,
         newSlotType: 'prompt',
         slots: [],
         status: '',
         lastPreviewPath: null,
       },
       forge: {
         host: typeof process !== 'undefined' && process.env && process.env.SD_FORGE_HOST ? process.env.SD_FORGE_HOST : '192.168.2.102',
         port: typeof process !== 'undefined' && process.env && process.env.SD_FORGE_PORT ? process.env.SD_FORGE_PORT : '7860',
         available: false,
         loading: false,
         switching: false,
         models: [],
         modelsSource: '',
         currentModel: '',
         selectedModel: '',
         lastModel: '',
         modelInfo: null,
         samplers: [],
         schedulers: [],
         vaeList: [],
         options: {},
       },
       streamUrl: "",
       lfoOn: true,
      beatMacroOn: true,
      apiHealth: { sdForge: null },
      forgeHost: process.env.SD_FORGE_HOST || '192.168.2.102',
      availablePresets: [],
      currentPreset: null,
      newPresetName: '',
      presetStatus: '',
      sharedPresets: [],
      sharedPresetName: '',
      sharedPresetBy: '',
      sharedPresetsStatus: '',
      collab: {
        userId: null,
        userName: typeof localStorage !== 'undefined' ? (localStorage.getItem('defora_user_name') || 'Performer') : 'Performer',
        users: [],
        locks: {},
        recording: false,
        recordings: [],
        status: '',
      },
      gpuPool: {
        enabled: false,
        strategy: 'round_robin',
        healthyNodes: 0,
        nodes: [],
        loading: false,
        status: '',
        draft: { url: '', name: '', backend: 'sd-forge', priority: 1 },
        editId: null,
        editDraft: { name: '', url: '', backend: 'sd-forge', priority: 1 },
      },
      generator: {
        theme: '',
        stylePreset: 'Masterpiece, Realistic',
        customStyle: '',
        isGenerating: false,
        status: '',
        lastPath: null,
      },
      session: "clown_set_01",
      tabs: [
        { id: "LIVE", label: "LIVE" },
        { id: "PROMPTS", label: "PROMPTS" },
        { id: "MOTION", label: "MOTION" },
        { id: "MODULATION", label: "MODULATION" },
        { id: "AUDIO", label: "AUDIO" },
        { id: "RUNS", label: "RUNS" },
        { id: "SETTINGS", label: "SETTINGS" },
        { id: "GENERATE", label: "GENERATE" },
      ],
      currentTab: "LIVE",
      currentSubTab: { PROMPTS: 'PROMPTS', SETTINGS: 'ENGINE' },
      stats: { fps: 27, lat: 120 },
      hud: { seed: 42490527 },
      timecode: "00:00.00",
      liveVibe: [
        { key: "cfg", label: "Vibe (CFG)", val: 0.63, min: 0, max: 1.5, step: 0.01 },
        { key: "strength", label: "Strength", val: 0.78, min: 0, max: 1.5, step: 0.01 },
        { key: "noise", label: "Noise/Glitch", val: 0.2, min: 0, max: 1, step: 0.01 },
        { key: "cfgscale", label: "CFG scale", val: 5.0, min: 0, max: 15, step: 0.1 },
      ],
      liveCam: [
        { key: "zoom", label: "Zoom", val: 0.8, min: -5, max: 5, step: 0.05, sourceable: true },
        { key: "panx", label: "Pan X", val: 0.1, min: -1, max: 1, step: 0.05, sourceable: false },
        { key: "pany", label: "Pan Y", val: 0.0, min: -1, max: 1, step: 0.05, sourceable: false },
        { key: "tilt", label: "Tilt / Rotate", val: 0.0, min: -180, max: 180, step: 0.5, sourceable: false },
      ],
      paramSources: {
        cfg: "Manual",
        strength: "Manual",
        noise: "Beat",
        cfgscale: "Manual",
        zoom: "Beat",
      },
      prompts: { pos: "", neg: "", morphOn: true, crossfaderValue: 0.5, morphBlend: 0.5 },
      img2img: {
        show: false,
        dataUrl: null,
        maskDataUrl: null,
        maskBlur: 4,
        inpaintingFill: 1,
        inpaintFullRes: true,
        denoisingStrength: 0.55,
        width: 1024,
        height: 1024,
        status: "",
        lastPath: null,
      },
      pluginsRegistry: [],
      morphSlots: [
        { id: 1, on: true, name: "clean → mad", a: "clean evil", b: "mad clown", range: "0.40–1.00", weight: 1 },
        { id: 2, on: true, name: "box → tunnel", a: "small box", b: "neon tunnel", range: "0.00–0.60", weight: 1 },
        { id: 3, on: false, name: "style fade", a: "photographic", b: "anime render", range: "0.20–0.80", weight: 1 },
      ],
      loras: {
        available: [],
        groupA: [],
        groupB: [],
        source: "unknown",
      },
      motionPresets: {
        Static: { translation_z: 0, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0 },
        Orbit: { translation_z: 2, rotation_y: 15, translation_x: 0, translation_y: 0, rotation_z: 0 },
        Tunnel: { translation_z: 5, translation_x: 0, translation_y: 0, rotation_z: 0, rotation_y: 0 },
        Handheld: { translation_z: 0.5, translation_x: 0.2, translation_y: 0.1, rotation_z: 2, rotation_y: 0 },
        Chaos: { translation_z: 1.5, translation_x: 0.5, translation_y: 0.3, rotation_z: 5, rotation_y: 10 }
      },
      motionStyles: ["Calm", "Travel", "Spin", "Handheld", "Chaos"],
      motionStylesSaved: {},
      xyPad: { x: 0, y: 0, dragging: false, padSize: 140 },
      audio: { track: "", bpm: 114.8, uploadedFile: null, objectUrl: null },
      audioSpectrogramDataUrl: null,
      audioSpectrogramStatus: "",
      _spectrogramGen: 0,
      avSyncEnabled: false,
      avSyncLeadSec: 4,
      audioStatus: "Idle",
      audioMappings: [
        { param: "strength", freq_min: 20, freq_max: 300, out_min: 0, out_max: 1.5 },
        { param: "cfg", freq_min: 300, freq_max: 1200, out_min: 0, out_max: 30 },
        { param: "translation_z", freq_min: 1200, freq_max: 3000, out_min: -5, out_max: 5 },
      ],
      audioBandPresets: {
        sub: { label: "Sub", freq_min: 20, freq_max: 60 },
        bass: { label: "Bass", freq_min: 60, freq_max: 250 },
        lowmid: { label: "Lo-mid", freq_min: 250, freq_max: 500 },
        mid: { label: "Mid", freq_min: 500, freq_max: 2000 },
        high: { label: "High", freq_min: 2000, freq_max: 8000 },
        air: { label: "Air", freq_min: 8000, freq_max: 16000 },
      },
      lfoBpm: 120,
      lfoTargets: [
        { key: "cfg", label: "Vibe (CFG)", min: 0, max: 30, default: 6, group: "Style" },
        { key: "strength", label: "Strength", min: 0, max: 1.5, default: 0.7, group: "Style" },
        { key: "noise_multiplier", label: "Noise/Glitch", min: 0, max: 3, default: 1.0, group: "Style" },
        { key: "translation_z", label: "Zoom", min: -10, max: 10, default: 0, group: "Camera" },
        { key: "translation_x", label: "Pan X", min: -10, max: 10, default: 0, group: "Camera" },
        { key: "translation_y", label: "Pan Y", min: -10, max: 10, default: 0, group: "Camera" },
        { key: "rotation_y", label: "Rotate Y", min: -180, max: 180, default: 0, group: "Camera" },
        { key: "rotation_z", label: "Tilt", min: -180, max: 180, default: 0, group: "Camera" },
        { key: "fov", label: "FOV", min: 1, max: 180, default: 70, group: "Camera" },
        { key: "cn_CN1_weight", label: "CN1 Weight", min: 0, max: 2, default: 0.4, group: "ControlNet" },
        { key: "cn_CN2_weight", label: "CN2 Weight", min: 0, max: 2, default: 0.4, group: "ControlNet" },
        { key: "cn_CN3_weight", label: "CN3 Weight", min: 0, max: 2, default: 0.4, group: "ControlNet" },
        { key: "cn_CN1_start", label: "CN1 Start", min: 0, max: 1, default: 0, group: "ControlNet" },
        { key: "cn_CN2_start", label: "CN2 Start", min: 0, max: 1, default: 0, group: "ControlNet" },
        { key: "cn_CN1_end", label: "CN1 End", min: 0, max: 1, default: 0.9, group: "ControlNet" },
        { key: "cn_CN2_end", label: "CN2 End", min: 0, max: 1, default: 0.9, group: "ControlNet" },
      ],
      lfoShapes: ["Sine", "Triangle", "Saw", "Square"],
      lfos: Array.from({ length: 6 }).map((_, idx) => ({
        id: idx + 1,
        on: idx === 0,
        targets: idx === 0 ? ["cfg"] : [],
        shape: "Sine",
        bpm: 120,
        speed: 1.0,
        depth: 0.1,
        base: null,
        phase: 0,
      })),
      macrosRack: [
        { id: "macro-0", on: true, target: "cfg", shape: "Sine", bpm: 120, depth: 0.7, offset: 0.1, show: true },
        { id: "macro-1", on: true, target: "translation_z", shape: "Saw", bpm: 90, depth: 0.6, offset: 0.2, show: false },
        { id: "macro-2", on: false, target: "noise_multiplier", shape: "Noise", bpm: 140, depth: 0.3, offset: 0.0, show: false },
        ],
      framesync: {
        presets: ["Basic Strength Schedule", "Basic Noise Schedule", "Basic Init"],
        factoryPresets: ["Basic Strength Schedule", "Basic Noise Schedule", "Basic Init"],
        selectedPreset: "Basic Strength Schedule",
        primaryWave: "Cosine",
        waveShapes: ["Cosine", "Sine", "Saw", "Triangle", "Square", "Noise"],
        amplitude: 1,
        shift: 0,
        bend: 1,
        noise: 0,
        fps: 24,
        frameCount: 120,
        bpm: 120,
        shiftFrames: 0,
        syncRates: ["1", "1/2", "1/4", "1/8", "1/16", "1/32", "2", "4", "8"],
        syncRate: "1/4",
        decimals: 2,
        metrics: [
          { label: "Max", value: "1.00", sub: "32bars" },
          { label: "Min", value: "-1.00", sub: "16bars" },
          { label: "Avg", value: "0.00", sub: "4bars" },
          { label: "Abs Avg", value: "0.63", sub: "1bar" },
          { label: "Duration", value: "5.00s", sub: "1/2" },
        ],
        timingTable: [
          { label: "32bar", time: "58.0s", frames: "1392.0" },
          { label: "16bar", time: "28.0s", frames: "768.0" },
          { label: "8bar", time: "16.0s", frames: "384.0" },
          { label: "4bar", time: "8.0s", frames: "192.0" },
          { label: "2bar", time: "4.0s", frames: "96.0" },
          { label: "1bar", time: "2.0s", frames: "48.0" },
          { label: "1/2", time: "1.0s", frames: "24.0" },
        ],
        featureCoverage: [
          "Wave presets",
          "LFO modulation",
          "Audio-driven sync",
          "Tempo & shift",
          "Metrics + timing table",
          "Preset import/export"
        ],
      },
      cn: {
        slots: [
          { id: "CN1", label: "CN1", model: "Canny", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN2", label: "CN2 •", model: "Depth", weight: 0.4, start: 0, end: 0.9, enabled: true, imageSource: "file" },
          { id: "CN3", label: "CN3", model: "Pose", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN4", label: "CN4", model: "Tile", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
          { id: "CN5", label: "CN5", model: "Control", weight: 0.4, start: 0, end: 0.9, enabled: false, imageSource: "file" },
        ],
        active: "CN2",
        availableModels: [],
        source: "unknown",
        webcamActive: false,
        webcamStream: null,
        webcamVideo: null,
        webcamCanvas: null,
        webcamCaptureInterval: null,
      },
      webcamCaptureRate: 500,
      midi: {
        supported: typeof navigator !== 'undefined' && !!navigator.requestMIDIAccess,
        devices: [],
        selected: null,
        mappings: [
          { control: "LaunchControl CC21", cc: 21, key: "cfg" },
          { control: "LaunchControl CC22", cc: 22, key: "strength" },
          { control: "LaunchControl CC23", cc: 23, key: "cfgscale" },
        ],
      },
      keyBindings: {
        "translation_z": "w",
        "translation_x": "a",
        "translation_y": "s",
        "rotation_y": "d",
        "rotation_z": "q",
        "fov": "e",
        "cfg": "z",
        "strength": "x",
        "noise_multiplier": "c",
      },
      bindingLearnMode: false,
      bindingTargetKey: null,
      bindingLearnTimeout: null,
      midiStatus: "Ready",
      ws: null,
      wsStatus: "disconnected",
      streamSrc: "/hls/live/deforum.m3u8",
      thumbs: [],
      framesTimer: null,
      playerEl: null,
      timeHandler: null,
      hls: null,
      liveParamTimers: {},
      liveParamPending: {},
      lastParamSent: {},
      controlDelayMs: 75,
      errorHandler: null,
      playbackTimer: null,
      lfoTimer: null,
      lastLfoTick: null,
      beatTimer: null,
      lastBeatTime: null,
      beatCount: 0,
      beatPhase: 0,
      lastMacroTrigger: {},
      sequencer: { version: 1, durationSec: 8, fps: 24, loop: true, tracks: [], markers: [], bpmSync: false, bpm: 120, bars: 4, beatsPerBar: 4 },
      sequencerPlayhead: 0,
      sequencerPlaying: false,
      sequencerTimer: null,
      sequencerSaveName: "default_clip",
      sequencerLoadPick: "",
      sequencerList: [],
      sequencerStatus: "",
      sequencerNewParam: "translation_x",
      sequencerKeyframeVal: 0,
      sequencerMarkerName: "Scene",
      sequencerSelectedTrackId: null,
      timelineHoverTime: null,
      timelineHoverPercent: 0,
      timelineCanvasCtx: null,
      lfoTargetPick: {},
      avSyncCollapsed: true,
      morphCollapsed: true,
      forgeAdvancedCollapsed: true,
      storyResultCollapsed: false,
       lfoCanvasRefs: {},
       _lfoAnimFrame: null,
       runsAll: [],
       runsFiltered: [],
       runsFilter: { search: "", status: "", tag: "", model: "" },
       runsSort: { field: "started_at", order: "desc" },
       runsSelected: [],
       runsCompareFields: [
         'status', 'model', 'frame_count', 'seed', 'steps', 'strength', 'cfg', 'tag',
         'prompt_positive', 'prompt_negative', 'notes',
       ],
       runsDetailView: null,
       runsStatus: "",
       genData: {
         defaultThemes: ['A journey through light', 'Neon cathedral', 'Ocean depths'],
         sceneDescriptors: { opening: ['ethereal', 'quiet'], buildup: ['rising', 'vivid'], climax: ['intense', 'surreal'], closing: ['soft', 'fading'] },
         environments: [['forest', 'meadow'], ['city', 'alley'], ['space', 'nebula']],
         lighting: ['golden hour', 'neon rim light', 'moonlit'],
         quality: ['masterpiece', 'best quality'],
         techSpecs: ['8k', 'sharp focus'],
         artists: { default: ['artgerm', 'greg rutkowski'], 'Masterpiece, Realistic': ['photorealistic'] },
         negatives: ['blurry', 'low quality'],
         cameraBehaviors: ['STATIC', 'ORBIT', 'TUNNEL'],
       },
     };
  },
  computed: {
    modelStatusKind() {
      if (this.forge.switching || this.forge.loading) return 'loading';
      if (this.forge.available || (this.apiHealth.sdForge && this.apiHealth.sdForge.available)) return 'ready';
      return 'offline';
    },
    modelStatusLabel() {
      if (this.modelStatusKind === 'loading') return 'Loading';
      if (this.modelStatusKind === 'ready') return 'Ready';
      return 'Offline';
    },
    paramPanelGroups() {
      return [
        { label: 'Style', items: this.liveVibe },
        { label: 'Camera', items: this.liveCam },
      ];
    },
    activeSlot() {
      return this.cn.slots.find((s) => s.id === this.cn.active) || this.cn.slots[0];
    },
    lfoTargetGroups() {
      const groups = {};
      this.lfoTargets.forEach((target) => {
        const label = target.group || "Other";
        if (!groups[label]) groups[label] = [];
        groups[label].push(target);
      });
      return Object.entries(groups).map(([label, items]) => ({ label, items }));
    },
    sequencerParamOptions() {
      const opts = this.lfoTargets.map((t) => ({ key: t.key, label: t.label }));
      this.cn.slots.forEach((s) => {
        opts.push({ key: `cn_${s.id}_weight`, label: `CN ${s.id} Weight`, group: "ControlNet" });
        opts.push({ key: `cn_${s.id}_start`, label: `CN ${s.id} Start`, group: "ControlNet" });
        opts.push({ key: `cn_${s.id}_end`, label: `CN ${s.id} End`, group: "ControlNet" });
      });
      return opts;
    },
    audioBandChips() {
      return Object.entries(this.audioBandPresets).map(([key, v]) => ({
        key,
        label: v.label,
        freq_min: v.freq_min,
        freq_max: v.freq_max,
      }));
    },
    sortedSequencerMarkers() {
      const raw = (this.sequencer && this.sequencer.markers) || [];
      return [...raw].sort((a, b) => a.t - b.t);
    },
    sequencerCalculatedDuration() {
      if (!this.sequencer.bpmSync) return "—";
      const bpm = Math.max(1, this.sequencer.bpm || 120);
      const beats = (this.sequencer.bars || 4) * (this.sequencer.beatsPerBar || 4);
      const duration = (beats / bpm) * 60;
      return duration.toFixed(2);
    },
    bindingGroups() {
      const groups = {};
      this.lfoTargets.forEach((t) => {
        const label = t.group || "Other";
        if (!groups[label]) groups[label] = [];
        groups[label].push(t);
      });
      return Object.entries(groups).map(([label, items]) => ({ label, items }));
    },
  },
  watch: {
    sequencer: {
      handler() {
        this.$nextTick(() => this.drawTimeline());
      },
      deep: true,
    },
    sequencerPlayhead() {
      this.$nextTick(() => this.drawTimeline());
    },
    'performance.crossfader'() {
      this.applyCrossfadeMorph();
      this.saveSessionState();
    },
    session() {
      this.saveSessionState();
    },
  },
  mounted() {
    this.loadSessionState();
    this.applyCrossfadeMorph();
    this.loadMotionStyles();
    this.loadBindings();
    this.refreshPresets();
    this.refreshSharedPresets();
    this.refreshGpuPool(false);
    this.refreshLoras();
    this.loadControlNetModels();
    this.refreshPlugins();
    this.syncDeforumSettingsJson();
    this.loadDeforumSettings();
    this.refreshForgeAll().then(() => {
      this.restoreLastModel();
      if (!this.deforumPlaying) this.schedulePreviewFrame();
    });
    this.scanMidi();
    this.connectWebSocket();
    this.initHls();
    if (typeof fetch === "function") {
      const scheduleFramesPoll = () => {
        this.refreshFrames().finally(() => {
          this.framesTimer = setTimeout(scheduleFramesPoll, this.framesRefreshBackoffMs || 5000);
        });
      };
      scheduleFramesPoll();
      const scheduleHealthPoll = () => {
        this.refreshApiHealth().finally(() => {
          this.apiStatusTimer = setTimeout(scheduleHealthPoll, this.apiHealthBackoffMs || 15000);
        });
      };
      scheduleHealthPoll();
    }
    this.playbackTimer = setInterval(() => this.ensureLivePlayback(), 4000);
    this.lfoTimer = setInterval(() => this.runLfos(), 120);
    this.beatTimer = setInterval(() => this.processBeat(), 50);
    this.startLfoAnimation();
    this.setupKeyboardShortcuts();
    this.refreshRuns();
    this.$nextTick(() => {
      this.refreshSequencerList();
      setTimeout(() => this.drawTimeline(), 200);
    });
  },
  beforeUnmount() {
    this.disposeLiveAudioAnalyser();
    this.stopSequencerPlayback();
    if (this.framesTimer) clearTimeout(this.framesTimer);
    if (this.apiStatusTimer) clearTimeout(this.apiStatusTimer);
    if (this.playbackTimer) clearInterval(this.playbackTimer);
    if (this.lfoTimer) clearInterval(this.lfoTimer);
    if (this.beatTimer) clearInterval(this.beatTimer);
    if (this.previewDebounceTimer) clearTimeout(this.previewDebounceTimer);
    this.stopLfoAnimation();
    if (this.playerEl && this.timeHandler) {
      this.playerEl.removeEventListener("timeupdate", this.timeHandler);
    }
    if (this.playerEl && this.errorHandler) {
      this.playerEl.removeEventListener("error", this.errorHandler);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", this._keyHandler);
    }
  },
  methods: {

  async refreshApiHealth() {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch("/api/status");
      if (!res.ok) {
        this.apiHealthBackoffMs = Math.min(120000, (this.apiHealthBackoffMs || 15000) * 2);
        return;
      }
      const j = await res.json();
      if (j && j.sdForge) {
        this.apiHealth = { sdForge: { ...j.sdForge } };
        this.forge.available = !!j.sdForge.available;
      }
      this.apiHealthBackoffMs = 15000;
    } catch (_e) {
      this.apiHealthBackoffMs = Math.min(120000, (this.apiHealthBackoffMs || 15000) * 2);
    }
  },
  async refreshRuns() {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch("/api/runs");
      if (!res.ok) return;
      const data = await res.json();
      this.runsAll = data.runs || [];
      this.applyRunsFilters();
    } catch (_e) {
      this.runsStatus = "Failed to load runs";
    }
  },
  applyRunsFilters() {
    let filtered = [...this.runsAll];
    const { search, status, tag, model } = this.runsFilter;
    if (status) filtered = filtered.filter(r => r.status === status);
    if (tag) filtered = filtered.filter(r => (r.tag || "").toLowerCase().includes(tag.toLowerCase()));
    if (model) filtered = filtered.filter(r => (r.model || "").toLowerCase().includes(model.toLowerCase()));
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r =>
        (r.run_id || "").toLowerCase().includes(s) ||
        (r.tag || "").toLowerCase().includes(s) ||
        (r.model || "").toLowerCase().includes(s) ||
        (r.prompt_positive || "").toLowerCase().includes(s) ||
        (r.notes || "").toLowerCase().includes(s)
      );
    }
    const { field, order } = this.runsSort;
    filtered.sort((a, b) => {
      let va = a[field] || "";
      let vb = b[field] || "";
      if (typeof va === "number" && typeof vb === "number") {
        return order === "desc" ? vb - va : va - vb;
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      return order === "desc" ? vb.localeCompare(va) : va.localeCompare(vb);
    });
    this.runsFiltered = filtered;
  },
  toggleRunSelect(runId) {
    const idx = this.runsSelected.indexOf(runId);
    if (idx >= 0) this.runsSelected.splice(idx, 1);
    else this.runsSelected.push(runId);
  },
  async showRunDetails(run) {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}`);
      if (!res.ok) return;
      this.runsDetailView = await res.json();
    } catch (_e) {
      this.runsStatus = "Failed to load run details";
    }
  },
  async rerunRun(run) {
    if (typeof fetch !== "function") return;
    if (!confirm(`Rerun ${run.run_id}?`)) return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}/rerun`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: {} }),
      });
      const data = await res.json();
      this.runsStatus = data.success ? `Rerun request saved for ${run.run_id}` : data.error;
    } catch (_e) {
      this.runsStatus = "Failed to submit rerun";
    }
  },
  async deleteRun(run) {
    if (typeof fetch !== "function") return;
    if (!confirm(`Delete ${run.run_id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await this.refreshRuns();
        this.runsStatus = `Deleted ${run.run_id}`;
      } else {
        this.runsStatus = data.error;
      }
    } catch (_e) {
      this.runsStatus = "Failed to delete run";
    }
  },
  async saveRunNotes(run) {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch(`/api/runs/${run.run_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: run.notes }),
      });
      const data = await res.json();
      this.runsStatus = data.success ? "Notes saved" : data.error;
    } catch (_e) {
      this.runsStatus = "Failed to save notes";
    }
  },
  async exportRuns(format) {
    if (typeof fetch !== "function") return;
    try {
      const res = await fetch(`/api/runs/export?format=${format}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `runs_export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_e) {
      this.runsStatus = "Failed to export";
    }
  },
  getRunProp(runId, prop) {
    const run = this.runsAll.find(r => r.run_id === runId);
    if (!run) return '-';
    const val = run[prop];
    if (val === undefined || val === null || val === '') return '-';
    if ((prop === 'prompt_positive' || prop === 'prompt_negative') && String(val).length > 80) {
      return String(val).slice(0, 80) + '…';
    }
    return val;
  },
  async exportRunComparison(format) {
    if (this.runsSelected.length < 2) {
      this.runsStatus = 'Select at least 2 runs to compare';
      return;
    }
    try {
      const res = await fetch('/api/runs/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ run_ids: this.runsSelected, format }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      if (format === 'csv') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'runs_comparison.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.comparison, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'runs_comparison.json';
        a.click();
        URL.revokeObjectURL(url);
      }
      this.runsStatus = `Exported comparison (${this.runsSelected.length} runs)`;
    } catch (err) {
      this.runsStatus = err.message || 'Compare export failed';
    }
  },
  formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  },
 switchTab(id) {
   this.currentTab = id;
   try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('defora_tab', id); } catch(_e) {}
 },
 switchSubTab(tab, sub) {
   this.currentSubTab[tab] = sub;
   try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('defora_subtab_' + tab, sub); } catch(_e) {}
 },
 togglePlayPause() {
   this.toggleDeforumPlay();
 },
 stopVideo() {
   this.stopDeforumPlay();
 },
 toggleDeforumPlay() {
   if (this.deforumPlaying) {
     this.pauseDeforumAnimation();
   } else {
     this.startDeforumAnimation();
   }
 },
 startDeforumAnimation() {
   this.applyCrossfadeMorph();
   const startFrame = this.parseFrameNumber(this.thumbs[0]?.name) || 0;
   this.sendControl('liveParam', { start_frame: startFrame, should_resume: 1 });
   this.deforumPlaying = true;
   this.performance.status = 'Deforum animation playing';
   this.isPlaying = true;
 },
 pauseDeforumAnimation() {
   this.sendControl('liveParam', { is_paused_rendering: 1 });
   this.deforumPlaying = false;
   this.performance.status = 'Animation paused — parameter changes update preview';
   this.isPlaying = false;
 },
 stopDeforumPlay() {
   this.sendControl('liveParam', { is_paused_rendering: 1, should_resume: 0 });
   this.deforumPlaying = false;
   this.performance.status = '';
   this.isPlaying = false;
   const video = this.playerEl || document.getElementById("player");
   if (video) {
     video.pause();
     video.currentTime = 0;
   }
 },
 async toggleStreamRecord() {
   if (this.isRecording) {
     this.isRecording = false;
     try {
       const res = await fetch('/api/stream/stop-record', { method: 'POST' });
       const data = await res.json();
       this.performance.status = data.success ? 'Recording stopped' : (data.error || 'Stop failed');
     } catch (e) {
       this.performance.status = 'Stop record failed';
     }
   } else {
     this.isRecording = true;
     const output = `/tmp/defora_rec_${Date.now()}.mp4`;
     try {
       const res = await fetch('/api/stream/record', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ output, fps: 24 }),
       });
       const data = await res.json();
       this.performance.status = data.success ? `Recording → ${output}` : (data.error || 'Record failed');
       if (!data.success) this.isRecording = false;
     } catch (e) {
       this.isRecording = false;
       this.performance.status = 'Record failed';
     }
   }
 },
 async toggleRecord() {
   return this.toggleStreamRecord();
 },
 attachPlayer() {
   const video = document.getElementById("player");
   if (!video) return;
   if (this.playerEl && this.timeHandler) this.playerEl.removeEventListener("timeupdate", this.timeHandler);
   if (this.playerEl && this.errorHandler) this.playerEl.removeEventListener("error", this.errorHandler);
   this.playerEl = video;
   const hlsSource = this.streamSrc.includes("?") ? this.streamSrc + "&t=" + Date.now() : this.streamSrc + "?t=" + Date.now();
   if (this.hls && this.hls.destroy) {
     this.hls.destroy();
     this.hls = null;
   }
   if (video.canPlayType("application/vnd.apple.mpegurl")) {
     video.src = hlsSource;
     video.load();
     this.autoplayVideo(video);
   } else if (typeof Hls !== "undefined" && Hls.isSupported && Hls.isSupported()) {
     const hlsEvents = (Hls && Hls.Events) || { MANIFEST_PARSED: "manifest_parsed", ERROR: "error" };
     this.hls = new Hls({ liveSyncDurationCount: 3 });
     this.hls.loadSource(hlsSource);
     this.hls.attachMedia(video);
     if (this.hls.on) {
       this.hls.on(hlsEvents.MANIFEST_PARSED, () => this.autoplayVideo(video));
       this.hls.on(hlsEvents.ERROR, () => {
         setTimeout(() => this.attachPlayer(), 800);
       });
     }
   } else {
     video.src = hlsSource;
   }
   this.timeHandler = () => {
     if (!isNaN(video.currentTime)) {
       const t = video.currentTime;
       const m = Math.floor(t / 60);
       const s = (t % 60).toFixed(2).padStart(5, "0");
       this.timecode = `${String(m).padStart(2, "0")}:${s}`;
     }
     this.syncReferenceAudioToVideo(video);
   };
   this.errorHandler = () => {
     setTimeout(() => this.attachPlayer(), 800);
   };
   video.addEventListener("timeupdate", this.timeHandler);
   video.addEventListener("error", this.errorHandler);
   video.addEventListener("play", () => {
     this.isPlaying = true;
     this.syncAvAudioPlayState(true, video);
   });
   video.addEventListener("pause", () => {
     this.isPlaying = false;
     this.syncAvAudioPlayState(false, video);
   });
   this.autoplayVideo(video);
 },
 syncReferenceAudioToVideo(video) {
   if (!this.avSyncEnabled || !this.audio.objectUrl) return;
   const v = video || this.playerEl;
   const a = this.$refs.avSyncAudio;
   if (!v || !a || v.paused) return;
   const lag = Number(this.avSyncLeadSec);
   const L = Number.isFinite(lag) && lag >= 0 ? lag : 4;
   const target = Math.max(0, v.currentTime - L);
   if (Math.abs(a.currentTime - target) > 0.12) {
     try {
       a.currentTime = target;
     } catch (_e) {
       /* ignore seek errors on sparse codecs */
     }
   }
   if (a.paused) {
     a.play().catch(() => {});
   }
 },
 syncAvAudioPlayState(playing, video) {
   const a = this.$refs.avSyncAudio;
   if (!a || !this.avSyncEnabled || !this.audio.objectUrl) return;
   const v = video || this.playerEl;
   if (playing && v) {
     this.syncReferenceAudioToVideo(v);
     a.play().catch(() => {});
   } else {
     a.pause();
   }
 },
 autoplayVideo(video) {
   const el = video || this.playerEl;
   if (!el || typeof el.play !== "function") return;
   const p = el.play();
   if (p && typeof p.catch === "function") {
     p.then(() => { this.isPlaying = true; }).catch(() => { this.isPlaying = false; });
   }
 },
 ensureLivePlayback() {
   if (!this.playerEl) return;
   if (this.playerEl.paused || this.playerEl.readyState < 2) {
     this.autoplayVideo(this.playerEl);
   }
 },
 lfoTarget(lfo) {
   if (!lfo || !lfo.target) return null;
   return this.lfoTargets.find((t) => t.key === lfo.target) || null;
 },
 initLfoBase(lfo) {
   const target = this.lfoTarget(lfo);
   if (!target) return;
   if (lfo.base === null || lfo.base === undefined) {
     lfo.base = target.default != null ? target.default : (target.min + target.max) / 2;
   } else {
     lfo.base = this.clampVal(lfo.base, target.min, target.max);
   }
 },
 shapeValue(shape, phase) {
   const p = phase % (Math.PI * 2);
   if (shape === "Square") return Math.sin(p) >= 0 ? 1 : -1;
   if (shape === "Saw") return p / Math.PI - 1; // -1..1
   if (shape === "Triangle") return (2 * Math.asin(Math.sin(p))) / Math.PI;
   return Math.sin(p);
 },
 clampVal(v, min, max) {
   if (v === null || v === undefined || Number.isNaN(v)) return min;
   return Math.min(max, Math.max(min, v));
 },
 getNow() {
   return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
 },
  runLfos(now = this.getNow()) {
    if (this.audio.track) return;
    if (this.lastLfoTick === null) {
      this.lastLfoTick = now;
      return;
    }
    const dtSec = (now - this.lastLfoTick) / 1000;
    this.lastLfoTick = now;
    if (dtSec <= 0) return;

    const payload = {};
    const cnUpdates = {};
    this.lfos.forEach((lfo) => {
      if (!lfo.on || !lfo.targets.length) return;
      const bpm = lfo.bpm || this.lfoBpm || 120;
      const depth = this.clampVal(lfo.depth ?? 0, 0, 1);
      const speed = lfo.speed || 1.0;
      const inc = dtSec * (bpm / 60) * Math.PI * 2 * speed;
      const phase = (lfo.phase || 0) + inc;
      lfo.phase = phase % (Math.PI * 2);
      const wave = this.shapeValue(lfo.shape, lfo.phase);

      lfo.targets.forEach((targetKey) => {
        const target = this.lfoTargets.find((t) => t.key === targetKey);
        if (!target) return;
        const base = lfo.base == null ? (target.default ?? (target.min + target.max) / 2) : this.clampVal(lfo.base, target.min, target.max);
        if (lfo.base === null) lfo.base = base;
        const amp = depth * (target.max - target.min) / 2;
        const value = this.clampVal(base + wave * amp, target.min, target.max);
        if (targetKey.startsWith("cn_")) {
          const parts = targetKey.split("_");
          const slotId = parts[1];
          const field = parts[2];
          const slot = this.cn.slots.find(s => s.id === slotId);
          if (slot) {
            if (field === "weight") slot.weight = value;
            else if (field === "start") slot.start = value;
            else if (field === "end") slot.end = value;
            cnUpdates[slotId] = slot;
          }
        } else {
          payload[targetKey] = value;
        }
      });
    });
    if (Object.keys(payload).length) {
      this.sendControl("liveParam", payload);
    }
    Object.values(cnUpdates).forEach(slot => this.updateControlNet(slot));
  },
 startLfoAnimation() {
   this.stopLfoAnimation();
   const animate = (ts) => {
     this.lfos.forEach((lfo) => {
       const canvas = this.lfoCanvasRefs[lfo.id];
       if (!canvas || !canvas.getContext) return;
       this.drawLfoPreview(canvas, lfo, ts);
     });
     this._lfoAnimFrame = requestAnimationFrame(animate);
   };
   this._lfoAnimFrame = requestAnimationFrame(animate);
 },
 stopLfoAnimation() {
   if (this._lfoAnimFrame != null && typeof cancelAnimationFrame === "function") {
     cancelAnimationFrame(this._lfoAnimFrame);
     this._lfoAnimFrame = null;
   }
 },
 drawLfoPreview(canvas, lfo, ts) {
   const ctx = canvas.getContext("2d");
   if (!ctx) return;
   const w = canvas.width;
   const h = canvas.height;
   const mid = h / 2;
   const amp = (h / 2 - 4) * (lfo.depth || 0.2);

   ctx.fillStyle = "#031b2d";
   ctx.fillRect(0, 0, w, h);

   // Grid lines
   ctx.strokeStyle = "rgba(12, 48, 72, 0.5)";
   ctx.lineWidth = 0.5;
   ctx.beginPath();
   ctx.moveTo(0, mid);
   ctx.lineTo(w, mid);
   ctx.stroke();

   // Phase offset based on time and speed
   const speed = (lfo.speed || 1.0) * 0.002;
   const phase = (ts || 0) * speed;

   ctx.strokeStyle = lfo.on ? "#ff8a1a" : "#444";
   ctx.lineWidth = 2;
   ctx.beginPath();

   const cycles = 2;
   for (let x = 0; x < w; x++) {
     const t = (x / w) * cycles * Math.PI * 2 + phase;
     let y;
     const p = t % (Math.PI * 2);
     if (lfo.shape === "Sine") {
       y = mid + Math.sin(p) * amp;
     } else if (lfo.shape === "Triangle") {
       y = mid + (2 * Math.asin(Math.sin(p)) / Math.PI) * amp;
     } else if (lfo.shape === "Saw") {
       y = mid + (p / Math.PI - 1) * amp;
     } else {
       y = mid + (Math.sin(p) >= 0 ? 1 : -1) * amp;
     }
     if (x === 0) ctx.moveTo(x, y);
     else ctx.lineTo(x, y);
   }
   ctx.stroke();

   // Glow effect when enabled
   if (lfo.on) {
     ctx.strokeStyle = "rgba(255, 138, 26, 0.15)";
     ctx.lineWidth = 6;
     ctx.beginPath();
     for (let x = 0; x < w; x++) {
       const t = (x / w) * cycles * Math.PI * 2 + phase;
       const p = t % (Math.PI * 2);
       let y;
       if (lfo.shape === "Sine") {
         y = mid + Math.sin(p) * amp;
       } else if (lfo.shape === "Triangle") {
         y = mid + (2 * Math.asin(Math.sin(p)) / Math.PI) * amp;
       } else if (lfo.shape === "Saw") {
         y = mid + (p / Math.PI - 1) * amp;
       } else {
         y = mid + (Math.sin(p) >= 0 ? 1 : -1) * amp;
       }
       if (x === 0) ctx.moveTo(x, y);
       else ctx.lineTo(x, y);
     }
     ctx.stroke();
   }
 },
 processBeat() {
   const now = this.getNow();
   const bpm = this.audio.bpm || 120;
   const beatIntervalMs = (60 / bpm) * 1000;
   
   if (this.lastBeatTime === null) {
     this.lastBeatTime = now;
     this.beatCount = 0;
     this.beatPhase = 0;
     return;
   }
   
   const timeSinceLastBeat = now - this.lastBeatTime;
   
   // Check if a beat should occur
   if (timeSinceLastBeat >= beatIntervalMs) {
     this.lastBeatTime = now;
     this.beatCount++;
     this.triggerBeatMacros(now);
   }
   
   // Update continuous beat phase for smooth animations
   this.beatPhase = (timeSinceLastBeat / beatIntervalMs) % 1;
 },
 triggerBeatMacros(now = this.getNow()) {
   const payload = {};
   const cnUpdates = {};
   const activeMacros = this.macrosRack.filter(m => m.on);
   
   activeMacros.forEach((macro) => {
     const target = this.lfoTargets.find(t => t.key === macro.target);
     if (!target) return;
     
     // Determine if this macro should trigger on this beat
     const shouldTrigger = this.shouldMacroTrigger(macro, now);
     if (!shouldTrigger) return;
     
     // Calculate value based on macro shape
     const base = target.default ?? (target.min + target.max) / 2;
     const depth = this.clampVal(macro.depth ?? 0.5, 0, 1);
     const offset = this.clampVal(macro.offset ?? 0, -1, 1);
     
     let value;
     if (macro.shape === "Noise") {
       // Random value for noise
       value = base + (Math.random() * 2 - 1) * depth * (target.max - target.min) / 2;
     } else {
       // Use shape value at current phase
       const phase = this.beatPhase * Math.PI * 2;
       const wave = this.shapeValue(macro.shape || "Sine", phase);
       value = base + (wave + offset) * depth * (target.max - target.min) / 2;
     }
     
     const clamped = this.clampVal(value, target.min, target.max);
     if (macro.target.startsWith("cn_")) {
       const parts = macro.target.split("_");
       const slotId = parts[1];
       const field = parts[2];
       const slot = this.cn.slots.find(s => s.id === slotId);
       if (slot) {
         if (field === "weight") slot.weight = clamped;
         else if (field === "start") slot.start = clamped;
         else if (field === "end") slot.end = clamped;
         cnUpdates[slotId] = slot;
       }
     } else {
       payload[macro.target] = clamped;
     }
   });
   
   if (Object.keys(payload).length) {
     this.sendControl("liveParam", payload);
   }
   Object.values(cnUpdates).forEach(slot => this.updateControlNet(slot));
 },
 shouldMacroTrigger(macro, now) {
   const bpm = Number(macro.bpm || 0);
   if (bpm > 0) {
     const interval = (60 / bpm) * 1000;
     const last = this.lastMacroTrigger[macro.id] || 0;
     if (now - last >= interval) {
       this.lastMacroTrigger[macro.id] = now;
       return true;
     }
     return false;
   }
   // Fallback: if no BPM (or BPM is 0/invalid), trigger on every beat
   return true;
 },
 connectWebSocket() {
   const url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws";
   const connect = () => {
     this.ws = new WebSocket(url);
     this.ws.onopen = () => {
       this.wsStatus = "connected";
       this.collabIdentify();
     };
     this.ws.onclose = () => {
       this.wsStatus = "disconnected";
       this.collab.userId = null;
       setTimeout(connect, 1000);
     };
     this.ws.onmessage = (evt) => {
       try {
         const msg = JSON.parse(evt.data);
         this.handleWsMessage(msg);
       } catch (_) {}
     };
   };
   connect();
 },
 handleWsMessage(msg) {
   if (msg.type === "hello" && msg.userId) {
     this.collab.userId = msg.userId;
     this.collabIdentify();
   }
   if (msg.type === "presence" && Array.isArray(msg.users)) {
     this.collab.users = msg.users;
     const locks = {};
     msg.users.forEach((u) => {
       (u.lockedParams || []).forEach((param) => {
         locks[param] = u.name;
       });
     });
     this.collab.locks = locks;
   }
   if (msg.type === "shared_preset") {
     this.sharedPresetsStatus = `Shared preset ${msg.action}: ${msg.name}`;
     this.refreshSharedPresets();
     setTimeout(() => { this.sharedPresetsStatus = ""; }, 3000);
   }
   if (msg.type === "recording") {
     this.collab.recording = msg.status === "started";
     this.collab.status = msg.status === "started" ? "Session recording…" : "Recording saved on server";
   }
   if (msg.type === "recordings" && Array.isArray(msg.files)) {
     this.collab.recordings = msg.files;
   }
   if (msg.type === "playback") {
     this.collab.status = `Playback started (${msg.events || 0} events)`;
   }
   if (msg.type === "error") {
     console.error("[Defora WS]", msg.msg || msg, msg.locked || "");
     this.collab.status = msg.msg || "WebSocket error";
   }
   if (msg.type === "event") {
     if (msg.msg) console.log("[Defora event]", msg.msg);
   }
   if (msg.type === "stream" && msg.src) {
     this.streamSrc = msg.src + "?t=" + Date.now();
     this.attachPlayer();
   }
   if (msg.type === "frame") {
     this.refreshFrames();
   }
 },
 collabIdentify() {
   if (!this.ws || this.ws.readyState !== 1) return;
   this.wsSend({ type: "identify", name: this.collab.userName || "Performer" });
 },
 saveCollabUserName() {
   try {
     localStorage.setItem("defora_user_name", this.collab.userName || "Performer");
   } catch (_) {}
 },
 wsSend(payload) {
   if (!this.ws || this.ws.readyState !== 1) return;
   this.ws.send(JSON.stringify(payload));
 },
 modelSourceLabel(source) {
   return modelSourceLabel(source);
 },
 isParamLocked(key) {
   return Boolean(this.collab.locks[key]);
 },
 isParamLockedByMe(key) {
   const who = this.collab.locks[key];
   return who && who === (this.collab.userName || "Performer");
 },
 paramLockTitle(key) {
   if (!this.collab.locks[key]) return "Lock parameter for collaboration";
   if (this.isParamLockedByMe(key)) return "Unlock (you hold this lock)";
   return `Locked by ${this.collab.locks[key]}`;
 },
 toggleParamLock(key) {
   if (this.isParamLockedByMe(key)) {
     this.unlockParam(key);
   } else if (!this.isParamLocked(key)) {
     this.wsSend({ type: "lock_param", param: key });
   } else {
     this.collab.status = `${key} is locked by ${this.collab.locks[key]}`;
   }
 },
 unlockParam(key) {
   this.wsSend({ type: "unlock_param", param: key });
 },
 toggleSessionRecording() {
   if (this.collab.recording) {
     this.wsSend({ type: "stop_recording" });
   } else {
     this.wsSend({ type: "start_recording" });
   }
 },
 listSessionRecordings() {
   this.wsSend({ type: "list_recordings" });
 },
 playbackSessionRecording(filename) {
   this.wsSend({ type: "playback_recording", recordingFile: filename });
 },
 async refreshSharedPresets() {
   try {
     const { data } = await apiFetch("/api/shared-presets", {}, "shared-presets list");
     this.sharedPresets = data.presets || [];
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async shareCurrentPreset() {
   const name = (this.sharedPresetName || this.newPresetName || this.currentPreset || "shared").replace(/[^a-zA-Z0-9_-]/g, "") || "shared";
   const preset = {
     liveVibe: this.liveVibe,
     liveCam: this.liveCam,
     audio: { bpm: this.audio.bpm, track: this.audio.track },
     cn: { slots: this.cn.slots, active: this.cn.active },
     loras: { groupA: this.loras.groupA, groupB: this.loras.groupB },
     prompts: {
       pos: this.prompts.pos,
       neg: this.prompts.neg,
       morphOn: this.prompts.morphOn,
       crossfaderValue: this.prompts.crossfaderValue,
     },
     lfos: this.lfos,
     macrosRack: this.macrosRack,
     paramSources: this.paramSources,
   };
   try {
     await apiFetch("/api/shared-presets", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         name,
         preset,
         sharedBy: this.collab.userName || "anonymous",
         description: `Shared from web UI`,
       }),
     }, "share preset");
     this.sharedPresetsStatus = `Shared as ${name}`;
     this.sharedPresetName = name;
     await this.refreshSharedPresets();
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async loadSharedPreset(name) {
   try {
     const { data } = await apiFetch(`/api/shared-presets/${encodeURIComponent(name)}`, {}, "load shared preset");
     const preset = data.preset || data;
     if (preset.liveVibe) this.liveVibe = preset.liveVibe;
     if (preset.liveCam) this.liveCam = preset.liveCam;
     if (preset.audio) Object.assign(this.audio, preset.audio);
     if (preset.cn) Object.assign(this.cn, preset.cn);
     if (preset.lfos) this.lfos = preset.lfos;
     if (preset.macrosRack) this.macrosRack = preset.macrosRack;
     if (preset.prompts) Object.assign(this.prompts, preset.prompts);
     if (preset.loras) {
       this.loras.groupA = preset.loras.groupA || [];
       this.loras.groupB = preset.loras.groupB || [];
       await this.refreshLoras();
     }
     this.sharedPresetsStatus = `Loaded shared preset: ${name}`;
     setTimeout(() => { this.sharedPresetsStatus = ""; }, 3000);
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async deleteSharedPreset(name) {
   if (!confirm(`Delete shared preset "${name}"?`)) return;
   try {
     await apiFetch(`/api/shared-presets/${encodeURIComponent(name)}`, { method: "DELETE" }, "delete shared preset");
     await this.refreshSharedPresets();
     this.sharedPresetsStatus = `Deleted ${name}`;
   } catch (err) {
     this.sharedPresetsStatus = err.message;
   }
 },
 async refreshGpuPool(refreshStats = false) {
   this.gpuPool.loading = true;
   try {
     if (refreshStats) {
       await apiFetch("/api/gpu-pool/refresh", { method: "POST" }, "gpu pool refresh");
     }
     const { data } = await apiFetch("/api/gpu-pool", {}, "gpu pool status");
     this.gpuPool.enabled = !!data.enabled;
     this.gpuPool.strategy = data.strategy || "round_robin";
     this.gpuPool.healthyNodes = data.healthyNodes ?? 0;
     this.gpuPool.nodes = data.nodes || [];
   } catch (err) {
     this.gpuPool.status = err.message;
   } finally {
     this.gpuPool.loading = false;
   }
 },
 async saveGpuPoolSettings() {
   try {
     await apiFetch("/api/gpu-pool", {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         enabled: this.gpuPool.enabled,
         strategy: this.gpuPool.strategy,
       }),
     }, "gpu pool settings");
     this.gpuPool.status = this.gpuPool.enabled ? "Load balancing enabled" : "Load balancing disabled";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async addGpuNode() {
   const url = (this.gpuPool.draft.url || "").trim();
   if (!url) return;
   try {
     await apiFetch("/api/gpu-pool/nodes", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         url,
         name: this.gpuPool.draft.name || url,
         backend: this.gpuPool.draft.backend,
         enabled: false,
         priority: this.gpuPool.draft.priority || 1,
       }),
     }, "add gpu node");
     this.gpuPool.draft = { url: "", name: "", backend: "sd-forge", priority: 1 };
     await this.refreshGpuPool(false);
     this.gpuPool.status = "Instance added (disabled). Edit if needed, then enable.";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 startEditGpuNode(n) {
   if (n.enabled) {
     this.gpuPool.status = "Disable the node before editing.";
     return;
   }
   this.gpuPool.editId = n.id;
   this.gpuPool.editDraft = {
     name: n.name,
     url: n.url,
     backend: n.backend,
     priority: n.priority || 1,
   };
 },
 async saveGpuNodeEdit(n) {
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(this.gpuPool.editDraft),
     }, "edit gpu node");
     this.gpuPool.editId = null;
     await this.refreshGpuPool(false);
     this.gpuPool.status = "Node updated.";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async disableGpuNode(n) {
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}/disable`, { method: "POST" }, "disable gpu");
     await this.refreshGpuPool(false);
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async enableGpuNode(n) {
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}/enable`, { method: "POST" }, "enable gpu");
     await this.refreshGpuPool(true);
     this.gpuPool.status = `${n.name} enabled.`;
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 async removeGpuNode(n) {
   if (!confirm(`Remove GPU instance "${n.name}"?`)) return;
   try {
     await apiFetch(`/api/gpu-pool/nodes/${encodeURIComponent(n.id)}`, { method: "DELETE" }, "remove gpu");
     await this.refreshGpuPool(false);
     this.gpuPool.status = "Node removed.";
   } catch (err) {
     this.gpuPool.status = err.message;
   }
 },
 formatGpuMemory(n) {
   if (n.memoryUsedMb == null && n.memoryTotalMb == null) return "—";
   const used = n.memoryUsedMb != null ? `${n.memoryUsedMb}` : "?";
   const total = n.memoryTotalMb != null ? `${n.memoryTotalMb}` : "?";
   return `${used} / ${total} MB`;
 },
 sendControl(controlType, payload) {
   if (!this.ws || this.ws.readyState !== 1) return;
  const token = getStoredControlToken();
  const msg = token
    ? { type: "control", controlType, payload, token }
    : { type: "control", controlType, payload };
   this.ws.send(JSON.stringify(msg));
 },
 updateParam(p, evt) {
   if (this.isParamLocked(p.key) && !this.isParamLockedByMe(p.key)) {
     console.warn(`[Defora] Parameter "${p.key}" is locked by ${this.collab.locks[p.key]}`);
     return;
   }
   const val = parseFloat(evt.target.value);
   p.val = val;
   this.queueLiveParam(p.key, val);
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 setSource(key, source) {
   this.paramSources[key] = source;
   this.sendControl("paramSource", { key, source });
 },
 sourceTip(p) {
   const src = this.paramSources[p.key];
   if (src === "Beat") return "Beat/LFO";
   if (src === "MIDI") return "MIDI mapping";
   return "Manual";
 },
 sendPreset(name) {
   const preset = this.motionPresets[name];
   if (!preset) return;
   this.sendControl("liveParam", preset);
   console.log(`Applied motion preset: ${name}`, preset);
 },
 resetVibeParams() {
   const defaults = { cfg: 6.0, strength: 0.65, noise: 1.0, cfgscale: 5.0 };
   this.liveVibe.forEach((p) => {
     if (defaults[p.key] !== undefined) {
       p.val = defaults[p.key];
       this.queueLiveParam(p.key, defaults[p.key]);
     }
   });
 },
 resetCameraParams() {
   const defaults = { zoom: 0.8, panx: 0, pany: 0, tilt: 0 };
   this.liveCam.forEach((p) => {
     if (defaults[p.key] !== undefined) {
       p.val = defaults[p.key];
       this.queueLiveParam(p.key, defaults[p.key]);
     }
   });
   this.sendControl("liveParam", this.motionPresets.Static);
 },
  setupKeyboardShortcuts() {
    if (typeof document === "undefined") return;
    const self = this;
    this._keyHandler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (self.bindingLearnMode && self.bindingTargetKey) {
        const key = e.key.toLowerCase();
        if (key.length === 1 || ["arrowup", "arrowdown", "arrowleft", "arrowright", "space", "enter", "tab"].includes(key)) {
          self.keyBindings[self.bindingTargetKey] = key;
          self.saveBindings();
          self.status = `Bound "${self.bindingTargetKey}" → ${key}`;
          self.bindingTargetKey = null;
          e.preventDefault();
          return;
        }
      }
      const boundKey = Object.entries(self.keyBindings).find(([, v]) => v === e.key.toLowerCase());
      if (boundKey) {
        const [paramKey] = boundKey;
        const target = self.lfoTargets.find(t => t.key === paramKey);
        if (target) {
          const current = self.getParamValue(paramKey);
          const step = (target.max - target.min) * 0.05;
          self.queueLiveParam(paramKey, Math.min(target.max, Math.max(target.min, current + step)));
          e.preventDefault();
          return;
        }
      }
      switch(e.key) {
        case "1": case "2": case "3": case "4": case "5": case "6": case "7":
          const tabs = ["LIVE", "PROMPTS", "MOTION", "MODULATION", "AUDIO", "SETTINGS", "GENERATE"];
          self.currentTab = tabs[parseInt(e.key) - 1];
          e.preventDefault();
          break;
        case " ":
          if (self.currentTab === "LIVE") {
            self.generatePreviewFrame();
            e.preventDefault();
          } else if (self.currentTab === "GENERATE") {
            self.generatePreviewFrame();
            e.preventDefault();
          }
          break;
        case "r":
          if (self.currentTab === "LIVE") {
            self.resetVibeParams();
            self.resetCameraParams();
            e.preventDefault();
          }
          break;
        case "m":
          if (self.currentTab === "PROMPTS") {
            self.prompts.morphOn = !self.prompts.morphOn;
            self.setMorph(self.prompts.morphOn);
            e.preventDefault();
          }
          break;
        case "l":
          if (self.currentTab === "MODULATION") {
            self.lfoOn = !self.lfoOn;
            e.preventDefault();
          }
          break;
        case "b":
          if (self.currentTab === "MODULATION") {
            self.beatMacroOn = !self.beatMacroOn;
            e.preventDefault();
          }
          break;
      }
    };
    document.addEventListener("keydown", this._keyHandler);
  },
 midiTarget(key) {
   return this.lfoTargets.find((t) => t.key === key) || null;
 },
 updateMidiMapping(map) {
   // noop hook for now; v-model already updates
   return map;
 },
 setMorph(on) {
   this.prompts.morphOn = on;
   this.sendControl("prompts", { morphOn: on });
   if (on) {
     this.applyPromptMorphing();
   }
 },
 parseMorphRange(range) {
   const m = String(range || "0–1").match(/([0-9.]+)\s*[–\-]\s*([0-9.]+)/);
   if (!m) return { min: 0, max: 1 };
   const min = Math.min(parseFloat(m[1]), parseFloat(m[2]));
   const max = Math.max(parseFloat(m[1]), parseFloat(m[2]));
   return { min, max };
 },
 morphSlotInRange(slot) {
   const { min, max } = this.parseMorphRange(slot.range);
   const t = this.prompts.morphBlend ?? 0.5;
   return t >= min && t <= max;
 },
 morphBlendInSlotRange(slot) {
   const { min, max } = this.parseMorphRange(slot.range);
   const t = this.prompts.morphBlend ?? 0.5;
   if (max <= min) return t;
   return Math.max(0, Math.min(1, (t - min) / (max - min)));
 },
 morphSlotPreview(slot) {
   if (!slot.on || !this.morphSlotInRange(slot)) return "—";
   const phrase = morphSlotValue(
     { type: "prompt", valueA: slot.a, valueB: slot.b },
     this.morphBlendInSlotRange(slot)
   );
   if (!phrase) return "—";
   const w = slot.weight != null ? slot.weight : 1;
   return w < 0.99 ? `${phrase} ×${w.toFixed(2)}` : phrase;
 },
 onPromptMorphBlendInput() {
   this.applyPromptMorphing();
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 onMorphSlotWeightInput(_slot) {
   this.applyPromptMorphing();
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 applyPromptMorphing() {
   if (!this.prompts.morphOn) return;
   const base = (this.prompts.pos || "").trim();
   const parts = base ? [base] : [];
   for (const slot of this.morphSlots) {
     if (!slot.on || !this.morphSlotInRange(slot)) continue;
     const phrase = morphSlotValue(
       { type: "prompt", valueA: slot.a, valueB: slot.b },
       this.morphBlendInSlotRange(slot)
     );
     if (!phrase) continue;
     const w = Math.max(0, Math.min(1, slot.weight != null ? slot.weight : 1));
     if (w >= 0.99) parts.push(phrase);
     else parts.push(`(${phrase}:${w.toFixed(2)})`);
   }
   const morphedPrompt = parts.join(", ").trim();
   if (!morphedPrompt) return;
   this.prompts.pos = morphedPrompt;
   this.sendControl("prompt", {
     positive: morphedPrompt,
     negative: this.prompts.neg,
     morphBlend: this.prompts.morphBlend,
   });
 },
 sendPrompts() {
   this.sendControl("prompt", { positive: this.prompts.pos, negative: this.prompts.neg });
   if (this.prompts.morphOn) {
     this.applyPromptMorphing();
   }
 },
 addMacro() {
   if (this.macrosRack.length >= 6) return;
   const id = `macro-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
   this.macrosRack.push({ id, on: true, target: "cfg", shape: "Sine", bpm: 120, depth: 0.5, offset: 0.0, show: false });
 },
 removeMacro(index) {
   if (this.macrosRack.length <= 1) return;
   this.macrosRack.splice(index, 1);
 },
 addAudioMapping() {
   this.audioMappings.push({ param: "", freq_min: 60, freq_max: 500, out_min: 0, out_max: 1 });
 },
 removeAudioMapping(index) {
   this.audioMappings.splice(index, 1);
 },
 applyAudioBandPreset(mapIndex, bandKey) {
   const spec = this.audioBandPresets[bandKey];
   const row = this.audioMappings[mapIndex];
   if (!spec || !row) return;
   row.freq_min = spec.freq_min;
   row.freq_max = spec.freq_max;
 },
 handleImg2imgFile(evt) {
   const f = evt.target.files && evt.target.files[0];
   if (!f) return;
   const reader = new FileReader();
   reader.onload = () => {
     this.img2img.dataUrl = reader.result;
     this.img2img.status = "Init image loaded";
   };
   reader.onerror = () => {
     this.img2img.status = "Could not read file";
   };
   reader.readAsDataURL(f);
 },
 handleImg2imgMask(evt) {
   const f = evt.target.files && evt.target.files[0];
   if (!f) return;
   const reader = new FileReader();
   reader.onload = () => {
     this.img2img.maskDataUrl = reader.result;
     this.img2img.status = "Mask loaded (inpaint)";
   };
   reader.onerror = () => {
     this.img2img.status = "Could not read mask file";
   };
   reader.readAsDataURL(f);
 },
 clearImg2imgMask() {
   this.img2img.maskDataUrl = null;
   this.img2img.status = "Mask cleared";
 },
 async refreshPlugins() {
   if (typeof fetch !== "function") return;
   try {
     const res = await fetch("/api/plugins");
     if (!res.ok) return;
     const j = await res.json();
     this.pluginsRegistry = Array.isArray(j.plugins) ? j.plugins : [];
   } catch (_) {
     this.pluginsRegistry = [];
   }
 },
 async submitImg2img() {
   if (!this.img2img.dataUrl) {
     this.img2img.status = "Choose an init image first";
     return;
   }
   this.img2img.status = "Submitting…";
   try {
     const body = {
       init_image: this.img2img.dataUrl,
       prompt: this.prompts.pos,
       negative_prompt: this.prompts.neg,
       denoising_strength: this.img2img.denoisingStrength,
       width: this.img2img.width,
       height: this.img2img.height,
     };
     if (this.img2img.maskDataUrl) {
       body.mask_image = this.img2img.maskDataUrl;
       body.mask_blur = this.img2img.maskBlur;
       body.inpainting_fill = this.img2img.inpaintingFill;
       body.inpaint_full_res = this.img2img.inpaintFullRes;
     }
     const res = await fetch("/api/img2img", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(body),
     });
     const j = await res.json();
     if (!res.ok) throw new Error(j.error || j.detail || res.statusText);
     this.img2img.lastPath = j.path || null;
     this.img2img.status = j.path ? `OK → ${j.path}` : "OK";
   } catch (e) {
     this.img2img.status = String(e.message || e);
   }
 },
 addLfo() {
   const nextId = this.lfos.length ? Math.max(...this.lfos.map((l) => l.id)) + 1 : 1;
   this.lfos.push({
     id: nextId,
     on: true,
     targets: [],
     shape: "Sine",
     bpm: this.lfoBpm || 120,
     speed: 1.0,
     depth: 0.2,
     base: null,
     phase: 0,
   });
 },
 removeLfo(index) {
   if (this.lfos.length <= 1) return;
   this.lfos.splice(index, 1);
 },
 resetLfo(index) {
   const lfo = this.lfos[index];
   if (!lfo) return;
   lfo.targets = [];
   lfo.shape = "Sine";
   lfo.bpm = this.lfoBpm || 120;
   lfo.speed = 1.0;
   lfo.depth = 0.2;
   lfo.base = null;
   lfo.phase = 0;
   lfo.on = false;
 },
 addLfoTarget(lfoIdx) {
   const pick = this.lfoTargetPick[lfoIdx];
   if (!pick) return;
   const lfo = this.lfos[lfoIdx];
   if (!lfo || lfo.targets.includes(pick)) {
     this.$set ? this.$set(this.lfoTargetPick, lfoIdx, "") : (this.lfoTargetPick[lfoIdx] = "");
     return;
   }
   lfo.targets.push(pick);
   if (lfo.base === null) {
     const target = this.lfoTargets.find((t) => t.key === pick);
     if (target) lfo.base = target.default ?? (target.min + target.max) / 2;
   }
   this.lfoTargetPick[lfoIdx] = "";
 },
 removeLfoTarget(lfoIdx, targetIdx) {
   const lfo = this.lfos[lfoIdx];
   if (!lfo) return;
   lfo.targets.splice(targetIdx, 1);
 },
 saveCurrentMotionStyle() {
   const name = prompt("Enter style name:");
   if (!name || !name.trim()) return;
   const style = {
     translation_z: 0.8,
     rotation_z: 0,
     rotation_y: 0,
     translation_x: 0,
     translation_y: 0,
   };
   this.motionStylesSaved[name.trim()] = style;
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       window.localStorage.setItem('defora_motion_styles', JSON.stringify(this.motionStylesSaved));
     }
   } catch(_e) {}
 },
 loadMotionStyles() {
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       const saved = window.localStorage.getItem('defora_motion_styles');
       if (saved) {
         const parsed = JSON.parse(saved);
         if (parsed && typeof parsed === 'object') {
           this.motionStylesSaved = parsed;
         }
       }
     }
   } catch(_e) {}
 },
 deleteSavedMotionStyle(name) {
   if (!confirm(`Delete saved style "${name}"?`)) return;
   delete this.motionStylesSaved[name];
   try {
     if (typeof window !== 'undefined' && window.localStorage) {
       window.localStorage.setItem('defora_motion_styles', JSON.stringify(this.motionStylesSaved));
     }
   } catch(_e) {}
 },
 applySavedMotionStyle(name) {
   const style = this.motionStylesSaved[name];
   if (!style) return;
   this.sendControl("liveParam", style);
 },
 applyMotionPreset(name) {
   const preset = this.motionPresets[name];
   if (!preset) return;
   this.sendControl("liveParam", preset);
 },
 queueLiveParam(key, val) {
   const now = this.getNow();
   const last = this.lastParamSent[key] || 0;
   this.liveParamPending[key] = val;
   if (now - last > this.controlDelayMs) {
     this.lastParamSent[key] = now;
     this.sendControl("liveParam", { [key]: val });
     return;
   }
   clearTimeout(this.liveParamTimers[key]);
   this.liveParamTimers[key] = setTimeout(() => {
     const v = this.liveParamPending[key];
     delete this.liveParamPending[key];
     this.lastParamSent[key] = this.getNow();
     this.sendControl("liveParam", { [key]: v });
   }, this.controlDelayMs);
 },
 async refreshFrames() {
   if (typeof fetch !== "function") return;
   try {
     const res = await fetch("/api/frames?limit=10", { cache: "no-store" });
     if (!res.ok) {
       this.framesRefreshBackoffMs = Math.min(60000, (this.framesRefreshBackoffMs || 5000) * 2);
       return;
     }
     const json = await res.json();
     if (Array.isArray(json.items)) {
       this.thumbs = json.items.map((item) => {
         if (typeof item === "string") {
           return { src: item, name: item.split("/").pop(), frame: this.parseFrameNumber(item) };
         }
         const src = item.src || item.url || item.path || "";
         const name = item.name || src.split("/").pop();
         const frame = item.frame != null ? item.frame : this.parseFrameNumber(name || src);
         return { src, name, frame };
       });
     }
     this.framesRefreshBackoffMs = 5000;
   } catch (e) {
     console.warn("frames fetch failed", e);
     this.framesRefreshBackoffMs = Math.min(60000, (this.framesRefreshBackoffMs || 5000) * 2);
   }
 },
 parseFrameNumber(name) {
   if (!name) return null;
   const match = String(name).match(/(\d{3,})/);
   return match ? parseInt(match.pop(), 10) : null;
 },
 async runAudioMod() {
   if (!this.audio.track) {
     this.audioStatus = "Set audio file first";
     return;
   }
   const mappings = this.audioMappings
     .filter((m) => m.param && !Number.isNaN(m.freq_min) && !Number.isNaN(m.freq_max))
     .map((m) => ({
       param: m.param,
       freq_min: m.freq_min,
       freq_max: m.freq_max,
       out_min: m.out_min ?? 0,
       out_max: m.out_max ?? 1,
     }));
   if (!mappings.length) {
     this.audioStatus = "Add at least one mapping";
     return;
   }
   try {
     const res = await fetch("/api/audio-map", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         audioPath: this.audio.track,
         fps: this.stats.fps || 24,
         mappings,
         live: true,
       }),
     });
     const json = await res.json();
     if (!res.ok || json.error) {
       this.audioStatus = json.error || "Audio processing failed";
     } else {
       this.audioStatus = json.ok ? "Audio sent to mediator" : "Audio processing finished with errors";
     }
   } catch (err) {
     this.audioStatus = String(err);
   }
 },
 frameLabel(t) {
   if (!t) return "?";
   if (t.frame != null && !isNaN(t.frame)) return t.frame;
   if (t.name) return t.name.replace(/\.[^.]+$/, "");
   return t.src || "?";
 },
 async scanMidi() {
   if (!navigator.requestMIDIAccess) {
     this.midi.supported = false;
     return;
   }
   try {
     const access = await navigator.requestMIDIAccess({ sysex: false });
     const devices = [];
     access.inputs.forEach((input) => {
       devices.push({ id: input.id, name: input.name });
       input.onmidimessage = (msg) => this.handleMidi(input, msg);
     });
     this.midi.devices = devices;
     if (!this.midi.selected && devices.length) this.midi.selected = devices[0].id;
     this.loadMidiMappings();
   } catch (e) {
     this.midiStatus = "MIDI not available";
   }
 },
 loadMidiMappings() {
   const storage = (typeof window !== 'undefined' && window.localStorage) || 
                  (typeof global !== 'undefined' && global.window && global.window.localStorage);
   if (!storage) return;
   try {
     const stored = storage.getItem("defora_midi_mappings");
     if (stored) {
       const mappings = JSON.parse(stored);
       if (Array.isArray(mappings) && mappings.length > 0) {
         this.midi.mappings = mappings;
         console.log("Loaded MIDI mappings from localStorage", mappings);
       }
     }
   } catch (e) {
     console.error("Failed to load MIDI mappings", e);
   }
 },
 saveMidiMappings() {
   const storage = (typeof window !== 'undefined' && window.localStorage) || 
                  (typeof global !== 'undefined' && global.window && global.window.localStorage);
   if (!storage) return false;
   try {
     storage.setItem("defora_midi_mappings", JSON.stringify(this.midi.mappings));
     console.log("Saved MIDI mappings to localStorage", this.midi.mappings);
     return true;
   } catch (e) {
     console.error("Failed to save MIDI mappings", e);
     return false;
   }
 },
 addMidiMapping() {
   this.midi.mappings.push({ control: "New Mapping", cc: 0, key: "" });
   this.saveMidiMappings();
 },
 deleteMidiMapping(index) {
   this.midi.mappings.splice(index, 1);
   this.saveMidiMappings();
 },
 updateMidiMapping(map) {
   this.saveMidiMappings();
   return map;
 },
 loadBindings() {
   try {
     const storage = (typeof window !== 'undefined' && window.localStorage) || null;
     if (!storage) return;
     const saved = storage.getItem("defora_key_bindings");
     if (saved) {
       const parsed = JSON.parse(saved);
       if (parsed && typeof parsed === "object") {
         this.keyBindings = { ...this.keyBindings, ...parsed };
       }
     }
   } catch(_e) {}
 },
 saveBindings() {
   try {
     const storage = (typeof window !== 'undefined' && window.localStorage) || null;
     if (!storage) return;
     storage.setItem("defora_key_bindings", JSON.stringify(this.keyBindings));
   } catch(_e) {}
 },
 toggleBindingLearn() {
   this.bindingLearnMode = !this.bindingLearnMode;
   this.bindingTargetKey = null;
   if (!this.bindingLearnMode) {
     this.status = "Learn mode disabled";
   } else {
     this.status = "Learn mode: press key or move MIDI CC, then click a parameter";
   }
 },
 resetBindings() {
   if (!confirm("Reset all bindings to defaults?")) return;
   this.keyBindings = {
     "translation_z": "w",
     "translation_x": "a",
     "translation_y": "s",
     "rotation_y": "d",
     "rotation_z": "q",
     "fov": "e",
     "cfg": "z",
     "strength": "x",
     "noise_multiplier": "c",
   };
   this.saveBindings();
   this.status = "Bindings reset to defaults";
 },
 getKeyBinding(key) {
   return this.keyBindings[key] || null;
 },
 clearKeyBinding(key) {
   delete this.keyBindings[key];
   this.saveBindings();
 },
 getMidiBinding(key) {
   const m = this.midi.mappings.find(m => m.key === key);
   return m ? m.cc : null;
 },
 clearMidiBinding(key) {
   const idx = this.midi.mappings.findIndex(m => m.key === key);
   if (idx >= 0) {
     this.midi.mappings.splice(idx, 1);
     this.saveMidiMappings();
   }
 },
 getParamValue(key) {
   const all = [...this.liveVibe, ...this.liveCam];
   const p = all.find(p => p.key === key);
   return p ? p.val : 0;
 },
 queueLiveParam(key, val) {
   const all = [...this.liveVibe, ...this.liveCam];
   const p = all.find(p => p.key === key);
   if (p) {
     p.val = val;
     this.sendControl("liveParam", { [key]: val });
   }
 },
 // Preset management methods
 async refreshPresets() {
   try {
     const { data } = await apiFetch("/api/presets", {}, "presets list");
     this.availablePresets = data.presets || [];
   } catch (_) {}
 },
 async loadPreset(name) {
   try {
     const res = await fetch(`/api/presets/${name}`);
     const data = await res.json();
     if (data.preset) {
       // Apply preset to current state
       if (data.preset.liveVibe) this.liveVibe = data.preset.liveVibe;
       if (data.preset.liveCam) this.liveCam = data.preset.liveCam;
       if (data.preset.audio) Object.assign(this.audio, data.preset.audio);
       if (data.preset.cn) Object.assign(this.cn, data.preset.cn);
       if (data.preset.lfos) this.lfos = data.preset.lfos;
       if (data.preset.macrosRack) this.macrosRack = data.preset.macrosRack;
       if (data.preset.loras) {
         this.loras.groupA = data.preset.loras.groupA || [];
         this.loras.groupB = data.preset.loras.groupB || [];
         // Sync selection state without fetching (data already restored)
         await this.refreshLoras();
       }
       if (data.preset.prompts) {
         Object.assign(this.prompts, data.preset.prompts);
       }
       this.currentPreset = name;
       this.presetStatus = `Loaded preset: ${name}`;
       setTimeout(() => { this.presetStatus = ""; }, 3000);
     }
   } catch (err) {
     console.error("Failed to load preset", err);
     this.presetStatus = `Error loading preset: ${err.message}`;
   }
 },
 async saveCurrentPreset() {
   const name = this.newPresetName || "untitled";
   const preset = {
     liveVibe: this.liveVibe,
     liveCam: this.liveCam,
     audio: { bpm: this.audio.bpm, track: this.audio.track },
     cn: { slots: this.cn.slots, active: this.cn.active },
     loras: {
       groupA: this.loras.groupA,
       groupB: this.loras.groupB,
     },
     prompts: {
       pos: this.prompts.pos,
       neg: this.prompts.neg,
       morphOn: this.prompts.morphOn,
       crossfaderValue: this.prompts.crossfaderValue,
     },
     lfos: this.lfos,
     macrosRack: this.macrosRack,
     paramSources: this.paramSources,
   };
   try {
     const res = await fetch(`/api/presets/${name}`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(preset),
     });
     const data = await res.json();
     if (data.ok) {
       this.currentPreset = name;
       this.presetStatus = `Saved preset: ${name}`;
       this.newPresetName = "";
       await this.refreshPresets();
       setTimeout(() => { this.presetStatus = ""; }, 3000);
     }
   } catch (err) {
     console.error("Failed to save preset", err);
     this.presetStatus = `Error saving preset: ${err.message}`;
   }
 },
 async deletePreset(name) {
   if (!confirm(`Delete preset "${name}"?`)) return;
   try {
     await fetch(`/api/presets/${name}`, { method: "DELETE" });
     this.currentPreset = null;
     this.presetStatus = `Deleted preset: ${name}`;
     await this.refreshPresets();
     setTimeout(() => { this.presetStatus = ""; }, 3000);
   } catch (err) {
     console.error("Failed to delete preset", err);
     this.presetStatus = `Error deleting preset: ${err.message}`;
   }
 },
 invalidateAudioSpectrogram() {
   this._spectrogramGen = (this._spectrogramGen || 0) + 1;
   this.audioSpectrogramDataUrl = null;
    this.audioSpectrogramStatus = "";
  },
  buildSpectrogramRgba(audioBuffer, opts) {
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const channelData = audioBuffer.getChannelData(0);
    
    // Adaptive FFT size based on audio length
    const fftSize = length >= 8192 ? 1024 : Math.max(256, Math.pow(2, Math.floor(Math.log2(length / 4))));
    const hopSize = fftSize / 2;
    const numFrames = Math.max(1, Math.floor((length - fftSize) / hopSize) + 1);
    const numBins = fftSize / 2;
    
    const width = Math.max(64, numFrames);
    const height = Math.max(32, Math.min(numBins, 128));
    const data = new Uint8ClampedArray(width * height * 4);
    
    // Step frame positions evenly across the audio
    const step = Math.max(1, numFrames / width);
    
    for (let x = 0; x < width; x++) {
      const frameStart = Math.floor(x * step);
      const offset = frameStart * hopSize;
      
      // Apply Hann window and compute DFT for each frequency bin
      for (let y = 0; y < height; y++) {
        let real = 0;
        let imag = 0;
        
        for (let n = 0; n < fftSize; n++) {
          const idx = offset + n;
          if (idx >= length) break;
          
          const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (fftSize - 1)));
          const sample = channelData[idx] * window;
          
          const angle = (2 * Math.PI * y * n) / fftSize;
          real += sample * Math.cos(angle);
          imag -= sample * Math.sin(angle);
        }
        
        const magnitude = Math.sqrt(real * real + imag * imag) / fftSize;
        const intensity = Math.min(1, magnitude * 10); // Scale up for visibility
        
        // Convert to color (blue -> cyan -> green -> yellow -> red)
        const idx4 = (y * width + x) * 4;
        if (intensity < 0.25) {
          data[idx4] = 0;
          data[idx4 + 1] = Math.floor(intensity * 4 * 255);
          data[idx4 + 2] = 255;
        } else if (intensity < 0.5) {
          data[idx4] = 0;
          data[idx4 + 1] = 255;
          data[idx4 + 2] = Math.floor((1 - (intensity - 0.25) * 4) * 255);
        } else if (intensity < 0.75) {
          data[idx4] = Math.floor((intensity - 0.5) * 4 * 255);
          data[idx4 + 1] = 255;
          data[idx4 + 2] = 0;
        } else {
          data[idx4] = 255;
          data[idx4 + 1] = Math.floor((1 - (intensity - 0.75) * 4) * 255);
          data[idx4 + 2] = 0;
        }
        data[idx4 + 3] = 255; // Alpha
      }
    }
    
    return { width, height, data };
  },
  spectrogramRgbaToDataUrl(rgba) {
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(rgba.width, rgba.height);
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(rgba.width, rgba.height);
      imageData.data.set(rgba.data);
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }
    
    // Fallback for environments without OffscreenCanvas
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = rgba.width;
      canvas.height = rgba.height;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(rgba.width, rgba.height);
      imageData.data.set(rgba.data);
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL("image/png");
    }
    
    return null;
  },
  scheduleAudioSpectrogramDecode(expectedGen) {
   if (typeof setTimeout !== "function") return;
   setTimeout(() => {
     this.runAudioSpectrogramFromObjectUrl(expectedGen).catch(() => {});
   }, 0);
 },
 async runAudioSpectrogramFromObjectUrl(expectedGen) {
   const AC = typeof AudioContext !== "undefined" ? AudioContext : typeof webkitAudioContext !== "undefined" ? webkitAudioContext : null;
   if (!AC || !this.audio.objectUrl || typeof fetch !== "function") {
     if (expectedGen === this._spectrogramGen) this.audioSpectrogramStatus = "";
     return;
   }
   if (expectedGen !== this._spectrogramGen) return;
   let ctx = null;
   try {
     const res = await fetch(this.audio.objectUrl);
     const ab = await res.arrayBuffer();
     if (expectedGen !== this._spectrogramGen) return;
     ctx = new AC();
     const audioBuf = await ctx.decodeAudioData(ab.slice(0));
     if (expectedGen !== this._spectrogramGen) return;
      const rgba = this.buildSpectrogramRgba(audioBuf, {});
     if (!rgba) {
       this.audioSpectrogramStatus = "";
       return;
     }
      const dataUrl = this.spectrogramRgbaToDataUrl(rgba);
     if (expectedGen !== this._spectrogramGen) return;
     this.audioSpectrogramDataUrl = dataUrl;
     this.audioSpectrogramStatus = dataUrl ? "" : "";
   } catch (_e) {
     if (expectedGen === this._spectrogramGen) this.audioSpectrogramStatus = "";
   } finally {
     try {
       if (ctx && typeof ctx.close === "function") await ctx.close();
     } catch (_e2) {
       /* ignore */
     }
   }
 },
  spectrogramFromAudioBuffer(audioBuffer, opts) {
    return this.buildSpectrogramRgba(audioBuffer, opts || {});
  },
 disposeLiveAudioAnalyser() {
   if (this._liveSpecRaf != null && typeof cancelAnimationFrame === "function") {
     cancelAnimationFrame(this._liveSpecRaf);
   }
   this._liveSpecRaf = null;
   const el = this.$refs && this.$refs.avSyncAudio;
   if (el && this._liveSpecMediaHandlers) {
     const h = this._liveSpecMediaHandlers;
     if (h.play) el.removeEventListener("play", h.play);
     if (h.pause) el.removeEventListener("pause", h.pause);
     this._liveSpecMediaHandlers = null;
   }
   try {
     if (this._liveSpecSource && typeof this._liveSpecSource.disconnect === "function") this._liveSpecSource.disconnect();
   } catch (_e) {
     /* ignore */
   }
   try {
     if (this._liveSpecAnalyser && typeof this._liveSpecAnalyser.disconnect === "function") this._liveSpecAnalyser.disconnect();
   } catch (_e2) {
     /* ignore */
   }
   try {
     if (this._liveSpecGain && typeof this._liveSpecGain.disconnect === "function") this._liveSpecGain.disconnect();
   } catch (_e3) {
     /* ignore */
   }
   const ctx = this._liveSpecCtx;
   this._liveSpecCtx = null;
   this._liveSpecSource = null;
   this._liveSpecAnalyser = null;
   this._liveSpecGain = null;
   this._liveSpecFreqBuf = null;
   if (ctx && typeof ctx.close === "function") {
     try {
       void ctx.close();
     } catch (_e4) {
       /* ignore */
     }
   }
 },
 setupLiveAudioAnalyser() {
   const AC = typeof AudioContext !== "undefined" ? AudioContext : typeof webkitAudioContext !== "undefined" ? webkitAudioContext : null;
   if (!AC) return;
   this.disposeLiveAudioAnalyser();
   const el = this.$refs && this.$refs.avSyncAudio;
   if (!el || !this.audio.objectUrl) return;
   try {
     const ctx = new AC();
     const source = ctx.createMediaElementSource(el);
     const analyser = ctx.createAnalyser();
     analyser.fftSize = 1024;
     analyser.smoothingTimeConstant = 0.78;
     const gain = ctx.createGain();
     gain.gain.value = 1;
     source.connect(analyser);
     analyser.connect(gain);
     gain.connect(ctx.destination);
     this._liveSpecCtx = ctx;
     this._liveSpecSource = source;
     this._liveSpecAnalyser = analyser;
     this._liveSpecGain = gain;
     this._liveSpecFreqBuf = new Uint8Array(analyser.frequencyBinCount);
     const onPlay = () => this.onLiveAudioPlay();
     const onPause = () => this.onLiveAudioPause();
     el.addEventListener("play", onPlay);
     el.addEventListener("pause", onPause);
     this._liveSpecMediaHandlers = { play: onPlay, pause: onPause };
     if (!el.paused) this.onLiveAudioPlay();
   } catch (_e) {
     this.disposeLiveAudioAnalyser();
   }
 },
 onLiveAudioPlay() {
   try {
     if (this._liveSpecCtx && this._liveSpecCtx.state === "suspended" && typeof this._liveSpecCtx.resume === "function") {
       void this._liveSpecCtx.resume();
     }
   } catch (_e) {
     /* ignore */
   }
   this.scheduleLiveSpectrumFrame();
 },
 onLiveAudioPause() {
   if (this._liveSpecRaf != null && typeof cancelAnimationFrame === "function") {
     cancelAnimationFrame(this._liveSpecRaf);
   }
   this._liveSpecRaf = null;
   this.paintLiveSpectrumCanvases(null);
 },
 scheduleLiveSpectrumFrame() {
   if (this._liveSpecRaf != null) return;
   if (typeof requestAnimationFrame !== "function") return;
   this._liveSpecRaf = requestAnimationFrame(() => {
     this._liveSpecRaf = null;
     const el = this.$refs && this.$refs.avSyncAudio;
     const analyser = this._liveSpecAnalyser;
     const buf = this._liveSpecFreqBuf;
     if (!analyser || !buf) return;
     if (el && !el.paused && !el.ended) {
       analyser.getByteFrequencyData(buf);
       this.paintLiveSpectrumCanvases(buf);
       this.scheduleLiveSpectrumFrame();
     } else {
       this.paintLiveSpectrumCanvases(null);
     }
   });
 },
 paintLiveSpectrumCanvases(freqBytes) {
   const canvases = [this.$refs.liveSpectrumCanvas, this.$refs.liveSpectrumCanvasStrip].filter(Boolean);
   for (const c of canvases) {
     if (!c || !c.getContext) continue;
     const ctx2 = c.getContext("2d");
     if (!ctx2) continue;
     const w = c.width || 280;
     const h = c.height || 56;
     if (!freqBytes || !freqBytes.length) {
       ctx2.fillStyle = "#031b2d";
       ctx2.fillRect(0, 0, w, h);
       continue;
     }
     paintLiveSpectrumBandBars(ctx2, freqBytes, w, h);
   }
 },
 // Audio file upload methods
 async handleAudioUpload(evt) {
   const file = evt.target.files[0];
   if (!file) return;
   this.disposeLiveAudioAnalyser();
   this.invalidateAudioSpectrogram();
   const maxSizeBytes = 50 * 1024 * 1024; // 50MB
   if (file.size != null && file.size > maxSizeBytes) {
     this.audioStatus = "Audio file is too large. Maximum supported size is 50MB.";
     if (evt && evt.target) {
       evt.target.value = "";
     }
     return;
   }
   if (this.audio.objectUrl) {
     try {
       URL.revokeObjectURL(this.audio.objectUrl);
     } catch (_e) {}
     this.audio.objectUrl = null;
   }
   if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function" && typeof Blob !== "undefined" && file instanceof Blob) {
     try {
       this.audio.objectUrl = URL.createObjectURL(file);
     } catch (_e) {
       this.audio.objectUrl = null;
     }
   }
   this.audioStatus = "Uploading audio…";
   try {
     const data = await new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => resolve(reader.result);
       reader.onerror = () => reject(reader.error || new Error("Failed to read audio file. Ensure the file is under 50MB and try again."));
       reader.readAsDataURL(file);
     });
     const res = await fetch("/api/audio-upload", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ name: file.name, data }),
     });
     const json = await res.json();
     if (!res.ok || json.error) {
       throw new Error(json.error || "Upload failed");
     }
     this.audio.uploadedFile = file.name;
     this.audio.track = json.path || file.name;
     this.audioStatus = "Audio uploaded";
     const gen = this._spectrogramGen;
     if (this.audio.objectUrl) {
       this.audioSpectrogramStatus = "Analyzing…";
       this.scheduleAudioSpectrogramDecode(gen);
     }
     const scheduleSetup = () => {
       try {
         this.setupLiveAudioAnalyser();
       } catch (_e) {
         /* ignore */
       }
     };
     if (typeof this.$nextTick === "function") this.$nextTick(scheduleSetup);
     else setTimeout(scheduleSetup, 0);
   } catch (err) {
     if (this.audio.objectUrl) {
       try {
         URL.revokeObjectURL(this.audio.objectUrl);
       } catch (_e2) {}
       this.audio.objectUrl = null;
     }
     this.audioStatus = String(err && err.message ? err.message : err);
     console.error("Audio upload failed:", err);
     this.invalidateAudioSpectrogram();
     this.disposeLiveAudioAnalyser();
   }
 },
 clearAudioFile() {
   this.disposeLiveAudioAnalyser();
   this.invalidateAudioSpectrogram();
   this.audio.uploadedFile = null;
   this.audio.track = "";
   if (this.audio.objectUrl) {
     try {
       URL.revokeObjectURL(this.audio.objectUrl);
     } catch (_e) {}
     this.audio.objectUrl = null;
   }
   this.avSyncEnabled = false;
   const a = this.$refs.avSyncAudio;
   if (a) {
     try {
       if (typeof a.pause === "function") a.pause();
     } catch (_e) {
       /* jsdom / headless may not implement media pause */
     }
   }
   this.audioStatus = "Idle";
   if (this.$refs.audioFileInput) {
     this.$refs.audioFileInput.value = "";
   }
 },
 // ControlNet methods
 async loadControlNetModels() {
   try {
     const { data } = await apiFetch("/api/controlnet/models", {}, "controlnet models");
     this.cn.availableModels = data.models || [];
     this.cn.source = data.source || "unknown";
   } catch (_) {}
 },
 updateControlNet(slot) {
   // Send ControlNet parameters to mediator
   const payload = {
     controlnet_slot: slot.id,
     controlnet_model: slot.model,
     controlnet_weight: slot.weight,
     controlnet_start: slot.start,
     controlnet_end: slot.end,
     controlnet_enabled: slot.enabled,
   };
   this.sendControl("controlNet", payload);
   console.log("Updated ControlNet slot:", slot.id, payload);
 },
 uploadControlNetImage(slot) {
   this.cn.active = slot.id;
   const input = this.$refs.cnImageInput;
   if (input) input.click();
 },
 onControlNetFileSelected(evt) {
   const file = evt.target.files && evt.target.files[0];
   if (!file) return;
   const formData = new FormData();
   formData.append("image", file);
   formData.append("slot", this.cn.active);
   fetch("/api/controlnet/upload-image", { method: "POST", body: formData })
     .then((r) => r.json())
     .then((data) => {
       if (data.error) console.error("ControlNet upload:", data.error);
     })
     .catch((err) => console.error("ControlNet upload failed", err));
   evt.target.value = "";
 },
 async toggleWebcam() {
   if (this.cn.webcamActive) this.stopWebcam();
   else await this.startWebcam();
 },
 async startWebcam() {
   try {
     const stream = await navigator.mediaDevices.getUserMedia({
       video: { width: 512, height: 512, facingMode: "user" },
     });
     this.cn.webcamStream = stream;
     this.cn.webcamActive = true;
     const videoEl = this.$refs.webcamVideo;
     if (videoEl) {
       videoEl.srcObject = stream;
       videoEl.style.display = "block";
       this.cn.webcamVideo = videoEl;
     }
     const canvasEl = this.$refs.webcamCanvas;
     if (canvasEl) {
       this.cn.webcamCanvas = canvasEl;
       canvasEl.width = 512;
       canvasEl.height = 512;
     }
     this.cn.webcamCaptureInterval = setInterval(() => this.captureWebcamFrame(), this.webcamCaptureRate);
   } catch (err) {
     console.error("Failed to start webcam:", err);
     alert("Could not access webcam. Check browser permissions.");
   }
 },
 stopWebcam() {
   if (this.cn.webcamCaptureInterval) {
     clearInterval(this.cn.webcamCaptureInterval);
     this.cn.webcamCaptureInterval = null;
   }
   if (this.cn.webcamStream) {
     this.cn.webcamStream.getTracks().forEach((t) => t.stop());
     this.cn.webcamStream = null;
   }
   const videoEl = this.$refs.webcamVideo;
   if (videoEl) {
     videoEl.style.display = "none";
     videoEl.srcObject = null;
   }
   this.cn.webcamActive = false;
 },
 captureWebcamFrame() {
   const video = this.cn.webcamVideo;
   const canvas = this.cn.webcamCanvas;
   if (!video || !canvas || video.readyState < 2) return;
   const ctx = canvas.getContext("2d");
   ctx.drawImage(video, 0, 0, 512, 512);
   canvas.toBlob(async (blob) => {
     if (!blob) return;
     const activeSlot = this.cn.slots.find((s) => s.id === this.cn.active);
     if (!activeSlot || activeSlot.imageSource !== "webcam") return;
     const formData = new FormData();
     formData.append("image", blob, "webcam_frame.png");
     formData.append("slot", this.cn.active);
     try {
       await fetch("/api/controlnet/upload-image", { method: "POST", body: formData });
     } catch (err) {
       console.error("Webcam frame upload failed:", err);
     }
   }, "image/png");
 },
 async startScreenCapture() {
   try {
     const stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: 512, height: 512 } });
     const video = document.createElement("video");
     video.srcObject = stream;
     video.autoplay = true;
     video.playsInline = true;
     const canvas = document.createElement("canvas");
     canvas.width = 512;
     canvas.height = 512;
     const captureInterval = setInterval(() => {
       if (video.readyState < 2) return;
       canvas.getContext("2d").drawImage(video, 0, 0, 512, 512);
       canvas.toBlob(async (blob) => {
         if (!blob) return;
         const activeSlot = this.cn.slots.find((s) => s.id === this.cn.active);
         if (!activeSlot || activeSlot.imageSource !== "screen") return;
         const formData = new FormData();
         formData.append("image", blob, "screen_capture.png");
         formData.append("slot", this.cn.active);
         try {
           await fetch("/api/controlnet/upload-image", { method: "POST", body: formData });
         } catch (err) {
           console.error("Screen capture upload failed:", err);
         }
       }, "image/png");
     }, this.webcamCaptureRate);
     stream.getVideoTracks()[0].onended = () => clearInterval(captureInterval);
   } catch (err) {
     console.error("Failed to start screen capture:", err);
     alert("Could not start screen capture. Check browser permissions.");
   }
 },
 handleMidi(input, msg) {
   const [status, cc, value] = msg.data;
   const isCC = (status & 0xf0) === 0xb0;
   if (!isCC) return;
   const mapping = this.midi.mappings.find((m) => m.cc === cc);
   const norm = value / 127;
   if (mapping && mapping.key) {
     const target = this.midiTarget(mapping.key);
     if (target) {
       const scaled = target.min + norm * (target.max - target.min);
       this.sendControl("liveParam", { [target.key]: scaled });
     } else {
       this.sendControl("liveParam", { [mapping.key]: norm });
     }
   }
 },
 sortedKeyframes(tr) {
   return [...(tr.keyframes || [])].sort((a, b) => a.t - b.t);
 },
 setKeyframeEasing(kf, mode) {
   if (!kf) return;
   kf.easing = mode === "linear" ? undefined : mode;
 },
 sequencerEaseT(u, mode) {
   const uu = Math.min(1, Math.max(0, u));
   const m = mode || "linear";
   if (m === "easeIn") return uu * uu * uu;
   if (m === "easeOut") return 1 - (1 - uu) ** 3;
   if (m === "easeInOut") {
     if (uu < 0.5) return 4 * uu * uu * uu;
     return 1 - (-2 * uu + 2) ** 3 / 2;
   }
   return uu;
 },
 sequencerPayload() {
   const markers = Array.isArray(this.sequencer.markers)
     ? [...this.sequencer.markers]
         .map((m) => ({ t: Number(m.t), name: String(m.name || "").trim(), action: m.action || "jump", target: m.target || "" }))
         .filter((m) => m.name && Number.isFinite(m.t))
         .sort((a, b) => a.t - b.t)
     : [];
   return {
     version: 1,
     durationSec: Number(this.sequencer.durationSec),
     fps: Number(this.sequencer.fps),
     loop: !!this.sequencer.loop,
     markers,
     tracks: this.sequencer.tracks.map((tr) => ({
       id: tr.id,
       param: tr.param,
       keyframes: [...tr.keyframes].sort((a, b) => a.t - b.t),
     })),
   };
 },
 clampSequencerMarkers() {
   const d = Number(this.sequencer.durationSec) || 0;
   const arr = this.sequencer.markers;
   if (!Array.isArray(arr)) return;
   for (const m of arr) {
     if (!m || typeof m.t !== "number") continue;
     if (m.t < 0) m.t = 0;
     if (m.t > d) m.t = d;
   }
 },
 clampSequencerPlayhead() {
   const d = Number(this.sequencer.durationSec) || 0;
   if (this.sequencerPlayhead < 0) this.sequencerPlayhead = 0;
   if (this.sequencerPlayhead > d) this.sequencerPlayhead = d;
   this.clampSequencerMarkers();
 },
 addSequencerMarker() {
   this.clampSequencerPlayhead();
   const d = Number(this.sequencer.durationSec) || 0;
   let name = (this.sequencerMarkerName || "").trim() || "Scene";
   if (name.length > 48) name = name.slice(0, 48);
   if (!/^[a-zA-Z0-9_ \-.]+$/.test(name)) {
     this.sequencerStatus = "Marker label: letters, digits, space, underscore, hyphen, dot only";
     return;
   }
   if (!Array.isArray(this.sequencer.markers)) this.sequencer.markers = [];
   if (this.sequencer.markers.length >= 64) {
     this.sequencerStatus = "Maximum 64 markers";
     return;
   }
   const t = Math.min(Math.max(0, this.sequencerPlayhead), d);
   this.sequencer.markers.push({ t, name, action: "jump", target: "" });
   this.sequencerStatus = "";
 },
 removeSequencerMarker(sortedIdx) {
   const sorted = this.sortedSequencerMarkers;
   const victim = sorted[sortedIdx];
   if (!victim || !Array.isArray(this.sequencer.markers)) return;
   const ix = this.sequencer.markers.indexOf(victim);
   if (ix >= 0) this.sequencer.markers.splice(ix, 1);
 },
 jumpToSequencerMarker(m) {
   if (!m || typeof m.t !== "number") return;
   const d = Number(this.sequencer.durationSec) || 0;
   this.sequencerPlayhead = Math.min(Math.max(0, m.t), d);
   this.previewSequencerFrame();
 },
 setMarkerAction(m, action) {
   if (!m) return;
   m.action = action;
   if (action === "jump" || action === "generate" || action === "pause") {
     m.target = "";
   }
 },
 setMarkerTarget(m, target) {
   if (!m) return;
   m.target = target;
 },
 markerActionPlaceholder(action) {
   switch (action) {
     case "preset": return "Preset name";
     case "morph": return "Slot #";
     case "param": return '{"param": value}';
     default: return "";
   }
 },
 markerActionTitle(action) {
   switch (action) {
     case "preset": return "Name of a motion preset (e.g. Orbit, Zoom)";
     case "morph": return "Morph slot number to toggle (1, 2, 3...)";
     case "param": return 'JSON object of params to apply (e.g. {"zoom": 1.5})';
     default: return "";
   }
 },
 interpolateTrack(tr, tSec) {
   const dur = Number(this.sequencer.durationSec) || 0;
   const t = Math.min(Math.max(0, tSec), dur);
   const kf = this.sortedKeyframes(tr);
   if (!kf.length) return null;
   if (t <= kf[0].t) return kf[0].v;
   if (t >= kf[kf.length - 1].t) return kf[kf.length - 1].v;
   let i = 0;
   while (i < kf.length - 1 && kf[i + 1].t < t) i += 1;
   const a = kf[i];
   const b = kf[i + 1];
   if (!b) return a.v;
   const span = b.t - a.t;
   if (span <= 0) return a.v;
   const u = (t - a.t) / span;
   if (a.hIn !== undefined || a.hOut !== undefined || b.hIn !== undefined || b.hOut !== undefined) {
     const hOut = a.hOut != null ? a.hOut : 0.33;
     const hIn = b.hIn != null ? b.hIn : 0.67;
     const vOut = a.hOutV != null ? a.hOutV : a.v + (b.v - a.v) * 0.33;
     const vIn = b.hInV != null ? b.hInV : a.v + (b.v - a.v) * 0.67;
     return this.cubicBezier(u, a.v, vOut, vIn, b.v);
   }
   const ease = a.easing || "linear";
   const w = this.sequencerEaseT(u, ease);
   return a.v + w * (b.v - a.v);
 },
 cubicBezier(t, p0, p1, p2, p3) {
   const mt = 1 - t;
   return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
 },
 applySequencerAt(tSec) {
   const payload = {};
   const cnUpdates = {};
   for (const tr of this.sequencer.tracks) {
     const v = this.interpolateTrack(tr, tSec);
     if (v === null || !Number.isFinite(v)) continue;
     if (tr.param.startsWith("cn_")) {
       const parts = tr.param.split("_");
       const slotId = parts[1];
       const field = parts[2];
       const slot = this.cn.slots.find(s => s.id === slotId);
       if (slot) {
         if (field === "weight") slot.weight = Math.min(2, Math.max(0, v));
         else if (field === "start") slot.start = Math.min(1, Math.max(0, v));
         else if (field === "end") slot.end = Math.min(1, Math.max(0, v));
         if (!cnUpdates[slotId]) cnUpdates[slotId] = slot;
       }
     } else {
       payload[tr.param] = v;
     }
   }
   if (Object.keys(payload).length) this.sendControl("liveParam", payload);
   Object.values(cnUpdates).forEach(slot => this.updateControlNet(slot));
 },
 previewSequencerFrame() {
   this.clampSequencerPlayhead();
   if (!this.ws || this.ws.readyState !== 1) return;
   this.applySequencerAt(this.sequencerPlayhead);
 },
 tickSequencer() {
   const dur = Number(this.sequencer.durationSec) || 0;
   const dt = 1 / Math.max(1, Number(this.sequencer.fps) || 24);
   let next = this.sequencerPlayhead + dt;
   const prev = this.sequencerPlayhead;
   if (next >= dur - 1e-9) {
     if (this.sequencer.loop) next = 0;
     else {
       this.sequencerPlayhead = dur;
       this.applySequencerAt(this.sequencerPlayhead);
       this.stopSequencerPlayback();
       return;
     }
   }
   this.sequencerPlayhead = next;
   this.applySequencerAt(this.sequencerPlayhead);
   const markers = (this.sequencer.markers || []);
   for (const m of markers) {
     if (m.t > prev && m.t <= next) {
       this.triggerMarkerAction(m);
     }
   }
 },
 triggerMarkerAction(m) {
   if (!m || !m.action) return;
   switch (m.action) {
     case "jump":
       this.sequencerPlayhead = m.t;
       this.previewSequencerFrame();
       break;
     case "preset":
       if (m.target && this.motionPresets[m.target]) {
         this.sendPreset(m.target);
         this.sequencerStatus = `Marker: applied preset "${m.target}"`;
       }
       break;
     case "generate":
       this.generateStory();
       this.sequencerStatus = `Marker: triggered generation`;
       break;
     case "morph":
       if (m.target) {
         const slotIdx = parseInt(m.target) - 1;
         if (slotIdx >= 0 && slotIdx < this.morphSlots.length) {
           this.morphSlots[slotIdx].on = !this.morphSlots[slotIdx].on;
           this.applyPromptMorphing();
           this.sequencerStatus = `Marker: toggled morph slot ${m.target}`;
         }
       }
       break;
     case "param":
       try {
         const params = JSON.parse(m.target || "{}");
         this.sendControl("liveParam", params);
         this.sequencerStatus = `Marker: applied params`;
       } catch (_e) {
         this.sequencerStatus = `Marker: invalid param JSON`;
       }
       break;
     case "pause":
       this.stopSequencerPlayback();
       this.sequencerStatus = `Marker: paused at "${m.name}"`;
       break;
   }
 },
 toggleSequencerPlayback() {
   if (this.sequencerPlaying) {
     this.stopSequencerPlayback();
     return;
   }
   if (!this.ws || this.ws.readyState !== 1) {
     this.sequencerStatus = "WebSocket not connected";
     return;
   }
   if (!this.sequencer.tracks.length) {
     this.sequencerStatus = "Add at least one track with keyframes";
     return;
   }
   const hasKf = this.sequencer.tracks.some((tr) => tr.keyframes && tr.keyframes.length);
   if (!hasKf) {
     this.sequencerStatus = "Add keyframes to play";
     return;
   }
   this.sequencerPlaying = true;
   this.sequencerStatus = "";
   const ms = Math.max(16, Math.round(1000 / Math.max(1, Number(this.sequencer.fps) || 24)));
   this.sequencerTimer = setInterval(() => this.tickSequencer(), ms);
 },
 stopSequencerPlayback() {
   this.sequencerPlaying = false;
   if (this.sequencerTimer) {
     clearInterval(this.sequencerTimer);
     this.sequencerTimer = null;
   }
 },
 addSequencerTrack() {
   const param = this.sequencerNewParam;
   if (this.sequencer.tracks.some((x) => x.param === param)) {
     this.sequencerStatus = "Track already exists for " + param;
     return;
   }
   const id = "tr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
   this.sequencer.tracks.push({ id, param, keyframes: [] });
   this.sequencerSelectedTrackId = id;
   this.sequencerStatus = "";
 },
 removeSequencerTrack(id) {
   this.sequencer.tracks = this.sequencer.tracks.filter((x) => x.id !== id);
   if (this.sequencerSelectedTrackId === id) this.sequencerSelectedTrackId = null;
 },
 addSequencerKeyframe() {
   const tid = this.sequencerSelectedTrackId || (this.sequencer.tracks[0] && this.sequencer.tracks[0].id);
   const tr = this.sequencer.tracks.find((x) => x.id === tid);
   if (!tr) {
     this.sequencerStatus = "Add a track first";
     return;
   }
   this.clampSequencerPlayhead();
   const t = Math.min(Math.max(0, this.sequencerPlayhead), Number(this.sequencer.durationSec) || 0);
   const v = Number(this.sequencerKeyframeVal);
   if (Number.isNaN(v)) {
     this.sequencerStatus = "Invalid keyframe value";
     return;
   }
   tr.keyframes.push({ t, v });
   this.sequencerStatus = "";
 },
 removeSequencerKeyframe(trackId, sortedIdx) {
   const tr = this.sequencer.tracks.find((x) => x.id === trackId);
   if (!tr) return;
   const sorted = this.sortedKeyframes(tr);
   const victim = sorted[sortedIdx];
   if (!victim) return;
   const ix = tr.keyframes.indexOf(victim);
   if (ix >= 0) tr.keyframes.splice(ix, 1);
 },
 async refreshSequencerList() {
   if (typeof fetch !== "function") return;
   try {
     const res = await fetch("/api/sequencer");
     const j = await res.json();
     if (Array.isArray(j.timelines)) this.sequencerList = j.timelines;
   } catch (_e) {}
 },
 async saveSequencerTimeline() {
   const raw = (this.sequencerSaveName || "timeline").trim();
   const name = raw.replace(/[^a-zA-Z0-9_-]/g, "");
   if (!name) {
     this.sequencerStatus = "Invalid save name";
     return;
   }
   try {
     const res = await fetch("/api/sequencer/" + encodeURIComponent(name), {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(this.sequencerPayload()),
     });
     const j = await res.json();
     if (!res.ok) throw new Error(j.error || res.statusText);
     this.sequencerStatus = "Saved " + name;
     await this.refreshSequencerList();
   } catch (e) {
     this.sequencerStatus = String(e.message || e);
   }
 },
 async loadSequencerTimeline() {
   const name = this.sequencerLoadPick;
   if (!name) return;
   try {
     const res = await fetch("/api/sequencer/" + encodeURIComponent(name));
     const j = await res.json();
     if (!res.ok || !j.timeline) throw new Error(j.error || "load failed");
     const tl = j.timeline;
     if (tl.durationSec != null) this.sequencer.durationSec = tl.durationSec;
     if (tl.fps != null) this.sequencer.fps = tl.fps;
     this.sequencer.loop = tl.loop !== false;
     this.sequencer.markers = Array.isArray(tl.markers)
       ? tl.markers
           .map((m) => ({ t: Number(m.t), name: String(m.name || "").trim(), action: m.action || "jump", target: m.target || "" }))
           .filter((m) => m.name && Number.isFinite(m.t))
       : [];
     this.sequencer.tracks = Array.isArray(tl.tracks)
       ? tl.tracks.map((tr) => ({
           id: tr.id || "tr-" + Math.random().toString(36).slice(2),
           param: tr.param,
           keyframes: Array.isArray(tr.keyframes) ? tr.keyframes.slice() : [],
         }))
       : [];
     this.sequencerSaveName = name;
     this.sequencerSelectedTrackId = this.sequencer.tracks[0] ? this.sequencer.tracks[0].id : null;
     this.clampSequencerPlayhead();
     this.sequencerStatus = "Loaded " + name;
   } catch (e) {
     this.sequencerStatus = String(e.message || e);
   }
 },
 exportSequencerDownload() {
   const json = JSON.stringify(this.sequencerPayload(), null, 2);
   const blob = new Blob([json], { type: "application/json" });
   const base = (this.sequencerSaveName || "sequencer").replace(/[^a-zA-Z0-9_-]/g, "") || "sequencer";
   const a = document.createElement("a");
   a.href = URL.createObjectURL(blob);
   a.download = base + ".json";
   a.click();
   URL.revokeObjectURL(a.href);
 },
 getTrackValueAt(tr, t) {
   const kfs = this.sortedKeyframes(tr);
   if (!kfs.length) return 0;
   if (t <= kfs[0].t) return kfs[0].v;
   if (t >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].v;
   for (let i = 0; i < kfs.length - 1; i++) {
     if (t >= kfs[i].t && t <= kfs[i + 1].t) {
       const dur = kfs[i + 1].t - kfs[i].t;
       const u = dur > 0 ? (t - kfs[i].t) / dur : 0;
       const a = kfs[i];
       const b = kfs[i + 1];
       if (a.hIn !== undefined || a.hOut !== undefined || b.hIn !== undefined || b.hOut !== undefined) {
         const hOut = a.hOut != null ? a.hOut : 0.33;
         const hIn = b.hIn != null ? b.hIn : 0.67;
         const vOut = a.hOutV != null ? a.hOutV : a.v + (b.v - a.v) * 0.33;
         const vIn = b.hInV != null ? b.hInV : a.v + (b.v - a.v) * 0.67;
         return this.cubicBezier(u, a.v, vOut, vIn, b.v);
       }
       const eased = this.sequencerEaseT(u, a.easing);
       return a.v + (b.v - a.v) * eased;
     }
   }
   return kfs[kfs.length - 1].v;
 },
 drawTimeline() {
   const canvas = this.$refs.timelineCanvas;
   if (!canvas || !this.sequencer.tracks.length) return;
   const ctx = canvas.getContext("2d");
   const dpr = window.devicePixelRatio || 1;
   const rect = canvas.getBoundingClientRect();
   canvas.width = rect.width * dpr;
   canvas.height = Math.max(120, this.sequencer.tracks.length * 40 + 20) * dpr;
   ctx.scale(dpr, dpr);
   const w = rect.width;
   const h = rect.height;
   const dur = Math.max(0.01, Number(this.sequencer.durationSec) || 8);
   const laneH = (h - 20) / Math.max(1, this.sequencer.tracks.length);
   const trackColors = ["#2de2ff", "#ff53d9", "#5af2a9", "#ff8a1a", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"];
   ctx.clearRect(0, 0, w, h);
   ctx.fillStyle = "#031b2d";
   ctx.fillRect(0, 0, w, h);
   this.sequencer.tracks.forEach((tr, idx) => {
     const y = 20 + idx * laneH;
     const kfs = this.sortedKeyframes(tr);
     if (!kfs.length) {
       ctx.strokeStyle = "#1a3a52";
       ctx.lineWidth = 1;
       ctx.setLineDash([4, 4]);
       ctx.beginPath();
       ctx.moveTo(0, y + laneH / 2);
       ctx.lineTo(w, y + laneH / 2);
       ctx.stroke();
       ctx.setLineDash([]);
       ctx.fillStyle = "#3a5a78";
       ctx.font = "10px monospace";
       ctx.fillText(tr.param + " (no keyframes)", 6, y + laneH / 2 + 3);
       return;
     }
     let minV = Math.min(...kfs.map(k => k.v));
     let maxV = Math.max(...kfs.map(k => k.v));
     const range = maxV - minV || 1;
     minV -= range * 0.15;
     maxV += range * 0.15;
     const color = trackColors[idx % trackColors.length];
     ctx.strokeStyle = "#0c3048";
     ctx.lineWidth = 1;
     ctx.strokeRect(0, y, w, laneH);
     ctx.fillStyle = color + "20";
     ctx.fillRect(0, y, w, laneH);
     ctx.strokeStyle = color;
     ctx.lineWidth = 2;
     ctx.beginPath();
     const steps = Math.max(w, 100);
     for (let i = 0; i <= steps; i++) {
       const t = (i / steps) * dur;
       const v = this.getTrackValueAt(tr, t);
       const px = (t / dur) * w;
       const py = y + laneH - ((v - minV) / (maxV - minV)) * laneH;
       if (i === 0) ctx.moveTo(px, py);
       else ctx.lineTo(px, py);
     }
     ctx.stroke();
     kfs.forEach((kf, ki) => {
       const px = (kf.t / dur) * w;
       const v = kf.v;
       const py = y + laneH - ((v - minV) / (maxV - minV)) * laneH;
       if (ki < kfs.length - 1) {
         const next = kfs[ki + 1];
         const hOut = kf.hOut != null ? kf.hOut : 0.33;
         const hIn = next.hIn != null ? next.hIn : 0.67;
         const vOut = kf.hOutV != null ? kf.hOutV : v + (next.v - v) * 0.33;
         const vIn = next.hInV != null ? next.hInV : v + (next.v - v) * 0.67;
         const hasHandles = kf.hIn !== undefined || kf.hOut !== undefined || next.hIn !== undefined || next.hOut !== undefined;
         if (hasHandles) {
           const hOutPx = (kf.t + hOut * (next.t - kf.t)) / dur * w;
           const hOutPy = y + laneH - ((vOut - minV) / (maxV - minV)) * laneH;
           const hInPx = (next.t - (1 - hIn) * (next.t - kf.t)) / dur * w;
           const hInPy = y + laneH - ((vIn - minV) / (maxV - minV)) * laneH;
           ctx.strokeStyle = color + "60";
           ctx.lineWidth = 1;
           ctx.setLineDash([2, 2]);
           ctx.beginPath();
           ctx.moveTo(px, py);
           ctx.lineTo(hOutPx, hOutPy);
           ctx.stroke();
           ctx.beginPath();
           ctx.moveTo((next.t / dur) * w, y + laneH - ((next.v - minV) / (maxV - minV)) * laneH);
           ctx.lineTo(hInPx, hInPy);
           ctx.stroke();
           ctx.setLineDash([]);
           ctx.fillStyle = "#fff";
           ctx.beginPath();
           ctx.arc(hOutPx, hOutPy, 3, 0, Math.PI * 2);
           ctx.fill();
           ctx.beginPath();
           ctx.arc(hInPx, hInPy, 3, 0, Math.PI * 2);
           ctx.fill();
         }
       }
       ctx.fillStyle = color;
       ctx.beginPath();
       ctx.arc(px, py, 4, 0, Math.PI * 2);
       ctx.fill();
       ctx.fillStyle = "#fff";
       ctx.beginPath();
       ctx.arc(px, py, 2, 0, Math.PI * 2);
       ctx.fill();
     });
     ctx.fillStyle = "#5a8fb8";
     ctx.font = "9px monospace";
     ctx.fillText(tr.param, 4, y + 11);
   });
   const markers = (this.sequencer.markers || []);
   markers.forEach(m => {
     const px = (m.t / dur) * w;
     ctx.strokeStyle = "#ff4d6d80";
     ctx.lineWidth = 1;
     ctx.setLineDash([2, 3]);
     ctx.beginPath();
     ctx.moveTo(px, 20);
     ctx.lineTo(px, h);
     ctx.stroke();
     ctx.setLineDash([]);
     ctx.fillStyle = "#ff4d6d";
     ctx.font = "8px monospace";
     ctx.fillText(m.name, px + 3, 14);
   });
   const playX = (this.sequencerPlayhead / dur) * w;
   ctx.strokeStyle = "#fff";
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.moveTo(playX, 20);
   ctx.lineTo(playX, h);
   ctx.stroke();
   ctx.fillStyle = "#fff";
   ctx.beginPath();
   ctx.moveTo(playX - 5, 20);
   ctx.lineTo(playX + 5, 20);
   ctx.lineTo(playX, 26);
   ctx.closePath();
   ctx.fill();
   for (let i = 0; i <= 4; i++) {
     const t = (dur / 4) * i;
     const px = (t / dur) * w;
     ctx.fillStyle = "#3a5a78";
     ctx.font = "8px monospace";
     ctx.fillText(t.toFixed(1) + "s", px + 2, h - 2);
   }
 },
 seekTimeline(event) {
   const canvas = this.$refs.timelineCanvas;
   if (!canvas) return;
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const dur = Math.max(0.01, Number(this.sequencer.durationSec) || 8);
   this.sequencerPlayhead = Math.max(0, Math.min(dur, (x / rect.width) * dur));
   this.drawTimeline();
 },
 hoverTimeline(event) {
   const canvas = this.$refs.timelineCanvas;
   if (!canvas) return;
   const rect = canvas.getBoundingClientRect();
   const x = event.clientX - rect.left;
   const dur = Math.max(0.01, Number(this.sequencer.durationSec) || 8);
   this.timelineHoverTime = Math.max(0, Math.min(dur, (x / rect.width) * dur));
   this.timelineHoverPercent = (x / rect.width) * 100;
 },
 xyPadMouseDown(evt) {
   this.xyPad.dragging = true;
   this.updateXyPad(evt);
   evt.preventDefault();
 },
 xyPadMouseMove(evt) {
   if (!this.xyPad.dragging) return;
   this.updateXyPad(evt);
   evt.preventDefault();
 },
 xyPadMouseUp() {
   this.xyPad.dragging = false;
 },
 updateXyPad(evt) {
   const pad = evt.currentTarget;
   const rect = pad.getBoundingClientRect();
   let clientX, clientY;
   if (evt.touches && evt.touches.length > 0) {
     clientX = evt.touches[0].clientX;
     clientY = evt.touches[0].clientY;
   } else {
     clientX = evt.clientX;
     clientY = evt.clientY;
   }
   const x = Math.max(0, Math.min(this.xyPad.padSize, clientX - rect.left));
   const y = Math.max(0, Math.min(this.xyPad.padSize, clientY - rect.top));
   this.xyPad.x = x;
   this.xyPad.y = y;
   // Normalize pad coordinates to -1..1, then scale to translation range -10..10
   const normX = (x / this.xyPad.padSize) * 2 - 1;
   const normY = 1 - (y / this.xyPad.padSize) * 2;
   const TRANSLATION_RANGE = 10; // Max translation distance for camera movement
   const translation_x = normX * TRANSLATION_RANGE;
   const translation_y = normY * TRANSLATION_RANGE;
   this.queueLiveParam("translation_x", translation_x);
   this.queueLiveParam("translation_y", translation_y);
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 // LoRA management methods
 async refreshLoras() {
   try {
     const { data } = await apiFetch("/api/loras", {}, "loras list");
     if (data.loras) {
       this.loras.available = data.loras.map((lora) => ({
         id: lora.id || lora.name,
         name: lora.name,
         path: lora.path || "",
         thumbnail: lora.thumbnail || null,
         strength: lora.strength || 1.0,
         selected: false,
         group: null,
       }));
       this.loras.source = data.source || "unknown";
       // Restore selected loras from groups using Map for O(1) lookup
       const loraMap = new Map(this.loras.available.map(l => [l.id, l]));
       this.loras.groupA.forEach((savedLora) => {
         const found = loraMap.get(savedLora.id);
         if (found) {
           found.selected = true;
           found.group = "A";
           found.strength = savedLora.strength;
         }
       });
       this.loras.groupB.forEach((savedLora) => {
         const found = loraMap.get(savedLora.id);
         if (found) {
           found.selected = true;
           found.group = "B";
           found.strength = savedLora.strength;
         }
       });
     }
   } catch (err) {
     console.error("Failed to load LoRAs", err);
   }
 },
 toggleLoraSelection(lora) {
   if (lora.selected) {
     this.removeLoraSelection(lora);
   } else {
     lora.selected = true;
     lora.group = "A";
     this.assignLoraToGroup(lora, "A");
   }
 },
 assignLoraToGroup(lora, group) {
   if (group !== "A" && group !== "B") return;
   
   // Remove from both groups first
   this.loras.groupA = this.loras.groupA.filter((l) => l.id !== lora.id);
   this.loras.groupB = this.loras.groupB.filter((l) => l.id !== lora.id);
   
   // Add to target group
   lora.group = group;
   lora.selected = true;
   const loraData = {
     id: lora.id,
     name: lora.name,
     path: lora.path,
     strength: lora.strength,
     thumbnail: lora.thumbnail,
   };
   
   if (group === "A") {
     this.loras.groupA.push(loraData);
   } else {
     this.loras.groupB.push(loraData);
   }
 },
 removeLoraSelection(lora) {
   lora.selected = false;
   lora.group = null;
   this.loras.groupA = this.loras.groupA.filter((l) => l.id !== lora.id);
   this.loras.groupB = this.loras.groupB.filter((l) => l.id !== lora.id);
 },
 updateLoraStrength(lora) {
   // Update strength in groups as well
   const groupALora = this.loras.groupA.find((l) => l.id === lora.id);
   if (groupALora) {
     groupALora.strength = lora.strength;
   }
   const groupBLora = this.loras.groupB.find((l) => l.id === lora.id);
   if (groupBLora) {
     groupBLora.strength = lora.strength;
   }
 },
 updateCrossfader() {
   // Send crossfader value and update LoRA strengths
   this.sendControl("crossfader", {
     value: this.prompts.crossfaderValue,
     groupA: this.loras.groupA.map((l) => ({
       ...l,
       effectiveStrength: l.strength * (1 - this.prompts.crossfaderValue),
     })),
     groupB: this.loras.groupB.map((l) => ({
       ...l,
       effectiveStrength: l.strength * this.prompts.crossfaderValue,
     })),
   });
 },
 applyLoras() {
   const payload = {
     groupA: this.loras.groupA.map((l) => ({
       name: l.name,
       path: l.path,
       strength: l.strength * (1 - this.prompts.crossfaderValue),
     })),
     groupB: this.loras.groupB.map((l) => ({
       name: l.name,
       path: l.path,
       strength: l.strength * this.prompts.crossfaderValue,
     })),
     crossfaderValue: this.prompts.crossfaderValue,
   };
   this.sendControl("loras", payload);
   console.log("Applied LoRAs with crossfader", payload);
 },
 clearAllLoras() {
   this.loras.available.forEach((lora) => {
     lora.selected = false;
     lora.group = null;
   });
   this.loras.groupA = [];
   this.loras.groupB = [];
   this.sendControl("loras", { groupA: [], groupB: [], crossfaderValue: this.prompts.crossfaderValue });
 },

 // ─── Story Generator ─────────────────────────────────────────────────
 _genRnd(arr) {
   return arr[Math.floor(Math.random() * arr.length)];
 },
 _buildScene(theme, style, idx, total) {
   const r = (a) => this._genRnd(a);
   const g = this.genData;
   const mood = idx === 0 ? 'opening' : idx >= total - 1 ? 'closing' : idx < Math.ceil(total / 2) ? 'buildup' : 'climax';
   const adj = r(g.sceneDescriptors[mood]);
   const envPool = g.environments[idx % g.environments.length];
   const env = r(envPool);
   const light = r(g.lighting);
   const qual = r(g.quality);
   const tech = r(g.techSpecs);
   const artistPool = g.artists[style] || g.artists.default;
   const a1 = r(artistPool);
   let a2 = r(artistPool);
   for (let i = 0; i < 5 && a2 === a1 && artistPool.length > 1; i++) a2 = r(artistPool);
   const neg = r(g.negatives);
   return `A ${adj} scene from ${theme} — ${env}, ${light}. ${qual}, ${tech}, inspired by ${a1} and ${a2} --neg ${neg}`;
 },
 _buildMotion(numScenes, framesPerScene, totalFrames) {
   const g = this.genData;
   const r = Math.random.bind(Math);
   const behaviors = g.cameraBehaviors;
   const assigned = [];
   let last = null;
   for (let i = 0; i < numScenes; i++) {
     let b;
     let tries = 0;
     do { b = behaviors[Math.floor(r() * behaviors.length)]; tries++; }
     while (b === last && behaviors.length > 1 && tries < 10);
     assigned.push(b);
     last = b;
   }
   const zParts = [], txParts = [], tyParts = [], tcxParts = [], tcyParts = [];
   let prevTx = null, prevTy = null, prevTcx = null, prevTcy = null;
   for (let i = 0; i < numScenes; i++) {
     const frame = i * framesPerScene;
     const b = assigned[i];
     const zVal = b.zoom === 'BREATHE'
       ? `1.0025+0.002*sin(1.25*3.14*t/${framesPerScene})`
       : b.zoom;
     zParts.push(`${frame}:(${zVal})`);
     if (b.tx !== prevTx) { txParts.push(`${frame}:(${b.tx})`); prevTx = b.tx; }
     if (b.ty !== prevTy) { tyParts.push(`${frame}:(${b.ty})`); prevTy = b.ty; }
     const tcx = Math.round((0.3 + r() * 0.4) * 10) / 10;
     const tcy = Math.round((0.3 + r() * 0.4) * 10) / 10;
     if (tcx !== prevTcx) { tcxParts.push(`${frame}:(${tcx})`); prevTcx = tcx; }
     if (tcy !== prevTcy) { tcyParts.push(`${frame}:(${tcy})`); prevTcy = tcy; }
   }
   zParts.push(`${totalFrames}:(1.0)`);
   if (prevTx !== 0) txParts.push(`${totalFrames}:(0)`);
   if (prevTy !== 0) tyParts.push(`${totalFrames}:(0)`);
   const motion = { Zoom: zParts.join(', ') };
   if (txParts.length) motion['Translation X'] = txParts.join(', ');
   if (tyParts.length) motion['Translation Y'] = tyParts.join(', ');
   if (tcxParts.length > 1) motion['Transform Center X'] = tcxParts.join(', ');
   if (tcyParts.length > 1) motion['Transform Center Y'] = tcyParts.join(', ');
   return motion;
 },
 generateStory() {
   const g = this.generator;
   const gd = this.genData;
   g.isGenerating = true;
   g.status = 'Generating…';
   g.result = null;
   // Run async so the UI can update
   setTimeout(() => {
     try {
       const theme = g.theme.trim() || this._genRnd(gd.defaultThemes);
       const style = g.stylePreset === 'custom' ? (g.customStyle.trim() || 'Masterpiece, Realistic') : g.stylePreset;
       const fps = g.fps;
       const [width, height] = g.resolution.split('x').map(Number);
       const totalFrames = g.totalFrames;
       const numScenes = g.numScenes;
       const framesPerScene = Math.floor(totalFrames / numScenes);
       const scenes = {};
       for (let i = 0; i < numScenes; i++) {
         scenes[String(i * framesPerScene)] = this._buildScene(theme, style, i, numScenes);
       }
       const motion = this._buildMotion(numScenes, framesPerScene, totalFrames);
       // Format output
       const lines = [
         `Theme: ${theme}`,
         `Style: ${style}`,
         `Resolution: ${width}x${height}`,
         `FPS: ${fps}`,
         `Total frames: ${totalFrames}`,
         '',
         JSON.stringify(scenes, null, 2),
         '',
         'Motion Settings:',
       ];
       for (const [k, v] of Object.entries(motion)) lines.push(`${k}: ${v}`);
       g.result = { theme, style, width, height, fps, totalFrames, scenes, motion, formatted: lines.join('\n') };
       g.status = 'Story ready — review and approve below!';
     } catch (err) {
       g.status = `Error: ${err.message}`;
     } finally {
       g.isGenerating = false;
       setTimeout(() => { g.status = ''; }, 4000);
     }
   }, 30);
 },
 approveStory() {
   if (!this.generator.result) return;
   const { scenes, motion } = this.generator.result;
   this.prompts.pos = JSON.stringify(scenes, null, 2);
   this.sendPrompts();
   this.sendControl('motionSettings', motion);
   this.generator.result = null;
   this.generator.status = 'Applied!';
   this.currentTab = 'PROMPTS';
   setTimeout(() => { this.generator.status = ''; }, 3000);
 },
 rejectStory() {
   this.generator.result = null;
   this.generator.status = 'Discarded.';
   setTimeout(() => { this.generator.status = ''; }, 2000);
 },
 async refreshGeneratorPresets() {
   try {
     const res = await fetch('/api/presets');
     const data = await res.json();
     this.generatorPresets = (data.presets || []).filter(p => p.startsWith('gen-'));
   } catch (err) {
     console.error('Failed to load generator presets', err);
   }
 },
 async loadGeneratorPreset(name) {
   try {
     const res = await fetch(`/api/presets/${name}`);
     const data = await res.json();
     if (data.preset && data.preset.generator) {
       Object.assign(this.generator, data.preset.generator);
       this.generator.result = null;
       this.currentGeneratorPreset = name;
       this.generatorPresetStatus = `Loaded: ${name}`;
       setTimeout(() => { this.generatorPresetStatus = ''; }, 3000);
     }
   } catch (err) {
     this.generatorPresetStatus = `Error: ${err.message}`;
   }
 },
 async saveGeneratorPreset() {
   const raw = (this.newGeneratorPresetName || 'default').replace(/[^a-zA-Z0-9_-]/g, '-');
   const name = `gen-${raw}`;
   const preset = {
     generator: {
       theme: this.generator.theme,
       stylePreset: this.generator.stylePreset,
       customStyle: this.generator.customStyle,
       fps: this.generator.fps,
       resolution: this.generator.resolution,
       totalFrames: this.generator.totalFrames,
       numScenes: this.generator.numScenes,
     },
   };
   try {
     const res = await fetch(`/api/presets/${name}`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(preset),
     });
     const data = await res.json();
     if (data.ok) {
       this.currentGeneratorPreset = name;
       this.newGeneratorPresetName = '';
       this.generatorPresetStatus = `Saved: ${name}`;
       await this.refreshGeneratorPresets();
       setTimeout(() => { this.generatorPresetStatus = ''; }, 3000);
     }
   } catch (err) {
     this.generatorPresetStatus = `Error: ${err.message}`;
   }
 },
 async deleteGeneratorPreset(name) {
   if (!confirm(`Delete preset "${name}"?`)) return;
   try {
     await fetch(`/api/presets/${name}`, { method: 'DELETE' });
     this.currentGeneratorPreset = null;
     this.generatorPresetStatus = `Deleted: ${name}`;
     await this.refreshGeneratorPresets();
     setTimeout(() => { this.generatorPresetStatus = ''; }, 3000);
   } catch (err) {
     this.generatorPresetStatus = `Error: ${err.message}`;
   }
 },

 // ─── Performance deck (crossfader, preview, session) ─────────────────
 sessionStorageKey() {
   return `defora_session_${this.session || 'default'}`;
 },
 loadSessionState() {
   try {
     const raw = window.localStorage && window.localStorage.getItem(this.sessionStorageKey());
     if (!raw) return;
     const s = JSON.parse(raw);
     if (typeof s.crossfader === 'number') this.performance.crossfader = s.crossfader;
     if (typeof s.genericPrompt === 'string') this.performance.genericPrompt = s.genericPrompt;
     if (Array.isArray(s.slots)) this.performance.slots = s.slots;
     if (typeof s.paramPanelOpen === 'boolean') this.paramPanelOpen = s.paramPanelOpen;
     if (typeof s.deforumPanelOpen === 'boolean') this.deforumPanelOpen = s.deforumPanelOpen;
     if (s.deforumSettings && typeof s.deforumSettings === 'object') {
       this.deforumSettings = mergeDeforumSettings({ ...DEFORUM_DEFAULT_SETTINGS }, s.deforumSettings);
       this.syncDeforumSettingsJson();
     }
     if (s.lastModel) {
       this.forge.lastModel = s.lastModel;
       this.forge.selectedModel = s.lastModel;
     }
     if (s.prompts) Object.assign(this.prompts, s.prompts);
   } catch (_e) { /* ignore */ }
 },
 saveSessionState() {
   try {
     if (!window.localStorage) return;
     const blob = {
       crossfader: this.performance.crossfader,
       genericPrompt: this.performance.genericPrompt,
       slots: this.performance.slots,
       paramPanelOpen: this.paramPanelOpen,
       deforumPanelOpen: this.deforumPanelOpen,
       deforumSettings: this.deforumSettings,
       lastModel: this.forge.lastModel || this.forge.currentModel || this.forge.selectedModel,
       prompts: { pos: this.prompts.pos, neg: this.prompts.neg },
     };
     window.localStorage.setItem(this.sessionStorageKey(), JSON.stringify(blob));
   } catch (_e) { /* ignore */ }
 },
 restoreLastModel() {
   const name = this.forge.lastModel || this.forge.selectedModel;
   if (!name || this.forge.switching) return;
   if (this.forge.currentModel && this.forge.currentModel === name) return;
   this.forge.selectedModel = name;
   this.switchForgeModel();
 },
 async onModelSelectChange() {
   await this.switchForgeModel();
   this.saveSessionState();
 },
 slotTypeLabel(type) {
   const t = this.crossfadeSlotTypes.find((x) => x.id === type);
   return t ? t.label : type;
 },
 newSlotId() {
   return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
 },
 addCrossfadeSlot() {
   const type = this.performance.newSlotType || 'prompt';
   const slot = {
     id: this.newSlotId(),
     type,
     valueA: type === 'param' ? 0 : (type === 'prompt' ? '' : null),
     valueB: type === 'param' ? 0 : (type === 'prompt' ? '' : null),
     paramKey: 'cfg',
     loraStrengthA: 1,
     loraStrengthB: 1,
     cnSlotId: this.cn.active || 'CN1',
   };
   this.performance.slots.push(slot);
   this.applyCrossfadeMorph();
   this.saveSessionState();
 },
 removeCrossfadeSlot(id) {
   this.performance.slots = this.performance.slots.filter((s) => s.id !== id);
   this.applyCrossfadeMorph();
   this.saveSessionState();
 },
 slotMorphedPreview(slot) {
   return morphSlotValue(this.normalizeSlotForMorph(slot), this.performance.crossfader);
 },
 formatMorphedPreview(slot) {
   const v = this.slotMorphedPreview(slot);
   if (v == null) return '—';
   if (typeof v === 'object') return JSON.stringify(v);
   if (typeof v === 'number') return Number(v).toFixed(3);
   const s = String(v);
   return s.length > 48 ? s.slice(0, 48) + '…' : s;
 },
 normalizeSlotForMorph(slot) {
   if (slot.type === 'lora') {
     const pack = (name, str) => (name ? { name, strength: Number(str) || 1 } : null);
     return {
       ...slot,
       valueA: pack(slot.valueA, slot.loraStrengthA),
       valueB: pack(slot.valueB, slot.loraStrengthB),
     };
   }
   if (slot.type === 'controlnet') {
     const pack = (weight) => ({
       slotId: slot.cnSlotId,
       weight: Number(weight),
       start: 0,
       end: 0.9,
       enabled: true,
     });
     return {
       ...slot,
       valueA: slot.valueA != null && slot.valueA !== '' ? pack(slot.valueA) : null,
       valueB: slot.valueB != null && slot.valueB !== '' ? pack(slot.valueB) : null,
     };
   }
   if (slot.type === 'param') {
     return { ...slot, valueA: slot.valueA, valueB: slot.valueB };
   }
   return slot;
 },
 buildMorphedPrompt() {
   const parts = [];
   const base = (this.performance.genericPrompt || '').trim();
   if (base) parts.push(base);
   for (const slot of this.performance.slots) {
     if (slot.type !== 'prompt') continue;
     const m = morphSlotValue(this.normalizeSlotForMorph(slot), this.performance.crossfader);
     if (m) parts.push(String(m));
   }
   const merged = parts.join(', ').trim();
   if (merged) return merged;
   return (this.prompts.pos || '').trim();
 },
 applyCrossfadeMorph() {
   const t = this.performance.crossfader;
   const live = {};
   const loraA = [];
   const loraB = [];
   for (const slot of this.performance.slots) {
     const norm = this.normalizeSlotForMorph(slot);
     const v = morphSlotValue(norm, t);
     if (v == null) continue;
     if (slot.type === 'prompt') continue;
     if (slot.type === 'param' && slot.paramKey) {
       live[slot.paramKey] = v;
       const p = this.liveVibe.find((x) => x.key === slot.paramKey) || this.liveCam.find((x) => x.key === slot.paramKey);
       if (p) p.val = v;
     } else if (slot.type === 'lora' && v && v.name) {
       const entry = { name: v.name, path: v.name, strength: v.strength ?? 1 };
       if (smoothstep(t) < 0.5) loraA.push(entry);
       else loraB.push(entry);
     } else if (slot.type === 'controlnet' && v) {
       const cnSlot = this.cn.slots.find((s) => s.id === v.slotId);
       if (cnSlot) {
         cnSlot.weight = v.weight;
         cnSlot.start = v.start;
         cnSlot.end = v.end;
         cnSlot.enabled = v.enabled;
         this.updateControlNet(cnSlot);
       }
     }
   }
   const positive = this.buildMorphedPrompt();
   const negative = (this.prompts.neg || '').trim();
   this.prompts.pos = positive;
   this.sendControl('prompt', { positive, negative });
   if (Object.keys(live).length) this.sendControl('liveParam', live);
   if (loraA.length || loraB.length) {
     this.sendControl('loras', {
       groupA: loraA,
       groupB: loraB,
       crossfaderValue: t,
     });
   }
   this.prompts.crossfaderValue = t;
 },
 onCrossfaderInput() {
   this.applyCrossfadeMorph();
   this.saveSessionState();
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 onPerformanceInput() {
   this.applyCrossfadeMorph();
   this.saveSessionState();
   if (!this.deforumPlaying) this.schedulePreviewFrame();
 },
 schedulePreviewFrame() {
   if (this.deforumPlaying) return;
   clearTimeout(this.previewDebounceTimer);
   this.previewDebounceTimer = setTimeout(() => this.generatePreviewFrame(), 900);
 },
 scheduleDeforumPreview() {
   if (this.deforumPlaying) return;
   clearTimeout(this.deforumPreviewTimer);
   this.deforumPreviewTimer = setTimeout(() => this.generateDeforumPreviewFrame(), 1200);
 },
 getDeforumField(keyPath) {
   return getNestedValue(this.deforumSettings, keyPath);
 },
 onDeforumSectionToggle(groupId, evt) {
   this.deforumSectionOpen[groupId] = evt.target.open;
 },
 onDeforumFieldInput(keyPath, raw, kind) {
   let value = raw;
   if (kind === 'number') {
     const n = parseFloat(raw);
     value = Number.isFinite(n) ? n : 0;
   } else if (kind === 'bool') {
     value = !!raw;
   } else if (keyPath === 'init_image' && raw === '') {
     value = null;
   }
   setNestedValue(this.deforumSettings, keyPath, value);
   if (keyPath === 'prompts.0') {
     const p0 = String(value || '');
     const negSplit = p0.split(/\s+--neg\s+/i);
     if (negSplit.length > 1) {
       this.prompts.pos = negSplit[0].trim();
       this.prompts.neg = negSplit.slice(1).join(' --neg ').trim();
     } else {
       this.prompts.pos = p0.trim();
     }
   }
   if (keyPath === 'negative_prompts') {
     this.prompts.neg = String(value || '');
   }
   if (keyPath === 'seed' && Number.isFinite(value)) {
     this.hud.seed = value;
   }
   this.syncDeforumSettingsJson();
   this.pushDeforumLivePatch(keyPath, value);
   this.queueDeforumSettingsSave();
   if (!this.deforumPlaying) this.scheduleDeforumPreview();
 },
 pushDeforumLivePatch(keyPath, value) {
   const patch = patchFromKeyPath(keyPath, value);
   this.sendControl('liveParam', patch);
 },
 syncDeforumSettingsJson() {
   try {
     this.deforumSettingsJson = JSON.stringify(this.deforumSettings, null, 2);
     this.deforumSettingsJsonError = '';
   } catch (e) {
     this.deforumSettingsJsonError = String(e.message || e);
   }
 },
 applyDeforumSettingsJson() {
   try {
     const parsed = JSON.parse(this.deforumSettingsJson);
     if (!parsed || typeof parsed !== 'object') throw new Error('JSON must be an object');
     this.deforumSettings = parsed;
     this.deforumSettingsJsonError = '';
     this.queueDeforumSettingsSave();
     if (!this.deforumPlaying) this.scheduleDeforumPreview();
   } catch (e) {
     this.deforumSettingsJsonError = String(e.message || e);
   }
 },
 async loadDeforumSettings() {
   try {
     const res = await fetch('/api/deforum/settings');
     const data = await res.json();
     if (data.settings && typeof data.settings === 'object') {
       this.deforumSettings = mergeDeforumSettings({ ...DEFORUM_DEFAULT_SETTINGS }, data.settings);
     }
     this.syncDeforumSettingsJson();
     this.deforumSettingsStatus = 'Loaded';
   } catch (e) {
     this.deforumSettingsStatus = 'Load failed';
     console.error('loadDeforumSettings', e);
   }
 },
 queueDeforumSettingsSave() {
   clearTimeout(this.deforumSaveTimer);
   this.deforumSaveTimer = setTimeout(() => this.saveDeforumSettings(), 800);
 },
 async saveDeforumSettings() {
   try {
     const res = await fetch('/api/deforum/settings', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ settings: this.deforumSettings }),
     });
     const data = await res.json();
     if (!res.ok || data.error) {
       this.deforumSettingsStatus = data.error || 'Save failed';
       return;
     }
     this.deforumSettingsStatus = 'Saved';
   } catch (e) {
     this.deforumSettingsStatus = 'Save failed';
   }
 },
 async generateDeforumPreviewFrame() {
   if (this.deforumPlaying) {
     this.performance.status = 'Stop animation to preview single frames';
     return false;
   }
   if (this.previewGenerating) return false;
   this.applyCrossfadeMorph();
   this.previewGenerating = true;
   this.performance.status = 'Rendering Deforum frame…';
   this.deforumSettingsStatus = 'Rendering…';
   try {
     const res = await fetch('/api/deforum/preview', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ settings: this.deforumSettings }),
     });
     const data = await res.json();
     if (!res.ok || data.error) {
       this.performance.status = data.error || 'Deforum preview failed';
       this.deforumSettingsStatus = 'Preview failed';
       return false;
     }
     this.performance.lastPreviewPath = data.path;
     this.generator.lastPath = data.path;
     this.performance.status = 'Deforum frame ready';
     this.deforumSettingsStatus = 'Frame ready';
     this.refreshFrames();
     return true;
   } catch (err) {
     this.performance.status = String(err.message || err);
     this.deforumSettingsStatus = 'Preview failed';
     return false;
   } finally {
     this.previewGenerating = false;
   }
 },
 async generatePreviewFrame() {
   if (this.deforumPanelOpen) {
     const ok = await this.generateDeforumPreviewFrame();
     if (!ok) await this.generateImage();
   } else {
     await this.generateImage();
   }
 },
 async generateImage() {
   if (this.deforumPlaying) {
     this.performance.status = 'Stop animation to preview single frames';
     return;
   }
   if (this.previewGenerating) return;
   this.applyCrossfadeMorph();
   this.previewGenerating = true;
   this.performance.status = 'Generating preview frame…';
   const cfg = this.liveVibe.find((p) => p.key === 'cfgscale') || this.liveVibe.find((p) => p.key === 'cfg');
   const strength = this.liveVibe.find((p) => p.key === 'strength');
   const w = this.deforumSettings.W || 1024;
   const h = this.deforumSettings.H || 576;
   const steps = this.deforumSettings.steps || 12;
   const seed = this.deforumSettings.seed != null ? this.deforumSettings.seed : this.hud.seed;
   const sampler = this.deforumSettings.sampler || 'Euler a';
   const neg = this.deforumSettings.negative_prompts || this.prompts.neg || '';
   const prompt =
     getNestedValue(this.deforumSettings, 'prompts.0') ||
     this.buildMorphedPrompt();
   try {
     const res = await fetch('/api/txt2img', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         prompt,
         negative_prompt: neg,
         steps,
         cfg_scale: cfg ? cfg.val : 7,
         width: w,
         height: h,
         seed,
         sampler_name: sampler,
       }),
     });
     const data = await res.json();
     if (!res.ok || data.error) {
       this.performance.status = data.error || 'Preview failed';
       return;
     }
     this.performance.lastPreviewPath = data.path;
     this.generator.lastPath = data.path;
     this.performance.status = 'Preview frame ready';
     this.refreshFrames();
   } catch (err) {
     this.performance.status = String(err.message || err);
   } finally {
     this.previewGenerating = false;
   }
 },

 // Forge settings methods
 forgeUrl() {
   return `http://${this.forge.host}:${this.forge.port}`;
 },
 async refreshForgeStatus() {
   this.forge.loading = true;
   try {
     const res = await fetch('/api/status');
     const data = await res.json();
     if (data.sdForge) {
       this.forge.available = data.sdForge.available;
     } else {
       this.forge.available = false;
     }
   } catch (err) {
     this.forge.available = false;
   } finally {
     this.forge.loading = false;
   }
 },
 async saveForgeConnection() {
   try {
     const res = await fetch('/api/forge/options', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({}),
     });
     await res.json();
     await this.refreshForgeStatus();
   } catch (err) {
     console.error('Failed to save connection', err);
   }
 },
 async refreshForgeModels() {
   try {
     const { data } = await apiFetch('/api/sd-models', {}, 'sd-models list');
     this.forge.models = data.models || [];
     this.forge.modelsSource = data.source || '';
   } catch (_) {
     this.forge.modelsSource = '';
   }
 },
 async switchForgeModel() {
   if (!this.forge.selectedModel) return;
   this.forge.switching = true;
   try {
     const res = await fetch('/api/sd-models/switch', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ model_name: this.forge.selectedModel }),
     });
     const data = await res.json();
     if (data.success) {
       this.forge.currentModel = this.forge.selectedModel;
       this.forge.lastModel = this.forge.selectedModel;
       if (data.model && data.model.metadata) {
         this.forge.modelInfo = data.model.metadata;
       }
       this.saveSessionState();
       if (!this.deforumPlaying) this.schedulePreviewFrame();
     }
   } catch (err) {
     console.error('Failed to switch model', err);
   } finally {
     this.forge.switching = false;
   }
 },
 async refreshForgeOptions() {
   try {
     const [optRes, sampRes, schedRes, vaeRes, curRes] = await Promise.all([
       fetch('/api/forge/options'),
       fetch('/api/forge/samplers'),
       fetch('/api/forge/schedulers'),
       fetch('/api/forge/vae'),
       fetch('/api/sd-models/current'),
     ]);
     const opt = await optRes.json();
     const samp = await sampRes.json();
     const sched = await schedRes.json();
     const vae = await vaeRes.json();
     const cur = await curRes.json();

     this.forge.available = opt.available;
     this.forge.samplers = samp.samplers || [];
     this.forge.schedulers = sched.schedulers || [];
     this.forge.vaeList = vae.vae || [];
     if (cur.model) {
       this.forge.currentModel = cur.model.model_name || cur.model.title || '';
     }

     const o = opt.options || {};
     const keys = ['sampler_name', 'scheduler', 'steps', 'cfg_scale', 'width', 'height', 'batch_size', 'sd_vae', 'clip_skip', 'eta_ddim', 'eta_ancestral', 'sigma_churn', 'enable_emphasis', 'use_old_sampling', 'do_not_add_watermark'];
     for (const k of keys) {
       if (o[k] !== undefined) this.forge.options[k] = o[k];
     }
   } catch (err) {
     console.error('Failed to load forge options', err);
   }
 },
 async applyForgeOptions() {
   const keys = ['sampler_name', 'scheduler', 'steps', 'cfg_scale', 'width', 'height', 'batch_size', 'sd_vae', 'clip_skip', 'eta_ddim', 'eta_ancestral', 'sigma_churn', 'enable_emphasis', 'use_old_sampling', 'do_not_add_watermark'];
   const updates = {};
   for (const k of keys) {
     updates[k] = this.forge.options[k];
   }
   try {
     const res = await fetch('/api/forge/options', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(updates),
     });
     const data = await res.json();
     if (!data.success) {
       console.error('Failed to apply options', data);
     }
   } catch (err) {
     console.error('Failed to apply forge options', err);
   }
 },
 async refreshForgeAll() {
   await Promise.all([
     this.refreshForgeStatus(),
     this.refreshForgeModels(),
     this.refreshForgeOptions(),
   ]);
 },

  },
};
