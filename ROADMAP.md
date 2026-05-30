# Defora Roadmap

This document outlines the current status, unfinished features, and planned future development for Defora — an audio-visual instrument for Stable Diffusion.

**Last Updated**: 2026-05-30 | **Version**: 0.6.52 (web package) / roadmap track 0.3.x

---

## UX design migration (2026-05-30 audit)

Design reference was `design.zip` + `UX-AUDIT.md` (triaged into this section; both files removed after import). Target: mockup nav (`live · prompts · motion · modulation · audio · runs · settings · generate`), GlassPanel stage HUDs, waveform-first modulation, XY-pad hero motion, single morph crossfader on LIVE.

**Verification snapshot (2026-05-30, branch `feat/motion-sequencer-vimage3-streaming`):** U-21, U-22, and U-23 landed in this pass; U-24–U-30 remain open or partial. Animation engine plugins (WebGL / Deforum / WAN / AnimateLCM layers + shared 8-macro strip) are **Done** on that branch but were out of scope for the original audit.

### Summary

| Severity | Open | Partial | Done | Theme |
|----------|------|---------|------|--------|
| **Critical** | 4 | 2 | 2 | Stage morph/mod HUDs; duplicate crossfader; Perf drawer dead state; LFO phase (wired) |
| **High** | 6 | 8 | 4 | First-class nav tabs; modulation card polish; motion pad hero; runs access |
| **Medium / Low** | 12 | 6 | 3 | Settings labels; STREAM placement; token/hex sweep; emoji → UiIcon |

### Migration steps (audit §7 → roadmap phases)

| Phase | Audit step | Scope | Status |
|-------|------------|--------|--------|
| **U-21** | Step 1 — First-class AUDIO, RUNS, GENERATE nav | Add tabs to `App.vue` `tabs[]`; full-page `RunsBrowserPanel` / `GenerateView`; route AUDIO to reactive panel; move STREAM to SETTINGS → Output | **Done** — 8-tab nav (LIVE, PROMPTS, MOTION, MODULATION, AUDIO, RUNS, SETTINGS, GENERATE); STREAM → SETTINGS → OUTPUT; `switchTab('STREAM')` legacy alias routes to Output |
| **U-22** | Step 2 — Remove Perf / bottom drawer | Drop `liveBottomDrawerOpen` state, FAB, duplicate MODULATION/CROSSFADER drawer; runs via tab only | **Done** — dead drawer state removed; `openRunsDrawerSystem()` → `switchTab('RUNS')`; HLS watch no longer tied to STREAM tab |
| **U-23** | Step 3 — LIVE stage HUDs | GlassPanel morph (bottom-right) + modulating-now (bottom-left) + recent-runs filmstrip; UiIcon pin/lock | **Done** — morph + modulating-now GlassPanels mounted on LIVE stage; recent-runs filmstrip; UiIcon pin/lock in `LiveView.vue` (morph still also in PROMPTS until U-27) |
| **U-24** | Step 4 — MODULATION waveform-first | Waveform hero, compact LFO meta line, teal active / dim idle cards | **Done** — waveform-first cards; controls expand on select; compact BPM/depth/routes line when collapsed |
| **U-25** | Step 5 — AUDIO meter-first mappings | Frequency band meter hero, quick-band pills (`sub · bass · …`) | **Done** — quick-band pills above spectrum hero; taller spectrum canvas; meter cards unchanged |
| **U-26** | Step 6 — MOTION XY pad hero | Full-view pad, accent puck glow, preset pills | **Done** — preset pills + hero `DeforumMotionPads` stage; fine-tune axes toggle; macros-only control panel; path preview in collapsible advanced panel |
| **U-27** | Step 7 — PROMPTS single crossfader | Remove inline LoRA blend slider; A/B card assignment only; morph on LIVE | **Done** — inline crossfader removed from Prompts → LORA; hint links to LIVE morph HUD |
| **U-28** | Step 8 — GENERATE timeline dock | Preview above timeline; shared playhead | **Done** — `layout--generate-dock` + taller preview-bottom dock; `GenerateView` sync readout (playhead, duration, frame, FPS) and editor actions |
| **U-29** | Step 9 — SETTINGS progressive disclosure | Reorder sub-tabs; rename SYSTEM; Output sub-tab for stream; GlassPanel model picker | **Done** — ENGINE → OUTPUT → GPUS → RUNS → MIDI → STYLES → COLLAB; SYSTEM alias → RUNS; checkpoint in GlassPanel; advanced sampling/resolution in `<details>` |
| **U-30** | Step 10 — Token / hex audit | Replace hardcoded hex; delete design.zip | **Open** — `--live` / `--accent` used in CSS; full vue hex sweep not done |

