#!/bin/bash
# Seed Exploration Example
# Generate variations of the same prompt using different seeds

# Configuration
CLI_PATH="./forge_cli.py"
PROMPT="a fantasy dragon perched on a mountain peak, majestic, detailed"
NEGATIVE="blurry, low quality, deformed"

# Number of variations to generate
NUM_VARIATIONS=5

echo "Generating $NUM_VARIATIONS variations with different seeds"
echo "Prompt: $PROMPT"
echo ""

# Create output directory
OUTPUT_DIR="seed_exploration_$(date +%Y%m%d_%H%M%S)"
export FORGE_OUT_DIR="$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Generate with specific seeds
echo "=== Specific Seeds ==="
SEEDS=(42 123 1337 9999 777777)

for seed in "${SEEDS[@]}"; do
  echo "Generating with seed: $seed"
  
  $CLI_PATH img \
    --seed $seed \
    -W 1024 \
    -H 1024 \
    -N "$NEGATIVE" \
    "$PROMPT"
  
  if [ $? -eq 0 ]; then
    echo "✓ Generated (seed: $seed)"
  fi
  echo ""
done

echo "=== Random Seeds ==="
# Generate with random seeds (seed=-1)
for i in $(seq 1 $NUM_VARIATIONS); do
  echo "Generating variation $i (random seed)"
  
  $CLI_PATH img \
    --seed -1 \
    -W 1024 \
    -H 1024 \
    -N "$NEGATIVE" \
    "$PROMPT"
  
  if [ $? -eq 0 ]; then
    echo "✓ Generated variation $i"
  fi
  echo ""
done

echo "Seed exploration complete!"
echo "Images saved to: $OUTPUT_DIR/img/"
echo ""
echo "Note: To reproduce an image, use the same:"
echo "  - Prompt"
echo "  - Negative prompt"
echo "  - Seed"
echo "  - Resolution"
echo "  - Model"
echo "  - Settings (steps, CFG, sampler)"
