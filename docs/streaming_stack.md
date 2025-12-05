# Live streaming stack (docker-compose)

This repo ships a minimal streaming stack so you can view generated frames as HLS in a browser and send modular controls.

## Components
- `encoder` (ffmpeg): reads `frames/frame_*.png` and pushes RTMP to the web node.
- `web` (Nginx+RTMP + Node): ingests RTMP, writes HLS to `/hls`, serves a simple HLS.js player and a WebSocket control bridge (forwards to RabbitMQ).
- `mq` (RabbitMQ): lightweight message bus for controls/events.
- `control-bridge` (Python): subscribes to the `controls` queue and forwards payloads to the mediator.

## Quick start
```bash
# from repo root
docker-compose up --build
# drop/rsync frames into the shared volume
cp path/to/frames/frame_*.png /var/lib/docker/volumes/sd-cli_frames/_data/
# (optional) set a control token to gate WebSocket clients:
#   CONTROL_TOKEN=secret docker-compose up --build
# open the player
open http://localhost:8080
```

### Environment knobs
- `FPS` (encoder): defaults to 24.
- `RESOLUTION` (encoder): `width:height`, defaults to `1280:720`.
- `RABBIT_URL` (web/node): defaults to `amqp://mq`.
- `CONTROL_TOKEN` (web/node): shared secret for WS clients (omit for open access).
- `MEDIATOR_HOST` / `MEDIATOR_PORT` (control-bridge): where to push controls.

### URLs/ports
- Player: `http://localhost:8080` (polished UI with live controls, stats, prompts/morphing, ControlNet sliders, and HLS preview)
- HLS manifest: `http://localhost:8080/hls/deforum.m3u8`
- RTMP ingest (for encoder): `rtmp://localhost:1935/live/deforum`
- RabbitMQ mgmt: `http://localhost:15672` (user/pass: guest/guest)
- Control WebSocket: `ws://localhost:8080` (send `{type:"control", token, controlType, payload:{...}}`)
- Dashboard presets: load `--preset <name>` or save `--save-preset <name>` (stored under `deforumation/presets/`).

## Controls flow
- Browser ↔ WebSocket (on the same host/port as the player).
- Web server validates schema/token and forwards `{controlType, payload}` to the `controls` queue on RabbitMQ.
- `control-bridge` consumes `controls` and writes payload keys/values to the mediator via `MediatorClient`.
- Other consumers (e.g., encoder tweaks) can subscribe to the same queue if needed.

## Notes
- The ffmpeg encoder waits for at least one frame in `/data/frames` before starting.
- HLS fragments are written to the `hls` volume; Nginx serves them with permissive CORS.
- This is a starter stack; extend the Node server to add richer control schemas or auth flows, and tailor the bridge to your mediator parameters.
