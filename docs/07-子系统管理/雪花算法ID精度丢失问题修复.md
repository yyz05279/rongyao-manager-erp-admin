# 雪花算法 ID 精度丢失问题修复

## 🐛 问题描述

**现象**：新增子项时，传入的 `templateId` 值失去精度

```json
{
  "templateId": 1985928480973324300,  // ❌ 实际发送的值已经丢失精度
  "itemName": "输送带",
  "itemType": "部件"
  // ...
}
```

**原因**：虽然在响应拦截器中将后端返回的 ID 转换为字符串，但在发送请求时：

1. 组件中使用了 `Number(props.templateId)` 强制转换
2. 数字型的大数在 JSON 序列化时丢失精度
3. 请求拦截器未进行 ID 转换

## ✅ 修复方案

### 1. 添加请求拦截器 ID 转换（核心修复）

在 `/src/utils/request.ts` 中添加请求拦截器转换：

```typescript
// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ... 其他处理 ...

    // ⭐ 转换请求数据中的ID字段为字符串
    if (config.data && !(config.data instanceof FormData)) {
      config.data = convertRequestIds(config.data);
    }
    if (config.params) {
      config.params = convertRequestIds(config.params);
    }

    return config;
  }
);
```

### 2. 移除组件中的 Number() 转换

#### 修复前（❌ 错误）

```typescript
// ItemTemplateManagement.vue
const response = await getTemplateItems(Number(props.templateId)); // ❌ 精度丢失

addItemTemplate({
  templateId: Number(props.templateId),  // ❌ 精度丢失
  itemName: item.itemName,
  // ...
})
```

#### 修复后（✅ 正确）

```typescript
// ItemTemplateManagement.vue
const response = await getTemplateItems(props.templateId); // ✅ 保持精度

addItemTemplate({
  templateId: props.templateId,  // ✅ 保持精度
  itemName: item.itemName,
  // ...
})
```

## 📝 修复清单

### 修改的文件

1. **ID 转换工具** `/src/utils/id-converter.ts`

   - ✅ 添加 `convertRequestIds()` 函数

2. **请求拦截器** `/src/utils/request.ts`

   - ✅ 导入 `convertRequestIds`
   - ✅ 在请求拦截器中添加 ID 转换逻辑

3. **组件修复** (移除 `Number()` 转换)

   - ✅ `ItemTemplateManagement.vue` - 3 处
   - ✅ `SubsystemForm.vue` - 1 处
   - ✅ `SubsystemDetail.vue` - 1 处
   - ✅ `SubItemForm.vue` - 2 处
   - ✅ `MaterialForm.vue` - 4 处

4. **类型修复**
   - ✅ `selectedItemId` 类型改为 `string | number | null`
   - ✅ `subItemDialog.subItemId` 赋值时使用 `String()` 转换

## 🧪 测试验证

### 测试步骤

1. **打开浏览器开发者工具** - Network 标签
2. **执行新增操作** - 添加子项模板
3. **查看请求 payload** - 检查 `templateId` 的值

### 预期结果

#### 修复前（❌）

```json
{
  "templateId": 1.9859284809733243e+18  // 科学计数法，精度丢失
}
```

#### 修复后（✅）

```json
{
  "templateId": "1985928480973324300"  // 字符串，精度保持
}
```

## 💡 关键知识点

### 为什么会丢失精度？

```javascript
// JavaScript的安全整数范围
Number.MAX_SAFE_INTEGER = 9007199254740991  // 2^53 - 1

// 雪花算法ID通常超过这个范围
const snowflakeId = 1985928480973324300;  // > MAX_SAFE_INTEGER

// 精度丢失
console.log(snowflakeId);  // 1985928480973324300 (可能显示不准确)
Number(snowflakeId);        // 精度丢失

// 正确做法
String(snowflakeId);        // "1985928480973324300" (精确)
```

### 双向转换的重要性

| 场景            | 处理位置   | 作用                               |
| --------------- | ---------- | ---------------------------------- |
| **后端 → 前端** | 响应拦截器 | 将后端返回的大数字 ID 转为字符串   |
| **前端 → 后端** | 请求拦截器 | 将前端的大数字 ID 转为字符串再发送 |

**两个拦截器缺一不可！**

## 📊 影响范围

### 受益的功能模块

- ✅ 子系统模板管理
- ✅ 子项模板管理
- ✅ 物料模板管理
- ✅ 子系统管理
- ✅ 子项管理
- ✅ 物料管理
- ✅ 所有使用雪花算法 ID 的模块

## ⚠️ 注意事项

### 1. 不要在组件中使用 Number() 转换 ID

```typescript
// ❌ 错误 - 会丢失精度
const id = Number(props.id);
const templateId = Number(props.templateId);

// ✅ 正确 - 直接使用
const id = props.id;
const templateId = props.templateId;
```

### 2. 比较 ID 时使用宽松相等

```typescript
// ✅ 推荐 - 宽松相等
if (item.id == selectedId) { }

// ✅ 也可以 - 转字符串后比较
if (String(item.id) === String(selectedId)) { }

// ❌ 避免 - 严格相等可能失败
if (item.id === selectedId) { }  // 当一个是string一个是number时会false
```

### 3. 作为对象键时会自动转为字符串

```typescript
// 对象的键会自动转为字符串，所以这是安全的
const map = {
  [item.id]: item  // ID会自动转为字符串键
};
```

## 🔄 版本信息

| 版本 | 日期       | 说明                                         |
| ---- | ---------- | -------------------------------------------- |
| v1.1 | 2025-01-06 | 添加请求拦截器 ID 转换，完整修复精度丢失问题 |

---

**修复人员**: 海棠开发团队  
**修复日期**: 2025-01-06  
**问题优先级**: P0 (严重)  
**修复状态**: ✅ 已完成
