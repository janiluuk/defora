#!/usr/bin/env node
const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const WebSocket = require("ws");
const amqp = require("amqplib");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");

async function start(opts = {}) {
  const port = opts.port ?? process.env.PORT ?? 3000;
  const rabbitUrl = opts.rabbitUrl || process.env.RABBIT_URL || "amqp://localhost";
  const controlToken = opts.controlToken ?? process.env.CONTROL_TOKEN ?? "";
  const queue = opts.queue || process.env.CONTROL_QUEUE || "controls";
  const framesDir = opts.framesDir || process.env.FRAMES_DIR || "/data/frames";
  const hlsStream = opts.hlsStream || process.env.HLS_STREAM || "/hls/live/deforum.m3u8";
  const hlsDir = opts.hlsDir || process.env.HLS_DIR || "/var/www/hls";
  const enableMq = opts.enableMq ?? (process.env.DISABLE_MQ ? false : true);
   const spawner = opts.spawner || spawn;

  const playlistPath = path.join(hlsDir, hlsStream.replace(/^\/hls\//, ""));

  // Track API availability status
  const apiStatus = {
    sdForgeAvailable: false,
    lastChecked: null,
    controlNetModels: null,
    loraModels: null,
    sdModels: null,
    currentModel: null,
  };

  function forgeBaseUrl() {
    const forgeHost = process.env.SD_FORGE_HOST || "sd-forge";
    const forgePort = process.env.SD_FORGE_PORT || "7860";
    return `http://${forgeHost}:${forgePort}`;
  }

  /** Lightweight SD-Forge reachability check (updates apiStatus). */
  async function probeSdForge() {
    if (typeof fetch === "undefined") return;
    const forgeUrl = forgeBaseUrl();
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
      const entries = await fsp.readdir(framesDir, { withFileTypes: true });
      const files = entries
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((name) => /\.(png|jpg|jpeg|webp)$/i.test(name));
      const stats = await Promise.all(
        files.map(async (name) => {
          const stat = await fsp.stat(path.join(framesDir, name));
          return { name, mtime: stat.mtimeMs };
        })
      );
      stats.sort((a, b) => b.mtime - a.mtime);
      const items = stats.slice(0, limit).map((f) => {
        const match = f.name.match(/(\d{3,})/);
        const frame = match ? parseInt(match.pop(), 10) : null;
        return { src: `/frames/${f.name}`, name: f.name, frame, mtime: f.mtime };
      });
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

  // ControlNet models API
  app.get("/api/controlnet/models", async (_req, res) => {
    const forgeHost = process.env.SD_FORGE_HOST || "sd-forge";
    const forgePort = process.env.SD_FORGE_PORT || "7860";
    const forgeUrl = `http://${forgeHost}:${forgePort}`;
    
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
  app.get("/api/sd-models", async (_req, res) => {
    const forgeHost = process.env.SD_FORGE_HOST || "sd-forge";
    const forgePort = process.env.SD_FORGE_PORT || "7860";
    const forgeUrl = `http://${forgeHost}:${forgePort}`;
    
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
        apiStatus.sdModels = enrichedModels;
        
        console.log(`[sd-models] Fetched ${enrichedModels.length} models from SD-Forge`);
        return res.json({ models: enrichedModels, source: 'sd-forge', cached: false });
      }
    } catch (err) {
      // API unavailable - use cache or placeholder
      apiStatus.sdForgeAvailable = false;
      apiStatus.lastChecked = new Date().toISOString();
      console.log(`[sd-models] SD-Forge API unavailable, using ${apiStatus.sdModels ? 'cached' : 'placeholder'} models: ${err.message}`);
      
      // Return cached models if available (with 5 minute cache validity)
      if (apiStatus.sdModels && apiStatus.lastChecked) {
        const cacheAge = new Date() - new Date(apiStatus.lastChecked);
        const fiveMinutes = 5 * 60 * 1000;
        if (cacheAge < fiveMinutes) {
          return res.json({ models: apiStatus.sdModels, source: 'cache', cached: true, cacheAge: Math.floor(cacheAge / 1000) });
        }
      }
    }
    
    res.json({ models: placeholderModels, source: 'placeholder', cached: false });
  });

  // Get current SD model
  app.get("/api/sd-models/current", async (_req, res) => {
    const forgeHost = process.env.SD_FORGE_HOST || "sd-forge";
    const forgePort = process.env.SD_FORGE_PORT || "7860";
    const forgeUrl = `http://${forgeHost}:${forgePort}`;
    
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
        };
        
        apiStatus.currentModel = currentModel;
        console.log(`[sd-models] Current model: ${currentModel.model_name}`);
        return res.json({ model: currentModel, source: 'sd-forge' });
      }
    } catch (err) {
      console.log(`[sd-models] Failed to get current model: ${err.message}`);
      
      // Return cached current model if available
      if (apiStatus.currentModel) {
        return res.json({ model: apiStatus.currentModel, source: 'cache' });
      }
    }
    
    res.json({ model: { model_name: "Unknown", title: "Unknown" }, source: 'placeholder' });
  });

  // Switch SD model
  app.post("/api/sd-models/switch", async (req, res) => {
    const forgeHost = process.env.SD_FORGE_HOST || "sd-forge";
    const forgePort = process.env.SD_FORGE_PORT || "7860";
    const forgeUrl = `http://${forgeHost}:${forgePort}`;
    
    const { model_name } = req.body;
    
    if (!model_name) {
      return res.status(400).json({ error: "model_name is required" });
    }
    
    try {
      if (typeof fetch === 'undefined') {
        throw new Error('fetch not available');
      }
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds for model loading
      
      const response = await fetch(`${forgeUrl}/sdapi/v1/options`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sd_model_checkpoint: model_name
        })
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        apiStatus.currentModel = { model_name, title: model_name };
        console.log(`[sd-models] Switched to model: ${model_name}`);
        return res.json({ 
          success: true, 
          message: `Switched to ${model_name}`,
          model: { model_name, title: model_name }
        });
      } else {
        const error = await response.text();
        throw new Error(`API returned ${response.status}: ${error}`);
      }
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
      recommended_steps: 24,
      recommended_sampler: "DPM++ 2M Karras",
      base_resolution: 512,
    };
    
    // Detect model type from name
    if (name.includes('sdxl') || name.includes('xl')) {
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
  app.get("/api/loras", async (_req, res) => {
    const forgeHost = process.env.SD_FORGE_HOST || "sd-forge";
    const forgePort = process.env.SD_FORGE_PORT || "7860";
    const forgeUrl = `http://${forgeHost}:${forgePort}`;
    
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
        
        console.log(`[loras] Fetched ${formattedLoras.length} LoRAs from SD-Forge`);
        return res.json({ loras: formattedLoras, source: 'sd-forge' });
      }
    } catch (err) {
      // API unavailable or timeout - fall back to placeholder
      console.log(`[loras] SD-Forge API unavailable, using placeholder LoRAs: ${err.message}`);
    }
    
    res.json({ loras: placeholderLoras, source: 'placeholder' });
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

  // Distributed Generation System
  
  const distributedPool = {
    enabled: process.env.DISTRIBUTED_ENABLED === 'true' || false,
    strategy: process.env.DISTRIBUTED_STRATEGY || 'round_robin',  // round_robin, least_busy, random, priority
    nodes: [],
    currentIndex: 0,
    healthCheckInterval: parseInt(process.env.DISTRIBUTED_HEALTH_CHECK_INTERVAL) || 30,
    timeout: parseInt(process.env.DISTRIBUTED_TIMEOUT) || 300,
    retryAttempts: parseInt(process.env.DISTRIBUTED_RETRY_ATTEMPTS) || 2,
    jobs: new Map(),  // jobId -> job info
    metrics: new Map()  // nodeUrl -> metrics
  };

  // Parse initial nodes from environment
  if (process.env.DISTRIBUTED_NODES) {
    const nodeUrls = process.env.DISTRIBUTED_NODES.split(',').map(u => u.trim()).filter(u => u);
    nodeUrls.forEach((url, idx) => {
      distributedPool.nodes.push({
        url,
        name: `Node-${idx + 1}`,
        status: 'unknown',
        activeJobs: 0,
        totalJobs: 0,
        priority: 1,
        lastHealthCheck: null,
        responseTime: null
      });
    });
  }

  // Configure distributed generation
  app.post("/api/distributed/configure", (req, res) => {
    const { enabled, strategy, nodes, healthCheckInterval, timeout, retryAttempts } = req.body;
    
    if (typeof enabled === 'boolean') {
      distributedPool.enabled = enabled;
    }
    if (strategy && ['round_robin', 'least_busy', 'random', 'priority'].includes(strategy)) {
      distributedPool.strategy = strategy;
    }
    if (Array.isArray(nodes)) {
      distributedPool.nodes = nodes.map(node => ({
        url: node.url,
        name: node.name || node.url,
        status: 'unknown',
        activeJobs: 0,
        totalJobs: 0,
        priority: node.priority || 1,
        gpuModel: node.gpuModel || null,
        lastHealthCheck: null,
        responseTime: null
      }));
    }
    if (typeof healthCheckInterval === 'number' && healthCheckInterval > 0) {
      distributedPool.healthCheckInterval = healthCheckInterval;
    }
    if (typeof timeout === 'number' && timeout > 0) {
      distributedPool.timeout = timeout;
    }
    if (typeof retryAttempts === 'number' && retryAttempts >= 0) {
      distributedPool.retryAttempts = retryAttempts;
    }
    
    console.log(`[distributed] Configuration updated: ${distributedPool.nodes.length} nodes, strategy: ${distributedPool.strategy}`);
    res.json({ success: true, message: "Distributed configuration updated", config: getDistributedConfig() });
  });

  // Get distributed pool status
  app.get("/api/distributed/status", (_req, res) => {
    const healthyNodes = distributedPool.nodes.filter(n => n.status === 'healthy').length;
    
    res.json({
      enabled: distributedPool.enabled,
      strategy: distributedPool.strategy,
      totalNodes: distributedPool.nodes.length,
      healthyNodes,
      nodes: distributedPool.nodes.map(n => ({
        url: n.url,
        name: n.name,
        status: n.status,
        activeJobs: n.activeJobs,
        totalJobs: n.totalJobs,
        priority: n.priority,
        gpuModel: n.gpuModel,
        lastHealthCheck: n.lastHealthCheck,
        responseTime: n.responseTime
      }))
    });
  });

  // Submit distributed generation job
  app.post("/api/distributed/generate", async (req, res) => {
    if (!distributedPool.enabled) {
      return res.status(503).json({ error: "Distributed generation is disabled" });
    }
    
    const { workflow, preferredNode, priority } = req.body;
    
    if (!workflow) {
      return res.status(400).json({ error: "workflow is required" });
    }
    
    // Select node based on strategy
    const node = selectNode(preferredNode);
    if (!node) {
      return res.status(503).json({ error: "No healthy nodes available" });
    }
    
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: jobId,
      nodeUrl: node.url,
      nodeName: node.name,
      workflow,
      priority: priority || 'normal',
      status: 'queued',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null
    };
    
    distributedPool.jobs.set(jobId, job);
    node.activeJobs++;
    node.totalJobs++;
    
    console.log(`[distributed] Job ${jobId} assigned to ${node.name} (${node.url})`);
    
    res.json({
      jobId,
      assignedNode: node.name,
      nodeUrl: node.url,
      status: 'queued',
      estimatedWaitTime: estimateWaitTime(node)
    });
  });

  // Get job status
  app.get("/api/distributed/jobs/:jobId", (req, res) => {
    const job = distributedPool.jobs.get(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.json(job);
  });

  // Health check all nodes
  app.post("/api/distributed/health-check", async (_req, res) => {
    const results = await performHealthCheck();
    res.json({
      success: true,
      checked: results.length,
      healthy: results.filter(r => r.healthy).length,
      results
    });
  });

  // Get distributed metrics
  app.get("/api/distributed/metrics", (_req, res) => {
    const nodeMetrics = distributedPool.nodes.map(node => {
      const metrics = distributedPool.metrics.get(node.url) || {
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0
      };
      
      return {
        url: node.url,
        name: node.name,
        activeJobs: node.activeJobs,
        totalJobs: node.totalJobs,
        successRate: metrics.successCount + metrics.failureCount > 0 
          ? (metrics.successCount / (metrics.successCount + metrics.failureCount) * 100).toFixed(2)
          : 0,
        avgResponseTime: metrics.avgResponseTime,
        status: node.status
      };
    });
    
    res.json({
      enabled: distributedPool.enabled,
      strategy: distributedPool.strategy,
      totalJobs: distributedPool.jobs.size,
      nodeMetrics
    });
  });

  // Disable node
  app.post("/api/distributed/nodes/:nodeId/disable", (req, res) => {
    const nodeId = decodeURIComponent(req.params.nodeId);
    const node = distributedPool.nodes.find(n => n.url === nodeId);
    
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }
    
    node.status = 'disabled';
    console.log(`[distributed] Node ${node.name} disabled`);
    res.json({ success: true, message: `Node ${node.name} disabled` });
  });

  // Enable node
  app.post("/api/distributed/nodes/:nodeId/enable", (req, res) => {
    const nodeId = decodeURIComponent(req.params.nodeId);
    const node = distributedPool.nodes.find(n => n.url === nodeId);
    
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }
    
    node.status = 'unknown';  // Will be checked on next health check
    console.log(`[distributed] Node ${node.name} enabled`);
    res.json({ success: true, message: `Node ${node.name} enabled` });
  });

  // Remove node
  app.delete("/api/distributed/nodes/:nodeId", (req, res) => {
    const nodeId = decodeURIComponent(req.params.nodeId);
    const index = distributedPool.nodes.findIndex(n => n.url === nodeId);
    
    if (index === -1) {
      return res.status(404).json({ error: "Node not found" });
    }
    
    const removed = distributedPool.nodes.splice(index, 1)[0];
    console.log(`[distributed] Node ${removed.name} removed from pool`);
    res.json({ success: true, message: `Node ${removed.name} removed` });
  });

  // Helper functions for distributed generation
  function selectNode(preferredNode) {
    const healthyNodes = distributedPool.nodes.filter(n => n.status === 'healthy');
    
    if (healthyNodes.length === 0) {
      return null;
    }
    
    // Check preferred node first
    if (preferredNode) {
      const preferred = healthyNodes.find(n => n.name === preferredNode || n.url === preferredNode);
      if (preferred) return preferred;
    }
    
    // Apply strategy
    switch (distributedPool.strategy) {
      case 'least_busy':
        return healthyNodes.reduce((min, node) => 
          node.activeJobs < min.activeJobs ? node : min
        );
      
      case 'random':
        return healthyNodes[Math.floor(Math.random() * healthyNodes.length)];
      
      case 'priority':
        const sorted = healthyNodes.sort((a, b) => a.priority - b.priority);
        return sorted[0];
      
      case 'round_robin':
      default:
        // Round robin through healthy nodes
        let attempts = 0;
        while (attempts < distributedPool.nodes.length) {
          const node = distributedPool.nodes[distributedPool.currentIndex];
          distributedPool.currentIndex = (distributedPool.currentIndex + 1) % distributedPool.nodes.length;
          
          if (node.status === 'healthy') {
            return node;
          }
          attempts++;
        }
        return healthyNodes[0];  // Fallback to first healthy
    }
  }

  function estimateWaitTime(node) {
    // Simple estimation: 30 seconds per active job
    return node.activeJobs * 30;
  }

  async function performHealthCheck() {
    const results = [];
    
    for (const node of distributedPool.nodes) {
      if (node.status === 'disabled') {
        results.push({ url: node.url, healthy: false, reason: 'disabled' });
        continue;
      }
      
      try {
        const startTime = Date.now();
        
        // Try to fetch system stats (ComfyUI endpoint)
        if (typeof fetch !== 'undefined') {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${node.url}/system_stats`, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            node.status = 'healthy';
            node.lastHealthCheck = new Date().toISOString();
            node.responseTime = responseTime;
            results.push({ url: node.url, healthy: true, responseTime });
          } else {
            node.status = 'unhealthy';
            results.push({ url: node.url, healthy: false, reason: `HTTP ${response.status}` });
          }
        } else {
          node.status = 'unknown';
          results.push({ url: node.url, healthy: false, reason: 'fetch not available' });
        }
      } catch (err) {
        node.status = 'unhealthy';
        node.lastHealthCheck = new Date().toISOString();
        results.push({ url: node.url, healthy: false, reason: err.message });
      }
    }
    
    return results;
  }

  function getDistributedConfig() {
    return {
      enabled: distributedPool.enabled,
      strategy: distributedPool.strategy,
      nodeCount: distributedPool.nodes.length,
      healthCheckInterval: distributedPool.healthCheckInterval,
      timeout: distributedPool.timeout,
      retryAttempts: distributedPool.retryAttempts
    };
  }

  // Periodic health check
  if (distributedPool.enabled && distributedPool.nodes.length > 0) {
    setInterval(async () => {
      console.log('[distributed] Performing periodic health check...');
      await performHealthCheck();
    }, distributedPool.healthCheckInterval * 1000);
  }

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
    if (wsMessageBatcher.enabled) {
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

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "hello", msg: "Connected to defora web control" }));

    ws.on("message", async (raw) => {
      try {
        const payload = JSON.parse(raw.toString());
        if (payload.type !== "control") return;
        if (controlToken && payload.token !== controlToken) {
          ws.send(JSON.stringify({ type: "error", msg: "unauthorized" }));
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
      } catch (err) {
        console.error("bad ws message", err);
      }
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
      if (filename && filename.startsWith("frame_")) {
        broadcast({ type: "frame", file: `/frames/${filename}` });
      }
    });
  } catch (err) {
    console.error("[frames] watch error", err);
  }

  const close = async () => {
    clearInterval(pollTimer);
    if (forgePollTimer) clearInterval(forgePollTimer);
    clearInterval(cleanupTimer);
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
