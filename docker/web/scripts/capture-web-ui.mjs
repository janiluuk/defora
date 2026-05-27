/**
 * Capture screenshots of the built web UI (requires server on BASE_URL).
 * Usage:
 *   cd docker/web && npm run build
 *   PORT=3999 node server.js &
 *   BASE_URL=http://127.0.0.1:3999 npm run capture-ui-shots
 */
import { chromium } from 'playwright';
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
  { file: 'library-tab.png', tab: 'LIBRARY' },
  { file: 'prompts-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'PROMPTS' } },
  { file: 'lora-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'LORA' } },
  { file: 'cn-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'CONTROLNET' } },
  { file: 'motion-tab.png', tab: 'MOTION', subTab: { group: 'MOTION', id: 'Performance' } },
  { file: 'motion-sequencer-tab.png', tab: 'MOTION', subTab: { group: 'MOTION', id: 'Animation Sequencer' } },
  { file: 'modulation-tab.png', tab: 'MODULATION' },
  { file: 'settings-tab.png', tab: 'SETTINGS' },
  { file: 'main.png', tab: 'LIVE' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1040 } });

await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.tab', { timeout: 30000 });
await page.waitForTimeout(800);

async function clickTopTab(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const button = page.locator('header .tab').filter({ hasText: new RegExp(`^${escaped}`) }).first();
  const className = (await button.getAttribute('class')) || '';
  if (!className.includes('active')) {
    await button.click({ force: true });
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

for (const shot of shots) {
  await clickTopTab(shot.tab);
  if (shot.subTab) {
    await clickSubPill(shot.subTab.group, shot.subTab.id);
  }
  const fp = path.join(outDir, shot.file);
  await page.screenshot({ path: fp, fullPage: true });
  console.log('wrote', fp);
}

await browser.close();
