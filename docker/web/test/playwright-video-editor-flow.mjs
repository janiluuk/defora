/**
 * E2E + screenshots: Library video → Video Editor → FreeCut import & timeline.
 *
 * Screenshots (repo screenshots/video-editor-flow-<timestamp>/):
 *   01-library-video.png
 *   02-editor-handoff.png
 *   03-freecut-import-dialog.png
 *   04-freecut-with-media.png
 *
 * Run: node docker/web/test/playwright-video-editor-flow.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { startE2eServer } from './playwright-server.mjs';
import { openLibraryBrowser, waitForNavTabs, waitForProjectCard } from './playwright-nav.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10000 });
  }
}

function makeTestMp4(outPath) {
  execSync(
    `ffmpeg -y -f lavfi -i color=c=teal:size=320x180:rate=24 -t 1 -c:v libx264 -pix_fmt yuv420p "${outPath}"`,
    { stdio: 'pipe' },
  );
}

async function capture(page, dir, name) {
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, name);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`📸  ${out}`);
  return out;
}

const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const screenshotDir = process.env.SCREENSHOT_DIR
  ? path.resolve(process.env.SCREENSHOT_DIR)
  : path.join(repoRoot, 'screenshots', `video-editor-flow-${runId}`);

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-video-editor-flow-'));
const uploadsDir = path.join(tmpRoot, 'uploads');
const framesDir = path.join(tmpRoot, 'frames');
const runsDir = path.join(tmpRoot, 'runs');
const sequencersDir = path.join(tmpRoot, 'sequencers');
for (const d of [uploadsDir, framesDir, runsDir, sequencersDir]) {
  fs.mkdirSync(d, { recursive: true });
}

const videoName = 'editor-flow-demo.mp4';
const projectDir = path.join(uploadsDir, 'projects', 'editor-flow');
fs.mkdirSync(projectDir, { recursive: true });
makeTestMp4(path.join(projectDir, videoName));

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  uploadsDir,
  framesDir,
  runsDir,
  sequencersDir,
});
const base = `http://127.0.0.1:${svc.port}`;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const bridgeRes = await page.request.get(`${base}/freecut/defora-bridge.js`);
  if (!bridgeRes.ok()) throw new Error(`defora-bridge.js missing: ${bridgeRes.status()}`);

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await openLibraryBrowser(page);
  const browserRoot = page.locator('[data-testid="projects-browser"]').first();
  const card = await waitForProjectCard(browserRoot, page, videoName);
  await card.click();
  await card.scrollIntoViewIfNeeded();
  await capture(page, screenshotDir, '01-library-video.png');

  await page.locator('[data-testid="open-in-video-editor"]').first().click();
  await page.waitForSelector('[data-testid="library-workspace-tab-editor"][aria-selected="true"]', {
    timeout: 15000,
  });
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15000 });

  const importUrl = page.locator('.editor-view__import-url');
  await importUrl.waitFor({ state: 'visible', timeout: 10000 });
  const urlText = ((await importUrl.textContent()) || '').trim();
  if (!urlText.includes('/api/video-swarm/file')) {
    throw new Error(`Expected library import URL, got: ${urlText}`);
  }
  await capture(page, screenshotDir, '02-editor-handoff.png');

  const frameEl = page.locator('[data-testid="freecut-editor-frame"]').first();
  await frameEl.waitFor({ state: 'visible', timeout: 15000 });
  const frameSrc = await frameEl.getAttribute('src');
  if (!frameSrc?.includes('deforaImport=')) {
    throw new Error(`Expected deforaImport in iframe src, got: ${frameSrc}`);
  }

  const freecut = page.frameLocator('[data-testid="freecut-editor-frame"]');
  await freecut.locator('#root, body').first().waitFor({ state: 'attached', timeout: 20000 });

  if (await freecut.locator('text=/Welcome to FreeCut/i').first().isVisible().catch(() => false)) {
    await freecut.locator('button', { hasText: /New Project/i }).first().click();
    await freecut.locator('text=/Project Name/i').first().waitFor({ state: 'visible', timeout: 15000 });
  }
  const projectName = freecut.locator('input[placeholder*="project name" i], input[placeholder*="Enter project" i]').first();
  if (await projectName.isVisible().catch(() => false)) {
    await projectName.evaluate((el) => {
      el.value = 'DeforaHandoff';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const createBtn = freecut.locator('button[type="submit"], button').filter({ hasText: /Create Project/i }).first();
    await createBtn.waitFor({ state: 'attached', timeout: 10000 });
    await createBtn.click({ force: true, timeout: 15000 });
  }
  await freecut.locator('text=/Media/i').first().waitFor({ state: 'visible', timeout: 45000 });
  await page.locator('button', { hasText: 'Import from library' }).first().click();
  const importDialog = freecut.locator('[role="dialog"], dialog').filter({ hasText: /Import From URL/i });
  await importDialog.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
  if (await importDialog.count()) {
    const dlgShot = path.join(screenshotDir, '03-freecut-import-dialog.png');
    await importDialog.first().screenshot({ path: dlgShot });
    console.log(`📸  ${dlgShot}`);
  }
  await freecut.locator('text=/No media yet/i').first().waitFor({ state: 'hidden', timeout: 60000 });
  await freecut.locator('body').first().screenshot({ path: path.join(screenshotDir, '04-freecut-with-media.png') });
  console.log(`📸  ${path.join(screenshotDir, '04-freecut-with-media.png')}`);

  await capture(page, screenshotDir, '05-defora-editor-shell.png');

  console.log(`OK: video opened in editor; screenshots in ${screenshotDir}`);
} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_e) { /* ignore */ }
}
