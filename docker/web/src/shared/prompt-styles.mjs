/**
 * Forge / A1111-style prompt modifiers (positive + negative append).
 */

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
