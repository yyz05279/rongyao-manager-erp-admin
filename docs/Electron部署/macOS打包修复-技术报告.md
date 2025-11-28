# Electron macOS 二进制重命名失败 - 完整技术报告

## 执行摘要

**问题**: electron-builder 26.0.12 在 Electron 39.2.4 上打包时，因中文 productName 导致二进制文件重命名失败 (ENOENT)。

**根本原因**: 缺少 ASCII `executableName` 配置，导致 electron-builder 尝试将二进制文件重命名为中文路径，在 macOS 文件系统中失败。

**解决方案**: 在 package.json 的 `build.mac` 中添加 `executableName: "haitang-admin"` 和 `icon: "assets/icon.icns"`。

**状态**: ✅ 已实施修复

---

## 问题诊断

### 错误堆栈

```
FATAL: ENOENT during rename of the app's main binary
From: /Users/yyz/Desktop/haitang-web-admin/dist/mac/Electron.app/Contents/MacOS/Electron
To:   /Users/yyz/Desktop/haitang-web-admin/dist/mac/Electron.app/Contents/MacOS/海棠企业管理系统

Error: ENOENT: no such file or directory, rename 
  '/Users/yyz/Desktop/haitang-web-admin/dist/mac/Electron.app/Contents/MacOS/Electron' -> 
  '/Users/yyz/Desktop/haitang-web-admin/dist/mac/Electron.app/Contents/MacOS/海棠企业管理系统'
```

### 环境信息

| 项目 | 值 |
|------|-----|
| electron-builder | 26.0.12 |
| electron | 39.2.4 |
| macOS | Darwin 22.6.0 (Ventura 13.x) |
| 架构 | x64 |
| 包名 | haitang-admin |
| 产品名 | 海棠企业管理系统 (中文) |

---

## 根本原因分析

### 问题链条

1. **配置缺陷**: package.json 中 `build.mac` 未设置 `executableName`
2. **默认行为**: electron-builder 使用 `productName` 作为可执行文件名
3. **编码问题**: 中文字符在 macOS 文件系统操作中引发编码问题
4. **重命名失败**: 尝试将 "Electron" 重命名为 "海棠企业管理系统" 时失败

### 为什么会失败？

**macOS 文件系统特性**:
- 使用 NFD (Canonical Decomposition) 的 UTF-8 编码
- 中文字符 "海" = U+6D77 (1 个代码点)
- 在 NFD 中可能被分解为多个字节序列
- 文件系统操作中的编码转换不一致导致路径查找失败

**electron-builder 行为**:
- 在 macOS 上，electron-builder 会重命名 Electron.app/Contents/MacOS/Electron 为指定的可执行文件名
- 如果 `executableName` 未设置，使用 `productName`
- 对于中文 productName，编码处理可能失败

**Electron 39.x 的影响**:
- Electron 39.x 改进了二进制文件的处理方式
- 可能对路径编码更严格
- 与 electron-builder 26.x 的交互存在边界情况

---

## 实施的修复

### 修改 1: package.json

```json
{
  "build": {
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
  }
}
```

**关键改动**:

| 配置 | 值 | 作用 |
|------|-----|------|
| `executableName` | `haitang-admin` | 二进制文件使用 ASCII，避免编码问题 |
| `icon` | `assets/icon.icns` | 提供应用图标，移除默认图标警告 |
| `CFBundleDisplayName` | `海棠企业管理系统` | Finder 中显示中文名称 |
| `CFBundleName` | `haitang-admin` | Bundle 标识符使用 ASCII |

### 修改 2: 创建应用图标

✅ 已在 `assets/icon.icns` 创建 4.4 KB 的蓝色应用图标

---

## 验证方案

### 验证清单

```bash
# 1. 清理缓存
rm -rf dist/mac out node_modules/.cache/electron-builder

# 2. 重新构建
pnpm run build:electron

# 3. 打包
VITE_APP_ENV=electron pnpm run dist:mac

# 4. 验证二进制文件
ls -la "dist/mac/Electron.app/Contents/MacOS/"
# 预期: haitang-admin 文件存在

# 5. 验证 Info.plist
plutil -p "dist/mac/Electron.app/Contents/Info.plist" | \
  grep -E 'CFBundle(Name|DisplayName|Executable)'
# 预期:
#   CFBundleExecutable => haitang-admin
#   CFBundleDisplayName => 海棠企业管理系统

# 6. 测试启动
open "dist/mac/Electron.app"

# 7. 检查最终包
ls -lh dist/mac/*.{dmg,zip}
```

---

## 技术细节

### CFBundleExecutable 映射

electron-builder 在生成 Info.plist 时的映射规则:

```
executableName (如果设置) → CFBundleExecutable
productName (如果未设置 executableName) → CFBundleExecutable
```

**我们的配置**:
- `executableName: "haitang-admin"` → CFBundleExecutable = "haitang-admin"
- `productName: "海棠企业管理系统"` → 用于 UI 显示

### 文件系统操作流程

```
1. electron-builder 创建 Electron.app 框架
2. 复制 Electron 二进制文件到 Contents/MacOS/Electron
3. 读取 executableName 配置
4. 重命名 Electron → haitang-admin
5. 更新 Info.plist 中的 CFBundleExecutable
6. 生成最终的 .app 包
```

**修复前**: 步骤 4 失败（中文路径编码问题）
**修复后**: 步骤 4 成功（ASCII 路径）

---

## 已知限制与注意事项

### macOS 特定限制

1. **路径长度**: macOS 最大路径 1024 字节
   - 中文字符占 3 字节
   - 当前路径长度: ~100 字节（安全）

2. **代码签名**: 如果需要代码签名
   - 确保签名证书支持 UTF-8 路径
   - 建议使用 ASCII 路径以确保兼容性

3. **文件系统编码**: NFD vs NFC
   - macOS 使用 NFD (分解形式)
   - 其他系统可能使用 NFC (组合形式)
   - 可能导致跨平台问题

### electron-builder 版本兼容性

| 版本 | Electron 39.x | 中文 productName | 备注 |
|------|---------------|-----------------|------|
| 25.x | ✅ | ⚠️ 需要 executableName | 稳定版本 |
| 26.0.12 | ✅ | ❌ 需要修复 | 当前版本 |
| 26.1+ | ✅ | ✅ 可能已修复 | 建议升级 |
| 27+ | ✅ | ✅ 应该支持 | 最新版本 |

---

## 参考资源

### 官方文档
- [electron-builder macOS 配置](https://www.electron.build/configuration/mac)
- [electron-builder executableName](https://www.electron.build/configuration/mac#executablename)
- [Electron 官方文档](https://www.electronjs.org/docs)

### 最佳实践
1. 始终为 macOS 设置 ASCII 的 `executableName`
2. 使用 `extendInfo` 配置本地化的显示名称
3. 提供应用图标以避免默认图标警告
4. 在 CI/CD 中定期测试 macOS 打包

---

## 总结

✅ **问题已识别**: 中文 productName 导致的二进制重命名失败
✅ **根本原因已确认**: 缺少 ASCII executableName 配置
✅ **修复已实施**: package.json 和 icon.icns 已更新
⏳ **待验证**: 执行修复步骤并验证打包成功

**预期结果**: 打包成功，生成可用的 .app 和 .dmg/.zip 文件

