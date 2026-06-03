import test from "node:test";
import assert from "node:assert/strict";
import {
  computeForgePreviewProgress,
  normalizeForgeProgressImage,
} from "../src/shared/forge-preview-progress.mjs";

test("normalizeForgeProgressImage adds data url prefix", () => {
  assert.equal(normalizeForgeProgressImage("abc123"), "data:image/png;base64,abc123");
  assert.equal(normalizeForgeProgressImage("data:image/jpeg;base64,abc"), "data:image/jpeg;base64,abc");
  assert.equal(normalizeForgeProgressImage(""), null);
});

test("computeForgePreviewProgress prefers forge progress for single-frame preview", () => {
  const result = computeForgePreviewProgress(
    {
      progress: 0.425,
      current_image: "abc",
      state: { sampling_step: 8, sampling_steps: 20 },
    },
    null,
    { maxFrames: 1 },
  );
  assert.equal(result.progressPct, 42.5);
  assert.equal(result.progressSource, "forge");
  assert.equal(result.previewImage, "data:image/png;base64,abc");
  assert.match(result.progressLabel, /Step 8\/20/);
});

test("computeForgePreviewProgress falls back to sampling steps", () => {
  const result = computeForgePreviewProgress(
    {
      progress: 0,
      state: { sampling_step: 5, sampling_steps: 10 },
    },
    null,
    { maxFrames: 1 },
  );
  assert.equal(result.progressPct, 50);
  assert.equal(result.progressSource, "sampling_steps");
});

test("computeForgePreviewProgress blends batch and forge for multi-frame jobs", () => {
  const result = computeForgePreviewProgress(
    { progress: 0.5, state: { sampling_step: 10, sampling_steps: 20 } },
    { progress: 0.25, status: "running" },
    { maxFrames: 4 },
  );
  assert.ok(result.progressPct > 25);
  assert.ok(result.progressPct < 40);
  assert.equal(result.progressSource, "batch+forge");
});
