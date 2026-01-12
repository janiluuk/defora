#!/usr/bin/env bash
set -euo pipefail

# SD-Forge first-time setup script
# Automates the steps described in docker/sd-forge/README.md#first-time-setup
# This script helps with:
# 1. Downloading models (with prompts and guidance)
# 2. Configuring Deforum extension
# 3. Verifying Deforum extension installation

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=================================================="
echo "SD-Forge First-Time Setup"
echo "=================================================="
echo ""

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗${NC} Docker is not installed or not in PATH"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is available"

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗${NC} Docker Compose is not available"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Compose is available"
echo ""

# Step 1: Model download guidance
echo -e "${BLUE}Step 1: Model Download${NC}"
echo "=================================================="
echo ""
echo "SD-Forge requires AI models to generate images. You have several options:"
echo ""
echo "Option 1: Download models manually"
echo "  - Visit https://civitai.com or https://huggingface.co"
echo "  - Download models to a local directory"
echo "  - Place them in: docker/sd-forge/models/ (will be copied to volume)"
echo ""
echo "Option 2: Use the Forge UI"
echo "  - Start the service: docker compose up sd-forge mediator web"
echo "  - Access UI at: http://localhost:7860"
echo "  - Go to the Checkpoints tab and download models"
echo ""
echo "Option 3: Mount an existing models directory"
echo "  - Edit docker-compose.yml to mount your models directory"
echo "  - Example: - /path/to/your/models:/stable-diffusion-webui/models"
echo ""

read -p "Do you want to continue with the setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""

# Step 2: Configure Deforum mediator URL
echo -e "${BLUE}Step 2: Deforum Mediator Configuration${NC}"
echo "=================================================="
echo ""
echo "The Deforum extension needs to connect to the mediator service."
echo "Default URL: ws://mediator:8765"
echo ""

read -p "Use default mediator URL? (Y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    read -p "Enter mediator URL (e.g., ws://host.docker.internal:8765): " MEDIATOR_URL
    export DEFORUM_MEDIATOR_URL="$MEDIATOR_URL"
    echo -e "${GREEN}✓${NC} Mediator URL set to: $MEDIATOR_URL"
else
    export DEFORUM_MEDIATOR_URL="ws://mediator:8765"
    echo -e "${GREEN}✓${NC} Using default mediator URL: ws://mediator:8765"
fi

echo ""

# Step 3: Build the sd-forge image
echo -e "${BLUE}Step 3: Building SD-Forge Image${NC}"
echo "=================================================="
echo ""
echo "This will build the SD-Forge Docker image with Deforum extension."
echo "This may take several minutes..."
echo ""

if docker compose build sd-forge; then
    echo ""
    echo -e "${GREEN}✓${NC} SD-Forge image built successfully"
else
    echo ""
    echo -e "${RED}✗${NC} Failed to build SD-Forge image"
    exit 1
fi

echo ""

# Step 4: Verify the build
echo -e "${BLUE}Step 4: Verifying Installation${NC}"
echo "=================================================="
echo ""

# Check if the image exists
if docker images | grep -q "^sd-forge\s"; then
    echo -e "${GREEN}✓${NC} SD-Forge image exists"
else
    echo -e "${RED}✗${NC} SD-Forge image not found"
    exit 1
fi

# Check if deforum extension is in the image (combine all checks in one run)
echo "Verifying Deforum extension installation..."
if MEDIATOR_CFG=$(docker run --rm sd-forge:latest sh -c 'ls extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg > /dev/null 2>&1 && cat extensions/sd-forge-deforum/scripts/deforum_helpers/deforum_mediator.cfg' 2>/dev/null); then
    echo -e "${GREEN}✓${NC} Deforum extension is installed"
    
    # Check mediator config
    if [ -n "$MEDIATOR_CFG" ]; then
        echo -e "${GREEN}✓${NC} Mediator config exists: $MEDIATOR_CFG"
    else
        echo -e "${YELLOW}⚠${NC} Mediator config is empty"
    fi
else
    echo -e "${RED}✗${NC} Deforum extension not found in image"
    exit 1
fi

echo ""

# Step 5: Next steps
echo "=================================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the services:"
echo "   docker compose up sd-forge mediator web"
echo ""
echo "2. Access the Forge UI:"
echo "   http://localhost:7860"
echo ""
echo "3. Download models (if you haven't already):"
echo "   - Go to the Checkpoints tab in the Forge UI"
echo "   - Click on the model manager"
echo "   - Search and download models (recommended: SDXL-Lightning)"
echo ""
echo "4. Verify Deforum extension:"
echo "   - Go to Extensions tab"
echo "   - Look for 'sd-forge-deforum'"
echo "   - Should be enabled by default"
echo ""
echo "5. Start generating:"
echo "   - Use the Deforum tab in the UI"
echo "   - Or use the CLI tools: ./forge_cli deforum -f 120 'your prompt'  # 120 frames = 5 seconds at 24fps"
echo ""
echo "For more information, see:"
echo "  - docker/sd-forge/README.md"
echo "  - docs/COMPLETE_SETUP.md"
echo ""

# Optional: Ask if user wants to start the services now
read -p "Start the SD-Forge services now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting services... (Press Ctrl+C to stop)"
    echo ""
    docker compose up sd-forge mediator web
else
    echo ""
    echo "You can start the services later with: docker compose up sd-forge mediator web"
fi
