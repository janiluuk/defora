# Defora Turbo Stack - Live Video Generation with SD-Turbo Models

This Docker Compose configuration provides a complete Defora stack optimized for **real-time live video generation** using Stability AI's Turbo models (SD-Turbo and SDXL-Turbo).

## Features

- ✅ **Pre-loaded Turbo Models**: Automatically downloads SD-Turbo and SDXL-Turbo
- ✅ **Optimized for Speed**: 1-4 step generation for near real-time performance
- ✅ **Live Streaming**: HLS and RTMP streaming support
- ✅ **Deforum Integration**: Full Deforumation-patched Deforum extension
- ✅ **GPU Accelerated**: NVIDIA GPU support with optimized CUDA settings

## Turbo Models Included

### SD-Turbo
- **Resolution**: 512x512
- **Steps**: 1-4 (optimal: 1-2 steps)
- **Speed**: ~10x faster than SD 1.5
- **Use case**: Real-time experimentation, fast previews

### SDXL-Turbo
- **Resolution**: 1024x1024
- **Steps**: 1-4 (optimal: 1-2 steps)  
- **Speed**: ~10x faster than SDXL base
- **Use case**: High-quality real-time generation

### VAE
- **vae-ft-mse-840000**: Better color and detail reproduction
- Auto-applied to turbo models for improved quality

## Quick Start

### Prerequisites

1. **NVIDIA GPU** with at least 8GB VRAM (12GB+ recommended for SDXL-Turbo)
2. **NVIDIA Container Toolkit** installed
3. **Docker** and **Docker Compose** v2+
4. **15GB free disk space** for models

### Start the Stack

```bash
# Download models and start all services
docker compose -f docker-compose.turbo.yml up --build

# Or in detached mode
docker compose -f docker-compose.turbo.yml up -d --build
```

**First run**: Model download takes ~10-15 minutes depending on connection speed.

### Access Points

Once started:

- **Web UI**: http://localhost:8080
- **SD-Forge UI**: http://localhost:7860
- **HLS Stream**: http://localhost:8080/hls/live/deforum.m3u8
- **RTMP Stream**: rtmp://localhost:1935/live/deforum
- **RabbitMQ Management**: http://localhost:15672 (user: guest, pass: guest)

## Usage

### Recommended Settings for Turbo Models

#### SD-Turbo (512x512)
```json
{
  "max_frames": 240,
  "W": 512,
  "H": 512,
  "steps": 1,
  "cfg_scale": 1.0,
  "sampler": "Euler a",
  "strength_schedule": "0:(0.3)",
  "seed": -1
}
```

**Tips**:
- Use **1-2 steps** (1 step is often sufficient)
- Keep **CFG at 1.0** (turbo models ignore CFG guidance)
- Lower **strength** (0.2-0.4) for smoother transitions
- **Negative prompts** have minimal effect

#### SDXL-Turbo (1024x1024)
```json
{
  "max_frames": 240,
  "W": 1024,
  "H": 1024,
  "steps": 2,
  "cfg_scale": 1.0,
  "sampler": "Euler a",
  "strength_schedule": "0:(0.4)",
  "seed": -1
}
```

**Tips**:
- Use **1-4 steps** (2 steps recommended for quality)
- Requires **12GB+ VRAM** at 1024x1024
- Can use 768x768 or 896x896 for lower VRAM
- Excellent for cinematic shots

### Performance Tuning

#### For Maximum FPS

```bash
# Set environment variables before starting
export ENCODER_QUALITY=turbo
export FPS=30
export RESOLUTION=512:512  # Match model resolution
docker compose -f docker-compose.turbo.yml up
```

#### For Better Quality

```bash
export ENCODER_QUALITY=medium
export FPS=24
export RESOLUTION=1024:1024  # For SDXL-Turbo
docker compose -f docker-compose.turbo.yml up
```

## Architecture

```
┌─────────────────────────────────────────┐
│         Model Downloader                │
│  (Downloads turbo models once)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│      SD-Forge + Deforum (Turbo)         │
│  - SD-Turbo (512x512, 1-4 steps)        │
│  - SDXL-Turbo (1024x1024, 1-4 steps)    │
│  - Deforumation WebSocket connection     │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│           Mediator                       │
│  (WebSocket relay for parameters)        │
└──────────────┬───────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌──────────────┐ ┌──────────────┐
│   Encoder    │ │     Web      │
│  (FFmpeg)    │ │  (Streaming) │
│   RTMP/HLS   │ │   + Web UI   │
└──────────────┘ └──────────────┘
```

## Distributed Generation with Turbo Models

To run multiple turbo instances for load balancing:

### 3-Node Turbo Setup

**Node 1** (192.168.1.10):
```bash
docker compose -f docker-compose.turbo.yml up sd-forge-turbo mediator
```

**Node 2** (192.168.1.11):
```bash
docker compose -f docker-compose.turbo.yml up sd-forge-turbo mediator
```

