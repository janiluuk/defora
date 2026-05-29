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
