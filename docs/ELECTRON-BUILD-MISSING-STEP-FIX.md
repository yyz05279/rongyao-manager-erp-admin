# Electron 构建缺失步骤修复

## 问题描述

GitHub Actions Windows 构建流水线失败：
```
Application entry file "out\main\index.js" does not exist.
Seems like a wrong configuration.
```

## 根本原因

在 `.github/workflows/build-windows.yml` 中，缺少了关键的构建步骤：
- ❌ 缺少 `npm run build:electron` 步骤
- ✅ 只有 `npm run build:prod` 和 `npm run dist:win`

### 构建流程分析

**错误的流程**：
```
1. npm run build:prod     ← 构建 Vue 应用 (dist/)
2. npm run dist:win       ← 打包 Electron 应用 ❌ 找不到 out/main/index.js
```

**正确的流程**：
```
1. npm run build:prod     ← 构建 Vue 应用 (dist/)
2. npm run build:electron ← 构建 Electron 主进程 (out/)
3. npm run dist:win       ← 打包 Electron 应用 ✅ 成功
```

## 修复方案

### 修改 build-windows.yml

在 `npm run dist:win` 之前添加 `npm run build:electron` 步骤：

```yaml
- name: Build Electron main process
  run: npm run build:electron
  env:
    VITE_APP_ENV: electron
    NODE_OPTIONS: --max-old-space-size=4096

- name: Build Electron app (Windows x64)
  run: npm run dist:win
  env:
    VITE_APP_ENV: electron
```

### 关键点

1. **NODE_OPTIONS**: 设置为 `--max-old-space-size=4096` 以避免内存不足
2. **VITE_APP_ENV**: 必须设置为 `electron` 以使用 Electron 构建配置
3. **执行顺序**: `build:electron` 必须在 `dist:win` 之前

## 修复的影响

### build-windows.yml
✅ 现在会正确构建 Electron 主进程
✅ 生成 `out/main/index.js` 和 `out/preload/index.js`
✅ electron-builder 可以找到入口文件
✅ 成功打包 Windows 应用

### release.yml
✅ 自动继承修复（因为调用 build-windows.yml）
✅ Release 流程现在完整
✅ 自动生成 GitHub Release

## 构建产物

成功构建后，会生成：
- `dist/海棠企业管理系统 Setup 1.0.0.exe` - NSIS 安装程序
- `dist/海棠企业管理系统 1.0.0.exe` - 便携版
- `dist/checksums-windows.txt` - 校验和文件

## 验证步骤

### 本地验证
```bash
# 1. 构建 Vue 应用
npm run build:prod

# 2. 构建 Electron 主进程
npm run build:electron

# 3. 打包 Windows 应用
npm run dist:win
```

### GitHub Actions 验证
1. 推送修改到 GitHub
2. 手动触发 `build-windows.yml` 流水线
3. 监控构建过程
4. 验证是否生成 .exe 文件

## 相关脚本

```json
{
  "scripts": {
    "build:prod": "vite build --mode production && vue-tsc --noEmit",
    "build:electron": "NODE_OPTIONS=--max-old-space-size=4096 electron-vite build --mode electron",
    "dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win"
  }
}
```

## 完整的 Windows 构建流程

```
npm run build:prod
    ↓ 生成 dist/ 目录
npm run build:electron
    ↓ 生成 out/main/index.js 和 out/preload/index.js
npm run dist:win
    ↓ 打包 Electron 应用
生成 .exe 文件
```

## 常见问题

### Q: 为什么需要 build:electron？
A: Electron 主进程代码需要编译，生成 `out/main/index.js`。electron-builder 需要这个文件作为应用入口。

### Q: build:prod 和 build:electron 的区别？
A: 
- `build:prod` - 构建 Vue 前端应用
- `build:electron` - 构建 Electron 主进程和预加载脚本

### Q: 为什么 macOS 流水线没有这个问题？
A: macOS 流水线中已经包含了 `npm run build:electron` 步骤。

## 修复文件

- `.github/workflows/build-windows.yml` - 添加 build:electron 步骤

