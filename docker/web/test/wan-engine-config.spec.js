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

  it("applies speed and motion presets", async () => {
    const { getWanSpeedPreset, getWanMotionPreset } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    assert.equal(getWanSpeedPreset("Turbo").wan_inference_steps, 8);
    assert.equal(getWanMotionPreset("Handheld").wan_motion_strength, 0.75);
  });

  it("injects motion LoRA tags into animation_prompts", async () => {
    const { mergeWanEngineIntoDeforumSettings } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    const merged = mergeWanEngineIntoDeforumSettings(
      { prompts: { 0: "ocean" } },
      { motion_loras: ["v2_lora_ZoomIn"], motion_lora_weight: 0.7 },
      { positivePrompt: "ocean" },
    );
    const schedule = JSON.parse(merged.animation_prompts);
    assert.match(schedule["0"], /<lora:v2_lora_ZoomIn:0\.70>/);
  });

  it("builds animation_prompts from prompts object", async () => {
    const { buildAnimationPromptsJson } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    const json = buildAnimationPromptsJson({ prompts: { 0: "hello", 30: "world" } });
    assert.deepEqual(JSON.parse(json), { 0: "hello", 30: "world" });
  });

  it("maps wan init image to deforum use_init", async () => {
    const { mergeWanEngineIntoDeforumSettings } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    const init = "data:image/png;base64,abc";
    const merged = mergeWanEngineIntoDeforumSettings(
      { prompts: { 0: "portrait" } },
      { wan_use_init_image: true, wan_init_image: init, wan_i2v_init_strength: 0.9 },
      { positivePrompt: "portrait" },
    );
    assert.equal(merged.use_init, true);
    assert.equal(merged.init_image, init);
    assert.equal(merged.strength, 0.9);
  });

  it("picks closest wan resolution for init image size", async () => {
    const { pickWanResolutionForSize } = await loadEsm("..", "src", "shared", "wan-engine-config.mjs");
    assert.match(pickWanResolutionForSize(1920, 1080), /1280x720/);
    assert.match(pickWanResolutionForSize(480, 864), /480x864/);
  });
});
