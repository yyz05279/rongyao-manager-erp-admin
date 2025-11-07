# 子系统物料查询 API 对接文档

## 📋 概述

本文档说明前端在不同页面中应该调用的物料查询接口，以实现模板物料和子系统物料的数据隔离。

## 📝 版本更新

### v1.1 (2025-11-07)

- ✅ **修复**：修正了子项模板管理独立页面的接口调用问题
- ✅ **优化**：优化了 API 函数命名，使其更清晰易懂
  - `getItemMaterials` → `getItemTemplateMaterials`
  - `listMaterialTemplateByItemId` → `getItemMaterialsInSubsystem`
- ✅ **兼容**：保留旧函数名作为别名，确保向后兼容
- ✅ **文档**：更新了所有代码示例，使用 TypeScript 类型标注

### v1.0 (2025-11-07)

- 初始版本，说明数据隔离原则和接口使用方式

## 🎯 核心概念

### 物料的两种类型

| 类型           | template_id  | 含义                                 | 管理页面     |
| -------------- | ------------ | ------------------------------------ | ------------ |
| **模板物料**   | `NULL`       | 子项模板的默认物料配置，作为标准模板 | 子项模板管理 |
| **子系统物料** | `<子系统ID>` | 特定子系统中该子项的实际物料配置     | 子系统详情   |

### 数据隔离原则

- ✅ 在"子项模板管理"页面修改物料 → 只影响模板物料（template_id = NULL）
- ✅ 在"子系统详情"页面修改物料 → 只影响该子系统的物料（template_id = 子系统 ID）
- ✅ 两者完全独立，互不影响

## 📡 API 接口说明

### 1. 查询子项模板的默认物料（模板级别）

**用于页面**：子项模板管理

**接口路径**：

```
GET /erp/subsystem/item-template/{itemTemplateId}/materials
```

**请求参数**：

- `itemTemplateId`（路径参数，必填）：子项模板 ID

**返回数据**：

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1986352918038523905",
            "templateId": null, // ✅ 注意：模板物料的templateId为null
            "itemTemplateId": "1986239297161666561",
            "materialId": "1985570846126518273",
            "materialCode": "MAT-1762231954495-5A78",
            "materialName": "槽式桥架",
            "specification": "50mm*500mm",
            "defaultQuantity": 10,
            "isRequired": true,
            "remarks": ""
        }
    ]
}
```

**SQL 查询条件**：

```sql
WHERE item_template_id = ?
  AND template_id IS NULL  -- 关键：只查询模板物料
```

**前端调用示例**：

```typescript
// 文件位置：src/api/erp/subsystem/item-template.ts

/**
 * 查询子项模板的默认物料列表（模板级别）
 *
 * 说明：该接口查询子项模板的默认物料配置，即 template_id = NULL 的模板物料
 * 用途：在"子项模板管理"页面中使用，不涉及具体子系统
 * 数据特征：返回的物料记录的 templateId 字段为 null
 *
 * @param itemTemplateId 子项模板ID
 * @returns 模板物料列表
 */
export const getItemTemplateMaterials = (itemTemplateId: string | number): AxiosPromise<any[]> => {
    return request({
        url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
        method: "get",
    });
};
```

---

### 2. 查询子项在子系统中的物料（子系统级别）

**用于页面**：子系统详情

**接口路径**：

```
GET /erp/subsystem/material-template/list-by-item/{itemTemplateId}?templateId={templateId}
```

**请求参数**：

- `itemTemplateId`（路径参数，必填）：子项模板 ID
- `templateId`（查询参数，必填）：子系统模板 ID

**返回数据**：

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1986586568717946881",
            "templateId": "1985928480973324290", // ✅ 注意：子系统物料有具体的templateId
            "itemTemplateId": "1986239297161666561",
            "materialId": "1985570844872421378",
            "materialCode": "MAT-1762231954455-A1B8",
            "materialName": "垂直下弯通",
            "specification": "配套连接片",
            "defaultQuantity": 5,
            "isRequired": true,
            "remarks": ""
        }
    ]
}
```

