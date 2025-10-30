# 二元化盐记录管理系统 API 接口文档

## 文档概述

本文档描述了二元化盐记录管理系统的完整API接口，包括所有CRUD操作、统计分析、数据导入导出等功能。系统采用RESTful API设计，支持JSON格式的数据交换。

## 基础信息

- **API版本**: v1.0
- **基础URL**: `/erp/saltprocess/binary-record`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token

## 通用响应格式

所有API接口都遵循统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 接口总览

| 序号 | 接口名称 | HTTP方法 | 接口路径 | 功能描述 |
|------|----------|----------|----------|----------|
| 1 | 获取记录列表 | GET | `/list` | 分页查询记录列表，支持筛选 |
| 2 | 获取记录详情 | GET | `/{id}` | 根据ID获取单条记录详情 |
| 3 | 新增记录 | POST | `/` | 创建新的记录 |
| 4 | 更新记录 | PUT | `/` | 更新现有记录 |
| 5 | 删除记录 | DELETE | `/{ids}` | 删除指定记录（支持批量） |
| 6 | 导出记录 | POST | `/export` | 导出记录数据为Excel |
| 7 | 获取统计数据 | GET | `/statistics-data` | 获取统计分析图表数据 |
| 8 | 批量删除 | DELETE | `/batch` | 批量删除多条记录 |
| 9 | 按批次查询 | GET | `/batch/{batchNumber}` | 根据批次号查询记录 |
| 10 | 按项目查询 | GET | `/project/{projectId}` | 根据项目ID查询记录 |
| 11 | 按日期范围查询 | GET | `/date-range` | 根据日期范围查询记录 |
| 12 | 获取最新记录 | GET | `/latest/{projectId}` | 获取项目最新记录 |
| 13 | 统计记录数量 | GET | `/count` | 统计指定时间范围记录数 |
| 14 | 数据导入 | POST | `/import` | 通过文件上传导入数据 |
| 15 | 批量导入验证 | POST | `/validate-batch` | 验证批量导入数据 |
| 16 | 下载导入模板 | GET | `/template` | 下载Excel导入模板 |
| 17 | 生成记录编码 | GET | `/generate-code` | 自动生成记录编码 |
| 18 | 检查记录编码 | GET | `/check-code` | 检查编码是否存在 |
| 19 | 获取项目列表 | GET | `/projects` | 获取可用项目列表 |
| 20 | 获取操作员列表 | GET | `/operators` | 获取可用操作员列表 |
| 21 | 配比分析 | GET | `/ratio-analysis/{recordId}` | 获取配比分析数据 |
| 22 | 产量趋势 | GET | `/output-trend` | 获取产量趋势数据 |
| 23 | 质量分析 | GET | `/quality-analysis` | 获取质量分析数据 |
| 24 | 成本分析 | GET | `/cost-analysis` | 获取成本分析数据 |
| 25 | 效率分析 | GET | `/efficiency-analysis` | 获取效率分析数据 |

## 核心接口

### 1. 获取记录列表

**接口描述**: 分页查询二元化盐记录列表，支持多种筛选条件

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/list`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页大小，默认10 |
| recordCode | string | 否 | 记录编码（模糊查询） |
| batchNumber | string | 否 | 批次号（模糊查询） |
| projectId | number | 否 | 项目ID |
| recordDate | string | 否 | 记录日期（YYYY-MM-DD） |
| startDate | string | 否 | 开始日期（YYYY-MM-DD） |
| endDate | string | 否 | 结束日期（YYYY-MM-DD） |
| shift | number | 否 | 班次（1-白班，2-夜班） |
| ratioStatus | string | 否 | 配比状态（normal/abnormal） |
| qualityGrade | number | 否 | 质量等级（1-4） |
| recorderName | string | 否 | 记录人姓名 |
| operatorName | string | 否 | 操作人姓名 |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/list?pageNum=1&pageSize=10&projectId=101&ratioStatus=normal
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 100,
    "rows": [
      {
        "id": "1",
        "recordCode": "BIN_1733097600_001",
        "batchNumber": "BATCH_20241201_001",
        "projectId": 101,
        "recordDate": "2024-12-01",
        "shift": 1,
        "nano3ActualWeight": 3600,
        "kno3ActualWeight": 2400,
        "moltenSaltLevel": 2.5,
        "moltenSaltTemperature": 565,
        "gasConsumption": 1200,
        "powerConsumption": 850,
        "staffCount": 8,
        "recorderName": "张三",
        "qualityGrade": 1,
        "createTime": "2024-12-01 08:00:00"
      }
    ]
  }
}
```

