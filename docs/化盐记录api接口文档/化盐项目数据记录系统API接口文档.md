# 化盐项目数据记录与分析系统 API 接口文档

## 文档概述

本文档详细描述了化盐项目数据记录与分析系统的所有API接口，包括预热数据记录、二元化盐记录、三元化盐记录和数据分析等模块的完整接口规范。

### 基础信息

- **系统名称**: 化盐项目数据记录与分析系统
- **API版本**: v1.0
- **基础URL**: `http://localhost:8080`
- **认证方式**: SaToken
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

#### 成功响应
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    // 具体数据内容
  }
}
```

#### 分页响应
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    // 数据列表
  ],
  "total": 100
}
```

#### 错误响应
```json
{
  "code": 500,
  "msg": "操作失败",
  "data": null
}
```

### 权限说明

所有API接口都需要相应的权限验证，权限格式为：`erp:saltprocess:{module}:{action}`

## 1. 预热数据记录模块 API

### 1.1 查询预热数据记录列表

**接口路径**: `GET /erp/saltprocess/preheating-record/list`

**权限要求**: `erp:saltprocess:preheating-record:list`

**请求参数**:
- **查询参数** (Query Parameters):
  - `pageNum` (integer, optional): 页码，默认1
  - `pageSize` (integer, optional): 每页大小，默认10
  - `recordCode` (string, optional): 记录编码
  - `taskId` (integer, optional): 任务ID
  - `projectId` (integer, optional): 项目ID
  - `tankNumber` (string, optional): 熔盐罐编号
  - `recordDate` (string, optional): 记录日期 (yyyy-MM-dd)
  - `qualityStatus` (integer, optional): 质量状态 (1-正常,2-异常,3-待检查)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "id": 1,
      "recordCode": "PRH20250911001",
      "taskId": 1001,
      "projectId": 2001,
      "tankNumber": "TANK001",
      "recordDate": "2025-09-11",
      "recordTime": "14:30:00",
      "shift": 1,
      "targetTemperature": 450.00,
      "actualTemperature": 448.50,
      "temperatureDeviation": -1.50,
      "heatingRate": 25.5,
      "targetPressure": 2.5,
      "actualPressure": 2.48,
      "pressureDeviation": -0.02,
      "heatingPower": 1200.00,
      "heatingEfficiency": 85.6,
      "equipmentStatus": 1,
      "alarmStatus": 0,
      "energyConsumption": 2580.5,
      "hourlyConsumption": 52.4,
      "operatorId": 3001,
      "operatorName": "张三",
      "supervisorId": 3002,
      "supervisorName": "李四",
      "qualityStatus": 1,
      "deviationReason": null,
      "correctiveAction": null,
      "remarks": "预热过程正常",
      "createTime": "2025-09-11T14:30:00"
    }
  ],
  "total": 1
}
```

### 1.2 获取预热数据记录详情

**接口路径**: `GET /erp/saltprocess/preheating-record/{id}`

**权限要求**: `erp:saltprocess:preheating-record:query`

**路径参数**:
- `id` (integer, required): 记录ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "recordCode": "PRH20250911001",
    // ... 完整的记录详情
  }
}
```

### 1.3 新增预热数据记录

**接口路径**: `POST /erp/saltprocess/preheating-record`

**权限要求**: `erp:saltprocess:preheating-record:add`

**请求体**:
```json
{
  "recordCode": "PRH20250911002",
  "taskId": 1001,
  "projectId": 2001,
  "tankNumber": "TANK001",
  "recordDate": "2025-09-11",
  "recordTime": "15:30:00",
  "shift": 1,
  "targetTemperature": 450.00,
  "actualTemperature": 449.20,
  "heatingRate": 26.0,
  "targetPressure": 2.5,
  "actualPressure": 2.52,
  "heatingPower": 1250.00,
  "heatingEfficiency": 86.2,
  "equipmentStatus": 1,
  "alarmStatus": 0,
  "energyConsumption": 2650.8,
  "hourlyConsumption": 53.2,
  "operatorId": 3001,
  "operatorName": "张三",
  "supervisorId": 3002,
  "supervisorName": "李四",
  "qualityStatus": 1,
  "remarks": "预热过程正常"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

### 1.4 修改预热数据记录

**接口路径**: `PUT /erp/saltprocess/preheating-record`

**权限要求**: `erp:saltprocess:preheating-record:edit`

**请求体**: 与新增接口相同，但需要包含 `id` 字段

### 1.5 删除预热数据记录

**接口路径**: `DELETE /erp/saltprocess/preheating-record/{ids}`

**权限要求**: `erp:saltprocess:preheating-record:remove`

**路径参数**:
- `ids` (string, required): 记录ID数组，多个ID用逗号分隔，如 "1,2,3"

### 1.6 根据任务ID查询记录

**接口路径**: `GET /erp/saltprocess/preheating-record/task/{taskId}`

**权限要求**: `erp:saltprocess:preheating-record:query`

**路径参数**:
- `taskId` (integer, required): 任务ID

### 1.7 根据项目ID查询记录

**接口路径**: `GET /erp/saltprocess/preheating-record/project/{projectId}`

**权限要求**: `erp:saltprocess:preheating-record:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

