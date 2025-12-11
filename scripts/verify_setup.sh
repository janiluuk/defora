#!/usr/bin/env bash
set -euo pipefail

# Defora setup verification script
# Verifies all necessary components are present for:
# 1) Connecting to Deforum mediator
# 2) Generating live video from AI
# 3) Watching the resulting stream from a player page

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=================================================="
echo "Defora Setup Verification"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

ERRORS=0
WARNINGS=0

# 1. Check deforumation submodule
echo "1. Checking Deforum mediator components..."
if [ -f "deforumation/mediator.py" ]; then
    check_pass "deforumation/mediator.py exists"
else
    check_fail "deforumation/mediator.py missing - run: git submodule update --init --recursive"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "deforumation/Deforum_Version/sd-forge" ]; then
    check_pass "Deforum bridge for sd-forge exists"
else
    check_fail "Deforum bridge missing in deforumation/Deforum_Version/sd-forge/"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check Docker components
echo ""
echo "2. Checking Docker components for live video generation..."

DOCKER_COMPONENTS=(
    "docker/mediator/Dockerfile"
    "docker/mediator/entrypoint.sh"
    "docker/bridge/Dockerfile"
    "docker/web/Dockerfile"
    "docker/sd-forge/Dockerfile"
    "docker/frame-seeder/Dockerfile"
)

for component in "${DOCKER_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        check_pass "$component"
    else
        check_fail "$component missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# 3. Check control bridge
echo ""
echo "3. Checking control bridge (connects web UI to mediator)..."
if [ -f "defora_cli/control_bridge.py" ]; then
    check_pass "defora_cli/control_bridge.py exists"
else
    check_fail "defora_cli/control_bridge.py missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "defora_cli/mediator_client.py" ]; then
    check_pass "defora_cli/mediator_client.py exists"
else
    check_fail "defora_cli/mediator_client.py missing"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check web player
echo ""
echo "4. Checking web player components..."
if [ -f "docker/web/public/index.html" ]; then
    check_pass "Web player HTML exists"
else
    check_fail "docker/web/public/index.html missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "docker/web/server.js" ]; then
    check_pass "Web server (Node.js) exists"
else
    check_fail "docker/web/server.js missing"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "docker/web/nginx.conf" ]; then
    check_pass "Nginx RTMP configuration exists"
else
    check_fail "docker/web/nginx.conf missing"
    ERRORS=$((ERRORS + 1))
fi

# 5. Check docker-compose
echo ""
echo "5. Checking docker-compose configuration..."
if [ -f "docker-compose.yml" ]; then
    check_pass "docker-compose.yml exists"
    
    # Check if docker compose command is available
    if command -v docker &> /dev/null; then
        if docker compose version &> /dev/null; then
            check_pass "docker compose command available"
            
            # Validate docker-compose configuration
            if docker compose config --quiet 2>&1 | grep -q "level=warning"; then
                check_warn "docker-compose.yml has warnings (version attribute is obsolete)"
            else
                check_pass "docker-compose.yml is valid"
            fi
        else
            check_warn "docker compose command not available"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        check_warn "docker not available in PATH"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    check_fail "docker-compose.yml missing"
    ERRORS=$((ERRORS + 1))
fi

# 6. Check Python dependencies
echo ""
echo "6. Checking Python dependencies..."
if [ -f "requirements.txt" ]; then
    check_pass "requirements.txt exists"
    
    # Check for key dependencies
    if grep -q "pika" requirements.txt; then
        check_pass "pika (RabbitMQ client) in requirements.txt"
    else
        check_fail "pika missing from requirements.txt"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "requests" requirements.txt; then
        check_pass "requests in requirements.txt"
    else
        check_warn "requests missing from requirements.txt"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    check_fail "requirements.txt missing"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=================================================="
echo "Summary"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo ""
    echo "You have all necessary components to:"
    echo "  1) Connect to Deforum mediator"
    echo "  2) Generate live video from AI"
    echo "  3) Watch the resulting stream from a player page"
    echo ""
    echo "Next steps:"
    echo "  - Start the stack: docker compose up --build"
    echo "  - Access the web player: http://localhost:8080"
    echo "  - See docs/streaming_stack.md for more details"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}Checks passed with ${WARNINGS} warning(s)${NC}"
    echo "System should work but may have minor issues"
    exit 0
else
    echo -e "${RED}${ERRORS} error(s) and ${WARNINGS} warning(s) found${NC}"
    echo "Please fix the errors above before proceeding"
    exit 1
fi
