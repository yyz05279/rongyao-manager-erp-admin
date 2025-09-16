<!--
  通用项目管理模块
  注意：此模块为通用项目管理，与 saltprocess/project（盐化工艺项目）模块功能互补
  - saltprocess/project: 专门用于盐化工艺项目的工艺流程管理
  - erp/project: 通用项目管理，适用于各种类型的企业项目
-->
<template>
  <div class="project-management">
    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="规划中" value="PLANNING" />
            <el-option label="已批准" value="APPROVED" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="暂停" value="ON_HOLD" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable style="width: 120px">
            <el-option label="低" value="LOW" />
            <el-option label="中" value="MEDIUM" />
            <el-option label="高" value="HIGH" />
            <el-option label="紧急" value="URGENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目经理" prop="managerId">
          <el-select v-model="queryParams.managerId" placeholder="请选择项目经理" clearable style="width: 150px">
            <el-option
              v-for="manager in managerList"
              :key="manager.id"
              :label="manager.name"
              :value="manager.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="operation-card" shadow="never">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['erp:project:add']"
          >
            新增项目
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['erp:project:edit']"
          >
            修改
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['erp:project:remove']"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['erp:project:export']"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="projectList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="项目编码" prop="projectCode" width="140" />
        <el-table-column label="项目名称" prop="projectName" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" prop="priority" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" prop="progress" width="120" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column label="项目经理" prop="managerName" width="120" />
        <el-table-column label="开始日期" prop="startDate" width="120" align="center" />
        <el-table-column label="结束日期" prop="endDate" width="120" align="center" />
        <el-table-column label="成员数" prop="memberCount" width="80" align="center" />
        <el-table-column label="任务数" prop="taskCount" width="80" align="center" />
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click="handleDetail(row)"
                v-hasPermi="['erp:project:list']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(row)"
                v-hasPermi="['erp:project:edit']"
              />
            </el-tooltip>
            <el-tooltip content="成员管理" placement="top">
              <el-button
                link
                type="success"
                icon="User"
                @click="handleMembers(row)"
                v-hasPermi="['erp:project:member']"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click="handleDelete(row)"
                v-hasPermi="['erp:project:remove']"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 项目表单对话框 -->
    <ProjectForm
      v-if="dialog.visible"
      v-model:visible="dialog.visible"
      :project-id="dialog.projectId"
      :title="dialog.title"
      @success="handleFormSuccess"
    />

    <!-- 项目详情对话框 -->
    <ProjectDetail
      v-if="detailDialog.visible"
      v-model:visible="detailDialog.visible"
      :project-id="detailDialog.projectId"
    />

    <!-- 成员管理对话框 -->
    <ProjectMembers
      v-if="memberDialog.visible"
      v-model:visible="memberDialog.visible"
      :project-id="memberDialog.projectId"
      :project-name="memberDialog.projectName"
    />
  </div>
</template>

<script setup name="ProjectManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Plus, Edit, Delete, Download, View, User } from '@element-plus/icons-vue';
import {
  listProject,
  deleteProject,
  exportProjectList
} from '@/api/erp/project';
import type { ProjectQuery, ProjectVO } from '@/api/erp/project/types';
import { parseTime } from '@/utils/ruoyi';
import ProjectForm from './components/ProjectForm.vue';
import ProjectDetail from './components/ProjectDetail.vue';
import ProjectMembers from './components/ProjectMembers.vue';

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const projectList = ref<ProjectVO[]>([]);
const managerList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<ProjectQuery>({
  pageNum: 1,
  pageSize: 10,
  projectName: '',
  status: undefined,
  priority: undefined,
  managerId: ''
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  projectId: ''
});

const detailDialog = reactive({
  visible: false,
  projectId: ''
});

const memberDialog = reactive({
  visible: false,
  projectId: '',
  projectName: ''
});

// 表单引用
const queryFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
  getManagerList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const { data } = await listProject(queryParams);
    projectList.value = data.records;
    total.value = data.total;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

const getManagerList = async () => {
  // TODO: 获取项目经理列表
  managerList.value = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' }
  ];
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: ProjectVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: ProjectVO) => {
  // 行点击事件
};

const handleAdd = () => {
  dialog.visible = true;
  dialog.title = '新增项目';
  dialog.projectId = '';
};

const handleUpdate = (row?: ProjectVO) => {
  const projectId = row?.id || ids.value[0];
  dialog.visible = true;
  dialog.title = '编辑项目';
  dialog.projectId = projectId;
};

const handleDetail = (row: ProjectVO) => {
  detailDialog.visible = true;
  detailDialog.projectId = row.id;
};

const handleMembers = (row: ProjectVO) => {
  memberDialog.visible = true;
  memberDialog.projectId = row.id;
  memberDialog.projectName = row.projectName;
};

const handleDelete = async (row?: ProjectVO) => {
  const projectIds = row ? [row.id] : ids.value;
  const projectNames = row ? [row.projectName] : projectList.value
    .filter(item => projectIds.includes(item.id))
    .map(item => item.projectName);

  try {
    await ElMessageBox.confirm(
      `确认删除项目"${projectNames.join('、')}"吗？`,
      '提示',
      { type: 'warning' }
    );

    await deleteProject(projectIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error);
      ElMessage.error('删除项目失败');
    }
  }
};

const handleExport = async () => {
  try {
    await exportProjectList(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

// 工具方法
const getStatusText = (status: string): string => {
  const statusMap = {
    'DRAFT': '草稿',
    'PLANNING': '规划中',
    'APPROVED': '已批准',
    'IN_PROGRESS': '进行中',
    'ON_HOLD': '暂停',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'ARCHIVED': '已归档'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusTagType = (status: string): string => {
  const tagMap = {
    'DRAFT': 'info',
    'PLANNING': 'warning',
    'APPROVED': 'success',
    'IN_PROGRESS': 'primary',
    'ON_HOLD': 'warning',
    'COMPLETED': 'success',
    'CANCELLED': 'danger',
    'ARCHIVED': 'info'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getPriorityText = (priority: string): string => {
  const priorityMap = {
    'LOW': '低',
    'MEDIUM': '中',
    'HIGH': '高',
    'URGENT': '紧急'
  };
  return priorityMap[priority as keyof typeof priorityMap] || priority;
};

const getPriorityTagType = (priority: string): string => {
  const tagMap = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'danger',
    'URGENT': 'danger'
  };
  return tagMap[priority as keyof typeof tagMap] || '';
};
</script>

<style scoped lang="scss">
.project-management {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .operation-card {
    margin-bottom: 20px;
  }
}
</style>
