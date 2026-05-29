const fs = require("fs");
const path = require("path");
const os = require("os");
const supertest = require("supertest");
const { expect } = require("chai");
const { describe, it, beforeEach, afterEach } = require("node:test");

const { start } = require("../server");
const { diffPromptLines } = require("../shared/prompt-diff.js");

describe("Runs compare API", () => {
  let svc;
  let tmp;
  let runsDir;
  let request;

  beforeEach(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "frames-"));
    runsDir = fs.mkdtempSync(path.join(os.tmpdir(), "runs-"));
    const runA = path.join(runsDir, "run_a");
    const runB = path.join(runsDir, "run_b");
    fs.mkdirSync(runA);
    fs.mkdirSync(runB);
    fs.writeFileSync(
      path.join(runA, "run.json"),
      JSON.stringify({
        status: "completed",
        model: "sdxl",
        seed: 1,
        prompt_positive: "sunset",
        prompt_negative: "blur",
      })
    );
    fs.writeFileSync(
      path.join(runB, "run.json"),
      JSON.stringify({
        status: "completed",
        model: "sd15",
        seed: 2,
        prompt_positive: "city",
        prompt_negative: "noise",
      })
    );
    svc = await start({ port: 0, framesDir: tmp, runsDir, enableMq: false });
    request = supertest(`http://127.0.0.1:${svc.port}`);
  });

  afterEach(async () => {
    if (svc && svc.close) await svc.close();
    [tmp, runsDir].forEach((d) => {
      if (d && fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
    });
  });

  it("POST /api/runs/compare returns matrix for two runs", async () => {
    const res = await request
      .post("/api/runs/compare")
      .send({ run_ids: ["run_a", "run_b"] });
    expect(res.status).to.equal(200);
    expect(res.body.comparison.run_ids).to.deep.equal(["run_a", "run_b"]);
    expect(res.body.comparison.matrix.model.run_a).to.equal("sdxl");
    expect(res.body.comparison.matrix.prompt_positive.run_b).to.equal("city");
    expect(res.body.comparison.prompt_diffs).to.exist;
    expect(res.body.comparison.prompt_diffs.run_a).to.equal("run_a");
    expect(res.body.comparison.prompt_diffs.prompt_positive).to.deep.equal(
      diffPromptLines("sunset", "city"),
    );
    expect(res.body.comparison.prompt_diffs.prompt_negative).to.deep.equal(
      diffPromptLines("blur", "noise"),
    );
  });

  it("POST /api/runs/compare format=csv returns attachment", async () => {
    const res = await request
      .post("/api/runs/compare")
      .send({ run_ids: ["run_a", "run_b"], format: "csv" });
    expect(res.status).to.equal(200);
    expect(res.headers["content-type"]).to.match(/text\/csv/);
    expect(res.text).to.include("prompt_positive");
    expect(res.text).to.include("run_a");
  });

  it("rejects fewer than two run ids", async () => {
    const res = await request.post("/api/runs/compare").send({ run_ids: ["run_a"] });
    expect(res.status).to.equal(400);
  });
});
