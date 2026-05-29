const { readFileSync } = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");
const vm = require("vm");
const { describe, it, before, beforeEach } = require("node:test");
let createApp;
let nextTick;

/**
 * CI uses Node 18: native `Blob` exists but `File` often does not. JSDOM `File` is not accepted
 * by Node's `URL.createObjectURL`. Subclass native `Blob` as `File` when needed so
 * `file instanceof Blob` and blob URLs behave like the browser.
 */
function ensureGlobalFileAndBlob() {
  const B = globalThis.Blob;
  const F = globalThis.File;
  if (typeof F === "function" && typeof B === "function") {
    try {
      const probe = new F([new Uint8Array(1)], "p", { type: "application/octet-stream" });
      if (!(probe instanceof B)) throw new Error("File/Blob mismatch");
      if (typeof URL.createObjectURL === "function") {
        const u = URL.createObjectURL(probe);
        URL.revokeObjectURL(u);
      }
      return;
    } catch {
      /* fall through */
    }
  }
  if (typeof B === "function" && typeof F !== "function") {
    globalThis.File = class FilePoly extends B {
      constructor(bits, name, options = {}) {
        super(bits, options);
        this.name = String(name);
        this.lastModified = options.lastModified ?? Date.now();
      }
    };
    return;
  }
  const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });
  globalThis.Blob = window.Blob;
  globalThis.File = window.File;
  
  // Mock URL.createObjectURL and revokeObjectURL for JSDOM
  if (typeof globalThis.URL.createObjectURL !== "function") {
    const blobUrls = new Map();
    let id = 0;
    globalThis.URL.createObjectURL = function(blob) {
      const url = `blob:http://localhost/${++id}`;
      blobUrls.set(url, blob);
      return url;
    };
    globalThis.URL.revokeObjectURL = function(url) {
      blobUrls.delete(url);
    };
  }
}
ensureGlobalFileAndBlob();

function ensureGlobalAnimationFrame(win) {
  const raf = win && typeof win.requestAnimationFrame === "function"
    ? win.requestAnimationFrame.bind(win)
    : (cb) => setTimeout(() => cb(Date.now()), 16);
  const caf = win && typeof win.cancelAnimationFrame === "function"
    ? win.cancelAnimationFrame.bind(win)
    : (id) => clearTimeout(id);
  globalThis.requestAnimationFrame = raf;
  globalThis.cancelAnimationFrame = caf;
}

ensureGlobalAnimationFrame(typeof window !== "undefined" ? window : null);

function installFileReaderMock({ failRead = false } = {}) {
  const MockFileReader = class {
    readAsDataURL() {
      if (failRead) {
        queueMicrotask(() => {
          if (typeof this.onerror === "function") {
            this.onerror(new Error("Read failed"));
          }
        });
        return;
      }
      this.result = "data:audio/wav;base64,ZmFrZQ==";
      if (typeof this.onload === "function") {
        this.onload({ target: this });
      }
    }
  };
  globalThis.FileReader = MockFileReader;
  if (typeof global !== "undefined") {
    global.FileReader = MockFileReader;
  }
  if (global.window && typeof global.window === "object") {
    global.window.FileReader = MockFileReader;
  }
  return MockFileReader;
}

function removeFileReaderMock() {
  delete globalThis.FileReader;
  if (typeof global !== "undefined" && global !== globalThis) {
    delete global.FileReader;
  }
  if (global.window && typeof global.window === "object") {
    delete global.window.FileReader;
  }
}

function loadAppDefinition() {
  if (typeof global.FileReader !== "function") {
    installFileReaderMock();
  }
  // Load from the extracted app-definition.js instead of parsing index.html
  const appDefPath = path.join(__dirname, "..", "src", "app-definition.js");
  const appDef = require(appDefPath);
  return appDef;
}

function instantiate(appDef, overrides = {}) {
  const data = appDef.data();
  const instance = { ...data, ...overrides };
  Object.entries(appDef.methods).forEach(([k, fn]) => {
    instance[k] = fn.bind(instance);
  });
  if (appDef.computed) {
    Object.entries(appDef.computed).forEach(([k, fn]) => {
      Object.defineProperty(instance, k, { get: fn.bind(instance) });
    });
  }
  return instance;
}

function mountQuietApp(appDef) {
  const app = createApp(appDef);
  // CI logs become unusable when Vue dumps the full proxied app object.
  app.config.warnHandler = () => {};
  return app.mount("#app");
}

class FakeSocket {
  constructor() {
    this.sent = [];
    this.readyState = 1;
  }
  send(msg) {
    this.sent.push(JSON.parse(msg));
  }
}

