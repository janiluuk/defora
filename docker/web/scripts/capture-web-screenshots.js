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
    const publicDir = path.join(__dirname, "..", "public");
    const server = spawn("python", ["-m", "http.server", "9999"], {
      cwd: publicDir,
      stdio: "pipe",
    });

    server.stdout.on("data", (data) => {
      if (data.toString().includes("Serving HTTP")) {
        console.log("Server started on port 9999");
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      // Suppress server output
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      console.log("Server ready");
      resolve(server);
    }, 3000);
  });
}

async function captureScreenshots() {
  console.log("Starting HTTP server...");
  const server = await startServer();

  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  // Navigate to the page
  const url = "http://localhost:9999/index.html";
  console.log(`Loading page: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  } catch (error) {
    console.log("Timeout, continuing anyway...");
  }

  // Wait for Vue to load and render
  console.log("Waiting for Vue to render...");
  await page.waitForTimeout(4000);

  // Check if Vue loaded by looking for tabs
  const tabCount = await page.$$eval(".tab", (tabs) => tabs.length).catch(() => 0);
  console.log(`Found ${tabCount} tabs on the page`);

  if (tabCount === 0) {
    console.error("ERROR: No tabs found! Vue may not have loaded correctly.");
    await browser.close();
    server.kill('SIGTERM');
    process.exit(1);
  }

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, "..", "..", "..", "screenshots");

  // Get all tab texts
  const tabTexts = await page.$$eval(".tab", (tabs) => tabs.map((t) => t.textContent.trim()));
  console.log("Available tabs:", tabTexts);

  // Define tabs we want to capture (updated list based on actual tabs)
  const tabs = [
    { name: "live", text: "LIVE" },
    { name: "prompts", text: "PROMPTS" },
    { name: "lora", text: "LORA" },
    { name: "motion", text: "MOTION" },
    { name: "modulation", text: "MODULATION" },
    { name: "cn", text: "CN" },
    { name: "settings", text: "SETTINGS" },
  ];

  // Capture screenshot for each tab
  for (const tab of tabs) {
    console.log(`\nCapturing screenshot for ${tab.name.toUpperCase()} tab...`);

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
      await page.waitForTimeout(1000);

      // Take screenshot
      const filename = `${tab.name}-tab.png`;
      await page.screenshot({
        path: path.join(screenshotsDir, filename),
        fullPage: false,
      });

      console.log(`  ✓ Screenshot saved: ${filename}`);
    } catch (error) {
      console.error(`  ✗ Error capturing ${tab.name}: ${error.message}`);
    }
  }

  await browser.close();
  
  // Kill server and wait for cleanup
  server.kill('SIGTERM');
  await new Promise(resolve => {
    server.on('close', resolve);
    setTimeout(resolve, 1000); // Timeout after 1 second
  });
  
  console.log("\n✓ Done! Screenshots saved to:", screenshotsDir);
}

captureScreenshots().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
