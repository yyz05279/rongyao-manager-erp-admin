# 化盐项目工艺流程管理模块API接口文档（更新版）

## 1. 接口概述

### 1.1 基础信息
- **服务名称**：Salt Process Management Service
- **版本**：v2.0
- **基础URL**：`/erp/saltprocess`
- **认证方式**：SaToken
- **数据格式**：JSON

### 1.2 通用响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "timestamp": "2025-09-10T10:30:00Z"
}
```

### 1.3 分页响应格式
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [],
  "total": 100
}
```

## 2. 化盐项目基础信息管理接口

### 2.1 查询项目列表
**接口地址**：`GET /erp/saltprocess/project/list`
**权限**：`erp:saltprocess:project:list`

**请求参数**：
- `pageNum`: 页码
- `pageSize`: 每页大小
- `projectCode`: 项目编码（可选）
- `projectName`: 项目名称（可选）
- `status`: 项目状态（可选）

**响应数据**：
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "id": 1,
      "projectCode": "SP20250910001",
      "projectName": "化盐项目A",
      "status": 1,
      "createTime": "2025-09-10T10:30:00Z"
    }
  ],
  "total": 100
}
```

### 2.2 获取项目详情
**接口地址**：`GET /erp/saltprocess/project/{id}`
**权限**：`erp:saltprocess:project:query`

**路径参数**：
- `id`: 项目ID

**响应数据**：
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "projectCode": "SP20250910001",
    "projectName": "化盐项目A",
    "status": 1,
    "description": "项目描述",
    "createTime": "2025-09-10T10:30:00Z"
  }
}
```

### 2.3 根据项目编码获取项目信息
**接口地址**：`GET /erp/saltprocess/project/code/{projectCode}`
**权限**：`erp:saltprocess:project:query`

### 2.4 新增项目
**接口地址**：`POST /erp/saltprocess/project`
**权限**：`erp:saltprocess:project:add`

**请求参数**：
```json
{
  "projectCode": "SP20250910001",
  "projectName": "化盐项目A",
  "description": "项目描述",
  "customerId": 1,
  "projectManagerId": 1
}
```

### 2.5 修改项目
**接口地址**：`PUT /erp/saltprocess/project`
**权限**：`erp:saltprocess:project:edit`

### 2.6 删除项目
**接口地址**：`DELETE /erp/saltprocess/project/{ids}`
**权限**：`erp:saltprocess:project:remove`

### 2.7 导出项目列表
**接口地址**：`POST /erp/saltprocess/project/export`
**权限**：`erp:saltprocess:project:export`

### 2.8 业务查询接口
- `GET /erp/saltprocess/project/customer/{customerId}` - 根据客户ID查询项目
- `GET /erp/saltprocess/project/manager/{projectManagerId}` - 根据项目经理查询项目
- `GET /erp/saltprocess/project/status/{status}` - 根据状态查询项目
- `GET /erp/saltprocess/project/active` - 查询进行中的项目
- `GET /erp/saltprocess/project/overdue` - 查询超期项目

### 2.9 统计分析接口
- `GET /erp/saltprocess/project/statistics` - 项目统计信息
- `GET /erp/saltprocess/project/statistics/type` - 按类型统计项目数量

### 2.10 项目管理操作
- `PUT /erp/saltprocess/project/{id}/progress` - 更新项目进度
- `PUT /erp/saltprocess/project/{id}/status` - 更新项目状态
- `GET /erp/saltprocess/project/generate-code` - 生成项目编码
- `POST /erp/saltprocess/project/batch` - 批量操作

## 3. 预热任务管理接口

### 3.1 基础CRUD操作
- `GET /erp/saltprocess/preheating-task/list` - 查询预热任务列表
- `GET /erp/saltprocess/preheating-task/{id}` - 获取预热任务详情
- `GET /erp/saltprocess/preheating-task/code/{taskCode}` - 根据任务编号查询
- `POST /erp/saltprocess/preheating-task` - 新增预热任务
- `PUT /erp/saltprocess/preheating-task` - 修改预热任务
- `DELETE /erp/saltprocess/preheating-task/{ids}` - 删除预热任务
- `POST /erp/saltprocess/preheating-task/export` - 导出预热任务