### 2. 获取记录详情

**接口描述**: 根据记录ID获取单条记录的详细信息

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/{id}`
- **方法**: GET

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 记录ID |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/1
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "1",
    "recordCode": "BIN_1733097600_001",
    "batchNumber": "BATCH_20241201_001",
    "projectId": 101,
    "recordDate": "2024-12-01",
    "startTime": "08:00:00",
    "endTime": "16:00:00",
    "duration": 480,
    "shift": 1,
    "nano3TargetRatio": 60.0,
    "nano3ActualRatio": 60.2,
    "nano3TargetWeight": 3600,
    "nano3ActualWeight": 3612,
    "kno3TargetRatio": 40.0,
    "kno3ActualRatio": 39.8,
    "kno3TargetWeight": 2400,
    "kno3ActualWeight": 2388,
    "ratioDeviation": 0.2,
    "totalWeight": 6000,
    "moltenSaltLevel": 2.5,
    "moltenSaltTemperature": 565,
    "gasConsumption": 1200,
    "powerConsumption": 850,
    "staffCount": 8,
    "operatorId": 1001,
    "operatorName": "张三",
    "recorderName": "张三",
    "qualityGrade": 1,
    "remarks": "正常生产",
    "createTime": "2024-12-01 08:00:00",
    "updateTime": "2024-12-01 16:00:00"
  }
}
```

### 3. 新增记录

**接口描述**: 创建新的二元化盐记录

**请求信息**:
- **URL**: `POST /erp/saltprocess/binary-record`
- **方法**: POST
- **Content-Type**: application/json

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| recordCode | string | 是 | 记录编码 |
| batchNumber | string | 是 | 批次号 |
| projectId | number | 是 | 项目ID |
| recordDate | string | 是 | 记录日期（YYYY-MM-DD） |
| startTime | string | 是 | 开始时间（HH:mm:ss） |
| endTime | string | 是 | 结束时间（HH:mm:ss） |
| shift | number | 是 | 班次（1-白班，2-夜班） |
| nano3ActualWeight | number | 是 | 硝酸钠实际用量(kg) |
| kno3ActualWeight | number | 是 | 硝酸钾实际用量(kg) |
| moltenSaltLevel | number | 否 | 熔盐液位(m) |
| moltenSaltTemperature | number | 否 | 熔盐温度(℃) |
| gasConsumption | number | 否 | 天然气消耗(Nm³) |
| powerConsumption | number | 否 | 电量消耗(KWh) |
| staffCount | number | 否 | 人员数量 |
| operatorId | number | 是 | 操作员ID |
| recorderName | string | 否 | 记录人姓名 |
| remarks | string | 否 | 备注 |

**请求示例**:
```json
{
  "recordCode": "BIN_1733097600_002",
  "batchNumber": "BATCH_20241201_002",
  "projectId": 101,
  "recordDate": "2024-12-01",
  "startTime": "16:00:00",
  "endTime": "00:00:00",
  "shift": 2,
  "nano3ActualWeight": 3580,
  "kno3ActualWeight": 2420,
  "moltenSaltLevel": 2.3,
  "moltenSaltTemperature": 570,
  "gasConsumption": 1180,
  "powerConsumption": 820,
  "staffCount": 6,
  "operatorId": 1002,
  "recorderName": "李四",
  "remarks": "夜班生产"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "新增成功",
  "data": {
    "id": "2",
    "recordCode": "BIN_1733097600_002"
  }
}
```

### 4. 更新记录

**接口描述**: 更新现有的二元化盐记录

**请求信息**:
- **URL**: `PUT /erp/saltprocess/binary-record`
- **方法**: PUT
- **Content-Type**: application/json

**请求体参数**: 与新增记录相同，但需要包含id字段

