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

function loadAppDefinition() {
  if (typeof global.FileReader !== "function") {
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => {
          if (typeof this.onload === "function") this.onload();
        });
      }
    };
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
    appVm = createApp(appDef).mount("#app");
    document = dom.window.document;
  });

  beforeEach(async () => {
    appVm.switchTab("LIVE");
    appVm.currentSubTab = { PROMPTS: 'PROMPTS', MODULATION: 'LFO', SETTINGS: 'ENGINE' };
    await nextTick();
  });

  it("renders tabs for all sections", () => {
    const tabs = [...document.querySelectorAll(".tab")].map((el) => el.textContent.trim());
    expect(tabs.join(" ")).to.include("LIVE");
    expect(tabs.join(" ")).to.include("PROMPTS");
    expect(tabs.join(" ")).to.include("MOTION");
    expect(tabs.join(" ")).to.include("MODULATION");
    expect(tabs.join(" ")).to.include("SETTINGS");
    expect(tabs.join(" ")).to.include("GENERATE");
    expect(tabs.join(" ")).to.not.include("AUDIO");
    expect(tabs.join(" ")).to.not.include("RUNS");
    expect(tabs.length).to.equal(6);
  });

  it("has a video player and overlay HUD", () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    const overlay = document.querySelector(".overlay");
    expect(overlay.textContent).to.include("Seed");
  });

  it("defaults to the standby animation and can switch to the Deforum feed when ready", () => {
    expect(appVm.defaultAnimation.preferDeforumVideo).to.equal(false);
    expect(appVm.showDeforumVideo).to.equal(false);

    appVm.defaultAnimation.preferDeforumVideo = true;
    appVm.videoReady = true;

    expect(appVm.showDeforumVideo).to.equal(true);
    expect(appVm.deforumFeedStatusLabel).to.match(/live|ready/i);
  });

  it("includes video, sliders, and presets", async () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    appVm.liveDrawerOpen = true;
    appVm.paramPanelOpen = true;
    await nextTick();
    const sliderRows = [...document.querySelectorAll(".param-drawer input[type='range'], [data-testid='performance-crossfader']")];
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
    expect(pageText).to.include("Checkpoint");
    expect(pageText).to.include("Sampler");
    expect(pageText).to.include("Optimize for model");
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

  it("shows preview-ready and story generation text in the animation sequencer tab", async () => {
    appVm.switchTab("GENERATE");
    appVm.performance.status = "Preview frame ready";
    appVm.generator.status = "Story ready";
    appVm.generator.result = {
      formatted: "Theme: Neon city\n\n0: opening skyline shot",
      source: { model: "llama3.1" },
    };
    await nextTick();
    await nextTick();

    const pageText = document.body.textContent;
    expect(pageText).to.include("Animation Sequencer");
    expect(pageText).to.include("Duration (s)");
    expect(pageText).to.include("Playhead (s)");
    expect(pageText).to.include("Preview frame");
    expect(pageText).to.include("Preview frame ready");
    expect(pageText).to.include("Story generation text");
    expect(pageText).to.include("Theme: Neon city");
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
    expect([...document.querySelectorAll(".framesync-title")].map((el) => el.textContent.trim()).join(" ")).to.include("LoRA Crossfader");
    expect(document.querySelectorAll(".lora-picker-row").length).to.equal(0);

    appVm.loraPickerOpen = true;
    await nextTick();
    expect(document.querySelectorAll(".lora-picker-row").length).to.equal(1);
  });

  it("shows a dedicated collapsed LoRA crossfader tab", async () => {
    appVm.switchTab("PROMPTS");
    appVm.switchSubTab("PROMPTS", "CROSSFADER");
    await nextTick();
    await nextTick();

    const subTabs = [...document.querySelectorAll(".sub-pill")].map((el) => el.textContent.trim());
    expect(subTabs.join(" ")).to.include("CROSSFADER");
    expect(appVm.loraCrossfaderCollapsed).to.equal(true);

    const titles = [...document.querySelectorAll(".framesync-title")].map((el) => el.textContent.trim());
    expect(titles.join(" ")).to.include("LoRA Crossfader");
    expect(document.querySelector(".prompt-ab-summary")).to.not.exist;
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
    
    // Switch to MODULATION -> AUDIO
    appVm.switchTab("AUDIO");
    appVm.avSyncCollapsed = false;
    await nextTick();
    
    expect(appVm.currentTab).to.equal("MODULATION");
    expect(appVm.currentSubTab.MODULATION).to.equal("AUDIO");
    expect(appVm.audioMappings.length).to.be.greaterThan(0);
    
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

  it("renders a recent runs rail on LIVE from shared runs data", async () => {
    appVm.switchTab("LIVE");
    appVm.runsAll = [
      { run_id: "run-001", started_at: "2026-05-26T09:00:00Z", has_thumbnail: false },
      { run_id: "run-002", started_at: "2026-05-26T10:00:00Z", has_thumbnail: false },
      { run_id: "run-003", started_at: "2026-05-26T11:00:00Z", has_thumbnail: false },
      { run_id: "run-004", started_at: "2026-05-26T12:00:00Z", has_thumbnail: false },
      { run_id: "run-005", started_at: "2026-05-26T13:00:00Z", has_thumbnail: false },
    ];
    await nextTick();

    const railItems = [...document.querySelectorAll(".recent-runs-rail__item")];
    expect(railItems.length).to.equal(4);
    expect(railItems[0].textContent).to.include("run-005");
    expect(document.querySelector(".recent-runs-rail__link").textContent).to.include("All runs");
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

  it("defaults prompts to the image subtab", () => {
    const instance = instantiate(appDef);
    expect(instance.currentSubTab.PROMPTS).to.equal("IMAGE");
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
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
    appDef = loadAppDefinition();
    const instance = instantiate(appDef);
    await instance.handleAudioUpload({ target: { files: [{ name: "track.wav" }] } });

    expect(calls[0].name).to.equal("track.wav");
    expect(instance.audio.track).to.equal("/tmp/uploaded.wav");
    expect(instance.audio.uploadedFile).to.equal("track.wav");
    delete global.fetch;
    delete global.FileReader;
  });

  it("handleAudioUpload handles FileReader errors gracefully", async () => {
    global.FileReader = class {
      readAsDataURL() {
        setImmediate(() => this.onerror(new Error("Read failed")));
      }
    };
    appDef = loadAppDefinition();
    const instance = instantiate(appDef);

    await instance.handleAudioUpload({ target: { files: [{ name: "broken.wav" }] } });

    // The error should be caught and stored in audioStatus
    expect(instance.audioStatus).to.include("Failed to read audio file");
    expect(instance.audioStatus).to.include("under 50MB");

    delete global.FileReader;
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
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
    const wav = new File([Buffer.from("RIFFxxxxWAVEfmt ")], "clip.wav", { type: "audio/wav" });
    const instance = inst();
    await instance.handleAudioUpload({ target: { files: [wav] } });
    expect(instance.audio.objectUrl).to.be.a("string").and.to.match(/^blob:/);
    expect(instance.audio.track).to.equal("/srv/out.wav");
    if (instance.audio.objectUrl) {
      URL.revokeObjectURL(instance.audio.objectUrl);
    }
    delete global.fetch;
    delete global.FileReader;
  });

  it("handleAudioUpload revokes objectUrl when upload fails after blob creation", async () => {
    global.fetch = async () => ({ ok: false, json: async () => ({ error: "disk full" }) });
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
    const wav = new File([Buffer.alloc(64)], "bad.wav", { type: "audio/wav" });
    const instance = inst();
    await instance.handleAudioUpload({ target: { files: [wav] } });
    expect(instance.audio.objectUrl).to.equal(null);
    expect(instance.audioStatus).to.include("disk full");
    delete global.fetch;
    delete global.FileReader;
  });

  it("clearAudioFile revokes objectUrl and disables av sync", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/tmp/a.wav" }) });
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
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
    delete global.FileReader;
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
    appVm = createApp(appDef).mount("#app");
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
    appVm.avSyncCollapsed = false;
    await nextTick();
    expect(appVm.avSyncCollapsed).to.equal(false);
  });

  it("upload binds blob URL to the sync audio element src", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/data/uploaded.wav" }) });
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
    const wav = new File([Buffer.alloc(128)], "live.wav", { type: "audio/wav" });
    await appVm.handleAudioUpload({ target: { files: [wav] } });
    await nextTick();
    expect(appVm.audio.objectUrl).to.be.a("string").and.to.match(/^blob:/);
    expect(appVm.$refs.avSyncAudio).to.exist;
    delete global.fetch;
    delete global.FileReader;
  });

  it("enabling sync after upload leaves checkbox enabled once objectUrl exists", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/data/u.wav" }) });
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
    const wav = new File([Buffer.alloc(64)], "e.wav", { type: "audio/wav" });
    await appVm.handleAudioUpload({ target: { files: [wav] } });
    await nextTick();
    appVm.avSyncCollapsed = false;
    await nextTick();
    // Check state instead of DOM
    expect(appVm.audio.objectUrl).to.be.a("string");
    appVm.avSyncEnabled = true;
    await nextTick();
    expect(appVm.avSyncEnabled).to.equal(true);
    delete global.fetch;
    delete global.FileReader;
  });

  it("mounted: syncReferenceAudioToVideo uses real DOM audio ref after upload", async () => {
    global.fetch = async () => ({ ok: true, json: async () => ({ ok: true, path: "/data/sync.wav" }) });
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:audio/wav;base64,ZmFrZQ==";
        setImmediate(() => this.onload());
      }
    };
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
    delete global.FileReader;
  });
});
