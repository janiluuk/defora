/**
 * Playwright E2E: launch a test run from the RUNS tab, verify real-time
 * activity log, table updates, status transition, and job snapshot on disk.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { startE2eServer } from "./playwright-server.mjs";
import { openRunsMonitor, waitForNavTabs } from "./playwright-nav.mjs";

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-runs-rt-"));
const runsDir = path.join(tmpRoot, "runs");
const framesDir = path.join(tmpRoot, "frames");
const uploadsDir = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

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

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await openRunsMonitor(page);

  const launchBtn = page.locator('[data-testid="runs-launch-test"]');
  await launchBtn.waitFor({ state: "visible", timeout: 10000 });

  const log = page.locator('[data-testid="runs-job-log"]');
  await launchBtn.click();

  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="runs-job-log"]');
      return el && /Demo run logged:/i.test(el.textContent || "");
    },
    { timeout: 20000 },
  );

  const logAfterLaunch = (await log.textContent()) || "";
  const runIdMatch = logAfterLaunch.match(/Demo run logged:\s*(\S+)/i);
  if (!runIdMatch) throw new Error(`Could not parse run id from log: ${logAfterLaunch.slice(0, 300)}`);
  const runId = runIdMatch[1].replace(/[(),]/g, "");

  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="runs-job-log"]');
      return el && /Activity:/i.test(el.textContent || "");
    },
    { timeout: 20000 },
  );

  const logText = (await log.textContent()) || "";

  await page.locator('[data-testid="runs-browser-tab-past"]').click();

  const row = page
    .locator(".runs-browser__table tbody tr")
    .filter({ has: page.locator(".runs-browser__run-id", { hasText: runId }) })
    .first();

  await page.waitForFunction(
    (id) => {
      const rows = [...document.querySelectorAll(".runs-browser__table tbody tr")];
      const match = rows.find((r) => (r.textContent || "").includes(id));
      return match && /completed/i.test(match.textContent || "");
    },
    runId,
    { timeout: 20000 },
  );

  await row.waitFor({ state: "visible", timeout: 5000 });


  if (!/Demo run (logged|started|completed|done)/i.test(logText)) {
    throw new Error(`Job log missing demo run entries: ${logText.slice(0, 400)}`);
  }

  const runsRes = await page.request.get(`${base}/api/runs`);
  const runsBody = await runsRes.json();
  const onDisk = (runsBody.runs || []).some((r) => r.run_id === runId);
  if (!onDisk) throw new Error(`Run ${runId} not returned from GET /api/runs`);

  const jobPath = path.join(runsDir, runId, "defora-job.json");
  const deadlineJob = Date.now() + 10000;
  while (!fs.existsSync(jobPath) && Date.now() < deadlineJob) {
    await page.waitForTimeout(200);
  }
  if (!fs.existsSync(jobPath)) {
    throw new Error(`defora-job.json not written for ${runId}`);
  }

  const job = JSON.parse(fs.readFileSync(jobPath, "utf8"));
  const snapshot = job && (job.snapshot || job);
  if (!snapshot || snapshot.kind !== "demo") {
    throw new Error(`Unexpected job snapshot for ${runId}: ${JSON.stringify(job).slice(0, 200)}`);
  }

  console.log(`OK: Runs monitor launched "${runId}", activity tracked, completed, job logged on disk`);
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
