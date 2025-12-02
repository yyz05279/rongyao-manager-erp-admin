<template>
  <div class="binary-statistics-container">
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterParams" :inline="true" label-width="80px">
        <el-form-item label="时间范围">
          <el-select v-model="filterParams.timeRange" @change="handleTimeRangeChange" style="width: 120px">
            <el-option label="最近7天" value="7days" />
            <el-option label="最近30天" value="30days" />
            <el-option label="最近3个月" value="3months" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="filterParams.timeRange === 'custom'" label="自定义时间">
          <el-date-picker
            v-model="filterParams.customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleCustomDateChange"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="项目ID">
          <el-input
            v-model="filterParams.projectId"
            placeholder="请输入项目ID"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-button type="success" icon="Download" @click="handleExportChart">导出图表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <el-card class="overview-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据概览</span>
          <el-button size="small" icon="Refresh" @click="handleQuery" :loading="loading">
            刷新数据
          </el-button>
        </div>
      </template>
      <div v-if="!loading && !error">
        <el-row :gutter="20">
          <el-col :span="4" v-for="item in overviewData" :key="item.key">
            <div class="overview-item">
              <div class="overview-value" :class="item.valueClass">{{ item.value }}</div>
              <div class="overview-label">{{ item.label }}</div>
              <div class="overview-trend" :class="item.trendClass">
                <el-icon><component :is="item.trendIcon" /></el-icon>
                {{ item.trend }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-else-if="error" class="error-state">
        <el-empty description="数据加载失败">
          <el-button type="primary" @click="handleQuery">重新加载</el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 趋势图表 -->
    <el-row :gutter="20">
      <!-- 盐类用量趋势 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span class="card-title">盐类用量趋势</span>
              <div class="chart-tools">
                <el-tooltip content="刷新数据" placement="top">
                  <el-button size="small" icon="Refresh" @click="refreshSaltChart" :loading="loading" />
                </el-tooltip>
                <el-tooltip content="全屏显示" placement="top">
                  <el-button size="small" icon="FullScreen" @click="fullscreenChart('saltChart')" :disabled="loading || error" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div v-if="!error" ref="saltChartRef" class="chart-container"></div>
          <div v-else class="chart-error">
            <el-empty description="图表加载失败" :image-size="100">
              <el-button type="primary" size="small" @click="refreshSaltChart">重新加载</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>

      <!-- 能耗趋势 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span class="card-title">能耗趋势</span>
              <div class="chart-tools">
                <el-tooltip content="刷新数据" placement="top">
                  <el-button size="small" icon="Refresh" @click="refreshEnergyChart" :loading="loading" />
                </el-tooltip>
                <el-tooltip content="全屏显示" placement="top">
                  <el-button size="small" icon="FullScreen" @click="fullscreenChart('energyChart')" :disabled="loading || error" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div v-if="!error" ref="energyChartRef" class="chart-container"></div>
          <div v-else class="chart-error">
            <el-empty description="图表加载失败" :image-size="100">
              <el-button type="primary" size="small" @click="refreshEnergyChart">重新加载</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 人员配置趋势 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span class="card-title">人员配置趋势</span>
              <div class="chart-tools">
                <el-tooltip content="刷新数据" placement="top">
                  <el-button size="small" icon="Refresh" @click="refreshStaffChart" :loading="loading" />
                </el-tooltip>
                <el-tooltip content="全屏显示" placement="top">
                  <el-button size="small" icon="FullScreen" @click="fullscreenChart('staffChart')" :disabled="loading || error" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div v-if="!error" ref="staffChartRef" class="chart-container"></div>
          <div v-else class="chart-error">
            <el-empty description="图表加载失败" :image-size="100">
              <el-button type="primary" size="small" @click="refreshStaffChart">重新加载</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>

      <!-- 配比分析 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="never" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span class="card-title">配比分析</span>
              <div class="chart-tools">
                <el-tooltip content="刷新数据" placement="top">
                  <el-button size="small" icon="Refresh" @click="refreshRatioChart" :loading="loading" />
                </el-tooltip>
                <el-tooltip content="全屏显示" placement="top">
                  <el-button size="small" icon="FullScreen" @click="fullscreenChart('ratioChart')" :disabled="loading || error" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div v-if="!error" ref="ratioChartRef" class="chart-container"></div>
          <div v-else class="chart-error">
            <el-empty description="图表加载失败" :image-size="100">
              <el-button type="primary" size="small" @click="refreshRatioChart">重新加载</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 全屏图表对话框 -->
    <el-dialog
      v-model="fullscreenDialog.visible"
      :title="fullscreenDialog.title"
      width="90%"
      append-to-body
      destroy-on-close
    >
      <div ref="fullscreenChartRef" style="height: 500px;"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import {
  Search,
  Refresh,
  Download,
  FullScreen,
  TrendCharts,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue';
// API接口导入
import { getStatisticsData } from '@/api/erp/saltprocess/records/binary';

// 定义接口
interface FilterParams {
  timeRange: string;
  customDateRange: [Date, Date] | null;
  projectId: string;
}

interface OverviewItem {
  key: string;
  label: string;
  value: string;
  valueClass: string;
  trend: string;
  trendClass: string;
  trendIcon: any;
}

interface ChartData {
  dates: string[];
  nano3Data: number[];
  kno3Data: number[];
  gasData: number[];
  powerData: number[];
  staffData: number[];
}

// 响应式数据
const loading = ref(false);
const error = ref(false);
const saltChartRef = ref<HTMLElement>();
const energyChartRef = ref<HTMLElement>();
const staffChartRef = ref<HTMLElement>();
const ratioChartRef = ref<HTMLElement>();
const fullscreenChartRef = ref<HTMLElement>();

// 图表实例
let saltChart: echarts.ECharts | null = null;
let energyChart: echarts.ECharts | null = null;
let staffChart: echarts.ECharts | null = null;
let ratioChart: echarts.ECharts | null = null;
let fullscreenChartInstance: echarts.ECharts | null = null;

// 筛选参数
const filterParams = reactive<FilterParams>({
  timeRange: '7days',
  customDateRange: null,
  projectId: ''
});

// 全屏对话框
const fullscreenDialog = reactive({
  visible: false,
  title: '',
  chartType: ''
});

// 概览数据
const overviewData = ref<OverviewItem[]>([
  {
    key: 'totalSalt',
    label: '总化盐量(t)',
    value: '156.8',
    valueClass: 'value-primary',
    trend: '+12.5%',
    trendClass: 'trend-up',
    trendIcon: ArrowUp
  },
  {
    key: 'avgGas',
    label: '平均气耗(Nm³)',
    value: '1,245',
    valueClass: 'value-warning',
    trend: '-3.2%',
    trendClass: 'trend-down',
    trendIcon: ArrowDown
  },
  {
    key: 'avgPower',
    label: '平均电耗(KWh)',
    value: '865',
    valueClass: 'value-success',
    trend: '+5.8%',
    trendClass: 'trend-up',
    trendIcon: ArrowUp
  },
  {
    key: 'avgStaff',
    label: '平均人数',
    value: '7.2',
    valueClass: 'value-info',
    trend: '0%',
    trendClass: 'trend-stable',
    trendIcon: Minus
  },
  {
    key: 'normalRatio',
    label: '正常配比率',
    value: '85.7%',
    valueClass: 'value-success',
    trend: '+2.1%',
    trendClass: 'trend-up',
    trendIcon: ArrowUp
  }
]);

// 图表数据
const chartData = ref<ChartData>({
  dates: [],
  nano3Data: [],
  kno3Data: [],
  gasData: [],
  powerData: [],
  staffData: []
});

// 生命周期
onMounted(() => {
  initCharts();
  loadData();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 销毁图表实例
  if (saltChart) saltChart.dispose();
  if (energyChart) energyChart.dispose();
  if (staffChart) staffChart.dispose();
  if (ratioChart) ratioChart.dispose();
  if (fullscreenChartInstance) fullscreenChartInstance.dispose();
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
});

// 方法
const initCharts = async () => {
  await nextTick();
  
  // 初始化盐类用量趋势图
  if (saltChartRef.value) {
    saltChart = echarts.init(saltChartRef.value);
  }
  
  // 初始化能耗趋势图
  if (energyChartRef.value) {
    energyChart = echarts.init(energyChartRef.value);
  }
  
  // 初始化人员配置趋势图
  if (staffChartRef.value) {
    staffChart = echarts.init(staffChartRef.value);
  }
  
  // 初始化配比分析图
  if (ratioChartRef.value) {
    ratioChart = echarts.init(ratioChartRef.value);
  }
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    // 构建查询参数
    const queryParams = {
      timeRange: filterParams.timeRange as '7days' | '30days' | '3months' | 'custom',
      projectId: filterParams.projectId ? parseInt(filterParams.projectId) : undefined,
      startDate: undefined as string | undefined,
      endDate: undefined as string | undefined
    };

    // 处理自定义时间范围
    if (filterParams.timeRange === 'custom' && filterParams.customDateRange) {
      queryParams.startDate = filterParams.customDateRange[0].toISOString().split('T')[0];
      queryParams.endDate = filterParams.customDateRange[1].toISOString().split('T')[0];
    }

    // 调用API获取统计数据
    const response = await getStatisticsData(queryParams);

    if (response.code === 200) {
      // 使用API返回的数据
      const apiData = response.data as any;
      chartData.value = {
        dates: apiData.chartData.dates,
        nano3Data: apiData.chartData.nano3Data,
        kno3Data: apiData.chartData.kno3Data,
        gasData: apiData.chartData.gasData,
        powerData: apiData.chartData.powerData,
        staffData: apiData.chartData.staffData
      };

      // 更新概览数据
      overviewData.value = [
        {
          key: 'totalSalt',
          label: '总化盐量',
          value: `${apiData.overview.totalSalt.toFixed(1)}t`,
          valueClass: 'overview-value-primary',
          trend: '+2.3%',
          trendClass: 'trend-up',
          trendIcon: ArrowUp
        },
        {
          key: 'avgGas',
          label: '平均气耗',
          value: `${apiData.overview.avgGas}Nm³`,
          valueClass: 'overview-value-warning',
          trend: '-1.2%',
          trendClass: 'trend-down',
          trendIcon: ArrowDown
        },
        {
          key: 'avgPower',
          label: '平均电耗',
          value: `${apiData.overview.avgPower}KWh`,
          valueClass: 'overview-value-success',
          trend: '+0.8%',
          trendClass: 'trend-up',
          trendIcon: ArrowUp
        },
        {
          key: 'avgStaff',
          label: '平均人数',
          value: `${apiData.overview.avgStaff}人`,
          valueClass: 'overview-value-info',
          trend: '0.0%',
          trendClass: 'trend-stable',
          trendIcon: Minus
        }
      ];

      updateAllCharts();
      ElMessage.success('数据加载成功');
    } else {
      throw new Error(response.msg || 'API调用失败');
    }
  } catch (err) {
    console.error('加载统计数据失败:', err);
    error.value = true;
    ElMessage.error('加载统计数据失败，请重试');
  } finally {
    loading.value = false;
  }
};



// 更新概览数据
const updateOverviewData = () => {
  if (chartData.value.dates.length === 0) return;

  // 计算总化盐量
  const totalSalt = chartData.value.nano3Data.reduce((sum, nano3, index) => {
    return sum + nano3 + chartData.value.kno3Data[index];
  }, 0) / 1000; // 转换为吨

  // 计算平均值
  const avgGas = Math.round(chartData.value.gasData.reduce((sum, val) => sum + val, 0) / chartData.value.gasData.length);
  const avgPower = Math.round(chartData.value.powerData.reduce((sum, val) => sum + val, 0) / chartData.value.powerData.length);
  const avgStaff = (chartData.value.staffData.reduce((sum, val) => sum + val, 0) / chartData.value.staffData.length).toFixed(1);

  // 计算正常配比率
  let normalRatioCount = 0;
  chartData.value.nano3Data.forEach((nano3, index) => {
    const kno3 = chartData.value.kno3Data[index];
    const total = nano3 + kno3;
    if (total > 0) {
      const nano3Ratio = nano3 / total;
      if (Math.abs(nano3Ratio - 0.6) <= 0.05) {
        normalRatioCount++;
      }
    }
  });
  const normalRatioPercent = ((normalRatioCount / chartData.value.dates.length) * 100).toFixed(1);

  // 更新概览数据
  overviewData.value[0].value = totalSalt.toFixed(1);
  overviewData.value[1].value = avgGas.toLocaleString();
  overviewData.value[2].value = avgPower.toLocaleString();
  overviewData.value[3].value = avgStaff;
  overviewData.value[4].value = `${normalRatioPercent}%`;
};

// 获取日期范围
const getDateRange = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  let days = 7;

  switch (filterParams.timeRange) {
    case '7days':
      days = 7;
      break;
    case '30days':
      days = 30;
      break;
    case '3months':
      days = 90;
      break;
    case 'custom':
      if (filterParams.customDateRange) {
        const start = new Date(filterParams.customDateRange[0]);
        const end = new Date(filterParams.customDateRange[1]);
        days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
      break;
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

// 更新所有图表
const updateAllCharts = () => {
  updateSaltChart();
  updateEnergyChart();
  updateStaffChart();
  updateRatioChart();
};

// 更新盐类用量趋势图
const updateSaltChart = () => {
  if (!saltChart) return;

  const option = {
    title: {
      text: '盐类用量趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['硝酸钠', '硝酸钾'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' },
        dataZoom: { title: { zoom: '区域缩放', back: '区域缩放还原' } }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates
    },
    yAxis: {
      type: 'value',
      name: '用量(kg)',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '硝酸钠',
        type: 'line',
        data: chartData.value.nano3Data,
        smooth: true,
        itemStyle: { color: '#409EFF' },
        areaStyle: { opacity: 0.3 }
      },
      {
        name: '硝酸钾',
        type: 'line',
        data: chartData.value.kno3Data,
        smooth: true,
        itemStyle: { color: '#67C23A' },
        areaStyle: { opacity: 0.3 }
      }
    ]
  };

  saltChart.setOption(option);
};

// 更新能耗趋势图
const updateEnergyChart = () => {
  if (!energyChart) return;

  const option = {
    title: {
      text: '能耗趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['天然气消耗', '电量消耗'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' },
        dataZoom: { title: { zoom: '区域缩放', back: '区域缩放还原' } }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates
    },
    yAxis: [
      {
        type: 'value',
        name: '天然气(Nm³)',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '电量(KWh)',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '天然气消耗',
        type: 'line',
        yAxisIndex: 0,
        data: chartData.value.gasData,
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '电量消耗',
        type: 'line',
        yAxisIndex: 1,
        data: chartData.value.powerData,
        smooth: true,
        itemStyle: { color: '#F56C6C' }
      }
    ]
  };

  energyChart.setOption(option);
};

