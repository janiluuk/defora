# forge-cli

A command-line client for Stable Diffusion WebUI Forge with support for txt2img generation, Deforum animations, and audioreactive video synthesis.

## Features

- **txt2img Generation**: Create still images with model-aware defaults
- **Model Management**: Auto-detect and switch between Flux, SD1.5, SDXL models
- **Deforum Animations**: Submit animation batches with JSON preset support
- **Audioreactive**: Map audio frequency bands to animation parameters (NEW!)

## Installation

```bash
# Basic installation (txt2img and deforum)
pip install requests

# For audioreactive features
pip install librosa numpy soundfile
```

## Quick Start

### Generate an image

```bash
./forge_cli.py "a synthwave city at night, neon, wide shot"
```

### Create a Deforum animation

```bash
./forge_cli.py deforum -f 240 --fps 24 \
  "cosmic fractal cathedral, slowly zooming"
```

### Create an audioreactive animation

```bash
./forge_cli.py deforum -f 240 --fps 24 \
  --audio music.mp3 \
  --audio-map-zoom-low 0.05 \
  --audio-map-angle-high 2.0 \
  "pulsating cosmic energy, abstract art"
```

See [AUDIOREACTIVE.md](AUDIOREACTIVE.md) for detailed audioreactive documentation.

## Usage

### List available models

```bash
./forge_cli.py models
```

### Generate images with specific settings

```bash
./forge_cli.py img -W 832 -H 1216 -n 4 \
  --steps 30 --cfg-scale 7.0 \
  "moody portrait, cinematic lighting"
```

### Switch models

```bash
./forge_cli.py --model "flux" img "dreamy portrait"
```

### Deforum with preset

```bash
./forge_cli.py deforum --preset my_preset.json \
  "dreamlike forest" \
  -N "lowres, text, watermark"
```

## Environment Variables

- `FORGE_API_BASE`: Base URL of Forge API (default: `http://127.0.0.1:7860`)
- `FORGE_OUT_DIR`: Output directory for images (default: `forge_cli_output`)

## Requirements

- Stable Diffusion WebUI Forge running with API enabled
- For Deforum: Forge must be started with `--deforum-api` flag
- Python 3.7+
- `requests` library

## Audioreactive Features

Map audio frequency bands (low, mid, high) to Deforum parameters:

- **Strength values**: Control frame-to-frame variation
- **Camera movement**: Zoom, rotation (2D and 3D), translation (X, Y, Z)
- **Generation parameters**: Noise, CFG scale

Default frequency ranges:
- Low: 100-300 Hz (bass)
- Mid: 300-3000 Hz (vocals, melody)
- High: 3000-8000 Hz (cymbals, hi-hats)

Custom ranges are supported. See [AUDIOREACTIVE.md](AUDIOREACTIVE.md) for complete documentation.

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.
