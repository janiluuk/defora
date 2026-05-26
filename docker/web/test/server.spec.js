const fs = require("fs");
const path = require("path");
const os = require("os");
const supertest = require("supertest");
const { expect } = require("chai");
const { describe, it, beforeEach, afterEach } = require("node:test");
const { EventEmitter } = require("events");
const { Readable } = require("stream");

const { start } = require("../server");

describe("web server frames API", () => {
  let svc;
  let tmp;
  let uploads;
  let sequencers;
  let request;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    uploads = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-"));
    sequencers = fs.mkdtempSync(path.join(os.tmpdir(), "seq-"));
    const f1 = path.join(tmp, "frame_0005.png");
    const f2 = path.join(tmp, "frame_0010.png");
    fs.writeFileSync(f1, "a");
    fs.writeFileSync(f2, "b");
    const early = Date.now() - 5000;
    fs.utimesSync(f1, early / 1000, early / 1000);

    svc = await start({ port: 0, framesDir: tmp, uploadsDir: uploads, sequencersDir: sequencers, enableMq: false });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    if (svc && svc.close) {
      await svc.close();
    }
    if (tmp) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    if (uploads) {
      fs.rmSync(uploads, { recursive: true, force: true });
    }
    if (sequencers) {
      fs.rmSync(sequencers, { recursive: true, force: true });
    }
  });

  it("returns frame metadata sorted by mtime with parsed frame numbers", async () => {
    const res = await request.get("/api/frames?limit=5");
    expect(res.status).to.equal(200);
    expect(res.body.items).to.be.an("array").that.has.lengthOf(2);
    const [latest, older] = res.body.items;
    expect(latest.src).to.include("frame_0010");
    expect(latest.frame).to.equal(10);
    expect(older.frame).to.equal(5);
  });

  it("health endpoint returns OK", async () => {
    const res = await request.get("/health");
    expect(res.status).to.equal(200);
    expect(res.text).to.equal("OK");
  });

  it("/api/status includes sdForge poll interval metadata", async () => {
    const res = await request.get("/api/status");
    expect(res.status).to.equal(200);
    expect(res.body.sdForge).to.be.an("object");
    expect(res.body.sdForge).to.have.property("pollIntervalMs");
    expect(res.body.sdForge.pollIntervalMs).to.equal(0);
  });

  it("GET /api/plugins returns a list", async () => {
    const res = await request.get("/api/plugins");
    expect(res.status).to.equal(200);
    expect(res.body.plugins).to.be.an("array");
  });

  it("POST /api/img2img rejects missing init_image", async () => {
    const res = await request.post("/api/img2img").send({ prompt: "x" });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.be.a("string");
  });

  it("sequencer API lists, saves, loads timelines", async () => {
    let res = await request.get("/api/sequencer");
    expect(res.status).to.equal(200);
    expect(res.body.timelines).to.deep.equal([]);
    const timeline = {
      version: 1,
      durationSec: 4,
      fps: 24,
      loop: true,
      markers: [
        { t: 0, name: "Start" },
        { t: 2, name: "Mid" },
      ],
      tracks: [
        {
          id: "tr1",
          param: "translation_x",
          keyframes: [
            { t: 0, v: 0, easing: "easeIn" },
            { t: 4, v: 2 },
          ],
        },
      ],
    };
    res = await request.post("/api/sequencer/test_clip").send(timeline);
    expect(res.status).to.equal(200);
    expect(res.body.ok).to.equal(true);
    res = await request.get("/api/sequencer");
    expect(res.body.timelines).to.include("test_clip");
    res = await request.get("/api/sequencer/test_clip");
    expect(res.status).to.equal(200);
    expect(res.body.timeline.version).to.equal(1);
    expect(res.body.timeline.tracks).to.have.lengthOf(1);
    expect(res.body.timeline.tracks[0].keyframes[0].easing).to.equal("easeIn");
    expect(res.body.timeline.markers).to.have.lengthOf(2);
    expect(res.body.timeline.markers[0].name).to.equal("Start");
    res = await request.delete("/api/sequencer/test_clip");
    expect(res.status).to.equal(200);
    res = await request.get("/api/sequencer/test_clip");
    expect(res.status).to.equal(404);
  });

  it("sequencer API rejects invalid marker", async () => {
    const timeline = {
      version: 1,
      durationSec: 2,
      fps: 24,
      loop: true,
      markers: [{ t: 3, name: "Late" }],
      tracks: [{ id: "tr1", param: "translation_x", keyframes: [{ t: 0, v: 0 }, { t: 2, v: 1 }] }],
    };
    const res = await request.post("/api/sequencer/bad_marker").send(timeline);
    expect(res.status).to.equal(400);
    expect(res.body.error).to.be.a("string");
  });

  it("sequencer API rejects invalid keyframe easing", async () => {
    const timeline = {
      version: 1,
      durationSec: 2,
      fps: 24,
      loop: true,
      tracks: [
        {
          id: "tr1",
          param: "translation_x",
          keyframes: [{ t: 0, v: 0, easing: "bounce" }, { t: 2, v: 1 }],
        },
      ],
    };
    const res = await request.post("/api/sequencer/bad_ease").send(timeline);
    expect(res.status).to.equal(400);
    expect(res.body.error).to.be.a("string");
  });

  it("spawns audio modulator with mappings", async () => {
    const proc = new EventEmitter();
    proc.stdout = new Readable({ read() {} });
    proc.stderr = new Readable({ read() {} });
    let captured;
    const spawner = (cmd, args) => {
      captured = { cmd, args };
      setImmediate(() => proc.emit("close", 0));
      return proc;
    };
    if (svc && svc.close) {
      await svc.close();
    }
    svc = await start({ port: 0, framesDir: tmp, uploadsDir: uploads, sequencersDir: sequencers, enableMq: false, spawner });
    request = supertest(`http://127.0.0.1:${svc.port}`);

    const res = await request
      .post("/api/audio-map")
      .send({ audioPath: "/tmp/song.wav", fps: 24, mappings: [{ param: "cfg", freq_min: 20, freq_max: 300, out_min: 0, out_max: 10 }], live: true, mediatorHost: "h", mediatorPort: "p" });

    expect(res.status).to.equal(200);
    expect(captured.cmd).to.equal("python3");
    expect(captured.args).to.include("--audio");
    expect(captured.args).to.include("/tmp/song.wav");
    expect(captured.args).to.include("--live");
    expect(captured.args.join(" ")).to.include("defora_cli.audio_reactive_modulator");
  });

  it("uploads audio files and returns server path", async () => {
    const payload = {
      name: "test.wav",
      data: "data:audio/wav;base64,ZmFrZQ==",
    };
    const res = await request.post("/api/audio-upload").send(payload);
    expect(res.status).to.equal(200);
    expect(res.body.ok).to.equal(true);
    expect(res.body.path).to.include("test.wav");
    const exists = fs.existsSync(res.body.path);
    expect(exists).to.equal(true);
  });
});

