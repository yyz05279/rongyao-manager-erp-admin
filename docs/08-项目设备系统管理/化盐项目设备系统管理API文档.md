# 化盐项目设备系统管理模块 API 文档

## 文档信息

-   **版本**: v1.0
-   **更新日期**: 2025-11-07
-   **接口基础路径**: `/erp/saltprocess`
-   **认证方式**: Sa-Token
-   **数据格式**: JSON

---

## 目录

1. [设备系统模板管理](#1-设备系统模板管理)
2. [子系统模板管理](#2-子系统模板管理)
3. [子项模板管理](#3-子项模板管理)
4. [物料模板管理](#4-物料模板管理)
5. [项目设备系统管理](#5-项目设备系统管理)
6. [项目子系统管理](#6-项目子系统管理)
7. [项目子项管理](#7-项目子项管理)
8. [项目物料管理](#8-项目物料管理)
9. [数据模型](#9-数据模型)
10. [错误码说明](#10-错误码说明)

---

## 1. 设备系统模板管理

### 1.1 查询设备系统模板列表（分页）

**接口地址**: `GET /erp/saltprocess/equipmentSystemTemplate/list`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

**请求参数**:

| 参数名       | 类型    | 必填 | 说明                                                            |
| ------------ | ------- | ---- | --------------------------------------------------------------- |
| templateCode | String  | 否   | 模板编码（模糊查询）                                            |
| templateName | String  | 否   | 模板名称（模糊查询）                                            |
| systemType   | String  | 否   | 系统类型（SOLID-固态，LIQUID-液态，POWDER-粉盐，BURNER-燃烧器） |
| category     | String  | 否   | 分类                                                            |
| status       | String  | 否   | 状态（DRAFT-草稿，ACTIVE-启用，ARCHIVED-归档）                  |
| isStandard   | Boolean | 否   | 是否标准模板                                                    |
| pageNum      | Integer | 否   | 页码（默认 1）                                                  |
| pageSize     | Integer | 否   | 每页大小（默认 10）                                             |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "templateCode": "TMPL_SYS_SOLID_001",
            "templateName": "固态处理厂标准模板",
            "systemType": "SOLID",
            "category": "处理厂",
            "description": "固态处理厂标准配置",
            "subsystemCount": 5,
            "totalItems": 20,
            "totalMaterials": 150,
            "estimatedWeight": 5000.0,
            "status": "ACTIVE",
            "isStandard": true,
            "version": "1.0",
            "createTime": "2025-11-07 10:00:00"
        }
    ],
    "total": 1
}
```

### 1.2 查询设备系统模板详情

**接口地址**: `GET /erp/saltprocess/equipmentSystemTemplate/{id}`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:query`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 模板 ID |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "templateCode": "TMPL_SYS_SOLID_001",
        "templateName": "固态处理厂标准模板",
        "systemType": "SOLID",
        "category": "处理厂",
        "description": "固态处理厂标准配置",
        "subsystemCount": 5,
        "totalItems": 20,
        "totalMaterials": 150,
        "estimatedWeight": 5000.0,
        "status": "ACTIVE",
        "isStandard": true,
        "version": "1.0",
        "remarks": "标准配置模板",
        "createBy": 1,
        "createTime": "2025-11-07 10:00:00",
        "updateBy": 1,
        "updateTime": "2025-11-07 10:00:00"
    }
}
```

### 1.3 根据模板编码查询

**接口地址**: `GET /erp/saltprocess/equipmentSystemTemplate/code/{templateCode}`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:query`

**路径参数**:

| 参数名       | 类型   | 必填 | 说明     |
| ------------ | ------ | ---- | -------- |
| templateCode | String | 是   | 模板编码 |

### 1.4 查询标准模板列表

**接口地址**: `GET /erp/saltprocess/equipmentSystemTemplate/standard`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": 1,
            "templateCode": "TMPL_SYS_SOLID_001",
            "templateName": "固态处理厂标准模板",
            "systemType": "SOLID",
            "isStandard": true
        }
    ]
}
```

### 1.5 查询启用状态的模板列表

**接口地址**: `GET /erp/saltprocess/equipmentSystemTemplate/active`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

### 1.6 根据系统类型查询模板列表

**接口地址**: `GET /erp/saltprocess/equipmentSystemTemplate/systemType/{systemType}`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

**路径参数**:

| 参数名     | 类型   | 必填 | 说明                                   |
| ---------- | ------ | ---- | -------------------------------------- |
| systemType | String | 是   | 系统类型（SOLID/LIQUID/POWDER/BURNER） |

### 1.7 新增设备系统模板

**接口地址**: `POST /erp/saltprocess/equipmentSystemTemplate`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:add`

**请求体**:

```json
{
    "templateCode": "TMPL_SYS_SOLID_002",
    "templateName": "固态处理厂定制模板",
    "systemType": "SOLID",
    "category": "处理厂",
    "description": "固态处理厂定制配置",
    "status": "DRAFT",
    "isStandard": false,
    "version": "1.0",
    "remarks": "定制配置模板"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 1.8 修改设备系统模板

**接口地址**: `PUT /erp/saltprocess/equipmentSystemTemplate`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:edit`

**请求体**:

```json
{
    "id": 1,
    "templateName": "固态处理厂标准模板V2",
    "description": "更新后的描述",
    "version": "2.0"
}
```

### 1.9 删除设备系统模板

**接口地址**: `DELETE /erp/saltprocess/equipmentSystemTemplate/{ids}`

**权限标识**: `erp:saltprocess:equipmentSystemTemplate:remove`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                   |
| ------ | ------ | ---- | ---------------------- |
| ids    | Long[] | 是   | 模板 ID 数组，逗号分隔 |

**示例**: `DELETE /erp/saltprocess/equipmentSystemTemplate/1,2,3`

---

## 2. 子系统模板管理

### 2.1 查询子系统模板列表（分页）

**接口地址**: `GET /erp/saltprocess/subsystemTemplate/list`

**权限标识**: `erp:saltprocess:subsystemTemplate:list`

**请求参数**:

| 参数名           | 类型    | 必填 | 说明                                                          |
| ---------------- | ------- | ---- | ------------------------------------------------------------- |
| systemTemplateId | Long    | 否   | 设备系统模板 ID                                               |
| templateCode     | String  | 否   | 模板编码                                                      |
| subsystemName    | String  | 否   | 子系统名称                                                    |
| subsystemType    | String  | 否   | 子系统类型（MECHANICAL-机械，ELECTRICAL-电控，PIPELINE-管路） |
| status           | String  | 否   | 状态                                                          |
| pageNum          | Integer | 否   | 页码                                                          |
| pageSize         | Integer | 否   | 每页大小                                                      |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "systemTemplateId": 1,
            "templateCode": "TMPL_SUB_CONVEYOR_001",
            "subsystemName": "平面输送机",
            "subsystemType": "MECHANICAL",
            "specification": "标准型",
            "model": "PS-1000",
            "manufacturer": "XX机械",
            "itemCount": 5,
            "materialCount": 30,
            "estimatedWeight": 1000.0,
            "sequenceNumber": 1,
            "status": "ACTIVE"
        }
    ],
    "total": 1
}
```

### 2.2 查询子系统模板详情

**接口地址**: `GET /erp/saltprocess/subsystemTemplate/{id}`

**权限标识**: `erp:saltprocess:subsystemTemplate:query`

### 2.3 新增子系统模板

**接口地址**: `POST /erp/saltprocess/subsystemTemplate`

**权限标识**: `erp:saltprocess:subsystemTemplate:add`

**请求体**:

```json
{
    "systemTemplateId": 1,
    "templateCode": "TMPL_SUB_CRUSHER_001",
    "subsystemName": "粉碎机",
    "subsystemType": "MECHANICAL",
    "specification": "重型",
    "model": "PC-2000",
    "manufacturer": "XX设备",
    "description": "大型粉碎机",
    "sequenceNumber": 3,
    "status": "ACTIVE"
}
```

### 2.4 修改子系统模板

**接口地址**: `PUT /erp/saltprocess/subsystemTemplate`

**权限标识**: `erp:saltprocess:subsystemTemplate:edit`

### 2.5 删除子系统模板

**接口地址**: `DELETE /erp/saltprocess/subsystemTemplate/{ids}`

**权限标识**: `erp:saltprocess:subsystemTemplate:remove`

---

## 3. 子项模板管理

### 3.1 查询子项模板列表（分页）

**接口地址**: `GET /erp/saltprocess/itemTemplate/list`

**权限标识**: `erp:saltprocess:itemTemplate:list`

**请求参数**:

| 参数名               | 类型    | 必填 | 说明                                                   |
| -------------------- | ------- | ---- | ------------------------------------------------------ |
| subsystemTemplateId  | Long    | 否   | 子系统模板 ID                                          |
| templateCode         | String  | 否   | 模板编码                                               |
| itemName             | String  | 否   | 子项名称                                               |
| itemType             | String  | 否   | 子项类型（MAIN-主体，FASTENER-紧固件，ACCESSORY-附件） |
| parentItemTemplateId | Long    | 否   | 父子项模板 ID                                          |
| status               | String  | 否   | 状态                                                   |
| pageNum              | Integer | 否   | 页码                                                   |
| pageSize             | Integer | 否   | 每页大小                                               |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "subsystemTemplateId": 1,
            "templateCode": "TMPL_ITEM_CONV_MAIN_001",
            "itemName": "输送主体",
            "itemType": "MAIN",
            "specification": "标准型",
            "defaultQuantity": 2,
            "defaultUnit": "套",
            "estimatedUnitWeight": 500.0,
            "materialCount": 15,
            "parentItemTemplateId": null,
            "sequenceNumber": 1,
            "status": "ACTIVE"
        }
    ],
    "total": 1
}
```

