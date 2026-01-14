# Changelog

All notable changes to this project will be documented in this file.


## [0.2.1] - 2026-01-14

## What's Changed

- Add comprehensive API documentation and troubleshooting guide (7883b95)
- Initial plan (b597631)

**Full Changelog**: https://github.com/janiluuk/defora/compare/v0.2.0...v0.2.1


## [0.2.0] - 2026-01-14

## What's Changed

- fix: safely handle package-lock.json in version commit (9f6a30e)
- feat: improve automated release workflow with better safeguards (23eae5f)
- Initial plan (a3046db)
- Address PR review comments: spelling, security, tests (81a86b5)
- Initial plan (717fb62)
- Fix failing tests: update UI tests for unified MODULATION tab (c7fec84)
- Add automated release workflow with changelog generation (3fd7985)
- Update documentation for unified MODULATION tab (10ff1da)
- Combine AUDIO, MOD, and FEATURES into unified MODULATION tab with FrameSync styling (81ab830)
- Fix code review feedback: improve Cosine SVG and replace deprecated substr() (915fb9f)
- Address PR review comments: improve security, add documentation, enhance tests (03d6a13)
- Add screenshots for all 8 UI tabs (5e65bb4)
- Initial plan (fa8b2f4)
- Address code review feedback and cleanup (99c1a48)
- Add encoder quality presets and frame seeder patterns (4c1d690)
- Add volume management documentation and scripts (daa84ad)
- Add comprehensive web API tests (8e278e1)
- Add librosa dependency and enable audio tests (f05194e)
- Initial plan (8551ebc)
- Streamline modulation UI layout (9d8cf8f)
- Enable real audio uploads and update tests (15085ae)
- Refine audio modulation controls (d27c145)
- Refine audio modulation controls (0b3ebff)
- Refine audio modulation controls (7797eb8)
- Rework FrameSync features layout (1069300)
- Rework FrameSync features layout (9554829)
- Clarify that models must be downloaded manually, not from Forge UI (08b5520)
- Refine setup script with better image checking and clearer error handling (bd3223a)
- Improve setup script efficiency and add clarifying comments (38d2264)
- Add automated setup script for SD-Forge first-time configuration (6cc80fd)
- Improve health check reliability and add security documentation (ccf7a77)
- Remove redundant COMMANDLINE_ARGS and clarify custom flag documentation (cd9ff3c)
- Add documentation for SD-Forge docker configuration and update features status (81b89f5)
- Add proper SD-Forge startup configuration with GPU support and extensions (0bafa63)
- Initial plan (9faf4a0)
- Remove pycache files from git tracking (d9f2189)
- Changes before error encountered (6f7c233)
- Changes before error encountered (19730e7)
- Initial plan (d3066f7)
- Implement Docker health checks for all services (Phase 4.2) (e0c13a9)
- Implement MIDI mapping persistence with localStorage (1fab980)
- Implement motion presets with parameter values and tests (bde6ad3)
- Add docker/web README documenting npm install requirement (9c1b82d)
- Remove node_modules from git tracking - should be installed via npm (0513845)
- Refactor time helper and clarify 1/8 note limitation (07907d6)
- Fix 1/8 note trigger logic in beat sync (9a4e069)
- Implement beat sync feature with visual feedback (af00c41)
- Add clarifying comment for translation scaling (2d57fe6)
- Fix touch event handling and improve code clarity (1e9a0a7)
- Add node_modules to .gitignore and remove from tracking (bf270f1)
- Implement XY pad interaction and prompt sending in web UI (454a36a)
- Add numpy and scipy dependencies, enable audio modulator tests (9961764)
- Initial plan (812b9d7)
- Add comprehensive architecture documentation (c3fa18e)
- Address code review feedback - improve error handling and efficiency (8a7d4ce)
- Add setup verification and complete documentation (50a72db)
- Add deforumation submodule and frame-seeder component (76796e9)
- Initial plan (859ee65)
- Add ASCII preview (e338560)
- Update tests (47595b5)
- Fix tests (b8dfe66)
- Add more examples (46ca2a8)
- Update for LFO editor (a8477e1)
- Fixes (42f24ef)
- Add mediator (30c332e)
- Improve streaming stack (e04ef39)
- Update README.md (8824af9)
- Update README.md (e45986f)
- Fix tests (6a548ca)
- Update docker compoe stack and dashboard (95decfe)
- Add tests (bca57e3)
-   - Added full-screen Defora TUI layout (sd_cli/defora_tui.py + ./defora_tui)     matching the multi-tab mockups.   - Rebuilt the web UI with the new layout (video left, control rack right,     context bottom), including LIVE/PROMPTS/MOTION/AUDIO/BEATS/CN/SETTINGS and     WebMIDI tab.   - Added comprehensive web UI smoke tests (tabs, sliders/presets, morph table,     macro rack, MIDI mappings).   - CI runs Python tests and web UI tests on push/PR (.github/workflows/ci.yml).   - README updated with branding, logo, TUI entrypoint, and env notes; logo     added under assets/defora_logo.svg. (523c681)
- Add initial build (bd8da0e)
- Add reference (34cee03)
- Clarify working directory requirements for example scripts (6a31512)
- Refine example scripts: add configurability and clearer documentation (1f3c0db)
- Fix code review issues: clean up requirements.txt and unused code (239a06b)
- Add comprehensive documentation and examples (4a71312)
- Initial plan (197e532)
- Use round() instead of int() for duration-to-frames calculation (5d009fd)
- Add .gitignore to exclude build artifacts and __pycache__ (1a77b56)
- Add --duration parameter for Deforum animations (6e6d2ad)
- Initial plan (3f0f8e9)
- first commit (f6b1293)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated release workflow with changelog generation
- Comprehensive web API test suite (preset management, ControlNet, audio upload)
- Volume management scripts (backup, restore, cleanup, monitoring)
- Encoder quality presets (low, medium, high, ultra)
- Frame seeder patterns (timestamp, colorbars, checkerboard, gradient, text)
- Unified MODULATION tab with FrameSync styling
- Visual icons and emoji for improved UX
- librosa dependency for audio reactive modulation

### Changed
- Combined AUDIO/BEATS, MODULATION, and FEATURES tabs into unified MODULATION tab
- Reduced UI from 8 tabs to 6 tabs
- Applied FrameSync dark blue/orange theme to modulation interface
- Improved visual language with waveform icons (〰 △ ⟋ ▭ ◈)

### Fixed
- Enabled previously skipped audio reactive modulator tests
- Security improvements in preset management and file uploads

### Documentation
- WEB_UI_TABS.md - Complete UI tab documentation
- VOLUME_MANAGEMENT.md - Docker volume backup/restore procedures
- ENCODER_QUALITY.md - Quality preset documentation
- FRAME_SEEDER_PATTERNS.md - Test pattern documentation

## [0.1.0] - Initial Release

### Added
- Initial Defora project structure
- Web UI with LIVE, PROMPTS, MOTION, AUDIO/BEATS, MODULATION, FEATURES, CN, SETTINGS tabs
- Docker-based architecture
- Real-time parameter control via WebSocket
- MIDI mapping support
- Audio-reactive modulation
- LFO modulators
- Beat macros
- ControlNet integration
- Frame generation pipeline
- HLS streaming support
