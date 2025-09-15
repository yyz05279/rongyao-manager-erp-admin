# 发货清单管理模块 API 接口文档

## 目录

- [1. 概述](#1-概述)
- [2. 基础信息](#2-基础信息)
- [3. 发货清单管理接口](#3-发货清单管理接口)
- [4. 发货清单明细接口](#4-发货清单明细接口)
- [5. Excel导入导出接口](#5-excel导入导出接口)
- [6. 统计分析接口](#6-统计分析接口)
- [7. 发货跟踪接口](#7-发货跟踪接口)
- [8. 附件管理接口](#8-附件管理接口)
- [9. 便捷查询接口](#9-便捷查询接口)
- [10. 数据类型定义](#10-数据类型定义)
- [11. 错误码说明](#11-错误码说明)
- [12. 最佳实践](#12-最佳实践)

## 1. 概述

发货清单管理模块是海棠企业管理系统化盐管理模块的重要组成部分，主要用于管理项目发货清单的全生命周期，包括清单创建、明细管理、状态跟踪、Excel导入导出、统计分析等功能。

### 1.1 功能特性

- **完整的CRUD操作**：支持发货清单的增删改查
- **Excel导入导出**：支持多种格式的Excel文件导入导出
- **状态管理**：完整的发货状态跟踪和管理
- **统计分析**：提供丰富的统计分析功能
- **附件管理**：支持装箱清单、照片等附件上传
- **权限控制**：基于角色的权限访问控制

### 1.2 技术规范

- **API设计**：遵循RESTful API设计规范
- **数据格式**：统一使用JSON格式进行数据交换
- **响应格式**：统一的响应数据结构
- **错误处理**：标准化的错误码和错误信息

## 2. 基础信息

### 2.1 基础URL

```
/api/erp/saltprocess/shipping
```

### 2.2 权限要求

所有接口都需要相应的权限才能访问：

- **查询权限**：`erp:saltprocess:shipping:query`
- **新增权限**：`erp:saltprocess:shipping:add`
- **编辑权限**：`erp:saltprocess:shipping:edit`
- **删除权限**：`erp:saltprocess:shipping:remove`
- **导出权限**：`erp:saltprocess:shipping:export`
- **导入权限**：`erp:saltprocess:shipping:import`

### 2.3 通用响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-03-15T10:30:00Z"
}
```

### 2.4 分页响应格式

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

## 3. 发货清单管理接口

### 3.1 查询发货清单列表

**接口描述**：分页查询发货清单列表，支持多种条件筛选

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/list`

**权限要求**：`erp:saltprocess:shipping:query`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页大小，默认10 |
| projectId | string | 否 | 项目ID |
| projectName | string | 否 | 项目名称（模糊查询） |
| listCode | string | 否 | 清单编号（模糊查询） |
| batchNumber | string | 否 | 批次号（模糊查询） |
| responsiblePerson | string | 否 | 负责人（模糊查询） |
| status | string | 否 | 发货状态 |
| equipmentType | string | 否 | 设备类型 |
| shippingDateStart | string | 否 | 发货开始日期 |
| shippingDateEnd | string | 否 | 发货结束日期 |

**请求示例**：

```http
GET /erp/saltprocess/shipping/list?pageNum=1&pageSize=10&projectName=淮安项目&status=PENDING
```

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "records": [
      {
        "id": "1001",
        "listCode": "SL202403001",
        "projectId": "P001",
        "projectName": "淮安化盐项目",
        "batchNumber": "第一车",
        "responsiblePerson": "张三",
        "responsiblePersonId": "U001",
        "shippingDate": "2024-03-15",
        "expectedDeliveryDate": "2024-03-18",
        "status": "PENDING",
        "shippingMethod": "TRUCK",
        "totalItems": 25,
        "totalWeight": 1500.5,
        "createTime": "2024-03-15T08:30:00Z"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

### 3.2 获取发货清单详情

**接口描述**：根据ID获取发货清单详细信息

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/{id}`

**权限要求**：`erp:saltprocess:shipping:query`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 发货清单ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/1001
```

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "1001",
    "listCode": "SL202403001",
    "projectId": "P001",
    "projectName": "淮安化盐项目",
    "batchNumber": "第一车",
    "responsiblePerson": "张三",
    "responsiblePersonId": "U001",
    "shippingDate": "2024-03-15",
    "expectedDeliveryDate": "2024-03-18",
    "actualDeliveryDate": null,
    "status": "PENDING",
    "shippingMethod": "TRUCK",
    "vehicleInfo": "苏A12345",
    "driverInfo": "李四 13800138000",
    "totalItems": 25,
    "totalWeight": 1500.5,
    "totalVolume": 12.8,
    "packingListPath": "/uploads/packing/SL202403001.pdf",
    "photoPath": "/uploads/photos/SL202403001.jpg",
    "remarks": "注意轻拿轻放",
    "createTime": "2024-03-15T08:30:00Z",
    "updateTime": "2024-03-15T09:15:00Z",
    "createBy": "admin",
    "updateBy": "admin"
  }
}
```

### 3.3 新增发货清单

**接口描述**：创建新的发货清单

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping`

**权限要求**：`erp:saltprocess:shipping:add`

**请求体**：

```json
{
  "projectId": "P001",
  "batchNumber": "第一车",
  "responsiblePersonId": "U001",
  "shippingDate": "2024-03-15",
  "expectedDeliveryDate": "2024-03-18",
  "shippingMethod": "TRUCK",
  "vehicleInfo": "苏A12345",
  "driverInfo": "李四 13800138000",
  "remarks": "注意轻拿轻放",
  "items": [
    {
      "itemName": "离心泵",
      "specification": "IS100-80-160",
      "equipmentType": "MECHANICAL",
      "quantity": 2,
      "unit": "台",
      "unitWeight": 150.5,
      "manufacturer": "上海水泵厂",
      "model": "IS100-80-160",
      "isFragile": false,
      "isHazardous": false
    }
  ]
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": null
}
```

### 3.4 修改发货清单

**接口描述**：更新发货清单信息

**HTTP方法**：`PUT`

**请求URL**：`/erp/saltprocess/shipping`

**权限要求**：`erp:saltprocess:shipping:edit`

**请求体**：

```json
{
  "id": "1001",
  "projectId": "P001",
  "batchNumber": "第一车",
  "responsiblePersonId": "U001",
  "shippingDate": "2024-03-15",
  "expectedDeliveryDate": "2024-03-18",
  "shippingMethod": "TRUCK",
  "vehicleInfo": "苏A12345",
  "driverInfo": "李四 13800138000",
  "remarks": "注意轻拿轻放",
  "items": []
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 3.5 删除发货清单

**接口描述**：删除一个或多个发货清单

**HTTP方法**：`DELETE`

**请求URL**：`/erp/saltprocess/shipping/{ids}`

**权限要求**：`erp:saltprocess:shipping:remove`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | string | 是 | 发货清单ID，多个ID用逗号分隔 |

**请求示例**：

```http
DELETE /erp/saltprocess/shipping/1001,1002
```

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 3.6 更新发货状态

**接口描述**：更新发货清单的状态

**HTTP方法**：`PUT`

**请求URL**：`/erp/saltprocess/shipping/{id}/status`

**权限要求**：`erp:saltprocess:shipping:edit`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 发货清单ID |

**请求体**：

```json
{
  "status": "SHIPPED",
  "remarks": "已发货，预计明天到达"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": null
}
```

## 4. 发货清单明细接口

### 4.1 查询发货清单明细

**接口描述**：获取指定发货清单的所有明细项

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/{shippingListId}/items`

**权限要求**：`erp:saltprocess:shipping:query`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shippingListId | string | 是 | 发货清单ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/1001/items
```

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "I001",
      "shippingListId": "1001",
      "itemCode": "PUMP001",
      "itemName": "离心泵",
      "specification": "IS100-80-160",
      "equipmentType": "MECHANICAL",
      "quantity": 2,
      "unit": "台",
      "unitWeight": 150.5,
      "totalWeight": 301.0,
      "manufacturer": "上海水泵厂",
      "model": "IS100-80-160",
      "serialNumber": "SP20240315001",
      "packageType": "木箱",
      "packageQuantity": 2,
      "isFragile": false,
      "isHazardous": false,
      "storageRequirement": "干燥通风",
      "remarks": "新设备",
      "createTime": "2024-03-15T08:30:00Z",
      "updateTime": "2024-03-15T08:30:00Z"
    }
  ]
}
```

### 4.2 批量添加发货清单明细

**接口描述**：为指定发货清单批量添加明细项

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping/{shippingListId}/items`

**权限要求**：`erp:saltprocess:shipping:add`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shippingListId | string | 是 | 发货清单ID |

**请求体**：

```json
[
  {
    "itemName": "离心泵",
    "specification": "IS100-80-160",
    "equipmentType": "MECHANICAL",
    "quantity": 2,
    "unit": "台",
    "unitWeight": 150.5,
    "manufacturer": "上海水泵厂",
    "model": "IS100-80-160",
    "isFragile": false,
    "isHazardous": false
  }
]
```

**响应示例**：

```json
{
  "code": 200,
  "message": "添加成功",
  "data": null
}
```

### 4.3 修改发货清单明细

**接口描述**：修改发货清单明细项信息

**HTTP方法**：`PUT`

**请求URL**：`/erp/saltprocess/shipping/item`

**权限要求**：`erp:saltprocess:shipping:edit`

**请求体**：

```json
{
  "id": "I001",
  "itemName": "离心泵",
  "specification": "IS100-80-160",
  "equipmentType": "MECHANICAL",
  "quantity": 3,
  "unit": "台",
  "unitWeight": 150.5,
  "manufacturer": "上海水泵厂",
  "model": "IS100-80-160",
  "isFragile": false,
  "isHazardous": false
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 4.4 删除发货清单明细

**接口描述**：删除一个或多个发货清单明细项

**HTTP方法**：`DELETE`

**请求URL**：`/erp/saltprocess/shipping/item/{ids}`

**权限要求**：`erp:saltprocess:shipping:remove`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | string | 是 | 明细项ID，多个ID用逗号分隔 |

**请求示例**：

```http
DELETE /erp/saltprocess/shipping/item/I001,I002
```

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 5. Excel导入导出接口

### 5.1 Excel模板下载

**接口描述**：下载指定类型的Excel导入模板

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/template/{templateType}`

**权限要求**：`erp:saltprocess:shipping:import`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| templateType | string | 是 | 模板类型：GENERAL/MECHANICAL/ELECTRICAL/PIPELINE/BURNER |

**请求示例**：

```http
GET /erp/saltprocess/shipping/template/MECHANICAL
```

**响应**：返回Excel文件流

### 5.2 Excel数据导入

**接口描述**：导入Excel文件数据到发货清单

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping/import`

**权限要求**：`erp:saltprocess:shipping:import`

**请求类型**：`multipart/form-data`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | Excel文件 |
| config | string | 是 | 导入配置JSON字符串 |

**配置参数示例**：

```json
{
  "fileType": "MECHANICAL",
  "sheetName": "Sheet1",
  "headerRow": 1,
  "columnMapping": {
    "itemName": "A",
    "specification": "B",
    "quantity": "C",
    "unit": "D",
    "unitWeight": "E"
  }
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "success": true,
    "totalRows": 10,
    "successRows": 8,
    "errorRows": 2,
    "errors": [
      {
        "row": 3,
        "field": "quantity",
        "message": "数量必须为正数"
      },
      {
        "row": 7,
        "field": "itemName",
        "message": "物品名称不能为空"
      }
    ],
    "data": []
  }
}
```

### 5.3 导出发货清单（批量导出）

**接口描述**：根据查询条件批量导出发货清单

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping/export`

**权限要求**：`erp:saltprocess:shipping:export`

**请求体**：

```json
{
  "exportType": "custom",
  "projectId": "P001",
  "dateRange": ["2024-03-01", "2024-03-31"],
  "status": "SHIPPED",
  "responsiblePersonId": "U001"
}
```

**响应**：返回Excel文件流

### 5.4 导出单个发货清单

**接口描述**：导出指定的单个发货清单

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/export/{id}`

**权限要求**：`erp:saltprocess:shipping:export`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 发货清单ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/export/1001
```

**响应**：返回Excel文件流

### 5.5 导出发货明细汇总

**接口描述**：导出发货明细的汇总数据

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping/export-items`

**权限要求**：`erp:saltprocess:shipping:export`

**请求体**：

```json
{
  "exportType": "custom",
  "projectId": "P001",
  "dateRange": ["2024-03-01", "2024-03-31"],
  "equipmentType": "MECHANICAL",
  "groupBy": "equipment_type"
}
```

**响应**：返回Excel文件流

## 6. 统计分析接口

### 6.1 获取发货统计数据

**接口描述**：获取发货清单的统计分析数据

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/statistics`

**权限要求**：`erp:saltprocess:shipping:query`

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| projectId | string | 否 | 项目ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/statistics?startDate=2024-03-01&endDate=2024-03-31&projectId=P001
```

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "totalLists": 15,
    "totalItems": 350,
    "totalWeight": 25600.5,
    "totalVolume": 180.2,
    "statusCounts": {
      "DRAFT": 2,
      "PENDING": 3,
      "SHIPPED": 8,
      "DELIVERED": 2,
      "COMPLETED": 0,
      "CANCELLED": 0
    },
    "equipmentTypeCounts": {
      "MECHANICAL": 120,
      "ELECTRICAL": 80,
      "PIPELINE": 100,
      "BURNER": 30,
      "AUXILIARY": 20
    },
    "monthlyShippingTrend": [
      {
        "month": "2024-01",
        "count": 5,
        "weight": 8500.2
      },
      {
        "month": "2024-02",
        "count": 8,
        "weight": 12300.8
      },
      {
        "month": "2024-03",
        "count": 2,
        "weight": 4800.5
      }
    ]
  }
}
```

## 7. 发货跟踪接口

### 7.1 获取发货跟踪记录

**接口描述**：获取指定发货清单的跟踪记录

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/{shippingListId}/tracking`

**权限要求**：`erp:saltprocess:shipping:query`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shippingListId | string | 是 | 发货清单ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/1001/tracking
```

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "T001",
      "shippingListId": "1001",
      "status": "PENDING",
      "statusTime": "2024-03-15T08:30:00Z",
      "location": "上海仓库",
      "operator": "张三",
      "operatorId": "U001",
      "remarks": "清单创建完成，等待发货",
      "createTime": "2024-03-15T08:30:00Z"
    },
    {
      "id": "T002",
      "shippingListId": "1001",
      "status": "SHIPPED",
      "statusTime": "2024-03-16T10:00:00Z",
      "location": "上海-淮安高速",
      "operator": "李四",
      "operatorId": "U002",
      "remarks": "货物已发出，预计明天到达",
      "createTime": "2024-03-16T10:00:00Z"
    }
  ]
}
```

### 7.2 添加发货跟踪记录

**接口描述**：为发货清单添加新的跟踪记录

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping/tracking`

**权限要求**：`erp:saltprocess:shipping:edit`

**请求体**：

```json
{
  "shippingListId": "1001",
  "status": "DELIVERED",
  "statusTime": "2024-03-17T14:30:00Z",
  "location": "淮安项目现场",
  "operator": "王五",
  "operatorId": "U003",
  "remarks": "货物已送达现场，客户签收确认"
}
```

**响应示例**：

```json
{
  "code": 200,
  "message": "跟踪记录添加成功",
  "data": null
}
```

## 8. 附件管理接口

### 8.1 获取发货清单附件列表

**接口描述**：获取指定发货清单的所有附件

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/{shippingListId}/attachments`

**权限要求**：`erp:saltprocess:shipping:query`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shippingListId | string | 是 | 发货清单ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/1001/attachments
```

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "A001",
      "shippingListId": "1001",
      "fileName": "装箱清单.pdf",
      "filePath": "/uploads/attachments/2024/03/15/packing_list_001.pdf",
      "fileSize": 2048576,
      "fileType": "application/pdf",
      "attachmentType": "PACKING_LIST",
      "uploadTime": "2024-03-15T09:00:00Z",
      "uploadBy": "admin"
    },
    {
      "id": "A002",
      "shippingListId": "1001",
      "fileName": "发货照片.jpg",
      "filePath": "/uploads/attachments/2024/03/15/shipping_photo_001.jpg",
      "fileSize": 1024768,
      "fileType": "image/jpeg",
      "attachmentType": "PHOTO",
      "uploadTime": "2024-03-15T10:30:00Z",
      "uploadBy": "admin"
    }
  ]
}
```

### 8.2 上传发货清单附件

**接口描述**：为发货清单上传附件文件

**HTTP方法**：`POST`

**请求URL**：`/erp/saltprocess/shipping/{shippingListId}/attachment`

**权限要求**：`erp:saltprocess:shipping:edit`

**请求类型**：`multipart/form-data`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shippingListId | string | 是 | 发货清单ID |

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 附件文件 |
| attachmentType | string | 是 | 附件类型：PACKING_LIST/PHOTO/DOCUMENT/OTHER |

**响应示例**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": "A003",
    "shippingListId": "1001",
    "fileName": "质量证书.pdf",
    "filePath": "/uploads/attachments/2024/03/15/quality_cert_001.pdf",
    "fileSize": 512000,
    "fileType": "application/pdf",
    "attachmentType": "DOCUMENT",
    "uploadTime": "2024-03-15T11:00:00Z",
    "uploadBy": "admin"
  }
}
```

### 8.3 删除发货清单附件

**接口描述**：删除指定的附件文件

**HTTP方法**：`DELETE`

**请求URL**：`/erp/saltprocess/shipping/attachment/{id}`

**权限要求**：`erp:saltprocess:shipping:remove`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 附件ID |

**请求示例**：

```http
DELETE /erp/saltprocess/shipping/attachment/A003
```

**响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 8.4 下载发货清单附件

**接口描述**：下载指定的附件文件

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/shipping/attachment/{id}/download`

**权限要求**：`erp:saltprocess:shipping:query`

**路径参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 附件ID |

**请求示例**：

```http
GET /erp/saltprocess/shipping/attachment/A001/download
```

**响应**：返回文件流

## 9. 便捷查询接口

### 9.1 获取项目简化列表

**接口描述**：获取项目的简化列表，用于下拉选择

**HTTP方法**：`GET`

**请求URL**：`/erp/saltprocess/project/simple-list`

**权限要求**：`erp:saltprocess:shipping:query`

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "P001",
      "name": "淮安化盐项目"
    },
    {
      "id": "P002",
      "name": "苏州化盐项目"
    }
  ]
}
```

### 9.2 获取负责人简化列表

**接口描述**：获取负责人的简化列表，用于下拉选择

**HTTP方法**：`GET`

**请求URL**：`/system/user/simple-list`

**权限要求**：`erp:saltprocess:shipping:query`

**响应示例**：

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "U001",
      "name": "张三"
    },
    {
      "id": "U002",
      "name": "李四"
    }
  ]
}
```

## 10. 数据类型定义

### 10.1 枚举类型

#### 发货状态 (ShippingStatus)

| 值 | 说明 |
|---|---|
| DRAFT | 草稿 |
| PENDING | 待发货 |
| PARTIAL_SHIPPED | 部分发货 |
| SHIPPED | 已发货 |
| DELIVERED | 已送达 |
| COMPLETED | 已完成 |
| CANCELLED | 已取消 |

#### 设备类型 (EquipmentType)

| 值 | 说明 |
|---|---|
| MECHANICAL | 机械设备 |
| ELECTRICAL | 电控设备 |
| PIPELINE | 管路设备 |
| BURNER | 燃烧器 |
| AUXILIARY | 辅助设备 |
| STANDARD_PARTS | 标准件 |

#### 发货方式 (ShippingMethod)

| 值 | 说明 |
|---|---|
| TRUCK | 卡车运输 |
| RAIL | 铁路运输 |
| SEA | 海运 |
| AIR | 空运 |

#### 附件类型 (AttachmentType)

| 值 | 说明 |
|---|---|
| PACKING_LIST | 装箱清单 |
| PHOTO | 照片 |
| DOCUMENT | 文档 |
| OTHER | 其他 |

### 10.2 主要数据结构

#### 发货清单 (ShippingListVO)

```typescript
interface ShippingListVO {
  id: string;                        // 清单ID
  listCode: string;                  // 清单编号
  projectId: string;                 // 项目ID
  projectName: string;               // 项目名称
  batchNumber: string;               // 批次号
  responsiblePerson: string;         // 负责人
  responsiblePersonId: string;       // 负责人ID
  shippingDate: string;              // 发货日期
  expectedDeliveryDate?: string;     // 预计送达日期
  actualDeliveryDate?: string;       // 实际送达日期
  status: ShippingStatus;            // 发货状态
  shippingMethod: ShippingMethod;    // 发货方式
  vehicleInfo?: string;              // 车辆信息
  driverInfo?: string;               // 司机信息
  totalItems: number;                // 总件数
  totalWeight: number;               // 总重量(kg)
  totalVolume?: number;              // 总体积(m³)
  packingListPath?: string;          // 装箱清单文件路径
  photoPath?: string;                // 发货照片路径
  remarks?: string;                  // 备注
  createTime: string;                // 创建时间
  updateTime: string;                // 更新时间
  createBy: string;                  // 创建人
  updateBy?: string;                 // 更新人
}
```

#### 发货清单明细 (ShippingItemVO)

```typescript
interface ShippingItemVO {
  id: string;                        // 明细ID
  shippingListId: string;            // 发货清单ID
  itemCode?: string;                 // 物品编码
  itemName: string;                  // 物品名称
  specification?: string;            // 规格型号
  equipmentType: EquipmentType;      // 设备类型
  quantity: number;                  // 数量
  unit: string;                      // 单位
  unitWeight?: number;               // 单重(kg)
  totalWeight?: number;              // 总重(kg)
  unitVolume?: number;               // 单体积(m³)
  totalVolume?: number;              // 总体积(m³)
  manufacturer?: string;             // 制造商
  model?: string;                    // 型号
  serialNumber?: string;             // 序列号
  packageType?: string;              // 包装方式
  packageQuantity?: number;          // 包装件数
  isFragile: boolean;                // 是否易碎
  isHazardous: boolean;              // 是否危险品
  storageRequirement?: string;       // 存储要求
  remarks?: string;                  // 备注
  createTime: string;                // 创建时间
  updateTime: string;                // 更新时间
}
```

## 11. 错误码说明

### 11.1 通用错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 操作成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权访问 | 检查登录状态和访问令牌 |
| 403 | 权限不足 | 联系管理员分配相应权限 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 500 | 服务器内部错误 | 联系技术支持 |

### 11.2 业务错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 10001 | 发货清单不存在 | 检查发货清单ID是否正确 |
| 10002 | 发货清单已发货，无法修改 | 只能修改草稿或待发货状态的清单 |
| 10003 | 发货清单明细不能为空 | 至少添加一个发货明细项 |
| 10004 | 项目不存在 | 检查项目ID是否正确 |
| 10005 | 负责人不存在 | 检查负责人ID是否正确 |
| 10006 | 发货日期不能早于当前日期 | 调整发货日期 |
| 10007 | 预计送达日期不能早于发货日期 | 调整预计送达日期 |
| 10008 | 物品数量必须大于0 | 检查物品数量设置 |
| 10009 | Excel文件格式不正确 | 使用正确的Excel模板文件 |
| 10010 | 附件文件大小超出限制 | 压缩文件或分割上传 |
| 10011 | 不支持的文件类型 | 使用支持的文件格式 |
| 10012 | 发货清单编号已存在 | 使用不同的清单编号 |

### 11.3 错误响应格式

```json
{
  "code": 10001,
  "message": "发货清单不存在",
  "data": null,
  "timestamp": "2024-03-15T10:30:00Z",
  "path": "/erp/saltprocess/shipping/1001"
}
```

## 12. 最佳实践

### 12.1 接口调用建议

#### 1. 认证和权限
- 所有API调用都需要在请求头中包含有效的访问令牌
- 确保用户具有相应的功能权限
- 定期刷新访问令牌以避免过期

```javascript
// 请求头示例
const headers = {
  'Authorization': 'Bearer your-access-token',
  'Content-Type': 'application/json'
};
```

#### 2. 分页查询优化
- 合理设置页面大小，建议10-50条记录
- 使用索引字段进行排序以提高性能
- 避免查询过大的数据集

```javascript
// 分页查询示例
const query = {
  pageNum: 1,
  pageSize: 20,
  orderBy: 'createTime',
  orderDirection: 'desc'
};
```

#### 3. 数据验证
- 前端进行基础数据验证，减少无效请求
- 后端进行完整的数据验证和业务规则检查
- 提供清晰的错误提示信息

#### 4. 文件上传处理
- 限制文件大小和类型
- 使用进度条显示上传进度
- 支持断点续传和重试机制

```javascript
// 文件上传示例
const formData = new FormData();
formData.append('file', file);
formData.append('attachmentType', 'PACKING_LIST');

const config = {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onUploadProgress: (progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`上传进度: ${progress}%`);
  }
};
```

### 12.2 性能优化建议

#### 1. 缓存策略
- 对不经常变化的数据（如项目列表、用户列表）进行缓存
- 使用适当的缓存过期时间
- 在数据更新时及时清除相关缓存

#### 2. 批量操作
- 尽量使用批量接口减少网络请求次数
- 合理控制批量操作的数据量
- 提供批量操作的进度反馈

#### 3. 异步处理
- 对于耗时操作（如大文件导入导出）使用异步处理
- 提供任务状态查询接口
- 支持任务取消功能

### 12.3 安全建议

#### 1. 数据安全
- 敏感数据传输使用HTTPS协议
- 对重要操作进行日志记录
- 定期备份重要数据

#### 2. 访问控制
- 实施最小权限原则
- 定期审查用户权限
- 监控异常访问行为

#### 3. 输入验证
- 对所有用户输入进行验证和过滤
- 防止SQL注入和XSS攻击
- 使用参数化查询

### 12.4 错误处理

#### 1. 统一错误处理
- 使用统一的错误响应格式
- 提供有意义的错误信息
- 记录详细的错误日志

#### 2. 重试机制
- 对网络错误实施自动重试
- 使用指数退避算法
- 设置合理的重试次数和超时时间

#### 3. 用户体验
- 提供友好的错误提示
- 支持错误恢复操作
- 避免暴露系统内部信息

---

## 总结

本文档详细描述了发货清单管理模块的所有API接口，包括：

1. **完整的CRUD操作**：涵盖发货清单和明细的增删改查
2. **Excel导入导出**：支持多种格式和灵活配置
3. **状态管理**：完整的发货状态跟踪
4. **统计分析**：丰富的数据统计功能
5. **附件管理**：支持多种类型的附件上传下载
6. **权限控制**：基于角色的访问控制

开发人员在使用这些接口时，应该：
- 遵循RESTful API设计规范
- 实施适当的错误处理和重试机制
- 注意数据安全和权限控制
- 优化性能和用户体验

如有疑问或需要技术支持，请联系开发团队。
