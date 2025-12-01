# GitHub Actions Sparse-Checkout 修复说明

## 问题描述

在执行 GitHub Actions 工作流时，`build-windows.yml` 中的 `actions/checkout@v4` 步骤出现以下错误：

```
Warning: Unexpected input(s) 'sparse-checkout-cone', valid inputs are [...]
Error: fatal: specify directories rather than patterns (no leading slash)
Error: The process 'C:\Program Files\Git\bin\git.exe' failed with exit code 128
```

## 根本原因

在 `build-windows.yml` 的第 33 行，使用了错误的参数名称：

```yaml
sparse-checkout-cone: false  # ❌ 错误的参数名
```

正确的参数名称应该是：

```yaml
sparse-checkout-cone-mode: false  # ✅ 正确的参数名
```

## 修复方案

### 变更内容

**文件**: `.github/workflows/build-windows.yml`

**修改前**:
```yaml
- name: Checkout code (exclude problematic docs)
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    sparse-checkout: |
      /*
      !/src/**/*.md
      !/src/views/erp/saltprocess/records/binary/*
    sparse-checkout-cone: false  # ❌ 错误
```

**修改后**:
```yaml
- name: Checkout code (exclude problematic docs)
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    sparse-checkout: |
      /*
      !/src/**/*.md
      !/src/views/erp/saltprocess/records/binary/*
    sparse-checkout-cone-mode: false  # ✅ 正确
```

## 参数说明

### actions/checkout@v4 的有效参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `repository` | string | 要检出的存储库 |
| `ref` | string | 要检出的分支、标签或 SHA |
| `token` | string | 用于访问存储库的令牌 |
| `ssh-key` | string | SSH 私钥 |
| `ssh-known-hosts` | string | SSH 已知主机 |
| `ssh-strict` | boolean | SSH 严格主机密钥检查 |
| `ssh-user` | string | SSH 用户名 |
| `persist-credentials` | boolean | 是否持久化凭证 |
| `path` | string | 检出路径 |
| `clean` | boolean | 是否清理工作目录 |
| `filter` | string | 对象过滤器 |
| `sparse-checkout` | string | 稀疏检出模式 |
| **`sparse-checkout-cone-mode`** | boolean | 是否使用 cone 模式 |
| `fetch-depth` | number | 获取深度 |
| `fetch-tags` | boolean | 是否获取标签 |
| `show-progress` | boolean | 是否显示进度 |
| `lfs` | boolean | 是否使用 Git LFS |
| `submodules` | string | 子模块配置 |
| `set-safe-directory` | boolean | 是否设置安全目录 |
| `github-server-url` | string | GitHub 服务器 URL |

## 稀疏检出模式说明

### Cone 模式 (推荐)

当 `sparse-checkout-cone-mode: true` 时，使用目录路径而不是 glob 模式：

```yaml
sparse-checkout: |
  /
  !/docs
  !/src/views/erp/saltprocess/records/binary
sparse-checkout-cone-mode: true
```

### 模式模式

当 `sparse-checkout-cone-mode: false` 时，可以使用 glob 模式：

```yaml
sparse-checkout: |
  /*
  !/src/**/*.md
  !/src/views/erp/saltprocess/records/binary/*
sparse-checkout-cone-mode: false
```

## 验证修复

修复后，GitHub Actions 工作流应该能够正常执行：

1. ✅ 参数被正确识别
2. ✅ Git sparse-checkout 命令成功执行
3. ✅ 排除指定的文件和目录
4. ✅ 构建流程继续进行

## 相关资源

- [GitHub Actions Checkout 文档](https://github.com/actions/checkout)
- [Git Sparse Checkout 文档](https://git-scm.com/docs/git-sparse-checkout)
- [actions/checkout@v4 参数列表](https://github.com/actions/checkout/blob/v4/action.yml)

## 提交信息

```
fix(ci): 修复 GitHub Actions sparse-checkout 参数错误

修复问题：
- 将 sparse-checkout-cone 改为 sparse-checkout-cone-mode
- 这是 actions/checkout@v4 的正确参数名称
- 解决 "Unexpected input(s) 'sparse-checkout-cone'" 错误

影响范围：
- build-windows.yml 工作流

相关错误：
- Error: fatal: specify directories rather than patterns (no leading slash)
- Warning: Unexpected input(s) 'sparse-checkout-cone'
```

---

**修复日期**: 2025-12-01  
**修复者**: Cascade AI  
**分支**: fix/ci-sparse-checkout

