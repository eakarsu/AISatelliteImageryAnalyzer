#!/bin/bash

# ============================================
# AI Satellite Imagery Analyzer - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3000

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║       🛰️  AI Satellite Imagery Analyzer                  ║"
echo "║       Enterprise Geospatial Intelligence Platform        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ---- Step 1: Clean up used ports ----
echo -e "${YELLOW}[1/6] Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${RED}  Killing processes on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo -e "${GREEN}  Port $port is free${NC}"
    fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ---- Step 2: Check PostgreSQL ----
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
        echo -e "${RED}  Could not start PostgreSQL. Please start it manually.${NC}"
        exit 1
    }
    sleep 2
fi
echo -e "${GREEN}  PostgreSQL is running${NC}"

# Create database if it doesn't exist
DB_NAME="satellite_analyzer"
if ! psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}  Creating database '${DB_NAME}'...${NC}"
    createdb "$DB_NAME" 2>/dev/null || true
fi
echo -e "${GREEN}  Database '${DB_NAME}' is ready${NC}"

# ---- Step 3: Install backend dependencies ----
echo -e "${YELLOW}[3/6] Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
    npm install --silent 2>&1 | tail -1
else
    echo -e "${GREEN}  Backend dependencies already installed${NC}"
fi

# ---- Step 4: Install frontend dependencies ----
echo -e "${YELLOW}[4/6] Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install --silent 2>&1 | tail -1
else
    echo -e "${GREEN}  Frontend dependencies already installed${NC}"
fi

# ---- Step 5: Seed database ----
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seed.js
echo -e "${GREEN}  Database seeded successfully${NC}"

# ---- Step 6: Start services with hot reload ----
echo -e "${YELLOW}[6/6] Starting services with hot reload...${NC}"

# Trap to clean up on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    cleanup_port $BACKEND_PORT
    cleanup_port $FRONTEND_PORT
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend with nodemon (hot reload)
cd "$PROJECT_DIR/backend"
echo -e "${CYAN}  Starting backend on port ${BACKEND_PORT} (nodemon hot reload)...${NC}"
npx nodemon server.js &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}  Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}  Backend is ready!${NC}"
        break
    fi
    sleep 1
done

# Start frontend with Vite (hot reload built-in)
cd "$PROJECT_DIR/frontend"
echo -e "${CYAN}  Starting frontend on port ${FRONTEND_PORT} (Vite HMR)...${NC}"
npx vite --port $FRONTEND_PORT --host &
FRONTEND_PID=$!

sleep 3

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Application is running!                                 ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║  Frontend:  ${CYAN}http://localhost:${FRONTEND_PORT}${GREEN}                       ║${NC}"
echo -e "${GREEN}║  Backend:   ${CYAN}http://localhost:${BACKEND_PORT}${GREEN}                       ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║  Demo Login:                                             ║${NC}"
echo -e "${GREEN}║    Email:    admin@satellite.ai                          ║${NC}"
echo -e "${GREEN}║    Password: admin123                                    ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop all services                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
