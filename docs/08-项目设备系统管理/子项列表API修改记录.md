# 子项列表和物料列表 API 修改记录

## 修改概述

根据接口文档 `/docs/08-项目设备系统管理/子系统模版子项和物料查询接口文档.md` 的最新规范，修改了"子系统详情"弹窗中获取"子项列表"和"物料列表"数据的 API 请求。

## 修改时间

2025-11-17

## 修改内容

### 1. 新增 API 函数

**文件**: `src/api/erp/saltprocess/equipment-system/template.ts`

**位置**: 第 187-196 行

**内容**:
```typescript
/**
 * 获取指定子系统模版下的所有子项列表
 * @param subsystemTemplateId 设备系统模版与子系统的关联ID
 */
export const getEquipmentSystemSubsystemItems = (subsystemTemplateId: string | number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/subsystem/${subsystemTemplateId}/items`,
    method: 'get'
  });
};
```

**说明**: 
- 新增了符合接口文档规范的 API 函数
- 接口路径: `GET /erp/saltprocess/equipmentSystemTemplate/subsystem/{subsystemTemplateId}/items`
- 参数: `subsystemTemplateId` - 设备系统模版与子系统的关联 ID

### 2. 修改 Vue 组件 - 导入新 API

**文件**: `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

**位置**: 第 289-294 行

**修改前**:
```typescript
import {
  getTemplateItems,
  removeItemFromTemplate,
  addItemToTemplate
} from '@/api/erp/subsystem/template';
```

**修改后**:
```typescript
import {
  getTemplateItems,
  removeItemFromTemplate,
  addItemToTemplate
} from '@/api/erp/subsystem/template';
import { getEquipmentSystemSubsystemItems } from '@/api/erp/saltprocess/equipment-system/template';
```

**说明**: 导入新增的 API 函数

### 3. 修改 Vue 组件 - 更新 loadItemList 函数

**文件**: `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

**位置**: 第 419-443 行

**修改前**:
```typescript
// 加载子项列表
const loadItemList = async () => {
  if (!props.templateId) return;

  // 如果父组件已经传递了items数据(数组长度>0或者是空数组),直接使用,避免重复调用API
  if (props.items !== undefined) {
    itemList.value = props.items;
    return;
  }

  // 如果没有传递数据(undefined),则调用API获取
  loading.value = true;
  try {
    const response = await getTemplateItems(props.templateId);
    itemList.value = response.data || [];
  } catch (error) {
    console.error('加载子项列表失败:', error);
    ElMessage.error('加载子项列表失败');
  } finally {
    loading.value = false;
  }
};
```

**修改后**:
```typescript
// 加载子项列表
const loadItemList = async () => {
  if (!props.templateId) return;

  // 如果父组件已经传递了items数据(数组长度>0或者是空数组),直接使用,避免重复调用API
  if (props.items !== undefined) {
    itemList.value = props.items;
    return;
  }

  // 如果没有传递数据(undefined),则调用API获取
  loading.value = true;
  try {
    // 根据模式选择不同的API
    const response = props.useEquipmentSystemApi
      ? await getEquipmentSystemSubsystemItems(props.templateId)
      : await getTemplateItems(props.templateId);
    itemList.value = response.data || [];
  } catch (error) {
    console.error('加载子项列表失败:', error);
    ElMessage.error('加载子项列表失败');
  } finally {
    loading.value = false;
  }
};
```

**说明**: 
- 根据 `useEquipmentSystemApi` prop 的值选择使用不同的 API
- 当 `useEquipmentSystemApi` 为 `true` 时，使用新的 `getEquipmentSystemSubsystemItems` API
- 当 `useEquipmentSystemApi` 为 `false` 时，使用原有的 `getTemplateItems` API

### 4. 修改 Vue 组件 - 传递 prop

**文件**: `src/views/erp/subsystem/template/components/SubsystemTemplateDetail.vue`

**位置**: 第 59-62 行

**修改前**:
```vue
<!-- 子项和物料模板管理 -->
<el-card shadow="never" class="detail-card">
  <item-template-management :template-id="templateId" />
</el-card>
```

**修改后**:
```vue
<!-- 子项和物料模板管理 -->
<el-card shadow="never" class="detail-card">
  <item-template-management :template-id="templateId" :use-equipment-system-api="useEquipmentSystemApi" />
