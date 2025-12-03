# Electron 开发环境修复记录

## 问题描述

执行 `npm run dev:electron` 时出现以下错误：
```
Error: No electron app entry file found: /Users/yyz/Desktop/haitang-web-admin/dist/main/index.js
```

## 根本原因

项目配置中存在路径不一致的问题：

1. **electron.vite.config.ts** 中指定的输出目录为 `dist/main`、`dist/preload`、`dist/renderer`
2. **package.json** 中的 `main` 字段指向 `dist/main/index.js`
3. **package.json** 中的 electron-builder 配置指向 `dist/**/*`

但实际上，electron-vite 在开发模式下会将文件输出到 `out/` 目录，导致找不到入口文件。

## 修复方案

### 1. 修改 electron.vite.config.ts

将所有输出目录从 `dist/` 改为 `out/`：

```typescript
// 修改前
main: {
  vite: {
    build: {
      outDir: 'dist/main',
      // ...
    }
  }
}

// 修改后
main: {
  vite: {
    build: {
      outDir: 'out/main',
      // ...
    }
  }
}
```

同样修改 `preload` 和 `renderer` 的 `outDir`：
- `dist/preload` → `out/preload`
- `dist/renderer` → `out/renderer`

### 2. 修改 package.json

#### 2.1 更新 main 字段
```json
// 修改前
"main": "dist/main/index.js",

// 修改后
"main": "out/main/index.js",
```

#### 2.2 更新 electron-builder 配置
```json
// 修改前
"files": [
  "dist/**/*",
  "node_modules/**/*"
],

// 修改后
"files": [
  "out/**/*",
  "node_modules/**/*"
],
```

## 修改文件列表

| 文件 | 修改内容 | 修改行数 |
|------|--------|--------|
| electron.vite.config.ts | 更新 outDir 路径（dist → out） | 16, 31, 39 |
| package.json | 更新 main 字段和 files 配置 | 7, 108 |

## 验证结果

修改后执行 `npm run dev:electron`：

✅ **成功**
- Electron 主进程编译成功
- Preload 脚本编译成功
- 开发服务器启动成功（http://localhost:5173/）
- Electron 应用成功启动

## 注意事项

1. **开发环境**：使用 `out/` 目录
2. **生产构建**：使用 `npm run build:electron` 时，确保输出目录配置正确
3. **打包部署**：electron-builder 现在会从 `out/` 目录读取文件

## 相关命令

```bash
# 开发模式
npm run dev:electron

# 生产构建
npm run build:electron

# 预览构建结果
npm run preview:electron

# 打包应用
npm run dist
npm run dist:mac
npm run dist:win
npm run dist:linux
```

## 后续建议

1. 考虑统一使用 `out/` 目录作为所有构建输出目录
2. 更新 CI/CD 配置中的路径引用
3. 更新项目文档中关于构建目录的说明

