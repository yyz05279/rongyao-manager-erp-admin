# 子系统管理模块完整 API 文档

**模块名称**: 子系统管理模块  
**版本**: v1.0  
**编写日期**: 2025-11-05  
**文档状态**: ✅ 已校验（与实际代码一致）

---

## 📋 目录

-   [1. 子系统管理接口](#1-子系统管理接口)（11 个接口）
-   [2. 子项管理接口](#2-子项管理接口)（7 个接口）
-   [3. 物料管理接口](#3-物料管理接口)（5 个接口）
-   [4. 数据结构说明](#4-数据结构说明)
-   [5. 状态码说明](#5-状态码说明)
-   [6. 权限列表](#6-权限列表)

---

## 1. 子系统管理接口

### 1.1 查询子系统列表

**接口地址**: `GET /erp/subsystem/list`

**接口描述**: 分页查询子系统列表，支持多条件筛选

**权限标识**: `erp:subsystem:list`

**请求参数**:

| 参数名              | 类型    | 必填 | 说明                |
| ------------------- | ------- | ---- | ------------------- |
| subsystemCode       | String  | 否   | 子系统编号          |
| subsystemName       | String  | 否   | 子系统名称          |
| projectId           | Long    | 否   | 项目 ID             |
| projectName         | String  | 否   | 项目名称            |
| category            | String  | 否   | 分类                |
| status              | String  | 否   | 状态                |
| responsiblePersonId | Long    | 否   | 负责人 ID           |
| startDate           | Date    | 否   | 开始日期            |
| endDate             | Date    | 否   | 结束日期            |
| priority            | Integer | 否   | 优先级              |
| pageNum             | Integer | 否   | 页码（默认 1）      |
| pageSize            | Integer | 否   | 每页数量（默认 10） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "rows": [
            {
                "id": 1,
                "subsystemCode": "PRJ001-SS-001",
                "subsystemName": "控制系统",
                "projectId": 1,
                "projectName": "智能制造项目",
                "category": "电气系统",
                "description": "主控制系统",
                "responsiblePerson": "张三",
                "responsiblePersonId": 100,
                "status": "ACTIVE",
                "totalItems": 10,
                "totalMaterials": 50,
                "totalWeight": 1250.5,
                "startDate": "2025-01-01",
                "endDate": "2025-12-31",
                "priority": 1,
                "remarks": "重点项目",
                "createTime": "2025-01-01 10:00:00",
                "updateTime": "2025-01-05 15:30:00"
            }
        ],
        "total": 100
    }
}
```

---

### 1.2 获取子系统详细信息

**接口地址**: `GET /erp/subsystem/{id}`

**接口描述**: 获取单个子系统的详细信息，包含子项列表、附件列表、统计信息

**权限标识**: `erp:subsystem:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明      |
| ------ | ---- | ---- | --------- |
| id     | Long | 是   | 子系统 ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "subsystemCode": "PRJ001-SS-001",
        "subsystemName": "控制系统",
        "projectId": 1,
        "projectName": "智能制造项目",
        "category": "电气系统",
        "description": "主控制系统",
        "responsiblePerson": "张三",
        "responsiblePersonId": 100,
        "status": "ACTIVE",
        "totalItems": 10,
        "totalMaterials": 50,
        "totalWeight": 1250.5,
        "startDate": "2025-01-01",
        "endDate": "2025-12-31",
        "priority": 1,
        "remarks": "重点项目",
        "items": [
            {
                "id": 1,
                "itemCode": "PRJ001-SS-001-ITEM-001",
                "itemName": "PLC控制柜",
                "itemType": "设备",
                "quantity": 1,
                "unit": "台",
                "weight": 150.5,
                "materialCount": 10,
                "status": "COMPLETED"
            }
        ],
        "attachments": [
            {
                "id": 1,
                "fileName": "系统设计图.pdf",
                "fileType": "DESIGN",
                "fileUrl": "/uploads/design/xxx.pdf",
                "fileSize": 1024000
            }
        ],
        "statistics": {
            "completedItemCount": 5,
            "inProgressItemCount": 3,
            "pendingItemCount": 2,
            "totalMaterialCount": 50
        },
        "createTime": "2025-01-01 10:00:00",
        "updateTime": "2025-01-05 15:30:00"
    }
}
```

---

### 1.3 新增子系统

**接口地址**: `POST /erp/subsystem`

**接口描述**: 创建新的子系统

**权限标识**: `erp:subsystem:add`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子系统 - 新增）

**请求参数**:

```json
{
    "subsystemCode": "PRJ001-SS-002",
    "subsystemName": "监控系统",
    "projectId": 1,
    "projectName": "智能制造项目",
    "category": "监控系统",
    "description": "视频监控系统",
    "responsiblePerson": "李四",
    "responsiblePersonId": 101,
    "status": "DRAFT",
    "startDate": "2025-02-01",
    "endDate": "2025-11-30",
    "priority": 2,
    "remarks": "二期项目"
}
```

**参数说明**:

| 参数名              | 类型    | 必填 | 说明                         |
| ------------------- | ------- | ---- | ---------------------------- |
| subsystemCode       | String  | 否   | 子系统编号（不传则自动生成） |
| subsystemName       | String  | 是   | 子系统名称                   |
| projectId           | Long    | 是   | 项目 ID                      |
| projectName         | String  | 是   | 项目名称                     |
| category            | String  | 否   | 分类                         |
| description         | String  | 否   | 描述                         |
| responsiblePerson   | String  | 否   | 负责人姓名                   |
| responsiblePersonId | Long    | 否   | 负责人 ID                    |
| status              | String  | 否   | 状态（默认 DRAFT）           |
| startDate           | Date    | 否   | 开始日期                     |
| endDate             | Date    | 否   | 结束日期                     |
| priority            | Integer | 否   | 优先级                       |
| remarks             | String  | 否   | 备注                         |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 1.4 修改子系统

**接口地址**: `PUT /erp/subsystem`

**接口描述**: 修改子系统信息

**权限标识**: `erp:subsystem:edit`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子系统 - 修改）

**请求参数**:

```json
{
    "id": 1,
    "subsystemCode": "PRJ001-SS-001",
    "subsystemName": "控制系统（更新）",
    "projectId": 1,
    "projectName": "智能制造项目",
    "category": "电气系统",
    "description": "主控制系统（更新后）",
    "responsiblePerson": "张三",
    "responsiblePersonId": 100,
    "status": "ACTIVE",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "priority": 1,
    "remarks": "重点项目"
}
```

**参数说明**:

| 参数名              | 类型    | 必填 | 说明       |
| ------------------- | ------- | ---- | ---------- |
| id                  | Long    | 是   | 主键 ID    |
| subsystemCode       | String  | 否   | 子系统编号 |
| subsystemName       | String  | 是   | 子系统名称 |
| projectId           | Long    | 是   | 项目 ID    |
| projectName         | String  | 是   | 项目名称   |
| category            | String  | 否   | 分类       |
| description         | String  | 否   | 描述       |
| responsiblePerson   | String  | 否   | 负责人姓名 |
| responsiblePersonId | Long    | 否   | 负责人 ID  |
| status              | String  | 否   | 状态       |
| startDate           | Date    | 否   | 开始日期   |
| endDate             | Date    | 否   | 结束日期   |
| priority            | Integer | 否   | 优先级     |
| remarks             | String  | 否   | 备注       |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 1.5 删除子系统

**接口地址**: `DELETE /erp/subsystem/{ids}`

**接口描述**: 批量删除子系统（支持逗号分隔多个 ID）

**权限标识**: `erp:subsystem:remove`

**业务日志**: ✅ 记录（子系统 - 删除）

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                |
| ------ | ------ | ---- | ------------------- |
| ids    | Long[] | 是   | 主键串（如：1,2,3） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 1.6 导出子系统列表

**接口地址**: `POST /erp/subsystem/export`

**接口描述**: 导出子系统列表为 Excel 文件

**权限标识**: `erp:subsystem:export`

**业务日志**: ✅ 记录（子系统 - 导出）

**请求参数**: 同查询列表接口（1.1）

**响应**: Excel 文件流

---

### 1.7 生成子系统编号

**接口地址**: `GET /erp/subsystem/generate-code`

**接口描述**: 根据项目编号自动生成子系统编号

**权限标识**: `erp:subsystem:add`

**请求参数**:

| 参数名      | 类型   | 必填 | 说明     |
| ----------- | ------ | ---- | -------- |
| projectCode | String | 是   | 项目编号 |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": "PRJ001-SS-003"
}
```

**编号规则**: `{projectCode}-SS-{序号}`

---

### 1.8 更新子系统状态

**接口地址**: `PUT /erp/subsystem/{id}/status`

**接口描述**: 单独更新子系统状态

**权限标识**: `erp:subsystem:edit`

**业务日志**: ✅ 记录（子系统状态 - 更新）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明      |
| ------ | ---- | ---- | --------- |
| id     | Long | 是   | 子系统 ID |

**请求参数**:

| 参数名 | 类型   | 必填 | 说明   |
| ------ | ------ | ---- | ------ |
| status | String | 是   | 新状态 |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**可用状态**: `DRAFT`, `ACTIVE`, `COMPLETED`, `CANCELLED`

---

### 1.9 复制子系统

**接口地址**: `POST /erp/subsystem/{id}/copy`

**接口描述**: 复制现有子系统（包括子项和物料）

**权限标识**: `erp:subsystem:add`

**业务日志**: ✅ 记录（复制子系统 - 新增）

**路径参数**:

| 参数名 | 类型 | 必填 | 说明      |
| ------ | ---- | ---- | --------- |
| id     | Long | 是   | 子系统 ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": 10
}
```

**说明**: 返回新创建的子系统 ID

---

### 1.10 校验子系统编号唯一性

**接口地址**: `GET /erp/subsystem/check-code-unique`

**接口描述**: 校验子系统编号是否已存在

**权限标识**: `erp:subsystem:add`

**请求参数**:

| 参数名        | 类型   | 必填 | 说明                |
| ------------- | ------ | ---- | ------------------- |
| subsystemCode | String | 是   | 子系统编号          |
| excludeId     | Long   | 否   | 排除的 ID（编辑时） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": true
}
```

**说明**: `true` 表示唯一，`false` 表示已存在

---

### 1.11 新增子系统模板（过渡接口）

**接口地址**: `POST /erp/subsystem/template`

**接口描述**: 创建子系统模板（不包含项目负责人信息）

**权限标识**: `erp:subsystem:add`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子系统模板 - 新增）

**请求参数**:

```json
{
    "subsystemCode": "TPL-SS-20250105-001",
    "subsystemName": "标准控制系统模板",
    "projectId": 1,
    "projectName": "模板项目",
    "category": "电气系统",
    "description": "标准控制系统配置",
    "status": "DRAFT",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "priority": 1,
    "remarks": "通用模板"
}
```

**参数说明**:

| 参数名        | 类型    | 必填 | 说明                         |
| ------------- | ------- | ---- | ---------------------------- |
| subsystemCode | String  | 否   | 子系统编号（不传则自动生成） |
| subsystemName | String  | 是   | 子系统名称                   |
| projectId     | Long    | 是   | 项目 ID                      |
| projectName   | String  | 是   | 项目名称                     |
| category      | String  | 否   | 分类                         |
| description   | String  | 否   | 描述                         |
| status        | String  | 否   | 状态（默认 DRAFT）           |
| startDate     | Date    | 否   | 开始日期                     |
| endDate       | Date    | 否   | 结束日期                     |
| priority      | Integer | 否   | 优先级                       |
| remarks       | String  | 否   | 备注                         |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

> ⚠️ **注意**: 此接口为过渡方案，未来将迁移到新的模板管理模块。

---

## 2. 子项管理接口

### 2.1 查询子项列表

**接口地址**: `GET /erp/subsystem/item/list`

**接口描述**: 分页查询子项列表

**权限标识**: `erp:subsystem:item:list`

**请求参数**:

| 参数名       | 类型    | 必填 | 说明                |
| ------------ | ------- | ---- | ------------------- |
| subsystemId  | Long    | 否   | 子系统 ID           |
| itemCode     | String  | 否   | 子项编号            |
| itemName     | String  | 否   | 子项名称            |
| itemType     | String  | 否   | 子项类型            |
| status       | String  | 否   | 状态                |
| parentItemId | Long    | 否   | 父子项 ID           |
| pageNum      | Integer | 否   | 页码（默认 1）      |
| pageSize     | Integer | 否   | 每页数量（默认 10） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "rows": [
            {
                "id": 1,
                "subsystemId": 1,
                "itemCode": "PRJ001-SS-001-ITEM-001",
                "itemName": "PLC控制柜",
                "itemType": "设备",
                "specification": "西门子 S7-1500",
                "description": "主控PLC柜",
                "sequenceNumber": 1,
                "quantity": 1,
                "unit": "台",
                "weight": 150.5,
                "materialCount": 10,
                "status": "COMPLETED",
                "parentItemId": null,
                "remarks": "重点设备",
                "createTime": "2025-01-01 10:00:00",
                "updateTime": "2025-01-05 15:30:00"
            }
        ],
        "total": 50
    }
}
```

---

### 2.2 获取子项详细信息

**接口地址**: `GET /erp/subsystem/item/{id}`

**接口描述**: 获取单个子项的详细信息

**权限标识**: `erp:subsystem:item:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 子项 ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "subsystemId": 1,
        "itemCode": "PRJ001-SS-001-ITEM-001",
        "itemName": "PLC控制柜",
        "itemType": "设备",
        "specification": "西门子 S7-1500",
        "description": "主控PLC柜",
        "sequenceNumber": 1,
        "quantity": 1,
        "unit": "台",
        "weight": 150.5,
        "materialCount": 10,
        "status": "COMPLETED",
        "parentItemId": null,
        "remarks": "重点设备",
        "createTime": "2025-01-01 10:00:00",
        "updateTime": "2025-01-05 15:30:00"
    }
}
```

---

### 2.3 新增子项

**接口地址**: `POST /erp/subsystem/item`

**接口描述**: 创建新的子项

**权限标识**: `erp:subsystem:item:add`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子项 - 新增）

**请求参数**:

```json
{
    "subsystemId": 1,
    "itemCode": "PRJ001-SS-001-ITEM-002",
    "itemName": "操作屏",
    "itemType": "设备",
    "specification": "15寸触摸屏",
    "description": "人机交互界面",
    "sequenceNumber": 2,
    "quantity": 2,
    "unit": "台",
    "weight": 25.0,
    "status": "PENDING",
    "parentItemId": 1,
    "remarks": "配套设备"
}
```

**参数说明**:

| 参数名         | 类型    | 必填 | 说明                       |
| -------------- | ------- | ---- | -------------------------- |
| subsystemId    | Long    | 是   | 子系统 ID                  |
| itemCode       | String  | 否   | 子项编号（不传则自动生成） |
| itemName       | String  | 是   | 子项名称                   |
| itemType       | String  | 否   | 子项类型                   |
| specification  | String  | 否   | 规格型号                   |
| description    | String  | 否   | 描述                       |
| sequenceNumber | Integer | 否   | 排序号                     |
| quantity       | Integer | 否   | 数量                       |
| unit           | String  | 否   | 单位                       |
| weight         | Decimal | 否   | 重量(kg)                   |
| status         | String  | 否   | 状态（默认 PENDING）       |
| parentItemId   | Long    | 否   | 父子项 ID（支持树形结构）  |
| remarks        | String  | 否   | 备注                       |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 2.4 修改子项

**接口地址**: `PUT /erp/subsystem/item`

**接口描述**: 修改子项信息

**权限标识**: `erp:subsystem:item:edit`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子项 - 修改）

**请求参数**: 同新增接口，增加 `id` 字段（必填）

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 2.5 删除子项

**接口地址**: `DELETE /erp/subsystem/item/{ids}`

**接口描述**: 批量删除子项

**权限标识**: `erp:subsystem:item:remove`

**业务日志**: ✅ 记录（子项 - 删除）

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                |
| ------ | ------ | ---- | ------------------- |
| ids    | Long[] | 是   | 主键串（如：1,2,3） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 2.6 批量新增子项

**接口地址**: `POST /erp/subsystem/item/batch`

**接口描述**: 批量创建子项

**权限标识**: `erp:subsystem:item:add`

**业务日志**: ✅ 记录（批量新增子项 - 新增）

**请求参数**:

```json
{
    "subsystemId": 1,
    "items": [
        {
            "itemName": "操作屏",
            "itemType": "设备",
            "quantity": 2,
            "unit": "台"
        },
        {
            "itemName": "配电柜",
            "itemType": "设备",
            "quantity": 1,
            "unit": "台"
        }
    ]
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

### 2.7 获取子项树形结构

**接口地址**: `GET /erp/subsystem/item/tree`

**接口描述**: 获取子项的树形层级结构

**权限标识**: `erp:subsystem:item:list`

**请求参数**:

| 参数名      | 类型 | 必填 | 说明      |
| ----------- | ---- | ---- | --------- |
| subsystemId | Long | 是   | 子系统 ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": 1,
            "itemCode": "PRJ001-SS-001-ITEM-001",
            "itemName": "PLC控制柜",
            "itemType": "设备",
            "quantity": 1,
            "unit": "台",
            "children": [
                {
                    "id": 2,
                    "itemCode": "PRJ001-SS-001-ITEM-002",
                    "itemName": "操作屏",
                    "itemType": "设备",
                    "quantity": 2,
                    "unit": "台",
                    "children": []
                }
            ]
        }
    ]
}
```

---

### 2.8 生成子项编号

**接口地址**: `GET /erp/subsystem/item/generate-code`

**接口描述**: 根据子系统编号自动生成子项编号

**权限标识**: `erp:subsystem:item:add`

**请求参数**:

| 参数名        | 类型   | 必填 | 说明       |
| ------------- | ------ | ---- | ---------- |
| subsystemCode | String | 是   | 子系统编号 |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": "PRJ001-SS-001-ITEM-003"
}
```

