/**
 * Capture README screenshots (screenshots/*.png) with seeded E2E server.
 * Usage: cd docker/web && node scripts/capture-web-ui.mjs
 * Fast:  E2E_FAST=1 node scripts/capture-web-ui.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { seedE2eMedia } from '../test/e2e-media-fixture.mjs';
import {
  attachLiveDemoVideo,
  E2E_FAST,
  pauseMs,
  prepareScreenshotPage,
  settle,
  waitForLibrarySkeletonGone,
} from '../test/playwright-screenshot-helpers.mjs';
import {
  clickTab,
  ensureRightPanelOpen,
  openLibraryBrowser,
  waitForNavTabs,
} from '../test/playwright-nav.mjs';
import { startE2eServer } from '../test/playwright-server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..', '..');
const outDir = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.join(repoRoot, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-readme-shots-'));
const uploadsDir = path.join(tmpDir, 'uploads');
seedE2eMedia({
  framesDir: path.join(tmpDir, 'frames'),
  uploadsDir,
  projectsDir: path.join(uploadsDir, 'projects', 'demo-orbit'),
  frameCount: E2E_FAST ? 4 : 8,
});

const svc = await startE2eServer({
  port: 0,
  root: tmpDir,
  framesDir: path.join(tmpDir, 'frames'),
  uploadsDir,
  runsDir: path.join(tmpDir, 'runs'),
  sequencersDir: path.join(tmpDir, 'seq'),
});
const base = `http://127.0.0.1:${svc.port}`;
const demoVideoRel = 'preview_demo.mp4';

/** @type {Array<{ file: string, capture: (page: import('playwright').Page) => Promise<void> }>} */
const shots = [
  {
    file: 'main.png',
    capture: async (page) => {
      await clickTab(page, 'LIVE');
      await page.waitForTimeout(pauseMs(600, 120));
    },
  },
  {
    file: 'live-tab.png',
    capture: async (page) => {
      await clickTab(page, 'LIVE');
      await ensureRightPanelOpen(page);
      await attachLiveDemoVideo(page, base, demoVideoRel);
    },
  },
  {
    file: 'prompts-tab.png',
    capture: async (page) => {
      await clickTab(page, 'PROMPTS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'PROMPTS');
    },
  },
  {
    file: 'lora-tab.png',
    capture: async (page) => {
      await clickTab(page, 'PROMPTS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'LORA');
    },
  },
  {
    file: 'cn-tab.png',
    capture: async (page) => {
      await clickTab(page, 'PROMPTS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'CONTROLNET');
    },
  },
  {
    file: 'motion-tab.png',
    capture: async (page) => {
      await clickTab(page, 'MOTION');
      await ensureRightPanelOpen(page);
      await page.waitForSelector('[data-testid="motion-hero-stage"]', { timeout: 15_000 }).catch(() => null);
    },
  },
  {
    file: 'motion-sequencer-tab.png',
    capture: async (page) => {
      await clickTab(page, 'MOTION');
      await ensureRightPanelOpen(page);
      await scrollMotionDock(page);
    },
  },
  {
    file: 'generate-tab.png',
    capture: async (page) => {
      await clickTab(page, 'MOTION');
      await ensureRightPanelOpen(page);
      await scrollMotionDock(page);
    },
  },
  {
    file: 'modulation-tab.png',
    capture: async (page) => {
      await clickTab(page, 'MODULATION');
      await ensureRightPanelOpen(page);
    },
  },
  {
    file: 'audio-tab.png',
    capture: async (page) => {
      await clickTab(page, 'AUDIO');
      await ensureRightPanelOpen(page);
    },
  },
  {
    file: 'runs-tab.png',
    capture: async (page) => {
      await clickTab(page, 'SETTINGS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'RUNS');
      await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 20_000 }).catch(() => null);
      await page.waitForTimeout(pauseMs(600, 120));
    },
  },
  {
    file: 'settings-tab.png',
    capture: async (page) => {
      await clickTab(page, 'SETTINGS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'ENGINE');
      await page.waitForTimeout(pauseMs(500, 120));
    },
  },
  {
    file: 'stream-tab.png',
    capture: async (page) => {
      await clickTab(page, 'SETTINGS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'OUTPUT');
      await page.waitForTimeout(pauseMs(500, 120));
    },
  },
  {
    file: 'library-tab.png',
    capture: async (page) => {
      await openLibraryBrowser(page);
      await waitForLibrarySkeletonGone(page);
      await page.locator('[data-testid="library-tab-projects"]').click();
      await page.waitForTimeout(pauseMs(800, 150));
    },
  },
];

async function clickSubPill(page, label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) > 0) {
    await pill.click({ force: true });
    await page.waitForTimeout(pauseMs(500, 120));
  }
}

async function scrollMotionDock(page) {
  const dock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock').first();
  if ((await dock.count()) > 0) {
    await dock.scrollIntoViewIfNeeded().catch(() => null);
  }
  await page.waitForTimeout(pauseMs(500, 120));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });

try {
  await prepareScreenshotPage(page, base);
  await waitForNavTabs(page);

  for (const shot of shots) {
    await shot.capture(page);
    const fp = path.join(outDir, shot.file);
    await settle(page);
    await page.screenshot({ path: fp, fullPage: false });
    console.log('wrote', fp);
  }
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