### 3.2 业务查询接口
- `GET /erp/saltprocess/preheating-task/project/{projectId}` - 根据项目查询任务
- `GET /erp/saltprocess/preheating-task/status/{status}` - 根据状态查询任务
- `GET /erp/saltprocess/preheating-task/phase/{phase}` - 根据预热阶段查询
- `GET /erp/saltprocess/preheating-task/responsible/{responsibleId}` - 根据负责人查询
- `GET /erp/saltprocess/preheating-task/ongoing` - 查询进行中的任务
- `GET /erp/saltprocess/preheating-task/completed` - 查询已完成的任务
- `GET /erp/saltprocess/preheating-task/overdue` - 查询超期任务

### 3.3 任务操作接口
- `POST /erp/saltprocess/preheating-task/{id}/start` - 启动任务
- `POST /erp/saltprocess/preheating-task/{id}/pause` - 暂停任务
- `POST /erp/saltprocess/preheating-task/{id}/complete` - 完成任务
- `POST /erp/saltprocess/preheating-task/{id}/cancel` - 取消任务
- `POST /erp/saltprocess/preheating-task/{id}/restart` - 重启任务

### 3.4 统计分析接口
- `GET /erp/saltprocess/preheating-task/statistics` - 任务统计信息
- `GET /erp/saltprocess/preheating-task/{id}/progress` - 任务进度分析
- `POST /erp/saltprocess/preheating-task/import` - 批量导入任务
- `GET /erp/saltprocess/preheating-task/generate-code` - 生成任务编号

## 4. 预热数据记录管理接口

### 4.1 基础CRUD操作
- `GET /erp/saltprocess/preheating-data/list` - 查询预热数据列表
- `GET /erp/saltprocess/preheating-data/{id}` - 获取预热数据详情
- `POST /erp/saltprocess/preheating-data` - 新增预热数据
- `PUT /erp/saltprocess/preheating-data` - 修改预热数据
- `DELETE /erp/saltprocess/preheating-data/{ids}` - 删除预热数据
- `POST /erp/saltprocess/preheating-data/export` - 导出预热数据

### 4.2 业务查询接口
- `GET /erp/saltprocess/preheating-data/task/{taskId}` - 根据任务查询数据
- `GET /erp/saltprocess/preheating-data/project/{projectId}` - 根据项目查询数据
- `GET /erp/saltprocess/preheating-data/time-range` - 根据时间范围查询
- `GET /erp/saltprocess/preheating-data/temperature-range` - 根据温度范围查询
- `GET /erp/saltprocess/preheating-data/pressure-range` - 根据压力范围查询
- `GET /erp/saltprocess/preheating-data/recorder/{recorderId}` - 根据记录人查询
- `GET /erp/saltprocess/preheating-data/abnormal` - 查询异常数据
- `GET /erp/saltprocess/preheating-data/latest` - 查询最新数据

### 4.3 数据分析接口
- `GET /erp/saltprocess/preheating-data/statistics` - 数据统计信息
- `GET /erp/saltprocess/preheating-data/task/{taskId}/time-range` - 任务时间范围数据
- `GET /erp/saltprocess/preheating-data/task/{taskId}/trend` - 数据趋势分析
- `GET /erp/saltprocess/preheating-data/{id}/quality-check` - 数据质量检查

### 4.4 数据管理操作
- `POST /erp/saltprocess/preheating-data/import` - 批量导入数据
- `POST /erp/saltprocess/preheating-data/{id}/calibrate` - 数据校准
- `POST /erp/saltprocess/preheating-data/backup` - 数据备份

## 5. 预热检查记录管理接口