### 1.8 根据日期范围查询记录

**接口路径**: `GET /erp/saltprocess/preheating-record/date-range`

**权限要求**: `erp:saltprocess:preheating-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期 (yyyy-MM-dd)
- `endDate` (string, required): 结束日期 (yyyy-MM-dd)

### 1.9 根据熔盐罐编号查询记录

**接口路径**: `GET /erp/saltprocess/preheating-record/tank/{tankNumber}`

**权限要求**: `erp:saltprocess:preheating-record:query`

**路径参数**:
- `tankNumber` (string, required): 熔盐罐编号

### 1.10 查询最新记录

**接口路径**: `GET /erp/saltprocess/preheating-record/latest/{taskId}`

**权限要求**: `erp:saltprocess:preheating-record:query`

**路径参数**:
- `taskId` (integer, required): 任务ID

### 1.11 统计记录数量

**接口路径**: `GET /erp/saltprocess/preheating-record/count`

**权限要求**: `erp:saltprocess:preheating-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

### 1.12 导出数据

**接口路径**: `POST /erp/saltprocess/preheating-record/export`

**权限要求**: `erp:saltprocess:preheating-record:export`

**请求体**: 查询条件对象（与列表查询相同）

**响应**: Excel文件下载

### 1.13 导入数据

**接口路径**: `POST /erp/saltprocess/preheating-record/import`

**权限要求**: `erp:saltprocess:preheating-record:import`

**请求**: multipart/form-data
- `file` (file, required): Excel文件

### 1.14 获取导入模板

**接口路径**: `POST /erp/saltprocess/preheating-record/importTemplate`

**响应**: Excel模板文件下载

## 2. 二元化盐记录模块 API

### 2.1 查询二元化盐记录列表

**接口路径**: `GET /erp/saltprocess/binary-making-record/list`

**权限要求**: `erp:saltprocess:binary-making-record:list`

