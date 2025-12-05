## CLI workflow: generate, continue, stream, monitor

### Targets
- Set `FORGE_API_BASE` to pick the server (see `deforum_servers.md` for your 101/104 IPs).

### Start a new run (ad-hoc)
- With prompts only:
  - `python -m sd_cli.deforumation_request_dispatcher --prompt "a city at night" --negative "text, watermark" --frame-count 240 --steps 18 --strength 0.6 --cfg 6.0 --execute`
- With a Deforum JSON preset:
  - `python -m sd_cli.deforumation_request_dispatcher --preset my_preset.json --execute`
- Add an init image to “continue” style:
  - `python -m sd_cli.deforumation_request_dispatcher --mode continue --init-image last.png --preset my_preset.json --execute`

### Rerun/continue from saved runs
- In `sd_cli/deforumation_runs_cli.py`: select a run, set overrides, `R` (rerun) or `c` (continue). It writes `*_request.json` and, if `DEFORUMATION_AUTO_DISPATCH=1`, dispatches in the background via `sd_cli/forge_cli.py`.
- Dispatcher can execute a saved request:
  - `python -m sd_cli.deforumation_request_dispatcher --request runs/<id>/rerun_request.json --execute`

### Stream the render
- `python -m sd_cli.stream_helper start --source runs/<id>/frames --target rtmp://…/key --fps 24`
- `python -m sd_cli.stream_helper status` / `stop`
  - Uses low-latency H.264 preset (zerolatency, small GOP).

### Monitor live output
- `python -m sd_cli.monitor_cli --frames runs/<id>/frames`
- Or rely on auto-detect: set `DEFORUMATION_FRAMES_DIR`, or it will pick the latest `runs/*/frames`. Set `DEFORUMATION_ASCII_PREVIEW=1` for ASCII thumbnails (requires Pillow).

### Audio-reactive modulation
- Build or stream parameter schedules from audio bands: `python -m sd_cli.audio_reactive_modulator --audio song.wav --fps 24 --mapping mappings.json --output audio_mod.json`
  - `--live` sends values to the mediator in real time; `--mapping` can be a JSON file or inline array with `param`, `freq_min/freq_max`, `out_min/out_max`.

### Live controls
- `sd_cli/deforumation_cli_panel.py`: live tweak strength/CFG/noise/xyz/rot/fov via mediator.
- Mediator host/port can be set via env or config; ensures “should_use” flags are enabled on start.
