# UI Migration Notes — Defora "Instrument" Redesign

Discovery output for §0 of the migration brief. Commit this before any visual change.

---

## 1. Framework & Build

| Aspect | Finding |
|--------|---------|
| Framework | Vue 3 (Options API) |
| Build tool | Vite 5 (`docker/web/vite.config.js`) |
| Component format | Single-file `.vue` components |
| TypeScript | No — plain JS throughout |
| Component library | None — custom CSS only |
| State management | No Vuex/Pinia — all state lives in `App.vue`'s `data()` return |
| Router | No Vue Router — tab switching via `v-if="currentTab==='TABNAME'"` |

---

## 2. Architecture — critical for migration strategy

The app is **monolithic**: everything lives in a single file, `docker/web/src/App.vue` (~5 943 lines). There are no separate view files, no `components/` directory, and no router config. The 8 tabs are inline `<div v-if>` blocks inside the template.

**Implication for migration**: New shared components (`GlassPanel`, `Crossfader`, `LiveParamRow`, `Waveform`, `TargetCell`, `StatusStrip`) will be created as new `.vue` files under `docker/web/src/components/` and imported into `App.vue`. The template blocks for each view are refactored in-place — no new routing or file-splitting of views is needed unless we choose to extract them later.

---

## 3. View → Source File Map

All views are inline blocks in `docker/web/src/App.vue`. Line numbers are approximate (file changes will shift them).

| View | Template start (line) | Key child sections |
|------|----------------------|-------------------|
| **LIVE** | ~122 | Performance deck (crossfade slots + crossfader) · Parameters drawer (model bar + param groups + lock buttons) · Deforum settings drawer |
| **PROMPTS** | ~349 | Sub-tabs: PROMPTS (morph blend + A/B groups + crossfader) · LORA (browser + active LoRAs + A/B assignment) · CONTROLNET (slots + settings) |
| **MOTION** | ~706 | Motion presets row · XY pad (140×140px, currently tiny) |
| **MODULATION** | ~743 | LFO grid (6 cards, each with shape/BPM/speed/depth + target chip list) · Beat Macros grid |
| **AUDIO** | ~835 | A/V sync panel · Audio reactive mappings (freq range → param + output range) · Quick band presets |
| **RUNS** | ~904 | Filters/sort bar · Runs table · Detail modal · Comparison view |
| **SETTINGS** | ~1090 | Sub-tabs: ENGINE · FORGE · MIDI · BINDINGS · PRESETS (+ Shared Presets) · GPUS (pool table) · COLLAB · KEYS |
| **GENERATE** | ~1487 | Animation Sequencer (duration/fps/loop/BPM sync/playhead/timeline canvas/scene markers/track list) · Story Generator |

---

## 4. Shared Chrome

Both shared elements are in `App.vue`:

- **Top `<header>`** (~line 3–28): two-column grid.
  - Left column: `.tabs` — one `<button class="tab">` per view.
  - Right column: inline status strip — Anim play/stop buttons, Rec button, Forge pill, MIDI pill, WS pill, Session pill.
- **Preview panel** (`<div class="preview">`, ~line 30–118): left column of the main `.layout` grid. Contains video element, frame thumbnails, custom video controls. This is the **LIVE backdrop target** — the full-bleed migration converts it from "left half column" to full-viewport with overlay HUDs.
- **Bottom context panel** (`<div class="context">`, ~line 1679–1797): persistent strip showing per-tab chip summaries (crossfader value, LoRA count, etc.). Will be restyled; may be removed or repurposed.

---

## 5. Colors & Tokens — Current State

### Existing `:root` tokens (`docker/web/src/style.css`, lines 1–13)

```css
--bg: #06080f          /* app background */
--panel: #0f1422       /* main panels */
--panel-2: #11182d     /* inset panels */
--border: #1f2a44      /* hairline borders */
--glow1: #ff53d9       /* pink/magenta accent */
--glow2: #2de2ff       /* cyan accent */
--text: #e8edf7        /* primary text */
--muted: #9bb1d0       /* secondary text */
--success: #5af2a9     /* green success */
--danger: #ff4d6d      /* red error */
--radius: 12px
```

### Problem: extensive hard-coded hex
The `.framesync-*` CSS classes and Vue template inline styles use dozens of hard-coded hex values that are not referenced from `:root`:
`#061726`, `#0c2c3f`, `#0b1526`, `#13233d`, `#031b2d`, `#0c3048`, `#ff8a1a`, `#7fb3d6`, `#9bc4e2`, `#cfe5f5`, `#5af2a9`, `#2de2ff`, etc.

