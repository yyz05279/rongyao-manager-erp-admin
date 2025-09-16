# 海棠企业管理系统 - 通用项目管理模块 API 接口文档

## 概述

通用项目管理模块提供完整的项目生命周期管理功能，包括项目创建、成员管理、进度跟踪、任务分配等核心功能。

**重要说明**：此模块为通用项目管理，与 `saltprocess/project`（盐化工艺项目）模块功能互补：
- `saltprocess/project`: 专门用于盐化工艺项目的工艺流程管理
- `erp/project`: 通用项目管理，适用于各种类型的企业项目（IT项目、市场项目、研发项目等）

### 基础信息
- **模块路径**: `/erp/project`
- **版本**: v1.0.0
- **认证方式**: Bearer Token
- **数据格式**: JSON

### 权限控制
所有接口都需要相应的权限控制，使用 `v-hasPermi` 指令进行前端权限校验：

```typescript
// 权限码格式：erp:project:{operation}
'erp:project:list'     // 查看项目列表
'erp:project:add'      // 创建项目
'erp:project:edit'     // 编辑项目
'erp:project:remove'   // 删除项目
'erp:project:export'   // 导出项目
'erp:project:member'   // 成员管理
'erp:project:task'     // 任务管理
```

## 1. 项目基础管理接口

### 1.1 查询项目列表

**接口地址**: `GET /erp/project/list`

**权限要求**: `erp:project:list`

**请求参数**:
```typescript
interface ProjectQuery {
  pageNum?: number;        // 页码，默认1
  pageSize?: number;       // 每页数量，默认10
  projectName?: string;    // 项目名称（模糊查询）
  projectCode?: string;    // 项目编码（精确查询）
  status?: ProjectStatus;  // 项目状态
  priority?: ProjectPriority; // 优先级
  managerId?: string;      // 负责人ID
  departmentId?: string;   // 部门ID
  startDate?: string;      // 开始日期（YYYY-MM-DD）
  endDate?: string;        // 结束日期（YYYY-MM-DD）
  keyword?: string;        // 关键词搜索
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": "proj_001",
        "projectCode": "PROJ-2024-001",
        "projectName": "ERP系统升级项目",
        "description": "企业资源规划系统全面升级改造",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "progress": 65,
        "managerId": "user_001",
        "managerName": "张三",
        "departmentId": "dept_001",
        "departmentName": "信息技术部",
        "startDate": "2024-01-01",
        "endDate": "2024-06-30",
        "plannedEndDate": "2024-06-30",
        "budget": 500000,
        "actualCost": 320000,
        "memberCount": 8,
        "taskCount": 25,
        "completedTaskCount": 16,
        "createTime": "2024-01-01 09:00:00",
        "updateTime": "2024-03-15 14:30:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

### 1.2 获取项目详情

**接口地址**: `GET /erp/project/{id}`

**权限要求**: `erp:project:list`

**路径参数**:
- `id`: 项目ID（必填）

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "proj_001",
    "projectCode": "PROJ-2024-001",
    "projectName": "ERP系统升级项目",
    "description": "企业资源规划系统全面升级改造",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "progress": 65,
    "managerId": "user_001",
    "managerName": "张三",
    "departmentId": "dept_001",
    "departmentName": "信息技术部",
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "plannedEndDate": "2024-06-30",
    "budget": 500000,
    "actualCost": 320000,
    "tags": ["系统升级", "技术改造"],
    "attachments": [
      {
        "id": "att_001",
        "fileName": "project_plan.pdf",
        "originalName": "项目计划书.pdf",
        "fileSize": 2048576,
        "fileType": "application/pdf",
        "uploadTime": "2024-01-01 10:00:00"
      }
    ],
    "memberCount": 8,
    "taskCount": 25,
    "completedTaskCount": 16,
    "createTime": "2024-01-01 09:00:00",
    "updateTime": "2024-03-15 14:30:00"
  }
}
```

### 1.3 创建项目

**接口地址**: `POST /erp/project`

**权限要求**: `erp:project:add`

