const { readFileSync } = require("fs");
const path = require("path");
const { expect } = require("chai");
const vm = require("vm");
const { describe, it, before } = require("node:test");

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
  
  let videoElement = null;
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
    location: { protocol: "http:", host: "localhost", origin: "http://localhost" },
    document: { 
      getElementById: (id) => {
        if (id === "player") {
          if (!videoElement) {
            videoElement = {
              canPlayType: () => "",
              currentTime: 0,
              paused: true,
              play: () => Promise.resolve(),
              pause: () => { videoElement.paused = true; },
              addEventListener: () => {},
              removeEventListener: () => {},
            };
          }
          return videoElement;
        }
        return null;
      }
    },
    fetch: (...args) => (global.fetch ? global.fetch(...args) : Promise.reject(new Error("fetch not available"))),
    FileReader: global.FileReader,
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout: () => 0,
    Date: Date,
    console,
    window: { location: { origin: "http://localhost" } },
  };

  vm.runInNewContext(scriptContent, context);
  return { appDef: captured, videoElement };
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
      let controlSent = null;
      app.sendControl = (cmd, payload) => {
        controlSent = { cmd, payload };
      };
      
      await app.toggleRecord();
      
      expect(app.isRecording).to.equal(true);
      expect(app.streamUrl).to.include("/stream/stream_");
      expect(controlSent).to.deep.equal({ cmd: "record", payload: { action: "start" } });
    });

    it("should stop recording when toggleRecord is called again", async () => {
      const app = instantiate(appDef);
      let controlsSent = [];
      app.sendControl = (cmd, payload) => {
        controlsSent.push({ cmd, payload });
      };
      
      // Start recording
      await app.toggleRecord();
      expect(app.isRecording).to.equal(true);
      
      // Stop recording
      await app.toggleRecord();
      expect(app.isRecording).to.equal(false);
      expect(controlsSent[1]).to.deep.equal({ cmd: "record", payload: { action: "stop" } });
    });

    it("should generate a stream URL when recording starts", async () => {
      const app = instantiate(appDef);
      app.sendControl = () => {};
      
      await app.toggleRecord();
      
      expect(app.streamUrl).to.be.a("string");
      expect(app.streamUrl).to.match(/^http:\/\/localhost\/stream\/stream_\d+_[a-z0-9]+$/);
    });
  });

  describe("Video Player Integration", () => {
    it("should have custom controls in the HTML", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('class="video-controls"');
      expect(html).to.include('class="control-btn"');
      expect(html).to.include('@click="togglePlayPause"');
      expect(html).to.include('@click="stopVideo"');
      expect(html).to.include('@click="toggleRecord"');
    });

    it("should hide native video controls", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('video::-webkit-media-controls { display: none !important; }');
      expect(html).not.to.include('<video id="player" controls');
    });

    it("should have placeholder SVG for thumbnails", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('thumb-placeholder');
      expect(html).to.include('viewBox="0 0 24 24"');
      expect(html).to.include('stroke="#ff8a1a"');
    });

    it("should display stream link when recording", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('class="stream-link"');
      expect(html).to.include('v-if="streamUrl"');
      expect(html).to.include(':href="streamUrl"');
    });
    
    it("should have preview bar with hide/show toggle", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('class="preview-bar-container"');
      expect(html).to.include('class="preview-bar-toggle"');
      expect(html).to.include('@click="previewBarCollapsed = !previewBarCollapsed"');
    });
  });

  describe("FrameSync Styling", () => {
    it("should use FrameSync colors for video controls", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('.control-btn');
      expect(html).to.include('background: #0b1f34');
      expect(html).to.include('border-color: #ff8a1a');
    });

    it("should have recording animation", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('.control-btn.recording');
      expect(html).to.include('@keyframes pulse');
    });
    
    it("should have green state for playing", () => {
      const html = readFileSync(path.join(__dirname, "..", "public", "index.html"), "utf-8");
      
      expect(html).to.include('.control-btn.playing');
      expect(html).to.include('#5af2a9');
    });
  });
});
