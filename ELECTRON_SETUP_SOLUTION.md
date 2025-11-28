# Electron 开发环境问题解决方案

## 问题总结

执行 `npm run dev:electron` 时遇到的问题：

1. **权限问题**: `Permission denied` - electron-vite 可执行文件没有执行权限
2. **配置问题**: electron-vite 配置不完整，缺少必要的输出目录和插件配置
3. **环境变量问题**: dev:electron 命令没有使用 `.env.electron` 配置文件中的线上 API 地址

## 解决方案

### 1. 修复权限问题 ✅

**问题**: 
```
sh: /Users/yyz/Desktop/haitang-web-admin/node_modules/.bin/electron-vite: Permission denied
```

**解决**:
```bash
chmod +x node_modules/.bin/*
```

这个命令修复了所有 node_modules 中可执行文件的权限。

### 2. 更新 electron.vite.config.ts ✅

**问题**: 配置不完整，缺少必要的输出目录和插件配置

**修改内容**:
- 导入 `createPlugins` 函数以使用所有必要的 Vite 插件
- 为 main 进程添加 `outDir: 'dist/main'` 配置
- 为 preload 进程添加 `outDir: 'dist/preload'` 配置  
- 为 renderer 进程添加完整的插件配置和 rollupOptions
- 添加 UnoCSS 到 external 配置以避免构建错误
- 复制所有必要的环境变量定义

**关键配置**:
```typescript
import createPlugins from './vite/plugins'

// main 进程
main: {
  entry: 'src/main/index.ts',
  vite: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: ['sqlite3', 'better-sqlite3']
      }
    }
  }
}

// renderer 进程
renderer: {
  root: '.',
  entry: 'index.html',
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: 'index.html',
      external: ['uno.css']
    }
  },
  plugins: createPlugins(env, command === 'build'),
  // ... 其他配置
}
```

### 3. 创建符号链接 ✅

**问题**: electron-vite 在开发模式下生成文件到 `out/` 目录，但期望在 `dist/` 目录

**解决**:
```bash
mkdir -p dist && ln -sf ../out/main dist/main && ln -sf ../out/preload dist/preload
```

### 4. 更新 package.json 脚本 ✅

**问题**: `dev:electron` 命令没有使用 `--mode electron` 参数，导致使用默认环境变量而不是 `.env.electron`

**修改**:
```json
{
  "scripts": {
    "dev:electron": "electron-vite dev --mode electron",
    "preview:electron": "electron-vite preview --mode electron"
  }
}
```

这样可以确保使用 `.env.electron` 文件中的配置，包括线上 API 地址：
```
VITE_APP_BASE_API = 'http://42.192.76.234:8080/prod-api'
```

## 修改的文件

1. **electron.vite.config.ts** - 完整的配置更新
2. **package.json** - 更新 dev:electron 和 preview:electron 脚本
3. **dist/main** 和 **dist/preload** - 创建的符号链接

## 验证

现在可以成功运行：
```bash
npm run dev:electron
```

输出应该显示：
```
vite v4.3.1 building SSR bundle for electron...
✓ built in XXXms

build the electron main process successfully

-----

dev server running for the electron renderer process at:
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

start electron app...
```

## 注意事项

1. 如果遇到 "Port 5173 is in use" 的警告，系统会自动使用下一个可用端口（如 5174）
2. 路由配置中仍然有一些缺失的 Vue 文件引用（在 src/router/modules/saltprocess.ts），这些需要创建相应的文件或从路由中移除
3. Electron 应用现在使用线上 API 地址 `http://42.192.76.234:8080/prod-api`

## 后续建议

1. 创建缺失的 Vue 文件，或从路由配置中注释/移除这些引用
2. 测试 Electron 应用与后端 API 的连接
3. 验证所有功能在 Electron 环境中正常运行

