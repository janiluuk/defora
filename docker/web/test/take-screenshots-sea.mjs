/**
 * Screenshot capture using animated sea background on every tab.
 * Usage: node test/take-screenshots-sea.mjs
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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-sea-shots-'));
const framesDir = path.join(tmpDir, 'frames');
const uploadsDir = path.join(tmpDir, 'uploads');
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

// Generate animated sea video using ffmpeg geq filter
// Deep ocean blues/teals with rolling wave motion
const seaVideoPath = path.join(uploadsDir, 'sea-anim.mp4');
console.log('Generating sea animation…');
execSync(
  `ffmpeg -y \
  -f lavfi \
  -i "color=0x06101e:size=960x540:rate=24,geq=\
r='clip(30+40*sin(2*PI*(X/W*3+T*0.4))*sin(2*PI*(Y/H*2+T*0.25))+20*sin(2*PI*(X/W*1.2-T*0.3)),0,255)':\
g='clip(80+60*sin(2*PI*(X/W*2+T*0.35))*cos(2*PI*(Y/H*1.5+T*0.2))+40*sin(2*PI*(X/W*0.8+Y/H-T*0.45)),0,255)':\
b='clip(140+80*cos(2*PI*(X/W+Y/H*0.5+T*0.3))*sin(2*PI*(X/W*1.5+T*0.28))+30*sin(2*PI*(Y/H*3-T*0.5)),0,255)'" \
  -t 8 \
  -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 20 \
  "${seaVideoPath}"`,
  { stdio: 'pipe' },
);
console.log('Sea animation ready.');

// Also generate some sea-coloured still frames so the frame-rail shows something
const seaColors = ['0x0a1e38', '0x0c2244', '0x0a1e38', '0x081828', '0x0e2648'];
for (let i = 0; i < 20; i++) {
  const col = seaColors[i % seaColors.length];
  const out = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
  execSync(
    `ffmpeg -y -f lavfi -i "color=${col}:size=960x540:d=1" -frames:v 1 -update 1 "${out}"`,
    { stdio: 'pipe' },
  );
}

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

const seaVideoUrl = `${base}/api/video-swarm/file?path=${encodeURIComponent(seaVideoPath)}`;

const browser = await chromium.launch({ headless: true });

async function dismissRestoreModal(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
  }
}

// Inject sea video into the preview player and let it play a beat
async function injectSea(page) {
  await page.evaluate((src) => {
    const player =
      document.getElementById('player') ||
      document.querySelector('video.preview-video') ||
      document.querySelector('video') ||
      document.querySelector('.player');
    if (player && player.tagName === 'VIDEO') {
      if (player.src !== src) {
        player.src = src;
        player.loop = true;
        player.muted = true;
        player.load();
      }
      player.play().catch(() => {});
    }
  }, seaVideoUrl);
  // Give video time to decode a frame and render
  await page.waitForTimeout(900);
}

async function shot(page, name) {
  await page.waitForTimeout(300);
  const p = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log('  saved', p);
}

async function clickTab(page, label) {
  await clickNavTab(page, label);
  await page.waitForTimeout(400);
  await injectSea(page);
}

async function clickSubPill(page, label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) > 0) {
    await pill.click({ force: true });
    await page.waitForTimeout(400);
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await dismissRestoreModal(page);
  await waitForNavTabs(page);

  // LIVE
  await clickTab(page, 'LIVE');
  await shot(page, 'live-tab.png');

  // PROMPTS sub-tabs — re-inject sea on each switch so the preview stays live
  await clickTab(page, 'PROMPTS');
  await clickSubPill(page, 'PROMPTS');
  await shot(page, 'prompts-tab.png');
  await clickSubPill(page, 'LORA');
  await injectSea(page);
  await shot(page, 'lora-tab.png');
  await clickSubPill(page, 'CONTROLNET');
  await injectSea(page);
  await shot(page, 'cn-tab.png');

  // MOTION
  await clickTab(page, 'MOTION');
  await page.waitForSelector('[data-testid="motion-hero-stage"]', { timeout: 15_000 }).catch(() => null);
  await shot(page, 'motion-tab.png');
  const motionDock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock');
  if ((await motionDock.count()) > 0) {
    await motionDock.first().scrollIntoViewIfNeeded().catch(() => null);
    await page.waitForTimeout(300);
  }
  await shot(page, 'motion-sequencer-tab.png');

  // MODULATION
  await clickTab(page, 'MODULATION');
  await shot(page, 'modulation-tab.png');

  // AUDIO
  await clickTab(page, 'AUDIO');
  await shot(page, 'audio-tab.png');

  // RUNS
  await clickTab(page, 'RUNS');
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 20_000 }).catch(() => null);
  await page.waitForTimeout(500);
  await shot(page, 'runs-tab.png');

  // GENERATE
  await clickTab(page, 'GENERATE');
  await page.waitForSelector('[data-testid="sequencer-controls-panel"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(500);
  await shot(page, 'generate-tab.png');

  // SETTINGS
  await clickTab(page, 'SETTINGS');
  await clickSubPill(page, 'ENGINE');
  await shot(page, 'settings-tab.png');
  await clickSubPill(page, 'OUTPUT');
  await injectSea(page);
  await page.waitForTimeout(400);
  await shot(page, 'stream-tab.png');

  // LIBRARY workspace
  await injectSea(page);
  await openLibraryBrowser(page);
  await injectSea(page);
  await page.waitForSelector('[data-testid="library-browser"]', { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(700);
  await shot(page, 'library-tab.png');
  await page.locator('[data-testid="close-library-workspace"]').click().catch(() => null);
  await page.waitForTimeout(300);

  // Landing overview
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await dismissRestoreModal(page);
  await waitForNavTabs(page, 20_000);
  await injectSea(page);
  await shot(page, 'main.png');

  console.log(`\nAll screenshots in: ${SHOTS_DIR}`);
  console.log(fs.readdirSync(SHOTS_DIR).filter((f) => f.endsWith('.png')).sort().join(', '));
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
