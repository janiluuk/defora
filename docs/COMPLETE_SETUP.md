# Complete Setup Guide - Deforum Mediator, Video Generation & Streaming

This guide covers the complete setup for all three core requirements:
1. **Connect to Deforum mediator** - Control SD-Forge/Deforum in real-time
2. **Generate live video from AI** - Stream AI-generated frames continuously
3. **Watch the resulting stream** - View the live HLS stream in a web player

## Prerequisites

- Docker and Docker Compose installed
- Git with submodule support
- (Optional) GPU-enabled machine for SD-Forge generation

## Quick Start (5 minutes)

### 1. Clone and Initialize Submodules

```bash
git clone https://github.com/janiluuk/defora.git
cd defora
git submodule update --init --recursive
```

The `deforumation` submodule provides:
- `mediator.py` - WebSocket mediator for real-time control
- Deforum bridge patches for SD-Forge

### 2. Verify Setup

```bash
./scripts/verify_setup.sh
```

This checks that all necessary components are present.

### 3. Start the Complete Stack

```bash
docker compose up --build
```

This starts:
- **mediator** (ports 8765, 8766) - Deforum control WebSocket server
- **control-bridge** - Connects web UI controls to mediator via RabbitMQ
- **web** (port 8080) - Nginx RTMP + Node.js WebSocket server + HLS player
- **encoder** - ffmpeg encoding frames to RTMP/HLS
- **mq** (RabbitMQ) - Message queue for control events
- **dev-frame-seeder** - (Optional) Test frame generator
- **sd-forge** - (Optional) SD-Forge with Deforum extension

### 4. Access the Web Player

Open your browser to: **http://localhost:8080**

You should see:
- Live HLS video player (auto-plays when stream is available)
- Control panels for:
  - LIVE - Vibe (CFG), Strength, Noise, Camera controls
  - PROMPTS - Positive/negative prompts, morphing
  - MOTION - Camera pad, zoom, tilt, motion presets
  - AUDIO/BEATS - Audio reactivity, LFOs, beat macros
  - CONTROLNET - ControlNet slot management
  - SETTINGS - Engine settings, MIDI mapping

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (localhost:8080)│
└────────┬────────┘
         │ WebSocket + HTTP
         ▼
┌─────────────────┐      ┌──────────────┐
│   Web Server    │◄────►│   RabbitMQ   │
│ (Nginx + Node)  │      │              │
└────────┬────────┘      └──────┬───────┘
         │ HLS                   │
         │                       │ Controls
    ┌────▼────┐           ┌─────▼──────┐
    │ Encoder │           │   Bridge   │
    │ (ffmpeg)│           │            │
    └────▲────┘           └─────┬──────┘
         │                      │ WebSocket
    ┌────┴────┐           ┌─────▼──────┐
    │ Frames  │           │  Mediator  │
    │ Volume  │           │ (8765/8766)│
    └─────────┘           └─────┬──────┘
                                │
                          ┌─────▼──────┐
                          │  SD-Forge  │
                          │  + Deforum │
                          └────────────┘
```

## Component Details

### 1. Deforum Mediator (Requirement 1: Connection)

**Location:** `deforumation/mediator.py` (from submodule)

**Ports:**
- 8765 - Deforum bridge connection
- 8766 - Deforumation UI / CLI tools connection

**Purpose:** Acts as a WebSocket relay between:
- SD-Forge Deforum extension (via bridge)
- CLI control tools (panel, dashboard, audio modulator)
- Web UI control bridge

**Start manually (optional):**
```bash
cd deforumation
python mediator.py \
  --mediator_deforum_address 0.0.0.0 \
  --mediator_deforum_port 8765 \
  --mediator_deforumation_address 0.0.0.0 \
  --mediator_deforumation_port 8766
```

**Docker:** The `mediator` service in `docker-compose.yml` runs this automatically.

### 2. Video Generation (Requirement 2: Live Video from AI)

#### Frame Generation
Frames can come from:

**A. SD-Forge + Deforum (Real AI generation)**
```bash
# Install SD-Forge separately or use docker service
docker compose up sd-forge mediator

# SD-Forge UI will be at http://localhost:7860
# Use Deforum extension to generate frames
# Frames output to shared volume
```

**B. Test Frame Seeder (Development)**
```bash
# Generates test frames with timestamps
docker compose up dev-frame-seeder

# Generates frames at 12 FPS to /data/frames
# Useful for testing the pipeline without SD-Forge
```

**C. CLI Generation**
```bash
# Use forge_cli to generate frames
./forge_cli deforum -f 240 "cyberpunk city, neon lights"

# Or use deforumation_runs_cli for managing runs
./deforumation_runs_cli
```

#### Encoding to HLS
The `encoder` service:
- Watches `/data/frames` directory
- Reads `frame_*.png` files
- Encodes to H.264 using ffmpeg
- Pushes RTMP stream to Nginx
- Nginx transcodes to HLS segments

**Configuration:**
```yaml
environment:
  - FPS=24              # Frame rate
  - RESOLUTION=1280:720 # Output resolution
