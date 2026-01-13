# Changelog

All notable changes to this project will be documented in this file.

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
