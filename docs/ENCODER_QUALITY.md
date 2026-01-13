# Encoder Quality Presets

The Defora encoder supports multiple quality presets to balance between video quality and bandwidth/CPU usage.

## Available Presets

### Low Quality
**Use case**: Limited bandwidth, mobile streaming, preview

```bash
ENCODER_QUALITY=low docker compose up
```

**Settings**:
- Bitrate: 500 kbps
- Max bitrate: 750 kbps
- Buffer size: 1 MB
- x264 preset: veryfast
- CRF: 28

**Characteristics**:
- Smallest file size
- Lowest bandwidth requirements
- Fastest encoding
- Noticeable compression artifacts
- Good for quick previews

---

### Medium Quality (Default)
**Use case**: Standard streaming, balanced performance

```bash
ENCODER_QUALITY=medium docker compose up
# Or simply:
docker compose up
```

**Settings**:
- Bitrate: 1.5 Mbps
- Max bitrate: 2.25 Mbps
- Buffer size: 3 MB
- x264 preset: veryfast
- CRF: 23

**Characteristics**:
- Good balance of quality and performance
- Suitable for most use cases
- Moderate bandwidth requirements
- Minor compression artifacts
- Recommended for general use

---

### High Quality
**Use case**: Professional streaming, high-quality output

```bash
ENCODER_QUALITY=high docker compose up
```

**Settings**:
- Bitrate: 3.5 Mbps
- Max bitrate: 5 Mbps
- Buffer size: 7 MB
- x264 preset: fast
- CRF: 20

**Characteristics**:
- High visual quality
- Higher bandwidth requirements
- Slightly slower encoding
- Minimal compression artifacts
- Good for production use

---

### Ultra Quality
**Use case**: Archive, best possible quality

```bash
ENCODER_QUALITY=ultra docker compose up
```

**Settings**:
- Bitrate: 6 Mbps
- Max bitrate: 9 Mbps
- Buffer size: 12 MB
- x264 preset: medium
- CRF: 18

**Characteristics**:
- Highest visual quality
- Highest bandwidth requirements
- Slower encoding
- Near-transparent quality
- Best for archival purposes

---

## Comparison Table

| Preset | Bitrate | Encoding Speed | Quality | Use Case |
|--------|---------|----------------|---------|----------|
| Low    | 500k    | Fastest        | ★☆☆☆☆   | Preview, mobile |
| Medium | 1.5M    | Very Fast      | ★★★☆☆   | Standard streaming |
| High   | 3.5M    | Fast           | ★★★★☆   | Professional |
| Ultra  | 6M      | Medium         | ★★★★★   | Archive |

## Additional Configuration

You can combine quality presets with other encoder options:

```bash
# Ultra quality at 60 FPS and 1080p
ENCODER_QUALITY=ultra FPS=60 RESOLUTION=1920:1080 docker compose up

# Low quality for mobile at 30 FPS and 480p
ENCODER_QUALITY=low FPS=30 RESOLUTION=854:480 docker compose up

# High quality at 24 FPS (cinematic) and 4K
ENCODER_QUALITY=high FPS=24 RESOLUTION=3840:2160 docker compose up
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENCODER_QUALITY` | `medium` | Quality preset: low, medium, high, ultra |
| `FPS` | `24` | Frame rate in frames per second |
| `RESOLUTION` | `1280:720` | Video resolution (width:height) |

## Performance Considerations

### CPU Usage
- **Low/Medium presets**: ~50-80% CPU usage (single core)
- **High preset**: ~80-100% CPU usage (single core)
- **Ultra preset**: ~100%+ CPU usage (may use multiple cores)

### Latency
All presets use `-tune zerolatency` for minimal streaming delay:
- Typical latency: 2-5 seconds
- First connection latency: 5-10 seconds

### Bandwidth Requirements

Minimum network bandwidth needed for smooth streaming:

| Preset | Minimum Download | Recommended Download |
|--------|------------------|----------------------|
| Low    | 0.75 Mbps        | 1 Mbps               |
| Medium | 2.5 Mbps         | 3 Mbps               |
| High   | 6 Mbps           | 7 Mbps               |
| Ultra  | 10 Mbps          | 12 Mbps              |

## Adaptive Bitrate (Future)

Future versions may support adaptive bitrate streaming (ABR) with multiple quality variants:

```yaml
# Future feature - not yet implemented
encoder:
  variants:
    - quality: low
      resolution: 640:360
      bitrate: 500k
    - quality: medium
      resolution: 1280:720
      bitrate: 1500k
    - quality: high
      resolution: 1920:1080
      bitrate: 3500k
```

## Troubleshooting

### Buffering Issues
If experiencing buffering:
1. Lower the quality preset
2. Reduce FPS
3. Reduce resolution
4. Check network bandwidth

### Frame Drops
If encoder is dropping frames:
1. Use a faster preset (low or medium)
2. Reduce resolution
3. Check CPU usage with `docker stats`

### Quality Too Low
If quality is unsatisfactory:
1. Increase quality preset
2. Check that source frames are high quality
3. Ensure sufficient bandwidth

## Technical Details

### CRF (Constant Rate Factor)
- Range: 0-51 (lower = better quality)
- 18-28 is the recommended range
- 23 is considered "visually lossless"

### x264 Presets
- **ultrafast/veryfast**: Fastest encoding, lowest quality
- **fast/medium**: Balanced speed and quality
- **slow/veryslow**: Best quality, slowest encoding

### Buffer Size
- Determines how much data is buffered before sending
- Larger buffer = more stable bitrate
- Smaller buffer = lower latency

---

For more information on FFmpeg encoding, see:
- [FFmpeg H.264 Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)
- [FFmpeg Streaming Guide](https://trac.ffmpeg.org/wiki/StreamingGuide)
