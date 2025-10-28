# 物料清单明细批量更新接口文档

## 接口概述

本文档描述物料清单明细的批量更新接口，支持前端一次性传入多个物料明细进行批量修改。

## 接口路径说明

系统提供了两套接口路径来管理物料清单明细：

### 🔵 物料清单模块接口（推荐）

- **基础路径**：`/erp/saltprocess/material/item`
- **控制器**：`ErpMaterialController`
- **业务场景**：物料清单相关的业务操作

### 🟢 发货清单模块接口

- **基础路径**：`/erp/shipping/item`
- **控制器**：`ErpShippingItemController`
- **业务场景**：发货清单相关的业务操作

> **注意**：虽然两套接口底层操作的是同一张数据表，但从业务角度建议：
>
> - 物料清单相关功能使用 `/erp/saltprocess/material/item` 路径
> - 发货清单相关功能使用 `/erp/shipping/item` 路径

## 接口信息

### 批量更新物料明细（物料清单模块）

**接口地址**：`PUT /erp/saltprocess/material/item/batch`

**请求方式**：PUT

**权限要求**：`erp:material:item:edit`

**接口描述**：批量更新物料清单明细信息

---

### 批量更新物料明细（发货清单模块）

**接口地址**：`PUT /erp/shipping/item/batch`

**请求方式**：PUT

**权限要求**：`erp:shipping:item:edit`

**接口描述**：批量更新发货清单明细信息

## 请求参数

### 请求头

```
Content-Type: application/json
Authorization: Bearer {token}
```

### 请求体

```json
[
    {
        "id": 1,
        "shippingListId": 100,
        "itemCode": "ITEM001",
        "itemName": "设备A",
        "specification": "规格型号A",
        "equipmentType": "电气设备",
        "quantity": 10,
        "unit": "台",
        "unitWeight": 50.5,
        "totalWeight": 505.0,
        "unitVolume": 2.5,
        "totalVolume": 25.0,
        "manufacturer": "制造商A",
        "model": "型号A",
        "serialNumber": "SN001",
        "productionDate": "2024-01-01",
        "isFragile": 0,
        "isHazardous": 0,
        "packagingMethod": "木箱",
        "remarks": "备注信息",
        "version": 1
    },
    {
        "id": 2,
        "shippingListId": 100,
        "itemCode": "ITEM002",
        "itemName": "设备B",
        "specification": "规格型号B",
        "equipmentType": "机械设备",
        "quantity": 5,
        "unit": "台",
        "unitWeight": 100.0,
        "totalWeight": 500.0,
        "unitVolume": 5.0,
        "totalVolume": 25.0,
        "manufacturer": "制造商B",
        "model": "型号B",
        "serialNumber": "SN002",
        "productionDate": "2024-01-02",
        "isFragile": 1,
        "isHazardous": 0,
        "packagingMethod": "纸箱",
        "remarks": "易碎品",
        "version": 1
    }
]
```

### 字段说明

| 字段名          | 类型       | 必填 | 说明                         |
| --------------- | ---------- | ---- | ---------------------------- |
| id              | Long       | 是   | 物料明细 ID（必须提供）      |
| shippingListId  | Long       | 否   | 发货清单 ID                  |
| itemCode        | String     | 否   | 物品编码                     |
| itemName        | String     | 否   | 物品名称                     |
| specification   | String     | 否   | 规格型号                     |
| equipmentType   | String     | 否   | 设备类型                     |
| quantity        | Integer    | 否   | 数量                         |
| unit            | String     | 否   | 单位                         |
| unitWeight      | BigDecimal | 否   | 单重（kg）                   |
| totalWeight     | BigDecimal | 否   | 总重（kg）                   |
| unitVolume      | BigDecimal | 否   | 单体积（m³）                 |
| totalVolume     | BigDecimal | 否   | 总体积（m³）                 |
| manufacturer    | String     | 否   | 制造商                       |
| model           | String     | 否   | 型号                         |
| serialNumber    | String     | 否   | 序列号                       |
| productionDate  | String     | 否   | 生产日期（格式：yyyy-MM-dd） |
| isFragile       | Integer    | 否   | 是否易碎品（0-否，1-是）     |
| isHazardous     | Integer    | 否   | 是否危险品（0-否，1-是）     |
| packagingMethod | String     | 否   | 包装方式                     |
| remarks         | String     | 否   | 备注                         |
| version         | Integer    | 是   | 版本号（用于乐观锁）         |

## 响应参数

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
    "msg": "操作失败",
    "data": null
}
```

## 业务逻辑说明

### 更新流程

1. **参数验证**

   - 检查更新数据是否为空
   - 验证每条记录的 id 是否存在
   - 对每条记录进行数据校验

2. **数据校验**

   - 物品编码唯一性校验（如果提供）
   - 序列号唯一性校验（如果提供）
   - 必填字段验证

3. **批量更新**

   - 逐条更新物料明细
   - 记录成功和失败的数量
   - 只要有一条成功就返回成功

4. **异常处理**
   - 单条记录失败不影响其他记录
   - 记录失败原因并继续处理
   - 最终返回处理结果统计

### 注意事项

1. **必填字段**

   - `id`：物料明细 ID 必须提供，用于定位要更新的记录
   - `version`：版本号用于乐观锁控制，防止并发更新冲突

2. **数据校验**

   - 物品编码在同一发货清单中必须唯一
   - 序列号在全局范围内必须唯一
   - 数据格式必须符合要求

3. **事务处理**

   - 批量更新在事务中执行
   - 如果所有记录都失败，事务回滚
   - 如果有成功的记录，事务提交

4. **性能考虑**
   - 建议单次批量更新不超过 100 条记录
   - 对于大批量更新，建议分批处理

## 使用示例

### TypeScript/JavaScript 示例

```typescript
import request from "@/utils/request";

