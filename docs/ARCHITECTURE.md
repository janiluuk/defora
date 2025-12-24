# Defora Architecture

## System Overview

Defora is a complete streaming stack for real-time AI video generation with live parameter control. This document explains how all components work together.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                            │
│                                                                       │
│  ┌──────────────┐        ┌──────────────┐      ┌─────────────────┐ │
│  │  Web Browser │        │  CLI Tools   │      │  MIDI/Audio     │ │
│  │ (localhost:   │        │ - Panel      │      │  Controllers    │ │
│  │     8080)     │        │ - Dashboard  │      │                 │ │
│  └──────┬───────┘        └──────┬───────┘      └────────┬────────┘ │
│         │                       │                        │          │
└─────────┼───────────────────────┼────────────────────────┼──────────┘
          │ WebSocket + HTTP      │ WebSocket              │ WebMIDI
          │                       │                        │
┌─────────▼───────────────────────▼────────────────────────▼──────────┐
│                      CONTROL & STREAMING LAYER                       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────┐           │
│  │              Web Server (Node.js + Nginx)            │           │
│  │  - WebSocket endpoint (/ws)                          │           │
│  │  - REST API (/api/*)                                 │           │
│  │  - HLS streaming (/hls/*)                            │           │
│  │  - RTMP ingest (port 1935)                           │           │
│  └─────┬────────────────────────────────────────┬───────┘           │
│        │                                         │                   │
│        │ Control messages                        │ HLS segments      │
│        ▼                                         ▼                   │
│  ┌─────────────┐                          ┌──────────┐              │
│  │  RabbitMQ   │                          │   HLS    │              │
│  │   (mq)      │                          │  Volume  │              │
│  │  port 5672  │                          │          │              │
│  └─────┬───────┘                          └──────────┘              │
│        │                                                             │
└────────┼─────────────────────────────────────────────────────────────┘
         │ controls queue
         │
┌────────▼─────────────────────────────────────────────────────────────┐
│                        MEDIATOR BRIDGE                                │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │              Control Bridge (Python)                      │       │
│  │  - Consumes RabbitMQ controls queue                       │       │
│  │  - Forwards to mediator via WebSocket                     │       │
│  │  - Uses MediatorClient                                    │       │
│  └──────────────────────┬───────────────────────────────────┘       │
│                         │                                             │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │ WebSocket (pickled messages)
                          │
┌─────────────────────────▼─────────────────────────────────────────────┐
│                    DEFORUM MEDIATOR (DeforumationQT)                  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │                    mediator.py                              │      │
│  │  - Deforum port: 8765 (SD-Forge bridge)                    │      │
│  │  - Deforumation port: 8766 (CLI tools & controls)          │      │
│  │  - Live preview: 8767 (optional)                            │      │
│  │  - Relays parameters between SD-Forge and controllers       │      │
│  └─────────────┬──────────────────────────────────────────────┘      │
│                │                                                       │
└────────────────┼───────────────────────────────────────────────────────┘
                 │ WebSocket (Deforum bridge protocol)
                 │
┌────────────────▼───────────────────────────────────────────────────────┐
│                      GENERATION & ENCODING                             │
│                                                                        │
│  ┌─────────────────────────┐          ┌─────────────────────────┐    │
│  │     SD-Forge            │          │    Frame Seeder         │    │
│  │  + Deforum Extension    │          │  (dev/testing)          │    │
│  │  - WebUI: port 7860     │          │  - Generates test       │    │
│  │  - Deforum mediator.cfg │          │    frames at 12 FPS     │    │
│  │  - Outputs to /data/    │          │  - Writes to /data/     │    │
│  │    frames               │          │    frames               │    │
│  └────────────┬────────────┘          └────────────┬────────────┘    │
│               │                                     │                 │
│               └──────────────┬──────────────────────┘                 │
│                              │ PNG frames                             │
│                              ▼                                        │
│                     ┌──────────────────┐                              │
│                     │  Frames Volume   │                              │
│                     │  /data/frames    │                              │
│                     │  frame_*.png     │                              │
│                     └────────┬─────────┘                              │
│                              │                                        │
│                              ▼                                        │
│                     ┌──────────────────┐                              │
│                     │  Encoder (ffmpeg)│                              │
│                     │  - Reads frames  │                              │
│                     │  - Encodes H.264 │                              │
│                     │  - Pushes RTMP   │                              │
│                     └────────┬─────────┘                              │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │ RTMP stream (port 1935)
                               │
                               └──────► Web Server (back to streaming layer)
```

## Component Descriptions

### User Interaction Layer

**Web Browser (port 8080)**
- Full-featured control panel with live parameter sliders
- Tabs: LIVE, PROMPTS, MOTION, AUDIO/BEATS, CONTROLNET, SETTINGS
- HLS.js video player for low-latency streaming
- WebSocket connection for real-time controls
- Frame thumbnails and playback stats

**CLI Tools**
- `deforumation_cli_panel` - Live parameter control (hotkeys)
- `deforumation_dashboard` - Full Deforumation UI mirror
- `audio_reactive_modulator` - Audio-to-parameter mapping
- `monitor_cli` - Frame viewer with live values

**MIDI/Audio Controllers**
- WebMIDI API support in browser
- MIDI CC mapping to parameters
- Audio band frequency mapping

### Control & Streaming Layer

**Web Server (Node.js + Nginx)**
- **Node.js (port 3000)**
  - Express REST API
  - WebSocket server for controls
  - RabbitMQ publisher
  - Frame directory watcher
- **Nginx (port 80)**
  - Serves static HTML/JS
  - Proxies API/WS to Node
  - RTMP ingestion (port 1935)
  - HLS transcoding and serving

**RabbitMQ (port 5672)**
- Message queue for control events
- Queue: `controls`
- Decouples web UI from mediator
- Allows multiple consumers

### Mediator Bridge

**Control Bridge (Python)**
- Subscribes to RabbitMQ `controls` queue
- Receives JSON: `{controlType, payload}`
- Forwards to mediator via `MediatorClient`
- Translates REST/WebSocket to mediator protocol

**MediatorClient (Python library)**
- WebSocket client wrapper
- Pickle-based message format
- Read/write parameter operations
- Used by bridge and CLI tools

### Deforum Mediator

**mediator.py (DeforumationQT)**
- Core mediator server from Rakile/DeforumationQT
- Three WebSocket endpoints:
  - **8765**: Deforum bridge (SD-Forge extension)
  - **8766**: Deforumation UI and CLI tools
  - **8767**: Live preview server (optional)
- Protocol: Pickled Python tuples `[action, param, value]`
- Relays parameters bidirectionally

### Generation & Encoding

**SD-Forge + Deforum**
- Stable Diffusion WebUI Forge
- Deforum extension for animation
- Patched with Deforumation bridge
- Connects to mediator on port 8765
- Outputs frames to `/data/frames`

**Frame Seeder (Development)**
- Generates test frames with timestamps
- Useful for testing pipeline without SD-Forge
- Configurable FPS (default 12)
- Neon-styled frame overlays

**Encoder (ffmpeg)**
- Watches `/data/frames` directory
- Reads `frame_*.png` in order
- Encodes to H.264 with libx264
- Pushes RTMP to Nginx
- Configurable FPS and resolution

## Data Flow

### 1. Control Flow (User → SD-Forge)

```
Browser Slider → WebSocket /ws → Node.js → RabbitMQ 'controls'
                                                ↓
                                         Control Bridge
                                                ↓
                                         mediator.py:8766
                                                ↓
                                         mediator.py:8765
                                                ↓
                                         SD-Forge Deforum
```

### 2. Frame Flow (SD-Forge → Browser)

```
SD-Forge → /data/frames/frame_*.png → Encoder (ffmpeg)
                                           ↓
                                      RTMP stream
                                           ↓
                                    Nginx RTMP module
                                           ↓
                                    HLS transcoding
                                           ↓
                                    /var/www/hls/*.ts
                                           ↓
                                    Browser HLS.js
```

### 3. Real-time Parameter Update

```
User adjusts CFG slider in browser
     ↓
WebSocket message: {type:'control', controlType:'liveParam', payload:{cfg:7.5}}
     ↓
Node.js validates and publishes to RabbitMQ
     ↓
Control Bridge consumes from queue
     ↓
MediatorClient.write('cfg', 7.5) → mediator.py:8766
     ↓
Mediator relays → SD-Forge via 8765
     ↓
Deforum updates CFG for next frame generation
```

## Key Ports

| Service          | Port(s)      | Protocol      | Purpose                        |
|------------------|--------------|---------------|--------------------------------|
| Web Browser      | 8080         | HTTP/WS       | Main UI and player            |
| Nginx RTMP       | 1935         | RTMP          | Stream ingestion              |
| RabbitMQ         | 5672, 15672  | AMQP, HTTP    | Message queue, management     |
| Mediator (Deforum)| 8765        | WebSocket     | SD-Forge bridge               |
| Mediator (Deform.)| 8766        | WebSocket     | CLI tools and controls        |
| Mediator (Preview)| 8767        | WebSocket     | Live preview (optional)       |
| SD-Forge         | 7860         | HTTP          | WebUI                         |

## Volume Mounts

| Volume    | Mount Point         | Purpose                               |
|-----------|---------------------|---------------------------------------|
| frames    | /data/frames        | Shared frame storage (PNG files)      |
| hls       | /var/www/hls        | HLS segments and playlist             |
| mqdata    | /var/lib/rabbitmq   | RabbitMQ persistent data              |

## Message Formats

### WebSocket Control (Browser → Node.js)

```json
{
  "type": "control",
  "token": "optional_secret",
  "controlType": "liveParam",
  "payload": {
    "cfg": 7.5,
    "strength": 0.8,
    "translation_z": 1.2
  }
}
```

### RabbitMQ Message (Node.js → Bridge)

```json
{
  "controlType": "liveParam",
  "payload": {
    "cfg": 7.5,
    "strength": 0.8
  }
}
```

### Mediator Protocol (Bridge → Mediator)

Pickled tuple: `[1, "cfg", 7.5]`
- `[1, param, value]` - Write operation
- `[0, param, 0]` - Read operation

## Environment Configuration

### Docker Compose Variables

```bash
# Mediator
MEDIATOR_HOST=mediator           # Bridge → mediator hostname
MEDIATOR_PORT=8766               # Control port

# SD-Forge
DEFORUM_MEDIATOR_URL=ws://mediator:8765

# Encoder
FPS=24                           # Frame rate
RESOLUTION=1280:720              # Output resolution

# Web
CONTROL_TOKEN=secret             # Optional WebSocket auth
RABBIT_URL=amqp://mq

# Frame Seeder
OUTPUT_DIR=/data/frames
FPS=12
CLEAR=1                          # Clear frames on start
```

## Startup Sequence

1. **RabbitMQ** starts first (no dependencies)
2. **Mediator** starts (no dependencies)
3. **SD-Forge** starts (depends on mediator)
4. **Web server** starts (no dependencies)
5. **Control bridge** starts (depends on mq, mediator)
6. **Encoder** starts (depends on web, waits for frames)
7. **Frame seeder** starts (optional, depends on web)

## Troubleshooting

See `docs/COMPLETE_SETUP.md` for detailed troubleshooting steps.

## Related Documentation

- [COMPLETE_SETUP.md](COMPLETE_SETUP.md) - Full setup guide
- [streaming_stack.md](streaming_stack.md) - Streaming details
- [mediator_setup.md](mediator_setup.md) - Mediator installation
- [README.md](../README.md) - Project overview
