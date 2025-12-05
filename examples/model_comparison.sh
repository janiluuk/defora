#!/bin/bash
# Model Comparison Example
# Generate the same prompt with different models for comparison

# Configuration
CLI_PATH="./forge_cli.py"
PROMPT="a magical forest with glowing mushrooms, fairy tale, detailed"
NEGATIVE="blurry, low quality, bad anatomy"

echo "Generating with different models..."
echo "Prompt: $PROMPT"
echo ""

# Define models to test (modify based on your installed models)
MODELS=(
  "flux"
  "sdxl"
  "1.5"
)

# Create output directory for comparison
COMPARISON_DIR="model_comparison_$(date +%Y%m%d_%H%M%S)"
export FORGE_OUT_DIR="$COMPARISON_DIR"

mkdir -p "$COMPARISON_DIR"

# Generate with each model
for model in "${MODELS[@]}"; do
  echo "----------------------------------------"
  echo "Testing model: $model"
  echo "----------------------------------------"
  
  $CLI_PATH --model "$model" img \
    -W 1024 \
    -H 1024 \
    -N "$NEGATIVE" \
    "$PROMPT"
  
  if [ $? -eq 0 ]; then
    echo "✓ Generated with model containing '$model'"
  else
    echo "✗ Failed or model not found: $model"
  fi
  echo ""
done

echo "Comparison complete!"
echo "Check images in: $COMPARISON_DIR/img/"
echo ""
echo "Tip: Open all images in an image viewer to compare quality and style"
