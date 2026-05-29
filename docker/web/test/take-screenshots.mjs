/**
 * Capture fresh UI screenshots for all top-level tabs and key sub-tabs.
 * Writes PNGs to repo screenshots/ (override with OUT_DIR).
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { start } from '../server.js';
import {
  clickTab as clickNavTab,
  openLibraryBrowser,
  waitForNavTabs,
} from './playwright-nav.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const SHOTS_DIR = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.join(repoRoot, 'screenshots');
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-shots-'));
const framesDir = path.join(tmpDir, 'frames');
const uploadsDir = path.join(tmpDir, 'uploads');
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const colors = [
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta',
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta',
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta',
];
console.log('Generating demo frames…');
for (let i = 0; i < 24; i++) {
  const out = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
  execSync(
    `ffmpeg -y -f lavfi -i color=c=${colors[i]}:size=960x540:d=1 -frames:v 1 "${out}"`,
    { stdio: 'pipe' },
  );
}

const videoPath = path.join(uploadsDir, 'preview_demo.mp4');
execSync(
  `ffmpeg -y -framerate 8 -i "${framesDir}/frame_%05d.png" -frames:v 24 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 "${videoPath}"`,
  { stdio: 'pipe' },
);

const svc = await start({
  port: 0,
  framesDir,
  uploadsDir,
  runsDir: path.join(tmpDir, 'runs'),
  hlsDir: path.join(tmpDir, 'hls'),
  sequencersDir: path.join(tmpDir, 'seq'),
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;
console.log('Server at', base);

const browser = await chromium.launch({ headless: true });

async function dismissRestoreModal(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
  }
}

async function shot(page, name) {
  await page.waitForTimeout(400);
  const p = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log('  saved', p);
}

async function clickTab(page, label) {
  await clickNavTab(page, label);
  await page.waitForTimeout(500);
}

async function clickSubPill(page, label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) > 0) {
    await pill.click({ force: true });
    await page.waitForTimeout(500);
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await dismissRestoreModal(page);
  await waitForNavTabs(page);

  // LIVE — inject demo video for a colourful stage
  await clickTab(page, 'LIVE');
  await page.evaluate((videoSrc) => {
    const player = document.getElementById('player')
      || document.querySelector('video')
      || document.querySelector('.player');
    if (player && player.tagName === 'VIDEO') {
      player.src = videoSrc;
      player.load();
      player.play().catch(() => {});
    }
  }, `${base}/api/video-swarm/file?path=${encodeURIComponent(videoPath)}`);
  await page.waitForTimeout(1200);
  await shot(page, 'live-tab.png');

  // PROMPTS sub-tabs
  await clickTab(page, 'PROMPTS');
  await clickSubPill(page, 'PROMPTS');
  await shot(page, 'prompts-tab.png');
  await clickSubPill(page, 'LORA');
  await shot(page, 'lora-tab.png');
  await clickSubPill(page, 'CONTROLNET');
  await shot(page, 'cn-tab.png');

  // MOTION — hero pad + sequencer dock
  await clickTab(page, 'MOTION');
  await page.waitForSelector('[data-testid="motion-hero-stage"]', { timeout: 15_000 }).catch(() => null);
  await shot(page, 'motion-tab.png');
  const motionDock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock');
  if ((await motionDock.count()) > 0) {
    await motionDock.first().scrollIntoViewIfNeeded().catch(() => null);
    await page.waitForTimeout(400);
  }
  await shot(page, 'motion-sequencer-tab.png');

  // MODULATION
  await clickTab(page, 'MODULATION');
  await shot(page, 'modulation-tab.png');

  // AUDIO (first-class tab)
  await clickTab(page, 'AUDIO');
  await shot(page, 'audio-tab.png');

  // RUNS (first-class tab)
  await clickTab(page, 'RUNS');
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 20_000 }).catch(() => null);
  await page.waitForTimeout(600);
  await shot(page, 'runs-tab.png');

  // GENERATE — timeline dock under preview
  await clickTab(page, 'GENERATE');
  await page.waitForSelector('[data-testid="sequencer-controls-panel"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(600);
  await shot(page, 'generate-tab.png');

  // SETTINGS — ENGINE + OUTPUT (stream moved here)
  await clickTab(page, 'SETTINGS');
  await clickSubPill(page, 'ENGINE');
  await shot(page, 'settings-tab.png');
  await clickSubPill(page, 'OUTPUT');
  await page.waitForTimeout(600);
  await shot(page, 'stream-tab.png');

  // LIBRARY workspace
  await openLibraryBrowser(page);
  await page.waitForSelector('[data-testid="library-browser"]', { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(800);
  await shot(page, 'library-tab.png');
  await page.locator('[data-testid="close-library-workspace"]').click().catch(() => null);
  await page.waitForTimeout(400);

  // Landing overview
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await dismissRestoreModal(page);
  await waitForNavTabs(page, 20_000);
  await page.waitForTimeout(600);
  await shot(page, 'main.png');

  console.log(`\nAll screenshots in: ${SHOTS_DIR}`);
  console.log(fs.readdirSync(SHOTS_DIR).filter((f) => f.endsWith('.png')).sort().join(', '));
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
