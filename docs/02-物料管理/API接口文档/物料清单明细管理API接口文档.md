# 物料管理 API 接口文档

> **文档版本**: v2.0
> **更新时间**: 2025-11-12
> **适用范围**: 海棠 ERP 系统 - 物料管理模块

---

## 📋 1. 接口概览

| 接口名称     | 请求方法 | 接口路径                               | 说明             |
| ------------ | -------- | -------------------------------------- | ---------------- |
| 新增物料     | POST     | `/erp/saltprocess/material/item`       | 创建新物料       |
| 编辑物料     | PUT      | `/erp/saltprocess/material/item`       | 更新物料信息     |
| 查询物料详情 | GET      | `/erp/saltprocess/material/item/{id}`  | 根据 ID 查询物料 |
| 查询物料列表 | GET      | `/erp/saltprocess/material/item/list`  | 分页查询物料列表 |
| 删除物料     | DELETE   | `/erp/saltprocess/material/item/{ids}` | 批量删除物料     |

---

## 📝 2. 新增物料接口

### 2.1 基本信息

-   **接口路径**：`POST /erp/saltprocess/material/item`
-   **接口说明**：创建新物料记录
-   **权限要求**：`erp:saltprocess:material:add`
-   **物料编码**：由后端自动生成（格式：`WL + yyyyMMdd + 6位序号`）

### 2.2 请求参数

#### 请求头

