#!/usr/bin/env node
/**
 * Capture screenshots of all web UI tabs using Playwright
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn("python", ["-m", "http.server", "4000"], {
      cwd: path.join(__dirname, "..", "public"),
      stdio: "pipe",
    });

    server.stdout.on("data", (data) => {
      if (data.toString().includes("Serving HTTP")) {
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.log("Server:", data.toString());
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(server);
    }, 5000);
  });
}

async function captureScreenshots() {
  console.log("Starting HTTP server...");
  const server = await startServer();

  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // Navigate to the page
  const url = "http://localhost:4000/index.html";
  console.log(`Loading page: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });
  } catch (error) {
    console.log("Network idle timeout, but continuing...");
  }

  // Wait for Vue to load and render
  await page.waitForTimeout(3000);

  // Debug: Check if tabs exist
  const tabCount = await page.$$eval(".tab", (tabs) => tabs.length);
  console.log(`Found ${tabCount} tabs on the page`);

  if (tabCount === 0) {
    console.error("No tabs found! Vue might not have loaded correctly.");
    await browser.close();
    server.kill();
    return;
  }

  // Debug: Get tab text
  const tabTexts = await page.$$eval(".tab", (tabs) => tabs.map((t) => t.textContent.trim()));
  console.log("Tab texts:", tabTexts);

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, "..", "..", "..", "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Map of tab names to their exact text
  const tabMapping = {};
  for (let i = 0; i < tabTexts.length; i++) {
    const text = tabTexts[i];
    if (text.includes("LIVE")) tabMapping["LIVE"] = i;
    if (text.includes("PROMPTS")) tabMapping["PROMPTS"] = i;
    if (text.includes("MOTION")) tabMapping["MOTION"] = i;
    if (text.includes("AUDIO")) tabMapping["AUDIO"] = i;
    if (text.includes("MODULATION") || text.includes("MOD")) tabMapping["MODULATION"] = i;
    if (text.includes("FEATURES")) tabMapping["FEATURES"] = i;
    if (text === "CN") tabMapping["CN"] = i;
    if (text.includes("SETTINGS")) tabMapping["SETTINGS"] = i;
  }

  console.log("Tab mapping:", tabMapping);

  // Capture screenshot for each tab
  for (const [name, index] of Object.entries(tabMapping)) {
    console.log(`Capturing screenshot for ${name} tab (index ${index})...`);

    try {
      // Click the tab by index
      const tabElements = await page.$$(".tab");
      await tabElements[index].click();

      // Wait for tab content to load
      await page.waitForTimeout(500);

      // Take screenshot
      const filename = `${name.toLowerCase()}-tab.png`;
      await page.screenshot({
        path: path.join(screenshotsDir, filename),
        fullPage: true,
      });

      console.log(`  ✓ Screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`  ✗ Error capturing ${name}: ${error.message}`);
    }
  }

  await browser.close();
  server.kill();
  console.log("\nDone! Screenshots saved to:", screenshotsDir);
}

captureScreenshots().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
