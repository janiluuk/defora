/**
 * Capture full-page screenshots of each main UI tab (requires local web server).
 * Usage: BASE_URL=http://127.0.0.1:3999 OUT_DIR=../../screenshots node scripts/capture-web-ui.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");

const base = process.env.BASE_URL || "http://127.0.0.1:3999";
const outDir = process.env.OUT_DIR
  ? path.resolve(process.env.OUT_DIR)
  : path.resolve(webRoot, "..", "..", "screenshots");

const tabs = [
  ["LIVE", "live-tab.png"],
  ["PROMPTS", "prompts-tab.png"],
  ["LORA", "lora-tab.png"],
  ["MOTION", "motion-tab.png"],
  ["MODULATION", "modulation-tab.png"],
  ["CN", "cn-tab.png"],
  ["SETTINGS", "settings-tab.png"],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
for (const [name, file] of tabs) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.waitForTimeout(500);
  const fp = path.join(outDir, file);
  await page.screenshot({ path: fp, fullPage: true });
  console.log("wrote", fp);
}
await browser.close();
