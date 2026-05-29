# Defora Web UI — Design System & Instrument Language

This is the canonical reference for the Defora web UI design system.
Detailed sub-documents live under [`docs/ui-migration/`](ui-migration/) and [`docs/ui-refactor/`](ui-refactor/).

---

## The one rule

> **One control per job · the thing you watch is biggest · teal = live/modulated · A = blue / B = pink · setup hidden until needed.**

Every screen decision flows from this rule.

---

## Visual mockups

Open **[`docs/ui-refactor/02-mockups.html`](ui-refactor/02-mockups.html)** in any browser.

Contains full-page visual targets for all 7 views in the simplified instrument language:
- LIVE (stage + glass HUDs)
- MODULATION (patch bay — LFO cards waveform-first)
- MOTION (XY pad hero + sequencer dock)
- PROMPTS (A/B morph deck + LoRA crossfader)
- STREAM, LIBRARY, SETTINGS

Read the mockups as **language, not pixels**: they're reference scale, waveforms are static stills, the real app animates from `lfo.phase` / live FFT.

---

## Design tokens

All tokens are defined in `docker/web/src/style.css` `:root`. Never use hardcoded hex in Vue templates or component styles.

| Token | Value | Semantic use |
|-------|-------|-------------|
| `--bg-3` | `#14161f` | Idle button fill, inset surfaces |
| `--border` | `#2a2d3a` | Hairline borders (0.5 px) |
| `--text-secondary` | `#9a9db0` | Idle labels |
| `--live` | teal | Running / modulated / on |
| `--live-text` | light teal | Text on live surfaces |
| `--accent` | purple | Selected option in a mutually exclusive group |
| `--accent-text` | light purple | Text on accent surfaces |
| `--a-group` | blue | A-side in any A/B pair |
| `--b-group` | pink | B-side in any A/B pair |
| `--error` | red | Destructive actions |
| `--radius-sm` | `7px` | Standard corner radius |

---

## Control component system

### Text buttons — `.framesync-button`

The primary interactive primitive. Default (idle) appearance:

```css
font-size: 11px;
padding: 6px 12px;
border-radius: var(--radius-sm);
border: 0.5px solid var(--border);
background: var(--bg-3);
color: var(--text-secondary);
```

**Variants** — add as modifier classes:

| Modifier | When to use |
|----------|-------------|
| *(none)* | Secondary actions: Refresh, Save, + Add, Export, Edit |
| `.active` | Currently selected item in a mutually exclusive group (preset chip, sub-mode, LFO link target) |
| `.framesync-button--live` | Feature is **on** or actively running (Play, On, Start, Apply LoRAs) |
| `.framesync-button--accent` | Explicit accent emphasis — Snap A/B on the Crossfader rail |
| `.framesync-button--danger` | Remove / delete (compact destructive action) |
| `.framesync-button--compact` | Tighter padding for toolbars, ✕ icons, inline rows |
| `:disabled` | 0.45 opacity, `pointer-events: none` |

**Never** use amber `--warn` for selected state (legacy FrameSync holdover).

### Segmented pills — `.sub-pill`

Sub-tab navigation (used in PROMPTS, SETTINGS, MODULATION). Active tab uses `--accent` fill, not B-group pink.

### Option chips — `.chip`

Binary or multi-select toggles inside panels (output surface selector, motion preset quick row, line options). Active chip uses accent border. A/B assignment buttons use `.prompt-group-button--a` / `--b` for blue/pink identity.

### Transport — `.control-btn`

Preview transport (Play, Frame, Record) in the stage header bar. `.playing` → `--live` teal; `.recording` → `--error` pulse.

### Specialised transport — `.stage-sequencer-bar__btn`

Icon-only compact transport inside the sequencer dock. Not a general-purpose button; keep as-is.

### Top-level navigation — `.tab`

Top tab bar. Each tab gets a per-tab accent hue (`.tab--live`, `.tab--prompts`, etc.) for wayfinding — intentional, not a control-chrome pattern.

---

## Per-view hero element

