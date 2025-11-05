# 子系统模板管理 API 文档

## 文档信息

-   **模块名称**: 子系统模板管理
-   **基础路径**: `/erp/subsystem/template`
-   **版本**: v1.0
-   **更新日期**: 2025 年 11 月 5 日

---

## 目录

1. [数据模型](#数据模型)
2. [接口列表](#接口列表)
3. [接口详情](#接口详情)
4. [业务规则](#业务规则)
5. [错误码说明](#错误码说明)
6. [使用示例](#使用示例)

---

## 数据模型

### 模板状态枚举

| 状态值     | 说明 | 描述           |
| ---------- | ---- | -------------- |
| `DRAFT`    | 草稿 | 初始创建状态   |
| `ACTIVE`   | 启用 | 可用于创建项目 |
| `INACTIVE` | 停用 | 暂时不可用     |
| `ARCHIVED` | 归档 | 已归档         |

### 子系统模板对象 (TemplateVO)

```typescript
interface SubsystemTemplateVO {
    id: number; // 主键ID
    templateCode: string; // 模板编号
    templateName: string; // 模板名称
    category?: string; // 分类
    description?: string; // 描述
    isStandard?: boolean; // 是否标准模板
    version?: string; // 版本号
    status: string; // 状态：DRAFT/ACTIVE/INACTIVE/ARCHIVED
    sourceProjectId?: number; // 来源项目ID
    relatedProductId?: number; // 关联产品ID
    totalItems?: number; // 子项总数
    totalMaterials?: number; // 物料总数
    remarks?: string; // 备注
    createTime?: string; // 创建时间
    updateTime?: string; // 更新时间
    createBy?: string; // 创建人
    updateBy?: string; // 更新人
}
```

### 子系统模板表单对象 (TemplateForm)

```typescript
interface SubsystemTemplateForm {
    id?: number; // 主键ID（修改时必填）
    templateCode?: string; // 模板编号（可选，不传则自动生成）
    templateName: string; // 模板名称（必填）
    category?: string; // 分类
    description?: string; // 描述
    isStandard?: boolean; // 是否标准模板
    version?: string; // 版本号
    status?: string; // 状态
    sourceProjectId?: number; // 来源项目ID
    relatedProductId?: number; // 关联产品ID
    remarks?: string; // 备注
}
```

### 查询参数对象 (TemplateQuery)

```typescript
interface SubsystemTemplateQuery {
    templateCode?: string; // 模板编号（模糊查询）
    templateName?: string; // 模板名称（模糊查询）
    category?: string; // 分类（精确查询）
    status?: string; // 状态（精确查询）
    isStandard?: boolean; // 是否标准模板
    pageNum?: number; // 页码
    pageSize?: number; // 每页数量
}
```

---

## 接口列表

| 序号 | 接口名称     | 请求方式 | 接口路径         | 权限标识                        |
| ---- | ------------ | -------- | ---------------- | ------------------------------- |
| 1    | 查询模板列表 | GET      | `/list`          | `erp:subsystem:template:list`   |
| 2    | 查询模板详情 | GET      | `/{id}`          | `erp:subsystem:template:query`  |
| 3    | 新增模板     | POST     | `/`              | `erp:subsystem:template:add`    |
| 4    | 修改模板     | PUT      | `/`              | `erp:subsystem:template:edit`   |
| 5    | 删除模板     | DELETE   | `/{ids}`         | `erp:subsystem:template:remove` |
| 6    | 复制模板     | POST     | `/copy/{id}`     | `erp:subsystem:template:add`    |
| 7    | 发布模板     | PUT      | `/publish/{id}`  | `erp:subsystem:template:edit`   |
| 8    | 导出模板列表 | POST     | `/export`        | `erp:subsystem:template:export` |
| 9    | 生成模板编号 | GET      | `/generate-code` | 无                              |

---

## 接口详情

### 1. 查询模板列表

**接口地址**: `GET /erp/subsystem/template/list`

**接口描述**: 分页查询子系统模板列表，支持多条件组合查询

**权限标识**: `erp:subsystem:template:list`

**请求参数**:

| 参数名       | 类型    | 必填 | 说明                 |
| ------------ | ------- | ---- | -------------------- |
| templateCode | string  | 否   | 模板编号（模糊查询） |
| templateName | string  | 否   | 模板名称（模糊查询） |
| category     | string  | 否   | 分类（精确查询）     |
| status       | string  | 否   | 状态（精确查询）     |
| isStandard   | boolean | 否   | 是否标准模板         |
| pageNum      | number  | 否   | 页码，默认 1         |
| pageSize     | number  | 否   | 每页数量，默认 10    |

**请求示例**:

```bash
GET /erp/subsystem/template/list?templateName=处理厂&status=ACTIVE&pageNum=1&pageSize=10
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": {
        "rows": [
            {
                "id": 1,
                "templateCode": "TPL-SS-20251105-001",
                "templateName": "固态处理厂标准模板",
                "category": "解析系统",
                "description": "固态处理厂标准配置",
                "isStandard": true,
                "version": "v1.0",
                "status": "ACTIVE",
                "totalItems": 15,
                "totalMaterials": 120,
                "remarks": "通用模板",
                "createTime": "2025-11-05 10:00:00",
                "updateTime": "2025-11-05 10:00:00",
                "createBy": "admin",
                "updateBy": "admin"
            }
        ],
        "total": 1
    }
}
```

---

### 2. 查询模板详情

**接口地址**: `GET /erp/subsystem/template/{id}`

**接口描述**: 根据模板 ID 查询详细信息

**权限标识**: `erp:subsystem:template:query`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明    |
| ------ | ------ | ---- | ------- |
| id     | number | 是   | 模板 ID |

**请求示例**:

```bash
GET /erp/subsystem/template/1
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": {
        "id": 1,
        "templateCode": "TPL-SS-20251105-001",
        "templateName": "固态处理厂标准模板",
        "category": "解析系统",
        "description": "固态处理厂标准配置",
        "isStandard": true,
        "version": "v1.0",
        "status": "ACTIVE",
        "sourceProjectId": 100,
        "relatedProductId": 200,
        "totalItems": 15,
        "totalMaterials": 120,
        "remarks": "通用模板",
        "createTime": "2025-11-05 10:00:00",
        "updateTime": "2025-11-05 10:00:00",
        "createBy": "admin",
        "updateBy": "admin"
    }
}
```

---

### 3. 新增模板

**接口地址**: `POST /erp/subsystem/template`

**接口描述**: 创建新的子系统模板

**权限标识**: `erp:subsystem:template:add`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子系统模板 - 新增）

**请求头**:

```
Content-Type: application/json
```

**请求体参数**:

| 参数名           | 类型    | 必填 | 说明                       |
| ---------------- | ------- | ---- | -------------------------- |
| templateCode     | string  | 否   | 模板编号（不传则自动生成） |
| templateName     | string  | 是   | 模板名称                   |
| category         | string  | 否   | 分类                       |
| description      | string  | 否   | 描述                       |
| isStandard       | boolean | 否   | 是否标准模板，默认 false   |
| version          | string  | 否   | 版本号，默认 v1.0          |
| status           | string  | 否   | 状态，默认 DRAFT           |
| sourceProjectId  | number  | 否   | 来源项目 ID                |
| relatedProductId | number  | 否   | 关联产品 ID                |
| remarks          | string  | 否   | 备注                       |

**请求示例**:

```json
{
    "templateName": "固态处理厂标准模板",
    "category": "解析系统",
    "description": "固态处理厂标准配置，包含完整的工艺流程",
    "isStandard": true,
    "status": "DRAFT",
    "remarks": "从淮安项目提取的标准模板"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**业务规则**:

1. `templateName` 为必填项
2. `templateCode` 不传时，系统自动生成格式为 `TPL-SS-yyyyMMdd-xxx` 的唯一编号
3. 如果传入 `templateCode`，系统会校验唯一性，重复则返回错误
4. `status` 不传时默认为 `DRAFT`（草稿）
5. `isStandard` 不传时默认为 `false`
6. `version` 不传时默认为 `v1.0`
7. 新建模板时，`totalItems` 和 `totalMaterials` 初始化为 0

---

### 4. 修改模板

**接口地址**: `PUT /erp/subsystem/template`

**接口描述**: 修改子系统模板信息

**权限标识**: `erp:subsystem:template:edit`

**防重复提交**: ✅ 启用

**业务日志**: ✅ 记录（子系统模板 - 修改）

**请求头**:

```
Content-Type: application/json
```

**请求体参数**:

| 参数名           | 类型    | 必填 | 说明         |
| ---------------- | ------- | ---- | ------------ |
| id               | number  | 是   | 模板 ID      |
| templateCode     | string  | 否   | 模板编号     |
| templateName     | string  | 是   | 模板名称     |
| category         | string  | 否   | 分类         |
| description      | string  | 否   | 描述         |
| isStandard       | boolean | 否   | 是否标准模板 |
| version          | string  | 否   | 版本号       |
| status           | string  | 否   | 状态         |
| sourceProjectId  | number  | 否   | 来源项目 ID  |
| relatedProductId | number  | 否   | 关联产品 ID  |
| remarks          | string  | 否   | 备注         |

**请求示例**:

```json
{
    "id": 1,
    "templateCode": "TPL-SS-20251105-001",
    "templateName": "固态处理厂标准模板 v2.0",
    "category": "解析系统",
    "description": "固态处理厂标准配置（更新版）",
    "isStandard": true,
    "version": "v2.0",
    "status": "ACTIVE",
    "remarks": "更新了部分配置参数"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**业务规则**:

1. `id` 和 `templateName` 为必填项
2. 如果修改 `templateCode`，系统会校验唯一性（排除自身）
3. 不能修改已发布（ACTIVE）模板的核心配置，建议先停用或创建新版本

---

### 5. 删除模板

**接口地址**: `DELETE /erp/subsystem/template/{ids}`

**接口描述**: 批量删除子系统模板

**权限标识**: `erp:subsystem:template:remove`

**业务日志**: ✅ 记录（子系统模板 - 删除）

**路径参数**:

| 参数名 | 类型   | 必填 | 说明                         |
| ------ | ------ | ---- | ---------------------------- |
| ids    | string | 是   | 模板 ID 列表，多个用逗号分隔 |

**请求示例**:

```bash
DELETE /erp/subsystem/template/1,2,3
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**业务规则**:

1. 支持批量删除
2. 已被项目引用的模板不能删除（TODO: 待实现校验）
3. 标准模板（`isStandard=true`）删除需要特殊权限（TODO: 待实现）

---

### 6. 复制模板

**接口地址**: `POST /erp/subsystem/template/copy/{id}`

**接口描述**: 复制现有模板创建新模板

**权限标识**: `erp:subsystem:template:add`

**业务日志**: ✅ 记录（复制子系统模板 - 新增）

**路径参数**:

| 参数名 | 类型   | 必填 | 说明      |
| ------ | ------ | ---- | --------- |
| id     | number | 是   | 源模板 ID |

**请求示例**:

```bash
POST /erp/subsystem/template/copy/1
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "复制成功",
    "data": 10
}
```

**返回数据说明**:

-   `data`: 新创建的模板 ID

**业务规则**:

1. 复制源模板的所有配置信息
2. 自动生成新的 `templateCode`
3. 模板名称自动添加 "-副本" 后缀
4. 新模板状态设置为 `DRAFT`（草稿）
5. 清空创建时间和更新时间
6. TODO: 同时复制关联的子项和物料配置

---

### 7. 发布模板

**接口地址**: `PUT /erp/subsystem/template/publish/{id}`

**接口描述**: 发布模板，将状态改为启用

**权限标识**: `erp:subsystem:template:edit`

**业务日志**: ✅ 记录（发布子系统模板 - 修改）

**路径参数**:

| 参数名 | 类型   | 必填 | 说明    |
| ------ | ------ | ---- | ------- |
| id     | number | 是   | 模板 ID |

**请求示例**:

```bash
PUT /erp/subsystem/template/publish/1
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

**业务规则**:

1. 将模板状态从 `DRAFT` 改为 `ACTIVE`
2. 发布后的模板可用于创建项目子系统
3. TODO: 发布前需要校验模板配置完整性

---

### 8. 导出模板列表

**接口地址**: `POST /erp/subsystem/template/export`

**接口描述**: 导出模板列表为 Excel 文件

**权限标识**: `erp:subsystem:template:export`

**业务日志**: ✅ 记录（子系统模板 - 导出）

**请求头**:

```
Content-Type: application/json
```

**请求体参数**: 同查询列表参数

**请求示例**:

```json
{
    "status": "ACTIVE",
    "category": "解析系统"
}
```

**响应**: Excel 文件流

**响应头**:

```
Content-Type: application/vnd.ms-excel
Content-Disposition: attachment; filename=subsystem_template_20251105.xlsx
```

---

### 9. 生成模板编号

**接口地址**: `GET /erp/subsystem/template/generate-code`

**接口描述**: 生成唯一的模板编号

**权限标识**: 无

**请求示例**:

```bash
GET /erp/subsystem/template/generate-code
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "生成成功",
    "data": "TPL-SS-20251105-001"
}
```

**编号规则**:

-   格式: `TPL-SS-yyyyMMdd-序号`
-   `TPL`: Template（模板）
-   `SS`: Subsystem（子系统）
-   `yyyyMMdd`: 年月日
-   `序号`: 当天的顺序号，3 位数字，从 001 开始

**示例**:

-   `TPL-SS-20251105-001` - 2025 年 11 月 5 日第 1 个模板
-   `TPL-SS-20251105-002` - 2025 年 11 月 5 日第 2 个模板

**说明**:

-   此接口仅用于预览，实际新增时不传 `templateCode` 即可自动生成
-   系统会确保生成的编号唯一

---

## 业务规则

### 1. 模板编号规则

1. **自动生成**: 新增模板时不传 `templateCode`，系统自动生成
2. **格式规范**: `TPL-SS-yyyyMMdd-xxx`（xxx 为 3 位序号）
3. **唯一性**: 系统自动校验编号唯一性
4. **不可修改**: 建议模板创建后不要修改编号

### 2. 模板状态流转

```
DRAFT (草稿) ──发布──> ACTIVE (启用)
     │                    │
     └──────────────停用──┘
                          │
                    INACTIVE (停用)
                          │
                        归档
                          │
                    ARCHIVED (归档)
```

**状态说明**:

-   **DRAFT**: 初始状态，可以任意修改
-   **ACTIVE**: 已发布，可用于创建项目，建议不要修改核心配置
-   **INACTIVE**: 已停用，暂时不可用
-   **ARCHIVED**: 已归档，不可修改和使用

### 3. 标准模板管理

1. 标准模板（`isStandard=true`）由系统管理员维护
2. 标准模板可以被普通用户复制使用
3. 标准模板的删除和修改需要特殊权限（TODO）

### 4. 版本管理

1. 每个模板支持版本号管理
2. 建议使用语义化版本号：`v1.0`、`v1.1`、`v2.0`
3. 修改模板配置时建议更新版本号

---

## 错误码说明

| 错误码 | 错误信息         | 说明                  | 解决方案                         |
| ------ | ---------------- | --------------------- | -------------------------------- |
| 500    | 模板名称不能为空 | 未传递 templateName   | 确保请求包含 templateName 字段   |
| 500    | 模板编号已存在   | templateCode 重复     | 不传 templateCode 或使用其他编号 |
| 500    | 模板不存在       | 查询/操作的模板不存在 | 检查模板 ID 是否正确             |
| 500    | 源模板不存在     | 复制时源模板不存在    | 检查源模板 ID 是否正确           |
| 401    | 未授权           | 未登录或 token 过期   | 重新登录获取 token               |
| 403    | 无权限           | 缺少操作权限          | 联系管理员分配权限               |

---

## 使用示例

### TypeScript API 定义

```typescript
import request from "@/utils/request";

/**
 * 子系统模板表单对象
 */
export interface SubsystemTemplateForm {
    id?: number;
    templateCode?: string;
    templateName: string;
    category?: string;
    description?: string;
    status?: string;
    isStandard?: boolean;
    version?: string;
    sourceProjectId?: number;
    relatedProductId?: number;
    remarks?: string;
}

/**
 * 子系统模板查询对象
 */
export interface SubsystemTemplateQuery {
    templateCode?: string;
    templateName?: string;
    category?: string;
    status?: string;
    isStandard?: boolean;
    pageNum?: number;
    pageSize?: number;
}

/**
 * 生成模板编号
 */
export const generateTemplateCode = () => {
    return request({
        url: "/erp/subsystem/template/generate-code",
        method: "get",
    });
};

/**
 * 查询模板列表
 */
export const listTemplate = (query?: SubsystemTemplateQuery) => {
    return request({
        url: "/erp/subsystem/template/list",
        method: "get",
        params: query,
    });
};

/**
 * 查询模板详情
 */
export const getTemplate = (id: number) => {
    return request({
        url: `/erp/subsystem/template/${id}`,
        method: "get",
    });
};

/**
 * 新增模板
 */
export const addTemplate = (data: SubsystemTemplateForm) => {
    return request({
        url: "/erp/subsystem/template",
        method: "post",
        data: data,
    });
};

/**
 * 修改模板
 */
export const updateTemplate = (data: SubsystemTemplateForm) => {
    return request({
        url: "/erp/subsystem/template",
        method: "put",
        data: data,
    });
};

/**
 * 删除模板
 */
export const delTemplate = (ids: number | number[]) => {
    const idStr = Array.isArray(ids) ? ids.join(",") : String(ids);
    return request({
        url: `/erp/subsystem/template/${idStr}`,
        method: "delete",
    });
};

/**
 * 复制模板
 */
export const copyTemplate = (id: number) => {
    return request({
        url: `/erp/subsystem/template/copy/${id}`,
        method: "post",
    });
};

/**
 * 发布模板
 */
export const publishTemplate = (id: number) => {
    return request({
        url: `/erp/subsystem/template/publish/${id}`,
        method: "put",
    });
};

/**
 * 导出模板
 */
export const exportTemplate = (query?: SubsystemTemplateQuery) => {
    return request({
        url: "/erp/subsystem/template/export",
        method: "post",
        data: query,
        responseType: "blob",
    });
};
```

### Vue 3 组件使用示例

```vue
<template>
    <div class="subsystem-template">
        <!-- 查询表单 -->
        <el-form :model="queryForm" :inline="true">
            <el-form-item label="模板名称">
                <el-input
                    v-model="queryForm.templateName"
                    placeholder="请输入模板名称"
                    clearable
                />
            </el-form-item>
            <el-form-item label="状态">
                <el-select
                    v-model="queryForm.status"
                    placeholder="请选择状态"
                    clearable
                >
                    <el-option label="草稿" value="DRAFT" />
                    <el-option label="启用" value="ACTIVE" />
                    <el-option label="停用" value="INACTIVE" />
                    <el-option label="归档" value="ARCHIVED" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <el-row :gutter="10" class="mb-4">
            <el-col :span="1.5">
                <el-button type="primary" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" @click="handleExport">导出</el-button>
            </el-col>
        </el-row>

        <!-- 数据表格 -->
        <el-table :data="tableData" border>
            <el-table-column prop="templateCode" label="模板编号" width="180" />
            <el-table-column prop="templateName" label="模板名称" width="200" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                    <el-tag v-if="row.status === 'DRAFT'" type="info"
                        >草稿</el-tag
                    >
                    <el-tag v-else-if="row.status === 'ACTIVE'" type="success"
                        >启用</el-tag
                    >
                    <el-tag v-else-if="row.status === 'INACTIVE'" type="warning"
                        >停用</el-tag
                    >
                    <el-tag v-else-if="row.status === 'ARCHIVED'" type="danger"
                        >归档</el-tag
                    >
                </template>
            </el-table-column>
            <el-table-column prop="isStandard" label="标准模板" width="100">
                <template #default="{ row }">
                    <el-tag v-if="row.isStandard" type="success">是</el-tag>
                    <el-tag v-else type="info">否</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="300" fixed="right">
                <template #default="{ row }">
                    <el-button link type="primary" @click="handleView(row)"
                        >详情</el-button
                    >
                    <el-button link type="primary" @click="handleEdit(row)"
                        >编辑</el-button
                    >
                    <el-button link type="primary" @click="handleCopy(row)"
                        >复制</el-button
                    >
                    <el-button
                        v-if="row.status === 'DRAFT'"
                        link
                        type="success"
                        @click="handlePublish(row)"
                    >
                        发布
                    </el-button>
                    <el-button link type="danger" @click="handleDelete(row)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            v-model:current-page="queryForm.pageNum"
            v-model:page-size="queryForm.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleQuery"
            @current-change="handleQuery"
        />

        <!-- 新增/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
            <el-form
                :model="form"
                :rules="rules"
                ref="formRef"
                label-width="100px"
            >
                <el-form-item label="模板编号" prop="templateCode">
                    <el-input
                        v-model="form.templateCode"
                        placeholder="留空自动生成"
                        disabled
                    />
                </el-form-item>
                <el-form-item label="模板名称" prop="templateName">
                    <el-input
                        v-model="form.templateName"
                        placeholder="请输入模板名称"
                    />
                </el-form-item>
                <el-form-item label="分类" prop="category">
                    <el-input
                        v-model="form.category"
                        placeholder="请输入分类"
                    />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input
                        v-model="form.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入描述"
                    />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择状态">
                        <el-option label="草稿" value="DRAFT" />
                        <el-option label="启用" value="ACTIVE" />
                        <el-option label="停用" value="INACTIVE" />
                        <el-option label="归档" value="ARCHIVED" />
                    </el-select>
                </el-form-item>
                <el-form-item label="标准模板" prop="isStandard">
                    <el-switch v-model="form.isStandard" />
                </el-form-item>
                <el-form-item label="版本号" prop="version">
                    <el-input v-model="form.version" placeholder="如: v1.0" />
                </el-form-item>
                <el-form-item label="备注" prop="remarks">
                    <el-input
                        v-model="form.remarks"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入备注"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
    listTemplate,
    addTemplate,
    updateTemplate,
    delTemplate,
    copyTemplate,
    publishTemplate,
    exportTemplate,
    type SubsystemTemplateForm,
    type SubsystemTemplateQuery,
} from "@/api/subsystem/template";

// 查询表单
const queryForm = reactive<SubsystemTemplateQuery>({
    templateName: "",
    status: "",
    pageNum: 1,
    pageSize: 10,
});

// 表格数据
const tableData = ref([]);
const total = ref(0);

// 对话框
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref();

// 表单数据
const form = reactive<SubsystemTemplateForm>({
    templateName: "",
    category: "",
    description: "",
    status: "DRAFT",
    isStandard: false,
    version: "v1.0",
    remarks: "",
});

// 表单验证规则
const rules = {
    templateName: [
        { required: true, message: "模板名称不能为空", trigger: "blur" },
    ],
};

// 查询列表
const handleQuery = async () => {
    try {
        const { data } = await listTemplate(queryForm);
        tableData.value = data.rows;
        total.value = data.total;
    } catch (error) {
        ElMessage.error("查询失败");
    }
};

// 重置查询
const handleReset = () => {
    queryForm.templateName = "";
    queryForm.status = "";
    queryForm.pageNum = 1;
    handleQuery();
};

// 新增
const handleAdd = () => {
    dialogTitle.value = "新增模板";
    dialogVisible.value = true;
    Object.assign(form, {
        templateName: "",
        category: "",
        description: "",
        status: "DRAFT",
        isStandard: false,
        version: "v1.0",
        remarks: "",
    });
};

// 编辑
const handleEdit = (row: any) => {
    dialogTitle.value = "编辑模板";
    dialogVisible.value = true;
    Object.assign(form, row);
};

// 查看详情
const handleView = (row: any) => {
    // 跳转到详情页或打开详情对话框
    console.log("查看详情", row);
};

// 提交表单
const handleSubmit = async () => {
    await formRef.value.validate();

    try {
        if (form.id) {
            await updateTemplate(form);
            ElMessage.success("修改成功");
        } else {
            await addTemplate(form);
            ElMessage.success("新增成功");
        }
        dialogVisible.value = false;
        handleQuery();
    } catch (error) {
        ElMessage.error("操作失败");
    }
};

// 复制
const handleCopy = async (row: any) => {
    try {
        await ElMessageBox.confirm("确认复制该模板吗？", "提示", {
            type: "warning",
        });
        await copyTemplate(row.id);
        ElMessage.success("复制成功");
        handleQuery();
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("复制失败");
        }
    }
};

// 发布
const handlePublish = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            "确认发布该模板吗？发布后可用于创建项目",
            "提示",
            {
                type: "warning",
            }
        );
        await publishTemplate(row.id);
        ElMessage.success("发布成功");
        handleQuery();
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("发布失败");
        }
    }
};

// 删除
const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm("确认删除该模板吗？", "提示", {
            type: "warning",
        });
        await delTemplate(row.id);
        ElMessage.success("删除成功");
        handleQuery();
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("删除失败");
        }
    }
};

// 导出
const handleExport = async () => {
    try {
        await exportTemplate(queryForm);
        ElMessage.success("导出成功");
    } catch (error) {
        ElMessage.error("导出失败");
    }
};

// 初始化
onMounted(() => {
    handleQuery();
});
</script>

<style scoped>
.mb-4 {
    margin-bottom: 16px;
}
</style>
```

---

## 附录

### A. 完整的 cURL 测试命令

```bash
# 1. 生成编号
curl -X GET "http://localhost:8080/erp/subsystem/template/generate-code" \
  -H "Authorization: Bearer {token}"

# 2. 新增模板
curl -X POST "http://localhost:8080/erp/subsystem/template" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "templateName": "测试模板",
    "category": "测试分类",
    "description": "这是一个测试模板",
    "status": "DRAFT"
  }'

# 3. 查询列表
curl -X GET "http://localhost:8080/erp/subsystem/template/list?pageNum=1&pageSize=10" \
  -H "Authorization: Bearer {token}"

# 4. 查询详情
curl -X GET "http://localhost:8080/erp/subsystem/template/1" \
  -H "Authorization: Bearer {token}"

# 5. 修改模板
curl -X PUT "http://localhost:8080/erp/subsystem/template" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id": 1,
    "templateName": "测试模板（已修改）",
    "category": "测试分类",
    "status": "ACTIVE"
  }'

# 6. 复制模板
curl -X POST "http://localhost:8080/erp/subsystem/template/copy/1" \
  -H "Authorization: Bearer {token}"

# 7. 发布模板
curl -X PUT "http://localhost:8080/erp/subsystem/template/publish/1" \
  -H "Authorization: Bearer {token}"

# 8. 删除模板
curl -X DELETE "http://localhost:8080/erp/subsystem/template/1" \
  -H "Authorization: Bearer {token}"
```

### B. Postman 测试集合

可以导入以下 JSON 到 Postman：

```json
{
    "info": {
        "name": "子系统模板管理API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "生成模板编号",
            "request": {
                "method": "GET",
                "url": "{{baseUrl}}/erp/subsystem/template/generate-code"
            }
        },
        {
            "name": "新增模板",
            "request": {
                "method": "POST",
                "url": "{{baseUrl}}/erp/subsystem/template",
                "header": [
                    {
                        "key": "Content-Type",
                        "value": "application/json"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n  \"templateName\": \"测试模板\",\n  \"category\": \"测试分类\",\n  \"description\": \"测试描述\"\n}"
                }
            }
        },
        {
            "name": "查询模板列表",
            "request": {
                "method": "GET",
                "url": {
                    "raw": "{{baseUrl}}/erp/subsystem/template/list?pageNum=1&pageSize=10",
                    "query": [
                        {
                            "key": "pageNum",
                            "value": "1"
                        },
                        {
                            "key": "pageSize",
                            "value": "10"
                        }
                    ]
                }
            }
        }
    ],
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:8080"
        }
    ]
}
```

---

## 更新日志

| 版本 | 日期       | 修改内容             | 修改人  |
| ---- | ---------- | -------------------- | ------- |
| v1.0 | 2025-11-05 | 初始版本，修正字段名 | haitang |

---

**文档维护**: 后端开发团队  
**技术支持**: 如有疑问请联系后端开发团队  
**相关文档**:

-   [子系统管理模块完整 API 文档](./子系统管理模块完整API文档.md)
-   [子系统模板前端对接修正说明](./子系统模板前端对接修正说明.md)
-   [子系统模板前端快速修复清单](./子系统模板前端快速修复清单.md)
