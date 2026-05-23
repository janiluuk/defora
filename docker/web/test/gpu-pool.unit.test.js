const { describe, it } = require("node:test");
const assert = require("assert");
const path = require("path");
const os = require("os");
const fs = require("fs");

const { createGpuPool, normalizeUrl, defaultNode } = require("../modules/gpu-pool");

describe("gpu-pool module", () => {
  it("normalizeUrl adds http scheme", () => {
    assert.strictEqual(normalizeUrl("192.168.1.5:7860"), "http://192.168.1.5:7860");
  });

  it("selectNode round-robin skips disabled and unhealthy", () => {
    const configPath = path.join(os.tmpdir(), `gpu-unit-${Date.now()}.json`);
    const pool = createGpuPool({ configPath, env: {} });
    pool.state.enabled = true;
    pool.state.strategy = "round_robin";
    pool.state.nodes = [
      defaultNode({ url: "http://a:7860", enabled: true, status: "healthy", activeJobs: 0 }),
      defaultNode({ url: "http://b:7860", enabled: false, status: "disabled", activeJobs: 0 }),
      defaultNode({ url: "http://c:7860", enabled: true, status: "healthy", activeJobs: 0 }),
    ];
    const n1 = pool.selectNode({ sdApiOnly: true });
    const n2 = pool.selectNode({ sdApiOnly: true });
    assert.ok(n1 && n2);
    assert.notStrictEqual(n1.url, n2.url);
    assert.ok([n1.url, n2.url].every((u) => u !== "http://b:7860"));
    fs.unlinkSync(configPath);
  });

  it("eligibleNodes filters comfyui when sdApiOnly", () => {
    const pool = createGpuPool({ configPath: path.join(os.tmpdir(), `gpu-unit2-${Date.now()}.json`) });
    pool.state.nodes = [
      defaultNode({ url: "http://forge:7860", backend: "sd-forge", enabled: true, status: "healthy" }),
      defaultNode({ url: "http://comfy:8188", backend: "comfyui", enabled: true, status: "healthy" }),
    ];
    assert.strictEqual(pool.eligibleNodes({ sdApiOnly: true }).length, 1);
    assert.strictEqual(pool.eligibleNodes({ sdApiOnly: false }).length, 2);
  });
});
