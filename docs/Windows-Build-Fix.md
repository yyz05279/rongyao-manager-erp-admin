# Windows 平台打包错误修复指南

## 问题描述

在 Windows 平台执行 `npm install` 时报错：
```
npm error code ETARGET
npm error notarget No matching version found for electron-vite@^1.1.0.
```

## 根本原因

`electron-vite@^1.1.0` 版本不存在于 npm 官方仓库。electron-vite 的实际可用版本是 1.0.x 系列。

## 解决方案

### 1. 修改 package.json

将 `package.json` 第 80 行的版本号从：
```json
"electron-vite": "^1.1.0",
```

改为：
```json
"electron-vite": "^1.0.0",
```

### 2. 清除 npm 缓存

在 Windows PowerShell 中执行：
```powershell
npm cache clean --force
```

### 3. 删除 node_modules 和 package-lock.json

```powershell
# 删除 node_modules 目录
Remove-Item -Recurse -Force node_modules

# 删除 package-lock.json
Remove-Item package-lock.json
```

### 4. 重新安装依赖

```powershell
npm install --no-audit
```

### 5. 验证安装

检查 electron-vite 是否正确安装：
```powershell
npm list electron-vite
```

应该看到类似的输出：
```
haitang-admin@1.0.0 C:\path\to\haitang-web-admin
└── electron-vite@1.0.27
```

## 完整修复步骤

### 方案 A：使用 PowerShell（推荐）

```powershell
# 1. 进入项目目录
cd C:\path\to\haitang-web-admin

# 2. 清除 npm 缓存
npm cache clean --force

# 3. 删除旧的依赖
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 4. 重新安装
npm install --no-audit

# 5. 验证
npm list electron-vite
```

### 方案 B：使用 Git Bash

```bash
# 1. 进入项目目录
cd /c/path/to/haitang-web-admin

# 2. 清除 npm 缓存
npm cache clean --force

# 3. 删除旧的依赖
rm -rf node_modules
rm package-lock.json

# 4. 重新安装
npm install --no-audit

# 5. 验证
npm list electron-vite
```

## 打包命令

修复完成后，可以执行以下命令进行 Windows 打包：

```powershell
# 构建 Electron 应用
npm run build:electron

# 打包为 Windows 安装程序
npm run dist:win
```

## 常见问题

### Q: 修改后仍然报错？
A: 尝试以下步骤：
1. 确保 package.json 已正确保存
2. 清除 npm 缓存：`npm cache clean --force`
3. 删除 node_modules 和 package-lock.json
4. 重新执行 `npm install`

### Q: npm install 仍然很慢？
A: 可以尝试使用国内 npm 镜像：
```powershell
npm config set registry https://registry.npmmirror.com
npm install --no-audit
```

### Q: 如何恢复原始镜像？
```powershell
npm config set registry https://registry.npmjs.org/
```

## 验证修复

修复完成后，验证以下内容：

1. ✅ electron-vite 已正确安装
2. ✅ node_modules 目录存在
3. ✅ package-lock.json 已更新
4. ✅ 可以成功执行 `npm run build:electron`

## 相关文件修改

- **修改文件**: `package.json`
- **修改行**: 第 80 行
- **修改内容**: `"electron-vite": "^1.1.0"` → `"electron-vite": "^1.0.0"`

## 参考资源

- [electron-vite npm 页面](https://www.npmjs.com/package/electron-vite)
- [npm 官方文档](https://docs.npmjs.com/)
- [Electron 官方文档](https://www.electronjs.org/docs)

