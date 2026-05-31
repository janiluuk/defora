/**
 * Playwright E2E: user generates 16 frames → encoded video in Library → open editor.
 *
 * Flow:
 *   1. Drop 16 PNG frames into framesDir (simulated Deforum generation)
 *   2. RUNS → Frames rail shows all 16 thumbnails
 *   3. ffmpeg encodes frames → MP4 in uploads (user-generated video)
 *   4. Library browser lists the MP4; preview is watchable
 *   5. "Open in video editor" hands off to FreeCut with import URL
 *
 * Screenshots (SCREENSHOT_DIR or repo screenshots/e2e-16frames-<timestamp>/):
 *   01-live-frames-partial.png   — 8 frames in rail
 *   02-runs-frames-complete.png  — all 16 frames
 *   03-library-video-tile.png    — MP4 tile in Uploads browser
 *   04-library-video-preview.png — selected tile preview
 *   05-editor-handoff.png        — editor tab with import URL
 *   06-editor-freecut.png        — FreeCut iframe loaded
 *
 * Run:
 *   node docker/web/test/playwright-16frames-library-editor.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { startE2eServer } from './playwright-server.mjs';
import {
  dismissSessionModalIfOpen,
  openLibraryBrowser,
  openLiveFramesPanel,
  waitForNavTabs,
} from './playwright-nav.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TOTAL_FRAMES = 16;
const FPS = 16;
const FRAME_TIMEOUT = 25000;

function generateFramePng(outPath, frameIndex) {
  const colors = [
    'blue', 'green', 'red', 'yellow', 'cyan', 'magenta', 'orange', 'purple',
    'white', 'black', 'pink', 'brown', 'gray', 'gold', 'navy', 'lime',
  ];
  const color = colors[frameIndex % colors.length];
  execSync(
    `ffmpeg -y -f lavfi -i color=c=${color}:size=128x128:d=1 -frames:v 1 "${outPath}"`,
    { stdio: 'pipe' },
  );
}

function encodeMp4FromFrames(framesDir, outPath, frameCount, fps = FPS) {
  execSync(
    [
      'ffmpeg', '-y',
      '-framerate', String(fps),
      '-i', `"${path.join(framesDir, 'frame_%05d.png')}"`,
      '-frames:v', String(frameCount),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'ultrafast',
      '-crf', '28',
      `"${outPath}"`,
    ].join(' '),
    { stdio: 'pipe' },
  );
}

async function waitForFrameRailCount(page, count, timeoutMs = FRAME_TIMEOUT) {
  await page.waitForFunction(
    (expected) => {
      const items = document.querySelectorAll('[data-testid="frame-rail-item"]');
      if (items.length >= expected) return true;
      const meta = document.querySelector('.frame-rail__meta');
      if (meta) {
        const m = (meta.textContent || '').match(/(\d+)\s+generated/);
        if (m && parseInt(m[1], 10) >= expected) return true;
      }
      return document.querySelectorAll('.frame-rail__thumb').length >= expected;
    },
    count,
    { timeout: timeoutMs },
  );
}

async function selectUploadsRoot(browserRoot, page) {
  const rootSelect = browserRoot.locator('.video-swarm-browser__roots select.framesync-select').first();
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.video-swarm-browser__roots select.framesync-select');
      if (!el) return false;
      return Array.from(el.querySelectorAll('option')).some((o) => (o.value || '').toLowerCase() === 'uploads');
    },
    { timeout: 15000 },
  );
  await rootSelect.selectOption({ value: 'uploads' });
  await browserRoot.locator('.video-swarm-browser__empty').filter({ hasText: /^Scanning folder/ }).waitFor({
    state: 'detached',
    timeout: 15000,
  }).catch(() => null);
  await page.waitForTimeout(400);
}

async function enableFilenames(browserRoot) {
  const namesChip = browserRoot.locator('.video-swarm-browser__chips .chip').filter({ hasText: /^Names$/ }).first();
  if ((await namesChip.count()) > 0) {
    const cls = (await namesChip.getAttribute('class')) || '';
    if (!cls.includes('active')) await namesChip.click();
  }
}

async function waitForVideoTile(browserRoot, page, filename, timeoutMs = 25000) {
  const rootSelect = browserRoot.locator('.video-swarm-browser__roots select.framesync-select').first();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await rootSelect.selectOption({ value: 'frames' }).catch(() => null);
    await page.waitForTimeout(150);
    await rootSelect.selectOption({ value: 'uploads' }).catch(() => null);
    await page.waitForTimeout(600);
    const tile = browserRoot.locator(`.video-swarm-browser__tile[data-video-path*="${filename}"]`).first();
    if ((await tile.count()) > 0) return tile;
  }
  throw new Error(`Video tile "${filename}" did not appear within ${timeoutMs}ms`);
}

async function captureStep(page, dir, filename) {
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`📸  ${outPath}`);
  return outPath;
}

// ── setup ─────────────────────────────────────────────────────────────────────

const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const screenshotDir = process.env.SCREENSHOT_DIR
  ? path.resolve(process.env.SCREENSHOT_DIR)
  : path.join(repoRoot, 'screenshots', `e2e-16frames-${runId}`);

const STAGE_DIR = path.join(os.tmpdir(), `defora-e2e-16frames-stage-${Date.now()}`);
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-e2e-16frames-'));
const framesDir = path.join(tmpRoot, 'frames');
const runsDir = path.join(tmpRoot, 'runs');
const uploadsDir = path.join(tmpRoot, 'uploads');
const sequencersDir = path.join(tmpRoot, 'sequencers');

for (const d of [framesDir, runsDir, uploadsDir, sequencersDir, STAGE_DIR, screenshotDir]) {
  fs.mkdirSync(d, { recursive: true });
}

console.log(`Generating ${TOTAL_FRAMES} test frames…`);
const stagedFrames = [];
for (let i = 0; i < TOTAL_FRAMES; i++) {
  const name = `frame_${String(i).padStart(5, '0')}.png`;
  const staged = path.join(STAGE_DIR, name);
  generateFramePng(staged, i);
  stagedFrames.push({ name, staged, dest: path.join(framesDir, name) });
}
console.log(`✓  ${TOTAL_FRAMES} frames pre-generated`);

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  framesDir,
  runsDir,
  uploadsDir,
  sequencersDir,
});
const base = `http://127.0.0.1:${svc.port}`;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const freecutRes = await page.request.get(`${base}/freecut/`);
  if (!freecutRes.ok()) {
    throw new Error(`Expected GET /freecut/ 200, got ${freecutRes.status()}`);
  }

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await openLiveFramesPanel(page);
  await page.waitForTimeout(200);

  const partialAt = Math.floor(TOTAL_FRAMES / 2);
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const { staged, dest } = stagedFrames[i];
    fs.copyFileSync(staged, dest);
    await waitForFrameRailCount(page, i + 1);

    if (i + 1 === partialAt) {
      await captureStep(page, screenshotDir, '01-live-frames-partial.png');
    }
  }

  const railCount = await page.locator('[data-testid="frame-rail-item"]').count();
  if (railCount < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} frame rail items, got ${railCount}`);
  }
  await captureStep(page, screenshotDir, '02-runs-frames-complete.png');
  console.log(`✓  ${railCount} frames visible in RUNS → Frames rail`);

  const videoName = `user_16frames_${Date.now()}.mp4`;
  const videoPath = path.join(uploadsDir, videoName);
  encodeMp4FromFrames(framesDir, videoPath, TOTAL_FRAMES);
  const stat = fs.statSync(videoPath);
  if (stat.size < 200) throw new Error(`Encoded video too small: ${stat.size} bytes`);
  console.log(`✓  Encoded ${TOTAL_FRAMES} frames → ${videoName} (${stat.size} bytes)`);

  const framesRes = await page.request.get(`${base}/api/frames?limit=48`);
  if (!framesRes.ok()) throw new Error(`/api/frames failed: ${framesRes.status()}`);
  const framesJson = await framesRes.json();
  if ((framesJson.items || []).length < TOTAL_FRAMES) {
    throw new Error(`/api/frames returned ${(framesJson.items || []).length}, expected ${TOTAL_FRAMES}`);
  }

  const browserRoot = await openLibraryBrowser(page);
  await selectUploadsRoot(browserRoot, page);
  await enableFilenames(browserRoot);

  const tile = await waitForVideoTile(browserRoot, page, videoName);
  await tile.scrollIntoViewIfNeeded();
  await captureStep(page, screenshotDir, '03-library-video-tile.png');

  await tile.click();
  await page.waitForTimeout(500);
  const preview = page.locator('.video-swarm-browser__preview video, .video-swarm-browser__tile video').first();
  await preview.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  await captureStep(page, screenshotDir, '04-library-video-preview.png');

  const filePath = await tile.getAttribute('data-video-path');
  if (!filePath) throw new Error('Expected data-video-path on video tile');
  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`,
  );
  if (!mediaRes.ok()) {
    throw new Error(`Video file endpoint returned ${mediaRes.status()}`);
  }

  await page.locator('[data-testid="open-in-video-editor"]').first().click();
  await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 15000 });
  await page.waitForSelector('[data-testid="library-workspace-tab-editor"][aria-selected="true"]', {
    timeout: 15000,
  });
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15000 });

  const importUrl = page.locator('.editor-view__import-url');
  await importUrl.waitFor({ state: 'visible', timeout: 10000 });
  const urlText = ((await importUrl.textContent()) || '').trim();
  if (!urlText.includes('/api/video-swarm/file')) {
    throw new Error(`Expected import URL in editor, got: ${urlText}`);
  }
  await captureStep(page, screenshotDir, '05-editor-handoff.png');

  const frame = page.locator('[data-testid="freecut-editor-frame"]').first();
  await frame.waitFor({ state: 'visible', timeout: 15000 });
  const frameSrc = await frame.getAttribute('src');
  if (!frameSrc || !frameSrc.includes('/freecut/')) {
    throw new Error(`Expected FreeCut iframe src, got: ${frameSrc}`);
  }
  await captureStep(page, screenshotDir, '06-editor-freecut.png');

  console.log(
    `OK: ${TOTAL_FRAMES} frames → ${videoName} (${stat.size} bytes) in Library; editor handoff; ` +
      `screenshots in ${screenshotDir}`,
  );
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
  try { fs.rmSync(STAGE_DIR, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}
