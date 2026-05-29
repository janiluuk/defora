/**
 * Debug WebGL on production (or any BASE_URL).
 *   BASE_URL=https://defora.dudeisland.eu node docker/web/test/playwright-webgl-prod-debug.mjs
 */
import { chromium } from "playwright";

const base = process.env.BASE_URL || "https://defora.dudeisland.eu";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleLogs = [];
const pageErrors = [];
page.on("console", (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => pageErrors.push(String(err)));

try {
  await page.goto(base, { waitUntil: "networkidle", timeout: 90000 });

  const modal = page.locator(".restore-session-modal");
  if (await modal.count()) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 15000 }).catch(() => null);
  }

  await page.waitForSelector("header .tab", { timeout: 30000 });
  await page.waitForTimeout(2000);

  const diag = await page.evaluate(() => {
    const standby = document.querySelector('[data-testid="preview-standby-animation"]');
    const canvas = standby?.querySelector("canvas");
    const activeTab = [...document.querySelectorAll(".video-layer-tab.active .video-layer-tab__label")].map(
      (el) => el.textContent?.trim(),
    );
    const webglTab = document.querySelector('[data-testid="animation-engine-webgl"]');
    return {
      standbyExists: !!standby,
      standbyClass: standby?.className || null,
      standbyOpacity: standby ? getComputedStyle(standby).opacity : null,
      standbyVisibility: standby ? getComputedStyle(standby).visibility : null,
      standbySize: standby ? { w: standby.offsetWidth, h: standby.offsetHeight } : null,
      canvasExists: !!canvas,
      canvasSize: canvas ? { w: canvas.width, h: canvas.height, clientW: canvas.clientWidth, clientH: canvas.clientHeight } : null,
      activeLayerTabs: activeTab,
      webglTabHtml: webglTab?.innerHTML?.slice(0, 500) || null,
      videoVisible: !!document.querySelector(".video-feed--visible"),
      playerSrc: document.getElementById("player")?.src || null,
    };
  });

  console.log("BASE_URL:", base);
  console.log("Diagnostics:", JSON.stringify(diag, null, 2));
  if (pageErrors.length) {
    console.log("\nPage errors:");
    pageErrors.slice(0, 20).forEach((e) => console.log(" ", e));
  }
  const webglRelated = consoleLogs.filter(
    (l) => /three|webgl|WebGL|preview-standby|error|failed/i.test(l),
  );
  if (webglRelated.length) {
    console.log("\nConsole (webgl-related):");
    webglRelated.slice(0, 30).forEach((l) => console.log(" ", l));
  }

  const canvasCheck = await page.evaluate(async () => {
    const canvas = document.querySelector('[data-testid="preview-standby-animation"] canvas');
    if (!canvas) return { error: "no canvas" };
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const url1 = canvas.toDataURL("image/png");
    await new Promise((r) => setTimeout(r, 400));
    const url2 = canvas.toDataURL("image/png");
    return {
      width: canvas.width,
      height: canvas.height,
      dataUrlLength: url1.length,
      frameChanged: url1 !== url2,
    };
  });
  console.log("Canvas render check:", JSON.stringify(canvasCheck, null, 2));

  const afterRestore = await page.evaluate(() => {
    const layer = document.querySelector(".video-layer-tab.active .video-layer-tab__label")?.textContent?.trim();
    const anim = document.querySelector('[data-testid="preview-standby-animation"]');
    return { layer, visible: anim?.classList.contains("video-wrap__default-animation--visible") };
  });
  console.log("After load layer:", afterRestore);

  await page.screenshot({ path: "/tmp/defora-webgl-debug.png", fullPage: false });
  console.log("\nScreenshot: /tmp/defora-webgl-debug.png");

  const minDataUrl = 8000;
  if (
    !diag.canvasExists
    || diag.standbyOpacity === "0"
    || !canvasCheck.dataUrlLength
    || canvasCheck.dataUrlLength < minDataUrl
  ) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
