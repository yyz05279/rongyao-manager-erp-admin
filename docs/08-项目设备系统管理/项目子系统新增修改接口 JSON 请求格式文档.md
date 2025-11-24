# 项目子系统新增修改接口 JSON 请求格式文档

## 📌 接口概览

| 接口           | HTTP 方法 | 路径                                  | 权限标识                                  |
| -------------- | --------- | ------------------------------------- | ----------------------------------------- |
| 新增项目子系统 | POST      | `/erp/saltprocess/projectSubsystem` | `erp:saltprocess:projectSubsystem:add`  |
| 修改项目子系统 | PUT       | `/erp/saltprocess/projectSubsystem` | `erp:saltprocess:projectSubsystem:edit` |

---

## 1️⃣ 新增项目子系统

### 接口信息

- **HTTP 方法**：`POST`
- **请求路径**：`/erp/saltprocess/projectSubsystem`
- **Content-Type**：`application/json`

### 必填字段

```json
{
    "projectSystemId": 1234567890, // ✅ 必填：项目设备系统ID
    "projectId": 9876543210, // ✅ 必填：项目ID
    "subsystemCode": "SUB-001", // ✅ 必填：子系统编码（最大50字符）
    "subsystemName": "平面输送机" // ✅ 必填：子系统名称（最大100字符）
}
```

### 完整请求示例（包含所有字段）

```json
{
    "projectSystemId": 1234567890, // ✅ 必填：项目设备系统ID
    "projectId": 9876543210, // ✅ 必填：项目ID
    "templateId": 5555555555, // ⭕ 可选：子系统模板ID
    "subsystemCode": "SUB-001", // ✅ 必填：子系统编码
    "subsystemName": "平面输送机", // ✅ 必填：子系统名称
    "subsystemType": "MECHANICAL", // ⭕ 可选：子系统类型（最大50字符）
    "category": "输送设备", // ⭕ 可选：子系统分类（最大50字符）
    "specification": "型号A-2000", // ⭕ 可选：规格型号（最大500字符）
    "model": "A-2000", // ⭕ 可选：型号（最大100字符）
    "manufacturer": "某某机械有限公司", // ⭕ 可选：制造商（最大100字符）
    "description": "用于平面物料输送", // ⭕ 可选：描述（最大500字符）
    "itemCount": 5, // ⭕ 可选：子项数量（≥0）
    "materialCount": 20, // ⭕ 可选：物料数量（≥0）
    "totalWeight": 1250.5, // ⭕ 可选：总重量(kg)（≥0，最多2位小数）
    "status": "ACTIVE", // ⭕ 可选：状态（最大20字符）
    "sequenceNumber": 10, // ⭕ 可选：排序号（≥0）
    "remarks": "备注信息" // ⭕ 可选：备注（最大500字符）
}
```

### 最小化请求示例

```json
{
    "projectSystemId": 1234567890,
    "projectId": 9876543210,
    "subsystemCode": "SUB-001",
    "subsystemName": "平面输送机"
}
```

---

## 2️⃣ 修改项目子系统

### 接口信息

- **HTTP 方法**：`PUT`
- **请求路径**：`/erp/saltprocess/projectSubsystem`
- **Content-Type**：`application/json`

### 必填字段

```json
{
    "id": 1111111111, // ✅ 必填：主键ID
    "projectSystemId": 1234567890, // ✅ 必填：项目设备系统ID
    "projectId": 9876543210, // ✅ 必填：项目ID
    "subsystemCode": "SUB-001", // ✅ 必填：子系统编码
    "subsystemName": "平面输送机（已修改）" // ✅ 必填：子系统名称
}
```

### 完整请求示例（包含所有字段）

