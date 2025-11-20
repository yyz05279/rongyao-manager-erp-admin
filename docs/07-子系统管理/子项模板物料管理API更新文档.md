# 子项模板物料管理 API 更新文档

## 📋 更新概述

**更新时间**: 2025-11-20  
**更新类型**: API 路径重构 + 批量操作支持  
**影响范围**: 子项模板物料管理接口

---

## 🎯 更新内容

### 1. API 路径变更

将物料管理接口从独立的 `/erp/subsystem/material-template` 路径迁移到子项模板下的 RESTful 风格路径。

| 操作         | 旧路径                                            | 新路径                                                                 |
| ------------ | ------------------------------------------------- | ---------------------------------------------------------------------- |
| 查询物料列表 | `GET /erp/subsystem/item-template/{id}/materials` | `GET /erp/subsystem/item-template/{itemTemplateId}/materials`          |
| 批量新增物料 | `POST /erp/subsystem/material-template/batch`     | `POST /erp/subsystem/item-template/{itemTemplateId}/materials`         |
| 修改物料     | `PUT /erp/subsystem/material-template`            | `PUT /erp/subsystem/item-template/{itemTemplateId}/materials`          |
| 删除物料     | `DELETE /erp/subsystem/material-template/{ids}`   | `DELETE /erp/subsystem/item-template/{itemTemplateId}/materials/{ids}` |

### 2. 数据结构变更

#### 批量新增接口支持数组格式

**旧格式**（单个物料）:

```json
{
    "itemTemplateId": 10,
    "materialId": 100,
    "defaultQuantity": 500,
    "isRequired": true
}
```

**新格式**（物料数组）:

```json
[
    {
        "materialId": 100,
        "defaultQuantity": 500,
        "isRequired": true,
        "remarks": "主要材料"
    },
    {
        "materialId": 101,
        "defaultQuantity": 4,
        "isRequired": true,
        "remarks": "辅助材料"
    }
]
```

**注意**: `itemTemplateId` 不再需要在请求体中传递，而是通过 URL 路径参数传递。

---

## 📡 新接口详细说明

### 1. 查询子项模板的物料列表

**接口路径**: `GET /erp/subsystem/item-template/{itemTemplateId}/materials`

**路径参数**:

-   `itemTemplateId` (必填): 子项模板 ID

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": 1,
            "itemTemplateId": 10,
            "materialId": 100,
            "materialCode": "MAT-001",
            "materialName": "不锈钢板",
            "specification": "304 3mm",
            "unit": "张",
            "defaultQuantity": 500,
            "isRequired": true,
            "remarks": "主要材料"
        }
    ]
}
```

### 2. 批量新增子项模板的物料

**接口路径**: `POST /erp/subsystem/item-template/{itemTemplateId}/materials`

**路径参数**:

-   `itemTemplateId` (必填): 子项模板 ID

**请求体** (数组格式):

```json
[
    {
        "materialId": 100,
        "defaultQuantity": 500,
        "isRequired": true,
        "remarks": "主要材料"
    },
    {
        "materialId": 101,
        "defaultQuantity": 4,
        "isRequired": false,
        "remarks": "辅助材料"
    }
]
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 3. 批量修改子项模板的物料

**接口路径**: `PUT /erp/subsystem/item-template/{itemTemplateId}/materials`

**路径参数**:

-   `itemTemplateId` (必填): 子项模板 ID

**请求体** (数组格式):

```json
[
    {
        "id": 1,
        "materialId": 100,
        "defaultQuantity": 600,
        "isRequired": true,
        "remarks": "更新后的备注"
    },
    {
        "id": 2,
        "materialId": 101,
        "defaultQuantity": 8,
        "isRequired": false,
        "remarks": "调整数量"
    }
]
```

**成功响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**失败响应示例**:

```json
{
    "code": 500,
    "msg": "批量更新失败，成功1条，失败2条：\n第2条物料（ID:2）：物料ID不能为空\n第3条物料（ID:3）：更新失败，可能记录不存在"
}
```

### 4. 删除子项模板的物料

