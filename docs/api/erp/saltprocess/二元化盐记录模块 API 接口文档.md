# 海棠企业管理系统 - 二元化盐记录模块 API 接口文档

## 文档概述

本文档详细描述了海棠企业管理系统中二元化盐记录模块的完整API接口规范，基于前端代码分析生成，为后端开发提供准确的接口实现指导。

### 基础信息

- **模块名称**: 二元化盐记录管理
- **API版本**: v1.0
- **基础URL**: `/erp/saltprocess/binary-record`
- **认证方式**: Bearer Token (SaToken)
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

## 数据模型定义

### 二元化盐记录查询参数 (BinaryRecordQuery)

```typescript
interface BinaryRecordQuery {
  pageNum?: number;           // 页码，默认1
  pageSize?: number;          // 每页数量，默认10
  recordCode?: string;        // 记录编码
  batchNumber?: string;       // 批次号
  projectId?: number;         // 项目ID
  recordDate?: string;        // 记录日期 (YYYY-MM-DD)
  ratioStatus?: string;       // 配比状态: normal-正常, abnormal-异常
  qualityGrade?: number;      // 质量等级: 1-优秀, 2-良好, 3-合格, 4-不合格
  operatorId?: number;        // 操作员ID
  startDate?: string;         // 开始日期
  endDate?: string;           // 结束日期
  ratioDeviationRange?: [number, number]; // 配比偏差范围
  yieldRateRange?: [number, number];      // 产出率范围
}
```

### 二元化盐记录VO (BinaryRecordVO)

```typescript
interface BinaryRecordVO {
  id: string;                    // 记录ID
  recordCode: string;            // 记录编码
  batchNumber: string;           // 批次号
  projectId: number;             // 项目ID
  recordDate: string;            // 记录日期
  startTime: string;             // 开始时间
  endTime: string;               // 结束时间
  duration: number;              // 持续时间(分钟)
  shift: number;                 // 班次: 1-白班, 2-夜班
  
  // NaNO3配比信息
  nano3TargetRatio: number;      // 硝酸钠目标配比(%)
  nano3ActualRatio: number;      // 硝酸钠实际配比(%)
  nano3TargetWeight: number;     // 硝酸钠目标用量(kg)
  nano3ActualWeight: number;     // 硝酸钠实际用量(kg)
  
  // KNO3配比信息
  kno3TargetRatio: number;       // 硝酸钾目标配比(%)
  kno3ActualRatio: number;       // 硝酸钾实际配比(%)
  kno3TargetWeight: number;      // 硝酸钾目标用量(kg)
  kno3ActualWeight: number;      // 硝酸钾实际用量(kg)
  
  // 配比偏差
  ratioDeviation: number;        // 配比偏差(%)
  totalWeight: number;           // 总重量(kg)
  
  // 工艺参数
  reactionTemperature: number;   // 反应温度(℃)
  reactionTime: number;          // 反应时间(分钟)
  stirringSpeed: number;         // 搅拌速度(rpm)
  heatingPower: number;          // 加热功率(kW)
  phValue: number;               // pH值
  density: number;               // 密度(g/cm³)
  
  // 质量信息
  moistureContent: number;       // 水分含量(%)
  purity: number;                // 纯度(%)
  qualityGrade: number;          // 质量等级: 1-优秀, 2-良好, 3-合格, 4-不合格
  qualityCheckResult: number;    // 质检结果: 1-合格, 2-不合格
  qualityIssues?: string;        // 质量问题描述
  correctiveActions?: string;    // 纠正措施
  
  // 产量信息
  targetOutput: number;          // 目标产量(kg)
  actualOutput: number;          // 实际产量(kg)
  yieldRate: number;             // 产出率(%)
  
  // 成本信息
  materialCost: number;          // 材料成本(元)
  energyCost: number;            // 能源成本(元)
  laborCost: number;             // 人工成本(元)
  totalCost: number;             // 总成本(元)
  
  // 新增字段 - 根据Excel表格结构
  moltenSaltLevel?: number;      // 熔盐液位(m)
  moltenSaltTemperature?: number; // 熔盐温度(℃)
  gasConsumption?: number;       // 天然气耗量(Nm³)
  powerConsumption?: number;     // 用电量(KWh)
  staffCount?: number;           // 人数
  recorderName?: string;         // 记录人
  cumulativeSaltAmount?: number; // 累积化盐量(t)
  
  // 操作信息
  operatorId: number;            // 操作员ID
  operatorName: string;          // 操作员姓名
  supervisorId?: number;         // 监督员ID
  supervisorName?: string;       // 监督员姓名
  remarks?: string;              // 备注
  createTime: string;            // 创建时间
  updateTime?: string;           // 更新时间
}
```

