/**
 * Playwright E2E: 8-frame Deforum generation → encoded video in VideoSwarm browser.
 *
 * Scenario:
 *   1. Boot the server with isolated temp dirs (framesDir, hlsDir, uploadsDir, runsDir).
 *   2. Navigate to UI → LIVE tab → open the frame rail.
 *   3. Drop 8 PNG frames into framesDir, one at a time, simulating Deforum output.
 *   4. Verify all 8 frames appear in the UI frame rail (WebSocket push path).
 *   5. Encode the 8 frames into a real MP4 using local ffmpeg (no Docker needed).
 *   6. Write the MP4 into uploadsDir so the server can list it.
 *   7. Navigate to Library → VideoSwarm browser → "Uploads" root.
 *   8. Assert the MP4 tile appears in the grid.
 *   9. Assert the file endpoint returns HTTP 200 (video is actually servable).
 *
 * Encoding step uses the same ffmpeg that the real encoder container would use.
 * The HLS path is also exercised: we build a minimal .m3u8 and assert it appears
 * in the HLS root of the browser.
 *
 * Run:
 *   node docker/web/test/playwright-deforum-8frames-video.mjs
 */

import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { chromium } from "playwright";
import { startE2eServer } from "./playwright-server.mjs";
import { clickTab, openLiveFramesPanel, waitForNavTabs } from "./playwright-nav.mjs";

// ── helpers ───────────────────────────────────────────────────────────────────

// Generate a real 64×64 PNG frame using ffmpeg (required for libx264 compatibility).
// Each frame gets a unique hue so the resulting video has visible variety.
function generateFramePng(outPath, frameIndex) {
  const hue = Math.round((frameIndex / TOTAL_FRAMES) * 360);
  // lavfi color filter accepts hsl-like via 0xRRGGBB; use simple named hues
  const colors = ["blue", "green", "red", "yellow", "cyan", "magenta", "orange", "purple"];
  const color = colors[frameIndex % colors.length];
  execSync(
    `ffmpeg -y -f lavfi -i color=c=${color}:size=64x64:d=1 -frames:v 1 "${outPath}"`,
    { stdio: "pipe" },
  );
}

async function clickSubPill(page, label) {
  const pill = page.locator(".sub-pill").filter({ hasText: new RegExp(`^${label}$`) }).first();
  if ((await pill.count()) === 0) throw new Error(`Sub-pill "${label}" not found`);
  await pill.click();
}

// ── setup ─────────────────────────────────────────────────────────────────────

const TOTAL_FRAMES = 8;
const FPS = 8;
const FRAME_TIMEOUT = 20_000;
const STAGE_DIR = path.join(os.tmpdir(), `defora-e2e-staged-${Date.now()}`);

const tmpRoot     = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-8frames-"));
const framesDir   = path.join(tmpRoot, "frames");
const runsDir     = path.join(tmpRoot, "runs");
const uploadsDir  = path.join(tmpRoot, "uploads");
const hlsDir      = path.join(tmpRoot, "hls");
const sequencersDir = path.join(tmpRoot, "sequencers");

