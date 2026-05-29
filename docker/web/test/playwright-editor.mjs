/**
 * Playwright E2E: FreeCut video editor integration + motion sequencer editor.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { chromium } from 'playwright';
import { start } from '../server.js';

async function clickTab(page, label) {
  const tab = page.locator('header .tab').filter({
    has: page.locator('.tab__label').filter({ hasText: new RegExp(`^${label}$`) }),
  }).first();
  if ((await tab.count()) === 0) throw new Error(`Tab "${label}" not found`);
  await tab.click();
}

async function ensureSidebarOpen(page) {
  const toggle = page.locator('[data-testid="right-panel-toggle"]').first();
  const expanded = await toggle.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await toggle.click();
    await page.waitForTimeout(400);
  }
}

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-e2e-editor-'));
const runsDir = path.join(tmpRoot, 'runs');
const framesDir = path.join(tmpRoot, 'frames');
const uploadsDir = path.join(tmpRoot, 'uploads');
const sequencersDir = path.join(tmpRoot, 'sequencers');
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });
fs.writeFileSync(path.join(uploadsDir, 'editor-handoff.mp4'), Buffer.from('defora-editor-mp4'));

const svc = await start({
  port: 0,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const freecutRes = await page.request.get(`${base}/freecut/`);
  if (!freecutRes.ok()) {
    throw new Error(`Expected GET /freecut/ 200, got ${freecutRes.status()}`);
  }
  const freecutHtml = await freecutRes.text();
  if (!/freecut|FreeCut|id="root"/i.test(freecutHtml)) {
    throw new Error('FreeCut index did not load expected shell HTML');
  }

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await page.waitForSelector('header .tab', { timeout: 30000 });

  await clickTab(page, 'LIBRARY');
  await ensureSidebarOpen(page);
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 30000 });
  const rootSelect = page.locator('.video-swarm-browser__roots select.framesync-select').first();
  await rootSelect.selectOption({ value: 'uploads' });
  await page.waitForTimeout(600);
  const tile = page.locator('.video-swarm-browser__tile[data-video-path*="editor-handoff.mp4"]').first();
  await tile.waitFor({ state: 'visible', timeout: 15000 });
  await tile.click();
  await page.locator('[data-testid="open-in-video-editor"]').first().click();
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15000 });
  const importUrl = page.locator('.editor-view__import-url');
  await importUrl.waitFor({ state: 'visible', timeout: 10000 });
  const urlText = ((await importUrl.textContent()) || '').trim();
  if (!urlText.includes('/api/video-swarm/file')) {
    throw new Error(`Expected import URL in editor, got: ${urlText}`);
  }
  const frame = page.locator('[data-testid="freecut-editor-frame"]').first();
  await frame.waitFor({ state: 'visible', timeout: 15000 });
  const frameSrc = await frame.getAttribute('src');
  if (!frameSrc || !frameSrc.includes('/freecut/')) {
    throw new Error(`Expected FreeCut iframe src, got: ${frameSrc}`);
  }

  await clickTab(page, 'MOTION');
  await ensureSidebarOpen(page);
  await page.waitForSelector('[data-testid="motion-controls-panel"]', { timeout: 15000 });
  await page.locator('[data-testid="motion-sequencer-side-toggle"]').click();
  await page.waitForSelector('[data-testid="motion-sequencer-side-drawer"]', { timeout: 15000 });
  await page.waitForSelector('[data-testid="sequencer-controls-panel"]', { timeout: 15000 });
  await page.waitForSelector('.timeline-hero', { timeout: 15000 });

  await clickTab(page, 'MOTION');
  await page.waitForSelector('[data-testid="motion-sequencer-dock"]', { timeout: 15000 });
  await page.waitForSelector('.stage-sequencer-bar', { timeout: 15000 });

  console.log('OK: FreeCut editor + library handoff + motion sequencer editor');
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
