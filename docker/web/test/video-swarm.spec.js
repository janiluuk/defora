const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { start } = require("../server.js");

describe("video-swarm storage API", () => {
  let svc;
  let base;
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-vswarm-"));
  const runsDir = path.join(tmpRoot, "runs");
  const uploadsDir = path.join(runsDir, "uploads");

  before(async () => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    svc = await start({
      port: 0,
      runsDir,
      uploadsDir,
      framesDir: path.join(tmpRoot, "frames"),
      sequencersDir: path.join(tmpRoot, "sequencers"),
      videoswarmDir: path.join(runsDir, "videoswarm"),
      enableMq: false,
    });
    base = `http://127.0.0.1:${svc.port}`;
  });

  after(async () => {
    await svc.close();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("creates folders and lists videos-only recursively", async () => {
    const mkdirRes = await fetch(`${base}/api/video-swarm/mkdir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rootId: "uploads", path: uploadsDir, name: "nested" }),
    });
    assert.equal(mkdirRes.status, 201);
    const nestedDir = path.join(uploadsDir, "nested");
    fs.writeFileSync(path.join(nestedDir, "clip.mp4"), "fake-mp4");

    const browseRes = await fetch(
      `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(uploadsDir)}&videosOnly=1&sort=name`,
    );
    assert.equal(browseRes.status, 200);
    const body = await browseRes.json();
    assert.equal(body.kind, "local");
    assert.equal(body.folders.length, 0);
    assert.ok(body.videos.some((v) => v.name === "clip.mp4"));
  });

  it("reports unified storage layout", async () => {
    const res = await fetch(`${base}/api/storage/layout`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.uploadsDir, uploadsDir);
    assert.equal(body.runsDir, path.dirname(uploadsDir));
    assert.equal(body.shared.uploadsUnderRuns, true);
    assert.equal(body.shared.videoswarmUnderRuns, true);
  });

  it("uploads a video file into uploads root", async () => {
    const buf = Buffer.from("defora-fake-mp4-upload-test");
    const res = await fetch(`${base}/api/video-swarm/upload?name=example_clip.mp4`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: buf,
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.path.startsWith(uploadsDir));
    const browseRes = await fetch(
      `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(uploadsDir)}&sort=name`,
    );
    const browse = await browseRes.json();
    assert.ok(browse.videos.some((v) => v.name.includes("example_clip")));
  });

  it("resolves nested uploads paths to uploads root, not runs", async () => {
    const nestedDir = path.join(uploadsDir, "clips");
    fs.mkdirSync(nestedDir, { recursive: true });
    const browseRes = await fetch(
      `${base}/api/video-swarm/browse?rootId=uploads&path=${encodeURIComponent(nestedDir)}&sort=name`,
    );
    assert.equal(browseRes.status, 200);
    const body = await browseRes.json();
    assert.equal(body.rootId, "uploads");
    assert.equal(body.path, nestedDir);
  });

  it("persists cloud sources and returns them in roots", async () => {
    const createRes = await fetch(`${base}/api/video-swarm/cloud-sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: "Team Drive",
        provider: "google_drive",
        url: "https://drive.google.com/drive/folders/example",
      }),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    const sourceId = created.source.id;

    const rootsRes = await fetch(`${base}/api/video-swarm/roots`);
    const rootsBody = await rootsRes.json();
    assert.ok(rootsBody.roots.some((r) => r.id === `cloud:${sourceId}`));

    const browseRes = await fetch(`${base}/api/video-swarm/browse?rootId=cloud:${sourceId}`);
    assert.equal(browseRes.status, 200);
    const browseBody = await browseRes.json();
    assert.equal(browseBody.kind, "cloud");
    assert.equal(browseBody.cloudSource.id, sourceId);
  });
});
