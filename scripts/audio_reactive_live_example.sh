#!/usr/bin/env bash
# Run audio_reactive_modulator on a given WAV/FLAC/MP3 and stream bands to the mediator.
# Usage: ./scripts/audio_reactive_live_example.sh /path/to/audio.wav

set -euo pipefail

AUDIO_PATH="${1:-}"
FPS="${FPS:-24}"
MEDIATOR_HOST="${MEDIATOR_HOST:-localhost}"
MEDIATOR_PORT="${MEDIATOR_PORT:-8766}"

if [[ -z "${AUDIO_PATH}" ]]; then
  echo "Usage: $0 /path/to/audio.wav" >&2
  exit 1
fi

# Example band→param mapping:
# - 20–300 Hz drives strength (0..1.5)
# - 300–3000 Hz drives CFG (2..12)
# - 3000–8000 Hz drives Zoom translation (±2)
MAPPING='[
  {"param":"strength","freq_min":20,"freq_max":300,"out_min":0.0,"out_max":1.5},
  {"param":"cfg","freq_min":300,"freq_max":3000,"out_min":2.0,"out_max":12.0},
  {"param":"translation_z","freq_min":3000,"freq_max":8000,"out_min":-2.0,"out_max":2.0}
]'

python3 -m defora_cli.audio_reactive_modulator \
  --audio "${AUDIO_PATH}" \
  --fps "${FPS}" \
  --mapping "${MAPPING}" \
  --live \
  --mediator-host "${MEDIATOR_HOST}" \
  --mediator-port "${MEDIATOR_PORT}"
