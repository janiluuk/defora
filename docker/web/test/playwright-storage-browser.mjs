/**
 * Playwright E2E: Library storage browser lists folders and videos, and serves file media.
 *
 * Seeds nested folders + mp4 files under uploads/runs/frames, then verifies the UI
 * can navigate folders and that /api/video-swarm/file returns 200 for listed videos.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { start } from "../server.js";

function tinyMp4Buffer() {
  return Buffer.from("defora-e2e-storage-mp4");
}

async function clickTab(page, label) {
  const tab = page.locator("header .tab").filter({
    has: page.locator(".tab__label").filter({ hasText: new RegExp(`^${label}$`) }),
  }).first();
  if ((await tab.count()) === 0) throw new Error(`Tab "${label}" not found`);
  await tab.click();
}

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}

async function openLibraryBrowser(page) {
  await clickTab(page, "LIBRARY");
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 30000 });
  const browserRoot = page.locator('.video-swarm-browser[data-testid="video-swarm-browser"]').first();
  await browserRoot.waitFor({ state: "visible", timeout: 30000 });
  return browserRoot;
}

async function selectRoot(browserRoot, rootId) {
  const rootSelect = browserRoot.locator(".video-swarm-browser__roots select.framesync-select").first();
  await rootSelect.waitFor({ state: "visible", timeout: 15000 });
  await rootSelect.selectOption({ value: rootId });
  await browserRoot.locator(".video-swarm-browser__empty").filter({ hasText: /^Scanning folder/ }).waitFor({
    state: "detached",
    timeout: 15000,
  }).catch(() => null);
  await browserRoot.page().waitForTimeout(300);
}

async function expectNoBrowseError(browserRoot) {
  const status = browserRoot.locator(".video-swarm-browser__status");
  if ((await status.count()) === 0) return;
  const text = ((await status.textContent()) || "").trim();
  if (/not found|browse failed|invalid path/i.test(text)) {
    throw new Error(`Storage browser error: ${text}`);
  }
}

async function expectVideoTile(browserRoot, filename) {
  const tile = browserRoot.locator(`.video-swarm-browser__tile[data-video-path*="${filename}"]`).first();
  await tile.waitFor({ state: "visible", timeout: 15000 });
  return tile;
}

async function expectFolderTile(browserRoot, folderName) {
  const folder = browserRoot
    .locator('[data-testid="video-swarm-folder"]')
    .filter({ has: browserRoot.locator(".video-swarm-browser__label", { hasText: folderName }) })
    .first();
  if ((await folder.count()) === 0) {
    const fallback = browserRoot.locator(`[data-testid="video-swarm-folder"][data-folder-path*="${folderName}"]`).first();
    await fallback.waitFor({ state: "visible", timeout: 15000 });
    return fallback;
  }
  await folder.waitFor({ state: "visible", timeout: 15000 });
  return folder;
}

async function assertMediaOk(page, base, filePath) {
  const mediaRes = await page.request.get(`${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`);
  if (!mediaRes.ok()) {
    throw new Error(`Expected media 200 for ${filePath}, got ${mediaRes.status()}`);
  }
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-storage-browser-"));
const runsDir = path.join(tmpRoot, "runs");
const framesDir = path.join(tmpRoot, "frames");
const uploadsDir = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

const uploadsProjectDir = path.join(uploadsDir, "projects");
fs.mkdirSync(uploadsProjectDir, { recursive: true });
fs.writeFileSync(path.join(uploadsDir, "top-level.mp4"), tinyMp4Buffer());
fs.writeFileSync(path.join(uploadsProjectDir, "nested-demo.mp4"), tinyMp4Buffer());

const runFolder = path.join(runsDir, "e2e-run-folder");
fs.mkdirSync(runFolder, { recursive: true });
fs.writeFileSync(path.join(runFolder, "run-output.mp4"), tinyMp4Buffer());

const framesBatchDir = path.join(framesDir, "batch-a");
fs.mkdirSync(framesBatchDir, { recursive: true });
fs.writeFileSync(path.join(framesBatchDir, "batch-video.mp4"), tinyMp4Buffer());

const svc = await start({
  port: 0,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await page.waitForSelector("header .tab", { timeout: 30000 });

  const browserRoot = await openLibraryBrowser(page);

  const rootsRes = await page.request.get(`${base}/api/video-swarm/roots`);
  if (!rootsRes.ok()) throw new Error(`GET /api/video-swarm/roots failed: ${rootsRes.status()}`);
  const rootsJson = await rootsRes.json();
  const rootIds = (rootsJson.roots || []).map((r) => r.id);
  for (const id of ["uploads", "runs", "frames"]) {
    if (!rootIds.includes(id)) throw new Error(`Expected root "${id}" in /api/video-swarm/roots`);
  }

  // Uploads: top-level video + projects folder → nested video
  await selectRoot(browserRoot, "uploads");
  await expectNoBrowseError(browserRoot);
  const topTile = await expectVideoTile(browserRoot, "top-level.mp4");
  const topPath = await topTile.getAttribute("data-video-path");
  if (!topPath) throw new Error("Expected top-level tile data-video-path");
  const projectsFolder = await expectFolderTile(browserRoot, "projects");
  await projectsFolder.click();
  await expectNoBrowseError(browserRoot);
  const nestedTile = await expectVideoTile(browserRoot, "nested-demo.mp4");
  const nestedPath = await nestedTile.getAttribute("data-video-path");
  if (!nestedPath) throw new Error("Expected nested-demo tile data-video-path");
  await assertMediaOk(page, base, nestedPath);
  await assertMediaOk(page, base, topPath);

  // Runs: navigate into run folder
  await selectRoot(browserRoot, "runs");
  await expectNoBrowseError(browserRoot);
  const runFolderTile = await expectFolderTile(browserRoot, "e2e-run-folder");
  await runFolderTile.click();
  await expectNoBrowseError(browserRoot);
  const runVideoTile = await expectVideoTile(browserRoot, "run-output.mp4");
  const runVideoPath = await runVideoTile.getAttribute("data-video-path");
  if (!runVideoPath) throw new Error("Expected run-output tile data-video-path");
  await assertMediaOk(page, base, runVideoPath);

  // Frames: navigate into batch folder
  await selectRoot(browserRoot, "frames");
  await expectNoBrowseError(browserRoot);
  const batchFolder = await expectFolderTile(browserRoot, "batch-a");
  await batchFolder.click();
  await expectNoBrowseError(browserRoot);
  const batchTile = await expectVideoTile(browserRoot, "batch-video.mp4");
  const batchPath = await batchTile.getAttribute("data-video-path");
  if (!batchPath) throw new Error("Expected batch-video tile data-video-path");
  await assertMediaOk(page, base, batchPath);

  // Backend browse should include folders at uploads root
  const browseRes = await page.request.get(
    `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(uploadsDir)}&recursive=0&sort=name-asc`,
  );
  if (!browseRes.ok()) throw new Error(`Expected browse 200, got ${browseRes.status()}`);
  const browseJson = await browseRes.json();
  const hasFolder = Array.isArray(browseJson.folders) && browseJson.folders.some((f) => f && f.name === "projects");
  const hasVideo = Array.isArray(browseJson.videos) && browseJson.videos.some((v) => v && v.name === "top-level.mp4");
  if (!hasFolder) throw new Error("Backend browse missing projects folder");
  if (!hasVideo) throw new Error("Backend browse missing top-level.mp4");

  console.log("OK: storage browser shows folders + videos and serves file media");
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