### 5.1 基础CRUD操作
- `GET /erp/saltprocess/preheating-inspection/list` - 查询检查记录列表
- `GET /erp/saltprocess/preheating-inspection/{id}` - 获取检查记录详情
- `POST /erp/saltprocess/preheating-inspection` - 新增检查记录
- `PUT /erp/saltprocess/preheating-inspection` - 修改检查记录
- `DELETE /erp/saltprocess/preheating-inspection/{ids}` - 删除检查记录
- `POST /erp/saltprocess/preheating-inspection/export` - 导出检查记录

### 5.2 业务查询接口
- `GET /erp/saltprocess/preheating-inspection/task/{taskId}` - 根据任务查询
- `GET /erp/saltprocess/preheating-inspection/project/{projectId}` - 根据项目查询
- `GET /erp/saltprocess/preheating-inspection/status/{status}` - 根据状态查询
- `GET /erp/saltprocess/preheating-inspection/inspector/{inspectorId}` - 根据检查人查询
- `GET /erp/saltprocess/preheating-inspection/time-range` - 根据时间范围查询
- `GET /erp/saltprocess/preheating-inspection/pending` - 查询待检查记录
- `GET /erp/saltprocess/preheating-inspection/completed` - 查询已完成记录
- `GET /erp/saltprocess/preheating-inspection/abnormal` - 查询异常记录
- `GET /erp/saltprocess/preheating-inspection/overdue` - 查询超期记录

### 5.3 检查操作接口
- `POST /erp/saltprocess/preheating-inspection/{id}/start` - 开始检查
- `POST /erp/saltprocess/preheating-inspection/{id}/complete` - 完成检查
- `POST /erp/saltprocess/preheating-inspection/{id}/reinspect` - 重新检查

### 5.4 分析报告接口
- `GET /erp/saltprocess/preheating-inspection/statistics` - 检查统计信息
- `GET /erp/saltprocess/preheating-inspection/task/{taskId}/time-range` - 任务时间范围检查
- `GET /erp/saltprocess/preheating-inspection/{id}/analysis` - 检查结果分析
- `POST /erp/saltprocess/preheating-inspection/{id}/report` - 生成检查报告
- `POST /erp/saltprocess/preheating-inspection/plan` - 检查计划制定
- `POST /erp/saltprocess/preheating-inspection/import` - 批量导入检查记录

## 6. 检查点记录管理接口

### 6.1 基础CRUD操作
- `GET /erp/saltprocess/checkpoint-record/list` - 查询检查点记录列表
- `GET /erp/saltprocess/checkpoint-record/{id}` - 获取检查点记录详情
- `POST /erp/saltprocess/checkpoint-record` - 新增检查点记录
- `PUT /erp/saltprocess/checkpoint-record` - 修改检查点记录
- `DELETE /erp/saltprocess/checkpoint-record/{ids}` - 删除检查点记录
- `POST /erp/saltprocess/checkpoint-record/export` - 导出检查点记录

### 6.2 业务查询接口
- `GET /erp/saltprocess/checkpoint-record/task/{taskId}` - 根据任务查询记录
- `GET /erp/saltprocess/checkpoint-record/project/{projectId}` - 根据项目查询记录
- `GET /erp/saltprocess/checkpoint-record/type/{checkpointType}` - 根据检查点类型查询
- `GET /erp/saltprocess/checkpoint-record/status/{checkStatus}` - 根据检查状态查询
- `GET /erp/saltprocess/checkpoint-record/checker/{checkerId}` - 根据检查人查询
- `GET /erp/saltprocess/checkpoint-record/time-range` - 根据时间范围查询
- `GET /erp/saltprocess/checkpoint-record/abnormal` - 查询异常记录
- `GET /erp/saltprocess/checkpoint-record/pending` - 查询待检查记录
- `GET /erp/saltprocess/checkpoint-record/completed` - 查询已完成记录
- `GET /erp/saltprocess/checkpoint-record/overdue` - 查询超期记录

