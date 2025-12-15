const fs = require("fs");
const path = require("path");
const os = require("os");
const supertest = require("supertest");
const { expect } = require("chai");
const { describe, it, beforeEach, afterEach, after } = require("node:test");
const { EventEmitter } = require("events");
const { Readable } = require("stream");

const { start } = require("../server");

describe("web server frames API", () => {
  let svc;
  let tmp;
  let request;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    const f1 = path.join(tmp, "frame_0005.png");
    const f2 = path.join(tmp, "frame_0010.png");
    fs.writeFileSync(f1, "a");
    fs.writeFileSync(f2, "b");
    const early = Date.now() - 5000;
    fs.utimesSync(f1, early / 1000, early / 1000);

    svc = await start({ port: 0, framesDir: tmp, enableMq: false, listen: false });
    request = supertest(svc.app);
  });

  afterEach(async () => {
    if (svc && svc.close) {
      await svc.close();
    }
    if (tmp) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  after(async () => {
    if (svc && svc.close) {
      await svc.close();
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

  it("spawns audio modulator with mappings", async () => {
    const proc = new EventEmitter();
    proc.stdout = new Readable({ read() {} });
    proc.stderr = new Readable({ read() {} });
    let captured;
    const spawner = (cmd, args) => {
      captured = { cmd, args };
      setImmediate(() => proc.emit("close", 0));
      setImmediate(() => {
        proc.stdout.push(null);
        proc.stderr.push(null);
      });
      return proc;
    };
    if (svc && svc.close) {
      await svc.close();
    }
    svc = await start({ port: 0, framesDir: tmp, enableMq: false, spawner, listen: false });
    request = supertest(svc.app);

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

  it("proxies mediator state via python helper", async () => {
    const proc = new EventEmitter();
    proc.stdout = new Readable({ read() {} });
    proc.stderr = new Readable({ read() {} });
    let captured;
    const spawner = (cmd, args) => {
      captured = { cmd, args };
      setImmediate(() => {
        proc.stdout.emit("data", Buffer.from('{"cfg":7,"strength":0.6}'));
        proc.emit("close", 0);
        proc.stdout.push(null);
        proc.stderr.push(null);
      });
      return proc;
    };
    if (svc && svc.close) {
      await svc.close();
    }
    svc = await start({ port: 0, framesDir: tmp, enableMq: false, spawner, mediatorHost: "mh", mediatorPort: "9999", listen: false });
    request = supertest(svc.app);

    const res = await request.get("/api/mediator/state?keys=cfg,strength");
    expect(res.status).to.equal(200);
    expect(res.body.cfg).to.equal(7);
    expect(captured.args).to.include("mh");
    expect(captured.args).to.include("9999");
  });

  it("health endpoint returns ok even without playlist", async () => {
    const res = await request.get("/api/health");
    expect(res.status).to.equal(200);
    expect(res.body.ok).to.equal(true);
    expect(res.body.stream).to.be.a("string");
  });

  it("returns audio peaks", async () => {
    const audioPath = path.join(tmp, "clip.raw");
    fs.writeFileSync(audioPath, Buffer.from(Array.from({ length: 1024 }, (_, i) => i % 256)));
    const res = await request.post("/api/audio/peaks").send({ audioPath, samples: 16 });
    expect(res.status).to.equal(200);
    expect(res.body.peaks).to.have.length(16);
  });

  it("returns beats", async () => {
    const res = await request.post("/api/audio/beats").send({ bpm: 120, bars: 2 });
    expect(res.status).to.equal(200);
    expect(res.body.beats[0]).to.equal(0);
    expect(res.body.beats[1]).to.be.closeTo(0.5, 0.01);
  });

  it("previews lfo shapes", async () => {
    const res = await request.post("/api/lfo/preview").send({ shape: "Square", steps: 8, depth: 1, base: 0.5 });
    expect(res.status).to.equal(200);
    expect(res.body.samples).to.have.length(8);
  });

  it("applies default band mappings with intensity", async () => {
    const proc = new EventEmitter();
    proc.stdout = new Readable({ read() {} });
    proc.stderr = new Readable({ read() {} });
    let captured;
    const spawner = (cmd, args) => {
      captured = { cmd, args };
      setImmediate(() => {
        proc.emit("close", 0);
        proc.stdout.push(null);
        proc.stderr.push(null);
      });
      return proc;
    };
    if (svc && svc.close) {
      await svc.close();
    }
    svc = await start({ port: 0, framesDir: tmp, enableMq: false, spawner, listen: false });
    request = supertest(svc.app);

    const res = await request
      .post("/api/audio-map")
      .send({ audioPath: "/tmp/song.wav", bands: [{ param: "cfg", freq_min: 50, freq_max: 500, intensity: 2 }] });

    expect(res.status).to.equal(200);
    const mapIdx = captured.args.findIndex((a) => a === "--mapping");
    expect(mapIdx).to.be.greaterThan(0);
    const mappingJson = captured.args[mapIdx + 1];
    const parsed = JSON.parse(mappingJson);
    expect(parsed[0].out_max).to.equal(2);
  });

  it("passes multiple custom bands to audio map", async () => {
    const proc = new EventEmitter();
    proc.stdout = new Readable({ read() {} });
    proc.stderr = new Readable({ read() {} });
    let captured;
    const spawner = (cmd, args) => {
      captured = { cmd, args };
      setImmediate(() => {
        proc.emit("close", 0);
        proc.stdout.push(null);
        proc.stderr.push(null);
      });
      return proc;
    };
    if (svc && svc.close) {
      await svc.close();
    }
    svc = await start({ port: 0, framesDir: tmp, enableMq: false, spawner, listen: false });
    request = supertest(svc.app);

    const bands = [
      { param: "cfg", freq_min: 20, freq_max: 80, intensity: 0.5 },
      { param: "strength", freq_min: 80, freq_max: 200, intensity: 1.0 },
      { param: "translation_z", freq_min: 200, freq_max: 800, intensity: 1.5 },
      { param: "rotation_z", freq_min: 800, freq_max: 4000, intensity: 0.8 },
    ];

    const res = await request.post("/api/audio-map").send({ audioPath: "/tmp/song.wav", bands });
    expect(res.status).to.equal(200);
    const mapIdx = captured.args.findIndex((a) => a === "--mapping");
    const parsed = JSON.parse(captured.args[mapIdx + 1]);
    expect(parsed).to.have.length(4);
    expect(parsed[2].param).to.equal("translation_z");
    expect(parsed[2].out_max).to.equal(1.5);
  });
});
