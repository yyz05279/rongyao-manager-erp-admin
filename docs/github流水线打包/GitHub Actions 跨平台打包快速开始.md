# GitHub Actions 跨平台打包快速开始

## [object Object]分钟快速开始

### 第1步：安装依赖
```bash
npm install --save-dev electron electron-builder electron-is-dev
npm install --save-dev concurrently wait-on
```

### 第2步：本地测试构建
```bash
# 开发模式运行
npm run electron:dev

# 构建 macOS Intel
npm run electron:build:mac:intel

# 构建 macOS ARM64
npm run electron:build:mac:arm

# 构建 Windows
npm run electron:build:win
```

### 第3步：配置 GitHub Secrets
进入 GitHub 仓库 → Settings → Secrets and variables → Actions

添加以下 secrets：
```
APPLE_ID              = your-apple-id@example.com
APPLE_PASSWORD        = xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID         = XXXXXXXXXX
CSC_LINK              = (base64 encoded certificate)
CSC_KEY_PASSWORD      = your-cert-password
```

### 第4步：发布版本
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送标签（自动触发构建）
git push origin v1.0.0
```

## 📦 构建产物

### macOS
```
dist/
├── Haitang-1.0.0-x64.dmg        # Intel 版本
├── Haitang-1.0.0-arm64.dmg      # M系列版本
├── Haitang-1.0.0-x64.zip        # Intel 便携版
└── Haitang-1.0.0-arm64.zip      # M系列 便携版
```

### Windows
```
dist/
├── Haitang-1.0.0.exe            # 安装程序
└── Haitang-1.0.0-portable.exe   # 便携版
```

## 🔧 配置文件清单

已创建的文件：
- ✅ `.github/workflows/build-mac-intel.yml` - Intel 构建
- ✅ `.github/workflows/build-mac-arm64.yml` - ARM64 构建
- ✅ `.github/workflows/build-windows.yml` - Windows 构建
- ✅ `.github/workflows/release.yml` - 发布工作流
- ✅ `electron-builder.json` - 打包配置
- ✅ `electron/main.js` - Electron 主进程
- ✅ `electron/preload.js` - 安全预加载脚本
- ✅ `electron/entitlements.mac.plist` - macOS 权限

## 📋 检查清单

### 本地开发
- [ ] 安装 Node.js 16+
- [ ] 运行 `npm install`
- [ ] 运行 `npm run electron:dev` 测试
- [ ] 构建成功

### 发布前
- [ ] 更新版本号 (package.json)
- [ ] 更新 CHANGELOG
- [ ] 提交所有更改
- [ ] 创建版本标签
- [ ] 推送标签

### 发布后
- [ ] 检查 GitHub Actions 构建状态
- [ ] 验证 Release 页面
- [ ] 下载并测试安装包
- [ ] 验证校验和

## 🎯 常用命令

```bash
# 开发
npm run electron:dev

# 构建
npm run electron:build              # 所有平台
npm run electron:build:mac:intel    # macOS Intel
npm run electron:build:mac:arm      # macOS ARM64
npm run electron:build:win          # Windows

# 版本管理
git tag -a v1.0.0 -m "Release"
git push origin v1.0.0
git tag -d v1.0.0                   # 删除本地标签
git push origin --delete v1.0.0     # 删除远程标签
```

## 🔐 安全建议

### GitHub Secrets 设置
1. 不要在代码中硬编码凭证
2. 使用 GitHub Secrets 存储敏感信息
3. 定期轮换凭证
4. 限制 workflow 权限

### 代码签名
- macOS: 使用 Apple Developer 证书
- Windows: 使用代码签名证书（可选）

## 📊 构建状态

查看构建状态：
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看工作流运行状态

## 🐛 故障排除

### 构建失败
1. 查看 GitHub Actions 日志
2. 检查依赖是否正确安装
3. 验证配置文件是否正确

### macOS 公证失败
1. 验证 Apple ID 和密码
2. 检查 Team ID
3. 确保证书有效

### Windows 构建失败
1. 检查 Windows 路径配置
2. 验证 NSIS 安装程序配置
3. 查看详细错误日志

## 📚 详细文档

- `GITHUB_ACTIONS_CROSS_PLATFORM_BUILD.md` - 完整指南
- `ELECTRON_BUILD_SETUP.md` - 详细设置说明
- `electron-builder.json` - 打包配置参考

## 🔗 相关链接

- [Electron 官方文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**快速参考**: 推送标签 → 自动构建 → 自动发布 [object Object]
