<template>
  <div class="preheating-monitor" v-loading="loading">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="task-title">{{ taskData.taskCode }} - 实时监控</span>
          <el-tag :type="getStatusTag(taskData.status)" class="status-tag">
            {{ getStatusText(taskData.status) }}
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
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
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
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
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
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
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
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="metric-card equipment">
          <div class="metric-content">
            <div class="metric-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ currentData.equipmentStatus || '--' }}</div>
              <div class="metric-label">设备状态</div>
              <div class="metric-target">{{ taskData.tankName }}</div>
              <div class="metric-status" :class="getEquipmentStatus()">
                {{ getEquipmentStatusText() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>温度趋势</span>
              <el-select v-model="temperatureTimeRange" size="small" style="width: 120px" @change="loadChartData">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近12小时" value="12h" />
                <el-option label="最近24小时" value="24h" />
              </el-select>
            </div>
          </template>
          <div ref="temperatureChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>压力趋势</span>
              <el-select v-model="pressureTimeRange" size="small" style="width: 120px" @change="loadChartData">
                <el-option label="最近1小时" value="1h" />
                <el-option label="最近6小时" value="6h" />
                <el-option label="最近12小时" value="12h" />
                <el-option label="最近24小时" value="24h" />
              </el-select>
            </div>
          </template>
          <div ref="pressureChartRef" class="chart-container"></div>
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
        <el-table-column prop="location" label="位置" width="100">
          <template #default="scope">
            {{ getLocationText(scope.row.location) }}
          </template>
        </el-table-column>
        <el-table-column prop="equipmentStatus" label="设备状态" width="120" />
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

<script setup name="PreheatingMonitor" lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  TrendCharts,
  DataAnalysis,
  Clock,
  Setting,
  VideoPlay,
  VideoPause,
  Refresh,
  Download,
  Plus,
  Warning
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getPreheatingTask,
  getRealtimeData,
  getPreheatingChartData,
  getPreheatingAlerts,
  handleAlert
} from '@/api/erp/saltprocess/preheating';
import type {
  PreheatingTaskVO,
  PreheatingDataVO,
  PreheatingAlert
} from '@/api/erp/saltprocess/preheating/types';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const autoRefresh = ref(false);
const refreshTimer = ref<NodeJS.Timeout | null>(null);
const taskData = ref<PreheatingTaskVO>({} as PreheatingTaskVO);
const currentData = ref<any>({});
const realtimeData = ref<PreheatingDataVO[]>([]);
const activeAlerts = ref<PreheatingAlert[]>([]);
const temperatureTimeRange = ref('6h');
const pressureTimeRange = ref('6h');

// 图表引用
const temperatureChartRef = ref();
const pressureChartRef = ref();
let temperatureChart: echarts.ECharts | null = null;
let pressureChart: echarts.ECharts | null = null;

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
  if (temperatureChart) {
    temperatureChart.dispose();
  }
  if (pressureChart) {
    pressureChart.dispose();
  }
});

// 方法
const initMonitor = async (taskId: string) => {
  await loadTaskData(taskId);
  await loadRealtimeData(taskId);
  await loadActiveAlerts(taskId);
  await nextTick();
  initCharts();
  await loadChartData();
};

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
    const { data } = await getPreheatingAlerts(taskId, 'ACTIVE');
    activeAlerts.value = data;
  } catch (error) {
    console.error('加载报警数据失败:', error);
  }
};

const initCharts = () => {
  if (temperatureChartRef.value) {
    temperatureChart = echarts.init(temperatureChartRef.value);
  }
  if (pressureChartRef.value) {
    pressureChart = echarts.init(pressureChartRef.value);
  }
};

