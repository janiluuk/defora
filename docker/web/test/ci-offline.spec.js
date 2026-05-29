const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  isCiOffline,
  skipBackgroundProbes,
  blockExternalFetches,
  isBlockedExternalUrl,
  installCiFetchGuard,
} = require("../modules/ci-offline");

describe("ci-offline", () => {
  it("detects explicit CI offline mode", () => {
    assert.equal(isCiOffline({ DEFORA_CI_OFFLINE: "1" }), true);
    assert.equal(isCiOffline({ GITHUB_ACTIONS: "true" }), false);
  });

  it("skips background probes in GitHub Actions", () => {
    assert.equal(skipBackgroundProbes({ GITHUB_ACTIONS: "true" }), true);
    assert.equal(skipBackgroundProbes({}), false);
  });

  it("blocks forge and private-network URLs when offline", () => {
    assert.equal(isBlockedExternalUrl("http://192.168.2.101:7860/sdapi/v1/options"), true);
    assert.equal(isBlockedExternalUrl("http://127.0.0.1:7860/sdapi/v1/options"), false);
    assert.equal(isBlockedExternalUrl("http://ollama-a:11434/api/tags"), true);
  });

  it("does not block external fetches with GITHUB_ACTIONS alone", () => {
    assert.equal(blockExternalFetches({ GITHUB_ACTIONS: "true" }), false);
  });

  it("installCiFetchGuard rejects blocked URLs under DEFORA_CI_OFFLINE", async () => {
    const prevFetch = global.fetch;
    global.fetch = async () => ({ ok: true, status: 200, text: async () => "{}" });
    try {
      installCiFetchGuard({ DEFORA_CI_OFFLINE: "1" });
      await assert.rejects(
        () => global.fetch("http://192.168.2.101:7860/sdapi/v1/options"),
        /External services disabled in CI/
      );
      const res = await global.fetch("http://127.0.0.1:9/health");
      assert.equal(res.ok, true);
    } finally {
      global.fetch = prevFetch;
      delete global.fetch.__deforaCiGuard;
    }
  });
});
