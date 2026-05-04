# Web UI Tabs Overview

This document provides an overview of all tabs in the Defora web interface.

## Tab Structure

The web UI consists of 7 main tabs:

### 1. LIVE Tab
**Purpose**: Real-time parameter control and live generation monitoring

**Features**:
- Vibe & Style sliders (cfg, strength, steps, seed)
- Camera Position controls (translation_x, translation_y, translation_z, zoom)
- Camera Rotation controls (rotation_y, rotation_z)
- View controls (fov, near, far)
- Real-time parameter adjustment with live updates
- Preset buttons: Static, Orbit, Tunnel, Handheld, Chaos
- Source assignment for parameter modulation

**Visual Elements**:
- Slider rows with min/max ranges
- Parameter source indicators
- Quick preset chips for common camera movements

---

### 2. PROMPTS Tab
**Purpose**: Manage positive and negative prompts with morphing

**Features**:
- **img2img / inpaint** panel: init image, optional mask (inpaint), blur & fill mode, full-res toggle, submit via `POST /api/img2img` (result under `/uploads/…` when Forge is up); **Plugin registry** list from `GET /api/plugins` (read-only)
- Positive prompt text area
- Negative prompt text area
- Prompt morphing controls
- Morph table with ID, On/Off toggle, Name, and Range columns
- Send prompts button
- Apply morphing button

**Visual Elements**:
- Large text areas for prompt input
- Table for managing prompt morph slots
- Toggle controls for enabling/disabling morphs

---

### 3. LORA Tab
**Purpose**: Browse and blend LoRA models for the current session

**Features**:
- List of available LoRAs (from API when SD-Forge is reachable)
- Per-slot or grouped strength controls
- A/B grouping and crossfader-style blending (when enabled in UI)
- Refresh to sync with the server model list

**Visual Elements**:
- LoRA cards or rows with strength sliders
- Group A / Group B affordances where applicable

---

### 4. MOTION Tab
**Purpose**: Interactive camera movement plus **animation sequencer** (Phase 2 MVP)

**Features**:
- **Sequencer**: duration, FPS, loop, playhead scrub, Play/Stop; **scene markers** (named cues at time `t`, rail + jump/delete, persisted in timeline JSON); tracks per mediator parameter with keyframes (`t` seconds → value) and per-segment easing (`linear` / `easeIn` / `easeOut` / `easeInOut`); save/load/delete via `/api/sequencer`; export JSON
- Playback emits **`liveParam`** over WebSocket (same path as manual sliders)
- XY Pad for intuitive camera pan control
- Maps X/Y position to translation_x (-10 to 10) and translation_y (-10 to 10)
- Real-time updates sent to mediator via WebSocket
- Zoom / tilt sliders and motion style chips

**Visual Elements**:
- Sequencer controls above the XY pad
- 140x140px interactive XY pad with crosshair cursor
- Visual dot indicating current position
- Motion preset / style controls

---

### 5. MODULATION Tab (Unified)
**Purpose**: Comprehensive audio, LFO, and beat-synced modulation control