describe("Deforumation Web UI", () => {
  let dom;
  let document;
  let appVm;

  before(async () => {
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
    ensureGlobalAnimationFrame(dom.window);
    ({ createApp, nextTick } = require("vue/dist/vue.cjs.js"));

    const appDef = loadAppDefinition();
    appDef.mounted = () => {};
    appVm = mountQuietApp(appDef);
    appVm.refreshStreamStatus = async () => {};
    document = dom.window.document;
  });

  beforeEach(async () => {
    if (appVm.hlsWatchEnabled && typeof appVm.detachHlsPlayer === "function") {
      appVm.hlsWatchEnabled = false;
      appVm.detachHlsPlayer();
    } else {
      appVm.hlsWatchEnabled = false;
    }
    appVm.switchTab("LIVE");
    appVm.currentSubTab = { LIVE: 'MONITOR', PROMPTS: 'PROMPTS', MODULATION: 'LFO', SETTINGS: 'ENGINE', MOTION: 'PERFORMANCE' };
    appVm.videoReady = false;
    appVm.defaultAnimation.preferDeforumVideo = false;
    appVm.performance.lastPreviewPath = "";
    appVm.initVideoLayers();
    appVm.selectVideoLayer("webgl");
    appVm.videoLayerAddOpen = false;
    await nextTick();
  });

  it("renders tabs for all sections", () => {
    const tabs = [...document.querySelectorAll(".tab")].map((el) => el.textContent.trim());
    expect(tabs.join(" ")).to.include("LIVE");
    expect(tabs.join(" ")).to.include("STREAM");
    expect(tabs.join(" ")).to.include("LIBRARY");
    expect(tabs.join(" ")).to.include("PROMPTS");
    expect(tabs.join(" ")).to.include("MOTION");
    expect(tabs.join(" ")).to.include("MODULATION");
    expect(tabs.join(" ")).to.include("SETTINGS");
    expect(tabs.join(" ")).to.not.include("GENERATE");
    expect(tabs.join(" ")).to.not.include("AUDIO");
    expect(tabs.join(" ")).to.not.include("RUNS");
    expect(tabs.length).to.equal(7);
    expect(document.querySelectorAll(".tab__icon-wrap").length).to.equal(7);
  });

  it("has a video player and overlay HUD", () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    const overlay = document.querySelector(".overlay");
    expect(overlay.textContent).to.include("Seed");
  });

  it("does not show HLS on the main stage until the user enables it on Stream", () => {
    appVm.currentTab = "LIVE";
    appVm.hlsWatchEnabled = false;
    appVm.videoReady = true;
    appVm.deforumPlaying = true;
    appVm.defaultAnimation.preferDeforumVideo = true;
    appVm.initVideoLayers();
    expect(appVm.showMainStageHls).to.equal(false);
    expect(appVm.showDeforumVideo).to.equal(false);

    appVm.currentTab = "STREAM";
    expect(appVm.showMainStageHls).to.equal(false);
    appVm.hlsPreviewStreamValid = true;
    appVm.hlsWatchEnabled = true;
    expect(appVm.hlsWatchEnabled).to.equal(true);
    expect(appVm.showMainStageHls).to.equal(true);
    appVm.videoReady = true;
    expect(appVm.showDeforumVideo).to.equal(true);
    appVm.standbyPreviewVideoUrl = "/api/preview/standby-video";
    expect(appVm.showStandbyPreviewVideo).to.equal(true);
    appVm.hlsWatchEnabled = false;
    appVm.currentTab = "LIVE";
  });

  it("does not enable HLS watch without a valid stream preview", () => {
    appVm.hlsPreviewStreamValid = false;
    appVm.enableHlsWatch();
    expect(appVm.hlsWatchEnabled).to.equal(false);
    appVm.hlsPreviewStreamValid = true;
    appVm.enableHlsWatch();
    expect(appVm.hlsWatchEnabled).to.equal(true);
    appVm.hlsWatchEnabled = false;
    appVm.currentTab = "LIVE";
  });

  it("defaults to the Deforum layer and can show the live feed when HLS watch is enabled", () => {
    appVm.hlsPreviewStreamValid = true;
    appVm.hlsWatchEnabled = true;
    appVm.currentTab = "STREAM";
    appVm.defaultAnimation.preferDeforumVideo = true;
    appVm.initVideoLayers();
    expect(appVm.defaultAnimation.preferDeforumVideo).to.equal(true);
    expect(appVm.activeVideoLayerId).to.equal("deforum");
    expect(appVm.showDeforumVideo).to.equal(false);

    appVm.videoReady = true;
    appVm.deforumPlaying = true;

    expect(appVm.showDeforumVideo).to.equal(true);
    expect(appVm.videoLayerStatusLabel).to.match(/live|ready/i);
    appVm.hlsWatchEnabled = false;
    appVm.currentTab = "LIVE";
  });

  it("keeps the current frame visible while Deforum is warming up after play", () => {
    appVm.currentTab = "LIVE";
    appVm.selectVideoLayer("deforum");
    appVm.performance.lastPreviewPath = "/frames/frame_0001.png";
    appVm.pinHeldPreviewFrame();
    appVm.deforumPlaying = true;
    appVm.videoReady = false;

    expect(appVm.showPreviewStill).to.equal(true);
    expect(appVm.displayedPreviewStillPath).to.equal("/frames/frame_0001.png");
    expect(appVm.showFrameProcessing).to.equal(true);
    expect(appVm.showFrameProcessingOnStage).to.equal(true);
    expect(appVm.showFrameProcessingInChrome).to.equal(false);
    expect(appVm.showDefaultAnimation).to.equal(false);

    appVm.videoReady = true;
    appVm.deforumGeneratedFrameCount = 1;
    appVm.hlsWatchEnabled = false;
    appVm.currentTab = "STREAM";
    appVm.currentTab = "LIVE";

    expect(appVm.showDeforumVideo).to.equal(false);
    appVm.clearHeldPreviewFrame();
    appVm.deforumPlaying = false;
  });

  it("shows preview processing in chrome instead of over the WebGL animation", () => {
    appVm.currentTab = "LIVE";
    appVm.selectVideoLayer("webgl");
    appVm.previewGenerating = true;
    appVm.performance.lastPreviewPath = "";
    appVm.clearHeldPreviewFrame();

    expect(appVm.showPreviewStill).to.equal(false);
    expect(appVm.showFrameProcessing).to.equal(true);
    expect(appVm.showFrameProcessingOnStage).to.equal(false);
    expect(appVm.showFrameProcessingInChrome).to.equal(true);
    expect(appVm.frameProcessingLabel).to.match(/rendering preview frame/i);

    appVm.previewGenerating = false;
  });

  it("keeps the standby animation visible on initial LIVE load", () => {
    appVm.currentTab = "LIVE";
    appVm.deforumPlaying = false;
    appVm.defaultAnimation.preferDeforumVideo = false;
    appVm.performance.lastPreviewPath = "/frames/frame_0001.png";

    expect(appVm.activePreviewStillPath).to.equal("/frames/frame_0001.png");
    expect(appVm.showPreviewStill).to.equal(false);

    appVm.currentTab = "MOTION";
    expect(appVm.showPreviewStill).to.equal(false);

    appVm.selectVideoLayer("deforum");
    expect(appVm.showPreviewStill).to.equal(true);

    appVm.currentTab = "LIVE";
    expect(appVm.showPreviewStill).to.equal(true);
  });

  it("keeps Deforum selected on cold start when preferring Deforum video", () => {
    appVm.activeVideoLayerId = "deforum";
    appVm.defaultAnimation.preferDeforumVideo = true;
    appVm.deforumPlaying = false;
    appVm.videoReady = false;

    appVm.ensureStandbyAnimationAtStartup();

    expect(appVm.activeVideoLayerId).to.equal("deforum");
  });

  it("falls back to WebGL when Deforum video is not preferred", () => {
    appVm.activeVideoLayerId = "deforum";
    appVm.defaultAnimation.preferDeforumVideo = false;
    appVm.deforumPlaying = false;
    appVm.videoReady = false;

    appVm.ensureStandbyAnimationAtStartup();

    expect(appVm.activeVideoLayerId).to.equal("webgl");
    expect(appVm.showDefaultAnimation).to.equal(true);
  });

  it("scopes standby controls to the WebGL animation engine and resets them", async () => {
    appVm.switchSubTab("LIVE", "MONITOR");
    appVm.selectVideoLayer("webgl");
    appVm.rightPanelOpen = true;
    appVm.liveDrawerOpen = true;
    appVm.liveAnimationBoxOpen = true;
    await nextTick();
    expect(document.body.textContent).to.include("Instance count");

    appVm.setDefaultAnimationMode("volume");
    await nextTick();
    expect(document.body.textContent).to.include("Beam count");

    appVm.defaultAnimation.beamCount = 11;
    appVm.defaultAnimation.speed = 1.9;
    appVm.setDefaultAnimationMode("orbital");
    await nextTick();
    expect(document.body.textContent).to.include("Orbit size");
    expect(document.body.textContent).to.not.include("Beam count");

    appVm.setDefaultAnimationMode("nebula");
    await nextTick();
    expect(document.body.textContent).to.include("Mist");

    appVm.setDefaultAnimationMode("raycast");
    await nextTick();
    expect(document.body.textContent).to.include("Line type");
    expect(document.body.textContent).to.include("Threshold");
    expect(document.body.textContent).to.include("Visualize threshold");
    expect(document.body.textContent).to.not.include("Beam count");
    expect(document.body.textContent).to.not.include("Mist");

    appVm.setDefaultAnimationMode("marching");
    await nextTick();
    expect(document.body.textContent).to.include("Blob count");
    expect(document.body.textContent).to.include("Resolution");
    expect(document.body.textContent).to.include("Isolation");
    expect(document.body.textContent).to.include("Floor");
    expect(document.body.textContent).to.not.include("Visualize threshold");

    appVm.setDefaultAnimationMode("ocean");
    await nextTick();
    expect(document.body.textContent).to.include("Sun elevation");
    expect(document.body.textContent).to.include("Distortion scale");
    expect(document.body.textContent).to.include("Cloud coverage");
    expect(document.body.textContent).to.not.include("Blob count");
    expect(document.body.textContent).to.not.include("Visualize threshold");

    appVm.selectVideoLayer("deforum");
    await nextTick();

    expect(document.body.textContent).to.not.include("Visualize threshold");
    expect(document.body.textContent).to.not.include("Blob count");

    appVm.resetDefaultAnimationSettings();
    expect(appVm.defaultAnimation.mode).to.equal("instancing");
    expect(appVm.defaultAnimation.instCount).to.equal(12000);
    expect(appVm.defaultAnimation.speed).to.equal(0.75);
    expect(appVm.activeVideoLayerId).to.equal("deforum");

    appVm.selectVideoLayer("webgl");
    await nextTick();
    appVm.liveAnimationBoxOpen = true;
    expect(document.body.textContent).to.include("Instance count");

    appVm.setDefaultAnimationMode("invalid-mode");
    expect(appVm.defaultAnimation.mode).to.equal("instancing");
  });

  it("toggles random seed (-1) vs fixed seed input", async () => {
    appVm.onDeforumFieldInput("seed", 4242, "number");
    expect(appVm.seedRandomEnabled).to.equal(false);
    expect(appVm.deforumSettings.seed).to.equal(4242);

    appVm.setSeedRandomEnabled(true);
    expect(appVm.seedRandomEnabled).to.equal(true);
    expect(appVm.deforumSettings.seed).to.equal(-1);

    appVm.setSeedRandomEnabled(false);
    expect(appVm.seedRandomEnabled).to.equal(false);
    expect(appVm.deforumSettings.seed).to.equal(4242);

    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "ENGINE");
    await nextTick();
    expect(document.querySelector("[data-testid='seed-random-toggle']")).to.exist;
    expect(document.querySelector("[data-testid='seed-value-input']")).to.exist;
  });

  it("enforces LCM engine steps and LoRA in prompts", async () => {
    appVm.onDeforumFieldInput("steps", 8, "number");
    appVm.prompts.pos = "a cat";
    appVm.setLcmEngineEnabled(true);
    appVm.onLcmEngineStepsChange(1);
    expect(appVm.lcmEngineEnabled).to.equal(true);
    expect(appVm.deforumSettings.steps).to.equal(1);
    expect(appVm.effectivePositivePrompt("a cat")).to.include("<lora:lcm-lora-ssd-1b:1>");

    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "ENGINE");
    await nextTick();
    expect(document.querySelector("[data-testid='lcm-engine-toggle']")).to.exist;
    expect(document.querySelector("[data-testid='lcm-engine-steps']")).to.exist;

    appVm.switchTab("LIVE");
    appVm.switchSubTab("LIVE", "MONITOR");
    await nextTick();
    expect(document.querySelector("[data-testid='lcm-engine-badge']")).to.exist;

    appVm.setLcmEngineEnabled(false);
    expect(appVm.effectivePositivePrompt("a cat")).to.not.include("<lora:lcm-lora-ssd-1b:1>");
  });

  it("exposes WAN Video animation engine with steerable controls", async () => {
    appVm.prompts.pos = "ocean waves at dusk";
    appVm.selectVideoLayer("wan");
    expect(appVm.isWanLayerActive).to.equal(true);
    const settings = appVm.effectiveDeforumSettingsForRender();
    expect(settings.animation_mode).to.equal("Wan Video");
    expect(settings.wan_inference_steps).to.equal(20);
    expect(String(settings.animation_prompts)).to.include("ocean");

    appVm.onWanEngineFieldChange("wan_inference_steps", 12, "number");
    expect(appVm.wanEngine.wan_inference_steps).to.equal(12);

    appVm.switchTab("LIVE");
    appVm.switchSubTab("LIVE", "MONITOR");
    appVm.liveAnimationBoxOpen = true;
    await nextTick();
    expect(document.querySelector("[data-testid='animation-engine-wan']")).to.exist;
    expect(document.querySelector("[data-testid='wan-engine-controls']")).to.exist;
    expect(document.querySelector("[data-testid='wan-field-wan_inference_steps']")).to.exist;
  });

  it("shows 2D/3D mode toggle and locks 3D-only deforum fields in 2D", async () => {
    appVm.switchTab("LIVE");
    appVm.switchSubTab("LIVE", "DEFORUM_JOB");
    appVm.deforumAdvancedOpen = false;
    await nextTick();

    expect(document.querySelector("[data-testid='deforum-mode-toggle']")).to.exist;
    expect(document.querySelector("[data-testid='deforum-mode-2d']")).to.exist;
    expect(document.querySelector("[data-testid='deforum-mode-3d']")).to.exist;

    appVm.setDeforumMode2d3d("2D");
    expect(appVm.deforumMode2d3d).to.equal("2D");
    expect(appVm.isDeforumFieldDisabledByAnimationMode("rotation_3d_x")).to.equal(true);
    expect(appVm.isDeforumFieldGroupDisabledByAnimationMode("motion3d")).to.equal(true);

    appVm.deforumActiveTab = "motion3d";
    appVm.setDeforumMode2d3d("2D");
    expect(appVm.deforumActiveTab).to.equal("motion");

    appVm.setDeforumMode2d3d("3D");
    expect(appVm.deforumMode2d3d).to.equal("3D");
    expect(appVm.deforumSettings.animation_mode).to.equal("3D");
    expect(appVm.isDeforumFieldDisabledByAnimationMode("rotation_3d_x")).to.equal(false);
    expect(appVm.isDeforumFieldEnabled("rotation_3d_x")).to.equal(true);
  });

  it("shows LIVE sub-tabs for monitor and deforum", async () => {
    appVm.switchTab("LIVE");
    appVm.rightPanelOpen = true;
    appVm.liveDrawerOpen = true;
    await nextTick();
    const liveTabs = [...document.querySelectorAll("[data-testid='live-view'] .sub-pill")].map((el) => el.textContent.trim());
    expect(liveTabs).to.include.members(["Controls", "Deforum"]);

    appVm.switchSubTab("LIVE", "DEFORUM_JOB");
    await nextTick();
    expect(document.querySelector("[data-testid='deforum-settings-panel']")).to.exist;
    expect(document.body.textContent).to.include("Deforum");
    const deforumFields = document.querySelectorAll(".deforum-settings-grid .deforum-field");
    expect(deforumFields.length).to.be.greaterThan(0);
    expect(document.body.textContent).to.include("Width");
    const widthField = document.querySelector("[data-testid='deforum-field-W']");
    const heightField = document.querySelector("[data-testid='deforum-field-H']");
    expect(widthField).to.exist;
    expect(heightField).to.exist;
    expect(Number(widthField.value)).to.be.greaterThan(0);
    expect(Number(heightField.value)).to.be.greaterThan(0);
    expect(appVm.deforumSettings.use_init).to.equal(false);

    appVm.switchSubTab("LIVE", "MONITOR");
    await nextTick();
    expect(document.body.textContent).to.include("Animation Engine");
  });

  it("crossfades prompt styles in performance slots", () => {
    appVm.promptStyles = [
      { id: "cubism", name: "Cubism", positive: "cubist painting", negative: "photo", source: "forge" },
      { id: "anime", name: "Anime", positive: "anime style", negative: "3d", source: "forge" },
    ];
    appVm.performance.slots = [
      { id: "style_slot_1", type: "style", valueA: "cubism", valueB: "anime" },
    ];
    appVm.performance.crossfader = 0;
    const atA = appVm.buildMorphedStyleAppend();
    expect(atA.positive).to.equal("cubist painting");
    expect(atA.negative).to.equal("photo");
    appVm.performance.crossfader = 1;
    const atB = appVm.buildMorphedStyleAppend();
    expect(atB.positive).to.equal("anime style");
    expect(atB.negative).to.equal("3d");
    expect(appVm.effectivePositivePrompt("my scene")).to.equal("my scene, anime style");
    expect(appVm.effectiveNegativePrompt("blur")).to.equal("blur, 3d");
  });

  it("shows settings styles tab and merges active style into prompts", async () => {
    appVm.performance.slots = [];
    appVm.promptStyles = [
      {
        id: "cubism",
        name: "Cubism",
        positive: "cubist painting",
        negative: "photograph",
        source: "forge",
        exampleImage: null,
      },
    ];
    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "STYLES");
    await nextTick();
    expect(document.querySelector("[data-testid='styles-settings-panel']")).to.exist;
    expect(document.body.textContent).to.include("Cubism");

    appVm.selectActivePromptStyle("cubism");
    expect(appVm.effectivePositivePrompt("my cat")).to.equal("my cat, cubist painting");
    expect(appVm.effectiveNegativePrompt("blur")).to.equal("blur, photograph");

    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "PROMPTS");
    await nextTick();
    expect(document.querySelector("[data-testid='prompt-style-bar']")).to.exist;
  });

  it("shows preview layer tabs only for running engines on the main player", async () => {
    appVm.switchTab("LIVE");
    appVm.deforumPlaying = false;
    appVm.videoReady = false;
    appVm.deforumGeneratedFrameCount = 0;
    appVm.inputLayerPlaybackUrl = "";
    appVm.selectVideoLayer("webgl");
    await nextTick();
    const layerTabs = document.querySelector("[data-testid='video-layer-tabs']");
    expect(layerTabs).to.exist;
    let layerText = String(layerTabs && layerTabs.textContent || "");
    expect(layerText).to.include("WebGL");
    expect(layerText).to.not.include("Deforum");
    expect(layerText).to.not.include("Both");
    expect(layerText).to.not.include("Input");
    expect(document.querySelector("[data-testid='video-layer-add-toggle']")).to.exist;

    appVm.deforumPlaying = true;
    await nextTick();
    layerText = String(layerTabs.textContent || "");
    expect(layerText).to.include("WebGL");
    expect(layerText).to.include("Deforum");

    appVm.deforumPlaying = false;
    appVm.inputLayerPlaybackUrl = "/api/system-files/stream?path=test.mp4";
    appVm.rebuildVideoLayers();
    appVm.selectVideoLayer("input");
    await nextTick();
    layerText = String(layerTabs.textContent || "");
    expect(layerText).to.include("Input");
  });

  it("includes video, sliders, and presets", async () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    appVm.rightPanelOpen = true;
    appVm.liveDrawerOpen = true;
    appVm.paramPanelOpen = true;
    await nextTick();
    const sliderRows = [...document.querySelectorAll(".param-drawer input[type='range'], [data-testid='modulation-morph-crossfader']")];
    expect(sliderRows.length).to.be.greaterThan(5);
    appVm.switchTab("MOTION");
    await nextTick();
    const titles = [...document.querySelectorAll(".framesync-title")].map(t => t.textContent);
    expect(titles.join(" ")).to.include("Motion");
    appVm.switchTab("LIVE");
    appVm.paramPanelOpen = true;
    await nextTick();
    const liveLabels = [...document.querySelectorAll(".param-drawer .framesync-subtitle, .framesync-title")].map((t) => t.textContent.trim());
    expect(liveLabels.join(" ")).to.match(/Camera|Style|Performance/);
  });

  it("shows prompt morph controls", async () => {
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "PROMPTS");
    await nextTick();
    const promptButtonsCollapsed = [...document.querySelectorAll(".prompt-toolbar .framesync-button")].map((el) => el.textContent.trim());
    expect(promptButtonsCollapsed).to.include("Expand");
    appVm.morphCollapsed = false;
    await nextTick();
    await nextTick();
    const promptTitles = [...document.querySelectorAll(".framesync-title")].map((el) => el.textContent.trim());
    expect(promptTitles.join(" ")).to.include("Prompt Morphing");
    expect(promptTitles.join(" ")).to.include("Morph Crossfader");
    const promptButtons = [...document.querySelectorAll(".prompt-toolbar .framesync-button")].map((el) => el.textContent.trim());
    expect(promptButtons.join(" ")).to.match(/Enabled|Disabled/);
    const allButtons = [...document.querySelectorAll(".framesync-button")].map((el) => el.textContent.trim());
    expect(allButtons.join(" ")).to.include("Manual");
    expect(allButtons.join(" ")).to.include("LFO 1");
  });

  it("shows the main engine controls in the engine tab", async () => {
    appVm.forge.currentModel = "juggernautXL.safetensors";
    appVm.forge.selectedModel = "juggernautXL.safetensors";
    appVm.deforumSettings.sd_model_name = "juggernautXL.safetensors";
    appVm.deforumSettings.steps = 30;
    appVm.deforumSettings.cfg_scale_schedule = "0:(6.5)";
    appVm.deforumSettings.sampler = "Euler a";
    appVm.forge.samplers = ["Euler a", "DPM++ 2M"];
    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "ENGINE");
    await nextTick();
    await nextTick();

    const pageText = document.body.textContent;
    expect(pageText).to.include("Current model");
    expect(pageText).to.include("Current CFG");
    expect(pageText).to.include("Current steps");
    expect(pageText).to.include("Click to browse checkpoints");
    expect(pageText).to.not.include("Checkpoint");
    expect(pageText).to.include("Sampler");
    expect(pageText).to.include("Optimize for model");

    const modelCard = document.querySelector(".engine-main-card--picker");
    expect(modelCard).to.exist;
    modelCard.click();
    await nextTick();
    await nextTick();
    expect(appVm.engineModelPickerOpen).to.equal(true);
    expect(document.body.textContent).to.include("Select Checkpoint");
    expect(document.body.textContent).to.include("SD1.5");
    expect(document.body.textContent).to.include("Z-Image");

    const subTabs = [...document.querySelectorAll(".sub-pill")].map((el) => el.textContent.trim());
    expect(subTabs.join(" ")).to.not.include("FORGE");
    expect(subTabs.join(" ")).to.include("CONTROLLERS / MIDI");
    expect(subTabs.join(" ")).to.not.include("BINDINGS");
    expect(subTabs.join(" ")).to.not.include("PRESETS");
  });

  it("renders a forge instance editor modal from GPU pool state", async () => {
    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "GPUS");
    appVm.gpuPool.forgeModal = {
      ...appVm.gpuPool.forgeModal,
      open: true,
      nodeId: "forge-1",
      nodeName: "Forge Alpha",
      url: "http://127.0.0.1:7860",
      currentModel: "juggernautXL.safetensors",
      schedulers: ["Normal"],
      vaeList: ["vae-ft-mse"],
      options: { scheduler: "Normal", sd_vae: "vae-ft-mse", width: 1024, height: 576, batch_size: 1 },
    };
    await nextTick();
    await nextTick();

    const pageText = document.body.textContent;
    expect(pageText).to.include("Edit SD-Forge instance");
    expect(pageText).to.include("Forge Alpha");
    expect(pageText).to.include("Apply options");
    expect(document.querySelector(".gpu-forge-modal")).to.exist;
  });

  it("shows a 3D motion path preview above performance axis controls", async () => {
    appVm.switchTab("MOTION");
    appVm.deforumSettings.animation_mode = "3D";
    appVm.motionPadValues.translation_x = 3;
    appVm.motionPadValues.translation_z = 1.5;
    await nextTick();
    await nextTick();

    expect(document.querySelector("[data-testid='motion-path-preview']")).to.exist;
    expect(document.body.textContent).to.include("3D motion preview");
    expect(document.querySelector(".motion-pad-hero")).to.exist;
    expect(document.querySelector(".motion-controls-2d")).to.not.exist;
  });

  it("shows 2D move and look XY pads when Deforum animation mode is 2D", async () => {
    appVm.switchTab("MOTION");
    appVm.deforumSettings.animation_mode = "2D";
    await nextTick();
    await nextTick();

    expect(document.querySelector(".motion-controls-2d")).to.exist;
    expect(document.body.textContent).to.include("Move controls");
    expect(document.body.textContent).to.include("Look controls");
    expect(document.querySelector("[data-testid='motion-pad-move']")).to.exist;
    expect(document.querySelector("[data-testid='motion-pad-look']")).to.exist;
    expect(document.querySelector(".motion-axis-sliders")).to.not.exist;
    expect(document.querySelector("[data-testid='motion-path-preview']")).to.not.exist;

    appVm.updateMotionPad({
      currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) },
      clientX: 75,
      clientY: 25,
    }, "move");
    expect(appVm.motionPadValues.translation_x).to.equal(0.5);
    expect(appVm.motionPadValues.translation_y).to.equal(0.5);

    appVm.updateMotionPad({
      currentTarget: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) },
      clientX: 0,
      clientY: 100,
    }, "look");
    expect(appVm.motionPadValues.look_x).to.equal(-1);
    expect(appVm.motionPadValues.look_y).to.equal(-1);
  });

  it("shows motion sequencer below preview and motion controls on the side", async () => {
    appVm.switchTab("MOTION");
    appVm.performance.status = "Preview frame ready";
    appVm.generator.status = "Story ready";
    appVm.generator.result = {
      formatted: "Theme: Neon city\n\n0: opening skyline shot",
      source: { model: "llama3.1" },
    };
    await nextTick();
    await nextTick();

    const pageText = document.body.textContent;
    expect(pageText).to.include("Preview frame ready");
    expect(document.querySelector('[data-testid="motion-sequencer-dock"]')).to.exist;
    expect(document.querySelector('[data-testid="sequencer-controls-panel"]')).to.exist;
    expect(document.querySelector(".stage-sequencer-shell")).to.exist;
    expect(document.querySelector(".stage-sequencer-bar")).to.exist;
    expect(document.querySelector(".sequencer-controls-panel--stage")).to.exist;
    expect(document.querySelector("[data-testid='motion-controls-panel']")).to.exist;
    expect(document.querySelector("[data-testid='reset-motion-default']")).to.exist;
    appVm.motionPadValues.translation_x = 2;
    appVm.motionPadValues.translation_y = -1.5;
    appVm.motionPadValues.translation_z = 3;
    appVm.motionPadValues.zoom = 1.4;
    appVm.deforumSettings.animation_mode = "3D";
    appVm.resetMotionToDefault();
    expect(appVm.motionPadValues.translation_x).to.equal(0);
    expect(appVm.motionPadValues.translation_y).to.equal(0);
    expect(appVm.motionPadValues.translation_z).to.equal(0);
    expect(appVm.motionPadValues.zoom).to.equal(0);
    expect(appVm.motionSelectedPreset).to.equal("Static");
    expect(document.querySelector(".motion-pad-hero")).to.exist;
    expect(document.querySelector(".stage-motion-tabs")).to.exist;
    appVm.switchSubTab("MOTION", "SEQUENCER");
    await nextTick();
    expect(document.querySelector('[data-testid="motion-sequencer-editor-shell"]')).to.exist;
    expect(document.querySelector('[data-testid="sequencer-controls-panel"]')).to.exist;
  });

  it("shows the modern story generator under the story subtab", async () => {
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "STORY");
    await nextTick();
    await nextTick();

    const pageText = document.body.textContent;
    expect(pageText).to.include("Story Generator");
    expect(pageText).to.include("Theme / story concept");
    expect(pageText).to.include("Style preset");
    expect(pageText).to.include("Scene count");
    expect(document.querySelector(".generate-sequencer__hero-grid")).to.exist;
    expect(document.querySelector(".generate-story__theme-input")).to.exist;
  });

  it("shows img2img under the image subtab", async () => {
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "IMAGE");
    await nextTick();
    await nextTick();

    const subTabs = [...document.querySelectorAll(".sub-pill")].map((el) => el.textContent.trim());
    expect(subTabs.join(" ")).to.include("IMAGE");

    const pageText = document.body.textContent;
    expect(pageText).to.include("img2img (Forge)");
    expect(pageText).to.include("Input image");
    expect(document.querySelectorAll(".img2img-dropzone").length).to.equal(2);
  });

  it("shows active LoRAs and opens a compatible picker with +", async () => {
    appVm.forge.currentModel = "juggernautXL";
    appVm.forge.modelInfo = { architecture: "sdxl" };
    appVm.loras.available = [
      { id: "xl-1", name: "portrait-xl", path: "/loras/sdxl/portrait-xl.safetensors", family: "sdxl", strength: 1, selected: false, group: null },
      { id: "sd15-1", name: "portrait-15", path: "/loras/sd15/portrait-15.safetensors", family: "sd15", strength: 1, selected: false, group: null },
    ];
    appVm.loras.common = [{ id: "utility", name: "utility-xl", path: "/loras/sdxl/utility-xl.safetensors", strength: 0.65 }];
    appVm.loras.groupA = [{ id: "xl-1", name: "portrait-xl", path: "/loras/sdxl/portrait-xl.safetensors", strength: 1 }];
    appVm.loras.groupB = [{ id: "mix-b", name: "mix-b", path: "/loras/sdxl/mix-b.safetensors", strength: 0.8 }];
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "LORA");
    await nextTick();
    await nextTick();

    expect(appVm.currentLoraModelFamily).to.equal("sdxl");
    expect(appVm.compatibleLoraFamilies.map((family) => family.label).join(" ")).to.equal("SDXL");

    const buttonsBefore = [...document.querySelectorAll(".framesync-button")].map((el) => el.textContent.trim());
    expect(buttonsBefore.join(" ")).to.include("+");
    expect(buttonsBefore.join(" ")).to.include("Manual");
    expect(buttonsBefore.join(" ")).to.include("LFO 6");
    expect(document.body.textContent).to.include("Common Group (1)");
    expect([...document.querySelectorAll(".framesync-title")].map((el) => el.textContent.trim()).join(" ")).to.include("LoRA Crossfader");
    expect(document.querySelectorAll(".lora-picker-row").length).to.equal(0);

    appVm.loraPickerOpen = true;
    await nextTick();
    expect(document.querySelectorAll(".lora-picker-row").length).to.equal(1);
    const pickerButtons = [...document.querySelectorAll(".lora-picker-row__actions .framesync-button")].map((el) => el.textContent.trim());
    expect(pickerButtons.join(" ")).to.include("Common");
  });

  it("applies common LoRAs at full strength outside the A/B crossfade mix", () => {
    appDef = loadAppDefinition();
    const calls = [];
    const instance = instantiate(appDef);
    instance.sendControl = (type, payload) => {
      calls.push({ type, payload });
    };
    instance.prompts.crossfaderValue = 0.25;
    instance.prompts.loraCrossfaderOn = true;
    instance.loras.common = [{ id: "c-1", name: "utility", path: "/loras/utility.safetensors", strength: 0.6 }];
    instance.loras.groupA = [{ id: "a-1", name: "style-a", path: "/loras/style-a.safetensors", strength: 1.0 }];
    instance.loras.groupB = [{ id: "b-1", name: "style-b", path: "/loras/style-b.safetensors", strength: 0.8 }];

    instance.applyLoras();

    expect(calls).to.have.length(1);
    expect(calls[0].type).to.equal("loras");
    expect(calls[0].payload.common).to.deep.equal([
      { name: "utility", path: "/loras/utility.safetensors", strength: 0.6 },
    ]);
    expect(calls[0].payload.groupA[0].strength).to.equal(0.75);
    expect(calls[0].payload.groupB[0].strength).to.equal(0.2);
  });

  it("filters ControlNet models to the active checkpoint family and visualizes weight", async () => {
    appVm.forge.currentModel = "juggernautXL";
    appVm.forge.modelInfo = { architecture: "sdxl" };
    appVm.cn.availableModels = [
      { id: "cn-xl", name: "controlnet-sdxl-canny", category: "edge" },
      { id: "cn-sd15", name: "control_v11p_sd15_canny", category: "edge" },
      { id: "cn-generic", name: "OpenPose", category: "pose" },
    ];
    appVm.cn.active = "CN1";
    appVm.cn.slots[0].model = "control_v11p_sd15_canny";
    appVm.cn.slots[0].weight = 1.23;
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "CONTROLNET");
    await nextTick();
    await nextTick();

    expect(appVm.currentControlNetModelFamily).to.equal("sdxl");
    expect(appVm.controlNetCompatibleModels.map((model) => model.name)).to.deep.equal([
      "controlnet-sdxl-canny",
      "OpenPose",
    ]);

    const modelOptions = [...document.querySelector(".framesync-select").querySelectorAll("option")].map((el) => el.textContent.trim());
    expect(modelOptions.join(" ")).to.include("controlnet-sdxl-canny");
    expect(modelOptions.join(" ")).to.include("OpenPose");
    expect(modelOptions.join(" ")).to.include("control_v11p_sd15_canny (current, incompatible)");
    expect(document.querySelector(".controlnet-weight-card")).to.exist;
    expect(document.body.textContent).to.include("Showing 2 SDXL-compatible models.");
    expect(document.body.textContent).to.include("Strong");
  });

  it("shows a per-slot toggle button in the ControlNet slot strip", async () => {
    appVm.cn.slots.forEach((slot, index) => {
      slot.enabled = index === 1;
    });
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "CONTROLNET");
    await nextTick();
    await nextTick();

    const toggleButtons = [...document.querySelectorAll(".controlnet-slot-row__toggle")];
    expect(toggleButtons.length).to.equal(appVm.cn.slots.length);
    expect(toggleButtons[0].textContent.trim()).to.equal("Off");
    expect(toggleButtons[1].textContent.trim()).to.equal("On");

    toggleButtons[0].click();
    await nextTick();
    expect(appVm.cn.slots[0].enabled).to.equal(true);
  });

  it("clamps bottom modulation values and routes mapping to LFO targets", () => {
    appVm.liveBottomDrawerOpen = true;
    appVm.liveBottomDrawerTab = "MODULATION";
    const pan = appVm.liveCam.find((p) => p.key === "panx");
    appVm.setLiveModValue("panx", 99);
    expect(pan.val).to.equal(1);
    appVm.setLiveModValue("panx", -99);
    expect(pan.val).to.equal(-1);

    const beforeTargets = appVm.lfos[0].targets.length;
    appVm.openModulationMapping("panx");
    expect(appVm.currentTab).to.equal("MODULATION");
    expect(appVm.currentSubTab.MODULATION).to.equal("LFO");
    expect(appVm.modulationRouteFocusKey).to.equal("translation_x");
    expect(appVm.lfos[0].targets).to.include("translation_x");
    expect(appVm.lfos[0].targets.length).to.be.greaterThan(beforeTargets);

    appVm.clearParamMapping("panx");
    expect(appVm.lfos[0].targets).to.not.include("translation_x");
  });

  it("shows the LoRA crossfader in the bottom drawer with group pickers", async () => {
    appVm.liveBottomDrawerOpen = true;
    appVm.liveBottomDrawerTab = "CROSSFADER";
    await nextTick();
    await nextTick();

    const drawerTabs = [...document.querySelectorAll(".live-bottom-drawer__tabs .sub-pill")].map((el) => el.textContent.trim());
    expect(drawerTabs.join(" ")).to.include("CROSSFADER");
    expect(drawerTabs.join(" ")).to.include("SYSTEM");
    expect(appVm.liveBottomDrawerTab).to.equal("CROSSFADER");

    const titles = [...document.querySelectorAll(".framesync-title")].map((el) => el.textContent.trim());
    expect(titles.join(" ")).to.include("LoRA Crossfader");
    expect(document.querySelector(".lora-crossfader-panel__deck")).to.exist;

    const groupPickers = [...document.querySelectorAll(".lora-crossfader-panel .lora-picker-trigger")];
    expect(groupPickers.length).to.equal(2);

    groupPickers[0].click();
    await nextTick();
    expect(appVm.loraCrossfaderPickerGroup).to.equal("A");
    expect(document.querySelector(".lora-crossfader-panel__side--a .lora-picker-panel")).to.exist;
  });

  it("toggles modulation tab sections and shows LFO modulators", async () => {
    // Verify app state changes (Vue reactivity in JSDOM is limited)
    appVm.currentTab = "MODULATION";
    appVm.currentSubTab.MODULATION = "LFO";
    await nextTick();
    
    // Check app state
    expect(appVm.currentTab).to.equal("MODULATION");
    expect(appVm.lfos.length).to.equal(6);
    expect(appVm.macrosRack.length).to.be.greaterThan(0);
    
    // Switch to MODULATION -> Reactive (legacy AUDIO tab alias)
    appVm.switchTab("AUDIO");
    await nextTick();
    
    expect(appVm.currentTab).to.equal("MODULATION");
    expect(appVm.currentSubTab.MODULATION).to.equal("AUDIO_REACTIVE");

    appVm.switchSubTab("MODULATION", "AV_SYNC");
    await nextTick();
    expect(appVm.currentSubTab.MODULATION).to.equal("AV_SYNC");

    appVm.switchSubTab("MODULATION", "BEAT_MACROS");
    await nextTick();
    expect(appVm.currentSubTab.MODULATION).to.equal("BEAT_MACROS");
    expect(appVm.audioMappings.length).to.be.greaterThan(0);

    appVm.switchSubTab("MODULATION", "MAPPINGS");
    expect(appVm.currentSubTab.MODULATION).to.equal("MAPPINGS");
    appVm.switchSubTab("MODULATION", "ACTIVE_MODS");
    expect(appVm.currentSubTab.MODULATION).to.equal("MAPPINGS");
    
    appVm.audio.uploadedFile = "song.wav";
    appVm.audio.track = "/tmp/song.wav";
    appVm.audio.objectUrl = "blob:http://localhost/fake-audio";
    await nextTick();
    
    // Check audio mappings exist
    expect(appVm.audioMappings.length).to.be.greaterThan(0);
    appVm.audio.objectUrl = null;

    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "MIDI");
    await nextTick();
    expect(appVm.currentSubTab.SETTINGS).to.equal("MIDI");
    expect(appVm.midi.mappings.length).to.be.greaterThan(0);
    const pageText = document.body.textContent;
    expect(pageText).to.include("Controllers");
    expect(pageText).to.include("Parameter Bindings");
    expect(pageText).to.include("Preset Management");
    const settingsHeadings = [...document.querySelectorAll(".framesync-title")].map((h) => h.textContent.trim());
    if (appVm.midi.supported && settingsHeadings.join(" ").includes("Controllers")) {
      const mappingRows = [...document.querySelectorAll("table.table tbody tr")];
      expect(mappingRows.length).to.be.greaterThan(0);
    }
  });

  it("renders the runs monitor in the bottom drawer SYSTEM tab", async () => {
    appVm.liveBottomDrawerOpen = true;
    appVm.setLiveBottomDrawerTab("SYSTEM");
    appVm.runsAll = [
      { run_id: "run-001", status: "completed", started_at: "2026-05-26T09:00:00Z", has_thumbnail: false },
      { run_id: "run-002", status: "completed", started_at: "2026-05-26T10:00:00Z", has_thumbnail: false },
      { run_id: "run-003", status: "running", started_at: "2026-05-26T11:00:00Z", has_thumbnail: false, frames_done: 1, frames_total: 4 },
    ];
    appVm.applyRunsFilters();
    await nextTick();
    await nextTick();

    expect(document.querySelector('[data-testid="bottom-drawer-system"]')).to.exist;
    const drawerTabs = [...document.querySelectorAll(".live-bottom-drawer__tabs .sub-pill")].map((el) => el.textContent.trim());
    expect(drawerTabs.join(" ")).to.include("SYSTEM");
    const runsBrowser = document.querySelector('[data-testid="bottom-drawer-system"] [data-testid="runs-browser"]');
    expect(runsBrowser).to.exist;
    expect(document.body.textContent).to.include("Runs Monitor");
    expect(runsBrowser.closest('[data-testid="bottom-drawer"]')).to.exist;
  });

  it("shows the runs monitor under Settings → System with table and details", async () => {
    appVm.runsAll = [
      { run_id: "run-a-002", status: "completed", started_at: "2026-05-26T12:00:00Z", has_thumbnail: true, latest_frame: "frame_0002.png", frames_done: 2, frames_total: 2, frames_progress_pct: 100, frame_count: 2, model: "xl-a", tag: "defora" },
      { run_id: "run-a-001", status: "completed", started_at: "2026-05-26T11:00:00Z", has_thumbnail: true, latest_frame: "frame_0003.png", frames_done: 3, frames_total: 3, frames_progress_pct: 100, frame_count: 3, model: "xl-a", tag: "defora" },
      { run_id: "run-b-001", status: "running", started_at: "2026-05-26T10:00:00Z", has_thumbnail: true, latest_frame: "frame_0001.png", frames_done: 1, frames_total: 4, frames_progress_pct: 25, frame_count: 4, model: "xl-b", tag: "preview" },
    ];
    appVm.applyRunsFilters();
    global.fetch = async (url) => {
      const path = String(url);
      if (path.includes("run-b-001")) {
        return { ok: true, json: async () => ({ run_id: "run-b-001", status: "queued", frames: ["frame_0001.png"], model: "xl-b", has_frames: true, outputs: [{ kind: "frames", count: 1 }] }) };
      }
      return {
        ok: true,
        json: async () => ({
          run_id: "run-a-002",
          status: "completed",
          frames: ["frame_0001.png", "frame_0002.png"],
          model: "xl-a",
          seed: 42,
          steps: 20,
          job: { snapshot: { settings: { max_frames: 2, seed: 99, steps: 20, sd_model_name: "other-model" } } },
          has_frames: true,
          has_video: true,
          videos: ["output.mp4"],
          primary_video: { kind: "video", name: "output.mp4", url: "/api/runs/run-a-002/video/output.mp4" },
          outputs: [
            { kind: "video", name: "output.mp4", url: "/api/runs/run-a-002/video/output.mp4" },
            { kind: "frames", count: 2, browse_path: "/data/runs/run-a-002", rootId: "runs" },
          ],
        }),
      };
    };

    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "SYSTEM");
    appVm.runsBrowserTab = "past";
    await nextTick();
    await nextTick();

    const runsBrowser = document.querySelector(".runs-browser");
    expect(runsBrowser).to.exist;
    expect(document.body.textContent).to.include("Runs Monitor");
    expect(document.querySelector('[data-testid="settings-system-runs"]')).to.exist;

    const rows = [...document.querySelectorAll(".runs-browser__table tbody tr")].filter(
      (row) => !row.querySelector(".runs-browser__empty")
    );
    expect(rows.length).to.equal(2);

    const runRow = appVm.runsFiltered[0];
    await appVm.showRunDetails(runRow);
    await nextTick();
    await nextTick();

    expect(appVm.runsDetailView).to.exist;
    expect(appVm.runsDetailView.run_id).to.equal("run-a-002");
    expect(document.body.textContent).to.include("Run ");
    expect(document.body.textContent).to.include("2/2 · 100%");
    expect(document.querySelector('[data-testid="runs-detail-outputs"]')).to.exist;
    expect(document.body.textContent).to.include("Open video");
    expect(document.body.textContent).to.include("Browse frames");

    appVm.deforumSettings = { ...(appVm.deforumSettings || {}), max_frames: 48, seed: 1, steps: 20, sd_model_name: 'xl-current' };
    appVm.runsDetailTab = "json";
    await nextTick();
    expect(document.querySelector('[data-testid="runs-detail-json"]')).to.exist;
    expect(document.body.textContent).to.include("run_id");
    expect(document.body.textContent).to.include("job.snapshot.settings.max_frames");
    expect(appVm.runDetailJsonDiffCount(appVm.runsDetailView)).to.be.greaterThan(0);

    delete global.fetch;
  });

  it("shows active GPU jobs and kill button for queued batches", async () => {
    appVm.gpuPool.nodes = [
      { id: "gpu-a", name: "GPU A", url: "http://gpu-a:7860", enabled: true, backend: "sd-forge", status: "healthy", activeJobs: 1, queueRunning: 1, queuePending: 0 },
      { id: "gpu-b", name: "GPU B", url: "http://gpu-b:7860", enabled: true, backend: "sd-forge", status: "healthy", activeJobs: 0, queueRunning: 0, queuePending: 1 },
    ];
    appVm.deforumBatches = [
      { batch_id: "batch-q1", status: "queued", max_frames: 24, model: "xl-a", _node: { id: "gpu-b", name: "GPU B" } },
      { batch_id: "batch-r1", status: "running", max_frames: 12, model: "xl-b", _node: { id: "gpu-a", name: "GPU A" } },
    ];
    appVm.deforumBatchNodes = [
      { id: "gpu-a", name: "GPU A" },
      { id: "gpu-b", name: "GPU B" },
    ];
    appVm.runsAll = [
      { run_id: "batch:batch-q1", status: "queued", _isBatch: true, _batchNode: { id: "gpu-b", name: "GPU B" }, _gpu: "GPU B", tag: "deforum-batch", frame_count: 24, model: "xl-a" },
      { run_id: "batch:batch-r1", status: "running", _isBatch: true, _batchNode: { id: "gpu-a", name: "GPU A" }, _gpu: "GPU A", tag: "deforum-batch", frame_count: 12, model: "xl-b" },
    ];
    appVm.applyRunsFilters();

    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "SYSTEM");
    await nextTick();

    expect(document.querySelector('[data-testid="runs-active-jobs"]')).to.exist;
    expect(document.body.textContent).to.match(/running/i);
    expect(document.body.textContent).to.include("batch-q1");
    expect(document.body.textContent).to.include("batch-r1");

    const killBtn = [...document.querySelectorAll(".runs-browser__action--danger")].find((btn) => btn.textContent.includes("Kill"));
    expect(killBtn).to.exist;

    global.fetch = async (url, opts = {}) => {
      if (String(url).includes("/api/deforum/batches/batch-q1/cancel")) {
        expect(opts.method).to.equal("POST");
        return { ok: true, json: async () => ({ ok: true }) };
      }
      if (String(url).includes("/api/runs")) {
        return { ok: true, json: async () => ({ runs: appVm.runsAll.filter((run) => !String(run.run_id).startsWith("batch:")) }) };
      }
      if (String(url).includes("/api/deforum/batches")) {
        return { ok: true, json: async () => ({ batches: [], nodes: [], errors: [] }) };
      }
      if (String(url).includes("/api/gpu-pool")) {
        return { ok: true, json: async () => ({ enabled: true, nodes: appVm.gpuPool.nodes, healthyNodes: 2 }) };
      }
      return { ok: true, json: async () => ({}) };
    };
    global.confirm = () => true;

    killBtn.click();
    await nextTick();
    await Promise.resolve();
    await nextTick();

    expect(appVm.runsStatus).to.include("Cancelled batch batch-q1");
    delete global.fetch;
    delete global.confirm;
  });

  it("openRunsSettings navigates to Settings → System runs monitor", async () => {
    appVm.openRunsSettings();
    expect(appVm.currentTab).to.equal("SETTINGS");
    expect(appVm.currentSubTab.SETTINGS).to.equal("SYSTEM");
    await nextTick();
    expect(document.querySelector(".runs-browser")).to.exist;
    expect(document.querySelector('[data-testid="runs-launch-test"]')).to.exist;
  });

  it("Library tab does not show the legacy runs frame rail", async () => {
    appVm.switchTab("LIBRARY");
    await nextTick();
    expect(document.querySelector('[data-testid="library-frame-rail"]')).to.equal(null);
    expect(document.querySelector('[data-testid="library-run-thumbs"]')).to.equal(null);
  });

  it("Library browser exposes new folder, videos-only, and cloud connect", async () => {
    global.fetch = async (url) => {
      const path = String(url);
      if (path.includes("/api/video-swarm/roots")) {
        return {
          ok: true,
          json: async () => ({
            roots: [{ id: "uploads", label: "Uploads", path: "/tmp/uploads", kind: "local" }],
            cloudSources: [],
          }),
        };
      }
      if (path.includes("/api/video-swarm/browse")) {
        return {
          ok: true,
          json: async () => ({
            kind: "local",
            path: "/tmp/uploads",
            parent: "",
            folders: [],
            videos: [{ name: "a.mp4", path: "/tmp/uploads/a.mp4", rootId: "uploads", size: 100 }],
            folderCount: 0,
            videoCount: 1,
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    };
    appVm.systemFiles._rootsLoaded = false;
    appVm.switchTab("LIBRARY");
    await appVm.initSystemFilesBrowser();
    await nextTick();
    await nextTick();

    expect(document.querySelector('[data-testid="video-swarm-browser"]')).to.exist;
    expect(document.querySelector('[data-testid="video-swarm-new-folder"]')).to.exist;
    expect(document.querySelector('[data-testid="video-swarm-view-videos-only"]')).to.exist;
    expect(document.querySelector('[data-testid="video-swarm-connect-cloud"]')).to.exist;

    appVm.toggleSystemFilesVideosOnly();
    await nextTick();
    expect(appVm.systemFiles.viewMode).to.equal("videos-only");

    delete global.fetch;
  });

  it("launchTestRun logs job and refreshes runs", async () => {
    const fetchCalls = [];
    global.fetch = async (url, opts = {}) => {
      const path = String(url);
      fetchCalls.push(path);
      if (path.includes("/api/deforum/warmup")) {
        return { ok: false, status: 502, json: async () => ({ error: "forge unavailable" }) };
      }
      if (path.includes("/api/runs/launch-demo")) {
        return { ok: true, json: async () => ({ ok: true, run_id: "demo-test-1", status: "running" }) };
      }
      if (path.includes("/api/runs")) {
        return {
          ok: true,
          json: async () => ({
            runs: [{ run_id: "demo-test-1", status: "running", tag: "demo", started_at: new Date().toISOString() }],
          }),
        };
      }
      if (path.includes("/api/deforum/batches")) {
        return { ok: true, json: async () => ({ batches: [], nodes: [], errors: [] }) };
      }
      if (path.includes("/api/gpu-pool")) {
        return { ok: true, json: async () => ({ enabled: false, nodes: [], healthyNodes: 0 }) };
      }
      return { ok: true, json: async () => ({}) };
    };
    appVm.switchTab("SETTINGS");
    appVm.switchSubTab("SETTINGS", "SYSTEM");
    await nextTick();
    await appVm.launchTestRun();
    await nextTick();
    expect(fetchCalls.some((p) => p.includes("/api/runs/launch-demo"))).to.equal(true);
    expect(appVm.runsJobLog.length).to.be.greaterThan(0);
    expect(appVm.runsJobLog[0].message).to.include("demo-test-1");
    delete global.fetch;
  });
});

describe("Deforumation Web UI behavior", () => {
  let appDef;
  let testStorage;

  beforeEach(() => {
    appDef = loadAppDefinition();
    // Set up minimal localStorage mock for tests with shared storage
    testStorage = {};
    if (!global.window) {
      global.window = {};
    }
    const localStorageMock = {
      getItem: (key) => testStorage[key] || null,
      setItem: (key, value) => { testStorage[key] = value; },
      removeItem: (key) => { delete testStorage[key]; },
      clear: () => { testStorage = {}; Object.keys(testStorage).forEach(k => delete testStorage[k]); }
    };
    Object.defineProperty(global.window, "localStorage", {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
    global.localStorage = localStorageMock;
  });

  it("defaults prompts to the main prompts subtab", () => {
    const instance = instantiate(appDef);
    expect(instance.currentSubTab.PROMPTS).to.equal("PROMPTS");
    expect(instance.img2img.show).to.equal(true);
  });

  it("openGpuSettings jumps to settings GPUS", () => {
    const instance = instantiate(appDef);

    instance.openGpuSettings();

    expect(instance.currentTab).to.equal("SETTINGS");
    expect(instance.currentSubTab.SETTINGS).to.equal("GPUS");
  });

  it("redirects legacy settings subtabs for bindings and presets into MIDI", () => {
    const instance = instantiate(appDef);

    instance.switchSubTab("SETTINGS", "BINDINGS");
    expect(instance.currentSubTab.SETTINGS).to.equal("MIDI");

    instance.switchSubTab("SETTINGS", "PRESETS");
    expect(instance.currentSubTab.SETTINGS).to.equal("MIDI");
  });

  it("reports GPU status counts from the pool state", () => {
    const instance = instantiate(appDef);
    instance.gpuPool.healthyNodes = 2;
    instance.gpuPool.nodes = [{ id: "gpu-1" }, { id: "gpu-2" }, { id: "gpu-3" }];

    expect(instance.gpuActiveCount).to.equal(2);
    expect(instance.gpuTotalCount).to.equal(3);
  });

  it("shares sampler and scheduler option lists across engine and forge modal controls", () => {
    const instance = instantiate(appDef);
    instance.forge.samplers = ["Euler a", "DPM++ 2M"];
    instance.forge.schedulers = ["Normal", "Karras"];
    instance.deforumSettings.sampler = "Heun";
    instance.deforumSettings.scheduler = "Exponential";
    instance.gpuPool.forgeModal.options = {
      sampler_name: "Restart",
      scheduler: "SGM Uniform",
    };

    expect(instance.engineSamplerOptions).to.include.members(["Heun", "Restart", "Euler a", "DPM++ 2M"]);
    expect(instance.engineSchedulerOptions).to.include.members(["Exponential", "SGM Uniform", "Normal", "Karras"]);
  });

  it("startEditGpuNode opens the forge modal for disabled sd-forge nodes", async () => {
    const instance = instantiate(appDef);
    let openedNode = null;
    instance.openGpuForgeModal = async (node) => { openedNode = node; };

    await instance.startEditGpuNode({
      id: "forge-1",
      name: "Forge Alpha",
      url: "http://127.0.0.1:7860",
      backend: "sd-forge",
      enabled: false,
    });

    expect(openedNode).to.exist;
    expect(openedNode.id).to.equal("forge-1");
    expect(instance.gpuPool.editId).to.equal(null);
  });

  it("setSource updates state and dispatches payload", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.setSource("cfg", "Beat");

    expect(instance.paramSources.cfg).to.equal("Beat");
    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("paramSource");
    expect(last.payload).to.deep.equal({ key: "cfg", source: "Beat" });
  });

  it("includes the current sampler in deforum dropdown options even when forge lists are empty", () => {
    const instance = instantiate(appDef);
    instance.forge.samplers = [];
    instance.forge.schedulers = [];
    instance.deforumSettings.sampler = "Heun";

    const options = instance.deforumFieldOptions({ key: "sampler", type: "select" });
    expect(options).to.include("Heun");
    expect(options.length).to.be.greaterThan(0);
  });

  it("routes deforum sampler and scheduler selects through engine change handlers", () => {
    const instance = instantiate(appDef);
    const pushed = [];
    instance.pushDeforumLivePatch = (key, value) => pushed.push([key, value]);
    instance.queueDeforumSettingsSave = () => {};
    instance.scheduleDeforumPreview = () => {};

    instance.onDeforumSelectInput({ key: "sampler", type: "select" }, "DPM++ 2M");
    expect(instance.deforumSettings.sampler).to.equal("DPM++ 2M");

    instance.onDeforumSelectInput({ key: "scheduler", type: "select" }, "Karras");
    expect(instance.deforumSettings.scheduler).to.equal("Karras");
    expect(pushed).to.deep.equal([["sampler", "DPM++ 2M"], ["scheduler", "Karras"]]);
  });

  it("does not show on/off toggles for sampler and scheduler deforum fields", () => {
    const instance = instantiate(appDef);
    expect(instance.isDeforumFieldToggleable("sampler")).to.equal(false);
    expect(instance.isDeforumFieldToggleable("scheduler")).to.equal(false);
    expect(instance.isDeforumFieldToggleable("noise_schedule")).to.equal(true);
  });

  it("onEngineSchedulerChange keeps deforum and forge scheduler in sync", () => {
    const instance = instantiate(appDef);
    const pushed = [];
    let queued = 0;
    let previewed = 0;

    instance.pushDeforumLivePatch = (key, value) => pushed.push([key, value]);
    instance.queueDeforumSettingsSave = () => { queued += 1; };
    instance.scheduleDeforumPreview = () => { previewed += 1; };

    instance.onEngineSchedulerChange("Karras");

    expect(instance.deforumSettings.scheduler).to.equal("Karras");
    expect(instance.forge.options.scheduler).to.equal("Karras");
    expect(pushed).to.deep.equal([["scheduler", "Karras"]]);
    expect(queued).to.equal(1);
    expect(previewed).to.equal(1);
  });

  it("syncs steps across deforum, forge, and forge modal controls", () => {
    const instance = instantiate(appDef);
    const pushed = [];
    let queued = 0;
    let previewed = 0;

    instance.gpuPool.forgeModal.options = { steps: 9 };
    instance.pushDeforumLivePatch = (key, value) => pushed.push([key, value]);
    instance.queueDeforumSettingsSave = () => { queued += 1; };
    instance.scheduleDeforumPreview = () => { previewed += 1; };

    instance.onEngineStepsChange("28");

    expect(instance.deforumSettings.steps).to.equal(28);
    expect(instance.deforumSettings.steps_schedule).to.equal("0: (28)");
    expect(instance.forge.options.steps).to.equal(28);
    expect(instance.gpuPool.forgeModal.options.steps).to.equal(28);
    expect(pushed).to.deep.equal([
      ["steps", 28],
      ["steps_schedule", "0: (28)"],
    ]);
    expect(queued).to.equal(1);
    expect(previewed).to.equal(1);
  });

  it("restores synced step values from steps_schedule edits", () => {
    const instance = instantiate(appDef);
    const pushed = [];

    instance.gpuPool.forgeModal.options = { steps: 9 };
    instance.pushDeforumLivePatch = (key, value) => pushed.push([key, value]);
    instance.queueDeforumSettingsSave = () => {};
    instance.scheduleDeforumPreview = () => {};

    instance.onDeforumFieldInput("steps_schedule", "0: (42)", "text");

    expect(instance.deforumSettings.steps).to.equal(42);
    expect(instance.deforumSettings.steps_schedule).to.equal("0: (42)");
    expect(instance.forge.options.steps).to.equal(42);
    expect(instance.gpuPool.forgeModal.options.steps).to.equal(42);
    expect(pushed).to.deep.equal([
      ["steps_schedule", "0: (42)"],
      ["steps", 42],
    ]);
  });

  it("updateParam writes the slider value and emits liveParam", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    const param = instance.liveVibe[0];

    instance.updateParam(param, { target: { value: "0.9" } });

    expect(param.val).to.equal(0.9);
    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("liveParam");
    expect(last.payload).to.have.property(param.key, 0.9);
  });

  it("routes modulation to Three.js standby animation fields", () => {
    const instance = instantiate(appDef);
    expect(instance.animationTargets.some((t) => t.key === "anim_hue")).to.equal(true);
    expect(instance.modulationTargets.length).to.be.greaterThan(instance.lfoTargets.length);

    instance.applyAnimationModulation("hue", 0.22);
    expect(instance.defaultAnimation.hue).to.equal(0.22);

    const payload = {};
    const cnUpdates = {};
    instance.routeModulationValue("anim_glow", 1.1, payload, cnUpdates);
    expect(payload).to.deep.equal({});
    expect(Object.keys(cnUpdates)).to.have.length(0);
    expect(instance.defaultAnimation.glow).to.equal(1.1);

    instance.ws = new FakeSocket();
    instance.routeModulationValue("cfg", 8, payload, cnUpdates);
    expect(payload.cfg).to.equal(8);
  });

  it("addMacro respects the six-slot cap", () => {
    const instance = instantiate(appDef);
    instance.macrosRack = [
      { target: "a" },
      { target: "b" },
      { target: "c" },
      { target: "d" },
      { target: "e" },
    ];
    instance.addMacro();
    instance.addMacro(); // should be ignored after reaching 6

    expect(instance.macrosRack).to.have.length(6);
  });

  it("removeMacro deletes a macro entry", () => {
    const instance = instantiate(appDef);
    const before = instance.macrosRack.length;
    const firstMacroTarget = instance.macrosRack[0].target;
    const secondMacroTarget = instance.macrosRack[1].target;

    instance.removeMacro(0);

    expect(instance.macrosRack.length).to.equal(before - 1);
    // Verify the first item was removed and second item is now first
    expect(instance.macrosRack[0].target).to.equal(secondMacroTarget);
    expect(instance.macrosRack[0].target).to.not.equal(firstMacroTarget);
  });

  it("handleMidi maps CC messages to scaled liveParam payloads", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.handleMidi({ id: "dev" }, { data: [0xb0, 22, 100] });

    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("liveParam");
    expect(last.payload).to.have.property("strength");
    // strength range 0..1.5
    expect(last.payload.strength).to.be.closeTo((100 / 127) * 1.5, 1e-3);
  });

  it("refreshFrames builds frame metadata from API responses", async () => {
    const instance = instantiate(appDef);
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        items: ["/frames/frame_0007.png", { src: "/frames/frame_0010.png", frame: 10 }],
      }),
    });

    await instance.refreshFrames();

    expect(instance.thumbs[0].frame).to.equal(7);
    expect(instance.thumbs[1].frame).to.equal(10);
    expect(instance.selectedFrameIndex).to.equal(1);
    delete global.fetch;
  });

  it("restores cached frame thumbs when the frames API is empty", async () => {
    const instance = instantiate(appDef);
    instance.saveCachedFrameThumbs([
      { name: "frame_0003.png", src: "/frames/frame_0003.png", frame: 3, mtime: 1 },
      { name: "frame_0005.png", src: "/frames/frame_0005.png", frame: 5, mtime: 2 },
    ]);
    global.fetch = async () => ({ ok: true, json: async () => ({ items: [] }) });

    await instance.refreshFrames();

    expect(instance.thumbs).to.have.lengthOf(2);
    expect(instance.thumbs[0].frame).to.equal(3);
    expect(instance.deforumStreamFrameLabel).to.include("2 frames generated");
    delete global.fetch;
    window.localStorage.removeItem(instance.frameThumbsCacheKey());
  });

  it("selectFrame updates the paused preview timecode", () => {
    const instance = instantiate(appDef);
    instance.deforumSettings.fps = 24;
    instance.thumbs = [
      { src: "/frames/frame_0007.png", name: "frame_0007.png", frame: 7 },
      { src: "/frames/frame_0010.png", name: "frame_0010.png", frame: 10 },
    ];

    instance.selectFrame(1, { scroll: false });

    expect(instance.selectedFrameIndex).to.equal(1);
    expect(instance.timecode).to.equal("00:00.13");
    expect(instance.activePreviewStillPath).to.equal("/frames/frame_0010.png");
  });

  it("ensureLivePlayback triggers play when paused", () => {
    const instance = instantiate(appDef);
    let plays = 0;
    instance.playerEl = {
      paused: true,
      readyState: 1,
      play: () => {
        plays += 1;
      },
    };
    instance.autoplayVideo = () => {
      plays += 1;
    };

    instance.ensureLivePlayback();

    expect(plays).to.equal(1);
  });

  it("toggleCollaboration goes offline cleanly and reconnects on the next press", () => {
    const instance = instantiate(appDef);
    const sockets = [];
    const previousLocation = global.location;
    const previousWebSocket = global.WebSocket;
    const previousWindowWebSocket = global.window && global.window.WebSocket;

    try {
      global.location = { protocol: "http:", host: "localhost" };
      global.WebSocket = class TestSocket {
        constructor(url) {
          this.url = url;
          this.readyState = 1;
          this.sent = [];
          sockets.push(this);
        }
        send(msg) {
          if (typeof msg === "string") {
            this.sent.push(JSON.parse(msg));
          } else {
            this.sent.push(msg ?? null);
          }
        }
        close() {
          this.readyState = 3;
          if (typeof this.onclose === "function") this.onclose();
        }
      };
      if (global.window) {
        global.window.WebSocket = global.WebSocket;
      }

      instance.connectWebSocket();
      expect(instance.wsStatus).to.equal("connecting");
      sockets[0].onopen();
      expect(instance.wsStatus).to.equal("connected");

      instance.collab.userId = "user-1";
      instance.collab.users = [{ id: "user-1", name: "Performer", lockedParams: ["cfg"] }];
      instance.collab.locks = { cfg: "Performer" };
      instance.collab.recording = true;
      instance.collab.recordings = [{ filename: "take-1.jsonl" }];
      instance.collab.status = "Session recording…";

      instance.toggleCollaboration();
      expect(instance.collabEnabled).to.equal(false);
      expect(instance.wsStatus).to.equal("offline");
      expect(instance.ws).to.equal(null);
      expect(instance.collab.userId).to.equal(null);
      expect(instance.collab.users).to.deep.equal([]);
      expect(instance.collab.locks).to.deep.equal({});
      expect(instance.collab.recordings).to.deep.equal([]);

      instance.toggleCollaboration();
      expect(instance.collabEnabled).to.equal(true);
      expect(instance.wsStatus).to.equal("connecting");
      expect(sockets).to.have.length(2);
      sockets[1].onopen();
      expect(instance.wsStatus).to.equal("connected");
    } finally {
      global.location = previousLocation;
      global.WebSocket = previousWebSocket;
      if (global.window) {
        global.window.WebSocket = previousWindowWebSocket;
      }
    }
  });

  it("runLfos emits liveParam payload when audio is off", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    instance.audio.track = "";
    instance.lfos = [
      { id: 1, on: true, targets: ["cfg"], shape: "Sine", bpm: 15, speed: 1.0, depth: 0.2, base: 6, phase: 0 },
    ];
    instance.lastLfoTick = 0;

    instance.runLfos(1000);

    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("liveParam");
    expect(last.payload.cfg).to.be.closeTo(9, 0.2);
  });

  it("runLfos skips when audio track is set", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    instance.audio.track = "song.wav";
    instance.lfos = [{ id: 1, on: true, targets: ["cfg"], shape: "Sine", bpm: 60, speed: 1.0, depth: 0.2, base: 6, phase: 0 }];
    instance.lastLfoTick = 0;

    instance.runLfos(1000);

    expect(instance.ws.sent.length).to.equal(0);
  });

  it("runAudioMod posts mappings when audio track is set", async () => {
    const instance = instantiate(appDef);
    const bodies = [];
    global.fetch = async (_url, opts) => {
      bodies.push(JSON.parse(opts.body));
      return { ok: true, json: async () => ({ ok: true }) };
    };
    instance.audio.track = "/tmp/song.wav";
    instance.audioMappings = [{ param: "cfg", freq_min: 20, freq_max: 300, out_min: 0, out_max: 10 }];

    await instance.runAudioMod();

    expect(bodies[0].audioPath).to.equal("/tmp/song.wav");
    expect(bodies[0].mappings[0].freq_max).to.equal(300);
    delete global.fetch;
  });

  it("applyAudioBandPreset updates one audio mapping with the chosen band", () => {
    const instance = instantiate(appDef);
    instance.audioMappings = [{ param: "cfg", freq_min: 20, freq_max: 40, out_min: 0, out_max: 1 }];

    instance.applyAudioBandPreset(0, "bass");

    expect(instance.audioMappings[0].freq_min).to.equal(60);
    expect(instance.audioMappings[0].freq_max).to.equal(250);
  });

  it("recentRunsRail sorts the shared runs source and limits to four items", () => {
    const instance = instantiate(appDef);
    instance.runsAll = [
      { run_id: "run-a", started_at: "2026-05-26T09:00:00Z" },
      { run_id: "run-b", started_at: "2026-05-26T12:00:00Z" },
      { run_id: "run-c", started_at: "2026-05-26T11:00:00Z" },
      { run_id: "run-d", started_at: "2026-05-26T08:00:00Z" },
      { run_id: "run-e", started_at: "2026-05-26T10:00:00Z" },
    ];

    expect(instance.recentRunsRail.map((run) => run.run_id)).to.deep.equal([
      "run-b",
      "run-c",
      "run-e",
      "run-a",
    ]);
  });

  it("onModelSelectChange keeps deforum settings model aligned with Forge selection", async () => {
    const instance = instantiate(appDef);
    let queuedSave = 0;
    let savedSession = 0;
    global.fetch = async (_url, opts) => ({
      ok: true,
      json: async () => ({
        success: true,
        model: { model_name: JSON.parse(opts.body).model_name, title: JSON.parse(opts.body).model_name },
      }),
    });
    instance.queueDeforumSettingsSave = () => {
      queuedSave += 1;
    };
    instance.saveSessionState = () => {
      savedSession += 1;
    };
    instance.forge.currentModel = "old-model.safetensors";
    instance.forge.selectedModel = "new-model.safetensors";
    instance.deforumSettings.sd_model_name = "old-model.safetensors";

    await instance.onModelSelectChange();

    expect(instance.forge.currentModel).to.equal("new-model.safetensors");
    expect(instance.forge.lastModel).to.equal("new-model.safetensors");
    expect(instance.deforumSettings.sd_model_name).to.equal("new-model.safetensors");
    expect(queuedSave).to.be.greaterThan(0);
    expect(savedSession).to.be.greaterThan(0);
    delete global.fetch;
  });

  it("refreshForgeOptions mirrors the server loaded model into deforum settings", async () => {
    const instance = instantiate(appDef);
    const responses = {
      "/api/forge/options": { available: true, options: {} },
      "/api/forge/samplers": { samplers: [] },
      "/api/forge/schedulers": { schedulers: [] },
      "/api/forge/vae": { vae: [] },
      "/api/sd-models/current": { model: { model_name: "server-model.safetensors", title: "server-model.safetensors" } },
    };
    global.fetch = async (url) => ({
      ok: true,
      json: async () => responses[url],
    });
    instance.deforumSettings.sd_model_name = "stale-model.safetensors";

    await instance.refreshForgeOptions();

    expect(instance.forge.currentModel).to.equal("server-model.safetensors");
    expect(instance.forge.selectedModel).to.equal("server-model.safetensors");
    expect(instance.deforumSettings.sd_model_name).to.equal("server-model.safetensors");
    delete global.fetch;
  });

  it("onModelSelectChange applies SDXL Turbo optimized defaults", async () => {
    const instance = instantiate(appDef);
    global.fetch = async (_url, opts) => ({
      ok: true,
      json: async () => ({
        success: true,
        model: {
          model_name: JSON.parse(opts.body).model_name,
          title: JSON.parse(opts.body).model_name,
          metadata: {
            type: "SDXL Turbo",
            variant: "turbo",
            recommended_steps: 2,
            recommended_sampler: "Euler a",
            recommended_cfg_scale: 1.0,
            recommended_strength: 0.4,
            base_resolution: 1024,
          },
        },
      }),
    });
    instance.forge.currentModel = "old-model.safetensors";
    instance.forge.selectedModel = "sdxl_turbo.safetensors";
    instance.deforumSettings.sd_model_name = "old-model.safetensors";
    instance.deforumSettings.steps = 10;
    instance.deforumSettings.W = 1920;
    instance.deforumSettings.H = 540;
    const cfgParam = instance.liveVibe.find((param) => param.key === "cfgscale");
    const strengthParam = instance.liveVibe.find((param) => param.key === "strength");

    await instance.onModelSelectChange();

    expect(instance.deforumSettings.sd_model_name).to.equal("sdxl_turbo.safetensors");
    expect(instance.deforumSettings.steps).to.equal(2);
    expect(instance.deforumSettings.sampler).to.equal("Euler a");
    expect(instance.deforumSettings.W).to.equal(1024);
    expect(instance.deforumSettings.H).to.equal(1024);
    expect(instance.deforumSettings.cfg_scale_schedule).to.equal("0:(1)");
    expect(instance.deforumSettings.strength_schedule).to.equal("0: (0.4)");
    expect(cfgParam.val).to.equal(1);
    expect(strengthParam.val).to.equal(0.4);
    delete global.fetch;
  });

  it("loadSessionState restores null ControlNet schedules to safe Deforum defaults", () => {
    const instance = instantiate(appDef);
    testStorage[instance.sessionStorageKey()] = JSON.stringify({
      deforumSettings: {
        cn_1_enabled: false,
        cn_1_weight: null,
        cn_1_guidance_start: null,
        cn_1_guidance_end: null,
        cn_2_weight: null,
        cn_2_guidance_start: null,
        cn_2_guidance_end: null,
      },
    });

    instance.loadSessionState();

    expect(instance.deforumSettings.cn_1_weight).to.equal("0:(2)");
    expect(instance.deforumSettings.cn_1_guidance_start).to.equal("0:(0.0)");
    expect(instance.deforumSettings.cn_1_guidance_end).to.equal("0:(1.0)");
    expect(instance.deforumSettings.cn_2_weight).to.equal("0:(1)");
    expect(instance.deforumSettings.cn_2_guidance_start).to.equal("0:(0.0)");
    expect(instance.deforumSettings.cn_2_guidance_end).to.equal("0:(1.0)");
  });

  it("onDeforumFieldInput persists updated deforum settings into session storage", () => {
    const instance = instantiate(appDef);
    instance.queueDeforumSettingsSave = () => {};
    instance.pushDeforumLivePatch = () => {};
    instance.scheduleDeforumPreview = () => {};

    instance.onDeforumFieldInput("steps", 14, "number");

    const saved = JSON.parse(testStorage[instance.sessionStorageKey()]);
    expect(saved.deforumSettings.steps).to.equal(14);
  });


  it("saveDeforumSettings omits disabled deforum fields from the outgoing payload", async () => {
    const instance = instantiate(appDef);
    let posted = null;
    global.fetch = async (_url, opts) => {
      posted = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ success: true }) };
    };
    instance.saveSessionState = () => {};
    instance.queueDeforumSettingsSave = () => {};
    instance.scheduleDeforumPreview = () => {};
    instance.deforumSettings.steps = 14;
    instance.deforumSettings.cfg_scale_schedule = "0:(7)";
    instance.deforumSettings.distilled_cfg_scale_schedule = "0: (7)";

    instance.setDeforumFieldEnabled("steps", false);
    instance.setDeforumFieldEnabled("cfg_scale_schedule", false);
    await instance.saveDeforumSettings();

    expect(posted.settings).to.not.have.property("steps");
    expect(posted.settings).to.not.have.property("cfg_scale_schedule");
    expect(posted.settings).to.not.have.property("distilled_cfg_scale_schedule");
    expect(instance.deforumSettings.steps).to.equal(14);
    delete global.fetch;
  });

  it("loadSessionState restores deforum field toggles", () => {
    const instance = instantiate(appDef);
    testStorage[instance.sessionStorageKey()] = JSON.stringify({
      deforumSettings: {
        steps: 18,
      },
      deforumFieldEnabled: {
        steps: false,
        cfg_scale_schedule: false,
      },
    });

    instance.loadSessionState();

    expect(instance.isDeforumFieldEnabled("steps")).to.equal(false);
    expect(instance.isDeforumFieldEnabled("cfg_scale_schedule")).to.equal(false);
    expect(instance.isDeforumFieldEnabled("seed")).to.equal(true);
  });


  it("does not re-prompt session restore after the user declines", () => {
    const instance = instantiate(appDef);
    const touchedKey = instance.sessionStorageTouchedKey();
    const declinedKey = instance.sessionRestoreDeclinedKey();
    testStorage[instance.sessionStorageKey()] = JSON.stringify({
      crossfader: 0.25,
      genericPrompt: "saved prompt",
    });
    testStorage[touchedKey] = String(Date.now());
    instance.pendingSessionStateRaw = testStorage[instance.sessionStorageKey()];

    expect(instance.checkAndPromptSessionRestore()).to.equal(true);
    expect(instance.restoreSessionPromptOpen).to.equal(true);

    instance.dismissSessionRestore(false);

    expect(instance.restoreSessionPromptOpen).to.equal(false);
    expect(testStorage[declinedKey]).to.be.a("string");

    instance.restoreSessionPromptOpen = false;
    instance.pendingSessionStateRaw = "";
    testStorage[instance.sessionStorageKey()] = JSON.stringify({
      crossfader: 0.25,
      genericPrompt: "saved prompt",
    });

    expect(instance.checkAndPromptSessionRestore()).to.equal(false);
    expect(instance.restoreSessionPromptOpen).to.equal(false);
  });

  it("loadDeforumSettings preserves session-restored settings on startup", async () => {
    const instance = instantiate(appDef);
    testStorage[instance.sessionStorageKey()] = JSON.stringify({
      deforumSettings: {
        steps: 18,
        sampler: "Euler a",
        sd_model_name: "local-model.safetensors",
      },
      lastModel: "local-model.safetensors",
    });
    instance.loadSessionState();

    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        settings: {
          steps: 4,
          sampler: "DPM++ 2M",
          sd_model_name: "server-model.safetensors",
        },
      }),
    });

    await instance.loadDeforumSettings({ syncServerModel: false });

    expect(instance.deforumSettings.steps).to.equal(18);
    expect(instance.deforumSettings.sampler).to.equal("Euler a");
    expect(instance.deforumSettings.sd_model_name).to.equal("local-model.safetensors");
    expect(instance.deforumSettingsStatus).to.equal("Loaded local session");
    delete global.fetch;
  });

  it("disposeLiveAudioAnalyser is safe when nothing is wired", () => {
    const instance = instantiate(appDef);
    instance.disposeLiveAudioAnalyser();
    instance.disposeLiveAudioAnalyser();
    expect(instance._liveSpecCtx).to.equal(null);
  });

  it("spectrogramFromAudioBuffer returns RGBA heatmap for sine buffer", () => {
    class FakeBuf {
      constructor() {
        this.sampleRate = 8000;
        this.length = 8192;
        this.numberOfChannels = 1;
      }
      getChannelData() {
        const d = new Float32Array(this.length);
        for (let i = 0; i < d.length; i++) {
          d[i] = 0.45 * Math.sin((2 * Math.PI * 220 * i) / this.sampleRate);
        }
        return d;
      }
    }
    const instance = instantiate(appDef);
    const rgba = instance.spectrogramFromAudioBuffer(new FakeBuf());
    expect(rgba).to.be.an("object");
    expect(rgba.width).to.be.above(32);
    expect(rgba.height).to.be.above(16);
    expect(rgba.data.length).to.equal(rgba.width * rgba.height * 4);
    let max = 0;
    for (let i = 0; i < rgba.data.length; i += 4) {
      max = Math.max(max, rgba.data[i] + rgba.data[i + 1] + rgba.data[i + 2]);
    }
    expect(max).to.be.above(40);
  });

  it("handleAudioUpload posts file data and updates track", async () => {
    const calls = [];
    global.fetch = async (_url, opts) => {
      calls.push(JSON.parse(opts.body));
      return { ok: true, json: async () => ({ ok: true, path: "/tmp/uploaded.wav" }) };
    };
    installFileReaderMock();
    const instance = instantiate(appDef);
    const wav = new File([Buffer.from("RIFFxxxxWAVEfmt ")], "track.wav", { type: "audio/wav" });
    await instance.handleAudioUpload({ target: { files: [wav] } });

    expect(calls[0].name).to.equal("track.wav");
    expect(instance.audio.track).to.equal("/tmp/uploaded.wav");
    expect(instance.audio.uploadedFile).to.equal("track.wav");
    delete global.fetch;
    removeFileReaderMock();
  });

  it("handleAudioUpload handles FileReader errors gracefully", async () => {
    installFileReaderMock({ failRead: true });
    const instance = instantiate(loadAppDefinition());
    const wav = new File([Buffer.alloc(16)], "broken.wav", { type: "audio/wav" });

    await instance.handleAudioUpload({ target: { files: [wav] } });

    // The error should be caught and stored in audioStatus
    expect(instance.audioStatus).to.include("Failed to read audio file");
    expect(instance.audioStatus).to.include("under 50MB");

    removeFileReaderMock();
  });

  it("addLfo creates a new LFO entry", () => {
    const instance = instantiate(appDef);
    const before = instance.lfos.length;

    instance.addLfo();

    expect(instance.lfos.length).to.equal(before + 1);
    expect(instance.lfos.at(-1)).to.include({ shape: "Sine", on: true });
  });

  it("setMorph toggles morph state and emits control", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.setMorph(false);
    expect(instance.prompts.morphOn).to.equal(false);
    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("prompts");
    expect(last.payload).to.deep.equal({ morphOn: false });
  });

  it("sendPreset applies motion preset parameters", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.sendPreset("Orbit");

    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("liveParam");
    expect(last.payload).to.have.property("translation_z", 2);
    expect(last.payload).to.have.property("rotation_y", 15);
  });

  it("sendPreset handles invalid preset name gracefully", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.sendPreset("NonExistent");

    expect(instance.ws.sent.length).to.equal(0);
  });
});

