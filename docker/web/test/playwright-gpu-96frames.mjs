/**
 * GPU E2E: request 96-frame Deforum warmup on a live stack with Forge.
 *
 *   SKIP_GPU_E2E=0 WEB_BASE_URL=http://192.168.2.100:8080 node test/playwright-gpu-96frames.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.WEB_BASE_URL || 'http://127.0.0.1:4173';
const SKIP = process.env.SKIP_GPU_E2E !== '0';
const TOTAL_FRAMES = Math.max(8, Number(process.env.E2E_FRAME_COUNT) || 96);
const FPS = Number(process.env.E2E_VIDEO_FPS) || 12;
const POLL_MS = Number(process.env.E2E_GPU_POLL_MS) || 5000;
const DEADLINE_MS = Number(process.env.E2E_GPU_DEADLINE_MS) || 600_000;

async function main() {
  if (SKIP) {
    console.log('playwright-gpu-96frames: skipped (set SKIP_GPU_E2E=0 to run)');
    process.exit(0);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForSelector('[data-testid="standby-preview-video"], .preview-stage', { timeout: 30_000 });

  const health = await page.evaluate(async () => {
    const res = await fetch('/api/health');
    return res.json();
  });
  if (!health?.ok) throw new Error('health not ok');

  const warmup = await page.evaluate(async ({ maxFrames, fps }) => {
    const res = await fetch('/api/deforum/warmup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxFrames, fps }),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  }, { maxFrames: TOTAL_FRAMES, fps: FPS });

  if (warmup.status !== 200 || !warmup.json?.ok) {
    throw new Error(
      `warmup failed (${warmup.status}): ${warmup.json?.error || warmup.json?.status || 'unknown'}`,
    );
  }
  console.log(`warmup started: batchId=${warmup.json.batchId} maxFrames=${warmup.json.maxFrames} fps=${warmup.json.fps}`);

  let railCount = 0;
  let apiCount = 0;
  const deadline = Date.now() + DEADLINE_MS;
  while (Date.now() < deadline) {
    await page.waitForTimeout(POLL_MS);
    const counts = await page.evaluate(async () => {
      const items = document.querySelectorAll('[data-testid="frame-rail-item"]').length;
      const meta = document.querySelector('.frame-rail__meta');
      let fromMeta = 0;
      if (meta) {
        const m = (meta.textContent || '').match(/(\d+)\s+generated/);
        if (m) fromMeta = parseInt(m[1], 10);
      }
      const res = await fetch('/api/frames?limit=50');
      const json = await res.json().catch(() => ({}));
      return {
        rail: Math.max(items, fromMeta),
        api: Array.isArray(json.items) ? json.items.length : 0,
      };
    });
    railCount = counts.rail;
    apiCount = counts.api;
    console.log(`  … rail=${railCount} api=${apiCount} (target ${TOTAL_FRAMES})`);
    if (railCount >= TOTAL_FRAMES) break;
  }

  if (railCount < TOTAL_FRAMES) {
    throw new Error(
      `expected ${TOTAL_FRAMES} frames on GPU run (rail=${railCount}, api=${apiCount})`,
    );
  }

  console.log(`playwright-gpu-96frames: ok (rail=${railCount}, api=${apiCount}, batch=${warmup.json.batchId})`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
