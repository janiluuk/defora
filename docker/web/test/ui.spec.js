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
  const scriptMatch = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch || !scriptMatch[1]) {
    throw new Error("App script not found");
  }
  const scriptContent = scriptMatch[1];

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
    setInterval: () => 0,
    console,
  };

  const wrapped = `(function(){\n${scriptContent}\n})()`;
  vm.runInNewContext(wrapped, context, { filename: "app-inline.js", displayErrors: true });
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
    const promptAreas = [...document.querySelectorAll("textarea")];
    expect(promptAreas.length).to.be.greaterThan(1);
    const crossfade = document.querySelector('input[type="range"][step="0.01"]');
    expect(crossfade).to.exist;
  });

  it("includes macro rack cards and MIDI mappings", async () => {
    appVm.switchTab("AUDIO");
    await nextTick();
    const audioHeadings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(audioHeadings.join(" ")).to.include("Macro lanes");
    const bandCards = document.querySelectorAll(".band-card");
    expect(bandCards.length).to.equal(4);

    appVm.switchTab("SETTINGS");
    await nextTick();
    const settingsHeadings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(settingsHeadings.join(" ")).to.include("Controllers (WebMIDI)");
    const mappingRows = [...document.querySelectorAll("table.table tbody tr")];
    expect(mappingRows.length).to.be.greaterThan(1);
  });

  it("controlnet tab renders slots and controls", async () => {
    appVm.switchTab("CONTROLNET");
    await nextTick();
    const cnChips = [...document.querySelectorAll(".chips .chip")].filter((c) => c.textContent.includes("CN"));
    expect(cnChips.some((c) => c.textContent.includes("CN1"))).to.equal(true);
    const weightInput = document.querySelector('input[type="range"][min="0"][max="2"]');
    expect(weightInput).to.exist;
  });
});

describe("Deforumation Web UI behavior", () => {
  const appDef = loadAppDefinition();

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

  it("sends prompts with mix and A/B payloads", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    instance.prompts.posA = "hello";
    instance.prompts.posB = "world";
    instance.prompts.mix = 0.25;
    instance.prompts.morphOn = true;
    instance.promptSchedule = [{ t: 1, mix: 0.2 }];

    instance.sendPrompts();

    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("prompts");
    expect(last.payload.prompt_mix).to.equal(0.25);
    expect(last.payload.positive_prompt_1).to.equal("hello");
    expect(last.payload.positive_prompt_2).to.equal("world");
    expect(last.payload.should_use_deforumation_prompts).to.equal(1);
    expect(last.payload.prompt_schedule).to.deep.equal([{ t: 1, mix: 0.2 }]);
  });

  it("updates prompt polyline when slots change", () => {
    const instance = instantiate(appDef);
    instance.promptSchedule = [
      { t: 0, mix: 0 },
      { t: 5, mix: 0.5 },
      { t: 10, mix: 1 },
    ];
    instance.updatePromptGraph();
    expect(instance.promptPolyline).to.be.a("string");
    expect(instance.promptPolyline).to.include("0,50");
    expect(instance.promptPolyline).to.include("100,0");
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
    expect(last.payload).to.have.property("cfg");
  });

  it("runLfos still sends when audio track is set (beat/LFO coexist)", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    instance.audio.track = "song.wav";
    instance.lfos = [{ id: 1, on: true, target: "cfg", shape: "Sine", bpm: 60, depth: 0.2, base: 6, phase: 0 }];
    instance.lastLfoTick = 0;

    instance.runLfos(1000);

    expect(instance.ws.sent.length).to.be.greaterThan(0);
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

  it("sendControlNet constructs payload", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();
    const slot = { id: "CN1", weight: 0.5, enabled: true, bypass: false };
    instance.sendControlNet(slot);
    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("controlnet");
    expect(last.payload.slot).to.equal("CN1");
    expect(last.payload.weight).to.equal(0.5);
  });

  it("setMorph toggles morph state and emits control", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.setMorph(false);
    expect(instance.prompts.morphOn).to.equal(false);
    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("prompts");
    expect(last.payload).to.deep.equal({ should_use_deforumation_prompts: 0 });
  });
});