**请求体**:
```json
{
  "projectName": "新项目名称",
  "description": "项目描述信息",
  "priority": "HIGH",
  "managerId": "user_001",
  "departmentId": "dept_001",
  "startDate": "2024-04-01",
  "endDate": "2024-08-31",
  "plannedEndDate": "2024-08-31",
  "budget": 300000,
  "tags": ["新项目", "重要"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "proj_002",
    "projectCode": "PROJ-2024-002",
    // ... 其他项目信息
  }
}
```

### 1.4 更新项目

**接口地址**: `PUT /erp/project`

**权限要求**: `erp:project:edit`

**请求体**: 同创建项目，需包含 `id` 字段

### 1.5 删除项目

**接口地址**: `DELETE /erp/project/{ids}`

**权限要求**: `erp:project:remove`

**路径参数**:
- `ids`: 项目ID列表，多个ID用逗号分隔

**响应示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

## 2. 项目状态管理接口

### 2.1 更新项目状态

**接口地址**: `PUT /erp/project/{id}/status`

**权限要求**: `erp:project:edit`

**请求体**:
```json
{
  "status": "IN_PROGRESS"
}
```

### 2.2 启动项目

**接口地址**: `POST /erp/project/{id}/start`

**权限要求**: `erp:project:edit`

### 2.3 暂停项目

**接口地址**: `POST /erp/project/{id}/pause`

**权限要求**: `erp:project:edit`

**请求体**:
```json
{
  "reason": "暂停原因说明"
}
```

### 2.4 完成项目

**接口地址**: `POST /erp/project/{id}/complete`

**权限要求**: `erp:project:edit`

**请求体**:
```json
{
  "summary": "项目完成总结"
}
```

### 2.5 取消项目

**接口地址**: `POST /erp/project/{id}/cancel`

**权限要求**: `erp:project:edit`

**请求体**:
```json
{
  "reason": "取消原因说明"
}
```

## 3. 项目成员管理接口

### 3.1 获取项目成员列表

**接口地址**: `GET /erp/project/{projectId}/members`

**权限要求**: `erp:project:member`

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "member_001",
      "projectId": "proj_001",
      "userId": "user_001",
      "userName": "张三",
      "userAvatar": "/avatar/user_001.jpg",
      "email": "zhangsan@company.com",
      "phone": "13800138000",
      "roleId": "role_001",
      "roleName": "项目经理",
      "roleCode": "PROJECT_MANAGER",
      "permissions": ["erp:project:edit", "erp:project:member"],
      "joinDate": "2024-01-01",
      "status": "ACTIVE",
      "workload": 80
    }
  ]
}
```

### 3.2 添加项目成员

**接口地址**: `POST /erp/project/{projectId}/members`

**权限要求**: `erp:project:member`

**请求体**:
```json
{
  "projectId": "proj_001",
  "userId": "user_002",
  "roleId": "role_002",
  "workload": 60
}
```

### 3.3 更新成员角色

**接口地址**: `PUT /erp/project/{projectId}/members/{memberId}`

**权限要求**: `erp:project:member`

**请求体**:
```json
{
  "roleId": "role_003"
}
```

### 3.4 移除项目成员

**接口地址**: `DELETE /erp/project/{projectId}/members/{memberId}`

**权限要求**: `erp:project:member`

## 4. 项目进度管理接口

### 4.1 获取项目进度

**接口地址**: `GET /erp/project/{projectId}/progress`

**权限要求**: `erp:project:list`

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "projectId": "proj_001",
    "overallProgress": 65,
    "phaseProgress": [
      {
        "id": "phase_001",
        "phaseName": "需求分析",
        "phaseCode": "REQUIREMENT",
        "status": "COMPLETED",
        "progress": 100,
        "plannedStartDate": "2024-01-01",
        "plannedEndDate": "2024-01-31",
        "actualStartDate": "2024-01-01",
        "actualEndDate": "2024-01-28"
      }
    ],
    "milestones": [
      {
        "id": "milestone_001",
        "milestoneName": "需求确认",
        "plannedDate": "2024-01-31",
        "actualDate": "2024-01-28",
        "status": "COMPLETED",
        "progress": 100
      }
    ],
    "isOnSchedule": true,
    "lastUpdateTime": "2024-03-15 14:30:00"
  }
}
```

