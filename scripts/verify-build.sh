#!/bin/bash

# 构建验证脚本
# 用于验证打包过程中是否包含不需要的文件

set -e

echo "🔍 开始验证构建输出..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo -e "${RED}✗ dist 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓ dist 目录存在${NC}"
echo ""

# 检查是否包含markdown文件
echo "[object Object]Markdown 文件..."
md_files=$(find dist -name "*.md" -type f 2>/dev/null || true)
if [ -n "$md_files" ]; then
    echo -e "${RED}✗ 发现 Markdown 文件:${NC}"
    echo "$md_files" | sed 's/^/  /'
    exit 1
else
    echo -e "${GREEN}✓ 没有发现 Markdown 文件${NC}"
fi
echo ""

# 检查是否包含测试文件
echo "🧪 检查测试文件..."
test_files=$(find dist -name "*.test.js" -o -name "*.spec.js" -o -name "test-*.js" 2>/dev/null || true)
if [ -n "$test_files" ]; then
    echo -e "${RED}✗ 发现测试文件:${NC}"
    echo "$test_files" | sed 's/^/  /'
    exit 1
else
    echo -e "${GREEN}✓ 没有发现测试文件${NC}"
fi
echo ""

# 检查可执行文件
echo "📦 检查可执行文件..."
exe_files=$(find dist -name "Haitang*.exe" -o -name "Haitang*.msi" 2>/dev/null || true)
if [ -z "$exe_files" ]; then
    echo -e "${YELLOW}⚠ 没有发现可执行文件${NC}"
else
    echo -e "${GREEN}✓ 发现可执行文件:${NC}"
    echo "$exe_files" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  $file ($size)"
    done
fi
echo ""

# 检查checksum文件
echo "🔐 检查校验和文件..."
if [ -f "dist/checksums-windows.txt" ]; then
    echo -e "${GREEN}✓ 校验和文件存在${NC}"
    cat dist/checksums-windows.txt | sed 's/^/  /'
else
    echo -e "${YELLOW}⚠ 校验和文件不存在${NC}"
fi
echo ""

# 统计文件
echo "📊 构建统计..."
total_files=$(find dist -type f | wc -l)
total_size=$(du -sh dist | cut -f1)
echo "  总文件数: $total_files"
echo "  总大小: $total_size"
echo ""

echo -e "${GREEN}✅ 构建验证完成！${NC}"

