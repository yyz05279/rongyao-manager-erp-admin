# Windows Build - cross-env 修复指南

## 问题描述

运行 `npm run dist:win` 时出现以下错误：
```
'cross-env' is not recognized as an internal or external command,
operable program or batch file.
Error: Process completed with exit code 1.
```

## 根本原因

`cross-env` 包在 `package.json` 的 `devDependencies` 中缺失，导致 npm 脚本无法找到该命令。

## 解决方案

### 1. 已完成的修复

✅ 在 `package.json` 中添加了 `cross-env` 依赖：
```json
"devDependencies": {
  "cross-env": "^7.0.3",
  ...
}
```

✅ 运行 `npm install` 安装依赖

✅ 验证安装成功：
```
haitang-admin@1.0.0
└── cross-env@7.0.3
```

### 2. 后续步骤

#### 步骤 1：构建 Electron 应用
```bash
npm run build:electron
```

这个命令会：
- 编译 Electron 主进程代码
- 编译 Electron 预加载脚本
- 生成 `out/` 目录中的输出文件

#### 步骤 2：打包 Windows 应用
```bash
npm run dist:win
```

这个命令会：
- 设置环境变量 `VITE_APP_ENV=electron`
- 使用 electron-builder 打包 Windows 应用
- 生成 NSIS 安装程序和便携版

### 3. 完整的 Windows 构建流程

```bash
# 1. 安装依赖（已完成）
npm install

# 2. 构建 Electron 应用
npm run build:electron

# 3. 打包 Windows 应用
npm run dist:win
```

## 预期输出

成功完成后，你应该在以下位置找到生成的应用：
- `dist/海棠企业管理系统 Setup 1.0.0.exe` - NSIS 安装程序
- `dist/海棠企业管理系统 1.0.0.exe` - 便携版

## 常见问题

### Q: 构建过程中内存不足？
A: 使用 `npm run build:electron` 已经配置了 `NODE_OPTIONS=--max-old-space-size=4096`

### Q: 需要重新安装依赖？
A: 运行 `npm install` 即可

### Q: 如何清理之前的构建？
A: 删除 `out/` 和 `dist/` 目录，然后重新构建

## 相关脚本

```json
"scripts": {
  "build:electron": "NODE_OPTIONS=--max-old-space-size=4096 electron-vite build --mode electron",
  "dist": "electron-builder",
  "dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win",
  "dist:mac": "VITE_APP_ENV=electron electron-builder --mac --config electron-builder.yml",
  "dist:linux": "VITE_APP_ENV=electron electron-builder --linux"
}
```

## 验证修复

运行以下命令验证 cross-env 已正确安装：
```bash
npm list cross-env
```

应该看到：
```
haitang-admin@1.0.0
└── cross-env@7.0.3
```

