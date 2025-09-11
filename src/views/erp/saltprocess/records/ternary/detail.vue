<template>
  <div class="ternary-record-detail">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records' }">化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records/ternary' }">三元化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item>记录详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">三元化盐记录详情</h1>
        <div class="actions">
          <el-button @click="handleBack">返回</el-button>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>基本信息</span>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="记录编码">{{ recordData.recordCode }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ recordData.batchNumber }}</el-descriptions-item>
          <el-descriptions-item label="项目ID">{{ recordData.projectId }}</el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ recordData.recordDate }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ recordData.startTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ recordData.endTime }}</el-descriptions-item>
          <el-descriptions-item label="持续时间">{{ recordData.duration }}分钟</el-descriptions-item>
          <el-descriptions-item label="班次">
            <el-tag :type="recordData.shift === 1 ? 'primary' : 'warning'">
              {{ recordData.shift === 1 ? '白班' : '夜班' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作员">{{ recordData.operatorName }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 三元配比信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>三元配比信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-descriptions :column="1" border title="NaNO3">
              <el-descriptions-item label="目标配比">{{ recordData.nano3TargetRatio }}%</el-descriptions-item>
              <el-descriptions-item label="实际配比">
                <span :class="getDeviationClass(recordData.nano3ActualRatio - recordData.nano3TargetRatio)">
                  {{ recordData.nano3ActualRatio }}%
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="目标用量">{{ recordData.nano3TargetWeight }}kg</el-descriptions-item>
              <el-descriptions-item label="实际用量">{{ recordData.nano3ActualWeight }}kg</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8">
            <el-descriptions :column="1" border title="KNO3">
              <el-descriptions-item label="目标配比">{{ recordData.kno3TargetRatio }}%</el-descriptions-item>
              <el-descriptions-item label="实际配比">
                <span :class="getDeviationClass(recordData.kno3ActualRatio - recordData.kno3TargetRatio)">
                  {{ recordData.kno3ActualRatio }}%
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="目标用量">{{ recordData.kno3TargetWeight }}kg</el-descriptions-item>
              <el-descriptions-item label="实际用量">{{ recordData.kno3ActualWeight }}kg</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="8">
            <el-descriptions :column="1" border title="NaNO2">
              <el-descriptions-item label="目标配比">{{ recordData.nano2TargetRatio }}%</el-descriptions-item>
              <el-descriptions-item label="实际配比">
                <span :class="getDeviationClass(recordData.nano2ActualRatio - recordData.nano2TargetRatio)">
                  {{ recordData.nano2ActualRatio }}%
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="目标用量">{{ recordData.nano2TargetWeight }}kg</el-descriptions-item>
              <el-descriptions-item label="实际用量">{{ recordData.nano2ActualWeight }}kg</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>
        <el-descriptions :column="2" border style="margin-top: 16px;">
          <el-descriptions-item label="配比偏差">
            <span :class="getDeviationClass(recordData.ratioDeviation)">
              {{ recordData.ratioDeviation }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="总重量">{{ recordData.totalWeight }}kg</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 稳定性信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>稳定性信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="稳定性指数">
            <span :class="getStabilityClass(recordData.stabilityIndex)">
              {{ recordData.stabilityIndex }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="稳定性等级">
            <el-tag :type="getStabilityTag(recordData.stabilityIndex)">
              {{ getStabilityText(recordData.stabilityIndex) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="热稳定性">{{ recordData.thermalStability }}°C</el-descriptions-item>
          <el-descriptions-item label="化学稳定性">{{ recordData.chemicalStability }}天</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 工艺参数 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>工艺参数</span>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="反应温度">{{ recordData.reactionTemperature }}°C</el-descriptions-item>
          <el-descriptions-item label="反应时间">{{ recordData.reactionTime }}分钟</el-descriptions-item>
          <el-descriptions-item label="搅拌速度">{{ recordData.stirringSpeed }}rpm</el-descriptions-item>
          <el-descriptions-item label="加热功率">{{ recordData.heatingPower }}kW</el-descriptions-item>
          <el-descriptions-item label="pH值">{{ recordData.phValue }}</el-descriptions-item>
          <el-descriptions-item label="密度">{{ recordData.density }}g/cm³</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 质量信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>质量信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="含水率">{{ recordData.moistureContent }}%</el-descriptions-item>
          <el-descriptions-item label="纯度">{{ recordData.purity }}%</el-descriptions-item>
          <el-descriptions-item label="质量等级">
            <el-tag :type="getQualityGradeTag(recordData.qualityGrade)">
              {{ getQualityGradeText(recordData.qualityGrade) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="质量检查结果">
            <el-tag :type="recordData.qualityCheckResult === 1 ? 'success' : 'danger'">
              {{ recordData.qualityCheckResult === 1 ? '合格' : '不合格' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="质量问题" :span="2">
            {{ recordData.qualityIssues || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="纠正措施" :span="2">
            {{ recordData.correctiveActions || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 产量信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>产量信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="目标产量">{{ recordData.targetOutput }}kg</el-descriptions-item>
          <el-descriptions-item label="实际产量">{{ recordData.actualOutput }}kg</el-descriptions-item>
          <el-descriptions-item label="产出率">
            <span :class="getYieldRateClass(recordData.yieldRate)">
              {{ recordData.yieldRate }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="产量差异">
            {{ (recordData.actualOutput - recordData.targetOutput).toFixed(1) }}kg
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 成本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>成本信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="原料成本">¥{{ recordData.materialCost }}</el-descriptions-item>
          <el-descriptions-item label="能源成本">¥{{ recordData.energyCost }}</el-descriptions-item>
          <el-descriptions-item label="人工成本">¥{{ recordData.laborCost }}</el-descriptions-item>
          <el-descriptions-item label="总成本">¥{{ recordData.totalCost }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 备注信息 -->
      <el-card class="info-card" shadow="never" v-if="recordData.remarks">
        <template #header>
          <span>备注信息</span>
        </template>
        <p class="remarks-content">{{ recordData.remarks }}</p>
      </el-card>

      <!-- 三元配比图表 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span>三元配比对比图</span>
        </template>
        <div ref="ratioChartRef" style="height: 300px;"></div>
      </el-card>

      <!-- 稳定性趋势图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span>稳定性趋势图</span>
        </template>
        <div ref="stabilityChartRef" style="height: 300px;"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="TernaryRecordDetail" lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parseTime } from '@/utils/ruoyi';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const recordData = ref({
  recordCode: '',
  batchNumber: '',
  projectId: null,
  recordDate: '',
  startTime: '',
  endTime: '',
  duration: 0,
  shift: 1,
  nano3TargetRatio: 0,
  nano3ActualRatio: 0,
  nano3TargetWeight: 0,
  nano3ActualWeight: 0,
  kno3TargetRatio: 0,
  kno3ActualRatio: 0,
  kno3TargetWeight: 0,
  kno3ActualWeight: 0,
  nano2TargetRatio: 0,
  nano2ActualRatio: 0,
  nano2TargetWeight: 0,
  nano2ActualWeight: 0,
  ratioDeviation: 0,
  totalWeight: 0,
  stabilityIndex: 0,
  thermalStability: 0,
  chemicalStability: 0,
  reactionTemperature: 0,
  reactionTime: 0,
  stirringSpeed: 0,
  heatingPower: 0,
  phValue: 0,
  density: 0,
  moistureContent: 0,
  purity: 0,
  targetOutput: 0,
  actualOutput: 0,
  yieldRate: 0,
  qualityGrade: 1,
  qualityCheckResult: 1,
  qualityIssues: '',
  correctiveActions: '',
  materialCost: 0,
  energyCost: 0,
  laborCost: 0,
  totalCost: 0,
  operatorName: '',
  remarks: '',
  createTime: ''
});

// 图表引用
const ratioChartRef = ref();
const stabilityChartRef = ref();

// 生命周期
onMounted(() => {
  const recordId = route.params.id as string;
  if (recordId) {
    loadRecordData(recordId);
  }
});

// 方法
const loadRecordData = async (recordId: string) => {
  loading.value = true;
  try {
    // TODO: 调用API获取记录详情
    // 模拟数据
    recordData.value = {
      recordCode: 'TM20241201001',
      batchNumber: 'T20241201001',
      projectId: 201,
      recordDate: '2024-12-01',
      startTime: '08:00:00',
      endTime: '16:30:00',
      duration: 510,
      shift: 1,
      nano3TargetRatio: 50.0,
      nano3ActualRatio: 50.5,
      nano3TargetWeight: 1000,
      nano3ActualWeight: 1010,
      kno3TargetRatio: 35.0,
      kno3ActualRatio: 35.2,
      kno3TargetWeight: 700,
      kno3ActualWeight: 704,
      nano2TargetRatio: 15.0,
      nano2ActualRatio: 14.3,
      nano2TargetWeight: 300,
      nano2ActualWeight: 286,
      ratioDeviation: 0.3,
      totalWeight: 2000,
      stabilityIndex: 8.5,
      thermalStability: 450,
      chemicalStability: 365,
      reactionTemperature: 340,
      reactionTime: 240,
      stirringSpeed: 100,
      heatingPower: 180,
      phValue: 7.5,
      density: 2.3,
      moistureContent: 0.3,
      purity: 99.5,
      targetOutput: 1900,
      actualOutput: 1850,
      yieldRate: 97.4,
      qualityGrade: 1,
      qualityCheckResult: 1,
      qualityIssues: '',
      correctiveActions: '',
      materialCost: 12000,
      energyCost: 1800,
      laborCost: 1200,
      totalCost: 15000,
      operatorName: '王五',
      remarks: '三元化盐制备过程稳定，稳定性指数达到优秀水平',
      createTime: '2024-12-01 08:00:00'
    };

    // 加载图表
    await nextTick();
    initCharts();
  } catch (error) {
    console.error('加载记录详情失败:', error);
    ElMessage.error('加载记录详情失败');
  } finally {
    loading.value = false;
  }
};

const initCharts = () => {
  initRatioChart();
  initStabilityChart();
};

const initRatioChart = () => {
  const chart = echarts.init(ratioChartRef.value);
  
  const option = {
    title: {
      text: '三元配比对比图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['目标配比', '实际配比'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: ['NaNO3', 'KNO3', 'NaNO2']
    },
    yAxis: {
      type: 'value',
      name: '配比(%)',
      min: 0,
      max: 60
    },
    series: [
      {
        name: '目标配比',
        type: 'bar',
        data: [recordData.value.nano3TargetRatio, recordData.value.kno3TargetRatio, recordData.value.nano2TargetRatio],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '实际配比',
        type: 'bar',
        data: [recordData.value.nano3ActualRatio, recordData.value.kno3ActualRatio, recordData.value.nano2ActualRatio],
        itemStyle: { color: '#67C23A' }
      }
    ]
  };

  chart.setOption(option);
};

const initStabilityChart = () => {
  const chart = echarts.init(stabilityChartRef.value);
  
  // 模拟稳定性趋势数据
  const timeData = [];
  const stabilityData = [];
  
  for (let i = 0; i <= 24; i++) {
    timeData.push(i);
    stabilityData.push(recordData.value.stabilityIndex + Math.sin(i * 0.5) * 0.3 + Math.random() * 0.2 - 0.1);
  }

  const option = {
    title: {
      text: '稳定性趋势图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: timeData,
      name: '时间(小时)'
    },
    yAxis: {
      type: 'value',
      name: '稳定性指数',
      min: 6,
      max: 10
    },
    series: [
      {
        name: '稳定性指数',
        type: 'line',
        data: stabilityData,
        smooth: true,
        itemStyle: { color: '#E6A23C' },
        markLine: {
          data: [
            { yAxis: 8.0, name: '优秀线', lineStyle: { color: '#67C23A', type: 'dashed' } },
            { yAxis: 6.0, name: '合格线', lineStyle: { color: '#F56C6C', type: 'dashed' } }
          ]
        }
      }
    ]
  };

  chart.setOption(option);
};

const handleBack = () => {
  router.back();
};

const handleEdit = () => {
  // TODO: 实现编辑功能
  ElMessage.info('编辑功能开发中');
};

const getDeviationClass = (deviation: number) => {
  if (Math.abs(deviation) <= 0.5) return 'text-success';
  if (Math.abs(deviation) <= 1.0) return 'text-warning';
  return 'text-danger';
};

const getStabilityClass = (index: number) => {
  if (index >= 8.0) return 'text-success';
  if (index >= 6.0) return 'text-warning';
  return 'text-danger';
};

const getStabilityTag = (index: number) => {
  if (index >= 8.0) return 'success';
  if (index >= 6.0) return 'warning';
  return 'danger';
};

const getStabilityText = (index: number) => {
  if (index >= 8.0) return '优秀';
  if (index >= 6.0) return '良好';
  return '需改进';
};

const getYieldRateClass = (rate: number) => {
  if (rate >= 98) return 'text-success';
  if (rate >= 95) return 'text-warning';
  return 'text-danger';
};

const getQualityGradeTag = (grade: number) => {
  const tagMap = { 1: 'success', 2: 'primary', 3: 'warning', 4: 'danger' };
  return tagMap[grade] || 'info';
};

const getQualityGradeText = (grade: number) => {
  const textMap = { 1: '优秀', 2: '良好', 3: '合格', 4: '不合格' };
  return textMap[grade] || '未知';
};
</script>

<style scoped lang="scss">
.ternary-record-detail {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;

      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }
    }
  }

  .info-card,
  .chart-card {
    margin-bottom: 20px;
  }

  .remarks-content {
    margin: 0;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 4px;
    line-height: 1.6;
  }

  .text-success {
    color: #67c23a;
    font-weight: 600;
  }

  .text-warning {
    color: #e6a23c;
    font-weight: 600;
  }

  .text-danger {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
