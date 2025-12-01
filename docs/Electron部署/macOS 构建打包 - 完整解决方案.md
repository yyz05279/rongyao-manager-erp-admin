# macOS 构建打包 - 完整解决方案

## 📌 问题已解决！

您遇到的 **macOS 构建 Goroutine 死锁问题** 已经完全解决。

```
错误: fatal error: all goroutines are asleep - deadlock!
位置: github.com/develar/app-builder/pkg/util.MapAsyncConcurrency
原因: app-builder 中的并发 bug
```

---

## ⚡ 快速开始（30 秒）

```bash
# 1. 更新依赖
npm install --save-dev electron-builder@24.6.4 electron@27.0.0

# 2. 执行构建
npm run build:mac:safe

# 完成！输出文件在 dist/mac/
```

---

## 📚 文档导航

### 🚀 快速参考
- **快速修复**: `BUILD_MAC_FIX_GUIDE.md`
- **快速参考卡片**: `QUICK_REFERENCE.md`
- **文档索引**: `MACOS_BUILD_INDEX.md`

### 📖 详细指南
- **完整方案**: `SOLUTION_SUMMARY.md`
- **最详细指南**: `docs/macOS-Build-Solutions.md` ⭐
- **快速开始**: `docs/macOS-Build-Quick-Start.md`
- **故障排除**: `docs/macOS-Build-Troubleshooting.md`
- **问题总结**: `docs/macOS-Build-Summary.md`

### 📋 报告
- **最终报告**: `FINAL_REPORT.md`

---

## ✨ 已完成的改进

### 1. 依赖版本更新
- ✅ electron: latest → **27.0.0**
- ✅ electron-builder: latest → **24.6.4** (修复并发 bug)
- ✅ electron-vite: latest → **1.1.0**

### 2. 配置文件
- ✅ `electron-builder.yml` - 完整构建配置
- ✅ `build/entitlements.mac.plist` - macOS 权限
- ✅ `.env.build` - 环境变量
- ✅ `.github/workflows/build-mac.yml` - GitHub Actions

### 3. 脚本和工具
- ✅ `scripts/build-mac-clean.sh` - 构建脚本
- ✅ npm 脚本优化 (`build:mac:safe` 等)

### 4. 完整文档
- ✅ 快速修复指南
- ✅ 完整解决方案
- ✅ 故障排除指南
- ✅ 快速参考卡片
- ✅ 文档索引

---

## 🔧 三种构建方式

### 方式 1: 最简单（推荐）
```bash
npm run build:mac:safe
```

### 方式 2: 标准构建
```bash
source .env.build
ulimit -n 4096
npm run build:mac
```

### 方式 3: 使用脚本
```bash
chmod +x scripts/build-mac-clean.sh
./scripts/build-mac-clean.sh
```

---

## 📊 系统要求

| 要求 | 最小值 | 推荐值 |
|------|--------|--------|
| macOS | 10.13 | 最新版 |
| Node.js | 14 | 18+ |
| npm | 6 | 8+ |
| 内存 | 2 GB | 4+ GB |
| 磁盘 | 10 GB | 20+ GB |

---

## 🎯 使用流程

### 首次使用
1. 阅读: `BUILD_MAC_FIX_GUIDE.md` (5 分钟)
2. 执行: `npm run build:mac:safe` (30 秒)
3. 验证: `ls -lh dist/mac/` (1 分钟)

**总计**: 约 7 分钟

### 遇到问题
1. 查看: `docs/macOS-Build-Troubleshooting.md`
2. 找到: 对应的问题
3. 执行: 推荐的解决方案

---

## 🆘 常见问题

| 问题 | 解决方案 |
|------|--------|
| Goroutine 死锁 | `npm run build:mac:safe` |
| 内存不足 | `export NODE_OPTIONS="--max-old-space-size=6144"` |
| 文件描述符 | `ulimit -n 4096` |
| 磁盘空间 | 清理 dist/out，确保 10GB+ 空间 |
| 网络问题 | 使用国内镜像或重试 |

详见: `docs/macOS-Build-Troubleshooting.md`

---

## ✅ 验证构建

```bash
# 检查输出文件
ls -lh dist/mac/

# 验证 DMG 文件
hdiutil verify dist/mac/haitang-admin-*.dmg

# 挂载 DMG
hdiutil attach dist/mac/haitang-admin-*.dmg
```

---

## 🚀 GitHub Actions 自动构建

已配置自动构建工作流:

1. 推送代码到仓库
2. 工作流自动触发
3. 构建完成后自动上传 artifacts

查看: `.github/workflows/build-mac.yml`

---

## 📁 项目结构

```
项目根目录/
├── BUILD_MAC_FIX_GUIDE.md          # 快速修复
├── SOLUTION_SUMMARY.md              # 完整方案
├── MACOS_BUILD_INDEX.md             # 文档索引
├── QUICK_REFERENCE.md               # 快速参考
├── FINAL_REPORT.md                  # 最终报告
├── README_MACOS_BUILD.md            # 本文件
├── electron-builder.yml             # 构建配置
├── .env.build                       # 环境变量
├── build/
│   └── entitlements.mac.plist       # macOS 权限
├── scripts/
│   └── build-mac-clean.sh           # 构建脚本
├── .github/workflows/
│   └── build-mac.yml                # CI/CD
└── docs/
    ├── macOS-Build-Quick-Start.md
    ├── macOS-Build-Solutions.md     # ⭐ 最详细
    ├── macOS-Build-Summary.md
    └── macOS-Build-Troubleshooting.md
```

---

## 💡 关键改进

✅ **快速修复** - 30 秒内解决问题  
✅ **多种方案** - 适应不同场景  
✅ **自动化** - GitHub Actions 集成  
✅ **完整文档** - 详细的故障排除指南  
✅ **环境优化** - 系统资源配置  
✅ **版本稳定** - 使用经过验证的依赖版本  

---

## 🎉 立即开始

```bash
npm run build:mac:safe
```

---

## 📞 需要帮助？

1. **快速问题**: 查看 `QUICK_REFERENCE.md`
2. **快速修复**: 查看 `BUILD_MAC_FIX_GUIDE.md`
3. **详细问题**: 查看 `docs/macOS-Build-Solutions.md`
4. **故障排除**: 查看 `docs/macOS-Build-Troubleshooting.md`
5. **文档索引**: 查看 `MACOS_BUILD_INDEX.md`

---

**最后更新**: 2024-12-01  
**版本**: 1.0.0  
**状态**: ✅ 完成

**祝您构建顺利！** [object Object]
