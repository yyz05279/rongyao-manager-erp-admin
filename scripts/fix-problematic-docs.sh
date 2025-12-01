#!/bin/bash

# GitHub 流水线修复脚本
# 用途：移除有问题的文档文件并更新 workflow 配置

set -e

echo "=========================================="
echo "GitHub 流水线配置修复脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 第一步：检查 Git 状态
echo -e "${YELLOW}[1/4] 检查 Git 状态...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ 工作目录有未提交的更改，请先提交或暂存${NC}"
    git status
    exit 1
fi
echo -e "${GREEN}✓ Git 状态正常${NC}"
echo ""

# 第二步：查找有问题的文档文件
echo -e "${YELLOW}[2/4] 查找有问题的文档文件...${NC}"
PROBLEMATIC_FILES=(
    'src/views/erp/saltprocess/records/binary/# 二元化盐记录管理 - "修改"按钮功能修复验证.md'
    'src/views/erp/saltprocess/records/binary/二元化盐记录管理 - "修改"按钮问题详细分析.md'
)

FOUND_FILES=()
for file in "${PROBLEMATIC_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_FILES+=("$file")
        echo -e "${YELLOW}  找到: $file${NC}"
    fi
done

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ 未找到有问题的文件${NC}"
else
    echo -e "${YELLOW}  共找到 ${#FOUND_FILES[@]} 个有问题的文件${NC}"
fi
echo ""

# 第三步：从 Git 追踪中移除文件
if [ ${#FOUND_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}[3/4] 从 Git 追踪中移除文件...${NC}"
    for file in "${FOUND_FILES[@]}"; do
        if git ls-files --error-unmatch "$file" 2>/dev/null; then
            git rm --cached "$file"
            echo -e "${GREEN}✓ 已移除: $file${NC}"
        fi
    done
    echo ""
fi

# 第四步：验证 workflow 配置
echo -e "${YELLOW}[4/4] 验证 workflow 配置...${NC}"

WORKFLOWS=(
    '.github/workflows/build-mac.yml'
    '.github/workflows/build-mac-intel.yml'
    '.github/workflows/build-mac-arm64.yml'
)

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "$workflow" ]; then
        if grep -q "workflow_dispatch:" "$workflow"; then
            echo -e "${GREEN}✓ $workflow 已禁用自动触发${NC}"
        else
            echo -e "${RED}❌ $workflow 配置可能有问题${NC}"
        fi
    fi
done
echo ""

# 总结
echo "=========================================="
echo -e "${GREEN}修复完成！${NC}"
echo "=========================================="
echo ""
echo "后续步骤："
echo "1. 检查 Git 状态: git status"
echo "2. 提交更改: git commit -m 'chore: 从版本控制中移除有问题的文档文件'"
echo "3. 推送到远程: git push origin master"
echo ""
echo "注意："
echo "- 如果需要完全清除历史，请使用 BFG Repo-Cleaner"
echo "- 参考文档: docs/github流水线打包/GitHub流水线配置完整修复方案.md"

