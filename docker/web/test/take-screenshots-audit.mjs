/**
 * Full UI audit screenshots — all top-level tabs, key sub-tabs, library panes.
 * Usage: OUT_DIR=/path/to/out node test/take-screenshots-audit.mjs
 * Fast:  E2E_FAST=1 node test/take-screenshots-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { chromium } from 'playwright';
import { seedE2eMedia } from './e2e-media-fixture.mjs';
import {
  attachLiveDemoVideo,
  E2E_FAST,
  pauseMs,
  prepareScreenshotPage,
  settle,
  waitForFreecutShell,
  waitForLibrarySkeletonGone,
} from './playwright-screenshot-helpers.mjs';
import {
  clickTab as clickNavTab,
  dismissSessionModalIfOpen,
  ensureRightPanelOpen,
  openLibraryBrowser,
  waitForNavTabs,
} from './playwright-nav.mjs';
import { startE2eServer } from './playwright-server.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const SHOTS_DIR = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.join(repoRoot, 'screenshots', `audit-${runId}`);
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-audit-shots-'));
const uploadsDir = path.join(tmpDir, 'uploads');
const { framesDir, videoPath } = seedE2eMedia({
  framesDir: path.join(tmpDir, 'frames'),
  uploadsDir,
  projectsDir: path.join(uploadsDir, 'projects', 'demo-orbit'),
  frameCount: E2E_FAST ? 4 : 8,
});

const svc = await startE2eServer({
  port: 0,
  root: tmpDir,
  framesDir,
  uploadsDir,
  runsDir: path.join(tmpDir, 'runs'),
  sequencersDir: path.join(tmpDir, 'seq'),
});
const base = `http://127.0.0.1:${svc.port}`;
const demoVideoRel = 'preview_demo.mp4';

const manifest = [];
const browser = await chromium.launch({ headless: true });

async function shot(page, name, label) {
  await settle(page);
  const p = path.join(SHOTS_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  manifest.push({ file: name, label: label || name, path: p });
  console.log('  saved', name);
}

async function clickTab(page, label) {
  await clickNavTab(page, label);
  await page.waitForTimeout(pauseMs(500, 150));
}

async function clickSubPill(page, label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) > 0) {
    await pill.click({ force: true });
    await page.waitForTimeout(pauseMs(500, 120));
  }
}

async function clickLibraryTab(page, testId) {
  await page.locator(`[data-testid="${testId}"]`).click();
  await waitForLibrarySkeletonGone(page);
  await page.waitForTimeout(pauseMs(600, 150));
}

try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });
  await prepareScreenshotPage(page, base);
  await waitForNavTabs(page);

  await clickTab(page, 'LIVE');
  await shot(page, '00-main-overview.png', 'Overview — default LIVE landing');

  await attachLiveDemoVideo(page, base, demoVideoRel);
  await shot(page, '01-live.png', 'LIVE — main stage');

  await ensureRightPanelOpen(page);
  await page.waitForTimeout(pauseMs(600, 120));
  await shot(page, '02-live-controls.png', 'LIVE — Controls drawer (summary + live params)');

  const bottomDrawerToggle = page.locator('[data-testid="bottom-drawer-toggle"]').first();
  if ((await bottomDrawerToggle.count()) > 0) {
    await bottomDrawerToggle.click({ force: true });
    await page.waitForTimeout(pauseMs(700, 180));
    await shot(page, '02b-live-bottom-drawer.png', 'LIVE — bottom drawer (MODULATION/CROSSFADER/SYSTEM)');
    await bottomDrawerToggle.click({ force: true });
    await page.waitForTimeout(pauseMs(450, 120));
  }

  const engineToggle = page.locator('[data-testid="engine-drawer-toggle"]').first();
  if ((await engineToggle.count()) > 0) {
    const expanded = await engineToggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await engineToggle.click();
    await page.waitForTimeout(pauseMs(800, 200));
    await shot(page, '03-live-engine-drawer.png', 'LIVE — engine drawer');
  }

  const layersToggle = page.locator('[data-testid="layers-sidebar-toggle"]').first();
  if ((await layersToggle.count()) > 0) {
    const layersOpen = await layersToggle.getAttribute('aria-expanded');
    if (layersOpen !== 'true') await layersToggle.click({ force: true });
    await page.waitForTimeout(pauseMs(500, 120));
    await shot(page, '04-live-layers-rail.png', 'LIVE — layers rail');
    if (layersOpen !== 'true') await layersToggle.click({ force: true });
  }

  await clickTab(page, 'PROMPTS');
  await ensureRightPanelOpen(page);
  for (const [file, pill, label] of [
    ['05-prompts.png', 'PROMPTS', 'PROMPTS — prompt morphing'],
    ['06-prompts-image.png', 'IMAGE', 'PROMPTS — image'],
    ['07-prompts-lora.png', 'LORA', 'PROMPTS — LoRA'],
    ['08-prompts-controlnet.png', 'CONTROLNET', 'PROMPTS — ControlNet'],
    ['09-prompts-story.png', 'STORY', 'PROMPTS — story generator'],
  ]) {
    await clickSubPill(page, pill);
    await shot(page, file, label);
  }

  await clickTab(page, 'MOTION');
  await ensureRightPanelOpen(page);
  await page.waitForSelector('[data-testid="motion-hero-stage"]', { timeout: 15_000 }).catch(() => null);
  await shot(page, '10-motion.png', 'MOTION — hero pad + sequencer summary');
  const motionDock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock').first();
  if ((await motionDock.count()) > 0) {
    await motionDock.scrollIntoViewIfNeeded().catch(() => null);
    await page.waitForTimeout(pauseMs(400, 100));
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
  await page.waitForTimeout(pauseMs(600, 120));
  await shot(page, '14-runs.png', 'SETTINGS — runs monitor');
  await page.locator('[data-testid="runs-browser-tab-frames"]').click().catch(() => null);
  await page.waitForTimeout(pauseMs(500, 120));
  await shot(page, '15-runs-frames.png', 'SETTINGS — runs frames rail');

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
    await shot(page, file, label);
  }

  await openLibraryBrowser(page);
  await waitForLibrarySkeletonGone(page);
  await clickLibraryTab(page, 'library-tab-projects');
  await shot(page, '23-library-projects.png', 'Library — Projects');

  await clickLibraryTab(page, 'library-tab-videos');
  await page.waitForSelector('[data-testid="videos-browser"]', { timeout: 15_000 }).catch(() => null);
  await shot(page, '24-library-videos.png', 'Library — Videos');

  await clickLibraryTab(page, 'library-tab-audio');
  await page.waitForSelector('[data-testid="audio-browser"]', { timeout: 15_000 }).catch(() => null);
  await shot(page, '25-library-audio.png', 'Library — Audio');

  await page.locator('[data-testid="library-tab-files"]').click().catch(() => null);
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForTimeout(pauseMs(800, 150));
  await shot(page, '26-library-files.png', 'Library — Files (VideoSwarm browser)');

  await page.locator('[data-testid="library-tab-projects"]').click();
  await page.waitForTimeout(pauseMs(400, 100));
  const videoCard = page.locator('[data-testid="project-card"]').first();
  if ((await videoCard.count()) > 0) {
    await videoCard.click();
    await page.waitForTimeout(pauseMs(400, 100));
  }
  await page.locator('[data-testid="library-workspace-tab-editor"]').click();
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15_000 }).catch(() => null);
  await page.waitForSelector('[data-testid="freecut-editor-frame"]', { timeout: 15_000 }).catch(() => null);
  const freecutFrame = page.frameLocator('[data-testid="freecut-editor-frame"]');
  await waitForFreecutShell(freecutFrame, E2E_FAST ? 12_000 : 20_000);
  await shot(page, '27-library-editor.png', 'Library — video editor (FreeCut)');

  fs.writeFileSync(path.join(SHOTS_DIR, 'manifest.json'), JSON.stringify({ base, fast: E2E_FAST, shots: manifest }, null, 2));
  console.log(`\nAudit screenshots: ${SHOTS_DIR}${E2E_FAST ? ' (fast)' : ''}`);
  console.log(`${manifest.length} files`);
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
