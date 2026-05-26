#!/usr/bin/env bash
#
# Rebuild Docker stack, rsync to lab/production host, bring it up.
#
#   ./scripts/lab-stack-up.sh
#   ./scripts/lab-stack-up.sh --no-cache
#   RSYNC_DELETE=1 ./scripts/lab-stack-up.sh
#
# Remote: tears down the old stack first, then rsync, then build + up.
#
# Env (defaults suit 192.168.2.100 lab, same path as legacy deploy.sh):
#   LAB_HOST / DEPLOY_HOST     — default 192.168.2.100
#   LAB_PATH / DEPLOY_PATH     — default /srv/defora
#   LAB_USER / DEPLOY_USER     — default root
#   SSH_PROXY_JUMP             — e.g. pi@sparkki.dudeisland.eu:4322 (GitHub Actions / remote deploy)
#   COMPOSE_FILE               — compose file to deploy (default docker-compose.external-forge.yml)
#   COMPOSE_SERVICES           — space-separated services (default derived from compose file)
#   WEB_PORT                   — host port for web UI (default 8080)
#   RSYNC_DELETE=1             — rsync --delete (careful)
#
# `.env` is synced from repo root when present locally.
#
set -euo pipefail

NO_CACHE=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) NO_CACHE=1 ;;
    -h | --help)
      sed -n '2,22p' "$0"
      exit 0
      ;;
  esac
done

HOST="${LAB_HOST:-${DEPLOY_HOST:-192.168.2.100}}"
REMOTE_PATH="${LAB_PATH:-${DEPLOY_PATH:-/srv/defora}}"
REMOTE_USER="${LAB_USER:-${DEPLOY_USER:-root}}"
PROXY_JUMP="${SSH_PROXY_JUMP:-}"
WEB_PORT="${WEB_PORT:-8080}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.external-forge.yml}"
if [[ -n "${COMPOSE_SERVICES:-}" ]]; then
  COMPOSE_SERVICES="${COMPOSE_SERVICES}"
elif [[ "$COMPOSE_FILE" == *"external-forge"* ]]; then
  COMPOSE_SERVICES="mq web control-bridge encoder"
else
  COMPOSE_SERVICES="mq mediator web control-bridge sd-forge"
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SSH_COMMON_OPTS=(-o StrictHostKeyChecking=accept-new)
if [[ -n "$PROXY_JUMP" ]]; then
  SSH_COMMON_OPTS+=(-J "$PROXY_JUMP")
fi
ssh_remote() {
  ssh "${SSH_COMMON_OPTS[@]}" "$@"
}
RSYNC_RSH="ssh"
for opt in "${SSH_COMMON_OPTS[@]}"; do
  RSYNC_RSH+=" $(printf '%q' "$opt")"
done

RSYNC_FLAGS=(-a -z)
if [[ "${RSYNC_DELETE:-}" == "1" ]]; then
  RSYNC_FLAGS+=(--delete)
fi

echo "==> Remote: tear down old stack (${COMPOSE_FILE})"
# shellcheck disable=SC2029
ssh_remote "${REMOTE_USER}@${HOST}" \
  "[ -d '${REMOTE_PATH}' ] && cd '${REMOTE_PATH}' && docker compose -f '${COMPOSE_FILE}' down --remove-orphans 2>/dev/null || true"

echo "==> Sync → ${REMOTE_USER}@${HOST}:${REMOTE_PATH}"
ssh_remote "${REMOTE_USER}@${HOST}" "mkdir -p '${REMOTE_PATH}'"

rsync "${RSYNC_FLAGS[@]}" \
  -e "$RSYNC_RSH" \
  --exclude node_modules \
  --exclude .git \
  --exclude __pycache__ \
  --exclude .pytest_cache \
  --exclude '*.pyc' \
  --exclude docker/web/node_modules \
  --exclude docker/web/uploads \
  --exclude .cursor \
  --exclude .env.local \
  --exclude '.env.*.local' \
  ./ "${REMOTE_USER}@${HOST}:${REMOTE_PATH}/"

BUILD_CMD="docker compose -f '${COMPOSE_FILE}' build --pull ${COMPOSE_SERVICES}"
if [[ -n "$NO_CACHE" ]]; then
  BUILD_CMD+=" --no-cache"
fi

echo "==> Remote: ensure deforumation submodule, build, up (${COMPOSE_SERVICES})"
# shellcheck disable=SC2029
ssh_remote "${REMOTE_USER}@${HOST}" \
  "set -e
   cd '${REMOTE_PATH}'
   if [ ! -f deforumation/mediator.py ]; then
     echo '==> Cloning deforumation submodule on host...'
     ./scripts/clone_deforumation.sh
   fi
   if [ -f .env ]; then set -a; . ./.env; set +a; fi
   ${BUILD_CMD}
   WEB_PORT=${WEB_PORT} docker compose -f '${COMPOSE_FILE}' up -d ${COMPOSE_SERVICES}"

BASE_URL="http://${HOST}:${WEB_PORT}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Compose file:  ${COMPOSE_FILE}"
echo "  Defora UI:     ${BASE_URL}"
echo "  Health:        ${BASE_URL}/api/health"
echo "  HLS:           ${BASE_URL}/hls/live/deforum.m3u8"
if [[ "$COMPOSE_SERVICES" == *"sd-forge"* ]]; then
  echo "  SD-Forge:      http://${HOST}:7860"
else
  echo "  Mediator:      ws://${MEDIATOR_HOST:-vimage2}:8766"
  echo "  SD-Forge pool: ${DISTRIBUTED_NODES:-http://vimage2:7860,http://vimage5:7860}"
fi
echo "  RabbitMQ UI:   http://${HOST}:15672"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
