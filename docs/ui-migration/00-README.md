# UI migration — design language

This folder is the canonical reference for migrating the Defora web UI to the
**instrument** design language (control panel → performance surface).

| File | Purpose |
|------|---------|
| [style-guide.md](./style-guide.md) | Buttons, pills, tokens, and component class names |
| [../ui-refactor/02-mockups.html](../ui-refactor/02-mockups.html) | Full-page visual mockups (open in browser) |
| [../ui-refactor/01-declutter-brief.md](../ui-refactor/01-declutter-brief.md) | Declutter execution order and acceptance criteria |

**Core rule:** teal `--live` = active/modulated · purple `--accent` = selected ·
A = blue · B = pink · idle controls use `--bg-3` inset surfaces.

Implementation lives in `docker/web/src/style.css` (`:root` tokens + `.framesync-button` system).