**请求参数**: 与预热数据记录类似，额外包含：
- `batchNumber` (string, optional): 批次号
- `qualityGrade` (integer, optional): 质量等级 (1-优秀,2-良好,3-合格,4-不合格)
- `qualityCheckResult` (integer, optional): 质量检查结果 (1-合格,2-不合格,3-待检查)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "id": 1,
      "recordCode": "BIN20250911001",
      "taskId": 1001,
      "projectId": 2001,
      "batchNumber": "BATCH20250911001",
      "recordDate": "2025-09-11",
      "startTime": "2025-09-11T08:00:00",
      "endTime": "2025-09-11T16:00:00",
      "duration": 8.0,
      "shift": 1,
      "nano3TargetRatio": 60.00,
      "kno3TargetRatio": 40.00,
      "nano3ActualRatio": 59.80,
      "kno3ActualRatio": 40.20,
      "ratioDeviation": 0.20,
      "nano3TargetWeight": 6000.00,
      "kno3TargetWeight": 4000.00,
      "nano3ActualWeight": 5980.00,
      "kno3ActualWeight": 4020.00,
      "totalWeight": 10000.00,
      "reactionTemperature": 320.00,
      "reactionTime": 6.5,
      "stirringSpeed": 120.0,
      "heatingPower": 800.00,
      "phValue": 7.2,
      "density": 2.168,
      "moistureContent": 0.5,
      "purity": 99.2,
      "targetOutput": 9500.00,
      "actualOutput": 9480.00,
      "yieldRate": 99.79,
      "operatorId": 3001,
      "operatorName": "张三",
      "supervisorId": 3002,
      "supervisorName": "李四",
      "qualityGrade": 1,
      "qualityCheckResult": 1,
      "qualityIssues": null,
      "correctiveActions": null,
      "materialCost": 15000.00,
      "energyCost": 2500.00,
      "laborCost": 1200.00,
      "totalCost": 18700.00,
      "remarks": "生产过程正常",
      "createTime": "2025-09-11T16:30:00"
    }
  ],
  "total": 1
}
```

### 2.2 其他基础CRUD接口

二元化盐记录模块的基础CRUD接口（获取详情、新增、修改、删除、导入导出）与预热数据记录模块类似，只需将URL路径中的 `preheating-record` 替换为 `binary-making-record`，权限中的 `preheating-record` 替换为 `binary-making-record`。

### 2.3 特有查询接口

#### 2.3.1 根据批次号查询记录

**接口路径**: `GET /erp/saltprocess/binary-making-record/batch/{batchNumber}`

**权限要求**: `erp:saltprocess:binary-making-record:query`

**路径参数**:
- `batchNumber` (string, required): 批次号

#### 2.3.2 根据质量等级查询记录

**接口路径**: `GET /erp/saltprocess/binary-making-record/quality-grade/{qualityGrade}`

**权限要求**: `erp:saltprocess:binary-making-record:query`

**路径参数**:
- `qualityGrade` (integer, required): 质量等级 (1-优秀,2-良好,3-合格,4-不合格)

#### 2.3.3 统计总产量

**接口路径**: `GET /erp/saltprocess/binary-making-record/total-output`

**权限要求**: `erp:saltprocess:binary-making-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 95000.00
}
```

#### 2.3.4 统计平均产出率

**接口路径**: `GET /erp/saltprocess/binary-making-record/avg-yield-rate`

**权限要求**: `erp:saltprocess:binary-making-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

#### 2.3.5 统计总成本

**接口路径**: `GET /erp/saltprocess/binary-making-record/total-cost/{projectId}`

**权限要求**: `erp:saltprocess:binary-making-record:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

## 3. 三元化盐记录模块 API

三元化盐记录模块的API接口与二元化盐记录模块基本相同，主要区别在于：

1. **URL路径**: 使用 `ternary-making-record` 替代 `binary-making-record`
2. **权限**: 使用 `ternary-making-record` 替代 `binary-making-record`
3. **数据字段**: 增加了第三种原料 NaNO2 的相关字段和稳定性指数字段

### 3.1 特有字段说明

三元化盐记录在二元化盐记录基础上增加了以下字段：
- `nano2TargetRatio`: NaNO2目标配比(%)
- `nano2ActualRatio`: NaNO2实际配比(%)
- `nano2TargetWeight`: NaNO2目标用量(kg)
- `nano2ActualWeight`: NaNO2实际用量(kg)
- `stabilityIndex`: 稳定性指数

### 3.2 特有查询接口

#### 3.2.1 根据稳定性指数范围查询

**接口路径**: `GET /erp/saltprocess/ternary-making-record/stability-range`

**权限要求**: `erp:saltprocess:ternary-making-record:query`

**查询参数**:
- `minStabilityIndex` (number, required): 最小稳定性指数
- `maxStabilityIndex` (number, required): 最大稳定性指数

#### 3.2.2 统计平均稳定性指数

**接口路径**: `GET /erp/saltprocess/ternary-making-record/avg-stability-index`

**权限要求**: `erp:saltprocess:ternary-making-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

## 4. 数据分析模块 API

### 4.1 项目总体统计

**接口路径**: `GET /erp/saltprocess/analysis/project-statistics/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "preheatingRecordCount": 150,
    "binaryRecordCount": 45,
    "binaryTotalCost": 850000.00,
    "ternaryRecordCount": 25,
    "ternaryTotalCost": 650000.00,
    "totalCost": 1500000.00,
    "totalRecordCount": 220
  }
}
```

### 4.2 生产统计

**接口路径**: `GET /erp/saltprocess/analysis/production-statistics`

**权限要求**: `erp:saltprocess:analysis:query`

