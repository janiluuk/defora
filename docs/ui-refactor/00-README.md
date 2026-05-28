# Defora instrument-UI handoff

**Button / control spec:** [../ui-migration/style-guide.md](../ui-migration/style-guide.md)

Two files, used together:

1. **`01-declutter-brief.md`** — the instructions. What to remove, what to wire, the execution
   order, and acceptance criteria. Grounded in the actual source (`docker/web/src/App.vue`,
   Vue 3 Options API, components already built). Start here.

2. **`02-mockups.html`** — the visual target. Open in any browser. All 8 views in the simplified
   instrument language: LIVE (stage), MODULATION (patch bay), MOTION + AUDIO, GENERATE (timeline
   dock), PROMPTS + RUNS + SETTINGS. This is what "done" looks like.

3. **`03-ux-audit.md`** — component-by-component compliance audit against the style guide, with
   status table, gaps, and verification commands. Update after each UI migration pass.

## The one rule that unifies everything
One control per job · the thing you watch is biggest · teal = live/modulated · A = blue / B = pink
· setup hidden until needed.

## Read the mockups as language, not pixels
- They're scaled for viewing; the real app is full-width, so cards get more room.
- Waveforms and band meters are STATIC here — in the app they animate from real timing
  (`lfo.phase` for LFOs, live FFT for audio). Static is not the target.
- MOTION+AUDIO and PROMPTS+RUNS+SETTINGS are paired per screen for compactness; each is its own
  full view in the app.

## Non-negotiables (from the brief)
No backend / mediator / WS-protocol / Python changes. No run/preset/export FORMAT changes
(byte-identical diff). Reuse existing reactive paths (`runLfos`, `processBeat`, `sendControl`).
Pinned params = local state, separate from the WS collab lock.

## Open questions to confirm before building (defaults chosen in the brief)
1. Pin vs lock → separate local pin (Option B).
2. LIVE HUD floating vs docked default → floating + docked fallback flag.
3. Snap-A/B/Randomize → crossfader 0 / 1 / random, no backend change.
4. Bottom context panel → delete.
