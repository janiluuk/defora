const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadEsm } = require("./load-esm");

describe("wan-engine-config", () => {
  it("parses wan resolution strings", async () => {
    const { parseWanResolution } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    assert.deepEqual(parseWanResolution("864x480 (Landscape)"), { width: 864, height: 480 });
    assert.deepEqual(parseWanResolution("1280x720"), { width: 1280, height: 720 });
  });

  it("merges wan settings into deforum payload", async () => {
    const { WAN_ANIMATION_MODE, mergeWanEngineIntoDeforumSettings } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    const merged = mergeWanEngineIntoDeforumSettings(
      { animation_mode: "2D", W: 512, H: 512, prompts: { 0: "a fox" } },
      { wan_t2v_model: "1.3B VACE", wan_resolution: "864x480 (Landscape)" },
      { positivePrompt: "a fox in snow" },
    );
    assert.equal(merged.animation_mode, WAN_ANIMATION_MODE);
    assert.equal(merged.W, 864);
    assert.equal(merged.H, 480);
    assert.equal(merged.wan_t2v_model, "1.3B VACE");
    assert.ok(merged.animation_prompts.includes("fox"));
  });

  it("builds animation_prompts from prompts object", async () => {
    const { buildAnimationPromptsJson } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    const json = buildAnimationPromptsJson({ prompts: { 0: "hello", 30: "world" } });
    assert.deepEqual(JSON.parse(json), { 0: "hello", 30: "world" });
  });
});
