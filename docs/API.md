# Defora Web API Documentation

This document describes the REST API endpoints available in the Defora web server.

## Table of Contents

- [Health & Status](#health--status)
- [Frames](#frames)
- [Audio](#audio)
- [Presets](#presets)
- [ControlNet](#controlnet)

---

## Health & Status

### GET /health

Simple health check endpoint for Docker healthcheck.

**Response**: `200 OK`
```
OK
```

### GET /api/health

Detailed health status including HLS stream information.

**Response**: `200 OK`
```json
{
  "ok": true,
  "stream": "/hls/live/deforum.m3u8",
  "updated": 1705196423000
}
```

**Fields**:
- `ok` (boolean): Service health status
- `stream` (string): HLS stream path
- `updated` (number|null): Last playlist update timestamp (milliseconds), or null if not yet generated

---

## Frames

### GET /api/frames

Get list of most recent generated frames.

**Query Parameters**:
- `limit` (number, optional): Number of frames to return (1-50, default: 12)

**Response**: `200 OK`
```json
{
  "items": [
    {
      "src": "/frames/0042.png",
      "name": "0042.png",
      "frame": 42,
      "mtime": 1705196423000
    }
  ]
}
```

**Fields**:
- `items` (array): List of frame objects
  - `src` (string): URL path to frame image
  - `name` (string): Filename
  - `frame` (number|null): Extracted frame number from filename
  - `mtime` (number): File modification time in milliseconds

**Error Responses**:
- `500 Internal Server Error`: Frames directory access error
- Returns `{"items": []}` if frames directory doesn't exist

---

## Audio

### POST /api/audio-map

Process audio file and generate parameter mapping or stream live to mediator.

**Request Body**:
```json
{
  "audioPath": "/path/to/audio.wav",
  "fps": 24,
  "live": false,
  "mediatorHost": "localhost",
  "mediatorPort": "8766",
  "mappings": [
    {
      "param": "strength",
      "freq_min": 20,
      "freq_max": 200,
      "out_min": 0.5,
      "out_max": 1.0
    }
  ],
  "output": "/path/to/output.json"
}
```

**Fields**:
- `audioPath` (string, required): Path to audio file
- `fps` (number, optional): Frames per second (default: 24)
- `live` (boolean, optional): Stream to mediator in real-time (default: false)
- `mediatorHost` (string, optional): Mediator hostname for live streaming
- `mediatorPort` (string, optional): Mediator port for live streaming
- `mappings` (array, optional): Audio frequency band to parameter mappings
  - `param` (string): Parameter name to modulate
  - `freq_min` (number): Minimum frequency (Hz)
  - `freq_max` (number): Maximum frequency (Hz)
  - `out_min` (number): Minimum output value
  - `out_max` (number): Maximum output value
- `output` (string, optional): Output file path for schedule JSON

**Response**: `200 OK`
```json
{
  "ok": true,
  "code": 0,
  "stdout": "Generated schedule with 240 frames",
  "stderr": ""
}
```

**Error Responses**:
- `400 Bad Request`: Missing audioPath or invalid mappings
- `500 Internal Server Error`: Could not start audio processor

---

### POST /api/audio-upload

Upload an audio file for processing.

**Request Body**:
```json
{
  "name": "song.wav",
  "data": "data:audio/wav;base64,UklGRiQAAABXQVZF..."
}
```

**Fields**:
- `name` (string, required): Original filename with extension
- `data` (string, required): Base64-encoded audio data with or without data URL prefix

**Supported Formats**:
- `.wav` - WAV audio
- `.mp3` - MP3 audio
- `.ogg` - Ogg Vorbis
- `.flac` - FLAC lossless
- `.m4a` - M4A/AAC audio

**Response**: `200 OK`
```json
{
  "ok": true,
  "path": "/app/uploads/1705196423000-song.wav",
  "name": "song.wav"
}
```

**Fields**:
- `ok` (boolean): Upload success status
- `path` (string): Server-side path to uploaded file
- `name` (string): Sanitized filename

**Error Responses**:
- `400 Bad Request`: Missing name/data, invalid extension, or MIME type mismatch
- `500 Internal Server Error`: Upload failed

**Security Notes**:
- Filename is sanitized (only alphanumeric, underscore, hyphen)
- File extension is validated against allowlist
- MIME type is validated against expected extension
- Timestamped prefix prevents filename collisions

---

## Presets

Presets store complete UI state for quick recall during performances.

### GET /api/presets

List all available presets.

**Response**: `200 OK`
```json
{
  "presets": ["default", "heavy-bass", "calm-ambient"]
}
```

**Error Responses**:
- `500 Internal Server Error`: Could not list presets

---

### GET /api/presets/:name

Load a specific preset by name.

**URL Parameters**:
- `name` (string): Preset name (alphanumeric, underscore, hyphen only)

**Response**: `200 OK`
```json
{
  "name": "heavy-bass",
  "preset": {
    "prompts": {
      "positive": "futuristic cityscape",
      "negative": "blurry, low quality"
    },
    "params": {
      "cfg": 7.5,
      "strength": 0.85,
      "zoom": 1.05
    },
    "controlnet": [
      {
        "enabled": true,
        "model": "canny",
        "weight": 1.0
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid preset name
- `404 Not Found`: Preset doesn't exist
- `500 Internal Server Error`: Could not load preset

---

### POST /api/presets/:name

Save a preset with the given name.

**URL Parameters**:
- `name` (string): Preset name (alphanumeric, underscore, hyphen only)

**Request Body**:
```json
{
  "prompts": {
    "positive": "futuristic cityscape",
    "negative": "blurry, low quality"
  },
  "params": {
    "cfg": 7.5,
    "strength": 0.85
  }
}
```

**Response**: `200 OK`
```json
{
  "ok": true,
  "name": "heavy-bass"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid preset name or data
- `500 Internal Server Error`: Could not save preset

---

### DELETE /api/presets/:name

Delete a preset.

**URL Parameters**:
- `name` (string): Preset name (alphanumeric, underscore, hyphen only)

**Response**: `200 OK`
```json
{
  "ok": true
}
```

**Error Responses**:
- `400 Bad Request`: Invalid preset name
- `404 Not Found`: Preset doesn't exist
- `500 Internal Server Error`: Could not delete preset

---

## ControlNet

### GET /api/controlnet/models

Get list of available ControlNet models.

**Note**: This is currently a placeholder endpoint. In production, this would query the SD-Forge API for available models.

**Response**: `200 OK`
```json
{
  "models": [
    {
      "id": "canny",
      "name": "Canny Edge",
      "category": "edge"
    },
    {
      "id": "depth",
      "name": "Depth Map",
      "category": "depth"
    },
    {
      "id": "openpose",
      "name": "OpenPose",
      "category": "pose"
    }
  ]
}
```

**Fields**:
- `models` (array): List of ControlNet model definitions
  - `id` (string): Model identifier
  - `name` (string): Human-readable model name
  - `category` (string): Model category (edge, depth, pose, line, style, semantic)

---

## WebSocket Control Protocol

The web UI connects to the mediator via WebSocket for real-time parameter control.

**Connection URL**: `ws://mediator-host:8765` (or `wss://` for TLS)

**Authentication**: Optional `CONTROL_TOKEN` environment variable

### Message Format

**Sending Parameters**:
```json
{
  "type": "liveParam",
  "data": {
    "param": "strength",
    "value": 0.85
  }
}
```

**Sending Prompts**:
```json
{
  "type": "prompts",
  "data": {
    "positive": "futuristic cityscape",
    "negative": "blurry"
  }
}
```

**Parameter Updates from Mediator**:
```json
{
  "type": "paramUpdate",
  "data": {
    "strength": 0.85,
    "cfg": 7.5,
    "zoom": 1.05
  }
}
```

---

## Environment Variables

Configure the web server using these environment variables:

- `PORT` - HTTP server port (default: 3000)
- `RABBIT_URL` - RabbitMQ connection URL (default: amqp://localhost)
- `CONTROL_TOKEN` - WebSocket authentication token (optional)
- `CONTROL_QUEUE` - RabbitMQ control queue name (default: controls)
- `FRAMES_DIR` - Directory containing generated frames (default: /data/frames)
- `HLS_STREAM` - HLS stream URL path (default: /hls/live/deforum.m3u8)
- `HLS_DIR` - HLS output directory (default: /var/www/hls)
- `DISABLE_MQ` - Disable RabbitMQ integration (default: false)
- `PRESETS_DIR` - Directory for preset storage (default: ./presets)
- `UPLOADS_DIR` - Directory for uploaded audio files (default: ./uploads)
- `DEF_MEDIATOR_HOST` - Default mediator hostname (default: localhost)
- `DEF_MEDIATOR_PORT` - Default mediator port (default: 8766)

---

## Rate Limiting & Security

**Current Implementation**:
- No rate limiting (suitable for local/trusted networks)
- Filename sanitization on uploads
- File extension and MIME type validation
- No authentication (use `CONTROL_TOKEN` for basic WebSocket auth)

**Production Recommendations**:
- Add rate limiting middleware
- Implement proper authentication/authorization
- Use HTTPS/WSS for remote access
- Add CORS configuration
- Set up firewall rules
- Monitor upload directory size

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes**:
- `200 OK` - Request succeeded
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

---

## Testing

The API endpoints are tested in `tests/test_web_server_api.py`.

Run tests:
```bash
python -m pytest tests/test_web_server_api.py -v
```

---

## See Also

- [Web UI Tabs Documentation](WEB_UI_TABS.md) - User interface reference
- [Architecture Overview](ARCHITECTURE.md) - System architecture
- [Streaming Stack Documentation](streaming_stack.md) - Video streaming setup
