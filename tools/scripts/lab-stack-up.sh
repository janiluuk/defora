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
#   COMPOSE_FILE               — compose file to use (default docker-compose.external-forge.yml)
#   COMPOSE_SERVICES           — space-separated services (default below)
#   WEB_PORT                   — host port for web UI (default 8080)
#   DEPLOY_STREAM_NODE=1       — also bring up RTMP/HLS on the stream host (default vimage3)
#   STREAM_DEPLOY_HOST         — stream node IP/hostname (default VIMAGE3_IP / 192.168.2.103)
#   VIMAGE3_IP                 — extra_hosts target for vimage3 (default 192.168.2.103)
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
COMPOSE_SERVICES="${COMPOSE_SERVICES:-mq mediator web control-bridge encoder}"
VIMAGE3_IP="${VIMAGE3_IP:-192.168.2.103}"
STREAM_DEPLOY_HOST="${STREAM_DEPLOY_HOST:-$VIMAGE3_IP}"
STREAM_COMPOSE_FILE="${STREAM_COMPOSE_FILE:-docker-compose.stream-node.yml}"
DEPLOY_STREAM_NODE="${DEPLOY_STREAM_NODE:-1}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
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
ssh_remote "${REMOTE_USER}@${HOST}" bash -s -- "${REMOTE_PATH}" "${COMPOSE_FILE}" <<'EOF'
set -eu

remote_path="$1"
compose_file="$2"
self="$$"
parent="${PPID:-}"
matches=""
pids=""

while IFS= read -r line; do
  [ -n "$line" ] || continue
  pid="${line%% *}"
  cmd="${line#* }"
  [ "$pid" = "$self" ] && continue
  [ -n "$parent" ] && [ "$pid" = "$parent" ] && continue

  case "$cmd" in
    *"/app/mediator.py"*|\
    *"defora_cli.control_bridge"*|\
    *"defora_cli.stream_helper"*|\
    *"defora_cli.ableton_link"*|\
    *"defora_cli.timecode_sync"*|\
    *"defora_cli.cloud_gpu"*|\
    *"defora_cli.dmx_control"*|\
    *"node server.js"*|\
    *"mv -i defora_frames "*|\
    *"ffmpeg "*deforum*)
      matches+="${line}"$'\n'
      pids+="${pid} "
      ;;
  esac
done < <(ps -eo pid=,cmd=)

if [ -n "$matches" ]; then
  echo '==> Killing remote Defora processes:'
  printf '%s' "$matches"
  kill -TERM $pids 2>/dev/null || true
  sleep 2
  for pid in $pids; do
    kill -0 "$pid" 2>/dev/null && kill -KILL "$pid" 2>/dev/null || true
  done
fi

if [ -d "$remote_path" ]; then
  cd "$remote_path"
  docker compose -f "$compose_file" down --remove-orphans 2>/dev/null || true
fi
EOF

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
   VIMAGE3_IP=${VIMAGE3_IP} WEB_PORT=${WEB_PORT} docker compose -f '${COMPOSE_FILE}' up -d ${COMPOSE_SERVICES}"