### 二元化盐记录表单 (BinaryRecordForm)

```typescript
interface BinaryRecordForm {
  id?: string;                   // 记录ID (编辑时必填)
  recordCode: string;            // 记录编码 (必填)
  batchNumber: string;           // 批次号 (必填)
  projectId: number;             // 项目ID (必填)
  recordDate: string;            // 记录日期 (必填)
  startTime: string;             // 开始时间
  endTime: string;               // 结束时间
  shift: number;                 // 班次 (必填)
  
  // NaNO3配比信息
  nano3TargetRatio: number;      // 硝酸钠目标配比
  nano3ActualRatio: number;      // 硝酸钠实际配比
  nano3TargetWeight: number;     // 硝酸钠目标用量
  nano3ActualWeight: number;     // 硝酸钠实际用量
  
  // KNO3配比信息
  kno3TargetRatio: number;       // 硝酸钾目标配比
  kno3ActualRatio: number;       // 硝酸钾实际配比
  kno3TargetWeight: number;      // 硝酸钾目标用量
  kno3ActualWeight: number;      // 硝酸钾实际用量
  
  // 工艺参数
  reactionTemperature: number;   // 反应温度
  reactionTime: number;          // 反应时间
  stirringSpeed: number;         // 搅拌速度
  heatingPower: number;          // 加热功率
  phValue: number;               // pH值
  density: number;               // 密度
  
  // 质量信息
  moistureContent: number;       // 水分含量
  purity: number;                // 纯度
  qualityGrade: number;          // 质量等级
  qualityCheckResult: number;    // 质检结果
  qualityIssues?: string;        // 质量问题
  correctiveActions?: string;    // 纠正措施
  
  // 产量信息
  targetOutput: number;          // 目标产量
  actualOutput: number;          // 实际产量
  
  // 成本信息
  materialCost: number;          // 材料成本
  energyCost: number;            // 能源成本
  laborCost: number;             // 人工成本
  
  // 新增字段
  moltenSaltLevel?: number;      // 熔盐液位
  moltenSaltTemperature?: number; // 熔盐温度
  gasConsumption?: number;       // 天然气耗量
  powerConsumption?: number;     // 用电量
  staffCount?: number;           // 人数
  recorderName?: string;         // 记录人
  cumulativeSaltAmount?: number; // 累积化盐量
  
  operatorId: number;            // 操作员ID (必填)
  supervisorId?: number;         // 监督员ID
  remarks?: string;              // 备注
}
```

## 核心API接口

### 1. 查询二元化盐记录列表

**接口路径**: `GET /erp/saltprocess/binary-record/list`

**权限要求**: `erp:saltprocess:binary-record:query`

