# Examples Directory

This directory contains practical example scripts demonstrating various use cases for defora.

## Available Examples

**Note**: All example scripts should be run from the repository root directory where `forge_cli.py` is located.

### 1. Batch Generation (`batch_generate.sh`)
Generate multiple images from a predefined list of prompts. Great for creating themed image sets.

**Use case**: Creating a series of related images (e.g., fantasy landscapes, character concepts, environment designs)

```bash
chmod +x examples/batch_generate.sh
./examples/batch_generate.sh
```

### 2. Model Comparison (`model_comparison.sh`)
Generate the same prompt with different models to compare their output styles and quality.

**Use case**: Choosing the best model for your project, understanding model differences

```bash
chmod +x examples/model_comparison.sh
./examples/model_comparison.sh
```

### 3. Resolution Test (`resolution_test.sh`)
Test the same prompt at different resolutions to see how it affects composition and detail.

**Use case**: Finding optimal resolution for your use case, understanding aspect ratio effects

```bash
chmod +x examples/resolution_test.sh
./examples/resolution_test.sh
```

### 4. Seed Exploration (`seed_exploration.sh`)
Generate variations using both specific seeds (for reproducibility) and random seeds.

**Use case**: Finding the perfect generation, learning about seed effects, reproducible results

```bash
chmod +x examples/seed_exploration.sh
./examples/seed_exploration.sh
```

### 5. Animation Series (`animation_series.sh`)
Create multiple Deforum animations with different themes.

**Use case**: Batch animation production, creating themed video collections

**Prerequisite**: Forge must be started with `--deforum-api` flag

```bash
chmod +x examples/animation_series.sh
./examples/animation_series.sh
```

## Customizing Examples

All example scripts can be customized by editing these variables at the top of each file:

- `CLI_PATH`: Path to forge_cli.py (default: `./forge_cli.py` - assumes running from repo root)
- `PROMPT`: The generation prompt
- `NEGATIVE`: Negative prompt to avoid unwanted features
- `WIDTH` / `HEIGHT`: Output dimensions
- Various other settings specific to each script

**Important**: If you move scripts or run them from a different location, update the `CLI_PATH` variable to point to the correct location of `forge_cli.py`.

## Making All Examples Executable

```bash
chmod +x examples/*.sh
```

## Tips for Using Examples

1. **Review before running**: Open each script to understand what it does
2. **Modify prompts**: Change the prompts to match your creative needs
3. **Adjust settings**: Modify resolution, number of images, etc.
4. **Check output**: Examples create timestamped directories to avoid overwriting
5. **Monitor resources**: Some examples generate many images - watch disk space and GPU load

## Creating Your Own Examples

Feel free to create your own scripts based on these examples:

```bash
#!/bin/bash
# my_custom_script.sh

CLI_PATH="./forge_cli.py"
# Your custom logic here
$CLI_PATH img "your prompt"
```

## Common Patterns

### Loop Through Prompts
```bash
PROMPTS=("prompt 1" "prompt 2" "prompt 3")
for prompt in "${PROMPTS[@]}"; do
  $CLI_PATH img "$prompt"
done
```

### Use Arrays for Settings
```bash
declare -A SETTINGS=(
  ["fast"]="--steps 10 --cfg-scale 5"
  ["quality"]="--steps 50 --cfg-scale 8"
)
```

### Timestamped Outputs
```bash
OUTPUT_DIR="output_$(date +%Y%m%d_%H%M%S)"
export FORGE_OUT_DIR="$OUTPUT_DIR"
```

### Error Handling
```bash
if [ $? -eq 0 ]; then
  echo "Success"
else
  echo "Failed"
fi
```

## Troubleshooting Examples

**Problem**: Permission denied
```bash
chmod +x examples/*.sh
```

**Problem**: Command not found
```bash
# Adjust CLI_PATH in the script to absolute path
CLI_PATH="/full/path/to/forge_cli.py"
```

**Problem**: Forge not responding
```bash
# Ensure Forge is running
curl http://127.0.0.1:7860/docs
```

## Contributing Examples

Have a useful example script? Please contribute it!

1. Create your script in the `examples/` directory
2. Add documentation at the top of the file
3. Update this README
4. Submit a pull request

---

Happy generating! 🎨
