#!/usr/bin/env node
/**
 * Verify Library → Uploads shows 1 folder + 1 video at root.
 */
import { chromium } from 'playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:3999';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

try {
  await page.goto(base, { waitUntil: 'networkidle' });
  const restore = page.getByRole('button', { name: 'Discard' });
  if (await restore.isVisible().catch(() => false)) {
    await restore.click();
  }
  await page.getByRole('button', { name: 'LIBRARY', exact: true }).click();
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 15000 });

  const rootSelect = page.locator('[data-testid="video-swarm-root-select"]');
  if (await rootSelect.count()) {
    await rootSelect.selectOption('uploads');
  }

  await page.waitForFunction(() => {
    const folders = document.querySelectorAll('[data-testid="video-swarm-folder"]');
    const videos = document.querySelectorAll('[data-video-path]');
    return folders.length >= 1 && videos.length >= 1;
  }, { timeout: 15000 });

  const folderNames = await page.locator('[data-testid="video-swarm-folder"] .video-swarm-browser__label').allTextContents();
  const videoNames = await page.locator('[data-video-path] .video-swarm-browser__label').allTextContents();

  console.log('Folders:', folderNames);
  console.log('Videos:', videoNames);

  const hasClips = folderNames.some((n) => /clips/i.test(n));
  const hasDemo = videoNames.some((n) => /demo-preview\.mp4/i.test(n));
  if (!hasClips || !hasDemo) {
    throw new Error(`Expected clips folder + demo-preview.mp4, got folders=${folderNames.join(',')} videos=${videoNames.join(',')}`);
  }
  console.log('OK: Library Uploads shows 1 folder (clips) and demo-preview.mp4');
} finally {
  await browser.close();
}