**接口路径**: `DELETE /erp/subsystem/item-template/{itemTemplateId}/materials/{ids}`

**路径参数**:

-   `itemTemplateId` (必填): 子项模板 ID
-   `ids` (必填): 物料 ID 列表，多个 ID 用逗号分隔

**示例**: `DELETE /erp/subsystem/item-template/10/materials/1,2,3`

---

## 🔧 前端代码更新指南

### TypeScript 类型定义

```typescript
// types/erp/subsystem/materialTemplate.ts

/**
 * 物料模板表单对象
 */
export interface MaterialTemplateForm {
    id?: number;
    materialId: number;
    defaultQuantity?: number;
    isRequired?: boolean;
    remarks?: string;
}

/**
 * 物料模板视图对象
 */
export interface MaterialTemplateVO extends MaterialTemplateForm {
    id: number;
    itemTemplateId: number;
    materialCode?: string;
    materialName?: string;
    specification?: string;
    unit?: string;
    createTime?: string;
    updateTime?: string;
}
```

### API 接口定义

```typescript
// api/erp/subsystem/itemTemplate.ts

import request from "@/utils/request";
import type { AxiosPromise } from "axios";
import type {
    MaterialTemplateForm,
    MaterialTemplateVO,
} from "@/types/erp/subsystem/materialTemplate";

/**
 * 查询子项模板的物料列表
 * @param itemTemplateId 子项模板ID
 */
export const getItemMaterials = (
    itemTemplateId: number
): AxiosPromise<MaterialTemplateVO[]> => {
    return request({
        url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
        method: "get",
    });
};

/**
 * 批量新增子项模板的物料
 * @param itemTemplateId 子项模板ID
 * @param data 物料数据数组
 */
export const addItemMaterials = (
    itemTemplateId: number,
    data: MaterialTemplateForm[]
): AxiosPromise<void> => {
    return request({
        url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
        method: "post",
        data: data,
    });
};

/**
 * 批量修改子项模板的物料
 * @param itemTemplateId 子项模板ID
 * @param data 物料数据数组
 */
export const updateItemMaterials = (
    itemTemplateId: number,
    data: MaterialTemplateForm[]
): AxiosPromise<void> => {
    return request({
        url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
        method: "put",
        data: data,
    });
};

/**
 * 删除子项模板的物料
 * @param itemTemplateId 子项模板ID
 * @param ids 物料ID数组
 */
export const deleteItemMaterials = (
    itemTemplateId: number,
    ids: number[]
): AxiosPromise<void> => {
    const idStr = ids.join(",");
    return request({
        url: `/erp/subsystem/item-template/${itemTemplateId}/materials/${idStr}`,
        method: "delete",
    });
};
```

---

## 💡 使用示例

### 示例 1: 查询物料列表

```typescript
// 查询子项模板ID为10的物料列表
const loadMaterials = async () => {
    try {
        const response = await getItemMaterials(10);
        console.log("物料列表:", response.data);
    } catch (error) {
        console.error("查询失败:", error);
    }
};
```

### 示例 2: 批量添加物料

```typescript
// 为子项模板ID为10批量添加物料
const addMaterials = async () => {
    const materials: MaterialTemplateForm[] = [
        {
            materialId: 100,
            defaultQuantity: 500,
            isRequired: true,
            remarks: "主要材料",
        },
        {
            materialId: 101,
            defaultQuantity: 4,
            isRequired: false,
            remarks: "辅助材料",
        },
    ];

    try {
        await addItemMaterials(10, materials);
        console.log("添加成功");
    } catch (error) {
        console.error("添加失败:", error);
    }
};
```

### 示例 3: 批量修改物料

```typescript
// 批量修改物料信息
const updateMaterials = async () => {
    const materials: MaterialTemplateForm[] = [
        {
            id: 1,
            materialId: 100,
            defaultQuantity: 600,
            isRequired: true,
            remarks: "更新后的备注",
        },
        {
            id: 2,
            materialId: 101,
            defaultQuantity: 8,
            isRequired: false,
            remarks: "调整数量",
        },
    ];

    try {
        await updateItemMaterials(10, materials);
        console.log("批量修改成功");
    } catch (error) {
        console.error("批量修改失败:", error);
    }
};
```

