const fs = require("fs");
const path = require("path");
const os = require("os");
const supertest = require("supertest");
const { expect } = require("chai");
const { describe, it, beforeEach, afterEach } = require("node:test");

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

    svc = await start({ port: 0, framesDir: tmp, enableMq: false });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    if (svc && svc.close) {
      await svc.close();
    }
    if (tmp) {
      fs.rmSync(tmp, { recursive: true, force: true });
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
});
