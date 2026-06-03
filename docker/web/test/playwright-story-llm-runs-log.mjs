/**
 * E2E: Story generator logs Ollama request JSON to runs job log; UI matches persisted log.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { chromium } from "playwright";
import { start } from "../server.js";
import { stableJsonStringify } from "../src/shared/story-llm-request.mjs";
import { openRunsMonitor, waitForNavTabs } from "./playwright-nav.mjs";

async function dismissSessionModalIfOpen(page) {
  const modal = page.locator(".restore-session-modal");
  if ((await modal.count()) > 0) {
    await page.locator(".restore-session-modal button").filter({ hasText: /^Discard$/ }).first().click();
    await modal.waitFor({ state: "hidden", timeout: 10000 });
  }
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-e2e-story-llm-"));
const runsDir = path.join(tmpRoot, "runs");
const framesDir = path.join(tmpRoot, "frames");
const uploadsDir = path.join(tmpRoot, "uploads");
const sequencersDir = path.join(tmpRoot, "sequencers");
fs.mkdirSync(runsDir, { recursive: true });
fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(sequencersDir, { recursive: true });

const gpuPoolPath = path.join(tmpRoot, "gpu-pool.json");
fs.writeFileSync(
  gpuPoolPath,
  JSON.stringify(
    {
      enabled: true,
      strategy: "least_busy",
      nodes: [
        { url: "http://ollama-e2e:11434", name: "ollama-e2e", backend: "ollama", enabled: true, priority: 1, model: "llama3.1:8b" },
      ],
    },
    null,
    2,
  ),
);

const fetchCalls = [];
const originalFetch = global.fetch;
global.fetch = async (url, opts = {}) => {
  fetchCalls.push({ url: String(url), method: opts.method || "GET", body: opts.body || null });
  if (String(url).endsWith("/api/tags")) {
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ models: [{ name: "llama3.1:8b" }] }),
    };
  }
  if (String(url).endsWith("/api/generate")) {
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        response: JSON.stringify({
          theme: "E2E ruins",
          style: "Cinematic",
          summary: "Test flythrough",
          scenes: { "0": "wide shot of ruins", "24": "closer arches", "48": "altar", "72": "finale" },
          motion: { Zoom: "0:(1.0), 96:(1.02)" },
        }),
      }),
    };
  }
  if (originalFetch) return originalFetch(url, opts);
  throw new Error(`Unexpected fetch: ${url}`);
};

const svc = await start({
  port: 0,
  root: tmpRoot,
  runsDir,
  framesDir,
  uploadsDir,
  sequencersDir,
  gpuPoolPath,
  enableMq: false,
  env: {
    ...process.env,
    DEFORA_CI_OFFLINE: "0",
    GITHUB_ACTIONS: "",
  },
});
global.fetch = originalFetch;

const base = `http://127.0.0.1:${svc.port}`;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
  await dismissSessionModalIfOpen(page);
  await waitForNavTabs(page);

  await page.locator('[data-testid="top-nav-tab-prompts"]').click();
  await page.locator("#app .sub-pill").filter({ hasText: /^STORY$/ }).first().click();

  const storyPanel = page.locator("#app").first();
  await storyPanel.locator('[data-testid="story-theme-input"]').first().fill("E2E ruins");
  await storyPanel.locator('[data-testid="story-generate-btn"]').first().click();

  const storyJson = storyPanel.locator('[data-testid="story-llm-request-json"]').first();
  await storyJson.waitFor({ state: "visible", timeout: 20000 });
  const uiStoryJson = ((await storyJson.textContent()) || "").trim();

  await openRunsMonitor(page);
  const runsJson = page.locator('[data-testid="runs-job-log-ollama-json"]').first();
  await runsJson.waitFor({ state: "visible", timeout: 10000 });
  const uiRunsJson = ((await runsJson.textContent()) || "").trim();

  if (uiStoryJson !== uiRunsJson) {
    throw new Error(`UI story JSON does not match runs log JSON.\nstory:\n${uiStoryJson.slice(0, 400)}\nruns:\n${uiRunsJson.slice(0, 400)}`);
  }

  const logRes = await page.request.get(`${base}/api/runs/job-log`);
  const logBody = await logRes.json();
  const storyEntries = (logBody.entries || []).filter((e) => e.kind === "story_llm_request");
  if (!storyEntries.length) throw new Error("No story_llm_request entries in /api/runs/job-log");
  const latest = storyEntries[storyEntries.length - 1];
  const apiJson = stableJsonStringify(latest.ollamaRequest);
  if (apiJson !== uiStoryJson) {
    throw new Error("API persisted ollama JSON does not match story panel UI");
  }
  if (latest.clientRequest.theme !== "E2E ruins") {
    throw new Error(`Expected client theme E2E ruins, got ${latest.clientRequest.theme}`);
  }

  console.log("OK: Story LLM request JSON persisted and matches UI + runs log");
} finally {
  await browser.close();
  await svc.close();
  try {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  } catch (_e) {
    /* ignore */
  }
}
