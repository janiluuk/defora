const { readFileSync } = require("fs");
const path = require("path");
const { expect } = require("chai");
const vm = require("vm");
const { describe, it, before } = require("node:test");

function loadAppDefinition() {
  // Load from the extracted app-definition.js instead of parsing HTML
  const appDefPath = path.join(__dirname, "..", "src", "app-definition.js");
  const appDef = require(appDefPath);
  
  const mockVideoElement = {
    paused: true,
    currentTime: 0,
    play: () => Promise.resolve(),
    pause: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  return { appDef, videoElement: mockVideoElement };
}

function instantiate(appDef, overrides = {}) {
  const data = appDef.data();
  const instance = { ...data, ...overrides };
  Object.entries(appDef.methods).forEach(([k, fn]) => {
    instance[k] = fn.bind(instance);
  });
  if (appDef.computed) {
    Object.entries(appDef.computed).forEach(([k, def]) => {
      if (typeof def === "function") {
        Object.defineProperty(instance, k, { get: def.bind(instance) });
        return;
      }
      if (def && typeof def.get === "function") {
        const desc = { enumerable: true, configurable: true, get: def.get.bind(instance) };
        if (typeof def.set === "function") desc.set = def.set.bind(instance);
        Object.defineProperty(instance, k, desc);
      }
    });
  }
  // Avoid background frame/run polls that keep the Node test runner alive.
  instance.scheduleFrameRefresh = () => {};
  instance.syncRunsMonitorPolling = () => {};
  instance.$nextTick = (fn) => Promise.resolve().then(fn);
  return instance;
}

describe("Video Controls E2E Tests", () => {
  let appDef;
  let videoElement;

  before(() => {
    const loaded = loadAppDefinition();
    appDef = loaded.appDef;
    videoElement = loaded.videoElement;
  });

  describe("Play/Pause Controls", () => {
    it("should start in paused state", () => {
      const app = instantiate(appDef);
      expect(app.isPlaying).to.equal(false);
    });

    it("should toggle play state when togglePlayPause is called", async () => {
      const app = instantiate(appDef);
      const mockVideo = {
        paused: true,
        play: () => Promise.resolve(),
        pause: () => {},
      };
      app.playerEl = mockVideo;
      
      // Initially paused, should play
      await app.togglePlayPause();
      expect(app.isPlaying).to.equal(true);
      
      // Now set as playing, should pause
      mockVideo.paused = false;
      app.togglePlayPause();
      expect(app.isPlaying).to.equal(false);
    });

    it("should reset to beginning when stopVideo is called", () => {
      const app = instantiate(appDef);
      const mockVideo = {
        pause: () => {},
        currentTime: 10,
      };
      app.playerEl = mockVideo;
      
      app.stopVideo();
      expect(mockVideo.currentTime).to.equal(0);
      expect(app.isPlaying).to.equal(false);
    });
  });

  describe("Record Controls", () => {
    it("should start in not recording state", () => {
      const app = instantiate(appDef);
      expect(app.isRecording).to.equal(false);
      expect(app.streamUrl).to.equal("");
    });

    it("should start recording when toggleRecord is called", async () => {
      const app = instantiate(appDef);
      const origFetch = global.fetch;
      global.fetch = async (url, opts) => ({
        ok: true,
        json: async () => ({ success: true, output: "/tmp/defora_rec_test.mp4" }),
      });
      try {
        await app.toggleRecord();
        expect(app.isRecording).to.equal(true);
        expect(app.performance.status).to.include("Recording");
      } finally {
        global.fetch = origFetch;
      }
    });

    it("should stop recording when toggleRecord is called again", async () => {
      const app = instantiate(appDef);
      const origFetch = global.fetch;
      global.fetch = async (url) => ({
        ok: true,
        json: async () => ({
          success: true,
          output: String(url).includes("stop") ? null : "/tmp/defora_rec_test.mp4",
        }),
      });
      try {
        await app.toggleRecord();
        expect(app.isRecording).to.equal(true);
        await app.toggleRecord();
        expect(app.isRecording).to.equal(false);
        expect(app.performance.status).to.include("stopped");
      } finally {
        global.fetch = origFetch;
      }
    });

    it("should set recording status when recording starts", async () => {
      const app = instantiate(appDef);
      const origFetch = global.fetch;
      global.fetch = async () => ({
        ok: true,
        json: async () => ({ success: true, output: "/tmp/defora_rec_test.mp4" }),
      });
      try {
        await app.toggleRecord();
        expect(app.performance.status).to.include("/tmp/defora_rec");
      } finally {
        global.fetch = origFetch;
      }
    });
  });

  describe("Video Player Integration", () => {
    it("should have custom controls in the HTML", () => {
      const html = readFileSync(path.join(__dirname, "test-app.html"), "utf-8");
      
      expect(html).to.include('class="video-controls"');
      expect(html).to.include('class="control-btn"');
      expect(html).to.include('@click="togglePlayPause"');
      expect(html).to.include('@click="toggleRecord"');
    });

    it("should hide native video controls", () => {
      const css = readFileSync(path.join(__dirname, "..", "src", "style.css"), "utf-8");
      
      expect(css).to.include('video::-webkit-media-controls { display: none !important; }');
    });

    it("should render a single frame rail under the preview", () => {
      const html = readFileSync(path.join(__dirname, "test-app.html"), "utf-8");
      
      expect(html).to.include('class="frame-rail"');
      expect(html).to.include('class="frame-rail__list"');
      expect(html).to.include('@click="stepFrameSelection(-1)"');
      expect(html).to.include('@click="stepFrameSelection(1)"');
      expect(html).to.include('@input="selectFrame(Number($event.target.value))"');
    });

    it("should display stream link when recording", () => {
      const html = readFileSync(path.join(__dirname, "test-app.html"), "utf-8");
      
      expect(html).to.include('class="stream-link"');
      expect(html).to.include('/hls/live/deforum.m3u8');
    });
    
    it("should remove the duplicate preview bar", () => {
      const html = readFileSync(path.join(__dirname, "test-app.html"), "utf-8");
      
      expect(html).to.not.include('class="preview-bar-container"');
      expect(html).to.not.include('class="preview-bar-toggle"');
    });
  });

  describe("FrameSync Styling", () => {
    it("should use FrameSync colors for video controls", () => {
      const css = readFileSync(path.join(__dirname, "..", "src", "style.css"), "utf-8");
      
      expect(css).to.include('.control-btn');
      expect(css).to.include('--warn: #ef9f27');
      expect(css).to.include('.control-btn:hover');
      expect(css).to.include('var(--warn)');
    });

    it("should have recording animation", () => {
      const css = readFileSync(path.join(__dirname, "..", "src", "style.css"), "utf-8");
      
      expect(css).to.include('.control-btn.recording');
      expect(css).to.include('@keyframes pulse');
    });
    
    it("should have green state for playing", () => {
      const css = readFileSync(path.join(__dirname, "..", "src", "style.css"), "utf-8");
      
      expect(css).to.include('.control-btn.playing');
      expect(css).to.include('#5af2a9');
    });
  });
});
