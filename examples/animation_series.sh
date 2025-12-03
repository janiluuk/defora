#!/bin/bash
# Animation Series Example
# Create multiple Deforum animations with a theme

# Configuration
CLI_PATH="./forge_cli.py"
OUTPUT_BASE="animations"

# Check if Forge has Deforum API enabled
echo "Testing Deforum API availability..."
if ! curl -s http://127.0.0.1:7860/deforum_api/batches > /dev/null 2>&1; then
  echo "ERROR: Deforum API not available!"
  echo "Please start Forge with: ./webui.sh --deforum-api"
  exit 1
fi

echo "Deforum API detected. Starting animation series..."
echo ""

# Animation themes
declare -A ANIMATIONS=(
  ["cosmic"]="journey through cosmic nebulae and galaxies, stars, space"
  ["nature"]="flowing river through forest, seasons changing, peaceful"
  ["city"]="time-lapse of futuristic city from day to night, lights"
  ["abstract"]="morphing geometric patterns and fractals, kaleidoscope"
  ["ocean"]="underwater journey through coral reef, fish swimming"
)

NEGATIVE="static, boring, low quality, blurry"

# Animation settings
FRAMES=180  # 7.5 seconds at 24fps
FPS=24
WIDTH=1024
HEIGHT=576
ZOOM=1.015

# Create output directory
mkdir -p "$OUTPUT_BASE"

# Generate each animation
count=1
total=${#ANIMATIONS[@]}

for name in "${!ANIMATIONS[@]}"; do
  prompt="${ANIMATIONS[$name]}"
  
  echo "=========================================="
  echo "[$count/$total] Animation: $name"
  echo "=========================================="
  echo "Prompt: $prompt"
  echo ""
  
  $CLI_PATH deforum \
    -f $FRAMES \
    --fps $FPS \
    -W $WIDTH \
    -H $HEIGHT \
    --zoom $ZOOM \
    -N "$NEGATIVE" \
    "$prompt"
  
  if [ $? -eq 0 ]; then
    echo "✓ Animation submitted: $name"
  else
    echo "✗ Failed: $name"
  fi
  
  echo ""
  count=$((count + 1))
  
  # Give some time between submissions
  sleep 3
done

echo "=========================================="
echo "All animations submitted!"
echo "=========================================="
echo ""
echo "Animations will be saved to Forge's Deforum output directory:"
echo "  (usually: stable-diffusion-webui-forge/outputs/deforum/)"
echo ""
echo "Monitor progress in the Forge web UI or use --poll flag:"
echo "  $CLI_PATH deforum --poll \"prompt\""