</el-card>
```

**说明**: 
- 将 `useEquipmentSystemApi` prop 传递给 `ItemTemplateManagement` 组件
- 这样当在设备系统模版详情页面查看子系统详情时，会自动使用正确的 API

### 5. 新增物料查询 API 函数

**文件**: `src/api/erp/saltprocess/equipment-system/template.ts`

**位置**: 第 198-207 行

**内容**:
```typescript
/**
 * 获取指定子项模版下的所有物料列表
 * @param itemTemplateId 设备系统模版与子项的关联ID
 */
export const getEquipmentSystemItemMaterials = (itemTemplateId: string | number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/item/${itemTemplateId}/materials`,
    method: 'get'
  });
};
```

**说明**:
- 新增了符合接口文档规范的物料查询 API 函数
- 接口路径: `GET /erp/saltprocess/equipmentSystemTemplate/item/{itemTemplateId}/materials`
- 参数: `itemTemplateId` - 设备系统模版与子项的关联 ID

### 6. 修改 Vue 组件 - 导入物料 API

**文件**: `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

**位置**: 第 294-297 行

**修改后**:
```typescript
import {
  getEquipmentSystemSubsystemItems,
  getEquipmentSystemItemMaterials
} from '@/api/erp/saltprocess/equipment-system/template';
```

**说明**: 导入新增的物料查询 API 函数

### 7. 修改 Vue 组件 - 更新 loadMaterialList 函数

**文件**: `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

**位置**: 第 448-470 行

**修改前**:
```typescript
// 加载物料列表
const loadMaterialList = async () => {
  if (!selectedItemId.value) return;

  materialLoading.value = true;
  try {
    // ✅ 修复：传递 templateId 参数，实现数据隔离
    // 只查询当前子系统中该子项的物料，不查询其他子系统的物料
    const response = await listMaterialTemplateByItemId(
      selectedItemId.value,
      props.templateId // ✅ 传递子系统模板ID，确保数据隔离
    );

    // ✅ 后端已经按照 templateId 过滤，直接使用返回的数据
    materialList.value = response.data || [];
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
  } finally {
    materialLoading.value = false;
  }
};
```

**修改后**:
```typescript
// 加载物料列表
const loadMaterialList = async () => {
  if (!selectedItemId.value) return;

  materialLoading.value = true;
  try {
    // 根据模式选择不同的API
    const response = props.useEquipmentSystemApi
      ? await getEquipmentSystemItemMaterials(selectedItemId.value)
      : await listMaterialTemplateByItemId(
          selectedItemId.value,
          props.templateId // ✅ 传递子系统模板ID，确保数据隔离
        );

    // ✅ 后端已经按照 templateId 过滤，直接使用返回的数据
    materialList.value = response.data || [];
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
  } finally {
    materialLoading.value = false;
  }
};
```

**说明**:
- 根据 `useEquipmentSystemApi` prop 的值选择使用不同的 API
- 当 `useEquipmentSystemApi` 为 `true` 时，使用新的 `getEquipmentSystemItemMaterials` API
- 当 `useEquipmentSystemApi` 为 `false` 时，使用原有的 `listMaterialTemplateByItemId` API

## 技术要点

1. **API 路径**: 新 API 使用 RESTful 风格的路径参数，符合接口文档规范
2. **向后兼容**: 通过 `useEquipmentSystemApi` prop 实现条件调用，保持了向后兼容性
3. **数据隔离**: 新 API 确保在设备系统模版上下文中正确获取子项和物料数据
4. **统一模式**: 子项列表和物料列表都采用相同的条件判断逻辑

## 测试建议

1. 在设备系统模版详情页面，点击子系统的"查看详情"按钮
2. 验证子项列表是否正确显示
3. 点击子项的"查看物料"按钮，验证物料列表是否正确显示
4. 检查浏览器开发者工具的 Network 标签，确认调用的是新 API 路径：
   - 子项列表: `/erp/saltprocess/equipmentSystemTemplate/subsystem/{subsystemTemplateId}/items`
   - 物料列表: `/erp/saltprocess/equipmentSystemTemplate/item/{itemTemplateId}/materials`
5. 验证在普通子系统模版管理页面，子项列表和物料列表功能仍然正常工作

## 相关文档

- [子系统模版子项和物料查询接口文档](./子系统模版子项和物料查询接口文档.md)

---

**修改人员**: AI Assistant  
**修改日期**: 2025-11-17  
**版本**: v1.0

