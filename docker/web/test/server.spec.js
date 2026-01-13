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
  let request;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    uploads = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-"));
    const f1 = path.join(tmp, "frame_0005.png");
    const f2 = path.join(tmp, "frame_0010.png");
    fs.writeFileSync(f1, "a");
    fs.writeFileSync(f2, "b");
    const early = Date.now() - 5000;
    fs.utimesSync(f1, early / 1000, early / 1000);

    svc = await start({ port: 0, framesDir: tmp, uploadsDir: uploads, enableMq: false });
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
    svc = await start({ port: 0, framesDir: tmp, uploadsDir: uploads, enableMq: false, spawner });
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
