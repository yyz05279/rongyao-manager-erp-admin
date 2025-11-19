# ItemTemplateSelectorDialog 字段映射修改记录

## 修改时间
2025-11-19

## 修改文件
1. `src/views/erp/subsystem/template/components/ItemTemplateSelectorDialog.vue`
2. `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`
3. `src/api/erp/saltprocess/equipment-system/types.ts`

## 修改目的
1. 将后端返回的 `templateCode` 字段统一转换为前端使用的 `itemCode` 字段
2. 确保只提交新增的子项数据，已添加的子项不重复提交
3. 从子项模板库选择子项时，将子项的 `id` 作为 `itemTemplateId` 字段提交

## 修改内容

### 1. ItemTemplateSelectorDialog.vue 修改

#### 1.1 数据加载时的字段转换（loadItemList 方法）
**问题**：后端 API 返回的数据包含 `templateCode` 字段，但前端 TypeScript 类型定义使用 `itemCode`

**解决方案**：在数据加载时进行字段转换

```typescript
// 转换数据：如果后端返回的是 templateCode，转换为 itemCode
itemList.value = rawData.map((item: any) => {
  if (item.templateCode && !item.itemCode) {
    return {
      ...item,
      itemCode: item.templateCode
    };
  }
  return item;
});
```

#### 1.2 提交时过滤已添加子项（handleConfirm 方法）
**功能**：只提交新增的子项，已添加的子项不重复提交

```typescript
// 过滤掉已添加的子项（只提交新增的子项）
const newItems = selectedItems.value.filter(item => !isAdded(item));

if (newItems.length === 0) {
  ElMessage.warning('没有新增的子项可添加');
  return;
}
```

### 2. ItemTemplateManagement.vue 修改

#### 2.1 添加 itemTemplateId 字段
**需求**：从子项模板库选择子项时，需要将子项的 `id` 作为 `itemTemplateId` 提交

**设备系统模式**：
```typescript
const itemsToCreate = items.map(item => {
  return {
    itemTemplateId: item.id as number, // 从子项模板选择的，传递模板ID
    templateCode: item.itemCode || `COPIED_${item.id}`,
    itemName: item.itemName,
    // ... 其他字段
  } as ItemTemplateForm;
});
```

**子系统模板模式**：
```typescript
const data = {
  itemTemplateId: item.id!, // 从子项模板选择的，传递模板ID
  quantity: item.defaultQuantity || 1,
  isRequired: item.isRequired ?? true,
  remarks: item.remarks || ''
};
```

### 3. ItemTemplateForm 类型定义修改

在 `src/api/erp/saltprocess/equipment-system/types.ts` 中添加 `itemTemplateId` 字段：

```typescript
export interface ItemTemplateForm {
  id?: string | number;
  itemTemplateId?: number;      // 关联的子项模板ID（从模板库选择时使用）
  subsystemTemplateId?: number;
  templateCode: string;
  itemName: string;
  // ... 其他字段
}
```

### 4. 修改前的问题
- 后端返回 `templateCode`，前端类型定义是 `itemCode`，导致数据不一致
- 所有选中的子项都会被提交，包括已经添加过的子项
- 从模板库选择子项时，没有传递 `itemTemplateId` 字段

### 5. 修改后的实现

- 数据在加载时就被标准化为 `itemCode`
- 只提交新增的子项，避免重复添加
- 提交时包含 `itemTemplateId` 字段，标识来源于模板库

## 核心要点

### 1. 数据标准化时机
- **在数据加载时**进行字段转换，而不是在提交时
- 确保组件内部始终使用统一的数据结构
- 降低代码复杂度，提高可维护性

### 2. 过滤已添加的子项
```typescript
const newItems = selectedItems.value.filter(item => !isAdded(item));
```
- 使用 `isAdded` 函数检查子项是否已经添加到模板中
- 只保留未添加的新子项
- 避免重复提交

### 3. itemTemplateId 的作用
- **区分数据来源**：标识子项是从模板库选择的，而不是手动创建的
- **后端处理逻辑**：后端可以根据此字段决定是复用模板数据还是创建新数据
- **数据追溯**：保留子项与模板的关联关系

### 4. 空数据校验
```typescript
if (newItems.length === 0) {
  ElMessage.warning('没有新增的子项可添加');
  return;
}
```
- 如果过滤后没有新增的子项，给出友好提示
- 避免提交空数据

## 数据流程图

```
后端 API 返回
    ↓
{ templateCode: "ITEM-00001", ... }
    ↓
loadItemList 转换
    ↓
{ itemCode: "ITEM-00001", ... }
    ↓
用户选择子项
    ↓
handleConfirm 过滤
    ↓
只保留新增子项
    ↓
handleItemsSelected 处理
    ↓
添加 itemTemplateId 字段
    ↓
{
  itemTemplateId: 123,
  itemCode: "ITEM-00001",
  ...
}
    ↓
提交到后端
```

