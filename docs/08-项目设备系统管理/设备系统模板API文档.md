# 设备系统模板管理 API 接口文档

## 文档版本

-   **版本号**: v1.2
-   **更新日期**: 2025-01-12
-   **更新内容**:
    -   v1.2: 支持两种子系统模板选择方式（引用已存在模板 + 新建模板）
    -   v1.1: 修改新增/编辑接口，要求传入至少一个子系统模板信息，实现数据隔离

## 接口概述

设备系统模板管理模块提供设备系统模板的增删改查功能，支持模板化管理设备系统配置。

**基础路径**: `/erp/saltprocess/equipmentSystemTemplate`

---

## 1. 查询设备系统模板列表

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/list`
-   **请求方式**: `GET`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

### 请求参数

| 参数名       | 类型    | 必填 | 说明                                   |
| ------------ | ------- | ---- | -------------------------------------- |
| pageNum      | Integer | 否   | 页码，默认 1                           |
| pageSize     | Integer | 否   | 每页数量，默认 10                      |
| templateCode | String  | 否   | 模板编码（模糊查询）                   |
| templateName | String  | 否   | 模板名称（模糊查询）                   |
| systemType   | String  | 否   | 系统类型（SOLID/LIQUID/POWDER/BURNER） |
| status       | String  | 否   | 状态（DRAFT/ACTIVE/ARCHIVED）          |
| isStandard   | Boolean | 否   | 是否标准模板                           |

### 响应示例

```json
{
    "code": 200,
    "msg": "查询成功",
    "rows": [
        {
            "id": 1,
            "templateCode": "SYS_SOLID_001",
            "templateName": "固态处理厂标准模板",
            "systemType": "SOLID",
            "category": "处理厂",
            "description": "固态处理厂标准配置模板",
            "subsystemCount": 3,
            "totalItems": 15,
            "totalMaterials": 50,
            "estimatedWeight": 1500.5,
            "status": "ACTIVE",
            "isStandard": true,
            "version": "1.0",
            "createTime": "2025-01-10 10:00:00",
            "updateTime": "2025-01-10 10:00:00"
        }
    ],
    "total": 1
}
```

---

## 2. 获取设备系统模板详情

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/{id}`
-   **请求方式**: `GET`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:query`

### 路径参数

| 参数名 | 类型 | 必填 | 说明    |
| ------ | ---- | ---- | ------- |
| id     | Long | 是   | 模板 ID |

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "templateCode": "SYS_SOLID_001",
        "templateName": "固态处理厂标准模板",
        "systemType": "SOLID",
        "category": "处理厂",
        "description": "固态处理厂标准配置模板",
        "subsystemCount": 3,
        "totalItems": 15,
        "totalMaterials": 50,
        "estimatedWeight": 1500.5,
        "status": "ACTIVE",
        "isStandard": true,
        "version": "1.0",
        "remarks": "标准模板，不建议修改",
        "createTime": "2025-01-10 10:00:00",
        "updateTime": "2025-01-10 10:00:00"
    }
}
```

---

## 3. 新增设备系统模板 ⭐️ (已修改)

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate`
-   **请求方式**: `POST`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:add`
-   **Content-Type**: `application/json`

### ⚠️ 重要变更说明

**版本 v1.2 更新内容**：

1. **支持两种子系统模板选择方式**：

    - **方式一：引用已存在的独立子系统模板**（推荐）
        - 传入 `referenceTemplateId` 字段，指向已存在的独立子系统模板 ID
        - 后端会复制该模板的数据创建新记录（数据隔离）
        - 可选择性覆盖部分字段（如 `sequenceNumber`、`remarks`）
    - **方式二：新建子系统模板**
        - 不传入 `referenceTemplateId`，传入完整的子系统模板信息
        - 必须提供 `subsystemName` 等必填字段
    - **混合使用**：可以在同一个设备系统模板中同时使用两种方式

2. **数据完全隔离**：

    - 无论使用哪种方式，都会创建新的子系统模板记录
    - 引用已存在模板时，会复制数据而不是直接关联
    - 修改设备系统模板中的子系统不会影响原始独立子系统模板

3. **自动字段处理**：
    - `systemTemplateId`：由后端自动设置，前端无需传入
    - `templateCode`：后端会自动生成新的编码（确保数据隔离）

