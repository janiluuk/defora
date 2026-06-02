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

  it("GET /api/infrastructure returns mediator and transcoder nodes", async () => {
    const prev = {
      DEF_MEDIATOR_HOST: process.env.DEF_MEDIATOR_HOST,
      DEF_MEDIATOR_PORT: process.env.DEF_MEDIATOR_PORT,
      TRANSCODER_NODES: process.env.TRANSCODER_NODES,
    };
    process.env.DEF_MEDIATOR_HOST = "127.0.0.1";
    process.env.DEF_MEDIATOR_PORT = "65530";
    process.env.TRANSCODER_NODES = "edge|127.0.0.1:65529|rtmp://127.0.0.1:65529/live/test";
    const infraSvc = await start({ port: 0, framesDir: tmp, uploadsDir: uploads, sequencersDir: sequencers, enableMq: false });
    const infraRequest = supertest(`http://127.0.0.1:${infraSvc.port}`);
    const res = await infraRequest.get("/api/infrastructure");
    expect(res.status).to.equal(200);
    expect(res.body.mediator).to.be.an("object");
    expect(res.body.mediator.host).to.equal("127.0.0.1");
    expect(res.body.mediator.address).to.equal("127.0.0.1:65530");
    expect(res.body.transcoders).to.be.an("array").with.lengthOf(1);
    expect(res.body.transcoders[0].name).to.equal("edge");
    expect(res.body.transcoders[0].address).to.include("127.0.0.1");
    await infraSvc.close();
    if (prev.DEF_MEDIATOR_HOST === undefined) delete process.env.DEF_MEDIATOR_HOST;
    else process.env.DEF_MEDIATOR_HOST = prev.DEF_MEDIATOR_HOST;
    if (prev.DEF_MEDIATOR_PORT === undefined) delete process.env.DEF_MEDIATOR_PORT;
    else process.env.DEF_MEDIATOR_PORT = prev.DEF_MEDIATOR_PORT;
    if (prev.TRANSCODER_NODES === undefined) delete process.env.TRANSCODER_NODES;
    else process.env.TRANSCODER_NODES = prev.TRANSCODER_NODES;
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

  it("POST /api/wan/merge-settings returns Wan Video deforum payload", async () => {
    const res = await request
      .post("/api/wan/merge-settings")
      .send({ maxFrames: 96, fps: 12, prompt: "ocean", wanEngine: { wan_speed_preset: "Turbo" } });
    expect(res.status).to.equal(200);
    expect(res.body.settings.animation_mode).to.equal("Wan Video");
    expect(res.body.settings.max_frames).to.equal(96);
    expect(res.body.settings.fps).to.equal(12);
    expect(String(res.body.settings.animation_prompts || "")).to.include("ocean");
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
      clips: [
        {
          id: "clip-1",
          type: "prompt",
          t: 0,
          endT: 2,
          label: "Prompt 1",
          payload: { pos: "sunset city", neg: "blur" },
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
    expect(res.body.timeline.clips).to.have.lengthOf(1);
    expect(res.body.timeline.clips[0].type).to.equal("prompt");
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
    await request.post("/api/gpu-pool/refresh");
    fetchCalls.length = 0;
    const res = await request.post("/api/sd-models/switch").send({ model_name: "sdxl_turbo.safetensors" });

    expect(res.status).to.equal(200);
    const posts = fetchCalls.filter((call) => call.method === "POST" && call.url.endsWith("/sdapi/v1/options"));
    expect(posts).to.have.lengthOf(1);
    expect(posts[0].url).to.match(/^http:\/\/node-[ab]:7860\/sdapi\/v1\/options$/);
    expect(JSON.parse(posts[0].body).sd_model_checkpoint).to.equal("sdxl_turbo.safetensors");
    expect(res.body.success).to.equal(true);
    expect(res.body.node).to.exist;
    expect(res.body.model.metadata.type).to.equal("SDXL Turbo");
  });

  it("updates forge options across all enabled Forge nodes", async () => {
    await request.post("/api/gpu-pool/refresh");
    fetchCalls.length = 0;
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

describe("deforum batches across GPU pool", () => {
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
          strategy: "round_robin",
          nodes: [
            { id: "node-a", url: "http://node-a:7860", name: "GPU A", backend: "sd-forge", enabled: true, priority: 1 },
            { id: "node-b", url: "http://node-b:7860", name: "GPU B", backend: "sd-forge", enabled: true, priority: 2 },
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
        return { ok: true, status: 200, text: async () => "<html>ok</html>" };
      }
      if (String(url).includes("node-a:7860/deforum_api/batches/batch-q1/cancel")) {
        return { ok: true, status: 200, json: async () => ({ status: "cancelled" }) };
      }
      if (String(url).includes("node-a:7860/deforum_api/batches/batch-q1") && (opts.method || "GET") === "DELETE") {
        return { ok: false, status: 404, text: async () => "not found" };
      }
      if (String(url).includes("node-a:7860/deforum_api/batches")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            batches: [{ batch_id: "batch-q1", status: "queued", max_frames: 24, model: "xl-a" }],
          }),
        };
      }
      if (String(url).includes("node-b:7860/deforum_api/batches")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            batches: [{ batch_id: "batch-r1", status: "running", max_frames: 12, model: "xl-b" }],
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url} ${opts.method || "GET"}`);
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
    if (svc && svc.close) await svc.close();
    [tmp, uploads, sequencers].forEach((dir) => {
      if (dir && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    });
    if (gpuPoolPath && fs.existsSync(gpuPoolPath)) fs.unlinkSync(gpuPoolPath);
  });

  it("aggregates deforum batches from all sd-forge nodes", async () => {
    const res = await request.get("/api/deforum/batches?all=1");
    expect(res.status).to.equal(200);
    expect(res.body.batches).to.be.an("array").with.lengthOf(2);
    expect(res.body.nodes).to.be.an("array").with.lengthOf(2);
    const ids = res.body.batches.map((batch) => batch.batch_id).sort();
    expect(ids).to.deep.equal(["batch-q1", "batch-r1"]);
    expect(res.body.batches.every((batch) => batch._node && batch._node.name)).to.equal(true);
  });

  it("cancels a queued batch on the target GPU node", async () => {
    const res = await request
      .post("/api/deforum/batches/batch-q1/cancel")
      .query({ nodeId: "node-a" })
      .send({});
    expect(res.status).to.equal(200);
    expect(res.body.ok).to.equal(true);
    expect(res.body.batchId).to.equal("batch-q1");
    const cancelCalls = fetchCalls.filter((call) => call.url.includes("/cancel"));
    expect(cancelCalls.length).to.be.at.least(1);
  });
});

describe("FreeCut SPA embed", () => {
  let svc;
  let request;

  beforeEach(async () => {
    svc = await start({ port: 0, enableMq: false });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    if (svc && svc.close) await svc.close();
  });

  it("injects pathname fix for /freecut/projects so the client router matches", async () => {
    const res = await request.get("/freecut/projects");
    expect(res.status).to.equal(200);
    expect(res.text).to.include("defora-freecut-path-fix");
    expect(res.text).to.include('var r="/projects"');
    expect(res.text).to.include('id="root"');
  });

  it("still serves hashed freecut assets", async () => {
    const res = await request.get("/freecut/assets/index-BRurG7kq.js");
    expect(res.status).to.equal(200);
    expect(res.headers["content-type"] || "").to.match(/javascript/);
  });
});
