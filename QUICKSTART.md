# Quick Start Guide - Get Running in 5 Minutes

This is the fastest way to get started with sd-cli. For complete documentation, see [README.md](README.md).

## Step 1: Prerequisites (2 minutes)

### You need:
1. **Stable Diffusion WebUI Forge** installed and working
2. **Python 3.7+** installed

### Start Forge:
```bash
cd /path/to/stable-diffusion-webui-forge
./webui.sh
```

Wait for this message: `Running on local URL: http://127.0.0.1:7860`

## Step 2: Install sd-cli (1 minute)

```bash
# Download
git clone https://github.com/janiluuk/sd-cli.git
cd sd-cli

# Install dependency
pip install requests

# Make executable
chmod +x forge_cli.py
```

## Step 3: Test It (30 seconds)

```bash
# Check if it can connect to Forge
./forge_cli.py models
```

You should see a list of your installed models.

## Step 4: Generate Your First Image (1 minute)

```bash
# Generate an image (auto-selects best model)
./forge_cli.py "a beautiful sunset over mountains"
```

The image will be saved in `forge_cli_output/img/` directory.

## Step 5: Try Different Commands (30 seconds)

```bash
# Generate multiple images
./forge_cli.py img -n 4 "fantasy dragon, detailed, colorful"

# Use a specific model
./forge_cli.py --model "flux" img "cyberpunk street scene"

# Custom resolution portrait
./forge_cli.py img -W 832 -H 1216 "portrait of a wizard"
```

## 🎉 You're Ready!

### Next Steps:

1. **Read the full guide**: [README.md](README.md)
2. **Try examples**: [examples/README.md](examples/README.md)
3. **Customize settings**: Use `--help` for all options

### Common Commands Cheat Sheet:

```bash
# List models
./forge_cli.py models

# Basic image
./forge_cli.py "your prompt here"

# With options
./forge_cli.py img -W 1024 -H 1024 -n 2 "prompt"

# Negative prompts
./forge_cli.py img -N "blurry, bad quality" "prompt"

# Animations (requires --deforum-api)
./forge_cli.py deforum -f 120 "animation prompt"

# Help
./forge_cli.py --help
./forge_cli.py img --help
./forge_cli.py deforum --help
```

## Troubleshooting

**Can't connect to Forge?**
```bash
# Check if Forge is running
curl http://127.0.0.1:7860/docs

# If using different port/IP
./forge_cli.py --base-url http://localhost:7860 img "test"
```

**Python module error?**
```bash
pip install requests
# or
pip3 install requests
```

**Permission denied?**
```bash
chmod +x forge_cli.py
```

---

**Need help?** Check [README.md](README.md) for detailed documentation or open an issue on GitHub.
