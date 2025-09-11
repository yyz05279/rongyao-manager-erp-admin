<template>
  <div class="binary-record-detail">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records' }">化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records/binary' }">二元化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item>记录详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">二元化盐记录详情</h1>
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

      <!-- 配比信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>配比信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="NaNO3目标配比">{{ recordData.nano3TargetRatio }}%</el-descriptions-item>
              <el-descriptions-item label="NaNO3实际配比">
                <span :class="getDeviationClass(recordData.nano3ActualRatio - recordData.nano3TargetRatio)">
                  {{ recordData.nano3ActualRatio }}%
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="NaNO3目标用量">{{ recordData.nano3TargetWeight }}kg</el-descriptions-item>
              <el-descriptions-item label="NaNO3实际用量">{{ recordData.nano3ActualWeight }}kg</el-descriptions-item>
            </el-descriptions>
          </el-col>
          <el-col :span="12">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="KNO3目标配比">{{ recordData.kno3TargetRatio }}%</el-descriptions-item>
              <el-descriptions-item label="KNO3实际配比">
                <span :class="getDeviationClass(recordData.kno3ActualRatio - recordData.kno3TargetRatio)">
                  {{ recordData.kno3ActualRatio }}%
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="KNO3目标用量">{{ recordData.kno3TargetWeight }}kg</el-descriptions-item>
              <el-descriptions-item label="KNO3实际用量">{{ recordData.kno3ActualWeight }}kg</el-descriptions-item>
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

      <!-- 配比图表 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span>配比对比图</span>
        </template>
        <div ref="ratioChartRef" style="height: 300px;"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="BinaryRecordDetail" lang="ts">
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
  ratioDeviation: 0,
  totalWeight: 0,
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
      recordCode: 'BM20241201001',
      batchNumber: 'B20241201001',
      projectId: 101,
      recordDate: '2024-12-01',
      startTime: '09:00:00',
      endTime: '15:30:00',
      duration: 390,
      shift: 1,
      nano3TargetRatio: 60.0,
      nano3ActualRatio: 60.2,
      nano3TargetWeight: 1500,
      nano3ActualWeight: 1505,
      kno3TargetRatio: 40.0,
      kno3ActualRatio: 39.8,
      kno3TargetWeight: 1000,
      kno3ActualWeight: 995,
      ratioDeviation: 0.2,
      totalWeight: 2500,
      reactionTemperature: 320,
      reactionTime: 180,
      stirringSpeed: 120,
      heatingPower: 200,
      phValue: 7.2,
      density: 2.1,
      moistureContent: 0.5,
      purity: 99.2,
      targetOutput: 2500,
      actualOutput: 2450,
      yieldRate: 98.0,
      qualityGrade: 1,
      qualityCheckResult: 1,
      qualityIssues: '',
      correctiveActions: '',
      materialCost: 8500,
      energyCost: 1200,
      laborCost: 800,
      totalCost: 10500,
      operatorName: '张三',
      remarks: '二元化盐制备过程正常，产品质量优秀',
      createTime: '2024-12-01 09:00:00'
    };

    // 加载图表
    await nextTick();
    initRatioChart();
  } catch (error) {
    console.error('加载记录详情失败:', error);
    ElMessage.error('加载记录详情失败');
  } finally {
    loading.value = false;
  }
};

const initRatioChart = () => {
  const chart = echarts.init(ratioChartRef.value);
  
  const option = {
    title: {
      text: '配比对比图',
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
      data: ['NaNO3', 'KNO3']
    },
    yAxis: {
      type: 'value',
      name: '配比(%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '目标配比',
        type: 'bar',
        data: [recordData.value.nano3TargetRatio, recordData.value.kno3TargetRatio],
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '实际配比',
        type: 'bar',
        data: [recordData.value.nano3ActualRatio, recordData.value.kno3ActualRatio],
        itemStyle: { color: '#67C23A' }
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
.binary-record-detail {
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
