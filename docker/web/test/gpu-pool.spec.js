/**
 * GPU pool API: multi-instance load balancing, edit-only-when-disabled rules.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const supertest = require("supertest");
const { expect } = require("chai");
const { describe, it, beforeEach, afterEach } = require("node:test");

const { start } = require("../server");

describe("GPU pool API", () => {
  let svc;
  let tmp;
  let gpuPoolPath;
  let request;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    gpuPoolPath = path.join(os.tmpdir(), `gpu-pool-${Date.now()}.json`);
    svc = await start({
      port: 0,
      framesDir: tmp,
      enableMq: false,
      gpuPoolPath,
    });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    if (svc && svc.close) await svc.close();
    if (tmp && fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
    if (gpuPoolPath && fs.existsSync(gpuPoolPath)) fs.unlinkSync(gpuPoolPath);
  });

  it("GET /api/gpu-pool returns pool config", async () => {
    const res = await request.get("/api/gpu-pool");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("enabled");
    expect(res.body).to.have.property("strategy");
    expect(res.body).to.have.property("nodes");
    expect(res.body.nodes).to.be.an("array");
  });

  it("adds a disabled node and allows edit; rejects edit when enabled", async () => {
    const add = await request.post("/api/gpu-pool/nodes").send({
      url: "http://192.168.99.10:7860",
      name: "Test GPU",
      backend: "sd-forge",
      enabled: false,
    });
    expect(add.status).to.equal(200);
    const id = add.body.node.id;
    expect(add.body.node.editable).to.equal(true);

    const editOk = await request.put(`/api/gpu-pool/nodes/${id}`).send({
      name: "Renamed GPU",
      priority: 2,
    });
    expect(editOk.status).to.equal(200);
    expect(editOk.body.node.name).to.equal("Renamed GPU");

    const enable = await request.post(`/api/gpu-pool/nodes/${id}/enable`);
    expect(enable.status).to.equal(200);
    expect(enable.body.node.enabled).to.equal(true);
    expect(enable.body.node.editable).to.equal(false);

    const editBlocked = await request.put(`/api/gpu-pool/nodes/${id}`).send({ name: "Should fail" });
    expect(editBlocked.status).to.equal(409);
    expect(editBlocked.body.error).to.match(/disable node before editing/i);
  });

  it("rejects delete while node is enabled", async () => {
    const add = await request.post("/api/gpu-pool/nodes").send({
      url: "http://192.168.99.11:8188",
      name: "Comfy Node",
      backend: "comfyui",
      enabled: true,
    });
    const id = add.body.node.id;
    const del = await request.delete(`/api/gpu-pool/nodes/${id}`);
    expect(del.status).to.equal(409);
    expect(del.body.error).to.match(/disable node before removal/i);

    await request.post(`/api/gpu-pool/nodes/${id}/disable`);
    const del2 = await request.delete(`/api/gpu-pool/nodes/${id}`);
    expect(del2.status).to.equal(200);
  });

  it("PUT /api/gpu-pool toggles load balancing", async () => {
    const res = await request.put("/api/gpu-pool").send({
      enabled: true,
      strategy: "least_busy",
    });
    expect(res.status).to.equal(200);
    expect(res.body.enabled).to.equal(true);
    expect(res.body.strategy).to.equal("least_busy");

    const status = await request.get("/api/gpu-pool");
    expect(status.body.enabled).to.equal(true);
    expect(status.body.strategy).to.equal("least_busy");
  });

  it("accepts sd-forge, comfyui, and ollama backends", async () => {
    const forge = await request.post("/api/gpu-pool/nodes").send({
      url: "http://10.0.0.1:7860",
      backend: "sd-forge",
      enabled: false,
    });
    expect(forge.body.node.backend).to.equal("sd-forge");

    const comfy = await request.post("/api/gpu-pool/nodes").send({
      url: "http://10.0.0.2:8188",
      backend: "comfyui",
      enabled: false,
    });
    expect(comfy.body.node.backend).to.equal("comfyui");

    const ollama = await request.post("/api/gpu-pool/nodes").send({
      url: "http://10.0.0.3:11434",
      backend: "ollama",
      model: "llama3.1:8b",
      enabled: false,
    });
    expect(ollama.body.node.backend).to.equal("ollama");
    expect(ollama.body.node.model).to.equal("llama3.1:8b");
  });

  it("persists forge-specific settings per sd-forge node", async () => {
    const add = await request.post("/api/gpu-pool/nodes").send({
      url: "http://10.0.0.10:7860",
      name: "Forge Node",
      backend: "sd-forge",
      enabled: false,
      forgeSettings: {
        scheduler: "Normal",
        sd_vae: "vae-ft-mse",
        width: 1280,
        height: 720,
        batch_size: 2,
      },
    });
    expect(add.status).to.equal(200);
    expect(add.body.node.forgeSettings.width).to.equal(1280);

    const id = add.body.node.id;
    const edit = await request.put(`/api/gpu-pool/nodes/${id}`).send({
      forgeSettings: {
        scheduler: "Karras",
        width: 1536,
        height: 864,
      },
    });
    expect(edit.status).to.equal(200);
    expect(edit.body.node.forgeSettings.scheduler).to.equal("Karras");
    expect(edit.body.node.forgeSettings.width).to.equal(1536);
    expect(edit.body.node.forgeSettings.height).to.equal(864);
    expect(edit.body.node.forgeSettings.batch_size).to.equal(2);

    const status = await request.get("/api/gpu-pool");
    const savedNode = status.body.nodes.find((node) => node.id === id);
    expect(savedNode).to.exist;
    expect(savedNode.forgeSettings.scheduler).to.equal("Karras");
    expect(savedNode.forgeSettings.sd_vae).to.equal("vae-ft-mse");
    expect(savedNode.forgeSettings.width).to.equal(1536);
  });

  it("POST /api/gpu-pool/refresh returns node stats fields", async () => {
    await request.post("/api/gpu-pool/nodes").send({
      url: "http://127.0.0.1:9",
      name: "offline",
      backend: "sd-forge",
      enabled: false,
    });
    const res = await request.post("/api/gpu-pool/refresh");
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("nodes");
    expect(res.body.nodes[0]).to.include.keys(
      "currentModel",
      "memoryUsedMb",
      "memoryTotalMb",
      "gpuUtilization",
      "editable"
    );
  });
});
