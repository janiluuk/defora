# Web UI docs (moved)

UI design and navigation documentation now lives in the repository docs tree:

- **[docs/design/](../../docs/design/)** — style guide, mockups, tab reference
- **[docs/design/web/](../../docs/design/web/)** — feature flow and navigation maps

Regenerate screenshots from `docker/web`:

```bash
npm run capture-ui-shots      # README tour PNGs → docs/design/screenshots/readme/
npm run audit-screenshots     # full audit → docs/design/screenshots/audit-<timestamp>/
```
