const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");

function mergePromptParts(base, addition) {
  const a = String(base ?? "").trim();
  const b = String(addition ?? "").trim();
  if (!b) return a;
  if (!a) return b;
  return `${a}, ${b}`;
}

function slugifyStyleId(name, index = 0) {
  const slug = String(name || "style")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
  return slug || `style_${index}`;
}

function dedupeStyleIds(styles) {
  const seen = new Set();
  return (Array.isArray(styles) ? styles : []).map((style, index) => {
    let id = String(style.id || slugifyStyleId(style.name, index));
    let n = 2;
    while (seen.has(id)) {
      id = `${String(style.id || slugifyStyleId(style.name, index))}_${n++}`;
    }
    seen.add(id);
    return { ...style, id };
  });
}

function stylesFilePath(webRoot) {
  return path.join(webRoot, "data", "prompt-styles.json");
}

function seedFilePath(webRoot) {
  return path.join(webRoot, "data", "prompt-styles-seed.json");
}

function examplesDir(webRoot) {
  return path.join(webRoot, "data", "prompt-styles", "examples");
}

function exampleFilePath(webRoot, id) {
  const safe = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return null;
  return path.join(examplesDir(webRoot), `${safe}.png`);
}

function examplePublicUrl(id) {
  const safe = String(id || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) return null;
  return `/style-examples/${safe}.png`;
}

async function ensurePromptStylesStore(webRoot) {
  const file = stylesFilePath(webRoot);
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.mkdir(examplesDir(webRoot), { recursive: true });
  if (fs.existsSync(file)) return;
  const seedPath = seedFilePath(webRoot);
  let styles = [];
  if (fs.existsSync(seedPath)) {
    try {
      const seed = JSON.parse(await fsp.readFile(seedPath, "utf-8"));
      styles = Array.isArray(seed.styles) ? seed.styles : [];
    } catch (_e) {
      styles = [];
    }
  }
  const normalized = dedupeStyleIds(styles).map((style) => ({
    id: style.id,
    name: String(style.name || "").trim() || style.id,
    positive: String(style.positive ?? "").trim(),
    negative: String(style.negative ?? "").trim(),
    source: style.source || "custom",
    exampleImage: style.exampleImage || null,
    updatedAt: style.updatedAt || new Date().toISOString(),
  }));
  await fsp.writeFile(
    file,
    JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), styles: normalized }, null, 2),
    "utf-8",
  );
}

async function readStyles(webRoot) {
  await ensurePromptStylesStore(webRoot);
  const raw = JSON.parse(await fsp.readFile(stylesFilePath(webRoot), "utf-8"));
  return Array.isArray(raw.styles) ? raw.styles : [];
}

async function writeStyles(webRoot, styles) {
  await ensurePromptStylesStore(webRoot);
  const normalized = dedupeStyleIds(styles).map((style) => ({
    id: style.id,
    name: String(style.name || "").trim() || style.id,
    positive: String(style.positive ?? "").trim(),
    negative: String(style.negative ?? "").trim(),
    source: style.source || "custom",
    exampleImage: style.exampleImage || null,
    updatedAt: style.updatedAt || new Date().toISOString(),
  }));
  await fsp.writeFile(
    stylesFilePath(webRoot),
    JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), styles: normalized }, null, 2),
    "utf-8",
  );
  return normalized;
}

function forgeStyleToRecord(entry, index = 0) {
  const name = String(entry?.name || "").trim();
  if (!name || /^-{3,}/.test(name)) return null;
  const positive = String(entry.prompt ?? "").trim();
  const negative = String(entry.negative_prompt ?? "").trim();
  if (!positive && !negative) return null;
  return {
    id: slugifyStyleId(name, index),
    name,
    positive,
    negative,
    source: "forge",
    exampleImage: null,
    updatedAt: new Date().toISOString(),
  };
}