### 6.3 检查操作接口
- `POST /erp/saltprocess/checkpoint-record/{id}/start` - 开始检查
- `POST /erp/saltprocess/checkpoint-record/{id}/complete` - 完成检查
- `POST /erp/saltprocess/checkpoint-record/{id}/recheck` - 重新检查

### 6.4 分析管理接口
- `GET /erp/saltprocess/checkpoint-record/statistics` - 检查点记录统计
- `GET /erp/saltprocess/checkpoint-record/task/{taskId}/time-range` - 任务时间范围记录
- `GET /erp/saltprocess/checkpoint-record/{id}/analysis` - 检查结果分析
- `POST /erp/saltprocess/checkpoint-record/{id}/report` - 生成检查报告
- `POST /erp/saltprocess/checkpoint-record/plan` - 检查计划制定
- `POST /erp/saltprocess/checkpoint-record/{id}/reminder` - 检查提醒设置
- `POST /erp/saltprocess/checkpoint-record/import` - 批量导入记录

## 7. 检查点标准管理接口

### 7.1 基础CRUD操作
- `GET /erp/saltprocess/checkpoint-standard/list` - 查询检查点标准列表
- `GET /erp/saltprocess/checkpoint-standard/{id}` - 获取检查点标准详情
- `GET /erp/saltprocess/checkpoint-standard/code/{standardCode}` - 根据标准编号查询
- `GET /erp/saltprocess/checkpoint-standard/name/{standardName}` - 根据标准名称查询
- `POST /erp/saltprocess/checkpoint-standard` - 新增检查点标准
- `PUT /erp/saltprocess/checkpoint-standard` - 修改检查点标准
- `DELETE /erp/saltprocess/checkpoint-standard/{ids}` - 删除检查点标准
- `POST /erp/saltprocess/checkpoint-standard/export` - 导出检查点标准

### 7.2 业务查询接口
- `GET /erp/saltprocess/checkpoint-standard/type/{checkpointType}` - 根据检查点类型查询
- `GET /erp/saltprocess/checkpoint-standard/salt-type/{saltType}` - 根据盐类型查询
- `GET /erp/saltprocess/checkpoint-standard/stage/{processStage}` - 根据工艺阶段查询
- `GET /erp/saltprocess/checkpoint-standard/status/{status}` - 根据标准状态查询
- `GET /erp/saltprocess/checkpoint-standard/creator/{creatorId}` - 根据制定人查询
- `GET /erp/saltprocess/checkpoint-standard/reviewer/{reviewerId}` - 根据审核人查询
- `GET /erp/saltprocess/checkpoint-standard/published` - 查询已发布标准
- `GET /erp/saltprocess/checkpoint-standard/pending-review` - 查询待审核标准
- `GET /erp/saltprocess/checkpoint-standard/value-range` - 根据标准值范围查询
- `GET /erp/saltprocess/checkpoint-standard/effective-time-range` - 根据生效时间查询
- `GET /erp/saltprocess/checkpoint-standard/current-effective` - 查询当前有效标准
- `GET /erp/saltprocess/checkpoint-standard/code/{standardCode}/version/{version}` - 根据编号版本查询
- `GET /erp/saltprocess/checkpoint-standard/salt-type/{saltType}/stage/{processStage}` - 复合条件查询

### 7.3 标准管理操作
- `GET /erp/saltprocess/checkpoint-standard/generate-code` - 生成标准编号
- `POST /erp/saltprocess/checkpoint-standard/{id}/status` - 更新标准状态
- `POST /erp/saltprocess/checkpoint-standard/{id}/publish` - 发布标准
- `POST /erp/saltprocess/checkpoint-standard/{id}/review` - 审核标准
- `POST /erp/saltprocess/checkpoint-standard/{id}/copy` - 复制标准
- `POST /erp/saltprocess/checkpoint-standard/{id}/enable` - 启用标准
- `POST /erp/saltprocess/checkpoint-standard/{id}/disable` - 停用标准

