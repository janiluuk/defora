# Defora — declutter & finish the instrument transformation (grounded brief)

Based on reading the actual source (`docker/web/src/`). The design system and components are
DONE; the problem is the migration is half-applied — old cluttered markup still coexists with the
new components, and `App.vue` is a 6,639-line monolith. This brief is about REMOVING clutter and
FINISHING the wiring so the app works as an instrument without thinking, not building new design.

**Stack (confirmed):** Vue 3 Options API, Vite, single monolithic `docker/web/src/App.vue`
(6,639 lines), all state in one `data()`, tab switching via `v-if="currentTab===…"`, no router.
**Already done:** tokens in `style.css` `:root` (`--live`, `--accent`, `--a-group`, `--b-group`,
…); components exist and are partially used: `GlassPanel`, `Crossfader`, `LiveParamRow`,
`Waveform`, `TargetCell`, `StatusStrip`, `UiIcon`, `generate/Timeline`, `generate/TrackLane`,
`layout/{Header,MainLayout,PreviewPanel}`.

**Hard constraints:** no backend / mediator / WS-protocol / Python changes; no run/preset/export
FORMAT changes; reuse the existing reactive paths (`runLfos` @120ms, `processBeat` @50ms,
`sendControl("liveParam", …)`, `paramSources`, `lfos[].targets[]`) — do NOT reinvent them.

---

# PART 1 — CLUTTER BREAKDOWN (what's making it hard to use)

Ranked by how much they hurt "instrument without thinking":

### C1. Duplicate markup: old inline blocks still live alongside new components
The new components were ADDED but the OLD pre-migration markup was never REMOVED. Evidence:
- LIVE (template lines ~236–547, 311 lines) contains BOTH the new GlassPanel HUDs (lines 77, 92,
  in the preview overlay) AND the old Performance deck markup (crossfader subtitle at line 324,
  etc.) lower down.
- Result: redundant controls, two crossfaders, visual noise, and uncertainty about which is live.
**Fix:** for each view, the new component is the single source of truth; delete the old inline
markup it replaced.

### C2. The entire "Bottom context panel" (`.context`, template lines ~1938–2060)
A SECOND full set of `v-if="currentTab===…"` blocks for all 8 views, existing only to show chip
summaries ("Crossfader: 0.50", "Slots: 3", "Model: …", "Beat & MIDI status"). This is ~120 lines
of pure redundancy duplicating state already shown in the controls. It competes for attention and
adds nothing a performer needs mid-play.
**Fix:** DELETE the `.context` panel entirely. If any single datum there is genuinely useful
(e.g. live crossfader %), it already belongs on the relevant control (the Crossfader component
shows its own %). Do not preserve the panel.

### C3. `App.vue` monolith (6,639 lines)
All 8 views' templates + all state + all methods in one file. This is why changes feel risky and
the UI feels heavy — there's no separation. Per-view template spans (current):
LIVE 311 · PROMPTS 357 · MOTION 38 · MODULATION 113 · AUDIO 88 · RUNS 188 · SETTINGS 398 ·
GENERATE 209.
**Fix:** extract each view's template into a view component (see Part 3). State stays in App.vue
(passed as props / emits) to avoid a risky state-management rewrite — extraction is mechanical,
not a logic change.

### C4. Form-heavy controls that should be visual (per earlier facelift briefs)
- MODULATION LFO cards: shape/BPM/speed/depth as four stacked full fields dominating each card;
  Waveform present but secondary. Should be waveform-first, controls compact.
- AUDIO mappings: target/freq/output stacked as full fields; no live band visualizer.
- LIVE Parameters: long always-visible slider list on the stage.
**Fix:** apply the waveform-first / visualizer-first / pinned-params patterns from the facelift
briefs (already specced) now that components exist.

### C5. Scattered hard-coded hex still in `.framesync-*` classes + inline styles
Tokens exist but many old classes still use raw hex (`#061726`, `#0c2c3f`, `#ff8a1a`, …).
**Fix:** replace with tokens during each view's pass; grep must come back clean at the end.

---

# PART 2 — THE INSTRUMENT PRINCIPLE (what "works without thinking" means)

Every view, after declutter, should obey:
1. **One control per job, visible once.** No duplicate crossfaders, no chip panel echoing values.
   If a value is shown, it's shown on the control that sets it.
2. **The thing you watch is biggest.** Preview (LIVE/MOTION), waveform (MODULATION), band meter
   (AUDIO), timeline+preview (GENERATE) dominate; numeric setup shrinks or hides until needed.
3. **State is visible at a glance via the shared semantic:** `--live` teal = active/modulated,
   dim = idle, `--accent` = selected, A=blue / B=pink. Already tokenized — apply consistently.
4. **Setup vs. performance split:** rarely-changed config (full Parameters list, Deforum settings,
   freq/output numbers) lives behind a drawer/expand; the performance surface stays clean.
5. **No dead space, no letterbox** (preview `object-fit: cover` or blurred backdrop).

---

# PART 3 — EXECUTION ORDER (each step independently shippable)