```json
{
    "id": 1111111111, // ✅ 必填：主键ID
    "projectSystemId": 1234567890, // ✅ 必填：项目设备系统ID
    "projectId": 9876543210, // ✅ 必填：项目ID
    "templateId": 5555555555, // ⭕ 可选：子系统模板ID
    "subsystemCode": "SUB-001", // ✅ 必填：子系统编码
    "subsystemName": "平面输送机（已修改）", // ✅ 必填：子系统名称
    "subsystemType": "MECHANICAL", // ⭕ 可选：子系统类型
    "category": "输送设备", // ⭕ 可选：子系统分类
    "specification": "型号A-2000-升级版", // ⭕ 可选：规格型号
    "model": "A-2000-Pro", // ⭕ 可选：型号
    "manufacturer": "某某机械有限公司", // ⭕ 可选：制造商
    "description": "用于平面物料输送（已升级）", // ⭕ 可选：描述
    "itemCount": 8, // ⭕ 可选：子项数量
    "materialCount": 30, // ⭕ 可选：物料数量
    "totalWeight": 1500.75, // ⭕ 可选：总重量(kg)
    "status": "ACTIVE", // ⭕ 可选：状态
    "sequenceNumber": 15, // ⭕ 可选：排序号
    "remarks": "已更新备注信息", // ⭕ 可选：备注
    "version": 1 // ⭕ 可选：版本号（乐观锁）
}
```

### 最小化请求示例

```json
{
    "id": 1111111111,
    "projectSystemId": 1234567890,
    "projectId": 9876543210,
    "subsystemCode": "SUB-001",
    "subsystemName": "平面输送机（已修改）"
}
```

---

## 3️⃣ 字段说明表

| 字段名              | 类型       | 新增必填 | 修改必填 | 最大长度 | 验证规则           | 说明                  |
| ------------------- | ---------- | -------- | -------- | -------- | ------------------ | --------------------- |
| `id`              | Long       | ❌       | ✅       | -        | -                  | 主键 ID（修改时必填） |
| `projectSystemId` | Long       | ✅       | ✅       | -        | 不能为空           | 项目设备系统 ID       |
| `projectId`       | Long       | ✅       | ✅       | -        | 不能为空           | 项目 ID               |
| `templateId`      | Long       | ❌       | ❌       | -        | -                  | 子系统模板 ID         |
| `subsystemCode`   | String     | ✅       | ✅       | 50       | 不能为空           | 子系统编码            |
| `subsystemName`   | String     | ✅       | ✅       | 100      | 不能为空           | 子系统名称            |
| `subsystemType`   | String     | ❌       | ❌       | 50       | -                  | 子系统类型            |
| `category`        | String     | ❌       | ❌       | 50       | -                  | 子系统分类            |
| `specification`   | String     | ❌       | ❌       | 500      | -                  | 规格型号              |
| `model`           | String     | ❌       | ❌       | 100      | -                  | 型号                  |
| `manufacturer`    | String     | ❌       | ❌       | 100      | -                  | 制造商                |
| `description`     | String     | ❌       | ❌       | 500      | -                  | 描述                  |
| `itemCount`       | Integer    | ❌       | ❌       | -        | ≥0                | 子项数量              |
| `materialCount`   | Integer    | ❌       | ❌       | -        | ≥0                | 物料数量              |
| `totalWeight`     | BigDecimal | ❌       | ❌       | -        | ≥0，最多 2 位小数 | 总重量(kg)            |
| `status`          | String     | ❌       | ❌       | 20       | -                  | 状态                  |
| `sequenceNumber`  | Integer    | ❌       | ❌       | -        | ≥0                | 排序号                |
| `remarks`         | String     | ❌       | ❌       | 500      | -                  | 备注                  |
| `version`         | Integer    | ❌       | ❌       | -        | -                  | 版本号（乐观锁）      |

---

## 4️⃣ 响应格式

### 成功响应

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": null
}
```

### 失败响应

```json
{
    "code": 500,
    "msg": "项目设备系统ID不能为空",
    "data": null
}
```

---

## 5️⃣ 前端调用示例

### TypeScript 示例

```typescript
import request from "@/utils/request";

/**
 * 新增项目子系统
 */
