#!/bin/bash
# Resolution Test Example
# Generate the same prompt at different resolutions

# Configuration
CLI_PATH="./forge_cli.py"
PROMPT="a detailed cyberpunk street scene, neon signs, rain"
NEGATIVE="blurry, low quality"

# Resolution presets
declare -A RESOLUTIONS=(
  ["square_small"]="512:512"
  ["square_medium"]="1024:1024"
  ["portrait"]="832:1216"
  ["landscape"]="1216:832"
  ["widescreen"]="1920:1080"
  ["ultrawide"]="2560:1080"
)

echo "Testing different resolutions with the same prompt"
echo "Prompt: $PROMPT"
echo ""

# Create output directory
OUTPUT_DIR="resolution_test_$(date +%Y%m%d_%H%M%S)"
export FORGE_OUT_DIR="$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Generate at each resolution
for name in "${!RESOLUTIONS[@]}"; do
  resolution="${RESOLUTIONS[$name]}"
  IFS=':' read -r width height <<< "$resolution"
  
  echo "----------------------------------------"
  echo "Generating: $name (${width}x${height})"
  echo "----------------------------------------"
  
  $CLI_PATH img \
    -W $width \
    -H $height \
    -N "$NEGATIVE" \
    "$PROMPT"
  
  if [ $? -eq 0 ]; then
    echo "✓ Generated at ${width}x${height}"
  else
    echo "✗ Failed at ${width}x${height}"
  fi
  echo ""
  
  # Small delay to avoid overwhelming the server
  sleep 2
done

echo "Resolution test complete!"
echo "Images saved to: $OUTPUT_DIR/img/"
echo ""
echo "Compare the images to see how resolution affects:"
echo "  - Detail level"
echo "  - Composition"
echo "  - Generation time"