| View | Hero / "watched thing" | Setup surfaces |
|------|------------------------|----------------|
| LIVE | Full-bleed stage preview + glass HUD overlay | Parameters drawer, Deforum settings drawer |
| STREAM | HLS stream preview thumbnail + status badge | Destination list |
| LIBRARY | Runs table / video browser | Detail pane (modal), editor |
| PROMPTS | Prompt editors + crossfader A/B deck | Sub-tabs (IMAGE, LORA, CONTROLNET, STORY) |
| MOTION | XY pad (Move + Look) or 3D path preview | Preset chips, smoothness toggle, sequencer dock |
| MODULATION | LFO waveform card (waveform dominant, controls below) | Audio / Beat / Mappings sub-tabs |
| SETTINGS | Engine status card (model + CFG + steps) | MIDI / GPU / Styles / System sub-tabs |

---

## Declutter rules (from the refactor brief)

The full brief is at [`docs/ui-refactor/01-declutter-brief.md`](ui-refactor/01-declutter-brief.md). Key rules:

1. **One crossfader per view** — if a new component was added, the old inline markup it replaced must be deleted. Never two crossfaders on screen.
2. **No bottom context panel** — the `.context` strip (duplicating chip summaries of every tab's state) has been removed. If a live value is useful it belongs on the control that owns it.
3. **Waveform-first LFO cards** — waveform preview is the dominant element (top half of the card); shape/BPM/speed/depth are compact controls underneath, not stacked full-width fields.
4. **Hidden until needed** — parameters drawer collapses; sub-tabs hide sections not in use; stage sequencer docks below the pad on MOTION (no separate GENERATE tab).
5. **No hex in Vue templates** — all colors via CSS variables only.

---

## Component inventory

Reusable primitives in `docker/web/src/components/`:

| Component | Role |
|-----------|------|
| `GlassPanel.vue` | Glassmorphic panel card with optional header slot |
| `Crossfader.vue` | A/B morph rail with snap-A / snap-B / randomize chrome |
| `LiveParamRow.vue` | Single parameter row with source indicator and pin/lock |
| `Waveform.vue` | Animated SVG waveform (fed `lfo.phase`) |
| `TargetCell.vue` | Routed target chip inside an LFO or beat macro card |
| `StatusStrip.vue` | Health / session / FPS strip used in the stage header |
| `UiIcon.vue` | Icon abstraction (name prop → inline SVG) |
| `layout/Header.vue` | Top nav bar with tab buttons and transport controls |
| `layout/MainLayout.vue` | Two-column shell (panel + stage) |
| `layout/PreviewPanel.vue` | Right-side stage with layer switching |
| `generate/Timeline.vue` | Sequencer timeline canvas |
| `generate/TrackLane.vue` | Single keyframed track row |
| `views/LiveView.vue` | LIVE tab content |
| `views/StreamView.vue` | STREAM tab content |
| `views/LibraryView.vue` | LIBRARY tab content |
| `views/PromptsView.vue` | PROMPTS tab content (all sub-tabs) |
| `views/MotionView.vue` | MOTION tab content |
| `views/ModulationView.vue` | MODULATION tab content |
| `views/SettingsView.vue` | SETTINGS tab content |

View components receive their state as props from `App.vue` and emit events back. All reactive paths (`runLfos`, `processBeat`, `sendControl`) stay in `App.vue`.

---

## Current compliance status

See [`docs/ui-refactor/03-ux-audit.md`](ui-refactor/03-ux-audit.md) for the full per-component audit. Summary:

| Area | Status |
|------|--------|
| Design tokens (`:root`) | ✅ Centralized |
| View extraction to `components/views/` | ✅ Done |
| `.framesync-button` adoption across all views | ✅ Done |
| Semantic colors (teal/accent/A blue/B pink) | ✅ Consistent |
| One control per job (no duplicate crossfaders) | ✅ Done |
| Waveform-first LFO cards | ✅ Done |
| Bottom `.context` panel removed | ✅ Done |
| Hard-coded hex in Vue templates | ✅ Clean |
| AUDIO reactive meters (mini-bars per band) | ⚠️ Future pass |

---

## Extending the system

When adding a new control:

1. Use `.framesync-button` with the appropriate modifier — do not invent a new button class.
2. Place setup/configuration behind a sub-tab or collapsible drawer, not inline with the hero.
3. Use `--live` for "this is actively running", `--accent` for "this is the selected option". Never swap them.
4. If the new surface has an A/B concept, use `--a-group` / `--b-group` and reuse `Crossfader.vue`.
5. Animate from existing reactive paths; do not add new `setInterval` or polling loops.