**查询参数**:
- `startDate` (string, required): 开始日期 (yyyy-MM-dd)
- `endDate` (string, required): 结束日期 (yyyy-MM-dd)

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "binaryProductionCount": 45,
    "binaryTotalOutput": 450000.00,
    "binaryAvgYieldRate": 98.5,
    "ternaryProductionCount": 25,
    "ternaryTotalOutput": 240000.00,
    "ternaryAvgYieldRate": 97.8,
    "ternaryAvgStabilityIndex": 95.2,
    "totalOutput": 690000.00,
    "avgYieldRate": 98.15
  }
}
```

### 4.3 质量分析

**接口路径**: `GET /erp/saltprocess/analysis/quality-analysis/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "qualityGradeDistribution": {
      "grade1": 35,
      "grade2": 25,
      "grade3": 8,
      "grade4": 2
    },
    "qualityCheckResults": {
      "result1": 62,
      "result2": 6,
      "result3": 2
    },
    "qualificationRate": 88.57
  }
}
```

### 4.4 成本分析

**接口路径**: `GET /erp/saltprocess/analysis/cost-analysis/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

### 4.5 产出率趋势分析

**接口路径**: `GET /erp/saltprocess/analysis/yield-rate-trend/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "date": "2025-09-11",
      "binaryYieldRate": 98.5,
      "ternaryYieldRate": 97.8
    }
  ]
}
```

### 4.6 温度控制分析

**接口路径**: `GET /erp/saltprocess/analysis/temperature-control/{taskId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `taskId` (integer, required): 任务ID

### 4.7 配比偏差分析

**接口路径**: `GET /erp/saltprocess/analysis/ratio-deviation/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

### 4.8 设备效率分析

**接口路径**: `GET /erp/saltprocess/analysis/equipment-efficiency/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

### 4.9 操作员绩效分析

**接口路径**: `GET /erp/saltprocess/analysis/operator-performance/{operatorId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `operatorId` (integer, required): 操作员ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

### 4.10 能耗分析

**接口路径**: `GET /erp/saltprocess/analysis/energy-consumption/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

### 4.11 预警信息

**接口路径**: `GET /erp/saltprocess/analysis/alerts/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "type": "温度异常",
      "level": "警告",
      "message": "反应温度超出正常范围",
      "timestamp": "2025-09-11"
    },
    {
      "type": "配比偏差",
      "level": "注意",
      "message": "配比偏差超过5%",
      "timestamp": "2025-09-11"
    }
  ]
}
```

### 4.12 综合分析报告

**接口路径**: `GET /erp/saltprocess/analysis/comprehensive-report/{projectId}`

**权限要求**: `erp:saltprocess:analysis:report`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

### 4.13 实时监控数据

**接口路径**: `GET /erp/saltprocess/analysis/real-time-monitoring/{taskId}`

**权限要求**: `erp:saltprocess:analysis:monitor`

**路径参数**:
- `taskId` (integer, required): 任务ID

### 4.14 历史对比分析

**接口路径**: `GET /erp/saltprocess/analysis/historical-comparison/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `currentStart` (string, required): 当前期间开始日期
- `currentEnd` (string, required): 当前期间结束日期
- `previousStart` (string, required): 对比期间开始日期
- `previousEnd` (string, required): 对比期间结束日期

### 4.15 异常数据分析

**接口路径**: `GET /erp/saltprocess/analysis/anomaly-analysis/{projectId}`

**权限要求**: `erp:saltprocess:analysis:query`

**路径参数**:
- `projectId` (integer, required): 项目ID

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

## 5. TypeScript 接口定义

### 5.1 通用类型定义

```typescript
// 通用响应类型
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页响应类型
interface PageResponse<T = any> {
  code: number;
  msg: string;
  rows: T[];
  total: number;
}

// 分页查询参数
interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

// 日期范围查询参数
interface DateRangeQuery {
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
}
```

### 5.2 预热数据记录类型

