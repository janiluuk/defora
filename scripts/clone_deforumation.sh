#!/usr/bin/env bash
set -euo pipefail

# Initialize/update the Deforumation submodule.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "Syncing deforumation submodule..."
git submodule update --init --recursive deforumation
echo "Done."