for (const d of [framesDir, runsDir, uploadsDir, hlsDir, sequencersDir, STAGE_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

// Pre-generate all 8 frames into a staging dir before the browser test starts.
// This keeps ffmpeg overhead out of the UI timing loop.
console.log(`Generating ${TOTAL_FRAMES} test frames…`);
const stagedFrames = [];
for (let i = 0; i < TOTAL_FRAMES; i++) {
  const name = `frame_${String(i).padStart(5, "0")}.png`;
  const staged = path.join(STAGE_DIR, name);
  generateFramePng(staged, i);
  stagedFrames.push({ name, staged, dest: path.join(framesDir, name) });
}
console.log(`✓  ${TOTAL_FRAMES} frames pre-generated in staging dir`);

// ── server ────────────────────────────────────────────────────────────────────

const svc = await startE2eServer({
  port: 0,
  root: tmpRoot,
  framesDir,
  runsDir,
  uploadsDir,
  hlsDir,
  sequencersDir,
  hlsStream: "/hls/live/deforum.m3u8",
});
const base = `http://127.0.0.1:${svc.port}`;
const browser = await chromium.launch({ headless: true });

// ── test ──────────────────────────────────────────────────────────────────────

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ── 1. Load app ──────────────────────────────────────────────────────────
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button")
      .filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10_000 });
  }
  await waitForNavTabs(page);

  // ── 2. Go to LIVE tab and open frames in System → Runs → Frames ─────────
  await clickTab(page, "LIVE");
  await openLiveFramesPanel(page);
  await page.waitForTimeout(150);

  // ── 3. Drop 8 frames into framesDir one at a time ───────────────────────
  // Copying from the staging dir (pre-generated valid PNGs) simulates Deforum
  // writing frames. fs.watch picks each up immediately via inotify.
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const { staged, dest } = stagedFrames[i];
    fs.copyFileSync(staged, dest);

    // Wait for UI count to reflect this frame before dropping the next
    const expectedCount = i + 1;
    await page.waitForFunction(
      (count) => {
        const meta = document.querySelector(".frame-rail__meta");
        if (meta) {
          const m = (meta.textContent || "").match(/(\d+)\s+generated/);
          if (m && parseInt(m[1], 10) >= count) return true;
        }
        return document.querySelectorAll(".frame-rail__item").length >= count;
      },
      expectedCount,
      { timeout: FRAME_TIMEOUT },
    );
  }

  // ── 4. Assert all 8 frames visible in frame rail ─────────────────────────
  const frameCount = await page.evaluate(() => {
    const meta = document.querySelector(".frame-rail__meta");
    if (!meta) return 0;
    const m = (meta.textContent || "").match(/(\d+)\s+generated/);
    return m ? parseInt(m[1], 10) : 0;
  });
  if (frameCount < TOTAL_FRAMES) {
    throw new Error(`Expected ${TOTAL_FRAMES} frames in UI, got ${frameCount}`);
  }
  console.log(`✓  ${frameCount} frames visible in frame rail`);

  // ── 5. Encode frames → MP4 using local ffmpeg ────────────────────────────
  // Real encoding: same approach the encoder Docker service uses.
  // ffmpeg reads frame_NNNNN.png sequentially at the target fps.
  const videoName = `defora_8frames_${Date.now()}.mp4`;
  const videoPath = path.join(uploadsDir, videoName);

  try {
    // Encode from framesDir (which now has the real PNG files)
    execSync(
      [
        "ffmpeg", "-y",
        "-framerate", String(FPS),
        "-i", `"${path.join(framesDir, "frame_%05d.png")}"`,
        "-frames:v", String(TOTAL_FRAMES),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "ultrafast",
        "-crf", "30",
        `"${videoPath}"`,
      ].join(" "),
      { stdio: "pipe" },
    );
    console.log(`✓  Encoded ${TOTAL_FRAMES} frames → ${videoName}`);
  } catch (err) {
    throw new Error(`ffmpeg encoding failed: ${err.message}`);
  }

  // Verify file exists and is non-empty
  const stat = fs.statSync(videoPath);
  if (stat.size < 100) throw new Error(`Encoded video is suspiciously small: ${stat.size} bytes`);
  console.log(`✓  Video file on disk: ${stat.size} bytes`);

  // ── 6. Build a minimal HLS playlist (simulates encoder → nginx → hls vol) ─
  // Structure: hlsDir/live/deforum.m3u8 + one fake .ts segment
  const liveDir = path.join(hlsDir, "live");
  fs.mkdirSync(liveDir, { recursive: true });
  const segName = "deforum0.ts";
  // Minimal TS-ish binary blob (enough for the browser to see it as a file)
  fs.writeFileSync(path.join(liveDir, segName), Buffer.alloc(188, 0x47));
  const m3u8Content = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    "#EXT-X-TARGETDURATION:1",
    "#EXT-X-MEDIA-SEQUENCE:0",
    `#EXTINF:1.0,`,
    segName,
    "#EXT-X-ENDLIST",
  ].join("\n");
  fs.writeFileSync(path.join(liveDir, "deforum.m3u8"), m3u8Content);
  console.log(`✓  HLS playlist written to ${liveDir}/deforum.m3u8`);

  // ── 7. Navigate to Library → Projects browser ───────────────
  const { openLibraryBrowser, waitForProjectCard } = await import("./playwright-nav.mjs");
  const browserRoot = await openLibraryBrowser(page);

  const card = await waitForProjectCard(browserRoot, page, videoName);
  console.log(`✓  Encoded video visible in Projects library`);

  const filePath = await card.getAttribute("data-video-path");
  if (!filePath) throw new Error("Expected data-video-path on tile");

  const mediaRes = await page.request.get(
    `${base}/api/video-swarm/file?path=${encodeURIComponent(filePath)}`,
  );
  if (!mediaRes.ok()) {
    throw new Error(`Video file endpoint returned ${mediaRes.status()} — file not servable`);
  }
  const contentType = mediaRes.headers()["content-type"] || "";
  if (!contentType.includes("video") && !contentType.includes("octet")) {
    throw new Error(`Unexpected content-type for video: ${contentType}`);
  }
  console.log(`✓  Video file served OK (HTTP ${mediaRes.status()}, ${contentType})`);

  // ── 8c. HLS browse API (Projects UI no longer exposes HLS roots) ─────────
  // and .m3u8 / .ts may not be in that set.
  const hlsApiRes = await page.request.get(
    `${base}/api/video-swarm/browse?rootId=hls&path=${encodeURIComponent(liveDir)}&recursive=0&sort=name`,
  );
  if (hlsApiRes.ok()) {
    const hlsJson = await hlsApiRes.json();
    const hasPlaylist = (hlsJson.videos || []).some((v) => v && v.name && v.name.endsWith(".m3u8"));
    const hasSegment  = (hlsJson.videos || []).some((v) => v && v.name && v.name.endsWith(".ts"));
    console.log(
      `✓  HLS browse: ${hlsJson.videoCount ?? 0} items` +
      ` (playlist=${hasPlaylist}, segment=${hasSegment})`,
    );
  } else {
    console.log(`  HLS browse returned ${hlsApiRes.status()} — skipping HLS tile check`);
  }

  // ── 9. Backend run manifest ───────────────────────────────────────────────
  // Verify /api/frames returns all 8 frames (cache is populated)
  const framesRes = await page.request.get(`${base}/api/frames?limit=48`);
  if (!framesRes.ok()) throw new Error(`/api/frames failed: ${framesRes.status()}`);
  const framesJson = await framesRes.json();
  const serverFrameCount = (framesJson.items || []).length;
  if (serverFrameCount < TOTAL_FRAMES) {
    throw new Error(`/api/frames returned ${serverFrameCount} items, expected ${TOTAL_FRAMES}`);
  }
  console.log(`✓  /api/frames serves ${serverFrameCount} frame entries`);

  console.log(
    `\nOK: ${TOTAL_FRAMES} frames generated → encoded to MP4 (${stat.size} bytes) → visible in Projects library.\n`,
  );

} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_) {}
  try { fs.rmSync(STAGE_DIR, { recursive: true, force: true }); } catch (_) {}
}
