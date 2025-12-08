#!/usr/bin/env bash
set -euo pipefail

USE_NAMED_PIPES=${USE_NAMED_PIPES:-}

EXTRA_FLAG=()
if [ -n "$USE_NAMED_PIPES" ]; then
  EXTRA_FLAG+=(--use_named_pipes)
fi

exec python /app/mediator.py \
  --mediator_deforum_address "${MEDIATOR_DEFORUM_ADDRESS:-0.0.0.0}" \
  --mediator_deforum_port "${MEDIATOR_DEFORUM_PORT:-8765}" \
  --mediator_deforumation_address "${MEDIATOR_DEFORUMATION_ADDRESS:-0.0.0.0}" \
  --mediator_deforumation_port "${MEDIATOR_DEFORUMATION_PORT:-8766}" \
  --deforumation_address "${DEFORUMATION_ADDRESS:-127.0.0.1}" \
  --deforumation_port "${DEFORUMATION_PORT:-8767}" \
  "${EXTRA_FLAG[@]}"
