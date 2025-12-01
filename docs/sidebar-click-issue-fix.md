# 侧边栏功能按钮无响应问题诊断与修复

## 问题描述
用户报告点击侧边栏的功能按钮没有响应。

## 根本原因分析

### 1. WebSocket 初始化错误
**症状**: 控制台显示 WebSocket URL 构建错误
```
Failed to construct 'WebSocket': The URL 'ws://localhost:5173http://42.192.76.234:8080/resource/websocket?...' is invalid.
```

**原因**: 
- 在 `src/views/index.vue` 的 `mounted` 钩子中，WebSocket URL 构建逻辑不完善
- 当 `VITE_APP_BASE_API` 被代理到真实后端地址时，导致 URL 中出现重复的协议前缀
- WebSocket 初始化失败导致首页 mounted 钩子抛出异常，可能影响整个页面的交互

### 2. 首页 ElTag 类型错误
**症状**: 控制台警告 `Invalid prop: validation failed for prop "type". Expected one of ["success", "info", "warning", "danger", ""], got value "primary"`

**原因**: 
- Element Plus 的 ElTag 组件只支持特定的类型值
- 首页中使用了不支持的 `type="primary"`

### 3. 首页 mounted 钩子异常
**症状**: 路由导航时出现异常，可能导致页面交互受阻

**原因**: WebSocket 初始化失败导致异常未被捕获

## 修复方案

### 1. 增强 WebSocket 初始化的错误处理
**文件**: `src/utils/websocket.ts`

修改 `initWebSocket` 函数：
- 添加 URL 格式验证
- 检测 URL 中是否存在重复的协议前缀
- 添加 try-catch 错误捕获
- 添加详细的日志输出

### 2. 修复首页 mounted 钩子
**文件**: `src/views/index.vue`

修改 `onMounted` 钩子：
- 添加 try-catch 错误处理
- 确保 WebSocket 初始化失败不会中断页面加载
- 添加详细的日志输出

### 3. 修复 ElTag 类型
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

- 首页加载时不再出现 WebSocket 错误
- 首页不再出现 ElTag 类型错误
- 侧边栏功能按钮点击时能正确响应
- 能正确导航到对应页面

