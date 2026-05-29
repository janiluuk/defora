# Web UI Tabs Reference

The Defora web interface has **7 top-level tabs**: LIVE, STREAM, LIBRARY, PROMPTS, MOTION, MODULATION, SETTINGS.

The header also shows a persistent status bar: transport controls (play/stream/frame), health indicator, session ID, and a HELP toggle.

---

## 1. LIVE

**Purpose**: Performance stage — the render fills the right panel, controls live on the left.

**Left panel sub-tabs**:
- **Controls** — Animation Engine card (active engine badge, video layer picker), Preview source toggle (WebGL / Deforum / WAN Video / Both / Input / +Add source), Animation style selector with mode-specific presets.
- **Deforum** — Full Deforum settings editor with grouped fields (dimensions, steps, sampler, motion schedules, etc.).

**Status bar additions**: "Rendering preview frame" pill while a preview is in flight; FPS and latency counters top-right.

**Video layer bar** (bottom): Click a layer chip to switch the stage source without leaving the tab.

---

## 2. STREAM

**Purpose**: Monitor and route the live HLS output.

**Features**:
- **Stream Preview** panel — shows the live HLS thumbnail; status badge turns green once segments arrive. Displays "WAITING FOR HLS FEED…" until the encoder publishes.
- HLS playlist path and RTMP ingest address shown for copy-paste.
- **Active streams** list — each running output destination with status JSON.
- **Add destination** button — push to any RTMP/SRT/WHIP endpoint.

**Note**: The Stream tab must be active for the HLS preview to appear on the main stage; switching back to LIVE returns to the WebGL/Deforum render.

---

## 3. LIBRARY

**Purpose**: Browse, organise, and open video files and frame sets.

**Features**:
- Root selector (Frames, Runs, Uploads, HLS, VideoSwarm) with zoom slider.
- View mode toggle: **Browse** / **Videos only** / **Subfolders** / **Names**.
- Sort by Name, Date, or Size.
- **+ Folder** and **+ Video** quick-add buttons.
- **Connect cloud** — link Google Drive, Dropbox, OneDrive, or custom HTTPS sources.
- **Refresh** re-polls the current root.
- **Open in editor** — sends the selected clip to the built-in trim/export editor.

---

## 4. PROMPTS

**Purpose**: Prompt authoring, style application, and narrative morphing.

**Sub-tabs**: PROMPTS · IMAGE · LORA · CONTROLNET · STORY

### PROMPTS sub-tab
- **Style modifier** — forge-compatible style preset selector. "Save preview as style example" checkbox.  
- **Prompt Morphing** — enable to expand the A/B morph crossfader. Blend continuously between two prompt states; source can be manual or LFO-driven.
- **Plugins Registry** — read-only list of installed server-side plugins (`GET /api/plugins`).

### IMAGE sub-tab
- img2img panel with init-image dropzone, optional mask (inpaint), denoising strength.
- Submit fires `POST /api/img2img`; result is available at `/uploads/…` when Forge is reachable.

### LORA sub-tab
- **Active LoRAs** — shows loaded checkpoint family (SD-XL, SD1.5, etc.) and source (Forge / local).
- **Common Group** — LoRAs always applied at full strength regardless of crossfader position.
- **A Group / B Group** — two palettes blended by the crossfader.
- **LoRA Crossfader** — enable/disable toggle; manual slider or route to any LFO slot for tempo-synced style morphing.
- **Apply LoRAs** sends the current blend as a WebSocket `loras` control message.
- **Export preset** saves the current A/B configuration as a JSON preset.

### CONTROLNET sub-tab
- Up to 4 slots (CN1–CN4), each with model picker filtered to the active checkpoint family (SDXL / SD1.5 / compatible).
- Weight slider with visual **strength card** (Subtle / Moderate / Strong / Very strong).
- Enable/disable toggle per slot.
- Incompatible models shown with `(current, incompatible)` suffix for transparency.
- Webcam and screen-capture upload to `/api/controlnet/upload-image`.

### STORY sub-tab
- Story Generator: theme input, style preset, scene count, width/height, FPS, total frames.
- Generates a Deforum-ready prompt schedule via the configured Ollama node.
- Result shows formatted scene descriptions and motion schedules.

---

## 5. MOTION

**Purpose**: Camera motion performance and animation timeline.