```typescript
// 预热数据记录VO
interface PreheatingDataRecordVo {
  id: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  tankNumber: string;
  recordDate: string;
  recordTime: string;
  shift: number;
  targetTemperature: number;
  actualTemperature: number;
  temperatureDeviation?: number;
  heatingRate?: number;
  targetPressure?: number;
  actualPressure?: number;
  pressureDeviation?: number;
  heatingPower?: number;
  heatingEfficiency?: number;
  equipmentStatus: number;
  alarmStatus: number;
  energyConsumption?: number;
  hourlyConsumption?: number;
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityStatus: number;
  deviationReason?: string;
  correctiveAction?: string;
  remarks?: string;
  createTime: string;
}

// 预热数据记录BO
interface PreheatingDataRecordBo {
  id?: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  tankNumber: string;
  recordDate: string;
  recordTime: string;
  shift: number;
  targetTemperature: number;
  actualTemperature: number;
  heatingRate?: number;
  targetPressure?: number;
  actualPressure?: number;
  heatingPower?: number;
  heatingEfficiency?: number;
  equipmentStatus: number;
  alarmStatus?: number;
  energyConsumption?: number;
  hourlyConsumption?: number;
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityStatus?: number;
  deviationReason?: string;
  correctiveAction?: string;
  remarks?: string;
}

// 预热数据记录查询参数
interface PreheatingDataRecordQuery extends PageQuery {
  recordCode?: string;
  taskId?: number;
  projectId?: number;
  tankNumber?: string;
  recordDate?: string;
  qualityStatus?: number;
}
```

### 5.3 二元化盐记录类型

```typescript
// 二元化盐记录VO
interface BinaryMakingRecordVo {
  id: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  batchNumber: string;
  recordDate: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  shift: number;
  nano3TargetRatio: number;
  kno3TargetRatio: number;
  nano3ActualRatio?: number;
  kno3ActualRatio?: number;
  ratioDeviation?: number;
  nano3TargetWeight: number;
  kno3TargetWeight: number;
  nano3ActualWeight?: number;
  kno3ActualWeight?: number;
  totalWeight?: number;
  reactionTemperature: number;
  reactionTime: number;
  stirringSpeed?: number;
  heatingPower?: number;
  phValue?: number;
  density?: number;
  moistureContent?: number;
  purity?: number;
  targetOutput: number;
  actualOutput?: number;
  yieldRate?: number;
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityGrade?: number;
  qualityCheckResult?: number;
  qualityIssues?: string;
  correctiveActions?: string;
  materialCost?: number;
  energyCost?: number;
  laborCost?: number;
  totalCost?: number;
  remarks?: string;
  createTime: string;
}

// 二元化盐记录查询参数
interface BinaryMakingRecordQuery extends PageQuery {
  recordCode?: string;
  taskId?: number;
  projectId?: number;
  batchNumber?: string;
  recordDate?: string;
  qualityGrade?: number;
  qualityCheckResult?: number;
}
```

### 5.4 数据分析类型

```typescript
// 项目统计数据
interface ProjectStatistics {
  preheatingRecordCount: number;
  binaryRecordCount: number;
  binaryTotalCost: number;
  ternaryRecordCount: number;
  ternaryTotalCost: number;
  totalCost: number;
  totalRecordCount: number;
}

// 生产统计数据
interface ProductionStatistics {
  binaryProductionCount: number;
  binaryTotalOutput: number;
  binaryAvgYieldRate: number;
  ternaryProductionCount: number;
  ternaryTotalOutput: number;
  ternaryAvgYieldRate: number;
  ternaryAvgStabilityIndex: number;
  totalOutput: number;
  avgYieldRate: number;
}

// 质量分析数据
interface QualityAnalysis {
  qualityGradeDistribution: {
    grade1: number;
    grade2: number;
    grade3: number;
    grade4: number;
  };
  qualityCheckResults: {
    result1: number;
    result2: number;
    result3: number;
  };
  qualificationRate: number;
}

// 预警信息
interface AlertInfo {
  type: string;
  level: string;
  message: string;
  timestamp: string;
}

// 产出率趋势数据
interface YieldRateTrend {
  date: string;
  binaryYieldRate: number;
  ternaryYieldRate: number;
}
```

## 6. 前端集成指南

### 6.1 API 客户端配置

```typescript
import axios, { AxiosResponse } from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('satoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg } = response.data;
    if (code !== 200) {
      console.error('API Error:', msg);
      // 这里可以添加全局错误提示
      throw new Error(msg);
    }
    return response.data;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);
```

### 6.2 API 服务封装

