# 多选列表分页状态保持问题修复文档

**版本:** 1.0
**日期:** 2025-11-20
**作者:** Cascade

---

## 1. 问题描述与复现步骤

### 问题描述

在项目中带有分页功能的多选表格（`el-table`）中，当用户在一页上勾选了某些行后，切换到其他分页，然后再返回原始页面时，之前勾选的状态会丢失。

### 复现步骤

1.  打开子系统模板或子项模板中的“选择物料”对话框。
2.  在第一页，手动勾选任意一个或多个物料。
3.  点击分页控件，切换到第二页或任意其他页面。
4.  再次点击分页控件，返回到第一页。
5.  **观察结果**: 之前在第一页勾选的物料，其勾选状态已消失。

## 2. 根本原因分析

此问题由两个核心原因共同导致：

1.  **缺少 `row-key` 属性**: `el-table` 组件没有设置 `row-key` 属性。在分页（即数据源变更）时，Element Plus 无法识别新旧数据中哪些行是同一条记录，因此无法保留勾选状态。

2.  **事件循环 Bug**: 在修复过程中，发现即使手动维护一个本地勾选列表，`clearSelection()` 方法（在恢复勾选前调用）也会意外触发 `@selection-change` 事件。这会导致本地维护的勾选列表在恢复状态前就被错误地清空，使修复失效。

## 3. 解决方案详解

为彻底解决此问题，采用了“**`row-key` + 标志位**”的组合方案。

1.  **添加 `row-key`**: 为 `el-table` 组件添加 `row-key="materialCode"` 属性，利用唯一的 `materialCode` 作为行的标识。这是实现状态保持的基础。

2.  **引入 `isRestoringSelection` 标志位**:
    *   **锁定状态**: 在加载新页面数据、准备恢复勾选状态之前，将此标志位设置为 `true`。
    *   **中断事件循环**: 在 `handleSelectionChange` 事件处理器中，检查此标志位。如果为 `true`，则立即 `return`，跳过清空本地勾选列表的操作。
    *   **解锁状态**: 在所有行恢复勾选后，将标志位重置为 `false`，恢复正常的事件处理逻辑。

这个方案确保了在分页切换时，手动勾选的状态能够被精确地本地记录和恢复。

## 4. 修改的文件列表

-   `src/views/erp/subsystem/item-template/components/MaterialSelectorDialog.vue`
-   `src/views/erp/subsystem/template/components/MaterialSelectorDialog.vue`

## 5. 关键代码示例

**a. 表格定义 (`el-table`)**
```html
<el-table
  ref="tableRef"
  :data="materialList"
  row-key="materialCode" <!-- 关键修复：添加 row-key -->
  @selection-change="handleSelectionChange"
>
```

**b. 引入标志位**
```typescript
// 标志位：是否正在恢复选中状态
const isRestoringSelection = ref(false);
```

**c. 在加载数据时设置标志位**
```typescript
const loadMaterialList = async () => {
  // ...
  try {
    const response = await listMaterial(queryParams);

    // 锁定状态，防止后续操作触发意外的事件
    isRestoringSelection.value = true;

    materialList.value = response.rows;
    // ...

    // 异步恢复勾选状态
    autoSelectAddedMaterials();
  } finally {
    // ...
  }
};
```

**d. 在事件处理器中检查标志位**
```typescript
const handleSelectionChange = (selection) => {
  // 如果正在恢复勾选，则不执行任何操作
  if (isRestoringSelection.value) {
    return;
  }
  // ... 正常更新本地勾选列表
};
```

**e. 在恢复勾选后重置标志位**
```typescript
const autoSelectAddedMaterials = async () => {
  await nextTick();
  // ... 恢复勾选的逻辑 ...
  tableRef.value.toggleRowSelection(material, true);

  // 解锁状态
  isRestoringSelection.value = false;
};
```

## 6. 测试验证方法

1.  执行上述“复现步骤”。
2.  **期望结果**: 返回第一页后，之前勾选的物料应保持其勾选状态。
3.  在多个分页上反复勾选和取消勾选，并来回切换，验证所有勾选状态都能正确保持。
4.  确认最终提交时，所有跨分页勾选的数据都被正确处理。
