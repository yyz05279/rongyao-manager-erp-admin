# macOS 构建打包 - 完整解决方案

## 问题概述

**错误信息**:
```
Fatal error: all goroutines are asleep - deadlock!
goroutine 1 [chan receive]:
github.com/develar/app-builder/pkg/util.MapAsyncConcurrency
  async.go:30 +0x1c0
```

**根本原因**: app-builder 中的 goroutine 通道同步失败，通常由以下因素触发：
- electron-builder 版本过旧
- 系统资源不足
- 并发操作冲突

---

## 解决方案总览

### 方案 1: 快速修复（推荐首选）

```bash
# 1. 更新依赖到最新稳定版本
npm install --save-dev electron-builder@24.6.4 electron@27.0.0

# 2. 清理缓存
rm -rf node_modules package-lock.json
npm install

# 3. 执行构建
npm run build:mac:safe
```

### 方案 2: 使用安全构建脚本

```bash
chmod +x scripts/build-mac.sh
./scripts/build-mac.sh
```

### 方案 3: 手动配置构建

```bash
# 加载环境配置
source .env.build

# 增加系统限制
ulimit -n 4096
ulimit -u 2048

# 执行构建
npm run build:mac
```

---

## 详细实施步骤

### 步骤 1: 环境准备

```bash
# 检查 Node.js 版本（需要 >= 14）
node --version

# 检查 npm 版本（需要 >= 6）
npm --version

# 检查 macOS 版本
sw_vers

# 检查可用资源
echo "可用内存:"
vm_stat | grep "Pages free"
echo "可用磁盘空间:"
df -h .
```

### 步骤 2: 依赖更新

```bash
# 更新 package.json 中的依赖版本
npm install --save-dev \
  electron@27.0.0 \
  electron-builder@24.6.4 \
  electron-vite@1.1.0

# 清理旧的 node_modules
rm -rf node_modules package-lock.json

# 重新安装依赖
npm ci --prefer-offline --no-audit
```

### 步骤 3: 构建配置

已为您创建以下配置文件：

1. **electron-builder.yml** - 构建配置
   - macOS 特定优化
   - 权限配置
   - 打包选项

2. **build/entitlements.mac.plist** - macOS 权限
   - JIT 编译支持
   - 文件访问权限
   - 网络权限

3. **.env.build** - 环境变量
   - 内存配置
   - 系统限制
   - 缓存设置

### 步骤 4: 执行构建

#### 方式 A: 使用 npm 脚本（推荐）

```bash
# 安全构建模式（包含所有优化）
npm run build:mac:safe

# 或者标准构建模式
npm run build:mac
```

#### 方式 B: 使用构建脚本

```bash
chmod +x scripts/build-mac.sh
./scripts/build-mac.sh
```

#### 方式 C: 手动执行

```bash
# 加载环境配置
source .env.build

# 增加系统限制
ulimit -n 4096

# 清理旧文件
rm -rf dist out node_modules/.cache

# 安装依赖
npm ci --prefer-offline --no-audit

# 构建应用
npm run build:electron

# 打包 macOS
VITE_APP_ENV=electron npx electron-builder \
  --mac \
  --publish=never \
  --config electron-builder.yml \
  -c.artifactBuildStarted=null \
  -c.mac.asarUnpack="**/*.node"
```

---

## 性能优化

### 内存优化

```bash
# 增加 Node.js 堆内存
export NODE_OPTIONS="--max-old-space-size=6144"

# 在 package.json 中持久化配置
"build:electron": "NODE_OPTIONS=--max-old-space-size=4096 electron-vite build"
```

### 系统限制优化

```bash
# 增加文件描述符
ulimit -n 4096

# 增加进程限制
ulimit -u 2048

# 查看当前限制
ulimit -a
```

### 缓存优化

```bash
# 启用 npm 离线模式
npm ci --prefer-offline --no-audit

# 清理缓存
npm cache clean --force
rm -rf ~/.electron-builder-cache
```

---

## GitHub Actions 自动构建

已提供 `.github/workflows/build-mac.yml` 工作流文件。

### 使用步骤

1. 推送代码到仓库
2. 工作流自动触发
3. 构建完成后自动上传 artifacts

### 工作流特性

- ✅ 自动资源检查
- ✅ 环境变量配置
- ✅ 依赖优化安装
- ✅ 构建失败通知
- ✅ Artifacts 上传
- ✅ Release 发布

---

## 故障排除

### 问题 1: 仍然出现 Goroutine 死锁

