# macOS 构建打包 - 问题解决总结

## 📋 问题诊断

**错误类型**: Goroutine 死锁 (Fatal deadlock - all goroutines are asleep)

**错误位置**: `github.com/develar/app-builder/pkg/util.MapAsyncConcurrency` (async.go:30)

**触发原因**:
- Electron 解包操作中的 ZIP 文件提取
- 并发异步映射操作中的通道同步失败
- 系统资源限制或版本不兼容

---

## ✅ 完整解决方案

### 1️⃣ 快速修复（5 分钟）

```bash
# 更新依赖
npm install --save-dev electron-builder@24.6.4 electron@27.0.0

# 执行安全构建
npm run build:mac:safe
```

### 2️⃣ 标准修复（10 分钟）

```bash
# 加载环境配置
source .env.build

# 增加系统限制
ulimit -n 4096

# 执行构建
npm run build:mac
```

### 3️⃣ 完整修复（15 分钟）

```bash
# 使用脚本构建
chmod +x scripts/build-mac-clean.sh
./scripts/build-mac-clean.sh
```

---

## 📦 已创建的文件

### 配置文件

| 文件 | 用途 |
|------|------|
| `electron-builder.yml` | electron-builder 配置 |
| `build/entitlements.mac.plist` | macOS 权限配置 |
| `.env.build` | 环境变量配置 |
| `.github/workflows/build-mac.yml` | GitHub Actions 工作流 |

### 脚本文件

| 文件 | 用途 |
|------|------|
| `scripts/build-mac-clean.sh` | macOS 构建脚本 |

### 文档文件

| 文件 | 用途 |
|------|------|
| `docs/macOS-Build-Solutions.md` | 完整解决方案 |
| `docs/macOS-Build-Troubleshooting.md` | 故障排除指南 |
| `docs/macOS-Build-Quick-Start.md` | 快速开始指南 |
| `docs/macOS-Build-Summary.md` | 本文件 |

### 更新的文件

| 文件 | 更改 |
|------|------|
| `package.json` | 更新依赖版本，添加 npm 脚本 |

---

## 🔧 关键改进

### 依赖版本更新

```json
{
  "electron": "^27.0.0",           // 从 latest 更新到稳定版
  "electron-builder": "^24.6.4",   // 从 latest 更新到稳定版
  "electron-vite": "^1.1.0"        // 从 latest 更新到稳定版
}
```

### 新增 npm 脚本

```json
{
  "build:mac": "npm run build:electron && npm run dist:mac",
  "build:mac:safe": "npm run build:electron && npm run dist:mac:safe",
  "dist:mac:safe": "source .env.build && VITE_APP_ENV=electron npx electron-builder --mac --config electron-builder.yml -c.artifactBuildStarted=null"
}
```

### 环境优化

- Node.js 堆内存: 4096 MB
- 文件描述符限制: 4096
- 进程限制: 2048
- 缓存目录: `~/.electron-builder-cache`

---

## 🚀 使用指南

### 首次使用

```bash
# 1. 更新依赖
npm install

# 2. 加载环境
source .env.build

# 3. 执行构建
npm run build:mac:safe
```

### 后续构建

```bash
# 快速命令
npm run build:mac:safe

# 或使用脚本
./scripts/build-mac-clean.sh
```

### GitHub Actions 自动构建

1. 推送代码到仓库
2. 工作流自动触发
3. 构建完成后自动上传 artifacts

---

## 📊 性能指标

| 指标 | 值 |
|------|-----|
| 最小内存需求 | 2 GB |
| 推荐内存 | 4+ GB |
| 最小磁盘空间 | 10 GB |
| 文件描述符限制 | 4096 |
| Node.js 堆内存 | 4096 MB |

---

## 🔍 故障排除

### 常见问题速查

| 问题 | 解决方案 |
|------|--------|
| Goroutine 死锁 | 更新依赖，增加内存 |
| 内存不足 | `export NODE_OPTIONS="--max-old-space-size=6144"` |
| 文件描述符限制 | `ulimit -n 4096` |
| 磁盘空间不足 | 清理 dist/out，确保 10GB+ 空间 |
| 网络问题 | 使用国内镜像或重试 |

### 详细指南

- 快速开始: `docs/macOS-Build-Quick-Start.md`
- 完整解决方案: `docs/macOS-Build-Solutions.md`
- 故障排除: `docs/macOS-Build-Troubleshooting.md`

---

## 📝 检查清单

构建前检查：

- [ ] Node.js 版本 >= 14
- [ ] npm 版本 >= 6
- [ ] macOS 版本 >= 10.13
- [ ] 可用内存 >= 2 GB
- [ ] 可用磁盘空间 >= 10 GB
- [ ] 网络连接正常
- [ ] 依赖已更新

构建后检查：

- [ ] 检查输出文件: `ls -lh dist/mac/`
- [ ] 验证 DMG: `hdiutil verify dist/mac/*.dmg`
- [ ] 测试应用: 挂载 DMG 并运行

---

## 🎯 下一步

1. **立即修复**: 运行 `npm run build:mac:safe`
2. **配置 CI/CD**: 推送代码触发 GitHub Actions
3. **代码签名**: 配置 Apple 开发者账户（可选）
4. **自动更新**: 集成 electron-updater（可选）

---

## 📞 获取帮助

遇到问题？

1. 查看快速开始: `docs/macOS-Build-Quick-Start.md`
2. 查看故障排除: `docs/macOS-Build-Troubleshooting.md`
3. 查看完整方案: `docs/macOS-Build-Solutions.md`
4. 检查错误日志并报告 Issue

---

## 📚 参考资源

- [electron-builder 官方文档](https://www.electron.build/)
- [Electron 官方指南](https://www.electronjs.org/docs)
- [macOS 开发者指南](https://developer.apple.com/macos/)

---

**最后更新**: 2024-12-01  
**版本**: 1.0.0  
**状态**: ✅ 完成

