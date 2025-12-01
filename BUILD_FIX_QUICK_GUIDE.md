# Vite 构建错误 - 快速修复指南

## ❌ 问题

```
[vite:load-fallback] Could not load 
/src/views/erp/saltprocess/records/excel-import/data-reading-test.vue 
(imported by src/router/modules/saltprocess.ts): ENOENT: no such file or directory
```

## ✅ 解决方案

### 已完成的修复

删除了 `src/router/modules/saltprocess.ts` 中的三个测试路由配置：

1. ❌ `excel-debug` - Excel导入调试页面
2. ❌ `data-reading-test` - Excel数据读取测试页面  
3. ❌ `date-mapping-fix-test` - 日期映射修复测试页面

✅ 保留了 `excel-import` - Excel数据导入主页面

### 验证修复

```bash
# 清理缓存
rm -rf dist out node_modules/.cache

# 重新构建
npm run build:prod

# 或构建 Electron
npm run build:electron
```

---

## 📊 修改详情

**文件**: `src/router/modules/saltprocess.ts`  
**删除行数**: 34 行  
**删除路由**: 3 个测试路由  
**保留路由**: 所有生产路由

---

## 🎯 下一步

1. 运行构建命令验证
2. 如果仍有错误，检查是否有其他文件引用这些测试文件
3. 推送代码到仓库

---

**修复状态**: ✅ 完成  
**构建应该现在能够成功**

