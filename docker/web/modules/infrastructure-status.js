/**
 * Mediator + FFmpeg transcoder visibility for Settings → GPUS.
 * Configured via environment variables on the web container.
 */
const net = require("net");
const os = require("os");

const DEFAULT_MEDIATOR_PORT = 8766;

function normalizeHost(host) {
  return String(host || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^rtmps?:\/\//i, "")
    .split("/")[0]
    .split(":")[0];
}

function parseHostPort(value, defaultPort) {
  const raw = String(value || "").trim();
  if (!raw) return { host: "", port: defaultPort };
  if (raw.includes("://")) {
    try {
      const normalized = raw.replace(/^rtmps?:\/\//i, "http://").replace(/^rtmps:\/\//i, "https://");
      const url = new URL(normalized);
      return {
        host: url.hostname,
        port: Number(url.port) || defaultPort,
        address: raw,
      };
    } catch (_e) {
      /* fall through */
    }
  }
  if (raw.includes(":")) {
    const [host, portPart] = raw.split(":");
    const port = Number(portPart) || defaultPort;
    return { host: host.trim(), port, address: raw };
  }
  return { host: raw, port: defaultPort, address: raw };
}

function resolveMediatorConfig(env = process.env) {
  const host =
    normalizeHost(env.DEF_MEDIATOR_HOST) ||
    normalizeHost(env.MEDIATOR_HOST) ||
    "localhost";
  const port = Number(env.DEF_MEDIATOR_PORT || env.MEDIATOR_PORT || DEFAULT_MEDIATOR_PORT);
  const deforumPort = Number(env.MEDIATOR_DEFORUM_PORT || 8765);
  return {
    host,
    port,
    address: `${host}:${port}`,
    wsUrl: `ws://${host}:${port}`,
    deforumPort,
    deforumWsUrl: `ws://${host}:${deforumPort}`,
    source: env.DEF_MEDIATOR_HOST ? "DEF_MEDIATOR_*" : env.MEDIATOR_HOST ? "MEDIATOR_*" : "default",
  };
}

function parseTranscoderNodes(env = process.env) {
  const raw = String(env.TRANSCODER_NODES || "").trim();
  const nodes = [];
  if (raw) {
    raw.split(",").forEach((entry, idx) => {
      const piece = entry.trim();
      if (!piece) return;
      const parts = piece.split("|").map((p) => p.trim());
      let name;
      let address;
      let rtmpTarget;
      let statusUrl;
      if (parts.length >= 4) {
        [name, address, rtmpTarget, statusUrl] = parts;
      } else if (parts.length === 3) {
        [name, address, rtmpTarget] = parts;
      } else if (parts.length === 2) {
        [name, address] = parts;
        rtmpTarget = address.includes("rtmp") ? address : "";
      } else if (piece.includes("|")) {
        name = parts[0] || `transcoder-${idx + 1}`;
        address = parts[1] || "";
      } else if (piece.includes("@")) {
        const at = piece.indexOf("@");
        name = piece.slice(0, at).trim();
        address = piece.slice(at + 1).trim();
        rtmpTarget = address.includes("rtmp") ? address : "";
      } else {
        name = `transcoder-${idx + 1}`;
        address = piece;
        rtmpTarget = piece.includes("rtmp") ? piece : "";
      }
      const probeTarget = rtmpTarget || address;
      const { host, port } = parseHostPort(probeTarget, 1935);
      nodes.push({
        id: `transcoder-${idx + 1}-${host || name}`,
        name: name || `transcoder-${idx + 1}`,
        address: address || probeTarget,
        rtmpTarget: rtmpTarget || "",
        statusUrl: statusUrl || "",
        host,
        port,
      });
    });
  }
  if (!nodes.length) {
    const rtmpTarget =
      String(env.ENCODER_RTMP_TARGET || env.RTMP_TARGET || "rtmp://vimage3:1935/live/deforum").trim();
    const { host, port } = parseHostPort(rtmpTarget, 1935);
    nodes.push({
      id: "transcoder-local",
      name: String(env.ENCODER_NAME || "encoder").trim() || "encoder",
      address: rtmpTarget,
      rtmpTarget,
      statusUrl: String(env.ENCODER_STATUS_URL || "").trim(),
      host,
      port,
    });
  }
  return nodes;
}

function probeTcp(host, port, timeoutMs = 2000) {
  return new Promise((resolve) => {
    if (!host) return resolve(false);
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch (_e) {
        /* ignore */
      }
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    try {
      socket.connect(port, host);
    } catch (_e) {
      finish(false);
    }
  });
}

async function fetchNodeStats(statusUrl, timeoutMs = 2500) {
  if (!statusUrl || typeof fetch !== "function") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(statusUrl, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      cpu: data.cpu ?? data.cpuPercent ?? data.cpu_percent ?? null,
      activeJobs: data.activeJobs ?? data.jobs ?? data.active_jobs ?? null,
    };
  } catch (_e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function formatCpu(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `${num.toFixed(1)}%`;
}

function formatJobs(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return String(Math.max(0, Math.round(num)));
}

function createInfrastructureStatus(options = {}) {
  const env = options.env || process.env;
  const framesDir = options.framesDir;
  const fsp = options.fsp;

  async function recentFrameActivity() {
    if (!framesDir || !fsp) return false;
    try {
      const names = await fsp.readdir(framesDir);
      const frames = names.filter((n) => /^frame_\d+\.png$/i.test(n));
      if (!frames.length) return false;
      let newest = 0;
      for (const name of frames.slice(-20)) {
        const stat = await fsp.stat(`${framesDir}/${name}`);
        newest = Math.max(newest, stat.mtimeMs || 0);
      }
      return newest > 0 && Date.now() - newest < 45000;
    } catch (_e) {
      return false;
    }
  }

  async function buildSnapshot() {
    const mediatorConfig = resolveMediatorConfig(env);
    const [mediatorReachable, deforumReachable] = await Promise.all([
      probeTcp(mediatorConfig.host, mediatorConfig.port),
      probeTcp(mediatorConfig.host, mediatorConfig.deforumPort),
    ]);
    const mediator = {
      ...mediatorConfig,
      status: mediatorReachable ? "healthy" : "unreachable",
      deforumStatus: deforumReachable ? "healthy" : "unreachable",
    };

    const nodeDefs = parseTranscoderNodes(env);
    const frameActivity = await recentFrameActivity();
    const hostLoad = os.loadavg()[0];
    const hostCpus = os.cpus().length || 1;
    const hostCpuPercent = Math.min(100, Math.max(0, (hostLoad / hostCpus) * 100));

    const transcoders = await Promise.all(
      nodeDefs.map(async (node) => {
        const reachable = await probeTcp(node.host, node.port);
        let cpu = null;
        let activeJobs = null;
        const stats = await fetchNodeStats(node.statusUrl);
        if (stats) {
          cpu = stats.cpu;
          activeJobs = stats.activeJobs;
        } else if (node.id === "transcoder-local" && reachable) {
          cpu = hostCpuPercent;
          activeJobs = frameActivity ? 1 : 0;
        }
        const status = reachable ? (Number(activeJobs) > 0 ? "streaming" : "idle") : "offline";
        return {
          ...node,
          status,
          reachable,
          cpu,
          cpuLabel: formatCpu(cpu),
          activeJobs,
          jobsLabel: formatJobs(activeJobs),
        };
      })
    );

    return {
      mediator,
      transcoders,
      updatedAt: new Date().toISOString(),
    };
  }

  function attachRoutes(app) {
    app.get("/api/infrastructure", async (_req, res) => {
      try {
        const snapshot = await buildSnapshot();
        res.json(snapshot);
      } catch (err) {
        console.error("[infrastructure] GET error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });
  }

  return {
    attachRoutes,
    buildSnapshot,
    resolveMediatorConfig,
    parseTranscoderNodes,
  };
}

module.exports = { createInfrastructureStatus, resolveMediatorConfig, parseTranscoderNodes };
