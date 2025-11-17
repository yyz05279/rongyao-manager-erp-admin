# 设备系统模板子项管理 API 使用示例

## 概述

本文档提供设备系统模板子项管理功能的前端使用示例，包括新增、编辑和删除子项模板的完整代码示例。

## API 接口说明

### 1. 新增子项模板

```typescript
import { addSubsystemItem } from '@/api/erp/saltprocess/equipment-system/template';
import { ItemTemplateForm } from '@/api/erp/saltprocess/equipment-system/types';

/**
 * 新增子项模板
 * @param subsystemTemplateId 子系统模版ID
 * @param data 子项模板表单数据
 */
const handleAddItem = async (subsystemTemplateId: number) => {
  const formData: ItemTemplateForm = {
    templateCode: 'ITEM001',
    itemName: '输送主体',
    itemType: 'MAIN',
    specification: '长度5米，宽度1米',
    description: '平面输送机主体部分',
    defaultQuantity: 1.0,
    defaultUnit: '套',
    estimatedUnitWeight: 500.0,
    sequenceNumber: 1,
    status: 'ACTIVE',
    remarks: '主要承重部件'
  };

  try {
    await addSubsystemItem(subsystemTemplateId, formData);
    ElMessage.success('子项模板新增成功');
    // 刷新列表
    await loadItemList();
  } catch (error) {
    ElMessage.error('子项模板新增失败');
    console.error(error);
  }
};
```

### 2. 编辑子项模板

```typescript
import { updateSubsystemItem } from '@/api/erp/saltprocess/equipment-system/template';
import { ItemTemplateForm } from '@/api/erp/saltprocess/equipment-system/types';

/**
 * 编辑子项模板
 * @param subsystemTemplateId 子系统模版ID
 * @param itemId 子项模板ID
 */
const handleEditItem = async (subsystemTemplateId: number, itemId: number) => {
  const formData: ItemTemplateForm = {
    templateCode: 'ITEM001',
    itemName: '输送主体（改进版）',
    itemType: 'MAIN',
    specification: '长度6米，宽度1.2米',
    description: '平面输送机主体部分，已优化结构',
    defaultQuantity: 1.0,
    defaultUnit: '套',
    estimatedUnitWeight: 550.0,
    sequenceNumber: 1,
    status: 'ACTIVE',
    remarks: '2025年1月改进版本'
  };

  try {
    await updateSubsystemItem(subsystemTemplateId, itemId, formData);
    ElMessage.success('子项模板更新成功');
    // 刷新列表
    await loadItemList();
  } catch (error) {
    ElMessage.error('子项模板更新失败');
    console.error(error);
  }
};
```

### 3. 删除子项模板

```typescript
import { removeSubsystemItems } from '@/api/erp/saltprocess/equipment-system/template';

/**
 * 删除单个子项模板
 * @param subsystemTemplateId 子系统模版ID
 * @param itemId 子项模板ID
 */
const handleDeleteItem = async (subsystemTemplateId: number, itemId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该子项模板吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await removeSubsystemItems(subsystemTemplateId, itemId);
    ElMessage.success('子项模板删除成功');
    // 刷新列表
    await loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('子项模板删除失败');
      console.error(error);
    }
  }
};

/**
 * 批量删除子项模板
 * @param subsystemTemplateId 子系统模版ID
 * @param itemIds 子项模板ID数组
 */
const handleBatchDeleteItems = async (subsystemTemplateId: number, itemIds: number[]) => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${itemIds.length} 个子项模板吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await removeSubsystemItems(subsystemTemplateId, itemIds);
    ElMessage.success('子项模板批量删除成功');
    // 刷新列表
    await loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('子项模板批量删除失败');
      console.error(error);
    }
  }
};
```

## 完整组件示例

请参考下一部分的完整 Vue 组件示例。

## 注意事项

1. **权限要求**：
   - 新增接口需要 `erp:saltprocess:equipmentSystemTemplate:add` 权限
   - 编辑接口需要 `erp:saltprocess:equipmentSystemTemplate:edit` 权限
   - 删除接口需要 `erp:saltprocess:equipmentSystemTemplate:remove` 权限

2. **数据隔离**：
   - 所有操作都会验证子项模板是否属于指定的子系统模版
   - 跨子系统模版的操作会被拒绝（返回 403 状态码）

3. **表单验证**：
   - `templateCode` 和 `itemName` 为必填字段
   - 数值字段需要符合最小值和精度要求
   - 字符串字段需要符合最大长度限制

4. **错误处理**：
   - 建议使用 try-catch 捕获异常
   - 根据不同错误码显示相应的提示信息

