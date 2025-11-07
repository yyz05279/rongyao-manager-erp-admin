# 子系统物料查询 API 使用指南

## API 接口

### 根据子项模板 ID 查询物料列表

**接口地址**: `GET /erp/subsystem/material-template/list-by-item/{itemTemplateId}`

**接口描述**: 根据子项模板 ID 查询物料列表，支持通过子系统模板 ID 过滤

**权限标识**: `erp:subsystem:template:query`

**路径参数**:

| 参数名         | 类型   | 必填 | 说明        |
| -------------- | ------ | ---- | ----------- |
| itemTemplateId | number | 是   | 子项模板 ID |

**查询参数**:

| 参数名     | 类型   | 必填 | 说明                                                  |
| ---------- | ------ | ---- | ----------------------------------------------------- |
| templateId | number | 否   | 子系统模板 ID（不传则查询该子项在所有子系统中的物料） |

---

## 使用场景

### 场景 1：查询特定子系统中的子项物料（推荐）⭐

**使用时机**: 在子系统管理页面，查看某个子系统中某个子项的物料配置

**请求示例**:

```http
GET /erp/subsystem/material-template/list-by-item/1986239297161666561?templateId=1985928480973324290
```

**参数说明**:

-   `itemTemplateId`: 1986239297161666561（子项模板 ID）
-   `templateId`: 1985928480973324290（子系统模板 ID）

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1986340417087434754",
            "templateId": "1985928480973324290",
            "itemTemplateId": "1986239297161666561",
            "materialId": "1985570850991910913",
            "materialCode": "MAT-1762231955656-1EA3",
            "materialName": "铜鼻子",
            "specification": "95mm²",
            "unit": "个",
            "defaultQuantity": 2,
            "isRequired": true,
            "remarks": ""
        }
    ]
}
```

**数据特点**:

-   ✅ 只返回该子系统中该子项的物料
-   ✅ `templateId` 字段不为空，表示属于特定子系统
-   ✅ 数据隔离，不包含其他子系统的物料

---

### 场景 2：查询子项在所有子系统中的物料（独立模式）

**使用时机**: 在子项模板管理页面，查看某个子项在所有子系统中的物料使用情况

**请求示例**:

```http
GET /erp/subsystem/material-template/list-by-item/1986239297161666561
```

**参数说明**:

-   `itemTemplateId`: 1986239297161666561（子项模板 ID）
-   `templateId`: **不传**

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1986340417087434754",
            "templateId": "1985928480973324290",
            "itemTemplateId": "1986239297161666561",
            "materialId": "1985570850991910913",
            "materialCode": "MAT-1762231955656-1EA3",
            "materialName": "铜鼻子",
            "specification": "95mm²",
            "unit": "个",
            "defaultQuantity": 2,
            "isRequired": true
        },
        {
            "id": "1986258810263515138",
            "templateId": null,
            "itemTemplateId": "1986239297161666561",
            "materialId": "1985570846126518273",
            "materialCode": "MAT-1762231941980-C4BB",
            "materialName": "铜排",
            "specification": "80*10mm",
            "unit": "米",
            "defaultQuantity": 1,
            "isRequired": true
        }
    ]
}
```

**数据特点**:

-   ✅ 返回该子项在所有子系统中的物料
-   ✅ 包含独立物料（`templateId` 为 null）
-   ✅ 包含关联物料（`templateId` 不为 null）
-   ⚠️ 数据混合，需要前端自行过滤

---

## 前端调用示例

### TypeScript/JavaScript 示例

```typescript
/**
 * 根据子项模板ID查询物料列表
 * @param itemTemplateId 子项模板ID
 * @param templateId 子系统模板ID（可选）
 */
export const listMaterialByItem = (
    itemTemplateId: string,
    templateId?: string
): AxiosPromise<MaterialVO[]> => {
    return request({
        url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
        method: "get",
        params: templateId ? { templateId } : {}, // ✅ 如果有templateId则传递
    });
};

// 使用示例1：查询特定子系统中的物料（推荐）
const materials1 = await listMaterialByItem(
    "1986239297161666561", // 子项ID
    "1985928480973324290" // 子系统ID
);

// 使用示例2：查询所有子系统中的物料
const materials2 = await listMaterialByItem(
    "1986239297161666561" // 子项ID
    // 不传第二个参数
);
```

