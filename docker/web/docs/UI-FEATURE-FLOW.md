# Defora UI — feature flow graph

**Status:** living document — edit before restructuring UI logic.  
**Repo path:** `docker/web/docs/UI-FEATURE-FLOW.md`  
**Companion:** [`UX-NAVIGATION-MAP.md`](UX-NAVIGATION-MAP.md) (collision/shortcut audit) · [`README.md`](README.md) (workflow)

| | |
|--|--|
| **Purpose** | Map where features live today and where they *should* live after your edit. |
| **How to edit** | Change node labels, move subgraphs, add/remove edges. Mermaid renders in GitHub, VS Code, and Cursor preview. |
| **Code sources** | `src/App.vue`, `src/components/views/*.vue`, `src/components/AnimationEnginePanel.vue` |
| **Implement** | After you finalize a section here, update the matching view + `switchTab` / `subTabIdsForCurrentTab` in `App.vue`. |

### Top nav (current code)

`LIVE` · `PROMPTS` · `MOTION` · `MODULATION` · `AUDIO` · `SETTINGS`  
(No top-level RUNS / GENERATE / STREAM — those redirect; see §2.)

### Restructure phases (implementation log)

| Phase | Theme | Status |
|-------|--------|--------|
| **IA-1** | Docs: flow graph + index (`UI-FEATURE-FLOW.md`) | **Done** |
| **IA-2** | Engine Deforum settings + panel docks + PLUGINS in Settings | **Done** |
| **IA-3** | Discoverability: LIVE summary + `LiveParametersPanel`, prompt schedule link, help/popovers, FOV → `F`, morph status pill, layer rail labels | **Done** |
| **IA-4** | AUDIO tab reference upload; merge MODULATION/AUDIO paths | **Done** |
| **IA-5** | Orphans: `VideoSwarmBrowser`, compositor dedupe, GENERATE context | **Done** |

Edit this table when you change the target layout in §10.

---

## 1. App shell (always visible)

![App shell — LIVE tab, all panels closed](screenshots/audit-2026-06-02/00-main-overview.png)

![LIVE — bottom drawer open](screenshots/audit-2026-06-02/02b-live-bottom-drawer.png)

```mermaid
flowchart TB
  subgraph chrome["Global chrome"]
    NAV["Top nav tabs"]
    STRIP["Status strip"]
    LIB_BTN["Library button"]
  end

  subgraph stage["Center stage"]
    VIDEO["Video preview"]
    WEBGL_BG["WebGL background"]
  end

  subgraph edges["Edge docks — hidden when Library open"]
    CTRL["Controls drawer — left — P"]
    ENG["Engine drawer — right — E"]
    LAY["Layers rail — far right"]
    BOT["Bottom drawer — toggle + tabs"]
  end

  LIB_BTN --> LIB["Library overlay"]
  LIB --> LIB_BROWSER["Library: Projects / Videos / Audio"]
  LIB --> LIB_EDITOR["Library: Video editor"]

  NAV --> TAB_LIVE
  NAV --> TAB_PROMPTS
  NAV --> TAB_MOTION
  NAV --> TAB_MOD
  NAV --> TAB_AUDIO
  NAV --> TAB_SET

  STRIP --> T_PLAY["Play / Pause Deforum"]
  STRIP --> T_STOP["Stop"]
  STRIP --> T_REC["Record stream"]
  STRIP --> T_HLS["HLS on stage"]
  STRIP --> T_FRAME["Generate preview frame"]
  STRIP --> T_HEALTH["Health popover"]
  STRIP --> T_GPU["GPU popover"]
  STRIP --> T_MIDI["MIDI popover"]
  STRIP --> T_WS["Collaboration toggle"]
  STRIP --> T_SESS["Session picker"]
```

---

## 2. Top-level tab routing