deploy_stream_node() {
  if [[ "${DEPLOY_STREAM_NODE}" != "1" ]]; then
    return 0
  fi
  if [[ -z "${STREAM_DEPLOY_HOST}" ]]; then
    echo "==> Skip stream node (STREAM_DEPLOY_HOST empty)"
    return 0
  fi
  if [[ "${STREAM_DEPLOY_HOST}" == "${HOST}" ]]; then
    echo "==> Stream node on lab host (${HOST})"
    # shellcheck disable=SC2029
    ssh_remote "${REMOTE_USER}@${HOST}" \
      "set -e
       cd '${REMOTE_PATH}'
       if [ -f .env ]; then set -a; . ./.env; set +a; fi
       docker compose -f '${STREAM_COMPOSE_FILE}' build --pull stream
       docker compose -f '${STREAM_COMPOSE_FILE}' up -d stream"
    return 0
  fi

  echo "==> Sync stream node → ${REMOTE_USER}@${STREAM_DEPLOY_HOST}:${REMOTE_PATH}"
  ssh_remote "${REMOTE_USER}@${STREAM_DEPLOY_HOST}" "mkdir -p '${REMOTE_PATH}'"
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
    ./ "${REMOTE_USER}@${STREAM_DEPLOY_HOST}:${REMOTE_PATH}/"

  echo "==> Remote: build + up stream (${STREAM_COMPOSE_FILE}) on ${STREAM_DEPLOY_HOST}"
  # shellcheck disable=SC2029
  ssh_remote "${REMOTE_USER}@${STREAM_DEPLOY_HOST}" \
    "set -e
     cd '${REMOTE_PATH}'
     if [ -f .env ]; then set -a; . ./.env; set +a; fi
     docker compose -f '${STREAM_COMPOSE_FILE}' build --pull stream
     docker compose -f '${STREAM_COMPOSE_FILE}' up -d stream"
}

deploy_stream_node

echo ""
echo "==> Waiting for web service to be healthy..."
HEALTH_URL="http://${HOST}:${WEB_PORT}/api/health"
for i in $(seq 1 12); do
  if curl -sf --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
    echo "    Ready after $((i * 5 - 5))s"
    break
  fi
  if [[ "$i" -eq 12 ]]; then
    echo "    Web not responding after 60s — check logs on host"
  else
    printf "    Not ready yet (%ds elapsed), retrying...\n" "$((i * 5))"
    sleep 5
  fi
done

echo ""
echo "==> Post-deploy stack health check"
"${ROOT}/tools/scripts/stack-e2e-check.sh" --host "${HOST}" || true

BASE_URL="http://${HOST}:${WEB_PORT}"
STREAM_HTTP_PORT="${STREAM_HTTP_PORT:-80}"
MEDIATOR_HOST_EFFECTIVE="${DEF_MEDIATOR_HOST:-${MEDIATOR_HOST:-vimage2}}"
MEDIATOR_PORT_EFFECTIVE="${DEF_MEDIATOR_PORT:-${MEDIATOR_PORT:-8766}}"
MEDIA_MOUNTPOINT="$(ssh_remote "${REMOTE_USER}@${HOST}" "docker volume inspect -f '{{.Mountpoint}}' defora_runs 2>/dev/null || true" 2>/dev/null || true)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Defora UI:     ${BASE_URL}"
echo "  Health:        ${BASE_URL}/api/health"
echo "  HLS (UI proxy): ${BASE_URL}/hls/live/deforum.m3u8"
echo "  Mediator:      ${MEDIATOR_HOST_EFFECTIVE}:${MEDIATOR_PORT_EFFECTIVE}"
echo "  Media (in web): /data/runs  (uploads: /data/runs/uploads)"
if [[ -n "${MEDIA_MOUNTPOINT}" ]]; then
  echo "  Media (host):  ${MEDIA_MOUNTPOINT}"
else
  echo "  Media (host):  docker volume defora_runs"
fi
if [[ "${DEPLOY_STREAM_NODE}" == "1" && -n "${STREAM_DEPLOY_HOST}" ]]; then
  echo "  HLS (origin):   http://${STREAM_DEPLOY_HOST}:${STREAM_HTTP_PORT}/hls/live/deforum.m3u8"
  echo "  RTMP ingest:    rtmp://${STREAM_DEPLOY_HOST}:1935/live/deforum"
fi
if [[ " ${COMPOSE_SERVICES} " == *" sd-forge "* ]]; then
  echo "  SD-Forge:      http://${HOST}:7860"
else
  echo "  SD-Forge:      external pool (${COMPOSE_FILE})"
fi
echo "  RabbitMQ UI:   http://${HOST}:15672"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
