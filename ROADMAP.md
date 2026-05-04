# Defora Roadmap

This document outlines the current status, unfinished features, and planned future development for Defora — an audio-visual instrument for Stable Diffusion.

**Last Updated**: 2026-05-04 | **Version**: 0.2.8+ (in progress)

---

## README ↔ roadmap alignment

### Gap analysis (claims vs tracked work)

Cross-checking [README.md](README.md) with this roadmap surfaced the following **documentation or product gaps** (now tracked in [Phased delivery](#phased-delivery)):

| README / product surface | Issue | Tracking |
|----------------------------|--------|----------|
| **MIDI** described as a separate “tab” | Web MIDI and mappings live under **SETTINGS** (see `docs/WEB_UI_TABS.md`); not a top-level tab | **Done**: README wording + roadmap cross-links |
| **Seven** UI areas (incl. **LORA** tab) vs older “6 tabs” copy | The hosted `index.html` includes a dedicated **LORA** tab; some docs still said six tabs | **Done**: `docs/WEB_UI_TABS.md` updated |
| **TUI LoRA** “integrated in PROMPTS (F2)” | README historically pointed at PROMPTS; **F3 LORA** tab now hosts slots + export | **Done** (mediator push still Forge/UI dependent) |
| **MOTION: Camera curves** (README screenshots) | Sequencer supports per-segment cubic easing; bezier handles & rich curve editor still optional polish | [Animation Sequencer](#animation-sequencer) |
| **Multi-band / “spectral” audio** (marketing language) | Named Hz presets (`bass_mid_high` CLI layout + Web band chips); envelope follower + `--smooth` on curves; **offline spectrogram** + **live `AnalyserNode`** bars (reference `<audio>`) on Web upload | **Done (MVP)** · richer live viz / metering polish optional |
| **Stream stack** (RTMP, HLS, bridge, RabbitMQ) | Implemented; ensure ops docs stay linked from README | Done (monitor `docs/streaming_stack.md`) |
| **`deforumation_dashboard`** | Listed in README; treat as first-class like other CLIs | Done (see [Current Features](#current-features-completed)) |

### Phased delivery

| Phase | Theme | Scope | Status |
|-------|--------|--------|--------|
| **1** | **Connectivity & operator clarity** | Optional `SD_FORGE_POLL_MS` background probe; `/api/status` exposes `pollIntervalMs`; Web UI header **Forge up/down** pill; README + `docs/WEB_UI_TABS.md` alignment (LORA tab, MIDI wording) | **Done** |
| **2** | **Animation sequencer (MVP)** | Timeline schema v1, REST persist (`/api/sequencer`), MOTION tab UI (tracks, keyframes, play/scrub, export); WebSocket `liveParam` playback | **Done** |
| **3** | **TUI / audio depth** | Dedicated **TUI LORA** tab (F3): A/B slots, crossfader, save/load `DEFORA_TUI_LORA_STATE`, export `.preset.json`; **audio**: `--band-layout bass_mid_high`, `--smooth`, `--envelope-*` in `audio_reactive_modulator`; Web MODULATION **freq band quick-picks** | **Done** |
| **4** | **img2img & plugins** | `forge_cli img2img`; Web **PROMPTS** img2img panel + `POST /api/img2img`; `GET /api/plugins` + `PLUGINS_DIR`; `audio_reactive_modulator --post-plugin` (`module:function`); inpainting / richer plugin UI = future polish | **Done (MVP)** |
| **5** | **Inpainting & registry UX** | Optional mask on `POST /api/img2img` + `forge_cli img2img --mask-image` (blur, fill, full-res flags); Web mask file + inpaint controls; **PROMPTS** lists `GET /api/plugins` entries | **Done (MVP)** |
| **6** | **Sequencer easing (MVP)** | Optional `easing` per keyframe segment (`linear` / `easeIn` / `easeOut` / `easeInOut`); MOTION keyframe row control; `validateTimeline` + API docs | **Done** |
| **7** | **Spectral audio overview (MVP)** | After upload: `AudioContext.decodeAudioData` + Hann-window FFT spectrogram (PNG); MODULATION “Spectral overview”, LIVE timeline strip, context strip; roadmap/docs/tests | **Done** |
| **8** | **Live spectral bars (MVP)** | `MediaElementAudioSourceNode` + `AnalyserNode` on `avSyncAudio`; FFT band bars on MODULATION canvas + LIVE strip while reference track plays; dispose on clear/unmount; tests | **Done** |
| **9** | **Sequencer scene markers (MVP)** | Optional `markers[]` on timeline (`t`, `name`); `validateTimeline`; MOTION rail + list, jump + delete, save/load/export; API tests + docs | **Done** |

---

## Table of Contents

1. [README ↔ roadmap alignment](#readme--roadmap-alignment)
2. [Project Status Overview](#project-status-overview)
3. [Current Features (Completed)](#current-features-completed)
4. [Incomplete/In-Progress Features](#incompletein-progress-features)
5. [Planned Features](#planned-features)
6. [Future Enhancements](#future-enhancements)
7. [Long-Term Vision](#long-term-vision)

---

## Project Status Overview

Defora is in **active development** with a strong foundation of core features implemented. The project currently supports:

- ✅ **Core functionality**: Live performance control, prompt morphing, camera motion
- ✅ **Multiple interfaces**: Web UI, TUI, CLI panel
- ✅ **Audio integration**: Audio-reactive modulation, beat sync
- ✅ **Streaming**: HLS, RTMP, SRT support
- ✅ **Docker deployment**: Complete containerized stack
- ⚠️ **Advanced workflow features**: Partially implemented, needs integration work
- 🚧 **Testing**: Comprehensive test suite with some integration tests stubbed

---

## Current Features (Completed)

### 🎹 Performance Interfaces

#### Web UI (Browser-based)
- ✅ Multi-tab interface (LIVE, PROMPTS, LORA, MOTION, MODULATION, CONTROLNET, SETTINGS)
- ✅ **PROMPTS img2img / inpainting**: optional mask + inpaint controls; plugin manifest list
- ✅ **MOTION sequencer**: keyframed `liveParam` tracks, per-segment easing, **scene markers**, save/load via API, export JSON
- ✅ Real-time parameter sliders with WebSocket control
- ✅ HLS video streaming with low latency
- ✅ Beat-synchronized macro system
- ✅ Web MIDI support with CC mapping
- ✅ LoRA browser with crossfader and A/B grouping
- ✅ Motion presets with parameter values
- ✅ Audio waveform visualization (LIVE strip), **upload spectrogram** (FFT overview in MODULATION), and **live spectrum bars** while reference audio plays
- ✅ LFO modulators (Sine, Triangle, Sawtooth, Square, Random)
- ✅ Frame thumbnails and playback stats
- ✅ Session overlay and custom video controls

#### TUI (Terminal-based)
- ✅ Full ncurses interface with 7 tabs (incl. **LORA** on F3)
- ✅ ASCII preview support (when PIL available)
- ✅ Keyboard navigation and parameter control
- ✅ Live parameter adjustment
- ✅ Motion curve editor
- ✅ ControlNet configuration
- ✅ MIDI CC mapping with learn mode

#### CLI Tools
- ✅ `forge_cli` - Model-aware txt2img/img2img/inpaint/Deforum generation
- ✅ `defora_tui` - Full-featured ncurses interface
- ✅ `deforumation_cli_panel` - Lightweight control panel with hotkeys
- ✅ `deforumation_dashboard` - Dashboard mirroring Deforumation GUI
- ✅ `deforumation_runs_cli` - Browse and manage run manifests
- ✅ `deforumation_request_dispatcher` - Execute run requests
- ✅ `monitor_cli` - Frame viewer with live mediator values
- ✅ `stream_helper` - RTMP/SRT/WHIP streaming support
- ✅ `audio_reactive_modulator` - Audio-to-parameter mapping

### 🎨 Core Generation Features

- ✅ **Model Support**: Flux, SDXL, SD 1.5 with auto-detection
- ✅ **Fast Generation**: Lightning/Turbo/Schnell model support (1-4 steps)
- ✅ **Preset System**: Save/load generation presets
- ✅ **ControlNet Integration**: Multiple ControlNet slots
- ✅ **LoRA Support**: Dynamic LoRA loading and blending
- ✅ **Motion Control**: 3D camera motion with translation, rotation, zoom, FOV
- ✅ **Prompt Morphing**: Multi-slot prompt blending with weight control

### 🎵 Audio & Modulation

- ✅ **Audio-Reactive Modulation**: Map audio frequency bands to parameters
- ✅ **Beat Detection**: Automatic BPM detection and manual tap tempo
- ✅ **Beat Macros**: Trigger parameter changes on beat intervals (1/4, 1/8, 1/16)
- ✅ **LFO Modulators**: 5 waveform types with frequency/amplitude control
- ✅ **Audio Upload**: Browser-based audio file upload to web UI
- ✅ **Live Audio Streaming**: Real-time audio-to-parameter streaming

### 🎥 Streaming & Output

- ✅ **HLS Streaming**: Browser-compatible adaptive streaming
- ✅ **RTMP Support**: Stream to platforms (Twitch, YouTube, etc.)
- ✅ **SRT Protocol**: Low-latency streaming
- ✅ **WHIP Support**: WebRTC-based streaming
- ✅ **Encoder Quality Presets**: Low, Medium, High, Ultra quality settings
- ✅ **Frame Seeder**: Test pattern generator (timestamp, colorbars, checkerboard, gradient, text)

### 🏗️ Architecture & Infrastructure

- ✅ **Mediator Bridge**: WebSocket bridge between SD-Forge and control interfaces
- ✅ **RabbitMQ Integration**: Message queue for control events
- ✅ **Docker Stack**: Complete containerized deployment
- ✅ **Health Checks**: Service health monitoring
- ✅ **Volume Management**: Backup/restore/cleanup scripts
- ✅ **Multi-server Support**: Target different SD-Forge instances

### 📚 Documentation

- ✅ **README**: Comprehensive project overview
- ✅ **ARCHITECTURE**: Complete system architecture documentation
- ✅ **API**: REST API and WebSocket protocol documentation
- ✅ **TROUBLESHOOTING**: Common issues and solutions
- ✅ **COMPLETE_SETUP**: Full setup guide
- ✅ **VOLUME_MANAGEMENT**: Docker volume procedures
- ✅ **ENCODER_QUALITY**: Quality preset documentation
- ✅ **FRAME_SEEDER_PATTERNS**: Test pattern documentation
- ✅ **RELEASE_PROCESS**: Automated changelog and releases
- ✅ **Examples**: Batch generation, model comparison, seed exploration

### 🧪 Testing

- ✅ **Python Test Suite**: Unit tests for CLI tools
- ✅ **Web UI Tests**: Smoke tests for all tabs, sliders, MIDI
- ✅ **CI/CD Pipeline**: GitHub Actions for automated testing
- ✅ **Audio Modulator Tests**: Frequency band mapping, LFO generation
- ✅ **API Tests**: Preset management, ControlNet, audio upload

---

## Incomplete/In-Progress Features

### ✅ Runs Management Integration (COMPLETED in v0.2.7)

**Status**: Core functionality complete with full integration and advanced features

**What Works**:
- ✅ Browse run manifests in TUI (`deforumation_runs_cli`)
- ✅ Save re-run/continue requests to JSON files
- ✅ Manual and automatic dispatch via `deforumation_request_dispatcher`
- ✅ Interactive tag/override editing
- ✅ **NEW**: Persistent notes and metadata storage
- ✅ **NEW**: Enhanced dispatch feedback with status indicators
- ✅ **NEW**: 'n' keybinding for editing notes
- ✅ **NEW**: Visual success/failure indicators (✓/✗)
- ✅ **NEW**: Better error messages in TUI
- ✅ **NEW**: Pre-dispatch parameter preview and editing
- ✅ **NEW**: Batch operations mode ([b] to toggle)
  - Multi-select runs with SPACE
  - Batch rerun ([B]) with shared overrides
  - Batch delete ([D]) with confirmation
- ✅ **NEW**: Run comparison view ([v] to compare)
  - Side-by-side comparison of up to 4 runs
  - Compare models, seeds, steps, strength, CFG, tags
  - Easy parameter difference identification

**Remaining Enhancements** (moved to future roadmap):
- Advanced filtering and search
- Export comparison reports
- Visual diff for prompts

### ✅ API Fallback Systems (COMPLETED in v0.2.7)

**Status**: Graceful degradation with intelligent caching

**What Works**:
- ✅ Placeholder ControlNet models when SD-Forge unavailable
- ✅ Placeholder LoRA models for development/demo
- ✅ 2-second timeout with fallback to placeholders
- ✅ Clear logging of API unavailability
- ✅ **NEW**: API status tracking (sdForgeAvailable, lastChecked)
- ✅ **NEW**: Model caching - falls back to cache before placeholders
- ✅ **NEW**: `/api/status` endpoint for availability monitoring
- ✅ **NEW**: `/api/models/refresh` endpoint to clear cache and force refetch
- ✅ **NEW**: Source indicator in responses (sd-forge/cache/placeholder)

**Remaining Enhancements** (low priority):
- ~~Automatic periodic polling for model availability~~ → **Done**: set `SD_FORGE_POLL_MS` (e.g. `30000`) on the web stack to probe SD-Forge on an interval; `/api/status` reports `pollIntervalMs`; Web UI shows Forge status in the header.
- Visual indicator in UI for **model list source** (sd-forge vs cache vs placeholder) on CN/LoRA pickers
- Better error messages in browser console

### ✅ Test Coverage (COMPLETED in v0.2.7)

**Status**: Comprehensive test coverage with integration and performance tests

**What Works**:
- ✅ Unit tests for all CLI tools
- ✅ Web UI smoke tests (tabs, controls, MIDI)
- ✅ API endpoint tests
- ✅ Audio modulator tests with numpy/scipy/librosa
- ✅ **NEW**: End-to-end Docker stack integration tests
- ✅ **NEW**: Service startup/teardown tests
- ✅ **NEW**: Health check and API endpoint tests
- ✅ **NEW**: End-to-end workflow tests with generation simulation
  - Complete generation workflows (request → generation → manifest)
  - Rerun and continue workflows
  - Failed generation handling
  - Metadata persistence workflows
  - Workflow chaining tests
- ✅ **NEW**: Performance and load testing
  - Manifest loading performance (single and bulk)
  - Concurrent access testing
  - Schema validation performance
  - Memory usage testing
  - CLI tool startup time
  - Rapid parameter update handling
- ✅ **NEW**: Mediator WebSocket integration tests
  - Protocol compliance testing
  - Message format validation
  - Read/write operation testing
  - Response unpacking
  - Parameter type handling
  - Connection URI format validation

**Remaining Enhancements** (low priority):
- Integration tests with real SD-Forge generation
- Extended load testing with WebSocket stress tests
- Cross-platform compatibility testing

**Next Steps**:
1. Add tests with actual SD-Forge GPU generation (requires GPU)
2. Implement automated performance regression testing
3. Add cross-browser testing for Web UI

---

## Planned Features

### 🎯 Short-Term (Next 1-3 Months)

#### ✅ Improved Model Management (COMPLETED in v0.2.8)

**Status**: Core functionality complete with API integration

**What Works**:
- ✅ **NEW**: SD model listing (`/api/sd-models`)
  - Fetches models from SD-Forge API
  - Intelligent caching with 5-minute expiration
  - Fallback to placeholder models when API unavailable
  - Model metadata extraction (type, recommended settings)
- ✅ **NEW**: Current model detection (`/api/sd-models/current`)
  - Get currently loaded model
  - Cache support for offline operation
- ✅ **NEW**: Model switching (`/api/sd-models/switch`)
  - POST endpoint to switch models
  - 30-second timeout for model loading
  - Error handling and status feedback
- ✅ **NEW**: Model metadata display
  - Auto-detect model type (SDXL, SD 1.5, Flux, SD 2.1, SD 3)
  - Recommended steps, sampler, and resolution per model type
  - Metadata enrichment for better UX
- ✅ **NEW**: Enhanced refresh endpoint
  - Clears all model caches (SD models, ControlNet, LoRA)
  - Forces re-fetch from API

**Remaining Enhancements** (moved to medium-term):
- Automatic model switching based on prompt analysis
- Model download integration
- Advanced LoRA preset management UI

#### Advanced Audio Features
- **Priority**: Medium
- **Description**: Expand audio-reactive capabilities
- **Features**:
  - Multi-band audio mapping (bass, mids, highs)
  - Audio envelope followers
  - **Spectral visualization**: ✅ offline FFT spectrogram after Web upload (Phase 7); ✅ live `AnalyserNode` band bars on reference playback (Phase 8)
  - MIDI clock sync for external sequencers
  - Audio recording from system audio

#### ✅ Performance Optimizations (COMPLETED in v0.2.10)

**Status**: Core optimizations implemented with configurable settings

**What Works**:
- ✅ **NEW**: WebSocket message batching (`/api/performance/settings`)
  - Configurable batch interval (default: 50ms)
  - Max batch size control (default: 10 messages)
  - Automatic flush on size/timeout
  - Enable/disable batching per deployment
- ✅ **NEW**: HLS segment caching (`/api/performance/hls/*`)
  - In-memory segment cache with TTL (default: 30s)
  - Configurable max cache size (default: 50 segments)
  - Cache stats endpoint for monitoring
  - Manual cache clear endpoint
  - Automatic expiration cleanup
- ✅ **NEW**: Batch frame generation optimization (`/api/performance/batch-generate`)
  - Queue multiple generation requests
  - Configurable max batch size (default: 4)
  - Batch status tracking
  - Position-in-queue information
- ✅ **NEW**: Performance metrics endpoint (`/api/performance/metrics`)
  - Real-time monitoring of all optimizations
  - Pending message counts
  - Cache statistics
  - Queue depth tracking
- ✅ **NEW**: Dynamic configuration (`POST /api/performance/settings`)
  - Runtime adjustment of all settings
  - No server restart required
  - Validation of configuration values

**Remaining Enhancements** (moved to long-term):
- Frame interpolation for smoother output
- GPU memory optimization
- Advanced queue scheduling algorithms

### 🎯 Medium-Term (3-6 Months)

#### Animation Sequencer
- **Priority**: High
- **MVP (Phases 2 + 6 + 9)**: ✅ Keyframed tracks with optional per-segment cubic easing (`linear` / `easeIn` / `easeOut` / `easeInOut`), **scene markers** (`markers[]`), server persistence (`GET/POST/DELETE /api/sequencer`), MOTION tab playback → mediator via `liveParam`, JSON export — see `docs/API.md` / `SEQUENCER_DIR`.
- **Remaining (polish)**:
  - Visual multi-track timeline strip (waveform-style lanes)
  - Custom bezier handles between keys
  - Marker-driven transitions (actions beyond jump/playhead) — optional
  - Optional sync to audio BPM or frame counter from HLS

#### ✅ Advanced Prompt System (COMPLETED in v0.2.9)

**Status**: Core functionality complete with API integration

**What Works**:
- ✅ **NEW**: Prompt template library (`/api/prompts/templates`)
  - Pre-built templates with categories (photography, anime, landscape)
  - Template search by category, tag, or query
  - Create custom templates via POST endpoint
  - Template variables for flexible prompts
- ✅ **NEW**: Wildcard support (`/api/prompts/wildcards`)
  - Random selection from predefined lists
  - Categories: subject, lighting, character_type, art_style, time_of_day, terrain_type, weather
  - Get all wildcards or specific category
- ✅ **NEW**: Prompt processing (`/api/prompts/process`)
  - Variable replacement in templates
  - Automatic wildcard substitution
  - Returns original and processed prompts
- ✅ **NEW**: Negative prompt presets (`/api/prompts/negative-presets`)
  - Pre-configured quality, anatomy, and style presets
  - Combine multiple presets endpoint
  - Quality levels: basic, strict, anatomy fix, avoid realism
- ✅ **NEW**: Template variable system
  - Extract and replace variables in prompts
  - Support for multiple variables per template
  - Validation and error handling

**Remaining Enhancements** (moved to long-term):
- Prompt strength scheduling over time
- Advanced prompt weighting syntax
- Integration with SD-Forge attention syntax

#### Advanced ControlNet & live input
- **Priority**: Medium
- **Description**: Richer ControlNet inputs and routing (distinct from short-term “Advanced Audio Features”)
- **Features**:
  - Multiple ControlNet preprocessing
  - Live camera/video input for ControlNet
  - Webcam integration
  - Screen capture as ControlNet source
  - ControlNet weight scheduling

#### Collaborative Features
- **Priority**: Low
- **Description**: Multi-user support
- **Features**:
  - Multiple simultaneous web UI clients
  - Parameter locking (prevent conflicts)
  - User presence indicators
  - Shared presets and settings
  - Session recording and replay

### 🎯 Long-Term (6-12 Months)

#### img2img and Inpainting
- **Priority**: High
- **Description**: Support for image-to-image workflows
- **Features**:
  - Upload reference images
  - Inpainting mask editor
  - img2img strength control
  - Batch img2img processing
  - Image variations generator

#### Plugin System
- **Priority**: Medium
- **Description**: Extensible architecture for community plugins
- **Features**:
  - Plugin API for custom modulators
  - Custom parameter mappings
  - Third-party integration hooks
  - Plugin marketplace/repository
  - Plugin sandboxing for security

#### Advanced Streaming
- **Priority**: Medium
- **Description**: Professional streaming features
- **Features**:
  - Multi-bitrate adaptive streaming
  - WebRTC support for ultra-low latency
  - Stream overlays and transitions
  - Multi-camera switching
  - Recording while streaming

#### Mobile Support
- **Priority**: Low
- **Description**: Mobile-friendly interfaces
- **Features**:
  - Responsive web UI for tablets
  - Touch-optimized controls
  - Mobile app (iOS/Android)
  - Gyroscope/accelerometer control
  - Location-based parameter modulation

---

## Future Enhancements

### 🔮 Experimental Features (12+ Months)

#### AI-Assisted Workflows
- **Description**: Use AI to help with creative decisions
- **Features**:
  - Prompt suggestions based on current output
  - Automatic parameter tuning for desired aesthetic
  - Style transfer recommendations
  - Anomaly detection (bad frames)
  - Smart preset generation

#### VR/AR Integration
- **Description**: Immersive performance interfaces
- **Features**:
  - VR control room
  - 3D parameter manipulation
  - Spatial audio integration
  - Hand tracking controls
  - AR overlay on real-world objects

#### ✅ Distributed Generation (COMPLETED in v0.2.11)

**Status**: Multi-node load balancing implemented with full API for **SD-Forge + Deforumation**

> **Important**: Uses SD-Forge with Deforumation-patched Deforum for **live video generation**, not ComfyUI (which is batch-oriented, not real-time).

**What Works**:
- ✅ **NEW**: Load balancing across multiple SD-Forge nodes
  - 4 strategies: round_robin, least_busy, priority, random
  - Automatic node selection based on health and workload
  - Preferred node support for specific requirements
  - Example: 3 SD-Forge instances (2x RTX 4090, 1x RTX 3090)
- ✅ **NEW**: Health checking system (`/api/distributed/health-check`)
  - Periodic automatic health checks (configurable interval)
  - Node status tracking (healthy/unhealthy/disabled/unknown)
  - Response time monitoring
  - Manual health check endpoint
  - SD-Forge `/docs` endpoint validation
- ✅ **NEW**: Job management (`/api/distributed/generate`, `/api/distributed/jobs/:id`)
  - Deforum job submission with node assignment
  - Status tracking (queued → processing → completed)
  - Wait time estimation
  - Priority levels (high/normal/low)
- ✅ **NEW**: Node management (`/api/distributed/nodes/*`)
  - Disable/enable nodes dynamically
  - Remove nodes from pool
  - Per-node metrics tracking
- ✅ **NEW**: Distributed metrics (`/api/distributed/metrics`)
  - Per-node: active jobs, total jobs, success rate, response time
  - Pool-wide: total jobs, healthy nodes, strategy
  - Real-time monitoring
- ✅ **NEW**: Configuration API (`/api/distributed/configure`, `/api/distributed/status`)
  - Dynamic pool configuration
  - Environment variable support
  - Runtime strategy changes
- ✅ **NEW**: Example: 3 SD-Forge instances on local network
  - Comprehensive documentation (docs/DISTRIBUTED_GENERATION.md)
  - Setup instructions for multi-node SD-Forge deployment
  - Network architecture diagrams
  - Troubleshooting guide
- ✅ **NEW**: Turbo model Docker stack (docker-compose.turbo.yml)
  - Pre-loaded SD-Turbo and SDXL-Turbo models
  - Optimized for real-time/live generation (1-4 steps)
  - Complete turbo documentation (docs/TURBO_STACK.md)
  - Performance benchmarks and tuning guide

**Example Setup** (3 SD-Forge nodes):
```bash
# Configure pool
curl -X POST http://localhost:3000/api/distributed/configure \
  -d '{
    "enabled": true,
    "strategy": "round_robin",
    "nodes": [
      {"url": "http://192.168.1.10:7860", "name": "GPU-RTX4090-1"},
      {"url": "http://192.168.1.11:7860", "name": "GPU-RTX4090-2"},
      {"url": "http://192.168.1.12:7860", "name": "GPU-RTX3090"}
    ]
  }'
```

**Remaining Enhancements** (moved to long-term):
- Cloud GPU integration (RunPod, Vast.ai)
- Frame interpolation across machines
- Cost optimization algorithms
- Render farm support

#### Advanced Synchronization
- **Description**: Sync with external systems
- **Features**:
  - DMX lighting control integration
  - OSC (Open Sound Control) support
  - Ableton Link sync
  - Timecode (LTC/MTC) sync
  - Show control systems integration

---

## Long-Term Vision

### Project Goals

**Mission**: Make AI video generation accessible and performable in real-time, turning Stable Diffusion into a true audio-visual instrument for artists, VJs, and performers.

### Target Use Cases

1. **Live Performance**
   - VJ sets at clubs and festivals
   - Live streaming performances
   - Interactive art installations
   - Music visualization

2. **Content Creation**
   - Music video production
   - Social media content
   - Experimental film
   - Generative art projects

3. **Creative Exploration**
   - Rapid prototyping of visual ideas
   - Style experimentation
   - Model testing and comparison
   - Parameter exploration

4. **Education**
   - Teaching AI art concepts
   - Demonstrating prompt engineering
   - Workshops and tutorials
   - Research and development

### Success Metrics

- **Performance**: Sub-second parameter-to-frame latency
- **Accessibility**: One-command setup for new users
- **Reliability**: 99%+ uptime for 8-hour performances
- **Community**: Active plugin ecosystem
- **Compatibility**: Support for all major SD models and extensions

---

## Contributing to the Roadmap

We welcome feedback and contributions! Here's how you can help:

### Vote on Features
- Star issues labeled `enhancement` that you want
- Comment on roadmap discussions with use cases
- Join Discord/forum discussions (when available)

### Suggest Features
- Open an issue with the `feature-request` label
- Describe your use case and desired workflow
- Provide examples or mockups if possible
- Tag with priority suggestion (low/medium/high)

### Implement Features
- Check issues labeled `good first issue` or `help wanted`
- Comment on issues you'd like to work on
- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Submit PRs with tests and documentation

### Report Bugs
- Check if bug is already in the roadmap as "known issue"
- Open issue with steps to reproduce
- Include environment details (OS, GPU, versions)
- Tag with severity (critical/major/minor)

---

## Versioning and Releases

Defora follows [Semantic Versioning](https://semver.org/):

- **Major** (1.0, 2.0): Breaking changes, major features
- **Minor** (0.x.0): New features, backwards compatible
- **Patch** (0.0.x): Bug fixes, small improvements

### Release Schedule

- **Patch releases**: As needed for critical bugs
- **Minor releases**: Monthly (when features are ready)
- **Major releases**: When feature-complete milestones are reached

### Version History

- **0.1.0** (Initial): Basic CLI, web UI skeleton, docker stack
- **0.2.x** (Current track): Full web UI (incl. LORA tab), TUI, audio modulation, streaming, runs tooling, distributed generation, performance APIs
- **0.3.0** (Q2 2026): Sequencer MVP + docs parity (README / WEB_UI_TABS); polish runs filters/export
- **0.4.0** (Q3 2026): Deeper sequencer (curves, markers), img2img groundwork
- **0.5.0** (Q4 2026): img2img & inpainting UX, plugin hooks
- **1.0.0** (Q1 2027): Production-ready release

---

## Deprecation Policy

When features are deprecated:

1. **Announcement**: Feature marked deprecated in release notes
2. **Grace Period**: Minimum 2 minor versions before removal
3. **Migration Guide**: Documentation for transitioning to replacement
4. **Warnings**: CLI/UI warnings when using deprecated features

---

## Getting Help

- **Documentation**: Check [docs/](docs/) for detailed guides
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Join GitHub Discussions for Q&A
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## License

This roadmap and the Defora project are open source. See [LICENSE](LICENSE) for details.

---

**Last Updated**: 2026-05-04 | **Maintained by**: [@janiluuk](https://github.com/janiluuk)
