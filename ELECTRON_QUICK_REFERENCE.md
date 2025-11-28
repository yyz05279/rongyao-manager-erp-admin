# Electron 应用快速参考指南

## 🎯 后端服务地址

**Electron 应用后端**: `http://42.192.76.234:8080`

**API 基础路径**: `http://42.192.76.234:8080/prod-api`

## 📁 关键配置文件

| 文件 | 用途 |
|------|------|
| `.env.electron` | Electron 环境变量配置 |
| `electron.vite.config.ts` | Electron Vite 构建配置 |
| `src/utils/electron-request.ts` | Electron 专用 API 请求模块 |

## 🚀 常用命令

```bash
# 开发
npm run dev:electron

# 构建
npm run build:electron

# 打包
npm run dist:win      # Windows
npm run dist:mac      # macOS
npm run dist:linux    # Linux

# 验证配置
./scripts/verify-electron-config.sh
```

## 🔧 配置修改

### 修改后端地址

编辑 `.env.electron`:
```env
VITE_APP_BASE_API = 'http://42.192.76.234:8080/prod-api'
```

### 修改监控地址

编辑 `.env.electron`:
```env
VITE_APP_MONITRO_ADMIN = 'http://42.192.76.234:8080/admin/applications'
```

## 📊 配置对比

| 项目 | Electron | Web 应用 |
|------|----------|---------|
| 环境文件 | `.env.electron` | `.env.development` / `.env.production` |
| 后端地址 | `http://42.192.76.234:8080/prod-api` | `/prod-api` (相对路径) |
| 构建命令 | `npm run build:electron` | `npm run build:prod` |
| 环境标识 | `electron` | `development` / `production` |

## ✅ 验证清单

- [ ] `.env.electron` 文件存在
- [ ] `electron.vite.config.ts` 已更新
- [ ] `package.json` 构建脚本已更新
- [ ] `src/utils/electron-request.ts` 文件存在
- [ ] Web 应用配置保持不变
- [ ] 验证脚本通过: `./scripts/verify-electron-config.sh`

## 🧪 测试连接

### 1. 开发环境测试
```bash
npm run dev:electron
# 打开开发者工具 (F12)
# 查看 Network 标签，确认请求发送到 http://42.192.76.234:8080
```

### 2. 检查环境变量
在浏览器控制台输入:
```javascript
console.log(import.meta.env.VITE_APP_BASE_API)
// 输出: http://42.192.76.234:8080/prod-api
```

### 3. 测试 API 调用
```javascript
import service from '@/utils/request'
service.get('/system/user/list').then(res => console.log(res))
```

## 📝 使用 Electron 专用请求模块

```typescript
// 导入 Electron 专用请求模块
import electronService from '@/utils/electron-request'

// 发送 GET 请求
const users = await electronService.get('/system/user/list')

// 发送 POST 请求
const result = await electronService.post('/system/user/add', userData)

// 下载文件
import { downloadElectron } from '@/utils/electron-request'
downloadElectron('/system/user/export', params, 'users.xlsx')
```

## 🔍 故障排除

### 问题: 无法连接到后端
**解决方案**:
1. 检查后端服务是否运行: `http://42.192.76.234:8080`
2. 检查防火墙设置
3. 查看浏览器控制台错误信息
4. 运行验证脚本: `./scripts/verify-electron-config.sh`

### 问题: 请求发送到错误的地址
**解决方案**:
1. 检查 `.env.electron` 中的 `VITE_APP_BASE_API`
2. 重新构建应用: `npm run build:electron`
3. 清除缓存: `rm -rf dist/`

### 问题: Web 应用受到影响
**解决方案**:
1. 验证 `.env.production` 和 `.env.development` 未被修改
2. 运行验证脚本: `./scripts/verify-electron-config.sh`
3. 重新构建 Web 应用: `npm run build:prod`

## 📚 相关文档

- [Electron 后端配置指南](./docs/Electron-Backend-Configuration.md)
- [Electron 更新总结](./docs/ELECTRON_BACKEND_UPDATE_SUMMARY.md)
- [Electron 快速开始](./docs/Electron快速开始.md)
- [Electron 打包完整指南](./docs/Electron打包完整指南.md)

## 💡 提示

- 使用 `cross-env` 确保跨平台兼容性
- 在 CI/CD 中使用环境变量覆盖配置
- 定期运行验证脚本确保配置正确
- 在发布前测试所有平台的构建

## 🔐 安全建议

- 不要在版本控制中提交 `.env.electron.local`
- 使用环境变量管理敏感信息
- 定期更新依赖包
- 在生产环境中禁用开发者工具

---

**最后更新**: 2025-11-28
**版本**: 1.0

