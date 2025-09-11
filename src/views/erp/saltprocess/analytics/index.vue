<template>
  <div class="analytics-dashboard">
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterParams" :inline="true" label-width="80px">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="filterParams.projectId" placeholder="请选择项目" clearable style="width: 200px" @change="loadAnalyticsData">
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.projectName"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工艺类型">
          <el-select v-model="filterParams.processType" placeholder="请选择工艺" clearable style="width: 150px" @change="loadAnalyticsData">
            <el-option label="预热工艺" value="PREHEATING" />
            <el-option label="化盐工艺" value="SALTMAKING" />
            <el-option label="提温工艺" value="HEATING" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="loadAnalyticsData">查询</el-button>
          <el-button icon="Refresh" @click="resetFilter">重置</el-button>
          <el-button type="success" icon="Download" @click="handleExport">导出报告</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关键指标概览 -->
    <el-row :gutter="20" class="kpi-section">
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="kpi-card">
          <div class="kpi-item">
            <div class="kpi-icon production">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ kpiData.totalProduction || 0 }}</div>
              <div class="kpi-label">总产量 (吨)</div>
              <div class="kpi-trend" :class="getTrendClass(kpiData.productionTrend)">
                <el-icon><ArrowUp v-if="kpiData.productionTrend > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(kpiData.productionTrend || 0) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="kpi-card">
          <div class="kpi-item">
            <div class="kpi-icon efficiency">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ kpiData.avgEfficiency || 0 }}%</div>
              <div class="kpi-label">平均效率</div>
              <div class="kpi-trend" :class="getTrendClass(kpiData.efficiencyTrend)">
                <el-icon><ArrowUp v-if="kpiData.efficiencyTrend > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(kpiData.efficiencyTrend || 0) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="kpi-card">
          <div class="kpi-item">
            <div class="kpi-icon quality">
              <el-icon><Check /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ kpiData.qualityRate || 0 }}%</div>
              <div class="kpi-label">质量合格率</div>
              <div class="kpi-trend" :class="getTrendClass(kpiData.qualityTrend)">
                <el-icon><ArrowUp v-if="kpiData.qualityTrend > 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(kpiData.qualityTrend || 0) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6">
        <el-card class="kpi-card">
          <div class="kpi-item">
            <div class="kpi-icon energy">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ kpiData.energyConsumption || 0 }}</div>
              <div class="kpi-label">能耗 (kWh)</div>
              <div class="kpi-trend" :class="getTrendClass(-kpiData.energyTrend)">
                <el-icon><ArrowUp v-if="kpiData.energyTrend < 0" /><ArrowDown v-else /></el-icon>
                {{ Math.abs(kpiData.energyTrend || 0) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表分析区域 -->
    <el-row :gutter="20" class="charts-section">
      <!-- 生产趋势分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>生产趋势分析</span>
              <el-select v-model="productionChartType" size="small" style="width: 120px" @change="updateProductionChart">
                <el-option label="日产量" value="daily" />
                <el-option label="周产量" value="weekly" />
                <el-option label="月产量" value="monthly" />
              </el-select>
            </div>
          </template>
          <div ref="productionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 工艺效率分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>工艺效率分析</span>
              <el-select v-model="efficiencyChartType" size="small" style="width: 120px" @change="updateEfficiencyChart">
                <el-option label="预热效率" value="preheating" />
                <el-option label="化盐效率" value="saltmaking" />
                <el-option label="提温效率" value="heating" />
              </el-select>
            </div>
          </template>
          <div ref="efficiencyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 质量分布分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>质量分布分析</span>
          </template>
          <div ref="qualityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 能耗分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>能耗分析</span>
              <el-select v-model="energyChartType" size="small" style="width: 120px" @change="updateEnergyChart">
                <el-option label="总能耗" value="total" />
                <el-option label="单位能耗" value="unit" />
                <el-option label="能效比" value="efficiency" />
              </el-select>
            </div>
          </template>
          <div ref="energyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 设备利用率 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>设备利用率</span>
          </template>
          <div ref="equipmentChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 异常分析 -->
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>异常分析</span>
          </template>
          <div ref="anomalyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <span>详细数据</span>
          <el-button-group>
            <el-button
              v-for="tab in dataTabs"
              :key="tab.key"
              :type="activeDataTab === tab.key ? 'primary' : 'default'"
              size="small"
              @click="activeDataTab = tab.key; loadTableData()"
            >
              {{ tab.label }}
            </el-button>
          </el-button-group>
        </div>
      </template>
      
      <!-- 生产数据表格 -->
      <el-table v-if="activeDataTab === 'production'" :data="productionData" size="small" max-height="400">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="projectName" label="项目" width="150" />
        <el-table-column prop="processType" label="工艺类型" width="120" />
        <el-table-column prop="production" label="产量(吨)" width="100" />
        <el-table-column prop="efficiency" label="效率(%)" width="100" />
        <el-table-column prop="qualityRate" label="合格率(%)" width="100" />
        <el-table-column prop="energyConsumption" label="能耗(kWh)" width="120" />
        <el-table-column prop="operatorName" label="操作员" width="100" />
      </el-table>

      <!-- 质量数据表格 -->
      <el-table v-if="activeDataTab === 'quality'" :data="qualityData" size="small" max-height="400">
        <el-table-column prop="testDate" label="检测日期" width="120" />
        <el-table-column prop="sampleName" label="样品名称" width="150" />
        <el-table-column prop="testType" label="检测类型" width="120" />
        <el-table-column prop="testResult" label="检测结果" width="100" />
        <el-table-column prop="passRate" label="合格率(%)" width="100" />
        <el-table-column prop="testerName" label="检测员" width="100" />
      </el-table>

      <!-- 能耗数据表格 -->
      <el-table v-if="activeDataTab === 'energy'" :data="energyData" size="small" max-height="400">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="equipmentName" label="设备名称" width="150" />
        <el-table-column prop="totalConsumption" label="总能耗(kWh)" width="120" />
        <el-table-column prop="unitConsumption" label="单位能耗(kWh/吨)" width="140" />
        <el-table-column prop="efficiency" label="能效比(%)" width="100" />
        <el-table-column prop="cost" label="成本(元)" width="100" />
      </el-table>

      <!-- 异常数据表格 -->
      <el-table v-if="activeDataTab === 'anomaly'" :data="anomalyData" size="small" max-height="400">
        <el-table-column prop="occurTime" label="发生时间" width="160" />
        <el-table-column prop="anomalyType" label="异常类型" width="120" />
        <el-table-column prop="description" label="异常描述" min-width="200" />
        <el-table-column prop="severity" label="严重程度" width="100" />
        <el-table-column prop="status" label="处理状态" width="100" />
        <el-table-column prop="handlerName" label="处理人" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="AnalyticsDashboard" lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Search,
  Refresh,
  Download,
  TrendCharts,
  DataAnalysis,
  Check,
  Lightning,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import {
  getAnalyticsKPI,
  getProductionTrend,
  getEfficiencyAnalysis,
  getQualityDistribution,
  getEnergyAnalysis,
  getEquipmentUtilization,
  getAnomalyAnalysis,
  getProductionData,
  getQualityData,
  getEnergyData,
  getAnomalyData,
  exportAnalyticsReport
} from '@/api/erp/saltprocess/analytics';

// 响应式数据
const loading = ref(false);
const projectList = ref<any[]>([]);
const kpiData = ref<any>({});

// 筛选参数
const filterParams = reactive({
  dateRange: [],
  projectId: '',
  processType: ''
});

// 图表类型
const productionChartType = ref('daily');
const efficiencyChartType = ref('preheating');
const energyChartType = ref('total');

// 数据表格
const activeDataTab = ref('production');
const dataTabs = [
  { key: 'production', label: '生产数据' },
  { key: 'quality', label: '质量数据' },
  { key: 'energy', label: '能耗数据' },
  { key: 'anomaly', label: '异常数据' }
];

const productionData = ref([]);
const qualityData = ref([]);
const energyData = ref([]);
const anomalyData = ref([]);

// 图表引用
const productionChartRef = ref();
const efficiencyChartRef = ref();
const qualityChartRef = ref();
const energyChartRef = ref();
const equipmentChartRef = ref();
const anomalyChartRef = ref();

let productionChart: echarts.ECharts | null = null;
let efficiencyChart: echarts.ECharts | null = null;
let qualityChart: echarts.ECharts | null = null;
let energyChart: echarts.ECharts | null = null;
let equipmentChart: echarts.ECharts | null = null;
let anomalyChart: echarts.ECharts | null = null;

// 生命周期
onMounted(() => {
  // 设置默认时间范围为最近30天
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  filterParams.dateRange = [startDate, endDate];
  
  loadProjectList();
  loadAnalyticsData();
});

// 方法
const loadProjectList = async () => {
  // TODO: 从项目管理API获取项目列表
  projectList.value = [
    { id: '1', projectName: '项目A' },
    { id: '2', projectName: '项目B' },
    { id: '3', projectName: '项目C' }
  ];
};

const loadAnalyticsData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadKPIData(),
      initCharts(),
      loadTableData()
    ]);
  } catch (error) {
    console.error('加载分析数据失败:', error);
    ElMessage.error('加载分析数据失败');
  } finally {
    loading.value = false;
  }
};