**请求示例**:
```json
{
  "id": "2",
  "recordCode": "BIN_1733097600_002",
  "batchNumber": "BATCH_20241201_002",
  "projectId": 101,
  "recordDate": "2024-12-01",
  "startTime": "16:00:00",
  "endTime": "00:00:00",
  "shift": 2,
  "nano3ActualWeight": 3600,
  "kno3ActualWeight": 2400,
  "moltenSaltLevel": 2.4,
  "moltenSaltTemperature": 575,
  "gasConsumption": 1200,
  "powerConsumption": 850,
  "staffCount": 7,
  "operatorId": 1002,
  "recorderName": "李四",
  "remarks": "更新后的记录"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

### 5. 删除记录

**接口描述**: 删除指定的二元化盐记录（支持单个或批量删除）

**请求信息**:
- **URL**: `DELETE /erp/saltprocess/binary-record/{ids}`
- **方法**: DELETE

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | string | 是 | 记录ID，多个ID用逗号分隔 |

**请求示例**:
```http
DELETE /erp/saltprocess/binary-record/1,2,3
```

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 6. 导出记录

**接口描述**: 根据查询条件导出二元化盐记录数据

**请求信息**:
- **URL**: `POST /erp/saltprocess/binary-record/export`
- **方法**: POST
- **Content-Type**: application/json
- **Response-Type**: blob

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| exportType | string | 否 | 导出类型（excel/csv），默认excel |
| fileName | string | 否 | 文件名 |
| recordCode | string | 否 | 记录编码筛选 |
| projectId | number | 否 | 项目ID筛选 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| ratioStatus | string | 否 | 配比状态筛选 |

**请求示例**:
```json
{
  "exportType": "excel",
  "fileName": "二元化盐记录_20241201.xlsx",
  "projectId": 101,
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "ratioStatus": "normal"
}
```

**响应**: 返回Excel文件的二进制数据流

### 7. 获取统计分析数据

**接口描述**: 获取用于统计分析图表的数据

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/statistics-data`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| timeRange | string | 否 | 时间范围（7days/30days/3months/custom） |
| startDate | string | 否 | 开始日期（timeRange为custom时必填） |
| endDate | string | 否 | 结束日期（timeRange为custom时必填） |
| projectId | number | 否 | 项目ID筛选 |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/statistics-data?timeRange=30days&projectId=101
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "overview": {
      "totalSalt": 180.5,
      "avgGas": 1200,
      "avgPower": 850,
      "avgStaff": 7.2,
      "normalRatio": 85.5
    },
    "chartData": {
      "dates": ["2024-12-01", "2024-12-02", "2024-12-03"],
      "nano3Data": [3600, 3580, 3000],
      "kno3Data": [2400, 2420, 3000],
      "gasData": [1200, 1180, 1250],
      "powerData": [850, 820, 880],
      "staffData": [8, 6, 9]
    }
  }
}
```

## 业务规则

### 配比验证规则

1. **标准配比**: 硝酸钠:硝酸钾 = 6:4 (±5%允许偏差)
2. **配比计算**: 实际配比 = 实际用量 / 总用量 × 100%
3. **偏差计算**: 配比偏差 = |实际配比 - 目标配比|
4. **状态判定**: 偏差 ≤ 5% 为正常，> 5% 为异常

### 质量等级标准

| 等级 | 数值 | 说明 | 配比偏差范围 |
|------|------|------|-------------|
| 优秀 | 1 | 配比精确，质量优良 | ≤ 2% |
| 良好 | 2 | 配比良好，质量合格 | 2% < 偏差 ≤ 5% |
| 合格 | 3 | 配比可接受，需要关注 | 5% < 偏差 ≤ 10% |
| 不合格 | 4 | 配比异常，需要调整 | > 10% |

### 数据验证规则

1. **必填字段**: recordCode, batchNumber, projectId, recordDate, operatorId
2. **数值范围**: 
   - 用量数据 > 0
   - 温度范围: 500-600℃
   - 液位范围: 1.0-5.0m
   - 人员数量: 1-20人
3. **日期格式**: YYYY-MM-DD
4. **时间格式**: HH:mm:ss

## 错误处理

### 常见错误码

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 400001 | 参数验证失败 | 请求参数不符合要求 |
| 400002 | 记录编码已存在 | 记录编码重复 |
| 400003 | 配比数据异常 | 配比偏差超出允许范围 |
| 404001 | 记录不存在 | 指定的记录ID不存在 |
| 500001 | 数据库操作失败 | 服务器内部错误 |

### 错误响应示例

```json
{
  "code": 400001,
  "message": "参数验证失败：硝酸钠用量不能为空",
  "data": null
}
```

## 接口调用示例

### JavaScript/TypeScript 调用示例

```typescript
import axios from 'axios';

