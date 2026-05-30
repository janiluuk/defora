/**
 * Capture screenshots of the built web UI (requires server on BASE_URL).
 * Usage:
 *   cd docker/web && npm run build
 *   PORT=3999 node server.js &
 *   BASE_URL=http://127.0.0.1:3999 npm run capture-ui-shots
 */
import { chromium } from 'playwright';
import { escapeRegex, waitForNavTabs } from '../test/playwright-nav.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, '..');
const repoRoot = path.resolve(webRoot, '..', '..');

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const outDir = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.join(repoRoot, 'screenshots');

fs.mkdirSync(outDir, { recursive: true });

/** @type {Array<{ file: string, tab?: string, library?: boolean, subTab?: string }>} */
const shots = [
  { file: 'live-tab.png', tab: 'LIVE' },
  { file: 'prompts-tab.png', tab: 'PROMPTS', subTab: 'PROMPTS' },
  { file: 'lora-tab.png', tab: 'PROMPTS', subTab: 'LORA' },
  { file: 'cn-tab.png', tab: 'PROMPTS', subTab: 'CONTROLNET' },
  { file: 'motion-tab.png', tab: 'MOTION' },
  { file: 'motion-sequencer-tab.png', tab: 'MOTION' },
  { file: 'modulation-tab.png', tab: 'MODULATION' },
  { file: 'audio-tab.png', tab: 'AUDIO' },
  { file: 'runs-tab.png', tab: 'RUNS' },
  { file: 'generate-tab.png', tab: 'GENERATE' },
  { file: 'settings-tab.png', tab: 'SETTINGS', subTab: 'ENGINE' },
  { file: 'stream-tab.png', tab: 'SETTINGS', subTab: 'OUTPUT' },
  { file: 'library-tab.png', library: true },
  { file: 'main.png', tab: 'LIVE' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });

await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 });
const modal = page.locator('.restore-session-modal');
if ((await modal.count()) > 0) {
  await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
}
await waitForNavTabs(page);
await page.waitForTimeout(800);

async function clickTopTab(name) {
  const tab = page.locator('[data-testid="top-nav"] .tab, nav.bottom-nav .tab, header .tab').filter({
    has: page.locator('.tab__label').filter({ hasText: new RegExp(`^${escapeRegex(name)}$`) }),
  }).first();
  const className = (await tab.getAttribute('class')) || '';
  if (!className.includes('active')) {
    await tab.click({ force: true });
  }
  await page.waitForTimeout(600);
}

async function clickSubPill(label) {
  const pill = page.locator('.sub-pill').filter({ hasText: new RegExp(`^${escapeRegex(label)}$`) }).first();
  if ((await pill.count()) > 0) {
    await pill.click({ force: true });
    await page.waitForTimeout(500);
  }
}

async function openLibraryWorkspace() {
  const btn = page.locator('[data-testid="top-nav-library"]').first();
  if ((await btn.getAttribute('aria-expanded')) !== 'true') {
    await btn.click({ force: true });
  }
  await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 30000 });
  await page.locator('[data-testid="library-workspace-tab-browser"]').click().catch(() => null);
  await page.waitForTimeout(600);
}

for (const shot of shots) {
  if (shot.library) {
    await openLibraryWorkspace();
  } else if (shot.tab) {
    await clickTopTab(shot.tab);
  }
  if (shot.subTab) {
    await clickSubPill(shot.subTab);
  }
  const fp = path.join(outDir, shot.file);
  await page.screenshot({ path: fp, fullPage: false });
  console.log('wrote', fp);
}

await browser.close();
