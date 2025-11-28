#!/bin/bash

# Electron 应用配置验证脚本
# 用于验证 Electron 应用的后端服务配置是否正确

echo "=========================================="
echo "Electron 应用配置验证"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 .env.electron 文件
echo -e "${YELLOW}1. 检查 .env.electron 文件...${NC}"
if [ -f ".env.electron" ]; then
    echo -e "${GREEN}✓ .env.electron 文件存在${NC}"
    echo ""
    echo "内容摘要:"
    grep "VITE_APP_BASE_API\|VITE_APP_ENV\|VITE_APP_MONITRO_ADMIN" .env.electron
    echo ""
else
    echo -e "${RED}✗ .env.electron 文件不存在${NC}"
    exit 1
fi

# 检查 electron.vite.config.ts
echo -e "${YELLOW}2. 检查 electron.vite.config.ts 配置...${NC}"
if grep -q "loadEnv" electron.vite.config.ts; then
    echo -e "${GREEN}✓ electron.vite.config.ts 已更新为支持环境变量加载${NC}"
else
    echo -e "${RED}✗ electron.vite.config.ts 未正确配置${NC}"
    exit 1
fi
echo ""

# 检查 package.json 中的 Electron 构建脚本
echo -e "${YELLOW}3. 检查 package.json 中的构建脚本...${NC}"
if grep -q '"build:electron": "electron-vite build --mode electron"' package.json; then
    echo -e "${GREEN}✓ build:electron 脚本已更新${NC}"
else
    echo -e "${RED}✗ build:electron 脚本未正确配置${NC}"
    exit 1
fi

if grep -q '"dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win"' package.json; then
    echo -e "${GREEN}✓ dist:win 脚本已更新${NC}"
else
    echo -e "${RED}✗ dist:win 脚本未正确配置${NC}"
    exit 1
fi
echo ""

# 检查 electron-request.ts 文件
echo -e "${YELLOW}4. 检查 Electron 专用请求模块...${NC}"
if [ -f "src/utils/electron-request.ts" ]; then
    echo -e "${GREEN}✓ electron-request.ts 文件存在${NC}"
    if grep -q "http://42.192.76.234:8080" src/utils/electron-request.ts; then
        echo -e "${GREEN}✓ 后端地址正确配置为 http://42.192.76.234:8080${NC}"
    else
        echo -e "${RED}✗ 后端地址配置不正确${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ electron-request.ts 文件不存在${NC}"
    exit 1
fi
echo ""

# 检查 Web 应用配置是否保持不变
echo -e "${YELLOW}5. 验证 Web 应用配置未被修改...${NC}"
if grep -q "VITE_APP_BASE_API = '/prod-api'" .env.production; then
    echo -e "${GREEN}✓ .env.production 配置保持不变${NC}"
else
    echo -e "${RED}✗ .env.production 配置已被修改${NC}"
    exit 1
fi

if grep -q "VITE_APP_BASE_API = '/dev-api'" .env.development; then
    echo -e "${GREEN}✓ .env.development 配置保持不变${NC}"
else
    echo -e "${RED}✗ .env.development 配置已被修改${NC}"
    exit 1
fi
echo ""

# 检查 vite.config.ts 是否保持不变
echo -e "${YELLOW}6. 验证 vite.config.ts 未被修改...${NC}"
if grep -q "target: 'http://localhost:8080'" vite.config.ts; then
    echo -e "${GREEN}✓ vite.config.ts 配置保持不变${NC}"
else
    echo -e "${RED}✗ vite.config.ts 配置已被修改${NC}"
    exit 1
fi
echo ""

# 总结
echo "=========================================="
echo -e "${GREEN}✓ 所有配置验证通过！${NC}"
echo "=========================================="
echo ""
echo "配置摘要:"
echo "- Electron 后端地址: http://42.192.76.234:8080"
echo "- Electron API 基础路径: http://42.192.76.234:8080/prod-api"
echo "- Web 应用配置: 保持不变"
echo ""
echo "构建命令:"
echo "- 开发: npm run dev:electron"
echo "- 构建: npm run build:electron"
echo "- 打包 Windows: npm run dist:win"
echo "- 打包 macOS: npm run dist:mac"
echo "- 打包 Linux: npm run dist:linux"
echo ""