// 获取记录列表
const getRecordList = async (params: BinaryRecordQuery) => {
  try {
    const response = await axios.get('/erp/saltprocess/binary-record/list', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('获取记录列表失败:', error);
    throw error;
  }
};

// 新增记录
const addRecord = async (data: BinaryRecordForm) => {
  try {
    const response = await axios.post('/erp/saltprocess/binary-record', data);
    return response.data;
  } catch (error) {
    console.error('新增记录失败:', error);
    throw error;
  }
};

// 获取统计数据
const getStatistics = async (params: StatisticsQuery) => {
  try {
    const response = await axios.get('/erp/saltprocess/binary-record/statistics-data', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
};
```

## 版本更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2024-12-01 | 初始版本，包含基础CRUD和统计分析功能 |

---

**注意事项**:
1. 所有时间字段均使用服务器时区
2. 数值字段保留2位小数
3. 批量操作建议单次不超过1000条记录
4. 导出功能支持最大10万条记录
5. 统计分析数据实时计算，大数据量查询可能较慢

## 扩展接口

### 8. 批量删除记录

**接口描述**: 批量删除多条记录

**请求信息**:
- **URL**: `DELETE /erp/saltprocess/binary-record/batch`
- **方法**: DELETE
- **Content-Type**: application/json

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | string[] | 是 | 要删除的记录ID数组 |

**请求示例**:
```json
{
  "ids": ["1", "2", "3", "4", "5"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "批量删除成功，共删除5条记录",
  "data": {
    "successCount": 5,
    "failureCount": 0
  }
}
```

### 9. 根据批次号查询记录

**接口描述**: 根据批次号查询相关的所有记录

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/batch/{batchNumber}`
- **方法**: GET

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| batchNumber | string | 是 | 批次号 |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/batch/BATCH_20241201_001
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "1",
      "recordCode": "BIN_1733097600_001",
      "batchNumber": "BATCH_20241201_001",
      "projectId": 101,
      "recordDate": "2024-12-01",
      "shift": 1,
      "nano3ActualWeight": 3600,
      "kno3ActualWeight": 2400,
      "qualityGrade": 1
    }
  ]
}
```

### 10. 根据项目ID查询记录

**接口描述**: 查询指定项目的所有记录

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/project/{projectId}`
- **方法**: GET

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | number | 是 | 项目ID |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/project/101
```

### 11. 根据日期范围查询记录

**接口描述**: 查询指定日期范围内的记录

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/date-range`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期（YYYY-MM-DD） |
| endDate | string | 是 | 结束日期（YYYY-MM-DD） |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/date-range?startDate=2024-12-01&endDate=2024-12-31
```

### 12. 获取最新记录

**接口描述**: 获取指定项目的最新记录

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/latest/{projectId}`
- **方法**: GET

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | number | 是 | 项目ID |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/latest/101
```

### 13. 统计记录数量

**接口描述**: 统计指定时间范围内的记录数量

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/count`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/count?startDate=2024-12-01&endDate=2024-12-31
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": 156
}
```

### 14. 数据导入

**接口描述**: 通过文件上传方式导入记录数据

**请求信息**:
- **URL**: `POST /erp/saltprocess/binary-record/import`
- **方法**: POST
- **Content-Type**: multipart/form-data

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | Excel文件 |

**响应示例**:
```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "totalCount": 100,
    "successCount": 95,
    "failureCount": 5,
    "errors": [
      {
        "row": 10,
        "message": "记录编码已存在"
      }
    ]
  }
}
```

### 15. 批量导入验证

**接口描述**: 验证批量导入的数据是否符合要求

**请求信息**:
- **URL**: `POST /erp/saltprocess/binary-record/validate-batch`
- **方法**: POST
- **Content-Type**: application/json

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| records | BinaryRecordForm[] | 是 | 要验证的记录数组 |

**请求示例**:
```json
{
  "records": [
    {
      "recordCode": "BIN_1733097600_003",
      "batchNumber": "BATCH_20241201_003",
      "projectId": 101,
      "recordDate": "2024-12-01",
      "startTime": "08:00:00",
      "endTime": "16:00:00",
      "shift": 1,
      "nano3ActualWeight": 3600,
      "kno3ActualWeight": 2400,
      "operatorId": 1001
    }
  ]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证完成",
  "data": {
    "isValid": true,
    "totalCount": 1,
    "validCount": 1,
    "invalidCount": 0,
    "errors": [],
    "warnings": [
      {
        "rowIndex": 0,
        "field": "ratioDeviation",
        "message": "配比偏差较大，建议检查"
      }
    ]
  }
}
```

### 16. 下载导入模板

**接口描述**: 下载数据导入的Excel模板文件

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/template`
- **方法**: GET
- **Response-Type**: blob

