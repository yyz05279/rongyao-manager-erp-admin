# macOS 打包修复 - 快速参考卡

## 问题
```
FATAL: ENOENT during rename of the app's main binary
From: .../Electron.app/Contents/MacOS/Electron
To:   .../Electron.app/Contents/MacOS/海棠企业管理系统
```

## 根本原因
中文 productName 导致二进制文件重命名失败（编码问题）

## 解决方案已实施 ✅

### 1. package.json 已更新
```json
"mac": {
  "executableName": "haitang-admin",      // ← 新增：ASCII 二进制名
  "icon": "assets/icon.icns",             // ← 新增：应用图标
  "target": ["dmg", "zip"],
  "category": "public.app-category.business",
  "extendInfo": {                         // ← 新增：中文显示名
    "CFBundleDisplayName": "海棠企业管理系统",
    "CFBundleName": "haitang-admin"
  }
}
```

### 2. 应用图标已创建
✅ `assets/icon.icns` (4.4 KB)

## 立即执行

```bash
# 1. 清理缓存
rm -rf dist/mac out node_modules/.cache/electron-builder

# 2. 重新构建
pnpm run build:electron

# 3. 打包
VITE_APP_ENV=electron pnpm run dist:mac
```

## 验证

```bash
# 检查二进制文件
ls -la "dist/mac/Electron.app/Contents/MacOS/"
# 应该看到: haitang-admin

# 验证 Info.plist
plutil -p "dist/mac/Electron.app/Contents/Info.plist" | \
  grep -E 'CFBundle(Name|DisplayName|Executable)'
# 应该看到:
#   CFBundleExecutable => haitang-admin
#   CFBundleDisplayName => 海棠企业管理系统

# 测试启动
open "dist/mac/Electron.app"
```

## 如果仍然失败

```bash
# 升级 electron-builder
pnpm add -D electron-builder@latest

# 重试
rm -rf dist/mac node_modules/.cache/electron-builder
VITE_APP_ENV=electron pnpm run dist:mac

# 查看详细日志
DEBUG=electron-builder VITE_APP_ENV=electron pnpm run dist:mac
```

## 关键点

| 项 | 值 | 说明 |
|----|-----|------|
| 二进制名 | haitang-admin | ASCII，避免编码问题 |
| 显示名 | 海棠企业管理系统 | 中文，用于 Finder |
| 图标 | assets/icon.icns | 已创建 |
| 打包目标 | dmg, zip | 不变 |

## 文件检查清单

- [x] package.json - build.mac 已更新
- [x] assets/icon.icns - 已创建
- [ ] 清理缓存 - 待执行
- [ ] 重新构建 - 待执行
- [ ] 打包验证 - 待执行

---

**详细文档**: 
- macOS打包修复-完整分析.md (完整分析)
- macOS打包修复-技术报告.md (技术报告)
- macOS打包修复-执行步骤.md (详细步骤)

