# Audioreactive Animations with forge-cli

This document describes how to use the audioreactive features of forge-cli to create Deforum animations that respond to music.

## Overview

The audioreactive feature analyzes an audio file and maps frequency bands (low, medium, high) to various Deforum animation parameters. This allows you to create animations that pulse, zoom, rotate, or transform in sync with music.

## Requirements

To use audioreactive features, you need to install additional dependencies:

```bash
pip install librosa numpy soundfile
```

## Basic Usage

The simplest way to use audioreactive features is to specify an audio file and one or more mappings:

```bash
./forge_cli.py deforum -f 240 --fps 24 \
  --audio music.mp3 \
  --audio-map-zoom-low 0.05 \
  "cosmic energy pulsating with the beat"
```

This command:
- Creates a 240-frame animation at 24 fps
- Analyzes `music.mp3` for low frequency content (bass, typically 100-300 Hz)
- Modulates the zoom parameter based on low frequencies with a strength of 0.05

## Frequency Bands

By default, audio is analyzed in three frequency bands:

- **Low** (100-300 Hz): Bass and kick drums
- **Mid** (300-3000 Hz): Most vocals and melodic instruments
- **High** (3000-8000 Hz): Cymbals, hi-hats, and high-frequency effects

You can customize these ranges with `--audio-low-min`, `--audio-low-max`, `--audio-mid-min`, `--audio-mid-max`, `--audio-high-min`, and `--audio-high-max`.

## Mappable Parameters

You can map audio frequency bands to the following Deforum parameters:

### Strength
- `--audio-map-strength-low`, `--audio-map-strength-mid`, `--audio-map-strength-high`
- Controls how much each frame differs from the previous frame
- Example: `--audio-map-strength-mid 0.15`

### Zoom
- `--audio-map-zoom-low`, `--audio-map-zoom-mid`, `--audio-map-zoom-high`
- Controls camera zoom in/out
- Example: `--audio-map-zoom-low 0.05`

### 2D Rotation (Angle)
- `--audio-map-angle-low`, `--audio-map-angle-mid`, `--audio-map-angle-high`
- Controls 2D rotation of the frame
- Example: `--audio-map-angle-high 2.0`

### Translation (X, Y, Z)
- `--audio-map-translation-x-{low,mid,high}`
- `--audio-map-translation-y-{low,mid,high}`
- `--audio-map-translation-z-{low,mid,high}`
- Controls camera movement in 3D space
- Example: `--audio-map-translation-x-mid 5.0`

### 3D Rotation (X, Y, Z)
- `--audio-map-rotation-3d-x-{low,mid,high}`
- `--audio-map-rotation-3d-y-{low,mid,high}`
- `--audio-map-rotation-3d-z-{low,mid,high}`
- Controls 3D rotation around each axis
- Example: `--audio-map-rotation-3d-y-mid 1.5`

### Noise
- `--audio-map-noise-low`, `--audio-map-noise-mid`, `--audio-map-noise-high`
- Controls noise in the generation process
- Example: `--audio-map-noise-high 0.02`

### CFG Scale
- `--audio-map-cfg-low`, `--audio-map-cfg-mid`, `--audio-map-cfg-high`
- Controls how closely the generation follows the prompt
- Example: `--audio-map-cfg-mid 1.0`

## Example Commands

### Bass-driven zoom

```bash
./forge_cli.py deforum -f 240 --fps 24 \
  --audio song.mp3 \
  --audio-map-zoom-low 0.08 \
  "abstract kaleidoscope patterns, vibrant colors"
```

### High-frequency rotation with mid-frequency strength

```bash
./forge_cli.py deforum -f 480 --fps 30 \
  --audio electronic_music.mp3 \
  --audio-map-angle-high 3.0 \
  --audio-map-strength-mid 0.2 \
  "cyberpunk cityscape, neon lights, rain"
```

### Multi-axis 3D rotation

```bash
./forge_cli.py deforum -f 360 --fps 24 \
  --audio ambient.mp3 \
  --audio-map-rotation-3d-x-low 0.5 \
  --audio-map-rotation-3d-y-mid 0.8 \
  --audio-map-rotation-3d-z-high 0.3 \
  "floating through space nebula, stars, cosmic dust"
```

### Custom frequency ranges for specific music

```bash
./forge_cli.py deforum -f 240 --fps 24 \
  --audio dubstep.mp3 \
  --audio-low-min 40 \
  --audio-low-max 150 \
  --audio-mid-min 150 \
  --audio-mid-max 4000 \
  --audio-high-min 4000 \
  --audio-high-max 12000 \
  --audio-map-zoom-low 0.1 \
  --audio-map-translation-z-mid 2.0 \
  "explosive energy, particles, dynamic motion"
```

### Complex multi-parameter mapping

```bash
./forge_cli.py deforum -f 600 --fps 30 \
  --audio full_song.mp3 \
  --audio-map-zoom-low 0.05 \
  --audio-map-angle-high 1.5 \
  --audio-map-strength-mid 0.12 \
  --audio-map-translation-x-mid 3.0 \
  --audio-map-rotation-3d-y-low 0.4 \
  --audio-map-cfg-mid 0.8 \
  "psychedelic journey through fractal dimensions"
```

## Tips and Best Practices

1. **Start Simple**: Begin with one or two mappings and gradually add more to understand how each affects your animation.

2. **Modulation Strength**: The modulation value determines how much the parameter varies:
   - Small values (0.01-0.1): Subtle effects
   - Medium values (0.1-0.5): Noticeable effects
   - Large values (0.5+): Strong, dramatic effects

3. **Frequency Band Selection**:
   - Use **low** frequencies for slower, powerful movements (zoom, Z-translation)
   - Use **mid** frequencies for rhythmic elements (strength, X/Y translation)
   - Use **high** frequencies for fast, jittery effects (rotation, angle)

4. **Frame Count**: Make sure your frame count matches your audio duration:
   ```
   frames = duration_in_seconds * fps
   ```
   For a 30-second song at 24 fps: `-f 720`

5. **Test with Short Clips**: Before generating a full-length animation, test with a shorter duration (e.g., 120 frames) to dial in your parameters.

6. **Combine with Presets**: You can use audioreactive features with JSON presets:
   ```bash
   ./forge_cli.py deforum --preset my_preset.json \
     --audio music.mp3 \
     --audio-map-zoom-low 0.05 \
     "your prompt here"
   ```

## Troubleshooting

### Error: "Audio analysis requires librosa and numpy"

Install the required dependencies:
```bash
pip install librosa numpy soundfile
```

### Audio file not found

Ensure you provide the correct path to your audio file. Use absolute paths or paths relative to your current working directory.

### Animation too subtle or too extreme

Adjust the modulation strength values. If effects are too subtle, increase them (e.g., from 0.05 to 0.15). If too extreme, decrease them.

### Audio seems out of sync

- Ensure your frame count and FPS match the audio duration
- Check that your audio file is not corrupted
- Try different frequency ranges if certain elements aren't being detected

## Technical Details

The audioreactive system works by:

1. Loading the audio file and computing its Short-Time Fourier Transform (STFT)
2. Extracting energy values for each frequency band over time
3. Resampling these energy values to match the animation frame rate
4. Normalizing values to a 0-1 range
5. Mapping normalized values to parameter ranges around base values
6. Generating Deforum schedule strings for each mapped parameter

Each mapped parameter gets a schedule like:
```
0:(1.0200), 1:(1.0350), 2:(1.0180), 3:(1.0420), ...
```

This schedule tells Deforum the exact value to use for that parameter at each frame.