**请求参数**: 
- Query参数: `BinaryRecordQuery`

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
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
      "operatorName": "张三",
      "qualityGrade": 1
    }
  ],
  "total": 1
}
```

### 2. 获取二元化盐记录详情

**接口路径**: `GET /erp/saltprocess/binary-record/{id}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `id` (string, required): 记录ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "id": "1",
    "recordCode": "BIN_1733097600_001",
    "projectId": 101,
    "recordDate": "2024-12-01",
    "shift": 1,
    "nano3ActualWeight": 36000,
    "kno3ActualWeight": 24000,
    "moltenSaltLevel": 2.5,
    "moltenSaltTemperature": 565,
    "gasConsumption": 1200,
    "powerConsumption": 850,
    "staffCount": 8,
    "recorderName": "张三",
    "remarks": "从Excel导入 - 原始数据: 钠盐30袋(36.0吨), 钾盐24袋(24.0吨), 人数8人"
  }
}
```

### 3. 新增二元化盐记录

**接口路径**: `POST /erp/saltprocess/binary-record`

**权限要求**: `erp:saltprocess:binary-record:add`

**请求体**: `BinaryRecordForm`

**请求示例**:
```json
{
  "recordCode": "BIN_1733097600_002",
  "batchNumber": "BATCH_20241201_002",
  "projectId": 101,
  "recordDate": "2024-12-01",
  "shift": 1,
  "nano3ActualWeight": 36000,
  "kno3ActualWeight": 24000,
  "moltenSaltLevel": 2.5,
  "moltenSaltTemperature": 565,
  "gasConsumption": 1200,
  "powerConsumption": 850,
  "staffCount": 8,
  "recorderName": "张三",
  "operatorId": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "新增成功",
  "data": null
}
```

### 4. 修改二元化盐记录

**接口路径**: `PUT /erp/saltprocess/binary-record`

**权限要求**: `erp:saltprocess:binary-record:edit`

**请求体**: `BinaryRecordForm` (必须包含id)

**响应示例**:
```json
{
  "code": 200,
  "msg": "修改成功",
  "data": null
}
```

### 5. 删除二元化盐记录

**接口路径**: `DELETE /erp/saltprocess/binary-record/{ids}`

**权限要求**: `erp:saltprocess:binary-record:remove`

**路径参数**:
- `ids` (string, required): 记录ID，多个用逗号分隔

**响应示例**:
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null
}
```

## 扩展API接口

### 6. 导出二元化盐记录

**接口路径**: `POST /erp/saltprocess/binary-record/export`

**权限要求**: `erp:saltprocess:binary-record:export`

**请求体**: `BinaryRecordQuery`

**响应类型**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**说明**: 返回Excel文件流

### 7. 导入二元化盐记录

**接口路径**: `POST /erp/saltprocess/binary-record/import`

**权限要求**: `erp:saltprocess:binary-record:import`

**请求类型**: `multipart/form-data`

**请求参数**:
- `file` (File, required): Excel文件

**响应示例**:
```json
{
  "code": 200,
  "msg": "导入成功",
  "data": {
    "successCount": 10,
    "failureCount": 0,
    "totalCount": 10,
    "errors": []
  }
}
```

### 8. 获取导入模板

**接口路径**: `POST /erp/saltprocess/binary-record/importTemplate`

**权限要求**: `erp:saltprocess:binary-record:import`

**响应类型**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**说明**: 返回Excel模板文件

### 9. 根据批次号查询记录

**接口路径**: `GET /erp/saltprocess/binary-record/batch/{batchNumber}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `batchNumber` (string, required): 批次号

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "id": "1",
      "recordCode": "BIN_1733097600_001",
      "batchNumber": "BATCH_20241201_001",
      // ... 其他字段
    }
  ]
}
```

### 10. 根据项目ID查询记录

**接口路径**: `GET /erp/saltprocess/binary-record/project/{projectId}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `projectId` (number, required): 项目ID

### 11. 根据日期范围查询记录

**接口路径**: `GET /erp/saltprocess/binary-record/date-range`

**权限要求**: `erp:saltprocess:binary-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期 (YYYY-MM-DD)
- `endDate` (string, required): 结束日期 (YYYY-MM-DD)

### 12. 根据质量等级查询记录

**接口路径**: `GET /erp/saltprocess/binary-record/quality-grade/{qualityGrade}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `qualityGrade` (number, required): 质量等级 (1-4)

## 统计分析API接口

### 13. 获取二元化盐记录统计信息

**接口路径**: `GET /erp/saltprocess/binary-record/statistics`

**权限要求**: `erp:saltprocess:binary-record:query`

**查询参数**:
- `startDate` (string, optional): 开始日期
- `endDate` (string, optional): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalRecords": 100,
    "todayRecords": 5,
    "weekRecords": 25,
    "monthRecords": 80,
    "averageYieldRate": 98.5,
    "averageRatioDeviation": 1.2,
    "qualityGradeDistribution": {
      "excellent": 60,
      "good": 25,
      "qualified": 12,
      "unqualified": 3
    },
    "totalOutput": 50000,
    "totalCost": 125000,
    "averageCostPerKg": 2.5
  }
}
```