// 更新人员配置趋势图
const updateStaffChart = () => {
  if (!staffChart) return;

  const option = {
    title: {
      text: '人员配置趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' },
        dataZoom: { title: { zoom: '区域缩放', back: '区域缩放还原' } }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates
    },
    yAxis: {
      type: 'value',
      name: '人数',
      min: 0,
      max: 12,
      axisLabel: {
        formatter: '{value}人'
      }
    },
    series: [
      {
        name: '操作人数',
        type: 'line',
        data: chartData.value.staffData,
        smooth: true,
        itemStyle: { color: '#909399' },
        areaStyle: {
          opacity: 0.3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#909399' },
              { offset: 1, color: 'rgba(144, 147, 153, 0.1)' }
            ]
          }
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }
      }
    ]
  };

  staffChart.setOption(option);
};

// 更新配比分析图
const updateRatioChart = () => {
  if (!ratioChart) return;

  // 计算配比数据
  const ratioData = chartData.value.dates.map((date, index) => {
    const nano3 = chartData.value.nano3Data[index];
    const kno3 = chartData.value.kno3Data[index];
    const total = nano3 + kno3;
    const nano3Ratio = total > 0 ? (nano3 / total * 100) : 0;
    const kno3Ratio = total > 0 ? (kno3 / total * 100) : 0;

    return {
      date,
      nano3Ratio: nano3Ratio.toFixed(1),
      kno3Ratio: kno3Ratio.toFixed(1),
      isNormal: Math.abs(nano3Ratio - 60) <= 5 && Math.abs(kno3Ratio - 40) <= 5
    };
  });

  const option = {
    title: {
      text: '配比分析(目标6:4)',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const data = ratioData[dataIndex];
        return `
          ${params[0].axisValue}<br/>
          硝酸钠配比: ${data.nano3Ratio}%<br/>
          硝酸钾配比: ${data.kno3Ratio}%<br/>
          状态: ${data.isNormal ? '<span style="color: #67C23A">正常</span>' : '<span style="color: #F56C6C">异常</span>'}
        `;
      }
    },
    legend: {
      data: ['硝酸钠配比', '硝酸钾配比', '目标线'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' },
        dataZoom: { title: { zoom: '区域缩放', back: '区域缩放还原' } }
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.dates
    },
    yAxis: {
      type: 'value',
      name: '配比(%)',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '硝酸钠配比',
        type: 'line',
        data: ratioData.map(item => item.nano3Ratio),
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '硝酸钾配比',
        type: 'line',
        data: ratioData.map(item => item.kno3Ratio),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '目标线',
        type: 'line',
        data: new Array(ratioData.length).fill(60),
        lineStyle: {
          type: 'dashed',
          color: '#E6A23C'
        },
        itemStyle: { color: '#E6A23C' },
        symbol: 'none'
      }
    ]
  };

  ratioChart.setOption(option);
};

