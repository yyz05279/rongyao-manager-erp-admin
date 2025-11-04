# 海棠 ERP 系统 - 子系统管理模块 API 接口文档

**版本**: v1.1  
**创建时间**: 2025-11-04  
**最后更新**: 2025-11-04  
**文档状态**: ✅ 后端已实现

---

## 目录

-   [1. 概述](#1-概述)
-   [2. 子系统管理接口](#2-子系统管理接口)
-   [3. 子项管理接口](#3-子项管理接口)
-   [4. 物料管理接口](#4-物料管理接口)
-   [5. 数据模型](#5-数据模型)
-   [6. 枚举定义](#6-枚举定义)

---

## 1. 概述

### 1.1 模块说明

子系统管理模块用于管理项目下的子系统、子项及其关联的物料信息，支持树形结构管理和自动统计功能。

**核心功能**:

-   子系统 CRUD 操作
-   子项树形结构管理
-   物料关联管理
-   附件管理
-   变更记录跟踪
-   自动编号生成
-   自动统计计算

### 1.2 基础信息

| 项目     | 说明                   |
| -------- | ---------------------- |
| 基础路径 | `/erp/subsystem`       |
| 认证方式 | Bearer Token (SaToken) |
| 数据格式 | JSON                   |
| 字符编码 | UTF-8                  |
| 后端实现 | ✅ 已完成              |

### 1.3 权限控制

所有接口都需要相应的权限，权限码格式：`erp:subsystem:{module}:{operation}`

**子系统管理权限**:

-   `erp:subsystem:list` - 查看列表
-   `erp:subsystem:query` - 查询详情
-   `erp:subsystem:add` - 新增
-   `erp:subsystem:edit` - 编辑
-   `erp:subsystem:remove` - 删除
-   `erp:subsystem:export` - 导出

**子项管理权限**:

-   `erp:subsystem:item:list` - 查看列表
-   `erp:subsystem:item:query` - 查询详情
-   `erp:subsystem:item:add` - 新增
-   `erp:subsystem:item:edit` - 编辑
-   `erp:subsystem:item:remove` - 删除

**物料管理权限**:

-   `erp:subsystem:material:list` - 查看列表
-   `erp:subsystem:material:query` - 查询详情
-   `erp:subsystem:material:add` - 添加
-   `erp:subsystem:material:edit` - 编辑
-   `erp:subsystem:material:remove` - 删除

### 1.4 统一响应格式

所有接口统一使用以下响应格式：

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {}
}
```

**分页响应格式**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "rows": [],
    "total": 0
}
```

### 1.5 HTTP 状态码

-   `200` - 请求成功
-   `400` - 请求参数错误
-   `401` - 未授权
-   `403` - 权限不足
-   `404` - 资源不存在
-   `500` - 服务器内部错误

---

## 2. 子系统管理接口

### 2.1 查询子系统列表

**接口地址**: `GET /erp/subsystem/list`

**权限要求**: `erp:subsystem:list`

**请求参数**:

| 参数名            | 类型    | 必填 | 说明                   | 示例值         |
| ----------------- | ------- | ---- | ---------------------- | -------------- |
| pageNum           | Integer | 否   | 页码，默认 1           | 1              |
| pageSize          | Integer | 否   | 每页大小，默认 10      | 10             |
| subsystemCode     | String  | 否   | 子系统编号（模糊查询） | PRJ001-SS-0001 |
| subsystemName     | String  | 否   | 子系统名称（模糊查询） | 机械系统       |
| projectId         | Long    | 否   | 项目 ID                | 1              |
| projectName       | String  | 否   | 项目名称（模糊查询）   | 淮安项目       |
| category          | String  | 否   | 分类                   | 机械           |
| status            | String  | 否   | 状态                   | ACTIVE         |
| responsiblePerson | String  | 否   | 负责人姓名（模糊查询） | 张三           |
| startDate         | String  | 否   | 开始日期（起）         | 2024-01-01     |
| endDate           | String  | 否   | 结束日期（止）         | 2024-12-31     |

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "rows": [
        {
            "id": 1,
            "subsystemCode": "PRJ001-SS-0001",
            "subsystemName": "固态处理厂-机械系统",
            "projectId": 1,
            "projectName": "淮安项目",
            "category": "机械",
            "description": "固态处理厂机械系统",
            "responsiblePerson": "张三",
            "responsiblePersonId": 100,
            "status": "ACTIVE",
            "totalItems": 10,
            "totalMaterials": 50,
            "totalWeight": 1500.5,
            "startDate": "2024-01-01",
            "endDate": "2024-12-31",
            "priority": 1,
            "remarks": "重点项目",
            "createTime": "2024-01-01T08:00:00",
            "updateTime": "2024-01-15T14:30:00"
        }
    ],
    "total": 1
}
```

---

### 2.2 获取子系统详细信息

**接口地址**: `GET /erp/subsystem/{id}`

**权限要求**: `erp:subsystem:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明      |
| ------ | ---- | ---- | --------- |
| id     | Long | 是   | 子系统 ID |

**请求示例**: `GET /erp/subsystem/1`

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": {
        "id": 1,
        "subsystemCode": "PRJ001-SS-0001",
        "subsystemName": "固态处理厂-机械系统",
        "projectId": 1,
        "projectName": "淮安项目",
        "category": "机械",
        "description": "固态处理厂机械系统",
        "responsiblePerson": "张三",
        "responsiblePersonId": 100,
        "status": "ACTIVE",
        "totalItems": 10,
        "totalMaterials": 50,
        "totalWeight": 1500.5,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "priority": 1,
        "remarks": "重点项目",
        "items": [],
        "attachments": [],
        "statistics": {
            "completedItemCount": 5,
            "inProgressItemCount": 3,
            "pendingItemCount": 2,
            "totalMaterialCount": 50
        },
        "createTime": "2024-01-01T08:00:00",
        "updateTime": "2024-01-15T14:30:00"
    }
}
```

---

### 2.3 新增子系统

**接口地址**: `POST /erp/subsystem`

**权限要求**: `erp:subsystem:add`

**请求头**:

-   `Content-Type: application/json`

**请求体参数**:

| 参数名              | 类型    | 必填 | 说明                       | 示例值             |
| ------------------- | ------- | ---- | -------------------------- | ------------------ |
| subsystemCode       | String  | 否   | 子系统编号（不填自动生成） | PRJ001-SS-0001     |
| subsystemName       | String  | 是   | 子系统名称                 | 机械系统           |
| projectId           | Long    | 是   | 项目 ID                    | 1                  |
| projectName         | String  | 是   | 项目名称                   | 淮安项目           |
| category            | String  | 否   | 分类                       | 机械               |
| description         | String  | 否   | 描述                       | 固态处理厂机械系统 |
| responsiblePerson   | String  | 否   | 负责人姓名                 | 张三               |
| responsiblePersonId | Long    | 否   | 负责人 ID                  | 100                |
| status              | String  | 否   | 状态（默认 DRAFT）         | DRAFT              |
| startDate           | String  | 否   | 开始日期                   | 2024-01-01         |
| endDate             | String  | 否   | 结束日期                   | 2024-12-31         |
| priority            | Integer | 否   | 优先级                     | 1                  |
| remarks             | String  | 否   | 备注                       | 重点项目           |

**请求示例**:

```json
{
    "subsystemName": "固态处理厂-机械系统",
    "projectId": 1,
    "projectName": "淮安项目",
    "category": "机械",
    "description": "固态处理厂机械系统",
    "responsiblePerson": "张三",
    "responsiblePersonId": 100,
    "status": "ACTIVE",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "priority": 1,
    "remarks": "重点项目"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 2.4 修改子系统

**接口地址**: `PUT /erp/subsystem`

**权限要求**: `erp:subsystem:edit`

**请求头**:

-   `Content-Type: application/json`

**请求体参数**: 与新增接口相同，但需包含 `id` 字段

| 参数名   | 类型 | 必填 | 说明           |
| -------- | ---- | ---- | -------------- |
| id       | Long | 是   | 子系统 ID      |
| 其他参数 | -    | -    | 与新增接口相同 |

**请求示例**:

```json
{
    "id": 1,
    "subsystemName": "固态处理厂-机械系统（修改版）",
    "projectId": 1,
    "projectName": "淮安项目",
    "category": "机械",
    "description": "固态处理厂机械系统，已优化",
    "responsiblePerson": "张三",
    "responsiblePersonId": 100,
    "status": "ACTIVE",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "priority": 1,
    "remarks": "重点项目"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 2.5 删除子系统

**接口地址**: `DELETE /erp/subsystem/{ids}`

**权限要求**: `erp:subsystem:remove`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                       |
| ------ | ------ | ---- | -------------------------- |
| ids    | Long[] | 是   | 子系统 ID 数组（逗号分隔） |

**请求示例**: `DELETE /erp/subsystem/1,2,3`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**注意事项**:

-   删除子系统前会校验是否存在关联的子项和物料
-   如果存在关联数据，将返回错误提示

---

### 2.6 导出子系统列表

**接口地址**: `POST /erp/subsystem/export`

**权限要求**: `erp:subsystem:export`

**请求参数**: 与查询列表接口相同

**响应格式**: Excel 文件流

---

### 2.7 生成子系统编号

**接口地址**: `GET /erp/subsystem/generate-code`

**权限要求**: `erp:subsystem:add`

**请求参数**:

| 参数名      | 类型   | 必填 | 说明     | 示例值 |
| ----------- | ------ | ---- | -------- | ------ |
| projectCode | String | 是   | 项目编号 | PRJ001 |

**请求示例**: `GET /erp/subsystem/generate-code?projectCode=PRJ001`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": "PRJ001-SS-0001"
}
```

**编号规则**:

-   格式：`{项目编号}-SS-{序号}`
-   序号自动递增，4 位数字，左侧补 0
-   示例：PRJ001-SS-0001, PRJ001-SS-0002

---

### 2.8 更新子系统状态

**接口地址**: `PUT /erp/subsystem/{id}/status`

**权限要求**: `erp:subsystem:edit`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明      |
| ------ | ---- | ---- | --------- |
| id     | Long | 是   | 子系统 ID |

**请求参数**:

| 参数名 | 类型   | 必填 | 说明   | 示例值 |
| ------ | ------ | ---- | ------ | ------ |
| status | String | 是   | 状态值 | ACTIVE |

**请求示例**: `PUT /erp/subsystem/1/status?status=ACTIVE`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 2.9 复制子系统

**接口地址**: `POST /erp/subsystem/{id}/copy`

**权限要求**: `erp:subsystem:add`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明        |
| ------ | ---- | ---- | ----------- |
| id     | Long | 是   | 源子系统 ID |

**请求示例**: `POST /erp/subsystem/1/copy`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": 2
}
```

**说明**:

-   返回新子系统的 ID
-   复制时会自动生成新的编号
-   状态重置为 DRAFT

---

### 2.10 校验子系统编号唯一性

**接口地址**: `GET /erp/subsystem/check-code-unique`

**权限要求**: `erp:subsystem:add`

**请求参数**:

| 参数名        | 类型   | 必填 | 说明                    | 示例值         |
| ------------- | ------ | ---- | ----------------------- | -------------- |
| subsystemCode | String | 是   | 子系统编号              | PRJ001-SS-0001 |
| excludeId     | Long   | 否   | 排除的 ID（编辑时使用） | 1              |

**请求示例**:

```
GET /erp/subsystem/check-code-unique?subsystemCode=PRJ001-SS-0001&excludeId=1
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": true
}
```

**说明**:

-   返回 `true` 表示编号唯一可用
-   返回 `false` 表示编号已存在

---

## 3. 子项管理接口

### 3.1 查询子项列表

**接口地址**: `GET /erp/subsystem/item/list`

**权限要求**: `erp:subsystem:item:list`

**请求参数**:

| 参数名       | 类型    | 必填 | 说明                 | 示例值                 |
| ------------ | ------- | ---- | -------------------- | ---------------------- |
| pageNum      | Integer | 否   | 页码，默认 1         | 1                      |
| pageSize     | Integer | 否   | 每页大小，默认 10    | 10                     |
| subsystemId  | Long    | 否   | 子系统 ID            | 1                      |
| itemCode     | String  | 否   | 子项编号（模糊查询） | PRJ001-SS-0001-IT-0001 |
| itemName     | String  | 否   | 子项名称（模糊查询） | 输送系统               |
| itemType     | String  | 否   | 子项类型             | 系统                   |
| status       | String  | 否   | 状态                 | IN_PROGRESS            |
| parentItemId | Long    | 否   | 父级 ID              | 0                      |

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "rows": [
        {
            "id": 1,
            "subsystemId": 1,
            "itemCode": "PRJ001-SS-0001-IT-0001",
            "itemName": "输送系统",
            "itemType": "系统",
            "specification": "标准配置",
            "description": "输送系统描述",
            "sequenceNumber": 1,
            "quantity": 1,
            "unit": "套",
            "weight": 500.5,
            "materialCount": 10,
            "status": "IN_PROGRESS",
            "parentItemId": 0,
            "remarks": "重要子项",
            "createTime": "2024-01-01T08:00:00",
            "updateTime": "2024-01-15T14:30:00"
        }
    ],
    "total": 1
}
```

---

### 3.2 获取子项详细信息

**接口地址**: `GET /erp/subsystem/item/{id}`

**权限要求**: `erp:subsystem:item:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 子项 ID |

**请求示例**: `GET /erp/subsystem/item/1`

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": {
        "id": 1,
        "subsystemId": 1,
        "itemCode": "PRJ001-SS-0001-IT-0001",
        "itemName": "输送系统",
        "itemType": "系统",
        "specification": "标准配置",
        "description": "输送系统描述",
        "sequenceNumber": 1,
        "quantity": 1,
        "unit": "套",
        "weight": 500.5,
        "materialCount": 10,
        "status": "IN_PROGRESS",
        "parentItemId": 0,
        "remarks": "重要子项",
        "children": [],
        "createTime": "2024-01-01T08:00:00",
        "updateTime": "2024-01-15T14:30:00"
    }
}
```

---

### 3.3 新增子项

**接口地址**: `POST /erp/subsystem/item`

**权限要求**: `erp:subsystem:item:add`

**请求体参数**:

| 参数名         | 类型       | 必填 | 说明                     | 示例值                 |
| -------------- | ---------- | ---- | ------------------------ | ---------------------- |
| subsystemId    | Long       | 是   | 子系统 ID                | 1                      |
| itemCode       | String     | 否   | 子项编号（不填自动生成） | PRJ001-SS-0001-IT-0001 |
| itemName       | String     | 是   | 子项名称                 | 输送系统               |
| itemType       | String     | 否   | 子项类型                 | 系统                   |
| specification  | String     | 否   | 规格型号                 | 标准配置               |
| description    | String     | 否   | 描述                     | 输送系统描述           |
| sequenceNumber | Integer    | 否   | 排序号                   | 1                      |
| parentItemId   | Long       | 否   | 父级 ID（默认 0）        | 0                      |
| quantity       | Integer    | 否   | 数量                     | 1                      |
| unit           | String     | 否   | 单位                     | 套                     |
| weight         | BigDecimal | 否   | 重量(kg)                 | 500.50                 |
| status         | String     | 否   | 状态（默认 PENDING）     | PENDING                |
| remarks        | String     | 否   | 备注                     | 重要子项               |

**请求示例**:

```json
{
    "subsystemId": 1,
    "itemName": "输送系统",
    "itemType": "系统",
    "specification": "标准配置",
    "description": "输送系统描述",
    "sequenceNumber": 1,
    "parentItemId": 0,
    "quantity": 1,
    "unit": "套",
    "weight": 500.5,
    "status": "PENDING",
    "remarks": "重要子项"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.4 修改子项

**接口地址**: `PUT /erp/subsystem/item`

**权限要求**: `erp:subsystem:item:edit`

**请求体参数**: 与新增接口相同，但需包含 `id` 字段

**请求示例**:

```json
{
    "id": 1,
    "subsystemId": 1,
    "itemName": "输送系统（修改版）",
    "itemType": "系统",
    "specification": "升级配置",
    "description": "输送系统描述（已更新）",
    "sequenceNumber": 1,
    "parentItemId": 0,
    "quantity": 1,
    "unit": "套",
    "weight": 500.5,
    "status": "IN_PROGRESS",
    "remarks": "重要子项"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.5 删除子项

**接口地址**: `DELETE /erp/subsystem/item/{ids}`

**权限要求**: `erp:subsystem:item:remove`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                     |
| ------ | ------ | ---- | ------------------------ |
| ids    | Long[] | 是   | 子项 ID 数组（逗号分隔） |

**请求示例**: `DELETE /erp/subsystem/item/1,2,3`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.6 批量新增子项

**接口地址**: `POST /erp/subsystem/item/batch`

**权限要求**: `erp:subsystem:item:add`

**请求参数**:

| 参数名      | 类型 | 必填 | 说明      | 示例值 |
| ----------- | ---- | ---- | --------- | ------ |
| subsystemId | Long | 是   | 子系统 ID | 1      |

**请求体**: 子项数组

**请求示例**:

```json
[
    {
        "itemName": "输送系统A",
        "itemType": "系统",
        "specification": "标准配置",
        "quantity": 1,
        "unit": "套",
        "weight": 300.0
    },
    {
        "itemName": "输送系统B",
        "itemType": "系统",
        "specification": "增强配置",
        "quantity": 2,
        "unit": "套",
        "weight": 450.0
    }
]
```

**完整请求**: `POST /erp/subsystem/item/batch?subsystemId=1`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.7 生成子项编号

**接口地址**: `GET /erp/subsystem/item/generate-code`

**权限要求**: `erp:subsystem:item:add`

**请求参数**:

| 参数名        | 类型   | 必填 | 说明       | 示例值         |
| ------------- | ------ | ---- | ---------- | -------------- |
| subsystemCode | String | 是   | 子系统编号 | PRJ001-SS-0001 |

**请求示例**: `GET /erp/subsystem/item/generate-code?subsystemCode=PRJ001-SS-0001`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": "PRJ001-SS-0001-IT-0001"
}
```

**编号规则**:

-   格式：`{子系统编号}-IT-{序号}`
-   序号自动递增，4 位数字，左侧补 0
-   示例：PRJ001-SS-0001-IT-0001, PRJ001-SS-0001-IT-0002

---

### 3.8 获取子项树形结构

**接口地址**: `GET /erp/subsystem/item/tree`

**权限要求**: `erp:subsystem:item:list`

**请求参数**:

| 参数名      | 类型 | 必填 | 说明      | 示例值 |
| ----------- | ---- | ---- | --------- | ------ |
| subsystemId | Long | 是   | 子系统 ID | 1      |

**请求示例**: `GET /erp/subsystem/item/tree?subsystemId=1`

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": [
        {
            "id": 1,
            "itemCode": "PRJ001-SS-0001-IT-0001",
            "itemName": "输送系统",
            "parentItemId": 0,
            "children": [
                {
                    "id": 2,
                    "itemCode": "PRJ001-SS-0001-IT-0002",
                    "itemName": "传送带A",
                    "parentItemId": 1,
                    "children": []
                },
                {
                    "id": 3,
                    "itemCode": "PRJ001-SS-0001-IT-0003",
                    "itemName": "传送带B",
                    "parentItemId": 1,
                    "children": []
                }
            ]
        }
    ]
}
```

---

## 4. 物料管理接口

### 4.1 查询物料列表

**接口地址**: `GET /erp/subsystem/material/list`

**权限要求**: `erp:subsystem:material:list`

**请求参数**:

| 参数名        | 类型    | 必填 | 说明                 | 示例值 |
| ------------- | ------- | ---- | -------------------- | ------ |
| pageNum       | Integer | 否   | 页码，默认 1         | 1      |
| pageSize      | Integer | 否   | 每页大小，默认 10    | 10     |
| subsystemId   | Long    | 否   | 子系统 ID            | 1      |
| itemId        | Long    | 否   | 子项 ID              | 1      |
| materialId    | Long    | 否   | 物料 ID              | 100    |
| materialCode  | String  | 否   | 物料编码（模糊查询） | MAT001 |
| materialName  | String  | 否   | 物料名称（模糊查询） | 钢材   |
| specification | String  | 否   | 规格型号（模糊查询） | Q235   |
| materialType  | String  | 否   | 物料类型             | 原材料 |
| status        | String  | 否   | 状态                 | NORMAL |

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "rows": [
        {
            "id": 1,
            "subsystemId": 1,
            "itemId": 1,
            "materialId": 100,
            "materialCode": "MAT001",
            "materialName": "钢材",
            "specification": "Q235",
            "materialType": "原材料",
            "quantity": 100,
            "unit": "吨",
            "unitWeight": 7.85,
            "totalWeight": 785.0,
            "manufacturer": "某钢铁厂",
            "model": "Q235B",
            "serialNumber": "SN20240001",
            "sequenceNumber": 1,
            "status": "NORMAL",
            "remarks": "优质钢材",
            "createTime": "2024-01-01T08:00:00",
            "updateTime": "2024-01-15T14:30:00"
        }
    ],
    "total": 1
}
```

---

### 4.2 获取物料详细信息

**接口地址**: `GET /erp/subsystem/material/{id}`

**权限要求**: `erp:subsystem:material:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 物料 ID |

