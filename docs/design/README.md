# Defora UI design documentation

Canonical reference for the **instrument** design language (control panel → performance surface) and web UI information architecture.

## Start here

| Document | Purpose |
|----------|---------|
| [UI_DESIGN.md](./UI_DESIGN.md) | High-level design goals and shell overview |
| [style-guide.md](./style-guide.md) | Buttons, pills, tokens, component class names |
| [mockups.html](./mockups.html) | Full-page visual mockups (open in browser) |
| [declutter-brief.md](./declutter-brief.md) | Declutter execution order and acceptance criteria |
| [ux-audit.md](./ux-audit.md) | Component compliance audit vs style guide |
| [WEB_UI_TABS.md](./WEB_UI_TABS.md) | Tab / sub-tab reference |
| [migration-notes.md](./migration-notes.md) | Framework discovery notes from the U-21 migration |

## Web UI IA (implementation)

| Document | Purpose |
|----------|---------|
| [web/README.md](./web/README.md) | How to update navigation docs |
| [web/UI-FEATURE-FLOW.md](./web/UI-FEATURE-FLOW.md) | Feature flow diagrams by tab and shell region |
| [web/UX-NAVIGATION-MAP.md](./web/UX-NAVIGATION-MAP.md) | Z-index, shortcuts, access paths |

## Roadmaps & plans

| Document | Purpose |
|----------|---------|
| [web-preview-compositor-roadmap.md](./web-preview-compositor-roadmap.md) | Preview compositor roadmap |
| [creaprompt-integration-plan.md](./creaprompt-integration-plan.md) | Creaprompt integration plan |

## Audits & screenshots

- [audits/](./audits/) — dated UX audit write-ups
- [screenshots/](./screenshots/) — captured UI states (README tour PNGs in `screenshots/readme/`)

Regenerate README tour shots:

```bash
cd docker/web && npm run capture-ui-shots
```

Full audit capture:

```bash
cd docker/web && npm run audit-screenshots
# or: OUT_DIR=../../docs/design/screenshots/audit-$(date +%Y-%m-%d) npm run audit-screenshots
```

**Core rule:** teal `--live` = active/modulated · purple `--accent` = selected · A = blue · B = pink · idle controls use `--bg-3` inset surfaces.

Implementation: `docker/web/src/style.css` and `docker/web/src/App.vue`.