**编号规则**: `{subsystemCode}-ITEM-{序号}`

---

## 3. 物料管理接口

### 3.1 查询物料列表

**接口地址**: `GET /erp/subsystem/material/list`

**接口描述**: 分页查询物料列表

**权限标识**: `erp:subsystem:material:list`

**请求参数**:

| 参数名       | 类型    | 必填 | 说明                |
| ------------ | ------- | ---- | ------------------- |
| subsystemId  | Long    | 否   | 子系统 ID           |
| itemId       | Long    | 否   | 子项 ID             |
| materialCode | String  | 否   | 物料编码            |
| materialName | String  | 否   | 物料名称            |
| materialType | String  | 否   | 物料类型            |
| status       | String  | 否   | 状态                |
| pageNum      | Integer | 否   | 页码（默认 1）      |
| pageSize     | Integer | 否   | 每页数量（默认 10） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "rows": [
            {
                "id": 1,
                "subsystemId": 1,
                "itemId": 1,
                "materialId": 100,
                "materialCode": "MAT-001",
                "materialName": "CPU模块",
                "specification": "6ES7 515-2AM01-0AB0",
                "materialType": "电气元件",
                "quantity": 1,
                "unit": "个",
                "unitWeight": 0.5,
                "totalWeight": 0.5,
                "manufacturer": "西门子",
                "model": "S7-1500",
                "serialNumber": "SN123456",
                "sequenceNumber": 1,
                "status": "AVAILABLE",
                "remarks": "核心部件",
                "createTime": "2025-01-01 10:00:00",
                "updateTime": "2025-01-05 15:30:00"
            }
        ],
        "total": 200
    }
}
```

---

### 3.2 获取物料详细信息

**接口地址**: `GET /erp/subsystem/material/{id}`

**接口描述**: 获取单个物料的详细信息

**权限标识**: `erp:subsystem:material:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 物料 ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "subsystemId": 1,
        "itemId": 1,
        "materialId": 100,
        "materialCode": "MAT-001",
        "materialName": "CPU模块",
        "specification": "6ES7 515-2AM01-0AB0",
        "materialType": "电气元件",
        "quantity": 1,
        "unit": "个",
        "unitWeight": 0.5,
        "totalWeight": 0.5,
        "manufacturer": "西门子",
        "model": "S7-1500",
        "serialNumber": "SN123456",
        "sequenceNumber": 1,
        "status": "AVAILABLE",
        "remarks": "核心部件",
        "createTime": "2025-01-01 10:00:00",
        "updateTime": "2025-01-05 15:30:00"
    }
}
```

---

### 3.3 添加物料

**接口地址**: `POST /erp/subsystem/material`

**接口描述**: 添加新的物料

**权限标识**: `erp:subsystem:material:add`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（物料 - 新增）

**请求参数**:

```json
{
    "subsystemId": 1,
    "itemId": 1,
    "materialId": 100,
    "materialCode": "MAT-002",
    "materialName": "通讯模块",
    "specification": "6ES7 542-1AD00-0AB0",
    "materialType": "电气元件",
    "quantity": 2,
    "unit": "个",
    "unitWeight": 0.3,
    "totalWeight": 0.6,
    "manufacturer": "西门子",
    "model": "S7-1500",
    "serialNumber": "SN123457",
    "sequenceNumber": 2,
    "status": "AVAILABLE",
    "remarks": "通讯部件"
}
```

**参数说明**:

| 参数名         | 类型    | 必填 | 说明      |
| -------------- | ------- | ---- | --------- |
| subsystemId    | Long    | 是   | 子系统 ID |
| itemId         | Long    | 是   | 子项 ID   |
| materialId     | Long    | 否   | 物料 ID   |
| materialCode   | String  | 否   | 物料编码  |
| materialName   | String  | 是   | 物料名称  |
| specification  | String  | 否   | 规格型号  |
| materialType   | String  | 否   | 物料类型  |
| quantity       | Integer | 是   | 数量      |
| unit           | String  | 否   | 单位      |
| unitWeight     | Decimal | 否   | 单重(kg)  |
| totalWeight    | Decimal | 否   | 总重(kg)  |
| manufacturer   | String  | 否   | 制造商    |
| model          | String  | 否   | 型号      |
| serialNumber   | String  | 否   | 序列号    |
| sequenceNumber | Integer | 否   | 排序号    |
| status         | String  | 否   | 状态      |
| remarks        | String  | 否   | 备注      |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.4 修改物料

**接口地址**: `PUT /erp/subsystem/material`

**接口描述**: 修改物料信息

**权限标识**: `erp:subsystem:material:edit`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（物料 - 修改）

**请求参数**: 同添加接口，增加 `id` 字段（必填）

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.5 删除物料

**接口地址**: `DELETE /erp/subsystem/material/{ids}`

**接口描述**: 批量删除物料

**权限标识**: `erp:subsystem:material:remove`

**业务日志**: ✅ 记录（物料 - 删除）

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                |
| ------ | ------ | ---- | ------------------- |
| ids    | Long[] | 是   | 主键串（如：1,2,3） |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

---

### 3.6 批量添加物料

**接口地址**: `POST /erp/subsystem/material/batch`

**接口描述**: 批量添加物料到指定子项

**权限标识**: `erp:subsystem:material:add`

**业务日志**: ✅ 记录（批量添加物料 - 新增）

**请求参数**:

```json
{
    "subsystemId": 1,
    "itemId": 1,
    "materials": [
        {
            "materialCode": "MAT-003",
            "materialName": "I/O模块",
            "quantity": 4,
            "unit": "个"
        },
        {
            "materialCode": "MAT-004",
            "materialName": "电源模块",
            "quantity": 2,
            "unit": "个"
        }
    ]
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

## 4. 数据结构说明

### 4.1 ErpSubsystemBo（子系统业务对象）

```typescript
interface ErpSubsystemBo {
    id?: number; // 主键ID（编辑时必填）
    subsystemCode?: string; // 子系统编号
    subsystemName: string; // 子系统名称（必填）
    projectId: number; // 项目ID（必填）
    projectName: string; // 项目名称（必填）
    category?: string; // 分类
    description?: string; // 描述
    responsiblePerson?: string; // 负责人姓名
    responsiblePersonId?: number; // 负责人ID
    status?: string; // 状态
    startDate?: string; // 开始日期（格式：yyyy-MM-dd）
    endDate?: string; // 结束日期（格式：yyyy-MM-dd）
    priority?: number; // 优先级
    remarks?: string; // 备注
}
```

### 4.2 ErpSubsystemVo（子系统视图对象）

```typescript
interface ErpSubsystemVo {
    id: number; // 主键ID
    subsystemCode: string; // 子系统编号
    subsystemName: string; // 子系统名称
    projectId: number; // 项目ID
    projectName: string; // 项目名称
    category: string; // 分类
    description: string; // 描述
    responsiblePerson: string; // 负责人姓名
    responsiblePersonId: number; // 负责人ID
    status: string; // 状态
    totalItems: number; // 总子项数
    totalMaterials: number; // 总物料数
    totalWeight: number; // 总重量(kg)
    startDate: string; // 开始日期
    endDate: string; // 结束日期
    priority: number; // 优先级
    remarks: string; // 备注
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
}
```

### 4.3 ErpSubsystemDetailVo（子系统详情对象）

```typescript
interface ErpSubsystemDetailVo extends ErpSubsystemVo {
    items: ErpSubsystemItemVo[]; // 子项列表
    attachments: ErpSubsystemAttachmentVo[]; // 附件列表
    statistics: {
        // 统计信息
        completedItemCount: number; // 已完成子项数
        inProgressItemCount: number; // 进行中子项数
        pendingItemCount: number; // 待处理子项数
        totalMaterialCount: number; // 总物料数
    };
}
```

### 4.4 ErpSubsystemItemBo（子项业务对象）

```typescript
interface ErpSubsystemItemBo {
    id?: number; // 主键ID（编辑时必填）
    subsystemId: number; // 子系统ID（必填）
    itemCode?: string; // 子项编号
    itemName: string; // 子项名称（必填）
    itemType?: string; // 子项类型
    specification?: string; // 规格型号
    description?: string; // 描述
    sequenceNumber?: number; // 排序号
    quantity?: number; // 数量
    unit?: string; // 单位
    weight?: number; // 重量(kg)
    status?: string; // 状态
    parentItemId?: number; // 父子项ID
    remarks?: string; // 备注
}
```

### 4.5 ErpSubsystemItemVo（子项视图对象）

```typescript
interface ErpSubsystemItemVo {
    id: number; // 主键ID
    subsystemId: number; // 子系统ID
    itemCode: string; // 子项编号
    itemName: string; // 子项名称
    itemType: string; // 子项类型
    specification: string; // 规格型号
    description: string; // 描述
    sequenceNumber: number; // 排序号
    quantity: number; // 数量
    unit: string; // 单位
    weight: number; // 重量(kg)
    materialCount: number; // 物料数量
    status: string; // 状态
    parentItemId: number; // 父子项ID
    remarks: string; // 备注
    children?: ErpSubsystemItemVo[]; // 子节点列表（树形结构）
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
}
```

### 4.6 ErpSubsystemMaterialBo（物料业务对象）

```typescript
interface ErpSubsystemMaterialBo {
    id?: number; // 主键ID（编辑时必填）
    subsystemId: number; // 子系统ID（必填）
    itemId: number; // 子项ID（必填）
    materialId?: number; // 物料ID
    materialCode?: string; // 物料编码
    materialName: string; // 物料名称（必填）
    specification?: string; // 规格型号
    materialType?: string; // 物料类型
    quantity: number; // 数量（必填）
    unit?: string; // 单位
    unitWeight?: number; // 单重(kg)
    totalWeight?: number; // 总重(kg)
    manufacturer?: string; // 制造商
    model?: string; // 型号
    serialNumber?: string; // 序列号
    sequenceNumber?: number; // 排序号
    status?: string; // 状态
    remarks?: string; // 备注
}
```

### 4.7 ErpSubsystemMaterialVo（物料视图对象）

```typescript
interface ErpSubsystemMaterialVo {
    id: number; // 主键ID
    subsystemId: number; // 子系统ID
    itemId: number; // 子项ID
    materialId: number; // 物料ID
    materialCode: string; // 物料编码
    materialName: string; // 物料名称
    specification: string; // 规格型号
    materialType: string; // 物料类型
    quantity: number; // 数量
    unit: string; // 单位
    unitWeight: number; // 单重(kg)
    totalWeight: number; // 总重(kg)
    manufacturer: string; // 制造商
    model: string; // 型号
    serialNumber: string; // 序列号
    sequenceNumber: number; // 排序号
    status: string; // 状态
    remarks: string; // 备注
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
}
```

---

## 5. 状态码说明

### 5.1 子系统状态（status）

| 状态码    | 说明 | 描述         |
| --------- | ---- | ------------ |
| DRAFT     | 草稿 | 初始创建状态 |
| ACTIVE    | 活动 | 正在进行中   |
| COMPLETED | 完成 | 已完成       |
| CANCELLED | 取消 | 已取消       |

### 5.2 子项状态（status）

| 状态码      | 说明   | 描述       |
| ----------- | ------ | ---------- |
| PENDING     | 待处理 | 未开始     |
| IN_PROGRESS | 进行中 | 正在处理中 |
| COMPLETED   | 已完成 | 处理完成   |
| ON_HOLD     | 暂停   | 暂时搁置   |

### 5.3 物料状态（status）

| 状态码      | 说明   | 描述       |
| ----------- | ------ | ---------- |
| AVAILABLE   | 可用   | 可正常使用 |
| IN_USE      | 使用中 | 正在使用   |
| MAINTENANCE | 维护中 | 维护保养   |
| SCRAPPED    | 报废   | 已报废     |

---

## 6. 权限列表

### 6.1 子系统管理权限

| 权限码               | 权限名称       |
| -------------------- | -------------- |
| erp:subsystem:list   | 查看子系统列表 |
| erp:subsystem:query  | 查看子系统详情 |
| erp:subsystem:add    | 新增子系统     |
| erp:subsystem:edit   | 编辑子系统     |
| erp:subsystem:remove | 删除子系统     |
| erp:subsystem:export | 导出子系统     |

### 6.2 子项管理权限

| 权限码                    | 权限名称     |
| ------------------------- | ------------ |
| erp:subsystem:item:list   | 查看子项列表 |
| erp:subsystem:item:query  | 查看子项详情 |
| erp:subsystem:item:add    | 新增子项     |
| erp:subsystem:item:edit   | 编辑子项     |
| erp:subsystem:item:remove | 删除子项     |

### 6.3 物料管理权限

| 权限码                        | 权限名称     |
| ----------------------------- | ------------ |
| erp:subsystem:material:list   | 查看物料列表 |
| erp:subsystem:material:query  | 查看物料详情 |
| erp:subsystem:material:add    | 添加物料     |
| erp:subsystem:material:edit   | 编辑物料     |
| erp:subsystem:material:remove | 删除物料     |

---

## 📝 附录

### A. 响应格式说明

所有接口统一返回格式：

```json
{
    "code": 200, // 状态码（200成功，其他失败）
    "msg": "操作成功", // 提示信息
    "data": {} // 响应数据（可选）
}
```

### B. 分页响应格式

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "rows": [], // 数据列表
        "total": 100 // 总记录数
    }
}
```

### C. 错误码说明

| 错误码 | 说明         | 常见原因             |
| ------ | ------------ | -------------------- |
| 400    | 请求参数错误 | 参数缺失或格式不正确 |
| 401    | 未授权       | 未登录或登录已过期   |
| 403    | 无权限       | 没有操作权限         |
| 404    | 资源不存在   | 请求的数据不存在     |
| 500    | 服务器错误   | 服务器内部错误       |

---

**文档作者**: AI Assistant  
**最后更新**: 2025-11-05  
**文档版本**: v1.0  
**校验状态**: ✅ 已与实际代码校验一致
