# Web UI Tabs Overview

This document provides an overview of all tabs in the Defora web interface.

## Tab Structure

The web UI consists of 8 main tabs:

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

### 3. MOTION Tab
**Purpose**: Interactive camera movement control

**Features**:
- XY Pad for intuitive camera pan control
- Maps X/Y position to translation_x (-10 to 10) and translation_y (-10 to 10)
- Real-time updates sent to mediator via WebSocket
- Motion presets (Static, Orbit, Tunnel, Handheld, Chaos)
- Cursor styling and visual feedback

**Visual Elements**:
- 140x140px interactive XY pad with crosshair cursor
- Visual dot indicating current position
- Preset buttons for quick motion setup

---

### 4. AUDIO/BEATS Tab
**Purpose**: Audio-reactive parameter modulation and beat detection

**Features**:
- BPM input field (default: 120)
- Audio file upload with metadata display
- Beat detection based on BPM
- Beat macros that execute on beat timing
- Visual beat indicator with flashing feedback
- Beat phase tracking for smooth animations
- Modulation Router (visible when audio track is loaded)
- Audio mapping controls for frequency-to-parameter conversion

**Visual Elements**:
- File input for audio upload (.wav, .mp3, .ogg, .flac, .m4a)
- BPM controls
- Beat macro cards with target, shape, depth, offset, and speed settings
- Audio mapping grid with frequency range and output range sliders

---

### 5. MODULATION Tab
**Purpose**: Advanced modulation studio with LFOs and beat macros

**Features**:
- Modulation Studio with LFO controls
- Beat Macros section for rhythm-based modulation
- LFO cards with:
  - Target parameter selection
  - Wave shape (Sine, Saw, Noise)
  - BPM control
  - Depth and base value
  - On/Off toggle
- Add/remove LFO buttons (max 6 LFOs)

**Visual Elements**:
- Grid layout of LFO cards
- Waveform previews
- Beat macro rows with visual indicators
- Streamlined compact UI

---

### 6. FEATURES Tab (FrameSync)
**Purpose**: FrameSync control surface with dark blue/orange theme

**Features**:
- Waveform header with SVG visualization
- Axis labels for frame timing
- Preset selector with sample presets
- Wave/LFO controls with wave shapes (Sine, Saw, Triangle, Square, Cosine)
- Frame/Sync settings
- Metrics display (BPM, Depth, Phase)
- Feature coverage panel with timing table
- Visual feedback with orange accent colors

**Visual Elements**:
- Dark blue background (#061726)
- Orange accent highlights (#ff8a1a)
- SVG waveform graph
- Stacked panels for organized controls
- Timing axis with 12-column grid

---

### 7. CN (ControlNet) Tab
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

### 8. SETTINGS Tab
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

- Dark background with cyberpunk aesthetic
- Cyan (#2de2ff) and magenta (#ff53d9) accents
- Space Grotesk font family
- Glassmorphic panels with backdrop blur
- Smooth animations and transitions

---

## Notes

- All tabs are functional and connected to the backend
- Parameters update in real-time
- MIDI mappings persist across sessions
- Audio file uploads are validated server-side
- Presets can be saved/loaded for quick session setup
