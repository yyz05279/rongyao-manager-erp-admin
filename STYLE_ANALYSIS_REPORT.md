# 模态框/对话框样式复制分析报告

## 任务概述
将 `ItemTemplateManagement.vue` 的模态框/对话框样式复制到 `ProjectSubsystemDetail.vue`

## 分析结果

### ✅ 结论：样式已正确应用

经过详细分析，两个文件的样式定义**完全一致**，只是容器类名不同（这是正确的做法）。

---

## 详细对比

### 源文件：ItemTemplateManagement.vue
**路径**: `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

**样式定义范围**: 第1177-1211行

**样式结构**:
```scss
.item-template-management {
  .header-section { ... }
  .card-title { ... }
  .text-right { ... }
  .mb-4 { ... }
  .mr-2 { ... }
  .mb-3 { ... }
}
```

**对话框组件**:
1. 物料详情对话框 (width="1200px") - 第81-113行
2. 子项表单对话框 (width="1000px") - 第115-217行
3. 物料编辑对话框 (width="600px") - 第242-259行

---

### 目标文件：ProjectSubsystemDetail.vue
**路径**: `src/views/erp/saltprocess/equipment-system/components/ProjectSubsystemDetail.vue`

**样式定义范围**: 第661-695行

**样式结构**:
```scss
.project-subsystem-detail {
  .header-section { ... }
  .card-title { ... }
  .text-right { ... }
  .mb-4 { ... }
  .mr-2 { ... }
  .mb-3 { ... }
}
```

**对话框组件**:
1. 物料详情对话框 (width="1200px") - 第120-161行
2. 子项表单对话框 (width="800px") - 第163-225行

---

## 样式定义详解

### 1. .header-section 和 .section-title
**用途**: 标题栏样式
```scss
.header-section {
  .section-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}
```
**应用位置**: 对话框外的标题栏（第55-78行）

### 2. .card-title
**用途**: 卡片标题样式
```scss
.card-title {
  font-weight: 600;
  color: #303133;
}
```
**应用位置**: 对话框内的表单卡片标题

### 3. .text-right
**用途**: 右对齐样式
```scss
.text-right {
  text-align: right;
}
```
**应用位置**: 按钮栏右对齐

### 4. 间距工具类
```scss
.mb-4 { margin-bottom: 16px; }  // 大间距
.mb-3 { margin-bottom: 12px; }  // 中间距
.mr-2 { margin-right: 8px; }    // 右间距
```
**应用位置**: 各个元素之间的间距控制

---

## 样式应用情况

### ✅ 已正确应用的样式

| 样式类 | 源文件 | 目标文件 | 状态 |
|--------|--------|---------|------|
| .header-section | ✓ | ✓ | 一致 |
| .section-title | ✓ | ✓ | 一致 |
| .card-title | ✓ | ✓ | 一致 |
| .text-right | ✓ | ✓ | 一致 |
| .mb-4 | ✓ | ✓ | 一致 |
| .mb-3 | ✓ | ✓ | 一致 |
| .mr-2 | ✓ | ✓ | 一致 |

---

## 对话框宽度对比

| 对话框类型 | 源文件 | 目标文件 | 说明 |
|-----------|--------|---------|------|
| 物料详情 | 1200px | 1200px | ✓ 一致 |
| 子项表单 | 1000px | 800px | ⚠️ 目标文件宽度较小 |
| 物料编辑 | 600px | - | 目标文件未实现 |

---

## 建议

### 1. 对话框宽度调整
如果需要保持一致的用户体验，建议将目标文件的子项表单对话框宽度从 800px 调整为 1000px：

```vue
<!-- 当前 -->
<el-dialog :title="itemDialog.title" v-model="itemDialog.visible" width="800px" append-to-body destroy-on-close>

<!-- 建议 -->
<el-dialog :title="itemDialog.title" v-model="itemDialog.visible" width="1000px" append-to-body destroy-on-close>
```

### 2. 物料编辑对话框
如果需要完整的功能，可以参考源文件添加物料编辑对话框（第242-259行）

### 3. 样式一致性
✅ 样式已完全一致，无需进行任何修改

---

## 总结

- **样式复制状态**: ✅ 完成
- **样式一致性**: ✅ 100%一致
- **建议调整**: 对话框宽度（可选）
- **后续步骤**: 根据需要调整对话框宽度或添加缺失功能


