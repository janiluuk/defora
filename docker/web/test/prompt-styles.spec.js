const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { loadEsm } = require("./load-esm");
const { morphStyleModifiers } = require("../src/morph-utils.js");
const promptStylesStore = require("../modules/prompt-styles-store.js");

describe("prompt styles", () => {
  it("merges positive and negative prompt parts", async () => {
    const { mergePromptParts, applyPromptStyleToPrompts } = await loadEsm("..", "src", "shared", "prompt-styles.mjs");
    assert.equal(mergePromptParts("cat", "oil painting"), "cat, oil painting");
    assert.equal(applyPromptStyleToPrompts({ positive: "cat", negative: "blur" }, {
      positive: "cubism",
      negative: "low quality",
    }).positive, "cat, cubism");
    assert.equal(
      applyPromptStyleToPrompts({ positive: "cat", negative: "blur" }, {
        positive: "cubism",
        negative: "low quality",
      }).negative,
      "blur, low quality",
    );
  });

  it("parses forge style rows and dedupes ids", async () => {
    const { forgeStyleToRecord, dedupeStyleIds } = await loadEsm("..", "src", "shared", "prompt-styles.mjs");
    const row = forgeStyleToRecord({ name: "Cubism", prompt: "cubist", negative_prompt: "photo" }, 0);
    assert.equal(row.name, "Cubism");
    assert.equal(row.id, "cubism");
    const styles = dedupeStyleIds([row, { ...row, name: "Cubism 2" }]);
    assert.equal(styles[0].id, "cubism");
    assert.equal(styles[1].id, "cubism_2");
  });

  it("morphs style modifiers across the crossfader", () => {
    const a = { positive: "cubist", negative: "photo" };
    const b = { positive: "anime", negative: "realistic" };
    const atA = morphStyleModifiers(a, b, 0);
    assert.equal(atA.positive, "cubist");
    assert.equal(atA.negative, "photo");
    const mid = morphStyleModifiers(a, b, 0.5);
    assert.match(mid.positive, /cubist/i);
    assert.match(mid.positive, /anime/i);
    const atB = morphStyleModifiers(a, b, 1);
    assert.equal(atB.positive, "anime");
    assert.equal(atB.negative, "realistic");
  });

  it("persists styles to disk", async () => {
    const webRoot = fs.mkdtempSync(path.join(os.tmpdir(), "defora-styles-"));
    const seedPath = path.join(webRoot, "data", "prompt-styles-seed.json");
    fs.mkdirSync(path.dirname(seedPath), { recursive: true });
    fs.writeFileSync(
      seedPath,
      JSON.stringify({
        styles: [{ id: "test_style", name: "Test", positive: "vivid", negative: "blur", source: "test" }],
      }),
      "utf8",
    );
    const styles = await promptStylesStore.readStyles(webRoot);
    assert.equal(styles.length, 1);
    assert.equal(styles[0].name, "Test");
    styles.push({
      id: "another",
      name: "Another",
      positive: "x",
      negative: "",
      source: "custom",
    });
    await promptStylesStore.writeStyles(webRoot, styles);
    const again = await promptStylesStore.readStyles(webRoot);
    assert.equal(again.length, 2);
  });
});