### 3.2 查询子项模板详情

**接口地址**: `GET /erp/saltprocess/itemTemplate/{id}`

**权限标识**: `erp:saltprocess:itemTemplate:query`

### 3.3 新增子项模板

**接口地址**: `POST /erp/saltprocess/itemTemplate`

**权限标识**: `erp:saltprocess:itemTemplate:add`

**请求体**:

```json
{
    "subsystemTemplateId": 1,
    "templateCode": "TMPL_ITEM_CONV_FASTENER_001",
    "itemName": "紧固件",
    "itemType": "FASTENER",
    "specification": "M8*30",
    "defaultQuantity": 1,
    "defaultUnit": "套",
    "estimatedUnitWeight": 5.0,
    "parentItemTemplateId": 1,
    "sequenceNumber": 2,
    "status": "ACTIVE"
}
```

### 3.4 修改子项模板

**接口地址**: `PUT /erp/saltprocess/itemTemplate`

**权限标识**: `erp:saltprocess:itemTemplate:edit`

### 3.5 删除子项模板

**接口地址**: `DELETE /erp/saltprocess/itemTemplate/{ids}`

**权限标识**: `erp:saltprocess:itemTemplate:remove`

---

## 4. 物料模板管理

### 4.1 查询物料模板列表（分页）

