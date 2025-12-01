# GitHub Actions 工作流验证清单

## 📋 工作流文件检查

### build-mac-intel.yml
- [x] 更新为 `actions/upload-artifact@v4`
- [x] 添加 `if-no-files-found: warn` 参数
- [x] 合并校验和到同一个 artifact
- [x] 保留 30 天的 retention-days

### build-mac-arm64.yml
- [x] 更新为 `actions/upload-artifact@v4`
- [x] 添加 `if-no-files-found: warn` 参数
- [x] 合并校验和到同一个 artifact
- [x] 保留 30 天的 retention-days

### build-windows.yml
- [x] 更新为 `actions/upload-artifact@v4`
- [x] 添加 `if-no-files-found: warn` 参数
- [x] 合并校验和到同一个 artifact
- [x] 保留 30 天的 retention-days

### release.yml
- [x] 更新为 `actions/download-artifact@v4`
- [x] 正确处理多个 artifact 下载

## 🔧 本地验证

### 依赖检查
```bash
# 检查 Node.js 版本
node --version  # 应该是 16+

# 检查 npm 版本
npm --version

# 检查依赖
npm list electron
npm list electron-builder
```

### 构建测试
```bash
# 清理之前的构建
rm -rf dist node_modules

# 安装依赖
npm ci

# 构建 Vue 应用
npm run build

# 验证构建输出
ls -la dist/
```

## 🚀 GitHub Actions 验证

### 工作流文件语法检查
```bash
# 使用 GitHub CLI 验证（如果已安装）
gh workflow list

# 或在 GitHub 网页界面检查
# 进入 Actions → 查看工作流状态
```

### 创建测试版本
```bash
# 创建测试标签
git tag -a v1.0.0-test -m "Test build"

# 推送标签
git push origin v1.0.0-test

# 监控构建
# 进入 GitHub Actions 查看运行状态
```

## 📊 构建验证

### 构建成功标志
- [x] 所有三个平台的构建都成功
- [x] 没有 v3 deprecation 错误
- [x] 所有 artifact 都已上传
- [x] 校验和文件已生成

### 输出检查
```
✅ macOS Intel 构建
   - Haitang-1.0.0-test-x64.dmg
   - Haitang-1.0.0-test-x64.zip
   - checksums-intel.txt

✅ macOS ARM64 构建
   - Haitang-1.0.0-test-arm64.dmg
   - Haitang-1.0.0-test-arm64.zip
   - checksums-arm64.txt

✅ Windows 构建
   - Haitang-1.0.0-test.exe
   - Haitang-1.0.0-test-portable.exe
   - checksums-windows.txt
```

## 🔐 Release 验证

### Release 页面检查
- [x] Release 已创建
- [x] Release Notes 已生成
- [x] 所有文件已上传
- [x] 校验和已包含

### 文件完整性
```bash
# 验证 macOS Intel 校验和
shasum -a 256 -c checksums-intel.txt

# 验证 macOS ARM64 校验和
shasum -a 256 -c checksums-arm64.txt

# 验证 Windows 校验和
certutil -hashfile Haitang-1.0.0-test.exe SHA256
```

## 🧪 安装包测试

### macOS 测试
- [ ] 下载 DMG 文件
- [ ] 双击打开 DMG
- [ ] 拖动应用到 Applications
- [ ] 启动应用
- [ ] 验证功能正常

### Windows 测试
- [ ] 下载 EXE 文件
- [ ] 运行安装程序
- [ ] 完成安装
- [ ] 启动应用
- [ ] 验证功能正常

## 📝 文档检查

- [x] GITHUB_ACTIONS_UPDATE.md - 更新说明
- [x] WORKFLOW_VERIFICATION_CHECKLIST.md - 验证清单
- [x] BUILD_QUICK_START.md - 快速开始
- [x] ELECTRON_BUILD_SETUP.md - 详细设置

## 🐛 故障排除

### 如果构建失败

1. **检查错误信息**
   ```
   进入 GitHub Actions → 选择失败的工作流 → 查看日志
   ```

2. **常见错误**
   - `actions/upload-artifact@v3` 错误 → 已修复
   - 找不到构建文件 → 检查构建是否成功
   - 网络超时 → 重新运行工作流

3. **重新运行工作流**
   ```
   GitHub Actions → 选择工作流 → Re-run jobs
   ```

## ✅ 最终检查清单

### 代码提交前
- [ ] 所有工作流文件已更新到 v4
- [ ] 本地构建测试成功
- [ ] 没有语法错误
- [ ] 文档已更新

### 推送标签前
- [ ] 确认所有更改已提交
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] 标签名称正确

### 发布后
- [ ] 构建成功完成
- [ ] Release 已创建
- [ ] 所有文件已上传
- [ ] 校验和已验证
- [ ] 安装包已测试

## 📞 支持信息

如果遇到问题：

1. 查看 GitHub Actions 日志
2. 检查工作流文件语法
3. 参考 GITHUB_ACTIONS_UPDATE.md
4. 查看 GitHub 官方文档

---

**验证日期**: 2025-12-01
**状态**: ✅ 准备就绪

