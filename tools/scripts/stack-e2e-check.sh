#!/usr/bin/env bash
# End-to-end health check for the defora docker compose stack.
# Verifies container states, HTTP endpoints, and TCP port reachability.
# Usage: ./scripts/stack-e2e-check.sh [--host <ip>]
#   --host  Override the host to probe (default: 127.0.0.1)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

HOST="127.0.0.1"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) HOST="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

pass()  { echo -e "${GREEN}✓${NC} $1"; }
fail()  { echo -e "${RED}✗${NC} $1"; ERRORS=$((ERRORS + 1)); }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; WARNINGS=$((WARNINGS + 1)); }

# ── helpers ──────────────────────────────────────────────────────────────────

http_check() {
  local label="$1" url="$2" expect="${3:-200}" optional="${4:-}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || true)
  if [ "$code" = "$expect" ]; then
    pass "$label → HTTP $code"
  elif [ -n "$optional" ]; then
    warn "$label → HTTP $code (expected $expect, service may be stopped)"
  else
    fail "$label → HTTP $code (expected $expect)"
  fi
}

http_body_check() {
  local label="$1" url="$2" pattern="$3"
  local body
  body=$(curl -s --max-time 5 "$url" 2>/dev/null || true)
  if echo "$body" | grep -q "$pattern"; then
    pass "$label → body matches '$pattern'"
  else
    fail "$label → body did not match '$pattern' (got: ${body:0:80})"
  fi
}

tcp_check() {
  local label="$1" host="$2" port="$3" optional="${4:-}"
  if bash -c ">/dev/tcp/$host/$port" 2>/dev/null; then
    pass "$label → TCP $host:$port open"
  elif [ -n "$optional" ]; then
    warn "$label → TCP $host:$port unreachable (optional service)"
  else
    fail "$label → TCP $host:$port unreachable"
  fi
}

IS_LOCAL=
[[ "$HOST" == "127.0.0.1" || "$HOST" == "localhost" ]] && IS_LOCAL=1

container_check() {
  local label="$1" service="$2" optional="${3:-}"
  if [ -z "$IS_LOCAL" ]; then
    warn "$label → container check skipped (host is remote; run locally on $HOST)"
    return
  fi
  if ! command -v docker &>/dev/null; then
    warn "docker not in PATH — skipping container checks"
    return
  fi
  local state
  state=$(docker compose ps --format "{{.Service}}\t{{.State}}" 2>/dev/null \
    | awk -v svc="$service" '$1 == svc { print $2 }' || true)
  case "$state" in
    running|healthy) pass "$label → $service is $state" ;;
    "")
      if [ -n "$optional" ]; then
        warn "$label → $service not in compose ps (not started)"
      else
        fail "$label → $service not found in compose ps"
      fi
      ;;
    *)
      if [ -n "$optional" ]; then
        warn "$label → $service state: $state"
      else
        fail "$label → $service state: $state (expected running)"
      fi
      ;;
  esac
}

# ── Section 1: container states ───────────────────────────────────────────────

echo ""
echo "1. Container states"

container_check "web"            web
container_check "encoder"        encoder
container_check "mediator"       mediator
container_check "mq"             mq
container_check "control-bridge" control-bridge
container_check "sd-forge"       sd-forge       optional
container_check "dev-frame-seeder" dev-frame-seeder optional

# ── Section 2: HTTP endpoints ─────────────────────────────────────────────────

echo ""
echo "2. HTTP endpoints"

http_check     "web /api/health"      "http://$HOST:8080/api/health"
http_body_check "web /api/health ok"  "http://$HOST:8080/api/health" '"ok":true'
http_check     "web /api/status"      "http://$HOST:8080/api/status"
http_check     "web /api/frames"      "http://$HOST:8080/api/frames"
http_check     "web /api/infrastructure" "http://$HOST:8080/api/infrastructure"
http_check     "RabbitMQ management"  "http://$HOST:15672"
http_check     "sd-forge /docs"       "http://$HOST:7860/docs"  200  optional

# ── Section 3: TCP port reachability ─────────────────────────────────────────

echo ""
echo "3. TCP ports"

tcp_check "web HTTP"              "$HOST" 8080
tcp_check "web RTMP"              "$HOST" 1935  optional
tcp_check "mediator deforum"      "$HOST" 8765
tcp_check "mediator deforumation" "$HOST" 8766
tcp_check "RabbitMQ AMQP"         "$HOST" 5672
tcp_check "sd-forge API"          "$HOST" 7860  optional

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "══════════════════════════════════════════"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}All checks passed.${NC}"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}Passed with ${WARNINGS} warning(s) — optional services may be down.${NC}"
  exit 0
else
  echo -e "${RED}${ERRORS} failure(s), ${WARNINGS} warning(s).${NC}"
  exit 1
fi