```mermaid
flowchart LR
  subgraph tabs["Top nav — 6 tabs"]
    LIVE
    PROMPTS
    MOTION
    MODULATION
    AUDIO
    SETTINGS
  end

  LIVE --> C_LIVE["Controls: LiveView"]
  PROMPTS --> C_PROMPTS["Controls: PromptsView"]
  MOTION --> C_MOTION["Controls: MotionView"]
  MODULATION --> C_MOD["Controls: ModulationView"]
  AUDIO --> C_AUDIO["Controls: ModulationView — audio reactive only"]
  SETTINGS --> C_SET["Controls: SettingsView"]

  LIVE --> S_LIVE["Stage HUDs"]
  MOTION --> B_SEQ["Bottom: Sequencer dock"]

  ENG_ALL["Engine drawer — all tabs"] -.-> LIVE & PROMPTS & MOTION & MODULATION & AUDIO & SETTINGS
  LAY_ALL["Layers rail — all tabs"] -.-> LIVE & PROMPTS & MOTION & MODULATION & AUDIO & SETTINGS

  LEG_RUNS["Legacy: RUNS tab"] --> SETTINGS
  LEG_RUNS --> C_SET_RUNS["Settings sub: RUNS"]
  LEG_GEN["Legacy: GENERATE tab"] --> MOTION
  LEG_STREAM["Legacy: STREAM tab"] --> SETTINGS
  LEG_STREAM --> C_SET_OUT["Settings sub: OUTPUT"]
```

---

## 3. LIVE tab

```mermaid
flowchart TB
  subgraph live_ctrl["Controls drawer — LIVE"]
    LV_SUM["Live summary"]
    LV_SHORT["Engine shortcuts (open Deforum / prompts / WebGL)"]
  end

  subgraph live_stage["Stage — LIVE only"]
    PIN["Pinned params HUD"]
    MORPH["Morph crossfader HUD"]
    MOD_NOW["Modulating-now HUD"]
    RECENT["Recent runs rail → Settings RUNS"]
  end

  subgraph live_eng["Engine drawer — layer controls"]
    L_LIST["Layer list — opacity / visibility"]
    L_WEBGL["WebGL → visual sliders"]
    L_DEF["Deforum → job + settings editor"]
    L_PARAMS["Parameters → vibe/camera sliders (moved here)"]
    L_WAN["WAN → plugin panel"]
    L_IN["Input → source hint"]
    L_COMP["Compositor section"]
  end

  subgraph live_layers["Layers rail"]
    L_RUN["Running preview layers"]
    L_ADD["Add source → Library"]
    L_SCENES["Scenes save/load"]
  end

  LV_SHORT --> L_DEF
```

---

## 4. PROMPTS tab

```mermaid
flowchart TB
  subgraph prompts_sub["Controls — sub-tabs"]
    P0["PROMPTS"]
    P1["IMAGE"]
    P2["LORA"]
    P3["CONTROLNET"]
    P4["STORY"]
  end

  P0 --> P_STYLE["Style modifier"]
  P0 --> P_MORPH["Prompt morph slots"]

  P1 --> P_IMG["img2img — Forge upload / mask"]

  P2 --> P_LORA["Active LoRAs"]
  P2 --> P_LORA_X["LoRA A/B crossfader"]
  P2 -.-> LIVE_MORPH["Links to LIVE morph HUD"]

  P3 --> P_CN["ControlNet slots"]
  P3 --> P_CN_SLOT["Per-slot CN settings"]

  P4 --> P_STORY["Story generator"]

  subgraph prompts_eng["Engine — Deforum — not on PROMPTS tab"]
    E_PROMPT["Deforum settings → Prompts group — schedules"]
  end

  P0 -.->|"schedules live here"| E_PROMPT
```

---

## 5. MOTION tab

```mermaid
flowchart TB
  subgraph motion_ctrl["Controls drawer"]
    M_PERF["Motion performance"]
    M_PRESETS["Quick presets + save/load"]
    M_PADS["Deforum motion pads — hero"]
    M_MACRO["Macro knobs strip"]
    M_ADV["Advanced: smoothness + 3D path preview"]
  end

  subgraph motion_bottom["Bottom dock — MOTION only"]
    SEQ_MAIN["Sequencer timeline + transport"]
    SEQ_SIDE["Sequencer side editor drawer"]
    GEN_STORY["Story strip — if generator active"]
  end

  subgraph motion_drawer["Bottom drawer (toggle)"]
    BD_TOGGLE["Button: bottom drawer toggle (center)"]
    BD_TABS["Tabs: MODULATION / CROSSFADER / SYSTEM"]
  end

  subgraph motion_eng["Engine — Deforum"]
    E_MOT2D["Motion 2D schedules"]
    E_MOT3D["Motion 3D schedules"]
  end

  M_PADS -.->|"duplicate surface"| E_MOT2D & E_MOT3D
```