### Per-issue checklist (audit §3–§5)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| L1 | Emoji pin/lock → UiIcon | **Done** | `LiveView.vue` |
| L2 | Morph HUD on stage | **Done** | `MorphCrossfaderPanel` on LIVE |
| L3 | Modulating-now HUD | **Done** | `ModulationActiveModsPanel` on LIVE |
| L4 | MODULATION duplicated in drawer | **Done** | Drawer UI removed |
| L5 | Recent-runs filmstrip on LIVE | **Done** | `recentRunsRail` on stage |
| M1–M3 | LFO compact / teal / idle | **Partial** | CSS + waveform ✓; compact line + idle copy open |
| M4–M5 | Audio reactive cards / LFO phase | **Partial** | Phase on Waveform ✓; audio cards open |
| Mo1–Mo3 | XY pad hero / size | **Done** | Hero stage + preset pills; fine-tune toggle |
| Mo4 | Readout mono | **Low / partial** | |
| P1–P2 | Duplicate crossfader / A/B + slider | **Done** | Morph on LIVE only |
| P3–P4 | Story / CN card polish | **Open** | |
| A1–A4 | AUDIO first-class + meters | **Partial** | Tab ✓; meter-first reactive layout ✓ |
| R1–R2 | RUNS tab + drawer overlap | **Done** | RUNS tab + SETTINGS → RUNS (SYSTEM alias) |
| S1–S4 | Settings sub-tabs / disclosure | **Done** | Reordered sub-tabs; RUNS rename; GlassPanel checkpoint; advanced `<details>` |
| G1–G3 | GENERATE tab + timeline dock | **Done** | GENERATE tab + dedicated dock under preview with sync readout |
| St1–St3 | STREAM tab vs design | **Partial** | STREAM removed from nav; Output sub-tab ✓ |
| X1 | Emoji buttons | **Partial** | pin/lock done; other emoji buttons open |
| X2 | GlassPanel underused | **Partial** | Pinned + morph + modulating HUDs |
| X3–X4 | `--live` / `--accent` on active states | **Partial** | LFO cards, motion puck |
| X5–X6 | framesync-panel / inline hex | **Open** | |
| X7 | Perf drawer duplicate | **Done** | Template removed |
| X8 | SYSTEM label collision | **Done** | Renamed to RUNS; legacy SYSTEM alias preserved |

### Recommended order

1. **U-30 + remaining emoji** — Token sweep and remaining UiIcon replacements

---

## Audit findings (2026-05-23)

Full codebase audit: inconsistencies, performance killers, incomplete items, and missing functionality. **Remediation landed 2026-05-23** (Phases 10–15); items below marked **Done** unless noted **Open**.

### Summary

