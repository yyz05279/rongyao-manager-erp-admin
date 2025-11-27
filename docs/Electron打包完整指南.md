# Electron 桌面应用打包完整指南

## 📋 目录
1. [项目准备](#项目准备)
2. [项目结构](#项目结构)
3. [安装依赖](#安装依赖)
4. [配置文件](#配置文件)
5. [主进程开发](#主进程开发)
6. [预加载脚本](#预加载脚本)
7. [构建和打包](#构建和打包)
8. [发布和分发](#发布和分发)
9. [常见问题](#常见问题)

---

## 项目准备

### 当前项目状态

您的项目已经是一个完整的 Vue3 应用：
- ✅ Vue 3.4.20
- ✅ TypeScript 4.9.5
- ✅ Element Plus 2.2.27
- ✅ Vite 4.3.1
- ✅ 已配置好的路由和状态管理

### 需要添加的内容

1. Electron 主进程代码
2. 预加载脚本
3. electron-vite 配置
4. electron-builder 打包配置

---

## 项目结构

### 推荐的项目结构

```
haitang-web-admin/
├── src/
│   ├── main/                    # ← 新增：Electron 主进程
│   │   ├── index.ts
│   │   ├── preload.ts
│   │   └── utils.ts
│   ├── preload/                 # ← 新增：预加载脚本
│   │   └── index.ts
│   ├── renderer/                # 现有的 Vue 应用
│   │   ├── src/
│   │   ├── index.html
│   │   └── ...
│   └── ...
├── electron.vite.config.ts      # ← 新增：electron-vite 配置
├── Dockerfile                   # 现有
├── package.json                 # 需要更新
└── ...
```

---

## 安装依赖

### 步骤 1：安装 Electron 相关包

```bash
npm install --save-dev \
  electron \
  electron-vite \
  electron-builder \
  @vitejs/plugin-vue
```

### 步骤 2：验证安装

```bash
npm list electron electron-vite electron-builder
```

---

## 配置文件

### 1. 创建 electron.vite.config.ts

在项目根目录创建 `electron.vite.config.ts`：

```typescript
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  main: {
    entry: 'src/main/index.ts',
    vite: {
      build: {
        rollupOptions: {
          external: ['sqlite3', 'better-sqlite3']
        }
      }
    }
  },
  preload: {
    entry: 'src/preload/index.ts'
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'dist/renderer'
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
```

### 2. 更新 package.json

```json
{
  "name": "haitang-admin",
  "version": "1.0.0",
  "description": "江苏联储ERP管理系统",
  "main": "dist/main/index.js",
  "author": "HaiTang Team",
  "license": "MIT",
  
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "dist:win": "electron-builder --win",
    "dist:mac": "electron-builder --mac",
    "dist:linux": "electron-builder --linux"
  },
  
  "build": {
    "appId": "com.haitang.admin",
    "productName": "海棠企业管理系统",
    "directories": {
      "buildResources": "assets"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "certificateFile": null,
      "certificatePassword": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "海棠企业管理系统"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.business"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    }
  }
}
```

---

## 主进程开发

### 创建 src/main/index.ts

```typescript
import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import path from 'path'
import { isDev, getAssetPath } from './utils'

let mainWindow: BrowserWindow | null = null

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 创建菜单
  createMenu()
}

// 创建应用菜单
function createMenu() {
  const template: any[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '切换开发者工具', accelerator: 'F12', role: 'toggleDevTools' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 事件处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-path', () => {
  return app.getAppPath()
})

// App 事件
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// 处理任何未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})
```

### 创建 src/main/utils.ts

```typescript
import path from 'path'

export const isDev = process.env.NODE_ENV === 'development'

export function getAssetPath(...paths: string[]): string {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  return path.join(RESOURCES_PATH, ...paths)
}

export function getPreloadPath(): string {
  return path.join(__dirname, '../preload/index.js')
}
```

---

## 预加载脚本

### 创建 src/preload/index.ts

```typescript
import { contextBridge, ipcRenderer } from 'electron'

// 暴露 IPC 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => {
      ipcRenderer.send(channel, ...args)
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    },
    once: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args))
    },
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args)
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func)
    }
  },
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path')
  }
})

// TypeScript 类型定义
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void
        on: (channel: string, func: (...args: any[]) => void) => void
        once: (channel: string, func: (...args: any[]) => void) => void
        invoke: (channel: string, ...args: any[]) => Promise<any>
        removeListener: (channel: string, func: (...args: any[]) => void) => void
      }
      app: {
        getVersion: () => Promise<string>
        getAppPath: () => Promise<string>
      }
    }
  }
}
```

---

## 构建和打包

### 步骤 1：开发模式

```bash
npm run dev
```

### 步骤 2：生产构建

```bash
npm run build
```

### 步骤 3：打包为可执行文件

```bash
# 打包为当前平台的安装程序
npm run dist

# 或指定平台
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux

# 仅生成目录（不打包）
npm run pack
```

### 输出文件

打包完成后，可执行文件位于 `dist/` 目录：

```
dist/
├── 海棠企业管理系统 1.0.0.exe      # Windows 安装程序
├── 海棠企业管理系统 1.0.0.exe.blockmap
├── 海棠企业管理系统 Setup 1.0.0.exe # NSIS 安装程序
├── 海棠企业管理系统 1.0.0.dmg      # macOS 安装程序
├── 海棠企业管理系统-1.0.0.AppImage  # Linux AppImage
└── ...
```

---

## 发布和分发

### 方式 1：直接分发可执行文件

1. 将 `dist/` 中的 `.exe`、`.dmg` 或 `.AppImage` 文件分发给用户
2. 用户直接运行安装程序

### 方式 2：配置自动更新

在 `package.json` 中添加：

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "haitang-web-admin"
    }
  }
}
```

### 方式 3：创建安装程序

Windows NSIS 配置已在 `package.json` 中配置，会自动生成：
- 安装程序（`.exe`）
- 便携版（`.exe`）

---

## 常见问题

### Q1：如何在开发中测试 IPC 通信？

在 Vue 组件中：

```typescript
export default {
  methods: {
    async getAppVersion() {
      const version = await window.electron.app.getVersion()
      console.log('App Version:', version)
    }
  }
}
```

### Q2：如何添加应用图标？

1. 创建 `assets/` 文件夹
2. 添加 `icon.png`（512x512）
3. 在 `src/main/index.ts` 中使用

### Q3：如何处理后台服务？

```typescript
// 在主进程中启动后台服务
import { spawn } from 'child_process'

let backendProcess: any = null

function startBackendService() {
  backendProcess = spawn('path/to/backend/executable')
  
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`)
  })
}

app.on('ready', () => {
  startBackendService()
  createWindow()
})

app.on('quit', () => {
  if (backendProcess) {
    backendProcess.kill()
  }
})
```

### Q4：如何打包后台服务？

在 `package.json` 的 `build.files` 中添加：

```json
{
  "build": {
    "files": [
      "dist/**/*",
      "node_modules/**/*",
      "backend/**/*"  # 添加后台服务
    ]
  }
}
```

---

## 下一步

1. **创建项目结构**：按照上面的结构创建文件
2. **实现主进程**：复制主进程代码
3. **实现预加载脚本**：复制预加载脚本代码
4. **测试开发模式**：`npm run dev`
5. **构建和打包**：`npm run dist`
6. **分发应用**：将生成的可执行文件分发给用户

---

## 参考资源

- Electron 官方文档：https://www.electronjs.org/docs
- electron-vite：https://electron-vite.org/
- electron-builder：https://www.electron.build/

