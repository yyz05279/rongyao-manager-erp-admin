# 侧边栏功能调试指南

## 快速诊断

### 1. 检查控制台输出
打开浏览器开发者工具 (F12)，查看控制台标签：

**正常情况下应该看到**:
```
✅ 从映射表获取组件: 记录 (完整路径: /盐碱工艺/记录)
✅ 从映射表获取组件: 制盐任务 (完整路径: /盐碱工艺/制盐任务)
WebSocket 连接地址: ws://localhost:5173/resource/websocket
正在初始化 WebSocket，网址: ws://localhost:5173/resource/websocket?...
```

**不应该看到**:
```
Failed to construct 'WebSocket': The URL 'ws://...' is invalid.
WebSocket 网址格式错误，包含多个协议前缀
Invalid prop: validation failed for prop "type"
```

### 2. 检查菜单项点击
在控制台中应该看到类似的日志：
```
菜单项被点击: {
  itemName: "盐碱工艺流程",
  itemPath: "/saltprocess",
  basePath: "/saltprocess",
  resolvedPath: "/saltprocess/record"
}
```

### 3. 检查路由导航
- 点击菜单项后，网址应该改变
- 页面内容应该更新
- 菜单项应该被高亮

## 常见问题排查

### 问题 1: 菜单项点击无响应
**检查清单**:
1. 确认菜单项的 `path` 配置正确
2. 确认对应的路由已注册
3. 检查控制台是否有错误
4. 检查 router-link 是否正确工作

### 问题 2: WebSocket 连接失败
**检查清单**:
1. 确认 `.env.development` 中 `VITE_APP_WEBSOCKET = false`
2. 如需启用，确保后端 WebSocket 服务正常运行
3. 检查控制台是否显示"WebSocket 网址格式错误"

### 问题 3: 首页加载错误
**检查清单**:
1. 清除浏览器缓存
2. 检查控制台是否有标签类型错误
3. 检查是否有其他 Vue 警告
4. 重新加载页面

## 调试技巧

### 启用详细日志
在 `src/layout/components/Sidebar/SidebarItem.vue` 中修改 `handleMenuClick`:
```typescript
const handleMenuClick = () => {
    console.log('菜单项被点击:', {
        itemName: props.item.name,
        itemPath: props.item.path,
        basePath: props.basePath,
        resolvedPath: resolvePath(onlyOneChild.value.path, onlyOneChild.value.query),
        timestamp: new Date().toISOString()
    });
}
```

### 检查路由配置
在浏览器控制台执行：
```javascript
// 检查当前路由
console.log(router.getRoutes());

// 检查当前路由信息
console.log(router.currentRoute.value);
```

## 性能优化建议

1. 减少菜单项数量
2. 使用虚拟滚动处理大量菜单项
3. 懒加载子菜单
4. 缓存菜单数据

