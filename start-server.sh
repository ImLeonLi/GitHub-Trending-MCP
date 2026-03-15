#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     GitHub Trending Extractor - Launcher               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] First run, installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Check if compiled
if [ ! -f "dist/index.js" ]; then
    echo -e "${YELLOW}[INFO] First run, building project...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Build failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}[INFO] Starting Web test server...${NC}"
echo -e "${GREEN}[INFO] Please wait...${NC}"
echo ""

# Start server
npm run server

# If server exits abnormally
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR] Server exited abnormally${NC}"
    read -p "Press Enter to exit..."
fi
