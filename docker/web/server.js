#!/usr/bin/env node
const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;
const WebSocket = require("ws");
const amqp = require("amqplib");
const { spawn } = require("child_process");
const { EventEmitter } = require("events");
const { mapControl } = require("./controlMapping");
const { motionPresetPayload } = require("./motionPresets");
const { controlnetPayload } = require("./controlnetMapping");

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
  const mediatorHost = opts.mediatorHost || process.env.DEF_MEDIATOR_HOST || "localhost";
  const mediatorPort = opts.mediatorPort || process.env.DEF_MEDIATOR_PORT || "8766";
  const listen = opts.listen !== false;
  const peakCache = new Map();
  const beatCache = new Map();

  const playlistPath = path.join(hlsDir, hlsStream.replace(/^\/hls\//, ""));

  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use("/frames", express.static(framesDir, { maxAge: "30s" }));

  app.get("/api/health", async (_req, res) => {
    try {
      const stat = await fsp.stat(playlistPath);
      res.json({ ok: true, stream: hlsStream, updated: stat.mtimeMs });
    } catch (_e) {
      res.json({ ok: true, stream: hlsStream, updated: null });
    }
  });

  app.get("/api/mediator/state", async (req, res) => {
    const keys = typeof req.query.keys === "string" ? req.query.keys : "";
    const args = ["-m", "defora_cli.mediator_state", "--host", mediatorHost, "--port", String(mediatorPort)];
    if (keys) {
      args.push("--keys", keys);
    }
    const child = spawner("python3", args, { stdio: ["ignore", "pipe", "pipe"] });
    if (!child || !child.stdout || !child.stderr) {
      return res.status(500).json({ error: "mediator probe unavailable" });
    }
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      res.status(503).json({ error: String(err) || "mediator probe failed" });
    });
    child.on("close", (code) => {
      if (code !== 0) {
        return res.status(503).json({ error: stderr.trim() || "mediator probe failed" });
      }
      try {
        const parsed = JSON.parse(stdout || "{}");
        res.json(parsed);
      } catch (err) {
        res.status(500).json({ error: "invalid mediator response" });
      }
    });
  });

  app.post("/api/audio/peaks", async (req, res) => {
    try {
      const audioPath = req.body && req.body.audioPath;
      const samples = Math.max(8, Math.min(1024, parseInt(req.body.samples, 10) || 256));
      if (!audioPath) return res.status(400).json({ error: "audioPath required" });
      const cacheKey = `${audioPath}:${samples}`;
      if (peakCache.has(cacheKey)) return res.json(peakCache.get(cacheKey));
      const stat = await fsp.stat(audioPath);
      const size = stat.size || 1;
      const data = await fsp.readFile(audioPath);
      const peaks = [];
      for (let i = 0; i < samples; i++) {
        const idx = Math.floor((i / samples) * data.length);
        const val = data[idx] || 0;
        peaks.push(Number(((val / 255) * 2 - 1).toFixed(3)));
      }
      const duration = Number((size / 176400).toFixed(2)); // rough guess (stereo 16bit 44.1k)
      const result = { peaks, duration };
      peakCache.set(cacheKey, result);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/audio/beats", async (req, res) => {
    const audioPath = req.body && req.body.audioPath;
    const bpm = parseFloat(req.body && req.body.bpm) || 120;
    const bars = Math.max(1, Math.min(64, parseInt(req.body && req.body.bars, 10) || 16));
    const cacheKey = `${audioPath || "none"}:${bpm}:${bars}`;
    if (beatCache.has(cacheKey)) return res.json(beatCache.get(cacheKey));
    const beatDur = 60 / bpm;
    const beats = [];
    for (let i = 0; i < bars * 4; i++) {
      beats.push(Number((i * beatDur).toFixed(3)));
    }
    const result = { beats, bpm };
    beatCache.set(cacheKey, result);
    res.json(result);
  });

  app.post("/api/lfo/preview", async (req, res) => {
    const shape = (req.body && req.body.shape) || "Sine";
    const depth = parseFloat(req.body && req.body.depth) || 0.5;
    const base = parseFloat(req.body && req.body.base) || 0;
    const rate = parseFloat(req.body && req.body.rate) || 1; // Hz
    const steps = Math.max(8, Math.min(512, parseInt(req.body && req.body.steps, 10) || 64));
    const samples = [];
    const twoPi = Math.PI * 2;
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * twoPi * rate;
      let wave = 0;
      const phase = t % twoPi;
      if (shape === "Triangle") wave = 2 * Math.asin(Math.sin(phase)) / Math.PI;
      else if (shape === "Saw") wave = ((phase / Math.PI) % 2) - 1;
      else if (shape === "Square") wave = phase < Math.PI ? 1 : -1;
      else wave = Math.sin(phase);
      samples.push(Number((base + wave * depth).toFixed(3)));
    }
    res.json({ samples });
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
    const baseBands = [
      { param: "translation_x", freq_min: 20, freq_max: 180, intensity: 1 },
      { param: "translation_y", freq_min: 180, freq_max: 1200, intensity: 1 },
      { param: "translation_z", freq_min: 1200, freq_max: 4000, intensity: 1 },
    ];
    const userBands = Array.isArray(body.bands)
      ? body.bands.map((b) => ({
          param: b.param,
          freq_min: Number(b.freq_min),
          freq_max: Number(b.freq_max),
          intensity: b.intensity != null ? Number(b.intensity) : 1,
        }))
      : [];
    const mappings = Array.isArray(body.mappings) ? body.mappings : [];
    const bandMappings = (userBands.length ? userBands : baseBands).map((b) => ({
      param: b.param,
      freq_min: b.freq_min,
      freq_max: b.freq_max,
      out_min: -(Math.abs(b.intensity || 1)),
      out_max: Math.abs(b.intensity || 1),
    }));
    const finalMappings = mappings.length ? mappings : bandMappings;
    let mappingArg;
    try {
      mappingArg = JSON.stringify(
        finalMappings.map((m) => ({
          param: m.param,
          freq_min: Number(m.freq_min),
          freq_max: Number(m.freq_max),
          out_min: Number(m.out_min ?? (m.intensity ? -Math.abs(m.intensity) : 0)),
          out_max: Number(m.out_max ?? (m.intensity ? Math.abs(m.intensity) : 1)),
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

  let server = null;
  if (listen) {
    server = app.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`[web] API/WS listening on ${actualPort}`);
    });
  }
  const actualPort = () => (server && server.address && server.address().port) || 0;
  const wss = listen
    ? new WebSocket.Server({ server, path: "/ws" })
    : {
        clients: new Set(),
        on() {},
        close(cb) {
          if (cb) cb();
        },
      };

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
        const mapped = mapControl(payload.controlType, payload.payload);
        if (!mapped.valid) {
          ws.send(JSON.stringify({ type: "error", msg: "invalid controlType or payload" }));
          return;
        }
        const msg = { controlType: mapped.controlType, payload: mapped.payload };
        if (mapped.controlType === "motionPreset" && mapped.payload && mapped.payload.name) {
          const payload = motionPresetPayload(mapped.payload.name, mapped.payload.intensity || 1);
          if (Object.keys(payload).length) {
            msg.controlType = "liveParam";
            msg.payload = payload;
          }
        } else if (mapped.controlType === "controlnet" && mapped.payload && mapped.payload.slot) {
          const payload = controlnetPayload(mapped.payload.slot, mapped.payload);
          msg.controlType = "controlnet";
          msg.payload = payload;
        }
        if (channel) {
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
        }
        broadcast({ type: "event", msg: mapped.detail || "control forwarded", payload: msg });
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
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
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
