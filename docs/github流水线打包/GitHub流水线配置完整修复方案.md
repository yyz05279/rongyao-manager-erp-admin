# GitHub 流水线配置完整修复方案

## 问题概述

1. **macOS 构建被自动触发** - 导致 Windows 打包时也执行 macOS 构建
2. **文档文件路径问题** - 包含特殊字符的文件名导致 Git 检出失败
3. **文件已提交到 Git** - 需要从历史中移除

## 解决方案

### 第一步：禁用所有 macOS 构建 Workflow

已修改以下文件，禁用自动触发：

#### 1. `.github/workflows/build-mac.yml`
```yaml
on:
  # 已禁用 - 仅在需要时手动触发
  # push:
  #   branches: [ main, develop ]
  # pull_request:
  #   branches: [ main, develop ]
  workflow_dispatch:
```

#### 2. `.github/workflows/build-mac-intel.yml`
```yaml
on:
  # 已禁用 - 仅在需要时手动触发
  # workflow_call:
  # push:
  #   tags:
  #     - 'v*'
  workflow_dispatch:
```

#### 3. `.github/workflows/build-mac-arm64.yml`
```yaml
on:
  # 已禁用 - 仅在需要时手动触发
  # workflow_call:
  # push:
  #   tags:
  #     - 'v*'
  workflow_dispatch:
```

### 第二步：处理有问题的文档文件

#### 问题文件位置
```
src/views/erp/saltprocess/records/binary/
  ├── # 二元化盐记录管理 - "修改"按钮功能修复验证.md
  └── 二元化盐记录管理 - "修改"按钮问题详细分析.md
```

#### 解决方案

**方案 A：从 Git 历史中移除（推荐）**

```bash
# 1. 从 Git 追踪中移除这些文件
git rm --cached 'src/views/erp/saltprocess/records/binary/# 二元化盐记录管理 - "修改"按钮功能修复验证.md'
git rm --cached 'src/views/erp/saltprocess/records/binary/二元化盐记录管理 - "修改"按钮问题详细分析.md'

# 2. 提交更改
git commit -m "chore: 从版本控制中移除有问题的文档文件"

# 3. 推送到远程
git push origin master
```

**方案 B：使用 BFG Repo-Cleaner 清理历史（完全清除）**

```bash
# 安装 BFG
brew install bfg

# 创建镜像克隆
git clone --mirror https://github.com/yyz05279/rongyao-manager-erp-admin.git

# 清理文件
bfg --delete-files '# 二元化盐记录管理*' rongyao-manager-erp-admin.git
bfg --delete-files '*"修改"按钮*' rongyao-manager-erp-admin.git

# 清理引用
cd rongyao-manager-erp-admin.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# 推送回远程
git push --mirror
```

### 第三步：更新 .gitignore（已完成）

`.gitignore` 已包含规则：
```
# 排除src目录中的文档和测试文件（防止打包时包含）
src/**/*.md
src/**/*.test.js
src/**/*.spec.js
src/**/*.test.ts
src/**/*.spec.ts
src/**/test-*.js
src/**/*-test.js
```

### 第四步：验证 Windows 构建配置

`.github/workflows/build-windows.yml` 已正确配置：
- 仅在 Windows 平台运行
- 包含文档文件检查
- 验证无 markdown 文件在构建输出中

## 验证步骤

1. **检查 Workflow 状态**
   ```bash
   # 查看最近的 workflow 运行
   gh run list --workflow=build-windows.yml
   ```

2. **测试标签推送**
   ```bash
   # 创建测试标签
   git tag v0.0.4-test
   git push origin v0.0.4-test
   
   # 监控 Actions 运行
   # 应该只看到 Windows 构建，不应该有 macOS 构建
   ```

3. **验证文件排除**
   ```bash
   # 检查 dist 目录中没有 .md 文件
   find dist -name "*.md" -type f
   ```

## 后续建议

1. **使用 GitHub Actions 路径过滤**
   ```yaml
   on:
     push:
       paths:
         - 'src/**'
         - '!src/**/*.md'
   ```

2. **定期清理文档**
   - 将所有项目文档放在 `/docs` 目录
   - 不要在 `src` 目录中存放文档

3. **文件命名规范**
   - 避免使用特殊字符：`#`, `"`, `*`, `?`, `<`, `>`, `|`
   - 使用 kebab-case：`feature-description.md`

## 相关文档

- [GitHub Actions 路径过滤](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow)
- [Git 忽略文件](https://docs.github.com/en/get-started/git-basics/ignoring-files)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