**Features**:
- **Motion Performance** header shows live Move (X/Y) · Zoom · Tilt values and a **Reset to default** button.
- Preset chips: **Static · Orbit · Tunnel · Handheld · Chaos** — each applies a pre-tuned motion schedule on click.
- **Smoothness** checkbox — enables interpolation between pad positions.
- **2D mode**: dual XY pads — **Move Controls** (translation X/Y) and **Look Controls** (zoom/angle).
- **3D mode**: single 3D motion path preview with axis sliders and a motion pad hero.
- **Animation Sequencer** docks at the bottom (always visible on MOTION):
  - Playhead, duration/FPS display, loop toggle, Prompt and LoRA modulation checkboxes.
  - TIMELINE strip — frame filmstrip appears as preview frames arrive.
  - Track/keyframe editor accessible via the Edit button.
  - Save/load timelines via `POST|GET /api/sequencer/:name`.

---

## 6. MODULATION

**Purpose**: LFO, audio, and beat-synced parameter routing.

**Sub-tabs**: LFO · Audio · Reactive · Beat · Mappings

### LFO sub-tab (default)
- **Modulation Patch Bay** header with slot count badge (e.g., "1/6 LFO active").
- Six independent LFO cards; each shows:
  - Waveform preview (Sine / Triangle / Saw / Square).
  - **Shape** selector and **BPM** sync input.
  - **Speed** and **Depth** knobs.
  - Armed **target** parameter chip.
  - **+ route** button to add additional targets.
- **Targets** panel at the bottom lists every active route grouped by LFO.
- Global **On / Reset** buttons apply to all active LFOs.

### Audio sub-tab
- Audio file upload (WAV/MP3/OGG/FLAC/M4A, up to 100 MB).
- BPM detection and manual override.
- A/V sync — locks the reference audio playback to the stage video timestamp.

### Reactive sub-tab
- Live spectrum analyser driven by the reference audio element.
- Frequency-to-parameter mapping: set Hz min/max and output range, then assign a target parameter.

### Beat sub-tab
- Beat macros — up to 6 triggers that fire on detected beats.
- Each macro has shape, depth, and target parameter.

### Mappings sub-tab
- Flat list of all active LFO and beat macro routes.
- Toggle or remove individual routes without switching back to LFO cards.

---

## 7. SETTINGS

**Purpose**: Engine, controller, style, collaboration, and system configuration.

**Sub-tabs**: ENGINE · CONTROLLERS / MIDI · OPUS · COLLAB · STYLES · SYSTEM

### ENGINE sub-tab
- **Current model card** — shows checkpoint name, architecture tag (SDXL / SD1.5 / Flux), CFG, steps. Click to open the checkpoint picker.
- Inline controls: **Sampler**, **Scheduler**, **Steps**, **CFG** fields synced across the deforum settings and GPU pool modal.
- **Resolution** and **Global FPS** dropdowns; **Model source** chip (sd-forge / local).
- **LCM Engine** toggle — switches to 1-step inference with LCM-LoRA injection.
- **Seed** — Random (−1) or fixed numeric input.
- **Optimize for model** — applies the recommended SDXL-fast / SD1.5 / Flux-schnell profile in one click.
- **Profile chip** — shows the active optimisation profile.

### CONTROLLERS / MIDI sub-tab
- Web MIDI device list with live status.
- Parameter binding table (CC# → parameter → min/max).
- Learn mode — move a controller knob, then click a parameter to bind.
- Bindings saved to localStorage.

### GPUS sub-tab
- GPU pool enable/disable and load-balancing strategy (round-robin / least-busy / priority / random).
- Add SD-Forge, ComfyUI, or Ollama nodes (disabled by default; enable to activate).
- Per-node stats: current model, VRAM used/total, GPU %, active jobs, queue depth.
- Forge instance editor modal — set scheduler, VAE, width/height, batch size per node.
- **Refresh** runs `/docs` or `/system_stats` health checks.

### STYLES sub-tab
- Prompt style library (fetched from Forge and local overrides).
- Activate a style to append its positive/negative prompts to all outgoing requests.
- Style example images shown inline.

### SYSTEM sub-tab
- **Runs Monitor** — table of past/running/queued generation runs with status, model, frame count, and progress.
- Running view: active GPU jobs with Kill button for queued batches.
- Detail pane: frame browser, video player, JSON diff against current settings, re-run / continue actions.
- **Launch test run** — submits a demo job to verify the pipeline end-to-end.

---

## Navigation

- The header tab bar is always visible.
- The active tab is highlighted with a coloured underline.
- The video layer bar at the bottom of the stage persists across tab switches so you can monitor the output while editing settings.

## Visual Theme

All tabs share the same neon-dark shell:
- Background: near-black with subtle blue tint.
- Accent colours: cyan (`#2de2ff`) for interactive elements, magenta (`#ff53d9`) for LFO/beat indicators.
- Font: Space Grotesk.
- Panel cards use a glassmorphic dark surface with cyan border highlights.
- Status pills, progress rings, and health dots use traffic-light coding (green / amber / red).
