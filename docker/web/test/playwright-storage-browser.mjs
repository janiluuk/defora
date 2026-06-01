/**
 * Playwright E2E: Library Projects view lists work with frame counts and serves video media.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { startE2eServer } from "./playwright-server.mjs";
import { openLibraryBrowser, waitForNavTabs } from "./playwright-nav.mjs";

function tinyMp4Buffer() {
  return Buffer.from("defora-e2e-storage-mp4");
}

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}

async function expectProjectCard(browserRoot, filenamePart) {
  const card = browserRoot.locator(`[data-testid="project-card"][data-video-path*="${filenamePart}"]`).first();
  await card.waitFor({ state: "visible", timeout: 15000 });
  return card;
}

async function assertMediaOk(page, base, filePath, rootId = "uploads") {
  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}&rootId=${encodeURIComponent(rootId)}`,
  );
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

const projectDir = path.join(uploadsDir, "projects", "orbit-demo");
fs.mkdirSync(projectDir, { recursive: true });
fs.writeFileSync(path.join(projectDir, "frame_00000.png"), "fake-png");
fs.writeFileSync(path.join(projectDir, "frame_00001.png"), "fake-png");
fs.writeFileSync(path.join(projectDir, "nested-demo.mp4"), tinyMp4Buffer());

const runFolder = path.join(runsDir, "e2e-run-folder");
fs.mkdirSync(runFolder, { recursive: true });
fs.writeFileSync(path.join(runFolder, "run.json"), JSON.stringify({
  run_id: "e2e-run-folder",
  tag: "E2E run sample",
  frame_count: 2,
  status: "completed",
}));
fs.writeFileSync(path.join(runFolder, "run-output.mp4"), tinyMp4Buffer());

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

  const projectsRes = await page.request.get(`${base}/api/video-swarm/projects`);
  if (!projectsRes.ok()) throw new Error(`GET /api/video-swarm/projects failed: ${projectsRes.status()}`);
  const projectsJson = await projectsRes.json();
  const projects = projectsJson.projects || [];
  if (projects.length < 2) {
    throw new Error(`Expected at least 2 projects, got ${projects.length}`);
  }
  const uploadProject = projects.find((p) => p.videoPath && p.videoPath.includes("nested-demo.mp4"));
  const runProject = projects.find((p) => p.kind === "run" && p.videoPath && p.videoPath.includes("run-output.mp4"));
  if (!uploadProject) throw new Error("Projects API missing uploads project video");
  if (!runProject) throw new Error("Projects API missing run project video");
  if (uploadProject.frameCount < 2) throw new Error("Expected frame count on uploads project");

  const browserRoot = await openLibraryBrowser(page);
  const uploadCard = await expectProjectCard(browserRoot, "nested-demo.mp4");
  const uploadPath = await uploadCard.getAttribute("data-video-path");
  if (!uploadPath) throw new Error("Expected project card data-video-path");
  await assertMediaOk(page, base, uploadPath, "uploads");

  const runCard = await expectProjectCard(browserRoot, "run-output.mp4");
  const runPath = await runCard.getAttribute("data-video-path");
  if (!runPath) throw new Error("Expected run project data-video-path");
  const runMediaRes = await page.request.get(`${base}/api/runs/e2e-run-folder/video/run-output.mp4`);
  if (!runMediaRes.ok()) {
    throw new Error(`Expected run video 200, got ${runMediaRes.status()}`);
  }

  const titles = await browserRoot.locator(".library-browser__title").allTextContents();
  if (titles.some((t) => /orbit-demo|e2e-run-folder|nested-demo|projects/i.test(t))) {
    throw new Error(`Project titles should not expose raw folder names: ${titles.join(" | ")}`);
  }

  console.log("OK: Projects library lists work with frame counts and serves video media");
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
