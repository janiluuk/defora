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

module.exports = {
  clamp01,
  smoothstep,
  lerpNum,
  morphPrompt,
  morphBoolean,
  morphLoraSlot,
  morphControlNetSlot,
  morphSlotValue,
  CROSSFADE_SLOT_TYPES,
};