### Step 1 — Delete C2 (the bottom context panel)
Remove the `.context` block (template ~1938–2060) and its `.context` CSS. Smallest, highest-
clarity win; removes ~120 lines and a whole redundant render path. Ship.

### Step 2 — LIVE: remove C1 duplication, finish the stage
- Keep the GlassPanel MORPH (line ~92) + MODULATING NOW (line ~77) overlays as the ONLY morph &
  modulation surface. Delete the old Performance-deck inline markup lower in the LIVE block
  (the duplicate crossfader/subtitle ~324 and its siblings).
- Move the Parameters slider list + Deforum settings into a drawer that slides over the preview;
  default stage shows preview + 2 HUDs + a pinned-params subset only.
- Pinned params: use a LOCAL `pinnedParams` set (already present in data, line ~2218,
  localStorage-backed) — do NOT conflate with the WS collab lock (`toggleParamLock`). The 🔒 stays
  collab-lock; pinning is the separate local concept. (Resolves open question #1 → Option B.)
- Preview full-bleed (`object-fit: cover`), HUDs float; provide a docked fallback flag.
Ship.

### Step 3 — MODULATION: waveform-first cards + shared target grid
- Promote `Waveform` (line ~975) to card hero; demote shape/BPM/speed/depth to a compact 2×2 or
  expand-on-click. Active card teal border + dot; idle dim + "off".
- Ensure the `TargetCell` grid (line ~1016) is the shared routing surface; multi-source cells show
  all owners (the component already accepts an owner array per the notes).
- Animate `Waveform` from the REAL LFO state: it already receives `:phase="lfo.phase"` — drive the
  visible phase from the same `runLfos` 120ms loop / `lfo.phase` so motion matches real timing and
  freezes when `lfo.on` is false. No fixed CSS keyframes. (Confirm `lfo.phase` advances in
  `runLfos`; if so the wave is already honest — just render it.)
- Beat Macros strip: purple pills, pulse on `processBeat`.
Ship.

### Step 4 — AUDIO: visualizer-first mappings
- Add a live frequency band meter per mapping (hero), driven by the existing audio analysis
  (`audioMappings`, spectrogram path already in data ~2264). Demote freq/output to compact inputs.
- Target name teal/`--live`; quick-band presets as pill row; Start turns teal when running.
Ship.

### Step 5 — MOTION: enlarge the XY pad
- `xyPad.padSize` is already 420 in data (~2262) but the rendered pad is small — make the pad the
  dominant element, glowing puck, live X/Y readout (binds `motionPadValues`). Preset row above.
Ship.

### Step 6 — GENERATE: timeline dock (per the timeline-dock brief)
- Use `generate/Timeline` (line ~1792) + `TrackLane`; relocate to a full-width dock under the
  preview with the frame filmstrip + single position indicator on a shared time axis;
  compact/expand toggle. Export JSON byte-identical.
Ship.

### Step 7 — PROMPTS / SETTINGS / RUNS: declutter + tokenize
- PROMPTS (357 lines) and SETTINGS (398 lines) are the biggest blocks — restyle to tokens,
  remove any leftover duplicate markup, A=blue/B=pink on LoRA groups. SETTINGS/GPU/Presets logic
  untouched. RUNS table tokenized; add the LIVE recent-runs rail if not present.
Ship.

### Step 8 — View extraction (C3) + final hex sweep (C5)
- Mechanically extract each `currentTab` template block into
  `components/views/{Live,Prompts,Motion,Modulation,Audio,Runs,Settings,Generate}View.vue`,
  passing state down as props and emitting events up (state stays in App.vue). This is the
  refactor that makes the codebase maintainable; do it AFTER the visual work so diffs stay legible.
- Final pass: grep `docker/web/src` for hard-coded hex (`#[0-9a-fA-F]{6}`) outside `style.css`
  `:root`; replace remaining with tokens. Confirm `--live`/A/B semantics hold across all views.

---

# PART 4 — ACCEPTANCE
- No `.context` bottom panel; no duplicate crossfader/controls anywhere (C1/C2 gone).
- Each view: one control per job; the watched element (preview/waveform/meter/timeline) dominates;
  setup hidden behind drawers/expand.
- MODULATION waveforms animate from real `lfo.phase`, freeze when off; AUDIO meters from real
  analysis; neither faked. Beat macros pulse on `processBeat`.
- `--live` teal / A-blue / B-pink consistent everywhere; no hard-coded hex outside `:root`.
- Pinned params = local state, separate from WS collab lock (Option B).
- All existing behavior intact: `runLfos`, `processBeat`, `sendControl`, routing, presets, GPU
  pool, MIDI bindings unchanged; Export JSON + preset formats byte-identical.
- App.vue reduced substantially; views extracted to `components/views/`.

# PART 5 — OPEN QUESTIONS (resolve with stakeholder; defaults chosen above)
1. Pin vs lock → defaulted to Option B (separate local pin). Confirm.
2. LIVE HUD floating vs docked default → defaulted to floating + docked fallback flag. Confirm.
3. Snap-A/B/Randomize → Snap sets crossfader 0/1, Randomize random 0–1, no backend change. Confirm.
4. Bottom context panel → defaulted to DELETE. Confirm nothing downstream reads it.
