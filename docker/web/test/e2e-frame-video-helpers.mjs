/**
 * Shared helpers for frame-rail → MP4 Playwright E2E tests.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export const DEFAULT_TOTAL_FRAMES = Math.max(8, Number(process.env.E2E_FRAME_COUNT) || 96);
export const DEFAULT_FPS = Number(process.env.E2E_VIDEO_FPS) || 24;
export const DEFAULT_FRAME_TIMEOUT = Number(process.env.E2E_FRAME_TIMEOUT_MS) || 180_000;
export const API_FRAMES_LIMIT = 50;

export function encodeMp4FromFrames(framesDir, outPath, frameCount, fps = DEFAULT_FPS) {
  execSync(
    [
      'ffmpeg', '-y',
      '-framerate', String(fps),
      '-i', `"${path.join(framesDir, 'frame_%05d.png')}"`,
      '-frames:v', String(frameCount),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'ultrafast',
      '-crf', '28',
      `"${outPath}"`,
    ].join(' '),
    { stdio: 'pipe' },
  );
}

export async function waitForFrameRailCount(page, count, timeoutMs = DEFAULT_FRAME_TIMEOUT) {
  await page.waitForFunction(
    (expected) => {
      const items = document.querySelectorAll('[data-testid="frame-rail-item"]');
      if (items.length >= expected) return true;
      const meta = document.querySelector('.frame-rail__meta');
      if (meta) {
        const m = (meta.textContent || '').match(/(\d+)\s+generated/);
        if (m && parseInt(m[1], 10) >= expected) return true;
      }
      return document.querySelectorAll('.frame-rail__thumb').length >= expected;
    },
    count,
    { timeout: timeoutMs },
  );
}

export async function captureStep(page, dir, filename) {
  if (!dir) return;
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, filename);
  await page.screenshot({ path: outPath, fullPage: false });
  console.log(`📸  ${outPath}`);
}

export function resolveScreenshotDir(repoRoot, prefix) {
  const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  if (process.env.SCREENSHOT_DIR) return path.resolve(process.env.SCREENSHOT_DIR);
  if (process.env.E2E_SCREENSHOTS === '1') {
    return path.join(repoRoot, 'screenshots', `${prefix}-${runId}`);
  }
  return null;
}
