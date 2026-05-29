/**
 * E2E: unified uploads dir + API/UI browser upload using repo vid_preview.mp4
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { start } from "../server.js";
import { openLibraryBrowser, waitForNavTabs } from "./playwright-nav.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");

function resolveSampleVideo() {
  const repoSample = path.join(repoRoot, "vid_preview.mp4");
  if (fs.existsSync(repoSample)) return repoSample;
  const fixture = path.join(__dirname, "fixtures", "minimal-upload.mp4");
  if (fs.existsSync(fixture)) return fixture;
  fs.mkdirSync(path.dirname(fixture), { recursive: true });
  const tmp = path.join(os.tmpdir(), `defora-minimal-${process.pid}.mp4`);
  try {
    execSync(
      `ffmpeg -y -f lavfi -i color=c=blue:size=64x64:d=0.5 -c:v libx264 -pix_fmt yuv420p "${tmp}"`,
      { stdio: "pipe" },
    );
    return tmp;
  } catch (_e) {
    fs.writeFileSync(fixture, Buffer.from("defora-e2e-mp4"));
    return fixture;
  }
}

const sampleVideo = resolveSampleVideo();

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}

const tmpRoot = fs.mkdtempSync(path.join(repoRoot, ".defora-e2e-upload-"));
const runsDir = path.join(tmpRoot, "runs");
const uploadsDir = path.join(runsDir, "uploads");
const framesDir = path.join(tmpRoot, "frames");
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });

const svc = await start({
  port: 0,
  runsDir,
  framesDir,
  uploadsDir,
  videoswarmDir: path.join(runsDir, "videoswarm"),
  sequencersDir: path.join(tmpRoot, "sequencers"),
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;

const browser = await chromium.launch({ headless: true });

try {
  const layoutRes = await fetch(`${base}/api/storage/layout`);
  if (!layoutRes.ok) throw new Error(`GET /api/storage/layout failed: ${layoutRes.status}`);
  const layout = await layoutRes.json();
  if (!layout.shared?.uploadsUnderRuns) {
    throw new Error(
      `uploadsDir should live under runsDir (got uploads=${layout.uploadsDir}, runs=${layout.runsDir})`,
    );
  }
  if (layout.uploadsDir !== uploadsDir) {
    throw new Error(`uploadsDir mismatch: ${layout.uploadsDir} !== ${uploadsDir}`);
  }

  const videoBytes = fs.readFileSync(sampleVideo);
  const uploadName = "vid_preview.mp4";
  const apiUpload = await fetch(
    `${base}/api/video-swarm/upload?name=${encodeURIComponent(uploadName)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "video/mp4",
        "X-Filename": uploadName,
      },
      body: videoBytes,
    },
  );
  if (!apiUpload.ok) {
    const err = await apiUpload.text();
    throw new Error(`POST /api/video-swarm/upload failed: ${apiUpload.status} ${err}`);
  }
  const uploaded = await apiUpload.json();
  if (!uploaded.path || !String(uploaded.path).includes("vid_preview")) {
    throw new Error(`Unexpected upload response: ${JSON.stringify(uploaded)}`);
  }

  const browseRes = await fetch(
    `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(uploadsDir)}&videosOnly=1&sort=mtime-desc`,
  );
  const browseBody = await browseRes.json();
  const found = (browseBody.videos || []).some((v) => String(v.name).includes("vid_preview"));
  if (!found) {
    throw new Error(`vid_preview not listed after API upload (${(browseBody.videos || []).length} videos)`);
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  const browserRoot = await openLibraryBrowser(page);

  const rootSelect = browserRoot.locator(".video-swarm-browser__roots select.framesync-select").first();
  await rootSelect.selectOption({ value: "uploads" });
  await page.waitForTimeout(500);

  const tile = browserRoot.locator('.video-swarm-browser__tile[data-video-path*="vid_preview"]').first();
  await tile.waitFor({ state: "visible", timeout: 20000 });

  const uiInput = browserRoot.locator('[data-testid="video-swarm-upload-input"]');
  await uiInput.setInputFiles(sampleVideo);
  await page.waitForTimeout(800);

  const uiTile = browserRoot.locator('.video-swarm-browser__tile[data-video-path*="vid_preview"]').first();
  await uiTile.waitFor({ state: "visible", timeout: 30000 });

  const mediaPath = await uiTile.getAttribute("data-video-path");
  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(mediaPath)}`,
  );
  if (!mediaRes.ok()) {
    throw new Error(`GET video file failed: ${mediaRes.status()}`);
  }

  console.log(
    `OK: storage layout unified (uploads under runs), API + UI upload of vid_preview.mp4, browser tile + file serve`,
  );
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