### 14. 获取配比分析数据

**接口路径**: `GET /erp/saltprocess/binary-record/ratio-analysis/{recordId}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `recordId` (string, required): 记录ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "recordId": "1",
    "nano3Analysis": {
      "targetRatio": 60.0,
      "actualRatio": 59.8,
      "deviation": -0.2,
      "deviationPercentage": -0.33,
      "isWithinTolerance": true
    },
    "kno3Analysis": {
      "targetRatio": 40.0,
      "actualRatio": 40.2,
      "deviation": 0.2,
      "deviationPercentage": 0.5,
      "isWithinTolerance": true
    },
    "overallDeviation": 0.25,
    "qualityImpact": "配比偏差在正常范围内，对产品质量影响较小",
    "recommendations": [
      "继续保持当前配比控制精度",
      "定期校准配料设备"
    ]
  }
}
```

### 15. 获取产量趋势数据

**接口路径**: `GET /erp/saltprocess/binary-record/output-trend`

**权限要求**: `erp:saltprocess:binary-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "date": "2024-12-01",
      "targetOutput": 2500,
      "actualOutput": 2450,
      "yieldRate": 98.0,
      "qualityGrade": 1
    },
    {
      "date": "2024-12-02",
      "targetOutput": 2500,
      "actualOutput": 2480,
      "yieldRate": 99.2,
      "qualityGrade": 1
    }
  ]
}
```

### 16. 统计总产量

**接口路径**: `GET /erp/saltprocess/binary-record/total-output`

**权限要求**: `erp:saltprocess:binary-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalOutput": 50000
  }
}
```

### 17. 统计平均产出率

**接口路径**: `GET /erp/saltprocess/binary-record/avg-yield-rate`

**权限要求**: `erp:saltprocess:binary-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "avgYieldRate": 98.5
  }
}
```

### 18. 统计总成本

**接口路径**: `GET /erp/saltprocess/binary-record/total-cost/{projectId}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `projectId` (number, required): 项目ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalCost": 125000
  }
}
```

## 高级功能API接口

### 19. 批量更新记录状态

**接口路径**: `PUT /erp/saltprocess/binary-record/batch-status`

**权限要求**: `erp:saltprocess:binary-record:edit`

**请求体**:
```json
{
  "ids": ["1", "2", "3"],
  "status": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "批量更新成功",
  "data": null
}
```

### 20. 获取成本分析数据

**接口路径**: `GET /erp/saltprocess/binary-record/cost-analysis`

**权限要求**: `erp:saltprocess:binary-record:query`

**查询参数**:
- `startDate` (string, required): 开始日期
- `endDate` (string, required): 结束日期

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "totalMaterialCost": 80000,
    "totalEnergyCost": 30000,
    "totalLaborCost": 15000,
    "totalCost": 125000,
    "costPerKg": 2.5,
    "costTrend": [
      {
        "date": "2024-12-01",
        "materialCost": 2000,
        "energyCost": 800,
        "laborCost": 400
      }
    ]
  }
}
```

### 21. 记录验证

**接口路径**: `POST /erp/saltprocess/binary-record/validate`

**权限要求**: `erp:saltprocess:binary-record:query`

**请求体**: `BinaryRecordForm`

**响应示例**:
```json
{
  "code": 200,
  "msg": "验证完成",
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": ["配比偏差略高，建议调整"],
    "suggestions": ["优化搅拌速度", "调整反应温度"],
    "ratioValidation": {
      "nano3Valid": true,
      "kno3Valid": true,
      "totalRatioValid": true
    },
    "qualityValidation": {
      "purityValid": true,
      "moistureValid": true,
      "densityValid": true
    }
  }
}
```

### 22. 记录审核

**接口路径**: `POST /erp/saltprocess/binary-record/audit/{id}`

**权限要求**: `erp:saltprocess:binary-record:audit`

**路径参数**:
- `id` (string, required): 记录ID

**请求体**:
```json
{
  "auditType": "quality_check",
  "auditStatus": 1,
  "auditResult": "通过",
  "auditComments": "数据准确，质量符合标准",
  "auditorId": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "审核成功",
  "data": null
}
```

### 23. 获取审核历史

**接口路径**: `GET /erp/saltprocess/binary-record/audit-history/{id}`

**权限要求**: `erp:saltprocess:binary-record:query`

**路径参数**:
- `id` (string, required): 记录ID

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "id": "1",
      "recordId": "1",
      "auditType": "quality_check",
      "auditStatus": 1,
      "auditResult": "通过",
      "auditComments": "数据准确，质量符合标准",
      "auditorId": 1,
      "auditorName": "审核员A",
      "auditTime": "2024-12-01 10:30:00"
    }
  ]
}
```

