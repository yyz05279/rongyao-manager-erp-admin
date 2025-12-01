# 侧边栏功能按钮无响应问题诊断与修复

## 问题描述
用户报告点击侧边栏的功能按钮没有响应。

## 根本原因分析

### 1. WebSocket 网址构建错误（主要原因）
**症状**: 控制台显示 WebSocket 网址构建错误
```
Failed to construct 'WebSocket': The URL 'ws://localhost:5173http://42.192.76.234:8080/resource/websocket?...' is invalid.
```

**原因**:
- 在 `src/views/index.vue` 的 `onMounted` 钩子中，WebSocket 网址构建逻辑使用了 `VITE_APP_BASE_API`
- 在开发环境中，`VITE_APP_BASE_API` 被代理到真实后端地址（如 `http://42.192.76.234:8080`）
- 导致网址中出现重复的协议前缀：`ws://localhost:5173` + `http://42.192.76.234:8080`
- WebSocket 初始化失败导致首页 mounted 钩子抛出异常，影响整个页面的交互

### 2. 首页标签类型错误
**症状**: 控制台警告 `Invalid prop: validation failed for prop "type". Expected one of ["success", "info", "warning", "danger", ""], got value "primary"`

**原因**:
- Element Plus 的 ElTag 组件只支持特定的类型值
- 首页中使用了不支持的 `type="primary"`

### 3. 首页 mounted 钩子异常
**症状**: 路由导航时出现异常，可能导致页面交互受阻

**原因**: WebSocket 初始化失败导致异常未被捕获

## 修复方案

### 1. 修复 WebSocket 网址构建逻辑
**文件**: `src/views/index.vue`

修改 `onMounted` 钩子：
- 不再使用代理的 `VITE_APP_BASE_API`
- 直接使用本地主机地址构建 WebSocket 网址
- 添加 try-catch 错误处理
- 添加详细的日志输出

### 2. 增强 WebSocket 初始化的验证
**文件**: `src/utils/websocket.ts`

修改 `initWebSocket` 函数：
- 验证网址格式
- 检测网址中是否存在重复的协议前缀
- 验证网址是否以 `ws://` 或 `wss://` 开头
- 添加 try-catch 错误捕获
- 添加详细的日志输出

### 3. 修复标签类型
**文件**: `src/views/index.vue`

将 `type="primary"` 改为 `type="info"`

### 4. 添加菜单项点击调试
**文件**: `src/layout/components/Sidebar/SidebarItem.vue`

- 添加 `@click` 事件处理器
- 输出菜单项点击的调试信息

## 测试步骤

1. 清除浏览器缓存
2. 重新加载页面
3. 检查控制台是否还有错误
4. 尝试点击侧边栏的功能按钮
5. 检查是否能正确导航到对应页面

## 预期结果

- ✓ 首页加载时不再出现 WebSocket 错误
- ✓ 首页不再出现标签类型错误
- ✓ 侧边栏功能按钮点击时能正确响应
- ✓ 能正确导航到对应页面

