## Deforumation CLI control panel

`sd_cli/deforumation_cli_panel.py` is a lightweight terminal UI that talks to the Deforumation mediator websocket (default `localhost:8766`). It mirrors the core live controls—noise, strength/CFG, pan/zoom (x/y/z), rotation (x/y/z), FOV—and lets you bump values while Deforum is running.

### Running
- Ensure the Deforumation mediator is up (same requirement as the Qt UI).
- From the repo root: `python -m sd_cli.deforumation_cli_panel`  
  Use `--host`/`--port` to point at a non-default mediator if needed.

### Keys
- Up/Down: move selection
- Left/Right or `-`/`+`: adjust the selected control by its step
- `r`: reload live values from the mediator
- `b`: rebind increase/decrease hotkeys for the selected control
- `q`: quit
- The per-control hotkeys shown in the list (e.g., `a/d` for Pan X) adjust values immediately.

### Config and bindings
- Bindings persist in `deforumation_cli_bindings.json` (auto-created next to the script).
- Default mediator host/port can be overridden via that file or env vars `DEFORUMATION_MEDIATOR_HOST` / `DEFORUMATION_MEDIATOR_PORT`.
- On start the panel enables the `should_use_deforumation_*` toggles so live tweaks are respected by Deforum.