**请求示例**:
```http
GET /erp/saltprocess/binary-record/template
```

**响应**: 返回Excel模板文件的二进制数据流

### 17. 生成记录编码

**接口描述**: 根据项目ID和日期自动生成记录编码

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/generate-code`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | number | 是 | 项目ID |
| recordDate | string | 是 | 记录日期（YYYY-MM-DD） |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/generate-code?projectId=101&recordDate=2024-12-01
```

**响应示例**:
```json
{
  "code": 200,
  "message": "生成成功",
  "data": "BIN_1733097600_004"
}
```

### 18. 检查记录编码

**接口描述**: 检查记录编码是否已存在

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/check-code`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| recordCode | string | 是 | 记录编码 |

**请求示例**:
```http
GET /erp/saltprocess/binary-record/check-code?recordCode=BIN_1733097600_001
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": true
}
```

### 19. 获取项目列表

**接口描述**: 获取可用的项目列表（用于下拉选择）

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/projects`
- **方法**: GET

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 101,
      "name": "项目A"
    },
    {
      "id": 102,
      "name": "项目B"
    }
  ]
}
```

### 20. 获取操作员列表

**接口描述**: 获取可用的操作员列表（用于下拉选择）

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/operators`
- **方法**: GET

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1001,
      "name": "张三"
    },
    {
      "id": 1002,
      "name": "李四"
    }
  ]
}
```

## 统计分析专用接口

### 21. 获取配比分析数据

**接口描述**: 获取指定记录的配比分析详情

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/ratio-analysis/{recordId}`
- **方法**: GET

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| recordId | string | 是 | 记录ID |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "recordId": "1",
    "nano3Analysis": {
      "targetRatio": 60.0,
      "actualRatio": 60.2,
      "deviation": 0.2,
      "deviationPercentage": 0.33,
      "isWithinTolerance": true
    },
    "kno3Analysis": {
      "targetRatio": 40.0,
      "actualRatio": 39.8,
      "deviation": -0.2,
      "deviationPercentage": -0.5,
      "isWithinTolerance": true
    },
    "overallDeviation": 0.2,
    "qualityImpact": "配比偏差在正常范围内，对质量影响较小",
    "recommendations": [
      "继续保持当前配比控制精度",
      "定期校准计量设备"
    ]
  }
}
```

### 22. 获取产量趋势数据

**接口描述**: 获取指定时间范围内的产量趋势数据

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/output-trend`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "date": "2024-12-01",
      "targetOutput": 6000,
      "actualOutput": 5950,
      "yieldRate": 99.17,
      "qualityGrade": 1
    },
    {
      "date": "2024-12-02",
      "targetOutput": 6000,
      "actualOutput": 5980,
      "yieldRate": 99.67,
      "qualityGrade": 1
    }
  ]
}
```

### 23. 获取质量分析数据

**接口描述**: 获取指定时间范围内的质量分析数据

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/quality-analysis`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "period": "2024-12-01 至 2024-12-31",
    "totalRecords": 100,
    "qualityDistribution": {
      "excellent": 60,
      "good": 25,
      "qualified": 12,
      "unqualified": 3
    },
    "averagePurity": 98.5,
    "averageMoistureContent": 0.8,
    "qualityTrends": [
      {
        "date": "2024-12-01",
        "purity": 98.2,
        "moistureContent": 0.9,
        "qualityGrade": 1
      }
    ],
    "qualityIssues": [
      {
        "issue": "配比偏差过大",
        "frequency": 5,
        "impact": "影响产品质量等级"
      }
    ]
  }
}
```

### 24. 获取成本分析数据

**接口描述**: 获取指定时间范围内的成本分析数据

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/cost-analysis`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "period": "2024-12-01 至 2024-12-31",
    "totalCost": 125000.50,
    "costBreakdown": {
      "materialCost": 80000.00,
      "energyCost": 30000.50,
      "laborCost": 15000.00
    },
    "costPerKg": 2.08,
    "costTrends": [
      {
        "date": "2024-12-01",
        "totalCost": 4200.00,
        "costPerKg": 2.10
      }
    ],
    "costOptimizationSuggestions": [
      "优化配比控制，减少原料浪费",
      "提高设备运行效率，降低能源消耗"
    ]
  }
}
```

### 25. 获取效率分析数据

**接口描述**: 获取指定时间范围内的效率分析数据

**请求信息**:
- **URL**: `GET /erp/saltprocess/binary-record/efficiency-analysis`
- **方法**: GET

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 是 | 开始日期 |
| endDate | string | 是 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "period": "2024-12-01 至 2024-12-31",
    "averageYieldRate": 98.5,
    "averageReactionTime": 480,
    "averageEnergyConsumption": 850,
    "efficiencyTrends": [
      {
        "date": "2024-12-01",
        "yieldRate": 99.17,
        "reactionTime": 480,
        "energyConsumption": 850
      }
    ],
    "efficiencyBottlenecks": [
      "反应时间控制不够精确",
      "能源消耗偏高"
    ],
    "improvementSuggestions": [
      "优化反应温度控制",
      "改进搅拌工艺参数"
    ]
  }
}
```

