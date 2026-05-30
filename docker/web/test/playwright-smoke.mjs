/**
 * Playwright smoke: built web UI loads and exposes all main tabs (audit A-27).
 * Usage: BASE_URL=http://127.0.0.1:3999 node test/playwright-smoke.mjs
 */
import { chromium } from 'playwright';
import { clickTab, getTabLabels, openLibraryBrowser, openRunsMonitor, waitForNavTabs } from './playwright-nav.mjs';

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const expected = ['LIVE', 'PROMPTS', 'MOTION', 'MODULATION', 'AUDIO', 'RUNS', 'SETTINGS', 'GENERATE'];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  // "networkidle" can be blocked by live polling/streaming; DOM loaded is enough for these assertions.
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForNavTabs(page);
  const trimmed = await getTabLabels(page);
  for (const name of expected) {
    if (!trimmed.includes(name)) {
      throw new Error(`Missing tab "${name}" — got: ${trimmed.join(', ')}`);
    }
  }
  if (trimmed.includes('STREAM')) {
    throw new Error('Legacy STREAM tab should not be in top nav');
  }
  if (trimmed.length !== expected.length) {
    throw new Error(`Expected ${expected.length} tabs (${expected.join(', ')}), got ${trimmed.length}: ${trimmed.join(', ')}`);
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
  await clickTab(page, 'AUDIO');
  await page.waitForTimeout(300);
  const audioReactivePanel = page.locator('.audio-reactive-panel');
  if ((await audioReactivePanel.count()) === 0) {
    throw new Error('Audio reactive panel not found on AUDIO tab');
  }
  await openLibraryBrowser(page);
  await page.waitForTimeout(300);
  const storageBrowser = page.locator('.library-storage-browser');
  if ((await storageBrowser.count()) === 0) {
    throw new Error('Storage browser not found under LIBRARY');
  }
  await openRunsMonitor(page);
  const runsBrowser = page.locator('[data-testid="runs-browser"]');
  if ((await runsBrowser.count()) === 0) {
    throw new Error('Runs monitor not found on RUNS tab');
  }
  await clickTab(page, 'SETTINGS');
  await page.waitForTimeout(300);
  await page.locator('.sub-pill').filter({ hasText: /^GPUS$/ }).first().click();
  await page.waitForTimeout(300);
  const infraPanel = page.locator('[data-testid="infrastructure-panel"]');
  if ((await infraPanel.count()) === 0) {
    throw new Error('Infrastructure panel not found under SETTINGS → GPUS');
  }
  const mediatorCard = page.locator('[data-testid="infra-mediator-card"]');
  if ((await mediatorCard.count()) === 0) {
    throw new Error('Active mediator card not found under SETTINGS → GPUS');
  }
  const gpuPanel = page.locator('[data-testid="gpu-pool-panel"]');
  if ((await gpuPanel.count()) === 0) {
    throw new Error('GPU pool panel not found under SETTINGS → GPUS');
  }
  console.log(`OK: ${trimmed.length} tabs, nested audio/runs views, morph blend, infrastructure + GPU pool present`);
} finally {
  await browser.close();
}