**请求示例**: `GET /erp/subsystem/material/1`

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": {
        "id": 1,
        "subsystemId": 1,
        "itemId": 1,
        "materialId": 100,
        "materialCode": "MAT001",
        "materialName": "钢材",
        "specification": "Q235",
        "materialType": "原材料",
        "quantity": 100,
        "unit": "吨",
        "unitWeight": 7.85,
        "totalWeight": 785.0,
        "manufacturer": "某钢铁厂",
        "model": "Q235B",
        "serialNumber": "SN20240001",
        "sequenceNumber": 1,
        "status": "NORMAL",
        "remarks": "优质钢材",
        "createTime": "2024-01-01T08:00:00",
        "updateTime": "2024-01-15T14:30:00"
    }
}
```

---

### 4.3 添加物料

**接口地址**: `POST /erp/subsystem/material`

**权限要求**: `erp:subsystem:material:add`

**请求体参数**:

| 参数名         | 类型       | 必填 | 说明                | 示例值     |
| -------------- | ---------- | ---- | ------------------- | ---------- |
| subsystemId    | Long       | 是   | 子系统 ID           | 1          |
| itemId         | Long       | 是   | 子项 ID             | 1          |
| materialId     | Long       | 否   | 物料 ID             | 100        |
| materialCode   | String     | 否   | 物料编码            | MAT001     |
| materialName   | String     | 是   | 物料名称            | 钢材       |
| specification  | String     | 否   | 规格型号            | Q235       |
| materialType   | String     | 否   | 物料类型            | 原材料     |
| quantity       | Integer    | 是   | 数量                | 100        |
| unit           | String     | 否   | 单位                | 吨         |
| unitWeight     | BigDecimal | 否   | 单重(kg)            | 7.85       |
| manufacturer   | String     | 否   | 制造商              | 某钢铁厂   |
| model          | String     | 否   | 型号                | Q235B      |
| serialNumber   | String     | 否   | 序列号              | SN20240001 |
| sequenceNumber | Integer    | 否   | 排序号              | 1          |
| status         | String     | 否   | 状态（默认 NORMAL） | NORMAL     |
| remarks        | String     | 否   | 备注                | 优质钢材   |

**请求示例**:

```json
{
    "subsystemId": 1,
    "itemId": 1,
    "materialId": 100,
    "materialCode": "MAT001",
    "materialName": "钢材",
    "specification": "Q235",
    "materialType": "原材料",
    "quantity": 100,
    "unit": "吨",
    "unitWeight": 7.85,
    "manufacturer": "某钢铁厂",
    "model": "Q235B",
    "serialNumber": "SN20240001",
    "sequenceNumber": 1,
    "status": "NORMAL",
    "remarks": "优质钢材"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**说明**:

-   `totalWeight` 由系统自动计算：`quantity × unitWeight`

---

### 4.4 修改物料

**接口地址**: `PUT /erp/subsystem/material`

**权限要求**: `erp:subsystem:material:edit`

**请求体参数**: 与添加接口相同，但需包含 `id` 字段

**请求示例**:

```json
{
    "id": 1,
    "subsystemId": 1,
    "itemId": 1,
    "materialId": 100,
    "materialCode": "MAT001",
    "materialName": "钢材",
    "specification": "Q235B",
    "materialType": "原材料",
    "quantity": 120,
    "unit": "吨",
    "unitWeight": 7.85,
    "manufacturer": "某钢铁厂",
    "model": "Q235B",
    "serialNumber": "SN20240001",
    "sequenceNumber": 1,
    "status": "NORMAL",
    "remarks": "优质钢材（已优化）"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 4.5 删除物料

**接口地址**: `DELETE /erp/subsystem/material/{ids}`

**权限要求**: `erp:subsystem:material:remove`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                     |
| ------ | ------ | ---- | ------------------------ |
| ids    | Long[] | 是   | 物料 ID 数组（逗号分隔） |

**请求示例**: `DELETE /erp/subsystem/material/1,2,3`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 4.6 批量添加物料

**接口地址**: `POST /erp/subsystem/material/batch`

**权限要求**: `erp:subsystem:material:add`

**请求参数**:

| 参数名      | 类型 | 必填 | 说明      | 示例值 |
| ----------- | ---- | ---- | --------- | ------ |
| subsystemId | Long | 是   | 子系统 ID | 1      |
| itemId      | Long | 是   | 子项 ID   | 1      |

**请求体**: 物料数组

**请求示例**:

```json
[
    {
        "materialCode": "MAT001",
        "materialName": "钢材",
        "specification": "Q235",
        "materialType": "原材料",
        "quantity": 100,
        "unit": "吨",
        "unitWeight": 7.85,
        "manufacturer": "某钢铁厂",
        "model": "Q235B"
    },
    {
        "materialCode": "MAT002",
        "materialName": "铝材",
        "specification": "6061",
        "materialType": "原材料",
        "quantity": 50,
        "unit": "吨",
        "unitWeight": 2.7,
        "manufacturer": "某铝业公司",
        "model": "6061-T6"
    }
]
```

**完整请求**: `POST /erp/subsystem/material/batch?subsystemId=1&itemId=1`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

## 5. 数据模型

### 5.1 子系统 (ErpSubsystem)

```typescript
interface ErpSubsystemVo {
    id: number; // 主键ID
    subsystemCode: string; // 子系统编号
    subsystemName: string; // 子系统名称
    projectId: number; // 项目ID
    projectName: string; // 项目名称
    category?: string; // 分类
    description?: string; // 描述
    responsiblePerson?: string; // 负责人姓名
    responsiblePersonId?: number; // 负责人ID
    status: string; // 状态
    totalItems: number; // 子项总数（自动统计）
    totalMaterials: number; // 物料总数（自动统计）
    totalWeight: number; // 总重量（自动统计）
    startDate?: string; // 开始日期
    endDate?: string; // 结束日期
    priority?: number; // 优先级
    remarks?: string; // 备注
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
}
```

### 5.2 子系统详情 (ErpSubsystemDetailVo)

```typescript
interface ErpSubsystemDetailVo extends ErpSubsystemVo {
    items: ErpSubsystemItemVo[]; // 子项列表
    attachments: ErpSubsystemAttachmentVo[]; // 附件列表
    statistics: SubsystemStatistics; // 统计信息
}

interface SubsystemStatistics {
    completedItemCount: number; // 已完成子项数
    inProgressItemCount: number; // 进行中子项数
    pendingItemCount: number; // 待处理子项数
    totalMaterialCount: number; // 总物料数
}
```

### 5.3 子项 (ErpSubsystemItem)

```typescript
interface ErpSubsystemItemVo {
    id: number; // 主键ID
    subsystemId: number; // 子系统ID
    itemCode: string; // 子项编号
    itemName: string; // 子项名称
    itemType: string; // 子项类型
    specification?: string; // 规格型号
    description?: string; // 描述
    sequenceNumber?: number; // 排序号
    quantity?: number; // 数量
    unit?: string; // 单位
    weight?: number; // 重量(kg)
    materialCount: number; // 物料数量（自动统计）
    status: string; // 状态
    parentItemId: number; // 父子项ID
    remarks?: string; // 备注
    children?: ErpSubsystemItemVo[]; // 子节点列表（树形结构）
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
}
```

### 5.4 物料 (ErpSubsystemMaterial)

```typescript
interface ErpSubsystemMaterialVo {
    id: number; // 主键ID
    subsystemId: number; // 子系统ID
    itemId: number; // 子项ID
    materialId?: number; // 物料ID
    materialCode?: string; // 物料编码
    materialName: string; // 物料名称
    specification?: string; // 规格型号
    materialType?: string; // 物料类型
    quantity: number; // 数量
    unit?: string; // 单位
    unitWeight?: number; // 单重(kg)
    totalWeight: number; // 总重量（自动计算）
    manufacturer?: string; // 制造商
    model?: string; // 型号
    serialNumber?: string; // 序列号
    sequenceNumber?: number; // 排序号
    status: string; // 状态
    remarks?: string; // 备注
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
}
```

---

## 6. 枚举定义

### 6.1 子系统状态 (SubsystemStatus)

| 枚举值   | 说明 |
| -------- | ---- |
| DRAFT    | 草稿 |
| ACTIVE   | 生效 |
| INACTIVE | 停用 |
| ARCHIVED | 归档 |

### 6.2 子项状态 (SubsystemItemStatus)

| 枚举值      | 说明   |
| ----------- | ------ |
| PENDING     | 待处理 |
| IN_PROGRESS | 进行中 |
| COMPLETED   | 已完成 |
| SUSPENDED   | 已暂停 |

### 6.3 物料状态 (MaterialStatus)

| 枚举值       | 说明   |
| ------------ | ------ |
| NORMAL       | 正常   |
| OUT_OF_STOCK | 缺货   |
| RESERVED     | 已预留 |
| ALLOCATED    | 已分配 |

### 6.4 附件类型 (AttachmentType)

| 枚举值   | 说明 |
| -------- | ---- |
| DRAWING  | 图纸 |
| DOCUMENT | 文档 |
| PHOTO    | 照片 |
| OTHER    | 其他 |

---

## 附录

### A. 错误码说明

| 错误码 | 说明             |
| ------ | ---------------- |
| 400    | 请求参数错误     |
| 401    | 未授权，请先登录 |
| 403    | 权限不足         |
| 404    | 资源不存在       |
| 500    | 服务器内部错误   |

### B. 数据库触发器

系统使用触发器自动更新统计数据：

1. **子项统计触发器**：自动更新子系统的 `total_items`
2. **物料统计触发器**：自动更新子系统的 `total_materials` 和 `total_weight`
3. **子项物料统计触发器**：自动更新子项的 `material_count` 和 `total_weight`

### C. 编号生成函数

系统使用数据库函数自动生成编号：

1. **`generate_subsystem_code(project_code)`**：生成子系统编号
2. **`generate_subsystem_item_code(subsystem_code)`**：生成子项编号

### D. 注意事项

1. **删除限制**：删除子系统前需确认无关联子项和物料
2. **编号唯一性**：子系统编号和子项编号在系统内必须唯一
3. **自动计算**：总重量由系统自动计算，无需手动填写
4. **树形结构**：子项支持无限级树形结构
5. **多租户隔离**：所有数据自动按租户隔离
6. **时间格式**：所有时间字段使用 ISO 8601 格式（YYYY-MM-DDTHH:mm:ss）

---

## 版本历史

| 版本 | 日期       | 说明                             |
| ---- | ---------- | -------------------------------- |
| v1.0 | 2025-11-04 | 初始版本                         |
| v1.1 | 2025-11-04 | 修正字段定义，与实际代码保持一致 |

---

**文档版本**: v1.1  
**最后更新**: 2025-11-04  
**维护团队**: 海棠 ERP 开发团队