### 7.4 分析统计接口
- `GET /erp/saltprocess/checkpoint-standard/statistics` - 标准统计信息
- `GET /erp/saltprocess/checkpoint-standard/{id}/usage-analysis` - 使用情况分析
- `GET /erp/saltprocess/checkpoint-standard/code/{standardCode}/versions` - 版本管理
- `GET /erp/saltprocess/checkpoint-standard/{id}/validate` - 标准有效性检查
- `POST /erp/saltprocess/checkpoint-standard/import` - 批量导入标准

## 8. 化盐任务管理接口

### 8.1 基础CRUD操作
- `GET /erp/saltprocess/making-task/list` - 查询化盐任务列表
- `GET /erp/saltprocess/making-task/{id}` - 获取化盐任务详情
- `GET /erp/saltprocess/making-task/code/{taskCode}` - 根据任务编号查询
- `POST /erp/saltprocess/making-task` - 新增化盐任务
- `PUT /erp/saltprocess/making-task` - 修改化盐任务
- `DELETE /erp/saltprocess/making-task/{ids}` - 删除化盐任务
- `POST /erp/saltprocess/making-task/export` - 导出化盐任务

### 8.2 业务查询接口
- `GET /erp/saltprocess/making-task/project/{projectId}` - 根据项目查询任务
- `GET /erp/saltprocess/making-task/status/{status}` - 根据任务状态查询
- `GET /erp/saltprocess/making-task/phase/{phase}` - 根据化盐阶段查询
- `GET /erp/saltprocess/making-task/responsible/{responsibleId}` - 根据负责人查询
- `GET /erp/saltprocess/making-task/priority/{priority}` - 根据优先级查询
- `GET /erp/saltprocess/making-task/ongoing` - 查询进行中任务
- `GET /erp/saltprocess/making-task/completed` - 查询已完成任务
- `GET /erp/saltprocess/making-task/overdue` - 查询超期任务
- `GET /erp/saltprocess/making-task/high-priority` - 查询高优先级任务
- `GET /erp/saltprocess/making-task/planned-time-range` - 根据计划时间查询
- `GET /erp/saltprocess/making-task/actual-time-range` - 根据实际时间查询

### 8.3 任务操作接口
- `POST /erp/saltprocess/making-task/{id}/start` - 启动任务
- `POST /erp/saltprocess/making-task/{id}/pause` - 暂停任务
- `POST /erp/saltprocess/making-task/{id}/complete` - 完成任务
- `POST /erp/saltprocess/making-task/{id}/cancel` - 取消任务
- `POST /erp/saltprocess/making-task/{id}/restart` - 重启任务
- `POST /erp/saltprocess/making-task/{id}/progress` - 更新任务进度
- `POST /erp/saltprocess/making-task/{id}/priority` - 调整任务优先级
- `POST /erp/saltprocess/making-task/{id}/allocate-resources` - 任务资源分配

### 8.4 分析管理接口
- `GET /erp/saltprocess/making-task/statistics` - 任务统计信息
- `GET /erp/saltprocess/making-task/{id}/progress-analysis` - 任务进度分析
- `GET /erp/saltprocess/making-task/generate-code` - 生成任务编号
- `POST /erp/saltprocess/making-task/import` - 批量导入任务
- `POST /erp/saltprocess/making-task/optimize-schedule` - 任务调度优化

## 9. 工艺参数模板管理接口

### 9.1 基础CRUD操作
- `GET /erp/saltprocess/process-template/list` - 查询工艺参数模板列表
- `GET /erp/saltprocess/process-template/{id}` - 获取工艺参数模板详情
- `GET /erp/saltprocess/process-template/code/{templateCode}` - 根据模板编码查询
- `GET /erp/saltprocess/process-template/name/{templateName}` - 根据模板名称查询
- `POST /erp/saltprocess/process-template` - 新增工艺参数模板
- `PUT /erp/saltprocess/process-template` - 修改工艺参数模板
- `DELETE /erp/saltprocess/process-template/{ids}` - 删除工艺参数模板
- `POST /erp/saltprocess/process-template/export` - 导出工艺参数模板

