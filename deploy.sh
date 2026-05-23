#!/usr/bin/env bash
# Backwards-compatible wrapper — use scripts/production-deploy.sh
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts/production-deploy.sh" "$@"