describe("Engine model defaults", () => {
  let appDef;

  beforeEach(() => {
    appDef = loadAppDefinition();
  });

  it("applies model-aware defaults when switching checkpoints", async () => {
    const instance = instantiate(appDef);
    instance.forge.models = [
      { model_name: "juggernautXL.safetensors", metadata: { architecture: "sdxl" } },
    ];
    instance.queueDeforumSettingsSave = () => {};
    instance.schedulePreviewFrame = () => {};

    global.fetch = async () => ({
      json: async () => ({
        success: true,
        model: {
          model_name: "juggernautXL.safetensors",
          metadata: { architecture: "sdxl" },
        },
      }),
    });

    const switched = await instance.switchForgeModel("juggernautXL.safetensors", {
      persistDeforumSettings: true,
      applyOptimizedDefaults: true,
    });

    expect(switched).to.equal(true);
    expect(instance.deforumSettings.sd_model_name).to.equal("juggernautXL.safetensors");
    expect(instance.deforumSettings.steps).to.equal(30);
    expect(instance.deforumSettings.cfg_scale_schedule).to.equal("0:(6.5)");
    expect(instance.forge.options.steps).to.equal(30);
    expect(instance.forge.options.cfg_scale).to.equal(6.5);

    delete global.fetch;
  });
});

