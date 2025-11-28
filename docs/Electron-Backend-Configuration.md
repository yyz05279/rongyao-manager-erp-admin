# Electron 应用后端服务配置指南

## 概述

本文档说明如何为 Electron 应用配置连接到远程后端服务 (http://42.192.76.234:8080)。

## 配置文件说明

### 1. 环境配置文件 (.env.electron)

**位置**: `/Users/yyz/Desktop/haitang-web-admin/.env.electron`

**关键配置**:
```
VITE_APP_ENV = 'electron'
VITE_APP_BASE_API = 'http://42.192.76.234:8080/prod-api'
VITE_APP_MONITRO_ADMIN = 'http://42.192.76.234:8080/admin/applications'
VITE_APP_POWERJOB_ADMIN = 'http://42.192.76.234:8080/powerjob'
```

**说明**:
- `VITE_APP_ENV`: 标识为 Electron 环境
- `VITE_APP_BASE_API`: 指向远程后端服务的 API 基础路径
- 其他监控和任务调度地址也指向远程服务

### 2. Electron 构建配置 (electron.vite.config.ts)

**更新内容**:
- 添加了 `loadEnv` 函数来加载环境变量
- 在 renderer 和 main 进程中定义环境变量
- 确保 Electron 构建时使用正确的后端地址

### 3. 构建脚本更新 (package.json)

**更新的脚本**:
```json
"build:electron": "electron-vite build --mode electron",
"dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win",
"dist:mac": "cross-env VITE_APP_ENV=electron electron-builder --mac",
"dist:linux": "cross-env VITE_APP_ENV=electron electron-builder --linux"
```

**说明**:
- 使用 `--mode electron` 加载 `.env.electron` 配置
- 使用 `cross-env` 设置环境变量确保跨平台兼容性

### 4. Electron 专用 API 请求模块 (src/utils/electron-request.ts)

**功能**:
- 创建专用的 axios 实例，硬编码后端地址
- 后端地址: `http://42.192.76.234:8080/prod-api`
- 包含所有原始请求拦截器和响应拦截器
- 提供 `downloadElectron` 方法用于文件下载

**使用方式**:
```typescript
import electronService from '@/utils/electron-request'

// 在 Electron 应用中使用
const response = await electronService.get('/user/list')
```

## 构建和打包流程

### 开发环境

```bash
# 开发 Electron 应用
npm run dev:electron
```

### 生产构建

```bash
# 构建 Electron 应用（使用 .env.electron 配置）
npm run build:electron

# 打包为不同平台的可执行文件
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## Web 应用配置（保持不变）

Web 应用继续使用原有的环境配置:
- `.env.development`: 开发环境
- `.env.production`: 生产环境

**构建脚本**:
```bash
# Web 应用开发
npm run dev

# Web 应用生产构建
npm run build:prod
```

## 关键要点

### ✅ Electron 应用
- 使用 `.env.electron` 配置文件
- 后端地址: `http://42.192.76.234:8080`
- 构建时使用 `--mode electron` 参数
- 可选使用 `src/utils/electron-request.ts` 作为专用请求模块

### ✅ Web 应用
- 继续使用 `.env.development` 和 `.env.production`
- 不受 Electron 配置影响
- 独立构建和部署

## 环境变量加载优先级

Vite 的环境变量加载遵循以下优先级:
1. `.env.{mode}.local` (本地覆盖，不提交到版本控制)
2. `.env.{mode}` (特定模式配置)
3. `.env.local` (本地通用覆盖)
4. `.env` (通用配置)

对于 Electron 应用:
- 使用 `--mode electron` 时，会加载 `.env.electron`
- 可选创建 `.env.electron.local` 用于本地开发覆盖

## 测试连接

### 方法 1: 检查网络请求
1. 打开 Electron 应用
2. 打开开发者工具 (F12)
3. 查看 Network 标签
4. 确认请求发送到 `http://42.192.76.234:8080`

### 方法 2: 检查控制台日志
在 `src/utils/request.ts` 中添加日志:
```typescript
console.log('API Base URL:', import.meta.env.VITE_APP_BASE_API)
```

### 方法 3: 测试 API 调用
```typescript
// 在 Electron 应用中测试
import service from '@/utils/request'

service.get('/system/user/list')
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err))
```

## 常见问题

### Q: 如何切换回本地后端?
A: 修改 `.env.electron` 中的 `VITE_APP_BASE_API`:
```
VITE_APP_BASE_API = 'http://localhost:8080/prod-api'
```

### Q: Web 应用会受到影响吗?
A: 不会。Web 应用使用独立的 `.env.development` 和 `.env.production` 配置。

### Q: 如何为不同的 Electron 构建使用不同的后端?
A: 创建 `.env.electron.local` 文件进行本地覆盖，该文件不会提交到版本控制。

### Q: 打包后的 Electron 应用如何更新后端地址?
A: 需要重新构建和打包应用。后端地址在构建时被硬编码到应用中。

## 相关文件

- `.env.electron`: Electron 环境配置
- `electron.vite.config.ts`: Electron Vite 构建配置
- `src/utils/electron-request.ts`: Electron 专用请求模块
- `package.json`: 构建脚本定义

## 后续改进建议

1. **动态配置**: 可以在 Electron 主进程中读取配置文件，实现运行时动态修改后端地址
2. **配置管理界面**: 在应用设置中添加后端地址配置选项
3. **多环境支持**: 创建 `.env.electron.staging` 等用于不同环境
4. **自动化部署**: 集成 CI/CD 流程自动构建和发布不同环境的应用

