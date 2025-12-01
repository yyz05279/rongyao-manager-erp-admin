# Windows 构建快速开始指南

## 🚀 快速开始（3步）

### 1️⃣ 清理环境
```bash
rm -rf node_modules dist out package-lock.json
```

### 2️⃣ 安装依赖
```bash
npm ci --prefer-offline --no-audit
```

### 3️⃣ 构建应用
```bash
npm run build:prod && npm run dist:win
```

## ✅ 验证构建

### 检查输出
```bash
# 检查是否包含文档文件
find dist -name "*.md" -type f
# 应该返回空

# 检查可执行文件
find dist -name "Haitang*.exe" -o -name "Haitang*.msi"
# 应该返回文件列表

# 运行验证脚本
scripts\verify-build.bat
```

## 📦 构建输出

成功的构建应该生成：
- ✅ `Haitang-*.exe` - 安装程序
- ✅ `Haitang-*-portable.exe` - 便携版
- ✅ `checksums-windows.txt` - 校验和文件

## 🔍 常见问题

| 问题 | 解决方案 |
|------|--------|
| npm 安装失败 | `npm cache clean --force && npm install` |
| 构建失败 | 检查Node.js版本 `node --version`（需要18.x+） |
| 包含文档文件 | 检查 electron-builder.yml 的排除规则 |
| 找不到可执行文件 | 检查Electron构建日志 |

## 📚 详细文档

- [PIPELINE_FIX_SUMMARY.md](./docs/PIPELINE_FIX_SUMMARY.md) - 修复总结
- [PIPELINE_VERIFICATION_GUIDE.md](./docs/PIPELINE_VERIFICATION_GUIDE.md) - 验证指南
- [PIPELINE_FIX_CHECKLIST.md](./PIPELINE_FIX_CHECKLIST.md) - 检查清单

## 🎯 下一步

1. 本地验证构建成功
2. 推送标签触发CI/CD
3. 监控GitHub Actions
4. 下载和测试生成的exe文件

---

**提示**：如果遇到问题，请查看详细文档或运行验证脚本。

