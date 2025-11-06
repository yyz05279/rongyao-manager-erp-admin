# 子系统模板子项和物料管理 API 文档

## 文档信息

- **模块名称**: 子系统模板子项和物料管理
- **版本**: v2.0
- **更新日期**: 2025 年 11 月 5 日
- **架构版本**: 独立架构（子项模板完全独立）

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

### 独立架构模式

```
【公司基础数据】
├── 子系统模板库 (SubsystemTemplate)
├── 子项模板库 (ItemTemplate) ← 完全独立
└── 物料库 (Material)

【模板配置】
└── 子系统模板-子项关联表 (TemplateItemRel)
    管理：子系统与子项的关联关系、数量、排序等

【子项-物料配置】
└── 物料模板 (MaterialTemplate)
    管理：子项模板所需的物料配置
```

### 典型业务场景

**示例：公司子项模板库**

```
【公司子项库】
├── 压力容器（独立子项模板）
│     ├── 物料1：钢板 Q345R, 默认数量: 500kg
│     ├── 物料2：法兰 DN200, 默认数量: 4个
│     └── 物料3：螺栓 M16, 默认数量: 32个
│
└── 控制柜（独立子项模板）
      ├── 物料1：PLC西门子S7-1200, 默认数量: 1台
      ├── 物料2：断路器 ABB, 默认数量: 3个
      └── 物料3：电缆线, 默认数量: 50米

【子系统模板】
固态处理厂
  ↓ 引用
  ├── 压力容器（数量: 1, 排序: 10）
  └── 控制柜（数量: 1, 排序: 20）
```

### 核心功能

1. **子项模板管理**：公司级子项库，独立创建和管理，可被多个子系统复用
2. **模板关联管理**：将子项模板关联到子系统模板，配置数量、排序等
3. **物料模板管理**：为子项模板配置所需物料和默认数量
4. **灵活应用**：子系统模板应用到项目时，自动带入子项和物料配置

---

## 数据模型

### 子项模板对象 (ItemTemplateVO)

```typescript
interface SubsystemItemTemplateVO {
    id: number; // 主键ID
    itemCode: string; // 子项编号（全局唯一，如：ITEM-00001）
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

// 子系统模板-子项关联对象（带关联信息）
interface TemplateItemRelVO extends SubsystemItemTemplateVO {
    relId: number; // 关联表ID
    templateId: number; // 子系统模板ID
    relQuantity: number; // 在模板中的数量
    relSequenceNumber: number; // 在模板中的排序
    relIsRequired: boolean; // 在模板中是否必需
    relRemarks?: string; // 关联备注
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

### 子系统模板接口（关联管理）

| 序号 | 接口名称           | 请求方式 | 接口路径                               | 权限标识                       |
| ---- | ------------------ | -------- | -------------------------------------- | ------------------------------ |
| 1    | 获取模板的子项列表 | GET      | `/{id}/items`                          | `erp:subsystem:template:query` |
| 2    | 添加子项到模板     | POST     | `/{templateId}/items`                  | `erp:subsystem:template:edit`  |
| 3    | 批量添加子项到模板 | POST     | `/{templateId}/items/batch`            | `erp:subsystem:template:edit`  |
| 4    | 从模板移除子项     | DELETE   | `/{templateId}/items/{itemTemplateId}` | `erp:subsystem:template:edit`  |
| 5    | 批量从模板移除子项 | DELETE   | `/{templateId}/items`                  | `erp:subsystem:template:edit`  |
| 6    | 更新子项关联配置   | PUT      | `/{templateId}/items/{itemTemplateId}` | `erp:subsystem:template:edit`  |

### 子项模板接口（独立管理）

| 序号 | 接口名称           | 请求方式 | 接口路径          | 权限标识                        |
| ---- | ------------------ | -------- | ----------------- | ------------------------------- |
| 1    | 查询子项模板列表   | GET      | `/list`           | `erp:subsystem:template:list`   |
| 2    | 查询子项模板详情   | GET      | `/{id}`           | `erp:subsystem:template:query`  |
| 3    | 新增子项模板       | POST     | `/`               | `erp:subsystem:template:add`    |
| 4    | 批量新增子项模板   | POST     | `/batch`          | `erp:subsystem:template:add`    |
| 5    | 修改子项模板       | PUT      | `/`               | `erp:subsystem:template:edit`   |
| 6    | 删除子项模板       | DELETE   | `/{ids}`          | `erp:subsystem:template:remove` |
| 7    | 导出子项模板列表   | POST     | `/export`         | `erp:subsystem:template:export` |
| 8    | 生成子项编号       | GET      | `/generate-code`  | 无                              |
| 9    | 获取子项的物料列表 | GET      | `/{id}/materials` | `erp:subsystem:template:query`  |

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

### 1. 获取模板的子项列表（带关联信息）

**接口地址**: `GET /erp/subsystem/template/{id}/items`

**接口描述**: 获取指定子系统模板的所有关联子项，包含关联配置信息

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
            "relId": 1,
            "templateId": 1,
            "id": 10,
            "itemCode": "ITEM-00001",
            "itemName": "压力容器",
            "itemType": "组件",
            "specification": "标准型",
            "description": "主要压力容器",
            "defaultQuantity": 1,
            "unit": "个",
            "isRequired": true,
            "sequenceNumber": 10,
            "relQuantity": 1,
            "relSequenceNumber": 10,
            "relIsRequired": true,
            "relRemarks": "核心组件",
            "createTime": "2025-11-05 10:00:00"
        }
    ]
}
```

