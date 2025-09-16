# 海棠企业管理系统 - 化盐项目管理模块 API 接口文档

## 目录
- [1. 概述](#1-概述)
- [2. 项目基础管理接口](#2-项目基础管理接口)
- [3. 项目业务管理接口](#3-项目业务管理接口)
- [4. 项目进度管理接口](#4-项目进度管理接口)
- [5. 项目任务管理接口](#5-项目任务管理接口)
- [6. 项目风险管理接口](#6-项目风险管理接口)
- [7. 项目变更管理接口](#7-项目变更管理接口)
- [8. 配置管理接口](#8-配置管理接口)
- [9. 导出接口](#9-导出接口)
- [10. 数据模型](#10-数据模型)

## 1. 概述

### 1.1 模块定位
化盐项目管理模块是海棠企业管理系统中专门针对盐化工艺流程的项目管理模块，与通用项目管理模块(`erp/project`)功能互补：

- **化盐项目管理模块** (`saltprocess/project`): 专门用于盐化工艺项目的工艺流程管理
- **通用项目管理模块** (`erp/project`): 适用于各种类型的企业项目（IT项目、市场项目、研发项目等）

### 1.2 基础信息
- **模块路径**: `/erp/saltprocess/project`
- **版本**: v1.0.0
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 1.3 权限控制
所有接口都需要相应的权限控制，权限码格式：`erp:saltprocess:project:{operation}`

```typescript
// 权限码列表
'erp:saltprocess:project:list'     // 查看项目列表
'erp:saltprocess:project:add'      // 创建项目
'erp:saltprocess:project:edit'     // 编辑项目
'erp:saltprocess:project:remove'   // 删除项目
'erp:saltprocess:project:export'   // 导出项目
'erp:saltprocess:project:status'   // 状态管理
'erp:saltprocess:project:progress' // 进度管理
```

### 1.4 响应格式
所有接口统一使用以下响应格式：

```typescript
interface ApiResponse<T> {
  code: number;        // 状态码：200-成功，其他-失败
  message: string;     // 响应消息
  data: T;            // 响应数据
}

interface PageResult<T> {
  rows: T[];          // 数据列表
  total: number;      // 总记录数
}
```

### 1.5 HTTP状态码说明
- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 2. 项目基础管理接口

### 2.1 查询项目列表

**接口地址**: `GET /erp/saltprocess/project/list`

**权限要求**: `erp:saltprocess:project:list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| pageNum | number | 否 | 页码，默认1 | 1 |
| pageSize | number | 否 | 每页大小，默认10 | 10 |
| projectName | string | 否 | 项目名称（模糊查询） | "化盐项目A" |
| projectCode | string | 否 | 项目编码（模糊查询） | "SP2024001" |
| status | string | 否 | 项目状态 | "IN_PROGRESS" |
| projectType | string | 否 | 项目类型 | "BINARY_SALT" |
| managerId | string | 否 | 负责人ID | "user123" |
| startDate | string | 否 | 开始日期（YYYY-MM-DD） | "2024-01-01" |
| endDate | string | 否 | 结束日期（YYYY-MM-DD） | "2024-12-31" |

**状态枚举值**:
- `PLANNING` - 规划中
- `IN_PROGRESS` - 进行中  
- `COMPLETED` - 已完成
- `SUSPENDED` - 已暂停
- `CANCELLED` - 已取消

**项目类型枚举值**:
- `BINARY_SALT` - 二元化盐
- `TERNARY_SALT` - 三元化盐

**请求示例**:
```bash
GET /erp/saltprocess/project/list?pageNum=1&pageSize=10&status=IN_PROGRESS&projectType=BINARY_SALT
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "rows": [
      {
        "id": "proj_001",
        "projectCode": "SP2024001",
        "projectName": "二元化盐生产项目A",
        "projectType": "BINARY_SALT",
        "status": "IN_PROGRESS",
        "progress": 65,
        "currentPhase": "化盐工艺",
        "managerId": "user123",
        "managerName": "张三",
        "startDate": "2024-01-15",
        "endDate": "2024-06-30",
        "description": "二元化盐生产项目，目标产量1000吨",
        "createTime": "2024-01-10T08:00:00Z",
        "updateTime": "2024-03-15T14:30:00Z",
        "createBy": "admin",
        "updateBy": "user123"
      }
    ],
    "total": 1
  }
}
```

### 2.2 获取项目详情

**接口地址**: `GET /erp/saltprocess/project/{id}`

**权限要求**: `erp:saltprocess:project:list`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**请求示例**:
```bash
GET /erp/saltprocess/project/proj_001
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "id": "proj_001",
    "projectCode": "SP2024001",
    "projectName": "二元化盐生产项目A",
    "projectType": "BINARY_SALT",
    "status": "IN_PROGRESS",
    "progress": 65,
    "currentPhase": "化盐工艺",
    "managerId": "user123",
    "managerName": "张三",
    "startDate": "2024-01-15",
    "endDate": "2024-06-30",
    "description": "二元化盐生产项目，目标产量1000吨",
    "processConfig": {
      "id": "config_001",
      "configName": "二元化盐标准配置",
      "projectType": "BINARY_SALT",
      "preheatingConfig": {
        "targetTemperature": 80,
        "targetPressure": 0.2,
        "tolerance": 2,
        "duration": 30,
        "heatingRate": 2.5
      },
      "saltmakingConfig": {
        "targetTemperature": 120,
        "targetPressure": 0.5,
        "stirringSpeed": 150,
        "ratioConfig": [
          {
            "component": "NaCl",
            "componentName": "氯化钠",
            "targetRatio": 60,
            "tolerance": 2,
            "priority": 1
          }
        ],
        "reactionTime": 120
      },
      "heatingConfig": {
        "stages": [
          {
            "stageName": "初期加热",
            "startTemperature": 120,
            "endTemperature": 180,
            "heatingRate": 1.5,
            "duration": 40
          }
        ],
        "finalTemperature": 200,
        "holdingTime": 60
      },
      "isDefault": true,
      "createTime": "2024-01-01T00:00:00Z"
    },
    "createTime": "2024-01-10T08:00:00Z",
    "updateTime": "2024-03-15T14:30:00Z",
    "createBy": "admin",
    "updateBy": "user123"
  }
}
```

### 2.3 创建项目

**接口地址**: `POST /erp/saltprocess/project`

**权限要求**: `erp:saltprocess:project:add`

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| projectName | string | 是 | 项目名称 | "二元化盐生产项目B" |
| projectType | string | 是 | 项目类型 | "BINARY_SALT" |
| managerId | string | 是 | 负责人ID | "user456" |
| startDate | string | 是 | 开始日期 | "2024-04-01" |
| endDate | string | 否 | 结束日期 | "2024-09-30" |
| description | string | 否 | 项目描述 | "新的二元化盐生产项目" |
| processConfigId | string | 否 | 工艺配置ID | "config_001" |
| qualityStandardId | string | 否 | 质量标准ID | "standard_001" |
| resourcePlanId | string | 否 | 资源计划ID | "plan_001" |

**请求示例**:
```json
{
  "projectName": "二元化盐生产项目B",
  "projectType": "BINARY_SALT",
  "managerId": "user456",
  "startDate": "2024-04-01",
  "endDate": "2024-09-30",
  "description": "新的二元化盐生产项目，目标产量1500吨",
  "processConfigId": "config_001",
  "qualityStandardId": "standard_001",
  "resourcePlanId": "plan_001"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "项目创建成功",
  "data": {
    "id": "proj_002",
    "projectCode": "SP2024002",
    "projectName": "二元化盐生产项目B",
    "projectType": "BINARY_SALT",
    "status": "PLANNING",
    "progress": 0,
    "currentPhase": "规划阶段",
    "managerId": "user456",
    "managerName": "李四",
    "startDate": "2024-04-01",
    "endDate": "2024-09-30",
    "description": "新的二元化盐生产项目，目标产量1500吨",
    "createTime": "2024-03-20T10:00:00Z",
    "updateTime": "2024-03-20T10:00:00Z",
    "createBy": "admin"
  }
}
```

### 2.4 更新项目

**接口地址**: `PUT /erp/saltprocess/project`

**权限要求**: `erp:saltprocess:project:edit`

**请求体参数**: 与创建项目相同，但需要包含项目ID

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目ID |
| 其他参数 | - | - | 与创建项目相同 |

**请求示例**:
```json
{
  "id": "proj_002",
  "projectName": "二元化盐生产项目B（修改版）",
  "projectType": "BINARY_SALT",
  "managerId": "user456",
  "startDate": "2024-04-01",
  "endDate": "2024-10-31",
  "description": "修改后的项目描述"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "项目更新成功",
  "data": {
    "id": "proj_002",
    "projectCode": "SP2024002",
    "projectName": "二元化盐生产项目B（修改版）",
    "projectType": "BINARY_SALT",
    "status": "PLANNING",
    "progress": 0,
    "currentPhase": "规划阶段",
    "managerId": "user456",
    "managerName": "李四",
    "startDate": "2024-04-01",
    "endDate": "2024-10-31",
    "description": "修改后的项目描述",
    "createTime": "2024-03-20T10:00:00Z",
    "updateTime": "2024-03-20T15:30:00Z",
    "createBy": "admin",
    "updateBy": "user456"
  }
}
```

### 2.5 删除项目

**接口地址**: `DELETE /erp/saltprocess/project/{ids}`

**权限要求**: `erp:saltprocess:project:remove`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | string | 是 | 项目ID列表，多个ID用逗号分隔 |

**请求示例**:
```bash
DELETE /erp/saltprocess/project/proj_002,proj_003
```

**响应示例**:
```json
{
  "code": 200,
  "message": "项目删除成功",
  "data": null
}
```

**错误响应示例**:
```json
{
  "code": 400,
  "message": "项目正在进行中，无法删除",
  "data": null
}
```

## 3. 项目业务管理接口

### 3.1 更新项目状态

**接口地址**: `PUT /erp/saltprocess/project/{id}/status`

**权限要求**: `erp:saltprocess:project:status`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| status | string | 是 | 新状态 | PLANNING/IN_PROGRESS/COMPLETED/SUSPENDED/CANCELLED |

**请求示例**:
```json
{
  "status": "IN_PROGRESS"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "项目状态更新成功",
  "data": null
}
```

### 3.2 更新项目进度

**接口地址**: `PUT /erp/saltprocess/project/{id}/progress`

**权限要求**: `erp:saltprocess:project:progress`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 取值范围 |
|--------|------|------|------|----------|
| progress | number | 是 | 进度百分比 | 0-100 |

**请求示例**:
```json
{
  "progress": 75
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "项目进度更新成功",
  "data": null
}
```

### 3.3 获取项目统计信息

**接口地址**: `GET /erp/saltprocess/project/statistics`

**权限要求**: `erp:saltprocess:project:list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| period | string | 否 | 统计周期 | WEEK/MONTH/QUARTER/YEAR |

**请求示例**:
```bash
GET /erp/saltprocess/project/statistics?period=MONTH
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "totalProjects": 25,
    "activeProjects": 8,
    "completedProjects": 15,
    "suspendedProjects": 2,
    "averageProgress": 68.5,
    "onTimeCompletionRate": 85.2,
    "qualityPassRate": 96.8,
    "totalOutput": 15000,
    "period": "MONTH"
  }
}
```

### 3.4 生成项目编码

**接口地址**: `GET /erp/saltprocess/project/generate-code`

**权限要求**: `erp:saltprocess:project:add`

**请求示例**:
```bash
GET /erp/saltprocess/project/generate-code
```

**响应示例**:
```json
{
  "code": 200,
  "message": "生成成功",
  "data": "SP2024003"
}
```

### 3.5 复制项目

**接口地址**: `POST /erp/saltprocess/project/{id}/copy`

**权限要求**: `erp:saltprocess:project:add`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 源项目ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| newProjectName | string | 是 | 新项目名称 |

**请求示例**:
```json
{
  "newProjectName": "二元化盐生产项目A（复制版）"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "项目复制成功",
  "data": {
    "id": "proj_004",
    "projectCode": "SP2024004",
    "projectName": "二元化盐生产项目A（复制版）",
    "projectType": "BINARY_SALT",
    "status": "PLANNING",
    "progress": 0,
    "currentPhase": "规划阶段",
    "managerId": "user123",
    "managerName": "张三",
    "startDate": "2024-04-01",
    "endDate": "2024-09-30",
    "description": "基于项目A复制的新项目",
    "createTime": "2024-03-20T16:00:00Z",
    "updateTime": "2024-03-20T16:00:00Z",
    "createBy": "admin"
  }
}
```

## 4. 项目进度管理接口

### 4.1 获取项目进度详情

**接口地址**: `GET /erp/saltprocess/project/{id}/progress`

**权限要求**: `erp:saltprocess:project:progress`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**请求示例**:
```bash
GET /erp/saltprocess/project/proj_001/progress
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "projectId": "proj_001",
    "currentPhase": "化盐工艺",
    "phaseProgress": [
      {
        "phaseName": "预热阶段",
        "phaseCode": "PREHEATING",
        "status": "COMPLETED",
        "progress": 100,
        "plannedStartDate": "2024-01-15",
        "plannedEndDate": "2024-02-15",
        "actualStartDate": "2024-01-15",
        "actualEndDate": "2024-02-10",
        "dependencies": []
      },
      {
        "phaseName": "化盐工艺",
        "phaseCode": "SALTMAKING",
        "status": "IN_PROGRESS",
        "progress": 65,
        "plannedStartDate": "2024-02-16",
        "plannedEndDate": "2024-04-30",
        "actualStartDate": "2024-02-11",
        "actualEndDate": null,
        "dependencies": ["PREHEATING"]
      },
      {
        "phaseName": "提温工艺",
        "phaseCode": "HEATING",
        "status": "NOT_STARTED",
        "progress": 0,
        "plannedStartDate": "2024-05-01",
        "plannedEndDate": "2024-06-15",
        "actualStartDate": null,
        "actualEndDate": null,
        "dependencies": ["SALTMAKING"]
      }
    ],
    "overallProgress": 65,
    "estimatedCompletionDate": "2024-06-30",
    "actualCompletionDate": null,
    "isOnSchedule": true,
    "delayDays": 0
  }
}
```

### 4.2 更新阶段进度

**接口地址**: `PUT /erp/saltprocess/project/{projectId}/phase/{phaseCode}/progress`

**权限要求**: `erp:saltprocess:project:progress`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | string | 是 | 项目ID |
| phaseCode | string | 是 | 阶段代码 |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 取值范围 |
|--------|------|------|------|----------|
| progress | number | 是 | 阶段进度百分比 | 0-100 |

**阶段代码说明**:
- `PREHEATING` - 预热阶段
- `SALTMAKING` - 化盐工艺
- `HEATING` - 提温工艺
- `QUALITY_CHECK` - 质量检验

**请求示例**:
```json
{
  "progress": 80
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "阶段进度更新成功",
  "data": null
}
```

## 5. 项目任务管理接口

### 5.1 获取项目任务列表

**接口地址**: `GET /erp/saltprocess/project/{projectId}/tasks`

**权限要求**: `erp:saltprocess:project:list`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | string | 是 | 项目ID |

**请求示例**:
```bash
GET /erp/saltprocess/project/proj_001/tasks
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "task_001",
      "projectId": "proj_001",
      "taskName": "预热设备检查",
      "taskType": "PREHEATING",
      "status": "COMPLETED",
      "assigneeId": "user123",
      "assigneeName": "张三",
      "plannedStartTime": "2024-01-15T08:00:00Z",
      "plannedEndTime": "2024-01-15T12:00:00Z",
      "actualStartTime": "2024-01-15T08:00:00Z",
      "actualEndTime": "2024-01-15T11:30:00Z",
      "priority": "HIGH",
      "description": "检查预热设备运行状态",
      "dependencies": [],
      "createTime": "2024-01-10T10:00:00Z"
    },
    {
      "id": "task_002",
      "projectId": "proj_001",
      "taskName": "化盐配比调整",
      "taskType": "SALTMAKING",
      "status": "IN_PROGRESS",
      "assigneeId": "user456",
      "assigneeName": "李四",
      "plannedStartTime": "2024-02-16T09:00:00Z",
      "plannedEndTime": "2024-02-16T17:00:00Z",
      "actualStartTime": "2024-02-16T09:15:00Z",
      "actualEndTime": null,
      "priority": "MEDIUM",
      "description": "根据工艺要求调整化盐配比",
      "dependencies": ["task_001"],
      "createTime": "2024-02-10T14:00:00Z"
    }
  ]
}
```

### 5.2 创建项目任务

**接口地址**: `POST /erp/saltprocess/project/task`

**权限要求**: `erp:saltprocess:project:edit`

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| projectId | string | 是 | 项目ID | - |
| taskName | string | 是 | 任务名称 | - |
| taskType | string | 是 | 任务类型 | PREHEATING/SALTMAKING/HEATING/QUALITY_CHECK/OTHER |
| assigneeId | string | 是 | 执行人ID | - |
| plannedStartTime | string | 是 | 计划开始时间 | ISO 8601格式 |
| plannedEndTime | string | 是 | 计划结束时间 | ISO 8601格式 |
| priority | string | 是 | 优先级 | LOW/MEDIUM/HIGH/URGENT |
| description | string | 否 | 任务描述 | - |
| dependencies | string[] | 否 | 依赖任务ID列表 | - |

**请求示例**:
```json
{
  "projectId": "proj_001",
  "taskName": "质量检验",
  "taskType": "QUALITY_CHECK",
  "assigneeId": "user789",
  "plannedStartTime": "2024-06-01T08:00:00Z",
  "plannedEndTime": "2024-06-01T16:00:00Z",
  "priority": "HIGH",
  "description": "对化盐产品进行质量检验",
  "dependencies": ["task_002"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "任务创建成功",
  "data": {
    "id": "task_003",
    "projectId": "proj_001",
    "taskName": "质量检验",
    "taskType": "QUALITY_CHECK",
    "status": "PENDING",
    "assigneeId": "user789",
    "assigneeName": "王五",
    "plannedStartTime": "2024-06-01T08:00:00Z",
    "plannedEndTime": "2024-06-01T16:00:00Z",
    "actualStartTime": null,
    "actualEndTime": null,
    "priority": "HIGH",
    "description": "对化盐产品进行质量检验",
    "dependencies": ["task_002"],
    "createTime": "2024-03-20T10:00:00Z"
  }
}
```

### 5.3 更新任务状态

**接口地址**: `PUT /erp/saltprocess/project/task/{taskId}/status`

**权限要求**: `erp:saltprocess:project:edit`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| status | string | 是 | 任务状态 | PENDING/IN_PROGRESS/COMPLETED/FAILED/CANCELLED |

**请求示例**:
```json
{
  "status": "COMPLETED"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "任务状态更新成功",
  "data": null
}
```

## 6. 项目风险管理接口

### 6.1 获取项目风险列表

**接口地址**: `GET /erp/saltprocess/project/{projectId}/risks`

**权限要求**: `erp:saltprocess:project:list`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | string | 是 | 项目ID |

**请求示例**:
```bash
GET /erp/saltprocess/project/proj_001/risks
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "risk_001",
      "projectId": "proj_001",
      "riskName": "设备故障风险",
      "riskType": "TECHNICAL",
      "riskLevel": "HIGH",
      "probability": 30,
      "impact": 80,
      "riskScore": 24,
      "description": "预热设备可能出现故障，影响生产进度",
      "mitigationPlan": "定期维护设备，准备备用设备",
      "contingencyPlan": "启用备用设备，调整生产计划",
      "ownerId": "user123",
      "ownerName": "张三",
      "status": "IDENTIFIED",
      "createTime": "2024-01-20T10:00:00Z",
      "updateTime": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### 6.2 创建项目风险

**接口地址**: `POST /erp/saltprocess/project/risk`

**权限要求**: `erp:saltprocess:project:edit`

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| projectId | string | 是 | 项目ID | - |
| riskName | string | 是 | 风险名称 | - |
| riskType | string | 是 | 风险类型 | TECHNICAL/SCHEDULE/COST/QUALITY/SAFETY |
| riskLevel | string | 是 | 风险等级 | LOW/MEDIUM/HIGH/CRITICAL |
| probability | number | 是 | 发生概率 | 0-100 |
| impact | number | 是 | 影响程度 | 0-100 |
| description | string | 是 | 风险描述 | - |
| mitigationPlan | string | 否 | 缓解计划 | - |
| contingencyPlan | string | 否 | 应急计划 | - |
| ownerId | string | 是 | 负责人ID | - |

**请求示例**:
```json
{
  "projectId": "proj_001",
  "riskName": "原料供应延迟",
  "riskType": "SCHEDULE",
  "riskLevel": "MEDIUM",
  "probability": 40,
  "impact": 60,
  "description": "原料供应商可能延迟交货",
  "mitigationPlan": "与多个供应商建立合作关系",
  "contingencyPlan": "启用备用供应商",
  "ownerId": "user456"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "风险创建成功",
  "data": {
    "id": "risk_002",
    "projectId": "proj_001",
    "riskName": "原料供应延迟",
    "riskType": "SCHEDULE",
    "riskLevel": "MEDIUM",
    "probability": 40,
    "impact": 60,
    "riskScore": 24,
    "description": "原料供应商可能延迟交货",
    "mitigationPlan": "与多个供应商建立合作关系",
    "contingencyPlan": "启用备用供应商",
    "ownerId": "user456",
    "ownerName": "李四",
    "status": "IDENTIFIED",
    "createTime": "2024-03-20T11:00:00Z",
    "updateTime": "2024-03-20T11:00:00Z"
  }
}
```

### 6.3 更新风险状态

**接口地址**: `PUT /erp/saltprocess/project/risk/{riskId}/status`

**权限要求**: `erp:saltprocess:project:edit`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| riskId | string | 是 | 风险ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| status | string | 是 | 风险状态 | IDENTIFIED/ASSESSED/MITIGATED/CLOSED |

**请求示例**:
```json
{
  "status": "MITIGATED"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "风险状态更新成功",
  "data": null
}
```

## 7. 项目变更管理接口

### 7.1 获取项目变更列表

**接口地址**: `GET /erp/saltprocess/project/{projectId}/changes`

**权限要求**: `erp:saltprocess:project:list`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| projectId | string | 是 | 项目ID |

**请求示例**:
```bash
GET /erp/saltprocess/project/proj_001/changes
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "change_001",
      "projectId": "proj_001",
      "changeType": "SCHEDULE",
      "changeTitle": "延长项目周期",
      "changeDescription": "由于设备维护需要，项目周期需要延长2周",
      "changeReason": "设备维护时间超出预期",
      "impact": "项目完成时间延后2周，成本增加5%",
      "requesterId": "user123",
      "requesterName": "张三",
      "requestTime": "2024-03-15T10:00:00Z",
      "approvalStatus": "PENDING",
      "approverId": null,
      "approverName": null,
      "approvalTime": null,
      "approvalComments": null,
      "implementationPlan": "调整项目计划，重新安排资源",
      "implementationStatus": "NOT_STARTED"
    }
  ]
}
```

### 7.2 创建变更请求

**接口地址**: `POST /erp/saltprocess/project/change`

**权限要求**: `erp:saltprocess:project:edit`

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| projectId | string | 是 | 项目ID | - |
| changeType | string | 是 | 变更类型 | SCOPE/SCHEDULE/COST/QUALITY/RESOURCE |
| changeTitle | string | 是 | 变更标题 | - |
| changeDescription | string | 是 | 变更描述 | - |
| changeReason | string | 是 | 变更原因 | - |
| impact | string | 是 | 影响分析 | - |
| implementationPlan | string | 否 | 实施计划 | - |

**请求示例**:
```json
{
  "projectId": "proj_001",
  "changeType": "COST",
  "changeTitle": "增加质量检测设备",
  "changeDescription": "为提高产品质量，需要增加一套质量检测设备",
  "changeReason": "客户要求提高产品质量标准",
  "impact": "成本增加10万元，质量检测精度提升20%",
  "implementationPlan": "采购设备，培训操作人员，调整工艺流程"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "变更请求创建成功",
  "data": {
    "id": "change_002",
    "projectId": "proj_001",
    "changeType": "COST",
    "changeTitle": "增加质量检测设备",
    "changeDescription": "为提高产品质量，需要增加一套质量检测设备",
    "changeReason": "客户要求提高产品质量标准",
    "impact": "成本增加10万元，质量检测精度提升20%",
    "requesterId": "user123",
    "requesterName": "张三",
    "requestTime": "2024-03-20T14:00:00Z",
    "approvalStatus": "PENDING",
    "approverId": null,
    "approverName": null,
    "approvalTime": null,
    "approvalComments": null,
    "implementationPlan": "采购设备，培训操作人员，调整工艺流程",
    "implementationStatus": "NOT_STARTED"
  }
}
```

### 7.3 审批变更请求

**接口地址**: `PUT /erp/saltprocess/project/change/{changeId}/approve`

**权限要求**: `erp:saltprocess:project:edit`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| changeId | string | 是 | 变更ID |

**请求体参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| approved | boolean | 是 | 是否批准 |
| comments | string | 否 | 审批意见 |

**请求示例**:
```json
{
  "approved": true,
  "comments": "同意增加质量检测设备，有助于提升产品竞争力"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "变更审批成功",
  "data": null
}
```

## 8. 配置管理接口

### 8.1 获取工艺配置列表

**接口地址**: `GET /erp/saltprocess/project/process-config`

**权限要求**: `erp:saltprocess:project:list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| projectType | string | 否 | 项目类型筛选 | BINARY_SALT/TERNARY_SALT |

**请求示例**:
```bash
GET /erp/saltprocess/project/process-config?projectType=BINARY_SALT
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "config_001",
      "configName": "二元化盐标准配置",
      "projectType": "BINARY_SALT",
      "preheatingConfig": {
        "targetTemperature": 80,
        "targetPressure": 0.2,
        "tolerance": 2,
        "duration": 30,
        "heatingRate": 2.5
      },
      "saltmakingConfig": {
        "targetTemperature": 120,
        "targetPressure": 0.5,
        "stirringSpeed": 150,
        "ratioConfig": [
          {
            "component": "NaCl",
            "componentName": "氯化钠",
            "targetRatio": 60,
            "tolerance": 2,
            "priority": 1
          },
          {
            "component": "KCl",
            "componentName": "氯化钾",
            "targetRatio": 40,
            "tolerance": 2,
            "priority": 2
          }
        ],
        "reactionTime": 120
      },
      "heatingConfig": {
        "stages": [
          {
            "stageName": "初期加热",
            "startTemperature": 120,
            "endTemperature": 180,
            "heatingRate": 1.5,
            "duration": 40
          },
          {
            "stageName": "中期加热",
            "startTemperature": 180,
            "endTemperature": 200,
            "heatingRate": 1.0,
            "duration": 20
          }
        ],
        "finalTemperature": 200,
        "holdingTime": 60
      },
      "isDefault": true,
      "createTime": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 8.2 获取质量标准列表

**接口地址**: `GET /erp/saltprocess/project/quality-standard`

**权限要求**: `erp:saltprocess:project:list`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 可选值 |
|--------|------|------|------|--------|
| projectType | string | 否 | 项目类型筛选 | BINARY_SALT/TERNARY_SALT |

**请求示例**:
```bash
GET /erp/saltprocess/project/quality-standard?projectType=BINARY_SALT
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "standard_001",
      "standardName": "二元化盐质量标准",
      "projectType": "BINARY_SALT",
      "testItems": [
        {
          "itemName": "纯度",
          "itemCode": "PURITY",
          "standardValue": "≥99.5%",
          "tolerance": "±0.1%",
          "unit": "%",
          "testMethod": "化学分析法",
          "isRequired": true
        },
        {
          "itemName": "水分含量",
          "itemCode": "MOISTURE",
          "standardValue": "≤0.5%",
          "tolerance": "±0.05%",
          "unit": "%",
          "testMethod": "干燥失重法",
          "isRequired": true
        },
        {
          "itemName": "粒度分布",
          "itemCode": "PARTICLE_SIZE",
          "standardValue": "0.5-2.0mm",
          "tolerance": "±0.1mm",
          "unit": "mm",
          "testMethod": "筛分法",
          "isRequired": false
        }
      ],
      "isDefault": true,
      "createTime": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 8.3 获取资源计划列表

**接口地址**: `GET /erp/saltprocess/project/resource-plan`

**权限要求**: `erp:saltprocess:project:list`

**请求示例**:
```bash
GET /erp/saltprocess/project/resource-plan
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": "plan_001",
      "planName": "标准资源计划",
      "personnelPlan": [
        {
          "roleId": "role_001",
          "roleName": "项目经理",
          "requiredCount": 1,
          "assignedPersonnel": [
            {
              "userId": "user123",
              "userName": "张三",
              "workShift": "白班",
              "startDate": "2024-01-15",
              "endDate": "2024-06-30"
            }
          ]
        },
        {
          "roleId": "role_002",
          "roleName": "工艺工程师",
          "requiredCount": 2,
          "assignedPersonnel": [
            {
              "userId": "user456",
              "userName": "李四",
              "workShift": "白班",
              "startDate": "2024-01-15",
              "endDate": "2024-06-30"
            }
          ]
        }
      ],
      "equipmentPlan": [
        {
          "equipmentId": "eq_001",
          "equipmentName": "预热反应釜",
          "equipmentType": "反应设备",
          "requiredDuration": 720,
          "scheduledStartTime": "2024-01-15T08:00:00Z",
          "scheduledEndTime": "2024-02-15T08:00:00Z"
        },
        {
          "equipmentId": "eq_002",
          "equipmentName": "化盐反应釜",
          "equipmentType": "反应设备",
          "requiredDuration": 1800,
          "scheduledStartTime": "2024-02-16T08:00:00Z",
          "scheduledEndTime": "2024-04-30T08:00:00Z"
        }
      ],
      "materialPlan": [
        {
          "materialId": "mat_001",
          "materialName": "氯化钠",
          "specification": "工业级",
          "requiredQuantity": 600,
          "unit": "kg",
          "estimatedCost": 1200,
          "supplierId": "sup_001",
          "supplierName": "化工原料供应商A"
        },
        {
          "materialId": "mat_002",
          "materialName": "氯化钾",
          "specification": "工业级",
          "requiredQuantity": 400,
          "unit": "kg",
          "estimatedCost": 2000,
          "supplierId": "sup_002",
          "supplierName": "化工原料供应商B"
        }
      ],
      "createTime": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 9. 导出接口

### 9.1 导出项目列表

**接口地址**: `GET /erp/saltprocess/project/export`

**权限要求**: `erp:saltprocess:project:export`

**请求参数**: 与查询项目列表相同

**响应类型**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**请求示例**:
```bash
GET /erp/saltprocess/project/export?status=IN_PROGRESS&projectType=BINARY_SALT
```

**响应说明**: 返回Excel文件流，包含项目列表数据

### 9.2 导出项目详情报告

**接口地址**: `GET /erp/saltprocess/project/{id}/export`

**权限要求**: `erp:saltprocess:project:export`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**响应类型**: `application/pdf`

**请求示例**:
```bash
GET /erp/saltprocess/project/proj_001/export
```

**响应说明**: 返回PDF文件流，包含项目详细报告

## 10. 数据模型

### 10.1 核心数据模型

#### SaltProjectVO - 化盐项目视图对象
```typescript
interface SaltProjectVO {
  id: string;                    // 项目ID
  projectCode: string;           // 项目编码
  projectName: string;           // 项目名称
  projectType: ProjectType;      // 项目类型
  status: ProjectStatus;         // 项目状态
  progress: number;              // 项目进度(0-100)
  currentPhase: string;          // 当前阶段
  managerId: string;             // 负责人ID
  managerName: string;           // 负责人姓名
  startDate: string;             // 开始日期
  endDate?: string;              // 结束日期
  description?: string;          // 项目描述
  processConfig?: ProcessConfig; // 工艺配置
  qualityStandards?: QualityStandard[]; // 质量标准
  resourcePlan?: ResourcePlan;   // 资源计划
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
  createBy: string;              // 创建人
  updateBy?: string;             // 更新人
}
```

#### SaltProjectForm - 化盐项目表单对象
```typescript
interface SaltProjectForm {
  id?: string;                   // 项目ID（更新时必填）
  projectName: string;           // 项目名称
  projectType: ProjectType;      // 项目类型
  managerId: string;             // 负责人ID
  startDate: string;             // 开始日期
  endDate?: string;              // 结束日期
  description?: string;          // 项目描述
  processConfigId?: string;      // 工艺配置ID
  qualityStandardId?: string;    // 质量标准ID
  resourcePlanId?: string;       // 资源计划ID
}
```

#### SaltProjectQuery - 化盐项目查询参数
```typescript
interface SaltProjectQuery extends PageQuery {
  projectName?: string;          // 项目名称（模糊查询）
  projectCode?: string;          // 项目编码（模糊查询）
  status?: ProjectStatus;        // 项目状态
  projectType?: ProjectType;     // 项目类型
  managerId?: string;            // 负责人ID
  startDate?: string;            // 开始日期
  endDate?: string;              // 结束日期
}
```

### 10.2 枚举类型

#### ProjectStatus - 项目状态
```typescript
enum ProjectStatus {
  PLANNING = 'PLANNING',         // 规划中
  IN_PROGRESS = 'IN_PROGRESS',   // 进行中
  COMPLETED = 'COMPLETED',       // 已完成
  SUSPENDED = 'SUSPENDED',       // 已暂停
  CANCELLED = 'CANCELLED'        // 已取消
}
```

#### ProjectType - 项目类型
```typescript
enum ProjectType {
  BINARY_SALT = 'BINARY_SALT',   // 二元化盐
  TERNARY_SALT = 'TERNARY_SALT'  // 三元化盐
}
```

#### TaskStatus - 任务状态
```typescript
enum TaskStatus {
  PENDING = 'PENDING',           // 待开始
  IN_PROGRESS = 'IN_PROGRESS',   // 进行中
  COMPLETED = 'COMPLETED',       // 已完成
  FAILED = 'FAILED',             // 失败
  CANCELLED = 'CANCELLED'        // 已取消
}
```

### 10.3 工艺配置模型

#### ProcessConfig - 工艺配置
```typescript
interface ProcessConfig {
  id: string;                    // 配置ID
  configName: string;            // 配置名称
  projectType: ProjectType;      // 项目类型
  preheatingConfig: PreheatingConfig;  // 预热配置
  saltmakingConfig: SaltmakingConfig;  // 化盐配置
  heatingConfig: HeatingConfig;        // 提温配置
  isDefault: boolean;            // 是否默认配置
  createTime: string;            // 创建时间
}
```

#### PreheatingConfig - 预热配置
```typescript
interface PreheatingConfig {
  targetTemperature: number;     // 目标温度(°C)
  targetPressure: number;        // 目标压力(MPa)
  tolerance: number;             // 容差(°C)
  duration: number;              // 持续时间(分钟)
  heatingRate: number;           // 升温速率(°C/min)
}
```

#### SaltmakingConfig - 化盐配置
```typescript
interface SaltmakingConfig {
  targetTemperature: number;     // 目标温度(°C)
  targetPressure: number;        // 目标压力(MPa)
  stirringSpeed: number;         // 搅拌速度(rpm)
  ratioConfig: RatioConfigItem[]; // 配比配置
  reactionTime: number;          // 反应时间(分钟)
}
```

#### RatioConfigItem - 配比配置项
```typescript
interface RatioConfigItem {
  component: string;             // 组分代码
  componentName: string;         // 组分名称
  targetRatio: number;           // 目标配比(%)
  tolerance: number;             // 容差(%)
  priority: number;              // 优先级
}
```

### 10.4 质量标准模型

#### QualityStandard - 质量标准
```typescript
interface QualityStandard {
  id: string;                    // 标准ID
  standardName: string;          // 标准名称
  projectType: ProjectType;      // 项目类型
  testItems: QualityTestStandard[]; // 检测项目
  isDefault: boolean;            // 是否默认标准
  createTime: string;            // 创建时间
}
```

#### QualityTestStandard - 质量检测标准
```typescript
interface QualityTestStandard {
  itemName: string;              // 检测项目名称
  itemCode: string;              // 检测项目代码
  standardValue: string;         // 标准值
  tolerance: string;             // 容差
  unit: string;                  // 单位
  testMethod: string;            // 检测方法
  isRequired: boolean;           // 是否必检
}
```

### 10.5 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权访问 | 检查认证token是否有效 |
| 403 | 权限不足 | 检查用户是否有相应操作权限 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 409 | 资源冲突 | 检查是否存在重复数据或状态冲突 |
| 500 | 服务器内部错误 | 联系系统管理员 |

### 10.6 业务规则说明

1. **项目状态流转规则**:
   - PLANNING → IN_PROGRESS → COMPLETED
   - 任何状态都可以转为 SUSPENDED 或 CANCELLED
   - COMPLETED 状态不可逆转

2. **项目删除规则**:
   - 只有 PLANNING 和 CANCELLED 状态的项目可以删除
   - 删除为逻辑删除，保留历史数据

3. **任务依赖规则**:
   - 任务必须等待依赖任务完成后才能开始
   - 不允许循环依赖

4. **进度计算规则**:
   - 项目总进度 = 各阶段进度的加权平均
   - 阶段进度 = 该阶段已完成任务数 / 总任务数 × 100%

5. **权限控制规则**:
   - 项目负责人拥有项目的完整操作权限
   - 普通用户只能查看分配给自己的任务
   - 管理员拥有所有项目的操作权限

---

## 总结

本文档详细描述了海棠企业管理系统中化盐项目管理模块的完整API接口规范，包括：

- **完整的CRUD操作**: 涵盖项目的创建、查询、更新、删除等基础操作
- **业务管理功能**: 包括状态管理、进度跟踪、统计分析等业务功能
- **扩展管理功能**: 涵盖任务管理、风险管理、变更管理等高级功能
- **配置管理**: 提供工艺配置、质量标准、资源计划等配置管理
- **数据导出**: 支持项目列表和详情报告的导出功能

该API设计遵循RESTful规范，具有良好的可扩展性和维护性，能够满足化盐项目管理的各种业务需求。
