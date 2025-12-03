#!/bin/bash

# 改写提交信息的脚本
# 使用 git filter-branch 来改写特定提交的信息

cd /Users/yyz/Desktop/haitang-web-admin

# 定义提交映射（SHA -> 新消息）
declare -A COMMITS=(
    ["2f217fb4652aae7a0ac56fc1b1c475f90b41600d"]="ci(mac): 支持在 mac Intel 上运行 npm run electron:build"
    ["e5f5d22591d76108d38f77d4a7d4e99b7e427760"]="ci(mac-intel): 修复 Electron 构建命令的架构参数标志"
    ["4641a760d1e5d6bdf07d8698a3a770a217d0da56"]="chore(build): 新增 electron:build 脚本与 preelectron:build 钩子"
    ["7bea272bf478380045d6d63bea2216a2b86d44bc"]="fix(build): 在 build:electron 中为 NODE_OPTIONS 使用 cross-env（提升 Windows 兼容性）"
    ["827d4073985f8364109ec2b20fb9ea99b21ed8eb"]="ci: 新增基于 Ubuntu 的 CI 工作流以规避 Windows 路径问题"
    ["af3e61ddf2d76c523750c4e42fa18366e34362f0"]="fix(subsystem): 在 item-template API 中导出 listItemTemplateByTemplateId"
    ["9a577219b6255b6ae118ef39b8ab587fb8d4d9a0"]="fix(ci): 将构建工作流改为可复用并将 artifact 动作升级到 v4"
)

# 创建 filter 脚本
cat > /tmp/filter_msg.sh << 'EOF'
#!/bin/bash

# 从环境变量获取映射
declare -A COMMITS=(
    ["2f217fb4652aae7a0ac56fc1b1c475f90b41600d"]="ci(mac): 支持在 mac Intel 上运行 npm run electron:build"
    ["e5f5d22591d76108d38f77d4a7d4e99b7e427760"]="ci(mac-intel): 修复 Electron 构建命令的架构参数标志"
    ["4641a760d1e5d6bdf07d8698a3a770a217d0da56"]="chore(build): 新增 electron:build 脚本与 preelectron:build 钩子"
    ["7bea272bf478380045d6d63bea2216a2b86d44bc"]="fix(build): 在 build:electron 中为 NODE_OPTIONS 使用 cross-env（提升 Windows 兼容性）"
    ["827d4073985f8364109ec2b20fb9ea99b21ed8eb"]="ci: 新增基于 Ubuntu 的 CI 工作流以规避 Windows 路径问题"
    ["af3e61ddf2d76c523750c4e42fa18366e34362f0"]="fix(subsystem): 在 item-template API 中导出 listItemTemplateByTemplateId"
    ["9a577219b6255b6ae118ef39b8ab587fb8d4d9a0"]="fix(ci): 将构建工作流改为可复用并将 artifact 动作升级到 v4"
)

COMMIT_SHA=$(git rev-parse $GIT_COMMIT)
if [[ -n "${COMMITS[$COMMIT_SHA]}" ]]; then
    echo "${COMMITS[$COMMIT_SHA]}"
else
    cat
fi
EOF

chmod +x /tmp/filter_msg.sh

echo "开始改写提交信息..."
git filter-branch -f --msg-filter '/tmp/filter_msg.sh' -- master

echo "改写完成！"

