# UX audit — instrument design language compliance

**Date:** 2026-05-27  
**Spec:** [../ui-migration/style-guide.md](../ui-migration/style-guide.md) · [01-declutter-brief.md](./01-declutter-brief.md) · [02-mockups.html](./02-mockups.html)

## Executive summary

| Area | Status | Notes |
|------|--------|-------|
| Design tokens (`:root`) | ✅ | Centralized in `docker/web/src/style.css` |
| View extraction | ✅ | `components/views/*` for all main tabs |
| Bottom `.context` panel | ✅ | Removed (C2) |
| `.framesync-button` adoption | ⚠️ → ✅ | `LiveSequencerDock`, stage sequencer bar, Settings danger actions migrated in this pass |
| Semantic colors (teal live / accent select / A blue / B pink) | ✅ | Consistent in PROMPTS LoRA, Crossfader, modulation cards |
| One control per job | ✅ | MOTION: side pad + bottom sequencer (no duplicate sub-tabs) |
| Hero surfaces per view | ⚠️ | LIVE preview, MODULATION waveform, MOTION pad strong; AUDIO reactive meters still form-heavy |
| Hard-coded hex outside `:root` | ⚠️ | Tab accent hues and a few legacy utility colors remain in `style.css` only (acceptable); no hex in Vue templates |

## The one rule (checklist per screen)

| View | Watched element | Setup hidden? | Control classes |
|------|-----------------|---------------|-----------------|
| LIVE | Full-bleed preview + glass HUDs | Params in drawer | `control-btn`, `chip`, `framesync-button`, `sub-pill` |
| STREAM | Output status + destinations | — | `framesync-button` |
| LIBRARY | Runs table / frame rail | Detail modal | `framesync-button` |
| PROMPTS | Prompt editors / LoRA groups | Sub-tabs for sections | `sub-pill`, `framesync-button`, `chip`, A/B group buttons |
| MOTION | XY pad + 3D path | Presets via chips + select | `chip`, `framesync-button`, `framesync-select` |
| MODULATION | LFO waveform hero | Compact 2×2 under wave | `sub-pill`, `framesync-button`, `modulation-route-pill` |
| SETTINGS | Engine / GPU / presets | Sub-pills | `sub-pill`, `framesync-button` |
| GENERATE / sequencer | Timeline under preview | Expand “Edit” dock | `stage-sequencer-bar__btn` (icon transport), `framesync-button` |

## Component audit

### ✅ Aligned

| Component | Pattern |
|-----------|---------|
| `Crossfader.vue` | Dedicated snap/randomize chrome (documented exception) |
| `LiveView.vue` | `framesync-panel`, `chip`, `control-btn`, `sub-pill` |
| `ModulationView.vue` | Waveform-first LFO cards, `framesync-button` toggles |
| `PromptsView.vue` | `sub-pill`, `prompt-group-button--a/b`, `framesync-button` |
| `LibraryView.vue` | Table actions use `framesync-button--danger` for delete |
| `StreamView.vue` | All actions `framesync-button` |
| `MotionView.vue` | Pad hero, `framesync-select`, preset chips (quick row) |
| `MorphCrossfaderPanel.vue` / `LoraCrossfaderPanel.vue` | `framesync-button` |
| `VideoSwarmBrowser.vue` | `framesync-button` + compact/danger variants |
| `SequencerControlsPanel.vue` (expanded) | `framesync-button` in details |
| `GlassPanel.vue`, `LiveParamRow.vue`, `Waveform.vue`, `TargetCell.vue` | Design-system primitives |

### Fixed in this pass

| Component | Issue | Fix |
|-----------|-------|-----|
| `LiveSequencerDock.vue` | Legacy `live-seq-btn` (custom hex, 44px chrome) | → `framesync-button` / `framesync-input` / `framesync-select` |
| `SequencerControlsPanel.vue` (stage bar) | `stage-sequencer-bar__text-btn` parallel button system | → `framesync-button--compact` |
| `SettingsView.vue` | Inline `border-color:var(--error)` on delete buttons | → `framesync-button--danger` |
| `style.css` | `#ffb4b4` on `.live-seq-btn--danger` | → `var(--error-text)` (class retained for any stragglers) |

### Intentional specialized chrome (not `framesync-button`)

| Class | Use |
|-------|-----|
| `.control-btn` | Preview transport (play / frame / record) — same inset language as style guide |
| `.header-transport__btn` | Global header transport |
| `.stage-sequencer-bar__btn` | Compact icon-only sequencer transport |
| `.sub-pill` | Sub-tab navigation |
| `.chip` | Binary toggles, motion quick presets |
| `.tab` | Top-level navigation |
| `.crossfader-*` | Morph A/B rail |

### Remaining gaps (future passes)

1. **AUDIO reactive polish** — optional stacked mini-bars inside each meter card (mockup SVG style); core meter-first layout shipped.
2. **Tab accent colors** — per-tab hues in `style.css` (`.tab--live`, etc.) are intentional wayfinding, not control chrome.
3. **`live-seq-*` layout utilities** — time readout / dock shell classes remain; only button styles deprecated.
4. **`param-pin-btn` / `param-lock-btn`** — emoji icon affordances on param drawer; acceptable micro-controls.
5. **Final hex sweep** — grep `docker/web/src` for `#[0-9a-fA-F]{6}` in Vue files should stay clean; optional tokenization of tab accents.

## Button migration rules (quick reference)

```
Secondary action     → .framesync-button
Selected in group    → .framesync-button.active
Running / on         → .framesync-button--live
Morph / snap accent  → .framesync-button--accent
Delete               → .framesync-button--danger (+ --compact in tables)
Toolbar tight        → .framesync-button--compact
Sub-tab              → .sub-pill.active
Binary toggle        → .chip.active
Preview transport    → .control-btn (.playing / .recording)
```

Do **not** use `--warn` amber for selected state (legacy FrameSync).

## Verification commands

```bash
cd docker/web
npm run sync-app-definition   # after Vue template changes
npm test
npm run build
```

## Sign-off criteria (from brief Part 4)

- [x] No `.context` bottom panel
- [x] Views extracted to `components/views/`
- [x] Primary actions use `framesync-button` (including sequencer docks)
- [x] MOTION: pad + sequencer visible together, no Performance/Sequencer sub-tabs
- [x] MODULATION/AUDIO: per-band meter cards + live levels from analysis (Reactive sub-tab)
- [x] Pinned params ≠ WS collab lock
- [x] Export / preset formats unchanged
