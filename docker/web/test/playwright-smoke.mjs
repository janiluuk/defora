/**
 * Playwright smoke: built web UI loads and exposes all main tabs (audit A-27).
 * Usage: BASE_URL=http://127.0.0.1:3999 node test/playwright-smoke.mjs
 */
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const expected = ['LIVE', 'STREAM', 'LIBRARY', 'PROMPTS', 'MOTION', 'MODULATION', 'SETTINGS', 'GENERATE'];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getTabLabels(page) {
  const labels = await page.locator('header .tab .tab__label').allTextContents();
  return labels.map((label) => label.trim()).filter(Boolean);
}

async function clickTab(page, label) {
  const tab = page.locator('header .tab').filter({
    has: page.locator('.tab__label').filter({
      hasText: new RegExp(`^${escapeRegex(label)}$`),
    }),
  }).first();
  if ((await tab.count()) === 0) {
    throw new Error(`Tab button "${label}" not found`);
  }
  await tab.click();
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('header .tab', { timeout: 30000 });
  const trimmed = await getTabLabels(page);
  for (const name of expected) {
    if (!trimmed.includes(name)) {
      throw new Error(`Missing tab "${name}" — got: ${trimmed.join(', ')}`);
    }
  }
  if (trimmed.length < expected.length) {
    throw new Error(`Expected at least ${expected.length} tabs, got ${trimmed.length}`);
  }
  await clickTab(page, 'PROMPTS');
  await page.waitForSelector('.sub-pill', { timeout: 30000 });
  await page.locator('.sub-pill').filter({ hasText: /^PROMPTS$/ }).first().click();
  const morphPanel = page.locator('.framesync-panel').filter({
    has: page.locator('.framesync-title').filter({ hasText: /Prompt\s+Morphing/ }),
  }).first();
  await morphPanel.waitFor({ state: 'visible', timeout: 30000 });
  const expandMorph = morphPanel.locator('button.framesync-button').filter({ hasText: /^(Expand|Show)$/ });
  if ((await expandMorph.count()) > 0) {
    await expandMorph.first().click();
  }
  const morphBlend = morphPanel.locator('[data-testid="prompt-morph-blend"]');
  await morphBlend.waitFor({ state: 'visible', timeout: 30000 }).catch(() => null);
  if ((await morphBlend.count()) === 0 || !(await morphBlend.isVisible())) {
    throw new Error('Prompt morph blend slider not found on PROMPTS tab');
  }
  await clickTab(page, 'MODULATION');
  await page.waitForTimeout(300);
  await page.locator('.sub-pill').filter({ hasText: /^AUDIO$/ }).first().click();
  await page.waitForTimeout(300);
  const audioReactivePanel = page.locator('.audio-reactive-panel');
  if ((await audioReactivePanel.count()) === 0) {
    throw new Error('Audio reactive panel not found under MODULATION -> AUDIO');
  }
  await clickTab(page, 'SETTINGS');
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
