# GitHub Actions 文件排除最佳实践

## 概述

本文档基于 GitHub Actions 官方文档，提供了在流水线中排除已提交文件的完整解决方案。

## 方案一：使用 paths-ignore 过滤 Workflow 触发

### 原理
在 workflow 的 `on` 部分使用 `paths-ignore` 过滤，使得仅修改特定文件时不触发 workflow。

### 配置示例

```yaml
name: Build Windows

on:
  push:
    tags:
      - 'v*'
    # 排除仅修改文档的推送
    paths-ignore:
      - 'docs/**'
      - 'src/**/*.md'
      - '*.md'
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      # ... 其他步骤
```

### 优点
- 简单易用
- 减少不必要的 workflow 运行
- 节省 GitHub Actions 配额

### 缺点
- 仅在提交时生效
- 不能清除已提交的文件

## 方案二：使用 paths 包含和排除

### 原理
使用 `!` 前缀排除特定路径，同时包含其他路径。

### 配置示例

```yaml
on:
  push:
    paths:
      - 'src/**'
      - '!src/**/*.md'
      - '.github/workflows/**'
```

### 说明
- 包含 `src/` 目录中的所有文件
- 排除 `src/` 目录中的 `.md` 文件
- 包含 workflow 配置文件

## 方案三：从 Git 追踪中移除已提交文件

### 原理
使用 `git rm --cached` 从版本控制中移除文件，但保留本地副本。

### 步骤

```bash
# 1. 从 Git 追踪中移除文件
git rm --cached 'src/views/erp/saltprocess/records/binary/# 二元化盐记录管理 - "修改"按钮功能修复验证.md'
git rm --cached 'src/views/erp/saltprocess/records/binary/二元化盐记录管理 - "修改"按钮问题详细分析.md'

# 2. 提交更改
git commit -m "chore: 从版本控制中移除有问题的文档文件"

# 3. 推送到远程
git push origin master
```

### 验证

```bash
# 检查文件是否已移除
git ls-files | grep "# 二元化盐记录管理"

# 应该没有输出
```

## 方案四：使用 .gitignore 防止未来提交

### 配置

```gitignore
# 排除 src 目录中的所有文档文件
src/**/*.md
src/**/*.test.js
src/**/*.spec.js

# 排除特定目录
src/**/docs/
src/**/test/
```

### 说明
- 防止新的 `.md` 文件被提交到 `src` 目录
- 对已提交的文件无效
- 需要配合 `git rm --cached` 使用

## 方案五：使用 .gitattributes 标记生成文件

### 原理
标记文件为生成文件，GitHub 会在 diff 中隐藏它们。

### 配置

```gitattributes
# 标记为生成文件
src/**/*.md linguist-generated=true
build/** linguist-generated=false
```

### 说明
- `linguist-generated=true` - 隐藏在 diff 中
- `linguist-generated=false` - 强制显示在 diff 中

## 方案六：完全清除历史（使用 BFG）

### 原理
使用 BFG Repo-Cleaner 从整个 Git 历史中移除文件。

### 步骤

```bash
# 1. 安装 BFG
brew install bfg  # macOS
# 或从 https://rtyley.github.io/bfg-repo-cleaner/ 下载

# 2. 创建镜像克隆
git clone --mirror https://github.com/yyz05279/rongyao-manager-erp-admin.git

# 3. 清理文件
bfg --delete-files '# 二元化盐记录管理*' rongyao-manager-erp-admin.git
bfg --delete-files '*"修改"按钮*' rongyao-manager-erp-admin.git

# 4. 清理引用
cd rongyao-manager-erp-admin.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. 推送回远程
git push --mirror
```

### 注意
- 这会改变 commit hash
- 所有协作者需要重新克隆
- 仅在必要时使用

## 推荐方案组合

### 对于当前项目

1. **立即执行**：方案三（从 Git 追踪中移除）
2. **防止未来**：方案四（更新 .gitignore）
3. **优化流水线**：方案一（添加 paths-ignore）

### 配置示例

```yaml
# .github/workflows/build-windows.yml
name: Build Windows

on:
  push:
    tags:
      - 'v*'
    paths-ignore:
      - 'docs/**'
      - 'src/**/*.md'
      - '*.md'
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # ... 其他步骤
```

```gitignore
# .gitignore
# 排除 src 目录中的文档文件
src/**/*.md
src/**/*.test.js
src/**/*.spec.js
src/**/docs/
src/**/test/
```

## 参考资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Workflow 触发条件](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow)
- [Git 忽略文件](https://docs.github.com/en/get-started/git-basics/ignoring-files)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [.gitattributes 文档](https://git-scm.com/docs/gitattributes)