## 数据模型详解

### BinaryRecordVO 完整字段说明

| 字段名 | 类型 | 说明 | 示例值 |
|--------|------|------|--------|
| id | string | 记录唯一标识 | "1" |
| recordCode | string | 记录编码 | "BIN_1733097600_001" |
| batchNumber | string | 批次号 | "BATCH_20241201_001" |
| projectId | number | 项目ID | 101 |
| recordDate | string | 记录日期 | "2024-12-01" |
| startTime | string | 开始时间 | "08:00:00" |
| endTime | string | 结束时间 | "16:00:00" |
| duration | number | 持续时间(分钟) | 480 |
| shift | number | 班次(1-白班,2-夜班) | 1 |
| nano3TargetRatio | number | 硝酸钠目标配比(%) | 60.0 |
| nano3ActualRatio | number | 硝酸钠实际配比(%) | 60.2 |
| nano3TargetWeight | number | 硝酸钠目标用量(kg) | 3600 |
| nano3ActualWeight | number | 硝酸钠实际用量(kg) | 3612 |
| kno3TargetRatio | number | 硝酸钾目标配比(%) | 40.0 |
| kno3ActualRatio | number | 硝酸钾实际配比(%) | 39.8 |
| kno3TargetWeight | number | 硝酸钾目标用量(kg) | 2400 |
| kno3ActualWeight | number | 硝酸钾实际用量(kg) | 2388 |
| ratioDeviation | number | 配比偏差(%) | 0.2 |
| totalWeight | number | 总重量(kg) | 6000 |
| moltenSaltLevel | number | 熔盐液位(m) | 2.5 |
| moltenSaltTemperature | number | 熔盐温度(℃) | 565 |
| gasConsumption | number | 天然气消耗(Nm³) | 1200 |
| powerConsumption | number | 电量消耗(KWh) | 850 |
| staffCount | number | 人员数量 | 8 |
| qualityGrade | number | 质量等级(1-4) | 1 |
| operatorId | number | 操作员ID | 1001 |
| operatorName | string | 操作员姓名 | "张三" |
| recorderName | string | 记录人姓名 | "张三" |
| remarks | string | 备注 | "正常生产" |
| createTime | string | 创建时间 | "2024-12-01 08:00:00" |
| updateTime | string | 更新时间 | "2024-12-01 16:00:00" |