```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### 请求体（JSON）

##### ✅ 必填字段

| 字段名       | 类型   | 必填 | 说明     | 示例           |
| ------------ | ------ | ---- | -------- | -------------- |
| materialName | String | ✅   | 物料名称 | M6 螺丝        |
| materialType | String | ✅   | 物料类型 | STANDARD_PARTS |

##### 📦 基础信息字段（可选）

| 字段名        | 类型    | 必填 | 说明         | 示例       | 备注               |
| ------------- | ------- | ---- | ------------ | ---------- | ------------------ |
| specification | String  | ❌   | 规格型号     | 304 不锈钢 | 物料的详细规格描述 |
| unit          | String  | ✅   | 单位         | 袋、台、个 | 物料的计量单位     |
| unitWeight    | Number  | ❌   | 单重（kg）   | 1.5        | 单个物料的重量     |
| unitVolume    | Number  | ❌   | 单体积（m³） | 0.01       | 单个物料的体积     |
| manufacturer  | String  | ❌   | 制造商       | 标准件厂   | 物料的生产厂家     |
| model         | String  | ❌   | 型号         | XYZ-100    | 物料的具体型号     |
| isFragile     | Boolean | ❌   | 是否易碎     | false      | 默认 false         |
| isHazardous   | Boolean | ❌   | 是否危险品   | false      | 默认 false         |
| remarks       | String  | ❌   | 备注         | 特殊说明   | 其他需要说明的信息 |

##### 📦 包装规格字段（可选）

> **使用场景**：当物料以包装形式采购时使用（如：500 颗/袋的螺丝、100 米/卷的电缆）

| 字段名          | 类型    | 必填       | 说明                     | 示例       | 备注                       |
| --------------- | ------- | ---------- | ------------------------ | ---------- | -------------------------- |
| packageQuantity | Integer | 条件必填\* | 包装数量（每包数量）     | 500        | 每个包装单位包含的基础数量 |
| packageUnit     | String  | 条件必填\* | 包装单位                 | 袋、箱、卷 | 包装的计量单位             |
| baseUnit        | String  | 条件必填\* | 基础单位                 | 颗、个、米 | 最小计量单位               |
| packageWeight   | Number  | ❌         | 包装重量（单包重量，kg） | 2.5        | 单个包装的重量             |
| packageVolume   | Number  | ❌         | 包装体积（单包体积，m³） | 0.05       | 单个包装的体积             |
| totalPackages   | Integer | ❌         | 总包装数                 | 10         | 进货时的包装数量           |

> **\*条件必填规则**：
>
> -   如果填写了 `packageQuantity`，则 `packageUnit` 和 `baseUnit` 必填
> -   如果填写了 `totalPackages`，则 `packageQuantity` 必填

##### 🏷️ 批次信息字段（可选）

> **使用场景**：用于追溯物料来源和有效期管理

| 字段名         | 类型   | 必填 | 说明                         | 示例          | 备注                 |
| -------------- | ------ | ---- | ---------------------------- | ------------- | -------------------- |
| serialNumber   | String | ❌   | 序列号/批次号                | SN20251112001 | 用于物料追溯         |
| productionDate | String | ❌   | 生产日期（格式：yyyy-MM-dd） | 2025-11-01    | 物料的生产日期       |
| expiryDate     | String | ❌   | 过期日期（格式：yyyy-MM-dd） | 2026-11-01    | 物料的有效期截止日期 |

##### 🤖 自动计算字段（只读，不需要传入）

> **说明**：以下字段由后端自动生成或计算，前端无需传入

| 字段名        | 类型   | 说明         | 计算规则                               |
| ------------- | ------ | ------------ | -------------------------------------- |
| materialCode  | String | 物料编码     | 后端自动生成：WL + yyyyMMdd + 6 位序号 |
| totalQuantity | Number | 总数量       | packageQuantity × totalPackages        |
| totalWeight   | Number | 总重量（kg） | packageWeight × totalPackages          |
| totalVolume   | Number | 总体积（m³） | packageVolume × totalPackages          |

---

### 2.3 物料类型枚举值

| 枚举值         | 说明     | 示例               |
| -------------- | -------- | ------------------ |
| GENERAL        | 通用物料 | 普通材料、配件     |
| MECHANICAL     | 机械设备 | 泵、阀门、压缩机   |
| ELECTRICAL     | 电控设备 | 变频器、电机、电缆 |
| PIPELINE       | 管路设备 | 管道、管件、法兰   |
| BURNER         | 燃烧器   | 燃烧器及相关配件   |
| AUXILIARY      | 辅助设备 | 辅助系统设备       |
| STANDARD_PARTS | 标准件   | 螺丝、螺母、垫片   |

---

### 2.4 请求示例

#### 示例 1：新增有包装规格的物料（螺丝）

> **业务场景**：采购了 10 袋螺丝，每袋 500 颗

```bash
curl -X POST "http://localhost:8080/erp/saltprocess/material/item" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "materialName": "M6螺丝",
    "materialType": "STANDARD_PARTS",
    "specification": "304不锈钢",
    "packageQuantity": 500,
    "packageUnit": "袋",
    "baseUnit": "颗",
    "packageWeight": 2.5,
    "packageVolume": 0.05,
    "totalPackages": 10,
    "serialNumber": "SN20251112001",
    "productionDate": "2025-11-01",
    "manufacturer": "标准件厂",
    "isFragile": false,
    "isHazardous": false
  }'
```

#### 示例 2：新增无包装规格的物料（设备）

> **业务场景**：采购了 2 台变频器，按台计量

```bash
curl -X POST "http://localhost:8080/erp/saltprocess/material/item" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "materialName": "变频器",
    "materialType": "ELECTRICAL",
    "specification": "380V 15KW",
    "unit": "台",
    "unitWeight": 45.5,
    "unitVolume": 0.2,
    "manufacturer": "西门子",
    "serialNumber": "SN20251112002",
    "isFragile": false,
    "isHazardous": false
  }'
```

#### 示例 3：新增电缆（按长度计量）

> **业务场景**：采购了 5 卷电缆，每卷 100 米

```bash
curl -X POST "http://localhost:8080/erp/saltprocess/material/item" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "materialName": "电缆线",
    "materialType": "ELECTRICAL",
    "specification": "3×2.5mm²",
    "packageQuantity": 100,
    "packageUnit": "卷",
    "baseUnit": "米",
    "packageWeight": 50,
    "packageVolume": 0.1,
    "totalPackages": 5,
    "serialNumber": "SN20251112003",
    "productionDate": "2025-11-01",
    "manufacturer": "电缆厂",
    "isFragile": false,
    "isHazardous": false
  }'
