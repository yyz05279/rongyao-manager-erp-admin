<template>
  <div class="heating-task-detail" v-loading="loading">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="task-title">{{ taskData.taskCode }} - {{ taskData.projectName }}</span>
          <el-tag :type="getStatusTag(taskData.status)" class="status-tag">
            {{ getStatusText(taskData.status) }}
          </el-tag>
          <el-tag :type="getStageTag(taskData.currentStage)" class="stage-tag">
            {{ getStageText(taskData.currentStage) }}
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
            v-hasPermi="['saltprocess:heating:start']"
          >
            启动任务
          </el-button>
          <el-button
            v-if="taskData.status === 'IN_PROGRESS'"
            type="warning"
            icon="VideoPause"
            @click="handlePause"
            v-hasPermi="['saltprocess:heating:pause']"
          >
            暂停任务
          </el-button>
          <el-button
            v-if="taskData.status === 'IN_PROGRESS'"
            type="success"
            icon="Check"
            @click="handleComplete"
            v-hasPermi="['saltprocess:heating:complete']"
          >
            完成任务
          </el-button>
          <el-button
            type="info"
            icon="Monitor"
            @click="handleMonitor"
            v-hasPermi="['saltprocess:heating:monitor']"
          >
            实时监控
          </el-button>
          <el-button
            type="warning"
            icon="Operation"
            @click="handleStages"
            v-hasPermi="['saltprocess:heating:stages']"
          >
            阶段管理
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
              <div class="item-target">目标: {{ taskData.finalTemperature }}°C</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon rate">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ taskData.currentHeatingRate || '--' }} °C/min</div>
              <div class="item-label">升温速率</div>
              <div class="item-target">设定: {{ taskData.heatingRate }} °C/min</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon stage">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ getStageText(taskData.currentStage) }}</div>
              <div class="item-label">当前阶段</div>
              <div class="item-target">{{ getStageProgress() }}</div>
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
            <el-descriptions-item label="反应罐">
              {{ taskData.tankName }}
            </el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusTag(taskData.status)">
                {{ getStatusText(taskData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前阶段">
              <el-tag :type="getStageTag(taskData.currentStage)">
                {{ getStageText(taskData.currentStage) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="任务进度">
              <el-progress :percentage="taskData.progress" />
            </el-descriptions-item>
            <el-descriptions-item label="最终温度">
              {{ taskData.finalTemperature }}°C
            </el-descriptions-item>
            <el-descriptions-item label="升温速率">
              {{ taskData.heatingRate }} °C/min
            </el-descriptions-item>
            <el-descriptions-item label="保温时间">
              {{ taskData.holdingTime }} 分钟
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

        <!-- 提温阶段 -->
        <el-tab-pane label="提温阶段" name="stages">
          <div class="stages-section">
            <div class="section-header">
              <el-button type="primary" icon="Edit" @click="handleEditStages" size="small">
                编辑阶段
              </el-button>
              <el-button type="success" icon="Download" @click="handleExportStages" size="small">
                导出阶段
              </el-button>
            </div>
            <el-table :data="heatingStages" size="small" border>
              <el-table-column prop="stageName" label="阶段名称" width="150" />
              <el-table-column prop="stageOrder" label="阶段顺序" width="100" align="center" />
              <el-table-column prop="startTemperature" label="起始温度(°C)" width="120" align="center" />
              <el-table-column prop="endTemperature" label="结束温度(°C)" width="120" align="center" />
              <el-table-column prop="heatingRate" label="升温速率(°C/min)" width="140" align="center" />
              <el-table-column prop="duration" label="持续时间(分钟)" width="130" align="center" />
              <el-table-column prop="status" label="阶段状态" width="100" align="center">
                <template #default="scope">
                  <el-tag :type="getStageStatusTag(scope.row.status)" size="small">
                    {{ getStageStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="actualStartTime" label="实际开始时间" width="160" align="center">
                <template #default="scope">
                  {{ parseTime(scope.row.actualStartTime) || '--' }}
                </template>
              </el-table-column>
              <el-table-column prop="actualEndTime" label="实际结束时间" width="160" align="center">
                <template #default="scope">
                  {{ parseTime(scope.row.actualEndTime) || '--' }}
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
              <el-table-column prop="heatingRate" label="升温速率(°C/min)" width="130" />
              <el-table-column prop="currentStage" label="当前阶段" width="120">
                <template #default="scope">
                  {{ getStageText(scope.row.currentStage) }}
                </template>
              </el-table-column>
              <el-table-column prop="energyConsumption" label="能耗(kWh)" width="100" />
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

        <!-- 能耗分析 -->
        <el-tab-pane label="能耗分析" name="energy">
          <div class="energy-section">
            <el-row :gutter="20">
              <el-col :xs="24" :lg="12">
                <el-card class="energy-summary">
                  <template #header>
                    <span>能耗统计</span>
                  </template>
                  <el-descriptions :column="2" border size="small">
                    <el-descriptions-item label="总能耗">
                      {{ energyData.totalConsumption || '--' }} kWh
                    </el-descriptions-item>
                    <el-descriptions-item label="平均功率">
                      {{ energyData.averagePower || '--' }} kW
                    </el-descriptions-item>
                    <el-descriptions-item label="峰值功率">
                      {{ energyData.peakPower || '--' }} kW
                    </el-descriptions-item>
                    <el-descriptions-item label="能效比">
                      {{ energyData.efficiency || '--' }} %
                    </el-descriptions-item>
                    <el-descriptions-item label="预计成本">
                      ¥{{ energyData.estimatedCost || '--' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="节能建议">
                      {{ energyData.suggestion || '--' }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-card>
              </el-col>
              <el-col :xs="24" :lg="12">
                <el-card class="energy-chart">
                  <template #header>
                    <span>能耗趋势</span>
                  </template>
                  <div ref="energyChartRef" class="chart-container" style="height: 300px;"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="HeatingTaskDetail" lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  TrendCharts,
  DataAnalysis,
  Operation,
  Clock,
  VideoPlay,
  VideoPause,
  Check,
  Monitor,
  Edit,
  Plus,
  Download
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getHeatingTask,
  startHeatingTask,
  pauseHeatingTask,
  completeHeatingTask,
  getHeatingStages,
  listHeatingData,
  getHeatingAlerts,
  getHeatingEnergyData,
  handleAlert as handleAlertApi,
  closeAlert as closeAlertApi
} from '@/api/erp/saltprocess/heating';
import type {
  HeatingTaskVO,
  HeatingStageVO,
  HeatingDataVO,
  HeatingAlert,
  HeatingEnergyData
} from '@/api/erp/saltprocess/heating/types';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const activeTab = ref('basic');
const taskData = ref<HeatingTaskVO>({} as HeatingTaskVO);
const heatingStages = ref<HeatingStageVO[]>([]);
const dataRecords = ref<HeatingDataVO[]>([]);
const alertRecords = ref<HeatingAlert[]>([]);
const energyData = ref<HeatingEnergyData>({} as HeatingEnergyData);

// 图表引用
const energyChartRef = ref();
let energyChart: echarts.ECharts | null = null;

// 生命周期
onMounted(() => {
  const taskId = route.params.id as string;
  if (taskId) {
    loadTaskData(taskId);
    loadHeatingStages(taskId);
    loadDataRecords(taskId);
    loadAlertRecords(taskId);
    loadEnergyData(taskId);
  }
});

// 方法
const loadTaskData = async (taskId: string) => {
  loading.value = true;
  try {
    const { data } = await getHeatingTask(taskId);
    taskData.value = data;
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const loadHeatingStages = async (taskId: string) => {
  try {
    const { data } = await getHeatingStages(taskId);
    heatingStages.value = data;
  } catch (error) {
    console.error('加载提温阶段失败:', error);
  }
};

const loadDataRecords = async (taskId: string) => {
  try {
    const { data } = await listHeatingData(taskId);
    dataRecords.value = data;
  } catch (error) {
    console.error('加载数据记录失败:', error);
  }
};

const loadAlertRecords = async (taskId: string) => {
  try {
    const { data } = await getHeatingAlerts(taskId);
    alertRecords.value = data;
  } catch (error) {
    console.error('加载报警记录失败:', error);
  }
};

const loadEnergyData = async (taskId: string) => {
  try {
    const { data } = await getHeatingEnergyData(taskId);
    energyData.value = data;
    await nextTick();
    initEnergyChart(data.chartData || []);
  } catch (error) {
    console.error('加载能耗数据失败:', error);
  }
};

const initEnergyChart = (data: any[]) => {
  if (!energyChartRef.value) return;
  
  energyChart = echarts.init(energyChartRef.value);
  
  const option = {
    title: {
      text: '能耗趋势图',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['功率', '累计能耗'],
      bottom: 0
    },
    xAxis: {
      type: 'time'
    },
    yAxis: [
      {
        type: 'value',
        name: '功率(kW)',
        position: 'left'
      },
      {
        type: 'value',
        name: '累计能耗(kWh)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '功率',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => [item.time, item.power]),
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '累计能耗',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => [item.time, item.totalConsumption]),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }
    ]
  };

  energyChart.setOption(option);
};

const handleBack = () => {
  router.back();
};

const handleStart = async () => {
  try {
    await ElMessageBox.confirm('是否确认启动提温任务？', '确认启动', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await startHeatingTask(taskData.value.id);
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
    await ElMessageBox.confirm('是否确认暂停提温任务？', '确认暂停', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await pauseHeatingTask(taskData.value.id);
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
    await ElMessageBox.confirm('是否确认完成提温任务？', '确认完成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await completeHeatingTask(taskData.value.id);
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
  router.push(`/saltprocess/heating/monitor/${taskData.value.id}`);
};

const handleStages = () => {
  ElMessage.info('阶段管理功能开发中');
};

const handleEditStages = () => {
  ElMessage.info('编辑阶段功能开发中');
};

const handleExportStages = () => {
  ElMessage.info('导出阶段功能开发中');
};

const handleAddData = () => {
  ElMessage.info('添加数据记录功能开发中');
};

const handleExportData = () => {
  ElMessage.info('导出数据功能开发中');
};

const handleAlert = async (alert: HeatingAlert) => {
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
    
    await handleAlertApi(alert.id, action);
    ElMessage.success('报警处理成功');
    loadAlertRecords(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理报警失败:', error);
      ElMessage.error('处理报警失败');
    }
  }
};

const closeAlert = async (alert: HeatingAlert) => {
  try {
    await closeAlertApi(alert.id);
    ElMessage.success('报警关闭成功');
    loadAlertRecords(taskData.value.id);
  } catch (error) {
    console.error('关闭报警失败:', error);
    ElMessage.error('关闭报警失败');
  }
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

const getStageProgress = (): string => {
  const currentStageIndex = heatingStages.value.findIndex(stage => stage.status === 'IN_PROGRESS');
  if (currentStageIndex === -1) return '未开始';
  return `${currentStageIndex + 1}/${heatingStages.value.length}`;
};

const getProgressText = (): string => {
  if (taskData.value.status === 'COMPLETED') return '已完成';
  if (taskData.value.status === 'IN_PROGRESS') return '进行中';
  if (taskData.value.status === 'FAILED') return '失败';
  return '待开始';
};

const getStageStatusText = (status: string): string => {
  const statusMap = {
    'PENDING': '待开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'SKIPPED': '已跳过'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStageStatusTag = (status: string): string => {
  const tagMap = {
    'PENDING': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'SKIPPED': 'warning'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getAlertTypeText = (type: string): string => {
  const typeMap = {
    'TEMPERATURE': '温度',
    'HEATING_RATE': '升温速率',
    'ENERGY': '能耗',
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
</script>
