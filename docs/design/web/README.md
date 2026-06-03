# Web UI documentation

Docs for the Vue app in `docker/web/src/`. Parent index: [../README.md](../README.md).

Use these when changing navigation, panel placement, or discoverability.

| Document | Role |
|----------|------|
| [**UI-FEATURE-FLOW.md**](UI-FEATURE-FLOW.md) | **Canonical IA map** — Mermaid flow graphs of every feature by tab and shell region. Edit this first when restructuring; implement changes in `App.vue` and `*View.vue` to match. |
| [**UX-NAVIGATION-MAP.md**](UX-NAVIGATION-MAP.md) | Operational reference — z-index, collision rules, shortcuts, access paths, known duplicates. Update after layout changes land in code. |

## Restructuring workflow

1. Edit **UI-FEATURE-FLOW.md** (section 10 blank template or per-tab diagrams).
2. Open a PR with only doc changes, or doc + UI in the same PR — note “implements flow doc §X” in the description.
3. Change routing in `App.vue` (`tabs`, `switchTab`, `switchSubTab`, context panel `v-if` chain).
4. Move panels between `components/views/*` and `AnimationEnginePanel.vue` as needed.
5. Refresh **UX-NAVIGATION-MAP.md** tables if regions or shortcuts change.
6. Run `npm test` from `docker/web/`.

## Shell regions (quick glossary)

- **Top nav** — main tabs (LIVE, PROMPTS, MOTION, MODULATION, AUDIO, SETTINGS).
- **Status strip** — transport, health, GPU, MIDI, session.
- **Controls drawer** (left, `P`) — tab-specific context panel (`*View.vue`).
- **Engine drawer** (right, `E`) — `AnimationEnginePanel.vue` (layers + compositor).
- **Layers rail** (far right) — running layers, scenes, add source.
- **Stage** — video + WebGL; LIVE-only HUDs and MOTION bottom sequencer dock.
- **Library overlay** — full-screen; hides edge docks.

Legacy tab IDs still redirect: `RUNS` → Settings → RUNS, `GENERATE` → MOTION + sequencer, `STREAM` → Settings → OUTPUT.
