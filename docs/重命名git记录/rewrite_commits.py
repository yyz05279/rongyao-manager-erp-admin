#!/usr/bin/env python3
"""
脚本用于改写 Git 提交信息
"""
import subprocess
import sys

# 定义需要改写的提交映射
COMMIT_REWRITES = {
    '2f217fb4652aae7a0ac56fc1b1c475f90b41600d': 'ci(mac): 支持在 mac Intel 上运行 npm run electron:build',
    'e5f5d22591d76108d38f77d4a7d4e99b7e427760': 'ci(mac-intel): 修复 Electron 构建命令的架构参数标志',
    '4641a760d1e5d6bdf07d8698a3a770a217d0da56': 'chore(build): 新增 electron:build 脚本与 preelectron:build 钩子',
    '7bea272bf478380045d6d63bea2216a2b86d44bc': 'fix(build): 在 build:electron 中为 NODE_OPTIONS 使用 cross-env（提升 Windows 兼容性）',
    '827d4073985f8364109ec2b20fb9ea99b21ed8eb': 'ci: 新增基于 Ubuntu 的 CI 工作流以规避 Windows 路径问题',
    'af3e61ddf2d76c523750c4e42fa18366e34362f0': 'fix(subsystem): 在 item-template API 中导出 listItemTemplateByTemplateId',
    '9a577219b6255b6ae118ef39b8ab587fb8d4d9a0': 'fix(ci): 将构建工作流改为可复用并将 artifact 动作升级到 v4',
}

def get_commit_message(commit_hash):
    """获取提交的完整信息"""
    try:
        result = subprocess.run(
            ['git', 'log', '-1', '--format=%B', commit_hash],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError:
        return None

def rewrite_commit(commit_hash, new_message):
    """改写单个提交的信息"""
    try:
        # 使用 git commit-tree 和 git update-ref 来改写提交
        # 首先获取提交的树对象
        result = subprocess.run(
            ['git', 'rev-parse', f'{commit_hash}^{{tree}}'],
            capture_output=True,
            text=True,
            check=True
        )
        tree = result.stdout.strip()
        
        # 获取提交的父提交
        try:
            result = subprocess.run(
                ['git', 'rev-parse', f'{commit_hash}^'],
                capture_output=True,
                text=True,
                check=True
            )
            parent = result.stdout.strip()
            parent_flag = ['-p', parent]
        except subprocess.CalledProcessError:
            # 如果没有父提交（初始提交），不添加 -p 标志
            parent_flag = []
        
        # 获取原提交的作者信息
        result = subprocess.run(
            ['git', 'log', '-1', '--format=%an%n%ae%n%ai', commit_hash],
            capture_output=True,
            text=True,
            check=True
        )
        lines = result.stdout.strip().split('\n')
        author_name = lines[0]
        author_email = lines[1]
        author_date = lines[2]
        
        # 创建新的提交对象
        env = {
            'GIT_AUTHOR_NAME': author_name,
            'GIT_AUTHOR_EMAIL': author_email,
            'GIT_AUTHOR_DATE': author_date,
            'GIT_COMMITTER_NAME': author_name,
            'GIT_COMMITTER_EMAIL': author_email,
            'GIT_COMMITTER_DATE': author_date,
        }
        
        result = subprocess.run(
            ['git', 'commit-tree', tree] + parent_flag + ['-m', new_message],
            input='',
            capture_output=True,
            text=True,
            env={**subprocess.os.environ, **env},
            check=True
        )
        new_commit = result.stdout.strip()
        
        return new_commit
    except subprocess.CalledProcessError as e:
        print(f"Error rewriting commit {commit_hash}: {e}")
        return None

def main():
    """主函数"""
    print("开始改写提交信息...")
    
    # 验证所有提交都存在
    print("\n验证提交...")
    for commit_hash in COMMIT_REWRITES.keys():
        result = subprocess.run(
            ['git', 'cat-file', '-t', commit_hash],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"❌ 提交 {commit_hash} 不存在")
            return 1
        print(f"✓ 提交 {commit_hash} 存在")
    
    print("\n提交验证完成！")
    print("\n需要改写的提交：")
    for commit_hash, new_message in COMMIT_REWRITES.items():
        print(f"  {commit_hash[:7]} → {new_message}")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())