### 统计分析数据结构

#### StatisticsResponse 结构说明

```typescript
interface StatisticsResponse {
  overview: {
    totalSalt: number;      // 总化盐量(t)
    avgGas: number;         // 平均气耗(Nm³)
    avgPower: number;       // 平均电耗(KWh)
    avgStaff: number;       // 平均人数
    normalRatio: number;    // 正常配比率(%)
  };
  chartData: {
    dates: string[];        // 日期数组
    nano3Data: number[];    // 硝酸钠用量数据
    kno3Data: number[];     // 硝酸钾用量数据
    gasData: number[];      // 天然气消耗数据
    powerData: number[];    // 电量消耗数据
    staffData: number[];    // 人员数据
  };
}
```

## 性能优化建议

### 1. 分页查询优化

- 建议每页大小不超过100条记录
- 大数据量查询时使用索引字段进行筛选
- 避免使用 `SELECT *`，只查询必要字段

### 2. 统计分析优化

- 统计分析接口建议使用缓存机制
- 大时间范围查询可能较慢，建议分批处理
- 实时性要求不高的统计数据可以使用定时任务预计算

### 3. 导出功能优化

- 大量数据导出建议使用异步处理
- 支持分批导出，避免内存溢出
- 导出文件建议压缩处理

## 安全注意事项

### 1. 数据验证

- 所有输入参数必须进行严格验证
- 防止SQL注入攻击
- 限制文件上传大小和类型

### 2. 权限控制

- 接口调用需要有效的认证令牌
- 不同角色用户有不同的操作权限
- 敏感操作需要二次确认

### 3. 数据安全

- 重要数据变更需要记录操作日志
- 支持数据备份和恢复
- 定期清理过期数据

## 集成示例

### Vue.js + TypeScript 完整示例

```typescript
// api/binaryRecord.ts
import request from '@/utils/request';
import type {
  BinaryRecordQuery,
  BinaryRecordVO,
  BinaryRecordForm,
  StatisticsQuery,
  StatisticsResponse,
  ApiResponse,
  PageResponse
} from './types';

export class BinaryRecordAPI {
  // 获取记录列表
  static async getList(params: BinaryRecordQuery): Promise<ApiResponse<PageResponse<BinaryRecordVO>>> {
    return request.get('/erp/saltprocess/binary-record/list', { params });
  }

  // 获取记录详情
  static async getDetail(id: string): Promise<ApiResponse<BinaryRecordVO>> {
    return request.get(`/erp/saltprocess/binary-record/${id}`);
  }

  // 新增记录
  static async create(data: BinaryRecordForm): Promise<ApiResponse<BinaryRecordVO>> {
    return request.post('/erp/saltprocess/binary-record', data);
  }

  // 更新记录
  static async update(data: BinaryRecordForm): Promise<ApiResponse> {
    return request.put('/erp/saltprocess/binary-record', data);
  }

  // 删除记录
  static async delete(ids: string | string[]): Promise<ApiResponse> {
    const idStr = Array.isArray(ids) ? ids.join(',') : ids;
    return request.delete(`/erp/saltprocess/binary-record/${idStr}`);
  }

  // 获取统计数据
  static async getStatistics(params: StatisticsQuery): Promise<ApiResponse<StatisticsResponse>> {
    return request.get('/erp/saltprocess/binary-record/statistics-data', { params });
  }

  // 导出数据
  static async export(params: any): Promise<Blob> {
    return request.post('/erp/saltprocess/binary-record/export', params, {
      responseType: 'blob'
    });
  }
}
```

### React + TypeScript 示例

```typescript
// hooks/useBinaryRecord.ts
import { useState, useEffect } from 'react';
import { BinaryRecordAPI } from '../api/binaryRecord';
import type { BinaryRecordVO, BinaryRecordQuery } from '../types';

export const useBinaryRecord = () => {
  const [records, setRecords] = useState<BinaryRecordVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchRecords = async (params: BinaryRecordQuery) => {
    setLoading(true);
    try {
      const response = await BinaryRecordAPI.getList(params);
      if (response.code === 200) {
        setRecords(response.data.rows);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('获取记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (data: BinaryRecordForm) => {
    try {
      const response = await BinaryRecordAPI.create(data);
      if (response.code === 200) {
        // 刷新列表
        await fetchRecords({});
        return true;
      }
    } catch (error) {
      console.error('创建记录失败:', error);
    }
    return false;
  };

  return {
    records,
    loading,
    total,
    fetchRecords,
    createRecord
  };
};
```

