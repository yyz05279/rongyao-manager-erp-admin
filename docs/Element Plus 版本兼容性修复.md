# Element Plus 版本兼容性修复

## 问题描述

在运行 `npm run build:prod` 时出现以下错误：

```
[vite]: Rollup failed to resolve import 
"element-plus/es/components/text/style/css" from 
"ShippingImportDialog.vue"
```

## 根本原因

- **问题**：使用了 `el-text` 组件
- **版本限制**：`el-text` 组件在 Element Plus 2.4.0+ 才引入
- **项目版本**：项目使用的是 Element Plus 2.2.27
- **结果**：构建时无法找到 text 组件的样式文件

## 解决方案

### 方案 1：替换为原生 HTML 元素（已实施）

将 `el-text` 替换为 `span` 元素并添加样式：

**修改前**：
```vue
<el-text type="info">仅显示前100条数据，实际将导入全部数据</el-text>
```

**修改后**：
```vue
<span class="preview-tip-text">仅显示前100条数据，实际将导入全部数据</span>
```

**样式**：
```scss
.preview-tip-text {
  color: #909399;
  font-size: 12px;
}
```

### 方案 2：升级 Element Plus（备选）

如果需要使用 `el-text` 组件，可以升级 Element Plus：

```bash
npm install element-plus@latest
```

**注意**：升级前需要检查是否有其他兼容性问题。

## 修改文件

- ✅ `src/views/erp/saltprocess/shipping/components/ShippingImportDialog.vue`
  - 替换 `el-text` 为 `span`
  - 添加相应的 CSS 样式

## 测试步骤

```bash
npm run build:prod
```

## 相关信息

- Element Plus 版本：2.2.27
- el-text 组件引入版本：2.4.0+
- 修复方法：使用原生 HTML 元素替代

## 预防措施

1. 避免使用高版本 Element Plus 的新组件
2. 在使用新组件前检查版本兼容性
3. 定期更新依赖版本

