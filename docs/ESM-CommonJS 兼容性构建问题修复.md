# ESM/CommonJS 兼容性构建问题修复

## 问题描述

在 CI/CD 流水线中运行 `npm run build:prod` 时出现以下错误：

```
Error [ERR_REQUIRE_ESM]: require() of ES Module 
D:\a\rongyao-manager-erp-admin\node_modules\package-manager-detector\dist\detect.mjs 
not supported.
```

### 错误链路
- `vite build` 加载 `vite.config.ts`
- `vite.config.ts` 导入 `unplugin-icons` 插件
- `unplugin-icons` 依赖 `@iconify/utils`
- `@iconify/utils` 依赖 `@antfu/install-pkg`
- `@antfu/install-pkg` 尝试用 `require()` 加载 ESM 模块 `package-manager-detector`

### 为什么本地 `dev:electron` 可以运行？
- `electron-vite` 使用不同的配置和加载机制
- 可能使用了不同的 Node.js 版本或环境变量

## 解决方案

### 方案 1：修改 vite.config.ts（已实施）

在 `vite.config.ts` 中添加 SSR 配置来处理 ESM 兼容性：

```typescript
ssr: {
  noExternal: ['@iconify/json', '@iconify/utils']
}
```

这告诉 Vite 将这些 ESM 模块内联到构建中，而不是尝试外部加载它们。

### 方案 2：更新依赖版本

如果方案 1 不生效，尝试升级 `unplugin-icons`：

```bash
npm install unplugin-icons@latest
```

### 方案 3：添加环境变量

在构建脚本中添加 `NODE_OPTIONS`：

```json
{
  "scripts": {
    "build:prod": "NODE_OPTIONS=--experimental-require-module vite build --mode production && vue-tsc --noEmit"
  }
}
```

### 方案 4：禁用 autoInstall（已在 icons.ts 中实施）

确保 `vite/plugins/icons.ts` 中已设置：

```typescript
autoInstall: false
```

这防止了在构建时自动安装图标库。

## 测试步骤

1. **本地测试**
   ```bash
   npm run build:prod
   ```

2. **CI/CD 测试**
   - 推送代码到 GitHub
   - 观察 GitHub Actions 流水线
   - 检查构建是否成功

## 相关文件修改

- `vite.config.ts` - 添加 SSR 配置
- `vite/plugins/icons.ts` - 已有 autoInstall: false

## 参考资源

- [Vite SSR 配置](https://vitejs.dev/guide/ssr.html)
- [unplugin-icons 文档](https://github.com/antfu/unplugin-icons)
- [Node.js ESM 兼容性](https://nodejs.org/docs/latest/api/esm.html)

