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
          <span class="card-title">📋 基本信息</span>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="记录编码">{{ recordData.recordCode }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">
            <div class="project-name">
              {{ getProjectName(recordData.projectId) }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="记录日期">{{ recordData.recordDate }}</el-descriptions-item>
          <el-descriptions-item label="班次">
            <el-tag :type="recordData.shift === 1 ? 'primary' : 'warning'">
              {{ recordData.shift === 1 ? '白班' : '夜班' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 化盐重量信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span class="card-title">⚗️ 化盐重量信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="硝酸钠(t)">
            <div class="weight-display">
              {{ formatWeight(recordData.nano3ActualWeight) }}吨
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="硝酸钾(t)">
            <div class="weight-display">
              {{ formatWeight(recordData.kno3ActualWeight) }}吨
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="硝酸钠：硝酸钾">
            <div class="ratio-display">
              <span :class="getRatioClass(recordData)">
                {{ formatRatio(recordData.nano3ActualWeight, recordData.kno3ActualWeight) }}
              </span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="总计化盐(t)">
            <div class="total-weight-display">
              {{ formatWeight(recordData.totalSaltWeight || (recordData.nano3ActualWeight + recordData.kno3ActualWeight)) }}吨
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 工艺参数 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span class="card-title">🌡️ 工艺参数</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="熔盐液位(m)">{{ recordData.moltenSaltLevel || '-' }}</el-descriptions-item>
          <el-descriptions-item label="熔盐温度(℃)">{{ recordData.moltenSaltTemperature || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 能耗数据 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span class="card-title">⚡ 能耗数据</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="天然气耗量(Nm³)">{{ recordData.gasConsumption || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用电量(KWh)">{{ recordData.powerConsumption || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 人员信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <span class="card-title">👤 人员信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="人数">{{ recordData.staffCount || '-' }}</el-descriptions-item>
          <el-descriptions-item label="记录人">{{ recordData.recorderName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ recordData.remarks || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

    </div>

    <!-- 编辑表单对话框 -->
    <EditForm
      v-model:visible="editDialog.visible"
      :title="editDialog.title"
      :record-id="editDialog.recordId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup name="BinaryRecordDetail" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import EditForm from './components/EditForm.vue';
import { getBinaryRecord } from '@/api/erp/saltprocess/records/binary';

const route = useRoute();
const router = useRouter();

// 简化的记录数据类型
interface RecordData {
  recordCode: string;
  projectId: number;
  recordDate: string;
  shift: number;
  nano3ActualWeight: number;
  kno3ActualWeight: number;
  moltenSaltLevel?: number;
  moltenSaltTemperature?: number;
  gasConsumption?: number;
  powerConsumption?: number;
  staffCount?: number;
  recorderName?: string;
  remarks?: string;
  totalSaltWeight?: number; // 总计化盐量（后台计算的累积值）
}

// 响应式数据
const loading = ref(false);
const recordData = ref<RecordData>({
  recordCode: '',
  projectId: 101,
  recordDate: '',
  shift: 1,
  nano3ActualWeight: 0,
  kno3ActualWeight: 0,
  moltenSaltLevel: 0,
  moltenSaltTemperature: 0,
  gasConsumption: 0,
  powerConsumption: 0,
  staffCount: 0,
  recorderName: '',
  remarks: ''
});

// 编辑对话框状态
const editDialog = reactive({
  visible: false,
  title: '修改二元化盐记录',
  recordId: null as string | null
});

// 项目名称映射
const getProjectName = (projectId: number): string => {
  const projectMap: Record<number, string> = {
    101: '阿克塞化盐服务项目',
    102: '青海盐湖项目',
    103: '新疆化工项目'
  };
  return projectMap[projectId] || '未知项目';
};

// 重量格式化函数（kg转吨，保留2位小数）
const formatWeight = (weightInKg: number): string => {
  return (weightInKg / 1000).toFixed(2);
};

// 配比格式化函数
const formatRatio = (nano3Weight: number, kno3Weight: number): string => {
  // 处理undefined、null或NaN的情况
  const nano3 = Number(nano3Weight) || 0;
  const kno3 = Number(kno3Weight) || 0;

  if (nano3 === 0 && kno3 === 0) return '0.0:0.0';
  if (nano3 === 0) return `0.0:${(kno3 / 1000).toFixed(1)}`;
  if (kno3 === 0) return `${(nano3 / 1000).toFixed(1)}:0.0`;

  const total = nano3 + kno3;
  if (total === 0) return '0.0:0.0';

  // 计算百分比
  const nano3Percentage = (nano3 / total) * 100;
  const kno3Percentage = (kno3 / total) * 100;

  // 转换为6:4格式的比例（基于10的比例）
  const nano3Ratio = (nano3Percentage / 10).toFixed(1);
  const kno3Ratio = (kno3Percentage / 10).toFixed(1);

  return `${nano3Ratio}:${kno3Ratio}`;
};

// 移除前端累计计算逻辑，改为使用后台返回的totalSaltWeight字段

// 配比颜色类名函数
const getRatioClass = (record: RecordData): string => {
  // 处理undefined、null或NaN的情况
  const nano3Weight = Number(record.nano3ActualWeight) || 0;
  const kno3Weight = Number(record.kno3ActualWeight) || 0;

  const total = nano3Weight + kno3Weight;
  if (total === 0) return 'ratio-unknown';

  const nano3Ratio = nano3Weight / total;
  const deviation = Math.abs(nano3Ratio - 0.6); // 目标60%

  // 根据用户要求：满足6:4配比使用绿色，不满足使用红色
  if (deviation <= 0.02) return 'ratio-normal';      // 偏差≤2%认为满足6:4配比 → 绿色
  return 'ratio-danger';                              // 不满足6:4配比 → 红色
};

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
    console.log('=== 开始加载记录详情 ===');
    console.log('记录ID:', recordId);

    // 调用API获取记录详情
    const response = await getBinaryRecord(recordId);

    console.log('=== 详情API响应 ===');
    console.log('完整响应:', response);
    console.log('响应类型:', typeof response);

    if (response && response.code === 200) {
      // 由于响应拦截器返回了res.data，所以response就是原始数据
      const apiData = response.data;
      recordData.value = {
        recordCode: apiData.recordCode || '',
        projectId: apiData.projectId || 101,
        recordDate: apiData.recordDate || '',
        shift: apiData.shift || 1,
        nano3ActualWeight: apiData.nano3ActualWeight || 0,
        kno3ActualWeight: apiData.kno3ActualWeight || 0,
        // 映射API字段到详情页显示字段
        moltenSaltLevel: apiData.reactionTemperature || 0, // 使用反应温度作为熔盐液位的替代
        moltenSaltTemperature: apiData.reactionTemperature || 0, // 反应温度
        gasConsumption: apiData.energyCost || 0, // 使用能源成本作为气耗的替代
        powerConsumption: apiData.heatingPower || 0, // 加热功率
        staffCount: 1, // API中没有直接的人员数量字段，使用默认值
        recorderName: apiData.operatorName || '',
        remarks: apiData.qualityIssues || apiData.correctiveActions || ''
      };
      console.log('记录详情加载成功:', recordData.value);
    } else {
      const errorMsg = response?.msg || 'API调用失败';
      console.error('API返回错误:', errorMsg);
      ElMessage.error(`获取记录详情失败: ${errorMsg}`);

      // 如果API失败，使用默认数据避免页面崩溃
      recordData.value = {
        recordCode: '数据加载失败',
        projectId: 101,
        recordDate: '',
        shift: 1,
        nano3ActualWeight: 0,
        kno3ActualWeight: 0,
        moltenSaltLevel: 0,
        moltenSaltTemperature: 0,
        gasConsumption: 0,
        powerConsumption: 0,
        staffCount: 0,
        recorderName: '',
        remarks: ''
      };
    }
  } catch (error: any) {
    console.error('=== 加载记录详情失败 ===');
    console.error('错误详情:', error);
    ElMessage.error(`加载记录详情失败: ${error.message || '请检查网络连接'}`);

    // 错误时使用默认数据
    recordData.value = {
      recordCode: '数据加载失败',
      projectId: 101,
      recordDate: '',
      shift: 1,
      nano3ActualWeight: 0,
      kno3ActualWeight: 0,
      moltenSaltLevel: 0,
      moltenSaltTemperature: 0,
      gasConsumption: 0,
      powerConsumption: 0,
      staffCount: 0,
      recorderName: '',
      remarks: ''
    };
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.back();
};

const handleEdit = () => {
  editDialog.recordId = route.params.id as string;
  editDialog.visible = true;
};

const handleFormSuccess = () => {
  // 编辑成功后重新加载数据
  const recordId = route.params.id as string;
  if (recordId) {
    loadRecordData(recordId);
  }
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

  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .project-info {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .weight-display {
    font-weight: 600;
    font-size: 16px;
    color: #2c3e50;
  }

  .ratio-display {
    font-weight: 600;
    font-size: 16px;
  }

  .total-weight-display {
    font-weight: 600;
    font-size: 16px;
    color: #409eff;
  }

  // 配比颜色样式
  .ratio-normal {
    color: #67c23a; // 绿色 - 正常
  }

  .ratio-warning {
    color: #e6a23c; // 橙色 - 警告
  }

  .ratio-danger {
    color: #f56c6c; // 红色 - 危险
  }

  .ratio-unknown {
    color: #909399; // 灰色 - 未知
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
