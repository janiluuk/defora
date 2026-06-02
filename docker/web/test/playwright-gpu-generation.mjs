/**
 * Optional GPU generation E2E — requires SD-Forge with Deforum on the lab network.
 *
 *   SKIP_GPU_E2E=0 WEB_BASE_URL=http://192.168.2.100:8080 node test/playwright-gpu-generation.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.WEB_BASE_URL || 'http://127.0.0.1:4173';
const SKIP = process.env.SKIP_GPU_E2E !== '0';

async function main() {
  if (SKIP) {
    console.log('playwright-gpu-generation: skipped (set SKIP_GPU_E2E=0 to run)');
    process.exit(0);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-testid="standby-preview-video"], .preview-stage', { timeout: 30000 });

  const health = await page.evaluate(async () => {
    const res = await fetch('/api/health');
    return res.json();
  });
  if (!health?.ok) throw new Error('health not ok');

  await page.click('[data-testid="tab-LIVE"], .tab--live', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const framesBefore = await page.evaluate(async () => {
    const res = await fetch('/api/frames?limit=4');
    const json = await res.json();
    return Array.isArray(json.items) ? json.items.length : 0;
  });

  await page.click('[data-testid="deforum-play"], button:has-text("Play")', { timeout: 5000 }).catch(() => {});

  let framesAfter = framesBefore;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(3000);
    framesAfter = await page.evaluate(async () => {
      const res = await fetch('/api/frames?limit=8');
      const json = await res.json();
      return Array.isArray(json.items) ? json.items.length : 0;
    });
    if (framesAfter > framesBefore) break;
  }

  if (framesAfter <= framesBefore) {
    throw new Error(`expected new frames on GPU run (before=${framesBefore} after=${framesAfter})`);
  }

  console.log(`playwright-gpu-generation: ok (${framesBefore} -> ${framesAfter} frames)`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
