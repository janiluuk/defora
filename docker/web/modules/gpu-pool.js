/**
 * Multi-GPU pool: load balancing across SD-Forge (A1111 API) and ComfyUI instances.
 * Disabled nodes are excluded from balancing and are the only nodes that can be edited.
 */
const crypto = require("crypto");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const BACKENDS = ["sd-forge", "comfyui"];
const STRATEGIES = ["round_robin", "least_busy", "random", "priority"];

function normalizeUrl(url) {
  let u = String(url || "").trim().replace(/\/+$/, "");
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  return u;
}

function nodeIdFromUrl(url) {
  return crypto.createHash("sha256").update(normalizeUrl(url)).digest("hex").slice(0, 16);
}

const NODE_LOG_MAX = 50;

function defaultNode(input = {}) {
  const url = normalizeUrl(input.url);
  return {
    id: input.id || nodeIdFromUrl(url),
    url,
    name: input.name || url || "GPU Node",
    backend: BACKENDS.includes(input.backend) ? input.backend : "sd-forge",
    enabled: input.enabled !== false,
    status: input.status || "unknown",
    activeJobs: Number(input.activeJobs) || 0,
    totalJobs: Number(input.totalJobs) || 0,
    priority: Number(input.priority) || 1,
    gpuModel: input.gpuModel || null,
    lastHealthCheck: input.lastHealthCheck || null,
    responseTime: input.responseTime || null,
    currentModel: input.currentModel ?? null,
    memoryUsedMb: input.memoryUsedMb ?? null,
    memoryTotalMb: input.memoryTotalMb ?? null,
    gpuUtilization: input.gpuUtilization ?? null,
    statsError: input.statsError ?? null,
    requestLog: [],
  };
}

function pushNodeLog(node, entry) {
  if (!node) return;
  if (!Array.isArray(node.requestLog)) node.requestLog = [];
  node.requestLog.unshift({ ts: Date.now(), ...entry });
  if (node.requestLog.length > NODE_LOG_MAX) node.requestLog.length = NODE_LOG_MAX;
}

function parseEnvNodes(env) {
  if (!env || !env.DISTRIBUTED_NODES) return [];
  return env.DISTRIBUTED_NODES.split(",")
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url, idx) =>
      defaultNode({
        url,
        name: `Node-${idx + 1}`,
        backend: "sd-forge",
        enabled: true,
      })
    );
}