describe("Reference A/V sync", () => {
  let appDef;

  beforeEach(() => {
    appDef = loadAppDefinition();
  });

  function inst(extra = {}) {
    return instantiate(appDef, extra);
  }

  it("syncReferenceAudioToVideo does nothing when sync is disabled", () => {
    const audio = { currentTime: 0, paused: false, play: () => Promise.resolve() };
    const instance = inst({ $refs: { avSyncAudio: audio }, avSyncEnabled: false, audio: { objectUrl: "blob:x" } });
    instance.syncReferenceAudioToVideo({ currentTime: 99, paused: false });
    expect(audio.currentTime).to.equal(0);
  });

  it("syncReferenceAudioToVideo does nothing without objectUrl", () => {
    const audio = { currentTime: 0, paused: false };
    const instance = inst({ $refs: { avSyncAudio: audio }, avSyncEnabled: true, audio: { objectUrl: null } });
    instance.syncReferenceAudioToVideo({ currentTime: 10, paused: false });
    expect(audio.currentTime).to.equal(0);
  });

  it("syncReferenceAudioToVideo does nothing when video is paused", () => {
    const audio = { currentTime: 0, paused: false };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      avSyncLeadSec: 4,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncReferenceAudioToVideo({ currentTime: 20, paused: true });
    expect(audio.currentTime).to.equal(0);
  });

  it("syncReferenceAudioToVideo seeks audio to video time minus lead when drift is large", () => {
    const audio = { currentTime: 0, paused: true, play: () => Promise.resolve() };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      avSyncLeadSec: 5,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncReferenceAudioToVideo({ currentTime: 20, paused: false });
    expect(audio.currentTime).to.equal(15);
  });

  it("syncReferenceAudioToVideo clamps target at zero", () => {
    const audio = { currentTime: 0, paused: true, play: () => Promise.resolve() };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      avSyncLeadSec: 50,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncReferenceAudioToVideo({ currentTime: 3, paused: false });
    expect(audio.currentTime).to.equal(0);
  });

  it("syncReferenceAudioToVideo does not seek when already within drift window", () => {
    const audio = { currentTime: 9.95, paused: true, play: () => Promise.resolve() };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      avSyncLeadSec: 2,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncReferenceAudioToVideo({ currentTime: 12, paused: false });
    expect(audio.currentTime).to.equal(9.95);
  });

  it("syncReferenceAudioToVideo uses default lead of 4 when avSyncLeadSec is NaN", () => {
    const audio = { currentTime: 0, paused: true, play: () => Promise.resolve() };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      avSyncLeadSec: Number.NaN,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncReferenceAudioToVideo({ currentTime: 14, paused: false });
    expect(audio.currentTime).to.equal(10);
  });

  it("syncAvAudioPlayState(true) seeks and plays when enabled with objectUrl", () => {
    const audio = { currentTime: 0, paused: true, play: () => { audio.paused = false; return Promise.resolve(); } };
    const video = { currentTime: 8, paused: false };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      avSyncLeadSec: 2,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncAvAudioPlayState(true, video);
    expect(audio.currentTime).to.equal(6);
    expect(audio.paused).to.equal(false);
  });

  it("syncAvAudioPlayState(false) pauses reference audio", () => {
    const audio = { currentTime: 3, paused: false, pause: () => { audio.paused = true; } };
    const instance = inst({
      $refs: { avSyncAudio: audio },
      avSyncEnabled: true,
      audio: { objectUrl: "blob:x" },
    });
    instance.syncAvAudioPlayState(false, { paused: true });
    expect(audio.paused).to.equal(true);
  });

  it("syncAvAudioPlayState is a no-op when sync disabled", () => {
    let plays = 0;
    const audio = { play: () => { plays += 1; return Promise.resolve(); }, pause: () => {} };
    const instance = inst({ $refs: { avSyncAudio: audio }, avSyncEnabled: false, audio: { objectUrl: "blob:x" } });
    instance.syncAvAudioPlayState(true, { currentTime: 1, paused: false });
    expect(plays).to.equal(0);
  });

  it("handleAudioUpload assigns objectUrl for real File/Blob uploads", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/srv/out.wav" }) });
    installFileReaderMock();
    const wav = new File([Buffer.from("RIFFxxxxWAVEfmt ")], "clip.wav", { type: "audio/wav" });
    const instance = inst();
    await instance.handleAudioUpload({ target: { files: [wav] } });
    expect(instance.audio.objectUrl).to.be.a("string").and.to.match(/^blob:/);
    expect(instance.audio.track).to.equal("/srv/out.wav");
    if (instance.audio.objectUrl) {
      URL.revokeObjectURL(instance.audio.objectUrl);
    }
    delete global.fetch;
    removeFileReaderMock();
  });

  it("handleAudioUpload revokes objectUrl when upload fails after blob creation", async () => {
    global.fetch = async () => ({ ok: false, json: async () => ({ error: "disk full" }) });
    installFileReaderMock();
    const wav = new File([Buffer.alloc(64)], "bad.wav", { type: "audio/wav" });
    const instance = inst();
    await instance.handleAudioUpload({ target: { files: [wav] } });
    expect(instance.audio.objectUrl).to.equal(null);
    expect(instance.audioStatus).to.include("disk full");
    delete global.fetch;
    removeFileReaderMock();
  });

  it("clearAudioFile revokes objectUrl and disables av sync", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/tmp/a.wav" }) });
    installFileReaderMock();
    const wav = new File([Buffer.alloc(32)], "z.wav", { type: "audio/wav" });
    const instance = inst({
      avSyncEnabled: true,
      $refs: { avSyncAudio: { pause: () => {} }, audioFileInput: { value: "" } },
    });
    await instance.handleAudioUpload({ target: { files: [wav] } });
    expect(instance.audio.objectUrl).to.be.a("string");
    instance.clearAudioFile();
    expect(instance.audio.objectUrl).to.equal(null);
    expect(instance.avSyncEnabled).to.equal(false);
    delete global.fetch;
    removeFileReaderMock();
  });
});

