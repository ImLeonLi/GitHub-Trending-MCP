#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     GitHub Trending 提取工具 - 启动器                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] 首次运行，正在安装依赖...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] 依赖安装失败${NC}"
        exit 1
    fi
fi

# 检查是否已编译
if [ ! -f "dist/index.js" ]; then
    echo -e "${YELLOW}[INFO] 首次运行，正在编译项目...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] 编译失败${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}[INFO] 正在启动 Web 测试服务器...${NC}"
echo -e "${GREEN}[INFO] 请稍候...${NC}"
echo ""

# 启动服务器
npm run server

# 如果服务器异常退出
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR] 服务器异常退出${NC}"
    read -p "按回车键退出..."
fi
