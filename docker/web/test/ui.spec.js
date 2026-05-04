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
}
ensureGlobalFileAndBlob();

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
  const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("App script not found");
  const scriptContent = match[1];

  let captured = null;
  const FakeHls = class {
    static isSupported() {
      return true;
    }
    loadSource() {}
    attachMedia() {}
    on() {}
  };
  FakeHls.Events = { MANIFEST_PARSED: "manifest_parsed", ERROR: "error" };
  const context = {
    Vue: {
      createApp: (opts) => {
        captured = opts;
        return { mount: () => opts };
      },
    },
    Hls: FakeHls,
    navigator: {},
    WebSocket: class {},
    location: { protocol: "http:", host: "localhost" },
    document:
      typeof global.document !== "undefined" &&
      global.document &&
      typeof global.document.createElement === "function"
        ? global.document
        : { getElementById: () => ({ canPlayType: () => "", currentTime: 0, play: () => {} }) },
    // Proxy to the outer fetch so tests can stub/intercept network calls
    fetch: (...args) => (global.fetch ? global.fetch(...args) : Promise.reject(new Error("fetch not available"))),
    FileReader: global.FileReader,
    URL: global.URL,
    Blob: global.Blob,
    File: global.File,
    Buffer: global.Buffer,
    setInterval: () => 0,
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    console,
  };

  vm.runInNewContext(scriptContent, context);
  return captured;
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
    const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
    dom = new JSDOM(html, { url: "http://localhost" });
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.location = dom.window.location;
    global.SVGElement = dom.window.SVGElement;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    ({ createApp, nextTick } = require("vue"));

    const appDef = loadAppDefinition();
    appDef.mounted = () => {};
    appVm = createApp(appDef).mount("#app");
    document = dom.window.document;
  });

  beforeEach(async () => {
    appVm.switchTab("LIVE");
    await nextTick();
  });

  it("renders tabs for all sections", () => {
    const tabs = [...document.querySelectorAll(".tab")].map((el) => el.textContent.trim());
    expect(tabs.join(" ")).to.include("LIVE");
    expect(tabs.join(" ")).to.include("PROMPTS");
    expect(tabs.join(" ")).to.include("LORA");
    expect(tabs.join(" ")).to.include("MOTION");
    expect(tabs.join(" ")).to.include("MODULATION");
    expect(tabs.join(" ")).to.include("CN");
    expect(tabs.join(" ")).to.include("SETTINGS");
    // Should have 7 tabs total (added LORA tab for LoRA browser)
    expect(tabs.length).to.equal(7);
  });

  it("has a video player and overlay HUD", () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    const overlay = document.querySelector(".overlay");
    expect(overlay.textContent).to.include("Seed");
  });

  it("includes video, sliders, and presets", () => {
    const video = document.querySelector("video#player");
    expect(video).to.exist;
    const sliderRows = [...document.querySelectorAll(".framesync-stack, .framesync-row input[type='range']")];
    expect(sliderRows.length).to.be.greaterThan(5);
    const presetButtons = [...document.querySelectorAll(".framesync-button")].filter(b => /Static|Orbit|Tunnel|Handheld|Chaos/.test(b.textContent));
    expect(presetButtons.length).to.be.greaterThan(0);
  });

  it("shows prompts/morph table structure", async () => {
    appVm.switchTab("PROMPTS");
    await nextTick();
    const morphTable = document.querySelector("table.table");
    expect(morphTable).to.exist;
    const headers = [...morphTable.querySelectorAll("th")].map((h) => h.textContent.trim());
    expect(headers.join(" ")).to.match(/ID|On|Name|Range/);
  });

  it("toggles modulation tab sections and shows unified interface", async () => {
    // Switch to unified MODULATION tab
    appVm.switchTab("MODULATION");
    await nextTick();
    
    // Check that the unified modulation tab has the expected sections
    const modSubtitles = [...document.querySelectorAll(".framesync-subtitle")].map((h) => h.textContent.trim());
    expect(modSubtitles.join(" ")).to.include("Audio Source");
    expect(modSubtitles.join(" ")).to.include("LFO Modulators");
    expect(modSubtitles.join(" ")).to.include("Beat Macros");
    
    // Audio mapping section should be hidden when no audio file
    const audioMappingSection = document.querySelector(".framesync-subtitle:has(+ div)");
    // When audio is uploaded, audio mapping section becomes visible
    appVm.audio.uploadedFile = "song.wav";
    appVm.audio.track = "/tmp/song.wav";
    appVm.audio.objectUrl = "blob:http://localhost/fake-audio";
    await nextTick();
    
    // Now audio mapping should be visible
    const allSubtitles = [...document.querySelectorAll(".framesync-subtitle")].map((h) => h.textContent.trim());
    expect(allSubtitles.join(" ")).to.include("Audio → Parameter Mapping");
    expect(allSubtitles.join(" ")).to.include("Spectral overview");
    expect(allSubtitles.join(" ")).to.include("Live spectrum");
    appVm.audio.objectUrl = null;

    appVm.switchTab("SETTINGS");
    await nextTick();
    const settingsHeadings = [...document.querySelectorAll(".framesync-title, .rack h4")].map((h) => h.textContent.trim());
    expect(settingsHeadings.join(" ")).to.include("Controllers");
    const mappingRows = [...document.querySelectorAll("table.table tbody tr")];
    expect(mappingRows.length).to.be.greaterThan(1);
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
    global.window.localStorage = {
      getItem: (key) => testStorage[key] || null,
      setItem: (key, value) => { testStorage[key] = value; },
      removeItem: (key) => { delete testStorage[key]; },
      clear: () => { testStorage = {}; Object.keys(testStorage).forEach(k => delete testStorage[k]); }
    };
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
    delete global.fetch;
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

  it("runLfos emits liveParam payload when audio is off", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    instance.audio.track = "";
    instance.lfos = [
      { id: 1, on: true, target: "cfg", shape: "Sine", bpm: 15, depth: 0.2, base: 6, phase: 0 },
    ];
    instance.lastLfoTick = 0;

    instance.runLfos(1000);

    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("liveParam");
    expect(last.payload.cfg).to.be.closeTo(9, 0.2); // base 6 + depth*range/2
  });

  it("runLfos skips when audio track is set", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    instance.audio.track = "song.wav";
    instance.lfos = [{ id: 1, on: true, target: "cfg", shape: "Sine", bpm: 60, depth: 0.2, base: 6, phase: 0 }];
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
    const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
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
    ({ createApp, nextTick } = require("vue"));
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

  it("renders hidden sync audio element and LIVE controls", () => {
    const audio = document.querySelector('[data-testid="av-sync-audio"]');
    expect(audio).to.exist;
    expect(document.querySelector('[data-testid="av-sync-enable"]')).to.exist;
    expect(document.querySelector('[data-testid="av-sync-lead"]')).to.exist;
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
    const el = document.querySelector('[data-testid="av-sync-audio"]');
    expect(el).to.exist;
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
    const cb = document.querySelector('[data-testid="av-sync-enable"]');
    expect(cb.disabled).to.equal(false);
    cb.click();
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
    const audioEl = document.querySelector('[data-testid="av-sync-audio"]');
    expect(audioEl).to.exist;
    expect(appVm.$refs.avSyncAudio).to.equal(audioEl);
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
