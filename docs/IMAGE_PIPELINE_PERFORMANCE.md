# Image pipeline performance

Defora is designed so **pixels never travel over WebSocket or RabbitMQ**. Generated frames are written once to a shared directory; the web UI and encoder read the same files.

## Fast path (live Deforum)

```text
SD-Forge / Deforum  →  write frame_NNNNN.png  →  /data/frames  (Docker volume or NFS)
                              ↓
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
   nginx /frames/*      Node fs.watch + WS    ffmpeg → RTMP → HLS
   (direct sendfile)    (strip + preview)     (live stream)
```

### What is already optimized

| Layer | Behavior |
|-------|----------|
| **Shared volume** | `frames` volume mounted rw on Forge/encoder, ro on web — no HTTP hop for generation → disk |
| **Static serving** | nginx serves `/frames/*` directly from `/data/frames` with `sendfile` |
| **Index cache** | `/api/frames` rebuilds only when the directory mtime changes |
| **Live updates** | `fs.watch` pushes `frame` events over WebSocket; UI polls at 750ms while generating |
| **Preview poll** | Deforum preview waits for new file on disk (75–300ms intervals), not base64 over HTTP |
| **Encoder** | Scans every 0.5s by default; omits `-re` unless `ENCODER_REALTIME=1` so backlog encodes as fast as possible |

### Production / external Forge (critical)

If Forge runs on **vimage2** but the UI runs elsewhere, a **local Docker `frames` volume on the UI host will stay empty**. You must use a **shared filesystem**:

1. On Forge: `OUTPUT_DIR=/data/frames` (or your NFS path).
2. On UI host: mount the same path at `/data/frames` for `web` and `encoder`.

```bash
export FRAMES_SHARED_PATH=/mnt/nfs/defora-frames
docker compose -f docker-compose.external-forge.yml -f docker-compose.shared-frames.yml up -d
```

Pin preview/warmup jobs to the node that writes that directory:

```bash
FRAMES_FORGE_URL=http://vimage2:7860
```

### Slower paths (by design)

| Path | Cost |
|------|------|
| **txt2img / img2img** | Full image as base64 in JSON (Forge → Node → `/data/runs/uploads`) — fine for singles, not for burst live frames |
| **Distributed batch** | Frames stay on each GPU unless storage is shared |
| **HLS** | Packaged on **vimage3** (`docker-compose.stream-node.yml`); UI host proxies `/hls/*` via `nginx.external-forge.conf` |

## Tunables

| Variable | Default | Effect |
|----------|---------|--------|
| `ENCODER_SCAN_INTERVAL` | `0.5` | Seconds between encoder scans for new PNGs |
| `ENCODER_REALTIME` | `0` | `1` = ffmpeg `-re` (wall-clock); `0` = encode backlog as fast as possible |
| `ENCODER_QUALITY` | `medium` / `turbo` in turbo compose | x264 preset and bitrate |
| `FRAMES_FORGE_URL` | — | Pin Deforum preview/warmup to the Forge URL that writes `FRAMES_DIR` |
| `FRAMES_SHARED_PATH` | — | Host/NFS bind for `docker-compose.shared-frames.yml` |

## Optional: RAM-backed frames (single host)

For very low latency on one machine with enough RAM:

```yaml
services:
  sd-forge:
    tmpfs:
      - /data/frames:size=2G,mode=1777
  web:
    volumes:
      - frames:/data/frames:ro   # replace with same tmpfs only if using hostNetwork/shared tmpfs — prefer bind to host tmpfs path instead
```

Practical approach: bind-mount host tmpfs:

```bash
sudo mkdir -p /dev/shm/defora-frames && sudo chmod 1777 /dev/shm/defora-frames
export FRAMES_SHARED_PATH=/dev/shm/defora-frames
```

## Verification

```bash
# Frames volume writable from Forge side
docker compose exec sd-forge ls -lt /data/frames | head

# Web sees the same files
docker compose exec web ls -lt /data/frames | head

# nginx serves without Node
curl -sI http://localhost:8080/frames/frame_00001.png | head

# Recent activity in API
curl -s http://localhost:8080/api/frames?limit=3 | jq .
```

If previews succeed in Forge logs but `/api/frames` stays empty, the shared mount or `FRAMES_FORGE_URL` is misconfigured.
