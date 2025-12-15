# UI Overview (TUI and Web)

This repo ships two main operator interfaces alongside the Qt app:

- **Defora TUI** (`./defora_tui`): ncurses “instrument” with multi-tab layout (LIVE, PROMPTS, MOTION, AUDIO/BEATS, CONTROLNET, SETTINGS). Best in a large terminal.
- **Web UI** (`docker/web/public/index.html` served by the compose stack): browser-based controller with HLS preview, thumbnails, live sliders, prompts, audio/LFO/band controls.

## Defora TUI (ncurses)
- **LIVE (F1)**: core sliders (CFG/strength/noise/cadence/zoom/pan/tilt/fov), ASCII frame preview, frame timeline. Mediator writes enable deforumation flags automatically.
- **PROMPTS (F2)**: prompt/morph layout mirroring Deforumation; mostly visual, but prompt values can be sent via mediator once wired.
- **MOTION (F3)**: camera sliders/presets and curve mock-up; displays active LFO slots; mediator writes enabled for motion params.
- **AUDIO/BEATS (F4)**: waveform/tempo mock, macro rack mock, live LFO list, and band mappings. Keys: `b` cycle band, `[`/`]` shift low/high Hz, `;`/`'` adjust intensity, `L` tick LFOs. LFOs and bands send `liveParam` via mediator flags.
- **CONTROLNET (F5)**: placeholder panel for CN slots/settings (visual only).
- **SETTINGS (F6)**: engine/outputs/midi layout (visual); mediator writes not hooked yet.

## Web UI (browser)
- **Preview**: HLS player (live stream), overlay HUD (time/seed), timeline thumbnails (from `/api/frames`), waveform strip with beat markers (from `/api/audio/peaks` + `/api/audio/beats`).
- **LIVE tab**: vibe/camera sliders mapped to mediator, source chips (Manual/Beat/MIDI), motion preset chips (UI-only today).
- **PROMPTS tab**: Positive A/B textareas, negative textarea, crossfade slider (sends `prompt_mix` and prompts), morph enable flag.
- **MOTION tab**: camera pad and sliders, motion style chips (UI-only today).
- **AUDIO/BEATS tab**:
  - Track/BPM + “Load analysis” to fetch peaks/beats.
  - Four **band cards**: set low/high Hz, intensity, target param; click **Preview** to hear bandpass-filtered audio (Web Audio). Range bar visualizes band window. Bands are sent to `/api/audio-map` for live mediator streaming.
  - **Audio mappings**: fine-grained freq→param ranges (optional, overrides bands).
  - **Macro lanes** (simple LFO-style) and **LFOs** (shape/depth/base/BPM, target param); scheduler sends `liveParam` with deforumation flags.
- **CONTROLNET / SETTINGS tabs**: visual stubs; extend to mediator as needed.

## Control path
- Browser WebSocket `/ws` → RabbitMQ `controls` queue → `defora_cli.control_bridge` → mediator. Payloads validated via shared mapping (enables `should_use_deforumation_*` flags).
- `/api/mediator/state` bootstraps slider/prompt mix values from mediator.

## Streaming
- HLS served at `/hls/deforum.m3u8` (compose `web` service). RTMP ingest from `encoder` or external ffmpeg. Thumbnails from `/api/frames`.
