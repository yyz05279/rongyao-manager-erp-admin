<template>
  <div class="preheating-task-detail" v-loading="loading">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="task-title">{{ taskData.taskCode }} - {{ taskData.projectName }}</span>
          <el-tag :type="getStatusTag(taskData.status)" class="status-tag">
            {{ getStatusText(taskData.status) }}
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
            v-hasPermi="['saltprocess:preheating:start']"
          >
            启动任务
          </el-button>
          <el-button
            v-if="taskData.status === 'IN_PROGRESS'"
            type="warning"
            icon="VideoPause"
            @click="handlePause"
            v-hasPermi="['saltprocess:preheating:pause']"
          >
            暂停任务
          </el-button>
          <el-button
            v-if="taskData.status === 'IN_PROGRESS'"
            type="success"
            icon="Check"
            @click="handleComplete"
            v-hasPermi="['saltprocess:preheating:complete']"
          >
            完成任务
          </el-button>
          <el-button
            type="info"
            icon="Monitor"
            @click="handleMonitor"
            v-hasPermi="['saltprocess:preheating:monitor']"
          >
            实时监控
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
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon operator">
              <el-icon><User /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ taskData.operatorName }}</div>
              <div class="item-label">操作员</div>
              <div class="item-target">{{ taskData.tankName }}</div>
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
            <el-descriptions-item label="反应罐">
              {{ taskData.tankName }}
            </el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusTag(taskData.status)">
                {{ getStatusText(taskData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="目标温度">
              {{ taskData.targetTemperature }}°C
            </el-descriptions-item>
            <el-descriptions-item label="目标压力">
              {{ taskData.targetPressure }} MPa
            </el-descriptions-item>
            <el-descriptions-item label="温度容差">
              ±{{ taskData.tolerance }}°C
            </el-descriptions-item>
            <el-descriptions-item label="任务进度">
              <el-progress :percentage="taskData.progress" />
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
              <el-table-column prop="location" label="位置" width="100">
                <template #default="scope">
                  {{ getLocationText(scope.row.location) }}
                </template>
              </el-table-column>
              <el-table-column prop="equipmentStatus" label="设备状态" width="120" />
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

        <!-- 巡检记录 -->
        <el-tab-pane label="巡检记录" name="inspection">
          <div class="inspection-section">
            <div class="section-header">
              <el-button type="primary" icon="Plus" @click="handleAddInspection" size="small">
                新增巡检
              </el-button>
            </div>
            <el-table :data="inspectionRecords" size="small" max-height="400">
              <el-table-column prop="inspectionCode" label="巡检编码" width="120" />
              <el-table-column prop="inspectionTime" label="巡检时间" width="160">
                <template #default="scope">
                  {{ parseTime(scope.row.inspectionTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="inspectorName" label="巡检员" width="100" />
              <el-table-column prop="overallResult" label="巡检结果" width="100">
                <template #default="scope">
                  <el-tag :type="getInspectionResultTag(scope.row.overallResult)" size="small">
                    {{ getInspectionResultText(scope.row.overallResult) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkPoints" label="检查点数" width="100">
                <template #default="scope">
                  {{ scope.row.checkPoints?.length || 0 }}
                </template>
              </el-table-column>
              <el-table-column prop="issues" label="问题数" width="100">
                <template #default="scope">
                  {{ scope.row.issues?.length || 0 }}
                </template>
              </el-table-column>
              <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="viewInspection(scope.row)"
                  >
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="PreheatingTaskDetail" lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  TrendCharts,
  DataAnalysis,
  Clock,
  User,
  VideoPlay,
  VideoPause,
  Check,
  Monitor,
  Plus,
  Download
} from '@element-plus/icons-vue';
import {
  getPreheatingTask,
  startPreheatingTask,
  pausePreheatingTask,
  completePreheatingTask,
  listPreheatingData,
  getPreheatingAlerts,
  listPreheatingInspection,
  handleAlert,
  closeAlert
} from '@/api/erp/saltprocess/preheating';
import type {
  PreheatingTaskVO,
  PreheatingDataVO,
  PreheatingAlert,
  PreheatingInspectionVO
} from '@/api/erp/saltprocess/preheating/types';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const activeTab = ref('basic');
const taskData = ref<PreheatingTaskVO>({} as PreheatingTaskVO);
const dataRecords = ref<PreheatingDataVO[]>([]);
const alertRecords = ref<PreheatingAlert[]>([]);
const inspectionRecords = ref<PreheatingInspectionVO[]>([]);

// 生命周期
onMounted(() => {
  const taskId = route.params.id as string;
  if (taskId) {
    loadTaskData(taskId);
    loadDataRecords(taskId);
    loadAlertRecords(taskId);
    loadInspectionRecords(taskId);
  }
});

// 方法
const loadTaskData = async (taskId: string) => {
  loading.value = true;
  try {
    const { data } = await getPreheatingTask(taskId);
    taskData.value = data;
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const loadDataRecords = async (taskId: string) => {
  try {
    const { data } = await listPreheatingData(taskId);
    dataRecords.value = data;
  } catch (error) {
    console.error('加载数据记录失败:', error);
  }
};

const loadAlertRecords = async (taskId: string) => {
  try {
    const { data } = await getPreheatingAlerts(taskId);
    alertRecords.value = data;
  } catch (error) {
    console.error('加载报警记录失败:', error);
  }
};

const loadInspectionRecords = async (taskId: string) => {
  try {
    const { data } = await listPreheatingInspection(taskId);
    inspectionRecords.value = data;
  } catch (error) {
    console.error('加载巡检记录失败:', error);
  }
};

const handleBack = () => {
  router.back();
};

const handleStart = async () => {
  try {
    await ElMessageBox.confirm('是否确认启动预热任务？', '确认启动', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await startPreheatingTask(taskData.value.id);
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
    await ElMessageBox.confirm('是否确认暂停预热任务？', '确认暂停', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await pausePreheatingTask(taskData.value.id);
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
    await ElMessageBox.confirm('是否确认完成预热任务？', '确认完成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await completePreheatingTask(taskData.value.id);
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
  router.push(`/saltprocess/preheating/monitor/${taskData.value.id}`);
};

const handleAddData = () => {
  ElMessage.info('添加数据记录功能开发中');
};

const handleExportData = () => {
  ElMessage.info('导出数据功能开发中');
};

const handleAlert = async (alert: PreheatingAlert) => {
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

const closeAlert = async (alert: PreheatingAlert) => {
  try {
    await closeAlert(alert.id);
    ElMessage.success('报警关闭成功');
    loadAlertRecords(taskData.value.id);
  } catch (error) {
    console.error('关闭报警失败:', error);
    ElMessage.error('关闭报警失败');
  }
};

const handleAddInspection = () => {
  router.push(`/saltprocess/preheating/inspection/${taskData.value.id}`);
};

const viewInspection = (inspection: PreheatingInspectionVO) => {
  ElMessage.info('查看巡检详情功能开发中');
};

// 工具方法
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

const getLocationText = (location: string): string => {
  const locationMap = {
    'TOP': '上部',
    'MIDDLE': '中部',
    'BOTTOM': '下部'
  };
  return locationMap[location as keyof typeof locationMap] || location;
};

const getAlertTypeText = (type: string): string => {
  const typeMap = {
    'TEMPERATURE': '温度',
    'PRESSURE': '压力',
    'EQUIPMENT': '设备',
    'TIME': '时间'
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

const getInspectionResultText = (result: string): string => {
  const resultMap = {
    'PASS': '合格',
    'FAIL': '不合格',
    'WARNING': '警告'
  };
  return resultMap[result as keyof typeof resultMap] || result;
};

const getInspectionResultTag = (result: string): string => {
  const tagMap = {
    'PASS': 'success',
    'FAIL': 'danger',
    'WARNING': 'warning'
  };
  return tagMap[result as keyof typeof tagMap] || '';
};
</script>
