/**
 * Playwright smoke: built web UI loads and exposes all main tabs (audit A-27).
 * Usage: BASE_URL=http://127.0.0.1:3999 node test/playwright-smoke.mjs
 */
import { chromium } from 'playwright';
import { clickTab, dismissSessionModalIfOpen, ensureRightPanelOpen, getTabLabels, openLibraryBrowser, openRunsMonitor, waitForNavTabs } from './playwright-nav.mjs';

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';
const expected = ['LIVE', 'PROMPTS', 'MOTION', 'MODULATION', 'AUDIO', 'RUNS', 'SETTINGS', 'GENERATE'];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  // "networkidle" can be blocked by live polling/streaming; DOM loaded is enough for these assertions.
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissSessionModalIfOpen(page);
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
  await clickTab(page, 'LIVE');
  await page.waitForTimeout(300);
  const morphHud = page.locator('[data-testid="live-morph-hud"]');
  await morphHud.waitFor({ state: 'visible', timeout: 30000 });
  const morphSlider = morphHud.locator('.live-hud-morph__slider');
  if ((await morphSlider.count()) === 0 || !(await morphSlider.isVisible())) {
    throw new Error('Morph crossfader slider not found on LIVE tab');
  }
  await clickTab(page, 'PROMPTS');
  await ensureRightPanelOpen(page);
  await page.waitForSelector('.sub-pill', { timeout: 30000 });
  await page.locator('.sub-pill').filter({ hasText: /^PROMPTS$/ }).first().click();
  const morphHint = page.locator('[data-testid="prompt-morph-live-hint"]');
  if ((await morphHint.count()) === 0 || !(await morphHint.isVisible())) {
    const morphPanel = page.locator('.framesync-panel').filter({ hasText: 'Prompt Morphing' }).first();
    const morphEnabled = morphPanel.locator('.framesync-button.framesync-button--live').filter({ hasText: /^Enabled$/ }).first();
    if ((await morphEnabled.count()) === 0) {
      await morphPanel.locator('.framesync-button').filter({ hasText: /^Enabled$/ }).first().click();
      await page.waitForTimeout(200);
    }
    await morphHint.waitFor({ state: 'visible', timeout: 30000 });
  }
  if ((await morphHint.count()) === 0 || !(await morphHint.isVisible())) {
    throw new Error('Prompt morph LIVE hint not found on PROMPTS tab');
  }
  await clickTab(page, 'AUDIO');
  await page.waitForTimeout(300);
  const audioReactivePanel = page.locator('.audio-reactive-panel');
  if ((await audioReactivePanel.count()) === 0) {
    throw new Error('Audio reactive panel not found on AUDIO tab');
  }
  await openLibraryBrowser(page);
  await page.waitForTimeout(300);
  const libraryBrowser = page.locator('[data-testid="library-browser"]');
  if ((await libraryBrowser.count()) === 0) {
    throw new Error('Library browser not found under Library workspace');
  }
  const projectsBrowser = page.locator('[data-testid="projects-browser"]');
  if ((await projectsBrowser.count()) === 0) {
    throw new Error('Projects panel not found under Library');
  }
  await page.locator('[data-testid="library-tab-videos"]').click();
  const videosBrowser = page.locator('[data-testid="videos-browser"]');
  if ((await videosBrowser.count()) === 0) {
    throw new Error('Videos panel not found under Library');
  }
  await page.locator('[data-testid="library-tab-audio"]').click();
  const audioBrowser = page.locator('[data-testid="audio-browser"]');
  if ((await audioBrowser.count()) === 0) {
    throw new Error('Audio panel not found under Library');
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
  console.log(`OK: ${trimmed.length} tabs, LIVE morph HUD, PROMPTS morph hint, audio/runs views, infrastructure + GPU pool present`);
} finally {
  await browser.close();
}