describe("txt2img fallback", () => {
  let svc;
  let tmp;
  let uploads;
  let sequencers;
  let gpuPoolPath;
  let request;
  let fetchCalls;
  let originalFetch;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    uploads = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-"));
    sequencers = fs.mkdtempSync(path.join(os.tmpdir(), "seq-"));
    gpuPoolPath = path.join(os.tmpdir(), `gpu-pool-${Date.now()}-${Math.random().toString(36).slice(2)}` + ".json");
    fs.writeFileSync(path.join(tmp, "frame_0001.png"), "fake-image");
    fs.writeFileSync(
      gpuPoolPath,
      JSON.stringify(
        {
          enabled: true,
          strategy: "least_busy",
          nodes: [
            { url: "http://node-a:7860", name: "node-a", backend: "sd-forge", enabled: true, priority: 1 },
          ],
        },
        null,
        2
      )
    );
    fetchCalls = [];
    originalFetch = global.fetch;
    global.fetch = async (url, opts = {}) => {
      const method = opts.method || "GET";
      fetchCalls.push({ url: String(url), method, body: opts.body || null });
      if (String(url).endsWith("/docs")) {
        return {
          ok: true,
          status: 200,
          text: async () => "<html>ok</html>",
        };
      }
      if (String(url).endsWith("/sdapi/v1/options")) {
        return {
          ok: true,
          status: 200,
          text: async () => "{}",
          json: async () => ({}),
        };
      }
      if (String(url).endsWith("/sdapi/v1/txt2img")) {
        return {
          ok: false,
          status: 500,
          text: async () => "Internal Server Error",
        };
      }
      if (String(url).endsWith("/deforum_api/batches")) {
        return {
          ok: true,
          status: 202,
          json: async () => ({ batch_id: "batch-1" }),
        };
      }
      if (String(url).endsWith("/deforum_api/batches/batch-1")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: "completed" }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    };

    svc = await start({
      port: 0,
      framesDir: tmp,
      uploadsDir: uploads,
      sequencersDir: sequencers,
      gpuPoolPath,
      enableMq: false,
    });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    if (svc && svc.close) {
      await svc.close();
    }
    [tmp, uploads, sequencers].forEach((dir) => {
      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
    if (gpuPoolPath && fs.existsSync(gpuPoolPath)) {
      fs.unlinkSync(gpuPoolPath);
    }
  });

  it("falls back to deforum preview and bypasses broken txt2img on later requests", async () => {
    const payload = {
      prompt: "test preview",
      negative_prompt: "",
      steps: 4,
      cfg_scale: 1.5,
      width: 512,
      height: 512,
      sampler_name: "Euler a",
      settings: {
        prompts: ["original"],
        negative_prompts: "",
        W: 1024,
        H: 576,
        steps: 12,
        sampler: "Euler a",
        seed: 123,
      },
    };

    const first = await request.post("/api/txt2img").send(payload);
    const second = await request.post("/api/txt2img").send(payload);

    expect(first.status).to.equal(200);
    expect(first.body.ok).to.equal(true);
    expect(first.body.fallback).to.equal("deforum_preview");
    expect(second.status).to.equal(200);
    expect(second.body.fallback).to.equal("deforum_preview");

    const txt2imgCalls = fetchCalls.filter((call) => call.url.endsWith("/sdapi/v1/txt2img"));
    const deforumBatchCalls = fetchCalls.filter((call) => call.url.endsWith("/deforum_api/batches"));
    expect(txt2imgCalls).to.have.lengthOf(1);
    expect(deforumBatchCalls).to.have.lengthOf(2);
  });
});

