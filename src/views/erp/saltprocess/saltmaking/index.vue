<template>
  <div class="saltmaking-management">
    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="任务编码" prop="taskCode">
          <el-input
            v-model="queryParams.taskCode"
            placeholder="请输入任务编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectId">
          <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable style="width: 200px">
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.projectName"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="待开始" value="PENDING" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="失败" value="FAILED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="反应罐" prop="tankId">
          <el-select v-model="queryParams.tankId" placeholder="请选择反应罐" clearable style="width: 150px">
            <el-option
              v-for="tank in tankList"
              :key="tank.id"
              :label="tank.name"
              :value="tank.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="化盐类型" prop="saltType">
          <el-select v-model="queryParams.saltType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="二元化盐" value="BINARY_SALT" />
            <el-option label="三元化盐" value="TERNARY_SALT" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['saltprocess:saltmaking:add']"
          >
            新增任务
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="VideoPlay"
            :disabled="single"
            @click="handleStart"
            v-hasPermi="['saltprocess:saltmaking:start']"
          >
            启动任务
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="VideoPause"
            :disabled="single"
            @click="handlePause"
            v-hasPermi="['saltprocess:saltmaking:pause']"
          >
            暂停任务
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['saltprocess:saltmaking:remove']"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['saltprocess:saltmaking:export']"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="taskList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="任务编码" prop="taskCode" width="120" />
        <el-table-column label="项目名称" prop="projectName" min-width="180" show-overflow-tooltip />
        <el-table-column label="化盐类型" prop="saltType" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSaltTypeTag(scope.row.saltType)">
              {{ getSaltTypeText(scope.row.saltType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="反应罐" prop="tankName" width="100" align="center" />
        <el-table-column label="目标温度" prop="targetTemperature" width="100" align="center">
          <template #default="scope">
            {{ scope.row.targetTemperature }}°C
          </template>
        </el-table-column>
        <el-table-column label="当前温度" prop="currentTemperature" width="100" align="center">
          <template #default="scope">
            <span :class="getTemperatureClass(scope.row.currentTemperature, scope.row.targetTemperature)">
              {{ scope.row.currentTemperature || '--' }}°C
            </span>
          </template>
        </el-table-column>
        <el-table-column label="搅拌速度" prop="stirringSpeed" width="100" align="center">
          <template #default="scope">
            {{ scope.row.stirringSpeed }} rpm
          </template>
        </el-table-column>
        <el-table-column label="反应时间" prop="reactionTime" width="100" align="center">
          <template #default="scope">
            {{ scope.row.reactionTime }} min
          </template>
        </el-table-column>
        <el-table-column label="任务状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" prop="progress" width="120" align="center">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.progress, scope.row.status)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作员" prop="operatorName" width="100" align="center" />
        <el-table-column label="计划开始时间" prop="plannedStartTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.plannedStartTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实际开始时间" prop="actualStartTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actualStartTime) || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click.stop="handleView(scope.row)"
                v-hasPermi="['saltprocess:saltmaking:query']"
              />
            </el-tooltip>
            <el-tooltip content="实时监控" placement="top">
              <el-button
                link
                type="success"
                icon="Monitor"
                @click.stop="handleMonitor(scope.row)"
                v-hasPermi="['saltprocess:saltmaking:monitor']"
              />
            </el-tooltip>
            <el-tooltip content="配比管理" placement="top">
              <el-button
                link
                type="warning"
                icon="SetUp"
                @click.stop="handleRatio(scope.row)"
                v-hasPermi="['saltprocess:saltmaking:ratio']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['saltprocess:saltmaking:edit']"
                :disabled="scope.row.status === 'IN_PROGRESS'"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['saltprocess:saltmaking:remove']"
                :disabled="scope.row.status === 'IN_PROGRESS'"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 任务表单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <saltmaking-task-form
        v-if="dialog.visible"
        ref="taskFormRef"
        :task-id="dialog.taskId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 配比管理对话框 -->
    <el-dialog title="配比管理" v-model="ratioDialog.visible" width="1000px" append-to-body>
      <ratio-management
        v-if="ratioDialog.visible"
        :task-id="ratioDialog.taskId"
        @close="ratioDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="SaltmakingManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  VideoPlay,
  VideoPause,
  Delete,
  Download,
  View,
  Monitor,
  SetUp,
  Edit
} from '@element-plus/icons-vue';
import {
  listSaltmakingTask,
  deleteSaltmakingTask,
  startSaltmakingTask,
  pauseSaltmakingTask,
  exportSaltmakingTaskList
} from '@/api/erp/saltprocess/saltmaking';
import type { SaltmakingTaskQuery, SaltmakingTaskVO } from '@/api/erp/saltprocess/saltmaking/types';
import { parseTime } from '@/utils/ruoyi';
import SaltmakingTaskForm from './components/SaltmakingTaskForm.vue';
import RatioManagement from './components/RatioManagement.vue';

const router = useRouter();

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const taskList = ref<SaltmakingTaskVO[]>([]);
const projectList = ref<any[]>([]);
const tankList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<SaltmakingTaskQuery>({
  pageNum: 1,
  pageSize: 10,
  taskCode: '',
  projectId: '',
  status: '',
  tankId: '',
  saltType: ''
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  taskId: ''
});

const ratioDialog = reactive({
  visible: false,
  taskId: ''
});

// 表单引用
const queryFormRef = ref();
const taskFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
  loadSelectOptions();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const { data } = await listSaltmakingTask(queryParams);
    taskList.value = data.rows;
    total.value = data.total;
  } catch (error) {
    console.error('获取化盐任务列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadSelectOptions = async () => {
  // TODO: 加载项目、反应罐选项
  projectList.value = [
    { id: '1', projectName: '项目A' },
    { id: '2', projectName: '项目B' }
  ];
  tankList.value = [
    { id: '1', name: '反应罐1号' },
    { id: '2', name: '反应罐2号' }
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

const handleSelectionChange = (selection: SaltmakingTaskVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: SaltmakingTaskVO) => {
  handleView(row);
};

const handleAdd = () => {
  dialog.title = '新增化盐任务';
  dialog.taskId = '';
  dialog.visible = true;
};

const handleUpdate = (row?: SaltmakingTaskVO) => {
  const taskId = row?.id || ids.value[0];
  dialog.title = '修改化盐任务';
  dialog.taskId = taskId;
  dialog.visible = true;
};

const handleView = (row: SaltmakingTaskVO) => {
  router.push(`/saltprocess/saltmaking/task/${row.id}`);
};

const handleMonitor = (row: SaltmakingTaskVO) => {
  router.push(`/saltprocess/saltmaking/monitor/${row.id}`);
};

const handleRatio = (row: SaltmakingTaskVO) => {
  ratioDialog.taskId = row.id;
  ratioDialog.visible = true;
};

const handleStart = async (row?: SaltmakingTaskVO) => {
  const taskId = row?.id || ids.value[0];
  const taskName = row?.taskCode || taskList.value.find(item => item.id === taskId)?.taskCode;
  
  try {
    await ElMessageBox.confirm(
      `是否确认启动化盐任务"${taskName}"？`,
      '确认启动',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await startSaltmakingTask(taskId);
    ElMessage.success('任务启动成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('启动任务失败:', error);
      ElMessage.error('启动任务失败');
    }
  }
};

const handlePause = async (row?: SaltmakingTaskVO) => {
  const taskId = row?.id || ids.value[0];
  const taskName = row?.taskCode || taskList.value.find(item => item.id === taskId)?.taskCode;
  
  try {
    await ElMessageBox.confirm(
      `是否确认暂停化盐任务"${taskName}"？`,
      '确认暂停',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await pauseSaltmakingTask(taskId);
    ElMessage.success('任务暂停成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('暂停任务失败:', error);
      ElMessage.error('暂停任务失败');
    }
  }
};

const handleDelete = async (row?: SaltmakingTaskVO) => {
  const taskIds = row?.id ? [row.id] : ids.value;
  const taskNames = row?.taskCode ? [row.taskCode] : 
    taskList.value.filter(item => taskIds.includes(item.id)).map(item => item.taskCode);
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除化盐任务"${taskNames.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteSaltmakingTask(taskIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleExport = async () => {
  try {
    await exportSaltmakingTaskList(queryParams);
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
const getSaltTypeText = (type: string): string => {
  const typeMap = {
    'BINARY_SALT': '二元化盐',
    'TERNARY_SALT': '三元化盐'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getSaltTypeTag = (type: string): string => {
  const tagMap = {
    'BINARY_SALT': 'primary',
    'TERNARY_SALT': 'success'
  };
  return tagMap[type as keyof typeof tagMap] || '';
};

const getStatusText = (status: string): string => {
  const statusMap = {
    'PENDING': '待开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'FAILED': '失败',
    'CANCELLED': '已取消'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusTag = (status: string): string => {
  const tagMap = {
    'PENDING': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'warning'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getProgressStatus = (progress: number, status: string): string => {
  if (status === 'FAILED') return 'exception';
  if (progress === 100) return 'success';
  return '';
};

const getTemperatureClass = (current: number, target: number): string => {
  if (!current) return '';
  const diff = Math.abs(current - target);
  if (diff <= 2) return 'text-success';
  if (diff <= 5) return 'text-warning';
  return 'text-danger';
};
</script>

<style scoped lang="scss">
.saltmaking-management {
  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .text-success {
    color: #67c23a;
  }

  .text-warning {
    color: #e6a23c;
  }

  .text-danger {
    color: #f56c6c;
  }
}
</style>
