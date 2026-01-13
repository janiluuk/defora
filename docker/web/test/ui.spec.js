const { readFileSync } = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");
const vm = require("vm");
const { describe, it, before, beforeEach } = require("node:test");
let createApp;
let nextTick;

function loadAppDefinition() {
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
    document: { getElementById: () => ({ canPlayType: () => "", currentTime: 0, play: () => {} }) },
    // Proxy to the outer fetch so tests can stub/intercept network calls
    fetch: (...args) => (global.fetch ? global.fetch(...args) : Promise.reject(new Error("fetch not available"))),
    FileReader: global.FileReader,
    setInterval: () => 0,
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
    expect(tabs.join(" ")).to.include("MOTION");
    expect(tabs.join(" ")).to.include("AUDIO/BEATS");
    expect(tabs.join(" ")).to.include("MODULATION");
    expect(tabs.join(" ")).to.include("CN");
    expect(tabs.join(" ")).to.include("SETTINGS");
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
    const sliderRows = [...document.querySelectorAll(".slider-row")];
    expect(sliderRows.length).to.be.greaterThan(5);
    const chips = [...document.querySelectorAll(".chip")].map((c) => c.textContent.trim());
    expect(chips.join(" ")).to.match(/Static|Orbit|Tunnel|Handheld|Chaos/);
  });

  it("shows prompts/morph table structure", async () => {
    appVm.switchTab("PROMPTS");
    await nextTick();
    const morphTable = document.querySelector("table.table");
    expect(morphTable).to.exist;
    const headers = [...morphTable.querySelectorAll("th")].map((h) => h.textContent.trim());
    expect(headers.join(" ")).to.match(/ID|On|Name|Range/);
  });

  it("toggles modulation router visibility and shows MIDI mappings", async () => {
    appVm.switchTab("AUDIO");
    await nextTick();
    let audioHeadings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(audioHeadings.join(" ")).to.not.include("Modulation Router");

    appVm.audio.uploadedFile = "song.wav";
    appVm.audio.track = "/tmp/song.wav";
    await nextTick();
    audioHeadings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(audioHeadings.join(" ")).to.include("Modulation Router");

    appVm.switchTab("MOD");
    await nextTick();
    const modHeadings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(modHeadings.join(" ")).to.include("Modulation Studio");
    expect(modHeadings.join(" ")).to.include("Beat Macros");

    appVm.switchTab("SETTINGS");
    await nextTick();
    const settingsHeadings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(settingsHeadings.join(" ")).to.include("Controllers (WebMIDI)");
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