**Node 3** (192.168.1.12):
```bash
docker compose -f docker-compose.turbo.yml up sd-forge-turbo mediator
```

**Load Balancer** (main server):
```bash
curl -X POST http://localhost:3000/api/distributed/configure \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "strategy": "least_busy",
    "nodes": [
      {
        "url": "http://192.168.1.10:7860",
        "name": "Turbo-Node-1",
        "capabilities": ["sd-turbo", "sdxl-turbo", "live-video"]
      },
      {
        "url": "http://192.168.1.11:7860",
        "name": "Turbo-Node-2",
        "capabilities": ["sd-turbo", "sdxl-turbo", "live-video"]
      },
      {
        "url": "http://192.168.1.12:7860",
        "name": "Turbo-Node-3",
        "capabilities": ["sd-turbo", "sdxl-turbo", "live-video"]
      }
    ]
  }'
```

## Troubleshooting

### Models Not Downloading

Check model-downloader logs:
```bash
docker compose -f docker-compose.turbo.yml logs model-downloader
```

Manually download:
```bash
docker compose -f docker-compose.turbo.yml run --rm model-downloader
```

### Out of Memory Errors

**For SD-Turbo** (requires 4-8GB VRAM):
```bash
# Add to environment
export COMMANDLINE_ARGS="--lowvram"
docker compose -f docker-compose.turbo.yml up
```

**For SDXL-Turbo** (requires 12GB+ VRAM):
```bash
# Reduce resolution or use medvram
export RESOLUTION=768:768
export COMMANDLINE_ARGS="--medvram"
docker compose -f docker-compose.turbo.yml up
```

### Slow Generation

1. **Check GPU utilization**: `nvidia-smi`
2. **Verify turbo model loaded**: Check SD-Forge UI settings
3. **Reduce steps**: Use 1 step for SD-Turbo, 1-2 for SDXL-Turbo
4. **Lower resolution**: 512x512 for SD-Turbo is optimal

### Stream Buffering

Adjust encoder settings:
```bash
export ENCODER_QUALITY=turbo  # Lowest latency
export FPS=30  # Higher framerate
docker compose -f docker-compose.turbo.yml up
```

## Performance Benchmarks

### SD-Turbo (512x512, 1 step)
- **Generation time**: ~50-100ms per frame (RTX 4090)
- **Effective FPS**: 10-20 FPS live generation
- **VRAM usage**: ~4GB

### SDXL-Turbo (1024x1024, 2 steps)
- **Generation time**: ~200-300ms per frame (RTX 4090)
- **Effective FPS**: 3-5 FPS live generation
- **VRAM usage**: ~10-12GB

### 3-Node Load Balanced (SD-Turbo)
- **Effective FPS**: 30-60 FPS (distributed)
- **Speedup**: ~3x with round-robin
- **Use case**: Real-time interactive experiences

## Stopping the Stack

```bash
# Stop all services
docker compose -f docker-compose.turbo.yml down

# Stop and remove volumes (WARNING: deletes generated content)
docker compose -f docker-compose.turbo.yml down -v
```

## Advanced Configuration

### Custom Model Paths

To use your own models instead of downloading:

1. Create a `models` directory
2. Place models in `models/Stable-diffusion/`
3. Mount volume: `- ./models:/stable-diffusion-webui/models`

### Environment Variables

- `ENCODER_QUALITY`: turbo, low, medium, high, ultra
- `FPS`: Framerate (default: 24)
- `RESOLUTION`: Width:Height (e.g., 512:512, 1024:1024)
- `DEFORUM_MEDIATOR_URL`: WebSocket mediator URL
- `ENABLE_PERFORMANCE_MODE`: true/false (default: true for turbo)

## Security Notes

⚠️ **Warning**: This configuration includes `--enable-insecure-extension-access` for development. For production:

1. Use a reverse proxy with authentication
2. Restrict network access
3. Never expose ports directly to the internet
4. Review the [security documentation](../docs/TROUBLESHOOTING.md)

## References

- [SD-Turbo on HuggingFace](https://huggingface.co/stabilityai/sd-turbo)
- [SDXL-Turbo on HuggingFace](https://huggingface.co/stabilityai/sdxl-turbo)
- [Stability AI Turbo Blog Post](https://stability.ai/news/stability-ai-sdxl-turbo)
- [SD-Forge Documentation](https://github.com/lllyasviel/stable-diffusion-webui-forge)
- [Deforum Extension](https://github.com/Tok/sd-forge-deforum)

## Support

For issues specific to:
- **Turbo models**: Check [Stability AI discussions](https://huggingface.co/stabilityai/sd-turbo/discussions)
- **SD-Forge**: See [Forge repository](https://github.com/lllyasviel/stable-diffusion-webui-forge/issues)
- **Defora setup**: Check main repository issues or TROUBLESHOOTING.md