```

---

### 2.5 响应结果

#### ✅ 成功响应

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": null
}
```

**说明**：

-   物料创建成功后，系统会自动生成物料编码（格式：`WL20251112000001`）
-   如果填写了包装规格和总包装数，系统会自动计算总数量、总重量、总体积

#### ❌ 错误响应

##### 1. 验证错误：缺少必填字段

```json
{
    "code": 500,
    "msg": "物料名称不能为空"
}
```

##### 2. 验证错误：包装规格不完整

```json
{
    "code": 500,
    "msg": "填写了包装数量，必须填写包装单位"
}
```

##### 3. 验证错误：总包装数无效

```json
{
    "code": 500,
    "msg": "填写了总包装数，必须填写包装数量"
}
```

##### 4. 业务错误：物料编码重复

```json
{
    "code": 500,
    "msg": "物料编码已存在"
}
```

---

## 📝 3. 编辑物料接口

### 3.1 基本信息

-   **接口路径**：`PUT /erp/saltprocess/material/item`
-   **接口说明**：更新物料信息
-   **权限要求**：`erp:saltprocess:material:edit`

### 3.2 请求参数

#### 请求头

```http
Content-Type: application/json
Authorization: Bearer {token}
```

#### 请求体（JSON）

与新增接口相同，但需要额外传入 `id` 字段：

| 字段名 | 类型 | 必填 | 说明    | 示例 |
| ------ | ---- | ---- | ------- | ---- |
| id     | Long | ✅   | 物料 ID | 1    |

> **注意**：其他字段与新增接口完全相同，参见 [2.2 请求参数](#22-请求参数)

### 3.3 请求示例

```bash
curl -X PUT "http://localhost:8080/erp/saltprocess/material/item" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id": 1,
    "materialName": "M6螺丝（更新）",
    "materialType": "STANDARD_PARTS",
    "specification": "304不锈钢",
    "unit": "袋",
    "packageQuantity": 500,
    "packageUnit": "袋",
    "baseUnit": "颗",
    "packageWeight": 2.5,
    "packageVolume": 0.05,
    "totalPackages": 20,
    "serialNumber": "SN20251112001",
    "productionDate": "2025-11-01",
    "manufacturer": "标准件厂",
    "isFragile": false,
    "isHazardous": false
  }'
```

### 3.4 响应结果

#### ✅ 成功响应

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": null
}
```

#### ❌ 错误响应

与新增接口相同，参见 [2.5 响应结果](#25-响应结果)

---

## 🔍 4. 查询物料详情接口

### 4.1 基本信息

-   **接口路径**：`GET /erp/saltprocess/material/item/{id}`
-   **接口说明**：根据 ID 查询物料详情
-   **权限要求**：`erp:saltprocess:material:query`

### 4.2 请求参数

#### 路径参数

| 参数名 | 类型 | 必填 | 说明    | 示例 |
| ------ | ---- | ---- | ------- | ---- |
| id     | Long | ✅   | 物料 ID | 1    |

### 4.3 请求示例

```bash
curl -X GET "http://localhost:8080/erp/saltprocess/material/item/1" \
  -H "Authorization: Bearer {token}"
