# Electron 跨平台打包设置指南

## 1. 安装依赖

```bash
# 安装核心依赖
npm install --save-dev electron electron-builder

# 安装辅助工具
npm install --save-dev electron-is-dev
npm install --save-dev @electron/notarize  # macOS 公证
npm install --save-dev concurrently wait-on  # 开发工具
```

## 2. 更新 package.json

在 `package.json` 中添加以下脚本和配置：

```json
{
  "name": "haitang-web-admin",
  "version": "1.0.0",
  "description": "海棠企业管理系统",
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:mac:intel": "npm run build && electron-builder --mac x64",
    "electron:build:mac:arm": "npm run build && electron-builder --mac arm64",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest",
    "electron-is-dev": "^latest",
    "@electron/notarize": "^latest",
    "concurrently": "^latest",
    "wait-on": "^latest"
  }
}
```

## 3. 项目结构

```
haitang-web-admin/
├── .github/
│   └── workflows/
│       ├── build-mac-intel.yml
│       ├── build-mac-arm64.yml
│       ├── build-windows.yml
│       └── release.yml
├── electron/
│   ├── main.js
│   ├── preload.js
│   ├── entitlements.mac.plist
│   └── resources/
│       ├── icon.png
│       ├── icon.icns (macOS)
│       └── icon.ico (Windows)
├── src/
│   ├── App.vue
│   ├── main.ts
│   └── ...
├── dist/
│   └── (Vite 构建输出)
├── electron-builder.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 4. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

### macOS 签名和公证
```
APPLE_ID              # Apple ID 邮箱
APPLE_PASSWORD        # App-specific password
APPLE_TEAM_ID         # Apple Team ID
CSC_LINK              # 证书文件 base64 编码
CSC_KEY_PASSWORD      # 证书密码
```

### 获取 App-specific password
1. 访问 https://appleid.apple.com/account/manage
2. 选择"安全"
3. 在"应用专用密码"中生成新密码

### 编码证书文件
```bash
# macOS
base64 -i certificate.p12 | pbcopy

# Linux/Windows
base64 certificate.p12 | xclip -selection clipboard
```

## 5. 本地开发

### 开发模式
```bash
# 启动 Vite 开发服务器和 Electron
npm run electron:dev
```

### 构建测试
```bash
# 构建单个平台
npm run electron:build:mac:intel
npm run electron:build:mac:arm
npm run electron:build:win
```

## 6. 发布流程

### 创建发布标签
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签（自动触发 GitHub Actions）
git push origin v1.0.0
```

### 自动构建流程
1. 推送标签后，GitHub Actions 自动触发
2. 并行构建 macOS Intel、macOS ARM64、Windows
3. 生成校验和
4. 创建 GitHub Release
5. 上传所有构建产物

## 7. 构建产物

### macOS
- `Haitang-1.0.0-x64.dmg` - Intel 版本
- `Haitang-1.0.0-arm64.dmg` - Apple Silicon 版本
- `Haitang-1.0.0-x64.zip` - Intel 便携版
- `Haitang-1.0.0-arm64.zip` - ARM64 便携版

### Windows
- `Haitang-1.0.0.exe` - 安装程序
- `Haitang-1.0.0-portable.exe` - 便携版

## 8. 常见问题

### Q1: macOS 公证失败

**症状**: 构建成功但公证失败

**解决方案**:
1. 验证 Apple ID 和密码正确
2. 确保 Team ID 正确
3. 检查证书有效期
4. 查看 GitHub Actions 日志获取详细错误

### Q2: Windows 签名问题

**症状**: 构建时出现签名错误

**解决方案**:
1. 如果没有代码签名证书，注释掉 `electron-builder.json` 中的签名配置
2. 或者添加有效的代码签名证书

### Q3: 构建超时

**症状**: GitHub Actions 构建超时

**解决方案**:
1. 增加 GitHub Actions 超时时间
2. 使用 npm ci 而不是 npm install
3. 启用 npm 缓存

### Q4: 文件大小过大

**症状**: 构建产物文件过大

**解决方案**:
1. 使用 electron-builder 的压缩选项
2. 移除不必要的依赖
3. 使用 asar 打包应用

## 9. 性能优化

### 减小包体积
```json
{
  "build": {
    "asar": true,
    "asarUnpack": ["node_modules/native-module/**/*"]
  }
}
```

### 加速构建
```yaml
- name: Cache npm dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## 10. 安全建议

### ✅ 推荐做法
- 使用 GitHub Secrets 存储敏感信息
- 启用代码签名和公证
- 定期更新依赖
- 使用最新的 Electron 版本
- 启用 sandbox 模式

### ❌ 避免做法
- 在代码中硬编码凭证
- 禁用 sandbox
- 使用过期的依赖
- 跳过代码签名

---

**最后更新**: 2025-12-01

