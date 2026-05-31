/**
 * Playwright E2E: generate a 4s "clip" (run) and verify the browser can access it
 * and that all metadata is rendered correctly in the Runs Browser details panel.
 *
 * This test boots the real `server.js` with a temp `runsDir`, writes a run manifest
 * + thumbnail, then uses Playwright to validate UI rendering.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { startE2eServer } from "./playwright-server.mjs";
import { openRunsMonitor, waitForNavTabs, waitForPastRunRow } from "./playwright-nav.mjs";

function tinyPngBuffer() {
  // 1x1 transparent PNG
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/eeo8u8AAAAASUVORK5CYII=",
    "base64"
  );
}

function mustInclude(haystack, needle, label, { ignoreCase = false } = {}) {
  const h = String(haystack || "");
  const n = String(needle || "");
  const ok = ignoreCase ? h.toLowerCase().includes(n.toLowerCase()) : h.includes(n);
  if (!ok) throw new Error(`Missing ${label || "text"}: expected "${needle}"`);
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-clip-"));
const runsDir = path.join(tmpRoot, "runs");
const framesDir = path.join(tmpRoot, "frames");
const uploadsDir = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

const fps = 24;
const durationSec = 4;
const frameCount = fps * durationSec; // 96
const runId = "e2e-clip-4s";
const runPath = path.join(runsDir, runId);
fs.mkdirSync(runPath, { recursive: true });

const manifest = {
  run_id: runId,
  status: "completed",
  started_at: new Date("2026-05-27T18:00:00.000Z").toISOString(),
  model: "e2e-model",
  frame_count: frameCount,
  seed: 1337,
  steps: 2,
  strength: 0.65,
  cfg: 1.2,
  tag: "e2e",
  prompt_positive: "e2e positive prompt",
  prompt_negative: "e2e negative prompt",
  notes: "e2e notes",
  metadata: {
    fps,
    duration_sec: durationSec,
    clip_type: "test",
  },
};

fs.writeFileSync(path.join(runPath, "run.json"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(runPath, "thumb.png"), tinyPngBuffer());
// Also drop at least one frame so the thumb fallback path is valid.
fs.writeFileSync(path.join(runPath, "frame_0001.png"), tinyPngBuffer());

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
});
const base = `http://127.0.0.1:${svc.port}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  // UI continuously polls/streams, so don't use "networkidle".
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForNavTabs(page);

  // Ensure backend serving the clip assets.
  const thumbRes = await page.request.get(`${base}/api/runs/${runId}/thumb`);
  if (!thumbRes.ok()) throw new Error(`Expected thumb 200, got ${thumbRes.status()}`);

  await openRunsMonitor(page, { tab: "past" });
  const runRow = await waitForPastRunRow(page, runId);

  await runRow.click();
  const details = page.locator('[data-testid="runs-detail-card"]');
  await details.waitFor({ state: "visible", timeout: 10000 });

  const text = (await details.innerText()).replace(/\s+/g, " ").trim();
  mustInclude(text, runId, "run id");
  mustInclude(text, "completed", "status", { ignoreCase: true });
  mustInclude(text, "e2e-model", "model", { ignoreCase: true });
  mustInclude(text, String(frameCount), "frame count");
  mustInclude(text, String(manifest.seed), "seed");
  mustInclude(text, String(manifest.steps), "steps");
  mustInclude(text, String(manifest.strength), "strength");
  mustInclude(text, String(manifest.cfg), "cfg");
  mustInclude(text, manifest.tag, "tag", { ignoreCase: true });
  mustInclude(text, manifest.prompt_positive, "positive prompt", { ignoreCase: true });
  mustInclude(text, manifest.prompt_negative, "negative prompt", { ignoreCase: true });
  const notesEl = details.locator("textarea.runs-detail-card__notes");
  if ((await notesEl.count()) === 0) throw new Error("Notes textarea not found");
  const notesValue = (await notesEl.inputValue()).trim();
  if (notesValue !== manifest.notes) {
    throw new Error(`Notes mismatch: expected "${manifest.notes}", got "${notesValue}"`);
  }

  console.log(`OK: clip/run metadata rendered for ${runId}`);
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}

