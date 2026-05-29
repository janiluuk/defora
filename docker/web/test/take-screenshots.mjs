/**
 * Take fresh UI screenshots of all tabs, with a real video playing on the LIVE tab.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { start } from '/home/jani/workspace/defora/docker/web/server.js';

const SHOTS_DIR = `/home/jani/workspace/defora/screenshots/run-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Date.now()}`;
fs.mkdirSync(SHOTS_DIR, { recursive: true });

// Build a short real MP4 to serve as a preview video
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-shots-'));
const framesDir = path.join(tmpDir, 'frames');
const uploadsDir = path.join(tmpDir, 'uploads');
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

// Generate 24 colourful frames
const colors = ['red','orange','yellow','green','cyan','blue','violet','magenta',
                 'red','orange','yellow','green','cyan','blue','violet','magenta',
                 'red','orange','yellow','green','cyan','blue','violet','magenta'];
console.log('Generating frames…');
for (let i = 0; i < 24; i++) {
  const out = path.join(framesDir, `frame_${String(i).padStart(5,'0')}.png`);
  execSync(`ffmpeg -y -f lavfi -i color=c=${colors[i]}:size=960x540:d=1 -frames:v 1 "${out}"`, { stdio:'pipe' });
}

// Encode to MP4
const videoPath = path.join(uploadsDir, 'preview_demo.mp4');
execSync(
  `ffmpeg -y -framerate 8 -i "${framesDir}/frame_%05d.png" -frames:v 24 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 "${videoPath}"`,
  { stdio:'pipe' }
);
console.log('Video ready:', videoPath);

const svc = await start({
  port: 0,
  framesDir,
  uploadsDir,
  runsDir: path.join(tmpDir, 'runs'),
  hlsDir:  path.join(tmpDir, 'hls'),
  sequencersDir: path.join(tmpDir, 'seq'),
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;
console.log('Server at', base);

const browser = await chromium.launch({ headless: true });

async function shot(page, name) {
  await page.waitForTimeout(400);
  const p = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log('  saved', p);
}

async function clickTab(page, label) {
  const tab = page.locator('.top-nav .tab, header .tab').filter({
    has: page.locator('.tab__label').filter({ hasText: new RegExp(`^${label}$`) }),
  }).first();
  await tab.click();
  await page.waitForTimeout(300);
}

async function openFramesPanel(page) {
  const drawerToggle = page.locator('[data-testid="bottom-drawer-toggle"]');
  if ((await drawerToggle.count()) > 0) {
    const expanded = await drawerToggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await drawerToggle.click();
  }
  await page.locator('.live-top-drawer__tabs .sub-pill').filter({ hasText: /^SYSTEM$/ }).click();
  await page.locator('[data-testid="runs-browser-tab-frames"]').click();
  await page.waitForSelector('[data-testid="runs-browser-frames"]', { timeout: 15_000 });
}

async function clickSubPill(page, label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) > 0) { await pill.click(); await page.waitForTimeout(300); }
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10_000 });
  }
  await page.waitForSelector('header .tab', { timeout: 30_000 });

  // ── LIVE tab: inject the demo video into the player via JS, then screenshot
  await clickTab(page, 'LIVE');
  await page.waitForTimeout(600);

  // Try to load the demo video into the player element
  await page.evaluate((videoSrc) => {
    // Try HLS player first, fall back to raw <video>
    const player = document.getElementById('player') ||
                   document.querySelector('video') ||
                   document.querySelector('.player');
    if (player && player.tagName === 'VIDEO') {
      player.src = videoSrc;
      player.load();
      player.play().catch(() => {});
    }
    // Also try to set a poster frame via canvas snapshot
  }, `${base}/api/video-swarm/file?path=${encodeURIComponent(videoPath)}`);

  await page.waitForTimeout(1200);

  await openFramesPanel(page);
  await page.waitForTimeout(400);
  await shot(page, 'live-tab.png');

  // ── STREAM tab
  await clickTab(page, 'STREAM');
  await shot(page, 'stream-tab.png');

  // ── PROMPTS tab
  await clickTab(page, 'PROMPTS');
  await clickSubPill(page, 'PROMPTS');
  await shot(page, 'prompts-tab.png');

  // ── MOTION tab (sequencer below preview + motion controls on the side)
  await clickTab(page, 'MOTION');
  await shot(page, 'motion-tab.png');
  const motionSequencer = page.locator('[data-testid="motion-sequencer-dock"]');
  if (await motionSequencer.count()) {
    await motionSequencer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  }
  await shot(page, 'motion-sequencer-tab.png');

  // ── MODULATION
  await clickTab(page, 'MODULATION');
  await shot(page, 'modulation-tab.png');

  // ── LIBRARY
  await clickTab(page, 'LIBRARY');
  const libRootSelect = page.locator('.video-swarm-browser__roots select.framesync-select').first();
  if ((await libRootSelect.count()) > 0) {
    await libRootSelect.selectOption({ value: 'uploads' }).catch(() => null);
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(600);
  await shot(page, 'library-tab.png');

  // ── SETTINGS / LORA
  await clickTab(page, 'SETTINGS');
  await clickSubPill(page, 'LORA');
  await shot(page, 'lora-tab.png');

  // ── SETTINGS / CN
  await clickSubPill(page, 'CN');
  await shot(page, 'cn-tab.png');

  // ── SETTINGS / SYSTEM (runs monitor)
  await clickSubPill(page, 'SYSTEM');
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 20000 });
  await page.waitForTimeout(800);
  await shot(page, 'settings-tab.png');

  // ── Main overview (default landing state)
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('header .tab', { timeout: 20_000 });
  const modal2 = page.locator('.restore-session-modal');
  if ((await modal2.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal2.waitFor({ state: 'hidden', timeout: 10_000 });
  }
  await page.waitForTimeout(600);
  await shot(page, 'main.png');

  console.log(`\nAll screenshots in: ${SHOTS_DIR}`);
  console.log(fs.readdirSync(SHOTS_DIR).join(', '));

} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