```typescript
// 预热数据记录API服务
class PreheatingDataRecordService {
  // 查询列表
  static async getList(params: PreheatingDataRecordQuery): Promise<PageResponse<PreheatingDataRecordVo>> {
    return apiClient.get('/erp/saltprocess/preheating-record/list', { params });
  }

  // 获取详情
  static async getById(id: number): Promise<ApiResponse<PreheatingDataRecordVo>> {
    return apiClient.get(`/erp/saltprocess/preheating-record/${id}`);
  }

  // 新增记录
  static async create(data: PreheatingDataRecordBo): Promise<ApiResponse<void>> {
    return apiClient.post('/erp/saltprocess/preheating-record', data);
  }

  // 修改记录
  static async update(data: PreheatingDataRecordBo): Promise<ApiResponse<void>> {
    return apiClient.put('/erp/saltprocess/preheating-record', data);
  }

  // 删除记录
  static async delete(ids: number[]): Promise<ApiResponse<void>> {
    return apiClient.delete(`/erp/saltprocess/preheating-record/${ids.join(',')}`);
  }

  // 根据任务ID查询
  static async getByTaskId(taskId: number): Promise<ApiResponse<PreheatingDataRecordVo[]>> {
    return apiClient.get(`/erp/saltprocess/preheating-record/task/${taskId}`);
  }

  // 根据日期范围查询
  static async getByDateRange(params: DateRangeQuery): Promise<ApiResponse<PreheatingDataRecordVo[]>> {
    return apiClient.get('/erp/saltprocess/preheating-record/date-range', { params });
  }

  // 导出数据
  static async export(params: PreheatingDataRecordQuery): Promise<Blob> {
    const response = await apiClient.post('/erp/saltprocess/preheating-record/export', params, {
      responseType: 'blob',
    });
    return response.data;
  }

  // 导入数据
  static async import(file: File): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/erp/saltprocess/preheating-record/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// 数据分析API服务
class SaltProcessAnalysisService {
  // 项目统计
  static async getProjectStatistics(projectId: number): Promise<ApiResponse<ProjectStatistics>> {
    return apiClient.get(`/erp/saltprocess/analysis/project-statistics/${projectId}`);
  }

  // 生产统计
  static async getProductionStatistics(params: DateRangeQuery): Promise<ApiResponse<ProductionStatistics>> {
    return apiClient.get('/erp/saltprocess/analysis/production-statistics', { params });
  }

  // 质量分析
  static async getQualityAnalysis(projectId: number, params: DateRangeQuery): Promise<ApiResponse<QualityAnalysis>> {
    return apiClient.get(`/erp/saltprocess/analysis/quality-analysis/${projectId}`, { params });
  }

  // 预警信息
  static async getAlerts(projectId: number): Promise<ApiResponse<AlertInfo[]>> {
    return apiClient.get(`/erp/saltprocess/analysis/alerts/${projectId}`);
  }

  // 产出率趋势
  static async getYieldRateTrend(projectId: number, params: DateRangeQuery): Promise<ApiResponse<YieldRateTrend[]>> {
    return apiClient.get(`/erp/saltprocess/analysis/yield-rate-trend/${projectId}`, { params });
  }
}
```

### 6.3 数据验证规则

```typescript
// 表单验证规则
const preheatingDataRecordRules = {
  recordCode: [
    { required: true, message: '记录编码不能为空', trigger: 'blur' },
    { max: 50, message: '记录编码长度不能超过50个字符', trigger: 'blur' }
  ],
  taskId: [
    { required: true, message: '预热任务ID不能为空', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '项目ID不能为空', trigger: 'blur' }
  ],
  tankNumber: [
    { required: true, message: '熔盐罐编号不能为空', trigger: 'blur' },
    { max: 20, message: '熔盐罐编号长度不能超过20个字符', trigger: 'blur' }
  ],
  recordDate: [
    { required: true, message: '记录日期不能为空', trigger: 'blur' }
  ],
  recordTime: [
    { required: true, message: '记录时间不能为空', trigger: 'blur' }
  ],
  shift: [
    { required: true, message: '班次不能为空', trigger: 'blur' }
  ],
  targetTemperature: [
    { required: true, message: '目标温度不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 1000, message: '目标温度范围为0-1000°C', trigger: 'blur' }
  ],
  actualTemperature: [
    { required: true, message: '实际温度不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 1000, message: '实际温度范围为0-1000°C', trigger: 'blur' }
  ],
  operatorId: [
    { required: true, message: '操作员ID不能为空', trigger: 'blur' }
  ],
  operatorName: [
    { required: true, message: '操作员姓名不能为空', trigger: 'blur' },
    { max: 50, message: '操作员姓名长度不能超过50个字符', trigger: 'blur' }
  ]
};
```

### 6.4 错误处理最佳实践

