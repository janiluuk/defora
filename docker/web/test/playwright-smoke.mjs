/**
 * Playwright smoke: built web UI loads and exposes all main tabs (audit A-27).
 * Usage: BASE_URL=http://127.0.0.1:3999 node test/playwright-smoke.mjs
 */
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const expected = ['LIVE', 'PROMPTS', 'MOTION', 'MODULATION', 'AUDIO', 'RUNS', 'SETTINGS', 'GENERATE'];

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
  const showMorph = page.locator('button.framesync-button').filter({ hasText: 'Show' });
  if ((await showMorph.count()) > 0) {
    await showMorph.first().click();
    await page.waitForTimeout(300);
  }
  const morphBlend = page.locator('[data-testid="prompt-morph-blend"]');
  if ((await morphBlend.count()) === 0) {
    throw new Error('Prompt morph blend slider not found on PROMPTS tab');
  }
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: '🖥️ GPUS' }).click();
  await page.waitForTimeout(400);
  const gpuPanel = page.locator('[data-testid="gpu-pool-panel"]');
  if ((await gpuPanel.count()) === 0) {
    throw new Error('GPU pool panel not found under SETTINGS → GPUS');
  }
  console.log(`OK: ${trimmed.length} tabs, morph blend, GPU pool panel present`);
} finally {
  await browser.close();
}
