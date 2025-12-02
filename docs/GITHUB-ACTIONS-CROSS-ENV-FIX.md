# GitHub Actions 流水线 - cross-env 修复

## 问题分析

### Windows 构建流水线问题
在 `.github/workflows/build-windows.yml` 中，第 100 行直接运行：
```yaml
- name: Build Electron app (Windows x64)
  run: npm run dist:win
```

这会调用 `package.json` 中的脚本：
```json
"dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win"
```

由于 `cross-env` 缺失，流水线会失败。

### macOS 构建流水线对比
在 `.github/workflows/build-mac.yml` 中，第 63-68 行使用了不同的方式：
```yaml
- name: Build macOS package
  run: |
    VITE_APP_ENV=electron npx electron-builder \
      --mac \
      --publish=never \
      --config electron-builder.yml
```

这种方式在 macOS/Linux 上直接设置环境变量，不需要 `cross-env`。

## 修复方案

### 方案 1：添加 cross-env 依赖（已实施）✅
**优点**：
- 脚本保持一致性
- 跨平台兼容
- 本地开发和 CI/CD 行为一致

**已完成**：
- 在 `package.json` 中添加 `cross-env@7.0.3`
- 依赖会在 `npm ci` 或 `npm install` 时自动安装

### 方案 2：修改 Windows 流水线（可选）
如果想避免依赖 `cross-env`，可以修改流水线脚本。

## 验证修复

### 本地验证
```bash
# 1. 确认依赖已安装
npm list cross-env

# 2. 构建 Electron 应用
npm run build:electron

# 3. 打包 Windows 应用
npm run dist:win
```

### GitHub Actions 验证
流水线会自动执行以下步骤：
1. `npm ci --prefer-offline --no-audit` - 安装依赖（包括 cross-env）
2. `npm run build:prod` - 构建 Vue 应用
3. `npm run dist:win` - 打包 Windows 应用（现在会成功）

## 流水线流程

### build-windows.yml 流程
```
1. Checkout code
2. Setup Node.js (with npm cache)
3. Install dependencies (npm ci)
   ↓ 此时 cross-env 被安装
4. Build Vue application
5. Build Electron app (npm run dist:win)
   ↓ 现在 cross-env 可用
6. Verify build output
7. Create checksums
8. Upload artifacts
```

### release.yml 流程
```
1. Trigger: Push tag (v*)
2. Call build-windows.yml
   ↓ Windows 构建完成
3. Download artifacts
4. Create GitHub Release
5. Upload to release
```

## 相关配置

### package.json 脚本
```json
"scripts": {
  "build:electron": "NODE_OPTIONS=--max-old-space-size=4096 electron-vite build --mode electron",
  "dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win",
  "dist:mac": "VITE_APP_ENV=electron electron-builder --mac --config electron-builder.yml",
  "dist:linux": "VITE_APP_ENV=electron electron-builder --linux"
}
```

### 环境变量说明
- `VITE_APP_ENV=electron` - 指定构建模式为 Electron
- `NODE_OPTIONS=--max-old-space-size=4096` - 增加 Node.js 内存限制

## 预期结果

### 修复前
```
'cross-env' is not recognized as an internal or external command
Error: Process completed with exit code 1
```

### 修复后
```
✓ npm ci 安装依赖（包括 cross-env）
✓ npm run build:electron 成功
✓ npm run dist:win 成功
✓ 生成 Windows 安装程序和便携版
✓ 上传到 GitHub Release
```

## 后续步骤

1. ✅ 修改已提交到仓库
2. 推送到 GitHub
3. 创建标签触发 Release 流水线：`git tag v1.0.0 && git push origin v1.0.0`
4. 监控流水线执行情况
5. 验证 GitHub Release 中的构建产物