## 测试用例

### 1. 单元测试示例

```typescript
// tests/binaryRecord.test.ts
import { BinaryRecordAPI } from '../api/binaryRecord';

describe('BinaryRecord API', () => {
  test('should get record list successfully', async () => {
    const params = {
      pageNum: 1,
      pageSize: 10,
      projectId: 101
    };

    const response = await BinaryRecordAPI.getList(params);

    expect(response.code).toBe(200);
    expect(response.data.rows).toBeInstanceOf(Array);
    expect(response.data.total).toBeGreaterThanOrEqual(0);
  });

  test('should create record successfully', async () => {
    const recordData = {
      recordCode: 'TEST_001',
      batchNumber: 'BATCH_TEST_001',
      projectId: 101,
      recordDate: '2024-12-01',
      startTime: '08:00:00',
      endTime: '16:00:00',
      shift: 1,
      nano3ActualWeight: 3600,
      kno3ActualWeight: 2400,
      operatorId: 1001
    };

    const response = await BinaryRecordAPI.create(recordData);

    expect(response.code).toBe(200);
    expect(response.data.recordCode).toBe('TEST_001');
  });
});
```

### 2. 集成测试示例

```typescript
// tests/integration.test.ts
describe('Binary Record Integration Tests', () => {
  test('complete CRUD operations', async () => {
    // 1. 创建记录
    const createResponse = await BinaryRecordAPI.create(testData);
    expect(createResponse.code).toBe(200);
    const recordId = createResponse.data.id;

    // 2. 获取记录详情
    const detailResponse = await BinaryRecordAPI.getDetail(recordId);
    expect(detailResponse.code).toBe(200);
    expect(detailResponse.data.recordCode).toBe(testData.recordCode);

    // 3. 更新记录
    const updateData = { ...testData, id: recordId, remarks: '更新测试' };
    const updateResponse = await BinaryRecordAPI.update(updateData);
    expect(updateResponse.code).toBe(200);

    // 4. 删除记录
    const deleteResponse = await BinaryRecordAPI.delete(recordId);
    expect(deleteResponse.code).toBe(200);
  });
});
```

## 常见问题解答

### Q1: 如何处理大量数据的分页查询？

A: 建议使用以下策略：
- 设置合理的页面大小（建议10-50条）
- 使用索引字段进行筛选
- 避免深度分页，使用游标分页
- 考虑使用虚拟滚动技术

### Q2: 统计分析接口响应慢怎么办？

A: 可以采用以下优化方案：
- 使用Redis缓存热点数据
- 实现数据预聚合
- 使用异步处理大数据量统计
- 分时段查询，避免一次性查询大量数据

### Q3: 如何保证数据的一致性？

A: 建议采用以下措施：
- 使用数据库事务确保操作原子性
- 实现乐观锁防止并发修改
- 重要操作添加操作日志
- 定期进行数据校验

### Q4: 导入功能如何处理错误数据？

A: 系统提供以下机制：
- 数据验证预检查
- 错误数据详细报告
- 支持部分导入成功
- 提供错误数据修正建议

## 更新日志

| 版本 | 日期 | 更新内容 | 影响范围 |
|------|------|----------|----------|
| v1.0.0 | 2024-12-01 | 初始版本发布 | 全部接口 |
| v1.0.1 | 2024-12-02 | 增加批量操作接口 | 删除、导入接口 |
| v1.0.2 | 2024-12-03 | 优化统计分析性能 | 统计分析接口 |
| v1.1.0 | 2024-12-04 | 新增扩展分析功能 | 新增分析接口 |

## 技术支持

**开发团队联系方式**:
- 邮箱: dev-team@company.com
- 技术支持群: 企业微信群
- 文档更新: 每周五更新

**API状态监控**:
- 监控地址: https://status.company.com/api
- 服务可用性: 99.9%
- 响应时间: < 200ms (95%)
