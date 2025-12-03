#!/usr/bin/env python3
"""
安全地改写 Git 提交信息的脚本
使用 git filter-branch 的替代方案
"""
import subprocess
import os
import sys

# 改写映射
REWRITES = {
    '2f217fb4652aae7a0ac56fc1b1c475f90b41600d': 'ci(mac): 支持在 mac Intel 上运行 npm run electron:build',
    'e5f5d22591d76108d38f77d4a7d4e99b7e427760': 'ci(mac-intel): 修复 Electron 构建命令的架构参数标志',
    '4641a760d1e5d6bdf07d8698a3a770a217d0da56': 'chore(build): 新增 electron:build 脚本与 preelectron:build 钩子',
    '7bea272bf478380045d6d63bea2216a2b86d44bc': 'fix(build): 在 build:electron 中为 NODE_OPTIONS 使用 cross-env（提升 Windows 兼容性）',
    '827d4073985f8364109ec2b20fb9ea99b21ed8eb': 'ci: 新增基于 Ubuntu 的 CI 工作流以规避 Windows 路径问题',
    'af3e61ddf2d76c523750c4e42fa18366e34362f0': 'fix(subsystem): 在 item-template API 中导出 listItemTemplateByTemplateId',
    '9a577219b6255b6ae118ef39b8ab587fb8d4d9a0': 'fix(ci): 将构建工作流改为可复用并将 artifact 动作升级到 v4',
}

def run_cmd(cmd, cwd=None):
    """运行命令"""
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    return result.returncode, result.stdout.strip(), result.stderr.strip()

def main():
    repo_path = '/Users/yyz/Desktop/haitang-web-admin'
    
    print("=" * 60)
    print("Git 提交信息改写工具")
    print("=" * 60)
    
    # 验证所有提交
    print("\n[1/3] 验证提交...")
    for sha, msg in REWRITES.items():
        code, out, err = run_cmd(f'git cat-file -t {sha}', cwd=repo_path)
        if code == 0:
            print(f"  ✓ {sha[:7]}")
        else:
            print(f"  ✗ {sha[:7]} - 不存在")
            return 1
    
    print("\n[2/3] 创建 filter 脚本...")
    filter_script = '''#!/bin/bash
COMMIT_SHA=$(git rev-parse $GIT_COMMIT)
case "$COMMIT_SHA" in
  2f217fb4652aae7a0ac56fc1b1c475f90b41600d)
    echo "ci(mac): 支持在 mac Intel 上运行 npm run electron:build"
    ;;
  e5f5d22591d76108d38f77d4a7d4e99b7e427760)
    echo "ci(mac-intel): 修复 Electron 构建命令的架构参数标志"
    ;;
  4641a760d1e5d6bdf07d8698a3a770a217d0da56)
    echo "chore(build): 新增 electron:build 脚本与 preelectron:build 钩子"
    ;;
  7bea272bf478380045d6d63bea2216a2b86d44bc)
    echo "fix(build): 在 build:electron 中为 NODE_OPTIONS 使用 cross-env（提升 Windows 兼容性）"
    ;;
  827d4073985f8364109ec2b20fb9ea99b21ed8eb)
    echo "ci: 新增基于 Ubuntu 的 CI 工作流以规避 Windows 路径问题"
    ;;
  af3e61ddf2d76c523750c4e42fa18366e34362f0)
    echo "fix(subsystem): 在 item-template API 中导出 listItemTemplateByTemplateId"
    ;;
  9a577219b6255b6ae118ef39b8ab587fb8d4d9a0)
    echo "fix(ci): 将构建工作流改为可复用并将 artifact 动作升级到 v4"
    ;;
  *)
    cat
    ;;
esac
'''
    
    with open('/tmp/git_filter_msg.sh', 'w') as f:
        f.write(filter_script)
    os.chmod('/tmp/git_filter_msg.sh', 0o755)
    print("  ✓ Filter 脚本已创建")
    
    print("\n[3/3] 执行 filter-branch...")
    code, out, err = run_cmd(
        'git filter-branch -f --msg-filter /tmp/git_filter_msg.sh -- master',
        cwd=repo_path
    )
    
    if code == 0:
        print("  ✓ 改写完成")
        print("\n" + "=" * 60)
        print("改写结果:")
        print("=" * 60)
        for sha, msg in REWRITES.items():
            code, out, err = run_cmd(f'git log -1 --format=%s {sha}', cwd=repo_path)
            print(f"  {sha[:7]} → {out}")
        return 0
    else:
        print(f"  ✗ 改写失败: {err}")
        return 1

if __name__ == '__main__':
    sys.exit(main())

