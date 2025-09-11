<template>
  <div class="preheating-record-detail">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records' }">化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records/preheating' }">预热记录</el-breadcrumb-item>
        <el-breadcrumb-item>记录详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">预热记录详情</h1>
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
          <el-descriptions-item label="任务ID">{{ recordData.taskId }}</el-descriptions-item>
          <el-descriptions-item label="项目ID">{{ recordData.projectId }}</el-descriptions-item>
          <el-descriptions-item label="熔盐罐编号">{{ recordData.tankNumber }}</el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ recordData.recordDate }}</el-descriptions-item>
          <el-descriptions-item label="记录时间">{{ recordData.recordTime }}</el-descriptions-item>
          <el-descriptions-item label="班次">
            <el-tag :type="recordData.shift === 1 ? 'primary' : 'warning'">
              {{ recordData.shift === 1 ? '白班' : '夜班' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作员">{{ recordData.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(recordData.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 工艺参数 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>工艺参数</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="目标温度">{{ recordData.targetTemperature }}°C</el-descriptions-item>
          <el-descriptions-item label="实际温度">{{ recordData.actualTemperature }}°C</el-descriptions-item>
          <el-descriptions-item label="目标压力">{{ recordData.targetPressure }}MPa</el-descriptions-item>
          <el-descriptions-item label="实际压力">{{ recordData.actualPressure }}MPa</el-descriptions-item>
          <el-descriptions-item label="预热时间">{{ recordData.preheatingDuration }}分钟</el-descriptions-item>
          <el-descriptions-item label="升温速率">{{ recordData.heatingRate }}°C/min</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 设备状态 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>设备状态</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备状态">
            <el-tag :type="getEquipmentStatusTag(recordData.equipmentStatus)">
              {{ getEquipmentStatusText(recordData.equipmentStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="加热功率">{{ recordData.heatingPower }}kW</el-descriptions-item>
          <el-descriptions-item label="循环泵状态">
            <el-tag :type="recordData.pumpStatus === 1 ? 'success' : 'danger'">
              {{ recordData.pumpStatus === 1 ? '运行' : '停止' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="安全阀状态">
            <el-tag :type="recordData.safetyValveStatus === 1 ? 'success' : 'warning'">
              {{ recordData.safetyValveStatus === 1 ? '正常' : '异常' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 质量信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>质量信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="质量状态">
            <el-tag :type="getQualityStatusTag(recordData.qualityStatus)">
              {{ getQualityStatusText(recordData.qualityStatus) }}
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

      <!-- 备注信息 -->
      <el-card class="info-card" shadow="never" v-if="recordData.remarks">
        <template #header>
          <span>备注信息</span>
        </template>
        <p class="remarks-content">{{ recordData.remarks }}</p>
      </el-card>

      <!-- 温度曲线图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span>温度变化曲线</span>
        </template>
        <div ref="temperatureChartRef" style="height: 300px;"></div>
      </el-card>

      <!-- 压力曲线图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span>压力变化曲线</span>
        </template>
        <div ref="pressureChartRef" style="height: 300px;"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="PreheatingRecordDetail" lang="ts">
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
  taskId: null,
  projectId: null,
  tankNumber: '',
  recordDate: '',
  recordTime: '',
  shift: 1,
  targetTemperature: 0,
  actualTemperature: 0,
  targetPressure: 0,
  actualPressure: 0,
  preheatingDuration: 0,
  heatingRate: 0,
  equipmentStatus: 1,
  heatingPower: 0,
  pumpStatus: 1,
  safetyValveStatus: 1,
  qualityStatus: 1,
  qualityCheckResult: 1,
  qualityIssues: '',
  correctiveActions: '',
  operatorName: '',
  remarks: '',
  createTime: ''
});

// 图表引用
const temperatureChartRef = ref();
const pressureChartRef = ref();

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
      recordCode: 'PH20241201001',
      taskId: 1001,
      projectId: 101,
      tankNumber: 'T001',
      recordDate: '2024-12-01',
      recordTime: '14:30:00',
      shift: 1,
      targetTemperature: 350,
      actualTemperature: 348,
      targetPressure: 2.5,
      actualPressure: 2.4,
      preheatingDuration: 120,
      heatingRate: 2.5,
      equipmentStatus: 1,
      heatingPower: 150,
      pumpStatus: 1,
      safetyValveStatus: 1,
      qualityStatus: 1,
      qualityCheckResult: 1,
      qualityIssues: '',
      correctiveActions: '',
      operatorName: '张三',
      remarks: '预热过程正常，无异常情况',
      createTime: '2024-12-01 14:30:00'
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
  initTemperatureChart();
  initPressureChart();
};

const initTemperatureChart = () => {
  const chart = echarts.init(temperatureChartRef.value);
  
  // 模拟温度数据
  const timeData = [];
  const temperatureData = [];
  const targetData = [];
  
  for (let i = 0; i <= 120; i += 5) {
    timeData.push(i);
    temperatureData.push(20 + (recordData.value.actualTemperature - 20) * (i / 120) + Math.random() * 5 - 2.5);
    targetData.push(20 + (recordData.value.targetTemperature - 20) * (i / 120));
  }

  const option = {
    title: {
      text: '温度变化曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['实际温度', '目标温度'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: timeData,
      name: '时间(分钟)'
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)'
    },
    series: [
      {
        name: '实际温度',
        type: 'line',
        data: temperatureData,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '目标温度',
        type: 'line',
        data: targetData,
        smooth: true,
        itemStyle: { color: '#67C23A' },
        lineStyle: { type: 'dashed' }
      }
    ]
  };

  chart.setOption(option);
};

const initPressureChart = () => {
  const chart = echarts.init(pressureChartRef.value);
  
  // 模拟压力数据
  const timeData = [];
  const pressureData = [];
  const targetData = [];
  
  for (let i = 0; i <= 120; i += 5) {
    timeData.push(i);
    pressureData.push(0.1 + (recordData.value.actualPressure - 0.1) * (i / 120) + Math.random() * 0.1 - 0.05);
    targetData.push(0.1 + (recordData.value.targetPressure - 0.1) * (i / 120));
  }

  const option = {
    title: {
      text: '压力变化曲线',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['实际压力', '目标压力'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: timeData,
      name: '时间(分钟)'
    },
    yAxis: {
      type: 'value',
      name: '压力(MPa)'
    },
    series: [
      {
        name: '实际压力',
        type: 'line',
        data: pressureData,
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      },
      {
        name: '目标压力',
        type: 'line',
        data: targetData,
        smooth: true,
        itemStyle: { color: '#F56C6C' },
        lineStyle: { type: 'dashed' }
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

const getEquipmentStatusTag = (status: number) => {
  const tagMap = { 1: 'success', 2: 'warning', 3: 'danger' };
  return tagMap[status] || 'info';
};

const getEquipmentStatusText = (status: number) => {
  const textMap = { 1: '正常', 2: '维护', 3: '故障' };
  return textMap[status] || '未知';
};

const getQualityStatusTag = (status: number) => {
  const tagMap = { 1: 'success', 2: 'danger', 3: 'warning' };
  return tagMap[status] || 'info';
};

const getQualityStatusText = (status: number) => {
  const textMap = { 1: '正常', 2: '异常', 3: '待检查' };
  return textMap[status] || '未知';
};
</script>

<style scoped lang="scss">
.preheating-record-detail {
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
}
</style>
