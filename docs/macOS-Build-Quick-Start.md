# macOS 构建快速开始指南

## 快速修复（5 分钟）

### 步骤 1: 更新依赖

```bash
npm install --save-dev electron-builder@24.6.4 electron@27.0.0
```

### 步骤 2: 设置环境

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
ulimit -n 4096
```

### 步骤 3: 执行构建

```bash
npm run build:electron
npm run dist:mac
```

## 完整构建流程

### 方法 A: 使用构建脚本（推荐）

```bash
chmod +x scripts/build-mac.sh
./scripts/build-mac.sh
```

### 方法 B: 手动构建

```bash
# 1. 清理
rm -rf dist out node_modules/.cache

# 2. 安装
npm ci --prefer-offline --no-audit

# 3. 构建
npm run build:electron

# 4. 打包
VITE_APP_ENV=electron npm run dist:mac
```

## 常见错误速查

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| Goroutine deadlock | 版本过旧/资源不足 | 更新依赖，增加内存 |
| Out of memory | 堆内存不足 | `export NODE_OPTIONS="--max-old-space-size=6144"` |
| Cannot find app-builder | 依赖缺失 | `npm install --save-dev electron-builder@latest` |
| File descriptor limit | 系统限制 | `ulimit -n 4096` |
| Disk space error | 磁盘空间不足 | 清理 dist/out 目录，确保 10GB+ 空间 |

## 环境检查清单

- [ ] Node.js 版本 >= 14
- [ ] npm 版本 >= 6
- [ ] macOS 版本 >= 10.13
- [ ] 可用内存 >= 2GB
- [ ] 可用磁盘空间 >= 10GB
- [ ] 网络连接正常

## 文件位置

- **构建脚本**: `scripts/build-mac.sh`
- **配置文件**: `electron-builder.yml`
- **权限配置**: `build/entitlements.mac.plist`
- **GitHub Actions**: `.github/workflows/build-mac.yml`
- **完整指南**: `docs/macOS-Build-Troubleshooting.md`

## 输出文件

构建完成后，输出文件位置：

```
dist/mac/
├── haitang-admin-1.0.0.dmg      # DMG 安装程序
├── haitang-admin-1.0.0.zip      # ZIP 压缩包
└── haitang-admin-1.0.0.dmg.blockmap
```

## 验证构建

```bash
# 检查输出文件
ls -lh dist/mac/

# 验证 DMG 文件
hdiutil verify dist/mac/haitang-admin-1.0.0.dmg

# 挂载 DMG 查看内容
hdiutil attach dist/mac/haitang-admin-1.0.0.dmg
```

## 获取帮助

遇到问题？查看完整故障排除指南：

```bash
cat docs/macOS-Build-Troubleshooting.md
```

## 下一步

- [ ] 配置代码签名和公证（可选）
- [ ] 设置自动更新（可选）
- [ ] 配置 GitHub Actions 自动构建
- [ ] 测试构建的应用程序

