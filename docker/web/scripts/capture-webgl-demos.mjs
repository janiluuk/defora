#!/usr/bin/env node
/**
 * Capture ~5s WebGL standby clips for each animation mode (Playwright).
 *
 * Usage:
 *   node scripts/capture-webgl-demos.mjs --duration 5 --out ../../forge_cli_output/engine_demos/webgl
 *   DEFORA_BASE_URL=http://127.0.0.1:3000 node scripts/capture-webgl-demos.mjs --modes transition,protoplanet
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  clickTab,
  dismissSessionModalIfOpen,
  ensureRightPanelClosed,
  ensureRightPanelOpen,
  waitForNavTabs,
} from '../test/playwright-nav.mjs';
import { startE2eServer } from '../test/playwright-server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_MODES = [
  'transition',
  'protoplanet',
  'periodic_table',
  'instancing',
  'ocean',
  'marching',
];

function parseArgs(argv) {
  const opts = {
    duration: 5,
    out: path.join(__dirname, '../../../forge_cli_output/engine_demos/webgl'),
    modes: DEFAULT_MODES,
    baseUrl: process.env.BASE_URL || '',
    startServer: false,
    headed: false,
    fps: 12,
    viewport: { width: 1440, height: 900 },
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--duration' && argv[i + 1]) {
      opts.duration = Math.max(1, Number(argv[++i]) || 5);
    } else if (arg === '--out' && argv[i + 1]) {
      opts.out = path.resolve(argv[++i]);
    } else if (arg === '--modes' && argv[i + 1]) {
      opts.modes = argv[++i].split(',').map((m) => m.trim()).filter(Boolean);
    } else if (arg === '--base-url' && argv[i + 1]) {
      opts.baseUrl = argv[++i];
    } else if (arg === '--start-server') {
      opts.startServer = true;
    } else if (arg === '--headed') {
      opts.headed = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node capture-webgl-demos.mjs [--duration 5] [--out DIR] [--modes a,b] [--base-url URL] [--start-server]`);
      process.exit(0);
    }
  }
  return opts;
}

async function isDeforaApp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return false;
    const html = await res.text();
    return html.includes('data-testid="preview-standby-animation"');
  } catch {
    return false;
  }
}

async function resolveBaseUrl(opts) {
  const candidates = [
    opts.baseUrl,
    process.env.DEFORA_BASE_URL,
    process.env.BASE_URL,
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3999',
  ].filter(Boolean);
  for (const url of candidates) {
    if (await isDeforaApp(url)) return url;
  }
  if (candidates.length > 0) {
    console.warn(`No Defora app at ${candidates.join(', ')} — starting E2E server…`);
  }
  const server = await startE2eServer({ port: 0 });
  return `http://127.0.0.1:${server.port}`;
}

async function closeEngineDrawerIfOpen(page) {
  const engineToggle = page.locator('[data-testid="engine-drawer-toggle"]').first();
  if ((await engineToggle.count()) > 0) {
    const expanded = await engineToggle.getAttribute('aria-expanded');
    if (expanded === 'true') await engineToggle.click({ force: true });
  }
}

async function collapseChrome(page) {
  await ensureRightPanelClosed(page);
  await closeEngineDrawerIfOpen(page);
  const bottomDrawer = page.locator('[data-testid="bottom-drawer-toggle"]').first();
  if ((await bottomDrawer.count()) > 0) {
    const expanded = await bottomDrawer.getAttribute('aria-expanded');
    if (expanded === 'true') await bottomDrawer.click({ force: true });
  }
}

async function openWebglLayer(page) {
  await clickTab(page, 'LIVE');
  await page.waitForTimeout(300);
  await closeEngineDrawerIfOpen(page);
  const sidebarToggle = page.locator('[data-testid="layers-sidebar-toggle"]').first();
  if ((await sidebarToggle.count()) > 0) {
    const expanded = await sidebarToggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await sidebarToggle.click({ force: true });
  }
  const webglItem = page.locator('.layers-sidebar__item').filter({ hasText: /^WebGL$/ }).first();
  if ((await webglItem.count()) === 0) {
    throw new Error('WebGL layer not found in layers sidebar');
  }
  await webglItem.click({ force: true });
  await page.waitForSelector(
    '[data-testid="preview-standby-animation"].video-wrap__default-animation--visible',
    { timeout: 30000 },
  );
}

async function openWebglModeSelect(page) {
  await ensureRightPanelOpen(page);
  const engineToggle = page.locator('[data-testid="engine-drawer-toggle"]').first();
  if ((await engineToggle.count()) > 0) {
    const engineOpen = await engineToggle.getAttribute('aria-expanded');
    if (engineOpen !== 'true') await engineToggle.click();
  }
  const webglRow = page.locator('[data-testid="animation-engine-webgl"]').first();
  if ((await webglRow.count()) > 0) await webglRow.click();
  const controls = page.locator('[data-testid="animation-engine-controls-webgl"]').first();
  if ((await controls.count()) > 0) {
    const isOpen = await controls.evaluate((el) => el.open);
    if (!isOpen) {
      await controls.locator('summary.animation-engine-layer-row__controls-summary').click();
    }
  }
  const webglSection = page.locator('[data-testid="live-webgl-controls"]').first();
  await webglSection.waitFor({ state: 'visible', timeout: 20000 });
  return webglSection.locator('select.framesync-select').first();
}

async function enableDemoMotion(page, mode) {
  if (mode === 'transition') {
    for (const testId of ['tx-scene-animate', 'tx-transition-animate']) {
      const btn = page.locator(`[data-testid="${testId}"]`).first();
      if ((await btn.count()) === 0) continue;
      const active = await btn.evaluate((el) => el.classList.contains('active'));
      if (!active) await btn.click();
    }
  }
  if (mode === 'periodic_table') {
    const btn = page.locator('[data-testid="pt-auto-cycle"]').first();
    if ((await btn.count()) > 0) {
      const active = await btn.evaluate((el) => el.classList.contains('active'));
      if (!active) await btn.click();
    }
  }
}

async function waitForPreviewMotion(page, mode) {
  const warmupMs = mode === 'protoplanet' ? 2500 : mode === 'periodic_table' ? 2000 : 1000;
  await page.waitForTimeout(warmupMs);
  const preview = page.locator('[data-testid="preview-standby-animation"]');
  await preview.waitFor({ state: 'visible', timeout: 30000 });
  const changed = await page.evaluate(async () => {
    const root = document.querySelector('[data-testid="preview-standby-animation"]');
    if (!root) return false;
    const snap = () => root.innerHTML.length + root.offsetWidth + root.offsetHeight;
    const a = snap();
    await new Promise((r) => setTimeout(r, 400));
    const b = snap();
    return a !== b || !!root.querySelector('canvas');
  });
  if (!changed) {
    console.warn(`  [warn] preview may be static for mode ${mode}`);
  }
}

function encodeFramesToWebm(framesDir, outPath, frameCount, fps) {
  execSync(
    [
      'ffmpeg',
      '-y',
      '-framerate',
      String(fps),
      '-i',
      `"${path.join(framesDir, 'frame_%04d.png')}"`,
      '-frames:v',
      String(frameCount),
      '-c:v',
      'libvpx-vp9',
      '-pix_fmt',
      'yuv420p',
      '-crf',
      '30',
      '-b:v',
      '0',
      `"${outPath}"`,
    ].join(' '),
    { stdio: 'pipe' },
  );
}

async function capturePreviewFrames(page, mode, durationSec, fps, outDir) {
  const frameCount = Math.max(1, Math.round(durationSec * fps));
  const framesDir = path.join(outDir, `.frames-${mode}`);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  const intervalMs = 1000 / fps;
  const hasCanvas = (await page.locator('[data-testid="preview-standby-animation"] canvas').count()) > 0;

  for (let i = 0; i < frameCount; i += 1) {
    const framePath = path.join(framesDir, `frame_${String(i + 1).padStart(4, '0')}.png`);
    if (hasCanvas) {
      const b64 = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="preview-standby-animation"] canvas');
        if (!canvas) return null;
        return canvas.toDataURL('image/png').split(',')[1];
      });
      if (!b64) throw new Error('canvas toDataURL failed');
      fs.writeFileSync(framePath, Buffer.from(b64, 'base64'));
    } else {
      const target = page.locator('[data-testid="preview-standby-animation"]');
      await target.screenshot({ path: framePath, animations: 'allow', timeout: 5000 });
    }
    if (i + 1 < frameCount) await page.waitForTimeout(intervalMs);
  }
  const outPath = path.join(outDir, `${mode}.webm`);
  encodeFramesToWebm(framesDir, outPath, frameCount, fps);
  fs.rmSync(framesDir, { recursive: true, force: true });
  return outPath;
}

async function captureMode(browser, baseUrl, mode, durationSec, outDir, viewport, fps) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('defora_session')) localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  });
  const page = await context.newPage();
  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await dismissSessionModalIfOpen(page);
    await waitForNavTabs(page);
    await openWebglLayer(page);
    const modeSelect = await openWebglModeSelect(page);
    await modeSelect.selectOption(mode);
    await enableDemoMotion(page, mode);
    await waitForPreviewMotion(page, mode);
    await collapseChrome(page);
    await clickTab(page, 'LIVE');
    console.log(`  capturing ${durationSec}s @ ${fps}fps…`);
    return await capturePreviewFrames(page, mode, durationSec, fps, outDir);
  } finally {
    await page.close();
    await context.close();
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  fs.mkdirSync(opts.out, { recursive: true });
  const baseUrl = await resolveBaseUrl(opts);
  console.log(`BASE_URL: ${baseUrl}`);
  console.log(`Modes: ${opts.modes.join(', ')}`);
  console.log(`Output: ${opts.out}`);

  const browser = await chromium.launch({
    headless: !opts.headed,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const manifest = { baseUrl, durationSec: opts.duration, fps: opts.fps, modes: {} };
  try {
    for (const mode of opts.modes) {
      console.log(`\n=== WebGL · ${mode} ===`);
      try {
        const outPath = await captureMode(
          browser,
          baseUrl,
          mode,
          opts.duration,
          opts.out,
          opts.viewport,
          opts.fps,
        );
        manifest.modes[mode] = { status: 'ok', path: outPath };
        console.log(`  saved ${outPath}`);
      } catch (err) {
        manifest.modes[mode] = { status: 'error', reason: String(err.message || err) };
        console.error(`  [error] ${mode}:`, err.message || err);
      }
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(opts.out, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest: ${manifestPath}`);
  const failed = Object.values(manifest.modes).filter((m) => m.status !== 'ok').length;
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