### Strategy
The new design token set (§1 of the brief) will be **added to `:root`** in `style.css` as new CSS custom properties. All scattered hex values in both CSS classes and template inline styles will be replaced with the new tokens in a systematic pass. The old `--glow1`/`--glow2` tokens will be mapped to new semantic names and their old names removed once all references are updated.

---

## 6. Live-Value Data Flow (for §0.5 of the brief)

This is the reactive path for a modulated parameter's current value. The redesign must reuse this — not reinvent it.

### Parameter update path (manual)
1. User moves slider → `updateParam(p, evt)` (App.vue ~3274)
2. `p.val = parseFloat(evt.target.value)` — updates the in-memory param object
3. `queueLiveParam(key, val)` → debounced → `sendControl("liveParam", {key: val})`
4. `sendControl` → `ws.send({type:"control", controlType:"liveParam", payload:{key:val}})`
5. Server forwards to mediator/Forge

### LFO modulation path (every 120 ms)
1. `setInterval(runLfos, 120)` fires
2. For each active LFO (`lfo.on === true`) and each of its `lfo.targets[]`:
   - Computes wave value from `lfo.shape`, `lfo.phase`, `lfo.depth`
   - Builds a batch `payload` object
3. Calls `sendControl("liveParam", payload)` for all targets at once
4. **Also directly mutates** the param object's `.val` in `liveVibe[]`/`liveCam[]` (so sliders track live values)

### Beat macro path (every 50 ms)
- `processBeat()` fires timed impulses → calls `sendControl("liveParam", ...)` for macro targets

### Modulation source tracking
- `paramSources` object: `{key: "Manual"|"Beat"|"MIDI"}` — updated by `setSource(key, source)`
- `lfos[]` array: each LFO has `.targets[]` listing which param keys it modulates
- `macrosRack[]`: each macro has `.target` key

### "Modulating now" — how to derive it (for LIVE HUD)
There is no pre-built "currently modulated params" list. It must be computed from:
```js
// Params driven by any active LFO
const lfoModulated = lfos
  .filter(l => l.on && l.targets.length)
  .flatMap(l => l.targets.map(key => ({ key, source: `LFO ${l.id}` })));

// Params driven by any active beat macro
const macroModulated = macrosRack
  .filter(m => m.on && m.target)
  .map(m => ({ key: m.target, source: `Macro` }));
```
The `LiveParamRow` component can read `liveVibe[]` and `liveCam[]` for the current `.val` of each modulated param — these arrays are already reactively updated by `runLfos`.

### Multi-source modulation
A param key CAN appear in multiple LFOs' `targets[]` simultaneously. The last WS message wins server-side. For the MODULATION `TargetCell` grid, a cell must display all owning sources (e.g., "LFO 1 + LFO 3"). The `TargetCell` component must accept an array of owner strings, not a single owner.

---

## 7. Lock Icon Semantics — Action Required Before Building LIVE Pinned Params

The existing 🔒 button on each parameter in the LIVE Parameters drawer is **collaborative locking** via WebSocket:
- `toggleParamLock(key)` → `wsSend({type:"lock_param", param:key})`
- Server broadcasts `presence` message with `lockedParams` per user
- `collab.locks` dict → `isParamLocked(key)` — prevents OTHER users from changing that param
- Visual: `param-lock-btn.active` = amber 🔒, `param-locked input` = 50% opacity

The brief says: *"The existing lock 🔒 icons become pin/hold state … Confirm the pin model with the existing lock-icon semantics — reuse, don't replace."*

**Two options:**
- **Option A — Reuse WS lock as pin**: A "pinned" param is also WS-locked (so other collaborators can't move it while you're performing with it). Consistent but conflates two concepts.
- **Option B — Separate local pin state**: Add a new `pinnedParams: Set<string>` in component data (localStorage-persisted). The 🔒 icon remains for collab locking; a separate 📌 icon controls pinning. No WS changes.

**Recommendation**: Option B — cleaner separation, no protocol change. But this is a design decision. **Confirm with stakeholder before building the LIVE pinned-params drawer.**

---

## 8. Open Questions Before Coding Begins