### 9.2 业务查询接口
- `GET /erp/saltprocess/process-template/salt-type/{saltType}` - 根据盐类型查询
- `GET /erp/saltprocess/process-template/status/{status}` - 根据模板状态查询
- `GET /erp/saltprocess/process-template/creator/{creatorId}` - 根据创建人查询
- `GET /erp/saltprocess/process-template/approver/{approverId}` - 根据审批人查询
- `GET /erp/saltprocess/process-template/published` - 查询已发布模板
- `GET /erp/saltprocess/process-template/pending-review` - 查询待审核模板
- `GET /erp/saltprocess/process-template/default` - 查询默认模板
- `GET /erp/saltprocess/process-template/active` - 查询启用模板
- `GET /erp/saltprocess/process-template/capacity-range` - 根据容量范围查询
- `GET /erp/saltprocess/process-template/salt-type/{saltType}/capacity-range` - 复合条件查询

### 9.3 模板管理操作
- `GET /erp/saltprocess/process-template/generate-code` - 生成模板编码
- `POST /erp/saltprocess/process-template/{id}/status` - 更新模板状态
- `POST /erp/saltprocess/process-template/{id}/publish` - 发布模板
- `POST /erp/saltprocess/process-template/{id}/review` - 审核模板
- `POST /erp/saltprocess/process-template/{id}/copy` - 复制模板
- `POST /erp/saltprocess/process-template/{id}/set-default` - 设置默认模板

### 9.4 分析统计接口
- `GET /erp/saltprocess/process-template/statistics` - 模板统计信息
- `GET /erp/saltprocess/process-template/{id}/usage-analysis` - 使用情况分析
- `GET /erp/saltprocess/process-template/code/{templateCode}/versions` - 版本管理
- `POST /erp/saltprocess/process-template/validate` - 模板参数验证
- `GET /erp/saltprocess/process-template/{id}/optimization-suggestions` - 优化建议
- `GET /erp/saltprocess/process-template/{id}/application-records` - 应用记录
- `GET /erp/saltprocess/process-template/{id}/effectiveness-evaluation` - 效果评估
- `POST /erp/saltprocess/process-template/import` - 批量导入模板

## 10. 权限控制说明

### 10.1 权限命名规范
权限格式：`erp:saltprocess:{module}:{action}`

**模块列表**：
- `project` - 项目管理
- `preheating-task` - 预热任务
- `preheating-data` - 预热数据
- `preheating-inspection` - 预热检查
- `checkpoint-record` - 检查点记录
- `checkpoint-standard` - 检查点标准
- `making-task` - 化盐任务
- `process-template` - 工艺模板

**操作列表**：
- `list` - 查询列表
- `query` - 查询详情
- `add` - 新增
- `edit` - 修改
- `remove` - 删除
- `export` - 导出
- `statistics` - 统计查询

### 10.2 权限示例
```
erp:saltprocess:project:list
erp:saltprocess:project:query
erp:saltprocess:project:add
erp:saltprocess:project:edit
erp:saltprocess:project:remove
erp:saltprocess:project:export
erp:saltprocess:project:statistics
```

## 11. 错误码定义

### 11.1 通用错误码
- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 11.2 业务错误码
- `10001`: 项目编码已存在
- `10002`: 项目不存在
- `10003`: 任务状态不允许此操作
- `10004`: 检查点标准已发布，不允许修改
- `10005`: 模板正在使用中，不允许删除

---

**文档版本**：V2.0
**更新日期**：2025年09月10日
**更新说明**：基于实际Controller代码更新，确保API文档与实现完全一致
**维护人员**：后端开发团队