const loadKPIData = async () => {
  try {
    const { data } = await getAnalyticsKPI(filterParams);
    kpiData.value = data;
  } catch (error) {
    console.error('加载KPI数据失败:', error);
  }
};

const initCharts = async () => {
  await nextTick();
  
  if (productionChartRef.value) {
    productionChart = echarts.init(productionChartRef.value);
    updateProductionChart();
  }
  
  if (efficiencyChartRef.value) {
    efficiencyChart = echarts.init(efficiencyChartRef.value);
    updateEfficiencyChart();
  }
  
  if (qualityChartRef.value) {
    qualityChart = echarts.init(qualityChartRef.value);
    updateQualityChart();
  }
  
  if (energyChartRef.value) {
    energyChart = echarts.init(energyChartRef.value);
    updateEnergyChart();
  }
  
  if (equipmentChartRef.value) {
    equipmentChart = echarts.init(equipmentChartRef.value);
    updateEquipmentChart();
  }
  
  if (anomalyChartRef.value) {
    anomalyChart = echarts.init(anomalyChartRef.value);
    updateAnomalyChart();
  }
};

const updateProductionChart = async () => {
  if (!productionChart) return;
  
  try {
    const { data } = await getProductionTrend({ ...filterParams, type: productionChartType.value });
    
    const option = {
      title: {
        text: '生产趋势',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['产量', '目标产量'],
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: data.map((item: any) => item.date)
      },
      yAxis: {
        type: 'value',
        name: '产量(吨)'
      },
      series: [
        {
          name: '产量',
          type: 'line',
          data: data.map((item: any) => item.actual),
          smooth: true,
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '目标产量',
          type: 'line',
          data: data.map((item: any) => item.target),
          smooth: true,
          itemStyle: { color: '#67C23A' },
          lineStyle: { type: 'dashed' }
        }
      ]
    };
    
    productionChart.setOption(option);
  } catch (error) {
    console.error('更新生产趋势图失败:', error);
  }
};

