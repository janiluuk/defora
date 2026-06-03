/**
 * Preview compositor phase-2 settings (crossfade, remember layer, promote).
 */
const { readFileSync } = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");
const { describe, it, before, after } = require("node:test");

function loadAppDefinition() {
  return require(path.join(__dirname, "..", "src", "app-definition.js"));
}

describe("preview compositor", () => {
  let dom;
  let appVm;
  let createApp;

  before(() => {
    const html = readFileSync(path.join(__dirname, "test-app.html"), "utf-8");
    dom = new JSDOM(html, { url: "http://localhost" });
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.location = dom.window.location;
    global.SVGElement = dom.window.SVGElement;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    ({ createApp } = require("vue/dist/vue.cjs.js"));
    const appDef = loadAppDefinition();
    appDef.mounted = () => {};
    const app = createApp(appDef);
    app.config.warnHandler = () => {};
    appVm = app.mount(document.getElementById("app"));
    appVm.restoreSessionPromptOpen = false;
  });

  after(() => {
    if (dom?.window) dom.window.close();
  });

  it("normalizeDefaultAnimationSettings clamps compositor crossfade ms", () => {
    appVm.defaultAnimation.previewCompositorCrossfadeMs = 12000;
    appVm.defaultAnimation = appVm.normalizeDefaultAnimationSettings(appVm.defaultAnimation);
    expect(appVm.defaultAnimation.previewCompositorCrossfadeMs).to.equal(5000);
  });

  it("promoteToDeforum selects deforum layer", () => {
    appVm.activeVideoLayerId = "webgl";
    appVm.promoteToDeforum();
    expect(appVm.activeVideoLayerId).to.equal("deforum");
    expect(appVm._userPickedPreviewLayer).to.equal(true);
  });

  it("applyStartupVideoPreview respects rememberCompositorLayerOnStartup", () => {
    appVm.activeVideoLayerId = "blend";
    appVm._userPickedPreviewLayer = true;
    appVm.defaultAnimation.rememberCompositorLayerOnStartup = true;
    appVm.applyStartupVideoPreview();
    expect(appVm.activeVideoLayerId).to.equal("blend");
  });

  it("previewStageStyle exposes crossfade CSS variable", () => {
    appVm.defaultAnimation.previewCompositorCrossfadeMs = 1200;
    appVm.defaultAnimation = appVm.normalizeDefaultAnimationSettings(appVm.defaultAnimation);
    const style = appVm.previewStageStyle;
    expect(style["--preview-compositor-crossfade-ms"]).to.equal("1200ms");
  });

  it("setForgeLayerOpacityLfoLink toggles compositor LFO and switches to deforum", () => {
    appVm.activeVideoLayerId = "webgl";
    appVm.setForgeLayerOpacityLfoLink(2);
    expect(appVm.defaultAnimation.forgeLayerOpacityLfoLink).to.equal(2);
    expect(appVm.activeVideoLayerId).to.equal("deforum"); // blend removed; falls through to deforum
    appVm.setForgeLayerOpacityLfoLink(2);
    expect(appVm.defaultAnimation.forgeLayerOpacityLfoLink).to.equal(null);
  });

  it("normalizeDefaultAnimationSettings clamps periodic table controls", () => {
    appVm.defaultAnimation.mode = "periodic_table";
    appVm.defaultAnimation.ptLayout = "bogus";
    appVm.defaultAnimation.ptTransitionMs = 100;
    appVm.defaultAnimation = appVm.normalizeDefaultAnimationSettings(appVm.defaultAnimation);
    expect(appVm.defaultAnimation.mode).to.equal("periodic_table");
    expect(appVm.defaultAnimation.ptLayout).to.equal("table");
    expect(appVm.defaultAnimation.ptTransitionMs).to.equal(400);
  });

  it("normalizeDefaultAnimationSettings clamps protoplanet controls", () => {
    appVm.defaultAnimation.mode = "protoplanet";
    appVm.defaultAnimation.ppGravityConstant = 9999;
    appVm.defaultAnimation.ppRadius = 2;
    appVm.defaultAnimation = appVm.normalizeDefaultAnimationSettings(appVm.defaultAnimation);
    expect(appVm.defaultAnimation.mode).to.equal("protoplanet");
    expect(appVm.defaultAnimation.ppGravityConstant).to.equal(1000);
    expect(appVm.defaultAnimation.ppRadius).to.equal(10);
  });

  it("normalizeDefaultAnimationSettings clamps scene transition controls", () => {
    appVm.defaultAnimation.mode = "transition";
    appVm.defaultAnimation.txTransition = 2;
    appVm.defaultAnimation.txTexture = 9;
    appVm.defaultAnimation.txThreshold = -1;
    appVm.defaultAnimation = appVm.normalizeDefaultAnimationSettings(appVm.defaultAnimation);
    expect(appVm.defaultAnimation.mode).to.equal("transition");
    expect(appVm.defaultAnimation.txTransition).to.equal(1);
    expect(appVm.defaultAnimation.txTexture).to.equal(5);
    expect(appVm.defaultAnimation.txThreshold).to.equal(0);
    expect(appVm.defaultAnimation.txTransitionAnimate).to.equal(true);
    expect(appVm.defaultAnimation.txUseTexture).to.equal(true);
  });

  it("normalizeDefaultAnimationSettings clamps deforum backdrop mix", () => {
    appVm.defaultAnimation.deforumBackdropMix = 4;
    appVm.defaultAnimation = appVm.normalizeDefaultAnimationSettings(appVm.defaultAnimation);
    expect(appVm.defaultAnimation.deforumBackdropMix).to.equal(1);
    expect(appVm.defaultAnimation.deforumBackdropEnabled).to.equal(true);
  });

  it("syncDeforumBackdropToWebGL forwards latest thumb to ThreeBackground", () => {
    const calls = [];
    const mockBg = {
      setDeforumBackdropFromUrl(url, opts) {
        calls.push({ url, opts });
      },
      clearDeforumBackdrop() {},
    };
    Object.defineProperty(appVm.$refs, "threeBackgroundRef", {
      value: mockBg,
      configurable: true,
    });
    appVm.thumbs = [{ src: "/api/frames/frame_00001.png", name: "frame_00001.png" }];
    appVm.activeVideoLayerId = "webgl";
    appVm.defaultAnimation.deforumBackdropEnabled = true;
    appVm.defaultAnimation.deforumBackdropMix = 0.4;
    appVm.syncDeforumBackdropToWebGL();
    expect(calls).to.have.length(1);
    expect(calls[0].url).to.include("frame_00001.png");
    expect(calls[0].opts.opacity).to.equal(0.4);
  });

  it("runLfos modulates forge layer opacity when LFO linked", () => {
    appVm.defaultAnimation.forgeLayerOpacity = 0.2;
    appVm.defaultAnimation.forgeLayerOpacityLfoBase = 0.2;
    appVm.defaultAnimation.forgeLayerOpacityLfoLink = 2;
    appVm.lfos[1].on = true;
    appVm.lfos[1].depth = 1;
    appVm.lfos[1].phase = 0;
    appVm.lfos[1].shape = "Sine";
    appVm.lastLfoTick = appVm.getNow() - 50;
    appVm.runLfos();
    expect(appVm.defaultAnimation.forgeLayerOpacity).to.be.within(0, 1);
  });

  it("frameStripThumbs uses run detail frames when frame rail is linked", () => {
    appVm.thumbs = [{ src: "/frames/live.png", name: "live.png" }];
    appVm.runsDetailView = {
      run_id: "run_x",
      frames: ["00001.png", "00002.png"],
    };
    appVm.frameRailRunId = "run_x";
    const thumbs = appVm.frameStripThumbs;
    expect(thumbs).to.have.length(2);
    expect(thumbs[0].src).to.include("/api/runs/run_x/frames/00001.png");
  });
});