**接口地址**: `GET /erp/saltprocess/materialTemplate/list`

**权限标识**: `erp:saltprocess:materialTemplate:list`

**请求参数**:

| 参数名           | 类型    | 必填 | 说明        |
| ---------------- | ------- | ---- | ----------- |
| itemTemplateId   | Long    | 否   | 子项模板 ID |
| templateCode     | String  | 否   | 模板编码    |
| materialCode     | String  | 否   | 物料编码    |
| materialName     | String  | 否   | 物料名称    |
| materialType     | String  | 否   | 物料类型    |
| materialCategory | String  | 否   | 物料类别    |
| manufacturer     | String  | 否   | 制造商      |
| status           | String  | 否   | 状态        |
| pageNum          | Integer | 否   | 页码        |
| pageSize         | Integer | 否   | 每页大小    |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "itemTemplateId": 1,
            "templateCode": "TMPL_MAT_BOLT_001",
            "materialCode": "MAT001",
            "materialName": "螺栓M8*30",
            "specification": "304不锈钢",
            "materialType": "标准件",
            "materialCategory": "紧固件",
            "defaultQuantity": 100,
            "defaultUnit": "个",
            "estimatedUnitWeight": 0.05,
            "manufacturer": "XX五金",
            "model": "M8*30",
            "packageType": "盒装",
            "isFragile": false,
            "isHazardous": false,
            "sequenceNumber": 1,
            "status": "ACTIVE"
        }
    ],
    "total": 1
}
```

### 4.2 查询物料模板详情

**接口地址**: `GET /erp/saltprocess/materialTemplate/{id}`

**权限标识**: `erp:saltprocess:materialTemplate:query`

### 4.3 新增物料模板

**接口地址**: `POST /erp/saltprocess/materialTemplate`

**权限标识**: `erp:saltprocess:materialTemplate:add`

**请求体**:

```json
{
    "itemTemplateId": 1,
    "templateCode": "TMPL_MAT_BOLT_002",
    "materialCode": "MAT002",
    "materialName": "螺栓M10*40",
    "specification": "304不锈钢",
    "materialType": "标准件",
    "materialCategory": "紧固件",
    "defaultQuantity": 50,
    "defaultUnit": "个",
    "estimatedUnitWeight": 0.08,
    "manufacturer": "XX五金",
    "model": "M10*40",
    "packageType": "盒装",
    "isFragile": false,
    "isHazardous": false,
    "storageRequirement": "防潮",
    "sequenceNumber": 2,
    "status": "ACTIVE"
}
```

### 4.4 修改物料模板

**接口地址**: `PUT /erp/saltprocess/materialTemplate`

**权限标识**: `erp:saltprocess:materialTemplate:edit`

### 4.5 删除物料模板

**接口地址**: `DELETE /erp/saltprocess/materialTemplate/{ids}`

**权限标识**: `erp:saltprocess:materialTemplate:remove`

---

## 5. 项目设备系统管理

### 5.1 查询项目设备系统列表（分页）

**接口地址**: `GET /erp/saltprocess/projectEquipmentSystem/list`

**权限标识**: `erp:saltprocess:projectEquipmentSystem:list`

**请求参数**:

| 参数名              | 类型    | 必填 | 说明                                                               |
| ------------------- | ------- | ---- | ------------------------------------------------------------------ |
| projectId           | Long    | 否   | 项目 ID                                                            |
| templateId          | Long    | 否   | 模板 ID                                                            |
| systemCode          | String  | 否   | 系统编码                                                           |
| systemName          | String  | 否   | 系统名称                                                           |
| systemType          | String  | 否   | 系统类型                                                           |
| status              | String  | 否   | 状态（DRAFT-草稿，ACTIVE-活跃，COMPLETED-已完成，ARCHIVED-已归档） |
| responsiblePersonId | Long    | 否   | 负责人 ID                                                          |
| pageNum             | Integer | 否   | 页码                                                               |
| pageSize            | Integer | 否   | 每页大小                                                           |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "projectId": 1,
            "projectName": "XX项目",
            "templateId": 1,
            "systemCode": "PROJ_SYS_20250101_001",
            "systemName": "固态处理厂",
            "systemType": "SOLID",
            "category": "处理厂",
            "subsystemCount": 5,
            "totalItems": 20,
            "totalMaterials": 150,
            "totalWeight": 5200.5,
            "responsiblePersonId": 1,
            "responsiblePerson": "张三",
            "status": "ACTIVE",
            "priority": 1,
            "version": 0,
            "createTime": "2025-11-07 10:00:00"
        }
    ],
    "total": 1
}
```

