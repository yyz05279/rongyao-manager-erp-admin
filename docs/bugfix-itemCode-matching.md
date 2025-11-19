# Bug修复：子项自动勾选功能 - 使用 itemCode 匹配

## 问题描述

在设备系统模板的子项列表中，新增子项弹窗无法正确自动勾选已添加的子项。传入的数组值都是 `NaN`，导致匹配失败。

### 接口返回数据示例

**子系统模板的子项列表接口**：`/erp/saltprocess/equipmentSystemTemplate/subsystem/1990954165085347841/items`

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "itemTemplateId": "1990954165357977601",
      "itemName": "紧固件",
      "templateCode": "ITEM_20251119_81A9FD",
      "itemCode": "ITEM-00002",
      "specifications": null,
      "quantity": "1.00",
      "unit": "个"
    }
  ]
}
```

**子项模板列表接口**：`/erp/subsystem/item-template/list?pageNum=1&pageSize=10&templateId=1990954165085347841`

返回数据中包含 `itemCode` 字段，需要通过此字段进行匹配。

## 问题根因

1. **ItemTemplateManagement.vue** 中 `existingItemIds` 计算时使用的是 `item.id`（数字ID）
2. 但接口返回的数据中，应该使用 `item.itemCode`（字符串编码）进行匹配
3. **ItemTemplateSelectorDialog.vue** 的匹配逻辑只支持数字ID匹配，不支持字符串 itemCode 匹配

## 解决方案

### 1. 修改 ItemTemplateManagement.vue

**文件路径**：`src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

**修改位置**：第 407-416 行

**修改前**：
```typescript
// 计算已存在的子项ID列表
const existingItemIds = computed(() => {
  return itemList.value.map(item => Number(item.id));
});
```

**修改后**：
```typescript
// 计算已存在的子项编码列表（用于子项选择器中的自动勾选）
// 注意：这里改为传递 itemCode 数组，因为接口返回的数据中使用 itemCode 字段
const existingItemIds = computed(() => {
  const codes = itemList.value
    .map(item => item.itemCode)
    .filter((code): code is string => Boolean(code)); // 类型守卫，过滤掉空值
  console.log('计算 existingItemIds (itemCode):', codes);
  console.log('itemList.value:', itemList.value);
  return codes;
});
```

### 2. 修改 ItemTemplateSelectorDialog.vue

**文件路径**：`src/views/erp/subsystem/template/components/ItemTemplateSelectorDialog.vue`

#### 2.1 修改 Props 类型定义（第 259 行）

**修改前**：
```typescript
existingItemIds?: number[]; // 已添加的子项ID列表
```

**修改后**：
```typescript
existingItemIds?: (number | string)[]; // 已添加的子项ID列表或itemCode列表（支持字符串）
```

#### 2.2 修改 isAdded 函数（第 393-408 行）

**修改前**：
```typescript
const isAdded = (row: SubsystemItemTemplateVO): boolean => {
  if (row.isAdded !== undefined && row.isAdded !== null) {
    return row.isAdded;
  }
  return props.existingItemIds.includes(Number(row.id));
};
```

**修改后**：
```typescript
const isAdded = (row: SubsystemItemTemplateVO): boolean => {
  // 优先使用后端返回的 isAdded 字段
  if (row.isAdded !== undefined && row.isAdded !== null) {
    return row.isAdded;
  }
  
  // 向后兼容：使用 existingItemIds prop
  // 支持两种匹配方式：
  // 1. 通过 itemCode 匹配（字符串）
  // 2. 通过 id 匹配（数字）
  const hasItemCode = row.itemCode && props.existingItemIds.includes(row.itemCode);
  const hasId = props.existingItemIds.includes(Number(row.id));
  
  return hasItemCode || hasId;
};
```

#### 2.3 修改 autoSelectAddedItems 函数（第 442-485 行）

**修改要点**：
1. 分离字符串类型（itemCode）和数字类型（id）的 existingItemIds
2. 支持通过 itemCode 进行字符串匹配
3. 保持向后兼容，仍支持通过 id 进行数字匹配

**关键代码**：
```typescript
// 分离字符串类型（itemCode）和数字类型（id）的 existingItemIds
const existingItemCodes = props.existingItemIds.filter(id => typeof id === 'string') as string[];
const existingItemNumIds = props.existingItemIds.filter(id => typeof id === 'number') as number[];

// 勾选已添加的子项
itemList.value.forEach((item) => {
  const itemId = Number(item.id);
  const itemCode = item.itemCode;
  
  // 优先使用后端返回的 isAdded 字段
  if (item.isAdded === true) {
    tableRef.value.toggleRowSelection(item, true);
  }
  // 通过 itemCode 匹配（字符串匹配）
  else if (itemCode && existingItemCodes.includes(itemCode)) {
    tableRef.value.toggleRowSelection(item, true);
  }
  // 通过 id 匹配（数字匹配）
  else if (!isNaN(itemId) && existingItemNumIds.includes(itemId)) {
    tableRef.value.toggleRowSelection(item, true);
  }
});
```

## 修改总结

### 修改的文件
1. `src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`
2. `src/views/erp/subsystem/template/components/ItemTemplateSelectorDialog.vue`

### 关键改进
1. ✅ 支持通过 `itemCode` 字符串进行匹配
2. ✅ 保持向后兼容，仍支持通过 `id` 数字进行匹配
3. ✅ 添加详细的日志输出，便于调试
4. ✅ 类型安全，使用 TypeScript 类型守卫
5. ✅ 已添加的子项显示"已添加"状态且禁用勾选框（参考 MaterialSelectorDialog.vue）

### 测试要点
1. 打开设备系统模板详情页
2. 进入子系统模板编辑
3. 点击"添加子项"按钮
4. 验证已添加的子项是否正确自动勾选
5. 查看控制台日志，确认 itemCode 匹配成功

## 预期效果

修复后，当打开子项选择对话框时：
- ✅ 已添加的子项会自动勾选（通过 itemCode 匹配）
- ✅ 已添加的子项显示"已添加"状态（绿色标签）
- ✅ 已添加的子项勾选框被禁用，无法取消勾选
- ✅ 未添加的子项显示"未添加"状态（灰色标签）
- ✅ 未添加的子项可以正常勾选
- ✅ 控制台会输出详细的匹配日志
- ✅ 不再出现 NaN 值的问题

## 更新记录

### 2025-11-19 第二次更新
- 修改 `checkSelectable` 函数，使已添加的子项不能被操作（禁用勾选框）
- 参考 MaterialSelectorDialog.vue 的实现方式
- 保持已添加子项自动勾选的功能，但用户无法取消勾选

---

**修复日期**：2025-11-19
**修复人员**：Cascade AI Assistant

