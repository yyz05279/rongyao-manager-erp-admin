<template>
  <div class="heating-management">
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
        <el-form-item label="提温阶段" prop="currentStage">
          <el-select v-model="queryParams.currentStage" placeholder="请选择阶段" clearable style="width: 150px">
            <el-option label="初始提温" value="INITIAL_HEATING" />
            <el-option label="中间保温" value="INTERMEDIATE_HOLDING" />
            <el-option label="最终提温" value="FINAL_HEATING" />
            <el-option label="保温阶段" value="HOLDING_STAGE" />
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
            v-hasPermi="['saltprocess:heating:add']"
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
            v-hasPermi="['saltprocess:heating:start']"
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
            v-hasPermi="['saltprocess:heating:pause']"
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
            v-hasPermi="['saltprocess:heating:remove']"
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
            v-hasPermi="['saltprocess:heating:export']"
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
        <el-table-column label="反应罐" prop="tankName" width="100" align="center" />
        <el-table-column label="当前阶段" prop="currentStage" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getStageTag(scope.row.currentStage)">
              {{ getStageText(scope.row.currentStage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标温度" prop="finalTemperature" width="100" align="center">
          <template #default="scope">
            {{ scope.row.finalTemperature }}°C
          </template>
        </el-table-column>
        <el-table-column label="当前温度" prop="currentTemperature" width="100" align="center">
          <template #default="scope">
            <span :class="getTemperatureClass(scope.row.currentTemperature, scope.row.finalTemperature)">
              {{ scope.row.currentTemperature || '--' }}°C
            </span>
          </template>
        </el-table-column>
        <el-table-column label="升温速率" prop="heatingRate" width="100" align="center">
          <template #default="scope">
            {{ scope.row.heatingRate }} °C/min
          </template>
        </el-table-column>
        <el-table-column label="保温时间" prop="holdingTime" width="100" align="center">
          <template #default="scope">
            {{ scope.row.holdingTime }} min
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
                v-hasPermi="['saltprocess:heating:query']"
              />
            </el-tooltip>
            <el-tooltip content="实时监控" placement="top">
              <el-button
                link
                type="success"
                icon="Monitor"
                @click.stop="handleMonitor(scope.row)"
                v-hasPermi="['saltprocess:heating:monitor']"
              />
            </el-tooltip>
            <el-tooltip content="阶段管理" placement="top">
              <el-button
                link
                type="warning"
                icon="Operation"
                @click.stop="handleStages(scope.row)"
                v-hasPermi="['saltprocess:heating:stages']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['saltprocess:heating:edit']"
                :disabled="scope.row.status === 'IN_PROGRESS'"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['saltprocess:heating:remove']"
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
      <heating-task-form
        v-if="dialog.visible"
        ref="taskFormRef"
        :task-id="dialog.taskId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 阶段管理对话框 -->
    <el-dialog title="提温阶段管理" v-model="stagesDialog.visible" width="1200px" append-to-body>
      <heating-stages-management
        v-if="stagesDialog.visible"
        :task-id="stagesDialog.taskId"
        @close="stagesDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="HeatingManagement" lang="ts">
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
  Operation,
  Edit
} from '@element-plus/icons-vue';
import {
  listHeatingTask,
  deleteHeatingTask,
  startHeatingTask,
  pauseHeatingTask,
  exportHeatingTaskList
} from '@/api/erp/saltprocess/heating';
import type { HeatingTaskQuery, HeatingTaskVO } from '@/api/erp/saltprocess/heating/types';
import { parseTime } from '@/utils/ruoyi';
import HeatingTaskForm from './components/HeatingTaskForm.vue';
import HeatingStagesManagement from './components/HeatingStagesManagement.vue';

const router = useRouter();

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const taskList = ref<HeatingTaskVO[]>([]);
const projectList = ref<any[]>([]);
const tankList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<HeatingTaskQuery>({
  pageNum: 1,
  pageSize: 10,
  taskCode: '',
  projectId: '',
  status: '',
  tankId: '',
  currentStage: ''
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  taskId: ''
});

const stagesDialog = reactive({
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
    const { data } = await listHeatingTask(queryParams);
    taskList.value = data.rows;
    total.value = data.total;
  } catch (error) {
    console.error('获取提温任务列表失败:', error);
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

const handleSelectionChange = (selection: HeatingTaskVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: HeatingTaskVO) => {
  handleView(row);
};

const handleAdd = () => {
  dialog.title = '新增提温任务';
  dialog.taskId = '';
  dialog.visible = true;
};

const handleUpdate = (row?: HeatingTaskVO) => {
  const taskId = row?.id || ids.value[0];
  dialog.title = '修改提温任务';
  dialog.taskId = taskId;
  dialog.visible = true;
};

const handleView = (row: HeatingTaskVO) => {
  router.push(`/saltprocess/heating/task/${row.id}`);
};

const handleMonitor = (row: HeatingTaskVO) => {
  router.push(`/saltprocess/heating/monitor/${row.id}`);
};

const handleStages = (row: HeatingTaskVO) => {
  stagesDialog.taskId = row.id;
  stagesDialog.visible = true;
};

const handleStart = async (row?: HeatingTaskVO) => {
  const taskId = row?.id || ids.value[0];
  const taskName = row?.taskCode || taskList.value.find(item => item.id === taskId)?.taskCode;
  
  try {
    await ElMessageBox.confirm(
      `是否确认启动提温任务"${taskName}"？`,
      '确认启动',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await startHeatingTask(taskId);
    ElMessage.success('任务启动成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('启动任务失败:', error);
      ElMessage.error('启动任务失败');
    }
  }
};

const handlePause = async (row?: HeatingTaskVO) => {
  const taskId = row?.id || ids.value[0];
  const taskName = row?.taskCode || taskList.value.find(item => item.id === taskId)?.taskCode;
  
  try {
    await ElMessageBox.confirm(
      `是否确认暂停提温任务"${taskName}"？`,
      '确认暂停',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await pauseHeatingTask(taskId);
    ElMessage.success('任务暂停成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('暂停任务失败:', error);
      ElMessage.error('暂停任务失败');
    }
  }
};

const handleDelete = async (row?: HeatingTaskVO) => {
  const taskIds = row?.id ? [row.id] : ids.value;
  const taskNames = row?.taskCode ? [row.taskCode] : 
    taskList.value.filter(item => taskIds.includes(item.id)).map(item => item.taskCode);
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除提温任务"${taskNames.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteHeatingTask(taskIds);
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
    await exportHeatingTaskList(queryParams);
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
const getStageText = (stage: string): string => {
  const stageMap = {
    'INITIAL_HEATING': '初始提温',
    'INTERMEDIATE_HOLDING': '中间保温',
    'FINAL_HEATING': '最终提温',
    'HOLDING_STAGE': '保温阶段'
  };
  return stageMap[stage as keyof typeof stageMap] || stage;
};

const getStageTag = (stage: string): string => {
  const tagMap = {
    'INITIAL_HEATING': 'primary',
    'INTERMEDIATE_HOLDING': 'warning',
    'FINAL_HEATING': 'success',
    'HOLDING_STAGE': 'info'
  };
  return tagMap[stage as keyof typeof tagMap] || '';
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
  if (diff <= 5) return 'text-success';
  if (diff <= 10) return 'text-warning';
  return 'text-danger';
};
</script>

<style scoped lang="scss">
.heating-management {
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
