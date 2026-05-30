/**
 * Playwright E2E:
 * 1) Cold load shows WebGL standby animation (not blank / not hidden by empty Deforum).
 * 2) Saved run on disk appears in the RUNS tab monitor (storage connected via server runsDir).
 * 3) After reload, the same run is still listed (persistence).
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { startE2eServer } from "./playwright-server.mjs";
import { clickTab, openRunsMonitor, waitForNavTabs, waitForPastRunRow } from "./playwright-nav.mjs";

function tinyPngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/eeo8u8AAAAASUVORK5CYII=",
    "base64",
  );
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-startup-runs-"));
const runsDir = path.join(tmpRoot, "runs");
const framesDir = path.join(tmpRoot, "frames");
const uploadsDir = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

const runId = "e2e-storage-run";
const runPath = path.join(runsDir, runId);
fs.mkdirSync(runPath, { recursive: true });
fs.writeFileSync(
  path.join(runPath, "run.json"),
  JSON.stringify(
    {
      run_id: runId,
      status: "completed",
      started_at: new Date("2026-05-27T20:00:00.000Z").toISOString(),
      model: "e2e-storage-model",
      frame_count: 48,
      tag: "e2e-storage",
      prompt_positive: "storage positive",
      notes: "e2e storage notes",
    },
    null,
    2,
  ),
);
fs.writeFileSync(path.join(runPath, "thumb.png"), tinyPngBuffer());

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

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}

async function assertWebglStartup(page) {
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  const standby = page.locator('[data-testid="preview-standby-animation"]');
  await standby.waitFor({ state: "attached", timeout: 15000 });
  const visible = await standby.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.opacity !== "0" && style.visibility !== "hidden" && el.offsetWidth > 0;
  });
  if (!visible) throw new Error("WebGL standby animation should be visible on startup");

  const canvas = page.locator('[data-testid="preview-standby-animation"] canvas');
  await canvas.waitFor({ state: "attached", timeout: 15000 });
  const rendered = await canvas.evaluate((c) => c.toDataURL("image/png").length > 8000);
  if (!rendered) throw new Error("WebGL canvas should contain rendered pixels on startup");

  const webglTab = page.locator(".video-layer-tab.active .video-layer-tab__label").filter({ hasText: /^WebGL$/ });
  if ((await webglTab.count()) === 0) {
    throw new Error('Expected active preview layer tab "WebGL" on startup');
  }

  const apiRuns = await page.request.get(`${base}/api/runs`);
  if (!apiRuns.ok()) throw new Error(`GET /api/runs failed: ${apiRuns.status()}`);
  const body = await apiRuns.json();
  const found = (body.runs || []).some((r) => r.run_id === runId);
  if (!found) {
    throw new Error(`Run "${runId}" missing from /api/runs (${(body.runs || []).length} runs) — storage not connected`);
  }
}

async function assertRunInBrowser(page) {
  await dismissSessionModalIfOpen(page);
  await openRunsMonitor(page, { tab: "past" });
  await waitForPastRunRow(page, runId);
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await assertWebglStartup(page);
  await assertRunInBrowser(page);

  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForNavTabs(page);
  await dismissSessionModalIfOpen(page);
  await assertRunInBrowser(page);

  console.log(`OK: WebGL on startup + run "${runId}" visible in browser after reload (runsDir connected)`);
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