### 2. 添加子项到模板

**接口地址**: `POST /erp/subsystem/template/{templateId}/items`

**接口描述**: 将已存在的子项模板关联到子系统模板

**✨ 自动同步机制**: 添加子项到模板时，系统会自动将子项模板的物料复制到子系统物料表（`erp_subsystem_material_template`），并设置正确的 `template_id` 和 `item_template_id`

**权限标识**: `erp:subsystem:template:edit`

**路径参数**:

| 参数名     | 类型   | 必填 | 说明          |
| ---------- | ------ | ---- | ------------- |
| templateId | number | 是   | 子系统模板 ID |

**请求体参数**:

| 参数名         | 类型    | 必填 | 说明                 |
| -------------- | ------- | ---- | -------------------- |
| itemTemplateId | number  | 是   | 子项模板 ID          |
| quantity       | number  | 否   | 数量，默认 1.00      |
| sequenceNumber | integer | 否   | 排序号，不传自动计算 |
| isRequired     | boolean | 否   | 是否必需，默认 true  |
| remarks        | string  | 否   | 关联备注             |

**请求示例**:

```json
{
    "itemTemplateId": 10,
    "quantity": 1,
    "sequenceNumber": 10,
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

### 3. 批量添加子项到模板

**接口地址**: `POST /erp/subsystem/template/{templateId}/items/batch`

**接口描述**: 批量将子项模板关联到子系统模板

**✨ 自动同步机制**: 批量添加时，每个子项的物料都会自动同步到子系统物料表

**权限标识**: `erp:subsystem:template:edit`

**路径参数**:

| 参数名     | 类型   | 必填 | 说明          |
| ---------- | ------ | ---- | ------------- |
| templateId | number | 是   | 子系统模板 ID |

**请求体**: 关联对象数组

**请求示例**:

```json
[
    {
        "itemTemplateId": 10,
        "quantity": 1,
        "sequenceNumber": 10
    },
    {
        "itemTemplateId": 11,
        "quantity": 1,
        "sequenceNumber": 20
    }
]
```

### 4. 从模板移除子项

**接口地址**: `DELETE /erp/subsystem/template/{templateId}/items/{itemTemplateId}`

**接口描述**: 解除子系统模板与子项模板的关联关系

**🗑️ 自动清理机制**: 移除子项时，系统会自动清理该子项在该模板中的所有物料记录

**权限标识**: `erp:subsystem:template:edit`

**路径参数**:

| 参数名         | 类型   | 必填 | 说明          |
| -------------- | ------ | ---- | ------------- |
| templateId     | number | 是   | 子系统模板 ID |
| itemTemplateId | number | 是   | 子项模板 ID   |

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 5. 更新子项关联配置

**接口地址**: `PUT /erp/subsystem/template/{templateId}/items/{itemTemplateId}`

**接口描述**: 更新子项在模板中的配置（数量、排序等）

**权限标识**: `erp:subsystem:template:edit`

**路径参数**:

| 参数名         | 类型   | 必填 | 说明          |
| -------------- | ------ | ---- | ------------- |
| templateId     | number | 是   | 子系统模板 ID |
| itemTemplateId | number | 是   | 子项模板 ID   |

**请求体参数**:

| 参数名         | 类型    | 必填 | 说明     |
| -------------- | ------- | ---- | -------- |
| quantity       | number  | 否   | 数量     |
| sequenceNumber | integer | 否   | 排序号   |
| isRequired     | boolean | 否   | 是否必需 |
| remarks        | string  | 否   | 关联备注 |

**请求示例**:

```json
{
    "quantity": 2,
    "sequenceNumber": 5,
    "isRequired": true,
    "remarks": "数量调整为2个"
}
```

### 6. 新增子项模板（独立创建）

**接口地址**: `POST /erp/subsystem/item-template`

**接口描述**: 在公司子项库中创建新的子项模板（独立于子系统模板）

**权限标识**: `erp:subsystem:template:add`

**便捷功能**:

- ✨ **自动关联到模板**：如果提供了 `templateId` 参数，创建子项后会自动建立与该模板的关联关系
- 💡 **独立创建**：如果不提供 `templateId`，则创建纯独立子项，符合独立架构设计

**请求体参数**:

| 参数名          | 类型    | 必填 | 说明                                      |
| --------------- | ------- | ---- | ----------------------------------------- |
| templateId      | number  | 否   | 子系统模板 ID（可选，提供则自动创建关联） |
| itemCode        | string  | 否   | 子项编号（不传则自动生成）                |
| itemName        | string  | 是   | 子项名称                                  |
| itemType        | string  | 否   | 子项类型                                  |
| specification   | string  | 否   | 规格型号                                  |
| description     | string  | 否   | 描述                                      |
| defaultQuantity | number  | 否   | 默认数量，默认 1                          |
| unit            | string  | 否   | 单位，默认"个"                            |
| isRequired      | boolean | 否   | 是否必需，默认 true                       |
| sequenceNumber  | integer | 否   | 排序号，不传自动计算                      |
| remarks         | string  | 否   | 备注                                      |

**请求示例 1**（独立创建，不关联模板）:

```json
{
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

**请求示例 2**（创建并自动关联到模板）:

```json
{
    "templateId": 1,
    "itemName": "控制柜",
    "itemType": "电气设备",
    "specification": "PLC控制",
    "description": "主控制柜",
    "defaultQuantity": 1,
    "unit": "台",
    "isRequired": true,
    "remarks": "创建后自动关联到模板ID=1"
}
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "操作成功"
}
```

### 7. 批量新增子项模板

**接口地址**: `POST /erp/subsystem/item-template/batch`

**接口描述**: 批量在公司子项库中创建多个子项模板

**权限标识**: `erp:subsystem:template:add`

**请求体**: 子项模板对象数组

**请求示例**:

```json
[
    {
        "itemName": "压力容器",
        "itemType": "组件",
        "defaultQuantity": 1,
        "unit": "个"
    },
    {
        "itemName": "控制柜",
        "itemType": "组件",
        "defaultQuantity": 1,
        "unit": "个"
    }
]
```

### 8. 获取子项的物料列表

**接口地址**: `GET /erp/subsystem/item-template/{id}/materials`

**接口描述**: 获取指定子项模板的所有物料配置

**权限标识**: `erp:subsystem:template:query`

**路径参数**:

| 参数名 | 类型   | 必填 | 说明        |
| ------ | ------ | ---- | ----------- |
| id     | number | 是   | 子项模板 ID |

**请求示例**:

```bash
GET /erp/subsystem/item-template/10/materials
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
            "itemTemplateId": 10,
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

### 9. 生成子项编号

**接口地址**: `GET /erp/subsystem/item-template/generate-code`

**接口描述**: 生成下一个可用的子项编号（格式：ITEM-00001）

**权限标识**: 无

**请求示例**:

```bash
GET /erp/subsystem/item-template/generate-code
```

**响应示例**:

```json
{
    "code": 200,
    "msg": "查询成功",
    "data": "ITEM-00001"
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

1. **编号生成**: 格式为 `ITEM-{序号}` (如: ITEM-00001)，全局唯一
2. **独立管理**: 子项模板存储在公司级子项库中，独立于子系统模板
3. **复用性**: 同一个子项模板可以被多个子系统模板关联使用
4. **排序规则**: `sequenceNumber` 在子项库中标识顺序，关联到模板时可重新指定排序
5. **唯一性约束**: 全局范围内 `itemCode` 必须唯一
6. **默认值**:
   - `isRequired`: true
   - `defaultQuantity`: 1
   - `unit`: "个"
7. **删除限制**: 如果子项模板已被子系统模板关联，则无法删除

### 2. 物料模板规则

1. **关联关系**: 物料模板必须关联到已存在的子项模板
2. **物料信息**: 自动从基础物料库（`erp_material`）获取物料的编码、名称、规格等信息
3. **数量管理**: `defaultQuantity` 表示模板中的默认数量，应用到项目时可以调整
4. **删除级联**: 删除子项模板时，其关联的物料模板也会被删除

### 3. 数据流转流程

```
【阶段1：基础数据准备】
1. 在公司子项库中创建子项模板（独立）
   ↓
2. 为子项模板配置所需物料

【阶段2：模板配置】
3. 创建子系统模板
   ↓
4. 将子项模板关联到子系统模板（配置数量、排序等）
   ↓
5. 🔄 系统自动同步：子项物料复制到子系统物料表

【阶段3：项目应用】
6. 项目引用子系统模板
   ↓
7. 自动带入子项和物料配置
   ↓
8. 可以对物料进行增删改和数量调整
```

### 4. 物料自动同步机制（v2.1 新增）

**核心功能**：

- ✅ 添加子项时自动同步物料
- ✅ 移除子项时自动清理物料
- ✅ 保证数据一致性

**同步规则**：

1. **添加子项触发同步**

   - 查询子项模板的所有物料（`item_template_id = xxx`）
   - 复制物料到子系统物料表
   - 设置 `template_id` = 子系统模板 ID
   - 设置 `item_template_id` = 子项模板 ID
   - 避免重复添加（已存在则跳过）

2. **移除子项触发清理**

   - 删除条件：`template_id = xxx AND item_template_id = xxx`
   - 只清理该子项在该模板中的物料
   - 不影响其他模板或子项的物料

3. **数据隔离**
   - 子项模板的物料：`template_id` 可为空（独立存在）
   - 子系统模板的物料：`template_id` 必填（关联到模板）
   - 通过 `template_id` 区分不同模板的物料

**使用示例**：

```javascript
// 1. 为子项模板添加物料
await addMaterialTemplate({
    itemTemplateId: 10, // 子项模板ID
    materialId: 100, // 物料ID
    defaultQuantity: 500,
});

// 2. 将子项添加到模板（自动触发物料同步）
await addItemToTemplate(1, {
    // templateId = 1
    itemTemplateId: 10,
    quantity: 1,
});

// 此时系统会自动：
// - 查询子项10的所有物料
// - 复制到子系统模板1的物料表
// - 设置 template_id = 1, item_template_id = 10

// 3. 查询子系统模板的物料
const materials = await listMaterialTemplateByTemplateId(1);
// 返回：包含子项10的所有物料，且 template_id = 1

// 4. 移除子项（自动清理物料）
await removeItemFromTemplate(1, 10);
// 此时系统会自动删除 template_id=1 AND item_template_id=10 的所有物料
```

---

## 使用示例

### TypeScript API 定义

```typescript
import request from "@/utils/request";

/**
 * 子项模板表单对象（独立）
 */
export interface SubsystemItemTemplateForm {
    id?: number;
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
 * 模板-子项关联表单对象
 */
export interface TemplateItemRelForm {
    itemTemplateId: number;
    quantity?: number;
    sequenceNumber?: number;
    isRequired?: boolean;
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
 * 添加子项到模板
 */
export const addItemToTemplate = (
    templateId: number,
    data: TemplateItemRelForm
) => {
    return request({
        url: `/erp/subsystem/template/${templateId}/items`,
        method: "post",
        data: data,
    });
};

/**
 * 批量添加子项到模板
 */
export const batchAddItemsToTemplate = (
    templateId: number,
    data: TemplateItemRelForm[]
) => {
    return request({
        url: `/erp/subsystem/template/${templateId}/items/batch`,
        method: "post",
        data: data,
    });
};

/**
 * 从模板移除子项
 */
export const removeItemFromTemplate = (
    templateId: number,
    itemTemplateId: number
) => {
    return request({
        url: `/erp/subsystem/template/${templateId}/items/${itemTemplateId}`,
        method: "delete",
    });
};

/**
 * 批量从模板移除子项
 */
export const batchRemoveItemsFromTemplate = (
    templateId: number,
    itemTemplateIds: number[]
) => {
    return request({
        url: `/erp/subsystem/template/${templateId}/items`,
        method: "delete",
        data: itemTemplateIds,
    });
};

/**
 * 更新子项关联配置
 */
export const updateItemRelation = (
    templateId: number,
    itemTemplateId: number,
    data: TemplateItemRelForm
) => {
    return request({
        url: `/erp/subsystem/template/${templateId}/items/${itemTemplateId}`,
        method: "put",
        data: data,
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
export const generateItemCode = () => {
    return request({
        url: `/erp/subsystem/item-template/generate-code`,
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
// ========== 阶段1：创建公司基础数据 ==========

// 1. 在公司子项库中创建独立子项模板
await addItemTemplate({
    itemName: "压力容器",
    itemType: "组件",
    specification: "标准型",
    defaultQuantity: 1,
    unit: "个",
    isRequired: true,
});
// 假设创建后返回 ID: 10

// 2. 为子项模板配置物料
await addMaterialTemplateBatch([
    {
        templateId: 1, // 子系统模板ID（如果已知）
        itemTemplateId: 10,
        materialId: 100,
        defaultQuantity: 500,
        isRequired: true,
    },
    {
        templateId: 1,
        itemTemplateId: 10,
        materialId: 101,
        defaultQuantity: 4,
        isRequired: true,
    },
]);

// ========== 阶段2：配置子系统模板 ==========

// 3. 将子项模板关联到子系统模板
await addItemToTemplate(1, {
    itemTemplateId: 10,
    quantity: 1,
    sequenceNumber: 10,
    isRequired: true,
    remarks: "核心组件",
});

// 4. 批量关联多个子项
await batchAddItemsToTemplate(1, [
    {
        itemTemplateId: 10,
        quantity: 1,
        sequenceNumber: 10,
    },
    {
        itemTemplateId: 11,
        quantity: 1,
        sequenceNumber: 20,
    },
]);

// 5. 查看子系统模板的所有关联子项
const { data: templateItems } = await getTemplateItems(1);
console.log("模板子项列表:", templateItems);

// 6. 更新子项在模板中的配置
await updateItemRelation(1, 10, {
    quantity: 2, // 数量调整为2
    sequenceNumber: 5, // 调整排序
});

// 7. 从模板移除子项
await removeItemFromTemplate(1, 10);

// ========== 查询操作 ==========

// 8. 查询所有独立子项模板（公司子项库）
const { data: allItems } = await listItemTemplate();
console.log("子项库:", allItems);

// 9. 查看子项的物料列表
const { data: materials } = await getItemMaterials(10);
console.log("物料列表:", materials);
```

---

## 更新日志

| 版本 | 日期       | 修改内容                                           | 修改人  |
| ---- | ---------- | -------------------------------------------------- | ------- |
| v1.0 | 2025-11-05 | 初始版本，完成子项和物料模板接口                   | haitang |
| v2.0 | 2025-11-05 | 重构为独立架构，子项模板完全独立，新增关联管理接口 | haitang |
| v2.1 | 2025-11-06 | 新增物料自动同步机制，添加/移除子项时自动同步物料  | haitang |

---

**文档维护**: 后端开发团队  
**技术支持**: 如有疑问请联系后端开发团队  
**相关文档**:

- [子系统模板管理 API 文档](./子系统模板API文档.md)
- [子系统管理模块完整 API 文档](./子系统管理模块完整API文档.md)
