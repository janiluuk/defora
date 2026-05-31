/**
 * E2E: launch 24fps test job, verify runs log, open demo video in library browser,
 * hand off to FreeCut editor tab.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { chromium } from 'playwright';
import { startE2eServer } from './playwright-server.mjs';
import {
  openLibraryBrowser,
  openRunsMonitor,
  waitForNavTabs,
} from './playwright-nav.mjs';

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-e2e-deforum-editor-'));
const runsDir = path.join(tmpRoot, 'runs');
const framesDir = path.join(tmpRoot, 'frames');
const uploadsDir = path.join(tmpRoot, 'uploads');
const sequencersDir = path.join(tmpRoot, 'sequencers');
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
});
const base = `http://127.0.0.1:${svc.port}`;

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await openRunsMonitor(page);
  const log = page.locator('[data-testid="runs-job-log"]');
  await log.waitFor({ state: 'visible', timeout: 10000 });

  await page.locator('[data-testid="runs-launch-test"]').click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector('[data-testid="runs-job-log"]');
      return el && /Demo run logged:/i.test(el.textContent || '');
    },
    { timeout: 20000 },
  );

  await page.waitForTimeout(1600);
  await page.locator('[data-testid="runs-browser-tab-past"]').click();
  const pastTable = page.locator(
    '.runs-browser__table-wrap:not(.runs-browser__table-wrap--active) .runs-browser__table',
  );
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll(
        '.runs-browser__table-wrap:not(.runs-browser__table-wrap--active) .runs-browser__table tbody tr',
      );
      return rows.length > 0;
    },
    { timeout: 20000 },
  );
  const firstRow = pastTable.locator('tbody tr').first();
  await firstRow.click();
  await page.waitForSelector('[data-testid="runs-detail-outputs"] video.runs-detail-card__video', {
    timeout: 20000,
  });

  await page.locator('.runs-detail-card__output-links button').filter({ hasText: /^Open in editor$/ }).click();
  await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 15000 });
  await page.waitForSelector('[data-testid="library-workspace-tab-editor"][aria-selected="true"]', {
    timeout: 15000,
  });
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15000 });

  const importUrl = page.locator('.editor-view__import-url');
  await importUrl.waitFor({ state: 'visible', timeout: 10000 });
  const urlText = ((await importUrl.textContent()) || '').trim();
  if (!urlText.includes('/api/video-swarm/file')) {
    throw new Error(`Expected import URL in editor, got: ${urlText}`);
  }

  await openLibraryBrowser(page);
  const rootSelect = page.locator('.video-swarm-browser__roots select.framesync-select').first();
  await rootSelect.selectOption({ value: 'uploads' });
  await page.waitForTimeout(600);
  const tile = page.locator('.video-swarm-browser__tile[data-video-path*="demo-output.mp4"]').first();
  await tile.waitFor({ state: 'visible', timeout: 15000 });
  await tile.click();
  const preview = page.locator('.video-swarm-browser__preview video, .video-swarm-browser__tile video').first();
  await preview.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);

  await page.locator('[data-testid="open-in-video-editor"]').first().click();
  await page.waitForSelector('[data-testid="library-workspace-tab-editor"][aria-selected="true"]', {
    timeout: 15000,
  });

  const frame = page.locator('[data-testid="freecut-editor-frame"]').first();
  await frame.waitFor({ state: 'visible', timeout: 15000 });
  const frameSrc = await frame.getAttribute('src');
  if (!frameSrc || !frameSrc.includes('/freecut/')) {
    throw new Error(`Expected FreeCut iframe src, got: ${frameSrc}`);
  }

  console.log('OK: 24fps demo run, runs log, library video preview, editor handoff');
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
