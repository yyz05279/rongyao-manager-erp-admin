<template>
  <div class="saltmaking-task-detail" v-loading="loading">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="task-title">{{ taskData.taskCode }} - {{ taskData.projectName }}</span>
          <el-tag :type="getStatusTag(taskData.status)" class="status-tag">
            {{ getStatusText(taskData.status) }}
          </el-tag>
          <el-tag :type="getSaltTypeTag(taskData.saltType)" class="type-tag">
            {{ getSaltTypeText(taskData.saltType) }}
          </el-tag>
        </div>
      </template>
      <template #extra>
        <el-button-group>
          <el-button
            v-if="taskData.status === 'PENDING'"
            type="primary"
            icon="VideoPlay"
            @click="handleStart"
            v-hasPermi="['saltprocess:saltmaking:start']"
          >
            启动任务
          </el-button>
          <el-button
            v-if="taskData.status === 'IN_PROGRESS'"
            type="warning"
            icon="VideoPause"
            @click="handlePause"
            v-hasPermi="['saltprocess:saltmaking:pause']"
          >
            暂停任务
          </el-button>
          <el-button
            v-if="taskData.status === 'IN_PROGRESS'"
            type="success"
            icon="Check"
            @click="handleComplete"
            v-hasPermi="['saltprocess:saltmaking:complete']"
          >
            完成任务
          </el-button>
          <el-button
            type="info"
            icon="Monitor"
            @click="handleMonitor"
            v-hasPermi="['saltprocess:saltmaking:monitor']"
          >
            实时监控
          </el-button>
          <el-button
            type="warning"
            icon="SetUp"
            @click="handleRatio"
            v-hasPermi="['saltprocess:saltmaking:ratio']"
          >
            配比管理
          </el-button>
        </el-button-group>
      </template>
    </el-page-header>

    <!-- 任务概览 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon temperature">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ taskData.currentTemperature || '--' }}°C</div>
              <div class="item-label">当前温度</div>
              <div class="item-target">目标: {{ taskData.targetTemperature }}°C</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon pressure">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ taskData.currentPressure || '--' }} MPa</div>
              <div class="item-label">当前压力</div>
              <div class="item-target">目标: {{ taskData.targetPressure }} MPa</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon stirring">
              <el-icon><Refresh /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ taskData.currentStirringSpeed || '--' }} rpm</div>
              <div class="item-label">搅拌速度</div>
              <div class="item-target">目标: {{ taskData.stirringSpeed }} rpm</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon progress">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ taskData.progress }}%</div>
              <div class="item-label">任务进度</div>
              <div class="item-target">{{ getProgressText() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细信息 -->
    <el-card class="detail-card">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务编码">
              {{ taskData.taskCode }}
            </el-descriptions-item>
            <el-descriptions-item label="项目名称">
              {{ taskData.projectName }}
            </el-descriptions-item>
            <el-descriptions-item label="化盐类型">
              <el-tag :type="getSaltTypeTag(taskData.saltType)">
                {{ getSaltTypeText(taskData.saltType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="反应罐">
              {{ taskData.tankName }}
            </el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusTag(taskData.status)">
                {{ getStatusText(taskData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="任务进度">
              <el-progress :percentage="taskData.progress" />
            </el-descriptions-item>
            <el-descriptions-item label="目标温度">
              {{ taskData.targetTemperature }}°C
            </el-descriptions-item>
            <el-descriptions-item label="目标压力">
              {{ taskData.targetPressure }} MPa
            </el-descriptions-item>
            <el-descriptions-item label="搅拌速度">
              {{ taskData.stirringSpeed }} rpm
            </el-descriptions-item>
            <el-descriptions-item label="反应时间">
              {{ taskData.reactionTime }} 分钟
            </el-descriptions-item>
            <el-descriptions-item label="操作员">
              {{ taskData.operatorName }}
            </el-descriptions-item>
            <el-descriptions-item label="计划开始时间">
              {{ parseTime(taskData.plannedStartTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="计划结束时间">
              {{ parseTime(taskData.plannedEndTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="实际开始时间">
              {{ parseTime(taskData.actualStartTime) || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="实际结束时间">
              {{ parseTime(taskData.actualEndTime) || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ parseTime(taskData.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">
              {{ taskData.remarks || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 配比配置 -->
        <el-tab-pane label="配比配置" name="ratio">
          <div class="ratio-section">
            <div class="section-header">
              <el-button type="primary" icon="Edit" @click="handleEditRatio" size="small">
                编辑配比
              </el-button>
              <el-button type="success" icon="Download" @click="handleExportRatio" size="small">
                导出配比
              </el-button>
            </div>
            <el-table :data="ratioConfig" size="small" border>
              <el-table-column prop="componentName" label="组分名称" width="150" />
              <el-table-column prop="componentCode" label="组分编码" width="120" />
              <el-table-column prop="targetRatio" label="目标配比(%)" width="120" align="center">
                <template #default="scope">
                  <span class="ratio-value">{{ scope.row.targetRatio }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="actualRatio" label="实际配比(%)" width="120" align="center">
                <template #default="scope">
                  <span :class="getRatioClass(scope.row.actualRatio, scope.row.targetRatio)">
                    {{ scope.row.actualRatio || '--' }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="tolerance" label="容差(%)" width="100" align="center">
                <template #default="scope">
                  ±{{ scope.row.tolerance }}%
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="80" align="center">
                <template #default="scope">
                  <el-tag :type="getPriorityTag(scope.row.priority)" size="small">
                    {{ scope.row.priority }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getRatioStatusTag(scope.row.status)" size="small">
                    {{ getRatioStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 数据记录 -->
        <el-tab-pane label="数据记录" name="data">
          <div class="data-section">
            <div class="section-header">
              <el-button type="primary" icon="Plus" @click="handleAddData" size="small">
                添加数据记录
              </el-button>
              <el-button type="success" icon="Download" @click="handleExportData" size="small">
                导出数据
              </el-button>
            </div>
            <el-table :data="dataRecords" size="small" max-height="400">
              <el-table-column prop="recordTime" label="记录时间" width="160">
                <template #default="scope">
                  {{ parseTime(scope.row.recordTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="temperature" label="温度(°C)" width="100" />
              <el-table-column prop="pressure" label="压力(MPa)" width="100" />
              <el-table-column prop="stirringSpeed" label="搅拌速度(rpm)" width="120" />
              <el-table-column prop="feedRate" label="进料速率(kg/min)" width="130" />
              <el-table-column prop="ph" label="pH值" width="80" />
              <el-table-column prop="density" label="密度(g/cm³)" width="110" />
              <el-table-column prop="isAbnormal" label="是否异常" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.isAbnormal ? 'danger' : 'success'" size="small">
                    {{ scope.row.isAbnormal ? '异常' : '正常' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="operatorName" label="操作员" width="100" />
              <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 报警信息 -->
        <el-tab-pane label="报警信息" name="alerts">
          <div class="alerts-section">
            <el-table :data="alertRecords" size="small" max-height="400">
              <el-table-column prop="createTime" label="报警时间" width="160">
                <template #default="scope">
                  {{ parseTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="alertType" label="报警类型" width="120">
                <template #default="scope">
                  {{ getAlertTypeText(scope.row.alertType) }}
                </template>
              </el-table-column>
              <el-table-column prop="level" label="报警级别" width="100">
                <template #default="scope">
                  <el-tag :type="getAlertLevelTag(scope.row.level)" size="small">
                    {{ getAlertLevelText(scope.row.level) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="报警信息" min-width="200" show-overflow-tooltip />
              <el-table-column prop="currentValue" label="当前值" width="100" />
              <el-table-column prop="targetValue" label="目标值" width="100" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getAlertStatusTag(scope.row.status)" size="small">
                    {{ getAlertStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.status === 'ACTIVE'"
                    link
                    type="primary"
                    size="small"
                    @click="handleAlert(scope.row)"
                  >
                    处理
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 'HANDLED'"
                    link
                    type="success"
                    size="small"
                    @click="closeAlert(scope.row)"
                  >
                    关闭
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 质量检测 -->
        <el-tab-pane label="质量检测" name="quality">
          <div class="quality-section">
            <div class="section-header">
              <el-button type="primary" icon="Plus" @click="handleAddQuality" size="small">
                新增检测
              </el-button>
            </div>
            <el-table :data="qualityRecords" size="small" max-height="400">
              <el-table-column prop="testTime" label="检测时间" width="160">
                <template #default="scope">
                  {{ parseTime(scope.row.testTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="testType" label="检测类型" width="120" />
              <el-table-column prop="testItem" label="检测项目" width="120" />
              <el-table-column prop="testValue" label="检测值" width="100" />
              <el-table-column prop="standardValue" label="标准值" width="100" />
              <el-table-column prop="unit" label="单位" width="80" />
              <el-table-column prop="result" label="检测结果" width="100">
                <template #default="scope">
                  <el-tag :type="getQualityResultTag(scope.row.result)" size="small">
                    {{ getQualityResultText(scope.row.result) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="testerName" label="检测员" width="100" />
              <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="SaltmakingTaskDetail" lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  TrendCharts,
  DataAnalysis,
  Refresh,
  Clock,
  VideoPlay,
  VideoPause,
  Check,
  Monitor,
  SetUp,
  Edit,
  Plus,
  Download
} from '@element-plus/icons-vue';
import {
  getSaltmakingTask,
  startSaltmakingTask,
  pauseSaltmakingTask,
  completeSaltmakingTask,
  getSaltmakingRatioConfig,
  listSaltmakingData,
  getSaltmakingAlerts,
  listSaltmakingQuality,
  handleAlert,
  closeAlert
} from '@/api/erp/saltprocess/saltmaking';
import type {
  SaltmakingTaskVO,
  SaltmakingRatioConfig,
  SaltmakingDataVO,
  SaltmakingAlert,
  SaltmakingQualityVO
} from '@/api/erp/saltprocess/saltmaking/types';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const activeTab = ref('basic');
const taskData = ref<SaltmakingTaskVO>({} as SaltmakingTaskVO);
const ratioConfig = ref<SaltmakingRatioConfig[]>([]);
const dataRecords = ref<SaltmakingDataVO[]>([]);
const alertRecords = ref<SaltmakingAlert[]>([]);
const qualityRecords = ref<SaltmakingQualityVO[]>([]);

// 生命周期
onMounted(() => {
  const taskId = route.params.id as string;
  if (taskId) {
    loadTaskData(taskId);
    loadRatioConfig(taskId);
    loadDataRecords(taskId);
    loadAlertRecords(taskId);
    loadQualityRecords(taskId);
  }
});

// 方法
const loadTaskData = async (taskId: string) => {
  loading.value = true;
  try {
    const { data } = await getSaltmakingTask(taskId);
    taskData.value = data;
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const loadRatioConfig = async (taskId: string) => {
  try {
    const { data } = await getSaltmakingRatioConfig(taskId);
    ratioConfig.value = data;
  } catch (error) {
    console.error('加载配比配置失败:', error);
  }
};

const loadDataRecords = async (taskId: string) => {
  try {
    const { data } = await listSaltmakingData(taskId);
    dataRecords.value = data;
  } catch (error) {
    console.error('加载数据记录失败:', error);
  }
};

const loadAlertRecords = async (taskId: string) => {
  try {
    const { data } = await getSaltmakingAlerts(taskId);
    alertRecords.value = data;
  } catch (error) {
    console.error('加载报警记录失败:', error);
  }
};

const loadQualityRecords = async (taskId: string) => {
  try {
    const { data } = await listSaltmakingQuality(taskId);
    qualityRecords.value = data;
  } catch (error) {
    console.error('加载质量记录失败:', error);
  }
};

const handleBack = () => {
  router.back();
};

const handleStart = async () => {
  try {
    await ElMessageBox.confirm('是否确认启动化盐任务？', '确认启动', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await startSaltmakingTask(taskData.value.id);
    ElMessage.success('任务启动成功');
    loadTaskData(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('启动任务失败:', error);
      ElMessage.error('启动任务失败');
    }
  }
};

const handlePause = async () => {
  try {
    await ElMessageBox.confirm('是否确认暂停化盐任务？', '确认暂停', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await pauseSaltmakingTask(taskData.value.id);
    ElMessage.success('任务暂停成功');
    loadTaskData(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('暂停任务失败:', error);
      ElMessage.error('暂停任务失败');
    }
  }
};

const handleComplete = async () => {
  try {
    await ElMessageBox.confirm('是否确认完成化盐任务？', '确认完成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await completeSaltmakingTask(taskData.value.id);
    ElMessage.success('任务完成成功');
    loadTaskData(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成任务失败:', error);
      ElMessage.error('完成任务失败');
    }
  }
};

const handleMonitor = () => {
  router.push(`/saltprocess/saltmaking/monitor/${taskData.value.id}`);
};

const handleRatio = () => {
  ElMessage.info('配比管理功能开发中');
};

const handleEditRatio = () => {
  ElMessage.info('编辑配比功能开发中');
};

const handleExportRatio = () => {
  ElMessage.info('导出配比功能开发中');
};

const handleAddData = () => {
  ElMessage.info('添加数据记录功能开发中');
};

const handleExportData = () => {
  ElMessage.info('导出数据功能开发中');
};

const handleAlert = async (alert: SaltmakingAlert) => {
  try {
    const { value: action } = await ElMessageBox.prompt(
      '请输入处理措施',
      '处理报警',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '处理措施不能为空'
      }
    );
    
    await handleAlert(alert.id, action);
    ElMessage.success('报警处理成功');
    loadAlertRecords(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理报警失败:', error);
      ElMessage.error('处理报警失败');
    }
  }
};

const closeAlert = async (alert: SaltmakingAlert) => {
  try {
    await closeAlert(alert.id);
    ElMessage.success('报警关闭成功');
    loadAlertRecords(taskData.value.id);
  } catch (error) {
    console.error('关闭报警失败:', error);
    ElMessage.error('关闭报警失败');
  }
};

const handleAddQuality = () => {
  ElMessage.info('新增质量检测功能开发中');
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

const getProgressText = (): string => {
  if (taskData.value.status === 'COMPLETED') return '已完成';
  if (taskData.value.status === 'IN_PROGRESS') return '进行中';
  if (taskData.value.status === 'FAILED') return '失败';
  return '待开始';
};

const getRatioClass = (actual: number, target: number): string => {
  if (!actual) return '';
  const diff = Math.abs(actual - target);
  if (diff <= 1) return 'text-success';
  if (diff <= 3) return 'text-warning';
  return 'text-danger';
};

const getPriorityTag = (priority: string): string => {
  const tagMap = {
    'HIGH': 'danger',
    'MEDIUM': 'warning',
    'LOW': 'info'
  };
  return tagMap[priority as keyof typeof tagMap] || '';
};

const getRatioStatusText = (status: string): string => {
  const statusMap = {
    'NORMAL': '正常',
    'WARNING': '警告',
    'ABNORMAL': '异常'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getRatioStatusTag = (status: string): string => {
  const tagMap = {
    'NORMAL': 'success',
    'WARNING': 'warning',
    'ABNORMAL': 'danger'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getAlertTypeText = (type: string): string => {
  const typeMap = {
    'TEMPERATURE': '温度',
    'PRESSURE': '压力',
    'RATIO': '配比',
    'EQUIPMENT': '设备',
    'QUALITY': '质量'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getAlertLevelText = (level: string): string => {
  const levelMap = {
    'INFO': '信息',
    'WARNING': '警告',
    'ERROR': '错误',
    'CRITICAL': '严重'
  };
  return levelMap[level as keyof typeof levelMap] || level;
};

const getAlertLevelTag = (level: string): string => {
  const tagMap = {
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger',
    'CRITICAL': 'danger'
  };
  return tagMap[level as keyof typeof tagMap] || '';
};

const getAlertStatusText = (status: string): string => {
  const statusMap = {
    'ACTIVE': '活跃',
    'HANDLED': '已处理',
    'CLOSED': '已关闭'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getAlertStatusTag = (status: string): string => {
  const tagMap = {
    'ACTIVE': 'danger',
    'HANDLED': 'warning',
    'CLOSED': 'success'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getQualityResultText = (result: string): string => {
  const resultMap = {
    'PASS': '合格',
    'FAIL': '不合格',
    'PENDING': '待检'
  };
  return resultMap[result as keyof typeof resultMap] || result;
};

const getQualityResultTag = (result: string): string => {
  const tagMap = {
    'PASS': 'success',
    'FAIL': 'danger',
    'PENDING': 'warning'
  };
  return tagMap[result as keyof typeof tagMap] || '';
};
</script>
