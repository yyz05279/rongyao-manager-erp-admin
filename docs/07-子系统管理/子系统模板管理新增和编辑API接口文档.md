# 海棠 ERP 系统 - 子系统模板管理 API 接口文档

## 目录

-   [1. 概述](#1-概述)
-   [2. 新增子系统模板接口](#2-新增子系统模板接口)
-   [3. 编辑子系统模板接口](#3-编辑子系统模板接口)
-   [4. 数据模型](#4-数据模型)
-   [5. 错误码说明](#5-错误码说明)

---

## 1. 概述

### 1.1 模块定位

子系统模板管理模块用于管理项目中的子系统模板，支持模板的创建、编辑、查询和删除等操作。模板可以作为标准配置，在创建项目子系统时快速复用。

### 1.2 基础信息

-   **模块路径**: `/erp/subsystem/template`
-   **版本**: v1.0.0
-   **认证方式**: Bearer Token
-   **数据格式**: JSON
-   **字符编码**: UTF-8

### 1.3 权限控制

所有接口都需要相应的权限控制，权限码格式：`erp:subsystem:template:{operation}`

```typescript
// 权限码列表
"erp:subsystem:template:list"; // 查看模板列表
"erp:subsystem:template:query"; // 查看模板详情
"erp:subsystem:template:add"; // 新增模板
"erp:subsystem:template:edit"; // 编辑模板
"erp:subsystem:template:remove"; // 删除模板
```

### 1.4 响应格式

所有接口统一使用以下响应格式：

```typescript
interface ApiResponse<T> {
    code: number; // 状态码：200-成功，其他-失败
    msg: string; // 响应消息
    data?: T; // 响应数据（可选）
}
```

### 1.5 HTTP 状态码说明

-   `200` - 请求成功
-   `400` - 请求参数错误
-   `401` - 未授权
-   `403` - 权限不足
-   `404` - 资源不存在
-   `500` - 服务器内部错误

---

## 2. 新增子系统模板接口

### 2.1 接口信息

**接口名称**: 新增子系统模板

**接口路径**: `POST /erp/subsystem/template`

**请求方法**: POST

**权限要求**: `erp:subsystem:template:add`

**接口描述**: 创建一个新的子系统模板，模板编号可以由系统自动生成或手动指定。

### 2.2 请求参数

**Content-Type**: `application/json`

**请求体参数**:

| 参数名           | 类型    | 必填 | 说明         | 示例值                    | 验证规则                               |
| ---------------- | ------- | ---- | ------------ | ------------------------- | -------------------------------------- |
| templateCode     | String  | 否   | 模板编号     | "TMPL20250101001"         | 不传则自动生成，传入则需保证唯一性     |
| templateName     | String  | 是   | 模板名称     | "标准输送系统模板"        | 不能为空                               |
| category         | String  | 否   | 分类         | "输送系统"                | -                                      |
| description      | String  | 否   | 描述         | "适用于标准化盐输送系统"  | -                                      |
| isStandard       | Boolean | 否   | 是否标准模板 | true                      | 默认 false                             |
| version          | String  | 否   | 版本号       | "v1.0"                    | 默认"v1.0"                             |
| status           | String  | 否   | 状态         | "DRAFT"                   | 枚举值，默认"DRAFT"                    |
| sourceProjectId  | Long    | 否   | 来源项目 ID  | 1001                      | -                                      |
| relatedProductId | Long    | 否   | 关联产品 ID  | 2001                      | -                                      |
| remarks          | String  | 否   | 备注         | "从项目 A 提炼的标准模板" | -                                      |
| items            | Array   | 否   | 子项列表     | 见下方子项对象说明        | 可选参数，用于在创建模板时同时添加子项 |

**子项对象说明（items 数组中的元素）**

| 参数名         | 类型       | 必填 | 说明        | 示例值     | 验证规则                       |
| -------------- | ---------- | ---- | ----------- | ---------- | ------------------------------ |
| itemTemplateId | Long       | 是   | 子项模板 ID | 1          | 必须是有效的子项模板 ID        |
| sequenceNumber | Integer    | 否   | 排序号      | 1          | 用于控制子项在模板中的显示顺序 |
| quantity       | BigDecimal | 否   | 默认数量    | 2.5        | 该子项在模板中的默认数量       |
| isRequired     | Boolean    | 否   | 是否必需    | true       | 标识该子项是否为必需项         |
| remarks        | String     | 否   | 备注        | "重要子项" | 该子项在模板中的特殊说明       |

**状态枚举值**:

-   `DRAFT` - 草稿（默认值）
-   `ACTIVE` - 启用
-   `INACTIVE` - 停用
-   `ARCHIVED` - 归档

### 2.3 请求示例

**示例 1：仅创建模板（不包含子项）**

```json
{
    "templateName": "标准输送系统模板",
    "category": "输送系统",
    "description": "适用于标准化盐输送系统，包含平面输送机、提升机等设备",
    "isStandard": true,
    "version": "v1.0",
    "status": "DRAFT",
    "sourceProjectId": 1001,
    "remarks": "从项目A提炼的标准模板"
}
```

**示例 2：创建模板并同时添加子项**

```json
{
    "templateName": "标准输送系统模板",
    "category": "输送系统",
    "description": "适用于标准化盐输送系统，包含平面输送机、提升机等设备",
    "isStandard": true,
    "version": "v1.0",
    "status": "DRAFT",
    "sourceProjectId": 1001,
    "remarks": "从项目A提炼的标准模板",
    "items": [
        {
            "itemTemplateId": 1,
            "sequenceNumber": 1,
            "quantity": 2,
            "isRequired": true,
            "remarks": "主要输送设备"
        },
        {
            "itemTemplateId": 2,
            "sequenceNumber": 2,
            "quantity": 1,
            "isRequired": true,
            "remarks": "提升设备"
        },
        {
            "itemTemplateId": 3,
            "sequenceNumber": 3,
            "quantity": 1,
            "isRequired": false,
            "remarks": "备用设备"
        }
    ]
}
```

### 2.4 响应参数

**成功响应**:

| 参数名 | 类型   | 说明                 |
| ------ | ------ | -------------------- |
| code   | Number | 状态码，200 表示成功 |
| msg    | String | 响应消息             |
| data   | Object | 创建成功的模板对象   |

**data 对象字段说明**:

| 字段名           | 类型    | 说明         | 备注                           |
| ---------------- | ------- | ------------ | ------------------------------ |
| id               | Long    | 主键 ID      | 新创建的模板 ID                |
| templateCode     | String  | 模板编号     | 系统生成或用户指定             |
| templateName     | String  | 模板名称     | -                              |
| category         | String  | 分类         | -                              |
| description      | String  | 描述         | -                              |
| isStandard       | Boolean | 是否标准模板 | -                              |
| version          | String  | 版本号       | -                              |
| status           | String  | 状态         | DRAFT/ACTIVE/INACTIVE/ARCHIVED |
| totalItems       | Integer | 总子项数     | 初始为 0                       |
| totalMaterials   | Integer | 总物料数     | 初始为 0                       |
| sourceProjectId  | Long    | 来源项目 ID  | -                              |
| relatedProductId | Long    | 关联产品 ID  | -                              |
| remarks          | String  | 备注         | -                              |
| createTime       | String  | 创建时间     | ISO 8601 格式                  |
| createBy         | String  | 创建人       | 用户名                         |
| createByName     | String  | 创建人姓名   | -                              |
| updateTime       | String  | 更新时间     | ISO 8601 格式                  |
| updateBy         | String  | 更新人       | 用户名                         |
| updateByName     | String  | 更新人姓名   | -                              |

### 2.5 响应示例

**成功响应**:

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": 1,
        "templateCode": "TMPL20250113001",
        "templateName": "标准输送系统模板",
        "category": "输送系统",
        "description": "适用于标准化盐输送系统，包含平面输送机、提升机等设备",
        "isStandard": true,
        "version": "v1.0",
        "status": "DRAFT",
        "totalItems": 0,
        "totalMaterials": 0,
        "sourceProjectId": 1001,
        "relatedProductId": null,
        "remarks": "从项目A提炼的标准模板",
        "createTime": "2025-01-13T10:30:00",
        "createBy": "admin",
        "createByName": "系统管理员",
        "updateTime": "2025-01-13T10:30:00",
        "updateBy": "admin",
        "updateByName": "系统管理员"
    }
}
```

**失败响应示例**:

1. 参数验证失败

```json
{
    "code": 400,
    "msg": "模板名称不能为空"
}
```

2. 模板编号重复

```json
{
    "code": 500,
    "msg": "模板编号已存在"
}
```

3. 权限不足

```json
{
    "code": 403,
    "msg": "权限不足"
}
```

### 2.6 注意事项

1. **模板编号生成规则**:

    - 如果不传`templateCode`，系统会自动生成格式为`TMPL{YYYYMMDD}{序号}`的编号
    - 如果传入`templateCode`，系统会校验唯一性，重复则返回错误

2. **默认值处理**:

    - `status`默认为`DRAFT`（草稿）
    - `isStandard`默认为`false`
    - `version`默认为`v1.0`
    - `totalItems`和`totalMaterials`初始化为 0

3. **子项列表处理**:

    - `items`参数为可选，如果不传入则只创建模板基本信息
    - 如果传入`items`数组，系统会在创建模板后自动批量添加子项
    - 子项中的`itemTemplateId`必须是有效的子项模板 ID，否则会报错
    - 子项添加失败会导致整个事务回滚，确保数据一致性
    - 子项的`templateId`字段无需传入，系统会自动设置为新创建的模板 ID

4. **业务规则**:

    - 模板名称必填，不能为空
    - 创建成功后会自动记录创建人和创建时间
    - 支持防重复提交机制

5. **响应数据说明**:
    - 创建成功后会返回完整的模板对象，包含系统自动生成的字段（如 ID、创建时间等）
    - 返回的数据只包含模板基本信息，不包含关联的子项明细和物料列表
    - 如需获取子项和物料信息，请调用专门的查询接口（如`GET /erp/subsystem/template/{id}/items`）
    - 前端可以直接使用返回的模板对象进行后续操作，无需再次查询

---

## 3. 编辑子系统模板接口

### 3.1 接口信息

**接口名称**: 编辑子系统模板

**接口路径**: `PUT /erp/subsystem/template`

**请求方法**: PUT

**权限要求**: `erp:subsystem:template:edit`

**接口描述**: 更新已存在的子系统模板信息。

### 3.2 请求参数

**Content-Type**: `application/json`

**请求体参数**:

| 参数名           | 类型    | 必填 | 说明         | 示例值                | 验证规则                               |
| ---------------- | ------- | ---- | ------------ | --------------------- | -------------------------------------- |
| id               | Long    | 是   | 主键 ID      | 1                     | 必填，用于定位要修改的模板             |
| templateCode     | String  | 否   | 模板编号     | "TMPL20250101001"     | 如修改需保证唯一性                     |
| templateName     | String  | 是   | 模板名称     | "标准输送系统模板 V2" | 不能为空                               |
| category         | String  | 否   | 分类         | "输送系统"            | -                                      |
| description      | String  | 否   | 描述         | "更新后的描述"        | -                                      |
| isStandard       | Boolean | 否   | 是否标准模板 | true                  | -                                      |
| version          | String  | 否   | 版本号       | "v2.0"                | -                                      |
| status           | String  | 否   | 状态         | "ACTIVE"              | 枚举值：DRAFT/ACTIVE/INACTIVE/ARCHIVED |
| sourceProjectId  | Long    | 否   | 来源项目 ID  | 1001                  | -                                      |
| relatedProductId | Long    | 否   | 关联产品 ID  | 2001                  | -                                      |
| remarks          | String  | 否   | 备注         | "更新备注信息"        | -                                      |
| items            | Array   | 否   | 子项列表     | 见下方子项对象说明    | 可选参数，用于在编辑模板时同时更新子项 |

**子项对象说明（items 数组中的元素）**

| 参数名         | 类型       | 必填 | 说明        | 示例值     | 验证规则                       |
| -------------- | ---------- | ---- | ----------- | ---------- | ------------------------------ |
| itemTemplateId | Long       | 是   | 子项模板 ID | 1          | 必须是有效的子项模板 ID        |
| sequenceNumber | Integer    | 否   | 排序号      | 1          | 用于控制子项在模板中的显示顺序 |
| quantity       | BigDecimal | 否   | 默认数量    | 2.5        | 该子项在模板中的默认数量       |
| isRequired     | Boolean    | 否   | 是否必需    | true       | 标识该子项是否为必需项         |
| remarks        | String     | 否   | 备注        | "重要子项" | 该子项在模板中的特殊说明       |

### 3.3 请求示例

**示例 1：仅更新模板基本信息（不包含子项）**

```json
{
    "id": 1,
    "templateName": "标准输送系统模板V2",
    "category": "输送系统",
    "description": "更新后的标准化盐输送系统模板，优化了设备配置",
    "isStandard": true,
    "version": "v2.0",
    "status": "ACTIVE",
    "remarks": "根据实际使用情况优化后的版本"
}
```

**示例 2：更新模板并同时更新子项列表**

```json
{
    "id": 1,
    "templateName": "标准输送系统模板V2",
    "category": "输送系统",
    "description": "更新后的标准化盐输送系统模板，优化了设备配置",
    "isStandard": true,
    "version": "v2.0",
    "status": "ACTIVE",
    "remarks": "根据实际使用情况优化后的版本",
    "items": [
        {
            "itemTemplateId": 1,
            "sequenceNumber": 1,
            "quantity": 3,
            "isRequired": true,
            "remarks": "增加数量至3台"
        },
        {
            "itemTemplateId": 2,
            "sequenceNumber": 2,
            "quantity": 2,
            "isRequired": true,
            "remarks": "增加备用设备"
        }
    ]
}
```

### 3.4 响应参数

**成功响应**:

| 参数名 | 类型   | 说明                 |
| ------ | ------ | -------------------- |
| code   | Number | 状态码，200 表示成功 |
| msg    | String | 响应消息             |

### 3.5 响应示例

**成功响应**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**失败响应示例**:

1. 模板不存在

```json
{
    "code": 404,
    "msg": "模板不存在"
}
```

2. 参数验证失败

```json
{
    "code": 400,
    "msg": "主键ID不能为空"
}
```

3. 模板编号重复

```json
{
    "code": 500,
    "msg": "模板编号已存在"
}
```

4. 权限不足

```json
{
    "code": 403,
    "msg": "权限不足"
}
```

### 3.6 注意事项

1. **必填字段**:

    - `id`字段必填，用于定位要修改的模板
    - `templateName`必填，不能为空

2. **唯一性校验**:

    - 如果修改了`templateCode`，系统会校验新编号的唯一性
    - 校验时会排除当前记录本身

3. **子项列表处理**:

    - `items`参数为可选，如果不传入则只更新模板基本信息
    - 如果传入`items`数组，系统会在更新模板后批量添加子项
    - 注意：当前实现为追加模式，会在现有子项基础上添加新子项
    - 如需完全替换子项列表，建议先删除原有子项再添加新子项
    - 子项中的`itemTemplateId`必须是有效的子项模板 ID
    - 子项的`templateId`字段无需传入，系统会自动设置

4. **业务规则**:

    - 只更新传入的字段，未传入的字段保持原值
    - 更新成功后会自动记录更新人和更新时间
    - 支持防重复提交机制

5. **状态变更**:
    - 可以通过修改`status`字段来变更模板状态
    - 建议状态变更流程：DRAFT → ACTIVE → INACTIVE → ARCHIVED

---

## 4. 数据模型

### 4.1 子系统模板业务对象 (ErpSubsystemTemplateNewBo)

```typescript
interface ErpSubsystemTemplateNewBo {
    id?: number; // 主键ID（编辑时必填）
    templateCode?: string; // 模板编号（不传则自动生成）
    templateName: string; // 模板名称（必填）
    category?: string; // 分类
    description?: string; // 描述
    isStandard?: boolean; // 是否标准模板（默认false）
    version?: string; // 版本号（默认v1.0）
    status?: string; // 状态（默认DRAFT）
    sourceProjectId?: number; // 来源项目ID
    relatedProductId?: number; // 关联产品ID
    remarks?: string; // 备注
    items?: ErpSubsystemTemplateItemRelBo[]; // 子项列表（可选）

    // 以下字段由系统自动维护，前端无需传入
    totalItems?: number; // 总子项数
    totalMaterials?: number; // 总物料数
    createTime?: string; // 创建时间
    updateTime?: string; // 更新时间
    createBy?: string; // 创建人
    updateBy?: string; // 更新人
}

// 子项关联对象
interface ErpSubsystemTemplateItemRelBo {
    itemTemplateId: number; // 子项模板ID（必填）
    sequenceNumber?: number; // 排序号
    quantity?: number; // 默认数量
    isRequired?: boolean; // 是否必需
    remarks?: string; // 备注
}
```

### 4.2 状态枚举

```typescript
enum TemplateStatus {
    DRAFT = "DRAFT", // 草稿
    ACTIVE = "ACTIVE", // 启用
    INACTIVE = "INACTIVE", // 停用
    ARCHIVED = "ARCHIVED", // 归档
}
```

### 4.3 字段说明

| 字段名           | 类型    | 说明         | 备注                                   |
| ---------------- | ------- | ------------ | -------------------------------------- |
| id               | Long    | 主键 ID      | 编辑时必填                             |
| templateCode     | String  | 模板编号     | 格式：TMPL{YYYYMMDD}{序号}             |
| templateName     | String  | 模板名称     | 必填，最大长度 100                     |
| category         | String  | 分类         | 用于模板分类管理                       |
| description      | String  | 描述         | 详细说明模板用途                       |
| isStandard       | Boolean | 是否标准模板 | 标准模板可作为通用模板使用             |
| version          | String  | 版本号       | 用于版本管理                           |
| totalItems       | Integer | 总子项数     | 系统自动统计                           |
| totalMaterials   | Integer | 总物料数     | 系统自动统计                           |
| status           | String  | 状态         | 枚举值：DRAFT/ACTIVE/INACTIVE/ARCHIVED |
| sourceProjectId  | Long    | 来源项目 ID  | 记录模板来源                           |
| relatedProductId | Long    | 关联产品 ID  | 关联的产品信息                         |
| remarks          | String  | 备注         | 其他说明信息                           |

---

## 5. 错误码说明

### 5.1 通用错误码

| 错误码 | 说明           | 解决方案                 |
| ------ | -------------- | ------------------------ |
| 200    | 操作成功       | -                        |
| 400    | 请求参数错误   | 检查请求参数是否符合要求 |
| 401    | 未授权         | 检查 Token 是否有效      |
| 403    | 权限不足       | 检查用户是否有相应权限   |
| 404    | 资源不存在     | 检查资源 ID 是否正确     |
| 500    | 服务器内部错误 | 联系技术支持             |

### 5.2 业务错误码

| 错误信息           | 说明               | 解决方案                         |
| ------------------ | ------------------ | -------------------------------- |
| "模板名称不能为空" | 必填字段验证失败   | 确保传入 templateName 字段       |
| "主键 ID 不能为空" | 编辑时未传入 ID    | 编辑操作必须传入 id 字段         |
| "模板编号已存在"   | 模板编号重复       | 更换模板编号或不传让系统自动生成 |
| "模板不存在"       | 根据 ID 未找到模板 | 检查模板 ID 是否正确             |

---

## 6. 前端调用示例

### 6.1 TypeScript 接口定义

```typescript
// api/subsystem/template.ts

import request from "@/utils/request";

/**
 * 子系统模板表单数据
 */
export interface TemplateForm {
    id?: number;
    templateCode?: string;
    templateName: string;
    category?: string;
    description?: string;
    isStandard?: boolean;
    version?: string;
    status?: string;
    sourceProjectId?: number;
    relatedProductId?: number;
    remarks?: string;
}

/**
 * 子系统模板视图对象
 */
export interface TemplateVO {
    id: number;
    templateCode: string;
    templateName: string;
    category?: string;
    description?: string;
    isStandard: boolean;
    version: string;
    status: string;
    totalItems: number;
    totalMaterials: number;
    sourceProjectId?: number;
    relatedProductId?: number;
    remarks?: string;
    createTime: string;
    createBy: string;
    createByName?: string;
    updateTime: string;
    updateBy: string;
    updateByName?: string;
}

/**
 * 新增子系统模板
 * @param data 模板表单数据
 * @returns 返回创建成功的模板对象
 */
export const addTemplate = (data: TemplateForm): Promise<TemplateVO> => {
    return request({
        url: "/erp/subsystem/template",
        method: "post",
        data: data,
    });
};

/**
 * 修改子系统模板
 * @param data 模板表单数据
 * @returns 返回操作结果
 */
export const updateTemplate = (data: TemplateForm): Promise<void> => {
    return request({
        url: "/erp/subsystem/template",
        method: "put",
        data: data,
    });
};
```

### 6.2 Vue3 组件调用示例

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
    addTemplate,
    updateTemplate,
    type TemplateForm,
    type TemplateVO,
} from "@/api/subsystem/template";
import { ElMessage } from "element-plus";

const formData = ref<TemplateForm>({
    templateName: "",
    category: "",
    description: "",
    isStandard: false,
    version: "v1.0",
    status: "DRAFT",
    items: [], // 子项列表
});

// 新创建的模板对象
const createdTemplate = ref<TemplateVO | null>(null);

// 新增模板（不包含子项）
const handleAdd = async () => {
    try {
        // 调用新增接口，返回创建成功的模板对象
        const template = await addTemplate(formData.value);
        createdTemplate.value = template;

        ElMessage.success("新增成功");

        // 可以直接使用返回的模板对象
        console.log("新创建的模板ID:", template.id);
        console.log("模板编号:", template.templateCode);

        // 例如：跳转到详情页
        // router.push(`/subsystem/template/${template.id}`);
    } catch (error) {
        ElMessage.error("新增失败");
    }
};

// 新增模板并同时添加子项
const handleAddWithItems = async () => {
    try {
        // 设置子项列表
        formData.value.items = [
            {
                itemTemplateId: 1,
                sequenceNumber: 1,
                quantity: 2,
                isRequired: true,
                remarks: "主要设备",
            },
            {
                itemTemplateId: 2,
                sequenceNumber: 2,
                quantity: 1,
                isRequired: true,
                remarks: "辅助设备",
            },
        ];

        // 调用新增接口，返回创建成功的模板对象
        const template = await addTemplate(formData.value);
        createdTemplate.value = template;

        ElMessage.success("新增成功，已同时添加子项");

        console.log("新创建的模板ID:", template.id);
        console.log("模板编号:", template.templateCode);
    } catch (error) {
        ElMessage.error("新增失败");
    }
};

// 编辑模板
const handleEdit = async (id: number) => {
    try {
        const data = { ...formData.value, id };
        await updateTemplate(data);
        ElMessage.success("更新成功");
    } catch (error) {
        ElMessage.error("更新失败");
    }
};
</script>
```

---

## 7. 测试用例

### 7.1 新增模板测试

**测试场景 1：正常新增**

```bash
curl -X POST 'http://localhost/dev-api/erp/subsystem/template' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {token}' \
  -d '{
    "templateName": "测试模板",
    "category": "测试分类",
    "description": "这是一个测试模板",
    "isStandard": true,
    "status": "DRAFT"
  }'
```

**测试场景 2：缺少必填字段**

```bash
curl -X POST 'http://localhost/dev-api/erp/subsystem/template' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {token}' \
  -d '{
    "category": "测试分类"
  }'
# 预期返回：{"code": 400, "msg": "模板名称不能为空"}
```

### 7.2 编辑模板测试

**测试场景 1：正常编辑**

```bash
curl -X PUT 'http://localhost/dev-api/erp/subsystem/template' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {token}' \
  -d '{
    "id": 1,
    "templateName": "更新后的模板名称",
    "status": "ACTIVE"
  }'
```

**测试场景 2：模板不存在**

```bash
curl -X PUT 'http://localhost/dev-api/erp/subsystem/template' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {token}' \
  -d '{
    "id": 99999,
    "templateName": "不存在的模板"
  }'
# 预期返回：{"code": 404, "msg": "模板不存在"}
```

---

## 8. 常见问题 FAQ

### Q1: 模板编号是否必须传入？

**A**: 不是必须的。如果不传入`templateCode`，系统会自动生成格式为`TMPL{YYYYMMDD}{序号}`的编号。如果传入，需要保证唯一性。

### Q2: 如何将模板状态从草稿变更为启用？

**A**: 调用编辑接口，传入模板 ID 和新的状态值：

```json
{
    "id": 1,
    "templateName": "模板名称",
    "status": "ACTIVE"
}
```

### Q3: 编辑时是否需要传入所有字段？

**A**: 不需要。只需要传入`id`（必填）、`templateName`（必填）和需要修改的字段即可，未传入的字段会保持原值。

### Q4: totalItems 和 totalMaterials 字段如何更新？

**A**: 这两个字段由系统自动维护，当添加或删除子项和物料时会自动更新，前端无需传入。

### Q5: 如何区分标准模板和普通模板？

**A**: 通过`isStandard`字段区分。标准模板（`isStandard: true`）可以作为通用模板在多个项目中使用。

---

## 9. 更新日志

| 版本   | 日期       | 更新内容                         | 作者    |
| ------ | ---------- | -------------------------------- | ------- |
| v1.0.0 | 2025-11-13 | 初始版本，包含新增和编辑接口文档 | haitang |

---

## 10. 联系方式

如有问题或建议，请联系：

-   **技术支持**: support@haitang-erp.com
-   **文档维护**: dev@haitang-erp.com
