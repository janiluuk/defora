#!/usr/bin/env bash
# Deploy current repo to production (jumphost → lab host).
#
#   SSH_PROXY_JUMP=pi@sparkki.dudeisland.eu:4322 ./scripts/production-deploy.sh
#   ./scripts/production-deploy.sh --no-cache
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NO_CACHE=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) NO_CACHE=1 ;;
  esac
done

export SSH_PROXY_JUMP="${SSH_PROXY_JUMP:-pi@sparkki.dudeisland.eu:4322}"
export DEPLOY_HOST="${DEPLOY_HOST:-192.168.2.100}"
export DEPLOY_USER="${DEPLOY_USER:-root}"
export DEPLOY_PATH="${DEPLOY_PATH:-/srv/defora}"
export WEB_PORT="${WEB_PORT:-8080}"
export COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.external-forge.yml}"
export COMPOSE_SERVICES="${COMPOSE_SERVICES:-mq mediator web control-bridge encoder}"
export VIMAGE2_IP="${VIMAGE2_IP:-192.168.2.101}"
export VIMAGE3_IP="${VIMAGE3_IP:-192.168.2.103}"
export VIMAGE5_IP="${VIMAGE5_IP:-192.168.2.104}"
export STREAM_DEPLOY_HOST="${STREAM_DEPLOY_HOST:-$VIMAGE3_IP}"
export DEPLOY_STREAM_NODE="${DEPLOY_STREAM_NODE:-1}"

echo "==> Deploy via lab-stack-up (jump: ${SSH_PROXY_JUMP})"
if [[ -n "$NO_CACHE" ]]; then
  ./scripts/lab-stack-up.sh --no-cache
else
  ./scripts/lab-stack-up.sh
fi

echo "==> Health check"
# shellcheck disable=SC2029
ssh -o StrictHostKeyChecking=accept-new -J "$SSH_PROXY_JUMP" \
  "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "curl -sfS http://127.0.0.1:${WEB_PORT}/api/health"

echo ""
echo "Deploy finished."
echo "  UI:  http://${DEPLOY_HOST}:${WEB_PORT}"
echo "  HLS: http://${DEPLOY_HOST}:${WEB_PORT}/hls/live/deforum.m3u8 (proxied from vimage3)"
echo "  RTMP ingest: rtmp://${STREAM_DEPLOY_HOST}:1935/live/deforum"
