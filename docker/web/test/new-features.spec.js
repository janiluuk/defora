const { readFileSync } = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { expect } = require("chai");
const { describe, it, before, beforeEach } = require("node:test");
let createApp;
let nextTick;
let appVm;
let dom;

function loadAppDefinition() {
  const appDefPath = path.join(__dirname, "..", "src", "app-definition.js");
  return require(appDefPath);
}

function mountQuietApp(appDef) {
  const app = createApp(appDef);
  // Suppress Vue runtime warnings so CI only shows actionable failures.
  app.config.warnHandler = () => {};
  return app.mount("#app");
}

describe("New Features Tests", () => {
  before(async () => {
    const html = readFileSync(path.join(__dirname, "test-app.html"), "utf-8");
    dom = new JSDOM(html, { url: "http://localhost", pretendToBeVisual: true });
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.location = dom.window.location;
    global.SVGElement = dom.window.SVGElement;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    
    const appDef = loadAppDefinition();
    appDef.mounted = () => {};
    ({ createApp, nextTick } = require("vue/dist/vue.cjs.js"));
    appVm = mountQuietApp(appDef);
  });

  beforeEach(async () => {
    appVm.currentTab = "LIVE";
    appVm.currentSubTab = { PROMPTS: 'PROMPTS', MODULATION: 'LFO', SETTINGS: 'ENGINE' };
    await nextTick();
  });

  describe("Parameter Bindings", () => {
    it("has default key bindings for camera controls", () => {
      expect(appVm.keyBindings["translation_z"]).to.equal("w");
      expect(appVm.keyBindings["translation_x"]).to.equal("a");
      expect(appVm.keyBindings["translation_y"]).to.equal("s");
      expect(appVm.keyBindings["rotation_y"]).to.equal("d");
    });

    it("has default key bindings for style controls", () => {
      expect(appVm.keyBindings["cfg"]).to.equal("z");
      expect(appVm.keyBindings["strength"]).to.equal("x");
      expect(appVm.keyBindings["noise_multiplier"]).to.equal("c");
    });

    it("can clear a key binding", () => {
      appVm.clearKeyBinding("translation_z");
      expect(appVm.keyBindings["translation_z"]).to.be.undefined;
    });

    it("can reset bindings to defaults", () => {
      const originalConfirm = global.confirm;
      global.confirm = () => true;
      
      appVm.keyBindings["translation_z"] = "p";
      appVm.resetBindings();
      expect(appVm.keyBindings["translation_z"]).to.equal("w");
      
      global.confirm = originalConfirm;
    });

    it("has binding groups computed property", () => {
      const groups = appVm.bindingGroups;
      expect(groups.length).to.be.greaterThan(0);
      const styleGroup = groups.find(g => g.label === "Style");
      expect(styleGroup).to.exist;
      expect(styleGroup.items.length).to.be.greaterThan(0);
    });
  });

  describe("Sequencer BPM Sync", () => {
    it("has BPM sync state", () => {
      expect(appVm.sequencer.bpmSync).to.equal(false);
      expect(appVm.sequencer.bpm).to.equal(120);
      expect(appVm.sequencer.bars).to.equal(4);
      expect(appVm.sequencer.beatsPerBar).to.equal(4);
    });

    it("calculates duration from BPM", () => {
      appVm.sequencer.bpmSync = true;
      appVm.sequencer.bpm = 120;
      appVm.sequencer.bars = 4;
      appVm.sequencer.beatsPerBar = 4;
      const duration = appVm.sequencerCalculatedDuration;
      expect(duration).to.equal("8.00");
    });

    it("returns dash when BPM sync is off", () => {
      appVm.sequencer.bpmSync = false;
      expect(appVm.sequencerCalculatedDuration).to.equal("—");
    });
  });

  describe("Sequencer content clips", () => {
    it("adds clips when invoked through app-view proxy (child panel context)", () => {
      const { proxyAppView } = require("../src/components/views/app-view-proxy.js");
      const panel = proxyAppView({ app: appVm });
      appVm.sequencer.clips = [];
      appVm.sequencer.durationSec = 8;
      appVm.sequencerPlayhead = 2;
      panel.addSequencerClip("prompt");
      expect(appVm.sequencer.clips).to.have.lengthOf(1);
      expect(appVm.sequencer.clips[0].type).to.equal("prompt");
      expect(appVm.sequencerStatus).to.include("Added Prompt");
    });

    it("adds prompt, lora, and controlnet clips at the playhead", () => {
      appVm.prompts.pos = "neon alley";
      appVm.prompts.neg = "low quality";
      appVm.loras.common = [{ id: "c1", name: "utility", path: "/loras/u.safetensors", strength: 0.5 }];
      appVm.cn.slots[0].enabled = true;
      appVm.cn.slots[0].weight = 0.8;
      appVm.sequencerPlayhead = 1.5;
      appVm.sequencer.clips = [];

      appVm.addSequencerClip("prompt");
      appVm.addSequencerClip("lora");
      appVm.addSequencerClip("controlnet");

      expect(appVm.sequencer.clips).to.have.lengthOf(3);
      expect(appVm.sequencer.clips.map((c) => c.type).sort().join(",")).to.equal("controlnet,lora,prompt");
      expect(appVm.activeSequencerClipAt(1.5, "prompt").payload.pos).to.equal("neon alley");
    });

    it("applies the active prompt clip when previewing the sequencer", () => {
      appVm.prompts.morphOn = false;
      appVm.sequencer.clips = [{
        id: "p1",
        type: "prompt",
        t: 0,
        endT: 4,
        label: "Prompt 1",
        payload: { pos: "desert ruins", neg: "blur" },
      }];
      appVm.prompts.pos = "before";
      const sent = [];
      appVm.sendControl = (type, payload) => { sent.push({ type, payload }); };
      appVm.applySequencerClipsAt(1);
      expect(appVm.prompts.pos).to.equal("desert ruins");
      expect(sent.some((x) => x.type === "prompt" && x.payload.positive === "desert ruins")).to.be.true;
    });

    it("updates the live job frame counter from playhead and max_frames", () => {
      appVm.deforumSettings.max_frames = 240;
      appVm.deforumSettings.fps = 24;
      appVm.sequencer.fps = 24;
      appVm.sequencer.durationSec = 10;
      appVm.sequencerPlayhead = 2.5;
      appVm.jobPlaybackTimeSec = 0;
      expect(appVm.sequencerJobTotalFrames).to.equal(240);
      expect(appVm.sequencerJobFrameNumber).to.equal(61);
      expect(appVm.sequencerJobFrameLabel).to.equal("Frame 61 / 240");
      appVm.seekSequencerToJobFrame(120);
      expect(appVm.sequencerPlayhead).to.be.closeTo(4.958333, 0.001);
      expect(appVm.sequencerJobFrameNumber).to.equal(120);
    });
  });

  describe("ControlNet Scheduling", () => {
    it("has ControlNet targets in lfoTargets", () => {
      const cnTargets = appVm.lfoTargets.filter(t => t.key.startsWith("cn_"));
      expect(cnTargets.length).to.be.greaterThan(0);
      expect(cnTargets.some(t => t.key === "cn_CN1_weight")).to.be.true;
      expect(cnTargets.some(t => t.key === "cn_CN1_start")).to.be.true;
      expect(cnTargets.some(t => t.key === "cn_CN1_end")).to.be.true;
    });

    it("includes CN params in sequencer options", () => {
      const opts = appVm.sequencerParamOptions;
      const cnOpts = opts.filter(o => o.key.startsWith("cn_"));
      expect(cnOpts.length).to.be.greaterThan(0);
    });

    it("has ControlNet source state", () => {
      expect(appVm.cn.source).to.equal("unknown");
    });
  });

  describe("Motion Style Persistence", () => {
    it("has empty saved styles initially", () => {
      expect(Object.keys(appVm.motionStylesSaved).length).to.equal(0);
    });

    it("can save a motion style", () => {
      // Mock prompt to avoid blocking
      const originalPrompt = global.prompt;
      global.prompt = () => "Test Style";
      
      appVm.saveCurrentMotionStyle();
      
      expect(appVm.motionStylesSaved["Test Style"]).to.exist;
      
      global.prompt = originalPrompt;
    });
  });

  describe("Model Source Indicators", () => {
    it("has LoRA source state", () => {
      expect(appVm.loras.source).to.equal("unknown");
    });

    it("has ControlNet source state", () => {
      expect(appVm.cn.source).to.equal("unknown");
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("has key bindings defined", () => {
      expect(Object.keys(appVm.keyBindings).length).to.be.greaterThan(0);
    });
    
    it("has setupKeyboardShortcuts method", () => {
      expect(typeof appVm.setupKeyboardShortcuts).to.equal("function");
    });
  });
});
