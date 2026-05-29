# Web preview compositor roadmap

Goal: always show a smooth WebGL standby animation on load, then optionally crossfade to Deforum (or show both).

## Phase 1 — Shipped in this change

| Item | Behavior |
|------|----------|
| Cold start | **WebGL** layer selected; Three.js runs immediately |
| Deforum HLS | Loads in the background; does not cover WebGL until frames exist or playback starts |
| Auto transition | When `autoTransitionToDeforum` is on (default) and the user has not picked a layer, switch to **Deforum** once generated frames appear |
| **Both** layer | New preview tab: WebGL + Deforum video (blended) |
| Runs browser | `/api/runs` backed by server `runsDir`; Library tab lists saved runs |
| E2E | Playwright verifies WebGL on load + run persists in browser after reload |

## Phase 2 — Shipped

| Item | Behavior |
|------|----------|
| Crossfade | `previewCompositorCrossfadeMs` (0–5000) → `--preview-compositor-crossfade-ms` on the preview stage |
| Promote | **Deforum →** in Animation Engine + **Promote to Deforum** in LIVE → Controls (compositor section) |
| Blend dim | WebGL layer opacity scales with forge blend when **Both** is active |
| Remember layer | `rememberCompositorLayerOnStartup` skips forcing WebGL on cold start |

Tests: `docker/web/test/preview-compositor.spec.js`

## Phase 3 — Advanced

- Audio-reactive crossfade (LFO drives `deforum` vs `webgl` mix)
- Per-run thumbnail rail sync with compositor state
- GPU texture share: feed last Deforum frame into WebGL as background

## User controls

1. **Preview tabs** (under video): WebGL · Deforum · Both · Input
2. **LIVE → Controls → Animation Engine**: style/mode sliders (WebGL only)
3. **LIBRARY → Runs Browser**: saved clips from disk (`run.json` + thumbs)

## Storage model

| Data | Location |
|------|----------|
| Runs / clips | `RUNS_DIR` on server (`/data/runs` in prod, temp dir in tests) |
| UI session | `localStorage` key `defora_session_<name>` |
| Uploads / recordings | `uploadsDir` + video-swarm API |

E2E tests boot `server.js` with isolated temp dirs to prove the UI is wired to real storage, not mocks.