### 请求参数

| 参数名                 | 类型    | 必填   | 说明                                      |
| ---------------------- | ------- | ------ | ----------------------------------------- |
| templateCode           | String  | 是     | 模板编码（最大 50 字符，唯一）            |
| templateName           | String  | 是     | 模板名称（最大 100 字符）                 |
| systemType             | String  | 是     | 系统类型（SOLID/LIQUID/POWDER/BURNER）    |
| category               | String  | 否     | 分类（最大 50 字符）                      |
| description            | String  | 否     | 描述（最大 500 字符）                     |
| status                 | String  | 否     | 状态（DRAFT/ACTIVE/ARCHIVED），默认 DRAFT |
| isStandard             | Boolean | 否     | 是否标准模板，默认 false                  |
| version                | String  | 否     | 版本号（最大 20 字符）                    |
| remarks                | String  | 否     | 备注（最大 500 字符）                     |
| **subsystemTemplates** | Array   | **是** | **子系统模板列表（至少 1 个）**           |

### subsystemTemplates 子系统模板对象结构

#### 方式一：引用已存在的独立子系统模板（推荐）

| 参数名                  | 类型    | 必填   | 说明                                                                        |
| ----------------------- | ------- | ------ | --------------------------------------------------------------------------- |
| **referenceTemplateId** | Long    | **是** | **引用的独立子系统模板 ID**（必须是独立模板，不能是设备系统模板中的子系统） |
| sequenceNumber          | Integer | 否     | 排序号（可覆盖引用模板的排序号）                                            |
| remarks                 | String  | 否     | 备注（可覆盖引用模板的备注，最大 500 字符）                                 |

**说明**：

-   使用此方式时，只需传入 `referenceTemplateId`，后端会自动复制该模板的所有数据
-   可选择性传入 `sequenceNumber` 和 `remarks` 来覆盖引用模板的对应字段
-   其他字段（如 `subsystemName`、`subsystemType` 等）会从引用模板中复制，无需传入

#### 方式二：新建子系统模板

| 参数名         | 类型    | 必填   | 说明                                         |
| -------------- | ------- | ------ | -------------------------------------------- |
| subsystemName  | String  | **是** | 子系统名称（最大 100 字符）                  |
| subsystemType  | String  | 否     | 子系统类型（MECHANICAL/ELECTRICAL/PIPELINE） |
| category       | String  | 否     | 子系统分类（最大 50 字符）                   |
| specification  | String  | 否     | 规格型号（最大 500 字符）                    |
| model          | String  | 否     | 型号（最大 100 字符）                        |
| manufacturer   | String  | 否     | 制造商（最大 100 字符）                      |
| description    | String  | 否     | 描述（最大 500 字符）                        |
| sequenceNumber | Integer | 否     | 排序号（默认 0）                             |
| status         | String  | 否     | 状态（最大 20 字符）                         |
| remarks        | String  | 否     | 备注（最大 500 字符）                        |

**说明**：

-   使用此方式时，不传入 `referenceTemplateId`
-   必须提供 `subsystemName` 字段
-   其他字段根据需要选择性传入

### 请求示例

#### 示例 1：混合使用两种方式（推荐）

```json
{
    "templateCode": "SYS_SOLID_002",
    "templateName": "固态处理厂模板V2",
    "systemType": "SOLID",
    "category": "处理厂",
    "description": "固态处理厂配置模板第二版",
    "status": "DRAFT",
    "isStandard": false,
    "version": "2.0",
    "remarks": "测试模板",
    "subsystemTemplates": [
        {
            "referenceTemplateId": 101,
            "sequenceNumber": 1,
            "remarks": "引用标准平面输送机模板"
        },
        {
            "referenceTemplateId": 102,
            "sequenceNumber": 2,
            "remarks": "引用标准子输送模板"
        },
        {
            "subsystemName": "定制粉碎机",
            "subsystemType": "MECHANICAL",
            "category": "粉碎设备",
            "specification": "型号：CR-500-CUSTOM",
            "model": "CR-500-CUSTOM",
            "manufacturer": "海棠机械",
            "description": "定制粉碎机本体",
            "sequenceNumber": 3,
            "status": "ACTIVE",
            "remarks": "客户定制设备"
        }
    ]
}
```