### Vue 组件示例

```vue
<template>
    <div>
        <el-table :data="materials">
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="specification" label="规格" />
            <el-table-column prop="defaultQuantity" label="数量" />
        </el-table>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { listMaterialByItem } from "@/api/subsystem/material";

const props = defineProps({
    itemTemplateId: {
        type: String,
        required: true,
    },
    templateId: {
        // ✅ 子系统ID（可选）
        type: String,
        required: false,
    },
});

const materials = ref([]);

onMounted(async () => {
    // ✅ 根据是否有templateId，查询不同范围的物料
    const data = await listMaterialByItem(
        props.itemTemplateId,
        props.templateId // 如果有templateId则只查询该子系统的物料
    );
    materials.value = data;
});
</script>
```

---

## 关键注意事项

### ⚠️ 重要提示

1. **在子系统管理页面，必须传递 `templateId` 参数**

    - ✅ 正确：`/list-by-item/123?templateId=456`
    - ❌ 错误：`/list-by-item/123`（会查询所有子系统的物料）

2. **数据隔离原则**

    - 不同子系统中同一子项的物料配置是独立的
    - 修改一个子系统的物料不会影响其他子系统
    - 通过 `template_id` + `item_template_id` 组合来唯一标识

3. **向后兼容**
    - `templateId` 参数是可选的
    - 不传 `templateId` 时，查询该子项在所有子系统中的物料（旧版本行为）

---

## 数据隔离示例

### 示例场景

-   **子系统 A**（ID：1） 关联了 **子项 X**（ID：100）
-   **子系统 B**（ID：2） 关联了 **子项 X**（ID：100）

**物料配置**：

-   子系统 A 中，子项 X 的物料：
    -   物料 M1（数量：10）
    -   物料 M2（数量：5）
-   子系统 B 中，子项 X 的物料：
    -   物料 M1（数量：20）
    -   物料 M3（数量：15）

### 查询对比

**查询 1：子项 X 在子系统 A 中的物料**

```http
GET /erp/subsystem/material-template/list-by-item/100?templateId=1
```

**结果**：

-   ✅ 返回物料 M1（数量：10）、M2（数量：5）
-   ❌ 不包含子系统 B 的物料

**查询 2：子项 X 在子系统 B 中的物料**

```http
GET /erp/subsystem/material-template/list-by-item/100?templateId=2
```

**结果**：

-   ✅ 返回物料 M1（数量：20）、M3（数量：15）
-   ❌ 不包含子系统 A 的物料

**查询 3：子项 X 在所有子系统中的物料**

```http
GET /erp/subsystem/material-template/list-by-item/100
```

**结果**：

-   ✅ 返回所有物料：M1（两条记录，分别属于子系统 A 和 B）、M2、M3
-   ⚠️ 数据混合，需要根据 `templateId` 字段区分

---

## 常见错误

### 错误 1：在子系统中查询物料时不传 `templateId`

**问题代码**:

```javascript
// ❌ 错误：会查询所有子系统的物料，导致数据混淆
const materials = await listMaterialByItem(itemTemplateId);
```

**正确代码**:

```javascript
// ✅ 正确：只查询当前子系统的物料
const materials = await listMaterialByItem(itemTemplateId, templateId);
```

### 错误 2：修改物料时影响到其他子系统

**原因**: 前端查询时没有传递 `templateId`，导致查询到的是多个子系统的物料混合，修改时可能影响到其他子系统的数据。

**解决方案**: 始终在查询时传递正确的 `templateId`，确保数据隔离。

---

## 修改记录

-   **修改时间**: 2025-11-06
-   **修改内容**: 增加 `templateId` 可选查询参数，支持数据隔离
-   **向后兼容**: ✅ 完全兼容（`templateId` 为可选参数）
-   **相关文档**: [子系统物料独立管理功能修复.md](./子系统物料独立管理功能修复.md)
