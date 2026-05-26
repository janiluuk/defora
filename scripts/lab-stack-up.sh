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
#   COMPOSE_FILE               — compose file to use (default docker-compose.yml)
#   COMPOSE_SERVICES           — space-separated services (default below)
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
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
COMPOSE_SERVICES="${COMPOSE_SERVICES:-mq mediator web control-bridge sd-forge}"

REMOTE_KILL_REGEX="${REMOTE_KILL_REGEX:-python(3)? /app/mediator\\.py|python(3)? -m defora_cli\\.control_bridge|python3? -m defora_cli\\.(stream_helper|ableton_link|timecode_sync|cloud_gpu|dmx_control)|node server\\.js|ffmpeg .*deforum|(^| )mv -i defora_frames( |$)}"

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

echo "==> Remote: stop Defora host processes and tear down old stack"
# shellcheck disable=SC2029
ssh_remote "${REMOTE_USER}@${HOST}" \
  "set -eu
   regex='${REMOTE_KILL_REGEX}'
   self=\$\$
   matches=\$(ps -eo pid=,cmd= | awk -v self=\"\$self\" -v re=\"\$regex\" '\$0 ~ re && \$1 != self { print \$0 }')
   pids=\$(printf '%s\n' \"\$matches\" | awk '{print \$1}' | xargs 2>/dev/null || true)
   if [ -n \"\$matches\" ]; then
     echo '==> Killing remote Defora processes:'
     printf '%s\n' \"\$matches\"
     kill -TERM \$pids 2>/dev/null || true
     sleep 2
     for pid in \$pids; do
       kill -0 \"\$pid\" 2>/dev/null && kill -KILL \"\$pid\" 2>/dev/null || true
     done
   fi
   if [ -d '${REMOTE_PATH}' ]; then
     cd '${REMOTE_PATH}'
     docker compose -f '${COMPOSE_FILE}' down --remove-orphans 2>/dev/null || true
   fi"

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
echo "  Defora UI:     ${BASE_URL}"
echo "  Health:        ${BASE_URL}/api/health"
echo "  HLS:           ${BASE_URL}/hls/live/deforum.m3u8"
echo "  SD-Forge:      http://${HOST}:7860"
echo "  RabbitMQ UI:   http://${HOST}:15672"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