**说明**：

-   前两个子系统使用方式一（引用已存在模板 ID: 101 和 102）
-   第三个子系统使用方式二（新建定制子系统）
-   这种混合方式可以快速复用标准模板，同时支持定制化需求

#### 示例 2：仅使用引用方式

```json
{
    "templateCode": "SYS_SOLID_003",
    "templateName": "固态处理厂标准模板",
    "systemType": "SOLID",
    "category": "处理厂",
    "description": "完全使用标准子系统模板",
    "status": "ACTIVE",
    "isStandard": true,
    "version": "1.0",
    "subsystemTemplates": [
        {
            "referenceTemplateId": 101,
            "sequenceNumber": 1
        },
        {
            "referenceTemplateId": 102,
            "sequenceNumber": 2
        },
        {
            "referenceTemplateId": 103,
            "sequenceNumber": 3
        }
    ]
}
```

#### 示例 3：仅使用新建方式

```json
{
    "templateCode": "SYS_SOLID_004",
    "templateName": "固态处理厂定制模板",
    "systemType": "SOLID",
    "category": "处理厂",
    "description": "完全定制的子系统配置",
    "status": "DRAFT",
    "isStandard": false,
    "version": "1.0",
    "subsystemTemplates": [
        {
            "subsystemName": "平面输送机",
            "subsystemType": "MECHANICAL",
            "category": "输送设备",
            "specification": "型号：PT-1000",
            "model": "PT-1000",
            "manufacturer": "海棠机械",
            "description": "平面输送机系统",
            "sequenceNumber": 1,
            "status": "ACTIVE",
            "remarks": "主要输送设备"
        },
        {
            "subsystemName": "粉碎机",
            "subsystemType": "MECHANICAL",
            "category": "粉碎设备",
            "specification": "型号：CR-500",
            "model": "CR-500",
            "manufacturer": "海棠机械",
            "description": "粉碎机本体",
            "sequenceNumber": 2,
            "status": "ACTIVE",
            "remarks": "辅助设备"
        }
    ]
}
```

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 业务逻辑说明

1. **子系统模板创建**：

    - 系统会为每个子系统模板自动生成 `templateCode`（如果未提供）
    - 自动设置 `systemTemplateId` 关联到当前设备系统模板
    - 创建的子系统模板数据存储在 `erp_salt_subsystem_template` 表中

2. **数据隔离**：

    - 设备系统模板中的子系统模板与独立子系统模板完全隔离
    - 修改设备系统模板中的子系统不会影响独立子系统模板数据

3. **统计信息自动更新**：
    - `subsystemCount`：自动统计子系统数量
    - `totalItems`：自动统计所有子系统的子项总数
    - `totalMaterials`：自动统计所有子系统的物料总数

### 错误响应

```json
{
    "code": 500,
    "msg": "至少需要一个子系统模板"
}
```

---

## 4. 修改设备系统模板 ⭐️ (已修改)

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate`
-   **请求方式**: `PUT`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:edit`
-   **Content-Type**: `application/json`

### ⚠️ 重要变更说明

**版本 v1.2 更新内容**：

1. **支持两种子系统模板选择方式**（与新增接口相同）：

    - **方式一：引用已存在的独立子系统模板**（推荐）
    - **方式二：新建子系统模板**
    - **混合使用**：可以在同一个设备系统模板中同时使用两种方式

2. **数据完全隔离**：

    - 修改时会删除旧的子系统模板记录，创建新的子系统模板记录
    - 无论使用哪种方式，都会创建新的子系统模板记录
    - 引用已存在模板时，会复制数据而不是直接关联

3. **不影响独立子系统模板**：
    - 修改操作只影响当前设备系统模板关联的子系统
    - 不会修改独立子系统模板数据库中的数据

### 请求参数

| 参数名                 | 类型    | 必填   | 说明                                   |
| ---------------------- | ------- | ------ | -------------------------------------- |
| **id**                 | Long    | **是** | **模板 ID（必须提供）**                |
| templateCode           | String  | 是     | 模板编码（最大 50 字符）               |
| templateName           | String  | 是     | 模板名称（最大 100 字符）              |
| systemType             | String  | 是     | 系统类型（SOLID/LIQUID/POWDER/BURNER） |
| category               | String  | 否     | 分类（最大 50 字符）                   |
| description            | String  | 否     | 描述（最大 500 字符）                  |
| status                 | String  | 否     | 状态（DRAFT/ACTIVE/ARCHIVED）          |
| isStandard             | Boolean | 否     | 是否标准模板                           |
| version                | String  | 否     | 版本号（最大 20 字符）                 |
| remarks                | String  | 否     | 备注（最大 500 字符）                  |
| **subsystemTemplates** | Array   | **是** | **子系统模板列表（至少 1 个）**        |

