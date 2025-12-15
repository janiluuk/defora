const { describe, it } = require("node:test");
const { expect } = require("chai");
const { mapControl } = require("../controlMapping");

describe("controlMapping", () => {
  it("filters live params and coerces numbers", () => {
    const res = mapControl("liveParam", { cfg: "7.5", noise_multiplier: "bad", rotation_z: -10, junk: 1 });
    expect(res.valid).to.equal(true);
    expect(res.payload.cfg).to.equal(7.5);
    expect(res.payload.rotation_z).to.equal(-10);
    expect(res.payload.noise_multiplier).to.be.undefined;
    expect(res.payload.junk).to.be.undefined;
  });

  it("rejects unknown control types", () => {
    const res = mapControl("unknown", { a: 1 });
    expect(res.valid).to.equal(false);
    expect(res.payload).to.deep.equal({});
  });

  it("allows noop controls", () => {
    const res = mapControl("motionPreset", { name: "Orbit" });
    expect(res.valid).to.equal(true);
    expect(res.detail).to.equal("motionPreset");
  });

  it("allows prompt mix", () => {
    const res = mapControl("prompts", { prompt_mix: 0.5, positive_prompt_1: "a", positive_prompt_2: "b", prompt_schedule: [{ t: 1, mix: 0.2 }] });
    expect(res.valid).to.equal(true);
    expect(res.payload.prompt_mix).to.equal(0.5);
    expect(res.payload.positive_prompt_1).to.equal("a");
    expect(res.payload.prompt_schedule).to.deep.equal([{ t: 1, mix: 0.2 }]);
  });

  it("passes motionPreset payloads through", () => {
    const res = mapControl("motionPreset", { name: "Orbit", intensity: 1.2 });
    expect(res.valid).to.equal(true);
    expect(res.payload.name).to.equal("Orbit");
  });
});
