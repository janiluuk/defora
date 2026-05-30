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

async function closeLibraryWorkspaceIfOpen(page) {
  const workspace = page.locator('[data-testid="library-workspace"]');
  if ((await workspace.count()) > 0 && (await workspace.isVisible())) {
    await page.locator('[data-testid="close-library-workspace"]').click();
    await workspace.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => null);
  }
}

/** Settings → System runs monitor (completed runs live under Past runs). */
export async function openRunsMonitor(page, { tab = 'active' } = {}) {
  await closeLibraryWorkspaceIfOpen(page);
  await ensureRightPanelOpen(page);
  await clickTab(page, 'SETTINGS');
  await page.locator('.live-right-column button.sub-pill').filter({ hasText: /^SYSTEM$/ }).first().click();
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

/** Top-nav library button → fullscreen browser workspace. */
export async function openLibraryBrowser(page) {
  const libraryBtn = page.locator('[data-testid="top-nav-library"]').first();
  await libraryBtn.waitFor({ state: 'visible', timeout: 30000 });
  const expanded = await libraryBtn.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await libraryBtn.click();
  }
  await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 30000 });
  await page.locator('[data-testid="library-workspace-tab-browser"]').click();
  await page.waitForSelector('[data-testid="video-swarm-browser"]', { timeout: 30000 });
  const browserRoot = page.locator('.video-swarm-browser[data-testid="video-swarm-browser"]').first();
  await browserRoot.waitFor({ state: 'visible', timeout: 30000 });
  return browserRoot;
}

export async function openLibraryEditorTab(page) {
  await openLibraryBrowser(page);
  await page.locator('[data-testid="library-workspace-tab-editor"]').click();
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15000 });
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