---

## 6. MODULATION + AUDIO tabs

```mermaid
flowchart TB
  subgraph mod_sub["MODULATION — Controls sub-tabs"]
    M_LFO["LFO"]
    M_AV["Audio — reference upload + AV sync"]
    M_REACT["Reactive — jumps to AUDIO tab"]
    M_BEAT["Beat macros"]
    M_MAP["Mappings matrix"]
  end

  M_LFO --> LFO_CARDS["6× LFO cards"]
  M_LFO --> LFO_TARGETS["Target board"]

  M_AV --> AV_DROP["Audio file dropzone"]
  M_AV --> AV_SYNC["Video lead / sync toggle"]

  M_BEAT --> BEAT_RACK["Macro pills rack"]

  M_MAP --> MAP_ROWS["Per-param mapping rows"]

  subgraph audio_tab["AUDIO — top tab — same reactive UI"]
    A_START["Start audio stream"]
    A_SPEC["Spectrum editor"]
    A_BANDS["Band mapping cards + detail"]
  end

  M_REACT --> audio_tab

  audio_tab -.->|"upload not here"| M_AV
```

---

## 7. SETTINGS tab

```mermaid
flowchart TB
  subgraph set_sub["SETTINGS — Controls sub-tabs"]
    S_ENG["ENGINE"]
    S_OUT["OUTPUT"]
    S_GPU["GPUS"]
    S_RUN["RUNS"]
    S_MIDI["MIDI"]
    S_STY["STYLES"]
    S_PLUG["PLUGINS"]
    S_COL["COLLAB"]
  end

  S_ENG --> CKPT["Checkpoint picker"]
  S_ENG --> SAMP["Sampler / scheduler / steps / CFG"]
  S_ENG --> RES["Resolution + global FPS"]
  S_ENG --> LCM["LCM engine panel"]

  S_OUT --> STREAM["StreamView — HLS preview + endpoints"]

  S_GPU --> HEALTH["Service health"]
  S_GPU --> STACK["Mediator + transcoders"]
  S_GPU --> POOL["GPU pool + Forge instance editor"]

  S_RUN --> RUN_MON["Runs monitor"]
  S_RUN --> RUN_ACT["Active runs"]
  S_RUN --> RUN_FR["Frames rail"]
  S_RUN --> RUN_PAST["Past runs search"]

  S_MIDI --> MIDI_DEV["MIDI devices + CC table"]
  S_MIDI --> KEYS["Keyboard bindings"]
  S_MIDI --> PRESETS["Local + shared presets"]

  S_STY --> STYLES["Prompt styles CRUD + Forge import"]

  S_PLUG --> REG["Plugins registry list"]

  S_COL --> WS["WS users / locks / session recordings"]
```

---

## 8. Engine drawer — per-layer detail

```mermaid
flowchart LR
  ENG["Engine drawer"] --> LIST["All builtin layers"]

  LIST --> WEBGL
  LIST --> DEFORUM
  LIST --> WAN
  LIST --> INPUT

  WEBGL --> W_CTRL["WebGLPluginPanel → LiveEngineControls"]

  DEFORUM --> D_HEAD["Job transport — play/stop/reload/save/verify/JSON"]
  DEFORUM --> D_SET["DeforumSettingsBody tabs:"]
  D_SET --> D_CAN["Canvas"]
  D_SET --> D_SAMP["Sampling"]
  D_SET --> D_PR["Prompts"]
  D_SET --> D_INIT["Init"]
  D_SET --> D_M2["Motion 2D"]
  D_SET --> D_M3["Motion 3D"]
  D_SET --> D_SCH["Schedules"]
  D_SET --> D_CN1["ControlNet 1–5"]

  WAN --> WAN_P["WanPluginPanel"]

  INPUT --> IN_HINT["Link library source"]

  ENG --> COMP["CompositorControls — global"]
```

