const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { resolveStoragePaths } = require("../modules/storage-paths.js");

describe("storage-paths", () => {
  it("defaults uploads and videoswarm under runsDir", () => {
    const webRoot = path.join("/tmp", "defora-web");
    const p = resolveStoragePaths({ webRoot, runsDir: "/tmp/defora-runs" }, {});
    assert.equal(p.uploadsDir, path.resolve("/tmp/defora-runs/uploads"));
    assert.equal(p.videoswarmDir, path.resolve("/tmp/defora-runs/videoswarm"));
    assert.equal(p.framesDir, path.resolve(path.join(webRoot, "frames")));
  });

  it("honours explicit UPLOADS_DIR from env", () => {
    const p = resolveStoragePaths(
      { webRoot: "/w" },
      { RUNS_DIR: "/data/runs", UPLOADS_DIR: "/data/runs/uploads", FRAMES_DIR: "/data/frames" },
    );
    assert.equal(p.uploadsDir, path.resolve("/data/runs/uploads"));
    assert.equal(p.framesDir, path.resolve("/data/frames"));
  });
});
