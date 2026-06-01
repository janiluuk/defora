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

  it("lists user projects with frame counts and video URLs", async () => {
    const projectDir = path.join(uploadsDir, "projects", "demo-project");
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, "frame_00000.png"), "fake-png");
    fs.writeFileSync(path.join(projectDir, "frame_00001.png"), "fake-png");
    fs.writeFileSync(path.join(projectDir, "export.mp4"), "fake-mp4");

    const res = await fetch(`${base}/api/video-swarm/projects`);
    assert.equal(res.status, 200);
    const body = await res.json();
    const project = body.projects.find((p) => p.id === "uploads-project:demo-project");
    assert.ok(project);
    assert.equal(project.frameCount, 2);
    assert.equal(project.hasVideo, true);
    assert.ok(project.videoUrl.includes("/api/video-swarm/file"));
    assert.ok(!project.title.includes("demo-project"));
  });

  it("lists loose uploads root videos as projects", async () => {
    fs.writeFileSync(path.join(uploadsDir, "stage-recording.mp4"), "fake-mp4");

    const res = await fetch(`${base}/api/video-swarm/projects`);
    assert.equal(res.status, 200);
    const body = await res.json();
    const loose = body.projects.find((p) => p.id === "uploads-loose:stage-recording.mp4");
    assert.ok(loose);
    assert.equal(loose.hasVideo, true);
    assert.ok(!loose.title.includes("stage-recording"));
  });

  it("lists all generated videos with friendly titles", async () => {
    const projectDir = path.join(uploadsDir, "projects", "clip-pack");
    fs.mkdirSync(projectDir, { recursive: true });
    fs.writeFileSync(path.join(projectDir, "export-a.mp4"), "fake-mp4-a");
    fs.writeFileSync(path.join(uploadsDir, "defora_rec_test.mp4"), "fake-rec");

    const res = await fetch(`${base}/api/video-swarm/videos`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.videos.length >= 2);
    const recording = body.videos.find((v) => v.videoPath && v.videoPath.includes("defora_rec_test.mp4"));
    const exportVid = body.videos.find((v) => v.videoPath && v.videoPath.includes("export-a.mp4"));
    assert.ok(recording);
    assert.ok(exportVid);
    assert.match(recording.title, /Recording/i);
    assert.ok(!recording.title.includes("defora_rec_test"));
    assert.ok(!exportVid.title.includes("export-a"));
  });

  it("lists uploaded audio with friendly titles and serve URL", async () => {
    fs.writeFileSync(path.join(uploadsDir, "1730000000-demo-track.wav"), "fake-wav");

    const res = await fetch(`${base}/api/video-swarm/audio`);
    assert.equal(res.status, 200);
    const body = await res.json();
    const track = body.audio.find((a) => a.audioPath && a.audioPath.includes("demo-track.wav"));
    assert.ok(track);
    assert.match(track.title, /Audio/i);
    assert.ok(!track.title.includes("demo-track"));
    assert.ok(track.audioUrl.includes("/api/video-swarm/file"));

    const fileRes = await fetch(`${base}${track.audioUrl}`);
    assert.equal(fileRes.status, 200);
    assert.match(String(fileRes.headers.get("content-type") || ""), /audio/i);
  });

  it("uploads into a new project folder when dir=projects", async () => {
    const buf = Buffer.from("defora-fake-project-upload");
    const res = await fetch(`${base}/api/video-swarm/upload?name=clip.mp4&dir=projects`, {
      method: "POST",
      headers: { "Content-Type": "video/mp4" },
      body: buf,
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.path.includes(`${path.sep}projects${path.sep}project-`));
    const listRes = await fetch(`${base}/api/video-swarm/projects`);
    const list = await listRes.json();
    assert.ok(list.projects.some((p) => p.videoPath === body.path));
  });
});
