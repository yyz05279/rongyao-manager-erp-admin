<template>
  <div class="saltmaking-ratio-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/saltmaking' }">化盐工艺</el-breadcrumb-item>
        <el-breadcrumb-item>配比控制</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">配比控制</h1>
        <div class="actions">
          <el-button @click="handleBack">返回</el-button>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading">
      <!-- 任务信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span>任务信息</span>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="任务编号">{{ taskData.taskCode }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ taskData.taskName }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ taskData.projectName }}</el-descriptions-item>
          <el-descriptions-item label="目标产量">{{ taskData.targetOutput }}kg</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTag(taskData.status)">
              {{ getStatusText(taskData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作员">{{ taskData.operatorName }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 配比控制 -->
      <el-card class="control-card" shadow="never">
        <template #header>
          <span>配比控制</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="ratio-control">
              <h3>NaNO3 配比控制</h3>
              <div class="control-item">
                <label>目标配比:</label>
                <span class="value">{{ ratioData.nano3TargetRatio }}%</span>
              </div>
              <div class="control-item">
                <label>当前配比:</label>
                <span class="value" :class="getDeviationClass(ratioData.nano3CurrentRatio - ratioData.nano3TargetRatio)">
                  {{ ratioData.nano3CurrentRatio }}%
                </span>
              </div>
              <div class="control-item">
                <label>调整配比:</label>
                <el-input-number
                  v-model="ratioData.nano3AdjustRatio"
                  :min="0"
                  :max="100"
                  :precision="2"
                  :step="0.1"
                  style="width: 150px"
                />
                <el-button type="primary" size="small" @click="adjustNano3Ratio" style="margin-left: 10px">
                  调整
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="ratio-control">
              <h3>KNO3 配比控制</h3>
              <div class="control-item">
                <label>目标配比:</label>
                <span class="value">{{ ratioData.kno3TargetRatio }}%</span>
              </div>
              <div class="control-item">
                <label>当前配比:</label>
                <span class="value" :class="getDeviationClass(ratioData.kno3CurrentRatio - ratioData.kno3TargetRatio)">
                  {{ ratioData.kno3CurrentRatio }}%
                </span>
              </div>
              <div class="control-item">
                <label>调整配比:</label>
                <el-input-number
                  v-model="ratioData.kno3AdjustRatio"
                  :min="0"
                  :max="100"
                  :precision="2"
                  :step="0.1"
                  style="width: 150px"
                />
                <el-button type="primary" size="small" @click="adjustKno3Ratio" style="margin-left: 10px">
                  调整
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 配比趋势图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span>配比趋势图</span>
        </template>
        <div ref="ratioChartRef" style="height: 400px;"></div>
      </el-card>

      <!-- 操作记录 -->
      <el-card class="record-card" shadow="never">
        <template #header>
          <span>操作记录</span>
        </template>
        <el-table :data="operationRecords" stripe border>
          <el-table-column label="操作时间" prop="operationTime" width="180" />
          <el-table-column label="操作类型" prop="operationType" width="120" />
          <el-table-column label="调整前配比" prop="beforeRatio" width="150" />
          <el-table-column label="调整后配比" prop="afterRatio" width="150" />
          <el-table-column label="偏差" prop="deviation" width="100">
            <template #default="scope">
              <span :class="getDeviationClass(scope.row.deviation)">
                {{ scope.row.deviation }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作员" prop="operatorName" width="100" />
          <el-table-column label="备注" prop="remarks" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup name="SaltmakingRatio" lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as echarts from 'echarts';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const taskData = ref({
  taskCode: '',
  taskName: '',
  projectName: '',
  targetOutput: 0,
  status: 1,
  operatorName: ''
});

const ratioData = ref({
  nano3TargetRatio: 60.0,
  nano3CurrentRatio: 60.2,
  nano3AdjustRatio: 60.0,
  kno3TargetRatio: 40.0,
  kno3CurrentRatio: 39.8,
  kno3AdjustRatio: 40.0
});

const operationRecords = ref([]);

// 图表引用
const ratioChartRef = ref();

// 生命周期
onMounted(() => {
  const taskId = route.params.id as string;
  if (taskId) {
    loadTaskData(taskId);
    loadOperationRecords(taskId);
  }
  
  nextTick(() => {
    initRatioChart();
  });
});

// 方法
const loadTaskData = async (taskId: string) => {
  loading.value = true;
  try {
    // TODO: 调用API获取任务数据
    // 模拟数据
    taskData.value = {
      taskCode: 'SM20241201001',
      taskName: '二元化盐制备任务',
      projectName: '项目A',
      targetOutput: 2500,
      status: 2,
      operatorName: '张三'
    };
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const loadOperationRecords = async (taskId: string) => {
  try {
    // TODO: 调用API获取操作记录
    // 模拟数据
    operationRecords.value = [
      {
        operationTime: '2024-12-01 10:30:00',
        operationType: 'NaNO3调整',
        beforeRatio: '60.0%',
        afterRatio: '60.2%',
        deviation: 0.2,
        operatorName: '张三',
        remarks: '微调配比'
      }
    ];
  } catch (error) {
    console.error('加载操作记录失败:', error);
  }
};

const initRatioChart = () => {
  const chart = echarts.init(ratioChartRef.value);
  
  // 模拟趋势数据
  const timeData = [];
  const nano3Data = [];
  const kno3Data = [];
  
  for (let i = 0; i < 24; i++) {
    timeData.push(`${i}:00`);
    nano3Data.push(60 + Math.sin(i * 0.5) * 0.5 + Math.random() * 0.2 - 0.1);
    kno3Data.push(40 + Math.cos(i * 0.5) * 0.5 + Math.random() * 0.2 - 0.1);
  }

  const option = {
    title: {
      text: '配比趋势图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['NaNO3配比', 'KNO3配比'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: timeData,
      name: '时间'
    },
    yAxis: {
      type: 'value',
      name: '配比(%)',
      min: 35,
      max: 65
    },
    series: [
      {
        name: 'NaNO3配比',
        type: 'line',
        data: nano3Data,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: 'KNO3配比',
        type: 'line',
        data: kno3Data,
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }
    ]
  };

  chart.setOption(option);
};

const adjustNano3Ratio = async () => {
  try {
    // TODO: 调用API调整NaNO3配比
    ElMessage.success('NaNO3配比调整成功');
    ratioData.value.nano3CurrentRatio = ratioData.value.nano3AdjustRatio;
  } catch (error) {
    ElMessage.error('配比调整失败');
  }
};

const adjustKno3Ratio = async () => {
  try {
    // TODO: 调用API调整KNO3配比
    ElMessage.success('KNO3配比调整成功');
    ratioData.value.kno3CurrentRatio = ratioData.value.kno3AdjustRatio;
  } catch (error) {
    ElMessage.error('配比调整失败');
  }
};

const handleBack = () => {
  router.back();
};

const handleSave = async () => {
  try {
    // TODO: 保存配置
    ElMessage.success('配置保存成功');
  } catch (error) {
    ElMessage.error('配置保存失败');
  }
};

const getStatusTag = (status: number) => {
  const tagMap = { 1: 'info', 2: 'primary', 3: 'success', 4: 'danger' };
  return tagMap[status] || 'info';
};

const getStatusText = (status: number) => {
  const textMap = { 1: '待开始', 2: '进行中', 3: '已完成', 4: '异常' };
  return textMap[status] || '未知';
};

const getDeviationClass = (deviation: number) => {
  if (Math.abs(deviation) <= 0.5) return 'text-success';
  if (Math.abs(deviation) <= 1.0) return 'text-warning';
  return 'text-danger';
};
</script>

<style scoped lang="scss">
.saltmaking-ratio-container {
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
  .control-card,
  .chart-card,
  .record-card {
    margin-bottom: 20px;
  }

  .ratio-control {
    h3 {
      margin-bottom: 16px;
      color: #2c3e50;
    }

    .control-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      label {
        width: 80px;
        font-weight: 500;
      }

      .value {
        margin-right: 20px;
        font-weight: 600;
      }
    }
  }

  .text-success {
    color: #67c23a;
  }

  .text-warning {
    color: #e6a23c;
  }

  .text-danger {
    color: #f56c6c;
  }
}
</style>