```typescript
// 统一错误处理函数
const handleApiError = (error: any, defaultMessage: string = '操作失败') => {
  let message = defaultMessage;
  
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response;
    if (status === 401) {
      message = '登录已过期，请重新登录';
      // 跳转到登录页
      router.push('/login');
    } else if (status === 403) {
      message = '权限不足，无法执行此操作';
    } else if (data && data.msg) {
      message = data.msg;
    }
  } else if (error.request) {
    // 网络错误
    message = '网络连接失败，请检查网络设置';
  } else {
    // 其他错误
    message = error.message || defaultMessage;
  }
  
  // 显示错误提示
  ElMessage.error(message);
  console.error('API Error:', error);
};

// 使用示例
const handleSubmit = async (formData: PreheatingDataRecordBo) => {
  try {
    await PreheatingDataRecordService.create(formData);
    ElMessage.success('创建成功');
    // 刷新列表或其他操作
  } catch (error) {
    handleApiError(error, '创建失败');
  }
};
```

### 6.5 分页组件集成

```typescript
// 分页数据管理
const usePagination = <T>() => {
  const loading = ref(false);
  const data = ref<T[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(10);

  const loadData = async (queryParams: any, apiCall: Function) => {
    loading.value = true;
    try {
      const params = {
        ...queryParams,
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      };
      const response = await apiCall(params);
      data.value = response.rows;
      total.value = response.total;
    } catch (error) {
      handleApiError(error, '查询失败');
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = (page: number) => {
    pageNum.value = page;
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    pageNum.value = 1;
  };

  return {
    loading,
    data,
    total,
    pageNum,
    pageSize,
    loadData,
    handlePageChange,
    handleSizeChange,
  };
};
```

## 7. 常见问题与解决方案

### 7.1 权限问题

**问题**: 接口返回403权限不足错误

**解决方案**:
1. 检查用户是否具有相应的权限
2. 确认权限字符串格式正确
3. 联系管理员分配相应权限

### 7.2 数据验证失败

**问题**: 提交数据时返回400参数验证错误

**解决方案**:
1. 检查必填字段是否为空
2. 确认数据类型和格式正确
3. 检查数值范围是否符合要求
4. 确认字符串长度不超过限制

### 7.3 文件上传问题

**问题**: Excel文件导入失败

**解决方案**:
1. 确认文件格式为Excel (.xlsx或.xls)
2. 检查文件大小不超过限制
3. 确认Excel模板格式正确
4. 检查数据内容符合验证规则

### 7.4 日期格式问题

**问题**: 日期参数格式错误

**解决方案**:
1. 确保日期格式为 yyyy-MM-dd
2. 时间格式为 HH:mm:ss
3. 日期时间格式为 yyyy-MM-ddTHH:mm:ss

## 8. 更新日志

### v1.0 (2025-09-11)
- 初始版本发布
- 完成预热数据记录模块API
- 完成二元化盐记录模块API
- 完成三元化盐记录模块API
- 完成数据分析模块API
- 提供完整的TypeScript类型定义
- 提供前端集成指南

---

## 9. 接口测试示例

### 9.1 使用 curl 测试

#### 查询预热数据记录列表
```bash
curl -X GET "http://localhost:8080/erp/saltprocess/preheating-record/list?pageNum=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### 新增预热数据记录
```bash
curl -X POST "http://localhost:8080/erp/saltprocess/preheating-record" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recordCode": "PRH20250911002",
    "taskId": 1001,
    "projectId": 2001,
    "tankNumber": "TANK001",
    "recordDate": "2025-09-11",
    "recordTime": "15:30:00",
    "shift": 1,
    "targetTemperature": 450.00,
    "actualTemperature": 449.20,
    "operatorId": 3001,
    "operatorName": "张三"
  }'
```

#### 获取项目统计数据
```bash
curl -X GET "http://localhost:8080/erp/saltprocess/analysis/project-statistics/2001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 9.2 使用 Postman 测试

1. **设置环境变量**:
   - `baseUrl`: http://localhost:8080
   - `token`: YOUR_ACCESS_TOKEN

2. **配置请求头**:
   - Authorization: Bearer {{token}}
   - Content-Type: application/json

3. **测试集合示例**:
   - 创建 "化盐系统API测试" 集合
   - 添加各模块的测试请求
   - 设置测试脚本验证响应

