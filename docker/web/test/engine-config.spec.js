import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FORGE_MODEL,
  DEFAULT_LCM_LORA_TAG,
  mergeLoraIntoPrompt,
  modelsMatch,
} from "../src/shared/engine-config.mjs";

describe("engine-config", () => {
  it("matches model paths by basename", () => {
    assert.equal(
      modelsMatch("SDXL/sd_xl_turbo_1.0_fp16.safetensors", "sd_xl_turbo_1.0_fp16.safetensors"),
      true,
    );
    assert.equal(modelsMatch("other.safetensors", DEFAULT_FORGE_MODEL), false);
  });

  it("merges LCM lora tag without duplicating", () => {
    assert.equal(mergeLoraIntoPrompt("hello", DEFAULT_LCM_LORA_TAG), `hello, ${DEFAULT_LCM_LORA_TAG}`);
    assert.equal(mergeLoraIntoPrompt(DEFAULT_LCM_LORA_TAG, DEFAULT_LCM_LORA_TAG), DEFAULT_LCM_LORA_TAG);
    assert.equal(mergeLoraIntoPrompt("", DEFAULT_LCM_LORA_TAG), DEFAULT_LCM_LORA_TAG);
  });
});
