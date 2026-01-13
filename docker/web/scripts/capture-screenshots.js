#!/usr/bin/env node
/**
 * Capture screenshots of all web UI tabs using Playwright
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

async function startServer() {
  return new Promise((resolve) => {
    const server = spawn("python", ["-m", "http.server", "4000"], {
      cwd: path.join(__dirname, "..", "public"),
      stdio: "pipe",
    });

    server.stdout.on("data", (data) => {
      if (data.toString().includes("Serving HTTP")) {
        console.log("Server started");
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      console.log("Server:", data.toString());
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      console.log("Server timeout, assuming started");
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
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  } catch (error) {
    console.log("Network idle timeout, continuing anyway...");
  }

  // Wait for Vue to load and render
  console.log("Waiting for Vue to render...");
  await page.waitForTimeout(3000);

  // Check if Vue loaded by looking for tabs
  const tabCount = await page.$$eval(".tab", (tabs) => tabs.length).catch(() => 0);
  console.log(`Found ${tabCount} tabs on the page`);

  if (tabCount === 0) {
    console.error("ERROR: No tabs found! Vue may not have loaded correctly.");
    console.log("Page content sample:");
    const content = await page.content();
    console.log(content.substring(0, 500));
    await browser.close();
    server.kill();
    process.exit(1);
  }

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, "..", "..", "..", "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Get all tab texts
  const tabTexts = await page.$$eval(".tab", (tabs) => tabs.map((t) => t.textContent.trim()));
  console.log("Tab texts:", tabTexts);

  // Define tabs we want to capture
  const tabs = [
    { name: "LIVE", text: "LIVE" },
    { name: "PROMPTS", text: "PROMPTS" },
    { name: "MOTION", text: "MOTION" },
    { name: "AUDIO", text: "AUDIO" },
    { name: "MODULATION", text: "MODULATION" },
    { name: "FEATURES", text: "FEATURES" },
    { name: "CN", text: "CN" },
    { name: "SETTINGS", text: "SETTINGS" },
  ];

  // Capture screenshot for each tab
  for (const tab of tabs) {
    console.log(`\nCapturing screenshot for ${tab.name} tab...`);

    try {
      // Find and click the tab
      const tabElements = await page.$$(".tab");
      let clicked = false;
      
      for (const element of tabElements) {
        const text = await element.textContent();
        if (text.includes(tab.text)) {
          await element.click();
          clicked = true;
          console.log(`  Clicked tab: ${text}`);
          break;
        }
      }

      if (!clicked) {
        console.error(`  ✗ Could not find tab: ${tab.name}`);
        continue;
      }

      // Wait for tab content to render
      await page.waitForTimeout(500);

      // Take screenshot
      const filename = `${tab.name.toLowerCase()}-tab.png`;
      await page.screenshot({
        path: path.join(screenshotsDir, filename),
        fullPage: true,
      });

      console.log(`  ✓ Screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`  ✗ Error capturing ${tab.name}: ${error.message}`);
    }
  }

  await browser.close();
  server.kill();
  console.log("\n✓ Done! Screenshots saved to:", screenshotsDir);
}

captureScreenshots().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