```

### 4.4 响应结果

#### ✅ 成功响应

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": {
        "id": 1,
        "materialCode": "WL20251112000001",
        "materialName": "M6螺丝",
        "materialType": "STANDARD_PARTS",
        "specification": "304不锈钢",
        "unit": "袋",

        "packageQuantity": 500,
        "packageUnit": "袋",
        "baseUnit": "颗",
        "packageWeight": 2.5,
        "packageVolume": 0.05,
        "totalPackages": 10,

        "totalQuantity": 5000,
        "totalWeight": 25.0,
        "totalVolume": 0.5,

        "serialNumber": "SN20251112001",
        "productionDate": "2025-11-01",
        "expiryDate": null,

        "manufacturer": "标准件厂",
        "model": null,
        "isFragile": false,
        "isHazardous": false,
        "status": "ACTIVE",
        "remarks": null,

        "createTime": "2025-11-12 10:30:00",
        "updateTime": "2025-11-12 10:30:00",
        "createBy": "admin",
        "updateBy": "admin"
    }
}
```

**响应字段说明**：

| 字段分类     | 字段名          | 说明                     |
| ------------ | --------------- | ------------------------ |
| 基础信息     | materialCode    | 物料编码（系统自动生成） |
|              | materialName    | 物料名称                 |
|              | materialType    | 物料类型                 |
|              | specification   | 规格型号                 |
|              | unit            | 单位                     |
| 包装规格     | packageQuantity | 包装数量（每包数量）     |
|              | packageUnit     | 包装单位                 |
|              | baseUnit        | 基础单位                 |
|              | packageWeight   | 包装重量（kg）           |
|              | packageVolume   | 包装体积（m³）           |
|              | totalPackages   | 总包装数                 |
| 自动计算字段 | totalQuantity   | 总数量（自动计算）       |
|              | totalWeight     | 总重量（自动计算，kg）   |
|              | totalVolume     | 总体积（自动计算，m³）   |
| 批次信息     | serialNumber    | 序列号/批次号            |
|              | productionDate  | 生产日期                 |
|              | expiryDate      | 过期日期                 |
| 其他信息     | manufacturer    | 制造商                   |
|              | model           | 型号                     |
|              | isFragile       | 是否易碎                 |
|              | isHazardous     | 是否危险品               |
|              | status          | 物料状态                 |
|              | remarks         | 备注                     |

---

## 📋 5. 查询物料列表接口

### 5.1 基本信息

-   **接口路径**：`GET /erp/saltprocess/material/item/list`
-   **接口说明**：分页查询物料列表，支持多条件筛选
-   **权限要求**：`erp:saltprocess:material:list`

### 5.2 请求参数

#### 查询参数

| 参数名       | 类型    | 必填 | 说明     | 示例           |
| ------------ | ------- | ---- | -------- | -------------- |
| materialName | String  | ❌   | 物料名称 | 螺丝           |
| materialType | String  | ❌   | 物料类型 | STANDARD_PARTS |
| materialCode | String  | ❌   | 物料编码 | WL20251112     |
| manufacturer | String  | ❌   | 制造商   | 标准件厂       |
| status       | String  | ❌   | 物料状态 | ACTIVE         |
| pageNum      | Integer | ❌   | 页码     | 1              |
| pageSize     | Integer | ❌   | 每页数量 | 10             |

### 5.3 请求示例

```bash
curl -X GET "http://localhost:8080/erp/saltprocess/material/item/list?materialName=螺丝&pageNum=1&pageSize=10" \
  -H "Authorization: Bearer {token}"
```

### 5.4 响应结果

#### ✅ 成功响应

```json
{
    "code": 200,
    "msg": "查询成功",
    "rows": [
        {
            "id": 1,
            "materialCode": "WL20251112000001",
            "materialName": "M6螺丝",
            "materialType": "STANDARD_PARTS",
            "specification": "304不锈钢",
            "unit": "袋",
            "totalQuantity": 5000,
            "totalWeight": 25.0,
            "totalVolume": 0.5,
            "manufacturer": "标准件厂",
            "status": "ACTIVE",
            "createTime": "2025-11-12 10:30:00"
        }
    ],
    "total": 1
}
```

---

## 🗑️ 6. 删除物料接口

### 6.1 基本信息

