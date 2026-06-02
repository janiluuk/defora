/**
 * Playwright E2E: WAN Video layer — 96 frames → encoded MP4 in Library.
 *
 * Verifies Wan settings merge (animation_mode, max_frames), WAN UI panel, frame rail, and video encode.
 *
 * Run:
 *   node docker/web/test/playwright-wan-96frames-video.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { startE2eServer } from './playwright-server.mjs';
import { seedE2eMedia } from './e2e-media-fixture.mjs';
import {
  DEFAULT_TOTAL_FRAMES,
  DEFAULT_FPS,
  encodeMp4FromFrames,
  waitForFrameRailCount,
  captureStep,
  resolveScreenshotDir,
  API_FRAMES_LIMIT,
} from './e2e-frame-video-helpers.mjs';
import {
  dismissSessionModalIfOpen,
  openLibraryBrowser,
  openLiveFramesPanel,
  openWanEnginePanel,
  waitForNavTabs,
  waitForProjectCard,
} from './playwright-nav.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TOTAL_FRAMES = DEFAULT_TOTAL_FRAMES;
const FPS = DEFAULT_FPS;
const screenshotDir = resolveScreenshotDir(repoRoot, 'e2e-wan-96frames');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-e2e-wan-96frames-'));
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

  const mergeRes = await page.request.post(`${base}/api/wan/merge-settings`, {
    data: {
      maxFrames: TOTAL_FRAMES,
      fps: FPS,
      prompt: 'ocean waves at dusk, cinematic wan video',
      wanEngine: {
        wan_speed_preset: 'Turbo',
        wan_t2v_model: '1.3B VACE',
        wan_inference_steps: 8,
      },
    },
  });
  if (!mergeRes.ok()) throw new Error(`/api/wan/merge-settings failed: ${mergeRes.status()}`);
  const merged = await mergeRes.json();
  if (merged.settings?.animation_mode !== 'Wan Video') {
    throw new Error(`expected animation_mode Wan Video, got ${merged.settings?.animation_mode}`);
  }
  if (Number(merged.settings?.max_frames) !== TOTAL_FRAMES) {
    throw new Error(`expected max_frames ${TOTAL_FRAMES}, got ${merged.settings?.max_frames}`);
  }
  console.log(`✓  Wan merge: animation_mode=${merged.settings.animation_mode} max_frames=${merged.settings.max_frames}`);

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await openWanEnginePanel(page);
  await page.locator('[data-testid="wan-speed-preset-Turbo"]').click();
  await page.waitForSelector('[data-testid="wan-plugin-panel"] .chip.active', { timeout: 5000 });
  await captureStep(page, screenshotDir, '01-wan-engine-panel.png');
  console.log('✓  WAN Video layer + Turbo preset in engine drawer');

  await openLiveFramesPanel(page);
  await page.waitForTimeout(300);

  console.log(`Seeding ${TOTAL_FRAMES} frames (simulated Wan output)…`);
  seedE2eMedia({ framesDir, uploadsDir, frameCount: TOTAL_FRAMES });
  const onDisk = fs.readdirSync(framesDir).filter((f) => /^frame_\d+\.png$/i.test(f)).length;
  if (onDisk < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} PNGs in framesDir, found ${onDisk}`);
  }

  await waitForFrameRailCount(page, TOTAL_FRAMES);
  const railCount = await page.locator('[data-testid="frame-rail-item"]').count();
  if (railCount < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} frame rail items, got ${railCount}`);
  }
  console.log(`✓  ${railCount} frames visible in frame rail`);
  await captureStep(page, screenshotDir, '02-wan-frame-rail-96.png');

  const videoName = `wan_${TOTAL_FRAMES}frames_${Date.now()}.mp4`;
  const projectDir = path.join(uploadsDir, 'projects', `wan-${TOTAL_FRAMES}frames`);
  fs.mkdirSync(projectDir, { recursive: true });
  const videoPath = path.join(projectDir, videoName);
  encodeMp4FromFrames(framesDir, videoPath, TOTAL_FRAMES, FPS);
  const stat = fs.statSync(videoPath);
  if (stat.size < 500) throw new Error(`Encoded video too small: ${stat.size} bytes`);
  const durationSec = TOTAL_FRAMES / FPS;
  console.log(`✓  Encoded ${TOTAL_FRAMES} frames @ ${FPS}fps (~${durationSec.toFixed(1)}s) → ${videoName}`);

  const framesRes = await page.request.get(`${base}/api/frames?limit=${API_FRAMES_LIMIT}`);
  if (!framesRes.ok()) throw new Error(`/api/frames failed: ${framesRes.status()}`);
  const framesJson = await framesRes.json();
  const apiCount = (framesJson.items || []).length;
  const apiExpected = Math.min(TOTAL_FRAMES, API_FRAMES_LIMIT);
  if (apiCount < apiExpected) {
    throw new Error(`/api/frames returned ${apiCount}, expected at least ${apiExpected}`);
  }
  console.log(`✓  /api/frames serves ${apiCount} entries`);

  const browserRoot = await openLibraryBrowser(page);
  const card = await waitForProjectCard(browserRoot, page, videoName);
  await card.scrollIntoViewIfNeeded();
  await captureStep(page, screenshotDir, '03-wan-library-video-tile.png');

  const filePath = await card.getAttribute('data-video-path');
  if (!filePath) throw new Error('Expected data-video-path on video tile');
  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`,
  );
  if (!mediaRes.ok()) {
    throw new Error(`Video file endpoint returned ${mediaRes.status()}`);
  }

  console.log(
    `\nOK: WAN ${TOTAL_FRAMES} frames → ${videoName} (${stat.size} bytes, ~${durationSec.toFixed(1)}s @ ${FPS}fps)` +
      (screenshotDir ? `; screenshots in ${screenshotDir}` : '') +
      '\n',
  );
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}