## 5. 错误码定义

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 200 | 操作成功 | 请求处理成功 |
| 400 | 请求参数错误 | 请求参数格式或内容错误 |
| 401 | 未授权访问 | 用户未登录或token无效 |
| 403 | 权限不足 | 用户无相应操作权限 |
| 404 | 资源不存在 | 请求的项目或资源不存在 |
| 409 | 资源冲突 | 项目编码重复等冲突情况 |
| 500 | 服务器内部错误 | 系统内部错误 |

## 6. 状态枚举说明

### 项目状态 (ProjectStatus)
- `DRAFT`: 草稿
- `PLANNING`: 规划中
- `APPROVED`: 已批准
- `IN_PROGRESS`: 进行中
- `ON_HOLD`: 暂停
- `COMPLETED`: 已完成
- `CANCELLED`: 已取消
- `ARCHIVED`: 已归档

### 项目优先级 (ProjectPriority)
- `LOW`: 低
- `MEDIUM`: 中
- `HIGH`: 高
- `URGENT`: 紧急

### 成员状态 (MemberStatus)
- `ACTIVE`: 活跃
- `INACTIVE`: 非活跃
- `LEFT`: 已离开

## 7. 里程碑管理接口

### 7.1 获取项目里程碑

**接口地址**: `GET /erp/project/{projectId}/milestones`

**权限要求**: `erp:project:list`

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "milestone_001",
      "projectId": "proj_001",
      "milestoneName": "需求确认",
      "description": "完成所有需求的确认和评审",
      "plannedDate": "2024-01-31",
      "actualDate": "2024-01-28",
      "status": "COMPLETED",
      "progress": 100,
      "dependencies": [],
      "deliverables": ["需求规格说明书", "原型设计"],
      "createTime": "2024-01-01 09:00:00"
    }
  ]
}
```

### 7.2 创建里程碑

**接口地址**: `POST /erp/project/{projectId}/milestones`

**权限要求**: `erp:project:edit`

**请求体**:
```json
{
  "projectId": "proj_001",
  "milestoneName": "系统测试完成",
  "description": "完成所有功能模块的测试",
  "plannedDate": "2024-05-31",
  "dependencies": ["milestone_002"],
  "deliverables": ["测试报告", "缺陷修复记录"]
}
```

## 8. 任务管理接口

### 8.1 获取项目任务列表

**接口地址**: `GET /erp/project/{projectId}/tasks`

**权限要求**: `erp:project:task`

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "task_001",
      "projectId": "proj_001",
      "taskName": "数据库设计",
      "description": "设计系统数据库表结构",
      "status": "COMPLETED",
      "priority": "HIGH",
      "progress": 100,
      "assigneeId": "user_002",
      "assigneeName": "李四",
      "plannedStartDate": "2024-02-01",
      "plannedEndDate": "2024-02-15",
      "actualStartDate": "2024-02-01",
      "actualEndDate": "2024-02-12",
      "estimatedHours": 40,
      "actualHours": 35,
      "dependencies": ["task_000"],
      "tags": ["数据库", "设计"],
      "createTime": "2024-01-30 10:00:00",
      "updateTime": "2024-02-12 17:00:00"
    }
  ]
}
```

### 8.2 创建项目任务

**接口地址**: `POST /erp/project/{projectId}/tasks`

**权限要求**: `erp:project:task`

**请求体**:
```json
{
  "projectId": "proj_001",
  "taskName": "前端界面开发",
  "description": "开发用户管理模块界面",
  "priority": "MEDIUM",
  "assigneeId": "user_003",
  "plannedStartDate": "2024-03-01",
  "plannedEndDate": "2024-03-15",
  "estimatedHours": 60,
  "dependencies": ["task_001"],
  "tags": ["前端", "界面"]
}
```

## 9. 统计分析接口

### 9.1 获取项目统计数据

**接口地址**: `GET /erp/project/statistics`

**权限要求**: `erp:project:list`