## 10. 性能优化建议

### 10.1 查询优化

1. **分页查询**: 大数据量查询时必须使用分页
2. **索引利用**: 查询条件尽量使用已建立索引的字段
3. **日期范围**: 避免过大的日期范围查询
4. **字段选择**: 只查询需要的字段，避免查询大字段

### 10.2 缓存策略

1. **统计数据缓存**: 对于变化不频繁的统计数据可以使用缓存
2. **字典数据缓存**: 枚举值、选项列表等可以缓存
3. **用户权限缓存**: 避免每次请求都查询权限

### 10.3 批量操作

1. **批量导入**: 大量数据录入时使用Excel导入功能
2. **批量删除**: 支持多选批量删除操作
3. **批量更新**: 相同操作的记录可以批量处理

## 11. 安全注意事项

### 11.1 权限控制

1. **接口权限**: 每个接口都有对应的权限验证
2. **数据权限**: 用户只能访问有权限的项目数据
3. **操作权限**: 区分查询、新增、修改、删除等操作权限

### 11.2 数据验证

1. **输入验证**: 所有输入数据都进行格式和范围验证
2. **SQL注入防护**: 使用参数化查询防止SQL注入
3. **XSS防护**: 对输出数据进行转义处理

### 11.3 日志记录

1. **操作日志**: 记录所有数据变更操作
2. **访问日志**: 记录API访问情况
3. **错误日志**: 记录系统异常和错误信息

## 12. 部署配置

### 12.1 环境配置

```yaml
# application.yml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/haitang_erp?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver

# Sa-Token配置
sa-token:
  token-name: satoken
  timeout: 2592000
  activity-timeout: -1
  is-concurrent: true
  is-share: true
  token-style: uuid
  is-log: false
```

### 12.2 数据库配置

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS haitang_erp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'erp_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON haitang_erp.* TO 'erp_user'@'%';
FLUSH PRIVILEGES;
```

### 12.3 Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

## 13. 监控与运维

### 13.1 健康检查

```bash
# 检查应用状态
curl -X GET "http://localhost:8080/actuator/health"

# 检查数据库连接
curl -X GET "http://localhost:8080/actuator/health/db"
```

### 13.2 性能监控

1. **响应时间监控**: 监控API接口响应时间
2. **错误率监控**: 监控接口错误率和异常情况
3. **资源使用监控**: 监控CPU、内存、数据库连接等资源使用情况

### 13.3 日志分析

```bash
# 查看应用日志
tail -f /var/log/haitang-erp/application.log

# 查看错误日志
grep "ERROR" /var/log/haitang-erp/application.log

# 查看API访问日志
grep "saltprocess" /var/log/haitang-erp/access.log
```

## 14. 版本兼容性

### 14.1 API版本管理

1. **向后兼容**: 新版本API保持向后兼容
2. **废弃通知**: 废弃的API提前通知并提供迁移指南
3. **版本标识**: 在响应头中包含API版本信息

### 14.2 数据库版本管理

1. **迁移脚本**: 提供数据库结构变更的迁移脚本
2. **数据备份**: 升级前进行数据备份
3. **回滚方案**: 提供版本回滚的解决方案

## 15. 技术支持

### 15.1 常见问题

**Q: 如何获取API访问token？**
A: 通过登录接口获取，或联系系统管理员分配。

**Q: 为什么接口返回403权限不足？**
A: 检查用户权限配置，确保具有相应的操作权限。

**Q: Excel导入失败怎么办？**
A: 检查Excel格式是否正确，数据是否符合验证规则。

**Q: 如何处理大量数据查询？**
A: 使用分页查询，合理设置查询条件和日期范围。

### 15.2 联系方式

- **技术支持邮箱**: support@haitang-erp.com
- **开发团队**: dev-team@haitang-erp.com
- **文档反馈**: docs@haitang-erp.com
- **紧急联系**: 400-xxx-xxxx

### 15.3 相关资源

- **系统文档**: [系统使用手册](./系统使用手册.md)
- **开发指南**: [开发者指南](./开发者指南.md)
- **数据库文档**: [数据库设计文档](./数据库设计文档.md)
- **部署指南**: [部署运维指南](./部署运维指南.md)

---

**文档维护**: 海棠ERP开发团队
**最后更新**: 2025年9月11日
**文档版本**: v1.0
**联系方式**: 技术支持团队
