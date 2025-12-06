const { readFileSync } = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");
const vm = require("vm");

function loadAppDefinition() {
  const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
  const match = html.match(/const\s+\{\s*createApp\s*\}\s*=\s*Vue;([\s\S]*?)<\/script>/);
  if (!match) throw new Error("App script not found");
  const scriptContent = match[1];

  let captured = null;
  const context = {
    Vue: {
      createApp: (opts) => {
        captured = opts;
        return { mount: () => opts };
      },
    },
    Hls: class FakeHls {
      static isSupported() {
        return true;
      }
      loadSource() {}
      attachMedia() {}
      on() {}
    },
    navigator: {},
    WebSocket: class {},
    location: { protocol: "http:", host: "localhost" },
    document: { getElementById: () => ({ canPlayType: () => "", currentTime: 0, play: () => {} }) },
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

  before(() => {
    const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
    dom = new JSDOM(html);
    document = dom.window.document;
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

  it("shows prompts/morph table structure", () => {
    const morphTable = document.querySelector("table.table");
    expect(morphTable).to.exist;
    const headers = [...morphTable.querySelectorAll("th")].map((h) => h.textContent.trim());
    expect(headers.join(" ")).to.match(/ID|On|Name|Range/);
  });

  it("includes macro rack cards and MIDI mappings", () => {
    const headings = [...document.querySelectorAll(".rack h3")].map((h) => h.textContent.trim());
    expect(headings.join(" ")).to.include("Beat macros");
    expect(headings.join(" ")).to.include("Controllers (WebMIDI)");
    const mappingRows = [...document.querySelectorAll("table.table tbody tr")];
    expect(mappingRows.length).to.be.greaterThan(1);
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

  it("handleMidi maps CC messages to liveParam payloads", () => {
    const instance = instantiate(appDef);
    instance.ws = new FakeSocket();

    instance.handleMidi({ id: "dev" }, { data: [0xb0, 22, 100] });

    const last = instance.ws.sent.at(-1);
    expect(last.controlType).to.equal("liveParam");
    expect(last.payload).to.have.property("strength");
    expect(last.payload.strength).to.be.closeTo(100 / 127, 1e-6);
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
});
