/**
 * Playwright test to capture screenshots of all web UI tabs
 */
const { test, expect } = require("@playwright/test");
const path = require("path");

test.describe("Web UI Screenshots", () => {
  test("capture all tab screenshots", async ({ page }) => {
    // Navigate to a static HTML file directly
    const htmlPath = `file://${path.join(__dirname, "..", "public", "index.html")}`;
    await page.goto(htmlPath);
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".tab", { timeout: 5000 });

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, "..", "..", "..", "screenshots");
    const fs = require("fs");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Get all tabs
    const tabs = [
      { name: "LIVE", selector: ".tab:has-text('LIVE')" },
      { name: "PROMPTS", selector: ".tab:has-text('PROMPTS')" },
      { name: "MOTION", selector: ".tab:has-text('MOTION')" },
      { name: "AUDIO", selector: ".tab:has-text('AUDIO')" },
      { name: "MODULATION", selector: ".tab:has-text('MODULATION')" },
      { name: "FEATURES", selector: ".tab:has-text('FEATURES')" },
      { name: "CN", selector: ".tab:has-text('CN')" },
      { name: "SETTINGS", selector: ".tab:has-text('SETTINGS')" },
    ];

    // Capture screenshot for each tab
    for (const tab of tabs) {
      console.log(`Capturing screenshot for ${tab.name} tab...`);
      
      // Click on the tab
      await page.click(tab.selector);
      
      // Wait for tab content to load
      await page.waitForTimeout(500);
      
      // Take screenshot
      const filename = `${tab.name.toLowerCase()}-tab.png`;
      await page.screenshot({
        path: path.join(screenshotsDir, filename),
        fullPage: true,
      });
      
      console.log(`Screenshot saved: ${filename}`);
    }

    // Verify screenshots were created
    for (const tab of tabs) {
      const filename = `${tab.name.toLowerCase()}-tab.png`;
      const filepath = path.join(screenshotsDir, filename);
      expect(fs.existsSync(filepath)).toBe(true);
    }
  });
});
