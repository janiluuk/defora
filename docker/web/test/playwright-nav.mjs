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

async function openLiveSystemDrawer(page) {
  await closeLibraryWorkspaceIfOpen(page);
  await ensureRightPanelOpen(page);
  await clickTab(page, 'LIVE');
  const drawerToggle = page.locator('[data-testid="bottom-drawer-toggle"]').first();
  if ((await drawerToggle.count()) > 0) {
    const expanded = await drawerToggle.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await drawerToggle.click();
      await page.waitForFunction(
        () => {
          const t = document.querySelector('[data-testid="bottom-drawer-toggle"]');
          return t && t.getAttribute('aria-expanded') === 'true';
        },
        { timeout: 10000 },
      );
    }
    const systemPill = page.locator('.live-top-drawer__tabs .sub-pill').filter({ hasText: /^SYSTEM$/ }).first();
    if ((await systemPill.count()) > 0) {
      await systemPill.waitFor({ state: 'visible', timeout: 10000 });
      await systemPill.click();
      await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 30000 });
      return;
    }
  }
  await clickTab(page, 'SETTINGS');
  await page.locator('.settings-subtabs .sub-pill').filter({ hasText: /^RUNS$/ }).first().click();
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 30000 });
}

/** RUNS tab, or LIVE → bottom drawer → SYSTEM runs monitor. */
export async function openRunsMonitor(page, { tab = 'active' } = {}) {
  await closeLibraryWorkspaceIfOpen(page);
  const runsTab = page.locator(NAV_TAB_SELECTOR).filter({
    has: page.locator('.tab__label').filter({ hasText: /^RUNS$/ }),
  }).first();
  if ((await runsTab.count()) > 0) {
    await clickTab(page, 'RUNS');
  } else {
    await openLiveSystemDrawer(page);
  }
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 30000 });
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

/** Legacy overlay or LIBRARY tab → Projects library. */
export async function openLibraryBrowser(page) {
  const libraryBtn = page.locator('[data-testid="top-nav-library"]').first();
  if ((await libraryBtn.count()) > 0) {
    await libraryBtn.waitFor({ state: 'visible', timeout: 30000 });
    const expanded = await libraryBtn.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await libraryBtn.click();
    }
    await page.waitForSelector('[data-testid="library-workspace"]', { timeout: 30000 });
    await page.locator('[data-testid="library-workspace-tab-browser"]').click();
  } else {
    await ensureRightPanelOpen(page);
    await clickTab(page, 'LIBRARY');
  }
  await page.waitForSelector('[data-testid="library-browser"]', { timeout: 30000 });
  await page.waitForSelector('[data-testid="projects-browser"]', { timeout: 30000 });
  const browserRoot = page.locator('[data-testid="library-browser"]').first();
  await browserRoot.waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForFunction(() => {
    const loading = document.querySelector('.library-browser__skeleton-grid');
    const empty = document.querySelector('.library-browser__empty');
    if (loading) return false;
    if (!empty) return true;
    return !/Loading projects/i.test(empty.textContent || '');
  }, { timeout: 15000 }).catch(() => null);
  return browserRoot;
}

/** Poll Projects or Videos grid until a card with matching video path fragment appears. */
export async function waitForProjectCard(browserRoot, page, filenamePart, timeoutMs = 25000) {
  const refreshBtn = browserRoot.locator('[data-testid="projects-refresh"], [data-testid="videos-refresh"]').first();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const card = browserRoot
      .locator(
        `[data-testid="project-card"][data-video-path*="${filenamePart}"], [data-testid="video-card"][data-video-path*="${filenamePart}"]`,
      )
      .filter({ visible: true })
      .first();
    if ((await card.count()) > 0) return card;
    await refreshBtn.click().catch(() => null);
    await page.waitForTimeout(600);
  }
  throw new Error(`Library card "${filenamePart}" did not appear within ${timeoutMs}ms`);
}

export async function openLibraryVideosTab(page) {
  const browserRoot = page.locator('[data-testid="library-browser"]').first();
  await browserRoot.locator('[data-testid="library-tab-videos"]').click();
  await page.waitForSelector('[data-testid="videos-browser"]', { timeout: 15000 });
  return browserRoot;
}

export async function openLibraryAudioTab(page) {
  const browserRoot = page.locator('[data-testid="library-browser"]').first();
  await browserRoot.locator('[data-testid="library-tab-audio"]').click();
  await page.waitForSelector('[data-testid="audio-browser"]', { timeout: 15000 });
  return browserRoot;
}

export async function openLibraryEditorTab(page) {
  await openLibraryBrowser(page);
  await page.locator('[data-testid="library-workspace-tab-editor"]').click();
  await page.waitForSelector('[data-testid="editor-workspace"]', { timeout: 15000 });
}

/** LIVE system drawer (or RUNS tab) → Frames rail with generation thumbnails. */
export async function openLiveFramesPanel(page) {
  const runsTab = page.locator(NAV_TAB_SELECTOR).filter({
    has: page.locator('.tab__label').filter({ hasText: /^RUNS$/ }),
  }).first();
  if ((await runsTab.count()) > 0) {
    await clickTab(page, 'RUNS');
  } else {
    await openLiveSystemDrawer(page);
  }
  await page.waitForSelector('[data-testid="runs-browser"]', { timeout: 15000 });
  await page.locator('[data-testid="runs-browser-tab-frames"]').click();
  await page.waitForSelector('[data-testid="runs-browser-frames"]', { timeout: 15000 });
}

export async function dismissSessionModalIfOpen(page) {
  const modal = page.locator('.restore-session-modal');
  if ((await modal.count()) > 0) {
    await page.locator('.restore-session-modal button').filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: 'hidden', timeout: 10000 });
  }
}