### subsystemTemplates 子系统模板对象结构

参数结构与新增接口相同，参见 [3. 新增设备系统模板](#3-新增设备系统模板--已修改) 章节。

### 请求示例

#### 示例：混合使用两种方式更新子系统

```json
{
    "id": 1,
    "templateCode": "SYS_SOLID_001",
    "templateName": "固态处理厂标准模板（已更新）",
    "systemType": "SOLID",
    "category": "处理厂",
    "description": "固态处理厂标准配置模板-更新版",
    "status": "ACTIVE",
    "isStandard": true,
    "version": "1.1",
    "remarks": "更新了子系统配置",
    "subsystemTemplates": [
        {
            "referenceTemplateId": 105,
            "sequenceNumber": 1,
            "remarks": "引用升级版平面输送机模板"
        },
        {
            "referenceTemplateId": 102,
            "sequenceNumber": 2,
            "remarks": "保持使用标准子输送模板"
        },
        {
            "subsystemName": "粉碎机（定制升级版）",
            "subsystemType": "MECHANICAL",
            "category": "粉碎设备",
            "specification": "型号：CR-800",
            "model": "CR-800",
            "manufacturer": "海棠机械",
            "description": "升级版粉碎机本体",
            "sequenceNumber": 3,
            "status": "ACTIVE",
            "remarks": "客户要求升级到CR-800型号"
        }
    ]
}
```

**说明**：

-   编辑时会删除原有的所有子系统模板记录
-   根据新传入的 `subsystemTemplates` 创建新的子系统模板记录
-   可以混合使用引用和新建两种方式
-   更多请求示例参见 [3. 新增设备系统模板](#3-新增设备系统模板--已修改) 章节

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 业务逻辑说明

1. **子系统模板更新策略**：

    - **删除旧数据**：删除原有的所有子系统模板记录
    - **创建新数据**：根据请求中的 `subsystemTemplates` 创建新的子系统模板记录
    - **数据隔离**：确保不会影响独立子系统模板数据库中的数据

2. **统计信息自动更新**：

    - 更新后自动重新计算 `subsystemCount`、`totalItems`、`totalMaterials`

3. **CASCADE 删除**：
    - 如果删除设备系统模板，会自动删除关联的所有子系统模板记录

---

## 5. 删除设备系统模板

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/{ids}`
-   **请求方式**: `DELETE`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:remove`

### 路径参数

| 参数名 | 类型   | 必填 | 说明                             |
| ------ | ------ | ---- | -------------------------------- |
| ids    | Long[] | 是   | 模板 ID 数组，多个 ID 用逗号分隔 |

### 请求示例

```
DELETE /erp/saltprocess/equipmentSystemTemplate/1,2,3
```

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 业务逻辑说明

-   删除设备系统模板时，会通过 CASCADE 外键约束自动删除关联的所有子系统模板记录
-   不会影响独立子系统模板数据库中的数据

---

## 6. 查询标准模板列表

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/standard`
-   **请求方式**: `GET`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": 1,
            "templateCode": "SYS_SOLID_001",
            "templateName": "固态处理厂标准模板",
            "systemType": "SOLID",
            "isStandard": true,
            "status": "ACTIVE"
        }
    ]
}
```

---

## 7. 查询启用状态的模板列表

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/active`
-   **请求方式**: `GET`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": 1,
            "templateCode": "SYS_SOLID_001",
            "templateName": "固态处理厂标准模板",
            "systemType": "SOLID",
            "status": "ACTIVE"
        }
    ]
}
```

---

## 8. 根据系统类型查询模板列表

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/systemType/{systemType}`
-   **请求方式**: `GET`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:list`

### 路径参数

| 参数名     | 类型   | 必填 | 说明                                   |
| ---------- | ------ | ---- | -------------------------------------- |
| systemType | String | 是   | 系统类型（SOLID/LIQUID/POWDER/BURNER） |

### 请求示例

```
GET /erp/saltprocess/equipmentSystemTemplate/systemType/SOLID
```

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": 1,
            "templateCode": "SYS_SOLID_001",
            "templateName": "固态处理厂标准模板",
            "systemType": "SOLID",
            "status": "ACTIVE"
        }
    ]
}
```

---

## 9. 根据模板编码获取模板信息

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/code/{templateCode}`
-   **请求方式**: `GET`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:query`

### 路径参数

| 参数名       | 类型   | 必填 | 说明     |
| ------------ | ------ | ---- | -------- |
| templateCode | String | 是   | 模板编码 |

### 请求示例

```
GET /erp/saltprocess/equipmentSystemTemplate/code/SYS_SOLID_001
```

### 响应示例

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "templateCode": "SYS_SOLID_001",
        "templateName": "固态处理厂标准模板",
        "systemType": "SOLID",
        "status": "ACTIVE"
    }
}
```

