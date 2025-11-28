# macOS 打包修复 - 快速执行指南

## 已完成的修改

✅ **package.json** - 已更新 build.mac 配置：
- 添加 `executableName: "haitang-admin"` (ASCII 二进制名)
- 添加 `icon: "assets/icon.icns"` (应用图标)
- 添加 `extendInfo` 配置中文显示名称

✅ **assets/icon.icns** - 已创建应用图标 (4.4 KB)

## 立即执行的步骤

### 1️⃣ 清理所有缓存

```bash
# 清理构建输出
rm -rf dist/mac
rm -rf out

# 清理 electron-builder 缓存
rm -rf node_modules/.cache/electron-builder

# 清理 pnpm 缓存（可选）
pnpm store prune
```

### 2️⃣ 重新构建 Electron 应用

```bash
pnpm run build:electron
```

### 3️⃣ 打包 macOS 应用

```bash
VITE_APP_ENV=electron pnpm run dist:mac
```

## 验证步骤

### ✓ 检查二进制文件

```bash
ls -la "dist/mac/Electron.app/Contents/MacOS/"
# 应该看到 "haitang-admin" 文件
```

### ✓ 验证 Info.plist

```bash
plutil -p "dist/mac/Electron.app/Contents/Info.plist" | \
  grep -E 'CFBundle(Name|DisplayName|Executable)'

# 预期输出：
# CFBundleExecutable => haitang-admin
# CFBundleDisplayName => 海棠企业管理系统
# CFBundleName => haitang-admin
```

### ✓ 测试应用启动

```bash
open "dist/mac/Electron.app"
```

### ✓ 检查最终包文件

```bash
ls -lh dist/mac/*.{dmg,zip} 2>/dev/null
```

## 如果仍然失败

### 方案 B: 升级 electron-builder

```bash
pnpm add -D electron-builder@latest
rm -rf dist/mac node_modules/.cache/electron-builder
VITE_APP_ENV=electron pnpm run dist:mac
```

### 方案 C: 检查详细日志

```bash
# 启用详细日志
DEBUG=electron-builder VITE_APP_ENV=electron pnpm run dist:mac
```

## 关键配置验证

查看 package.json 中的 build.mac 配置：

```json
"mac": {
  "executableName": "haitang-admin",
  "icon": "assets/icon.icns",
  "target": ["dmg", "zip"],
  "category": "public.app-category.business",
  "extendInfo": {
    "CFBundleDisplayName": "海棠企业管理系统",
    "CFBundleName": "haitang-admin"
  }
}
```

## 预期结果

✅ 打包成功，无 ENOENT 错误
✅ 生成 dist/mac/Electron.app
✅ 生成 dist/mac/*.dmg 和 dist/mac/*.zip
✅ Finder 中应用显示为"海棠企业管理系统"
✅ 应用可以正常启动

---

**详细分析见：** macOS打包修复-完整分析.md

