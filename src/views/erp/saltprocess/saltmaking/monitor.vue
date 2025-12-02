<template>
  <div class="saltmaking-monitor" v-loading="loading">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="task-title">{{ taskData.taskCode }} - 化盐工艺监控</span>
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
            :type="autoRefresh ? 'primary' : 'default'"
            :icon="autoRefresh ? 'VideoPause' : 'VideoPlay'"
            @click="toggleAutoRefresh"
          >
            {{ autoRefresh ? '停止刷新' : '自动刷新' }}
          </el-button>
          <el-button type="info" icon="Refresh" @click="refreshData">
            手动刷新
          </el-button>
          <el-button type="success" icon="Download" @click="exportData">
            导出数据
          </el-button>
        </el-button-group>
      </template>
    </el-page-header>

    <!-- 实时数据概览 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card class="metric-card temperature">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ currentData.temperature || '--' }}°C</div>
              <div class="metric-label">当前温度</div>
              <div class="metric-target">目标: {{ taskData.targetTemperature }}°C</div>
              <div class="metric-status" :class="getTemperatureStatus()">
                {{ getTemperatureStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card class="metric-card pressure">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ currentData.pressure || '--' }} MPa</div>
              <div class="metric-label">当前压力</div>
              <div class="metric-target">目标: {{ taskData.targetPressure }} MPa</div>
              <div class="metric-status" :class="getPressureStatus()">
                {{ getPressureStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card class="metric-card stirring">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><Refresh /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ currentData.stirringSpeed || '--' }} rpm</div>
              <div class="metric-label">搅拌速度</div>
              <div class="metric-target">目标: {{ taskData.stirringSpeed }} rpm</div>
              <div class="metric-status" :class="getStirringStatus()">
                {{ getStirringStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card class="metric-card ph">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ currentData.ph || '--' }}</div>
              <div class="metric-label">pH值</div>
              <div class="metric-target">范围: {{ taskData.phRange }}</div>
              <div class="metric-status" :class="getPhStatus()">
                {{ getPhStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card class="metric-card density">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><ScaleToOriginal /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ currentData.density || '--' }} g/cm³</div>
              <div class="metric-label">密度</div>
              <div class="metric-target">目标: {{ taskData.targetDensity }} g/cm³</div>
              <div class="metric-status" :class="getDensityStatus()">
                {{ getDensityStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card class="metric-card progress">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ taskData.progress }}%</div>
              <div class="metric-label">任务进度</div>
              <div class="metric-target">{{ getElapsedTime() }}</div>
              <div class="metric-status normal">
                {{ getProgressStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 配比监控 -->
    <el-card class="ratio-monitor-card">
      <template #header>
        <div class="card-header">
          <span>配比实时监控</span>
          <el-button type="primary" size="small" @click="handleAdjustRatio">
            调整配比
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <div ref="ratioChartRef" class="ratio-chart"></div>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="ratio-table">
            <el-table :data="ratioData" size="small" height="300">
              <el-table-column prop="componentName" label="组分" width="80" />
              <el-table-column prop="targetRatio" label="目标%" width="60" align="center">
                <template #default="scope">
                  {{ scope.row.targetRatio }}%
                </template>
              </el-table-column>
              <el-table-column prop="actualRatio" label="实际%" width="60" align="center">
                <template #default="scope">
                  <span :class="getRatioClass(scope.row.actualRatio, scope.row.targetRatio)">
                    {{ scope.row.actualRatio }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="deviation" label="偏差" width="60" align="center">
                <template #default="scope">
                  <span :class="getDeviationClass(scope.row.deviation)">
                    {{ scope.row.deviation > 0 ? '+' : '' }}{{ scope.row.deviation }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="60" align="center">
                <template #default="scope">
                  <el-tag :type="getRatioStatusTag(scope.row.status)" size="small">
                    {{ getRatioStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>温度压力趋势</span>
              <el-select v-model="tempPressureTimeRange" size="small" style="width: 120px" @change="loadChartData">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近12小时" value="12h" />
                <el-option label="最近24小时" value="24h" />
              </el-select>
            </div>
          </template>
          <div ref="tempPressureChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>pH值密度趋势</span>
              <el-select v-model="phDensityTimeRange" size="small" style="width: 120px" @change="loadChartData">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近12小时" value="12h" />
                <el-option label="最近24小时" value="24h" />
              </el-select>
            </div>
          </template>
          <div ref="phDensityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时数据表格 -->
    <el-card class="data-table-card">
      <template #header>
        <div class="table-header">
          <span>实时数据记录</span>
          <div class="header-actions">
            <el-button type="primary" icon="Plus" size="small" @click="handleAddRecord">
              手动记录
            </el-button>
            <el-button type="success" icon="Download" size="small" @click="exportTableData">
              导出表格
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="realtimeData" size="small" max-height="400">
        <el-table-column prop="recordTime" label="记录时间" width="160">
          <template #default="scope">
            {{ parseTime(scope.row.recordTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度(°C)" width="100">
          <template #default="scope">
            <span :class="getTemperatureClass(scope.row.temperature)">
              {{ scope.row.temperature }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="pressure" label="压力(MPa)" width="100">
          <template #default="scope">
            <span :class="getPressureClass(scope.row.pressure)">
              {{ scope.row.pressure }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="stirringSpeed" label="搅拌速度(rpm)" width="120" />
        <el-table-column prop="feedRate" label="进料速率(kg/min)" width="130" />
        <el-table-column prop="ph" label="pH值" width="80" />
        <el-table-column prop="density" label="密度(g/cm³)" width="110" />
        <el-table-column prop="isAbnormal" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isAbnormal ? 'danger' : 'success'" size="small">
              {{ scope.row.isAbnormal ? '异常' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作员" width="100" />
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>
    </el-card>

    <!-- 活跃报警 -->
    <el-card class="alerts-card" v-if="activeAlerts.length > 0">
      <template #header>
        <div class="alerts-header">
          <span class="alerts-title">
            <el-icon class="alert-icon"><Warning /></el-icon>
            活跃报警 ({{ activeAlerts.length }})
          </span>
        </div>
      </template>
      <div class="alerts-list">
        <el-alert
          v-for="alert in activeAlerts"
          :key="alert.id"
          :title="alert.message"
          :type="getAlertType(alert.level)"
          :description="`当前值: ${alert.currentValue} | 目标值: ${alert.targetValue} | 时间: ${parseTime(alert.createTime)}`"
          show-icon
          :closable="false"
          class="alert-item"
        >
          <template #default>
            <div class="alert-actions">
              <el-button type="primary" size="small" @click="handleAlert(alert)">
                处理
              </el-button>
            </div>
          </template>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup name="SaltmakingMonitor" lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  TrendCharts,
  DataAnalysis,
  Refresh,
  Histogram,
  ScaleToOriginal,
  Clock,
  VideoPlay,
  VideoPause,
  Download,
  Plus,
  Warning
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getSaltmakingTask,
  getRealtimeData,
  getSaltmakingChartData,
  getSaltmakingAlerts,
  getSaltmakingRatioData,
  handleAlert
} from '@/api/erp/saltprocess/saltmaking';
import type {
  SaltmakingTaskVO,
  SaltmakingDataVO,
  SaltmakingAlert,
  SaltmakingRatioData
} from '@/api/erp/saltprocess/saltmaking/types';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const autoRefresh = ref(false);
const refreshTimer = ref<NodeJS.Timeout | null>(null);
const taskData = ref<SaltmakingTaskVO>({} as SaltmakingTaskVO);
const currentData = ref<any>({});
const realtimeData = ref<SaltmakingDataVO[]>([]);
const activeAlerts = ref<SaltmakingAlert[]>([]);
const ratioData = ref<SaltmakingRatioData[]>([]);
const tempPressureTimeRange = ref('6h');
const phDensityTimeRange = ref('6h');

// 图表引用
const ratioChartRef = ref();
const tempPressureChartRef = ref();
const phDensityChartRef = ref();
let ratioChart: echarts.ECharts | null = null;
let tempPressureChart: echarts.ECharts | null = null;
let phDensityChart: echarts.ECharts | null = null;

// 生命周期
onMounted(() => {
  const taskId = route.params.id as string;
  if (taskId) {
    initMonitor(taskId);
  }
});

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
  }
  if (ratioChart) ratioChart.dispose();
  if (tempPressureChart) tempPressureChart.dispose();
  if (phDensityChart) phDensityChart.dispose();
});

// 方法
const initMonitor = async (taskId: string) => {
  await loadTaskData(taskId);
  await loadRealtimeData(taskId);
  await loadActiveAlerts(taskId);
  await loadRatioData(taskId);
  await nextTick();
  initCharts();
  await loadChartData();
};

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

const loadRealtimeData = async (taskId: string) => {
  try {
    const { data } = await getRealtimeData(taskId);
    realtimeData.value = data.records;
    currentData.value = data.current || {};
  } catch (error) {
    console.error('加载实时数据失败:', error);
  }
};

const loadActiveAlerts = async (taskId: string) => {
  try {
    const { data } = await getSaltmakingAlerts(taskId, 'ACTIVE');
    activeAlerts.value = data;
  } catch (error) {
    console.error('加载报警数据失败:', error);
  }
};

const loadRatioData = async (taskId: string) => {
  try {
    const { data } = await getSaltmakingRatioData(taskId);
    ratioData.value = data;
    updateRatioChart(data);
  } catch (error) {
    console.error('加载配比数据失败:', error);
  }
};

const initCharts = () => {
  if (ratioChartRef.value) {
    ratioChart = echarts.init(ratioChartRef.value);
  }
  if (tempPressureChartRef.value) {
    tempPressureChart = echarts.init(tempPressureChartRef.value);
  }
  if (phDensityChartRef.value) {
    phDensityChart = echarts.init(phDensityChartRef.value);
  }
};

const updateRatioChart = (data: SaltmakingRatioData[]) => {
  if (!ratioChart) return;

  const option = {
    title: {
      text: '配比对比图',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['目标配比', '实际配比'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.componentName),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '配比(%)',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '目标配比',
        type: 'bar',
        data: data.map(item => item.targetRatio),
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '实际配比',
        type: 'bar',
        data: data.map(item => item.actualRatio),
        itemStyle: { color: '#67C23A' }
      }
    ]
  };

  ratioChart.setOption(option);
};

const loadChartData = async () => {
  const taskId = route.params.id as string;
  if (!taskId) return;

  try {
    const [tempPressureData, phDensityData] = await Promise.all([
      getSaltmakingChartData(taskId, 'TEMP_PRESSURE', tempPressureTimeRange.value, undefined, undefined),
      getSaltmakingChartData(taskId, 'PH_DENSITY', phDensityTimeRange.value, undefined, undefined)
    ]);

    updateTempPressureChart(tempPressureData.data);
    updatePhDensityChart(phDensityData.data);
  } catch (error) {
    console.error('加载图表数据失败:', error);
  }
};

const updateTempPressureChart = (data: any[]) => {
  if (!tempPressureChart) return;

  const option = {
    title: {
      text: '温度压力趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['温度', '压力'],
      bottom: 0
    },
    xAxis: {
      type: 'time'
    },
    yAxis: [
      {
        type: 'value',
        name: '温度(°C)',
        position: 'left'
      },
      {
        type: 'value',
        name: '压力(MPa)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '温度',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => [item.time, item.temperature]),
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '压力',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => [item.time, item.pressure]),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }
    ]
  };

  tempPressureChart.setOption(option);
};

const updatePhDensityChart = (data: any[]) => {
  if (!phDensityChart) return;

  const option = {
    title: {
      text: 'pH值密度趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['pH值', '密度'],
      bottom: 0
    },
    xAxis: {
      type: 'time'
    },
    yAxis: [
      {
        type: 'value',
        name: 'pH值',
        position: 'left'
      },
      {
        type: 'value',
        name: '密度(g/cm³)',
        position: 'right'
      }
    ],
    series: [
      {
        name: 'pH值',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => [item.time, item.ph]),
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '密度',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => [item.time, item.density]),
        smooth: true,
        itemStyle: { color: '#F56C6C' }
      }
    ]
  };

  phDensityChart.setOption(option);
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  
  if (autoRefresh.value) {
    refreshTimer.value = setInterval(() => {
      refreshData();
    }, 5000);
    ElMessage.success('已开启自动刷新');
  } else {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
      refreshTimer.value = null;
    }
    ElMessage.info('已停止自动刷新');
  }
};

const refreshData = async () => {
  const taskId = route.params.id as string;
  if (!taskId) return;

  await Promise.all([
    loadRealtimeData(taskId),
    loadActiveAlerts(taskId),
    loadRatioData(taskId),
    loadChartData()
  ]);
};

const handleBack = () => {
  router.back();
};

const exportData = () => {
  ElMessage.info('导出数据功能开发中');
};

const handleAddRecord = () => {
  ElMessage.info('手动记录功能开发中');
};

const exportTableData = () => {
  ElMessage.info('导出表格功能开发中');
};

const handleAdjustRatio = () => {
  ElMessage.info('调整配比功能开发中');
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
    loadActiveAlerts(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理报警失败:', error);
      ElMessage.error('处理报警失败');
    }
  }
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

const getTemperatureStatus = (): string => {
  if (!currentData.value.temperature || !taskData.value.targetTemperature) return 'normal';
  const diff = Math.abs(currentData.value.temperature - taskData.value.targetTemperature);
  if (diff <= 2) return 'normal';
  if (diff <= 5) return 'warning';
  return 'danger';
};

const getTemperatureStatusText = (): string => {
  const status = getTemperatureStatus();
  const statusMap = {
    'normal': '正常',
    'warning': '偏差',
    'danger': '异常'
  };
  return statusMap[status as keyof typeof statusMap] || '未知';
};

const getPressureStatus = (): string => {
  if (!currentData.value.pressure || !taskData.value.targetPressure) return 'normal';
  const diff = Math.abs(currentData.value.pressure - taskData.value.targetPressure);
  if (diff <= 0.1) return 'normal';
  if (diff <= 0.2) return 'warning';
  return 'danger';
};

const getPressureStatusText = (): string => {
  const status = getPressureStatus();
  const statusMap = {
    'normal': '正常',
    'warning': '偏差',
    'danger': '异常'
  };
  return statusMap[status as keyof typeof statusMap] || '未知';
};

const getStirringStatus = (): string => {
  if (!currentData.value.stirringSpeed || !taskData.value.stirringSpeed) return 'normal';
  const diff = Math.abs(currentData.value.stirringSpeed - taskData.value.stirringSpeed);
  if (diff <= 10) return 'normal';
  if (diff <= 20) return 'warning';
  return 'danger';
};

const getStirringStatusText = (): string => {
  const status = getStirringStatus();
  const statusMap = {
    'normal': '正常',
    'warning': '偏差',
    'danger': '异常'
  };
  return statusMap[status as keyof typeof statusMap] || '未知';
};

const getPhStatus = (): string => {
  if (!currentData.value.ph || !taskData.value.phRange) return 'normal';
  const [min, max] = taskData.value.phRange.split('-').map(Number);
  if (currentData.value.ph >= min && currentData.value.ph <= max) return 'normal';
  return 'danger';
};

const getPhStatusText = (): string => {
  const status = getPhStatus();
  return status === 'normal' ? '正常' : '超范围';
};

const getDensityStatus = (): string => {
  if (!currentData.value.density || !taskData.value.targetDensity) return 'normal';
  const diff = Math.abs(currentData.value.density - taskData.value.targetDensity);
  if (diff <= 0.05) return 'normal';
  if (diff <= 0.1) return 'warning';
  return 'danger';
};

const getDensityStatusText = (): string => {
  const status = getDensityStatus();
  const statusMap = {
    'normal': '正常',
    'warning': '偏差',
    'danger': '异常'
  };
  return statusMap[status as keyof typeof statusMap] || '未知';
};

const getProgressStatusText = (): string => {
  if (taskData.value.status === 'IN_PROGRESS') return '进行中';
  if (taskData.value.status === 'COMPLETED') return '已完成';
  return '待开始';
};

const getElapsedTime = (): string => {
  if (!taskData.value.actualStartTime) return '未开始';
  const start = new Date(taskData.value.actualStartTime).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000 / 60);
  if (elapsed < 60) return `${elapsed}分钟`;
  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;
  return `${hours}小时${minutes}分钟`;
};

const getTemperatureClass = (temperature: number): string => {
  if (!temperature || !taskData.value.targetTemperature) return '';
  const diff = Math.abs(temperature - taskData.value.targetTemperature);
  if (diff <= 2) return 'text-success';
  if (diff <= 5) return 'text-warning';
  return 'text-danger';
};

const getPressureClass = (pressure: number): string => {
  if (!pressure || !taskData.value.targetPressure) return '';
  const diff = Math.abs(pressure - taskData.value.targetPressure);
  if (diff <= 0.1) return 'text-success';
  if (diff <= 0.2) return 'text-warning';
  return 'text-danger';
};

const getRatioClass = (actual: number, target: number): string => {
  if (!actual) return '';
  const diff = Math.abs(actual - target);
  if (diff <= 1) return 'text-success';
  if (diff <= 3) return 'text-warning';
  return 'text-danger';
};

const getDeviationClass = (deviation: number): string => {
  const abs = Math.abs(deviation);
  if (abs <= 1) return 'text-success';
  if (abs <= 3) return 'text-warning';
  return 'text-danger';
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

const getAlertType = (level: string): string => {
  const typeMap = {
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'error',
    'CRITICAL': 'error'
  };
  return typeMap[level as keyof typeof typeMap] || 'info';
};
</script>