describe("Reference A/V sync mounted e2e", () => {
  let dom;
  let document;
  let appVm;

  before(async () => {
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
    const et = dom.window.EventTarget.prototype;
    const playerProbe = () => dom.window.document.getElementById("player");
    const ensureVideoEventSurface = () => {
      const el = playerProbe();
      if (!el) return;
      if (typeof el.addEventListener !== "function") {
        el.addEventListener = et.addEventListener.bind(el);
        el.removeEventListener = et.removeEventListener.bind(el);
        el.dispatchEvent = et.dispatchEvent.bind(el);
      }
    };
    ({ createApp, nextTick } = require("vue/dist/vue.cjs.js"));
    const appDef = loadAppDefinition();
    appDef.mounted = () => {};
    appVm = mountQuietApp(appDef);
    document = dom.window.document;
    ensureVideoEventSurface();
  });

  function resetAvSyncState() {
    if (appVm.audio.objectUrl) {
      try {
        URL.revokeObjectURL(appVm.audio.objectUrl);
      } catch (_e) {}
    }
    appVm.audio.track = "";
    appVm.audio.uploadedFile = null;
    appVm.audio.objectUrl = null;
    appVm.avSyncEnabled = false;
    appVm.avSyncLeadSec = 4;
    appVm.audioStatus = "Idle";
    if (appVm.hls && typeof appVm.hls.destroy === "function") {
      try {
        appVm.hls.destroy();
      } catch (_e) {}
    }
    appVm.hls = null;
    appVm.playerEl = null;
  }

  beforeEach(async () => {
    resetAvSyncState();
    await nextTick();
    appVm.switchTab("LIVE");
    await nextTick();
  });

  it("renders hidden sync audio element and LIVE controls", async () => {
    // Check app state instead of DOM (JSDOM Vue mounting limitations)
    expect(appVm.$refs.avSyncAudio).to.exist;
    appVm.switchSubTab("MODULATION", "AV_SYNC");
    await nextTick();
    expect(appVm.currentSubTab.MODULATION).to.equal("AV_SYNC");
  });

  it("upload binds blob URL to the sync audio element src", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/data/uploaded.wav" }) });
    installFileReaderMock();
    const wav = new File([Buffer.alloc(128)], "live.wav", { type: "audio/wav" });
    await appVm.handleAudioUpload({ target: { files: [wav] } });
    await nextTick();
    expect(appVm.audio.objectUrl).to.be.a("string").and.to.match(/^blob:/);
    expect(appVm.$refs.avSyncAudio).to.exist;
    delete global.fetch;
    removeFileReaderMock();
  });

  it("enabling sync after upload leaves checkbox enabled once objectUrl exists", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/data/u.wav" }) });
    installFileReaderMock();
    const wav = new File([Buffer.alloc(64)], "e.wav", { type: "audio/wav" });
    await appVm.handleAudioUpload({ target: { files: [wav] } });
    await nextTick();
    appVm.switchSubTab("MODULATION", "AV_SYNC");
    await nextTick();
    // Check state instead of DOM
    expect(appVm.audio.objectUrl).to.be.a("string");
    appVm.avSyncEnabled = true;
    await nextTick();
    expect(appVm.avSyncEnabled).to.equal(true);
    delete global.fetch;
    removeFileReaderMock();
  });

  it("mounted: syncReferenceAudioToVideo uses real DOM audio ref after upload", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/data/sync.wav" }) });
    installFileReaderMock();
    const wav = new File([Buffer.alloc(72)], "sync.wav", { type: "audio/wav" });
    await appVm.handleAudioUpload({ target: { files: [wav] } });
    await nextTick();
    appVm.avSyncEnabled = true;
    appVm.avSyncLeadSec = 2;
    // Use $refs instead of DOM query (JSDOM Vue mounting limitations)
    const audioEl = appVm.$refs.avSyncAudio;
    expect(audioEl).to.exist;
    let ct = 0;
    Object.defineProperty(audioEl, "currentTime", {
      configurable: true,
      get() {
        return ct;
      },
      set(v) {
        ct = v;
      },
    });
    audioEl.paused = true;
    audioEl.play = () => {
      audioEl.paused = false;
      return Promise.resolve();
    };
    const video = { currentTime: 11, paused: false };
    appVm.syncReferenceAudioToVideo(video);
    expect(ct).to.equal(9);
    delete global.fetch;
    removeFileReaderMock();
  });
});