**SQL 查询条件**：

```sql
WHERE item_template_id = ?
  AND template_id = ?  -- 关键：只查询该子系统的物料
```

**前端调用示例**：

```typescript
// 文件位置：src/api/erp/subsystem/material-template.ts

/**
 * 查询子项在子系统中的物料列表（子系统级别）
 *
 * 说明：该接口查询特定子系统中某个子项的物料配置，即 template_id = 子系统ID 的物料
 * 用途：在"子系统详情"页面中使用，查询该子系统中的物料配置
 * 数据特征：返回的物料记录的 templateId 字段有具体值（子系统ID）
 *
 * ⚠️ 重要：在子系统详情页面中，必须传递 templateId 参数实现数据隔离
 *
 * @param itemTemplateId 子项模板ID（必填）
 * @param templateId 子系统模板ID（必填，用于数据隔离）
 * @returns 子系统物料列表
 */
export const getItemMaterialsInSubsystem = (
    itemTemplateId: string | number,
    templateId: string | number
): AxiosPromise<SubsystemMaterialTemplateVO[]> => {
    let url = `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`;
    if (templateId) {
        url += `?templateId=${encodeURIComponent(String(templateId))}`;
    }

    return request({
        url: url,
        method: "get",
    });
};

// 旧函数名（向后兼容）
export const listMaterialTemplateByItemId = getItemMaterialsInSubsystem;
```

---

## 🔄 完整的前端调用示例

### 场景 1：子项模板管理页面

```vue
<template>
    <div class="item-template-manager">
        <!-- 子项列表 -->
        <el-table :data="itemList">
            <el-table-column label="子项名称" prop="itemName" />
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button @click="viewMaterials(row.id)"
                        >查看物料</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <!-- 物料列表对话框 -->
        <el-dialog v-model="materialsDialogVisible" title="子项模板物料">
            <el-table :data="materialList">
                <el-table-column label="物料名称" prop="materialName" />
                <el-table-column label="默认数量" prop="defaultQuantity" />
            </el-table>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getItemTemplateMaterials } from "@/api/erp/subsystem/item-template";

const materialList = ref([]);
const materialsDialogVisible = ref(false);

// ✅ 正确：查询模板物料（template_id = NULL）
async function viewMaterials(itemTemplateId: string | number) {
    const { data } = await getItemTemplateMaterials(itemTemplateId);
    materialList.value = data;
    materialsDialogVisible.value = true;
}
</script>
```

### 场景 2：子系统详情页面

```vue
<template>
    <div class="subsystem-detail">
        <h2>{{ subsystemInfo.templateName }}</h2>

        <!-- 子项列表 -->
        <el-table :data="itemList">
            <el-table-column label="子项名称" prop="itemName" />
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button @click="viewMaterials(row.itemTemplateId)"
                        >查看物料</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <!-- 物料列表对话框 -->
        <el-dialog v-model="materialsDialogVisible" title="子系统物料">
            <el-table :data="materialList">
                <el-table-column label="物料名称" prop="materialName" />
                <el-table-column label="数量" prop="defaultQuantity" />
                <el-table-column label="操作">
                    <template #default="{ row }">
                        <el-button @click="editQuantity(row)"
                            >修改数量</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getItemMaterialsInSubsystem, listMaterialTemplateByItemId } from "@/api/erp/subsystem/material-template";

const route = useRoute();
const subsystemId = computed(() => route.params.id as string); // 从路由获取子系统ID

const materialList = ref([]);
const materialsDialogVisible = ref(false);

// ✅ 正确：查询子系统物料（template_id = 子系统ID），必须传递templateId
async function viewMaterials(itemTemplateId: string | number) {
    // 推荐使用新函数名（更清晰）
    const { data } = await getItemMaterialsInSubsystem(
        itemTemplateId,
        subsystemId.value // ⚠️ 重要：传递子系统ID，实现数据隔离
    );

    // 或者使用旧函数名（向后兼容）
    // const { data } = await listMaterialTemplateByItemId(itemTemplateId, subsystemId.value);

    materialList.value = data;
    materialsDialogVisible.value = true;
}
</script>
```

