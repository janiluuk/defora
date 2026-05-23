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
  { file: 'prompts-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'PROMPTS' } },
  { file: 'lora-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'LORA' } },
  { file: 'cn-tab.png', tab: 'PROMPTS', subTab: { group: 'PROMPTS', id: 'CONTROLNET' } },
  { file: 'motion-tab.png', tab: 'MOTION' },
  { file: 'modulation-tab.png', tab: 'MODULATION' },
  { file: 'audio-tab.png', tab: 'AUDIO' },
  { file: 'runs-tab.png', tab: 'RUNS' },
  { file: 'settings-tab.png', tab: 'SETTINGS' },
  { file: 'generate-tab.png', tab: 'GENERATE' },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.tab', { timeout: 30000 });
await page.waitForTimeout(800);

async function clickTopTab(name) {
  await page.locator('header .tab').filter({ hasText: name }).first().click();
  await page.waitForTimeout(600);
}

async function clickSubPill(group, id) {
  const pills = page.locator('.sub-pill');
  const count = await pills.count();
  for (let i = 0; i < count; i++) {
    const el = pills.nth(i);
    const text = (await el.textContent())?.trim() || '';
    if (text === id || text.includes(id)) {
      await el.click();
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
