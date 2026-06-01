/**
 * Playwright E2E: when the user records material, it shows up in the browser
 * after processing completes (Library → VideoSwarm browser).
 *
 * We boot a real `server.js` with a temp `uploadsDir`, then intercept the
 * `/api/stream/record` call to simulate an async processing pipeline that
 * produces an `.mp4` under uploads. The UI must show it after refresh.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { startE2eServer } from "./playwright-server.mjs";
import { clickTab, openLibraryBrowser, waitForNavTabs, waitForProjectCard } from "./playwright-nav.mjs";

function tinyMp4Buffer() {
  // Not a valid playable MP4, but enough for listing + download endpoints.
  return Buffer.from("defora-e2e-mp4");
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

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
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
  await waitForNavTabs(page);

  // User action: start recording from header transport (always in chrome).
  await clickTab(page, "LIVE");
  const recordBtn = page.locator('[data-testid="header-record"]').first();
  if ((await recordBtn.count()) === 0) throw new Error("Record button not found in header transport");
  await recordBtn.click();

  // Go to Library (Projects browser).
  const browserRoot = await openLibraryBrowser(page);

  // Poll until the processed file appears.
  const deadline = Date.now() + 25000;
  let foundCard = null;
  while (Date.now() < deadline) {
    if (producedFilename) {
      const card = browserRoot.locator(`[data-testid="project-card"][data-video-path*="${producedFilename}"]`).first();
      if ((await card.count()) > 0) {
        const filePath = await card.getAttribute("data-video-path");
        if (!filePath) throw new Error("Expected project card data-video-path attribute");
        const mediaRes = await page.request.get(`${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`);
        if (!mediaRes.ok()) throw new Error(`Expected media 200, got ${mediaRes.status()}`);
        foundCard = card;
        console.log(`OK: recording appeared in browser after processing: ${producedFilename}`);
        break;
      }
    }
    await browserRoot.locator('[data-testid="projects-refresh"]').first().click().catch(() => null);
    await page.waitForTimeout(900);
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
  if (!foundCard) {
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

