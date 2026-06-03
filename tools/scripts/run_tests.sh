#!/usr/bin/env bash
set -euo pipefail

# Run the test suite from repo root (works whether invoked directly or via symlink).
cd "$(git -C "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" rev-parse --show-toplevel)"

python3 -m pytest "$@"
