# GitHub Actions shasum 错误修复

## 问题描述

GitHub Actions 流水线出现以下错误：
```
Run cd dist
shasum: Haitang*.dmg: No such file or directory
Error: Process completed with exit code 1.
```

## 根本原因

在 macOS 构建工作流中（`build-mac-intel.yml` 和 `build-mac-arm64.yml`），"Create checksums" 步骤尝试对 DMG 文件计算 SHA256 校验和，但没有检查文件是否存在：

```bash
cd dist
shasum -a 256 Haitang*.dmg > checksums-intel.txt
```

当以下情况发生时会导致错误：
1. 构建步骤失败，没有生成 DMG 文件
2. 通配符 `Haitang*.dmg` 无法匹配任何文件
3. shasum 命令返回错误代码 1，导致工作流失败

## 修复方案

### 1. 添加构建输出验证步骤

在 "Create checksums" 之前添加 "Verify build output" 步骤，检查：
- dist 目录是否存在
- DMG 文件是否存在
- 列出实际生成的文件

### 2. 改进 shasum 命令

使用 `if !` 条件检查命令执行结果，并提供详细的错误信息：

```bash
if ! shasum -a 256 Haitang*.dmg > checksums-intel.txt 2>&1; then
  echo "❌ Error: Failed to create checksums"
  cat checksums-intel.txt
  exit 1
fi
```

## 修改的文件

### build-mac-intel.yml
- 添加 "Verify build output" 步骤（第 58-75 行）
- 改进 "Create checksums" 步骤（第 77-86 行）

### build-mac-arm64.yml
- 添加 "Verify build output" 步骤（第 59-76 行）
- 改进 "Create checksums" 步骤（第 78-87 行）

## 改进的优势

1. **更好的错误诊断**：提前检测问题，提供清晰的错误信息
2. **调试信息**：显示实际生成的文件列表
3. **更可靠的流程**：避免在文件不存在时执行 shasum
4. **一致性**：与 Windows 构建工作流的做法保持一致

## 测试建议

1. 手动触发 macOS 构建工作流
2. 验证 "Verify build output" 步骤成功执行
3. 验证 "Create checksums" 步骤正确生成校验和文件
4. 检查上传的工件中是否包含 checksums 文件

## 相关文件

- `.github/workflows/build-mac-intel.yml`
- `.github/workflows/build-mac-arm64.yml`
- `.github/workflows/build-windows.yml`（参考实现）