---

## 10. 导出设备系统模板列表

### 接口信息

-   **接口路径**: `/erp/saltprocess/equipmentSystemTemplate/export`
-   **请求方式**: `POST`
-   **权限标识**: `erp:saltprocess:equipmentSystemTemplate:export`

### 请求参数

查询参数与列表接口相同。

### 响应

返回 Excel 文件流。

---

## 附录

### A. 系统类型枚举

| 值     | 说明         |
| ------ | ------------ |
| SOLID  | 固态处理厂   |
| LIQUID | 液态处理厂   |
| POWDER | 粉盐设备系统 |
| BURNER | 燃烧器系统   |

### B. 状态枚举

| 值       | 说明 |
| -------- | ---- |
| DRAFT    | 草稿 |
| ACTIVE   | 启用 |
| ARCHIVED | 归档 |

### C. 子系统类型枚举

| 值         | 说明     |
| ---------- | -------- |
| MECHANICAL | 机械设备 |
| ELECTRICAL | 电控设备 |
| PIPELINE   | 管路设备 |

---

## 前端开发注意事项

### 1. TypeScript 接口定义（v1.2 更新）

```typescript
// 子系统模板表单接口（支持两种方式）
interface SubsystemTemplateForm {
    // 方式一：引用已存在的独立子系统模板
    referenceTemplateId?: number; // 引用的独立子系统模板ID

    // 方式二：新建子系统模板（当不使用referenceTemplateId时必填）
    subsystemName?: string; // 子系统名称
    subsystemType?: string;
    category?: string;
    specification?: string;
    model?: string;
    manufacturer?: string;
    description?: string;
    status?: string;

    // 通用字段（两种方式都可用）
    sequenceNumber?: number; // 排序号
    remarks?: string; // 备注
}

// 设备系统模板表单接口
interface EquipmentSystemTemplateForm {
    id?: number; // 编辑时必填
    templateCode: string;
    templateName: string;
    systemType: string;
    category?: string;
    description?: string;
    status?: string;
    isStandard?: boolean;
    version?: string;
    remarks?: string;
    subsystemTemplates: SubsystemTemplateForm[]; // 至少1个
}

// 独立子系统模板查询接口（用于下拉选择）
interface IndependentSubsystemTemplate {
    id: number;
    templateCode: string;
    subsystemName: string;
    subsystemType?: string;
    category?: string;
    specification?: string;
    model?: string;
    manufacturer?: string;
    description?: string;
}
```

### 2. 新增/编辑表单设计（v1.2 更新）

前端需要设计支持两种子系统模板选择方式的表单：

#### 表单 UI 设计建议