## 业务逻辑说明

### 配比计算规则

1. **标准配比**: 硝酸钠(NaNO3) : 硝酸钾(KNO3) = 6:4
2. **配比偏差计算**:
   ```
   偏差 = |实际配比 - 目标配比| / 目标配比 * 100%
   ```
3. **配比状态判定**:
   - 正常(normal): 偏差 ≤ 5%
   - 异常(abnormal): 偏差 > 5%

### 质量等级标准

- **1级(优秀)**: 纯度≥99%, 水分≤0.5%, 配比偏差≤2%
- **2级(良好)**: 纯度≥98%, 水分≤1.0%, 配比偏差≤3%
- **3级(合格)**: 纯度≥97%, 水分≤1.5%, 配比偏差≤5%
- **4级(不合格)**: 不满足3级标准

### 产出率计算

```
产出率 = (实际产量 / 目标产量) * 100%
```

### 成本计算

- **材料成本**: 原料用量 × 单价
- **能源成本**: 天然气耗量 × 气价 + 用电量 × 电价
- **人工成本**: 人数 × 工时 × 时薪
- **总成本**: 材料成本 + 能源成本 + 人工成本

### 数据验证规则

1. **必填字段验证**: recordCode, batchNumber, projectId, recordDate, shift, operatorId
2. **数值范围验证**:
   - 配比: 0-100%
   - 温度: 0-1000℃
   - 液位: 0-10m
   - 纯度: 0-100%
   - 水分: 0-10%
3. **业务逻辑验证**:
   - 结束时间 > 开始时间
   - 实际用量 > 0
   - 配比总和 = 100%

### 权限控制

- **查询权限**: `erp:saltprocess:binary-record:query`
- **新增权限**: `erp:saltprocess:binary-record:add`
- **编辑权限**: `erp:saltprocess:binary-record:edit`
- **删除权限**: `erp:saltprocess:binary-record:remove`
- **导出权限**: `erp:saltprocess:binary-record:export`
- **导入权限**: `erp:saltprocess:binary-record:import`
- **审核权限**: `erp:saltprocess:binary-record:audit`

## 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权访问 | 检查Token是否有效 |
| 403 | 权限不足 | 检查用户权限配置 |
| 404 | 记录不存在 | 检查记录ID是否正确 |
| 409 | 记录编码重复 | 使用不同的记录编码 |
| 422 | 数据验证失败 | 检查数据格式和业务规则 |
| 500 | 服务器内部错误 | 联系系统管理员 |

## 注意事项

1. **数据单位统一**:
   - 重量: kg (千克)
   - 温度: ℃ (摄氏度)
   - 液位: m (米)
   - 配比: % (百分比)
   - 时间: 分钟

2. **时间格式**:
   - 日期: YYYY-MM-DD
   - 时间: HH:mm:ss
   - 日期时间: YYYY-MM-DD HH:mm:ss

3. **Excel导入要求**:
   - 支持.xlsx和.xls格式
   - 文件大小不超过10MB
   - 必须使用标准模板格式

4. **性能优化建议**:
   - 大量数据查询时使用分页
   - 统计分析接口建议设置合理的时间范围
   - 导出大量数据时考虑异步处理

5. **数据安全**:
   - 所有接口都需要身份认证
   - 敏感操作需要相应权限
   - 重要数据变更需要审核流程
