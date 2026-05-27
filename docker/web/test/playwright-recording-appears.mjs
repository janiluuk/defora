/**
 * Playwright E2E: when the user records material, it shows up in the browser
 * after processing completes (Settings → SYSTEM video swarm browser).
 *
 * We boot a real `server.js` with a temp `uploadsDir`, then intercept the
 * `/api/stream/record` call to simulate an async processing pipeline that
 * produces an `.mp4` under uploads. The UI must show it after refresh.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { start } from "../server.js";

function tinyMp4Buffer() {
  // Not a valid playable MP4, but enough for listing + download endpoints.
  return Buffer.from("defora-e2e-mp4");
}

async function clickTab(page, label) {
  const tab = page.locator("header .tab").filter({
    has: page.locator(".tab__label").filter({ hasText: new RegExp(`^${label}$`) }),
  }).first();
  if ((await tab.count()) === 0) throw new Error(`Tab "${label}" not found`);
  await tab.click();
}

async function clickSubPill(page, label) {
  const pill = page.locator(".sub-pill").filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) === 0) throw new Error(`Sub-pill "${label}" not found`);
  await pill.click();
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-record-"));
const runsDir = path.join(tmpRoot, "runs");
const framesDir = path.join(tmpRoot, "frames");
const uploadsDir = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

const svc = await start({
  port: 0,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
  enableMq: false,
});
const base = `http://127.0.0.1:${svc.port}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

let producedFilename = null;

try {
  // Intercept record request; simulate "processing" by writing an mp4 later.
  await page.route("**/api/stream/record", async (route) => {
    try {
      const req = route.request();
      const bodyRaw = req.postData() || "{}";
      const body = JSON.parse(bodyRaw);
      const requested = typeof body.output === "string" ? body.output : "";
      const baseName = requested ? path.basename(requested).replace(/[^\w.\-]/g, "_") : `defora_rec_${Date.now()}.mp4`;
      producedFilename = baseName.endsWith(".mp4") ? baseName : `${baseName}.mp4`;
      const outPath = path.join(uploadsDir, producedFilename);

      // Finish "processing" shortly after we return success.
      setTimeout(() => {
        try {
          fs.writeFileSync(outPath, tinyMp4Buffer());
        } catch (_e) {}
      }, 700);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: `Recording started → ${outPath}` }),
      });
    } catch (err) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: String(err && err.message ? err.message : err) }),
      });
    }
  });

  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("header .tab", { timeout: 30000 });

  // User action: start recording from LIVE.
  await clickTab(page, "LIVE");
  const recordBtn = page.locator('[data-testid="stream-record"]').first();
  if ((await recordBtn.count()) === 0) throw new Error("Record button not found on LIVE");
  await recordBtn.click();

  // Go to Settings → SYSTEM (video swarm browser).
  await clickTab(page, "SETTINGS");
  await page.waitForSelector(".sub-pill", { timeout: 30000 });
  await clickSubPill(page, "SYSTEM");

  // SettingsView wraps VideoSwarmBrowser in a container that shares the same testid.
  const browserRoot = page.locator(".video-swarm-browser[data-testid=\"video-swarm-browser\"]").first();
  await browserRoot.waitFor({ state: "visible", timeout: 30000 });

  // Choose Uploads root (record output is processed into uploadsDir).
  const rootSelect = browserRoot.locator(".video-swarm-browser__roots select.framesync-select").first();
  // Wait for roots to populate before selecting.
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      return Array.from(el.querySelectorAll("option")).some((o) => (o.value || "").toLowerCase() === "uploads");
    },
    rootSelect ? ".video-swarm-browser__roots select.framesync-select" : ".video-swarm-browser__roots select",
    { timeout: 15000 }
  );
  await rootSelect.selectOption({ value: "uploads" });

  // Ensure filenames are visible (default is on; only toggle if currently off).
  const namesChip = browserRoot.locator(".video-swarm-browser__chips .chip").filter({ hasText: /^Names$/ }).first();
  if ((await namesChip.count()) > 0) {
    const cls = (await namesChip.getAttribute("class")) || "";
    if (!cls.includes("active")) {
      await namesChip.click();
    }
  }

  // Poll until the processed file appears.
  // NOTE: The browser view refresh is triggered by browsing (root change), not by a dedicated refresh API.
  // Re-selecting the root forces a browse request.
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    await rootSelect.selectOption({ value: "frames" }).catch(() => null);
    await page.waitForTimeout(250);
    await rootSelect.selectOption({ value: "uploads" }).catch(() => null);
    await page.waitForTimeout(900);
    if (producedFilename) {
      const tile = browserRoot.locator(`.video-swarm-browser__tile[data-video-path*="${producedFilename}"]`).first();
      if ((await tile.count()) > 0) {
        // Also verify the media endpoint can be requested (file exists + served).
        const filePath = await tile.getAttribute("data-video-path");
        if (!filePath) throw new Error("Expected tile data-video-path attribute");
        const mediaRes = await page.request.get(`${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`);
        if (!mediaRes.ok()) throw new Error(`Expected media 200, got ${mediaRes.status()}`);
        console.log(`OK: recording appeared in browser after processing: ${producedFilename}`);
        break;
      }
    }
  }

  if (!producedFilename) throw new Error("Recording filename was not captured");
  const expectedPath = path.join(uploadsDir, producedFilename);
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`Processed recording file missing on disk: ${expectedPath}`);
  }

  // Sanity-check backend browse sees it (debuggability / correctness).
  const browseRes = await page.request.get(
    `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(uploadsDir)}&recursive=0&sort=name`
  );
  if (!browseRes.ok()) throw new Error(`Expected browse 200, got ${browseRes.status()}`);
  const browseJson = await browseRes.json();
  const backendHas = Array.isArray(browseJson.videos) && browseJson.videos.some((v) => v && v.name === producedFilename);
  if (!backendHas) {
    throw new Error(`Backend browse did not list produced recording: ${producedFilename}`);
  }

  // Ensure we actually saw it in the browser grid (loop broke).
  const finalTile = browserRoot.locator(`.video-swarm-browser__tile[data-video-path*="${producedFilename}"]`).first();
  if ((await finalTile.count()) === 0) {
    throw new Error(`Recording did not appear in browser within timeout: ${producedFilename}`);
  }
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}

