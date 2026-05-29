/**
 * Playwright E2E: Frame generation pipeline profiling.
 *
 * The server has two parallel paths that bring a new frame to the UI:
 *
 *   PATH A  WebSocket push (fast):
 *     disk write → fs.watch fires → server broadcasts {type:"frame"} → client
 *     mergeFrameThumb() → Vue reactivity → DOM update
 *
 *   PATH B  HTTP poll (backup, 80ms after WS or up to 3 s idle):
 *     disk write → fs.watch updates cache → client polls /api/frames →
 *     mergeFrameThumbs() → Vue reactivity → DOM update
 *
 * Four timestamps per frame:
 *   T0   frame PNG written to disk (test-process Date.now())
 *   T_ws WebSocket "frame" event received in-browser (injected perf listener)
 *   T2   DOM count updated (page.waitForFunction polls .frame-rail__meta)
 *   T_api /api/frames response first includes that frame (route interceptor)
 *
 * Derived metrics:
 *   disk→ws      T_ws  − T0    server fs.watch + WS delivery
 *   ws→dom       T2    − T_ws  Vue reactivity + browser paint after WS
 *   e2e (WS)     T2    − T0    total via fast path
 *   disk→api     T_api − T0    server fs.watch + HTTP response (slower path)
 *   api lag      T_api − T2    how much later the poll fires vs the WS update
 *
 * Run standalone:
 *   node docker/web/test/playwright-frame-pipeline-profile.mjs
 */

import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { start } from "../server.js";
import { clickTab, openLiveFramesPanel, waitForNavTabs } from "./playwright-nav.mjs";

// ── helpers ───────────────────────────────────────────────────────────────────

function tinyPngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/eeo8u8AAAAASUVORK5CYII=",
    "base64",
  );
}

function rpad(s, n) { return String(s).padEnd(n); }
function fmt(ms) {
  if (ms == null) return "—";
  return `${ms}ms`;
}

async function openFramesPanel(page) {
  const drawerToggle = page.locator('[data-testid="bottom-drawer-toggle"]');
  if ((await drawerToggle.count()) > 0) {
    const expanded = await drawerToggle.getAttribute("aria-expanded");
    if (expanded !== "true") await drawerToggle.click();
  }
  await page.locator(".live-top-drawer__tabs .sub-pill").filter({ hasText: /^SYSTEM$/ }).click();
  await page.locator('[data-testid="runs-browser-tab-frames"]').click();
  await page.waitForSelector('[data-testid="runs-browser-frames"]', { timeout: 15_000 });
}

// ── setup ─────────────────────────────────────────────────────────────────────

const FRAMES_TO_TEST = 6;
const FRAME_TIMEOUT_MS = 30_000;

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-frame-profile-"));
const runsDir      = path.join(tmpRoot, "runs");
const framesDir    = path.join(tmpRoot, "frames");
const uploadsDir   = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
for (const d of [runsDir, framesDir, uploadsDir, sequencersDir]) fs.mkdirSync(d, { recursive: true });

const svc  = await start({ port: 0, runsDir, framesDir, uploadsDir, sequencersDir, enableMq: false });
const base = `http://127.0.0.1:${svc.port}`;
const browser = await chromium.launch({ headless: true });

// ── run ───────────────────────────────────────────────────────────────────────

const results = [];

