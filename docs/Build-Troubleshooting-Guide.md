# 构建问题排查指南

## 常见构建错误及解决方案

### 1. ERR_REQUIRE_ESM 错误

**症状**：
```
Error [ERR_REQUIRE_ESM]: require() of ES Module ... not supported
```

**原因**：
- 某个 CommonJS 模块尝试用 `require()` 加载 ESM 模块
- 通常发生在 Vite 配置加载阶段

**解决方案**（按优先级）：

#### 优先级 1：修改 vite.config.ts
```typescript
ssr: {
  noExternal: ['@iconify/json', '@iconify/utils', 'package-manager-detector']
}
```

#### 优先级 2：更新依赖
```bash
npm install unplugin-icons@latest
npm install @iconify/utils@latest
```

#### 优先级 3：清理并重新安装
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

#### 优先级 4：使用 NODE_OPTIONS
```bash
NODE_OPTIONS=--experimental-require-module npm run build:prod
```

### 2. 本地可以运行但 CI/CD 失败

**原因**：
- Node.js 版本不同
- 依赖版本不同
- 环境变量配置不同

**解决方案**：
1. 检查 CI/CD 使用的 Node.js 版本
2. 在本地使用相同版本测试
3. 更新 `.github/workflows` 中的 Node.js 版本

### 3. 构建超时或内存不足

**症状**：
```
JavaScript heap out of memory
```

**解决方案**：
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build:prod
```

## 快速诊断

运行以下命令诊断问题：

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 清理缓存
npm cache clean --force

# 验证依赖
npm ls unplugin-icons

# 详细构建日志
npm run build:prod -- --debug
```

## 预防措施

1. 定期更新依赖
2. 在本地测试构建
3. 使用相同的 Node.js 版本
4. 监控 CI/CD 日志