```vue
<template>
    <el-form :model="form" :rules="rules">
        <!-- 设备系统模板基本信息 -->
        <el-form-item label="模板编码" prop="templateCode">
            <el-input v-model="form.templateCode" />
        </el-form-item>
        <!-- 其他基本信息字段... -->

        <!-- 子系统模板列表 -->
        <el-form-item label="子系统模板" prop="subsystemTemplates">
            <div
                v-for="(item, index) in form.subsystemTemplates"
                :key="index"
                class="subsystem-item"
            >
                <!-- 选择方式：引用 or 新建 -->
                <el-radio-group
                    v-model="item.mode"
                    @change="handleModeChange(item, index)"
                >
                    <el-radio label="reference">引用已存在模板</el-radio>
                    <el-radio label="create">新建子系统模板</el-radio>
                </el-radio-group>

                <!-- 方式一：引用已存在模板 -->
                <div v-if="item.mode === 'reference'">
                    <el-select
                        v-model="item.referenceTemplateId"
                        placeholder="选择子系统模板"
                        filterable
                    >
                        <el-option
                            v-for="template in independentTemplates"
                            :key="template.id"
                            :label="`${template.subsystemName} (${template.templateCode})`"
                            :value="template.id"
                        >
                            <span>{{ template.subsystemName }}</span>
                            <span style="color: #8492a6; font-size: 13px">{{
                                template.specification
                            }}</span>
                        </el-option>
                    </el-select>
                    <el-input-number
                        v-model="item.sequenceNumber"
                        placeholder="排序号"
                    />
                    <el-input v-model="item.remarks" placeholder="备注" />
                </div>

                <!-- 方式二：新建子系统模板 -->
                <div v-else>
                    <el-input
                        v-model="item.subsystemName"
                        placeholder="子系统名称"
                    />
                    <el-select
                        v-model="item.subsystemType"
                        placeholder="子系统类型"
                    >
                        <el-option label="机械设备" value="MECHANICAL" />
                        <el-option label="电控设备" value="ELECTRICAL" />
                        <el-option label="管路设备" value="PIPELINE" />
                    </el-select>
                    <!-- 其他字段... -->
                </div>

                <!-- 删除按钮 -->
                <el-button
                    type="danger"
                    @click="removeSubsystem(index)"
                    :disabled="form.subsystemTemplates.length === 1"
                >
                    删除
                </el-button>
            </div>

            <!-- 添加子系统按钮 -->
            <el-button type="primary" @click="addSubsystem"
                >添加子系统</el-button
            >
        </el-form-item>
    </el-form>
</template>
```

### 2. 表单验证规则

```typescript
const rules = {
    templateCode: [
        { required: true, message: "请输入模板编码", trigger: "blur" },
        { max: 50, message: "模板编码长度不能超过50个字符", trigger: "blur" },
    ],
    templateName: [
        { required: true, message: "请输入模板名称", trigger: "blur" },
        { max: 100, message: "模板名称长度不能超过100个字符", trigger: "blur" },
    ],
    systemType: [
        { required: true, message: "请选择系统类型", trigger: "change" },
    ],
    subsystemTemplates: [
        {
            type: "array",
            required: true,
            min: 1,
            message: "至少需要添加一个子系统模板",
            trigger: "change",
        },
    ],
};
```

### 3. 前端逻辑代码示例（v1.2 更新）

