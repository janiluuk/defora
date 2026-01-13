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

  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use("/frames", express.static(framesDir, { maxAge: "30s" }));

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
  const uploadsDir = opts.uploadsDir || process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
  try {
    await fsp.mkdir(presetsDir, { recursive: true });
  } catch (_e) {}
  try {
    await fsp.mkdir(uploadsDir, { recursive: true });
  } catch (_e) {}

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
      const target = path.join(uploadsDir, `${Date.now()}-${safeName}`);
      await fsp.writeFile(target, buf);
      res.json({ ok: true, path: target, name: safeName });
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

  // ControlNet models API
  app.get("/api/controlnet/models", async (_req, res) => {
    // This is a placeholder - in production, this would query the SD-Forge API
    const models = [
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
    res.json({ models });
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

  function broadcast(obj) {
    const msg = JSON.stringify(obj);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
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
