# GitHub Actions Sparse-Checkout 修复总结

## 📋 问题概述

在 GitHub Actions 工作流执行时，`build-windows.yml` 中出现以下错误：

```
Warning: Unexpected input(s) 'sparse-checkout-cone', valid inputs are [...]
Error: fatal: specify directories rather than patterns (no leading slash)
Error: The process 'C:\Program Files\Git\bin\git.exe' failed with exit code 128
```

## 🔍 根本原因

**文件**: `.github/workflows/build-windows.yml`  
**行号**: 第 33 行  
**问题**: 使用了错误的参数名称

```yaml
# ❌ 错误的参数名
sparse-checkout-cone: false

# ✅ 正确的参数名
sparse-checkout-cone-mode: false
```

## ✅ 修复方案

### 变更详情

| 项目 | 详情 |
|------|------|
| **分支名** | `fix/ci-sparse-checkout` |
| **修改文件** | `.github/workflows/build-windows.yml` |
| **修改行** | 第 33 行 |
| **修改内容** | `sparse-checkout-cone` → `sparse-checkout-cone-mode` |
| **提交哈希** | `d7ce6d938a735eb49286c52d0f5912ab3661f12f` |

### 修改前后对比

```diff
  - name: Checkout code (exclude problematic docs)
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
      sparse-checkout: |
        /*
        !/src/**/*.md
        !/src/views/erp/saltprocess/records/binary/*
-     sparse-checkout-cone: false
+     sparse-checkout-cone-mode: false
```

## 📚 相关文档

详细的修复说明已保存在：  
📄 `docs/CI-SPARSE-CHECKOUT-FIX.md`

该文档包含：
- 问题描述
- 根本原因分析
- 修复方案详解
- 参数说明表
- 稀疏检出模式说明
- 验证方法

## 🚀 后续步骤

### 1. 推送分支到远端 (可选)
```bash
git push origin fix/ci-sparse-checkout
```

### 2. 创建 Pull Request
在 GitHub 上创建 PR，将 `fix/ci-sparse-checkout` 合并到 `main` 或 `develop`

### 3. 验证修复
- 手动触发 Windows 工作流
- 确认构建成功完成
- 检查不再出现 sparse-checkout 错误

## 📊 修复影响范围

| 工作流 | 状态 | 说明 |
|------|------|------|
| `build-windows.yml` | ✅ 已修复 | 参数名称已更正 |
| `build-mac.yml` | ✅ 无需修复 | 未使用 sparse-checkout |
| `build-mac-arm64.yml` | ✅ 无需修复 | 未使用 sparse-checkout |
| `build-mac-intel.yml` | ✅ 无需修复 | 未使用 sparse-checkout |
| `release.yml` | ✅ 无需修复 | 未使用 sparse-checkout |

## 🔗 参考资源

- [GitHub Actions Checkout 官方文档](https://github.com/actions/checkout)
- [actions/checkout@v4 参数列表](https://github.com/actions/checkout/blob/v4/action.yml)
- [Git Sparse Checkout 文档](https://git-scm.com/docs/git-sparse-checkout)

## 📝 提交信息

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

**修复完成时间**: 2025-12-01 09:21:10 UTC  
**修复者**: Cascade AI Assistant  
**修复分支**: `fix/ci-sparse-checkout`  
**状态**: ✅ 已完成