---

## ⚠️ 常见错误

### ❌ 错误示例 1：子系统详情页面未传 templateId

```javascript
// ❌ 错误：忘记传递templateId参数
async function viewMaterials(itemTemplateId) {
    const { data } = await request({
        url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
        method: "get",
        // 缺少 params: { templateId: subsystemId }
    });
}
```

**后果**：接口会返回 400 错误，提示"子系统模板 ID 不能为空"

### ❌ 错误示例 2：子项模板管理页面调用了错误的接口

```javascript
// ❌ 错误：在子项模板管理页面调用了子系统接口
async function viewMaterials(itemTemplateId) {
    const { data } = await request({
        url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
        method: "get",
        params: { templateId: someTemplateId }, // 错误：模板页面不应该传templateId
    });
}
```

**后果**：会查询到子系统物料，而不是模板物料

---

## 🧪 测试验证

### 测试步骤 1：验证数据隔离

1. **在子项模板管理中设置物料数量**

   ```
   子项：桥架支架
   物料：槽式桥架
   默认数量：10个
   ```

2. **将子项添加到子系统 A**

   - 系统自动创建子系统物料（从模板复制）
   - 初始数量：10 个

3. **在子系统 A 中修改物料数量**

   ```
   修改为：20个
   ```

4. **返回子项模板管理查看**
   - 预期：数量仍然是 10 个（未被修改）
   - 验证：两个接口返回的数据不同

### 测试步骤 2：验证日志

**子项模板管理页面查询时的日志**：

```log
[模板物料查询] itemTemplateId=1986239297161666561, 查询模板级别的默认物料（template_id = NULL）
[模板物料查询] 查询到2条模板级别的默认物料
```

**子系统详情页面查询时的日志**：

```log
[物料查询] itemTemplateId=1986239297161666561, templateId=1985928480973324290
[物料查询] 查询子项[1986239297161666561]在子系统[1985928480973324290]中的物料配置（关联模式）
[物料查询] 查询到2条物料记录
```

---

## 📝 API 对比总结

| 对比项           | 子项模板管理接口                              | 子系统详情接口                                                      |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| **函数名（新）** | `getItemTemplateMaterials`                    | `getItemMaterialsInSubsystem`                                       |
| **函数名（旧）** | `getItemMaterials` (deprecated)               | `listMaterialTemplateByItemId` (deprecated)                         |
| **路径**         | `/erp/subsystem/item-template/{id}/materials` | `/erp/subsystem/material-template/list-by-item/{id}?templateId=xxx` |
| **参数**         | 只需要 itemTemplateId                         | 需要 itemTemplateId 和 templateId                                   |
| **查询条件**     | `template_id IS NULL`                         | `template_id = ?`                                                   |
| **返回数据**     | 模板物料                                      | 子系统物料                                                          |
| **数据特征**     | `templateId` 字段为 null                      | `templateId` 字段有值                                               |
| **使用场景**     | 子项模板管理独立页面                          | 子系统详情页面中的子项管理                                          |

---

## 🔧 后端日志说明

修改后的后端日志会明确显示查询模式：

```log
# 模板物料查询
【模板物料查询】itemTemplateId=xxx, 查询模板级别的默认物料（template_id = NULL）
【模板物料查询】查询到X条模板级别的默认物料

# 子系统物料查询
【物料查询】itemTemplateId=xxx, templateId=yyy
【物料查询】查询子项[xxx]在子系统[yyy]中的物料配置（关联模式）
【物料查询】查询到X条物料记录
```

---

## 📞 联系方式

如有疑问，请联系后端开发团队。

---

**文档版本**：v1.1  
**更新时间**：2025-11-07  
**维护人员**：海棠开发团队

## 🔖 相关文档

- [子系统管理模块完整 API 文档](./子系统管理模块完整API文档.md)
- [子系统物料管理快速参考](./子系统物料管理快速参考.md)
- [子系统模板 API 文档](./子系统模板API文档.md)
