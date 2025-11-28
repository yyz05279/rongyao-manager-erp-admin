# Electron 应用后端服务配置指南

## 🎯 目标

将 Electron 应用配置为连接到远程后端服务: **http://42.192.76.234:8080**

## ✅ 已完成的工作

### 1. 环境配置
- ✅ 创建 `.env.electron` 文件
- ✅ 配置后端地址为 `http://42.192.76.234:8080/prod-api`
- ✅ 配置监控和任务调度地址

### 2. 构建配置
- ✅ 更新 `electron.vite.config.ts` 支持环境变量
- ✅ 修改 `package.json` 构建脚本
- ✅ 支持跨平台打包 (Windows/macOS/Linux)

### 3. 请求模块
- ✅ 创建 `src/utils/electron-request.ts` 专用请求模块
- ✅ 硬编码后端地址确保可靠性

### 4. 文档和工具
- ✅ 创建详细配置文档
- ✅ 创建快速参考指南
- ✅ 创建自动验证脚本

## 🚀 快速开始

### 开发环境

```bash
# 启动 Electron 应用开发环境
npm run dev:electron

# 打开浏览器开发者工具 (F12)
# 查看 Network 标签，确认请求发送到 http://42.192.76.234:8080
```

### 生产构建

```bash
# 构建 Electron 应用
npm run build:electron

# 打包为可执行文件
npm run dist:win      # Windows (.exe)
npm run dist:mac      # macOS (.dmg)
npm run dist:linux    # Linux (.AppImage)
```

### 验证配置

```bash
# 运行验证脚本
./scripts/verify-electron-config.sh

# 输出应该显示: ✓ 所有配置验证通过！
```

## 📁 关键文件

### 配置文件
- `.env.electron` - Electron 环境变量配置
- `electron.vite.config.ts` - Electron Vite 构建配置
- `package.json` - 构建脚本定义

### 请求模块
- `src/utils/electron-request.ts` - Electron 专用 API 请求模块
- `src/utils/request.ts` - Web 应用通用请求模块（保持不变）

### 文档
- `ELECTRON_QUICK_REFERENCE.md` - 快速参考指南
- `docs/Electron-Backend-Configuration.md` - 详细配置指南
- `docs/ELECTRON_BACKEND_UPDATE_SUMMARY.md` - 更新总结
- `IMPLEMENTATION_REPORT.md` - 实现报告
- `WORK_SUMMARY.md` - 工作完成总结

### 工具
- `scripts/verify-electron-config.sh` - 配置验证脚本

## 🔧 配置说明

### .env.electron 文件

```env
# 环境标识
VITE_APP_ENV = 'electron'

# 后端 API 基础路径
VITE_APP_BASE_API = 'http://42.192.76.234:8080/prod-api'

# 监控地址
VITE_APP_MONITRO_ADMIN = 'http://42.192.76.234:8080/admin/applications'

# PowerJob 控制台地址
VITE_APP_POWERJOB_ADMIN = 'http://42.192.76.234:8080/powerjob'

# 其他配置...
```

### 构建脚本

```json
{
  "scripts": {
    "build:electron": "electron-vite build --mode electron",
    "dist:win": "cross-env VITE_APP_ENV=electron electron-builder --win",
    "dist:mac": "cross-env VITE_APP_ENV=electron electron-builder --mac",
    "dist:linux": "cross-env VITE_APP_ENV=electron electron-builder --linux"
  }
}
```

## 🧪 测试连接

### 方法 1: 开发者工具检查

1. 运行 `npm run dev:electron`
2. 打开开发者工具 (F12)
3. 查看 Network 标签
4. 确认请求发送到 `http://42.192.76.234:8080`

### 方法 2: 控制台检查

在浏览器控制台输入:
```javascript
console.log('API Base URL:', import.meta.env.VITE_APP_BASE_API)
// 输出: http://42.192.76.234:8080/prod-api
```

### 方法 3: API 测试

```javascript
import service from '@/utils/request'

service.get('/system/user/list')
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err))
```

## 📊 Electron vs Web 应用对比

| 项目 | Electron | Web 应用 |
|------|----------|---------|
| 环境文件 | `.env.electron` | `.env.development` / `.env.production` |
| 后端地址 | `http://42.192.76.234:8080/prod-api` | `/prod-api` (相对路径) |
| 构建命令 | `npm run build:electron` | `npm run build:prod` |
| 环境标识 | `electron` | `development` / `production` |
| 配置影响 | 仅 Electron 应用 | 仅 Web 应用 |

## ✨ 特点

✅ **隔离配置**: Electron 和 Web 应用使用独立配置  
✅ **自动验证**: 提供脚本验证配置正确性  
✅ **完整文档**: 详细的配置和使用文档  
✅ **跨平台支持**: Windows、macOS、Linux  
✅ **易于维护**: 清晰的文件结构和注释  

## 🔍 常见问题

### Q: 如何修改后端地址?
A: 编辑 `.env.electron` 文件中的 `VITE_APP_BASE_API` 变量，然后重新构建应用。

### Q: Web 应用会受到影响吗?
A: 不会。Web 应用使用独立的 `.env.development` 和 `.env.production` 配置。

### Q: 如何验证配置是否正确?
A: 运行 `./scripts/verify-electron-config.sh` 脚本。

### Q: 打包后的应用如何更新后端地址?
A: 需要修改 `.env.electron` 并重新构建和打包应用。

### Q: 可以在运行时修改后端地址吗?
A: 当前不支持，但可以在 Electron 主进程中实现动态配置。

## 🛠️ 故障排除

### 问题: 无法连接到后端
**检查清单**:
1. 确认后端服务运行在 `http://42.192.76.234:8080`
2. 检查防火墙设置
3. 查看浏览器控制台错误信息
4. 运行验证脚本: `./scripts/verify-electron-config.sh`

### 问题: 请求发送到错误的地址
**解决方案**:
1. 检查 `.env.electron` 配置
2. 清除缓存: `rm -rf dist/`
3. 重新构建: `npm run build:electron`

### 问题: 验证脚本失败
**解决方案**:
1. 确保所有文件都已创建
2. 检查文件内容是否正确
3. 运行 `git status` 查看文件状态

## 📚 相关文档

1. **快速参考** - `ELECTRON_QUICK_REFERENCE.md`
2. **配置指南** - `docs/Electron-Backend-Configuration.md`
3. **更新总结** - `docs/ELECTRON_BACKEND_UPDATE_SUMMARY.md`
4. **实现报告** - `IMPLEMENTATION_REPORT.md`
5. **工作总结** - `WORK_SUMMARY.md`

## 💡 后续改进建议

1. **动态配置**: 在应用设置中添加后端地址配置选项
2. **多环境**: 创建 staging、production 等环境配置
3. **自动化**: 集成 CI/CD 流程自动构建和发布
4. **版本管理**: 在应用中显示当前连接的后端地址
5. **健康检查**: 添加后端服务健康检查功能

## ⚠️ 重要提示

- Electron 应用的后端地址在构建时被硬编码
- 修改后端地址需要重新构建和打包应用
- 建议在 CI/CD 流程中实现不同环境的自动构建
- Web 应用配置完全独立，不受 Electron 配置影响

## 🎓 学习资源

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://vuejs.org/)

---

**最后更新**: 2025-11-28  
**版本**: 1.0  
**状态**: ✅ 完成

如有问题或建议，请查阅相关文档或运行验证脚本。