async function importFromForge(forgeUrl, webRoot, { merge = true } = {}) {
  const base = String(forgeUrl || "").replace(/\/$/, "");
  if (!base) throw new Error("forgeUrl required");
  const res = await fetch(`${base}/sdapi/v1/prompt-styles`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Forge prompt-styles failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const payload = await res.json();
  const imported = dedupeStyleIds(
    (Array.isArray(payload) ? payload : [])
      .map((entry, index) => forgeStyleToRecord(entry, index))
      .filter(Boolean),
  );
  if (!merge) {
    await writeStyles(webRoot, imported);
    return { count: imported.length, added: imported.length, updated: 0, total: imported.length };
  }
  const existing = await readStyles(webRoot);
  const byName = new Map(existing.map((style) => [style.name.toLowerCase(), style]));
  let added = 0;
  let updated = 0;
  for (const style of imported) {
    const key = style.name.toLowerCase();
    const prev = byName.get(key);
    if (!prev) {
      byName.set(key, style);
      added += 1;
    } else {
      byName.set(key, {
        ...prev,
        positive: style.positive,
        negative: style.negative,
        source: style.source || prev.source,
        updatedAt: new Date().toISOString(),
      });
      updated += 1;
    }
  }
  const merged = dedupeStyleIds([...byName.values()]);
  await writeStyles(webRoot, merged);
  return { count: imported.length, added, updated, total: merged.length };
}

async function setStyleExampleFromPath(webRoot, id, sourcePath, uploadsDir) {
  const dest = exampleFilePath(webRoot, id);
  if (!dest) throw new Error("invalid style id");
  let absSource = null;
  const rel = String(sourcePath || "").trim();
  if (rel.startsWith("data:image/")) {
    const b64 = rel.includes(",") ? rel.split(",", 2)[1] : "";
    if (!b64) throw new Error("invalid data url");
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.writeFile(dest, Buffer.from(b64, "base64"));
    const styles = await readStyles(webRoot);
    const idx = styles.findIndex((style) => style.id === id);
    if (idx < 0) throw new Error("style not found");
    styles[idx] = {
      ...styles[idx],
      exampleImage: examplePublicUrl(id),
      updatedAt: new Date().toISOString(),
    };
    await writeStyles(webRoot, styles);
    return styles[idx];
  }
  if (rel.startsWith("/uploads/")) {
    absSource = path.join(uploadsDir, path.basename(rel));
  } else if (rel.startsWith("/frames/")) {
    absSource = path.join(path.dirname(uploadsDir), "frames", path.basename(rel));
  } else if (fs.existsSync(rel)) {
    absSource = rel;
  }
  if (!absSource || !fs.existsSync(absSource)) {
    throw new Error("source image not found");
  }
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(absSource, dest);
  const styles = await readStyles(webRoot);
  const idx = styles.findIndex((style) => style.id === id);
  if (idx < 0) throw new Error("style not found");
  styles[idx] = {
    ...styles[idx],
    exampleImage: examplePublicUrl(id),
    updatedAt: new Date().toISOString(),
  };
  await writeStyles(webRoot, styles);
  return styles[idx];
}

async function clearStyleExample(webRoot, id) {
  const dest = exampleFilePath(webRoot, id);
  if (dest && fs.existsSync(dest)) {
    try {
      await fsp.unlink(dest);
    } catch (_e) {
      /* ignore */
    }
  }
  const styles = await readStyles(webRoot);
  const idx = styles.findIndex((style) => style.id === id);
  if (idx < 0) throw new Error("style not found");
  styles[idx] = { ...styles[idx], exampleImage: null, updatedAt: new Date().toISOString() };
  await writeStyles(webRoot, styles);
  return styles[idx];
}

module.exports = {
  mergePromptParts,
  applyPromptStyleToPrompts: (prompts, style) => {
    if (!style) return { ...prompts };
    return {
      positive: mergePromptParts(prompts.positive, style.positive),
      negative: mergePromptParts(prompts.negative, style.negative),
    };
  },
  dedupeStyleIds,
  examplesDir,
  examplePublicUrl,
  ensurePromptStylesStore,
  readStyles,
  writeStyles,
  importFromForge,
  setStyleExampleFromPath,
  clearStyleExample,
};