-   **接口路径**：`DELETE /erp/saltprocess/material/item/{ids}`
-   **接口说明**：批量删除物料（逻辑删除）
-   **权限要求**：`erp:saltprocess:material:remove`

### 6.2 请求参数

#### 路径参数

| 参数名 | 类型   | 必填 | 说明                     | 示例  |
| ------ | ------ | ---- | ------------------------ | ----- |
| ids    | String | ✅   | 物料 ID 列表（逗号分隔） | 1,2,3 |

### 6.3 请求示例

```bash
curl -X DELETE "http://localhost:8080/erp/saltprocess/material/item/1,2,3" \
  -H "Authorization: Bearer {token}"
```

### 6.4 响应结果

#### ✅ 成功响应

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": null
}
```

---

## 📚 7. 业务规则

### 7.1 物料编码生成规则

-   **格式**：`WL + yyyyMMdd + 6位序号`
-   **示例**：`WL20251112000001`
-   **说明**：由后端自动生成，前端无需传入
-   **唯一性**：物料编码全局唯一

### 7.2 包装规格验证规则

1. **规则 1**：如果填写了 `packageQuantity`，则 `packageUnit` 和 `baseUnit` 必填
2. **规则 2**：如果填写了 `totalPackages`，则 `packageQuantity` 必填

### 7.3 自动计算规则

#### 场景 1：有包装规格时

当填写了 `packageQuantity`、`packageWeight`、`packageVolume` 和 `totalPackages` 时：

```
totalQuantity = packageQuantity × totalPackages
totalWeight = packageWeight × totalPackages
totalVolume = packageVolume × totalPackages
```

**示例**：

-   包装数量：500 颗/袋
-   包装重量：2.5 kg/袋
-   包装体积：0.05 m³/袋
-   总包装数：10 袋

**自动计算结果**：

-   总数量 = 500 × 10 = 5000 颗
-   总重量 = 2.5 × 10 = 25 kg
-   总体积 = 0.05 × 10 = 0.5 m³

#### 场景 2：无包装规格时

当只填写了 `unitWeight`、`unitVolume` 和 `totalQuantity` 时：

```
totalWeight = unitWeight × totalQuantity
totalVolume = unitVolume × totalQuantity
```

**示例**：

-   单重：45.5 kg/台
-   单体积：0.2 m³/台
-   总数量：2 台

**自动计算结果**：

-   总重量 = 45.5 × 2 = 91 kg
-   总体积 = 0.2 × 2 = 0.4 m³

---

## 💻 8. 前端集成示例

### 8.1 TypeScript 类型定义

```typescript
/**
 * 物料表单数据
 */
export interface MaterialForm {
    // 基础信息（必填）
    id?: number;
    materialName: string; // 物料名称（必填）
    materialType: string; // 物料类型（必填）
    unit: string; // 单位（必填）

    // 基础信息（可选）
    specification?: string; // 规格型号
    unitWeight?: number; // 单重（kg）
    unitVolume?: number; // 单体积（m³）
    manufacturer?: string; // 制造商
    model?: string; // 型号
    remarks?: string; // 备注

    // 包装规格（可选）
    packageQuantity?: number; // 包装数量（每包数量）
    packageUnit?: string; // 包装单位
    baseUnit?: string; // 基础单位
    packageWeight?: number; // 包装重量（kg）
    packageVolume?: number; // 包装体积（m³）
    totalPackages?: number; // 总包装数

    // 批次信息（可选）
    serialNumber?: string; // 序列号/批次号
    productionDate?: string; // 生产日期（yyyy-MM-dd）
    expiryDate?: string; // 过期日期（yyyy-MM-dd）

    // 其他信息（可选）
    isFragile?: boolean; // 是否易碎
    isHazardous?: boolean; // 是否危险品
    storageRequirement?: string; // 存储要求
    packageType?: string; // 包装方式
}

/**
 * 物料详情数据（包含自动计算字段和系统字段）
 */