**Theme**: FrameSync dark blue (#061726) with orange accents (#ff8a1a)

**Features**:

#### 🎵 Audio & Tempo Section
- Audio file upload with format validation
- **Spectral overview** after upload: offline FFT spectrogram (time →, low frequency at bottom); same PNG in the LIVE preview strip and context row when audio is loaded
- **Live spectrum** while the reference `<audio>` plays: Web Audio `AnalyserNode` FFT bars in MODULATION and a compact strip next to the offline image on LIVE (enable A/V sync and play video, or any playback of the upload)
- BPM detection and manual input (20-300 BPM)
- Beat phase indicator with real-time visualization (%)
- Tap tempo and auto-detect controls
- Audio status indicator (loaded/not loaded)

#### 🎛️ Global LFO Controls
- Global LFO BPM setting (20-240)
- Sync to audio option
- Applies to all LFO modulators

#### 🌊 LFO Modulators (up to 8)
- Visual waveform previews with orange accent
- Target parameter selection from grouped options:
  - Style: Vibe (CFG), Strength, Noise/Glitch
  - Camera: Zoom, Pan X/Y, Rotate, Tilt, FOV
- Wave shape buttons with visual icons:
  - 〰 Sine
  - △ Triangle  
  - ⟋ Saw
  - ▭ Square
- Depth control slider (0-1)
- On/Off toggle per LFO
- Delete button (🗑)
- 3-column compact grid layout

#### ⚡ Beat Macros (up to 6)
- Beat-synced modulation triggers
- Target parameter selection (Vibe, Zoom, Noise)
- Shape selection with visual icons (Sine, Saw, Noise)
- Depth control (0-1)
- On/Off toggle per macro
- Delete button (🗑)
- 3-column compact grid layout

#### 🎚️ Audio Mapping (conditional)
- Only visible when audio file is loaded
- Frequency-to-parameter mapping (up to 8 mappings)
- Frequency range input (Hz min/max)
- Quick **band preset** chips (Sub, Bass, Lo-mid, Mid, High, Air) to set Hz range per mapping row
- Output range input (parameter min/max)
- Target parameter selection from grouped list
- Apply mapping button
- Status indicator
- 2-column grid layout

**Visual Elements**:
- FrameSync dark blue panel backgrounds (#061726)
- Orange accent for waveforms and active elements (#ff8a1a)
- Cyan border highlights (#0c3048)
- Compact card-based layout
- Inline SVG waveform previews
- Visual icons replacing text where possible
- Status pills and indicators
- Emoji icons for section headers

**Context Panel**:
- Shows active LFO modulators with their targets
- Shows active Beat Macros
- Audio mapping count when audio is loaded
- Visual waveform representation

---

### 6. CN (ControlNet) Tab
**Purpose**: ControlNet model management and configuration

**Features**:
- Multiple ControlNet slots (CN1-CN4)
- Model selection dropdown populated from API
- Weight slider (0-2) for each slot
- Start/End sliders (0-1) for temporal control
- Enable/disable toggle for each slot
- Refresh models button
- Visual feedback for active slots

**Visual Elements**:
- Slot cards with model selection
- Range sliders with real-time value display
- Toggle switches for quick enable/disable
- API-driven model list (Canny, Depth, OpenPose, etc.)

---

### 7. SETTINGS Tab
**Purpose**: System settings and MIDI configuration

**Features**:
- **Controllers (WebMIDI)** section:
  - MIDI device detection and listing
  - Real-time MIDI CC processing
  - MIDI mapping table with CC#, Parameter, Min, Max columns
  - Edit and delete controls for each mapping
  - Add mapping button
  - Mappings persisted to localStorage
  
- **Presets** section:
  - List of saved presets
  - Load preset button
  - Save current preset button
  - Delete preset button with confirmation
  - Preset list refreshed from server API

**Visual Elements**:
- MIDI device list with status indicators
- Mapping table with inline edit controls
- Preset list with action buttons
- Status pills showing connection state

---

## Navigation

- Tabs are displayed in the header
- Active tab is highlighted with cyan glow
- Click any tab to switch views
- All controls send real-time updates to the mediator via WebSocket

## Visual Theme

**Primary Theme** (LIVE, PROMPTS, MOTION, CN, SETTINGS):
- Dark background with cyberpunk aesthetic
- Cyan (#2de2ff) and magenta (#ff53d9) accents
- Space Grotesk font family
- Glassmorphic panels with backdrop blur
- Smooth animations and transitions

**FrameSync Theme** (MODULATION):
- Dark blue background (#061726, #031b2d)
- Orange accent (#ff8a1a) for primary elements
- Cyan-blue text (#cfe5f5, #9bc4e2)
- Technical/industrial aesthetic
- Compact, information-dense layout
- Visual icons for intuitive interaction

---

## Design Improvements in Unified MODULATION Tab

### Space Efficiency
- Reduced from 3 separate tabs to 1 unified interface
- 3-column grid layout for LFO and Beat Macro cards
- Compact card design with inline controls
- Conditional rendering (audio mapping only when needed)

### Visual Language
- **Waveform Icons**: 〰 △ ⟋ ▭ ◈ replace text labels
- **Emoji Icons**: 🎵 🌊 ⚡ 🎚️ 🎯 👆 🗑 for quick recognition
- **Inline Graphs**: SVG waveform previews in each LFO card
- **Status Indicators**: Pills, dots, and percentage displays
- **Color Coding**: Orange (#ff8a1a) for active/primary elements

### Improved UX
- All modulation controls in one view - no tab switching
- Visual feedback with waveform previews
- Grouped parameter selection with categories
- Toggle switches with visual state
- Depth sliders with immediate visual feedback
- Conditional sections reduce clutter

---

## Notes

- All tabs are functional and connected to the backend
- Parameters update in real-time
- MIDI mappings persist across sessions
- Audio file uploads are validated server-side
- Presets can be saved/loaded for quick session setup
- The MODULATION tab combines functionality from the former AUDIO/BEATS, MODULATION, and FEATURES tabs
