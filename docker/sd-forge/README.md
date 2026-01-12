# SD-Forge Docker Service

This directory contains the Dockerfile for running Stable Diffusion WebUI Forge with the Deforumation-patched Deforum extension.

## Features

- Based on the official `ghcr.io/lllyasviel/stable-diffusion-webui-forge:latest` image
- Pre-installed Deforum extension with Deforumation websocket support
- GPU acceleration support via NVIDIA runtime
- Persistent volumes for models and outputs
- Automatic health checking
- Configured to connect to the mediator service

## Docker Compose Configuration

The `sd-forge` service in `docker-compose.yml` includes:

### Command-line Arguments

- `--listen` - Allow connections from outside localhost
- `--port 7860` - Web UI port
- `--deforum-api` - Enable Deforum API endpoints (required for defora)
- `--enable-insecure-extension-access` - Allow extensions to access the API
- `--skip-version-check` - Skip checking for updates on startup
- `--no-half-vae` - Disable half-precision VAE (better quality)
- `--xformers` - Use xformers for memory-efficient attention

> **Security Note**: The `--enable-insecure-extension-access` flag allows extensions full API access without authentication. This is suitable for local development and trusted networks. For production deployments:
> - Use a reverse proxy with authentication (e.g., nginx with basic auth)
> - Restrict network access using Docker networks or firewall rules
> - Consider removing this flag and manually configuring extension permissions
> - Never expose port 7860 directly to the internet without authentication

### GPU Requirements

The service requires NVIDIA GPU with Docker GPU support. Configure using:

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: all
          capabilities: [gpu]
```

**Prerequisites:**
- NVIDIA GPU with CUDA support
- NVIDIA Container Toolkit installed
- Docker with GPU support enabled

### Volumes

- `models:/stable-diffusion-webui/models` - Persistent storage for AI models
- `outputs:/stable-diffusion-webui/outputs` - Generated images and videos
- `frames:/data/frames` - Shared frames volume with encoder
- `hls:/var/www/hls` - HLS streaming output

### Environment Variables

- `DEFORUM_MEDIATOR_URL` - WebSocket URL for mediator (default: `ws://mediator:8765`)
- `OUTPUT_DIR` - Output directory for frames (default: `/data/frames`)
- `HLS_PATH` - Path for HLS segments (default: `/var/www/hls`)

## Usage

### Start with docker-compose

```bash
# Start all services including sd-forge
docker compose up --build

# Start only sd-forge with its dependencies
docker compose up --build sd-forge mediator web
```

### Access the Web UI

Once started, access the Forge web UI at: **http://localhost:7860**

### Health Check

The service includes a health check that polls the `/docs` endpoint using Python's built-in urllib. It allows 120 seconds for initial startup (model loading) before considering the service healthy.

### First-Time Setup

**Automated Setup (Recommended)**

Run the setup script to automate the first-time configuration:

```bash
./scripts/setup_sd_forge.sh
```

This script will guide you through:
- Building the SD-Forge image with Deforum extension
- Configuring the mediator URL
- Verifying the installation
- Optionally starting the services

**Manual Setup**

If you prefer to set up manually:

1. **Download Models**: The first time you start, you'll need to download AI models from sources like [CivitAI](https://civitai.com) or [HuggingFace](https://huggingface.co). Place them in the `models` volume or mount a directory containing your models. The Forge UI can then detect and use these models.

2. **Configure Deforum**: The Deforum extension is pre-configured to connect to the mediator at `ws://mediator:8765`. You can override this by setting the `DEFORUM_MEDIATOR_URL` environment variable.

3. **Verify Deforum Extension**: 
   - Navigate to the Extensions tab in the Forge UI
   - Verify that "sd-forge-deforum" is installed and enabled
   - Check that `deforum_mediator.cfg` contains the correct mediator URL

## Troubleshooting

### Service won't start

Check logs:
```bash
docker compose logs sd-forge
```

Common issues:
- GPU not available: Ensure NVIDIA Container Toolkit is installed
- Out of memory: Reduce batch size or use smaller models
- Models not found: Download models to the models volume

### Cannot connect to mediator

Verify mediator is running and healthy:
```bash
docker compose ps mediator
docker compose logs mediator
```

Check the mediator URL configuration:
```bash
docker compose exec sd-forge cat extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg
```

### Deforum API not available

Ensure the `--deforum-api` flag is present in the command. Check with:
```bash
docker compose config | grep -A 20 sd-forge
```

## Development

### Rebuild the image

```bash
docker compose build sd-forge
```

### Override mediator URL

```bash
DEFORUM_MEDIATOR_URL=ws://custom-host:8765 docker compose up sd-forge
```

### Add custom command-line arguments

To add custom command-line arguments, you need to override the `command` in docker-compose.yml. Create a `docker-compose.override.yml` file:

```yaml
services:
  sd-forge:
    command: 
      - python
      - launch.py
      - --listen
      - --port
      - "7860"
      - --deforum-api
      - --enable-insecure-extension-access
      - --skip-version-check
      - --no-half-vae
      - --xformers
      - --my-custom-flag
```

Or edit the `command` section directly in `docker-compose.yml` and add your custom arguments to the list.

## Notes

- The service waits for the `web` and `mediator` services to be healthy before starting
- Initial startup may take several minutes while models are loaded
- GPU memory requirements vary based on the models used (12GB+ recommended)
- The Deforum extension is a patched version from the Deforumation project with websocket support

## References

- [Stable Diffusion WebUI Forge](https://github.com/lllyasviel/stable-diffusion-webui-forge)
- [Tok's Deforum for SD-Forge](https://github.com/Tok/sd-forge-deforum)
- [DeforumationQT](https://github.com/Rakile/DeforumationQT)
