# Defora Web — UX Navigation Map & Menu Audit

> **IA / restructuring:** edit [`UI-FEATURE-FLOW.md`](UI-FEATURE-FLOW.md) first, then align this file after code changes.  
> Last updated after viewport edge dock refactor. Source: `App.vue`, `*View.vue`, `AnimationEnginePanel.vue`.

**Note:** Top nav is six tabs (`LIVE` · `PROMPTS` · `MOTION` · `MODULATION` · `AUDIO` · `SETTINGS`). RUNS and GENERATE are legacy redirects; see flow doc §2.

---

## 1. Panel collision audit

All floating UI regions, default state, z-index, and overlap rules.

| Region | Position | Default | Z-index | Width (open) | Collides with |
|--------|----------|---------|---------|--------------|---------------|
| **Top nav + status strip** | Sticky top | Always visible | 190+ | Full width | None (chrome) |
| **Left layers sidebar** | Viewport left edge | **Collapsed** (40px tab) | 30 | 188px max | None — left edge reserved on wide screens |
| **Engine drawer** | Viewport right edge | **Closed** (32px tab @ 36%) | 45 | 420px max | Context drawer — **offset stacks left** when both open |
| **Context drawer** | Viewport right, left of engine | **Closed** (32px tab @ 54%) | 40 | 420px max | Engine drawer — **offset** via `layout--edge-engine-open` |
| **Library overlay** | Full screen | Closed | 350 | 100% | Hides all edge docks |
| **Stage HUD overlay** | Top corners of video | Always | 5 | ~360px | Video only — pointer-events none except HUD widgets |
| **LIVE pinned strip** | Stage top-left | When pins exist | 5 | 360px max | Morph/modulating HUD (different corners) |
| **LIVE morph/modulating HUD** | Stage bottom | LIVE tab | 10 | Bottom band | Sequencer dock (MOTION/GENERATE only) |
| **Recent runs rail** | Below video (LIVE) | When runs exist | — | Full preview width | Bottom dock on MOTION/GENERATE |
| **Bottom sequencer dock** | Below video | MOTION/GENERATE | — | Full width | Recent runs rail (different tabs) |
| **Sequencer side editor** | Left of bottom dock | **Closed** | — | Side panel | Layers sidebar (different vertical zone) |

### Collision rules (implemented)

1. **Right stack:** Engine drawer anchors at `right: 0`. Context drawer uses `right: var(--engine-drawer-width)` when engine is open — panels never overlap.
2. **Narrow screens (<920px):** Opening one right drawer **closes the other** (single right panel mode).
3. **Wide screens (≥1360px, not overlay mode):** Preview margins reserve space — panels sit in margins with **solid** background.
4. **Overlay mode (<1360px or full-stage):** Panels slide over video with **transparent glass** (`live-right-column--overlay`).
5. **Edge tabs when closed:** Engine tab at 36% height, context tab at 54% — no vertical overlap.
6. **Library open:** Edge dock host hidden entirely — no collision with library.

### Remaining overlap notes (acceptable)

- Transparent panels intentionally cover video in overlay mode.
- LIVE HUD widgets can cover video corners — by design.
- Sequencer bottom dock reduces video height on MOTION/GENERATE — not a drawer collision.

---

## 2. Access paths — global chrome

| Action | Path | Shortcut |
|--------|------|----------|
| Switch main tab | Top nav pills | `←` `→` or `1`–`8` |
| Open Library | Top nav folder icon | — |
| Toggle layers sidebar | Left edge tab (chevron) | — |
| Toggle engine drawer | Right edge tab “Engine” | `E` |
| Toggle context panel | Right edge tab (tab name) | `P` |
| Close overlays/drawers | — | `Escape` (stack order) |
| Play/pause Deforum | Status strip transport | — |
| Session restore | Status strip session popover | — |

**Default on first visit:** All three side menus **collapsed**. Session restore may reopen saved state.

---

## 3. Function map by tab

### LIVE