export interface MaterialVO extends MaterialForm {
    materialCode: string; // 物料编码（系统自动生成）
    totalQuantity?: number; // 总数量（自动计算）
    totalWeight?: number; // 总重量（自动计算，kg）
    totalVolume?: number; // 总体积（自动计算，m³）
    status: string; // 物料状态
    createTime: string; // 创建时间
    updateTime: string; // 更新时间
    createBy: string; // 创建人
    updateBy: string; // 更新人
}

/**
 * 物料查询参数
 */
export interface MaterialQuery {
    materialName?: string; // 物料名称（模糊查询）
    materialType?: string; // 物料类型
    materialCode?: string; // 物料编码（模糊查询）
    manufacturer?: string; // 制造商（模糊查询）
    status?: string; // 物料状态
    pageNum?: number; // 页码
    pageSize?: number; // 每页数量
}
```

### 8.2 API 调用示例

```typescript
import request from "@/utils/request";

/**
 * 新增物料
 */
export const addMaterial = (data: MaterialForm) => {
    return request({
        url: "/erp/saltprocess/material/item",
        method: "post",
        data: data,
    });
};

/**
 * 编辑物料
 */
export const updateMaterial = (data: MaterialForm) => {
    return request({
        url: "/erp/saltprocess/material/item",
        method: "put",
        data: data,
    });
};

/**
 * 查询物料详情
 */
export const getMaterial = (id: number) => {
    return request({
        url: `/erp/saltprocess/material/item/${id}`,
        method: "get",
    });
};

/**
 * 查询物料列表
 */
export const listMaterial = (query: MaterialQuery) => {
    return request({
        url: "/erp/saltprocess/material/item/list",
        method: "get",
        params: query,
    });
};

/**
 * 删除物料
 */
export const deleteMaterial = (ids: number[]) => {
    return request({
        url: `/erp/saltprocess/material/item/${ids.join(",")}`,
        method: "delete",
    });
};
```

### 8.3 表单提交示例

```typescript
import { ElMessage } from "element-plus";

/**
 * 提交物料表单
 */
const handleSubmit = async () => {
    try {
        const formData: MaterialForm = {
            materialName: form.value.materialName,
            materialType: form.value.materialType,
            unit: form.value.unit,
            specification: form.value.specification,

            // 包装规格（可选）
            packageQuantity: form.value.packageQuantity,
            packageUnit: form.value.packageUnit,
            baseUnit: form.value.baseUnit,
            packageWeight: form.value.packageWeight,
            packageVolume: form.value.packageVolume,
            totalPackages: form.value.totalPackages,

            // 批次信息（可选）
            serialNumber: form.value.serialNumber,
            productionDate: form.value.productionDate,
            expiryDate: form.value.expiryDate,

            // 其他信息（可选）
            manufacturer: form.value.manufacturer,
            model: form.value.model,
            isFragile: form.value.isFragile || false,
            isHazardous: form.value.isHazardous || false,
            remarks: form.value.remarks,
        };

        if (form.value.id) {
            // 编辑模式
            await updateMaterial({ ...formData, id: form.value.id });
            ElMessage.success("物料更新成功");
        } else {
            // 新增模式
            await addMaterial(formData);
            ElMessage.success("物料创建成功");
        }

        // 刷新列表
        await loadMaterialList();
    } catch (error: any) {
        ElMessage.error("操作失败：" + (error.message || "未知错误"));
    }
};
```

### 8.4 列表查询示例

```typescript
import { ref } from "vue";

const materialList = ref<MaterialVO[]>([]);
const total = ref(0);
const queryParams = ref<MaterialQuery>({
    materialName: "",
    materialType: "",
    pageNum: 1,
    pageSize: 10,
});

/**
 * 加载物料列表
 */
const loadMaterialList = async () => {
    try {
        const response = await listMaterial(queryParams.value);
        materialList.value = response.rows;
        total.value = response.total;
    } catch (error: any) {
        ElMessage.error("查询失败：" + (error.message || "未知错误"));
    }
};

