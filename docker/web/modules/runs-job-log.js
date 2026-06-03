const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");

const MAX_ENTRIES = 500;

function runsLogDir(runsDir) {
  return path.join(runsDir, "_logs");
}

function runsLogPath(runsDir) {
  return path.join(runsLogDir(runsDir), "job-log.jsonl");
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const message = String(raw.message || "").trim();
  if (!message && !raw.kind) return null;
  return {
    id: String(raw.id || `log-${crypto.randomUUID()}`),
    ts: raw.ts || new Date().toISOString(),
    level: raw.level || "info",
    kind: raw.kind || null,
    message: message || String(raw.kind || "log"),
    clientRequest: raw.clientRequest && typeof raw.clientRequest === "object" ? raw.clientRequest : null,
    ollamaRequest: raw.ollamaRequest && typeof raw.ollamaRequest === "object" ? raw.ollamaRequest : null,
    promptStyles: raw.promptStyles && typeof raw.promptStyles === "object" ? raw.promptStyles : null,
  };
}

function createRunsJobLog(runsDir) {
  async function ensureDir() {
    await fsp.mkdir(runsLogDir(runsDir), { recursive: true });
  }

  async function append(entry) {
    const normalized = normalizeEntry(entry);
    if (!normalized) return null;
    await ensureDir();
    await fsp.appendFile(runsLogPath(runsDir), `${JSON.stringify(normalized)}\n`, "utf-8");
    return normalized;
  }

  async function read(limit = 80) {
    const file = runsLogPath(runsDir);
    if (!fs.existsSync(file)) return [];
    const text = await fsp.readFile(file, "utf-8");
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const entries = [];
    for (let i = lines.length - 1; i >= 0 && entries.length < limit; i -= 1) {
      try {
        const parsed = normalizeEntry(JSON.parse(lines[i]));
        if (parsed) entries.unshift(parsed);
      } catch (_e) {
        /* skip corrupt line */
      }
    }
    return entries.slice(-Math.max(1, Math.min(limit, MAX_ENTRIES)));
  }

  async function clear() {
    await ensureDir();
    await fsp.writeFile(runsLogPath(runsDir), "", "utf-8");
  }

  return { append, read, clear, logPath: runsLogPath(runsDir) };
}

module.exports = { createRunsJobLog, runsLogPath };