---

## 9. Cross-cutting & orphans (candidates to relocate)

```mermaid
flowchart TB
  subgraph orphans["Resolved in IA-3 / IA-5"]
    O1["LiveParametersPanel → LIVE Controls"]
    O2["CrossfaderPanel — removed; LoRA UI in PROMPTS"]
    O3["VideoSwarmBrowser → Library → Files"]
    O4["LiveEngineControlsDock — removed; use Engine drawer"]
    O5["GenerateView dock → MOTION Controls"]
  end

  subgraph dupes["Duplicated surfaces — known"]
    D1["Compositor — single surface in Engine drawer"]
    D2["Deforum motion — MOTION tab vs Engine schedules"]
    D3["Deforum transport — Status strip vs Engine job head"]
    D4["Runs — Settings RUNS vs LIVE recent rail"]
    D5["Morph — LIVE HUD vs PROMPTS morph vs compositor"]
  end

  O1 -.->|"should be?"| LIVE_CTRL["LIVE Controls or Engine Deforum"]
  O3 -.->|"should be?"| LIB_BROWSER["Library overlay"]
```

---

## 10. Blank template — your revised layout

Copy this section, edit labels and edges, and paste back when ready.

```mermaid
flowchart TB
  subgraph my_tabs["Your top tabs"]
    T1[" "]
    T2[" "]
    T3[" "]
  end

  subgraph my_regions["Regions per tab"]
    CONTEXT["Controls drawer"]
    ENGINE["Engine drawer"]
    STAGE["Stage / HUD"]
    BOTTOM["Bottom dock"]
  end

  T1 --> CONTEXT
  T1 --> ENGINE
  T1 --> STAGE

  %% Add features as nodes and wire them here
```

---

## Quick reference table (for spreadsheet edits)

| Feature | Current tab/region | Notes |
|---------|-------------------|--------|
| Video preview | Stage — all tabs | |
| WebGL background | Stage — all tabs | |
| Play/stop Deforum | Status strip | Also engine job panel |
| HLS on stage | Status strip | Config in Settings → OUTPUT |
| Pinned params | LIVE stage HUD | Pins from engine params? |
| Morph crossfader | LIVE stage HUD | Also PROMPTS morph |
| Live vibe/camera sliders | LIVE → Controls | `LiveParametersPanel` |
| WebGL visual sliders | Engine → WebGL | |
| Deforum all settings | Engine → Deforum | |
| Prompt schedules (strings) | Engine → Deforum → Prompts | Not PROMPTS tab |
| Style modifier | PROMPTS → PROMPTS | |
| Prompt morph slots | PROMPTS → PROMPTS | |
| img2img | PROMPTS → IMAGE | |
| LoRAs | PROMPTS → LORA | |
| ControlNet slots | PROMPTS → CONTROLNET | |
| Story generator | PROMPTS → STORY | |
| Motion pads | MOTION → Controls | |
| Sequencer | MOTION → bottom dock | |
| LFOs | MODULATION → LFO | |
| Reference audio | MODULATION → Audio | |
| Audio reactive | AUDIO tab (or MOD → Reactive) | |
| Beat macros | MODULATION → Beat | |
| Mappings | MODULATION → Mappings | |
| Checkpoint / sampling defaults | SETTINGS → ENGINE | |
| Stream / RTMP | SETTINGS → OUTPUT | |
| GPU / Forge pool | SETTINGS → GPUS | |
| Runs browser | SETTINGS → RUNS | |
| MIDI + key bindings | SETTINGS → MIDI | |
| Prompt styles | SETTINGS → STYLES | |
| Plugins registry | SETTINGS → PLUGINS | |
| Collaboration | SETTINGS → COLLAB | |
| Library browse | Library overlay | |
| Video editor | Library overlay | |
| Layers + scenes | Layers rail | |
| Compositor | Engine → Compositor | |