const updateEfficiencyChart = async () => {
  if (!efficiencyChart) return;
  
  try {
    const { data } = await getEfficiencyAnalysis({ ...filterParams, type: efficiencyChartType.value });
    
    const option = {
      title: {
        text: '工艺效率',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: data.map((item: any) => item.date)
      },
      yAxis: {
        type: 'value',
        name: '效率(%)',
        max: 100
      },
      series: [
        {
          name: '效率',
          type: 'bar',
          data: data.map((item: any) => item.efficiency),
          itemStyle: { color: '#E6A23C' }
        }
      ]
    };
    
    efficiencyChart.setOption(option);
  } catch (error) {
    console.error('更新效率图失败:', error);
  }
};

const updateQualityChart = async () => {
  if (!qualityChart) return;
  
  try {
    const { data } = await getQualityDistribution(filterParams);
    
    const option = {
      title: {
        text: '质量分布',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '质量分布',
          type: 'pie',
          radius: '50%',
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    
    qualityChart.setOption(option);
  } catch (error) {
    console.error('更新质量分布图失败:', error);
  }
};

const updateEnergyChart = async () => {
  if (!energyChart) return;
  
  try {
    const { data } = await getEnergyAnalysis({ ...filterParams, type: energyChartType.value });
    
    const option = {
      title: {
        text: '能耗分析',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: data.map((item: any) => item.date)
      },
      yAxis: {
        type: 'value',
        name: energyChartType.value === 'total' ? '能耗(kWh)' : 
              energyChartType.value === 'unit' ? '单位能耗(kWh/吨)' : '能效比(%)'
      },
      series: [
        {
          name: '能耗',
          type: 'line',
          data: data.map((item: any) => item.value),
          smooth: true,
          itemStyle: { color: '#F56C6C' }
        }
      ]
    };
    
    energyChart.setOption(option);
  } catch (error) {
    console.error('更新能耗图失败:', error);
  }
};

const updateEquipmentChart = async () => {
  if (!equipmentChart) return;
  
  try {
    const { data } = await getEquipmentUtilization(filterParams);
    
    const option = {
      title: {
        text: '设备利用率',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'value',
        max: 100
      },
      yAxis: {
        type: 'category',
        data: data.map((item: any) => item.equipmentName)
      },
      series: [
        {
          name: '利用率',
          type: 'bar',
          data: data.map((item: any) => item.utilization),
          itemStyle: { color: '#909399' }
        }
      ]
    };
    
    equipmentChart.setOption(option);
  } catch (error) {
    console.error('更新设备利用率图失败:', error);
  }
};

const updateAnomalyChart = async () => {
  if (!anomalyChart) return;
  
  try {
    const { data } = await getAnomalyAnalysis(filterParams);
    
    const option = {
      title: {
        text: '异常分析',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['温度异常', '压力异常', '设备异常', '质量异常'],
        bottom: 0
      },
      xAxis: {
        type: 'category',
        data: data.map((item: any) => item.date)
      },
      yAxis: {
        type: 'value',
        name: '异常次数'
      },
      series: [
        {
          name: '温度异常',
          type: 'bar',
          stack: 'total',
          data: data.map((item: any) => item.temperature),
          itemStyle: { color: '#F56C6C' }
        },
        {
          name: '压力异常',
          type: 'bar',
          stack: 'total',
          data: data.map((item: any) => item.pressure),
          itemStyle: { color: '#E6A23C' }
        },
        {
          name: '设备异常',
          type: 'bar',
          stack: 'total',
          data: data.map((item: any) => item.equipment),
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '质量异常',
          type: 'bar',
          stack: 'total',
          data: data.map((item: any) => item.quality),
          itemStyle: { color: '#909399' }
        }
      ]
    };
    
    anomalyChart.setOption(option);
  } catch (error) {
    console.error('更新异常分析图失败:', error);
  }
};

const loadTableData = async () => {
  try {
    switch (activeDataTab.value) {
      case 'production':
        const productionRes = await getProductionData(filterParams);
        productionData.value = productionRes.data;
        break;
      case 'quality':
        const qualityRes = await getQualityData(filterParams);
        qualityData.value = qualityRes.data;
        break;
      case 'energy':
        const energyRes = await getEnergyData(filterParams);
        energyData.value = energyRes.data;
        break;
      case 'anomaly':
        const anomalyRes = await getAnomalyData(filterParams);
        anomalyData.value = anomalyRes.data;
        break;
    }
  } catch (error) {
    console.error('加载表格数据失败:', error);
  }
};

const handleDateChange = () => {
  loadAnalyticsData();
};

const resetFilter = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  filterParams.dateRange = [startDate, endDate];
  filterParams.projectId = '';
  filterParams.processType = '';
  loadAnalyticsData();
};

const handleExport = async () => {
  try {
    await exportAnalyticsReport(filterParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const getTrendClass = (trend: number): string => {
  if (trend > 0) return 'trend-up';
  if (trend < 0) return 'trend-down';
  return 'trend-stable';
};
</script>

<style scoped lang="scss">
.analytics-dashboard {
  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }

  .kpi-section {
    margin-bottom: 20px;

    .kpi-card {
      .kpi-item {
        display: flex;
        align-items: center;
        padding: 20px;

        .kpi-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.production {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.efficiency {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.quality {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.energy {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .kpi-content {
          flex: 1;

          .kpi-value {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            line-height: 1;
            margin-bottom: 8px;
          }

          .kpi-label {
            font-size: 14px;
            color: #8492a6;
            margin-bottom: 4px;
          }

          .kpi-trend {
            font-size: 12px;
            display: flex;
            align-items: center;

            &.trend-up {
              color: #67c23a;
            }

            &.trend-down {
              color: #f56c6c;
            }

            &.trend-stable {
              color: #909399;
            }
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-card {
      margin-bottom: 20px;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        height: 300px;
      }
    }
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
