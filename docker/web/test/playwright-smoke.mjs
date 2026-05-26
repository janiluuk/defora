/**
 * Playwright smoke: built web UI loads and exposes all main tabs (audit A-27).
 * Usage: BASE_URL=http://127.0.0.1:3999 node test/playwright-smoke.mjs
 */
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const expected = ['LIVE', 'PROMPTS', 'MOTION', 'MODULATION', 'SETTINGS', 'GENERATE'];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('header .tab', { timeout: 30000 });
  const tabs = await page.locator('header .tab').allTextContents();
  const trimmed = tabs.map((t) => t.trim()).filter(Boolean);
  for (const name of expected) {
    if (!trimmed.includes(name)) {
      throw new Error(`Missing tab "${name}" — got: ${trimmed.join(', ')}`);
    }
  }
  if (trimmed.length < expected.length) {
    throw new Error(`Expected at least ${expected.length} tabs, got ${trimmed.length}`);
  }
  await page.getByRole('button', { name: 'PROMPTS', exact: true }).click();
  await page.waitForTimeout(400);
  const expandMorph = page.locator('button.framesync-button').filter({ hasText: /^(Expand|Show)$/ });
  if ((await expandMorph.count()) > 0) {
    await expandMorph.first().click();
    await page.waitForTimeout(300);
  }
  const morphBlend = page.locator('[data-testid="prompt-morph-blend"]');
  if ((await morphBlend.count()) === 0) {
    throw new Error('Prompt morph blend slider not found on PROMPTS tab');
  }
  await page.getByRole('button', { name: 'MODULATION', exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator('.sub-pill').filter({ hasText: /^AUDIO$/ }).first().click();
  await page.waitForTimeout(300);
  const audioReactivePanel = page.locator('.audio-reactive-panel');
  if ((await audioReactivePanel.count()) === 0) {
    throw new Error('Audio reactive panel not found under MODULATION -> AUDIO');
  }
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator('.sub-pill').filter({ hasText: /^RUNS$/ }).first().click();
  await page.waitForTimeout(300);
  const runsBrowser = page.locator('.runs-browser');
  if ((await runsBrowser.count()) === 0) {
    throw new Error('Runs browser not found under SETTINGS -> RUNS');
  }
  await page.locator('.sub-pill').filter({ hasText: /^GPUS$/ }).first().click();
  await page.waitForTimeout(300);
  const gpuPanel = page.locator('[data-testid="gpu-pool-panel"]');
  if ((await gpuPanel.count()) === 0) {
    throw new Error('GPU pool panel not found under SETTINGS → GPUS');
  }
  console.log(`OK: ${trimmed.length} tabs, nested audio/runs views, morph blend, GPU pool panel present`);
} finally {
  await browser.close();
}
