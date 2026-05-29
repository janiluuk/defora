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
});