```typescript
import { ref, onMounted } from "vue";
import { listSubsystemTemplate } from "@/api/erp/saltprocess/subsystemTemplate";
import {
    addEquipmentSystemTemplate,
    editEquipmentSystemTemplate,
} from "@/api/erp/saltprocess/equipmentSystemTemplate";

// 独立子系统模板列表（用于下拉选择）
const independentTemplates = ref<IndependentSubsystemTemplate[]>([]);

// 表单数据
const form = ref<EquipmentSystemTemplateForm>({
    templateCode: "",
    templateName: "",
    systemType: "",
    subsystemTemplates: [
        {
            mode: "reference", // 默认使用引用方式
            referenceTemplateId: undefined,
            sequenceNumber: 1,
        },
    ],
});

// 加载独立子系统模板列表
const loadIndependentTemplates = async () => {
    try {
        // 查询systemTemplateId为null的独立子系统模板
        const response = await listSubsystemTemplate({
            systemTemplateId: null,
        });
        independentTemplates.value = response.rows;
    } catch (error) {
        ElMessage.error("加载子系统模板列表失败");
    }
};

// 添加子系统
const addSubsystem = () => {
    form.value.subsystemTemplates.push({
        mode: "reference",
        referenceTemplateId: undefined,
        sequenceNumber: form.value.subsystemTemplates.length + 1,
    });
};

// 删除子系统
const removeSubsystem = (index: number) => {
    if (form.value.subsystemTemplates.length > 1) {
        form.value.subsystemTemplates.splice(index, 1);
    } else {
        ElMessage.warning("至少需要保留一个子系统模板");
    }
};

// 切换模式时清空数据
const handleModeChange = (item: SubsystemTemplateForm, index: number) => {
    if (item.mode === "reference") {
        // 切换到引用模式，清空新建模式的字段
        delete item.subsystemName;
        delete item.subsystemType;
        delete item.category;
        delete item.specification;
        delete item.model;
        delete item.manufacturer;
        delete item.description;
        delete item.status;
    } else {
        // 切换到新建模式，清空引用模式的字段
        delete item.referenceTemplateId;
    }
};

// 提交前数据处理
const prepareSubmitData = (formData: EquipmentSystemTemplateForm) => {
    // 移除mode字段（仅用于前端UI控制）
    const submitData = {
        ...formData,
        subsystemTemplates: formData.subsystemTemplates.map((item) => {
            const { mode, ...rest } = item as any;
            return rest;
        }),
    };
    return submitData;
};

// 新增
const handleAdd = async () => {
    try {
        const submitData = prepareSubmitData(form.value);
        await addEquipmentSystemTemplate(submitData);
        ElMessage.success("新增成功");
    } catch (error) {
        ElMessage.error("新增失败");
    }
};

// 编辑
const handleEdit = async () => {
    try {
        const submitData = prepareSubmitData(form.value);
        await editEquipmentSystemTemplate(submitData);
        ElMessage.success("修改成功");
    } catch (error) {
        ElMessage.error("修改失败");
    }
};

// 页面加载时获取独立子系统模板列表
onMounted(() => {
    loadIndependentTemplates();
});
```

### 4. 关键功能说明

#### 4.1 查询独立子系统模板

前端需要调用子系统模板列表接口，查询 `systemTemplateId` 为 `null` 的独立子系统模板：

```typescript
// API调用示例
const response = await listSubsystemTemplate({
    systemTemplateId: null, // 关键：查询独立模板
    pageNum: 1,
    pageSize: 100,
});
```

#### 4.2 数据提交格式

提交时需要根据用户选择的方式构造不同的数据结构：

**引用方式**：

```json
{
    "referenceTemplateId": 101,
    "sequenceNumber": 1,
    "remarks": "引用标准模板"
}
```

**新建方式**：

```json
{
    "subsystemName": "定制子系统",
    "subsystemType": "MECHANICAL",
    "specification": "型号：CUSTOM-001",
    "sequenceNumber": 2
}
```

#### 4.3 数据隔离说明

前端开发人员需要理解：

-   无论选择哪种方式，后端都会创建新的子系统模板记录
-   引用已存在模板时，后端会复制数据而不是直接关联
-   修改设备系统模板中的子系统不会影响原始独立子系统模板

---

## 更新日志

### v1.2 (2025-01-12)

-   🎉 **重大功能更新**：支持两种子系统模板选择方式
    -   ✅ 方式一：引用已存在的独立子系统模板（推荐）
    -   ✅ 方式二：新建子系统模板
    -   ✅ 混合使用：可以在同一个设备系统模板中同时使用两种方式
-   🔧 **后端实现**：
    -   新增 `referenceTemplateId` 字段支持引用模式
    -   实现数据复制机制，确保数据隔离
    -   优化 `createSubsystemTemplates()` 方法，支持两种模式
    -   新增 `copyFromReferenceTemplate()` 辅助方法
-   📝 **文档更新**：
    -   更新接口文档，添加三种请求示例（混合、纯引用、纯新建）
    -   更新前端开发指南，提供完整的 Vue 组件示例
    -   添加 TypeScript 接口定义和前端逻辑代码示例
    -   详细说明数据隔离机制和使用场景

### v1.1 (2025-01-12)

-   ⭐️ **重要更新**：修改新增/编辑接口，要求传入至少一个子系统模板信息
-   ⭐️ **数据隔离**：确保设备系统模板中的子系统模板与独立子系统模板完全隔离
-   📝 更新了接口文档，添加了详细的请求示例和业务逻辑说明
-   📝 添加了前端开发注意事项章节

### v1.0 (2025-01-10)

-   初始版本发布
-   提供基础的 CRUD 接口

---

**文档维护**: 海棠 ERP 开发团队
**联系方式**: dev@haitang-erp.com