### 示例 4: 删除物料

```typescript
// 删除多个物料
const deleteMaterials = async () => {
    try {
        await deleteItemMaterials(10, [1, 2, 3]);
        console.log("删除成功");
    } catch (error) {
        console.error("删除失败:", error);
    }
};
```

---

## 🔄 迁移步骤

### 1. 更新 API 文件

将旧的物料模板 API 调用替换为新的接口：

**旧代码**:

```typescript
// 旧的API调用方式
import { addMaterialTemplateBatch } from "@/api/erp/subsystem/materialTemplate";

await addMaterialTemplateBatch([
    {
        itemTemplateId: 10,
        materialId: 100,
        defaultQuantity: 500,
    },
]);
```

**新代码**:

```typescript
// 新的API调用方式
import { addItemMaterials } from "@/api/erp/subsystem/itemTemplate";

await addItemMaterials(10, [
    {
        materialId: 100,
        defaultQuantity: 500,
    },
]);
```

### 2. 更新组件代码

在 Vue 组件中更新相关的 API 调用：

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
    getItemMaterials,
    addItemMaterials,
    updateItemMaterials,
} from "@/api/erp/subsystem/itemTemplate";
import type {
    MaterialTemplateForm,
    MaterialTemplateVO,
} from "@/types/erp/subsystem/materialTemplate";

const itemTemplateId = ref<number>(10);
const materials = ref<MaterialTemplateVO[]>([]);

// 加载物料列表
const loadMaterials = async () => {
    try {
        const response = await getItemMaterials(itemTemplateId.value);
        materials.value = response.data;
    } catch (error) {
        console.error("加载失败:", error);
    }
};

// 批量添加物料
const handleAddMaterials = async (newMaterials: MaterialTemplateForm[]) => {
    try {
        await addItemMaterials(itemTemplateId.value, newMaterials);
        await loadMaterials(); // 重新加载列表
    } catch (error) {
        console.error("添加失败:", error);
    }
};

// 批量更新物料
const handleUpdateMaterials = async (
    updatedMaterials: MaterialTemplateForm[]
) => {
    try {
        await updateItemMaterials(itemTemplateId.value, updatedMaterials);
        await loadMaterials(); // 重新加载列表
    } catch (error) {
        console.error("更新失败:", error);
    }
};

onMounted(() => {
    loadMaterials();
});
</script>
```

---

## ⚠️ 注意事项

1. **路径参数**: `itemTemplateId` 现在通过 URL 路径传递，不再需要在请求体中包含
2. **批量操作**:
    - 新增接口支持数组格式，可以一次添加多个物料
    - **修改接口也支持数组格式，可以一次更新多个物料**
3. **RESTful 风格**: 新接口遵循 RESTful 设计规范，更加语义化
4. **向后兼容**: 旧的 `/erp/subsystem/material-template` 接口仍然保留，但建议迁移到新接口
5. **权限控制**: 所有接口都需要相应的权限：
    - 查询: `erp:subsystem:template:query`
    - 新增: `erp:subsystem:template:add`
    - 修改: `erp:subsystem:template:edit`
    - 删除: `erp:subsystem:template:remove`
6. **批量更新特性**:
    - 每个物料必须包含 `id` 字段用于定位
    - **只要有一个物料更新失败，整个接口就返回失败**
    - 失败时会返回详细的错误信息，包括成功和失败的数量及具体失败原因
    - 支持事务回滚，确保数据一致性

---

## 📝 更新日志

| 版本 | 日期       | 更新内容                   |
| ---- | ---------- | -------------------------- |
| v2.0 | 2025-11-20 | API 路径重构，支持批量操作 |
| v1.0 | 2025-11-05 | 初始版本                   |

---

## 🔗 相关文档

-   [子系统模板子项和物料管理 API 文档](./子系统模板子项和物料管理API文档.md)
-   [子系统物料查询 API 对接文档](./子系统物料查询API对接文档.md)
-   [海棠 ERP 系统项目编码规范](../../README.md)
