/**
 * Shared helpers for screenshot / audit Playwright scripts.
 */
import { dismissSessionModalIfOpen } from './playwright-nav.mjs';

export const E2E_FAST = process.env.E2E_FAST === '1' || process.env.FAST_SHOTS === '1';

export function pauseMs(normalMs, fastMs = Math.min(120, normalMs)) {
  return E2E_FAST ? fastMs : normalMs;
}

export async function prepareScreenshotPage(page, base) {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await dismissSessionModalIfOpen(page);
}

export async function settle(page, normalMs = 450) {
  await page.waitForTimeout(pauseMs(normalMs, 80));
}

export async function waitForLibrarySkeletonGone(page, timeoutMs = 15_000) {
  await page.waitForFunction(() => {
    const sk = document.querySelector('.library-browser__skeleton-grid');
    return !sk;
  }, { timeout: timeoutMs }).catch(() => null);
}

export async function waitForFreecutShell(frame, timeoutMs = 20_000) {
  await frame.locator('body').waitFor({ state: 'attached', timeout: timeoutMs });
  const ready = frame.getByRole('button', { name: /New Project/i })
    .or(frame.getByText(/No media yet|GROUP VIDEOS|Projects/i));
  await ready.first().waitFor({ state: 'visible', timeout: timeoutMs });
}

export async function attachLiveDemoVideo(page, base, videoPath) {
  const url = `${base}/api/video-swarm/file?path=${encodeURIComponent(videoPath)}&rootId=uploads`;
  await page.evaluate((videoSrc) => {
    const player = document.getElementById('player') || document.querySelector('video');
    if (player?.tagName === 'VIDEO') {
      player.src = videoSrc;
      player.load();
      player.play().catch(() => {});
    }
  }, url);
  await page.waitForTimeout(pauseMs(1200, 400));
}
