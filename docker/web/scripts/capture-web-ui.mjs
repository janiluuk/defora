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

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const outDir = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve(webRoot, '..', '..', 'screenshots');

fs.mkdirSync(outDir, { recursive: true });

/** @type {Array<{ file: string, tab: string, subTab?: { group: string, id: string } }>} */
const shots = [
  { file: 'live-tab.png', tab: 'LIVE' },
  { file: 'stream-tab.png', tab: 'STREAM' },
  { file: 'library-tab.png', library: true },
  { file: 'prompts-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'PROMPTS' } },
  { file: 'lora-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'LORA' } },
  { file: 'cn-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'CONTROLNET' } },
  { file: 'motion-tab.png', tab: 'MOTION' },
  { file: 'motion-sequencer-tab.png', tab: 'MOTION' },
  { file: 'modulation-tab.png', tab: 'MODULATION' },
  { file: 'settings-tab.png', tab: 'SETTINGS' },
  { file: 'main.png', tab: 'LIVE' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });

// "networkidle" can be blocked by the live HLS/WS polling.
// "domcontentloaded" is enough because we later wait for the tab selector.
await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 });
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

async function clickSubPill(group, id) {
  const pills = page.locator('.sub-pill');
  const count = await pills.count();
  for (let i = 0; i < count; i++) {
    const el = pills.nth(i);
    const text = (await el.textContent())?.trim() || '';
    if (text === id || text.includes(id)) {
      await el.click({ force: true });
      await page.waitForTimeout(500);
      return;
    }
  }
}

async function openLibraryWorkspace(page) {
  const btn = page.locator('[data-testid="top-nav-library"]').first();
  if ((await btn.getAttribute('aria-expanded')) !== 'true') {
    await btn.click({ force: true });
  }
  await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 30000 });
  await page.waitForTimeout(600);
}

for (const shot of shots) {
  if (shot.library) {
    await openLibraryWorkspace(page);
  } else {
    await clickTopTab(shot.tab);
  }
  if (shot.subTab) {
    await clickSubPill(shot.subTab.group, shot.subTab.id);
  }
  const fp = path.join(outDir, shot.file);
  await page.screenshot({ path: fp, fullPage: true });
  console.log('wrote', fp);
}

await browser.close();