### 5.2 查询项目设备系统详情

**接口地址**: `GET /erp/saltprocess/projectEquipmentSystem/{id}`

**权限标识**: `erp:saltprocess:projectEquipmentSystem:query`

### 5.3 新增项目设备系统

**接口地址**: `POST /erp/saltprocess/projectEquipmentSystem`

**权限标识**: `erp:saltprocess:projectEquipmentSystem:add`

**请求体**:

```json
{
    "projectId": 1,
    "templateId": 1,
    "systemCode": "PROJ_SYS_20250101_002",
    "systemName": "液态处理厂",
    "systemType": "LIQUID",
    "category": "处理厂",
    "description": "液态处理厂设备系统",
    "responsiblePersonId": 1,
    "responsiblePerson": "李四",
    "status": "DRAFT",
    "priority": 1
}
```

### 5.4 修改项目设备系统

**接口地址**: `PUT /erp/saltprocess/projectEquipmentSystem`

**权限标识**: `erp:saltprocess:projectEquipmentSystem:edit`

### 5.5 删除项目设备系统

**接口地址**: `DELETE /erp/saltprocess/projectEquipmentSystem/{ids}`

**权限标识**: `erp:saltprocess:projectEquipmentSystem:remove`

---

## 6. 项目子系统管理

### 6.1 查询项目子系统列表（分页）

**接口地址**: `GET /erp/saltprocess/projectSubsystem/list`

**权限标识**: `erp:saltprocess:projectSubsystem:list`

**请求参数**:

| 参数名          | 类型    | 必填 | 说明            |
| --------------- | ------- | ---- | --------------- |
| projectSystemId | Long    | 否   | 项目设备系统 ID |
| projectId       | Long    | 否   | 项目 ID         |
| templateId      | Long    | 否   | 模板 ID         |
| subsystemCode   | String  | 否   | 子系统编码      |
| subsystemName   | String  | 否   | 子系统名称      |
| subsystemType   | String  | 否   | 子系统类型      |
| status          | String  | 否   | 状态            |
| pageNum         | Integer | 否   | 页码            |
| pageSize        | Integer | 否   | 每页大小        |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "projectSystemId": 1,
            "projectId": 1,
            "templateId": 1,
            "subsystemCode": "PROJ_SUB_20250101_001",
            "subsystemName": "平面输送机",
            "subsystemType": "MECHANICAL",
            "specification": "标准型",
            "model": "PS-1000",
            "manufacturer": "XX机械",
            "itemCount": 5,
            "materialCount": 30,
            "totalWeight": 1050.0,
            "sequenceNumber": 1,
            "status": "ACTIVE",
            "version": 0
        }
    ],
    "total": 1
}
```

### 6.2 查询项目子系统详情

**接口地址**: `GET /erp/saltprocess/projectSubsystem/{id}`

**权限标识**: `erp:saltprocess:projectSubsystem:query`

### 6.3 新增项目子系统

**接口地址**: `POST /erp/saltprocess/projectSubsystem`

**权限标识**: `erp:saltprocess:projectSubsystem:add`

### 6.4 修改项目子系统

**接口地址**: `PUT /erp/saltprocess/projectSubsystem`

**权限标识**: `erp:saltprocess:projectSubsystem:edit`

### 6.5 删除项目子系统

**接口地址**: `DELETE /erp/saltprocess/projectSubsystem/{ids}`

**权限标识**: `erp:saltprocess:projectSubsystem:remove`

---

## 7. 项目子项管理

### 7.1 查询项目子项列表（分页）

**接口地址**: `GET /erp/saltprocess/projectItem/list`

**权限标识**: `erp:saltprocess:projectItem:list`

**请求参数**:

| 参数名             | 类型    | 必填 | 说明            |
| ------------------ | ------- | ---- | --------------- |
| projectSubsystemId | Long    | 否   | 项目子系统 ID   |
| projectSystemId    | Long    | 否   | 项目设备系统 ID |
| projectId          | Long    | 否   | 项目 ID         |
| templateId         | Long    | 否   | 模板 ID         |
| itemCode           | String  | 否   | 子项编码        |
| itemName           | String  | 否   | 子项名称        |
| itemType           | String  | 否   | 子项类型        |
| parentItemId       | Long    | 否   | 父子项 ID       |
| status             | String  | 否   | 状态            |
| pageNum            | Integer | 否   | 页码            |
| pageSize           | Integer | 否   | 每页大小        |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "projectSubsystemId": 1,
            "projectSystemId": 1,
            "projectId": 1,
            "templateId": 1,
            "itemCode": "PROJ_ITEM_20250101_001",
            "itemName": "输送主体",
            "itemType": "MAIN",
            "specification": "标准型",
            "quantity": 2,
            "unit": "套",
            "unitWeight": 500.0,
            "totalWeight": 1000.0,
            "materialCount": 15,
            "parentItemId": null,
            "sequenceNumber": 1,
            "status": "ACTIVE",
            "version": 0
        }
    ],
    "total": 1
}
```

### 7.2 查询项目子项详情

**接口地址**: `GET /erp/saltprocess/projectItem/{id}`

**权限标识**: `erp:saltprocess:projectItem:query`

### 7.3 新增项目子项

**接口地址**: `POST /erp/saltprocess/projectItem`

**权限标识**: `erp:saltprocess:projectItem:add`

### 7.4 修改项目子项

**接口地址**: `PUT /erp/saltprocess/projectItem`

**权限标识**: `erp:saltprocess:projectItem:edit`

### 7.5 删除项目子项

**接口地址**: `DELETE /erp/saltprocess/projectItem/{ids}`

**权限标识**: `erp:saltprocess:projectItem:remove`

---

## 8. 项目物料管理

### 8.1 查询项目物料列表（分页）

**接口地址**: `GET /erp/saltprocess/projectMaterial/list`

**权限标识**: `erp:saltprocess:projectMaterial:list`

**请求参数**:

| 参数名             | 类型    | 必填 | 说明                                                              |
| ------------------ | ------- | ---- | ----------------------------------------------------------------- |
| projectItemId      | Long    | 否   | 项目子项 ID                                                       |
| projectSubsystemId | Long    | 否   | 项目子系统 ID                                                     |
| projectSystemId    | Long    | 否   | 项目设备系统 ID                                                   |
| projectId          | Long    | 否   | 项目 ID                                                           |
| templateId         | Long    | 否   | 模板 ID                                                           |
| materialId         | Long    | 否   | 基础物料 ID                                                       |
| materialCode       | String  | 否   | 物料编码                                                          |
| materialName       | String  | 否   | 物料名称                                                          |
| materialType       | String  | 否   | 物料类型                                                          |
| status             | String  | 否   | 状态（NORMAL-正常，PREPARING-准备中，READY-就绪，SHIPPED-已发货） |
| pageNum            | Integer | 否   | 页码                                                              |
| pageSize           | Integer | 否   | 每页大小                                                          |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "rows": [
        {
            "id": 1,
            "projectItemId": 1,
            "projectSubsystemId": 1,
            "projectSystemId": 1,
            "projectId": 1,
            "templateId": 1,
            "materialId": 1,
            "materialCode": "MAT001",
            "materialName": "螺栓M8*30",
            "specification": "304不锈钢",
            "materialType": "标准件",
            "materialCategory": "紧固件",
            "quantity": 100,
            "unit": "个",
            "unitWeight": 0.05,
            "totalWeight": 5.0,
            "manufacturer": "XX五金",
            "model": "M8*30",
            "serialNumber": "SN20250101001",
            "packageType": "盒装",
            "packageQuantity": 1,
            "isFragile": false,
            "isHazardous": false,
            "status": "NORMAL",
            "sequenceNumber": 1,
            "version": 0
        }
    ],
    "total": 1
}
```

### 8.2 查询项目物料详情

**接口地址**: `GET /erp/saltprocess/projectMaterial/{id}`

**权限标识**: `erp:saltprocess:projectMaterial:query`

### 8.3 新增项目物料

**接口地址**: `POST /erp/saltprocess/projectMaterial`

**权限标识**: `erp:saltprocess:projectMaterial:add`

### 8.4 修改项目物料

**接口地址**: `PUT /erp/saltprocess/projectMaterial`

**权限标识**: `erp:saltprocess:projectMaterial:edit`

### 8.5 删除项目物料

**接口地址**: `DELETE /erp/saltprocess/projectMaterial/{ids}`

**权限标识**: `erp:saltprocess:projectMaterial:remove`

---

## 9. 数据模型

### 9.1 设备系统模板 (ErpSaltEquipmentSystemTemplate)

| 字段名          | 类型       | 说明             |
| --------------- | ---------- | ---------------- |
| id              | Long       | 主键 ID          |
| templateCode    | String     | 模板编码（唯一） |
| templateName    | String     | 模板名称         |
| systemType      | String     | 系统类型         |
| category        | String     | 分类             |
| description     | String     | 描述             |
| subsystemCount  | Integer    | 子系统数量       |
| totalItems      | Integer    | 总子项数         |
| totalMaterials  | Integer    | 总物料数         |
| estimatedWeight | BigDecimal | 预估总重量(kg)   |
| status          | String     | 状态             |
| isStandard      | Boolean    | 是否标准模板     |
| version         | String     | 版本号           |
| remarks         | String     | 备注             |
| createBy        | Long       | 创建人 ID        |
| createTime      | DateTime   | 创建时间         |
| updateBy        | Long       | 更新人 ID        |
| updateTime      | DateTime   | 更新时间         |

### 9.2 子系统模板 (ErpSaltSubsystemTemplate)

| 字段名           | 类型       | 说明             |
| ---------------- | ---------- | ---------------- |
| id               | Long       | 主键 ID          |
| systemTemplateId | Long       | 设备系统模板 ID  |
| templateCode     | String     | 模板编码（唯一） |
| subsystemName    | String     | 子系统名称       |
| subsystemType    | String     | 子系统类型       |
| category         | String     | 分类             |
| specification    | String     | 规格型号         |
| model            | String     | 型号             |
| manufacturer     | String     | 制造商           |
| description      | String     | 描述             |
| itemCount        | Integer    | 子项数量         |
| materialCount    | Integer    | 物料数量         |
| estimatedWeight  | BigDecimal | 预估重量(kg)     |
| sequenceNumber   | Integer    | 排序号           |
| status           | String     | 状态             |
| remarks          | String     | 备注             |

### 9.3 子项模板 (ErpSaltItemTemplate)

| 字段名               | 类型       | 说明             |
| -------------------- | ---------- | ---------------- |
| id                   | Long       | 主键 ID          |
| subsystemTemplateId  | Long       | 子系统模板 ID    |
| templateCode         | String     | 模板编码（唯一） |
| itemName             | String     | 子项名称         |
| itemType             | String     | 子项类型         |
| specification        | String     | 规格型号         |
| description          | String     | 描述             |
| defaultQuantity      | Integer    | 默认数量         |
| defaultUnit          | String     | 默认单位         |
| estimatedUnitWeight  | BigDecimal | 预估单重(kg)     |
| materialCount        | Integer    | 物料数量         |
| parentItemTemplateId | Long       | 父子项模板 ID    |
| sequenceNumber       | Integer    | 排序号           |
| status               | String     | 状态             |
| remarks              | String     | 备注             |

### 9.4 物料模板 (ErpSaltMaterialTemplate)

| 字段名              | 类型       | 说明             |
| ------------------- | ---------- | ---------------- |
| id                  | Long       | 主键 ID          |
| itemTemplateId      | Long       | 子项模板 ID      |
| templateCode        | String     | 模板编码（唯一） |
| materialCode        | String     | 物料编码         |
| materialName        | String     | 物料名称         |
| specification       | String     | 规格型号         |
| materialType        | String     | 物料类型         |
| materialCategory    | String     | 物料类别         |
| defaultQuantity     | Integer    | 默认数量         |
| defaultUnit         | String     | 默认单位         |
| estimatedUnitWeight | BigDecimal | 预估单重(kg)     |
| manufacturer        | String     | 制造商           |
| model               | String     | 型号             |
| packageType         | String     | 包装方式         |
| isFragile           | Boolean    | 是否易碎         |
| isHazardous         | Boolean    | 是否危险品       |
| storageRequirement  | String     | 存储要求         |
| sequenceNumber      | Integer    | 排序号           |
| status              | String     | 状态             |
| remarks             | String     | 备注             |

### 9.5 项目设备系统 (ErpSaltProjectEquipmentSystem)

| 字段名              | 类型       | 说明             |
| ------------------- | ---------- | ---------------- |
| id                  | Long       | 主键 ID          |
| projectId           | Long       | 项目 ID          |
| projectName         | String     | 项目名称（冗余） |
| templateId          | Long       | 模板 ID          |
| systemCode          | String     | 系统编码（唯一） |
| systemName          | String     | 系统名称         |
| systemType          | String     | 系统类型         |
| category            | String     | 分类             |
| description         | String     | 描述             |
| subsystemCount      | Integer    | 子系统数量       |
| totalItems          | Integer    | 总子项数         |
| totalMaterials      | Integer    | 总物料数         |
| totalWeight         | BigDecimal | 总重量(kg)       |
| responsiblePersonId | Long       | 负责人 ID        |
| responsiblePerson   | String     | 负责人姓名       |
| status              | String     | 状态             |
| priority            | Integer    | 优先级           |
| sequenceNumber      | Integer    | 排序号           |
| remarks             | String     | 备注             |
| version             | Integer    | 版本号（乐观锁） |
| tenantId            | String     | 租户 ID          |

### 9.6 项目子系统 (ErpSaltProjectSubsystem)

| 字段名          | 类型       | 说明               |
| --------------- | ---------- | ------------------ |
| id              | Long       | 主键 ID            |
| projectSystemId | Long       | 项目设备系统 ID    |
| projectId       | Long       | 项目 ID（冗余）    |
| templateId      | Long       | 模板 ID            |
| subsystemCode   | String     | 子系统编码（唯一） |
| subsystemName   | String     | 子系统名称         |
| subsystemType   | String     | 子系统类型         |
| category        | String     | 分类               |
| specification   | String     | 规格型号           |
| model           | String     | 型号               |
| manufacturer    | String     | 制造商             |
| description     | String     | 描述               |
| itemCount       | Integer    | 子项数量           |
| materialCount   | Integer    | 物料数量           |
| totalWeight     | BigDecimal | 总重量(kg)         |
| sequenceNumber  | Integer    | 排序号             |
| status          | String     | 状态               |
| remarks         | String     | 备注               |
| version         | Integer    | 版本号             |
| tenantId        | String     | 租户 ID            |

### 9.7 项目子项 (ErpSaltProjectItem)

| 字段名             | 类型       | 说明                    |
| ------------------ | ---------- | ----------------------- |
| id                 | Long       | 主键 ID                 |
| projectSubsystemId | Long       | 项目子系统 ID           |
| projectSystemId    | Long       | 项目设备系统 ID（冗余） |
| projectId          | Long       | 项目 ID（冗余）         |
| templateId         | Long       | 模板 ID                 |
| itemCode           | String     | 子项编码（唯一）        |
| itemName           | String     | 子项名称                |
| itemType           | String     | 子项类型                |
| specification      | String     | 规格型号                |
| description        | String     | 描述                    |
| quantity           | Integer    | 数量                    |
| unit               | String     | 单位                    |
| unitWeight         | BigDecimal | 单重(kg)                |
| totalWeight        | BigDecimal | 总重(kg)                |
| materialCount      | Integer    | 物料数量                |
| parentItemId       | Long       | 父子项 ID               |
| sequenceNumber     | Integer    | 排序号                  |
| status             | String     | 状态                    |
| remarks            | String     | 备注                    |
| version            | Integer    | 版本号                  |
| tenantId           | String     | 租户 ID                 |

### 9.8 项目物料 (ErpSaltProjectMaterial)

| 字段名             | 类型       | 说明                    |
| ------------------ | ---------- | ----------------------- |
| id                 | Long       | 主键 ID                 |
| projectItemId      | Long       | 项目子项 ID             |
| projectSubsystemId | Long       | 项目子系统 ID（冗余）   |
| projectSystemId    | Long       | 项目设备系统 ID（冗余） |
| projectId          | Long       | 项目 ID（冗余）         |
| templateId         | Long       | 模板 ID                 |
| materialId         | Long       | 基础物料 ID             |
| materialCode       | String     | 物料编码                |
| materialName       | String     | 物料名称                |
| specification      | String     | 规格型号                |
| materialType       | String     | 物料类型                |
| materialCategory   | String     | 物料类别                |
| quantity           | Integer    | 数量                    |
| unit               | String     | 单位                    |
| unitWeight         | BigDecimal | 单重(kg)                |
| totalWeight        | BigDecimal | 总重(kg)                |
| manufacturer       | String     | 制造商                  |
| model              | String     | 型号                    |
| serialNumber       | String     | 序列号                  |
| packageType        | String     | 包装方式                |
| packageQuantity    | Integer    | 包装件数                |
| isFragile          | Boolean    | 是否易碎                |
| isHazardous        | Boolean    | 是否危险品              |
| storageRequirement | String     | 存储要求                |
| status             | String     | 状态                    |
| sequenceNumber     | Integer    | 排序号                  |
| remarks            | String     | 备注                    |
| remarks1           | String     | 备注 1                  |
| remarks2           | String     | 备注 2                  |
| version            | Integer    | 版本号                  |
| tenantId           | String     | 租户 ID                 |

---

## 10. 错误码说明

| 错误码 | 说明           |
| ------ | -------------- |
| 200    | 操作成功       |
| 401    | 未授权，请登录 |
| 403    | 无权限访问     |
| 404    | 资源不存在     |
| 500    | 服务器内部错误 |
| 10001  | 参数验证失败   |
| 10002  | 业务逻辑错误   |
| 10003  | 数据已存在     |
| 10004  | 数据不存在     |

---

## 附录

### A. 枚举值说明

#### 系统类型 (systemType)

-   `SOLID`: 固态
-   `LIQUID`: 液态
-   `POWDER`: 粉盐
-   `BURNER`: 燃烧器

#### 子系统类型 (subsystemType)

-   `MECHANICAL`: 机械
-   `ELECTRICAL`: 电控
-   `PIPELINE`: 管路

#### 子项类型 (itemType)

-   `MAIN`: 主体
-   `FASTENER`: 紧固件
-   `ACCESSORY`: 附件

#### 模板状态 (status - 模板)

-   `DRAFT`: 草稿
-   `ACTIVE`: 启用
-   `ARCHIVED`: 归档

#### 项目状态 (status - 项目)

-   `DRAFT`: 草稿
-   `ACTIVE`: 活跃
-   `COMPLETED`: 已完成
-   `ARCHIVED`: 已归档

#### 物料状态 (status - 物料)

-   `NORMAL`: 正常
-   `PREPARING`: 准备中
-   `READY`: 就绪
-   `SHIPPED`: 已发货

### B. 开发联系方式

-   **技术支持**: tech@haitang-erp.com
-   **文档维护**: doc@haitang-erp.com
-   **GitHub**: https://github.com/haitang-erp/haitang-erp

---

**文档版本**: v1.0  
**最后更新**: 2025-11-07  
**维护人**: haitang 开发团队
