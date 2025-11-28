# API 配置问题诊断和解决方案

## 问题描述

Electron 开发环境访问线上 API 时收到 404 错误：
```
http://42.192.76.234:8080/prod-api/auth/code → 404
```

## 可能的原因

### 1. 线上环境 API 路径不同
- 生产环境可能使用不同的 API 路径
- 例如：`/api` 而不是 `/prod-api`
- 或者完全不同的路径结构

### 2. 域名映射问题
- 域名 `42.192.76.234` 可能没有正确映射到后端服务
- 可能需要使用不同的域名或 IP

### 3. 后端服务未启动或配置错误
- 线上服务器可能未启动
- 反向代理配置有问题

## 诊断步骤

### 步骤 1: 测试基础连接
在浏览器中访问：
```
http://42.192.76.234:8080/
```
检查是否能连接到服务器

### 步骤 2: 测试 API 路径
尝试以下路径：
```
http://42.192.76.234:8080/prod-api/
http://42.192.76.234:8080/api/
http://42.192.76.234:8080/
```

### 步骤 3: 检查浏览器开发者工具
在 Electron 应用中：
1. 按 F12 打开开发者工具
2. 查看 Network 标签
3. 检查 API 请求的完整 URL 和响应状态

## 解决方案

### 方案 1: 修改 API 路径（如果路径不同）

编辑 `.env.electron` 文件：
```bash
# 如果实际路径是 /api 而不是 /prod-api
VITE_APP_BASE_API = 'http://42.192.76.234:8080/api'

# 或者如果没有路径前缀
VITE_APP_BASE_API = 'http://42.192.76.234:8080'
```

### 方案 2: 使用本地开发服务器（临时方案）

如果线上环境有问题，可以临时使用本地开发服务器：

编辑 `.env.electron` 文件：
```bash
# 使用本地开发服务器
VITE_APP_BASE_API = 'http://localhost:8080/dev-api'
```

然后需要启动本地后端服务。

### 方案 3: 检查 CORS 配置

如果是 CORS 问题，检查：
1. 后端是否允许来自 Electron 应用的请求
2. 是否需要添加 CORS 头

### 方案 4: 使用代理（开发环境）

如果需要在开发环境中使用代理，可以修改 `electron.vite.config.ts`：

```typescript
server: {
  proxy: {
    '/prod-api': {
      target: 'http://42.192.76.234:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/prod-api/, '/prod-api')
    }
  }
}
```

## 建议的调试流程

1. **确认线上服务器状态**
   ```bash
   curl -I http://42.192.76.234:8080/
   ```

2. **测试具体 API 端点**
   ```bash
   curl -I http://42.192.76.234:8080/prod-api/auth/code
   ```

3. **检查 Electron 应用的实际请求**
   - 打开开发者工具（F12）
   - 查看 Network 标签
   - 检查请求 URL 和响应

4. **查看后端日志**
   - 检查线上服务器的日志
   - 查看是否收到请求
   - 查看错误信息

## 快速修复建议

如果需要立即解决，可以尝试以下步骤：

1. **检查 API 路径**
   - 确认 `/prod-api` 是否正确
   - 如果不确定，尝试 `/api`

2. **临时使用本地服务**
   - 修改 `.env.electron` 使用本地地址
   - 启动本地后端服务

3. **联系后端团队**
   - 确认线上 API 的正确地址
   - 确认 API 路径和端口
   - 确认是否需要特殊的请求头或认证

## 相关文件

- `.env.electron` - Electron 环境配置
- `.env.development` - 开发环境配置
- `electron.vite.config.ts` - Electron Vite 配置
- `vite.config.ts` - Vite 配置（包含代理规则）

