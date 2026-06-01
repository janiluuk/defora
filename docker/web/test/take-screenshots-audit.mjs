/**
 * Full UI audit screenshots — all top-level tabs, key sub-tabs, library panes.
 * Usage: OUT_DIR=/path/to/out node test/take-screenshots-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { start } from '../server.js';
import {
  clickTab as clickNavTab,
  ensureRightPanelOpen,
  openLibraryBrowser,
  openLibraryEditorTab,
  waitForNavTabs,
} from './playwright-nav.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const SHOTS_DIR = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.join(repoRoot, 'screenshots', `audit-${runId}`);
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-audit-shots-'));
const framesDir = path.join(tmpDir, 'frames');
const uploadsDir = path.join(tmpDir, 'uploads');
const projectsDir = path.join(uploadsDir, 'projects', 'demo-orbit');
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(projectsDir, { recursive: true });

const colors = [
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta',
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta',
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet', 'magenta',
];
for (let i = 0; i < 24; i++) {
  const out = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
  execSync(
    `ffmpeg -y -f lavfi -i color=c=${colors[i]}:size=960x540:d=1 -frames:v 1 "${out}"`,
    { stdio: 'pipe' },
  );
  if (i < 4) {
    fs.copyFileSync(out, path.join(projectsDir, `frame_${String(i).padStart(5, '0')}.png`));
  }
}

const videoPath = path.join(uploadsDir, 'preview_demo.mp4');
const projectVideo = path.join(projectsDir, 'orbit-export.mp4');
execSync(
  `ffmpeg -y -framerate 8 -i "${framesDir}/frame_%05d.png" -frames:v 24 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 "${videoPath}"`,
  { stdio: 'pipe' },
);
execSync(
  `ffmpeg -y -framerate 4 -i "${projectsDir}/frame_%05d.png" -frames:v 4 -c:v libx264 -pix_fmt yuv420p -preset ultrafast -crf 28 "${projectVideo}"`,
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

const manifest = [];
const browser = await chromium.launch({ headless: true });

async function dismissRestoreModal(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
  }
}

async function shot(page, name, label) {
  await page.waitForTimeout(450);
  const p = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  manifest.push({ file: name, label: label || name, path: p });
  console.log('  saved', name);
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

  await clickTab(page, 'LIVE');
  await page.evaluate((videoSrc) => {
    const player = document.getElementById('player') || document.querySelector('video');
    if (player?.tagName === 'VIDEO') {
      player.src = videoSrc;
      player.load();
      player.play().catch(() => {});
    }
  }, `${base}/api/video-swarm/file?path=${encodeURIComponent(videoPath)}`);
  await page.waitForTimeout(1200);
  await shot(page, '01-live.png', 'LIVE — main stage');

  await ensureRightPanelOpen(page);
  await page.waitForTimeout(600);
  await shot(page, '02-live-controls.png', 'LIVE — Controls drawer (summary + live params)');

  const engineToggle = page.locator('[data-testid="engine-drawer-toggle"]').first();
  if ((await engineToggle.count()) > 0) {
    const expanded = await engineToggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await engineToggle.click();
    await page.waitForTimeout(800);
    await shot(page, '03-live-engine-drawer.png', 'LIVE — engine drawer');
  }

  const layersToggle = page.locator('[data-testid="layers-sidebar-toggle"]').first();
  if ((await layersToggle.count()) > 0) {
    const layersOpen = await layersToggle.getAttribute('aria-expanded');
    if (layersOpen !== 'true') await layersToggle.click();
    await page.waitForTimeout(500);
    await shot(page, '04-live-layers-rail.png', 'LIVE — layers rail');
    if (layersOpen !== 'true') await layersToggle.click();
  }

  await clickTab(page, 'PROMPTS');
  await ensureRightPanelOpen(page);
  await clickSubPill(page, 'PROMPTS');
  await shot(page, '05-prompts.png', 'PROMPTS — prompt morphing');
  await clickSubPill(page, 'IMAGE');
  await shot(page, '06-prompts-image.png', 'PROMPTS — image');
  await clickSubPill(page, 'LORA');
  await shot(page, '07-prompts-lora.png', 'PROMPTS — LoRA');
  await clickSubPill(page, 'CONTROLNET');
  await shot(page, '08-prompts-controlnet.png', 'PROMPTS — ControlNet');
  await clickSubPill(page, 'STORY');
  await shot(page, '09-prompts-story.png', 'PROMPTS — story generator');

  await clickTab(page, 'MOTION');
  await ensureRightPanelOpen(page);
  await page.waitForSelector('[data-testid="motion-hero-stage"]', { timeout: 15_000 }).catch(() => null);
  await shot(page, '10-motion.png', 'MOTION — hero pad + sequencer summary');
  const motionDock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock');
  if ((await motionDock.count()) > 0) {
    await motionDock.first().scrollIntoViewIfNeeded().catch(() => null);
    await page.waitForTimeout(400);
  }
  await shot(page, '11-motion-sequencer.png', 'MOTION — sequencer dock');

  await clickTab(page, 'MODULATION');
  await ensureRightPanelOpen(page);
  await shot(page, '12-modulation.png', 'MODULATION — LFO');

  await clickTab(page, 'AUDIO');
  await ensureRightPanelOpen(page);
  await shot(page, '13-audio.png', 'AUDIO — reactive panel');

  await clickTab(page, 'SETTINGS');
  await ensureRightPanelOpen(page);
  await clickSubPill(page, 'RUNS');
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 20_000 }).catch(() => null);
  await page.waitForTimeout(600);
  await shot(page, '14-runs.png', 'SETTINGS — runs monitor');
  await page.locator('[data-testid="runs-browser-tab-frames"]').click().catch(() => null);
  await page.waitForTimeout(500);
  await shot(page, '15-runs-frames.png', 'SETTINGS — runs frames rail');

  await clickTab(page, 'SETTINGS');
  await ensureRightPanelOpen(page);
  for (const [file, pill, label] of [
    ['16-settings-engine.png', 'ENGINE', 'SETTINGS — engine'],
    ['17-settings-output.png', 'OUTPUT', 'SETTINGS — output / stream'],
    ['18-settings-gpus.png', 'GPUS', 'SETTINGS — GPUs'],
    ['19-settings-midi.png', 'CONTROLLERS / MIDI', 'SETTINGS — MIDI'],
    ['20-settings-styles.png', 'STYLES', 'SETTINGS — styles'],
    ['21-settings-collab.png', 'COLLAB', 'SETTINGS — collab'],
    ['22-settings-plugins.png', 'PLUGINS', 'SETTINGS — plugins registry'],
  ]) {
    await clickSubPill(page, pill);
    await page.waitForTimeout(500);
    await shot(page, file, label);
  }

  await openLibraryBrowser(page);
  await page.waitForSelector('[data-testid="library-browser"]', { timeout: 15_000 });
  await page.waitForFunction(() => {
    const sk = document.querySelector('.library-browser__skeleton-grid');
    return !sk;
  }, { timeout: 15_000 }).catch(() => null);
  await page.locator('[data-testid="library-tab-projects"]').click();
  await page.waitForTimeout(800);
  await shot(page, '23-library-projects.png', 'Library — Projects');

  await page.locator('[data-testid="library-tab-videos"]').click();
  await page.waitForSelector('[data-testid="videos-browser"]', { timeout: 15_000 });
  await page.waitForFunction(() => {
    const sk = document.querySelector('.library-browser__skeleton-grid');
    return !sk;
  }, { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(600);
  await shot(page, '24-library-videos.png', 'Library — Videos');

  await page.locator('[data-testid="library-tab-audio"]').click();
  await page.waitForSelector('[data-testid="audio-browser"]', { timeout: 15_000 });
  await page.waitForFunction(() => {
    const sk = document.querySelector('.library-browser__skeleton-grid');
    return !sk;
  }, { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(600);
  await shot(page, '25-library-audio.png', 'Library — Audio');

  await page.locator('[data-testid="library-tab-files"]').click().catch(() => null);
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(800);
  await shot(page, '26-library-files.png', 'Library — Files (VideoSwarm browser)');

  await page.locator('[data-testid="library-tab-projects"]').click();
  await page.waitForTimeout(400);
  const videoCard = page.locator('[data-testid="project-card"]').first();
  if ((await videoCard.count()) > 0) {
    await videoCard.click();
    await page.waitForTimeout(400);
  }
  await page.locator('[data-testid="library-workspace-tab-editor"]').click();
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForSelector('[data-testid="freecut-editor-frame"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(5000);
  await shot(page, '27-library-editor.png', 'Library — video editor (FreeCut)');

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await dismissRestoreModal(page);
  await waitForNavTabs(page, 20_000);
  await page.waitForTimeout(600);
  await shot(page, '00-main-overview.png', 'Overview — default LIVE landing');

  fs.writeFileSync(path.join(SHOTS_DIR, 'manifest.json'), JSON.stringify({ base, shots: manifest }, null, 2));
  console.log(`\nAudit screenshots: ${SHOTS_DIR}`);
  console.log(`${manifest.length} files`);
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