// 事件处理方法
const handleTimeRangeChange = () => {
  if (filterParams.timeRange !== 'custom') {
    filterParams.customDateRange = null;
  }
  handleQuery();
};

const handleCustomDateChange = () => {
  handleQuery();
};

const handleFilterChange = () => {
  // 可以添加防抖处理
};

const handleQuery = () => {
  loadData();
};

const handleReset = () => {
  filterParams.timeRange = '7days';
  filterParams.customDateRange = null;
  filterParams.projectId = '';
  handleQuery();
};

const handleExportChart = async () => {
  try {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在导出图表...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 创建一个临时的大尺寸图表用于导出
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '1200px';
    tempDiv.style.height = '800px';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const tempChart = echarts.init(tempDiv);

    // 使用当前盐类用量图表的配置
    const currentOption = saltChart?.getOption();
    if (currentOption) {
      tempChart.setOption(currentOption);

      // 导出为图片
      const base64 = tempChart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `二元化盐统计分析_${new Date().toISOString().split('T')[0]}.png`;
      link.href = base64;
      link.click();
    }

    // 清理
    tempChart.dispose();
    document.body.removeChild(tempDiv);
    loadingInstance.close();

    ElMessage.success('图表导出成功');
  } catch (error) {
    console.error('导出图表失败:', error);
    ElMessage.error('导出图表失败');
  }
};

