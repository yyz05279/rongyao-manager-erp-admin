# macOS 构建打包故障排除指南

## 问题描述

在执行 macOS 打包构建时，出现 goroutine 死锁错误：

```
Fatal error: all goroutines are asleep - deadlock!
goroutine 1 [chan receive]:
github.com/develar/app-builder/pkg/util.MapAsyncConcurrency
  async.go:30 +0x1c0
```

## 根本原因

该问题由 `app-builder` 工具中的并发 bug 引起，通常在以下情况下触发：

1. **版本过旧**: electron-builder 版本过旧，包含已知的并发问题
2. **资源不足**: 系统内存、磁盘空间或文件描述符限制
3. **网络问题**: Electron 二进制文件下载不完整
4. **并发冲突**: ZIP 文件提取过程中的通道同步失败

## 解决方案

### 方案 1: 更新依赖版本（推荐）

```bash
# 更新 electron-builder 到最新版本
npm install --save-dev electron-builder@latest

# 更新 electron 到稳定版本
npm install --save-dev electron@27.0.0

# 更新 electron-vite
npm install --save-dev electron-vite@latest

# 清理缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 方案 2: 配置环境变量

在构建前设置以下环境变量：

```bash
# 增加 Node.js 堆内存
export NODE_OPTIONS="--max-old-space-size=4096"

# 允许未解析的依赖
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

# 设置缓存目录
export ELECTRON_BUILDER_CACHE_DIR="$HOME/.electron-builder-cache"

# 增加文件描述符限制
ulimit -n 4096
ulimit -u 2048
```

### 方案 3: 使用提供的构建脚本

```bash
# 赋予脚本执行权限
chmod +x scripts/build-mac.sh

# 执行构建脚本
./scripts/build-mac.sh
```

### 方案 4: 手动执行构建

```bash
# 1. 清理旧文件
rm -rf dist out node_modules/.cache

# 2. 安装依赖
npm ci --prefer-offline --no-audit

# 3. 构建 Electron 应用
npm run build:electron

# 4. 执行 macOS 打包
VITE_APP_ENV=electron npx electron-builder \
  --mac \
  --publish=never \
  --config electron-builder.yml \
  -c.artifactBuildStarted=null \
  -c.mac.asarUnpack="**/*.node"
```

## 系统资源检查

### 检查可用内存

```bash
# macOS
vm_stat | grep "Pages free"

# 需要至少 2GB 可用内存
```

### 检查磁盘空间

```bash
# 需要至少 10GB 可用空间
df -h .
```

### 检查文件描述符

```bash
# 查看当前限制
ulimit -n

# 增加限制到 4096
ulimit -n 4096
```

## GitHub Actions 配置

已提供 `.github/workflows/build-mac.yml` 工作流文件，包含：

- 自动资源检查
- 环境变量配置
- 依赖安装优化
- 构建失败通知

### 使用 GitHub Actions

1. 将工作流文件推送到仓库
2. 在 GitHub 上创建标签或推送到 main/develop 分支
3. 自动触发 macOS 构建

## 常见问题

### Q1: 构建仍然失败，显示 "out of memory"

**解决方案**:
```bash
# 增加堆内存
export NODE_OPTIONS="--max-old-space-size=6144"

# 或者在 package.json 中配置
"build:electron": "NODE_OPTIONS=--max-old-space-size=6144 electron-vite build"
```

### Q2: 错误 "Cannot find module 'app-builder'"

**解决方案**:
```bash
# 重新安装 electron-builder
npm install --save-dev electron-builder@latest

# 清理缓存
rm -rf ~/.electron-builder-cache
```

### Q3: 构建超时

**解决方案**:
```bash
# 增加超时时间
VITE_APP_ENV=electron npx electron-builder \
  --mac \
  --publish=never \
  -c.electronDownload.cache=$HOME/.electron-builder-cache \
  -c.electronDownload.mirror=https://github.com/electron/electron/releases/download/
```

### Q4: 签名和公证失败

**解决方案**:
```bash
# 禁用 Gatekeeper 评估（仅用于开发）
VITE_APP_ENV=electron npx electron-builder \
  --mac \
  -c.mac.gatekeeperAssess=false
```

## 性能优化建议

1. **使用 npm ci 替代 npm install**
   ```bash
   npm ci --prefer-offline --no-audit
   ```

2. **启用 npm 缓存**
   ```bash
   npm config set cache ~/.npm
   npm ci --prefer-offline
   ```

3. **并行构建**
   ```bash
   npm run build:electron & npm run build:prod &
   wait
   ```

4. **清理不必要的依赖**
   ```bash
   npm prune --production
   ```

## 调试技巧

### 启用详细日志

```bash
DEBUG=electron-builder VITE_APP_ENV=electron npx electron-builder --mac
```

### 检查 app-builder 版本

```bash
npm list app-builder
```

### 验证构建配置

```bash
npx electron-builder --help
```

## 参考资源

- [electron-builder 文档](https://www.electron.build/)
- [app-builder GitHub](https://github.com/develar/app-builder)
- [Electron 官方文档](https://www.electronjs.org/docs)
- [macOS 代码签名指南](https://developer.apple.com/support/code-signing/)

## 获取帮助

如果问题仍未解决，请：

1. 收集完整的构建日志
2. 检查系统资源使用情况
3. 在 GitHub Issues 中报告问题
4. 提供以下信息：
   - macOS 版本
   - Node.js 版本
   - npm 版本
   - electron-builder 版本
   - 完整的错误堆栈跟踪