| Feature | Location | How to access |
|---------|----------|---------------|
| Video preview / layers | Center stage + left layers tab | Select layer dots in collapsed sidebar |
| Deforum play/stop | Status strip + engine → Deforum job panel | Transport buttons |
| Live vibe/camera params | **Engine drawer → Deforum → Controls** | `E` → expand Deforum → Parameters |
| Prompt schedules (strings) | Engine drawer → Deforum → settings → Prompts | Same path |
| Pinned params HUD | Stage top-left | Pin in engine param panel first |
| Morph crossfader | Stage bottom-right HUD | LIVE tab, always visible when on LIVE |
| Modulating-now readout | Stage bottom-left HUD | When LFO/audio mappings active |
| Recent runs thumbnails | Below video | LIVE tab only |
| Context panel | Right edge “Live” tab | `P` — **redirect only** (“open engine for params”) |

**Sub-tabs:** None visible. Keyboard ↑/↓ cycles `MONITOR` / `DEFORUM_JOB` (opens engine drawer for job).

---

### PROMPTS

| Feature | Location | How to access |
|---------|----------|---------------|
| Style modifier | Context panel → PROMPTS sub-pill | `P` then sub-pill |
| Prompt morph slots | Context → PROMPTS | `M` toggles morph |
| img2img | Context → IMAGE | Sub-pill |
| LoRA strengths | Context → LORA | Sub-pill |
| ControlNet slots | Context → CONTROLNET | Sub-pill |
| Story generator | Context → STORY | Sub-pill |
| Morph blend control | LIVE stage HUD | Link from LORA sub-tab |

**Sub-tabs:** PROMPTS · IMAGE · LORA · CONTROLNET · STORY (`↑` `↓` in panel)

---

### MOTION

| Feature | Location | How to access |
|---------|----------|---------------|
| Motion presets / pads | Context panel | `P` |
| Path preview 3D | Context panel bottom | Same |
| Sequencer timeline | Bottom dock | Auto-visible on tab |
| Sequencer editor (full) | Bottom dock → side drawer | Toggle arrow on dock |
| Keyframes / clips | Bottom dock timeline | Edit button opens side drawer |

**Sub-tabs:** None visible (state: PERFORMANCE only).

---

### GENERATE

| Feature | Location | How to access |
|---------|----------|---------------|
| Sequencer status summary | Context panel | `P` |
| Open sequencer editor | Context → “Open editor” or bottom dock | Side drawer toggle |
| Motion controls link | Context panel | Switches to MOTION tab |
| Full timeline | Bottom dock | Same as MOTION |

---

### MODULATION

| Feature | Location | How to access |
|---------|----------|---------------|
| LFO cards | Context → LFO | `P`, `L` toggles master |
| AV sync / reference audio | Context → Audio | Upload audio here |
| Audio reactive mappings | Context → Reactive **or** AUDIO top tab | `↑` `↓` |
| Beat macros | Context → Beat | `B` |
| Param mappings | Context → Mappings | Sub-pill |

**Sub-tabs:** LFO · Audio · Reactive · Beat · Mappings

---

### AUDIO

Same as MODULATION → Reactive pane only. Reference audio upload is under **MODULATION → Audio**, not on AUDIO tab.

---

### SETTINGS

| Feature | Location | How to access |
|---------|----------|---------------|
| Checkpoint / sampling | Context → ENGINE | `P` |
| HLS / RTMP stream | Context → OUTPUT | Was STREAM tab |
| GPU pool / Forge | Context → GPUS | Status strip GPU popover |
| Runs browser (duplicate) | Context → RUNS | Prefer dedicated RUNS tab |
| MIDI / key bindings | Context → MIDI | Learn mode in panel |
| Prompt styles CRUD | Context → STYLES | — |
| Collaboration / locks | Context → COLLAB | Lock buttons also in engine params |

**Sub-tabs:** ENGINE · OUTPUT · GPUS · RUNS · MIDI · STYLES · COLLAB

---

### RUNS

| Feature | Location | How to access |
|---------|----------|---------------|
| Active jobs / log | Context panel → Runs | Top tab RUNS |
| Frame rail | Context → Frames | In-panel sub-tab |
| Past runs search/export | Context → Past runs | In-panel sub-tab |

---

### LIBRARY (overlay)

| Feature | Location | How to access |
|---------|----------|---------------|
| Video browser / upload | Library → Browser | Folder icon or layers “+ Add source” |
| Video editor (FreeCut) | Library → Video editor | Folder icon → editor pane |
| Edge docks | Hidden while library open | Close library with `Escape` |