// 刷新图表方法
const refreshSaltChart = () => {
  loadData();
};

const refreshEnergyChart = () => {
  loadData();
};

const refreshStaffChart = () => {
  loadData();
};

const refreshRatioChart = () => {
  loadData();
};

// 全屏显示图表
const fullscreenChart = async (chartType: string) => {
  fullscreenDialog.chartType = chartType;

  switch (chartType) {
    case 'saltChart':
      fullscreenDialog.title = '盐类用量趋势 - 全屏显示';
      break;
    case 'energyChart':
      fullscreenDialog.title = '能耗趋势 - 全屏显示';
      break;
    case 'staffChart':
      fullscreenDialog.title = '人员配置趋势 - 全屏显示';
      break;
    case 'ratioChart':
      fullscreenDialog.title = '配比分析 - 全屏显示';
      break;
  }

  fullscreenDialog.visible = true;

  await nextTick();

  if (fullscreenChartRef.value) {
    fullscreenChartInstance = echarts.init(fullscreenChartRef.value);

    // 复制对应图表的配置
    let sourceChart: echarts.ECharts | null = null;
    switch (chartType) {
      case 'saltChart':
        sourceChart = saltChart;
        break;
      case 'energyChart':
        sourceChart = energyChart;
        break;
      case 'staffChart':
        sourceChart = staffChart;
        break;
      case 'ratioChart':
        sourceChart = ratioChart;
        break;
    }

    if (sourceChart) {
      const option = sourceChart.getOption();
      fullscreenChartInstance.setOption(option);
    }
  }
};

