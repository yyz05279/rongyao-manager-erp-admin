# 子项自动勾选功能修复 - 对比说明

## 修复前后对比

### 修复前的问题

| 问题 | 描述 |
|------|------|
| ❌ 传入数组全是 NaN | `existingItemIds` 传递的是 `Number(item.id)`，但 `item.id` 可能为 undefined |
| ❌ 匹配失败 | 无法通过 itemCode 进行匹配 |
| ❌ 已添加子项未勾选 | 打开对话框时，已添加的子项没有自动勾选 |
| ❌ 可以重复添加 | 已添加的子项仍可以被勾选，导致重复添加 |

### 修复后的效果

| 功能 | 描述 |
|------|------|
| ✅ 正确的数据传递 | 传递 `itemCode` 字符串数组 |
| ✅ itemCode 匹配 | 支持通过 itemCode 进行字符串匹配 |
| ✅ 自动勾选 | 已添加的子项自动勾选 |
| ✅ 状态显示 | 显示"已添加"或"未添加"状态 |
| ✅ 禁用操作 | 已添加的子项勾选框被禁用 |
| ✅ 向后兼容 | 仍支持通过 id 进行数字匹配 |

## 界面对比

### 修复前
```
┌─────────────────────────────────────────────────┐
│ 选择子项模板                                     │
├─────────────────────────────────────────────────┤
│ □  未添加  ITEM-00001  输送带  ...              │
│ □  未添加  ITEM-00002  紧固件  ...              │  ← 实际已添加，但显示未添加
│ □  未添加  ITEM-00003  卸料装置  ...            │
└─────────────────────────────────────────────────┘
```

### 修复后
```
┌─────────────────────────────────────────────────┐
│ 选择子项模板                                     │
├─────────────────────────────────────────────────┤
│ □  未添加  ITEM-00001  输送带  ...              │
│ ☑  已添加  ITEM-00002  紧固件  ...              │  ← 自动勾选且禁用
│ □  未添加  ITEM-00003  卸料装置  ...            │
└─────────────────────────────────────────────────┘
```

## 代码对比

### ItemTemplateManagement.vue

#### 修改前
```typescript
const existingItemIds = computed(() => {
  return itemList.value.map(item => Number(item.id));
  // 问题：item.id 可能为 undefined，导致 NaN
});
```

#### 修改后
```typescript
const existingItemIds = computed(() => {
  const codes = itemList.value
    .map(item => item.itemCode)
    .filter((code): code is string => Boolean(code));
  console.log('计算 existingItemIds (itemCode):', codes);
  return codes;
  // 改进：使用 itemCode 字符串，并过滤空值
});
```

### ItemTemplateSelectorDialog.vue

#### 修改前
```typescript
// Props 类型
existingItemIds?: number[];

// isAdded 函数
const isAdded = (row: SubsystemItemTemplateVO): boolean => {
  return props.existingItemIds.includes(Number(row.id));
  // 问题：只支持数字 ID 匹配
};

// checkSelectable 函数
const checkSelectable = (row: SubsystemItemTemplateVO): boolean => {
  return true;
  // 问题：所有行都可以勾选，包括已添加的
};
```

#### 修改后
```typescript
// Props 类型
existingItemIds?: (number | string)[];  // 支持混合类型

// isAdded 函数
const isAdded = (row: SubsystemItemTemplateVO): boolean => {
  if (row.isAdded !== undefined && row.isAdded !== null) {
    return row.isAdded;
  }
  
  // 支持两种匹配方式
  const hasItemCode = row.itemCode && props.existingItemIds.includes(row.itemCode);
  const hasId = props.existingItemIds.includes(Number(row.id));
  
  return hasItemCode || hasId;
  // 改进：支持 itemCode 和 id 两种匹配方式
};

// checkSelectable 函数
const checkSelectable = (row: SubsystemItemTemplateVO): boolean => {
  return !isAdded(row);
  // 改进：已添加的不能再选
};
```

## 测试场景

### 场景 1：打开子项选择对话框

**操作步骤**：
1. 进入设备系统模板详情页
2. 进入子系统模板编辑
3. 点击"添加子项"按钮

**预期结果**：
- ✅ 已添加的子项显示"已添加"状态（绿色标签）
- ✅ 已添加的子项自动勾选
- ✅ 已添加的子项勾选框被禁用（灰色，无法点击）
- ✅ 未添加的子项显示"未添加"状态（灰色标签）
- ✅ 未添加的子项可以正常勾选

### 场景 2：查看控制台日志

**操作步骤**：
1. 打开浏览器开发者工具
2. 切换到 Console 标签
3. 执行场景 1 的操作

**预期日志**：
```
计算 existingItemIds (itemCode): ['ITEM-00002']
========== 开始自动勾选子项 ==========
existingItemIds: ['ITEM-00002']
existingItemIds 类型检查: [{id: 'ITEM-00002', type: 'string', isString: true, isNumber: false}]
existingItemCodes (字符串): ['ITEM-00002']
existingItemNumIds (数字): []
✓ 根据 itemCode 勾选子项: ITEM-00002 紧固件
已自动勾选 1 个已添加的子项
========== 自动勾选完成 ==========
```

## 技术要点

### 1. 类型守卫
```typescript
.filter((code): code is string => Boolean(code))
```
确保过滤后的数组类型为 `string[]`。

### 2. 混合类型支持
```typescript
existingItemIds?: (number | string)[]
```
同时支持数字 ID 和字符串 itemCode。

### 3. 类型分离
```typescript
const existingItemCodes = props.existingItemIds.filter(id => typeof id === 'string') as string[];
const existingItemNumIds = props.existingItemIds.filter(id => typeof id === 'number') as number[];
```
分离不同类型的值，分别处理。

### 4. 禁用勾选
```typescript
<el-table-column type="selection" :selectable="checkSelectable" />
```
通过 `:selectable` 属性控制行是否可选。

---

**文档创建日期**：2025-11-19  
**作者**：Cascade AI Assistant

