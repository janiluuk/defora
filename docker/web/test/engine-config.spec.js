const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadEsm } = require("./load-esm");

describe("engine-config", () => {
  it("matches model paths by basename", async () => {
    const { modelsMatch, DEFAULT_FORGE_MODEL } = await loadEsm("..", "src", "shared", "engine-config.mjs");
    assert.equal(
      modelsMatch("SDXL/sd_xl_turbo_1.0_fp16.safetensors", "sd_xl_turbo_1.0_fp16.safetensors"),
      true,
    );
    assert.equal(modelsMatch("other.safetensors", DEFAULT_FORGE_MODEL), false);
  });

  it("merges LCM lora tag without duplicating", async () => {
    const { mergeLoraIntoPrompt, DEFAULT_LCM_LORA_TAG } = await loadEsm("..", "src", "shared", "engine-config.mjs");
    assert.equal(mergeLoraIntoPrompt("hello", DEFAULT_LCM_LORA_TAG), `hello, ${DEFAULT_LCM_LORA_TAG}`);
    assert.equal(mergeLoraIntoPrompt(DEFAULT_LCM_LORA_TAG, DEFAULT_LCM_LORA_TAG), DEFAULT_LCM_LORA_TAG);
    assert.equal(mergeLoraIntoPrompt("", DEFAULT_LCM_LORA_TAG), DEFAULT_LCM_LORA_TAG);
  });
});