---

## 4. Per-page menu inventory

### What each menu shows on every tab

| Tab | Left layers | Engine drawer | Context drawer | Bottom dock | Stage HUD |
|-----|-------------|---------------|----------------|-------------|-----------|
| LIVE | Layer dots + add | All layers + compositor | LiveView hint | — | Pinned, morph, modulating |
| PROMPTS | Same | Same | PromptsView + 5 sub-pills | — | Global overlay |
| MOTION | Same | Same | MotionView presets/pads | Sequencer + side editor | Global overlay |
| GENERATE | Same | Same | GenerateView summary | Sequencer + side editor | Global overlay |
| MODULATION | Same | Same | ModulationView + 5 sub-pills | — | Global overlay |
| AUDIO | Same | Same | Audio reactive only | — | Global overlay |
| SETTINGS | Same | Same | SettingsView + 7 sub-pills | — | Global overlay |
| RUNS | Same | Same | RunsBrowserPanel | — | Global overlay |

---

## 5. Recommended improvements

### High priority — discoverability

1. **Primary prompt text** lives in engine drawer (Deforum → Prompts group), not PROMPTS tab. Add a prominent link in PROMPTS → PROMPTS: “Edit schedule strings in Engine → Deforum”.
2. **LIVE context panel is empty** — replace redirect with a compact read-only summary of active layer + 2–3 top params, keeping full controls in engine drawer.
3. **Library is icon-only** — add “Library” text on hover or a 9th quick-access entry in help.
4. **Help popover outdated** — update to 8 tabs, `P`/`E`, arrow keys, Escape stack.
5. **`E` key conflict** — default binding uses `e` for FOV nudge; document or rebind FOV to another key.

### Medium priority — duplicates

6. **Two layer lists** — sidebar shows *running* layers; engine drawer shows *all built-in* layers. Label sidebar “Active preview” and engine “All layers & controls”.
7. **RUNS twice** — SETTINGS → RUNS duplicates RUNS tab. Remove embed or rename to “Storage paths”.
8. **Deforum transport twice** — status strip and engine Deforum job panel. Keep strip for quick access; collapse job transport when stream is active.
9. **Morph in three places** — LIVE HUD, PROMPTS/LORA hints, compositor. Add small morph indicator in status strip when morph enabled.

### Layout / placement

10. **GENERATE tab order** — tab #8 after SETTINGS; consider placing after MOTION (#4).
11. **Sequencer split** — editing in bottom dock, summary in context panel. Add persistent “Sequencer” label on bottom dock; merge MOTION+GENERATE context into one “Timeline” panel.
12. **Recent runs rail** — LIVE only; also show on RUNS tab or as collapsible strip.
13. **AUDIO tab** — merge with MODULATION or add audio upload directly on AUDIO tab.
14. **Sequencer side editor** — consider moving to left viewport edge (4th dock) for consistency with other edge menus.
15. **Pinned params** — expose pin toggle from LIVE HUD empty state (“Pin params from Engine drawer”).

### Keyboard / Escape stack order

Current `Escape` dismissal order (first match wins):

1. Binding learn mode  
2. Modals (restore session, etc.)  
3. Library workspace  
4. Engine drawer  
5. Right context panel  
6. Sequencer side drawer  
7. Other overlays  

Document this in Help popover.

---

## 6. Quick task reference

| I want to… | Go to |
|------------|-------|
| Watch Deforum stream | Select Deforum layer · status strip Play |
| Tweak camera live | `E` → Deforum → Parameters |
| Edit prompt schedule | `E` → Deforum → Prompts group |
| Prompt morph | PROMPTS tab · `P` · morph HUD on LIVE |
| Motion performance | MOTION · `P` |
| Edit timeline | MOTION/GENERATE bottom dock · side editor toggle |
| LFO / audio reactive | MODULATION or AUDIO tab · `P` |
| Checkpoint | SETTINGS · ENGINE |
| Stream RTMP/HLS | SETTINGS · OUTPUT |
| Job history | RUNS tab |
| Browse videos | Library icon or layers `+` |