1. **Pin vs. lock (§7 above)** — Option A or B?
2. **LIVE layout fallback**: Brief describes "docked fallback" for the floating HUD. Which should be the **default** — floating over preview, or docked below it?
3. **Snap-A / Snap-B / Randomize buttons in LIVE morph HUD**: These are described as "NEW affordances". Snap-A/B just set `performance.crossfader = 0 / 1`. Randomize nudges to a random value. No backend change needed — confirm this interpretation.
4. **Bottom context panel**: Will it be removed, restyled, or repurposed as part of the LIVE "recent-runs rail"? It currently shows per-tab chip summaries.

---

## 9. Files Involved in the Migration

| File | Role |
|------|------|
| `docker/web/src/style.css` | Add new design tokens to `:root`; replace scattered hex |
| `docker/web/src/App.vue` | All 8 views (template refactor + new component imports) |
| `docker/web/src/components/` | **New directory** — shared components to be created |
| `docker/web/src/index.html` | May need Google Fonts update (Space Grotesk already referenced in body font-family) |

No Python, mediator, WS-protocol, or backend files should be touched.

---

## Migration Progress Log

### Steps 1 + 2 — Nav restructure + Perf drawer removal (2026-05-31) ✅

**Step 1: Promoted AUDIO, RUNS, GENERATE to first-class nav tabs**
- Added AUDIO, RUNS, GENERATE to `tabs` array in `App.vue`
- AUDIO: sets `currentTab = 'AUDIO'`, renders `ModulationView` with `AUDIO_REACTIVE` subtab
- RUNS: sets `currentTab = 'RUNS'`, renders `RunsBrowserPanel` full-page
- GENERATE: sets `currentTab = 'GENERATE'`, renders `GenerateView` with sequencer dock
- LIBRARY and STREAM remain in tabs (STREAM de-emphasised, moved to end; full STREAM → SETTINGS migration deferred to Step 9)
- `runsMonitorActive` computed now triggers on `currentTab === 'RUNS'`

**Step 2: Deleted the "Perf" drawer and all duplicate content**
- Removed `top-drawer-shell` block (~5600 chars of duplicate MODULATION/CROSSFADER/SYSTEM panels)
- Removed Perf FAB overlay button (duplicate of nav)
- Removed `liveBottomDrawerOpen`, `liveBottomDrawerTab` state, watchers, and `setLiveBottomDrawerTab` method
- Removed drawer state from session save/restore
- `openRecentRun`, `openRunsDrawerSystem`, `openFramesInRunsPanel` now route to RUNS tab

**Tests updated:**
- `playwright-nav.mjs`: `openRunsMonitor` and `openLiveFramesPanel` now click RUNS tab
- `playwright-smoke.mjs`: expected tabs updated to include AUDIO, RUNS, GENERATE
- `playwright-frame-pipeline-profile.mjs`: `openFramesPanel` uses RUNS tab
- `ui.spec.js`: tab count test, AUDIO first-class tab assertion, crossfader location, RUNS tab monitor test

**Next: Steps 3+4** — LIVE stage morph/modulating-now HUDs + MODULATION waveform-first cards

### Layout refactor (2026-05-31) ✅

**User requests addressed:**
1. Side-panel menus: live-drawer-shell moved inside preview-stage-row, slides from video edge horizontally
2. Wider panels: both drawers now max(340px, 33vw) — ~33% screen width
3. Sequencer: height increased from 196px to flexible 40vh, overflow removed
4. Engine controls: AnimationEnginePanel now shows all controls inline (no "Controls →")

**Next: Steps 5+6** — MOTION XY pad hero + PROMPTS crossfader consolidation

### Steps 5 + 6 — Motion hero polish + single morph crossfader (2026-05-31) ✅

**Step 5: MOTION XY pad hero**
- `.motion-hero-stage` min-height (~52vh) so the hero pad dominates the MOTION panel
- Preset pill row + fine-tune axes toggle unchanged; path preview stays in collapsible advanced panel

**Step 6: PROMPTS crossfader consolidation**
- Removed duplicate morph crossfader sliders from PROMPTS → PROMPTS (mini + expanded panel)
- Added `prompt-morph-live-hint` pointing performers to LIVE Morph HUD (matches LoRA tab pattern)
- Morph slot editors remain under “Edit morph slots” when morph is enabled
- `onCrossfaderSlider` now syncs `prompts.morphBlend` when morph is on (single A/B control on LIVE)
- Shared `.morph-live-hint` / `.lora-crossfader-hint` chrome in `style.css`

**Tests updated:** prompt morph hint, LoRA hint (no inline deck), LIVE morph blend sync

**Next:** Step 7 — SETTINGS / RUNS declutter + token sweep (U-30 remaining hex)
