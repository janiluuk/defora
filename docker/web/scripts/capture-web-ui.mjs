/**
 * Capture README screenshots (screenshots/*.png) with seeded E2E server.
 * Usage: cd docker/web && node scripts/capture-web-ui.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
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

const svc = await startE2eServer({
  port: 0,
  root: tmpDir,
  framesDir,
  uploadsDir,
  runsDir: path.join(tmpDir, 'runs'),
  sequencersDir: path.join(tmpDir, 'seq'),
});
const base = `http://127.0.0.1:${svc.port}`;

/** @type {Array<{ file: string, capture: (page: import('playwright').Page) => Promise<void> }>} */
const shots = [
  {
    file: 'main.png',
    capture: async (page) => {
      await clickTab(page, 'LIVE');
      await page.waitForTimeout(600);
    },
  },
  {
    file: 'live-tab.png',
    capture: async (page) => {
      await clickTab(page, 'LIVE');
      await ensureRightPanelOpen(page);
      await page.evaluate((videoSrc) => {
        const player = document.getElementById('player') || document.querySelector('video');
        if (player?.tagName === 'VIDEO') {
          player.src = videoSrc;
          player.load();
          player.play().catch(() => {});
        }
      }, `${base}/api/video-swarm/file?path=${encodeURIComponent(videoPath)}`);
      await page.waitForTimeout(1200);
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
      const dock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock').first();
      if ((await dock.count()) > 0) {
        await dock.scrollIntoViewIfNeeded().catch(() => null);
      }
      await page.waitForTimeout(500);
    },
  },
  {
    file: 'generate-tab.png',
    capture: async (page) => {
      await clickTab(page, 'MOTION');
      await ensureRightPanelOpen(page);
      const dock = page.locator('[data-testid="motion-sequencer-dock"], .preview-bottom-dock').first();
      if ((await dock.count()) > 0) {
        await dock.scrollIntoViewIfNeeded().catch(() => null);
      }
      await page.waitForTimeout(500);
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
      await page.waitForTimeout(600);
    },
  },
  {
    file: 'settings-tab.png',
    capture: async (page) => {
      await clickTab(page, 'SETTINGS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'ENGINE');
      await page.waitForTimeout(500);
    },
  },
  {
    file: 'stream-tab.png',
    capture: async (page) => {
      await clickTab(page, 'SETTINGS');
      await ensureRightPanelOpen(page);
      await clickSubPill(page, 'OUTPUT');
      await page.waitForTimeout(500);
    },
  },
  {
    file: 'library-tab.png',
    capture: async (page) => {
      await openLibraryBrowser(page);
      await page.waitForSelector('[data-testid="library-browser"]', { timeout: 15_000 });
      await waitForLibraryReady(page);
      await page.locator('[data-testid="library-tab-projects"]').click();
      await page.waitForTimeout(800);
    },
  },
];

async function dismissRestoreModal(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => null);
  }
}

async function clickSubPill(page, label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) > 0) {
    await pill.click({ force: true });
    await page.waitForTimeout(500);
  }
}

async function waitForLibraryReady(page) {
  await page.waitForFunction(() => {
    const sk = document.querySelector('.library-browser__skeleton-grid');
    return !sk;
  }, { timeout: 15_000 }).catch(() => null);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });

try {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await dismissRestoreModal(page);
  await waitForNavTabs(page);

  for (const shot of shots) {
    await shot.capture(page);
    const fp = path.join(outDir, shot.file);
    await page.screenshot({ path: fp, fullPage: false });
    console.log('wrote', fp);
  }
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}
