<template>
  <div class="saltmaking-management">
    <!-- 调试信息 -->
    <div v-if="taskList.length === 0 && !loading" style="padding: 20px; text-align: center; color: #999;">
      <p>任务列表为空，数据加载中...</p>
      <p>总数: {{ total }}</p>
    </div>

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
        <el-form-item label="反应罐" prop="reactorId">
          <el-select v-model="queryParams.reactorId" placeholder="请选择反应罐" clearable style="width: 150px">
            <el-option
              v-for="reactor in reactorList"
              :key="reactor.id"
              :label="reactor.name"
              :value="reactor.id"
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
        <el-table-column label="反应罐" prop="reactorName" width="100" align="center" />
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
        <el-table-column label="当前阶段" prop="currentPhase" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getPhaseTag(scope.row.currentPhase)" size="small">
              {{ getPhaseText(scope.row.currentPhase) }}
            </el-tag>
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
// 图标通过Element Plus自动导入
import {
  listSaltmakingTask,
  deleteSaltmakingTask,
  startSaltmakingTask,
  pauseSaltmakingTask,
  exportSaltmakingTaskList
} from '@/api/erp/saltprocess/saltmaking';
import type {
  SaltmakingTaskQuery,
  SaltmakingTaskVO
} from '@/api/erp/saltprocess/saltmaking/types';
import {
  SaltmakingTaskStatus,
  SaltmakingPhase
} from '@/api/erp/saltprocess/saltmaking/types';
import { SaltType } from '@/api/erp/saltprocess/types';
import { parseTime } from '@/utils/ruoyi';
// 组件通过全局注册或自动导入使用

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
const reactorList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<SaltmakingTaskQuery>({
  pageNum: 1,
  pageSize: 10,
  taskCode: '',
  projectId: '',
  status: undefined,
  reactorId: '',
  saltType: undefined
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
  console.log('化盐任务页面已挂载');
  getList();
  loadSelectOptions();
});

// 方法
const getList = async () => {
  loading.value = true;
  console.log('开始加载化盐任务列表...');

  try {
    // 首先尝试调用真实API
    console.log('=== 开始API调用 ===');
    console.log('API接口URL:', '/erp/saltprocess/saltmaking/task/list');
    console.log('完整URL:', import.meta.env.VITE_APP_BASE_API + '/erp/saltprocess/saltmaking/task/list');
    console.log('请求参数:', queryParams);
    console.log('请求方法:', 'GET');

    const response = await listSaltmakingTask(queryParams);
    console.log('API响应:', response);

    taskList.value = response.data.rows;
    total.value = response.data.total;
    console.log('化盐任务数据加载成功，任务数量:', taskList.value.length);

  } catch (error: any) {
    console.error('=== API调用失败 ===');
    console.error('错误详情:', error);
    console.error('错误类型:', error?.constructor?.name);
    if (error?.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    if (error?.request) {
      console.error('请求配置:', error.request);
    }
    ElMessage.warning('API接口暂不可用，显示模拟数据');

    // API调用失败时使用模拟数据
    console.log('设置模拟数据...');
    taskList.value = [
      {
        id: '1',
        taskCode: 'SM20241201001',
        projectId: '1',
        projectName: '项目A - 二元化盐生产',
        reactorId: '1',
        reactorName: '反应罐1号',
        saltType: SaltType.BINARY,
        targetOutput: 2000,
        currentOutput: 1850,
        status: SaltmakingTaskStatus.IN_PROGRESS,
        currentPhase: SaltmakingPhase.REACTION,
        progress: 85,
        operatorId: '1',
        operatorName: '张三',
        plannedStartTime: '2024-12-01 08:00:00',
        plannedEndTime: '2024-12-01 16:00:00',
        actualStartTime: '2024-12-01 08:15:00',
        actualEndTime: undefined,
        targetTemperature: 250,
        currentTemperature: 248,
        targetPressure: 0.2,
        currentPressure: 0.19,
        stirringSpeed: 120,
        ratioConfig: [],
        remarks: '正常运行中',
        createTime: '2024-12-01 07:30:00',
        updateTime: '2024-12-01 14:30:00'
      },
      {
        id: '2',
        taskCode: 'SM20241201002',
        projectId: '2',
        projectName: '项目B - 三元化盐生产',
        reactorId: '2',
        reactorName: '反应罐2号',
        saltType: SaltType.TERNARY,
        targetOutput: 1500,
        currentOutput: 0,
        status: SaltmakingTaskStatus.PENDING,
        currentPhase: SaltmakingPhase.PREPARATION,
        progress: 0,
        operatorId: '2',
        operatorName: '李四',
        plannedStartTime: '2024-12-01 16:00:00',
        plannedEndTime: '2024-12-02 00:00:00',
        actualStartTime: undefined,
        actualEndTime: undefined,
        targetTemperature: 220,
        currentTemperature: undefined,
        targetPressure: 0.15,
        currentPressure: undefined,
        stirringSpeed: 100,
        ratioConfig: [],
        remarks: '待启动',
        createTime: '2024-12-01 10:00:00',
        updateTime: '2024-12-01 10:00:00'
      },
      {
        id: '3',
        taskCode: 'SM20241130003',
        projectId: '1',
        projectName: '项目A - 二元化盐生产',
        reactorId: '3',
        reactorName: '反应罐3号',
        saltType: SaltType.BINARY,
        targetOutput: 1800,
        currentOutput: 1800,
        status: SaltmakingTaskStatus.COMPLETED,
        currentPhase: SaltmakingPhase.COMPLETION,
        progress: 100,
        operatorId: '3',
        operatorName: '王五',
        plannedStartTime: '2024-11-30 08:00:00',
        plannedEndTime: '2024-11-30 16:00:00',
        actualStartTime: '2024-11-30 08:10:00',
        actualEndTime: '2024-11-30 15:45:00',
        targetTemperature: 250,
        currentTemperature: 25,
        targetPressure: 0.2,
        currentPressure: 0.0,
        stirringSpeed: 0,
        ratioConfig: [],
        remarks: '任务完成，产品质量合格',
        createTime: '2024-11-30 07:30:00',
        updateTime: '2024-11-30 15:45:00'
      }
    ];
    total.value = 3;
    console.log('模拟数据设置完成，任务数量:', taskList.value.length);
  } finally {
    loading.value = false;
    console.log('加载完成，loading状态:', loading.value);
  }
};

const loadSelectOptions = async () => {
  // TODO: 加载项目、反应罐选项
  projectList.value = [
    { id: '1', projectName: '项目A' },
    { id: '2', projectName: '项目B' }
  ];
  reactorList.value = [
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
    'BINARY': '二元化盐',
    'TERNARY': '三元化盐'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getSaltTypeTag = (type: string): string => {
  const tagMap = {
    'BINARY': 'primary',
    'TERNARY': 'success'
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

const getPhaseText = (phase: string): string => {
  const phaseMap = {
    'PREPARATION': '准备',
    'FEEDING': '投料',
    'REACTION': '反应',
    'STABILIZATION': '稳定',
    'COMPLETION': '完成'
  };
  return phaseMap[phase as keyof typeof phaseMap] || phase;
};

const getPhaseTag = (phase: string): string => {
  const tagMap = {
    'PREPARATION': 'info',
    'FEEDING': 'warning',
    'REACTION': 'primary',
    'STABILIZATION': 'success',
    'COMPLETION': 'success'
  };
  return tagMap[phase as keyof typeof tagMap] || '';
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
