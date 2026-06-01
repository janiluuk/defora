#!/usr/bin/env node
/**
 * Verify Library → Projects lists seeded project cards (no raw folder names).
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
  await page.locator('[data-testid="top-nav-library"]').click();
  await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 15000 });
  await page.locator('[data-testid="library-workspace-tab-browser"]').click();
  await page.waitForSelector('[data-testid="projects-browser"]', { timeout: 15000 });

  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('[data-testid="project-card"]');
    return cards.length >= 1;
  }, { timeout: 15000 });

  const titles = await page.locator('.library-browser__title').allTextContents();
  const hasVideoCard = await page.locator('[data-testid="project-card"][data-video-path]').count();

  console.log('Project titles:', titles);

  if (hasVideoCard < 1) {
    throw new Error('Expected at least one project with video');
  }
  if (titles.some((t) => /^(uploads|clips|projects|frames|runs)$/i.test(t.trim()))) {
    throw new Error(`Project titles should not be raw folder names: ${titles.join(', ')}`);
  }
  console.log('OK: Library Projects shows user-facing project cards');
} finally {
  await browser.close();
}