```

### 3. Web Player (Requirement 3: Watch Stream)

**Location:** `docker/web/public/index.html`

**Features:**
- **HLS.js video player** - Plays live HLS stream with low latency
- **WebSocket controls** - Real-time parameter changes
- **Frame thumbnails** - Recent frames preview
- **Control panels:**
  - Live sliders (CFG, Strength, Noise, Camera)
  - Prompt editing and morphing
  - Motion presets and XY pad
  - Audio reactivity and LFOs
  - ControlNet slot management
  - MIDI mapping (WebMIDI API)

**Server:** Node.js + Express
- REST API at `/api/*`
- WebSocket at `/ws`
- Static files served by Nginx
- Proxied to port 3000

**URLs:**
- Player: `http://localhost:8080`
- HLS manifest: `http://localhost:8080/hls/deforum.m3u8`
- API health: `http://localhost:8080/api/health`
- Frames API: `http://localhost:8080/api/frames?limit=10`

### 4. Control Bridge

**Location:** `defora_cli/control_bridge.py`

**Purpose:** Connects web UI to mediator
1. Listens on RabbitMQ `controls` queue
2. Receives control messages from web UI
3. Forwards to mediator via `MediatorClient`

**Message format:**
```json
{
  "controlType": "liveParam",
  "payload": {
    "cfg": 6.5,
    "strength": 0.8,
    "translation_z": 1.5
  }
}
```

**Docker:** The `control-bridge` service runs this automatically.

## Advanced Usage

### Real-time Control via CLI

**Panel (live control):**
```bash
./deforumation_cli_panel --host localhost --port 8766
```

**Dashboard (full UI):**
```bash
./deforumation_dashboard --config deforumation/helpers/DeforumationSendConfig.json
```

**Audio reactivity:**
```bash
./audio_reactive_modulator \
  --audio track.wav \
  --fps 24 \
  --live \
  --mediator-host localhost \
  --mediator-port 8766
```

### Environment Variables

**Mediator:**
```bash
MEDIATOR_HOST=host.docker.internal  # For Linux hosts
MEDIATOR_PORT=8766
```

**Control Bridge:**
```bash
MQ_URL=amqp://mq
MQ_QUEUE=controls
```

**Web Server:**
```bash
CONTROL_TOKEN=secret  # Optional: gate WebSocket access
RABBIT_URL=amqp://mq
FPS=24
RESOLUTION=1280:720
```

### Custom Frame Pipeline

To use your own frame source:

1. Generate frames as `frame_00001.png`, `frame_00002.png`, etc.
2. Copy to the shared volume:
   ```bash
   docker cp my_frames/. $(docker compose ps -q web):/data/frames/
   ```
3. The encoder will automatically pick them up

Or mount your frames directory:
```yaml
volumes:
  - ./my_frames:/data/frames:ro
```

## Troubleshooting

### No video in player
1. Check frames are being generated: `docker compose logs dev-frame-seeder`
2. Check encoder is running: `docker compose logs encoder`
3. Verify HLS manifest exists:
   ```bash
   docker compose exec web ls -la /var/www/hls/
   ```

### Controls not working
1. Check RabbitMQ is running: `docker compose ps mq`
2. Check bridge logs: `docker compose logs control-bridge`
3. Check mediator logs: `docker compose logs mediator`
4. Test WebSocket in browser console:
   ```javascript
   const ws = new WebSocket('ws://localhost:8080/ws');
   ws.onopen = () => ws.send(JSON.stringify({
     type: 'control',
     controlType: 'liveParam',
     payload: { cfg: 7.0 }
   }));
   ```

### Mediator connection issues
1. Verify mediator is listening:
   ```bash
   docker compose logs mediator | grep "listening"
   ```
2. Check bridge can connect:
   ```bash
   docker compose logs control-bridge | grep "listening on controls"
   ```
3. Test from CLI:
   ```bash
   ./deforumation_cli_panel --host localhost --port 8766
   ```

### SD-Forge not generating
1. Check Deforum extension is installed:
   ```bash
   docker compose exec sd-forge ls extensions/sd-forge-deforum/
   ```
2. Verify mediator config:
   ```bash
   docker compose exec sd-forge cat extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg
   ```
3. Check SD-Forge logs:
   ```bash
   docker compose logs sd-forge
   ```

## Next Steps

- **Production deployment:** See `docs/streaming_stack.md` for scaling tips
- **CLI tools:** Explore `./forge_cli`, `./deforumation_runs_cli`, etc.
- **Custom presets:** Create presets in `deforumation/presets/`
- **Audio sync:** Map audio bands to parameters with audio modulator
- **MIDI control:** Connect MIDI devices via WebMIDI in Settings tab

## Files Overview

```
defora/
├── docker-compose.yml          # Complete stack definition
├── docker/
│   ├── mediator/              # Mediator container
│   ├── bridge/                # Control bridge container
│   ├── web/                   # Web player + server
│   ├── sd-forge/              # SD-Forge with Deforum
│   └── frame-seeder/          # Test frame generator
├── defora_cli/
│   ├── control_bridge.py      # RabbitMQ → mediator relay
│   └── mediator_client.py     # WebSocket client library
├── deforumation/              # Submodule (Rakile/DeforumationQT)
│   ├── mediator.py           # Core mediator server
│   └── Deforum_Version/       # Deforum bridge patches
└── docs/
    ├── streaming_stack.md     # Streaming details
    ├── mediator_setup.md      # Mediator installation
    └── COMPLETE_SETUP.md      # This file
```

## Support

- **GitHub Issues:** https://github.com/janiluuk/defora/issues
- **Docs:** See `docs/` directory
- **Tests:** Run `./scripts/run_tests.sh`
