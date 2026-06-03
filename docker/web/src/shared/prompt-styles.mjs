/**
 * Forge / A1111-style prompt modifiers (positive + negative append).
 */

/** Default txt2img scene when a style has no custom preview prompt. */
export const STYLE_PREVIEW_BASE_PROMPT = 'bunny and cat in space';

/** Base scene for style preview generation (style.previewPrompt overrides default). */
export function stylePreviewPromptFor(style) {
  const custom = String(style?.previewPrompt ?? '').trim();
  return custom || STYLE_PREVIEW_BASE_PROMPT;
}

export function mergePromptParts(base, addition) {
  const a = String(base ?? '').trim();
  const b = String(addition ?? '').trim();
  if (!b) return a;
  if (!a) return b;
  return `${a}, ${b}`;
}

export function applyPromptStyleToPrompts({ positive, negative }, style) {
  if (!style) {
    return {
      positive: String(positive ?? '').trim(),
      negative: String(negative ?? '').trim(),
    };
  }
  return {
    positive: mergePromptParts(positive, style.positive),
    negative: mergePromptParts(negative, style.negative),
  };
}

export function slugifyStyleId(name, index = 0) {
  const slug = String(name || 'style')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
  return slug || `style_${index}`;
}

export function forgeStyleToRecord(entry, index = 0) {
  const name = String(entry?.name || '').trim();
  if (!name || /^-{3,}/.test(name)) return null;
  const positive = String(entry?.prompt ?? entry?.positive ?? '').trim();
  const negative = String(entry?.negative_prompt ?? entry?.negative ?? '').trim();
  if (!positive && !negative) return null;
  return {
    id: slugifyStyleId(name, index),
    name,
    positive,
    negative,
    source: 'forge',
    exampleImage: null,
    updatedAt: new Date().toISOString(),
  };
}

export function dedupeStyleIds(styles) {
  const seen = new Set();
  return (styles || []).map((style, index) => {
    let id = String(style.id || slugifyStyleId(style.name, index));
    let n = 2;
    while (seen.has(id)) {
      id = `${String(style.id || slugifyStyleId(style.name, index))}_${n++}`;
    }
    seen.add(id);
    return { ...style, id };
  });
}

/** Minimal style record for job snapshots and run manifests. */
export function snapshotStyleRecord(style) {
  if (!style || typeof style !== 'object') return null;
  const id = String(style.id || '').trim();
  const name = String(style.name || '').trim();
  if (!id && !name) return null;
  return {
    id: id || slugifyStyleId(name),
    name: name || id,
    positive: String(style.positive ?? '').trim(),
    negative: String(style.negative ?? '').trim(),
    source: style.source || 'custom',
  };
}

/**
 * Capture active prompt style + crossfader style slots for job metadata.
 * @param {{ activeStyleId?: string|null, activeStyle?: object|null, crossfader?: number, styleCrossfaderSlots?: object[], morphedAppend?: { positive?: string, negative?: string } }} opts
 */
export function buildPromptStyleJobSnapshot({
  activeStyleId = null,
  activeStyle = null,
  crossfader = 0,
  styleCrossfaderSlots = [],
  morphedAppend = null,
} = {}) {
  const active = snapshotStyleRecord(activeStyle);
  const crossfaderStyles = (Array.isArray(styleCrossfaderSlots) ? styleCrossfaderSlots : [])
    .map((slot) => ({
      slotId: slot?.id || null,
      label: slot?.label || slot?.id || null,
      valueA: snapshotStyleRecord(slot?.valueA),
      valueB: snapshotStyleRecord(slot?.valueB),
    }))
    .filter((slot) => slot.valueA || slot.valueB);
  const hasStyle = active || crossfaderStyles.length;
  if (!hasStyle) return null;
  const morph = morphedAppend && typeof morphedAppend === 'object'
    ? {
        positive: String(morphedAppend.positive ?? '').trim(),
        negative: String(morphedAppend.negative ?? '').trim(),
      }
    : { positive: '', negative: '' };
  return {
    activeStyleId: activeStyleId || active?.id || null,
    activeStyle: active,
    crossfader: Number.isFinite(Number(crossfader)) ? Number(crossfader) : 0,
    crossfaderSlots: crossfaderStyles,
    morphedAppend: morph,
    capturedAt: new Date().toISOString(),
  };
}

export function promptStyleJobSummary(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return '';
  const parts = [];
  if (snapshot.activeStyle?.name) parts.push(snapshot.activeStyle.name);
  const slots = snapshot.crossfaderSlots || [];
  if (slots.length) {
    const labels = slots.map((s) => s.label || s.slotId).filter(Boolean);
    if (labels.length) parts.push(`morph: ${labels.join(', ')}`);
  }
  if (snapshot.morphedAppend?.positive) {
    const p = snapshot.morphedAppend.positive;
    parts.push(`+${p.length > 60 ? `${p.slice(0, 60)}…` : p}`);
  }
  return parts.join(' · ');
}
