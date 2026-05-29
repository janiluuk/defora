const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { diffPromptLines } = require("../shared/prompt-diff.js");

describe("prompt-diff", () => {
  it("marks identical lines as same", () => {
    const chunks = diffPromptLines("a\nb", "a\nb");
    assert.equal(chunks.filter((c) => c.kind === "same").length, 2);
  });

  it("marks changed lines", () => {
    const chunks = diffPromptLines("old line", "new line");
    assert.ok(chunks.some((c) => c.kind === "removed" || c.kind === "added" || c.kind === "changed"));
  });

  it("handles empty prompts", () => {
    assert.equal(diffPromptLines("", "").length, 0);
    const added = diffPromptLines("", "only");
    assert.equal(added[0].kind, "added");
  });
});
