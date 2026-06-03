#!/usr/bin/env bash
# Backwards-compatible wrapper — use tools/scripts/production-deploy.sh
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/tools/scripts/production-deploy.sh" "$@"
