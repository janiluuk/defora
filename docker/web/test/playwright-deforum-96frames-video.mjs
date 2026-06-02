/**
 * Playwright E2E: 96 frames → encoded MP4 in Library.
 *
 * Simulates Deforum output by seeding 96 PNGs into framesDir (ffmpeg testsrc),
 * verifies the frame rail and /api/frames, encodes a 4s @ 24fps MP4, and checks Library playback.
 *
 * Run:
 *   node docker/web/test/playwright-deforum-96frames-video.mjs
 *
 * Optional:
 *   E2E_FRAME_COUNT=24  — shorter run for debugging
 *   SCREENSHOT_DIR=...  — capture rail + library shots
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { startE2eServer } from './playwright-server.mjs';
import { seedE2eMedia } from './e2e-media-fixture.mjs';
import {
  dismissSessionModalIfOpen,
  openLibraryBrowser,
  openLiveFramesPanel,
  waitForNavTabs,
  waitForProjectCard,
} from './playwright-nav.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TOTAL_FRAMES = Math.max(8, Number(process.env.E2E_FRAME_COUNT) || 96);
const FPS = Number(process.env.E2E_VIDEO_FPS) || 24;
const FRAME_TIMEOUT = Number(process.env.E2E_FRAME_TIMEOUT_MS) || 180_000;
const API_FRAMES_LIMIT = 50;

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

async function captureStep(page, dir, filename) {
  if (!dir) return;
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`📸  ${outPath}`);
}

const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const screenshotDir = process.env.SCREENSHOT_DIR
  ? path.resolve(process.env.SCREENSHOT_DIR)
  : (process.env.E2E_SCREENSHOTS === '1'
    ? path.join(repoRoot, 'screenshots', `e2e-96frames-${runId}`)
    : null);

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-e2e-96frames-'));
const framesDir = path.join(tmpRoot, 'frames');
const runsDir = path.join(tmpRoot, 'runs');
const uploadsDir = path.join(tmpRoot, 'uploads');
const sequencersDir = path.join(tmpRoot, 'sequencers');

for (const d of [framesDir, runsDir, uploadsDir, sequencersDir]) {
  fs.mkdirSync(d, { recursive: true });
}
if (screenshotDir) fs.mkdirSync(screenshotDir, { recursive: true });

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

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);
  await openLiveFramesPanel(page);
  await page.waitForTimeout(300);

  console.log(`Seeding ${TOTAL_FRAMES} frames into watched framesDir…`);
  seedE2eMedia({ framesDir, uploadsDir, frameCount: TOTAL_FRAMES });
  const onDisk = fs.readdirSync(framesDir).filter((f) => /^frame_\d+\.png$/i.test(f)).length;
  if (onDisk < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} PNGs in framesDir, found ${onDisk}`);
  }
  console.log(`✓  ${onDisk} PNG frames written; waiting for frame rail…`);

  await waitForFrameRailCount(page, TOTAL_FRAMES, FRAME_TIMEOUT);
  const railCount = await page.locator('[data-testid="frame-rail-item"]').count();
  if (railCount < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} frame rail items, got ${railCount}`);
  }
  console.log(`✓  ${railCount} frames visible in frame rail`);
  await captureStep(page, screenshotDir, '01-frame-rail-96.png');

  const videoName = `defora_${TOTAL_FRAMES}frames_${Date.now()}.mp4`;
  const projectDir = path.join(uploadsDir, 'projects', `user-${TOTAL_FRAMES}frames`);
  fs.mkdirSync(projectDir, { recursive: true });
  const videoPath = path.join(projectDir, videoName);
  encodeMp4FromFrames(framesDir, videoPath, TOTAL_FRAMES);
  const stat = fs.statSync(videoPath);
  if (stat.size < 500) throw new Error(`Encoded video too small: ${stat.size} bytes`);
  const durationSec = TOTAL_FRAMES / FPS;
  console.log(`✓  Encoded ${TOTAL_FRAMES} frames @ ${FPS}fps (~${durationSec.toFixed(1)}s) → ${videoName} (${stat.size} bytes)`);

  const framesRes = await page.request.get(`${base}/api/frames?limit=${API_FRAMES_LIMIT}`);
  if (!framesRes.ok()) throw new Error(`/api/frames failed: ${framesRes.status()}`);
  const framesJson = await framesRes.json();
  const apiCount = (framesJson.items || []).length;
  const apiExpected = Math.min(TOTAL_FRAMES, API_FRAMES_LIMIT);
  if (apiCount < apiExpected) {
    throw new Error(`/api/frames returned ${apiCount}, expected at least ${apiExpected}`);
  }
  console.log(`✓  /api/frames serves ${apiCount} entries (cap ${API_FRAMES_LIMIT})`);

  const browserRoot = await openLibraryBrowser(page);
  const card = await waitForProjectCard(browserRoot, page, videoName);
  await card.scrollIntoViewIfNeeded();
  await captureStep(page, screenshotDir, '02-library-video-tile.png');

  const filePath = await card.getAttribute('data-video-path');
  if (!filePath) throw new Error('Expected data-video-path on video tile');
  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`,
  );
  if (!mediaRes.ok()) {
    throw new Error(`Video file endpoint returned ${mediaRes.status()}`);
  }
  const contentType = mediaRes.headers()['content-type'] || '';
  if (!contentType.includes('video') && !contentType.includes('octet')) {
    throw new Error(`Unexpected content-type: ${contentType}`);
  }

  console.log(
    `\nOK: ${TOTAL_FRAMES} frames → ${videoName} (${stat.size} bytes, ~${durationSec.toFixed(1)}s @ ${FPS}fps)` +
      (screenshotDir ? `; screenshots in ${screenshotDir}` : '') +
      '\n',
  );
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}