/**
 * 搜索物料
 */
const handleSearch = () => {
    queryParams.value.pageNum = 1;
    loadMaterialList();
};

/**
 * 重置搜索条件
 */
const handleReset = () => {
    queryParams.value = {
        materialName: "",
        materialType: "",
        pageNum: 1,
        pageSize: 10,
    };
    loadMaterialList();
};
```

---

## ❓ 9. 常见问题

### Q1: 物料编码需要前端传入吗？

**A**: 不需要。物料编码由后端自动生成，格式为 `WL + yyyyMMdd + 6位序号`（例如：`WL20251112000001`）。

---

### Q2: totalQuantity、totalWeight、totalVolume 需要前端计算吗？

**A**: 不需要。这些字段由后端自动计算：

-   有包装规格时：`totalQuantity = packageQuantity × totalPackages`
-   无包装规格时：`totalWeight = unitWeight × totalQuantity`

前端只需要展示这些字段即可。

---

### Q3: 如果物料没有包装规格怎么办？

**A**: 可以不填写包装规格相关字段，直接填写：

-   `unit`：单位（必填）
-   `unitWeight`：单重（可选）
-   `unitVolume`：单体积（可选）

**示例**：变频器按台计量，不需要包装规格。

---

### Q4: packageUnit 和 baseUnit 有什么区别？

**A**:

-   **packageUnit**：包装单位，如"袋"、"箱"、"卷"
-   **baseUnit**：基础单位（最小计量单位），如"颗"、"个"、"米"

**示例**：

-   螺丝：500 颗/袋 → `packageQuantity=500`, `packageUnit=袋`, `baseUnit=颗`
-   电缆：100 米/卷 → `packageQuantity=100`, `packageUnit=卷`, `baseUnit=米`

---

### Q5: 日期格式是什么？

**A**: 日期格式为 `yyyy-MM-dd`，例如：`2025-11-01`。

---

### Q6: isFragile 和 isHazardous 的默认值是什么？

**A**: 默认值都是 `false`。如果不传入，后端会自动设置为 `false`。

---

### Q7: 物料类型有哪些可选值？

**A**: 物料类型枚举值如下：

-   `GENERAL` - 通用物料
-   `MECHANICAL` - 机械设备
-   `ELECTRICAL` - 电控设备
-   `PIPELINE` - 管路设备
-   `BURNER` - 燃烧器
-   `AUXILIARY` - 辅助设备
-   `STANDARD_PARTS` - 标准件

详见 [2.3 物料类型枚举值](#23-物料类型枚举值)

---

### Q8: 如何处理包装规格验证错误？

**A**: 后端会进行以下验证：

1. 如果填写了 `packageQuantity`，则 `packageUnit` 和 `baseUnit` 必填
2. 如果填写了 `totalPackages`，则 `packageQuantity` 必填

**建议**：前端在提交前进行相同的验证，提升用户体验。

---

### Q9: 物料状态有哪些值？

**A**: 物料状态包括：

-   `ACTIVE` - 启用（默认）
-   `INACTIVE` - 停用
-   `DISCONTINUED` - 停产

---

### Q10: 如何测试接口？

**A**: 可以使用以下工具测试：

1. **Postman**：导入 curl 命令进行测试
2. **Swagger UI**：访问 `http://localhost:8080/swagger-ui.html`
3. **前端调试**：使用浏览器开发者工具查看网络请求

---

## 📞 10. 技术支持

如有问题，请联系：

-   **开发团队**：海棠 ERP 开发团队
-   **文档维护**：技术文档组
-   **更新周期**：随接口变更实时更新

---

**文档版本**：v2.0
**更新时间**：2025-11-12
**适用范围**：海棠 ERP 系统 - 物料管理模块
**维护团队**：海棠开发团队
