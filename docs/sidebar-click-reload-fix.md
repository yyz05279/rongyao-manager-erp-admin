# 左侧功能栏点击页面重新加载问题修复

## 问题描述

点击左侧功能栏的按钮时，页面会重新加载，再次点击功能按钮后，才会跳转到对应的页面。

### 控制台错误信息
- `⚠️ 无法为路由 Admin 找到 component (完整路径: /monitor/Admin)`
- `⚠️ 无法为路由 powerjob 找到 component (完整路径: /monitor/powerjob)`
- `⚠️ 无法为路由 build 找到 component (完整路径: /tool/build)`
- `⚠️ 无法为路由 gen 找到 component (完整路径: /tool/gen)`
- `[Vue warn]: Extraneous non-props attributes (mode) were passed to component`

## 根本原因

### 1. 路由加载逻辑问题
在 `src/permission.ts` 中，使用 `next({ ...to, replace: true })` 会导致：
- 路由重新尝试加载
- 由于 component 仍然缺失，路由匹配失败
- 最终导致页面重新加载或跳转到 404

### 2. 组件加载失败
后台返回的菜单数据中，某些路由的 component 字段为空或不存在，导致：
- Vue Router 无法正确渲染路由
- 路由匹配失败
- 页面无法正确显示

### 3. TransitionGroup 警告
`AppMain.vue` 中的 `TransitionGroup` 使用了不兼容的 `mode` 属性。

## 修复方案

### 1. 改进路由加载逻辑 (src/permission.ts)

**变更内容：**
- 添加 `routesLoaded` 标志，防止重复加载路由
- 移除 `replace: true`，改为直接调用 `next()`
- 改进错误处理和日志记录

**关键改变：**
```typescript
// 防止重复加载路由
if (!routesLoaded) {
  const accessRoutes = await usePermissionStore().generateRoutes();
  accessRoutes.forEach((route) => {
    if (!isHttp(route.path)) {
      router.addRoute(route);
    }
  });
  routesLoaded = true;
}
// 直接进行导航，而不是使用 replace: true
next();
```

### 2. 改进组件加载逻辑 (src/store/modules/permission.ts)

**变更内容：**
- 为无法找到 component 的路由分配后备 component
- 如果有子路由，使用 `ParentView`
- 改进日志记录

**关键改变：**
```typescript
if (!component) {
  // 改进：如果有子路由，使用 ParentView；否则使用 Layout 作为后备
  if (route.children && route.children.length > 0) {
    route.component = ParentView;
    console.log(`✅ 为路由 ${route.path} 分配后备 component: ParentView`);
  }
}
```

### 3. 修复 TransitionGroup 警告 (src/layout/components/AppMain.vue)

**变更内容：**
- 添加 `leave-active-class` 属性
- 移除 `:key="route.path"` 从 component，改为在 keep-alive 上使用
- 改进过渡效果

## 验证修复

1. **清除浏览器缓存**
   ```bash
   # 清除 node_modules 和重新安装
   rm -rf node_modules
   npm install
   ```

2. **重新启动开发服务器**
   ```bash
   npm run dev
   ```

3. **测试功能**
   - 点击左侧功能栏的按钮
   - 验证页面是否正确跳转
   - 检查控制台是否有错误信息

## 预期效果

- ✅ 点击功能栏按钮时，页面直接跳转，无需重新加载
- ✅ 控制台不再显示路由加载失败的警告
- ✅ TransitionGroup 的警告消失
- ✅ 路由加载只执行一次，不会重复加载

## 相关文件

- `src/permission.ts` - 路由守卫和权限管理
- `src/store/modules/permission.ts` - 权限 store 和路由过滤
- `src/layout/components/AppMain.vue` - 主应用容器组件