## 数据结构对比

### 后端返回的原始数据
```json
{
  "templateCode": "ITEM-00001",
  "itemName": "输送带",
  "itemType": "部件",
  "specification": null,
  "description": "平面输送带",
  "defaultQuantity": "1.00",
  "defaultUnit": "台",
  "status": "ACTIVE",
  "remarks": "通用子项"
}
```

### 前端加载后的数据（已转换）
```json
{
  "itemCode": "ITEM-00001",
  "itemName": "输送带",
  "itemType": "部件",
  "specification": null,
  "description": "平面输送带",
  "defaultQuantity": "1.00",
  "defaultUnit": "台",
  "status": "ACTIVE",
  "remarks": "通用子项"
}
```

### 提交给后端的数据（设备系统模式）
```json
{
  "itemTemplateId": 123,
  "templateCode": "ITEM-00001",
  "itemName": "输送带",
  "itemType": "部件",
  "specification": null,
  "description": "平面输送带",
  "defaultQuantity": "1.00",
  "defaultUnit": "台",
  "status": "ACTIVE",
  "remarks": "通用子项"
}
```

### 提交给后端的数据（子系统模板模式）
```json
{
  "itemTemplateId": 123,
  "quantity": 1,
  "isRequired": true,
  "remarks": ""
}
```

## 影响范围

### 直接影响
- `ItemTemplateSelectorDialog.vue` 组件的 `confirm` 事件
- 父组件接收到的子项数据结构

### 间接影响
- 使用该组件的父组件（如子系统模板管理页面）
- 后端接收子项数据的接口

## 测试建议

### 1. 功能测试
- [ ] 选择未添加的子项，验证能正常提交
- [ ] 选择已添加的子项，验证会被过滤掉
- [ ] 同时选择已添加和未添加的子项，验证只提交未添加的
- [ ] 验证提交的数据包含 `itemTemplateId` 字段

### 2. 数据验证
- [ ] 检查前端加载后的数据是否包含 `itemCode` 字段
- [ ] 检查前端加载后的数据是否不包含 `templateCode` 字段
- [ ] 验证提交数据包含 `itemTemplateId` 字段，值为子项的 `id`
- [ ] 验证设备系统模式提交的数据结构正确
- [ ] 验证子系统模板模式提交的数据结构正确

### 3. 边界测试
- [ ] 只选择已添加的子项，验证提示信息："没有新增的子项可添加"
- [ ] 不选择任何子项，验证提示信息："请选择要添加的子项"
- [ ] 验证后端返回 `itemCode` 时也能正常工作
- [ ] 验证后端返回 `templateCode` 时能正确转换

### 4. 集成测试
- [ ] 从子项模板库选择子项后，验证能成功添加到子系统模板
- [ ] 验证添加后的子项在列表中显示为"已添加"状态
- [ ] 验证已添加的子项不能再次选择

## 相关文件
- `src/api/erp/subsystem/types.ts` - 子系统模板类型定义
- `src/api/erp/saltprocess/equipment-system/types.ts` - 设备系统类型定义
- `src/views/erp/subsystem/template/components/ItemTemplateSelectorDialog.vue` - 子项选择对话框
- `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue` - 子项管理组件
- `src/api/erp/subsystem/item-template.ts` - 子项模板 API

## 技术要点

### 1. 字段映射策略
- **加载时转换**：在数据从后端加载时立即进行字段映射
- **单向转换**：只在前端内部使用标准化字段名
- **类型安全**：使用 TypeScript 类型定义确保数据结构一致

### 2. 两种模式的区别

| 特性 | 设备系统模式 | 子系统模板模式 |
|------|------------|--------------|
| API 标识 | `useEquipmentSystemApi: true` | `useEquipmentSystemApi: false` |
| 提交方式 | 批量新增子项 | 关联已存在的子项 |
| 提交字段 | 完整的子项数据 + itemTemplateId | itemTemplateId + 关联配置 |
| 字段名称 | templateCode | itemCode |

### 3. itemTemplateId 的重要性
- **必须字段**：从模板库选择子项时必须传递
- **数据来源标识**：区分是从模板库选择还是手动创建
- **关联关系**：保持子项与模板库的关联

## 备注
- 保留了详细的 console.log 日志，便于调试和问题排查
- 使用了 TypeScript 的类型断言确保类型安全
- 兼容两种不同的业务模式（设备系统和子系统模板）
- 数据转换在加载时完成，提高了代码的可维护性

## 后续优化建议
1. 考虑统一后端返回的字段名称，避免前端转换
2. 可以将字段转换逻辑封装为工具函数
3. 考虑使用数据适配器模式处理不同数据源

