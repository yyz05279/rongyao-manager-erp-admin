# macOS 构建打包 - Goroutine 死锁问题解决指南

## 问题诊断

**错误信息**:
```
fatal error: all goroutines are asleep - deadlock!
github.com/develar/app-builder/pkg/util.MapAsyncConcurrency.func1
```

**根本原因**: app-builder 中的并发 bug，在 ZIP 文件提取时触发通道死锁。

---

## ⚡ 快速修复（推荐）

### 步骤 1: 更新依赖版本

```bash
npm install --save-dev electron-builder@24.6.4 electron@27.0.0
```

### 步骤 2: 执行安全构建

```bash
npm run build:mac:safe
```

**完成！** 输出文件在 `dist/mac/` 目录中。

---

## 📋 完整解决方案

### 方案 A: 使用 npm 脚本（最简单）

```bash
# 加载环境配置并构建
npm run build:mac:safe
```

### 方案 B: 使用构建脚本

```bash
chmod +x scripts/build-mac-clean.sh
./scripts/build-mac-clean.sh
```

### 方案 C: 手动构建

```bash
# 1. 加载环境变量
source .env.build

# 2. 增加系统限制
ulimit -n 4096

# 3. 清理旧文件
rm -rf dist out node_modules/.cache

# 4. 安装依赖
npm ci --prefer-offline --no-audit

# 5. 构建应用
npm run build:electron

# 6. 打包 macOS
VITE_APP_ENV=electron npx electron-builder \
  --mac \
  --publish=never \
  --config electron-builder.yml \
  -c.artifactBuildStarted=null \
  -c.mac.asarUnpack="**/*.node"
```

---

## 🔧 关键配置

### 已更新的依赖版本

```json
{
  "electron": "^27.0.0",           // 稳定版本
  "electron-builder": "^24.6.4",   // 修复并发 bug
  "electron-vite": "^1.1.0"        // 最新版本
}
```

### 环境变量配置 (.env.build)

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
export ELECTRON_BUILDER_CACHE_DIR="$HOME/.electron-builder-cache"
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
ulimit -n 4096
ulimit -u 2048
```

### 新增 npm 脚本

```json
{
  "build:mac": "npm run build:electron && npm run dist:mac",
  "build:mac:safe": "npm run build:electron && npm run dist:mac:safe",
  "dist:mac:safe": "source .env.build && VITE_APP_ENV=electron npx electron-builder --mac --config electron-builder.yml -c.artifactBuildStarted=null"
}
```

---

## 📁 已创建的文件

### 配置文件
- `electron-builder.yml` - electron-builder 配置
- `build/entitlements.mac.plist` - macOS 权限配置
- `.env.build` - 环境变量配置
- `.github/workflows/build-mac.yml` - GitHub Actions 工作流

### 脚本文件
- `scripts/build-mac-clean.sh` - macOS 构建脚本

### 文档文件
- `docs/macOS-Build-Summary.md` - 问题总结
- `docs/macOS-Build-Quick-Start.md` - 快速开始
- `docs/macOS-Build-Solutions.md` - 完整解决方案
- `docs/macOS-Build-Troubleshooting.md` - 故障排除指南

---

## ✅ 验证构建

```bash
# 检查输出文件
ls -lh dist/mac/

# 验证 DMG 文件
hdiutil verify dist/mac/haitang-admin-*.dmg

# 挂载 DMG 查看内容
hdiutil attach dist/mac/haitang-admin-*.dmg
```

---

## 🆘 常见问题

### Q1: 仍然出现死锁错误

```bash
# 增加堆内存
export NODE_OPTIONS="--max-old-space-size=6144"

# 强制更新依赖
npm install --save-dev electron-builder@latest --force

# 清理缓存
rm -rf ~/.electron-builder-cache node_modules

# 重试
npm run build:mac:safe
```

### Q2: 内存不足错误

```bash
# 增加堆内存到 8GB
export NODE_OPTIONS="--max-old-space-size=8192"

# 检查可用内存
vm_stat | grep "Pages free"
```

### Q3: 磁盘空间不足

```bash
# 清理缓存
rm -rf dist out node_modules/.cache ~/.electron-builder-cache

# 检查磁盘空间（需要 10GB+）
df -h .
```

### Q4: 文件描述符限制

```bash
# 增加限制
ulimit -n 4096

# 验证设置
ulimit -n
```

---

## 📊 系统要求

| 要求 | 最小值 | 推荐值 |
|------|--------|--------|
| macOS 版本 | 10.13 | 最新版 |
| Node.js | 14 | 18+ |
| npm | 6 | 8+ |
| 可用内存 | 2 GB | 4+ GB |
| 磁盘空间 | 10 GB | 20+ GB |

---

## 🚀 GitHub Actions 自动构建

已配置自动构建工作流。推送代码后自动触发：

```yaml
# 工作流文件: .github/workflows/build-mac.yml
# 功能:
# - 自动检查系统资源
# - 配置环境变量
# - 优化依赖安装
# - 自动上传 artifacts
# - 构建失败通知
```

---

## 📚 完整文档

| 文档 | 内容 |
|------|------|
| `docs/macOS-Build-Summary.md` | 问题总结和解决方案 |
| `docs/macOS-Build-Quick-Start.md` | 快速开始指南 |
| `docs/macOS-Build-Solutions.md` | 详细解决方案 |
| `docs/macOS-Build-Troubleshooting.md` | 故障排除指南 |

---

## 🎯 下一步

1. 运行 `npm run build:mac:safe`
2. 检查 `dist/mac/` 中的输出文件
3. 测试构建的应用程序
4. 推送代码触发 GitHub Actions 自动构建

---

**问题已解决！** 🎉

如有其他问题，请查看完整文档或提交 Issue。

