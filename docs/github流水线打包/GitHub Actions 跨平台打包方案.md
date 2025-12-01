# GitHub Actions 跨平台打包方案

## 项目概述

海棠企业管理系统跨平台安装包构建方案，支持：
- ✅ macOS Intel (x86_64)
- ✅ macOS Apple Silicon (arm64/M系列)
- ✅ Windows (x86_64)

## 目录
- [快速开始](#快速开始)
- [工作流配置](#工作流配置)
- [打包工具](#打包工具)
- [发布策略](#发布策略)
- [常见问题](#常见问题)

## 快速开始

### 1. 项目结构
```
haitang-web-admin/
├── .github/
│   └── workflows/
│       ├── build-mac-intel.yml
│       ├── build-mac-arm64.yml
│       ├── build-windows.yml
│       └── release.yml
├── src/
├── public/
├── electron/
│   ├── main.js
│   ├── preload.js
│   └── resources/
├── package.json
└── electron-builder.json
```

### 2. 安装依赖
```bash
npm install --save-dev electron electron-builder
npm install --save-dev @electron/notarize  # macOS 公证
```

### 3. 配置 electron-builder.json
```json
{
  "appId": "com.haitang.admin",
  "productName": "海棠企业管理系统",
  "directories": {
    "output": "dist",
    "buildResources": "electron/resources"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*",
    "electron/**/*"
  ],
  "mac": {
    "target": ["dmg", "zip"],
    "category": "public.app-category.business",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "electron/entitlements.mac.plist",
    "entitlementsInherit": "electron/entitlements.mac.plist"
  },
  "dmg": {
    "contents": [
      {
        "x": 130,
        "y": 220,
        "type": "file"
      },
      {
        "x": 410,
        "y": 220,
        "type": "link",
        "path": "/Applications"
      }
    ]
  },
  "win": {
    "target": ["nsis", "portable"],
    "certificateFile": null,
    "certificatePassword": null,
    "signingHashAlgorithms": ["sha256"],
    "sign": null
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "海棠企业管理系统"
  }
}
```

## 工作流配置

### 1. macOS Intel 构建 (build-mac-intel.yml)
```yaml
name: Build macOS Intel

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    strategy:
      matrix:
        node-version: [16.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Vue app
        run: npm run build
      
      - name: Build Electron app (Intel)
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          npm run electron:build -- --mac x64 --publish=never
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: macos-intel
          path: dist/Haitang*.dmg
          retention-days: 30
```

### 2. macOS M系列构建 (build-mac-arm64.yml)
```yaml
name: Build macOS ARM64

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    strategy:
      matrix:
        node-version: [16.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Vue app
        run: npm run build
      
      - name: Build Electron app (ARM64)
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: |
          npm run electron:build -- --mac arm64 --publish=never
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: macos-arm64
          path: dist/Haitang*.dmg
          retention-days: 30
```

### 3. Windows 构建 (build-windows.yml)
```yaml
name: Build Windows

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest
    strategy:
      matrix:
        node-version: [16.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Vue app
        run: npm run build
      
      - name: Build Electron app (Windows)
        run: |
          npm run electron:build -- --win x64 --publish=never
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: windows-x64
          path: |
            dist/Haitang*.exe
            dist/Haitang*.msi
          retention-days: 30
```

### 4. 发布工作流 (release.yml)
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  download-artifacts:
    needs: [build-mac-intel, build-mac-arm64, build-windows]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download all artifacts
        uses: actions/download-artifact@v3
        with:
          path: artifacts
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            artifacts/macos-intel/*
            artifacts/macos-arm64/*
            artifacts/windows-x64/*
          body_path: RELEASE_NOTES.md
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 打包工具

### 1. package.json 脚本
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest",
    "@electron/notarize": "^latest",
    "concurrently": "^latest",
    "wait-on": "^latest"
  }
}
```

### 2. Electron 主进程 (electron/main.js)
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### 3. macOS 公证配置 (electron/entitlements.mac.plist)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-executable-page-protection</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
</dict>
</plist>
```

## 发布策略

### 1. 版本管理
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 自动触发 GitHub Actions 工作流
```

### 2. Release Notes 模板
```markdown
# 海棠企业管理系统 v1.0.0

## 新增功能
- 功能 1
- 功能 2

## 修复
- 修复 1
- 修复 2

## 下载
- macOS Intel: Haitang-1.0.0-x64.dmg
- macOS M系列: Haitang-1.0.0-arm64.dmg
- Windows: Haitang-1.0.0.exe

## 系统要求
- macOS 10.13+
- Windows 7+
```

## 常见问题

### Q1: macOS 公证失败

**解决方案**:
1. 确保 Apple ID 和密码正确
2. 检查 Team ID 配置
3. 验证证书有效期

### Q2: Windows 签名问题

**解决方案**:
```yaml
- name: Sign Windows executable
  run: |
    signtool sign /f certificate.pfx /p ${{ secrets.CERT_PASSWORD }} /t http://timestamp.server.com dist/Haitang*.exe
```

### Q3: 构建超时

**解决方案**:
- 增加 GitHub Actions 超时时间
- 使用缓存加速依赖安装
- 并行构建多个平台

---

**最后更新**: 2025-12-01