const loadChartData = async () => {
  const taskId = route.params.id as string;
  if (!taskId) return;

  try {
    const [tempData, pressureData] = await Promise.all([
      getPreheatingChartData(taskId, 'TEMPERATURE', temperatureTimeRange.value, undefined, undefined),
      getPreheatingChartData(taskId, 'PRESSURE', pressureTimeRange.value, undefined, undefined)
    ]);

    updateTemperatureChart(tempData.data);
    updatePressureChart(pressureData.data);
  } catch (error) {
    console.error('加载图表数据失败:', error);
  }
};

const updateTemperatureChart = (data: any[]) => {
  if (!temperatureChart) return;

  const option = {
    title: {
      text: '温度趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const time = parseTime(params[0].axisValue);
        let content = `时间: ${time}<br/>`;
        params.forEach((param: any) => {
          content += `${param.seriesName}: ${param.value}°C<br/>`;
        });
        return content;
      }
    },
    legend: {
      data: ['实际温度', '目标温度'],
      bottom: 0
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) => parseTime(value, '{h}:{i}')
      }
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      axisLabel: {
        formatter: '{value}°C'
      }
    },
    series: [
      {
        name: '实际温度',
        type: 'line',
        data: data.map(item => [item.time, item.temperature]),
        smooth: true,
        lineStyle: { color: '#409EFF' },
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '目标温度',
        type: 'line',
        data: data.map(item => [item.time, taskData.value.targetTemperature]),
        lineStyle: { color: '#F56C6C', type: 'dashed' },
        itemStyle: { color: '#F56C6C' }
      }
    ]
  };

  temperatureChart.setOption(option);
};

const updatePressureChart = (data: any[]) => {
  if (!pressureChart) return;

  const option = {
    title: {
      text: '压力趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const time = parseTime(params[0].axisValue);
        let content = `时间: ${time}<br/>`;
        params.forEach((param: any) => {
          content += `${param.seriesName}: ${param.value} MPa<br/>`;
        });
        return content;
      }
    },
    legend: {
      data: ['实际压力', '目标压力'],
      bottom: 0
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) => parseTime(value, '{h}:{i}')
      }
    },
    yAxis: {
      type: 'value',
      name: '压力(MPa)',
      axisLabel: {
        formatter: '{value} MPa'
      }
    },
    series: [
      {
        name: '实际压力',
        type: 'line',
        data: data.map(item => [item.time, item.pressure]),
        smooth: true,
        lineStyle: { color: '#67C23A' },
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '目标压力',
        type: 'line',
        data: data.map(item => [item.time, taskData.value.targetPressure]),
        lineStyle: { color: '#E6A23C', type: 'dashed' },
        itemStyle: { color: '#E6A23C' }
      }
    ]
  };

  pressureChart.setOption(option);
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  
  if (autoRefresh.value) {
    refreshTimer.value = setInterval(() => {
      refreshData();
    }, 5000); // 每5秒刷新一次
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
    loadActiveAlerts(taskData.value.id);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理报警失败:', error);
      ElMessage.error('处理报警失败');
    }
  }
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

const getProgressStatusText = (): string => {
  if (taskData.value.status === 'IN_PROGRESS') return '进行中';
  if (taskData.value.status === 'COMPLETED') return '已完成';
  return '待开始';
};

const getEquipmentStatus = (): string => {
  if (!currentData.value.equipmentStatus) return 'normal';
  if (currentData.value.equipmentStatus === '正常') return 'normal';
  if (currentData.value.equipmentStatus === '警告') return 'warning';
  return 'danger';
};

const getEquipmentStatusText = (): string => {
  return currentData.value.equipmentStatus || '未知';
};

const getElapsedTime = (): string => {
  if (!taskData.value.actualStartTime) return '未开始';
  const start = new Date(taskData.value.actualStartTime).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000 / 60); // 分钟
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

const getLocationText = (location: string): string => {
  const locationMap = {
    'TOP': '上部',
    'MIDDLE': '中部',
    'BOTTOM': '下部'
  };
  return locationMap[location as keyof typeof locationMap] || location;
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
