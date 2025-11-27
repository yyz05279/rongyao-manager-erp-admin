# 海棠企业管理系统 - 部署指南

欢迎使用海棠企业管理系统！本指南提供了完整的部署和打包方案。

## 🚀 快速开始（选择一个方案）

### 方案 A：Electron 桌面应用（⭐ 推荐）

**最适合：** 完整的桌面应用、离线运行、系统集成

```bash
# 1. 安装依赖
npm install

# 2. 开发模式测试
npm run dev:electron

# 3. 打包应用
npm run build:electron
npm run dist
```

**输出文件：** `dist/` 目录中的 `.exe`、`.dmg` 或 `.AppImage`

**详细文档：** [docs/Electron快速开始.md](./docs/Electron快速开始.md)

---

### 方案 B：静态服务器（快速测试）

**最适合：** 快速测试、演示、小规模部署

```bash
# 1. 构建项目
npm run build:prod

# 2. 启动服务器
npm run serve:dist
```

**访问地址：** http://localhost:8080

**详细文档：** [docs/快速部署指南.md](./docs/快速部署指南.md)

---

### 方案 C：Docker 容器化（企业级）

**最适合：** 企业级部署、多机器分发、环境一致性

```bash
# 启动容器
docker-compose up -d
```

**访问地址：** http://localhost:8080

**详细文档：** [docs/打包部署方案.md](./docs/打包部署方案.md)

---

## 📚 完整文档导航

### 🎯 部署方案

| 文档 | 描述 | 适用场景 |
|------|------|---------|
| [部署方案总结](./docs/部署方案总结.md) | 三大方案对比和选择指南 | 需要选择方案 |
| [打包部署方案](./docs/打包部署方案.md) | 详细的三大方案实现指南 | 需要详细说明 |
| [快速部署指南](./docs/快速部署指南.md) | 快速参考和命令速查 | 快速查阅 |

### 🖥️ Electron 桌面应用

| 文档 | 描述 |
|------|------|
| [Electron 快速开始](./docs/Electron快速开始.md) | 5 分钟快速开始 |
| [Electron 打包完整指南](./docs/Electron打包完整指南.md) | 详细的实现指南 |
| [后台服务集成指南](./docs/后台服务集成指南.md) | 后台服务集成方案 |
| [后台服务示例-Java](./docs/后台服务示例-Java.md) | Java 后台服务示例 |

---

## 📋 常用命令

### 开发

```bash
npm run dev                 # Vue 开发模式
npm run dev:electron        # Electron 开发模式
npm run build:prod          # 生产构建（Web）
npm run build:electron      # 生产构建（Electron）
```

### 部署

```bash
npm run serve:dist          # 启动静态服务器
npm run preview             # 预览 Web 构建
npm run preview:electron    # 预览 Electron 构建
```

### 打包

```bash
npm run pack                # 生成 Electron 目录
npm run dist                # 打包 Electron 应用
npm run dist:win            # Windows 专用
npm run dist:mac            # macOS 专用
npm run dist:linux          # Linux 专用
```

---

## 🏗️ 后台服务集成

### 支持的后台服务

- ✅ Java (Spring Boot)
- ✅ Go
- ✅ Python
- ✅ Node.js
- ✅ 其他支持命令行启动的服务

### 集成步骤

1. **准备后台服务**
   - 编译为可执行文件
   - 支持 `--server.port=8080` 参数
   - 提供 `/health` 健康检查端点

2. **放置文件**
   ```
   backend/
   ├── backend.exe              # Windows
   ├── backend                  # macOS/Linux
   └── config.yml              # 配置文件
   ```

3. **打包应用**
   ```bash
   npm run dist
   ```

4. **分发应用**
   - 用户直接运行安装程序
   - 应用自动启动后台服务

**详细文档：** [docs/后台服务集成指南.md](./docs/后台服务集成指南.md)

---

## 🆘 常见问题

### Q1：如何选择部署方案？

- **快速测试**：使用方案 B（静态服务器）
- **完整应用**：使用方案 A（Electron）
- **企业部署**：使用方案 C（Docker）

### Q2：如何集成后台服务？

参考 [后台服务集成指南](./docs/后台服务集成指南.md)

### Q3：如何打包为可执行文件？

```bash
npm run dist
```

### Q4：如何在不同平台上打包？

```bash
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

### Q5：如何调试应用？

```bash
npm run dev:electron
# 按 F12 打开 DevTools
```

---

## 📊 项目信息

- **项目名称：** 海棠企业管理系统
- **前端框架：** Vue 3.4.20
- **构建工具：** Vite 4.3.1
- **桌面框架：** Electron
- **UI 组件库：** Element Plus 2.2.27

---

## 🎉 开始使用

### 第一步：安装依赖
```bash
npm install
```

### 第二步：选择部署方案

**推荐：Electron 桌面应用**
```bash
npm run dev:electron
npm run dist
```

### 第三步：分发应用

- Electron：分发 `dist/` 中的安装程序
- Web：部署 `dist/` 文件夹
- Docker：使用 Docker 镜像

---

## 📞 获取帮助

1. **查看详细文档** - 参考上面的文档导航
2. **检查日志** - 开发模式下查看 DevTools 控制台
3. **参考示例** - [后台服务示例-Java](./docs/后台服务示例-Java.md)
4. **官方资源**
   - Electron：https://www.electronjs.org/docs
   - Vite：https://vitejs.dev/
   - Vue 3：https://vuejs.org/

---

**祝您使用愉快！** 🎉