// 窗口大小变化处理
const handleResize = () => {
  if (saltChart) saltChart.resize();
  if (energyChart) energyChart.resize();
  if (staffChart) staffChart.resize();
  if (ratioChart) ratioChart.resize();
  if (fullscreenChartInstance) fullscreenChartInstance.resize();
};

// 暴露给父组件的方法
defineExpose({
  refresh: loadData
});
</script>

<style scoped lang="scss">
.binary-statistics-container {
  padding: 20px;

  .filter-card,
  .overview-card,
  .chart-card {
    margin-bottom: 20px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
  }

  // 概览卡片样式
  .overview-card {
    .overview-item {
      text-align: center;
      padding: 20px 10px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .overview-value {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;

        &.value-primary { color: #409EFF; }
        &.value-success { color: #67C23A; }
        &.value-warning { color: #E6A23C; }
        &.value-danger { color: #F56C6C; }
        &.value-info { color: #909399; }
      }

      .overview-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .overview-trend {
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;

        &.trend-up { color: #67C23A; }
        &.trend-down { color: #F56C6C; }
        &.trend-stable { color: #909399; }
      }
    }
  }

  // 图表卡片样式
  .chart-card {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .chart-tools {
        display: flex;
        gap: 8px;
      }
    }

    .chart-container {
      height: 350px;
      width: 100%;
    }

    .chart-error {
      height: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  // 错误状态样式
  .error-state {
    padding: 40px 20px;
    text-align: center;
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .overview-card .overview-item {
      padding: 15px 8px;

      .overview-value {
        font-size: 24px;
      }
    }

    .chart-card .chart-container {
      height: 300px;
    }
  }

  @media (max-width: 768px) {
    padding: 10px;

    .overview-card .overview-item {
      padding: 12px 6px;

      .overview-value {
        font-size: 20px;
      }

      .overview-label {
        font-size: 12px;
      }
    }

    .chart-card .chart-container {
      height: 250px;
    }

    .chart-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start !important;
    }
  }
}

// 全局样式覆盖
:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
  margin-bottom: 12px;
}

:deep(.el-dialog__body) {
  padding: 10px 20px;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BinaryStatistics'
});
</script>
