#!/usr/bin/env bash
set -euo pipefail

# Run the test suite from repo root.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

python3 -m pytest "$@"
