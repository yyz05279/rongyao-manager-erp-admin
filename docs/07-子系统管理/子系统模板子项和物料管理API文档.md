# 子系统模板子项和物料管理 API 文档

## 文档信息

-   **模块名称**: 子系统模板子项和物料管理
-   **版本**: v1.0
-   **更新日期**: 2025 年 11 月 5 日

---

## 目录

1. [功能概述](#功能概述)
2. [数据模型](#数据模型)
3. [接口列表](#接口列表)
4. [子项模板接口详情](#子项模板接口详情)
5. [物料模板接口详情](#物料模板接口详情)
6. [业务规则](#业务规则)
7. [使用示例](#使用示例)

---

## 功能概述

### 三层管理架构

```
子系统模板 (SubsystemTemplate)
    ↓ 包含多个
子项模板 (ItemTemplate)
    ↓ 包含多个
物料模板 (MaterialTemplate) → 关联基础物料库
```

### 典型业务场景

**示例：固态处理厂子系统模板**

```
子系统模板：固态处理厂
  ├── 子项1：压力容器
  │     ├── 物料1：钢板 Q345R, 默认数量: 500kg
  │     ├── 物料2：法兰 DN200, 默认数量: 4个
  │     └── 物料3：螺栓 M16, 默认数量: 32个
  │
  └── 子项2：控制柜
        ├── 物料1：PLC西门子S7-1200, 默认数量: 1台
        ├── 物料2：断路器 ABB, 默认数量: 3个
        └── 物料3：电缆线, 默认数量: 50米
```

### 核心功能

1. **子项模板管理**：在子系统模板中定义和管理子项
2. **物料模板管理**：在子项模板中定义和管理物料配置
3. **灵活调整**：应用到项目时可对物料进行增删改和数量调整

---

## 数据模型

### 子项模板对象 (ItemTemplateVO)

```typescript
interface SubsystemItemTemplateVO {
    id: number; // 主键ID
    templateId: number; // 子系统模板ID
    itemCode: string; // 子项编号
    itemName: string; // 子项名称
    itemType?: string; // 子项类型（如：组件、部件、单元等）
    specification?: string; // 规格型号
    description?: string; // 描述
    defaultQuantity?: number; // 默认数量
    unit?: string; // 单位
    isRequired?: boolean; // 是否必需
    sequenceNumber?: number; // 排序号
    remarks?: string; // 备注
    createTime?: string; // 创建时间
    updateTime?: string; // 更新时间
}
```

### 物料模板对象 (MaterialTemplateVO)

```typescript
interface SubsystemMaterialTemplateVO {
    id: number; // 主键ID
    templateId: number; // 子系统模板ID
    itemTemplateId: number; // 子项模板ID
    materialId: number; // 基础物料ID
    materialCode?: string; // 物料编码（冗余字段）
    materialName?: string; // 物料名称（冗余字段）
    specification?: string; // 规格型号（冗余字段）
    unit?: string; // 单位（冗余字段）
    defaultQuantity: number; // 默认数量
    isRequired?: boolean; // 是否必需
    remarks?: string; // 备注
    createTime?: string; // 创建时间
    updateTime?: string; // 更新时间
}
```

---

## 接口列表

### 子系统模板接口（新增）

| 序号 | 接口名称           | 请求方式 | 接口路径      | 权限标识                       |
| ---- | ------------------ | -------- | ------------- | ------------------------------ |
| 1    | 获取模板的子项列表 | GET      | `/{id}/items` | `erp:subsystem:template:query` |

### 子项模板接口

| 序号 | 接口名称             | 请求方式 | 接口路径                         | 权限标识                        |
| ---- | -------------------- | -------- | -------------------------------- | ------------------------------- |
| 1    | 查询子项模板列表     | GET      | `/list`                          | `erp:subsystem:template:list`   |
| 2    | 根据模板 ID 查询子项 | GET      | `/list-by-template/{templateId}` | `erp:subsystem:template:query`  |
| 3    | 查询子项模板详情     | GET      | `/{id}`                          | `erp:subsystem:template:query`  |
| 4    | 新增子项模板         | POST     | `/`                              | `erp:subsystem:template:add`    |
| 5    | 批量新增子项模板     | POST     | `/batch`                         | `erp:subsystem:template:add`    |
| 6    | 修改子项模板         | PUT      | `/`                              | `erp:subsystem:template:edit`   |
| 7    | 删除子项模板         | DELETE   | `/{ids}`                         | `erp:subsystem:template:remove` |
| 8    | 导出子项模板列表     | POST     | `/export`                        | `erp:subsystem:template:export` |
| 9    | 生成子项编号         | GET      | `/generate-code/{templateId}`    | 无                              |
| 10   | 获取子项的物料列表   | GET      | `/{id}/materials`                | `erp:subsystem:template:query`  |

### 物料模板接口

| 序号 | 接口名称                 | 请求方式 | 接口路径                         | 权限标识                        |
| ---- | ------------------------ | -------- | -------------------------------- | ------------------------------- |
| 1    | 查询物料模板列表         | GET      | `/list`                          | `erp:subsystem:template:list`   |
| 2    | 根据子项 ID 查询物料列表 | GET      | `/list-by-item/{itemTemplateId}` | `erp:subsystem:template:query`  |
| 3    | 根据模板 ID 查询所有物料 | GET      | `/list-by-template/{templateId}` | `erp:subsystem:template:query`  |
| 4    | 查询物料模板详情         | GET      | `/{id}`                          | `erp:subsystem:template:query`  |
| 5    | 新增物料模板             | POST     | `/`                              | `erp:subsystem:template:add`    |
| 6    | 批量新增物料模板         | POST     | `/batch`                         | `erp:subsystem:template:add`    |
| 7    | 修改物料模板             | PUT      | `/`                              | `erp:subsystem:template:edit`   |
| 8    | 删除物料模板             | DELETE   | `/{ids}`                         | `erp:subsystem:template:remove` |
| 9    | 导出物料模板列表         | POST     | `/export`                        | `erp:subsystem:template:export` |

---

## 子项模板接口详情

### 1. 获取模板的子项列表

**接口地址**: `GET /erp/subsystem/template/{id}/items`

**接口描述**: 获取指定子系统模板的所有子项列表

**权限标识**: `erp:subsystem:template:query`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明          |
| ------ | ------ | ---- | ------------- |
| id     | number | 是   | 子系统模板 ID |

**请求示例**:

```bash
GET /erp/subsystem/template/1/items
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": [
        {
            "id": 1,
            "templateId": 1,
            "itemCode": "ITEM-1-001",
            "itemName": "压力容器",
            "itemType": "组件",
            "specification": "标准型",
            "description": "主要压力容器",
            "defaultQuantity": 1,
            "unit": "个",
            "isRequired": true,
            "sequenceNumber": 10,
            "remarks": "核心组件",
            "createTime": "2025-11-05 10:00:00"
        }
    ]
}
```

### 2. 新增子项模板

**接口地址**: `POST /erp/subsystem/item-template`

**接口描述**: 为子系统模板添加新的子项

**权限标识**: `erp:subsystem:template:add`

**请求体参数**:

| 参数名          | 类型    | 必填 | 说明                       |
| --------------- | ------- | ---- | -------------------------- |
| templateId      | number  | 是   | 子系统模板 ID              |
| itemCode        | string  | 否   | 子项编号（不传则自动生成） |
| itemName        | string  | 是   | 子项名称                   |
| itemType        | string  | 否   | 子项类型                   |
| specification   | string  | 否   | 规格型号                   |
| description     | string  | 否   | 描述                       |
| defaultQuantity | number  | 否   | 默认数量，默认 1           |
| unit            | string  | 否   | 单位，默认"个"             |
| isRequired      | boolean | 否   | 是否必需，默认 true        |
| sequenceNumber  | integer | 否   | 排序号，不传自动计算       |
| remarks         | string  | 否   | 备注                       |

**请求示例**:

```json
{
    "templateId": 1,
    "itemName": "压力容器",
    "itemType": "组件",
    "specification": "标准型",
    "description": "主要压力容器",
    "defaultQuantity": 1,
    "unit": "个",
    "isRequired": true,
    "remarks": "核心组件"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 3. 批量新增子项模板

**接口地址**: `POST /erp/subsystem/item-template/batch`

**接口描述**: 批量为子系统模板添加多个子项

**权限标识**: `erp:subsystem:template:add`

**请求体**: 子项模板对象数组

**请求示例**:

```json
[
    {
        "templateId": 1,
        "itemName": "压力容器",
        "itemType": "组件",
        "defaultQuantity": 1,
        "unit": "个"
    },
    {
        "templateId": 1,
        "itemName": "控制柜",
        "itemType": "组件",
        "defaultQuantity": 1,
        "unit": "个"
    }
]
```

### 4. 获取子项的物料列表

**接口地址**: `GET /erp/subsystem/item-template/{id}/materials`

**接口描述**: 获取指定子项模板的所有物料列表

**权限标识**: `erp:subsystem:template:query`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明        |
| ------ | ------ | ---- | ----------- |
| id     | number | 是   | 子项模板 ID |

**请求示例**:

```bash
GET /erp/subsystem/item-template/1/materials
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": [
        {
            "id": 1,
            "templateId": 1,
            "itemTemplateId": 1,
            "materialId": 100,
            "materialCode": "MT-2024001",
            "materialName": "钢板 Q345R",
            "specification": "厚度20mm",
            "unit": "kg",
            "defaultQuantity": 500,
            "isRequired": true,
            "remarks": "主材料",
            "createTime": "2025-11-05 10:00:00"
        }
    ]
}
```

---

## 物料模板接口详情

### 1. 根据子项 ID 查询物料列表

**接口地址**: `GET /erp/subsystem/material-template/list-by-item/{itemTemplateId}`

**接口描述**: 查询指定子项模板下的所有物料

**权限标识**: `erp:subsystem:template:query`

**路径参数**:

| 参数名         | 类型   | 必填 | 说明        |
| -------------- | ------ | ---- | ----------- |
| itemTemplateId | number | 是   | 子项模板 ID |

### 2. 新增物料模板

**接口地址**: `POST /erp/subsystem/material-template`

**接口描述**: 为子项模板添加物料配置

**权限标识**: `erp:subsystem:template:add`

**请求体参数**:

| 参数名          | 类型    | 必填 | 说明                |
| --------------- | ------- | ---- | ------------------- |
| templateId      | number  | 是   | 子系统模板 ID       |
| itemTemplateId  | number  | 是   | 子项模板 ID         |
| materialId      | number  | 是   | 基础物料 ID         |
| defaultQuantity | number  | 否   | 默认数量，默认 1    |
| isRequired      | boolean | 否   | 是否必需，默认 true |
| remarks         | string  | 否   | 备注                |

**请求示例**:

```json
{
    "templateId": 1,
    "itemTemplateId": 1,
    "materialId": 100,
    "defaultQuantity": 500,
    "isRequired": true,
    "remarks": "主材料"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 3. 批量新增物料模板

**接口地址**: `POST /erp/subsystem/material-template/batch`

**接口描述**: 批量为子项模板添加多个物料

**权限标识**: `erp:subsystem:template:add`

**请求体**: 物料模板对象数组

**请求示例**:

```json
[
    {
        "templateId": 1,
        "itemTemplateId": 1,
        "materialId": 100,
        "defaultQuantity": 500,
        "isRequired": true
    },
    {
        "templateId": 1,
        "itemTemplateId": 1,
        "materialId": 101,
        "defaultQuantity": 4,
        "isRequired": true
    }
]
```

### 4. 修改物料模板

**接口地址**: `PUT /erp/subsystem/material-template`

**接口描述**: 修改物料模板的配置（如数量）

**权限标识**: `erp:subsystem:template:edit`

**请求体参数**:

| 参数名          | 类型    | 必填 | 说明          |
| --------------- | ------- | ---- | ------------- |
| id              | number  | 是   | 物料模板 ID   |
| templateId      | number  | 是   | 子系统模板 ID |
| itemTemplateId  | number  | 是   | 子项模板 ID   |
| materialId      | number  | 是   | 基础物料 ID   |
| defaultQuantity | number  | 否   | 默认数量      |
| isRequired      | boolean | 否   | 是否必需      |
| remarks         | string  | 否   | 备注          |

**请求示例**:

```json
{
    "id": 1,
    "templateId": 1,
    "itemTemplateId": 1,
    "materialId": 100,
    "defaultQuantity": 600,
    "isRequired": true,
    "remarks": "数量已调整"
}
```

### 5. 删除物料模板

**接口地址**: `DELETE /erp/subsystem/material-template/{ids}`

**接口描述**: 删除一个或多个物料模板

**权限标识**: `erp:subsystem:template:remove`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                             |
| ------ | ------ | ---- | -------------------------------- |
| ids    | string | 是   | 物料模板 ID 列表，多个用逗号分隔 |

**请求示例**:

```bash
DELETE /erp/subsystem/material-template/1,2,3
```

---

## 业务规则

### 1. 子项模板规则

1. **编号生成**: 格式为 `ITEM-{templateId}-{序号}` (如: ITEM-1-001)
2. **排序规则**: `sequenceNumber` 用于控制子项显示顺序，新增时自动递增
3. **唯一性约束**: 同一模板下 `itemCode` 必须唯一
4. **默认值**:
    - `isRequired`: true
    - `defaultQuantity`: 1
    - `unit`: "个"

### 2. 物料模板规则

1. **关联关系**: 物料模板必须关联到已存在的子项模板
2. **物料信息**: 自动从基础物料库（`erp_material`）获取物料的编码、名称、规格等信息
3. **数量管理**: `defaultQuantity` 表示模板中的默认数量，应用到项目时可以调整
4. **删除级联**: 删除子项模板时，其关联的物料模板也会被删除

### 3. 数据流转流程

```
1. 创建子系统模板
   ↓
2. 为模板添加子项
   ↓
3. 为子项添加物料
   ↓
4. 应用到具体项目时
   ↓
5. 可以对物料进行增删改和数量调整
```

---

## 使用示例

### TypeScript API 定义

```typescript
import request from "@/utils/request";

/**
 * 子项模板表单对象
 */
export interface SubsystemItemTemplateForm {
    id?: number;
    templateId: number;
    itemCode?: string;
    itemName: string;
    itemType?: string;
    specification?: string;
    description?: string;
    defaultQuantity?: number;
    unit?: string;
    isRequired?: boolean;
    sequenceNumber?: number;
    remarks?: string;
}

/**
 * 物料模板表单对象
 */
export interface SubsystemMaterialTemplateForm {
    id?: number;
    templateId: number;
    itemTemplateId: number;
    materialId: number;
    defaultQuantity?: number;
    isRequired?: boolean;
    remarks?: string;
}

// ============= 子系统模板接口（新增） =============

/**
 * 获取模板的子项列表
 */
export const getTemplateItems = (templateId: number) => {
    return request({
        url: `/erp/subsystem/template/${templateId}/items`,
        method: "get",
    });
};

// ============= 子项模板接口 =============

/**
 * 查询子项模板列表
 */
export const listItemTemplate = (query?: any) => {
    return request({
        url: "/erp/subsystem/item-template/list",
        method: "get",
        params: query,
    });
};

/**
 * 根据模板ID查询子项列表
 */
export const listItemTemplateByTemplateId = (templateId: number) => {
    return request({
        url: `/erp/subsystem/item-template/list-by-template/${templateId}`,
        method: "get",
    });
};

/**
 * 查询子项模板详情
 */
export const getItemTemplate = (id: number) => {
    return request({
        url: `/erp/subsystem/item-template/${id}`,
        method: "get",
    });
};

/**
 * 新增子项模板
 */
export const addItemTemplate = (data: SubsystemItemTemplateForm) => {
    return request({
        url: "/erp/subsystem/item-template",
        method: "post",
        data: data,
    });
};

/**
 * 批量新增子项模板
 */
export const addItemTemplateBatch = (data: SubsystemItemTemplateForm[]) => {
    return request({
        url: "/erp/subsystem/item-template/batch",
        method: "post",
        data: data,
    });
};

/**
 * 修改子项模板
 */
export const updateItemTemplate = (data: SubsystemItemTemplateForm) => {
    return request({
        url: "/erp/subsystem/item-template",
        method: "put",
        data: data,
    });
};

/**
 * 删除子项模板
 */
export const delItemTemplate = (ids: number | number[]) => {
    const idStr = Array.isArray(ids) ? ids.join(",") : String(ids);
    return request({
        url: `/erp/subsystem/item-template/${idStr}`,
        method: "delete",
    });
};

/**
 * 获取子项的物料列表
 */
export const getItemMaterials = (itemTemplateId: number) => {
    return request({
        url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
        method: "get",
    });
};

/**
 * 生成子项编号
 */
export const generateItemCode = (templateId: number) => {
    return request({
        url: `/erp/subsystem/item-template/generate-code/${templateId}`,
        method: "get",
    });
};

// ============= 物料模板接口 =============

/**
 * 查询物料模板列表
 */
export const listMaterialTemplate = (query?: any) => {
    return request({
        url: "/erp/subsystem/material-template/list",
        method: "get",
        params: query,
    });
};

/**
 * 根据子项ID查询物料列表
 */
export const listMaterialTemplateByItemId = (itemTemplateId: number) => {
    return request({
        url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
        method: "get",
    });
};

/**
 * 根据模板ID查询所有物料
 */
export const listMaterialTemplateByTemplateId = (templateId: number) => {
    return request({
        url: `/erp/subsystem/material-template/list-by-template/${templateId}`,
        method: "get",
    });
};

/**
 * 查询物料模板详情
 */
export const getMaterialTemplate = (id: number) => {
    return request({
        url: `/erp/subsystem/material-template/${id}`,
        method: "get",
    });
};

/**
 * 新增物料模板
 */
export const addMaterialTemplate = (data: SubsystemMaterialTemplateForm) => {
    return request({
        url: "/erp/subsystem/material-template",
        method: "post",
        data: data,
    });
};

/**
 * 批量新增物料模板
 */
export const addMaterialTemplateBatch = (
    data: SubsystemMaterialTemplateForm[]
) => {
    return request({
        url: "/erp/subsystem/material-template/batch",
        method: "post",
        data: data,
    });
};

/**
 * 修改物料模板
 */
export const updateMaterialTemplate = (data: SubsystemMaterialTemplateForm) => {
    return request({
        url: "/erp/subsystem/material-template",
        method: "put",
        data: data,
    });
};

/**
 * 删除物料模板
 */
export const delMaterialTemplate = (ids: number | number[]) => {
    const idStr = Array.isArray(ids) ? ids.join(",") : String(ids);
    return request({
        url: `/erp/subsystem/material-template/${idStr}`,
        method: "delete",
    });
};
```

### 完整业务流程示例

```typescript
// 1. 查看子系统模板的所有子项
const { data: items } = await getTemplateItems(1);
console.log("子项列表:", items);

// 2. 为模板添加新子项
await addItemTemplate({
    templateId: 1,
    itemName: "压力容器",
    itemType: "组件",
    defaultQuantity: 1,
    unit: "个",
    isRequired: true,
});

// 3. 查看子项的物料列表
const { data: materials } = await getItemMaterials(1);
console.log("物料列表:", materials);

// 4. 为子项添加物料
await addMaterialTemplate({
    templateId: 1,
    itemTemplateId: 1,
    materialId: 100,
    defaultQuantity: 500,
    isRequired: true,
});

// 5. 批量添加多个物料
await addMaterialTemplateBatch([
    {
        templateId: 1,
        itemTemplateId: 1,
        materialId: 101,
        defaultQuantity: 4,
        isRequired: true,
    },
    {
        templateId: 1,
        itemTemplateId: 1,
        materialId: 102,
        defaultQuantity: 32,
        isRequired: true,
    },
]);

// 6. 修改物料数量
await updateMaterialTemplate({
    id: 1,
    templateId: 1,
    itemTemplateId: 1,
    materialId: 100,
    defaultQuantity: 600, // 调整数量
    isRequired: true,
});
```

---

## 更新日志

| 版本 | 日期       | 修改内容                         | 修改人  |
| ---- | ---------- | -------------------------------- | ------- |
| v1.0 | 2025-11-05 | 初始版本，完成子项和物料模板接口 | haitang |

---

**文档维护**: 后端开发团队  
**技术支持**: 如有疑问请联系后端开发团队  
**相关文档**:

-   [子系统模板管理 API 文档](./子系统模板API文档.md)
-   [子系统管理模块完整 API 文档](./子系统管理模块完整API文档.md)
