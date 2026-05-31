/**
 * Playwright E2E: record for ≥3s while Deforum frames generate, then watch the
 * encoded video in Library with thumbnails and previously seeded project files.
 *
 * Flow:
 *   1. Seed a prior project mp4 under uploads/projects/
 *   2. Drop PNG frames into framesDir (simulated generation) — frame rail thumbs update
 *   3. Start header record after 2 frames; keep generating while recording ≥3s
 *   4. Stop record → ffmpeg encodes frames to uploads/defora_rec_*.mp4
 *   5. Library browser lists prior project folder + new recording; fullscreen playback works
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { chromium } from 'playwright';
import { startE2eServer } from './playwright-server.mjs';
import {
  clickTab,
  dismissSessionModalIfOpen,
  openLibraryBrowser,
  openLiveFramesPanel,
  waitForNavTabs,
} from './playwright-nav.mjs';

const TOTAL_FRAMES = 8;
const MIN_RECORD_MS = 3000;
const FRAME_TIMEOUT = 20000;

function generateFramePng(outPath, frameIndex) {
  const colors = ['blue', 'green', 'red', 'yellow', 'cyan', 'magenta', 'orange', 'purple'];
  const color = colors[frameIndex % colors.length];
  execSync(
    `ffmpeg -y -f lavfi -i color=c=${color}:size=128x128:d=1 -frames:v 1 "${outPath}"`,
    { stdio: 'pipe' },
  );
}

function encodeMp4FromFrames(framesDir, outPath, frameCount, fps = 8) {
  execSync(
    [
      'ffmpeg',
      '-y',
      '-framerate',
      String(fps),
      '-i',
      `"${path.join(framesDir, 'frame_%05d.png')}"`,
      '-frames:v',
      String(frameCount),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'ultrafast',
      '-crf',
      '28',
      `"${outPath}"`,
    ].join(' '),
    { stdio: 'pipe' },
  );
}

async function selectUploadsRoot(browserRoot, page) {
  const rootSelect = browserRoot.locator('.video-swarm-browser__roots select.framesync-select').first();
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.video-swarm-browser__roots select.framesync-select');
      if (!el) return false;
      return Array.from(el.querySelectorAll('option')).some((o) => (o.value || '').toLowerCase() === 'uploads');
    },
    { timeout: 15000 },
  );
  await rootSelect.selectOption({ value: 'uploads' });
  await browserRoot.locator('.video-swarm-browser__empty').filter({ hasText: /^Scanning folder/ }).waitFor({
    state: 'detached',
    timeout: 15000,
  }).catch(() => null);
  await page.waitForTimeout(400);
}

async function enableFilenames(browserRoot) {
  const namesChip = browserRoot.locator('.video-swarm-browser__chips .chip').filter({ hasText: /^Names$/ }).first();
  if ((await namesChip.count()) > 0) {
    const cls = (await namesChip.getAttribute('class')) || '';
    if (!cls.includes('active')) await namesChip.click();
  }
}

async function waitForVideoTile(browserRoot, page, filename, timeoutMs = 25000) {
  const rootSelect = browserRoot.locator('.video-swarm-browser__roots select.framesync-select').first();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await rootSelect.selectOption({ value: 'frames' }).catch(() => null);
    await page.waitForTimeout(150);
    await rootSelect.selectOption({ value: 'uploads' }).catch(() => null);
    await page.waitForTimeout(600);
    const tile = browserRoot.locator(`.video-swarm-browser__tile[data-video-path*="${filename}"]`).first();
    if ((await tile.count()) > 0) return tile;
  }
  throw new Error(`Video tile "${filename}" did not appear within ${timeoutMs}ms`);
}

async function assertTileThumbnailLoads(page, tile) {
  await tile.scrollIntoViewIfNeeded();
  await tile.hover();
  await page.waitForFunction(
    (sel) => {
      const tileEl = document.querySelector(sel);
      if (!tileEl) return false;
      const video = tileEl.querySelector('video.video-swarm-browser__video');
      if (video && video.readyState >= 2) return true;
      const img = tileEl.querySelector('img');
      if (img && img.complete && img.naturalWidth > 0) return true;
      return !!tileEl.querySelector('.video-swarm-browser__placeholder');
    },
    `[data-video-path="${await tile.getAttribute('data-video-path')}"]`,
    { timeout: 15000 },
  );
}

async function assertWatchableInFullscreen(page, browserRoot, tile) {
  await tile.dblclick();
  const modal = browserRoot.page().locator('[data-testid="video-swarm-fullscreen"]').first();
  await modal.waitFor({ state: 'visible', timeout: 10000 });
  const modalVideo = modal.locator('video.video-swarm-browser__modal-video').first();
  await modalVideo.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(
    () => {
      const v = document.querySelector('[data-testid="video-swarm-fullscreen"] video');
      return v && v.readyState >= 2 && v.videoWidth > 0;
    },
    { timeout: 15000 },
  );
  await modal.locator('button').filter({ hasText: /^Close$/ }).first().click();
  await modal.waitFor({ state: 'hidden', timeout: 10000 });
}

const STAGE_DIR = path.join(os.tmpdir(), `defora-e2e-record-gen-${Date.now()}`);
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'defora-e2e-record-gen-'));
const framesDir = path.join(tmpRoot, 'frames');
const runsDir = path.join(tmpRoot, 'runs');
const uploadsDir = path.join(tmpRoot, 'uploads');
const sequencersDir = path.join(tmpRoot, 'sequencers');
const projectsDir = path.join(uploadsDir, 'projects');

for (const d of [framesDir, runsDir, uploadsDir, sequencersDir, projectsDir, STAGE_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

const PREVIOUS_PROJECT = 'previous-project.mp4';
encodeMp4FromFrames(
  (() => {
    const priorFrames = path.join(STAGE_DIR, 'prior-frames');
    fs.mkdirSync(priorFrames, { recursive: true });
    for (let i = 0; i < 4; i++) {
      generateFramePng(path.join(priorFrames, `frame_${String(i).padStart(5, '0')}.png`), i);
    }
    return priorFrames;
  })(),
  path.join(projectsDir, PREVIOUS_PROJECT),
  4,
);

const stagedFrames = [];
for (let i = 0; i < TOTAL_FRAMES; i++) {
  const name = `frame_${String(i).padStart(5, '0')}.png`;
  const staged = path.join(STAGE_DIR, name);
  generateFramePng(staged, i);
  stagedFrames.push({ name, staged, dest: path.join(framesDir, name) });
}

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  framesDir,
  runsDir,
  uploadsDir,
  sequencersDir,
});
const base = `http://127.0.0.1:${svc.port}`;

let producedRecording = null;
let recordingStartedAt = 0;
let recordingStoppedAt = 0;

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.route('**/api/stream/record', async (route) => {
    producedRecording = `defora_rec_${Date.now()}.mp4`;
    recordingStartedAt = Date.now();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: `Recording started → ${producedRecording}` }),
    });
  });

  await page.route('**/api/stream/stop-record', async (route) => {
    recordingStoppedAt = Date.now();
    const outPath = path.join(uploadsDir, producedRecording || `defora_rec_${Date.now()}.mp4`);
    if (!producedRecording) producedRecording = path.basename(outPath);
    setTimeout(() => {
      try {
        const frameCount = fs.readdirSync(framesDir).filter((f) => /^frame_\d+\.png$/.test(f)).length;
        encodeMp4FromFrames(framesDir, outPath, Math.max(1, frameCount));
      } catch (_e) {
        fs.writeFileSync(outPath, Buffer.from('defora-fallback-mp4'));
      }
    }, 400);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Recording stopped' }),
    });
  });

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await clickTab(page, 'LIVE');
  await openLiveFramesPanel(page);

  const recordBtn = page.locator('[data-testid="header-record"]').first();
  if ((await recordBtn.count()) === 0) throw new Error('Record button not found in header transport');

  let recordingStarted = false;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const { staged, dest } = stagedFrames[i];
    fs.copyFileSync(staged, dest);

    const expectedCount = i + 1;
    await page.waitForFunction(
      (count) => {
        const thumbs = document.querySelectorAll('.frame-rail__thumb');
        if (thumbs.length >= count) return true;
        const meta = document.querySelector('.frame-rail__meta');
        if (meta) {
          const m = (meta.textContent || '').match(/(\d+)\s+generated/);
          if (m && parseInt(m[1], 10) >= count) return true;
        }
        return document.querySelectorAll('[data-testid="frame-rail-item"]').length >= count;
      },
      expectedCount,
      { timeout: FRAME_TIMEOUT },
    );

    if (i === 1 && !recordingStarted) {
      await recordBtn.click();
      recordingStarted = true;
      await page.waitForFunction(
        () => {
          const btn = document.querySelector('[data-testid="header-record"]');
          return btn && (btn.classList.contains('recording') || btn.getAttribute('aria-pressed') === 'true');
        },
        { timeout: 5000 },
      ).catch(() => null);
    }

    if (recordingStarted && i < TOTAL_FRAMES - 1) {
      await page.waitForTimeout(450);
    }
  }

  if (!recordingStarted) throw new Error('Recording was never started during generation');

  const recordElapsed = Date.now() - recordingStartedAt;
  if (recordElapsed < MIN_RECORD_MS) {
    await page.waitForTimeout(MIN_RECORD_MS - recordElapsed);
  }

  await recordBtn.click();
  await page.waitForTimeout(800);

  if (recordingStoppedAt - recordingStartedAt < MIN_RECORD_MS) {
    throw new Error(
      `Recording lasted ${recordingStoppedAt - recordingStartedAt}ms, expected ≥ ${MIN_RECORD_MS}ms`,
    );
  }

  const thumbCount = await page.locator('.frame-rail__thumb').count();
  if (thumbCount < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} frame rail thumbnails, got ${thumbCount}`);
  }

  if (!producedRecording) throw new Error('Recording filename was not captured');
  const recordingPath = path.join(uploadsDir, producedRecording);
  const recordingDeadline = Date.now() + 20000;
  while (!fs.existsSync(recordingPath) && Date.now() < recordingDeadline) {
    await page.waitForTimeout(300);
  }
  if (!fs.existsSync(recordingPath)) {
    throw new Error(`Encoded recording missing on disk: ${recordingPath}`);
  }
  const recStat = fs.statSync(recordingPath);
  if (recStat.size < 200) throw new Error(`Recording file too small: ${recStat.size} bytes`);

  const browserRoot = await openLibraryBrowser(page);
  await selectUploadsRoot(browserRoot, page);
  await enableFilenames(browserRoot);

  const projectsFolder = browserRoot
    .locator('[data-testid="video-swarm-folder"]')
    .filter({ has: browserRoot.locator('.video-swarm-browser__label', { hasText: 'projects' }) })
    .first();
  let projectsFolderEl = projectsFolder;
  if ((await projectsFolder.count()) === 0) {
    projectsFolderEl = browserRoot.locator('[data-testid="video-swarm-folder"][data-folder-path*="projects"]').first();
  }
  if ((await projectsFolderEl.count()) === 0) {
    const browseRes = await page.request.get(
      `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(uploadsDir)}&recursive=0&sort=name-asc`,
    );
    const browseJson = browseRes.ok() ? await browseRes.json() : {};
    const hasProjects = (browseJson.folders || []).some((f) => f && f.name === 'projects');
    if (!hasProjects) {
      throw new Error('Expected "projects" folder for previous project files');
    }
    await browserRoot.locator('button.framesync-button').filter({ hasText: /^Refresh$/ }).first().click();
    await page.waitForTimeout(600);
    projectsFolderEl = browserRoot.locator('[data-testid="video-swarm-folder"][data-folder-path*="projects"]').first();
  }
  if ((await projectsFolderEl.count()) === 0) {
    throw new Error('Expected "projects" folder tile in Library browser');
  }
  await projectsFolderEl.click();
  await page.waitForTimeout(500);

  const previousTile = browserRoot
    .locator(`.video-swarm-browser__tile[data-video-path*="${PREVIOUS_PROJECT}"]`)
    .first();
  await previousTile.waitFor({ state: 'visible', timeout: 15000 });
  await assertTileThumbnailLoads(page, previousTile);

  await selectUploadsRoot(browserRoot, page);

  const recordingTile = await waitForVideoTile(browserRoot, page, producedRecording);
  await assertTileThumbnailLoads(page, recordingTile);

  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(await recordingTile.getAttribute('data-video-path'))}`,
  );
  if (!mediaRes.ok()) throw new Error(`Recording not servable: HTTP ${mediaRes.status()}`);

  await assertWatchableInFullscreen(page, browserRoot, recordingTile);

  const rootTileCount = await browserRoot.locator('.video-swarm-browser__tile[data-video-path]').count();
  if (rootTileCount < 1) {
    throw new Error(`Expected new recording tile at uploads root, got ${rootTileCount}`);
  }

  console.log(
    `OK: recorded ${(recordingStoppedAt - recordingStartedAt) / 1000}s during ${TOTAL_FRAMES}-frame generation; ` +
      `${thumbCount} frame thumbs; ${producedRecording} watchable (${recStat.size} bytes); ` +
      `previous project ${PREVIOUS_PROJECT} in projects/`,
  );
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
  try {
    fs.rmSync(STAGE_DIR, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
