/**
 * GPU E2E: 96-frame Wan Video generation on a live stack with Forge.
 *
 *   SKIP_GPU_E2E=0 WEB_BASE_URL=http://192.168.2.100:8080 node test/playwright-gpu-wan-96frames.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.WEB_BASE_URL || 'http://127.0.0.1:4173';
const SKIP = process.env.SKIP_GPU_E2E !== '0';
const TOTAL_FRAMES = Math.max(8, Number(process.env.E2E_FRAME_COUNT) || 96);
const FPS = Number(process.env.E2E_VIDEO_FPS) || 12;
const POLL_MS = Number(process.env.E2E_GPU_POLL_MS) || 5000;
const DEADLINE_MS = Number(process.env.E2E_GPU_DEADLINE_MS) || 900_000;

async function main() {
  if (SKIP) {
    console.log('playwright-gpu-wan-96frames: skipped (set SKIP_GPU_E2E=0 to run)');
    process.exit(0);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const healthRes = await page.goto(`${BASE}/api/health`, { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => null);
  if (!healthRes?.ok()) {
    const health = await page.evaluate(async (origin) => {
      const res = await fetch(`${origin}/api/health`);
      return res.json();
    }, BASE);
    if (!health?.ok) throw new Error('health not ok');
  }

  const merge = await page.evaluate(async ({ origin, maxFrames, fps }) => {
    const res = await fetch(`${origin}/api/wan/merge-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maxFrames,
        fps,
        prompt: 'gentle camera drift over a calm ocean at sunset, cinematic',
        wanEngine: { wan_speed_preset: 'Turbo', wan_t2v_model: '1.3B VACE', wan_inference_steps: 8 },
      }),
    });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  }, { origin: BASE, maxFrames: TOTAL_FRAMES, fps: FPS });

  if (merge.status !== 200 || merge.json?.settings?.animation_mode !== 'Wan Video') {
    throw new Error(`wan merge-settings failed: ${merge.status} ${JSON.stringify(merge.json).slice(0, 200)}`);
  }
  console.log(`wan settings ok: max_frames=${merge.json.settings.max_frames}`);

  const gen = await page.evaluate(async ({ origin, maxFrames, fps }) => {
    const res = await fetch(`${origin}/api/wan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maxFrames,
        fps,
        prompt: 'gentle camera drift over a calm ocean at sunset, cinematic',
        wanEngine: { wan_speed_preset: 'Turbo', wan_t2v_model: '1.3B VACE', wan_auto_download: true },
      }),
    });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  }, { origin: BASE, maxFrames: TOTAL_FRAMES, fps: FPS });

  if (gen.status !== 200 || !gen.json?.ok) {
    throw new Error(
      `wan generate failed (${gen.status}): ${gen.json?.error || gen.json?.reason || gen.json?.detail || 'unknown'}`,
    );
  }
  console.log(`wan generate started: batchId=${gen.json.batchId} maxFrames=${gen.json.maxFrames}`);

  let railCount = 0;
  let apiCount = 0;
  const deadline = Date.now() + DEADLINE_MS;
  while (Date.now() < deadline) {
    await page.waitForTimeout(POLL_MS);
    const counts = await page.evaluate(async (origin) => {
      const items = document.querySelectorAll('[data-testid="frame-rail-item"]').length;
      const meta = document.querySelector('.frame-rail__meta');
      let fromMeta = 0;
      if (meta) {
        const m = (meta.textContent || '').match(/(\d+)\s+generated/);
        if (m) fromMeta = parseInt(m[1], 10);
      }
      const res = await fetch(`${origin}/api/frames?limit=50`);
      const json = await res.json().catch(() => ({}));
      return {
        rail: Math.max(items, fromMeta),
        api: Array.isArray(json.items) ? json.items.length : 0,
      };
    }, BASE);
    railCount = counts.rail;
    apiCount = counts.api;
    console.log(`  … rail=${railCount} api=${apiCount} (target ${TOTAL_FRAMES})`);
    if (railCount >= TOTAL_FRAMES) break;
  }

  if (railCount < TOTAL_FRAMES) {
    throw new Error(
      `expected ${TOTAL_FRAMES} wan frames on GPU run (rail=${railCount}, api=${apiCount}, batch=${gen.json.batchId})`,
    );
  }

  console.log(`playwright-gpu-wan-96frames: ok (rail=${railCount}, api=${apiCount}, batch=${gen.json.batchId})`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
