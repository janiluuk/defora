#!/usr/bin/env bash
#
# Status / start / stop DeforumationQT + SD-Forge on vimage2.
#
# On vimage2 the stack is already set up with systemd services:
#   - sd-forge (Docker container via /opt/forge/docker-compose.yaml)
#   - deforumation-mediator.service  (mediator.py, ports 8765/8766)
#   - deforumation-gui.service       (deforumation.py, headless via Xvfb)
#
# Usage:
#   ./scripts/vimage2-deforumationqt.sh status   # show everything
#   ./scripts/vimage2-deforumationqt.sh start    # start all services
#   ./scripts/vimage2-deforumationqt.sh stop     # stop all services
#   ./scripts/vimage2-deforumationqt.sh restart  # restart all services
#
# Environment:
#   VIMAGE2_HOST  — default 192.168.2.101
#   VIMAGE2_USER  — default root
#
set -euo pipefail

VIMAGE2_HOST="${VIMAGE2_HOST:-192.168.2.101}"
VIMAGE2_USER="${VIMAGE2_USER:-root}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

usage() { sed -n '2,18p' "$0"; exit 0; }

ssh_v2() { ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 "${VIMAGE2_USER}@${VIMAGE2_HOST}" "$@"; }

cmd_status() {
  ssh_v2 bash -s -- <<'EOF'
echo "=== SD-Forge ==="
docker ps --filter name=forge --format '{{.Names}} {{.Status}}'
curl -sf http://127.0.0.1:7860/docs -o /dev/null -w 'HTTP %{http_code}\n' 2>/dev/null || echo 'not responding'

echo "=== Mediator (systemd) ==="
systemctl is-active deforumation-mediator.service 2>/dev/null || echo 'not found'

echo "=== GUI (systemd) ==="
systemctl is-active deforumation-gui.service 2>/dev/null || echo 'not found'

echo "=== Ports ==="
ss -tlnp | grep -E '876[0-9]|7860' || echo '(none)'

echo "=== Processes ==="
pgrep -af 'mediator\.py|deforumation\.py|Xvfb' | grep -v bash || echo '(none)'
EOF
}

cmd_start() {
  ssh_v2 bash -s -- <<'EOF'
echo "Starting forge stack..."
cd /opt/forge && docker compose up -d forge 2>/dev/null || docker start forge 2>/dev/null || echo 'forge already running'

echo "Starting mediator..."
systemctl start deforumation-mediator.service 2>/dev/null || echo 'mediator already running'

echo "Starting GUI..."
systemctl start deforumation-gui.service 2>/dev/null || echo 'GUI already running'

echo "Waiting for services..."
sleep 2
systemctl is-active deforumation-mediator.service deforumation-gui.service
docker ps --filter name=forge --format '{{.Names}} {{.Status}}'
EOF
}

cmd_stop() {
  ssh_v2 bash -s -- <<'EOF'
echo "Stopping GUI..."
systemctl stop deforumation-gui.service 2>/dev/null || true
echo "Stopping mediator..."
systemctl stop deforumation-mediator.service 2>/dev/null || true
echo "Stopping forge..."
cd /opt/forge && docker compose down 2>/dev/null || docker stop forge 2>/dev/null || true
echo "All stopped"
EOF
}

case "${1:-status}" in
  -h|--help) usage ;;
  status)    cmd_status ;;
  start)     cmd_start ;;
  stop)      cmd_stop ;;
  restart)   cmd_stop; sleep 2; cmd_start ;;
  *)         echo "usage: $0 {status|start|stop|restart}"; exit 1 ;;
esac
