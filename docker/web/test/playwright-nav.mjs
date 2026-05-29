/**
 * Main nav lives in top-nav (PR #83) or bottom-nav (main); legacy tests used header .tab.
 */
export const NAV_TAB_SELECTOR =
  '[data-testid="top-nav"] .tab, nav.bottom-nav .tab, header .tab';

export const NAV_TAB_LABEL_SELECTOR = `${NAV_TAB_SELECTOR} .tab__label`;

export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function waitForNavTabs(page, timeout = 30000) {
  await page.waitForSelector(NAV_TAB_SELECTOR, { timeout });
}

export async function getTabLabels(page) {
  const labels = await page.locator(NAV_TAB_LABEL_SELECTOR).allTextContents();
  return labels.map((label) => label.trim()).filter(Boolean);
}

export async function clickTab(page, label) {
  const tab = page.locator(NAV_TAB_SELECTOR).filter({
    has: page.locator('.tab__label').filter({
      hasText: new RegExp(`^${escapeRegex(label)}$`),
    }),
  }).first();
  if ((await tab.count()) === 0) {
    throw new Error(`Tab button "${label}" not found`);
  }
  await tab.click();
}

export async function ensureRightPanelClosed(page) {
  const drawer = page.locator('[data-testid="right-panel-drawer"]').first();
  const toggle = page.locator('[data-testid="right-panel-toggle"]').first();
  if ((await toggle.count()) === 0) return;
  const expanded = await toggle.getAttribute('aria-expanded');
  if (expanded === 'true') {
    await toggle.click();
  }
  if ((await drawer.count()) > 0) {
    await drawer.waitFor({
      state: 'attached',
      timeout: 5000,
    });
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="right-panel-drawer"]');
      return el && !el.classList.contains('live-drawer-shell--open');
    }, { timeout: 5000 }).catch(() => null);
  } else {
    await page.waitForTimeout(400);
  }
}

export async function ensureRightPanelOpen(page) {
  const toggle = page.locator('[data-testid="right-panel-toggle"]').first();
  if ((await toggle.count()) === 0) return;
  const expanded = await toggle.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await toggle.click();
    await page.waitForTimeout(400);
  }
}

/** Settings → System runs monitor (completed runs live under Past runs). */
export async function openRunsMonitor(page, { tab = 'active' } = {}) {
  await ensureRightPanelOpen(page);
  await clickTab(page, 'SETTINGS');
  await page.locator('.sub-pill').filter({ hasText: /^SYSTEM$/ }).first().click();
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 30000 });
  await Promise.resolve();
  if (tab === 'past') {
    await page.locator('[data-testid="runs-browser-tab-past"]').click();
    await page.waitForSelector(
      '.runs-browser__table-wrap:not(.runs-browser__table-wrap--active) .runs-browser__table',
      { timeout: 30000 },
    );
  } else if (tab === 'frames') {
    await page.locator('[data-testid="runs-browser-tab-frames"]').click();
    await page.waitForSelector('[data-testid="runs-browser-frames"]', { timeout: 30000 });
  } else {
    await page.waitForSelector('[data-testid="runs-active-jobs"]', { timeout: 30000 });
  }
}

/** Wait until a completed run row is visible on Past runs (CI may lag on refreshRuns). */
export async function waitForPastRunRow(page, runId, timeoutMs = 45000) {
  const pastTable = page.locator(
    '.runs-browser__table-wrap:not(.runs-browser__table-wrap--active) .runs-browser__table',
  );
  const row = pastTable.locator('tbody tr').filter({
    has: page.locator('.runs-browser__run-id', { hasText: runId }),
  }).first();
  const deadline = Date.now() + timeoutMs;
  while ((await row.count()) === 0 && Date.now() < deadline) {
    await page.locator('button.framesync-button').filter({ hasText: /^Refresh$/ }).first().click().catch(() => null);
    await Promise.resolve();
    await page.waitForTimeout(500);
  }
  await row.waitFor({ state: 'visible', timeout: Math.max(5000, deadline - Date.now()) });
  return row;
}

/** LIBRARY tab → VideoSwarm browser in the right panel. */
export async function openLibraryBrowser(page) {
  await ensureRightPanelOpen(page);
  await clickTab(page, 'LIBRARY');
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 30000 });
  const browserRoot = page.locator('.video-swarm-browser[data-testid="video-swarm-browser"]').first();
  await browserRoot.waitFor({ state: 'visible', timeout: 30000 });
  return browserRoot;
}

/** LIVE top drawer → System → Frames rail (crossfader / top-nav layout). */
export async function openLiveFramesPanel(page) {
  const drawerToggle = page.locator('[data-testid="bottom-drawer-toggle"]');
  if ((await drawerToggle.count()) > 0) {
    const expanded = await drawerToggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await drawerToggle.click();
  }
  await page.locator('.live-top-drawer__tabs .sub-pill').filter({ hasText: /^SYSTEM$/ }).click();
  await page.locator('[data-testid="runs-browser-tab-frames"]').click();
  await page.waitForSelector('[data-testid="runs-browser-frames"]', { timeout: 15000 });
}