function createGpuPool(options = {}) {
  const configPath = options.configPath || path.join(__dirname, "..", "gpu-pool.json");
  const env = options.env || process.env;

  const state = {
    enabled: env.DISTRIBUTED_ENABLED === "true",
    strategy: STRATEGIES.includes(env.DISTRIBUTED_STRATEGY) ? env.DISTRIBUTED_STRATEGY : "least_busy",
    nodes: parseEnvNodes(env),
    currentIndex: 0,
    healthCheckInterval: parseInt(env.DISTRIBUTED_HEALTH_CHECK_INTERVAL, 10) || 30,
    timeout: parseInt(env.DISTRIBUTED_TIMEOUT, 10) || 300,
    retryAttempts: parseInt(env.DISTRIBUTED_RETRY_ATTEMPTS, 10) || 2,
    jobs: new Map(),
    metrics: new Map(),
  };

  let healthTimer = null;

  async function loadConfig() {
    try {
      const raw = await fsp.readFile(configPath, "utf-8");
      const data = JSON.parse(raw);
      if (typeof data.enabled === "boolean") state.enabled = data.enabled;
      if (STRATEGIES.includes(data.strategy)) state.strategy = data.strategy;
      if (typeof data.healthCheckInterval === "number") state.healthCheckInterval = data.healthCheckInterval;
      if (typeof data.timeout === "number") state.timeout = data.timeout;
      if (typeof data.retryAttempts === "number") state.retryAttempts = data.retryAttempts;
      if (Array.isArray(data.nodes)) {
        state.nodes = data.nodes.map((n) => defaultNode(n));
      }
    } catch (err) {
      if (err.code !== "ENOENT") console.error("[gpu-pool] load error", err.message);
    }
  }

  async function saveConfig() {
    const payload = {
      enabled: state.enabled,
      strategy: state.strategy,
      healthCheckInterval: state.healthCheckInterval,
      timeout: state.timeout,
      retryAttempts: state.retryAttempts,
      nodes: state.nodes.map((n) => ({
        id: n.id,
        url: n.url,
        name: n.name,
        backend: n.backend,
        enabled: n.enabled,
        priority: n.priority,
        gpuModel: n.gpuModel,
      })),
    };
    await fsp.writeFile(configPath, JSON.stringify(payload, null, 2), "utf-8");
  }

  function publicNode(n) {
    return {
      id: n.id,
      url: n.url,
      name: n.name,
      backend: n.backend,
      enabled: n.enabled,
      status: n.enabled ? n.status : "disabled",
      activeJobs: n.activeJobs,
      totalJobs: n.totalJobs,
      priority: n.priority,
      gpuModel: n.gpuModel,
      lastHealthCheck: n.lastHealthCheck,
      responseTime: n.responseTime,
      currentModel: n.currentModel,
      memoryUsedMb: n.memoryUsedMb,
      memoryTotalMb: n.memoryTotalMb,
      gpuUtilization: n.gpuUtilization,
      statsError: n.statsError,
      editable: !n.enabled,
      requestLog: (n.requestLog || []).slice(0, 30),
    };
  }

  function findNode(idOrUrl) {
    const key = decodeURIComponent(String(idOrUrl));
    return state.nodes.find((n) => n.id === key || n.url === key);
  }

  function eligibleNodes({ sdApiOnly = false } = {}) {
    return state.nodes.filter((n) => {
      if (!n.enabled || n.status !== "healthy") return false;
      if (sdApiOnly && n.backend !== "sd-forge") return false;
      return true;
    });
  }

  function selectNode({ preferred, sdApiOnly = false } = {}) {
    const healthy = eligibleNodes({ sdApiOnly });
    if (!healthy.length) return null;

    if (preferred) {
      const hit = healthy.find((n) => n.name === preferred || n.url === preferred || n.id === preferred);
      if (hit) return hit;
    }

    switch (state.strategy) {
      case "least_busy":
        return healthy.reduce((min, node) => (node.activeJobs < min.activeJobs ? node : min));
      case "random":
        return healthy[Math.floor(Math.random() * healthy.length)];
      case "priority":
        return [...healthy].sort((a, b) => a.priority - b.priority)[0];
      case "round_robin":
      default: {
        let attempts = 0;
        while (attempts < state.nodes.length) {
          const node = state.nodes[state.currentIndex];
          state.currentIndex = (state.currentIndex + 1) % state.nodes.length;
          if (node.enabled && node.status === "healthy" && (!sdApiOnly || node.backend === "sd-forge")) {
            return node;
          }
          attempts++;
        }
        return healthy[0];
      }
    }
  }

  function trackJobStart(node) {
    if (!node) return;
    node.activeJobs++;
    node.totalJobs++;
  }

  function trackJobEnd(node) {
    if (!node) return;
    node.activeJobs = Math.max(0, node.activeJobs - 1);
  }

  function wrapTarget(node) {
    trackJobStart(node);
    return {
      url: node.url,
      node,
      backend: node.backend,
      release: () => trackJobEnd(node),
    };
  }

  function isLoadBalancing() {
    return state.enabled && eligibleNodes({ sdApiOnly: true }).length > 0;
  }

  function resolveForgeTarget(req, { sdApiOnly = true } = {}) {
    const preferred = req?.body?.preferredNode || req?.query?.preferredNode;
    if (isLoadBalancing()) {
      const node = selectNode({ preferred, sdApiOnly });
      if (node) return wrapTarget(node);
    }
    const host = env.SD_FORGE_HOST || "192.168.2.101";
    const port = env.SD_FORGE_PORT || "7860";
    return {
      url: `http://${host}:${port}`,
      node: null,
      backend: "sd-forge",
      release: () => {},
    };
  }

  async function fetchJson(url, init = {}, timeoutMs = 5000) {
    if (typeof fetch === "undefined") throw new Error("fetch not available");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (_) {
        data = null;
      }
      return { ok: res.ok, status: res.status, data, text };
    } finally {
      clearTimeout(timer);
    }
  }

  async function probeHealth(node) {
    if (!node.enabled) {
      node.status = "disabled";
      return { url: node.url, healthy: false, reason: "disabled", backend: node.backend };
    }
    const base = node.url;
    const probePath = node.backend === "comfyui" ? "/system_stats" : "/docs";
    const start = Date.now();
    try {
      const res = await fetchJson(
        `${base}${probePath}`,
        { headers: { Accept: node.backend === "comfyui" ? "application/json" : "text/html" } },
        5000
      );
      const durationMs = Date.now() - start;
      node.lastHealthCheck = new Date().toISOString();
      node.responseTime = durationMs;
      if (res.ok) {
        node.status = "healthy";
        pushNodeLog(node, { type: "health", path: probePath, statusCode: res.status, durationMs, ok: true });
        return { url: node.url, healthy: true, responseTime: durationMs, probe: probePath, backend: node.backend };
      }
      node.status = "unhealthy";
      pushNodeLog(node, { type: "health", path: probePath, statusCode: res.status, durationMs, ok: false, error: `HTTP ${res.status}` });
      return { url: node.url, healthy: false, reason: `HTTP ${res.status}`, probe: probePath };
    } catch (err) {
      const durationMs = Date.now() - start;
      node.status = "unhealthy";
      node.lastHealthCheck = new Date().toISOString();
      pushNodeLog(node, { type: "health", path: probePath, durationMs, ok: false, error: err.message });
      return { url: node.url, healthy: false, reason: err.message, backend: node.backend };
    }
  }

  async function refreshNodeStats(node) {
    node.statsError = null;
    if (!node.enabled) {
      node.currentModel = null;
      return;
    }
    const base = node.url;
    try {
      if (node.backend === "comfyui") {
        const t0 = Date.now();
        const res = await fetchJson(`${base}/system_stats`, { headers: { Accept: "application/json" } }, 5000);
        pushNodeLog(node, { type: "stats", path: "/system_stats", statusCode: res.status, durationMs: Date.now() - t0, ok: res.ok });
        if (!res.ok) throw new Error(`system_stats HTTP ${res.status}`);
        const dev = res.data?.devices?.[0];
        if (dev) {
          const total = dev.vram_total || dev.torch_vram_total;
          const free = dev.vram_free ?? dev.torch_vram_free;
          if (total != null && free != null) {
            node.memoryTotalMb = Math.round(total / (1024 * 1024));
            node.memoryUsedMb = Math.round((total - free) / (1024 * 1024));
            node.gpuUtilization = Math.min(100, Math.max(0, Math.round(((total - free) / total) * 100)));
          }
        }
        node.currentModel = res.data?.system?.comfyui_version
          ? `ComfyUI ${res.data.system.comfyui_version}`
          : "ComfyUI";
        return;
      }

      const t1 = Date.now();
      const optRes = await fetchJson(`${base}/sdapi/v1/options`, { headers: { Accept: "application/json" } }, 5000);
      pushNodeLog(node, { type: "stats", path: "/sdapi/v1/options", statusCode: optRes.status, durationMs: Date.now() - t1, ok: optRes.ok });
      if (optRes.ok && optRes.data) {
        node.currentModel = optRes.data.sd_model_checkpoint || null;
      }

      const t2 = Date.now();
      const sysRes = await fetchJson(`${base}/internal/sysinfo`, { headers: { Accept: "application/json" } }, 3000);
      pushNodeLog(node, { type: "stats", path: "/internal/sysinfo", statusCode: sysRes.status, durationMs: Date.now() - t2, ok: sysRes.ok });
      if (sysRes.ok && sysRes.data?.cuda) {
        const cuda = sysRes.data.cuda;
        if (cuda.system?.total != null && cuda.system?.free != null) {
          node.memoryTotalMb = Math.round(cuda.system.total / (1024 * 1024));
          node.memoryUsedMb = Math.round((cuda.system.total - cuda.system.free) / (1024 * 1024));
        }
        if (cuda.utilization != null) {
          node.gpuUtilization = Math.round(Number(cuda.utilization));
        } else if (node.memoryTotalMb && node.memoryUsedMb) {
          node.gpuUtilization = Math.min(100, Math.round((node.memoryUsedMb / node.memoryTotalMb) * 100));
        }
      } else if (node.memoryUsedMb == null) {
        const t3 = Date.now();
        const memRes = await fetchJson(`${base}/sdapi/v1/memory`, { headers: { Accept: "application/json" } }, 3000);
        pushNodeLog(node, { type: "stats", path: "/sdapi/v1/memory", statusCode: memRes.status, durationMs: Date.now() - t3, ok: memRes.ok });
        if (memRes.ok && memRes.data) {
          const cuda = memRes.data.cuda || memRes.data;
          if (cuda.system?.total != null) {
            node.memoryTotalMb = Math.round(cuda.system.total / (1024 * 1024));
            node.memoryUsedMb = Math.round((cuda.system.total - (cuda.system.free || 0)) / (1024 * 1024));
            node.gpuUtilization = Math.min(
              100,
              Math.round(((cuda.system.total - (cuda.system.free || 0)) / cuda.system.total) * 100)
            );
          }
        }
      }
    } catch (err) {
      node.statsError = err.message;
    }
  }

  async function performHealthCheck() {
    const results = [];
    for (const node of state.nodes) {
      results.push(await probeHealth(node));
      if (node.enabled && node.status === "healthy") {
        await refreshNodeStats(node);
      }
    }
    return results;
  }

  function scheduleHealthChecks() {
    if (healthTimer) clearInterval(healthTimer);
    if (!state.enabled || !state.nodes.length) return;
    healthTimer = setInterval(() => {
      performHealthCheck().catch((e) => console.error("[gpu-pool] health check", e));
    }, state.healthCheckInterval * 1000);
    if (typeof healthTimer.unref === "function") {
      healthTimer.unref();
    }
  }

  function close() {
    if (healthTimer) {
      clearInterval(healthTimer);
      healthTimer = null;
    }
  }

  function attachRoutes(app) {
    const sendPool = (_req, res) => {
      const healthy = state.nodes.filter((n) => n.enabled && n.status === "healthy").length;
      res.json({
        enabled: state.enabled,
        strategy: state.strategy,
        healthCheckInterval: state.healthCheckInterval,
        timeout: state.timeout,
        retryAttempts: state.retryAttempts,
        totalNodes: state.nodes.length,
        healthyNodes: healthy,
        sdForgeNodes: eligibleNodes({ sdApiOnly: true }).length,
        nodes: state.nodes.map(publicNode),
      });
    };

    app.get("/api/gpu-pool", sendPool);
    app.get("/api/distributed/status", sendPool);

    app.put("/api/gpu-pool", async (req, res) => {
      try {
        const { enabled, strategy, healthCheckInterval, timeout, retryAttempts } = req.body || {};
        if (typeof enabled === "boolean") state.enabled = enabled;
        if (STRATEGIES.includes(strategy)) state.strategy = strategy;
        if (typeof healthCheckInterval === "number" && healthCheckInterval > 0) {
          state.healthCheckInterval = healthCheckInterval;
        }
        if (typeof timeout === "number" && timeout > 0) state.timeout = timeout;
        if (typeof retryAttempts === "number" && retryAttempts >= 0) state.retryAttempts = retryAttempts;
        await saveConfig();
        scheduleHealthChecks();
        res.json({ success: true, ...publicStatus() });
      } catch (err) {
        console.error("[gpu-pool] PUT /api/gpu-pool error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/distributed/configure", async (req, res) => {
      try {
        req.body = req.body || {};
        const mapped = { ...req.body };
        if (Array.isArray(req.body.nodes)) {
          mapped.nodes = req.body.nodes.map((n) =>
            defaultNode({
              url: n.url,
              name: n.name,
              backend: n.backend || "sd-forge",
              enabled: n.enabled !== false,
              priority: n.priority,
              gpuModel: n.gpuModel,
            })
          );
          state.nodes = mapped.nodes;
        }
        const put = { enabled: mapped.enabled, strategy: mapped.strategy };
        if (typeof put.enabled === "boolean") state.enabled = put.enabled;
        if (STRATEGIES.includes(put.strategy)) state.strategy = put.strategy;
        await saveConfig();
        scheduleHealthChecks();
        res.json({ success: true, message: "Distributed configuration updated", config: publicStatus() });
      } catch (err) {
        console.error("[gpu-pool] configure error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/gpu-pool/nodes", async (req, res) => {
      try {
        const { url, name, backend, priority, gpuModel, enabled } = req.body || {};
        const normalized = normalizeUrl(url);
        if (!normalized) return res.status(400).json({ error: "url required" });
        if (findNode(normalized)) return res.status(409).json({ error: "node already exists" });
        const node = defaultNode({
          url: normalized,
          name: name || normalized,
          backend: backend || "sd-forge",
          priority,
          gpuModel,
          enabled: enabled !== false,
        });
        state.nodes.push(node);
        await saveConfig();
        res.json({ success: true, node: publicNode(node) });
      } catch (err) {
        console.error("[gpu-pool] add node error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.put("/api/gpu-pool/nodes/:id", async (req, res) => {
      try {
        const node = findNode(req.params.id);
        if (!node) return res.status(404).json({ error: "node not found" });
        if (node.enabled) {
          return res.status(409).json({ error: "disable node before editing (only disabled nodes can be edited)" });
        }
        const { url, name, backend, priority, gpuModel } = req.body || {};
        if (url) {
          const normalized = normalizeUrl(url);
          if (!normalized) return res.status(400).json({ error: "invalid url" });
          const other = state.nodes.find((n) => n.url === normalized && n.id !== node.id);
          if (other) return res.status(409).json({ error: "url already used" });
          node.url = normalized;
          node.id = nodeIdFromUrl(normalized);
        }
        if (name) node.name = String(name);
        if (backend && BACKENDS.includes(backend)) node.backend = backend;
        if (priority != null) node.priority = Number(priority) || 1;
        if (gpuModel !== undefined) node.gpuModel = gpuModel;
        await saveConfig();
        res.json({ success: true, node: publicNode(node) });
      } catch (err) {
        console.error("[gpu-pool] edit node error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.delete("/api/gpu-pool/nodes/:id", async (req, res) => {
      try {
        const node = findNode(req.params.id);
        if (!node) return res.status(404).json({ error: "node not found" });
        if (node.enabled) {
          return res.status(409).json({ error: "disable node before removal" });
        }
        state.nodes = state.nodes.filter((n) => n.id !== node.id);
        await saveConfig();
        res.json({ success: true, removed: node.name });
      } catch (err) {
        console.error("[gpu-pool] delete node error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/gpu-pool/nodes/:id/disable", async (req, res) => {
      try {
        const node = findNode(req.params.id);
        if (!node) return res.status(404).json({ error: "node not found" });
        node.enabled = false;
        node.status = "disabled";
        node.activeJobs = 0;
        await saveConfig();
        res.json({ success: true, node: publicNode(node) });
      } catch (err) {
        console.error("[gpu-pool] disable node error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/gpu-pool/nodes/:id/enable", async (req, res) => {
      try {
        const node = findNode(req.params.id);
        if (!node) return res.status(404).json({ error: "node not found" });
        node.enabled = true;
        node.status = "unknown";
        await saveConfig();
        // Probe and stats in background — don't block the response
        probeHealth(node)
          .then(() => refreshNodeStats(node))
          .catch((e) => console.error("[gpu-pool] probe after enable:", e.message));
        res.json({ success: true, node: publicNode(node) });
      } catch (err) {
        console.error("[gpu-pool] enable node error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/gpu-pool/refresh", async (_req, res) => {
      try {
        const results = await performHealthCheck();
        res.json({
          success: true,
          checked: results.length,
          healthy: results.filter((r) => r.healthy).length,
          results,
          nodes: state.nodes.map(publicNode),
        });
      } catch (err) {
        console.error("[gpu-pool] refresh error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/distributed/health-check", async (_req, res) => {
      try {
        const results = await performHealthCheck();
        res.json({
          success: true,
          checked: results.length,
          healthy: results.filter((r) => r.healthy).length,
          results,
        });
      } catch (err) {
        console.error("[gpu-pool] health-check error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/api/distributed/metrics", (_req, res) => {
      res.json({
        enabled: state.enabled,
        strategy: state.strategy,
        totalJobs: state.jobs.size,
        nodeMetrics: state.nodes.map((n) => ({
          url: n.url,
          name: n.name,
          activeJobs: n.activeJobs,
          totalJobs: n.totalJobs,
          status: n.status,
          memoryUsedMb: n.memoryUsedMb,
          gpuUtilization: n.gpuUtilization,
        })),
      });
    });

    const distributedDisable = async (req, res) => {
      try {
        const node = findNode(req.params.nodeId);
        if (!node) return res.status(404).json({ error: "Node not found" });
        node.enabled = false;
        node.status = "disabled";
        node.activeJobs = 0;
        await saveConfig();
        res.json({ success: true, message: `Node ${node.name} disabled` });
      } catch (err) {
        console.error("[gpu-pool] distributed disable error:", err.message);
        res.status(500).json({ error: err.message });
      }
    };
    app.post("/api/distributed/nodes/:nodeId/disable", distributedDisable);

    app.post("/api/distributed/nodes/:nodeId/enable", async (req, res) => {
      try {
        const node = findNode(req.params.nodeId);
        if (!node) return res.status(404).json({ error: "Node not found" });
        node.enabled = true;
        node.status = "unknown";
        await saveConfig();
        probeHealth(node).catch((e) => console.error("[gpu-pool] probe after enable:", e.message));
        res.json({ success: true, message: `Node ${node.name} enabled` });
      } catch (err) {
        console.error("[gpu-pool] distributed enable error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.delete("/api/distributed/nodes/:nodeId", async (req, res) => {
      try {
        const node = findNode(req.params.nodeId);
        if (!node) return res.status(404).json({ error: "Node not found" });
        if (node.enabled) return res.status(409).json({ error: "disable node before removal" });
        state.nodes = state.nodes.filter((n) => n.id !== node.id);
        await saveConfig();
        res.json({ success: true, message: `Node ${node.name} removed` });
      } catch (err) {
        console.error("[gpu-pool] distributed delete error:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/api/distributed/generate", async (req, res) => {
      if (!state.enabled) return res.status(503).json({ error: "GPU pool is disabled" });
      const { workflow, preferredNode, priority } = req.body || {};
      if (!workflow) return res.status(400).json({ error: "workflow is required" });
      const node = selectNode({ preferred: preferredNode, sdApiOnly: false });
      if (!node) return res.status(503).json({ error: "No healthy nodes available" });
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      trackJobStart(node);
      state.jobs.set(jobId, {
        id: jobId,
        nodeUrl: node.url,
        nodeName: node.name,
        workflow,
        priority: priority || "normal",
        status: "queued",
        createdAt: new Date().toISOString(),
      });
      res.json({
        jobId,
        assignedNode: node.name,
        nodeUrl: node.url,
        status: "queued",
        estimatedWaitTime: node.activeJobs * 30,
      });
    });

    app.get("/api/distributed/jobs/:jobId", (req, res) => {
      const job = state.jobs.get(req.params.jobId);
      if (!job) return res.status(404).json({ error: "Job not found" });
      res.json(job);
    });
  }

  function publicStatus() {
    return {
      enabled: state.enabled,
      strategy: state.strategy,
      nodeCount: state.nodes.length,
      healthCheckInterval: state.healthCheckInterval,
    };
  }

  async function init() {
    await loadConfig();
    scheduleHealthChecks();
    if (state.enabled && state.nodes.length) {
      performHealthCheck().catch(() => {});
    }
  }

  function logNodeRequest(nodeIdOrUrl, entry) {
    const node = findNode(nodeIdOrUrl) || state.nodes.find((n) => n.url === nodeIdOrUrl);
    if (node) pushNodeLog(node, entry);
  }

  return {
    init,
    state,
    attachRoutes,
    selectNode,
    resolveForgeTarget,
    isLoadBalancing,
    trackJobStart,
    trackJobEnd,
    performHealthCheck,
    refreshNodeStats,
    publicNode,
    findNode,
    saveConfig,
    eligibleNodes,
    close,
    logNodeRequest,
    BACKENDS,
    STRATEGIES,
  };
}

module.exports = { createGpuPool, normalizeUrl, nodeIdFromUrl, defaultNode, BACKENDS, STRATEGIES };
