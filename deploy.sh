#!/usr/bin/env bash
set -euo pipefail

REMOTE="root@192.168.2.100"
REMOTE_DIR="/srv/defora"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Building web UI (Vite) ==="
cd "${PROJECT_DIR}/docker/web" && npm run build

echo ""
echo "=== Syncing to ${REMOTE}:${REMOTE_DIR} ==="
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.pytest_cache' \
  "${PROJECT_DIR}/" "${REMOTE}:${REMOTE_DIR}/"

echo ""
echo "=== Building and restarting web service ==="
ssh "${REMOTE}" "cd ${REMOTE_DIR} && docker compose up --build -d web mediator control-bridge"

echo ""
echo "=== Service status ==="
ssh "${REMOTE}" "cd ${REMOTE_DIR} && docker compose ps"

echo ""
echo "=== Done ==="