/**
 * 批量更新物料明细
 * @param items 物料明细数组
 */
export function batchUpdateShippingItems(items: any[]): Promise<any> {
    return request({
        url: "/erp/shipping/item/batch",
        method: "put",
        data: items,
    });
}

// 使用示例
const itemsToUpdate = [
    {
        id: 1,
        itemName: "更新后的设备A",
        quantity: 15,
        remarks: "数量已更新",
        version: 1,
    },
    {
        id: 2,
        itemName: "更新后的设备B",
        quantity: 8,
        remarks: "数量已更新",
        version: 1,
    },
];

batchUpdateShippingItems(itemsToUpdate)
    .then((response) => {
        console.log("批量更新成功", response);
    })
    .catch((error) => {
        console.error("批量更新失败", error);
    });
```

### Java 测试示例

```java
@Test
public void testBatchUpdate() {
    List<ErpShippingItemBo> boList = new ArrayList<>();

    // 第一条记录
    ErpShippingItemBo bo1 = new ErpShippingItemBo();
    bo1.setId(1L);
    bo1.setItemName("更新后的设备A");
    bo1.setQuantity(15);
    bo1.setRemarks("数量已更新");
    bo1.setVersion(1);
    boList.add(bo1);

    // 第二条记录
    ErpShippingItemBo bo2 = new ErpShippingItemBo();
    bo2.setId(2L);
    bo2.setItemName("更新后的设备B");
    bo2.setQuantity(8);
    bo2.setRemarks("数量已更新");
    bo2.setVersion(1);
    boList.add(bo2);

    Boolean result = shippingItemService.batchUpdate(boList);
    assertTrue(result);
}
```

## 错误码说明

| 错误码 | 说明           | 解决方案                                   |
| ------ | -------------- | ------------------------------------------ |
| 200    | 操作成功       | -                                          |
| 400    | 请求参数错误   | 检查请求参数是否符合要求                   |
| 401    | 未授权         | 检查 Token 是否有效                        |
| 403    | 无权限         | 检查用户是否有`erp:shipping:item:edit`权限 |
| 500    | 服务器内部错误 | 查看服务器日志，联系管理员                 |

## 业务异常说明

| 异常信息         | 说明                 | 解决方案                     |
| ---------------- | -------------------- | ---------------------------- |
| 更新数据不能为空 | 请求体中没有数据     | 确保传入至少一条要更新的记录 |
| 物料明细 ID 为空 | 某条记录缺少 id 字段 | 确保每条记录都包含有效的 id  |
| 物品编码已存在   | 物品编码重复         | 修改物品编码或移除重复项     |
| 序列号已存在     | 序列号重复           | 修改序列号或移除重复项       |
| 物料明细不存在   | 指定 ID 的记录不存在 | 确认记录 ID 是否正确         |
| 版本号冲突       | 记录已被其他用户修改 | 重新查询最新数据后再更新     |

## 相关接口

### 物料清单模块接口

- 查询明细列表：`GET /erp/saltprocess/material/item/list`
- 根据清单 ID 查询：`GET /erp/saltprocess/material/item/list/by-material-list/{shippingListId}`
- 查询明细详情：`GET /erp/saltprocess/material/item/{id}`
- 新增明细：`POST /erp/saltprocess/material/item`
- 单条更新：`PUT /erp/saltprocess/material/item`
- 批量新增：`POST /erp/saltprocess/material/item/batch`
- 批量更新：`PUT /erp/saltprocess/material/item/batch`
- 删除明细：`DELETE /erp/saltprocess/material/item/{ids}`
- 更新数量：`PUT /erp/saltprocess/material/item/{id}/quantity`
- 查询易碎品：`GET /erp/saltprocess/material/item/fragile/{shippingListId}`
- 查询危险品：`GET /erp/saltprocess/material/item/hazardous/{shippingListId}`
- 设备类型统计：`GET /erp/saltprocess/material/item/statistics/equipment-type/{shippingListId}`
- 制造商统计：`GET /erp/saltprocess/material/item/statistics/manufacturer/{shippingListId}`
- 设备明细汇总：`GET /erp/saltprocess/material/item/summary`
- 导出明细：`POST /erp/saltprocess/material/item/export`

### 发货清单模块接口

- 查询明细列表：`GET /erp/shipping/item/list`
- 根据清单 ID 查询：`GET /erp/shipping/item/list/by-shipping-list/{shippingListId}`
- 查询明细详情：`GET /erp/shipping/item/{id}`
- 新增明细：`POST /erp/shipping/item`
- 单条更新：`PUT /erp/shipping/item`
- 批量新增：`POST /erp/shipping/item/batch`
- 批量更新：`PUT /erp/shipping/item/batch`
- 删除明细：`DELETE /erp/shipping/item/{ids}`
- 更新数量：`PUT /erp/shipping/item/{id}/quantity`

## 版本历史

| 版本 | 日期       | 修改内容                                          | 作者    |
| ---- | ---------- | ------------------------------------------------- | ------- |
| v1.1 | 2025-10-28 | 新增物料清单模块独立接口（ErpMaterialController） | haitang |
| v1.0 | 2025-10-28 | 新增批量更新接口                                  | haitang |

## 联系方式

如有问题，请联系技术支持团队。
