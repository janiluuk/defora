#!/bin/bash
# Batch Generation Example
# This script generates multiple images from a list of prompts

# Configuration
CLI_PATH="./forge_cli.py"
OUTPUT_DIR="batch_output"

# Set custom output directory
export FORGE_OUT_DIR="$OUTPUT_DIR"

# Array of prompts to generate
PROMPTS=(
  "a serene mountain landscape at sunset, vibrant colors"
  "a futuristic city with flying cars, neon lights, cyberpunk"
  "a cozy cottage in the woods, autumn, warm lighting"
  "an underwater coral reef scene, tropical fish, clear water"
  "a medieval castle on a hilltop, dramatic sky, fantasy art"
  "a steampunk airship flying through clouds, detailed machinery"
  "a magical forest with glowing mushrooms, fairy tale atmosphere"
  "a desert oasis with palm trees, clear blue water, golden sand"
)

# Negative prompt to apply to all generations
NEGATIVE="blurry, low quality, distorted, ugly, bad anatomy"

# Generation settings
WIDTH=1024
HEIGHT=1024
NUM_IMAGES=2

echo "Starting batch generation of ${#PROMPTS[@]} prompts..."
echo "Output directory: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate images for each prompt
for i in "${!PROMPTS[@]}"; do
  prompt="${PROMPTS[$i]}"
  echo "[$((i+1))/${#PROMPTS[@]}] Generating: $prompt"
  
  $CLI_PATH img \
    -W $WIDTH \
    -H $HEIGHT \
    -n $NUM_IMAGES \
    -N "$NEGATIVE" \
    "$prompt"
  
  if [ $? -eq 0 ]; then
    echo "✓ Success"
  else
    echo "✗ Failed"
  fi
  echo ""
done

echo "Batch generation complete!"
echo "Images saved to: $OUTPUT_DIR/img/"
