# CI/CD 构建问题修复总结

## 问题分析

### 错误信息
```
Error [ERR_REQUIRE_ESM]: require() of ES Module 
package-manager-detector/dist/detect.mjs not supported
```

### 根本原因
- `unplugin-icons` 依赖链中存在 ESM/CommonJS 兼容性问题
- 在 CI/CD 环境中，某些 CommonJS 模块尝试用 `require()` 加载 ESM 模块
- 本地 `dev:electron` 可以运行是因为使用了不同的加载机制

## 实施的修复

### 1. 修改 vite.config.ts

添加 SSR 配置来处理 ESM 兼容性：

```typescript
ssr: {
  noExternal: ['@iconify/json', '@iconify/utils']
}
```

**作用**：
- 告诉 Vite 将这些 ESM 模块内联到构建中
- 避免在构建时尝试外部加载这些模块
- 解决 require() 加载 ESM 的问题

### 2. 验证 icons.ts 配置

确保已设置 `autoInstall: false`：

```typescript
export default () => {
  return Icons({
    autoInstall: false
  });
};
```

**作用**：
- 防止在构建时自动安装图标库
- 依赖 @iconify/json 提供的预装图标集合

## 测试步骤

### 本地测试
```bash
npm run build:prod
```

### CI/CD 验证
1. 推送代码到 GitHub
2. 观察 GitHub Actions 流水线
3. 检查 `build:prod` 步骤是否成功

## 备选方案

如果上述修复不生效，按以下顺序尝试：

1. **更新依赖**
   ```bash
   npm install unplugin-icons@latest
   npm install @iconify/utils@latest
   ```

2. **清理重装**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build:prod
   ```

3. **环境变量**
   ```bash
   NODE_OPTIONS=--experimental-require-module npm run build:prod
   ```

## 相关文件
- `vite.config.ts` - 主要修改
- `vite/plugins/icons.ts` - 已有正确配置
- `docs/ESM-CJS-Build-Fix.md` - 详细说明
- `docs/Build-Troubleshooting-Guide.md` - 排查指南