export const addProjectSubsystem = (data: {
    projectSystemId: number;
    projectId: number;
    subsystemCode: string;
    subsystemName: string;
    templateId?: number;
    subsystemType?: string;
    category?: string;
    specification?: string;
    model?: string;
    manufacturer?: string;
    description?: string;
    itemCount?: number;
    materialCount?: number;
    totalWeight?: number;
    status?: string;
    sequenceNumber?: number;
    remarks?: string;
}) => {
    return request({
        url: "/erp/saltprocess/projectSubsystem",
        method: "post",
        data,
    });
};

/**
 * 修改项目子系统
 */
export const updateProjectSubsystem = (data: {
    id: number;
    projectSystemId: number;
    projectId: number;
    subsystemCode: string;
    subsystemName: string;
    templateId?: number;
    subsystemType?: string;
    category?: string;
    specification?: string;
    model?: string;
    manufacturer?: string;
    description?: string;
    itemCount?: number;
    materialCount?: number;
    totalWeight?: number;
    status?: string;
    sequenceNumber?: number;
    remarks?: string;
    version?: number;
}) => {
    return request({
        url: "/erp/saltprocess/projectSubsystem",
        method: "put",
        data,
    });
};

// 使用示例：新增
await addProjectSubsystem({
    projectSystemId: 1234567890,
    projectId: 9876543210,
    subsystemCode: "SUB-001",
    subsystemName: "平面输送机",
    subsystemType: "MECHANICAL",
    status: "ACTIVE",
});

// 使用示例：修改
await updateProjectSubsystem({
    id: 1111111111,
    projectSystemId: 1234567890,
    projectId: 9876543210,
    subsystemCode: "SUB-001",
    subsystemName: "平面输送机（已修改）",
    itemCount: 8,
    materialCount: 30,
});
```

---

## 6️⃣ cURL 测试命令

### 新增子系统

```bash
curl -X POST 'http://localhost:8080/erp/saltprocess/projectSubsystem' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token-here' \
  -d '{
    "projectSystemId": 1234567890,
    "projectId": 9876543210,
    "subsystemCode": "SUB-001",
    "subsystemName": "平面输送机",
    "subsystemType": "MECHANICAL",
    "status": "ACTIVE"
  }'
```

### 修改子系统

```bash
curl -X PUT 'http://localhost:8080/erp/saltprocess/projectSubsystem' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token-here' \
  -d '{
    "id": 1111111111,
    "projectSystemId": 1234567890,
    "projectId": 9876543210,
    "subsystemCode": "SUB-001",
    "subsystemName": "平面输送机（已修改）",
    "itemCount": 8,
    "materialCount": 30
  }'
```

---

## ⚠️ 注意事项

1. **必填字段验证**：

   - 新增时：`projectSystemId`、`projectId`、`subsystemCode`、`subsystemName` 必填
   - 修改时：除上述字段外，`id` 也必填
2. **字段长度限制**：

   - `subsystemCode`：最大 50 字符
   - `subsystemName`：最大 100 字符
   - `specification`：最大 500 字符
   - `description`：最大 500 字符
   - `remarks`：最大 500 字符
3. **数值验证**：

   - `itemCount`、`materialCount`、`sequenceNumber`：必须 ≥ 0
   - `totalWeight`：必须 ≥ 0，最多 2 位小数
4. **乐观锁**：

   - 修改时建议传递 `version` 字段，防止并发修改冲突

---

## 📚 相关文档

- [项目子系统完整 API 文档](../化盐项目设备系统管理API文档.md)
- [项目子系统查询接口文档](./项目子系统查询接口文档.md)

---

**文档版本**：v1.0
**创建时间**：2025-01-24
**最后更新**：2025-01-24
**维护团队**：海棠开发团队

"code": 200,
"msg": "操作成功",
"data": null
}

````

### 失败响应
```json
{
  "code": 500,
  "msg": "项目设备系统ID不能为空",
  "data": null
}
````
