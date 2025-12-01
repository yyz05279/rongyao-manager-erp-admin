#!/bin/bash

# macOS 构建脚本 - 解决 app-builder goroutine 死锁问题

set -e

echo "开始 macOS 构建流程..."

# 1. 检查系统资源
echo "检查系统资源..."
AVAILABLE_MEMORY=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
AVAILABLE_MEMORY=$((AVAILABLE_MEMORY * 4096 / 1024 / 1024))
echo "可用内存: ${AVAILABLE_MEMORY} MB"

if [ "$AVAILABLE_MEMORY" -lt 2048 ]; then
  echo "警告: 可用内存少于 2GB，可能导致构建失败"
fi

# 2. 检查磁盘空间
echo "检查磁盘空间..."
AVAILABLE_DISK=$(df -h . | tail -1 | awk '{print $4}')
echo "可用磁盘空间: $AVAILABLE_DISK"

# 3. 增加文件描述符限制
echo "配置系统限制..."
ulimit -n 4096
ulimit -u 2048
echo "文件描述符限制已设置为: $(ulimit -n)"

# 4. 设置环境变量
echo "设置环境变量..."
export NODE_OPTIONS="--max-old-space-size=4096"
export ELECTRON_BUILDER_CACHE_DIR="$HOME/.electron-builder-cache"
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

# 5. 清理旧的构建文件
echo "清理旧的构建文件..."
rm -rf dist out node_modules/.cache

# 6. 安装依赖
echo "安装依赖..."
npm ci --prefer-offline --no-audit

# 7. 构建 Electron 应用
echo "构建 Electron 应用..."
npm run build:electron

# 8. 执行 macOS 打包
echo "执行 macOS 打包..."
VITE_APP_ENV=electron npx electron-builder \
  --mac \
  --publish=never \
  --config electron-builder.yml \
  -c.artifactBuildStarted=null \
  -c.mac.asarUnpack="**/*.node"

echo "macOS 构建完成！"
echo "输出文件位置: dist/mac"
