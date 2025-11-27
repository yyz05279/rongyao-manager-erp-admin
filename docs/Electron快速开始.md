# Electron 快速开始指南

## [object Object] 分钟快速开始

### 前置要求

- ✅ Node.js 14+ 已安装
- ✅ npm 或 yarn 已安装
- ✅ 项目已初始化

### 步骤 1：安装依赖

```bash
npm install
```

### 步骤 2：开发模式运行

```bash
npm run dev:electron
```

**预期结果：**
- ✅ Electron 窗口打开
- ✅ Vue 应用加载
- ✅ DevTools 自动打开

### 步骤 3：构建应用

```bash
npm run build:electron
```

### 步骤 4：打包为可执行文件

```bash
# 打包为当前平台的安装程序
npm run dist

# 或指定平台
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

**输出文件位于：** `dist/` 目录

---

## 📁 项目结构

```
haitang-web-admin/
├── src/
│   ├── main/                    # ✅ Electron 主进程
│   │   ├── index.ts            # 主进程入口
│   │   ├── utils.ts            # 工具函数
│   │   └── backend.ts          # 后台服务管理
│   ├── preload/                 # ✅ 预加载脚本
│   │   └── index.ts            # 预加载脚本入口
│   ├── renderer/                # 现有的 Vue 应用
│   │   └── ...
│   └── ...
├── electron.vite.config.ts      # ✅ electron-vite 配置
├── package.json                 # ✅ 已更新
└── ...
```

---

## 🔧 常用命令

### 开发

```bash
npm run dev:electron        # 开发模式
npm run build:electron      # 生产构建
npm run preview:electron    # 预览构建结果
```

### 打包

```bash
npm run pack                # 生成目录（不打包）
npm run dist                # 打包为安装程序
npm run dist:win            # Windows 专用
npm run dist:mac            # macOS 专用
npm run dist:linux          # Linux 专用
```

---

## 🎯 集成后台服务

### 步骤 1：准备后台服务

在项目根目录创建 `backend/` 文件夹：

```
backend/
├── backend.exe              # Windows 可执行文件
├── backend                  # macOS/Linux 可执行文件
└── config.yml              # 配置文件（可选）
```

### 步骤 2：后台服务要求

后台服务需要：
1. 支持 `--server.port=8080` 参数
2. 提供 `/health` 健康检查端点
3. 支持 SIGTERM 信号优雅关闭

### 步骤 3：测试集成

```bash
npm run dev:electron
```

**检查点：**
- ✅ 后台服务自动启动
- ✅ 前端可以访问 API
- ✅ 应用关闭时后台服务也关闭

---

## 🐛 调试

### 打开 DevTools

```bash
# 开发模式自动打开
npm run dev:electron

# 或按 F12
```

### 查看日志

```typescript
// 主进程日志
console.log('[Backend] Service started')

// 在 DevTools 中查看
```

### 测试后台连接

```typescript
// 在 Vue 组件中
const backendUrl = await window.electron.ipcRenderer.invoke('get-backend-url')
console.log('Backend URL:', backendUrl)

// 测试连接
fetch(`${backendUrl}/health`)
  .then(r => console.log('Connected'))
  .catch(e => console.error('Failed', e))
```

---

## 📦 打包输出

### Windows

```
dist/
├── 海棠企业管理系统 1.0.0.exe      # 便携版
├── 海棠企业管理系统 Setup 1.0.0.exe # 安装程序
└── ...
```

### macOS

```
dist/
├── 海棠企业管理系统 1.0.0.dmg      # DMG 安装程序
├── 海棠企业管理系统-1.0.0.zip      # ZIP 压缩包
└── ...
```

### Linux

```
dist/
├── 海棠企业管理系统-1.0.0.AppImage  # AppImage
├── 海棠企业管理系统-1.0.0.deb       # Debian 包
└── ...
```

---

## ✅ 验证打包结果

### Windows

```bash
# 运行安装程序
dist\海棠企业管理系统 Setup 1.0.0.exe

# 或运行便携版
dist\海棠企业管理系统 1.0.0.exe
```

### macOS

```bash
# 打开 DMG 文件
open dist/海棠企业管理系统\ 1.0.0.dmg

# 或运行 ZIP 中的应用
unzip dist/海棠企业管理系统-1.0.0.zip
open 海棠企业管理系统.app
```

### Linux

```bash
# 运行 AppImage
chmod +x dist/海棠企业管理系统-1.0.0.AppImage
./dist/海棠企业管理系统-1.0.0.AppImage

# 或安装 Debian 包
sudo dpkg -i dist/海棠企业管理系统-1.0.0.deb
```

---

## 🆘 常见问题

### Q1：开发模式无法启动

**检查：**
```bash
# 检查依赖是否安装
npm list electron electron-vite

# 重新安装
rm -rf node_modules package-lock.json
npm install
```

### Q2：后台服务启动失败

**检查：**
1. 确认 `backend/` 文件夹存在
2. 确认可执行文件有执行权限
3. 查看 DevTools 中的日志

```bash
# macOS/Linux 添加执行权限
chmod +x backend/backend
```

### Q3：打包失败

**检查：**
```bash
# 清理构建文件
rm -rf dist

# 重新构建
npm run build:electron

# 重新打包
npm run dist
```

### Q4：应用无法连接后台

**检查：**
1. 后台服务是否启动
2. 端口是否被占用
3. 防火墙设置

```bash
# 检查端口
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows
```

---

## 📚 详细文档

- **Electron 完整指南：** `docs/Electron打包完整指南.md`
- **后台服务集成：** `docs/后台服务集成指南.md`
- **打包部署方案：** `docs/打包部署方案.md`

---

## 🎉 下一步

1. ✅ 安装依赖：`npm install`
2. ✅ 开发测试：`npm run dev:electron`
3. ✅ 准备后台：将后台服务放在 `backend/` 文件夹
4. ✅ 打包应用：`npm run dist`
5. ✅ 分发应用：将 `dist/` 中的文件分发给用户

---

## 💡 最佳实践

1. **开发时使用 DevTools**
   ```bash
   npm run dev:electron
   ```

2. **定期测试打包**
   ```bash
   npm run dist
   ```

3. **使用版本控制**
   ```bash
   git commit -m "feat: update to v1.1.0"
   git tag v1.1.0
   ```

4. **记录变更日志**
   - 创建 `CHANGELOG.md` 文件
   - 记录每个版本的变更

5. **测试不同平台**
   - 在 Windows、macOS、Linux 上测试
   - 确保应用在所有平台上正常运行

---

## 📞 获取帮助

- 查看详细文档
- 检查 DevTools 日志
- 查看构建输出
- 参考 Electron 官方文档：https://www.electronjs.org/docs

