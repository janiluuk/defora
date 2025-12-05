# sd-cli (forge-cli)

A powerful command-line interface for [Stable Diffusion WebUI Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge), designed for Linux users who want to generate AI images and animations directly from the terminal.

## ✨ Features

- **🎨 Text-to-Image Generation**: Generate still images with intelligent model-aware defaults
- **🎬 Deforum Animations**: Create animated sequences with optional JSON preset support
- **🔄 Smart Model Switching**: Automatically selects optimal models (prefers Flux1-schnell)
- **📊 Model Inspection**: List and analyze available models with detected profiles
- **⚙️ Model-Aware Defaults**: Automatic configuration based on model type (Flux, SD1.5, SDXL)
- **🚀 Optimized Settings**: Pre-configured sampling steps, CFG scale, and samplers per model

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Commands](#commands)
  - [Image Generation (img)](#image-generation-img)
  - [Deforum Animations (deforum)](#deforum-animations-deforum)
  - [Model Management (models)](#model-management-models)
- [Model Profiles](#model-profiles)
- [Usage Examples](#usage-examples)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Stable Diffusion WebUI Forge** - Must be running and accessible
   - Install from: https://github.com/lllyasviel/stable-diffusion-webui-forge
   - For Deforum animations: Start Forge with `--deforum-api` flag

2. **Python 3.7+** - The CLI tool requires Python

3. **Python Dependencies**:
   - `requests` - For HTTP API communication

### System Requirements

- Linux operating system (primary target)
- Network access to Forge API (default: `http://127.0.0.1:7860`)
- Sufficient disk space for generated images/animations

## Installation

### Step 1: Clone or Download

```bash
# Clone the repository
git clone https://github.com/janiluuk/sd-cli.git
cd sd-cli

# Or download the single file directly
wget https://raw.githubusercontent.com/janiluuk/sd-cli/main/forge_cli.py
chmod +x forge_cli.py
```

### Step 2: Install Python Dependencies

```bash
# Using pip
pip install requests

# Or using pip3
pip3 install requests

# Optional: Create a virtual environment
python3 -m venv venv
source venv/bin/activate
pip install requests
```

### Step 3: Make Executable (Optional)

```bash
chmod +x forge_cli.py

# Optional: Create a symbolic link for easier access
sudo ln -s $(pwd)/forge_cli.py /usr/local/bin/forge-cli
```

### Step 4: Verify Installation

```bash
# Test the CLI
./forge_cli.py --help

# Or if you created a symlink
forge-cli --help
```

## Quick Start

### 1. Start Stable Diffusion WebUI Forge

```bash
# Navigate to your Forge installation directory
cd /path/to/stable-diffusion-webui-forge

# Start Forge (basic)
./webui.sh

# Or with Deforum support for animations
./webui.sh --deforum-api
```

### 2. Generate Your First Image

```bash
# Simple generation (uses auto-detected best model)
./forge_cli.py "a beautiful sunset over mountains, vibrant colors"

# The image will be saved to: forge_cli_output/img/
```

### 3. List Available Models

```bash
./forge_cli.py models
```

### 4. Generate with Specific Settings

```bash
./forge_cli.py img -W 1280 -H 720 -n 2 \
  "cyberpunk city at night, neon lights, high detail"
```

## Configuration

### Environment Variables

Configure the CLI behavior using environment variables:

```bash
# Set Forge API base URL (if not using default)
export FORGE_API_BASE="http://192.168.1.100:7860"

# Set custom output directory
export FORGE_OUT_DIR="/home/user/ai-art"

# Use in command
./forge_cli.py "test image"
```

### Command-Line Options

Global options available for all commands:

- `--base-url URL` - Override Forge API URL
- `--outdir PATH` - Set output directory for images
- `--model SUBSTRING` - Switch to specific model before generation
- `--no-auto-model` - Disable automatic model selection
- `-q, --quiet` - Suppress informational messages

## Commands

### Image Generation (img)

Generate still images using txt2img with intelligent defaults.

#### Basic Syntax

```bash
./forge_cli.py img [OPTIONS] "prompt"
```

#### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--num-images` | `-n` | int | 1 | Number of images to generate |
| `--negative` | `-N` | str | "" | Negative prompt |
| `--width` | `-W` | int | 1024 | Image width in pixels |
| `--height` | `-H` | int | 1024 | Image height in pixels |
| `--steps` | | int | auto | Sampling steps (model-aware) |
| `--cfg-scale` | | float | auto | CFG scale (model-aware) |
| `--sampler` | | str | auto | Sampler name (model-aware) |
| `--seed` | | int | -1 | Random seed (-1 for random) |

#### Examples

```bash
# Basic generation
./forge_cli.py img "a cozy cabin in the woods"

# High resolution portrait
./forge_cli.py img -W 832 -H 1216 \
  "portrait of a wizard, detailed, fantasy art"

# Multiple variations with negative prompt
./forge_cli.py img -n 4 -N "blurry, low quality" \
  "majestic dragon flying over castle"

# Specific model and custom settings
./forge_cli.py --model "revAnimated" img --steps 30 --cfg-scale 8.0 \
  "anime girl in cyberpunk city, neon lights"

# Reproducible generation with seed
./forge_cli.py img --seed 42 \
  "golden retriever puppy playing in a field"
```

### Deforum Animations (deforum)

Create animated sequences with motion and prompt scheduling.

**Important**: Forge must be started with `--deforum-api` flag for this to work.

#### Basic Syntax

```bash
./forge_cli.py deforum [OPTIONS] "prompt"
```

#### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--negative` | `-N` | str | "" | Negative prompt |
| `--preset` | | path | - | JSON preset from Deforum UI |
| `--frames` | `-f` | int | 120 | Number of frames to render |
| `--fps` | | int | 24 | Frames per second |
| `--width` | `-W` | int | 1024 | Frame width in pixels |
| `--height` | `-H` | int | 576 | Frame height in pixels |
| `--steps` | | int | auto | Sampling steps per frame |
| `--cfg-scale` | | float | auto | CFG scale |
| `--sampler` | | str | auto | Sampler name |
| `--seed` | | int | -1 | Random seed |
| `--zoom` | | float | 1.02 | Zoom per frame |
| `--noise` | | float | 0.065 | Noise schedule value |
| `--strength` | | float | 0.65 | Strength schedule value |
| `--poll` | | flag | false | Poll for completion status |
| `--poll-interval` | | float | 10.0 | Seconds between status checks |

#### Examples

```bash
# Simple 5-second animation (120 frames @ 24fps)
./forge_cli.py deforum "surreal landscape morphing through seasons"

# Longer animation with custom settings
./forge_cli.py deforum -f 240 --fps 30 \
  "cosmic journey through space nebulae"

# With negative prompt and custom zoom
./forge_cli.py deforum -f 180 --zoom 1.01 \
  -N "static, boring, low quality" \
  "evolving fractal patterns, kaleidoscope"

# Using a Deforum preset (exported from UI)
./forge_cli.py deforum --preset my_animation_preset.json \
  "underwater coral reef ecosystem, fish swimming"

# Poll for completion
./forge_cli.py deforum --poll --poll-interval 5 \
  "time-lapse of city from day to night"

# High-resolution animation
./forge_cli.py deforum -W 1920 -H 1080 -f 300 --fps 30 \
  "cinematic flythrough of alien planet"
```

**Note**: Deforum outputs are saved to Forge's default Deforum directory (usually `outputs/deforum/` in your Forge installation).

### Model Management (models)

List and inspect available Stable Diffusion models.

#### Syntax

```bash
./forge_cli.py models
```

#### Output

Displays a table showing:
- Index number
- Active indicator (*)
- Model title/filename
- Detected model class (flux_schnell, flux_other, sd15, sdxl, other)
- Profile description

#### Example Output

```
Available models:

  #  *  Title                                     Class       Note
--------------------------------------------------------------------
  0  *  flux1-schnell-fp8.safetensors             flux_schnell  Flux1-schnell / speed-optimised Flux
  1     sd_xl_base_1.0.safetensors               sdxl          SDXL / XL-style model
  2     v1-5-pruned-emaonly.safetensors          sd15          Stable Diffusion 1.5-style model
  3     revAnimated_v122.safetensors             other         Unknown model type (generic defaults)

Legend:
  - flux_schnell: Flux1-schnell / speed-optimised Flux
  - flux_other  : Other Flux-style model
  - sd15        : Stable Diffusion 1.5-style model
  - sdxl        : SDXL / XL-style model
  - other       : Unknown model type (generic defaults)
```

## Model Profiles

The CLI automatically detects model types and applies optimal settings:

### Flux1-schnell (flux_schnell)
- **Detection**: Model name contains "flux" and "schnell"
- **Image Settings**: 6 steps, CFG 1.0, Euler sampler
- **Deforum Settings**: 6 steps, CFG 1.0, Euler a sampler
- **Best for**: Fast generation, real-time applications

### Other Flux Models (flux_other)
- **Detection**: Model name contains "flux" (but not schnell)
- **Image Settings**: 12 steps, CFG 2.0, Euler sampler
- **Deforum Settings**: 12 steps, CFG 2.0, Euler a sampler
- **Best for**: Quality Flux generations

### SD 1.5 (sd15)
- **Detection**: Model name contains "1.5", "v1-5", or "sd15"
- **Image Settings**: 20 steps, CFG 7.0, DPM++ 2M Karras
- **Deforum Settings**: 18 steps, CFG 7.0, Euler a sampler
- **Best for**: Classic SD generations, wide model selection

### SDXL (sdxl)
- **Detection**: Model name contains "sdxl", "xl-", "xl_", or "xl base"
- **Image Settings**: 30 steps, CFG 5.0, DPM++ 2M Karras
- **Deforum Settings**: 24 steps, CFG 5.5, Euler a sampler
- **Best for**: High-quality, high-resolution images

### Unknown/Generic (other)
- **Detection**: Fallback for unrecognized models
- **Image Settings**: 20 steps, CFG 6.5, Euler sampler
- **Deforum Settings**: 18 steps, CFG 6.5, Euler a sampler
- **Best for**: New or custom models

## Usage Examples

### Basic Workflow Examples

#### Example 1: Quick Test Generation
```bash
# Test if everything is working
./forge_cli.py "test image, simple landscape"
```

#### Example 2: Portrait Photography
```bash
# High-quality portrait with negative prompts
./forge_cli.py img -W 832 -H 1216 \
  -N "blurry, bad anatomy, distorted face" \
  "professional portrait photo, natural lighting, shallow depth of field"
```

#### Example 3: Batch Generation
```bash
# Generate multiple variations at once
./forge_cli.py img -n 8 \
  "fantasy character concept art, detailed armor"
```

#### Example 4: Landscape Photography
```bash
# Wide landscape with specific model
./forge_cli.py --model "realistic" img -W 1920 -H 1080 \
  "mountain landscape at golden hour, dramatic clouds, professional photography"
```

### Animation Workflow Examples

#### Example 5: Simple Zoom Animation
```bash
# 10-second video with slow zoom
./forge_cli.py deforum -f 240 --fps 24 --zoom 1.005 \
  "mystical forest with glowing mushrooms"
```

#### Example 6: Using Presets
```bash
# Export a preset from Deforum UI, then use it
./forge_cli.py deforum --preset ~/complex_motion.json \
  "futuristic city with flying cars" \
  -N "static, boring"
```

#### Example 7: Monitor Progress
```bash
# Long animation with status polling
./forge_cli.py deforum -f 600 --fps 30 --poll \
  "journey through abstract dimensions"
```

### Model Selection Examples

#### Example 8: Force Specific Model
```bash
# Switch to a specific model
./forge_cli.py --model "revAnimated" img \
  "anime style character, vibrant colors"
```

#### Example 9: Disable Auto-Selection
```bash
# Keep current model, don't auto-switch
./forge_cli.py --no-auto-model img \
  "any style prompt"
```

#### Example 10: Survey Available Models
```bash
# See what models you have installed
./forge_cli.py models

# Then pick one by name fragment
./forge_cli.py --model "xl" img "test with XL model"
```

### Advanced Examples

#### Example 11: Reproducible Generations
```bash
# Use same seed for consistent results
SEED=123456
./forge_cli.py img --seed $SEED "fantasy castle"
./forge_cli.py img --seed $SEED "fantasy castle"  # Same image
```

#### Example 12: Custom Output Location
```bash
# Organize by project
export FORGE_OUT_DIR="/home/user/projects/game-assets"
./forge_cli.py img "weapon concept art, sword"
```

#### Example 13: Override Auto-Settings
```bash
# Force specific technical settings
./forge_cli.py img --steps 50 --cfg-scale 9.0 --sampler "DPM++ SDE Karras" \
  "ultra detailed fantasy scene"
```

#### Example 14: Remote Forge Instance
```bash
# Connect to Forge on another machine
./forge_cli.py --base-url "http://192.168.1.50:7860" img \
  "test on remote server"
```

#### Example 15: Silent Operation
```bash
# Quiet mode for scripting
./forge_cli.py -q img "batch generation" > output_paths.txt
```

## Advanced Usage

### Scripting and Automation

Create batch generation scripts:

```bash
#!/bin/bash
# batch_generate.sh

PROMPTS=(
  "forest in spring, vibrant green"
  "forest in summer, bright sunlight"
  "forest in autumn, golden leaves"
  "forest in winter, snow covered"
)

for prompt in "${PROMPTS[@]}"; do
  echo "Generating: $prompt"
  ./forge_cli.py img -n 2 "$prompt"
done
```

### Integration with Other Tools

```bash
# Generate and immediately process with ImageMagick
./forge_cli.py img "landscape" | while read img; do
  convert "$img" -resize 50% "${img%.png}_thumb.png"
done

# Generate multiple sizes
for size in "512:512" "1024:1024" "1920:1080"; do
  IFS=':' read -r w h <<< "$size"
  ./forge_cli.py img -W $w -H $h "test at ${w}x${h}"
done
```

### JSON Preset Workflow (Deforum)

1. Create animation in Deforum UI with desired settings
2. Export settings as JSON
3. Use with CLI to batch-generate with different prompts:

```bash
# Base preset with all motion/camera settings
PRESET="my_camera_motion.json"

# Generate multiple animations with same motion
./forge_cli.py deforum --preset "$PRESET" "scene 1: desert landscape"
./forge_cli.py deforum --preset "$PRESET" "scene 2: ocean waves"
./forge_cli.py deforum --preset "$PRESET" "scene 3: mountain peaks"
```

### Environment-Based Configuration

Create a `.env` file or shell script:

```bash
# forge-config.sh
export FORGE_API_BASE="http://127.0.0.1:7860"
export FORGE_OUT_DIR="$HOME/ai-generations"

# Source it before using
source forge-config.sh
./forge_cli.py img "test"
```

## Troubleshooting

### Connection Issues

**Problem**: `[error] Could not reach Forge at http://127.0.0.1:7860`

**Solutions**:
- Verify Forge is running: `curl http://127.0.0.1:7860/docs`
- Check if port 7860 is in use: `netstat -tuln | grep 7860`
- Try different base URL: `./forge_cli.py --base-url http://localhost:7860 img "test"`
- Check firewall settings if using remote Forge

### Missing Dependencies

**Problem**: `ModuleNotFoundError: No module named 'requests'`

**Solution**:
```bash
pip install requests
# Or
pip3 install requests
```

### Deforum Not Working

**Problem**: `[error] Deforum API error 404` or `Not Found`

**Solutions**:
- Ensure Forge was started with `--deforum-api` flag
- Restart Forge: `./webui.sh --deforum-api`
- Verify endpoint: `curl http://127.0.0.1:7860/deforum_api/batches`

### Model Not Found

**Problem**: `[warn] No model matched hint 'xyz'`

**Solutions**:
- List available models: `./forge_cli.py models`
- Use exact substring from model list
- Check model is installed in Forge's `models/Stable-diffusion/` directory

### Permission Denied

**Problem**: `Permission denied` when running `./forge_cli.py`

**Solution**:
```bash
chmod +x forge_cli.py
```

### Images Not Generating

**Problem**: Command succeeds but no images appear

**Solutions**:
- Check output directory: `ls -la forge_cli_output/img/`
- Verify write permissions: `touch forge_cli_output/test && rm forge_cli_output/test`
- Try custom output dir: `./forge_cli.py --outdir /tmp/test img "test"`

### Slow Generation

**Problem**: Generation takes very long

**Solutions**:
- Use Flux1-schnell for speed: `./forge_cli.py --model "schnell" img "test"`
- Reduce resolution: `-W 512 -H 512`
- Reduce steps: `--steps 10`
- Check GPU utilization in Forge

### Python Version Issues

**Problem**: Script fails with syntax errors

**Solutions**:
```bash
# Check Python version
python3 --version  # Should be 3.7+

# Use explicit Python 3
python3 forge_cli.py img "test"
```

## Tips and Best Practices

### Performance Optimization

1. **Use Flux1-schnell for speed**: 6 steps vs 20-30 for SD1.5/SDXL
2. **Start with lower resolutions**: Test prompts at 512x512, then upscale
3. **Batch similar images**: Use `-n` flag to generate multiple at once
4. **Keep Forge running**: Avoid model loading overhead between generations

### Prompt Engineering

1. **Be specific**: "portrait of elderly man, wrinkles, gray beard, outdoor lighting"
2. **Use negative prompts**: `-N "blurry, deformed, low quality"`
3. **Add style keywords**: "digital art", "oil painting", "photograph", etc.
4. **Quality boosters**: "detailed", "high quality", "masterpiece", "8k"

### Model Selection

1. **Flux1-schnell**: Best for speed, iteration, testing
2. **SD 1.5**: Huge model ecosystem, styles, specific training
3. **SDXL**: Best quality for photorealism and details
4. **Specialized models**: Use `--model` to switch to anime, art-style models

### Output Organization

```bash
# Organize by project
export FORGE_OUT_DIR="$HOME/ai-projects"

# Or use subdirectories
mkdir -p renders/characters renders/landscapes
FORGE_OUT_DIR="renders/characters" ./forge_cli.py img "character design"
FORGE_OUT_DIR="renders/landscapes" ./forge_cli.py img "landscape scene"
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to improve this tool.

## License

Check the repository for license information.

## Links

- **Repository**: https://github.com/janiluuk/sd-cli
- **Stable Diffusion WebUI Forge**: https://github.com/lllyasviel/stable-diffusion-webui-forge
- **Original Stable Diffusion WebUI**: https://github.com/AUTOMATIC1111/stable-diffusion-webui

---

**Made with ❤️ for the AI art community**