| Severity | Open | Done | Themes |
|----------|------|------|--------|
| **Critical** | 0 | 4 | `sync-app-definition.mjs` + `pretest`; CN webcam/screen in `App.vue`; compose `SD_FORGE_HOST`; health `/docs` |
| **High** | 0 | 8 | Docker compose validation in CI (`TestDockerStackIntegration`); full compose E2E opt-in via `SKIP_DOCKER_E2E` |
| **Medium** | 0 | 13 | LTC documented as experimental; MTC unit tests; prompt morph blend slider ([A-26](#audit-findings-2026-05-23)) |
| **Low** | 0 | 6 | Playwright tab smoke in CI ([A-27](#audit-findings-2026-05-23)) |

### Critical

| ID | Category | Issue | Location / evidence |
|----|----------|-------|---------------------|
| **A-01** | ✅ Done | **`sync-app-definition.mjs`** regenerates `app-definition.js` from full SFC template (fixes inner `<template>` truncation); `npm run pretest` runs sync before `npm test`. | `docker/web/scripts/sync-app-definition.mjs`, `docker/web/package.json` |
| **A-02** | ✅ Done | ControlNet **webcam/screen/file** in `App.vue` PROMPTS → CONTROLNET sub-tab (`imageSource`, `toggleWebcam`, screen capture, `POST /api/controlnet/upload-image`). | `App.vue` CONTROLNET rack |
| **A-03** | ✅ Done | Compose `web` sets `SD_FORGE_HOST=sd-forge`, `SD_FORGE_PORT=7860`; README documents web env vars. | `docker-compose.yml`, `README.md` |
| **A-04** | ✅ Done | `performHealthCheck()` probes SD-Forge **`GET /docs`**; distributed tests aligned to port `7860`. | `docker/web/server.js`, `tests/test_distributed_generation.py` |

### High — inconsistencies & missing UX

| ID | Category | Issue | Location / evidence |
|----|----------|-------|---------------------|
| **A-05** | ✅ Done | `docs/WEB_UI_TABS.md` — sequencer on **GENERATE**; MOTION = presets + XY pad. | `docs/WEB_UI_TABS.md` |
| **A-06** | ✅ Done | Docs: LORA/CN as **PROMPTS** sub-tabs; top-level **RUNS** tab documented. | `docs/WEB_UI_TABS.md`, `README.md` |
| **A-07** | ✅ Done | MOTION **XY pad** rendered (`.xy-pad` + mouse/touch handlers). | `App.vue` MOTION rack |
| **A-08** | ✅ Done | CI runs `TestDockerStackIntegration` with `SKIP_DOCKER_TESTS=0`; full `docker compose up` E2E opt-in (`SKIP_DOCKER_E2E=0`, off in Actions). | `.github/workflows/ci.yml`, `tests/test_docker_stack_integration.py` |
| **A-09** | ✅ Done | `TestAPIEndpointPerformance` exercises `/api/health`, `/api/status`, `/api/frames` when `SKIP_PERF_TESTS=0`. | `tests/test_performance_load.py`, CI job |
| **A-10** | ✅ Done | `tests/test_web_server_live.py` spawns `server.js` and hits `/api/health`, `/api/frames`, `/api/status` via `httpx`. | `tests/test_web_server_live.py`, CI job |

### High — performance killers

| ID | Category | Issue | Location / evidence |
|----|----------|-------|---------------------|
| **A-11** | ✅ Done | AI routes use **`scripts/ai_invoke.py`** (stdin JSON) instead of `python3 -c` per request. | `docker/web/scripts/ai_invoke.py`, `server.js` |
| **A-12** | ✅ Done | `/api/frames` uses mtime **index cache** with TTL. | `docker/web/server.js` |
| **A-13** | ✅ Done | `listRuns()` uses async manifest reads (no per-run sync N+1 in hot path). | `docker/web/server.js` |

### Medium

| ID | Category | Issue |
|----|----------|-------|
| **A-14** | ✅ Done | `docs/API.md` — ControlNet lists Forge + cache, not placeholder. |
| **A-15** | ✅ Done | README: `FORGE_API_BASE` (CLI) + `SD_FORGE_HOST`/`SD_FORGE_PORT` (web). |
| **A-16** | ✅ Done | Roadmap version line **0.3.6** aligned with `docker/web/package.json`. |
| **A-17** | ✅ Done | `deforumation_runs_cli.py` module doc updated. |
| **A-18** | ✅ Done | `defora_tui.py` header updated (full TUI, not skeleton). |
| **A-19** | ✅ Done | `uploadControlNetImage()` triggers file input → `POST /api/controlnet/upload-image`. |
| **A-20** | ✅ Done | `docker/web/Dockerfile`: `npm run build` fails image on Vite error. |
| **A-21** | ✅ Done | Tests use synced `app-definition.js` (full template); `ui.spec.js` updated for LIVE performance deck + RUNS tab. |
| **A-22** | ✅ Done | `DEFORUMATION_ADDRESS` default `host.docker.internal` in compose. |
| **A-23** | ✅ Done | Frames/health polling **backoff** on errors in `App.vue`. |
| **A-24** | ✅ Done | LTC demod documented **experimental**; **MTC** quarter-frame path + `tests/test_timecode_sync.py`; production LTC via external hardware/library. |
| **A-25** | ✅ Done | `stream_helper` wipe uses **fade** transition (valid ffmpeg). |
| **A-26** | ✅ Done | PROMPTS tab: global **morph blend** slider, per-slot weight + range gating, `morphSlotValue` in `applyPromptMorphing`. |

### Low

| ID | Category | Issue |
|----|----------|-------|
| **A-27** | ✅ Done | CI: `npm run build` + `npm run test:playwright` (`test/playwright-smoke.mjs`) against local server. |
| **A-28** | ✅ Done | `features.spec.js` stale `FEATURES_STATUS.md` reference removed. |
| **A-29** | ✅ Done | Documented: **CLI** plugins (`defora_cli/plugins/manifest.json`) vs **web** registry (`docker/web/plugins/manifest.json` + `PLUGINS_DIR`). |
| **A-30** | ✅ Done | README web/TUI tab wording aligned with PROMPTS sub-tabs. |
| **A-31** | ✅ Done | `encoder` `depends_on`: `web`, `sd-forge`. |
| **A-32** | ✅ Done | Separate `forgeCacheValidUntil` from failed probe `lastChecked`. |

### Recommended fix order (phased below)

1. **A-01, A-02** — Regenerate or CI-sync `app-definition.js` from `App.vue`; port ControlNet live-input UI into production.
2. **A-03, A-22** — Compose defaults: `SD_FORGE_HOST=sd-forge`, document web env vars in README.
3. **A-04** — Distributed health: probe SD-Forge `/docs` on port 7860; align tests/docs.
4. **A-05–A-07, A-14–A-16** — Docs/tab parity (MOTION vs GENERATE, LORA placement, XY pad).
5. **A-08–A-10, A-20–A-21** — CI: enable Docker smoke + real server tests; fail build on Vite error.
6. **A-11–A-13, A-23** — Performance: in-process AI module, frame/run listing indexes, polling backoff.
7. **Post-audit UX** — `apiFetch` structured console errors; checkpoint **model list source** pill (Forge / Cache / Placeholder).
8. **Shared presets** — Web UI in SETTINGS → PRESETS (`/api/shared-presets` list / share / load / delete).
9. **Collaborative UI** — SETTINGS → COLLAB: user presence, parameter locks, session record / playback via WebSocket.
10. **Doc hygiene** — Align incomplete / test sections with Phases 10–15 completion.
11. **GPU pool** — Multi-instance load balancing; SETTINGS → GPUS panel; ComfyUI + SD-Forge stats.
12. **Runs comparison export** — `POST /api/runs/compare` + RUNS tab CSV/JSON export for selected runs.
13. **Forge API load balance** — sd-models, loras, forge options routed through GPU pool when enabled.
14. **Nightly Docker E2E** — Scheduled workflow with `SKIP_DOCKER_E2E=0`.

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
| **2026-05-23 audit** | Phases **10–15** remediation (UI parity, compose, health, CI smoke, server perf, morph blend, Playwright) | **Done** — [Audit findings](#audit-findings-2026-05-23) (all A-01–A-32 addressed or documented) |

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
| **10** | **Audit: production UI parity** | Sync `App.vue` ↔ `app-definition.js`; ControlNet live input; MOTION XY pad; CN upload API | **Done** (A-01, A-02, A-07, A-19) |
| **11** | **Audit: Docker & distributed ops** | Compose Forge host/port; health `/docs`; `DEFORUMATION_ADDRESS` default | **Done** (A-03, A-04, A-22) |
| **12** | **Audit: docs & tab truth** | `WEB_UI_TABS.md`, README, `API.md`, version **0.3.6** | **Done** (A-05–A-07, A-14–A-16, A-30) |
| **13** | **Audit: CI & build integrity** | Live server + perf API tests; strict Vite build; Docker compose smoke; Playwright tab smoke | **Done** (A-08, A-09, A-10, A-20, A-21, A-27) |
| **14** | **Audit: server performance** | `ai_invoke.py`, frames cache, async runs, polling backoff, stream fade | **Done** (A-11–A-13, A-23, A-25, A-32) |
| **15** | **Audit: doc/code hygiene** | CLI/TUI headers; dual manifest note; timecode docs; morph blend | **Done** (A-17, A-18, A-24, A-26, A-28, A-29) |
| **16** | **Post-audit polish** | `api-utils.js`; model source pill; shared presets UI; COLLAB tab (presence, locks, session record) | **Done** (recommended items 7–9) |
| **17** | **GPU pool** | Load balancing; SETTINGS → GPUS; SD-Forge + ComfyUI instances; edit-when-disabled | **Done** (item 11) |
| **18** | **Runs compare export** | `POST /api/runs/compare`; prompt fields in UI; CSV/JSON download | **Done** (item 12) |
| **19** | **Forge routes + GPU pool** | sd-models, loras, forge options use pool target | **Done** (item 13) |
| **20** | **Nightly Docker E2E** | `.github/workflows/nightly-docker-e2e.yml` | **Done** (item 14) |
| **U-21** | **UX: first-class nav tabs** | AUDIO, RUNS, GENERATE in top nav; STREAM → SETTINGS Output | **Partial** |
| **U-22** | **UX: remove Perf drawer** | Delete dead `liveBottomDrawerOpen` paths | **Partial** |
| **U-23** | **UX: LIVE stage HUDs** | Mount morph + modulating-now GlassPanels; filmstrip | **Partial** |
| **U-24** | **UX: modulation cards** | Waveform-first LFO cards, compact meta | **Partial** |
| **U-25** | **UX: audio meter-first** | Band meters + quick presets | **Open** |
| **U-26** | **UX: motion XY hero** | Promote pad to view hero | **Done** |
| **U-27** | **UX: prompts crossfader** | One morph source on LIVE | **Done** |
| **U-28** | **UX: generate dock** | Timeline under preview | **Done** |
| **U-29** | **UX: settings polish** | Sub-tab order, diagnostics, disclosure | **Done** |
| **U-30** | **UX: design token sweep** | Hex → tokens; semantic panels | **Open** |

---

## Table of Contents

1. [UX design migration (2026-05-30 audit)](#ux-design-migration-2026-05-30-audit)
2. [Audit findings (2026-05-23)](#audit-findings-2026-05-23)
3. [README ↔ roadmap alignment](#readme--roadmap-alignment)
4. [Project Status Overview](#project-status-overview)
5. [Current Features (Completed)](#current-features-completed)
6. [Incomplete/In-Progress Features](#incompletein-progress-features)
7. [Planned Features](#planned-features)
8. [Future Enhancements](#future-enhancements)
9. [Long-Term Vision](#long-term-vision)

---

## Project Status Overview

Defora is in **active development** with a strong foundation of core features implemented. The project currently supports:

- ✅ **Core functionality**: Live performance control, prompt morphing, camera motion
- ✅ **Multiple interfaces**: Web UI, TUI, CLI panel
- ✅ **Audio integration**: Audio-reactive modulation, beat sync
- ✅ **Streaming**: HLS, RTMP, SRT support
- ✅ **Docker deployment**: Complete containerized stack
- ✅ **Advanced workflow features**: Shared presets, collaboration (presence, locks, session recording) wired in Web UI
- ✅ **Testing**: Docker compose smoke + perf API + live `server.js` + Playwright in CI; `pretest` syncs `app-definition.js` from `App.vue`

---

## Current Features (Completed)

### 🎹 Performance Interfaces

#### Web UI (Browser-based)
- ✅ Multi-tab interface (LIVE, PROMPTS, MOTION, MODULATION, AUDIO, RUNS, SETTINGS, GENERATE — LoRA/ControlNet under **PROMPTS** sub-tabs)
- ✅ **PROMPTS img2img / inpainting**: optional mask + inpaint controls; plugin manifest list
- ✅ **Animation sequencer** (on **GENERATE** tab): keyframed `liveParam` tracks, per-segment easing, **scene markers**, save/load via API, export JSON — docs still say MOTION ([A-05](#audit-findings-2026-05-23))
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

### 🔴 UX design migration (2026-05-30)

See [UX design migration](#ux-design-migration-2026-05-30-audit). Phases **U-21–U-30** track the mockup-aligned UI pass (nav structure, stage HUDs, modulation/motion polish, token audit). **None complete end-to-end**; U-22 drawer template removal and animation-engine plugin layers are partial wins.

### 🔴 Audit backlog (2026-05-23)

See [Audit findings](#audit-findings-2026-05-23) for the full A-01–A-32 list. Phased remediation: **Phases 10–15** in [Phased delivery](#phased-delivery).

**Audit A-01–A-32**: Complete. See [Recommended fix order](#recommended-fix-order-phased-below) items 1–6 and Phase 16 polish (items 7–9).

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
- Advanced filtering and search (basic search/filter exists in RUNS tab)
- ✅ Export comparison reports — `POST /api/runs/compare` + RUNS compare export buttons
- ✅ Visual diff for prompts — side-by-side diff in RUNS browser + `prompt_diffs` on `POST /api/runs/compare` (2 runs)

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
- ✅ Visual indicator for **model list source** (sd-forge vs cache vs placeholder) on CN/LoRA pickers and LIVE checkpoint bar
- ✅ Structured API error logging via `apiFetch` (`docker/web/src/api-utils.js`)

### ✅ Test Coverage (v0.3.6+)

**Status**: Broad unit coverage; CI runs Docker compose validation, perf API smoke, live `server.js` tests, and Playwright tab smoke after `npm run build`

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

**Remaining Enhancements**:
- Integration tests with real SD-Forge GPU generation
- Extended load testing with WebSocket stress tests
- ✅ Full `docker compose up` E2E — nightly workflow (`nightly-docker-e2e.yml`, `SKIP_DOCKER_E2E=0`); PR CI uses compose config smoke only

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
  - ✅ Multi-band audio mapping (bass, mids, highs) - `--band-layout bass_mid_high`
  - ✅ Audio envelope followers - `--envelope-attack-sec` / `--envelope-release-sec`
  - ✅ Spectral visualization: offline FFT spectrogram after Web upload (Phase 7); live `AnalyserNode` band bars on reference playback (Phase 8)
  - ✅ **MIDI clock sync** for external sequencers - `--midi-clock` / `--midi-device`
  - ✅ **Audio recording** from system audio - `--record` / `--record-duration` / `--record-output`

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
- **MVP (Phases 2 + 6 + 9)**: ✅ Keyframed tracks with optional per-segment cubic easing (`linear` / `easeIn` / `easeOut` / `easeInOut`), **scene markers** (`markers[]`), server persistence (`GET/POST/DELETE /api/sequencer`), **GENERATE** tab playback → mediator via `liveParam`, JSON export — see `docs/API.md` / `SEQUENCER_DIR`.
- **Polish (v0.3.0+)**: ✅
  - ✅ Visual multi-track timeline strip (waveform-style lanes) with canvas rendering
  - ✅ **Custom bezier handles** — drag handles on timeline to customize curve interpolation between keyframes
  - ✅ Marker-driven transitions (actions: jump, preset, generate, morph, param, pause)
  - ✅ Optional sync to audio BPM or frame counter from HLS (`bpmSync` with bars/beats)

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
  - ✅ Multiple ControlNet preprocessing - weight/start/end scheduling per slot
  - ✅ **Live camera/video input** for ControlNet - webcam integration with configurable frame rate
  - ✅ **Screen capture** as ControlNet source - browser-based screen sharing API
  - ✅ ControlNet weight scheduling - per-slot weight, start, end step controls
  - ✅ Image source selection (file/webcam/screen) per slot

#### Collaborative Features
- **Priority**: Low
- **Description**: Multi-user support
- **Features**:
  - ✅ **Multiple simultaneous web UI clients** - WebSocket-based multi-user support with unique user IDs
  - ✅ **Parameter locking (prevent conflicts)** - Lock/unlock parameters to prevent concurrent edits
  - ✅ **User presence indicators** - Real-time user list with connection status and locked parameters
  - ✅ **Session recording and replay** - Record all control events and playback with timing
  - ✅ **Shared presets and settings** — `/api/shared-presets` + SETTINGS → PRESETS UI

### 🎯 Long-Term (6-12 Months)

#### img2img and Inpainting
- **Priority**: High
- **Description**: Support for image-to-image workflows
- **Features**:
  - ✅ Upload reference images - file upload with preview
  - ✅ **Inpainting mask editor** - canvas-based drawing/erasing with adjustable brush size
  - ✅ img2img strength control - denoising strength, mask blur, inpainting fill mode
  - ✅ **Batch img2img processing** - configurable batch size with seed variation for image variations
  - ✅ Image variations generator - batch processing with randomized seeds

#### Plugin System
- **Priority**: Medium
- **Description**: Extensible architecture for community plugins
- **Features**:
  - ✅ **Plugin API for custom modulators** - smooth, step, random modulators with configurable parameters
  - ✅ **Custom parameter mappings** - linear, exponential, logarithmic, sigmoid mapping curves
  - ✅ **Plugin registry and manifest system** - JSON-based plugin discovery and registration
  - ✅ **Third-party integration hooks** - `--modulator-plugin`, `--mapping-plugin`, `--plugin-config` CLI flags
  - ✅ **Web API for plugins** - `/api/plugins`, `/api/plugins/:type`, `/api/plugins/execute`, `/api/plugins/modulators`, `/api/plugins/mappings`
  - ⏳ Plugin marketplace/repository (future)
  - ⏳ Plugin sandboxing for security (future)

#### Advanced Streaming
- **Priority**: Medium
- **Description**: Professional streaming features
- **Features**:
  - ⏳ Multi-bitrate adaptive streaming (future)
  - ⏳ WebRTC support for ultra-low latency (future)
  - ✅ **Stream overlays and transitions** - `--overlay` for PNG overlays, `--transition` for fade/wipe/dissolve effects
  - ⏳ Multi-camera switching (future)
  - ✅ **Recording while streaming** - `record` command with quality presets (low/medium/high/ultra), separate PID tracking
  - ✅ **Streaming API** - `/api/stream/start`, `/api/stream/stop`, `/api/stream/status`, `/api/stream/record`, `/api/stream/stop-record`, `/api/stream/record-status`

#### Mobile Support
- **Priority**: Low
- **Description**: Mobile-friendly interfaces
- **Features**:
  - ✅ **Responsive web UI for tablets** - Media queries for 768px and 480px breakpoints
  - ✅ **Touch-optimized controls** - 44px minimum touch targets, larger sliders and buttons for touch devices
  - ✅ **Landscape mobile support** - Optimized layout for landscape orientation
  - ⏳ Mobile app (iOS/Android) (future)
  - ⏳ Gyroscope/accelerometer control (future)
  - ⏳ Location-based parameter modulation (future)

---

## Future Enhancements

### 🔮 Experimental Features (12+ Months)

#### AI-Assisted Workflows
- **Description**: Use AI to help with creative decisions
- **Features**:
  - ✅ **Prompt suggestions based on current output** - Category-aware suggestions with confidence scoring
  - ✅ **Automatic parameter tuning for desired aesthetic** - Style-based parameter recommendations (photorealistic, anime, cinematic, abstract)
  - ✅ **Style transfer recommendations** - Oil painting, watercolor, cyberpunk, minimalist styles with prompt/parameter modifications
  - ✅ **Anomaly detection (bad frames)** - Detect extreme parameter values and potential artifacts
  - ✅ **Smart preset generation** - Auto-tune parameters based on feedback scores
  - ✅ **AI Assistant API** - `/api/ai/prompt-suggestions`, `/api/ai/improve-prompt`, `/api/ai/parameter-recommendations`, `/api/ai/auto-tune`, `/api/ai/style-recommendations`, `/api/ai/apply-style`, `/api/ai/analyze-frame`, `/api/ai/anomaly-summary`

#### VR/AR Integration
- **Description**: Immersive performance interfaces
- **Features**:
  - ✅ **VR control room** - WebXR-based VR interface at `/vr.html` with Three.js
  - ✅ **3D parameter manipulation** - Visual 3D controls for translation, rotation, FOV
  - ⏳ Spatial audio integration (future)
  - ✅ **Hand tracking controls** - VR controller support for parameter manipulation
  - ⏳ AR overlay on real-world objects (future)

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
- ✅ **Cloud GPU integration (RunPod, Vast.ai)** - `defora_cli.cloud_gpu` with provisioning, monitoring, cost estimation
- ✅ **Health check endpoint** — SD-Forge `GET /docs` ([A-04](#audit-findings-2026-05-23))
- ⏳ Frame interpolation across machines (future)
- ⏳ Cost optimization algorithms (future)
- Render farm support

#### Advanced Synchronization
- **Description**: Sync with external systems
- **Features**:
  - ✅ **DMX lighting control integration** - Art-Net, sACN, and OpenRGB support for stage lighting
  - ✅ **OSC (Open Sound Control) support** - `defora_cli.osc_bridge` with mappings for all Defora parameters
  - ✅ **Ableton Link sync** - Tempo synchronization with Ableton Live and Link-enabled apps
  - ✅ **Timecode sync** — **MTC** quarter-frame path + tests; **LTC** experimental audio demod ([A-24](#audit-findings-2026-05-23))
  - ⏳ Show control systems integration (future)

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

**Last Updated**: 2026-05-30 | **Maintained by**: [@janiluuk](https://github.com/janiluuk)