describe("distributed Forge sync", () => {
  let svc;
  let tmp;
  let uploads;
  let sequencers;
  let gpuPoolPath;
  let request;
  let fetchCalls;
  let originalFetch;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    uploads = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-"));
    sequencers = fs.mkdtempSync(path.join(os.tmpdir(), "seq-"));
    gpuPoolPath = path.join(os.tmpdir(), `gpu-pool-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(
      gpuPoolPath,
      JSON.stringify(
        {
          enabled: true,
          strategy: "least_busy",
          nodes: [
            { url: "http://node-a:7860", name: "node-a", backend: "sd-forge", enabled: true, priority: 1 },
            { url: "http://node-b:7860", name: "node-b", backend: "sd-forge", enabled: true, priority: 2 },
          ],
        },
        null,
        2
      )
    );
    fetchCalls = [];
    originalFetch = global.fetch;
    global.fetch = async (url, opts = {}) => {
      fetchCalls.push({ url: String(url), method: opts.method || "GET", body: opts.body || null });
      if (String(url).endsWith("/docs")) {
        return {
          ok: true,
          status: 200,
          text: async () => "<html>ok</html>",
        };
      }
      if (String(url).endsWith("/sdapi/v1/options")) {
        return {
          ok: true,
          status: 200,
          text: async () => "{}",
          json: async () => ({}),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    };
    svc = await start({
      port: 0,
      framesDir: tmp,
      uploadsDir: uploads,
      sequencersDir: sequencers,
      gpuPoolPath,
      enableMq: false,
    });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    if (svc && svc.close) {
      await svc.close();
    }
    [tmp, uploads, sequencers].forEach((dir) => {
      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
    if (gpuPoolPath && fs.existsSync(gpuPoolPath)) {
      fs.unlinkSync(gpuPoolPath);
    }
  });

  it("switches models across all enabled Forge nodes", async () => {
    const res = await request.post("/api/sd-models/switch").send({ model_name: "sdxl_turbo.safetensors" });

    expect(res.status).to.equal(200);
    const posts = fetchCalls.filter((call) => call.method === "POST" && call.url.endsWith("/sdapi/v1/options"));
    expect(posts.map((call) => call.url)).to.deep.equal([
      "http://node-a:7860/sdapi/v1/options",
      "http://node-b:7860/sdapi/v1/options",
    ]);
    expect(posts.map((call) => JSON.parse(call.body).sd_model_checkpoint)).to.deep.equal([
      "sdxl_turbo.safetensors",
      "sdxl_turbo.safetensors",
    ]);
    expect(res.body.sync.successes).to.equal(2);
    expect(res.body.model.metadata.type).to.equal("SDXL Turbo");
  });

  it("updates forge options across all enabled Forge nodes", async () => {
    const res = await request.post("/api/forge/options").send({
      sampler_name: "Euler a",
      cfg_scale: 1,
      steps: 2,
    });

    expect(res.status).to.equal(200);
    const posts = fetchCalls.filter((call) => call.method === "POST" && call.url.endsWith("/sdapi/v1/options"));
    const payloads = posts.map((call) => JSON.parse(call.body));
    expect(posts).to.have.lengthOf(2);
    expect(payloads.every((payload) => payload.sampler_name === "Euler a")).to.equal(true);
    expect(payloads.every((payload) => payload.cfg_scale === 1)).to.equal(true);
    expect(payloads.every((payload) => payload.steps === 2)).to.equal(true);
    expect(res.body.sync.successes).to.equal(2);
  });
});

describe("ollama story generator", () => {
  let svc;
  let tmp;
  let uploads;
  let sequencers;
  let gpuPoolPath;
  let request;
  let fetchCalls;
  let originalFetch;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    uploads = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-"));
    sequencers = fs.mkdtempSync(path.join(os.tmpdir(), "seq-"));
    gpuPoolPath = path.join(os.tmpdir(), `gpu-pool-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(
      gpuPoolPath,
      JSON.stringify(
        {
          enabled: true,
          strategy: "least_busy",
          nodes: [
            { url: "http://ollama-a:11434", name: "ollama-a", backend: "ollama", enabled: true, priority: 1, model: "llama3.1:8b" },
          ],
        },
        null,
        2
      )
    );
    fetchCalls = [];
    originalFetch = global.fetch;
    global.fetch = async (url, opts = {}) => {
      fetchCalls.push({ url: String(url), method: opts.method || "GET", body: opts.body || null });
      if (String(url).endsWith("/api/tags")) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ models: [{ name: "llama3.1:8b" }, { name: "mistral:7b" }] }),
        };
      }
      if (String(url).endsWith("/api/generate")) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            response: JSON.stringify({
              theme: "Sky temples",
              style: "Cinematic",
              summary: "A floating-city flythrough",
              scenes: {
                "0": "wide aerial shot of floating temples above storm clouds",
                "24": "closer pass through luminous archways",
                "48": "descending toward a central altar with lightning around it",
                "72": "final reveal over the glowing city core",
              },
              motion: {
                Zoom: "0:(1.0), 96:(1.03)",
                "Translation X": "0:(0), 96:(1.2)",
              },
            }),
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    };

    svc = await start({
      port: 0,
      framesDir: tmp,
      uploadsDir: uploads,
      sequencersDir: sequencers,
      gpuPoolPath,
      enableMq: false,
    });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    if (svc && svc.close) {
      await svc.close();
    }
    [tmp, uploads, sequencers].forEach((dir) => {
      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
    if (gpuPoolPath && fs.existsSync(gpuPoolPath)) {
      fs.unlinkSync(gpuPoolPath);
    }
  });

  it("lists models from an ollama instance", async () => {
    const res = await request.get("/api/ollama/models").query({ url: "http://ollama-a:11434" });

    expect(res.status).to.equal(200);
    expect(res.body.models.map((model) => model.name)).to.deep.equal(["llama3.1:8b", "mistral:7b"]);
  });

  it("generates story plans through configured ollama nodes", async () => {
    const res = await request.post("/api/story/generate").send({
      theme: "Sky temples",
      style: "Cinematic",
      width: 1024,
      height: 576,
      fps: 24,
      totalFrames: 96,
      numScenes: 4,
    });

    expect(res.status).to.equal(200);
    expect(res.body.source.backend).to.equal("ollama");
    expect(res.body.source.model).to.equal("llama3.1:8b");
    expect(res.body.scenes["0"]).to.include("floating temples");
    expect(res.body.motion.Zoom).to.equal("0:(1.0), 96:(1.03)");

    const generateCall = fetchCalls.find((call) => call.url.endsWith("/api/generate"));
    expect(generateCall).to.exist;
    expect(JSON.parse(generateCall.body).model).to.equal("llama3.1:8b");
  });
});
