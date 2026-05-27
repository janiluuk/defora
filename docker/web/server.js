#!/usr/bin/env node
const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const WebSocket = require("ws");
const amqp = require("amqplib");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");
const { createGpuPool } = require("./modules/gpu-pool");

async function start(opts = {}) {
  const port = opts.port ?? process.env.PORT ?? 3000;
  const rabbitUrl = opts.rabbitUrl || process.env.RABBIT_URL || "amqp://localhost";
  const controlToken = opts.controlToken ?? process.env.CONTROL_TOKEN ?? "";
  const queue = opts.queue || process.env.CONTROL_QUEUE || "controls";
  const framesDir =
    opts.framesDir ||
    process.env.FRAMES_DIR ||
    path.join(__dirname, "frames");
  const hlsStream = opts.hlsStream || process.env.HLS_STREAM || "/hls/live/deforum.m3u8";
  const hlsDir =
    opts.hlsDir ||
    process.env.HLS_DIR ||
    path.join(__dirname, "hls");
  const enableMq = opts.enableMq ?? (process.env.DISABLE_MQ ? false : true);
   const spawner = opts.spawner || spawn;

  const playlistPath = path.join(hlsDir, hlsStream.replace(/^\/hls\//, ""));

  // Track API availability status
  const apiStatus = {
    sdForgeAvailable: false,
    lastChecked: null,
    forgeCacheValidUntil: 0,
    loraCacheValidUntil: 0,
    controlNetModels: null,
    loraModels: null,
    sdModels: null,
    currentModel: null,
  };
  const txt2imgBypassUntil = new Map();
  const TXT2IMG_BYPASS_MS = 2 * 60 * 1000;

  const repoRoot = path.resolve(__dirname, "..", "..");
  const aiInvokeScript = path.join(__dirname, "scripts", "ai_invoke.py");

  function invokeAi(op, payload) {
    return new Promise((resolve, reject) => {
      const req = JSON.stringify({ op, ...payload });
      const child = spawner("python3", [aiInvokeScript], {
        cwd: repoRoot,
        env: { ...process.env, PYTHONPATH: repoRoot },
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d) => { stdout += d; });
      child.stderr.on("data", (d) => { stderr += d; });
      child.on("error", reject);
      child.on("close", (code) => {
        if (code !== 0) {
          return reject(new Error(stderr || stdout || `ai_invoke exit ${code}`));
        }
        try {
          resolve(stdout.trim() ? JSON.parse(stdout) : null);
        } catch (e) {
          reject(new Error(`ai_invoke invalid JSON: ${stdout.slice(0, 200)}`));
        }
      });
      child.stdin.write(req);
      child.stdin.end();
    });
  }

  function stripCodeFence(text) {
    const raw = String(text || "").trim();
    if (!raw.startsWith("```")) return raw;
    return raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  function parseLooseJson(text) {
    const raw = stripCodeFence(text);
    if (!raw) throw new Error("empty JSON response");
    try {
      return JSON.parse(raw);
    } catch (_err) {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start >= 0 && end > start) {
        return JSON.parse(raw.slice(start, end + 1));
      }
      throw new Error(`invalid JSON payload: ${raw.slice(0, 240)}`);
    }
  }

  function fallbackStoryScene(theme, style, idx, total) {
    const phase =
      idx === 0
        ? "opening"
        : idx >= total - 1
          ? "closing"
          : idx < Math.ceil(total / 2)
            ? "buildup"
            : "climax";
    return `${style}, ${phase} scene from ${theme}, cinematic composition, detailed atmosphere, coherent character continuity`;
  }

  function normalizeStoryScenes(sceneMap, { theme, style, numScenes, frameStarts }) {
    const input = sceneMap && typeof sceneMap === "object" ? sceneMap : {};
    const scenes = {};
    frameStarts.forEach((frame, idx) => {
      const prompt =
        input[String(frame)] ||
        input[frame] ||
        input[String(idx)] ||
        input[idx] ||
        fallbackStoryScene(theme, style, idx, numScenes);
      scenes[String(frame)] = String(prompt || fallbackStoryScene(theme, style, idx, numScenes)).trim();
    });
    return scenes;
  }

  function normalizeStoryMotion(motion, totalFrames) {
    const cleaned = {};
    if (motion && typeof motion === "object" && !Array.isArray(motion)) {
      Object.entries(motion).forEach(([key, value]) => {
        if (!key || value == null) return;
        const normalized = String(value).trim();
        if (normalized) cleaned[String(key)] = normalized;
      });
    }
    if (!Object.keys(cleaned).length) {
      cleaned.Zoom = `0:(1.0025), ${Math.max(totalFrames - 1, 1)}:(1.0)`;
    }
    return cleaned;
  }

  function formatStoryResult(result) {
    const lines = [
      `Theme: ${result.theme}`,
      `Style: ${result.style}`,
      `Resolution: ${result.width}x${result.height}`,
      `FPS: ${result.fps}`,
      `Total frames: ${result.totalFrames}`,
      "",
      JSON.stringify(result.scenes, null, 2),
      "",
      "Motion Settings:",
    ];
    Object.entries(result.motion || {}).forEach(([key, value]) => lines.push(`${key}: ${value}`));
    return lines.join("\n");
  }

  async function generateStoryWithOllama(body = {}) {
    const theme = String(body.theme || "").trim() || "Cinematic visual journey";
    const style = String(body.style || "Masterpiece, Realistic").trim() || "Masterpiece, Realistic";
    const width = Math.max(64, parseInt(body.width, 10) || 1024);
    const height = Math.max(64, parseInt(body.height, 10) || 576);
    const fps = Math.max(1, parseInt(body.fps, 10) || 24);
    const totalFrames = Math.max(8, parseInt(body.totalFrames, 10) || 96);
    const numScenes = Math.max(2, parseInt(body.numScenes, 10) || 4);
    const framesPerScene = Math.max(1, Math.floor(totalFrames / numScenes));
    const frameStarts = Array.from({ length: numScenes }, (_, idx) => idx * framesPerScene);
    const target = gpuPool.resolveOllamaTarget({ body });
    try {
      let model = body.model || target.node?.model || target.model || process.env.OLLAMA_MODEL || "";
      if (!model) {
        const models = await gpuPool.listOllamaModels(target.url);
        model = models[0]?.name || "";
        if (target.node && model) target.node.model = model;
      }
      if (!model) {
        throw new Error("No Ollama model configured. Add an Ollama node and choose a model in the GPU pool.");
      }
      if (target.node) {
        target.node.model = model;
        target.node.currentModel = model;
      }
      const prompt = [
        "Create a Deforum-ready story plan as JSON only.",
        `Theme: ${theme}`,
        `Style: ${style}`,
        `Canvas: ${width}x${height}`,
        `FPS: ${fps}`,
        `Total frames: ${totalFrames}`,
        `Scenes: ${numScenes}`,
        `Frame starts: ${frameStarts.join(", ")}`,
        "Return an object with keys: theme, style, summary, scenes, motion.",
        `The "scenes" object must contain exactly these frame keys: ${frameStarts.join(", ")}.`,
        "Each scene value should be a concise SD/Deforum prompt fragment with continuity across scenes.",
        'The "motion" object should include a few useful Deforum schedules like Zoom, Translation X, Translation Y, Rotation Z, or Transform Center X/Y when appropriate.',
        "Values in motion must be schedule strings such as 0:(1.0), 24:(1.02), 96:(1.0).",
        "Do not include markdown or code fences.",
      ].join("\n");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      let response;
      try {
        response = await fetch(`${target.url}/api/generate`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            model,
            stream: false,
            format: "json",
            options: { temperature: 0.7 },
            prompt,
            system:
              "You are a cinematic prompt planner for Deforum animations. Respond with valid JSON only and keep prompts production-ready.",
          }),
        });
      } finally {
        clearTimeout(timer);
      }
      const rawText = await response.text();
      let payload = {};
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch (_err) {
        payload = { response: rawText };
      }
      if (!response.ok) {
        throw new Error(payload?.error || `Ollama generate failed (${response.status})`);
      }
      const parsed = parseLooseJson(payload?.response || payload?.message?.content || "");
      const result = {
        theme: String(parsed.theme || theme),
        style: String(parsed.style || style),
        width,
        height,
        fps,
        totalFrames,
        numScenes,
        summary: String(parsed.summary || ""),
        scenes: normalizeStoryScenes(parsed.scenes, { theme, style, numScenes, frameStarts }),
        motion: normalizeStoryMotion(parsed.motion, totalFrames),
        source: {
          backend: "ollama",
          url: target.url,
          model,
          node: target.node ? { id: target.node.id, name: target.node.name, url: target.node.url } : null,
        },
      };
      result.formatted = formatStoryResult(result);
      return result;
    } finally {
      target.release();
    }
  }

  let framesIndexCache = { items: [], builtAt: 0, dirMtime: 0 };
  const FRAMES_INDEX_MIN_ITEMS = 50;
  const FRAME_FILE_RE = /^frame_(\d+)\.(png|jpg|jpeg|webp)$/i;

  function updateFramesIndexCache(item, maxItems = FRAMES_INDEX_MIN_ITEMS) {
    if (!item || !item.name) return;
    const current = Array.isArray(framesIndexCache.items) ? framesIndexCache.items : [];
    const filtered = current.filter((entry) => entry.name !== item.name);
    filtered.unshift(item);
    filtered.sort((a, b) => {
      if (Number.isFinite(a.frame) && Number.isFinite(b.frame) && a.frame !== b.frame) {
        return b.frame - a.frame;
      }
      return (b.mtime || 0) - (a.mtime || 0);
    });
    framesIndexCache.items = filtered.slice(0, Math.max(maxItems, FRAMES_INDEX_MIN_ITEMS));
    framesIndexCache.builtAt = Date.now();
  }

  async function buildFramesIndex(limit = 50) {
    let dirMtime = 0;
    try {
      const st = await fsp.stat(framesDir);
      dirMtime = st.mtimeMs;
    } catch (e) {
      if (e.code === "ENOENT") return [];
      throw e;
    }
    if (framesIndexCache.builtAt && framesIndexCache.dirMtime === dirMtime) {
      return framesIndexCache.items.slice(0, limit);
    }
    const maxItems = Math.max(limit, FRAMES_INDEX_MIN_ITEMS);
    const topFrames = [];
    const pushCandidate = (candidate) => {
      if (!candidate) return;
      const minFrame = topFrames.length ? topFrames[topFrames.length - 1].frame : -1;
      if (topFrames.length >= maxItems && candidate.frame <= minFrame) return;
      topFrames.push(candidate);
      topFrames.sort((a, b) => b.frame - a.frame);
      if (topFrames.length > maxItems) topFrames.length = maxItems;
    };

    const dir = await fsp.opendir(framesDir);
    try {
      for await (const entry of dir) {
        if (!entry.isFile()) continue;
        const match = FRAME_FILE_RE.exec(entry.name);
        if (!match) continue;
        pushCandidate({ name: entry.name, frame: parseInt(match[1], 10) });
      }
    } finally {
      await dir.close().catch(() => {});
    }

    const items = await Promise.all(
      topFrames.map(async (candidate) => {
        const filePath = path.join(framesDir, candidate.name);
        let mtime = 0;
        try {
          const stat = await fsp.stat(filePath);
          mtime = stat.mtimeMs;
        } catch (_e) {
          /* ignore files that vanished between directory scan and stat */
        }
        return {
          src: `/frames/${candidate.name}?v=${mtime || Date.now()}`,
          name: candidate.name,
          frame: candidate.frame,
          mtime,
        };
      })
    );

    items.sort((a, b) => {
      if ((b.mtime || 0) !== (a.mtime || 0)) return (b.mtime || 0) - (a.mtime || 0);
      return (b.frame || 0) - (a.frame || 0);
    });
    framesIndexCache = { items, builtAt: Date.now(), dirMtime };
    return items.slice(0, limit);
  }

  const gpuPool = createGpuPool({
    configPath: opts.gpuPoolPath || path.join(__dirname, "gpu-pool.json"),
    env: process.env,
  });
  await gpuPool.init();

  function forgeTarget(req, options = {}) {
    return gpuPool.resolveForgeTarget(req, options);
  }

  function forgeBaseUrl(req) {
    return forgeTarget(req).url;
  }

  function writableForgeTargets() {
    const nodes = Array.isArray(gpuPool.state?.nodes)
      ? gpuPool.state.nodes.filter((node) => node.enabled && node.backend === "sd-forge")
      : [];
    if (gpuPool.state?.enabled && nodes.length) {
      return nodes.map((node) => ({ url: node.url, node }));
    }
    const host = process.env.SD_FORGE_HOST || "192.168.2.101";
    const port = process.env.SD_FORGE_PORT || "7860";
    return [{ url: `http://${host}:${port}`, node: null }];
  }

  async function postForgeOptionsToTarget(target, updates, timeoutMs) {
    if (typeof fetch === "undefined") {
      throw new Error("fetch not available");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${target.url}/sdapi/v1/options`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }
      return {
        ok: true,
        url: target.url,
        node: target.node ? { name: target.node.name, id: target.node.id } : null,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async function applyForgeOptionsAcrossTargets(updates, timeoutMs = 10000) {
    const targets = writableForgeTargets();
    const results = await Promise.all(
      targets.map(async (target) => {
        const t0 = Date.now();
        const paths = Object.keys(updates).slice(0, 3).join(",");
        try {
          const result = await postForgeOptionsToTarget(target, updates, timeoutMs);
          if (target.node) {
            gpuPool.logNodeRequest(target.node.id, { type: "options", path: `/sdapi/v1/options [${paths}]`, statusCode: 200, durationMs: Date.now() - t0, ok: true });
          }
          return result;
        } catch (err) {
          if (target.node) {
            gpuPool.logNodeRequest(target.node.id, { type: "options", path: `/sdapi/v1/options [${paths}]`, durationMs: Date.now() - t0, ok: false, error: err.message });
          }
          return {
            ok: false,
            url: target.url,
            node: target.node ? { name: target.node.name, id: target.node.id } : null,
            error: err.message,
          };
        }
      })
    );
    const successes = results.filter((result) => result.ok);
    const failures = results.filter((result) => !result.ok);
    if (!successes.length) {
      throw new Error(failures[0]?.error || "No Forge nodes accepted the update");
    }
    return {
      success: true,
      partial: failures.length > 0,
      results,
      successes: successes.length,
      failures: failures.length,
    };
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function latestFrameInfo() {
    const items = await buildFramesIndex(1);
    return items[0] || null;
  }

  async function latestFramePath() {
    const top = await latestFrameInfo();
    if (!top) return null;
    return top.src || `/frames/${top.name}`;
  }

  function txt2imgBypassKey(target) {
    return target?.node?.id || target?.url || "";
  }

  function shouldBypassTxt2img(target) {
    const key = txt2imgBypassKey(target);
    if (!key) return false;
    const until = txt2imgBypassUntil.get(key) || 0;
    if (until <= Date.now()) {
      txt2imgBypassUntil.delete(key);
      return false;
    }
    return true;
  }

  function recordTxt2imgFailure(target) {
    const key = txt2imgBypassKey(target);
    if (!key) return;
    txt2imgBypassUntil.set(key, Date.now() + TXT2IMG_BYPASS_MS);
  }

  function clearTxt2imgFailure(target) {
    const key = txt2imgBypassKey(target);
    if (!key) return;
    txt2imgBypassUntil.delete(key);
  }

  function buildTxt2imgFallbackSettings(body, payload) {
    const base = body && typeof body.settings === "object"
      ? JSON.parse(JSON.stringify(body.settings))
      : null;
    if (!base) return null;

    const prompts = Array.isArray(base.prompts) ? [...base.prompts] : [];
    prompts[0] = payload.prompt || prompts[0] || "Preview frame";
    base.prompts = prompts;
    base.negative_prompts = payload.negative_prompt || base.negative_prompts || "";
    base.W = payload.width;
    base.H = payload.height;
    base.steps = payload.steps;
    base.seed = payload.seed;
    base.sampler = payload.sampler_name;
    return base;
  }

  async function renderDeforumPreview(settings, target, optionsOverrides = {}) {
    const forgeUrl = target.url;
    const baselineFrame = await latestFrameInfo();
    const previewSettings = {
      ...settings,
      max_frames: 1,
      motion_preview_mode: true,
      skip_video_creation: true,
    };
    const payload = { deforum_settings: previewSettings, options_overrides: optionsOverrides || {} };

    if (typeof fetch === "undefined") {
      const err = new Error("fetch not available in this Node build");
      err.status = 500;
      throw err;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const t0 = Date.now();
    let response;
    try {
      response = await fetch(`${forgeUrl}/deforum_api/batches`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const genDuration = Date.now() - t0;
    if (target.node) {
      gpuPool.logNodeRequest(target.node.id, { type: "generate", path: "/deforum_api/batches", statusCode: response.status, durationMs: genDuration, ok: response.ok || response.status === 202 });
    }
    if (response.status !== 202 && !response.ok) {
      const text = await response.text();
      const err = new Error("Deforum batch submit failed");
      err.status = response.status;
      err.detail = text.slice(0, 500);
      throw err;
    }
    const data = await response.json();
    const batchId = data.batch_id;
    if (!batchId) {
      const framePath = await latestFramePath();
      if (framePath) {
        return { ok: true, path: framePath, batch: data, node: target.node ? { name: target.node.name, url: target.node.url } : null };
      }
      const err = new Error("Deforum returned no batch_id");
      err.raw = data;
      throw err;
    }

    let status = "pending";
    for (let i = 0; i < 120; i++) {
      const framePollMs = i < 20 ? 150 : (i < 60 ? 250 : 400);
      await sleep(framePollMs);
      const frame = await latestFrameInfo();
      if (frame && (!baselineFrame || frame.mtime > baselineFrame.mtime || frame.name !== baselineFrame.name)) {
        return {
          ok: true,
          path: frame.src || `/frames/${frame.name}`,
          batchId,
          status: "frame_ready",
          node: target.node ? { name: target.node.name, url: target.node.url } : null,
        };
      }

      if ((i < 20 && i % 2 === 0) || (i >= 20 && i % 4 === 0)) {
        const pollCtrl = new AbortController();
        const pollTimeout = setTimeout(() => pollCtrl.abort(), 15000);
        let sresp;
        try {
          sresp = await fetch(`${forgeUrl}/deforum_api/batches/${batchId}`, {
            signal: pollCtrl.signal,
          });
        } finally {
          clearTimeout(pollTimeout);
        }
        if (!sresp.ok) continue;
        const sdata = await sresp.json();
        status = sdata.status || sdata.state || status;
        if (["completed", "failed", "cancelled", "canceled", "done"].includes(String(status).toLowerCase())) {
          if (String(status).toLowerCase() === "failed") {
            const err = new Error("Deforum preview failed");
            err.batch = sdata;
            throw err;
          }
          break;
        }
      }
    }

    const framePath = await latestFramePath();
    if (!framePath) {
      const err = new Error("Deforum finished but no frame found in frames dir");
      err.batchId = batchId;
      err.previewStatus = status;
      throw err;
    }
    return {
      ok: true,
      path: framePath,
      batchId,
      status,
      node: target.node ? { name: target.node.name, url: target.node.url } : null,
    };
  }

  /** Lightweight SD-Forge reachability check (updates apiStatus). */
  async function probeSdForge() {
    if (typeof fetch === "undefined") return;
    const target = forgeTarget({});
    const forgeUrl = target.url;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${forgeUrl}/sdapi/v1/options`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);
      apiStatus.sdForgeAvailable = response.ok;
      apiStatus.lastChecked = new Date().toISOString();
    } catch (_e) {
      apiStatus.sdForgeAvailable = false;
      apiStatus.lastChecked = new Date().toISOString();
    } finally {
      target.release();
    }
  }

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use("/frames", express.static(framesDir, { maxAge: "30s" }));
  
  // Serve static files from public directory
  const publicDir = opts.publicDir || process.env.PUBLIC_DIR || path.join(__dirname, "public");
  app.use(express.static(publicDir));

  // Simple health check endpoint for Docker healthcheck
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/api/health", async (_req, res) => {
    try {
      const stat = await fsp.stat(playlistPath);
      res.json({ ok: true, stream: hlsStream, updated: stat.mtimeMs });
    } catch (_e) {
      res.json({ ok: true, stream: hlsStream, updated: null });
    }
  });
  
  // Streaming API endpoints
  app.post("/api/stream/start", async (req, res) => {
    const { target, fps, resolution, protocol, overlay, transition } = req.body || {};
    if (!target) {
      return res.status(400).json({ error: "target URL required" });
    }
    try {
      const framesDir = process.env.FRAMES_DIR || path.join(__dirname, "frames");
      const cmd = ["python3", "-m", "defora_cli.stream_helper", "start", 
                   "--source", framesDir, "--target", target,
                   "--fps", String(fps || 24)];
      if (resolution) cmd.push("--resolution", resolution);
      if (protocol) cmd.push("--protocol", protocol);
      if (overlay) cmd.push("--overlay", overlay);
      if (transition) cmd.push("--transition", transition);
      
      const { exec } = require('child_process');
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/stream/stop", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.stream_helper stop", (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/stream/status", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.stream_helper status", (error, stdout, stderr) => {
        res.json({ 
          status: error ? "stopped" : "running",
          output: stdout,
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/stream/record", async (req, res) => {
    const { output, fps, resolution, codec, quality } = req.body || {};
    if (!output) {
      return res.status(400).json({ error: "output path required" });
    }
    try {
      const framesDir = process.env.FRAMES_DIR || path.join(__dirname, "frames");
      const cmd = ["python3", "-m", "defora_cli.stream_helper", "record",
                   "--source", framesDir, "--output", output,
                   "--fps", String(fps || 24)];
      if (resolution) cmd.push("--resolution", resolution);
      if (codec) cmd.push("--codec", codec);
      if (quality) cmd.push("--quality", quality);
      
      const { exec } = require('child_process');
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/stream/stop-record", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.stream_helper stop-record", (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/stream/record-status", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.stream_helper record-status", (error, stdout, stderr) => {
        res.json({
          status: error ? "stopped" : "recording",
          output: stdout,
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // API status endpoint for model availability
  app.get("/api/status", (_req, res) => {
    const sdForgePollMs = parseInt(process.env.SD_FORGE_POLL_MS || "0", 10);
    res.json({
      sdForge: {
        available: apiStatus.sdForgeAvailable,
        lastChecked: apiStatus.lastChecked,
        pollIntervalMs: Number.isFinite(sdForgePollMs) && sdForgePollMs > 0 ? sdForgePollMs : 0,
      },
      models: {
        controlNet: apiStatus.controlNetModels !== null ? 'cached' : 'not-loaded',
        lora: apiStatus.loraModels !== null ? 'cached' : 'not-loaded',
      }
    });
  });

  app.get("/api/frames", async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 12));
      const items = await buildFramesIndex(limit);
      res.json({ items });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.json({ items: [] });
      } else {
        console.error("[api] frames error", err);
        res.status(500).json({ error: "frames unavailable" });
      }
    }
  });

  app.post("/api/audio-map", async (req, res) => {
    const body = req.body || {};
    const audioPath = body.audioPath;
    if (!audioPath) {
      return res.status(400).json({ error: "audioPath required" });
    }
    const fps = parseInt(body.fps, 10) || 24;
    const live = !!body.live;
    const mediatorHost = body.mediatorHost || process.env.DEF_MEDIATOR_HOST || "localhost";
    const mediatorPort = body.mediatorPort || process.env.DEF_MEDIATOR_PORT || "8766";
    const mappings = Array.isArray(body.mappings) ? body.mappings : [];
    let mappingArg;
    try {
      mappingArg = JSON.stringify(
        mappings.map((m) => ({
          param: m.param,
          freq_min: Number(m.freq_min),
          freq_max: Number(m.freq_max),
          out_min: Number(m.out_min ?? 0),
          out_max: Number(m.out_max ?? 1),
        }))
      );
    } catch (err) {
      return res.status(400).json({ error: "invalid mappings" });
    }
    const args = ["-m", "defora_cli.audio_reactive_modulator", "--audio", audioPath, "--fps", String(fps)];
    if (mappingArg) {
      args.push("--mapping", mappingArg);
    }
    if (body.output) {
      args.push("--output", body.output);
    }
    if (live) {
      args.push("--live", "--mediator-host", mediatorHost, "--mediator-port", String(mediatorPort));
    }
    const child = spawner("python3", args, { stdio: ["ignore", "pipe", "pipe"] });
    if (!child || typeof child.on !== "function") {
      return res.status(500).json({ error: "could not start audio processor" });
    }
    let stdout = "";
    let stderr = "";
    if (child.stdout && child.stdout.on) {
      child.stdout.on("data", (d) => (stdout += d.toString()));
    }
    if (child.stderr && child.stderr.on) {
      child.stderr.on("data", (d) => (stderr += d.toString()));
    }
    child.on("error", (err) => {
      res.status(500).json({ error: String(err) });
    });
    child.on("close", (code) => {
      res.json({ ok: code === 0, code, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });

  // Preset management API
  const presetsDir = opts.presetsDir || process.env.PRESETS_DIR || path.join(__dirname, "presets");
  const sequencersDir =
    opts.sequencersDir || process.env.SEQUENCER_DIR || path.join(__dirname, "sequencers");
  const uploadsDir = opts.uploadsDir || process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
  const pluginsDir = opts.pluginsDir || process.env.PLUGINS_DIR || path.join(__dirname, "plugins");
  const uploadRetentionHours = parseInt(process.env.UPLOAD_RETENTION_HOURS || "24", 10);
  
  try {
    await fsp.mkdir(presetsDir, { recursive: true });
  } catch (_e) {}
  try {
    await fsp.mkdir(sequencersDir, { recursive: true });
  } catch (_e) {}
  try {
    await fsp.mkdir(uploadsDir, { recursive: true });
  } catch (_e) {}
  try {
    await fsp.mkdir(pluginsDir, { recursive: true });
  } catch (_e) {}

  app.use("/uploads", express.static(uploadsDir, { maxAge: "60s" }));

  const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".mkv", ".m4v", ".avi"]);

  function videoSwarmRoots() {
    return [
      { id: "frames", label: "Frames", path: framesDir },
      { id: "uploads", label: "Uploads", path: uploadsDir },
      { id: "hls", label: "HLS", path: hlsDir },
    ];
  }

  function resolveVideoSwarmPath(inputPath, rootId) {
    const roots = videoSwarmRoots();
    const root = rootId ? roots.find((r) => r.id === rootId) : roots[0];
    if (!root) return null;
    const raw = String(inputPath || "").trim();
    if (!raw) return path.resolve(root.path);
    const resolved = path.resolve(root.path, raw.replace(/^\/+/, ""));
    const allowed = roots.some((r) => {
      const rootResolved = path.resolve(r.path);
      return resolved === rootResolved || resolved.startsWith(rootResolved + path.sep);
    });
    if (!allowed) return null;
    return resolved;
  }

  async function browseVideoSwarm(targetPath, { recursive = false, sortKey = "name" } = {}) {
    const st = await fsp.stat(targetPath);
    if (!st.isDirectory()) {
      const err = new Error("not a directory");
      err.code = "ENOTDIR";
      throw err;
    }
    const entries = await fsp.readdir(targetPath, { withFileTypes: true });
    const parent = path.dirname(targetPath);
    const roots = videoSwarmRoots();
    const atRoot = roots.some((r) => path.resolve(r.path) === path.resolve(targetPath));
    const videos = [];
    const walk = async (dir) => {
      const items = await fsp.readdir(dir, { withFileTypes: true });
      for (const ent of items) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          if (recursive) await walk(full);
          continue;
        }
        if (!ent.isFile()) continue;
        const ext = path.extname(ent.name).toLowerCase();
        if (!VIDEO_EXT.has(ext)) continue;
        const fst = await fsp.stat(full);
        const root = roots.find((r) => full.startsWith(path.resolve(r.path) + path.sep) || full === path.resolve(r.path));
        videos.push({
          name: ent.name,
          path: full,
          rootId: root ? root.id : "",
          size: fst.size,
          mtimeMs: fst.mtimeMs,
        });
      }
    };
    if (recursive) {
      await walk(targetPath);
    } else {
      for (const ent of entries) {
        if (!ent.isFile()) continue;
        const ext = path.extname(ent.name).toLowerCase();
        if (!VIDEO_EXT.has(ext)) continue;
        const full = path.join(targetPath, ent.name);
        const fst = await fsp.stat(full);
        const root = roots.find((r) => full.startsWith(path.resolve(r.path) + path.sep) || full === path.resolve(r.path));
        videos.push({
          name: ent.name,
          path: full,
          rootId: root ? root.id : "",
          size: fst.size,
          mtimeMs: fst.mtimeMs,
        });
      }
    }
    const sortFn = {
      name: (a, b) => a.name.localeCompare(b.name),
      date: (a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0),
      size: (a, b) => (b.size || 0) - (a.size || 0),
    }[sortKey] || ((a, b) => a.name.localeCompare(b.name));
    videos.sort(sortFn);
    return {
      path: targetPath,
      parent: atRoot ? "" : parent,
      videos,
      videoCount: videos.length,
    };
  }

  app.get("/api/video-swarm/roots", (_req, res) => {
    res.json({ roots: videoSwarmRoots().map(({ id, label, path: p }) => ({ id, label, path: p })) });
  });

  app.get("/api/video-swarm/browse", async (req, res) => {
    try {
      const rootId = String(req.query.rootId || "").trim();
      const browsePath = resolveVideoSwarmPath(String(req.query.path || ""), rootId || "frames");
      if (!browsePath) return res.status(400).json({ error: "invalid path" });
      const recursive = String(req.query.recursive || "") === "1" || req.query.recursive === "true";
      const sortKey = ["name", "date", "size"].includes(String(req.query.sort || "")) ? String(req.query.sort) : "name";
      const data = await browseVideoSwarm(browsePath, { recursive, sortKey });
      res.json(data);
    } catch (err) {
      if (err.code === "ENOENT") return res.status(404).json({ error: "path not found" });
      console.error("[api] video-swarm browse", err);
      res.status(500).json({ error: err.message || "browse failed" });
    }
  });

  app.get("/api/video-swarm/file", async (req, res) => {
    try {
      const filePath = resolveVideoSwarmPath(String(req.query.path || ""), String(req.query.rootId || "").trim() || null);
      if (!filePath) return res.status(400).json({ error: "invalid path" });
      const st = await fsp.stat(filePath);
      if (!st.isFile()) return res.status(404).json({ error: "not a file" });
      const ext = path.extname(filePath).toLowerCase();
      const type =
        ext === ".webm" ? "video/webm"
          : ext === ".mov" ? "video/quicktime"
            : "video/mp4";
      res.type(type);
      res.sendFile(filePath);
    } catch (err) {
      if (err.code === "ENOENT") return res.status(404).json({ error: "file not found" });
      res.status(500).json({ error: err.message || "file unavailable" });
    }
  });

  const SEQUENCER_EASING = new Set(["linear", "easeIn", "easeOut", "easeInOut"]);

  function validateTimeline(body) {
    if (!body || typeof body !== "object") return "invalid body";
    if (body.version !== 1) return "version must be 1";
    if (typeof body.durationSec !== "number" || body.durationSec <= 0 || body.durationSec > 3600) {
      return "durationSec must be between 0 and 3600";
    }
    if (typeof body.fps !== "number" || body.fps < 1 || body.fps > 120) return "fps must be 1–120";
    if (!Array.isArray(body.tracks)) return "tracks must be an array";
    for (const tr of body.tracks) {
      if (!tr || typeof tr !== "object") return "invalid track";
      if (typeof tr.param !== "string" || !/^[\w.]+$/.test(tr.param)) return "invalid track.param";
      if (!Array.isArray(tr.keyframes)) return "keyframes must be an array";
      for (const kf of tr.keyframes) {
        if (!kf || typeof kf !== "object") return "invalid keyframe";
        if (typeof kf.t !== "number" || typeof kf.v !== "number") return "keyframe requires numeric t and v";
        if (kf.t < 0 || kf.t > body.durationSec) return "keyframe t outside 0..durationSec";
        if (kf.easing != null) {
          if (typeof kf.easing !== "string" || !SEQUENCER_EASING.has(kf.easing)) {
            return "invalid keyframe.easing (use linear|easeIn|easeOut|easeInOut)";
          }
        }
      }
    }
    if (body.markers != null) {
      if (!Array.isArray(body.markers)) return "markers must be an array";
      if (body.markers.length > 64) return "too many markers (max 64)";
      const markerNameOk = /^[a-zA-Z0-9_ \-.]{1,48}$/;
      for (const mk of body.markers) {
        if (!mk || typeof mk !== "object") return "invalid marker";
        if (typeof mk.t !== "number" || typeof mk.name !== "string") return "marker requires numeric t and string name";
        if (mk.t < 0 || mk.t > body.durationSec) return "marker t outside 0..durationSec";
        const nm = mk.name.trim();
        if (!markerNameOk.test(nm)) return "invalid marker.name (1–48 chars: letters, digits, space, _ - .)";
      }
    }
    return null;
  }

  // Cleanup function for old audio uploads
  async function cleanupOldUploads() {
    try {
      const now = Date.now();
      const maxAgeMs = uploadRetentionHours * 60 * 60 * 1000;
      const files = await fsp.readdir(uploadsDir);
      let cleanedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        try {
          const stat = await fsp.stat(filePath);
          const ageMs = now - stat.mtimeMs;
          
          if (ageMs > maxAgeMs) {
            await fsp.unlink(filePath);
            cleanedCount++;
            console.log(`[cleanup] Removed old upload: ${file} (age: ${(ageMs / 1000 / 60 / 60).toFixed(1)}h)`);
          }
        } catch (err) {
          console.error(`[cleanup] Error processing ${file}:`, err.message);
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`[cleanup] Cleaned up ${cleanedCount} old upload(s)`);
      }
    } catch (err) {
      console.error("[cleanup] Error during cleanup:", err.message);
    }
  }

  // Run cleanup on startup and then every hour
  cleanupOldUploads();
  const cleanupTimer = setInterval(cleanupOldUploads, 60 * 60 * 1000);

  app.post("/api/audio-upload", async (req, res) => {
    try {
      const { name, data } = req.body || {};
      if (!name || !data) {
        return res.status(400).json({ error: "name and data required" });
      }
      
      // Validate file extension
      const originalName = path.basename(String(name));
      const ext = path.extname(originalName).toLowerCase();
      const allowedExts = new Set([".wav", ".mp3", ".ogg", ".flac", ".m4a"]);
      if (!allowedExts.has(ext)) {
        return res.status(400).json({ error: "invalid or unsupported audio file extension" });
      }
      const baseNameWithoutExt = path.basename(originalName, ext);
      const sanitizedBase = baseNameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeName = sanitizedBase + ext;
      
      // Parse and validate data URL
      const dataStr = String(data);
      let base64Payload;

      if (dataStr.startsWith("data:")) {
        const match = /^data:([^;]+);base64,(.+)$/.exec(dataStr);
        if (!match) {
          return res.status(400).json({ error: "invalid data URL format" });
        }
        const mimeType = match[1];
        if (typeof mimeType !== "string" || !mimeType.toLowerCase().startsWith("audio/")) {
          return res.status(400).json({ error: "invalid MIME type: audio required" });
        }
        
        // Cross-validate MIME type against file extension
        const mimeExt = {
          "audio/wav": ".wav",
          "audio/wave": ".wav",
          "audio/x-wav": ".wav",
          "audio/mpeg": ".mp3",
          "audio/mp3": ".mp3",
          "audio/ogg": ".ogg",
          "audio/flac": ".flac",
          "audio/x-flac": ".flac",
          "audio/mp4": ".m4a",
          "audio/x-m4a": ".m4a"
        };
        const expectedExt = mimeExt[mimeType.toLowerCase()];
        if (expectedExt && expectedExt !== ext) {
          return res.status(400).json({ error: `MIME type ${mimeType} does not match file extension ${ext}` });
        }
        
        base64Payload = match[2];
      } else {
        // Fallback: treat as raw base64 data without a data: URL prefix.
        base64Payload = dataStr;
      }

      const buf = Buffer.from(base64Payload, "base64");
      
      // Validate file size (max 100MB)
      const maxSizeBytes = 100 * 1024 * 1024;
      if (buf.length > maxSizeBytes) {
        return res.status(400).json({ error: `file too large: ${(buf.length / 1024 / 1024).toFixed(2)}MB (max 100MB)` });
      }
      
      const target = path.join(uploadsDir, `${Date.now()}-${safeName}`);
      await fsp.writeFile(target, buf);
      res.json({ ok: true, path: target, name: safeName, size: buf.length });
    } catch (err) {
      console.error("[api] audio upload error", err);
      res.status(500).json({ error: "upload failed" });
    }
  });

  app.get("/api/presets", async (_req, res) => {
    try {
      const files = await fsp.readdir(presetsDir);
      const presets = files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
      res.json({ presets });
    } catch (err) {
      console.error("[api] presets list error", err);
      res.status(500).json({ error: "could not list presets" });
    }
  });

  app.get("/api/presets/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid preset name" });
      const filePath = path.join(presetsDir, `${name}.json`);
      const data = await fsp.readFile(filePath, "utf-8");
      const preset = JSON.parse(data);
      res.json({ name, preset });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "preset not found" });
      } else {
        console.error("[api] preset load error", err);
        res.status(500).json({ error: "could not load preset" });
      }
    }
  });

  app.post("/api/presets/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid preset name" });
      const preset = req.body;
      if (!preset || typeof preset !== "object") {
        return res.status(400).json({ error: "invalid preset data" });
      }
      const filePath = path.join(presetsDir, `${name}.json`);
      await fsp.writeFile(filePath, JSON.stringify(preset, null, 2), "utf-8");
      res.json({ ok: true, name });
    } catch (err) {
      console.error("[api] preset save error", err);
      res.status(500).json({ error: "could not save preset" });
    }
  });

  app.delete("/api/presets/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid preset name" });
      const filePath = path.join(presetsDir, `${name}.json`);
      await fsp.unlink(filePath);
      res.json({ ok: true });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "preset not found" });
      } else {
        console.error("[api] preset delete error", err);
        res.status(500).json({ error: "could not delete preset" });
      }
    }
  });

  // Shared presets for collaborative features
  const sharedPresetsDir = path.join(__dirname, "shared-presets");
  if (!require('fs').existsSync(sharedPresetsDir)) {
    require('fs').mkdirSync(sharedPresetsDir, { recursive: true });
  }

  app.get("/api/shared-presets", async (_req, res) => {
    try {
      const files = await fsp.readdir(sharedPresetsDir);
      const presets = await Promise.all(
        files
          .filter((f) => f.endsWith(".json"))
          .map(async (f) => {
            const data = await fsp.readFile(path.join(sharedPresetsDir, f), "utf-8");
            const preset = JSON.parse(data);
            return {
              name: f.replace(/\.json$/, ""),
              sharedBy: preset.sharedBy || "unknown",
              sharedAt: preset.sharedAt || "",
              description: preset.description || "",
              tags: preset.tags || [],
            };
          })
      );
      res.json({ presets });
    } catch (err) {
      console.error("[api] shared presets list error", err);
      res.status(500).json({ error: "could not list shared presets" });
    }
  });

  app.post("/api/shared-presets", async (req, res) => {
    const { name, preset, sharedBy, description, tags } = req.body || {};
    if (!name || !preset) {
      return res.status(400).json({ error: "name and preset data required" });
    }
    try {
      const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!sanitizedName) return res.status(400).json({ error: "invalid preset name" });
      
      const presetData = {
        ...preset,
        sharedBy: sharedBy || "anonymous",
        sharedAt: new Date().toISOString(),
        description: description || "",
        tags: tags || [],
      };
      
      const filePath = path.join(sharedPresetsDir, `${sanitizedName}.json`);
      await fsp.writeFile(filePath, JSON.stringify(presetData, null, 2), "utf-8");
      
      // Broadcast to all connected clients
      broadcast({
        type: "shared_preset",
        action: "created",
        name: sanitizedName,
        sharedBy: presetData.sharedBy,
      });
      
      res.json({ ok: true, name: sanitizedName });
    } catch (err) {
      console.error("[api] shared preset save error", err);
      res.status(500).json({ error: "could not save shared preset" });
    }
  });

  app.get("/api/shared-presets/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid preset name" });
      const filePath = path.join(sharedPresetsDir, `${name}.json`);
      const data = await fsp.readFile(filePath, "utf-8");
      const preset = JSON.parse(data);
      res.json({ name, preset });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "shared preset not found" });
      } else {
        console.error("[api] shared preset load error", err);
        res.status(500).json({ error: "could not load shared preset" });
      }
    }
  });

  app.delete("/api/shared-presets/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid preset name" });
      const filePath = path.join(sharedPresetsDir, `${name}.json`);
      await fsp.unlink(filePath);
      
      broadcast({
        type: "shared_preset",
        action: "deleted",
        name,
      });
      
      res.json({ ok: true });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "shared preset not found" });
      } else {
        console.error("[api] shared preset delete error", err);
        res.status(500).json({ error: "could not delete shared preset" });
      }
    }
  });

  // Deforum animation settings (full JSON preset for hidden LIVE panel)
  const deforumSettingsFile = path.join(__dirname, "deforum-settings.json");

  app.get("/api/deforum/settings", async (_req, res) => {
    try {
      if (!fs.existsSync(deforumSettingsFile)) {
        return res.json({ settings: null });
      }
      const data = JSON.parse(await fsp.readFile(deforumSettingsFile, "utf-8"));
      res.json({ settings: data });
    } catch (err) {
      console.error("[api] deforum settings read error", err);
      res.status(500).json({ error: "could not read deforum settings" });
    }
  });

  app.post("/api/deforum/settings", async (req, res) => {
    const { settings } = req.body || {};
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "settings object required" });
    }
    try {
      let modelSync = null;
      let previousSettings = null;
      if (fs.existsSync(deforumSettingsFile)) {
        try {
          previousSettings = JSON.parse(await fsp.readFile(deforumSettingsFile, "utf-8"));
        } catch (_err) {
          previousSettings = null;
        }
      }
      await fsp.writeFile(deforumSettingsFile, JSON.stringify(settings, null, 2), "utf-8");
      const previousModel = typeof previousSettings?.sd_model_name === "string"
        ? previousSettings.sd_model_name.trim()
        : "";
      const requestedModel = typeof settings.sd_model_name === "string" ? settings.sd_model_name.trim() : "";
      if (requestedModel && requestedModel !== previousModel) {
        try {
          modelSync = await switchSdModelOnForge(req, requestedModel);
        } catch (modelErr) {
          modelSync = { success: false, error: modelErr.message };
          console.warn("[api] deforum settings model sync warning", modelErr.message);
        }
      }
      broadcast({ type: "deforum_settings", action: "updated" });
      res.json({ ok: true, modelSync });
    } catch (err) {
      console.error("[api] deforum settings save error", err);
      res.status(500).json({ error: "could not save deforum settings" });
    }
  });

  /** Render a single Deforum frame via Forge /deforum_api/batches (max_frames=1). */
  app.post("/api/deforum/preview", async (req, res) => {
    const body = req.body || {};
    const settings = body.settings && typeof body.settings === "object" ? body.settings : null;
    if (!settings) {
      return res.status(400).json({ error: "settings object required" });
    }
    const target = forgeTarget(req);
    try {
      const result = await renderDeforumPreview(settings, target, body.options_overrides || {});
      res.json(result);
    } catch (err) {
      console.error("[api] deforum preview error", err);
      res.status(502).json({
        error: String(err.message || err),
        status: err.status,
        detail: err.detail,
        batch: err.batch,
        raw: err.raw,
      });
    } finally {
      target.release();
    }
  });

  // Shared settings for collaborative features
  const sharedSettingsFile = path.join(__dirname, "shared-settings.json");

  app.get("/api/shared-settings", async (_req, res) => {
    try {
      if (!require('fs').existsSync(sharedSettingsFile)) {
        return res.json({ settings: {} });
      }
      const data = await fsp.readFile(sharedSettingsFile, "utf-8");
      const settings = JSON.parse(data);
      res.json({ settings });
    } catch (err) {
      res.json({ settings: {} });
    }
  });

  app.post("/api/shared-settings", async (req, res) => {
    const { settings, updatedBy } = req.body || {};
    if (!settings) {
      return res.status(400).json({ error: "settings required" });
    }
    try {
      const currentSettings = require('fs').existsSync(sharedSettingsFile)
        ? JSON.parse(await fsp.readFile(sharedSettingsFile, "utf-8"))
        : {};
      
      const newSettings = {
        ...currentSettings,
        ...settings,
        lastUpdatedBy: updatedBy || "anonymous",
        lastUpdatedAt: new Date().toISOString(),
      };
      
      await fsp.writeFile(sharedSettingsFile, JSON.stringify(newSettings, null, 2), "utf-8");
      
      broadcast({
        type: "shared_settings",
        action: "updated",
        updatedBy: newSettings.lastUpdatedBy,
      });
      
      res.json({ ok: true });
    } catch (err) {
      console.error("[api] shared settings save error", err);
      res.status(500).json({ error: "could not save shared settings" });
    }
  });

  // Animation sequencer timelines (JSON on disk)
  app.get("/api/sequencer", async (_req, res) => {
    try {
      const files = await fsp.readdir(sequencersDir);
      const timelines = files
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""));
      res.json({ timelines });
    } catch (err) {
      console.error("[api] sequencer list error", err);
      res.status(500).json({ error: "could not list sequencer timelines" });
    }
  });

  app.get("/api/sequencer/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid timeline name" });
      const filePath = path.join(sequencersDir, `${name}.json`);
      const data = await fsp.readFile(filePath, "utf-8");
      const timeline = JSON.parse(data);
      res.json({ name, timeline });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "timeline not found" });
      } else {
        console.error("[api] sequencer load error", err);
        res.status(500).json({ error: "could not load timeline" });
      }
    }
  });

  app.post("/api/sequencer/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid timeline name" });
      const timeline = req.body;
      const errMsg = validateTimeline(timeline);
      if (errMsg) return res.status(400).json({ error: errMsg });
      const filePath = path.join(sequencersDir, `${name}.json`);
      await fsp.writeFile(filePath, JSON.stringify(timeline, null, 2), "utf-8");
      res.json({ ok: true, name });
    } catch (err) {
      console.error("[api] sequencer save error", err);
      res.status(500).json({ error: "could not save timeline" });
    }
  });

  app.delete("/api/sequencer/:name", async (req, res) => {
    try {
      const name = req.params.name.replace(/[^a-zA-Z0-9_-]/g, "");
      if (!name) return res.status(400).json({ error: "invalid timeline name" });
      const filePath = path.join(sequencersDir, `${name}.json`);
      await fsp.unlink(filePath);
      res.json({ ok: true });
    } catch (err) {
      if (err.code === "ENOENT") {
        res.status(404).json({ error: "timeline not found" });
      } else {
        console.error("[api] sequencer delete error", err);
        res.status(500).json({ error: "could not delete timeline" });
      }
    }
  });

  app.get("/api/plugins", async (_req, res) => {
    try {
      const manifestPath = path.join(pluginsDir, "manifest.json");
      const raw = await fsp.readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(raw);
      const plugins = Array.isArray(parsed) ? parsed : parsed.plugins || [];
      res.json({ plugins });
    } catch (err) {
      if (err.code === "ENOENT") {
        return res.json({ plugins: [] });
      }
      console.error("[api] plugins list error", err);
      res.status(500).json({ error: "could not read plugin manifest" });
    }
  });

  app.get("/api/plugins/:type", async (req, res) => {
    const pluginType = req.params.type;
    try {
      const manifestPath = path.join(pluginsDir, "manifest.json");
      const raw = await fsp.readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(raw);
      const allPlugins = Array.isArray(parsed) ? parsed : parsed.plugins || [];
      const filtered = allPlugins.filter(p => p.plugin_type === pluginType);
      res.json({ plugins: filtered, type: pluginType });
    } catch (err) {
      if (err.code === "ENOENT") {
        return res.json({ plugins: [], type: pluginType });
      }
      console.error("[api] plugins filter error", err);
      res.status(500).json({ error: "could not read plugin manifest" });
    }
  });

  app.post("/api/plugins/execute", async (req, res) => {
    const { plugin_name, parameters, input } = req.body || {};
    if (!plugin_name) {
      return res.status(400).json({ error: "plugin_name required" });
    }
    try {
      const manifestPath = path.join(pluginsDir, "manifest.json");
      const raw = await fsp.readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(raw);
      const allPlugins = Array.isArray(parsed) ? parsed : parsed.plugins || [];
      const plugin = allPlugins.find(p => p.name === plugin_name);
      if (!plugin) {
        return res.status(404).json({ error: `Plugin not found: ${plugin_name}` });
      }
      const [modulePath, funcName] = plugin.entry_point.split(':');
      const mod = require(modulePath);
      const fn = mod[funcName];
      if (typeof fn !== 'function') {
        return res.status(500).json({ error: `Plugin entry point is not a function: ${funcName}` });
      }
      const mergedParams = { ...plugin.parameters, ...parameters };
      const result = fn(input, mergedParams);
      res.json({ success: true, plugin: plugin_name, result });
    } catch (err) {
      console.error(`[api] plugin execute error: ${plugin_name}`, err);
      res.status(500).json({ error: `Plugin execution failed: ${err.message}` });
    }
  });

  app.get("/api/plugins/modulators", async (_req, res) => {
    const modulators = [
      { id: "smooth", name: "Smooth", description: "Smooth parameter transitions", parameters: { smoothing: 0.5 } },
      { id: "step", name: "Step", description: "Quantize to discrete steps", parameters: { steps: 8, min: 0, max: 1 } },
      { id: "random", name: "Random", description: "Add controlled variance", parameters: { variance: 0.1 } },
    ];
    res.json({ modulators });
  });

  app.get("/api/plugins/mappings", async (_req, res) => {
    const mappings = [
      { id: "linear", name: "Linear", description: "Linear mapping" },
      { id: "exponential", name: "Exponential", description: "Exponential curve mapping" },
      { id: "logarithmic", name: "Logarithmic", description: "Logarithmic curve mapping" },
      { id: "sigmoid", name: "Sigmoid", description: "S-curve mapping for smooth transitions" },
    ];
    res.json({ mappings });
  });

  app.post("/api/img2img", async (req, res) => {
    const body = req.body || {};
    const init = body.init_image || body.initImage;
    if (!init || typeof init !== "string") {
      return res.status(400).json({ error: "init_image required (data URL or raw base64)" });
    }
    let b64 = init.trim();
    const dataUrl = /^data:image\/[^;]+;base64,(.+)$/i.exec(b64);
    if (dataUrl) b64 = dataUrl[1];

    let maskB64 = null;
    const maskRaw = body.mask_image || body.maskImage;
    if (maskRaw && typeof maskRaw === "string" && maskRaw.trim()) {
      maskB64 = maskRaw.trim();
      const maskDataUrl = /^data:image\/[^;]+;base64,(.+)$/i.exec(maskB64);
      if (maskDataUrl) maskB64 = maskDataUrl[1];
    }

    const target = forgeTarget(req);
    const forgeUrl = target.url;
    const steps = Math.min(100, Math.max(1, parseInt(body.steps, 10) || 28));
    const cfg = Math.min(30, Math.max(1, parseFloat(body.cfg_scale ?? body.cfgScale) || 7));
    const w = Math.min(2048, Math.max(64, parseInt(body.width, 10) || 1024));
    const h = Math.min(2048, Math.max(64, parseInt(body.height, 10) || 1024));
    const denoise = Math.min(1, Math.max(0, parseFloat(body.denoising_strength ?? body.denoisingStrength) || 0.55));
    const sampler = typeof body.sampler_name === "string" && body.sampler_name ? body.sampler_name : "Euler a";
    const seed = body.seed != null ? parseInt(body.seed, 10) : -1;

    const payload = {
      init_images: [b64],
      prompt: String(body.prompt || ""),
      negative_prompt: String(body.negative_prompt || body.negativePrompt || ""),
      steps,
      cfg_scale: cfg,
      width: w,
      height: h,
      denoising_strength: denoise,
      sampler_name: sampler,
      batch_size: 1,
      n_iter: 1,
      seed: Number.isFinite(seed) ? seed : -1,
      resize_mode: 0,
    };

    if (maskB64) {
      const maskBlur = Math.min(64, Math.max(0, parseInt(body.mask_blur ?? body.maskBlur, 10) || 4));
      const inpaintingFill = Math.min(3, Math.max(0, parseInt(body.inpainting_fill ?? body.inpaintingFill, 10) || 1));
      const ifr = body.inpaint_full_res ?? body.inpaintFullRes;
      const inpaintFullRes = !(ifr === false || ifr === "false" || ifr === 0 || ifr === "0");
      const pad = Math.min(256, Math.max(0, parseInt(body.inpaint_full_res_padding ?? body.inpaintFullResPadding, 10) || 32));
      payload.mask = maskB64;
      payload.mask_blur = maskBlur;
      payload.inpainting_fill = inpaintingFill;
      payload.inpaint_full_res = inpaintFullRes;
      payload.inpaint_full_res_padding = pad;
    }

    try {
      if (typeof fetch === "undefined") {
        return res.status(500).json({ error: "fetch not available in this Node build" });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000);
      const response = await fetch(`${forgeUrl}/sdapi/v1/img2img`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) {
        const text = await response.text();
        return res.status(502).json({
          error: "Forge img2img failed",
          status: response.status,
          detail: text.slice(0, 500),
          node: target.node ? { name: target.node.name, url: target.node.url } : null,
        });
      }
      const data = await response.json();
      const images = data.images || [];
      if (!images.length) {
        return res.status(502).json({ error: "Forge returned no images", raw: data });
      }
      const outName = `i2i_${Date.now()}.png`;
      const outPath = path.join(uploadsDir, outName);
      let imgB64 = images[0];
      if (typeof imgB64 === "string" && imgB64.includes(",")) {
        imgB64 = imgB64.split(",", 2)[1];
      }
      const buf = Buffer.from(imgB64, "base64");
      await fsp.writeFile(outPath, buf);
      res.json({
        ok: true,
        path: `/uploads/${outName}`,
        info: data.info || null,
        node: target.node ? { name: target.node.name, url: target.node.url } : null,
      });
    } catch (err) {
      console.error("[api] img2img error", err);
      res.status(502).json({ error: String(err.message || err) });
    } finally {
      target.release();
    }
  });

  /** Single-frame txt2img preview (performance deck / parameter react mode). */
  app.post("/api/txt2img", async (req, res) => {
    const body = req.body || {};
    const target = forgeTarget(req);
    const forgeUrl = target.url;
    const steps = Math.min(100, Math.max(1, parseInt(body.steps, 10) || 12));
    const cfg = Math.min(30, Math.max(1, parseFloat(body.cfg_scale ?? body.cfgScale) || 7));
    const w = Math.min(2048, Math.max(64, parseInt(body.width, 10) || 1024));
    const h = Math.min(2048, Math.max(64, parseInt(body.height, 10) || 576));
    const sampler = typeof body.sampler_name === "string" && body.sampler_name ? body.sampler_name : "Euler a";
    const seed = body.seed != null ? parseInt(body.seed, 10) : -1;

    const payload = {
      prompt: String(body.prompt || body.positive || ""),
      negative_prompt: String(body.negative_prompt || body.negativePrompt || ""),
      steps,
      cfg_scale: cfg,
      width: w,
      height: h,
      sampler_name: sampler,
      batch_size: 1,
      n_iter: 1,
      seed: Number.isFinite(seed) ? seed : -1,
    };
    const fallbackSettings = buildTxt2imgFallbackSettings(body, payload);

    async function respondWithDeforumFallback(reason) {
      if (!fallbackSettings) return false;
      try {
        const result = await renderDeforumPreview(fallbackSettings, target, body.options_overrides || {});
        if (target.node) {
          gpuPool.logNodeRequest(target.node.id, {
            type: "generate",
            path: "/api/txt2img fallback",
            durationMs: 0,
            ok: true,
            error: reason || null,
          });
        }
        return res.json({ ...result, fallback: "deforum_preview" });
      } catch (fallbackErr) {
        console.error("[api] txt2img fallback error", fallbackErr);
        return res.status(502).json({
          error: String(fallbackErr.message || fallbackErr),
          status: fallbackErr.status,
          detail: fallbackErr.detail,
          batch: fallbackErr.batch,
          raw: fallbackErr.raw,
          upstream_error: reason || null,
        });
      }
    }

    try {
      if (shouldBypassTxt2img(target)) {
        const bypassed = await respondWithDeforumFallback("txt2img temporarily bypassed after recent Forge failures");
        if (bypassed !== false) return;
      }
      if (typeof fetch === "undefined") {
        return res.status(500).json({ error: "fetch not available in this Node build" });
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600000);
      const t0 = Date.now();
      let response;
      try {
        response = await fetch(`${forgeUrl}/sdapi/v1/txt2img`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (target.node) {
        gpuPool.logNodeRequest(target.node.id, { type: "generate", path: "/sdapi/v1/txt2img", statusCode: response.status, durationMs: Date.now() - t0, ok: response.ok });
      }
      if (!response.ok) {
        const text = await response.text();
        recordTxt2imgFailure(target);
        const fallback = await respondWithDeforumFallback(`Forge txt2img failed (${response.status})`);
        if (fallback !== false) return;
        return res.status(502).json({ error: "Forge txt2img failed", status: response.status, detail: text.slice(0, 500) });
      }
      clearTxt2imgFailure(target);
      const data = await response.json();
      const images = data.images || [];
      if (!images.length) {
        return res.status(502).json({ error: "Forge returned no images", raw: data });
      }
      const outName = `preview_${Date.now()}.png`;
      const outPath = path.join(uploadsDir, outName);
      let imgB64 = images[0];
      if (typeof imgB64 === "string" && imgB64.includes(",")) {
        imgB64 = imgB64.split(",", 2)[1];
      }
      const buf = Buffer.from(imgB64, "base64");
      await fsp.writeFile(outPath, buf);
      res.json({
        ok: true,
        path: `/uploads/${outName}`,
        info: data.info || null,
        node: target.node ? { name: target.node.name, url: target.node.url } : null,
      });
    } catch (err) {
      console.error("[api] txt2img error", err);
      recordTxt2imgFailure(target);
      const fallback = await respondWithDeforumFallback(String(err.message || err));
      if (fallback !== false) return;
      res.status(502).json({ error: String(err.message || err) });
    } finally {
      target.release();
    }
  });

  // ControlNet models API
  app.get("/api/controlnet/models", async (req, res) => {
    const target = forgeTarget(req);
    const forgeUrl = target.url;
    
    // Fallback placeholder models
    const placeholderModels = [
      { id: "canny", name: "Canny Edge", category: "edge" },
      { id: "depth", name: "Depth Map", category: "depth" },
      { id: "openpose", name: "OpenPose", category: "pose" },
      { id: "scribble", name: "Scribble", category: "line" },
      { id: "tile", name: "Tile/Blur", category: "style" },
      { id: "lineart", name: "Line Art", category: "line" },
      { id: "mlsd", name: "M-LSD Lines", category: "line" },
      { id: "normal", name: "Normal Map", category: "depth" },
      { id: "seg", name: "Segmentation", category: "semantic" },
    ];
    
    try {
      // Try to fetch ControlNet models from SD-Forge API
      // Use native fetch (Node.js 18+) or fallback gracefully
      if (typeof fetch === 'undefined') {
        throw new Error('fetch not available, using placeholder models');
      }
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(`${forgeUrl}/controlnet/model_list`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        // SD-Forge returns { model_list: [...] }
        const modelList = data.model_list || data.models || [];
        const models = modelList.map((model, idx) => {
          const name = typeof model === 'string' ? model : (model.name || model.model_name || `Model ${idx + 1}`);
          return {
            id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            name: name,
            category: categorizeControlNetModel(name)
          };
        });
        
        // Update API status
        apiStatus.sdForgeAvailable = true;
        apiStatus.lastChecked = new Date().toISOString();
        apiStatus.controlNetModels = models;
        
        console.log(`[controlnet] Fetched ${models.length} models from SD-Forge`);
        return res.json({ models, source: 'sd-forge', cached: false });
      }
    } catch (err) {
      // API unavailable or timeout - fall back to placeholder or cache
      apiStatus.sdForgeAvailable = false;
      apiStatus.lastChecked = new Date().toISOString();
      console.log(`[controlnet] SD-Forge API unavailable, using ${apiStatus.controlNetModels ? 'cached' : 'placeholder'} models: ${err.message}`);
      
      // Return cached models if available (with 5 minute cache validity)
      if (apiStatus.controlNetModels && apiStatus.lastChecked) {
        const cacheAge = new Date() - new Date(apiStatus.lastChecked);
        const fiveMinutes = 5 * 60 * 1000;
        if (cacheAge < fiveMinutes) {
          return res.json({ models: apiStatus.controlNetModels, source: 'cache', cached: true, cacheAge: Math.floor(cacheAge / 1000) });
        }
      }
    } finally {
      target.release();
    }

    res.json({ models: placeholderModels, source: 'placeholder', cached: false });
  });

  // Helper function to categorize ControlNet models
  function categorizeControlNetModel(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('canny') || lowerName.includes('edge')) return 'edge';
    if (lowerName.includes('depth')) return 'depth';
    if (lowerName.includes('pose') || lowerName.includes('openpose')) return 'pose';
    if (lowerName.includes('scribble') || lowerName.includes('pidinet')) return 'line';
    if (lowerName.includes('tile') || lowerName.includes('blur')) return 'style';
    if (lowerName.includes('lineart') || lowerName.includes('mlsd')) return 'line';
    if (lowerName.includes('normal')) return 'depth';
    if (lowerName.includes('seg') || lowerName.includes('semantic')) return 'semantic';
    return 'other';
  }
  
  // ControlNet image upload endpoint (for webcam/screen capture)
  app.post("/api/controlnet/upload-image", async (req, res) => {
    const multer = require('multer');
    const upload = multer({ storage: multer.memoryStorage() });
    
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: "Image upload failed" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }
      
      const slot = req.body.slot || "CN1";
      const imageBuffer = req.file.buffer;
      
      try {
        const forgeHost = process.env.SD_FORGE_HOST || "192.168.2.101";
        const forgePort = process.env.SD_FORGE_PORT || "7860";
        const forgeUrl = `http://${forgeHost}:${forgePort}`;
        
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', imageBuffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        formData.append('slot', slot);
        
        const response = await fetch(`${forgeUrl}/controlnet/upload`, {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders(),
        });
        
        if (!response.ok) {
          throw new Error(`SD-Forge responded with ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`[controlnet] Uploaded image for slot ${slot}`);
        res.json({ success: true, result });
      } catch (error) {
        console.error(`[controlnet] Upload failed: ${error.message}`);
        res.status(500).json({ error: "Failed to upload image to SD-Forge" });
      }
    });
  });
  
  // Refresh models endpoint - clears cache and forces re-fetch
  app.post("/api/models/refresh", (_req, res) => {
    apiStatus.controlNetModels = null;
    apiStatus.loraModels = null;
    apiStatus.sdModels = null;
    apiStatus.currentModel = null;
    apiStatus.lastChecked = null;
    console.log("[api] Model cache cleared, will refetch on next request");
    res.json({ success: true, message: "Model cache cleared" });
  });

  // SD Models (Checkpoints) API endpoints
  app.get("/api/sd-models", async (req, res) => {
    const target = forgeTarget(req);
    const forgeUrl = target.url;
    try {
    // Fallback placeholder models
    const placeholderModels = [
      {
        title: "SDXL Base",
        model_name: "sdxl_base_1.0.safetensors",
        hash: "placeholder_hash_1",
        sha256: null,
        filename: "sdxl_base_1.0.safetensors",
        config: null,
        metadata: {
          type: "SDXL",
          recommended_steps: 30,
          recommended_sampler: "DPM++ 2M Karras",
          base_resolution: 1024,
        }
      },
      {
        title: "SD 1.5",
        model_name: "v1-5-pruned.safetensors",
        hash: "placeholder_hash_2",
        sha256: null,
        filename: "v1-5-pruned.safetensors",
        config: null,
        metadata: {
          type: "SD 1.5",
          recommended_steps: 24,
          recommended_sampler: "Euler a",
          base_resolution: 512,
        }
      },
    ];
    
    try {
      // Try to fetch models from SD-Forge API
      if (typeof fetch === 'undefined') {
        throw new Error('fetch not available, using placeholder models');
      }
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${forgeUrl}/sdapi/v1/sd-models`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const models = await response.json();
        
        // Enrich with metadata if available
        const enrichedModels = models.map(model => ({
          ...model,
          metadata: extractModelMetadata(model)
        }));
        
        // Update API status
        apiStatus.sdForgeAvailable = true;
        apiStatus.lastChecked = new Date().toISOString();
        apiStatus.forgeCacheValidUntil = Date.now() + 5 * 60 * 1000;
        apiStatus.sdModels = enrichedModels;
        
        console.log(`[sd-models] Fetched ${enrichedModels.length} models from SD-Forge`);
        return res.json({ models: enrichedModels, source: 'sd-forge', cached: false });
      }
    } catch (err) {
      apiStatus.sdForgeAvailable = false;
      apiStatus.lastChecked = new Date().toISOString();
      console.log(`[sd-models] SD-Forge API unavailable, using ${apiStatus.sdModels ? 'cached' : 'placeholder'} models: ${err.message}`);
      
      if (apiStatus.sdModels && apiStatus.forgeCacheValidUntil > Date.now()) {
        const cacheAge = Math.floor((apiStatus.forgeCacheValidUntil - Date.now()) / 1000);
        return res.json({ models: apiStatus.sdModels, source: 'cache', cached: true, cacheAge });
      }
    }
    
    res.json({ models: placeholderModels, source: 'placeholder', cached: false });
    } finally {
      target.release();
    }
  });

  async function switchSdModelOnForge(req, modelName) {
    const nextModel = typeof modelName === "string" ? modelName.trim() : "";
    if (!nextModel) {
      throw new Error("model_name is required");
    }
    const sync = await applyForgeOptionsAcrossTargets(
      { sd_model_checkpoint: nextModel },
      30000
    );
    apiStatus.currentModel = {
      model_name: nextModel,
      title: nextModel,
      metadata: extractModelMetadata({ model_name: nextModel, title: nextModel }),
    };
    console.log(`[sd-models] Switched to model across ${sync.successes} node(s): ${nextModel}`);
    broadcast({ type: "sd_model", action: "switched", model: apiStatus.currentModel, sync });
    return {
      success: true,
      partial: sync.partial,
      message: `Switched to ${nextModel}`,
      model: apiStatus.currentModel,
      sync,
    };
  }

  // Get current SD model
  app.get("/api/sd-models/current", async (req, res) => {
    const target = forgeTarget(req, { allowDirectPreferred: true });
    const preferredNode = req?.query?.preferredNode || req?.body?.preferredNode;
    if (preferredNode && !target.node) {
      return res.status(404).json({ error: "Preferred Forge node not found" });
    }
    const forgeUrl = target.url;
    try {
      if (typeof fetch === 'undefined') {
        throw new Error('fetch not available');
      }
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${forgeUrl}/sdapi/v1/options`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const options = await response.json();
        const currentModel = {
          model_name: options.sd_model_checkpoint || "Unknown",
          title: options.sd_model_checkpoint || "Unknown",
          metadata: extractModelMetadata({
            model_name: options.sd_model_checkpoint || "Unknown",
            title: options.sd_model_checkpoint || "Unknown",
          }),
        };
        
        apiStatus.currentModel = currentModel;
        console.log(`[sd-models] Current model: ${currentModel.model_name}`);
        return res.json({ model: currentModel, source: 'sd-forge' });
      }
      return res.json({ model: { model_name: "Unknown", title: "Unknown" }, source: 'placeholder' });
    } catch (err) {
      console.log(`[sd-models] Failed to get current model: ${err.message}`);
      
      if (apiStatus.currentModel) {
        return res.json({ model: apiStatus.currentModel, source: 'cache' });
      }
      return res.json({ model: { model_name: "Unknown", title: "Unknown" }, source: 'placeholder' });
    } finally {
      target.release();
    }
  });

  // Switch SD model
  app.post("/api/sd-models/switch", async (req, res) => {
    const { model_name } = req.body;
    
    if (!model_name) {
      return res.status(400).json({ error: "model_name is required" });
    }
    
    try {
      const result = await switchSdModelOnForge(req, model_name);
      return res.json(result);
    } catch (err) {
      console.log(`[sd-models] Failed to switch model: ${err.message}`);
      return res.status(500).json({ 
        error: "Failed to switch model", 
        message: err.message 
      });
    }
  });

  // Helper function to extract model metadata
  function extractModelMetadata(model) {
    const name = (model.title || model.model_name || "").toLowerCase();
    const metadata = {
      type: "Unknown",
      variant: "standard",
      recommended_steps: 24,
      recommended_sampler: "DPM++ 2M Karras",
      recommended_cfg_scale: 7,
      recommended_strength: 0.7,
      base_resolution: 512,
    };
    
    // Detect model type from name
    if (name.includes("turbo")) {
      metadata.variant = "turbo";
      metadata.recommended_sampler = "Euler a";
      metadata.recommended_cfg_scale = 1.0;
      if (name.includes("sdxl") || name.includes("xl")) {
        metadata.type = "SDXL Turbo";
        metadata.recommended_steps = 2;
        metadata.recommended_strength = 0.4;
        metadata.base_resolution = 1024;
      } else {
        metadata.type = "SD Turbo";
        metadata.recommended_steps = 1;
        metadata.recommended_strength = 0.3;
        metadata.base_resolution = 512;
      }
    } else if (name.includes("lightning")) {
      metadata.variant = "lightning";
      metadata.type = name.includes("sdxl") || name.includes("xl") ? "SDXL Lightning" : "Lightning";
      metadata.recommended_steps = 2;
      metadata.recommended_sampler = "Euler";
      metadata.recommended_cfg_scale = 1.0;
      metadata.recommended_strength = 0.45;
      metadata.base_resolution = name.includes("sdxl") || name.includes("xl") ? 1024 : 512;
    } else if (name.includes('sdxl') || name.includes('xl')) {
      metadata.type = "SDXL";
      metadata.recommended_steps = 30;
      metadata.base_resolution = 1024;
    } else if (name.includes('sd3') || name.includes('stable diffusion 3')) {
      metadata.type = "SD 3";
      metadata.recommended_steps = 28;
      metadata.base_resolution = 1024;
    } else if (name.includes('flux')) {
      metadata.type = "Flux";
      metadata.recommended_steps = 20;
      metadata.base_resolution = 1024;
      metadata.recommended_sampler = "Euler";
      metadata.recommended_cfg_scale = 1.0;
    } else if (name.includes('z-image') || name.includes('zimage')) {
      metadata.type = "Z-Image";
      metadata.recommended_steps = 20;
      metadata.base_resolution = 1024;
      metadata.recommended_sampler = "Euler";
      metadata.recommended_cfg_scale = 1.0;
    } else if (name.includes('1.5') || name.includes('v1-5')) {
      metadata.type = "SD 1.5";
      metadata.recommended_steps = 24;
      metadata.base_resolution = 512;
      metadata.recommended_sampler = "Euler a";
    } else if (name.includes('2.1') || name.includes('v2-1')) {
      metadata.type = "SD 2.1";
      metadata.recommended_steps = 26;
      metadata.base_resolution = 768;
    }
    
    // Copy any existing metadata from model
    if (model.metadata) {
      Object.assign(metadata, model.metadata);
    }
    
    return metadata;
  }

  // LoRA API endpoints
  app.get("/api/loras", async (req, res) => {
    const target = forgeTarget(req);
    const forgeUrl = target.url;
    try {
    if (apiStatus.loraModels && apiStatus.loraCacheValidUntil > Date.now()) {
      const cacheAge = Math.floor((apiStatus.loraCacheValidUntil - Date.now()) / 1000);
      return res.json({ loras: apiStatus.loraModels, source: 'cache', cached: true, cacheAge });
    }
    // Fallback placeholder LoRAs for development/demo
    const placeholderLoras = [
      {
        id: "lora_sdxl_lightning_1",
        name: "SDXL Lightning",
        path: "sdxl_lightning.safetensors",
        thumbnail: null,
        strength: 1.0,
      },
      {
        id: "lora_detail_tweaker_1",
        name: "Detail Tweaker",
        path: "detail_tweaker_v1.safetensors",
        thumbnail: null,
        strength: 0.8,
      },
      {
        id: "lora_style_anime_1",
        name: "Anime Style",
        path: "anime_style_xl.safetensors",
        thumbnail: null,
        strength: 1.0,
      },
      {
        id: "lora_photorealism_1",
        name: "Photorealism Enhancer",
        path: "photorealism_v2.safetensors",
        thumbnail: null,
        strength: 0.7,
      },
      {
        id: "lora_cyberpunk_1",
        name: "Cyberpunk Style",
        path: "cyberpunk_neon.safetensors",
        thumbnail: null,
        strength: 1.0,
      },
      {
        id: "lora_watercolor_1",
        name: "Watercolor Art",
        path: "watercolor_painting.safetensors",
        thumbnail: null,
        strength: 0.9,
      },
    ];
    
    try {
      // Try to fetch LoRAs from SD-Forge API
      if (typeof fetch === 'undefined') {
        throw new Error('fetch not available');
      }
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch(`${forgeUrl}/sdapi/v1/loras`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const loras = await response.json();
        // SD-Forge returns an array of lora objects
        const loraList = Array.isArray(loras) ? loras : [];
        const formattedLoras = loraList.map((lora, idx) => {
          const name = lora.name || lora.alias || `LoRA ${idx + 1}`;
          const path = lora.path || lora.filename || name;
          return {
            id: `lora_${idx}_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
            name: name,
            path: path,
            thumbnail: lora.preview || lora.thumbnail || null,
            strength: 1.0,
          };
        });
        apiStatus.loraModels = formattedLoras;
        apiStatus.loraCacheValidUntil = Date.now() + 5 * 60 * 1000;
        console.log(`[loras] Fetched ${formattedLoras.length} LoRAs from SD-Forge`);
        return res.json({ loras: formattedLoras, source: 'sd-forge' });
      }
    } catch (err) {
      // API unavailable or timeout - fall back to placeholder
      console.log(`[loras] SD-Forge API unavailable, using ${apiStatus.loraModels ? 'cached' : 'placeholder'} LoRAs: ${err.message}`);
      if (apiStatus.loraModels) {
        return res.json({ loras: apiStatus.loraModels, source: 'cache', cached: true });
      }
    }
    
    res.json({ loras: placeholderLoras, source: 'placeholder' });
    } finally {
      target.release();
    }
  });

  // Forge Settings API

  app.get("/api/forge/options", async (req, res) => {
    const target = forgeTarget(req, { allowDirectPreferred: true });
    const preferredNode = req?.query?.preferredNode || req?.body?.preferredNode;
    if (preferredNode && !target.node) {
      return res.status(404).json({ options: {}, available: false, error: "Preferred Forge node not found" });
    }
    const forgeUrl = target.url;
    try {
      if (typeof fetch === 'undefined') throw new Error('fetch not available');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${forgeUrl}/sdapi/v1/options`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const options = await response.json();
      apiStatus.sdForgeAvailable = true;
      return res.json({ options, available: true });
    } catch (err) {
      apiStatus.sdForgeAvailable = false;
      return res.json({ options: {}, available: false, error: err.message });
    } finally {
      target.release();
    }
  });

  app.post("/api/forge/options", async (req, res) => {
    const updates = req.body;
    const preferredNode = req?.query?.preferredNode || req?.body?.preferredNode;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: "Invalid options" });
    }
    if (preferredNode) delete updates.preferredNode;
    try {
      if (preferredNode) {
        const target = forgeTarget({ ...req, query: { ...(req.query || {}), preferredNode } }, { allowDirectPreferred: true });
        if (!target.node) {
          return res.status(404).json({ error: "Preferred Forge node not found" });
        }
        const sync = await postForgeOptionsToTarget(target, updates, 10000);
        return res.json({ success: true, partial: false, sync });
      }
      const sync = await applyForgeOptionsAcrossTargets(updates, 10000);
      return res.json({ success: true, partial: sync.partial, sync });
    } catch (err) {
      return res.status(502).json({ error: "Failed to update options", message: err.message });
    }
  });

  app.get("/api/forge/samplers", async (req, res) => {
    const target = forgeTarget(req, { allowDirectPreferred: true });
    const preferredNode = req?.query?.preferredNode || req?.body?.preferredNode;
    if (preferredNode && !target.node) {
      return res.status(404).json({ samplers: [], error: "Preferred Forge node not found" });
    }
    const forgeUrl = target.url;
    try {
      if (typeof fetch === 'undefined') throw new Error('fetch not available');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${forgeUrl}/sdapi/v1/samplers`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const samplers = await response.json();
      return res.json({ samplers });
    } catch (err) {
      return res.json({ samplers: [], error: err.message });
    } finally {
      target.release();
    }
  });

  app.get("/api/forge/schedulers", async (req, res) => {
    const target = forgeTarget(req, { allowDirectPreferred: true });
    const preferredNode = req?.query?.preferredNode || req?.body?.preferredNode;
    if (preferredNode && !target.node) {
      return res.status(404).json({ schedulers: [], error: "Preferred Forge node not found" });
    }
    const forgeUrl = target.url;
    try {
      if (typeof fetch === 'undefined') throw new Error('fetch not available');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${forgeUrl}/sdapi/v1/schedulers`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const schedulers = await response.json();
      return res.json({ schedulers });
    } catch (err) {
      return res.json({ schedulers: [], error: err.message });
    } finally {
      target.release();
    }
  });

  app.get("/api/forge/vae", async (req, res) => {
    const target = forgeTarget(req, { allowDirectPreferred: true });
    const preferredNode = req?.query?.preferredNode || req?.body?.preferredNode;
    if (preferredNode && !target.node) {
      return res.status(404).json({ vae: [], error: "Preferred Forge node not found" });
    }
    const forgeUrl = target.url;
    try {
      if (typeof fetch === 'undefined') throw new Error('fetch not available');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${forgeUrl}/sdapi/v1/vae`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const vaeList = await response.json();
      return res.json({ vae: vaeList });
    } catch (err) {
      return res.json({ vae: [], error: err.message });
    } finally {
      target.release();
    }
  });

  // Advanced Prompt System API endpoints
  
  // In-memory storage for prompt templates and libraries
  const promptLibrary = {
    templates: [
      {
        id: "cinematic_1",
        name: "Cinematic Shot",
        prompt: "cinematic shot of {subject}, {lighting}, professional color grading, film grain, shallow depth of field",
        negativePrompt: "amateur, snapshot, blurry, low quality",
        category: "photography",
        variables: ["subject", "lighting"],
        tags: ["cinematic", "professional", "photography"]
      },
      {
        id: "anime_1",
        name: "Anime Character",
        prompt: "{character_type} anime character, {art_style}, vibrant colors, detailed eyes",
        negativePrompt: "realistic, 3d, photograph, western cartoon",
        category: "anime",
        variables: ["character_type", "art_style"],
        tags: ["anime", "character", "illustration"]
      },
      {
        id: "landscape_1",
        name: "Epic Landscape",
        prompt: "{time_of_day} landscape, {terrain_type}, dramatic lighting, {weather}, cinematic composition",
        negativePrompt: "indoors, people, buildings, urban",
        category: "landscape",
        variables: ["time_of_day", "terrain_type", "weather"],
        tags: ["landscape", "nature", "scenic"]
      }
    ],
    wildcards: {
      "subject": ["person", "cat", "dog", "robot", "fantasy creature", "alien"],
      "lighting": ["golden hour", "studio lighting", "neon lights", "candlelight", "moonlight"],
      "character_type": ["warrior", "mage", "schoolgirl", "ninja", "princess"],
      "art_style": ["cel-shaded", "watercolor", "sketch", "digital art", "retro anime"],
      "time_of_day": ["sunrise", "sunset", "golden hour", "blue hour", "midday"],
      "terrain_type": ["mountains", "desert", "forest", "ocean", "snowy peaks"],
      "weather": ["clear sky", "dramatic clouds", "fog", "storm", "aurora"]
    },
    negativePresets: [
      {
        id: "quality_basic",
        name: "Basic Quality",
        prompt: "low quality, blurry, low resolution, pixelated"
      },
      {
        id: "quality_strict",
        name: "Strict Quality",
        prompt: "low quality, blurry, low resolution, pixelated, jpeg artifacts, watermark, signature, text, amateur"
      },
      {
        id: "anatomy_fix",
        name: "Anatomy Fixer",
        prompt: "bad anatomy, extra limbs, missing limbs, deformed hands, extra fingers, missing fingers"
      },
      {
        id: "realistic_avoid",
        name: "Avoid Realism",
        prompt: "photorealistic, photo, realistic, 3d render"
      }
    ]
  };

  // Get all prompt templates
  app.get("/api/prompts/templates", (_req, res) => {
    res.json({ 
      templates: promptLibrary.templates,
      count: promptLibrary.templates.length
    });
  });

  // Get single template by ID
  app.get("/api/prompts/templates/:id", (req, res) => {
    const template = promptLibrary.templates.find(t => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json({ template });
  });

  // Search templates by category or tags
  app.get("/api/prompts/templates/search", (req, res) => {
    const { category, tag, query } = req.query;
    let filtered = promptLibrary.templates;
    
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }
    if (tag) {
      filtered = filtered.filter(t => t.tags && t.tags.includes(tag));
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.prompt.toLowerCase().includes(q)
      );
    }
    
    res.json({ templates: filtered, count: filtered.length });
  });

  // Add new template
  app.post("/api/prompts/templates", (req, res) => {
    const { name, prompt, negativePrompt, category, variables, tags } = req.body;
    
    if (!name || !prompt) {
      return res.status(400).json({ error: "name and prompt are required" });
    }
    
    const newTemplate = {
      id: `custom_${Date.now()}`,
      name,
      prompt,
      negativePrompt: negativePrompt || "",
      category: category || "custom",
      variables: variables || [],
      tags: tags || []
    };
    
    promptLibrary.templates.push(newTemplate);
    res.json({ template: newTemplate, message: "Template created successfully" });
  });

  // Get all wildcards
  app.get("/api/prompts/wildcards", (_req, res) => {
    res.json({ 
      wildcards: promptLibrary.wildcards,
      categories: Object.keys(promptLibrary.wildcards)
    });
  });

  // Get specific wildcard options
  app.get("/api/prompts/wildcards/:category", (req, res) => {
    const options = promptLibrary.wildcards[req.params.category];
    if (!options) {
      return res.status(404).json({ error: "Wildcard category not found" });
    }
    res.json({ category: req.params.category, options });
  });

  // Process template with variables and wildcards
  app.post("/api/prompts/process", (req, res) => {
    const { templateId, variables, useWildcards } = req.body;
    
    const template = promptLibrary.templates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    let processed = template.prompt;
    
    // Replace variables
    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        processed = processed.replace(regex, variables[key]);
      });
    }
    
    // Replace wildcards with random selections
    if (useWildcards) {
      Object.keys(promptLibrary.wildcards).forEach(category => {
        const regex = new RegExp(`\\{${category}\\}`, 'g');
        if (processed.match(regex)) {
          const options = promptLibrary.wildcards[category];
          const randomOption = options[Math.floor(Math.random() * options.length)];
          processed = processed.replace(regex, randomOption);
        }
      });
    }
    
    res.json({
      original: template.prompt,
      processed,
      negativePrompt: template.negativePrompt,
      usedTemplate: template.name
    });
  });

  // Get all negative prompt presets
  app.get("/api/prompts/negative-presets", (_req, res) => {
    res.json({ 
      presets: promptLibrary.negativePresets,
      count: promptLibrary.negativePresets.length
    });
  });

  // Combine multiple negative presets
  app.post("/api/prompts/negative-presets/combine", (req, res) => {
    const { presetIds } = req.body;
    
    if (!Array.isArray(presetIds) || presetIds.length === 0) {
      return res.status(400).json({ error: "presetIds array is required" });
    }
    
    const presets = promptLibrary.negativePresets.filter(p => presetIds.includes(p.id));
    if (presets.length === 0) {
      return res.status(404).json({ error: "No matching presets found" });
    }
    
    const combined = presets.map(p => p.prompt).join(", ");
    
    res.json({
      combined,
      usedPresets: presets.map(p => p.name),
      count: presets.length
    });
  });

  // Performance Optimization APIs
  
  // WebSocket message batching configuration
  const wsMessageBatcher = {
    enabled: true,
    batchInterval: 50, // milliseconds
    maxBatchSize: 10,
    pendingMessages: [],
    timer: null
  };

  // HLS segment cache
  const hlsCache = {
    enabled: true,
    maxAge: 30000, // 30 seconds
    segments: new Map(), // segment name -> {data, timestamp}
    maxSize: 50 // max cached segments
  };

  // Batch generation queue
  const batchQueue = {
    enabled: true,
    maxBatchSize: 4,
    pending: [],
    processing: false
  };

  // Get performance settings
  app.get("/api/performance/settings", (_req, res) => {
    res.json({
      websocket: {
        batching: wsMessageBatcher.enabled,
        batchInterval: wsMessageBatcher.batchInterval,
        maxBatchSize: wsMessageBatcher.maxBatchSize
      },
      hls: {
        caching: hlsCache.enabled,
        maxAge: hlsCache.maxAge,
        maxSize: hlsCache.maxSize,
        currentSize: hlsCache.segments.size
      },
      batchGeneration: {
        enabled: batchQueue.enabled,
        maxBatchSize: batchQueue.maxBatchSize,
        pendingCount: batchQueue.pending.length
      }
    });
  });

  // Update performance settings
  app.post("/api/performance/settings", (req, res) => {
    const { websocket, hls, batchGeneration } = req.body;
    
    if (websocket) {
      if (typeof websocket.batching === 'boolean') {
        wsMessageBatcher.enabled = websocket.batching;
      }
      if (typeof websocket.batchInterval === 'number' && websocket.batchInterval >= 10) {
        wsMessageBatcher.batchInterval = websocket.batchInterval;
      }
      if (typeof websocket.maxBatchSize === 'number' && websocket.maxBatchSize > 0) {
        wsMessageBatcher.maxBatchSize = websocket.maxBatchSize;
      }
    }
    
    if (hls) {
      if (typeof hls.caching === 'boolean') {
        hlsCache.enabled = hls.caching;
      }
      if (typeof hls.maxAge === 'number' && hls.maxAge > 0) {
        hlsCache.maxAge = hls.maxAge;
      }
      if (typeof hls.maxSize === 'number' && hls.maxSize > 0) {
        hlsCache.maxSize = hls.maxSize;
      }
    }
    
    if (batchGeneration) {
      if (typeof batchGeneration.enabled === 'boolean') {
        batchQueue.enabled = batchGeneration.enabled;
      }
      if (typeof batchGeneration.maxBatchSize === 'number' && batchGeneration.maxBatchSize > 0) {
        batchQueue.maxBatchSize = batchGeneration.maxBatchSize;
      }
    }
    
    res.json({ success: true, message: "Performance settings updated" });
  });

  // Clear HLS cache
  app.post("/api/performance/hls/clear-cache", (_req, res) => {
    const clearedCount = hlsCache.segments.size;
    hlsCache.segments.clear();
    console.log(`[hls-cache] Cleared ${clearedCount} cached segments`);
    res.json({ success: true, clearedCount });
  });

  // Get HLS cache stats
  app.get("/api/performance/hls/cache-stats", (_req, res) => {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    
    hlsCache.segments.forEach((entry) => {
      if (now - entry.timestamp < hlsCache.maxAge) {
        validCount++;
      } else {
        expiredCount++;
      }
    });
    
    res.json({
      total: hlsCache.segments.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: hlsCache.maxSize,
      maxAge: hlsCache.maxAge
    });
  });

  // Batch generation API
  app.post("/api/performance/batch-generate", async (req, res) => {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: "requests array is required" });
    }
    
    if (requests.length > batchQueue.maxBatchSize) {
      return res.status(400).json({ 
        error: `Batch size ${requests.length} exceeds maximum ${batchQueue.maxBatchSize}` 
      });
    }
    
    if (!batchQueue.enabled) {
      return res.status(503).json({ error: "Batch generation is disabled" });
    }
    
    // Add to queue
    const batchId = `batch_${Date.now()}`;
    const batch = {
      id: batchId,
      requests,
      status: 'queued',
      queuedAt: new Date().toISOString()
    };
    
    batchQueue.pending.push(batch);
    
    console.log(`[batch] Queued batch ${batchId} with ${requests.length} requests`);
    
    res.json({
      batchId,
      status: 'queued',
      requestCount: requests.length,
      position: batchQueue.pending.length
    });
  });

  // Get batch generation status
  app.get("/api/performance/batch-generate/:batchId", (req, res) => {
    const batch = batchQueue.pending.find(b => b.id === req.params.batchId);
    
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    
    res.json({
      batchId: batch.id,
      status: batch.status,
      requestCount: batch.requests.length,
      queuedAt: batch.queuedAt,
      processedAt: batch.processedAt,
      completedAt: batch.completedAt
    });
  });

  // Get performance metrics
  app.get("/api/performance/metrics", (_req, res) => {
    const metrics = {
      websocket: {
        pendingMessages: wsMessageBatcher.pendingMessages.length,
        batchingEnabled: wsMessageBatcher.enabled
      },
      hls: {
        cachedSegments: hlsCache.segments.size,
        cachingEnabled: hlsCache.enabled
      },
      batchQueue: {
        pendingBatches: batchQueue.pending.length,
        enabled: batchQueue.enabled
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  });

  gpuPool.attachRoutes(app);

  // Runs browser API
  const runsDir = opts.runsDir || process.env.RUNS_DIR || "/data/runs";
  
  function loadRunManifest(runPath) {
    const manifestPath = path.join(runPath, "run.json");
    if (!fs.existsSync(manifestPath)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      return { ...data, run_id: path.basename(runPath), manifest_path: manifestPath };
    } catch {
      return null;
    }
  }

  async function listRuns() {
    try {
      await fsp.access(runsDir);
    } catch {
      return [];
    }
    const entries = await fsp.readdir(runsDir, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    const runs = await Promise.all(
      dirs.map(async (name) => {
        const runPath = path.join(runsDir, name);
        const manifestPath = path.join(runPath, "run.json");
        try {
          const raw = await fsp.readFile(manifestPath, "utf-8");
          const data = JSON.parse(raw);
          const manifest = { ...data, run_id: name, manifest_path: manifestPath };
          const thumbPath = path.join(runPath, "thumb.png");
          try {
            await fsp.access(thumbPath);
            manifest.has_thumbnail = true;
          } catch { /* no thumb */ }
          if (manifest.last_frame) {
            try {
              await fsp.access(manifest.last_frame);
              manifest.last_frame_exists = true;
            } catch { /* missing */ }
          }
          return manifest;
        } catch {
          return null;
        }
      })
    );
    return runs.filter(Boolean).sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""));
  }

  // Collaborative features API
  app.get("/api/collab/users", (_req, res) => {
    const users = Array.from(connectedUsers.values()).map(u => ({
      id: u.id,
      name: u.name,
      connectedAt: u.connectedAt,
    }));
    res.json({ users, count: users.length });
  });

  app.get("/api/collab/locks", (_req, res) => {
    const locks = {};
    for (const [param, lock] of parameterLocks.entries()) {
      locks[param] = { userId: lock.userId, userName: lock.userName };
    }
    res.json({ locks });
  });

  app.get("/api/collab/recordings", (_req, res) => {
    const recordingsPath = path.join(__dirname, "recordings");
    try {
      if (!require('fs').existsSync(recordingsPath)) {
        return res.json({ recordings: [] });
      }
      const files = require('fs').readdirSync(recordingsPath)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const stat = require('fs').statSync(path.join(recordingsPath, f));
          return {
            filename: f,
            size: stat.size,
            createdAt: stat.mtime.toISOString(),
          };
        });
      res.json({ recordings: files });
    } catch (err) {
      res.json({ recordings: [] });
    }
  });

  app.post("/api/collab/recordings/:filename/play", async (req, res) => {
    const { filename } = req.params;
    const recordingsPath = path.join(__dirname, "recordings");
    const filepath = path.join(recordingsPath, filename);
    try {
      const recording = JSON.parse(require('fs').readFileSync(filepath, 'utf-8'));
      broadcast({ type: "playback", status: "started", events: recording.events.length });
      for (const event of recording.events) {
        setTimeout(() => {
          if (event.type === "control") {
            broadcast({ type: "event", msg: "playback", payload: event.payload });
          }
        }, event.timestamp);
      }
      res.json({ success: true, events: recording.events.length });
    } catch (err) {
      res.status(404).json({ error: "Recording not found" });
    }
  });

  app.delete("/api/collab/recordings/:filename", async (req, res) => {
    const { filename } = req.params;
    const recordingsPath = path.join(__dirname, "recordings");
    const filepath = path.join(recordingsPath, filename);
    try {
      require('fs').unlinkSync(filepath);
      res.json({ success: true });
    } catch (err) {
      res.status(404).json({ error: "Recording not found" });
    }
  });

  // AI Assistant API endpoints (stdin JSON bridge — audit A-11)
  app.post("/api/ai/prompt-suggestions", async (req, res) => {
    const { current_prompt, category, limit } = req.body || {};
    if (!current_prompt) return res.status(400).json({ error: "current_prompt required" });
    try {
      const suggestions = await invokeAi("prompt_suggestions", { current_prompt, category, limit });
      res.json({ suggestions: suggestions || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/improve-prompt", async (req, res) => {
    const { current_prompt, style } = req.body || {};
    if (!current_prompt) return res.status(400).json({ error: "current_prompt required" });
    try {
      const improved = await invokeAi("improve_prompt", { current_prompt, style });
      res.json({ improved_prompt: typeof improved === "string" ? improved : String(improved || "") });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/parameter-recommendations", async (req, res) => {
    const { current_params, style } = req.body || {};
    if (!current_params) return res.status(400).json({ error: "current_params required" });
    try {
      const recommendations = await invokeAi("parameter_recommendations", { current_params, style });
      res.json({ recommendations: recommendations || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/auto-tune", async (req, res) => {
    const { current_params, feedback_score } = req.body || {};
    if (!current_params || feedback_score === undefined) {
      return res.status(400).json({ error: "current_params and feedback_score required" });
    }
    try {
      const tuned_params = await invokeAi("auto_tune", { current_params, feedback_score });
      res.json({ tuned_params: tuned_params || current_params });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/style-recommendations", async (req, res) => {
    const { current_prompt, limit } = req.body || {};
    if (!current_prompt) return res.status(400).json({ error: "current_prompt required" });
    try {
      const styles = await invokeAi("style_recommendations", { current_prompt, limit });
      res.json({ styles: styles || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/apply-style", async (req, res) => {
    const { current_prompt, current_negative, style_name } = req.body || {};
    if (!current_prompt || !style_name) {
      return res.status(400).json({ error: "current_prompt and style_name required" });
    }
    try {
      const result = await invokeAi("apply_style", { current_prompt, current_negative, style_name });
      res.json(result || { prompt: current_prompt, negative_prompt: current_negative });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/analyze-frame", async (req, res) => {
    const { frame_data } = req.body || {};
    if (!frame_data) return res.status(400).json({ error: "frame_data required" });
    try {
      const result = await invokeAi("analyze_frame", { frame_data });
      res.json(result || { anomalies: [], is_ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ai/anomaly-summary", async (_req, res) => {
    try {
      const summary = await invokeAi("anomaly_summary", {});
      res.json(summary || { total_frames: 0, anomalous_frames: 0, anomaly_rate: 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/story/generate", async (req, res) => {
    try {
      const story = await generateStoryWithOllama(req.body || {});
      res.json(story);
    } catch (err) {
      res.status(502).json({ error: err.message });
    }
  });

  // Local LLM API endpoints
  let llmState = {
    type: process.env.LLM_TYPE || "ollama",
    serverUrl: process.env.OLLAMA_BASE_URL || "http://192.168.2.104:11434",
    loadedModel: process.env.OLLAMA_MODEL || null,
    running: false,
    childProcess: null,
    params: {
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      contextLength: 4096,
      gpuLayers: 35,
      threads: 8,
    },
  };

  app.get("/api/llm/status", async (_req, res) => {
    res.json({
      status: {
        connected: llmState.running,
        message: llmState.running ? "Running" : "Stopped",
      },
      loadedModel: llmState.loadedModel || "",
      memory: { used: 0, total: 0, percent: 0 },
    });
  });

  app.post("/api/llm/start", async (req, res) => {
    const { type, url } = req.body || {};
    if (llmState.running) {
      return res.json({ success: false, message: "LLM already running" });
    }
    llmState.type = type || llmState.type;
    llmState.serverUrl = url || llmState.serverUrl;
    res.json({ success: true, message: `LLM server start requested (${llmState.type})` });
  });

  app.post("/api/llm/stop", async (_req, res) => {
    if (!llmState.running) {
      return res.json({ success: false, message: "LLM not running" });
    }
    if (llmState.childProcess) {
      llmState.childProcess.kill();
      llmState.childProcess = null;
    }
    llmState.running = false;
    res.json({ success: true, message: "LLM server stopped" });
  });

  app.get("/api/llm/models", async (_req, res) => {
    try {
      if (llmState.type === "ollama") {
        const target = `${String(llmState.serverUrl || "").replace(/\/+$/, "")}/api/tags`;
        const response = await fetch(target, { method: "GET", signal: AbortSignal.timeout(5000) });
        const payload = await response.json();
        const models = (payload.models || []).map((model) => ({
          name: model.name,
          size: model.size != null ? `${(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : "",
        }));
        return res.json({ models });
      }
      const modelsDir = path.join(__dirname, "llm-models");
      if (!require('fs').existsSync(modelsDir)) {
        return res.json({ models: [] });
      }
      const files = require('fs').readdirSync(modelsDir)
        .filter(f => f.endsWith('.gguf') || f.endsWith('.bin'))
        .map(f => {
          const stat = require('fs').statSync(path.join(modelsDir, f));
          return {
            name: f,
            size: (stat.size / (1024 * 1024 * 1024)).toFixed(2) + " GB",
          };
        });
      res.json({ models: files });
    } catch (err) {
      res.json({ models: [] });
    }
  });

  app.post("/api/llm/load", async (req, res) => {
    const { model, params } = req.body || {};
    if (!model) {
      return res.status(400).json({ error: "model required" });
    }
    llmState.loadedModel = model;
    if (params) {
      llmState.params = { ...llmState.params, ...params };
    }
    res.json({ success: true, message: `Model ${model} loaded` });
  });

  app.post("/api/llm/unload", async (_req, res) => {
    llmState.loadedModel = null;
    res.json({ success: true, message: "Model unloaded" });
  });

  app.post("/api/llm/config", async (req, res) => {
    const { type, serverUrl, params } = req.body || {};
    if (type) llmState.type = type;
    if (serverUrl) llmState.serverUrl = serverUrl;
    if (params) llmState.params = { ...llmState.params, ...params };
    res.json({ success: true, message: "Config saved" });
  });

  app.post("/api/llm/test", async (req, res) => {
    const { url } = req.body || {};
    const testUrl = url || llmState.serverUrl;
    try {
      const target =
        llmState.type === "ollama"
          ? `${String(testUrl || "").replace(/\/+$/, "")}/api/tags`
          : testUrl;
      const response = await fetch(target, { method: "GET", signal: AbortSignal.timeout(3000) });
      res.json({ success: response.ok, message: response.ok ? "Connection successful" : "Connection failed" });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // Frame interpolation API endpoints
  app.post("/api/interpolate", async (req, res) => {
    const { input_dir, output_dir, factor, method } = req.body || {};
    if (!input_dir || !output_dir) {
      return res.status(400).json({ error: "input_dir and output_dir required" });
    }
    try {
      const { exec } = require('child_process');
      const cmd = [
        "python3", "-m", "defora_cli.frame_interpolator", "interpolate",
        "--input-dir", input_dir,
        "--output-dir", output_dir,
        "--factor", String(factor || 2),
        "--method", method || "blend",
      ];
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // WebRTC streaming API endpoints
  app.post("/api/webrtc/start", async (req, res) => {
    const { fps, resolution, port } = req.body || {};
    try {
      const framesDir = process.env.FRAMES_DIR || path.join(__dirname, "frames");
      const cmd = ["python3", "-m", "defora_cli.stream_helper", "webrtc",
                   "--source", framesDir,
                   "--fps", String(fps || 24)];
      if (resolution) cmd.push("--resolution", resolution);
      if (port) cmd.push("--port", String(port));
      
      const { exec } = require('child_process');
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout, url: `http://localhost:${port || 8088}` });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/webrtc/stop", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.stream_helper stop-webrtc", (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/webrtc/status", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.stream_helper webrtc-status", (error, stdout, stderr) => {
        res.json({
          status: error ? "stopped" : "running",
          output: stdout,
        });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Advanced Synchronization API endpoints
  app.post("/api/sync/ableton-link", async (req, res) => {
    const { bpm, mediator_host, mediator_port, fps } = req.body || {};
    try {
      const { exec } = require('child_process');
      const cmd = ["python3", "-m", "defora_cli.ableton_link", "sync",
                   "--bpm", String(bpm || 120)];
      if (mediator_host) cmd.push("--mediator-host", mediator_host);
      if (mediator_port) cmd.push("--mediator-port", mediator_port);
      if (fps) cmd.push("--fps", String(fps));
      
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/sync/ableton-link/status", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.ableton_link status", (error, stdout, stderr) => {
        if (error) {
          return res.json({ status: "stopped", error: stderr || stdout });
        }
        try {
          const status = JSON.parse(stdout);
          res.json({ status: "running", ...status });
        } catch (e) {
          res.json({ status: "unknown", output: stdout });
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/sync/timecode", async (req, res) => {
    const { mode, fps, midi_device, mediator_host, mediator_port } = req.body || {};
    if (!mode || !["ltc", "mtc"].includes(mode)) {
      return res.status(400).json({ error: "mode required (ltc or mtc)" });
    }
    try {
      const { exec } = require('child_process');
      const cmd = ["python3", "-m", "defora_cli.timecode_sync", mode,
                   "--fps", String(fps || 24)];
      if (midi_device) cmd.push("--midi-device", midi_device);
      if (mediator_host) cmd.push("--mediator-host", mediator_host);
      if (mediator_port) cmd.push("--mediator-port", mediator_port);
      
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/sync/timecode/status", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.timecode_sync status", (error, stdout, stderr) => {
        if (error) {
          return res.json({ status: "stopped", error: stderr || stdout });
        }
        try {
          const status = JSON.parse(stdout);
          res.json({ status: "running", ...status });
        } catch (e) {
          res.json({ status: "unknown", output: stdout });
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cloud GPU API endpoints
  app.post("/api/cloud-gpu/provision", async (req, res) => {
    const { provider, gpu_type, pool_name, count, max_cost } = req.body || {};
    if (!provider || !gpu_type || !pool_name) {
      return res.status(400).json({ error: "provider, gpu_type, and pool_name required" });
    }
    try {
      const { exec } = require('child_process');
      const cmd = ["python3", "-m", "defora_cli.cloud_gpu", "provision",
                   "--provider", provider,
                   "--gpu-type", gpu_type,
                   "--pool-name", pool_name];
      if (count) cmd.push("--count", String(count));
      if (max_cost) cmd.push("--max-cost", String(max_cost));
      
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/cloud-gpu/status", async (req, res) => {
    const { pool_name } = req.query || {};
    if (!pool_name) {
      return res.status(400).json({ error: "pool_name required" });
    }
    try {
      const { exec } = require('child_process');
      exec(`python3 -m defora_cli.cloud_gpu status --pool-name ${pool_name}`, (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        try {
          const status = JSON.parse(stdout);
          res.json(status);
        } catch (e) {
          res.json({ output: stdout });
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/cloud-gpu/stop", async (req, res) => {
    const { pool_name } = req.body || {};
    if (!pool_name) {
      return res.status(400).json({ error: "pool_name required" });
    }
    try {
      const { exec } = require('child_process');
      exec(`python3 -m defora_cli.cloud_gpu stop --pool-name ${pool_name}`, (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/cloud-gpu/cost-estimate", async (req, res) => {
    const { provider, gpu_type, hours } = req.query || {};
    if (!provider || !gpu_type) {
      return res.status(400).json({ error: "provider and gpu_type required" });
    }
    try {
      const { exec } = require('child_process');
      const cmd = ["python3", "-m", "defora_cli.cloud_gpu", "cost-estimate",
                   "--provider", provider,
                   "--gpu-type", gpu_type,
                   "--hours", String(hours || 8)];
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ estimate: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DMX Lighting Control API endpoints
  app.post("/api/dmx/start", async (req, res) => {
    const { interface_type, universe, fps, broadcast_ip } = req.body || {};
    if (!interface_type || !["artnet", "sacn", "openrgb"].includes(interface_type)) {
      return res.status(400).json({ error: "interface_type required (artnet, sacn, or openrgb)" });
    }
    try {
      const { exec } = require('child_process');
      const cmd = ["python3", "-m", "defora_cli.dmx_control", interface_type];
      if (universe) cmd.push("--universe", String(universe));
      if (fps) cmd.push("--fps", String(fps));
      if (broadcast_ip && interface_type === "artnet") cmd.push("--ip", broadcast_ip);
      
      exec(cmd.join(" "), (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr || stdout });
        }
        res.json({ success: true, message: stdout });
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/dmx/status", async (_req, res) => {
    try {
      const { exec } = require('child_process');
      exec("python3 -m defora_cli.dmx_control status", (error, stdout, stderr) => {
        if (error) {
          return res.json({ status: "stopped", error: stderr || stdout });
        }
        try {
          const status = JSON.parse(stdout);
          res.json({ status: "running", ...status });
        } catch (e) {
          res.json({ status: "unknown", output: stdout });
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/runs", async (req, res) => {
    const runs = await listRuns();
    const { status, tag, model, search, sort, order } = req.query;
    
    let filtered = runs;
    
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (tag) {
      filtered = filtered.filter(r => r.tag && r.tag.toLowerCase().includes(tag.toLowerCase()));
    }
    if (model) {
      filtered = filtered.filter(r => r.model && r.model.toLowerCase().includes(model.toLowerCase()));
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.run_id || "").toLowerCase().includes(s) ||
        (r.tag || "").toLowerCase().includes(s) ||
        (r.model || "").toLowerCase().includes(s) ||
        (r.prompt_positive || "").toLowerCase().includes(s) ||
        (r.notes || "").toLowerCase().includes(s)
      );
    }
    
    if (sort) {
      const reverse = order === "desc";
      filtered.sort((a, b) => {
        let va = a[sort] || "";
        let vb = b[sort] || "";
        if (typeof va === "number" && typeof vb === "number") {
          return reverse ? vb - va : va - vb;
        }
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
        return reverse ? vb.localeCompare(va) : va.localeCompare(vb);
      });
    }
    
    res.json({ runs: filtered, total: runs.length, filtered: filtered.length });
  });

  app.get("/api/runs/:runId", (req, res) => {
    const runPath = path.join(runsDir, req.params.runId);
    const manifest = loadRunManifest(runPath);
    if (!manifest) {
      return res.status(404).json({ error: "Run not found" });
    }
    
    // Get frame list
    const frames = [];
    if (fs.existsSync(runPath)) {
      const entries = fs.readdirSync(runPath);
      for (const entry of entries) {
        if (entry.match(/^frame_\d+\.png$/)) {
          frames.push(entry);
        }
      }
    }
    
    manifest.frames = frames.sort();
    res.json(manifest);
  });

  app.get("/api/runs/:runId/thumb", (req, res) => {
    const runPath = path.join(runsDir, req.params.runId);
    const thumbPath = path.join(runPath, "thumb.png");
    if (!fs.existsSync(thumbPath)) {
      // Try to find any frame
      const entries = fs.readdirSync(runPath).filter(e => e.match(/^frame_\d+\.png$/)).sort();
      if (entries.length > 0) {
        const framePath = path.join(runPath, entries[0]);
        return res.sendFile(framePath);
      }
      return res.status(404).json({ error: "No thumbnail found" });
    }
    res.sendFile(thumbPath);
  });

  app.get("/api/runs/:runId/frames/:frameName", (req, res) => {
    const framePath = path.join(runsDir, req.params.runId, req.params.frameName);
    if (!fs.existsSync(framePath) || !framePath.startsWith(runsDir)) {
      return res.status(404).json({ error: "Frame not found" });
    }
    res.sendFile(framePath);
  });

  app.put("/api/runs/:runId", (req, res) => {
    const runPath = path.join(runsDir, req.params.runId);
    const manifestPath = path.join(runPath, "run.json");
    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: "Run not found" });
    }
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const { tag, notes, metadata } = req.body;
      if (tag !== undefined) manifest.tag = tag;
      if (notes !== undefined) manifest.notes = notes;
      if (metadata !== undefined) manifest.metadata = { ...manifest.metadata, ...metadata };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/runs/:runId", (req, res) => {
    const runPath = path.join(runsDir, req.params.runId);
    if (!fs.existsSync(runPath)) {
      return res.status(404).json({ error: "Run not found" });
    }
    
    try {
      fs.rmSync(runPath, { recursive: true, force: true });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const RUN_COMPARE_FIELDS = [
    "status", "model", "frame_count", "seed", "steps", "strength", "cfg", "tag", "notes",
    "prompt_positive", "prompt_negative", "started_at",
  ];

  function buildRunComparison(runIds, runs) {
    const selected = runIds
      .map((id) => runs.find((r) => r.run_id === id))
      .filter(Boolean);
    const matrix = {};
    for (const field of RUN_COMPARE_FIELDS) {
      matrix[field] = {};
      for (const run of selected) {
        matrix[field][run.run_id] = run[field] != null ? run[field] : null;
      }
    }
    return { run_ids: selected.map((r) => r.run_id), fields: RUN_COMPARE_FIELDS, matrix, runs: selected };
  }

  app.post("/api/runs/compare", async (req, res) => {
    const { run_ids: runIds, format } = req.body || {};
    if (!Array.isArray(runIds) || runIds.length < 2) {
      return res.status(400).json({ error: "run_ids array with at least 2 ids required" });
    }
    if (runIds.length > 8) {
      return res.status(400).json({ error: "maximum 8 runs per comparison" });
    }
    const runs = await listRuns();
    const comparison = buildRunComparison(runIds, runs);
    if (comparison.runs.length < 2) {
      return res.status(404).json({ error: "fewer than 2 valid run ids" });
    }
    if (format === "csv") {
      const header = ["field", ...comparison.run_ids];
      const rows = [header.join(",")];
      for (const field of comparison.fields) {
        const row = [field, ...comparison.run_ids.map((id) => {
          const val = comparison.matrix[field][id];
          return `"${String(val != null ? val : "").replace(/"/g, '""')}"`;
        })];
        rows.push(row.join(","));
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=runs_comparison.csv");
      return res.send(rows.join("\n"));
    }
    res.json({ comparison });
  });

  app.get("/api/runs/export", async (req, res) => {
    const runs = await listRuns();
    const format = req.query.format || "json";
    
    if (format === "csv") {
      const headers = ["run_id", "status", "started_at", "model", "frame_count", "tag", "seed", "steps", "strength", "cfg", "notes", "prompt_positive", "prompt_negative"];
      const csvRows = [headers.join(",")];
      for (const run of runs) {
        const row = headers.map(h => {
          const val = run[h] !== undefined ? String(run[h]).replace(/"/g, '""') : "";
          return `"${val}"`;
        });
        csvRows.push(row.join(","));
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=runs_export.csv");
      res.send(csvRows.join("\n"));
    } else {
      res.json({ runs });
    }
  });

  app.post("/api/runs/:runId/rerun", async (req, res) => {
    const runPath = path.join(runsDir, req.params.runId);
    const manifest = loadRunManifest(runPath);
    if (!manifest) {
      return res.status(404).json({ error: "Run not found" });
    }
    
    const { overrides } = req.body || {};
    const rerunRequest = {
      mode: "rerun",
      run_id: manifest.run_id,
      original_manifest: manifest,
      overrides: overrides || {},
      created_at: new Date().toISOString(),
    };
    
    const requestPath = path.join(runPath, "rerun_request.json");
    fs.writeFileSync(requestPath, JSON.stringify(rerunRequest, null, 2));
    
    res.json({ success: true, request_path: requestPath });
  });

  app.post("/api/runs/:runId/continue", async (req, res) => {
    const runPath = path.join(runsDir, req.params.runId);
    const manifest = loadRunManifest(runPath);
    if (!manifest) {
      return res.status(404).json({ error: "Run not found" });
    }
    
    const { overrides, from_frame } = req.body || {};
    const continueRequest = {
      mode: "continue",
      run_id: manifest.run_id,
      original_manifest: manifest,
      from_frame: from_frame || manifest.frame_count,
      overrides: overrides || {},
      created_at: new Date().toISOString(),
    };
    
    const requestPath = path.join(runPath, "continue_request.json");
    fs.writeFileSync(requestPath, JSON.stringify(continueRequest, null, 2));
    
    res.json({ success: true, request_path: requestPath });
  });

  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`[web] API/WS listening on ${actualPort}`);
  });
  const actualPort = () => server.address() && server.address().port;
  const wss = new WebSocket.Server({ server, path: "/ws" });

  let amqpConn = null;
  let channel = null;
  async function setupQueue() {
    if (!enableMq) return;
    try {
      amqpConn = await amqp.connect(rabbitUrl);
      channel = await amqpConn.createChannel();
      await channel.assertQueue(queue, { durable: false });
      console.log("[mq] Connected to RabbitMQ");
    } catch (err) {
      console.error("[mq] connection failed", err);
      setTimeout(setupQueue, 2000);
    }
  }
  setupQueue();

  // Enhanced broadcast with batching support
  function broadcast(obj) {
    if (wsMessageBatcher.enabled && obj?.type !== "frame") {
      wsMessageBatcher.pendingMessages.push(obj);
      
      // Clear existing timer
      if (wsMessageBatcher.timer) {
        clearTimeout(wsMessageBatcher.timer);
      }
      
      // Send batch if it's full or set timer for interval
      if (wsMessageBatcher.pendingMessages.length >= wsMessageBatcher.maxBatchSize) {
        flushMessageBatch();
      } else {
        wsMessageBatcher.timer = setTimeout(flushMessageBatch, wsMessageBatcher.batchInterval);
      }
    } else {
      // Direct send without batching
      const msg = JSON.stringify(obj);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
      });
    }
  }

  function flushMessageBatch() {
    if (wsMessageBatcher.pendingMessages.length === 0) return;
    
    const batch = {
      type: "batch",
      messages: wsMessageBatcher.pendingMessages,
      count: wsMessageBatcher.pendingMessages.length,
      timestamp: Date.now()
    };
    
    const msg = JSON.stringify(batch);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
    
    wsMessageBatcher.pendingMessages = [];
    wsMessageBatcher.timer = null;
  }

  // Collaborative features: user presence, session recording, parameter locking
  const connectedUsers = new Map();
  const parameterLocks = new Map();
  let sessionRecording = null;
  let sessionRecordingActive = false;

  function startSessionRecording() {
    sessionRecording = {
      startTime: Date.now(),
      events: [],
    };
    sessionRecordingActive = true;
    console.log("[collab] Session recording started");
  }

  function stopSessionRecording() {
    sessionRecordingActive = false;
    if (sessionRecording) {
      const recordingPath = path.join(__dirname, "recordings");
      if (!require('fs').existsSync(recordingPath)) {
        require('fs').mkdirSync(recordingPath, { recursive: true });
      }
      const filename = `session_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filepath = path.join(recordingPath, filename);
      require('fs').writeFileSync(filepath, JSON.stringify(sessionRecording, null, 2));
      console.log(`[collab] Session recording saved to ${filepath}`);
      sessionRecording = null;
    }
  }

  function recordEvent(event) {
    if (sessionRecordingActive && sessionRecording) {
      sessionRecording.events.push({
        timestamp: Date.now() - sessionRecording.startTime,
        ...event,
      });
    }
  }

  function broadcastUserPresence() {
    const users = Array.from(connectedUsers.values()).map(u => ({
      id: u.id,
      name: u.name,
      connectedAt: u.connectedAt,
      lockedParams: Array.from(parameterLocks.entries())
        .filter(([_, lock]) => lock.userId === u.id)
        .map(([param, _]) => param),
    }));
    broadcast({ type: "presence", users });
  }

  wss.on("connection", (ws) => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    connectedUsers.set(userId, {
      id: userId,
      name: `User ${connectedUsers.size + 1}`,
      ws,
      connectedAt: new Date().toISOString(),
    });

    ws.send(JSON.stringify({ 
      type: "hello", 
      msg: "Connected to defora web control",
      userId,
    }));
    
    broadcastUserPresence();

    ws.on("message", async (raw) => {
      try {
        const payload = JSON.parse(raw.toString());
        
        // Handle collaborative messages
        if (payload.type === "identify") {
          const user = connectedUsers.get(userId);
          if (user) {
            user.name = payload.name || user.name;
            broadcastUserPresence();
          }
          return;
        }
        
        if (payload.type === "lock_param") {
          const { param } = payload;
          if (parameterLocks.has(param)) {
            const lock = parameterLocks.get(param);
            ws.send(JSON.stringify({ 
              type: "error", 
              msg: `Parameter "${param}" is locked by ${lock.userName}` 
            }));
            return;
          }
          const user = connectedUsers.get(userId);
          parameterLocks.set(param, { userId, userName: user?.name || 'Unknown' });
          recordEvent({ type: "lock", param, userId });
          broadcastUserPresence();
          return;
        }
        
        if (payload.type === "unlock_param") {
          const { param } = payload;
          const lock = parameterLocks.get(param);
          if (lock && lock.userId === userId) {
            parameterLocks.delete(param);
            recordEvent({ type: "unlock", param, userId });
            broadcastUserPresence();
          }
          return;
        }
        
        if (payload.type === "start_recording") {
          startSessionRecording();
          ws.send(JSON.stringify({ type: "recording", status: "started" }));
          return;
        }
        
        if (payload.type === "stop_recording") {
          stopSessionRecording();
          ws.send(JSON.stringify({ type: "recording", status: "stopped" }));
          return;
        }
        
        if (payload.type === "playback_recording") {
          const { recordingFile } = payload;
          const recordingsPath = path.join(__dirname, "recordings");
          const filepath = path.join(recordingsPath, recordingFile);
          try {
            const recording = JSON.parse(require('fs').readFileSync(filepath, 'utf-8'));
            ws.send(JSON.stringify({ 
              type: "playback", 
              status: "started",
              events: recording.events.length,
            }));
            // Playback events with timing
            for (const event of recording.events) {
              setTimeout(() => {
                if (event.type === "control") {
                  broadcast({ type: "event", msg: "playback", payload: event.payload });
                }
              }, event.timestamp);
            }
          } catch (err) {
            ws.send(JSON.stringify({ type: "error", msg: "Recording not found" }));
          }
          return;
        }
        
        if (payload.type === "list_recordings") {
          const recordingsPath = path.join(__dirname, "recordings");
          try {
            const files = require('fs').readdirSync(recordingsPath)
              .filter(f => f.endsWith('.json'))
              .map(f => ({
                filename: f,
                size: require('fs').statSync(path.join(recordingsPath, f)).size,
              }));
            ws.send(JSON.stringify({ type: "recordings", files }));
          } catch (err) {
            ws.send(JSON.stringify({ type: "recordings", files: [] }));
          }
          return;
        }
        
        if (payload.type !== "control") return;
        if (controlToken && payload.token !== controlToken) {
          ws.send(JSON.stringify({ type: "error", msg: "unauthorized" }));
          return;
        }
        
        // Check if any parameter in the control message is locked
        const lockedParams = [];
        if (payload.payload) {
          for (const param of Object.keys(payload.payload)) {
            if (parameterLocks.has(param)) {
              const lock = parameterLocks.get(param);
              if (lock.userId !== userId) {
                lockedParams.push({ param, lockedBy: lock.userName });
              }
            }
          }
        }
        
        if (lockedParams.length > 0) {
          ws.send(JSON.stringify({ 
            type: "error", 
            msg: "Parameters locked",
            locked: lockedParams,
          }));
          return;
        }
        
        if (!payload.controlType || typeof payload.payload !== "object") {
          ws.send(JSON.stringify({ type: "error", msg: "invalid schema" }));
          return;
        }
        const msg = { controlType: payload.controlType, payload: payload.payload };
        if (channel) {
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
        }
        broadcast({ type: "event", msg: "control forwarded", payload: msg });
        recordEvent({ type: "control", payload: msg, userId });
      } catch (err) {
        console.error("bad ws message", err);
      }
    });

    ws.on("close", () => {
      // Release all locks held by this user
      for (const [param, lock] of parameterLocks.entries()) {
        if (lock.userId === userId) {
          parameterLocks.delete(param);
        }
      }
      connectedUsers.delete(userId);
      broadcastUserPresence();
    });
  });

  let forgePollTimer = null;
  const sdForgePollMs = parseInt(process.env.SD_FORGE_POLL_MS || "0", 10);
  if (Number.isFinite(sdForgePollMs) && sdForgePollMs > 0) {
    probeSdForge().catch(() => {});
    forgePollTimer = setInterval(() => {
      probeSdForge().catch(() => {});
    }, sdForgePollMs);
  }

  let lastPlaylistMtime = 0;
  const pollTimer = setInterval(async () => {
    try {
      const stat = await fsp.stat(playlistPath);
      if (stat.mtimeMs > lastPlaylistMtime) {
        lastPlaylistMtime = stat.mtimeMs;
        broadcast({ type: "stream", src: hlsStream, updated: stat.mtimeMs });
      }
    } catch (err) {
      if (err.code !== "ENOENT") console.error("[hls] poll error", err);
    }
  }, 2000);

  let frameWatcher;
  try {
    fs.mkdirSync(framesDir, { recursive: true });
    frameWatcher = fs.watch(framesDir, { persistent: false }, (_, filename) => {
      if (!filename || !FRAME_FILE_RE.test(filename)) return;
      const match = FRAME_FILE_RE.exec(filename);
      const frame = match ? parseInt(match[1], 10) : null;
      const item = {
        src: `/frames/${filename}?v=${Date.now()}`,
        name: filename,
        frame,
        mtime: Date.now(),
      };
      updateFramesIndexCache(item);
      fsp.stat(framesDir)
        .then((stat) => {
          framesIndexCache.dirMtime = stat.mtimeMs;
          framesIndexCache.builtAt = Date.now();
        })
        .catch(() => {});
      broadcast({ type: "frame", file: item.src, item });
    });
  } catch (err) {
    console.error("[frames] watch error", err);
  }

  const close = async () => {
    clearInterval(pollTimer);
    if (forgePollTimer) clearInterval(forgePollTimer);
    clearInterval(cleanupTimer);
    if (gpuPool && typeof gpuPool.close === "function") gpuPool.close();
    if (frameWatcher && frameWatcher.close) frameWatcher.close();
    wss.clients.forEach((c) => {
      try {
        c.close();
      } catch (_) {}
    });
    await new Promise((resolve) => wss.close(resolve));
    await new Promise((resolve) => server.close(resolve));
    if (channel) {
      try {
        await channel.close();
      } catch (_) {}
    }
    if (amqpConn) {
      try {
        await amqpConn.close();
      } catch (_) {}
    }
  };

  return { app, server, wss, close, port: actualPort() };
}

if (require.main === module) {
  start();
}

module.exports = { start };