**症状**: 构建过程中卡住，最终报 deadlock 错误

**解决方案**:
```bash
# 1. 检查 app-builder 版本
npm list app-builder

# 2. 强制更新 electron-builder
npm install --save-dev electron-builder@latest --force

# 3. 清理所有缓存
rm -rf node_modules package-lock.json ~/.electron-builder-cache
npm install

# 4. 增加超时时间和内存
export NODE_OPTIONS="--max-old-space-size=6144"
npm run build:mac:safe
```

### 问题 2: 内存不足错误

**症状**: `JavaScript heap out of memory` 或 `ENOMEM`

**解决方案**:
```bash
# 增加堆内存
export NODE_OPTIONS="--max-old-space-size=8192"

# 或在 package.json 中配置
"build:electron": "NODE_OPTIONS=--max-old-space-size=8192 electron-vite build"

# 关闭其他应用释放内存
# 检查可用内存
vm_stat | grep "Pages free"
```

### 问题 3: 磁盘空间不足

**症状**: `No space left on device` 或 `ENOSPC`

**解决方案**:
```bash
# 清理不必要的文件
rm -rf dist out node_modules/.cache
rm -rf ~/.electron-builder-cache

# 检查磁盘空间
df -h .

# 需要至少 10GB 可用空间
```

### 问题 4: 网络连接问题

**症状**: `Cannot download Electron` 或 `Network timeout`

**解决方案**:
```bash
# 使用国内镜像（如果在中国）
npm config set registry https://registry.npmmirror.com
npm config set electron_mirror https://npmmirror.com/mirrors/electron/

# 或使用官方镜像
npm config set electron_mirror https://github.com/electron/electron/releases/download/

# 重试构建
npm run build:mac:safe
```

### 问题 5: 文件描述符限制

**症状**: `EMFILE: too many open files`

**解决方案**:
```bash
# 增加文件描述符限制
ulimit -n 4096

# 验证设置
ulimit -n

# 永久设置（编辑 ~/.zshrc 或 ~/.bash_profile）
echo "ulimit -n 4096" >> ~/.zshrc
source ~/.zshrc
```

---

## 验证构建结果

```bash
# 检查输出文件
ls -lh dist/mac/

# 验证 DMG 文件
hdiutil verify dist/mac/haitang-admin-*.dmg

# 挂载 DMG 查看内容
hdiutil attach dist/mac/haitang-admin-*.dmg

# 检查应用签名（如果已签名）
codesign -v dist/mac/haitang-admin-*.dmg
```

---

## 高级配置

### 代码签名和公证

如需为应用签名和公证，需要 Apple 开发者账户：

```bash
# 设置环境变量
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
export APPLE_ID=your_apple_id
export APPLE_ID_PASSWORD=your_app_specific_password
export APPLE_TEAM_ID=your_team_id

# 执行构建（自动签名和公证）
npm run build:mac
```

### 自定义构建选项

在 `electron-builder.yml` 中修改 macOS 配置：

```yaml
mac:
  executableName: haitang-admin
  icon: assets/icon.icns
  target: [dmg, zip]
  category: public.app-category.business
  # 添加自定义选项
  extendInfo:
    CFBundleDisplayName: 海棠企业管理系统
    CFBundleName: haitang-admin
```

---

## 参考资源

- [electron-builder 官方文档](https://www.electron.build/)
- [Electron 官方指南](https://www.electronjs.org/docs)
- [macOS 代码签名指南](https://developer.apple.com/support/code-signing/)
- [app-builder GitHub](https://github.com/develar/app-builder)

---

## 快速参考

| 任务 | 命令 |
|------|------|
| 快速修复 | `npm run build:mac:safe` |
| 标准构建 | `npm run build:mac` |
| 脚本构建 | `./scripts/build-mac.sh` |
| 清理缓存 | `rm -rf dist out node_modules/.cache ~/.electron-builder-cache` |
| 检查资源 | `vm_stat \| grep "Pages free" && df -h .` |
| 增加限制 | `ulimit -n 4096 && ulimit -u 2048` |
| 加载环境 | `source .env.build` |
| 验证输出 | `ls -lh dist/mac/` |

---

## 获取帮助

遇到问题？按以下步骤操作：

1. 查看 `docs/macOS-Build-Quick-Start.md` 快速开始
2. 查看 `docs/macOS-Build-Troubleshooting.md` 故障排除
3. 检查完整的错误日志
4. 在 GitHub Issues 中报告问题

---

**最后更新**: 2024-12-01
**版本**: 1.0.0