// Per-frame timestamps: populated by the route interceptor
const apiFirstSeenAt = new Map();   // frameName → test-process ms

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ── Inject WS timestamp capture before any page code runs ───────────────
  // We patch WebSocket so every incoming "frame" message is timestamped
  // and stored in window.__wsFrameTimings[frameName] = performanceNow.
  // Using performance.now() (page-local) keeps it high-resolution; we'll
  // correlate it with the page's navigation start to convert to epoch ms.
  await page.addInitScript(() => {
    window.__wsFrameTimings = {}; // frameName -> performance.now() when WS msg arrived

    const OrigWS = window.WebSocket;
    function PatchedWS(...args) {
      const ws = new OrigWS(...args);
      ws.addEventListener("message", (evt) => {
        try {
          const data = JSON.parse(evt.data);
          // handle batched messages (wsMessageBatcher)
          const msgs = Array.isArray(data.messages) ? data.messages : [data];
          for (const msg of msgs) {
            if (msg && msg.type === "frame" && msg.item && msg.item.name) {
              if (!window.__wsFrameTimings[msg.item.name]) {
                window.__wsFrameTimings[msg.item.name] = performance.now();
              }
            }
          }
        } catch (_) {}
      });
      return ws;
    }
    // Copy static props so `new PatchedWS(...)` works correctly
    Object.setPrototypeOf(PatchedWS, OrigWS);
    Object.defineProperty(PatchedWS, "prototype", { value: OrigWS.prototype });
    window.WebSocket = PatchedWS;
  });

  // ── Intercept /api/frames to capture T_api ───────────────────────────────
  await page.route("**/api/frames**", async (route) => {
    const responseAt = Date.now();
    const res = await route.fetch();
    let json;
    try { json = await res.json(); } catch (_) {
      await route.fulfill({ response: res });
      return;
    }
    for (const item of json.items || []) {
      if (item?.name && !apiFirstSeenAt.has(item.name)) {
        apiFirstSeenAt.set(item.name, responseAt);
      }
    }
    await route.fulfill({ response: res, json });
  });

  // ── Load app ─────────────────────────────────────────────────────────────
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60_000 });

  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10_000 });
  }
  await waitForNavTabs(page);

  // Go to LIVE tab and open frames in System → Runs → Frames
  await clickTab(page, "LIVE");

  await openLiveFramesPanel(page);
  await page.waitForTimeout(200);

  // Capture performance.timeOrigin so we can convert WS performance.now() to epoch ms
  const perfOrigin = await page.evaluate(() => performance.timeOrigin);

  // ── Baseline frame count ─────────────────────────────────────────────────
  const initialCount = await page.evaluate(() => {
    const meta = document.querySelector(".frame-rail__meta");
    if (!meta) return 0;
    const m = (meta.textContent || "").match(/(\d+)\s+generated/);
    return m ? parseInt(m[1], 10) : 0;
  });

  // ── Profiling loop ────────────────────────────────────────────────────────
  for (let i = 0; i < FRAMES_TO_TEST; i++) {
    const frameIdx   = initialCount + i;
    const frameName  = `frame_${String(frameIdx).padStart(5, "0")}.png`;
    const frameFile  = path.join(framesDir, frameName);
    const expectedCount = initialCount + i + 1;

    // Clear any pre-existing WS entry for this name (defensive)
    await page.evaluate((name) => { delete window.__wsFrameTimings[name]; }, frameName);

    // ── T0: write frame to disk ───────────────────────────────────────────
    const t0 = Date.now();
    fs.writeFileSync(frameFile, tinyPngBuffer());

    // ── T2: wait for DOM count to reflect new frame ───────────────────────
    // The frame-rail__meta count is updated by either WS push or HTTP poll,
    // whichever fires first (always WS in practice).
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
      { timeout: FRAME_TIMEOUT_MS },
    );
    const t2 = Date.now();

    // Wait long enough for the 80ms scheduleFrameRefresh poll (triggered by WS)
    // and the server response to be intercepted before we read T_api.
    await page.waitForTimeout(300);

    // ── T_ws: look up WS arrival timestamp (browser-side, converted to epoch) ──
    const wsPerfNow = await page.evaluate((name) => window.__wsFrameTimings[name] ?? null, frameName);
    const tWs = wsPerfNow != null ? Math.round(perfOrigin + wsPerfNow) : null;

    // ── T_api: look up HTTP poll timestamp ────────────────────────────────
    const tApi = apiFirstSeenAt.get(frameName) ?? null;

    const diskToWs  = tWs  != null ? tWs  - t0 : null;
    const wsToDom   = tWs  != null ? t2   - tWs : null;
    const e2e       = t2 - t0;
    const diskToApi = tApi != null ? tApi - t0 : null;
    const apiLag    = (tApi != null && tWs != null) ? tApi - tWs : null; // how much later than WS

    results.push({ frame: i + 1, frameName, t0, tWs, t2, tApi, diskToWs, wsToDom, e2e, diskToApi, apiLag });
  }

  // ── Final sanity check ───────────────────────────────────────────────────
  const finalCount = await page.evaluate(() => {
    const meta = document.querySelector(".frame-rail__meta");
    if (!meta) return 0;
    const m = (meta.textContent || "").match(/(\d+)\s+generated/);
    return m ? parseInt(m[1], 10) : 0;
  });
  if (finalCount < FRAMES_TO_TEST) {
    throw new Error(`Expected ≥${FRAMES_TO_TEST} frames in UI, got ${finalCount}`);
  }

  // ── Report ────────────────────────────────────────────────────────────────
  const LINE = "─".repeat(72);

  console.log("\n══ Frame Generation Pipeline Profiling ══════════════════════════════\n");

  // Per-frame detail
  console.log(
    rpad("Frame", 8) +
    rpad("disk→ws", 11) +
    rpad("ws→dom", 10) +
    rpad("e2e (WS)", 12) +
    rpad("disk→api", 11) +
    "api lag vs ws",
  );
  console.log(LINE);
  for (const r of results) {
    console.log(
      rpad(`#${r.frame}`, 8) +
      rpad(fmt(r.diskToWs), 11) +
      rpad(fmt(r.wsToDom), 10) +
      rpad(fmt(r.e2e), 12) +
      rpad(fmt(r.diskToApi), 11) +
      fmt(r.apiLag),
    );
  }

  // Averages
  const hasWs  = results.every((r) => r.diskToWs != null);
  const hasApi = results.every((r) => r.diskToApi != null);

  const avg = (key) => {
    const vals = results.map((r) => r[key]).filter((v) => v != null);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const minv = (key) => {
    const vals = results.map((r) => r[key]).filter((v) => v != null);
    return vals.length ? Math.min(...vals) : null;
  };
  const maxv = (key) => {
    const vals = results.map((r) => r[key]).filter((v) => v != null);
    return vals.length ? Math.max(...vals) : null;
  };

  const avgDiskToWs  = avg("diskToWs");
  const avgWsToDom   = avg("wsToDom");
  const avgE2e       = avg("e2e");
  const avgDiskToApi = avg("diskToApi");
  const avgApiLag    = avg("apiLag");

  console.log(LINE);
  console.log(
    rpad("avg", 8) +
    rpad(fmt(avgDiskToWs), 11) +
    rpad(fmt(avgWsToDom), 10) +
    rpad(fmt(avgE2e), 12) +
    rpad(fmt(avgDiskToApi), 11) +
    fmt(avgApiLag),
  );
  console.log(
    rpad("min", 8) +
    rpad(fmt(minv("diskToWs")), 11) +
    rpad(fmt(minv("wsToDom")), 10) +
    rpad(fmt(minv("e2e")), 12) +
    rpad(fmt(minv("diskToApi")), 11) +
    fmt(minv("apiLag")),
  );
  console.log(
    rpad("max", 8) +
    rpad(fmt(maxv("diskToWs")), 11) +
    rpad(fmt(maxv("wsToDom")), 10) +
    rpad(fmt(maxv("e2e")), 12) +
    rpad(fmt(maxv("diskToApi")), 11) +
    fmt(maxv("apiLag")),
  );

  // Bottleneck breakdown
  console.log("\n── Stage Breakdown (averages) ──────────────────────────────────────\n");

  if (hasWs && avgE2e) {
    const wsPct  = Math.round((avgDiskToWs / avgE2e) * 100);
    const domPct = 100 - wsPct;
    console.log("  WebSocket fast path (primary):");
    console.log(`    disk→ws    ${fmt(avgDiskToWs).padEnd(8)} ${wsPct}%  fs.watch kernel event + WS frame send`);
    console.log(`    ws→dom     ${fmt(avgWsToDom).padEnd(8)} ${domPct}%  Vue mergeFrameThumb + reactivity + browser paint`);
    console.log(`    e2e total  ${fmt(avgE2e)}`);
  }

  if (hasApi) {
    console.log("\n  HTTP poll path (backup, fires ~80 ms after WS):");
    console.log(`    disk→api   ${fmt(avgDiskToApi).padEnd(8)}     fs.watch cache update + route intercept`);
    if (avgApiLag != null) {
      console.log(`    api lag    +${fmt(avgApiLag).padEnd(7)}    how much later than WS push`);
    }
  }

  console.log("\n── Bottleneck Notes ─────────────────────────────────────────────────\n");

  if (avgDiskToWs != null && avgWsToDom != null) {
    if (avgDiskToWs > avgWsToDom) {
      console.log("  Dominant stage: disk→ws (kernel fs.watch + network delivery).");
      console.log("  The server broadcast is the slow step — WS send itself is fast once triggered.");
    } else {
      console.log("  Dominant stage: ws→dom (Vue reactivity / browser paint).");
      console.log("  The WS message arrives quickly; the browser spends more time rendering.");
    }
  }

  if (avgApiLag != null && avgApiLag > 200) {
    console.log(`\n  HTTP poll fires ${fmt(avgApiLag)} after WS — it is a true backup, not on the critical path.`);
  }

  console.log(`\n  To reduce e2e latency further:`);
  console.log(`    • disk→ws is already near-minimal (inotify → WS); little room here.`);
  console.log(`    • ws→dom: avoid deep mergeFrameThumb work; keep thumbs array small.`);
  console.log(`    • HTTP path: lower scheduleFrameRefresh delay (currently 80 ms after WS).`);

  console.log(`\nOK: ${FRAMES_TO_TEST} frames observed in UI — profiling complete.\n`);

} finally {
  await browser.close();
  await svc.close();
  try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_) {}
}