**请求参数**:
- `period`: 统计周期（可选），如 "2024-03" 或 "2024-Q1"

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalProjects": 25,
    "activeProjects": 8,
    "completedProjects": 15,
    "delayedProjects": 2,
    "averageProgress": 72.5,
    "onTimeCompletionRate": 88.5,
    "budgetUtilizationRate": 85.2,
    "resourceUtilizationRate": 78.9,
    "period": "2024-03"
  }
}
```

### 9.2 获取项目仪表板数据

**接口地址**: `GET /erp/project/dashboard`

**权限要求**: `erp:project:list`

**响应示例**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "overview": {
      "totalProjects": 25,
      "activeProjects": 8,
      "completedThisMonth": 3,
      "delayedProjects": 2,
      "totalBudget": 5000000,
      "usedBudget": 3200000,
      "totalMembers": 45,
      "activeMembers": 38
    },
    "recentProjects": [
      {
        "id": "proj_001",
        "projectName": "ERP系统升级项目",
        "status": "IN_PROGRESS",
        "progress": 65,
        "endDate": "2024-06-30"
      }
    ],
    "upcomingMilestones": [
      {
        "id": "milestone_003",
        "milestoneName": "系统集成测试",
        "plannedDate": "2024-04-15",
        "status": "PENDING"
      }
    ],
    "myTasks": [
      {
        "id": "task_005",
        "taskName": "API接口开发",
        "status": "IN_PROGRESS",
        "plannedEndDate": "2024-03-25"
      }
    ]
  }
}
```

## 10. 导出接口

### 10.1 导出项目列表

**接口地址**: `GET /erp/project/export`

**权限要求**: `erp:project:export`

**请求参数**: 同查询项目列表接口

**响应**: Excel文件流

### 10.2 导出项目详情报告

**接口地址**: `GET /erp/project/{projectId}/export`

**权限要求**: `erp:project:export`

**请求参数**:
```typescript
interface ProjectExportParams {
  format: 'excel' | 'pdf';      // 导出格式
  includeDetails: boolean;       // 是否包含详细信息
  includeTasks: boolean;         // 是否包含任务信息
  includeMembers: boolean;       // 是否包含成员信息
  dateRange?: {                  // 日期范围（可选）
    startDate: string;
    endDate: string;
  };
}
```

**响应**: Excel或PDF文件流

## 11. 前端调用示例

### 11.1 Vue组件中的使用示例

```vue
<template>
  <div class="project-management">
    <!-- 项目列表 -->
    <el-table :data="projectList" v-loading="loading">
      <el-table-column prop="projectName" label="项目名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(row)"
            v-hasPermi="['erp:project:edit']"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
            v-hasPermi="['erp:project:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listProject, deleteProject } from '@/api/erp/project';
import type { ProjectVO, ProjectQuery } from '@/api/erp/project/types';

// 响应式数据
const loading = ref(false);
const projectList = ref<ProjectVO[]>([]);
const queryParams = ref<ProjectQuery>({
  pageNum: 1,
  pageSize: 10
});

// 获取项目列表
const getList = async () => {
  loading.value = true;
  try {
    const { data } = await listProject(queryParams.value);
    projectList.value = data.records;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

// 删除项目
const handleDelete = async (row: ProjectVO) => {
  try {
    await ElMessageBox.confirm('确认删除该项目吗？', '提示', {
      type: 'warning'
    });

    await deleteProject([row.id]);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error);
      ElMessage.error('删除项目失败');
    }
  }
};

// 生命周期
onMounted(() => {
  getList();
});
</script>
```

## 12. 注意事项

1. **权限控制**: 所有接口都需要相应的权限，前端使用 `v-hasPermi` 指令进行权限控制
2. **数据验证**: 前端需要对用户输入进行验证，后端也需要进行数据校验
3. **错误处理**: 统一的错误处理机制，提供友好的错误提示
4. **性能优化**: 大数据量查询时使用分页，避免一次性加载过多数据
5. **缓存策略**: 对于不经常变化的数据（如角色列表）可以使用缓存
6. **日志记录**: 重要操作需要记录操作日志，便于审计和问题排查
