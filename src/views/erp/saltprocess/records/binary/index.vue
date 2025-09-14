<template>
  <div class="binary-record-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records' }">化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item>二元化盐记录</el-breadcrumb-item>
      </el-breadcrumb>
      <h1 class="page-title">二元化盐记录管理</h1>
    </div>

    <!-- 查询表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="记录编码" prop="recordCode">
          <el-input
            v-model="queryParams.recordCode"
            placeholder="请输入记录编码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="批次号" prop="batchNumber">
          <el-input
            v-model="queryParams.batchNumber"
            placeholder="请输入批次号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="项目ID" prop="projectId">
          <el-input
            v-model="queryParams.projectId"
            placeholder="请输入项目ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="记录日期" prop="recordDate">
          <el-date-picker
            v-model="queryParams.recordDate"
            type="date"
            placeholder="选择记录日期"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="配比状态" prop="ratioStatus">
          <el-select v-model="queryParams.ratioStatus" placeholder="请选择配比状态" clearable style="width: 150px">
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Upload" @click="handleAdd">导入化盐记录</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="info" plain icon="TrendCharts" @click="handleStatistics">统计分析</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="recordList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        stripe
        border
        height="600"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="记录编码" prop="recordCode" width="140" show-overflow-tooltip />
        <el-table-column label="项目ID" prop="projectId" width="80" align="center" />
        <el-table-column label="日期" prop="recordDate" width="120" />
        <el-table-column label="班次" prop="shift" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.shift === 1 ? 'primary' : 'warning'">
              {{ scope.row.shift === 1 ? '白班' : '夜班' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="硝酸钠(t)" prop="nano3ActualWeight" width="100">
          <template #default="scope">
            {{ formatWeight(scope.row.nano3ActualWeight) }}
          </template>
        </el-table-column>
        <el-table-column label="硝酸钾(t)" prop="kno3ActualWeight" width="100">
          <template #default="scope">
            {{ formatWeight(scope.row.kno3ActualWeight) }}
          </template>
        </el-table-column>
        <el-table-column label="硝酸钠：硝酸钾" width="130">
          <template #default="scope">
            <span :class="getRatioClass(scope.row)">
              {{ formatRatio(scope.row.nano3ActualWeight, scope.row.kno3ActualWeight) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="总计化盐(t)" width="110">
          <template #default="scope">
            {{ formatWeight(getTotalSaltWeight(scope.row)) }}
          </template>
        </el-table-column>
        <el-table-column label="熔盐液位(m)" prop="moltenSaltLevel" width="110">
          <template #default="scope">
            {{ scope.row.moltenSaltLevel || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="熔盐温度(℃)" prop="moltenSaltTemperature" width="110">
          <template #default="scope">
            {{ scope.row.moltenSaltTemperature || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="天然气耗量(Nm³)" prop="gasConsumption" width="130">
          <template #default="scope">
            {{ scope.row.gasConsumption || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="用电量(KWh)" prop="powerConsumption" width="120">
          <template #default="scope">
            {{ scope.row.powerConsumption || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="人数" prop="staffCount" width="80">
          <template #default="scope">
            {{ scope.row.staffCount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="记录人" prop="recorderName" width="100">
          <template #default="scope">
            {{ scope.row.recorderName || scope.row.operatorName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="scope">
            <div style="display: flex; gap: 8px; justify-content: flex-start;">
              <el-button type="primary" size="small" @click.stop="handleView(scope.row)">
                查看
              </el-button>
              <el-button type="success" size="small" @click.stop="handleUpdate(scope.row)">
                修改
              </el-button>
              <el-button type="danger" size="small" @click.stop="handleDelete(scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 编辑表单对话框 -->
    <EditForm
      v-model:visible="editDialog.visible"
      :title="editDialog.title"
      :record-id="editDialog.recordId"
      @success="handleFormSuccess"
    />

    <!-- 导入对话框 -->
    <ImportDialog
      v-model:visible="importDialog.visible"
      @success="handleImportSuccess"
    />

    <!-- 统计分析对话框 -->
    <el-dialog title="二元化盐统计分析" v-model="statisticsDialog.visible" width="1200px" append-to-body>
      <component
        :is="BinaryStatistics"
        v-if="statisticsDialog.visible && BinaryStatistics"
        @close="statisticsDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="BinaryRecord" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { parseTime } from '@/utils/ruoyi';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';

import EditForm from './components/EditForm.vue';
import ImportDialog from './components/ImportDialog.vue';
// API接口导入
import {
  listBinaryRecords,
  getBinaryRecord,
  addBinaryRecord,
  updateBinaryRecord,
  deleteBinaryRecord,
  exportBinaryRecords,
  getStatisticsData
} from '@/api/erp/saltprocess/records/binary';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const showSearch = ref(true);
const recordList = ref<any[]>([]);
const total = ref(0);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);

// 动态组件
const BinaryStatistics = ref<any>(null);

// 对话框
const editDialog = reactive({
  visible: false,
  title: '',
  recordId: null
});

const importDialog = reactive({
  visible: false
});

const statisticsDialog = reactive({
  visible: false
});

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  recordCode: '',
  batchNumber: '',
  projectId: undefined,
  recordDate: '',
  ratioStatus: undefined
});

// 表单引用
const queryFormRef = ref();
const recordFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    console.log('=== 开始调用二元记录API ===');
    console.log('请求参数:', queryParams);
    console.log('API URL:', '/erp/saltprocess/binary-record/list');

    // 调用API获取二元化盐记录列表
    const response = await listBinaryRecords(queryParams);

    console.log('=== API响应详情 ===');
    console.log('完整响应对象:', response);
    console.log('响应数据类型:', typeof response);

    // 由于响应拦截器返回了res.data，所以response就是原始数据
    console.log('response.code:', response.code);
    console.log('response.msg:', response.msg);
    console.log('response.rows:', response.rows);
    console.log('response.total:', response.total);

    if (response && response.code === 200) {
      recordList.value = response.rows || [];
      total.value = response.total || 0;
      console.log('数据设置成功 - 记录数量:', recordList.value.length, '总数:', total.value);
    } else {
      const errorMsg = response?.msg || 'API调用失败';
      console.error('API返回错误:', errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('=== 捕获到错误 ===');
    console.error('错误对象:', error);
    console.error('错误类型:', error?.constructor?.name);
    console.error('错误消息:', error?.message);
    console.error('错误堆栈:', error?.stack);

    if (error?.response) {
      console.error('HTTP响应错误:');
      console.error('- 状态码:', error.response.status);
      console.error('- 状态文本:', error.response.statusText);
      console.error('- 响应数据:', error.response.data);
      console.error('- 响应头:', error.response.headers);
    }

    ElMessage.error(`获取数据失败: ${error.message || '请检查API服务状态'}`);
    // 清空数据列表
    recordList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};



const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: any) => {
  handleView(row);
};

const handleAdd = () => {
  importDialog.visible = true;
};

const handleUpdate = (row?: any) => {
  const recordId = row?.id || ids.value[0];
  editDialog.title = '修改二元化盐记录';
  editDialog.recordId = recordId;
  editDialog.visible = true;
};

const handleView = (row: any) => {
  router.push(`/saltprocess/binary/detail/${row.id}`);
};

const handleDelete = async (row?: any) => {
  const recordIds = row?.id ? [row.id] : ids.value;
  console.log('删除记录IDs:', recordIds);
  try {
    await ElMessageBox.confirm('是否确认删除选中的二元化盐记录？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 调用删除API
    const response = await deleteBinaryRecord(recordIds);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      getList();
    } else {
      ElMessage.error(response.msg || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleExport = async () => {
  // 显示加载状态
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在导出数据...',
    background: 'rgba(0, 0, 0, 0.7)'
  });

  try {
    // 使用API导出
    const exportParams = {
      ...queryParams,
      exportType: 'excel' as const,
      fileName: generateExportFileName()
    };
    delete (exportParams as any).pageNum;
    delete (exportParams as any).pageSize;

    const response = await exportBinaryRecords(exportParams);

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportParams.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功');

  } catch (error: any) {
    console.error('导出失败:', error);
    ElMessage.error(`导出失败: ${error.message || '请检查API服务状态'}`);
  } finally {
    loadingInstance.close();
  }
};






// 生成导出文件名
const generateExportFileName = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHmmss

  let fileName = `二元化盐记录_${dateStr}_${timeStr}`;

  // 如果有筛选条件，在文件名中体现
  const filters = [];
  if (queryParams.recordCode) filters.push(`编码${queryParams.recordCode}`);
  if (queryParams.projectId) filters.push(`项目${queryParams.projectId}`);
  if (queryParams.recordDate) filters.push(`日期${queryParams.recordDate}`);
  if (queryParams.ratioStatus) filters.push(`配比${queryParams.ratioStatus === 'normal' ? '正常' : '异常'}`);

  if (filters.length > 0) {
    fileName += `_${filters.join('_')}`;
  }

  return `${fileName}.xlsx`;
};



// 判断配比是否正常（6:4标准，允许±5%偏差）
const isNormalRatio = (nano3Weight: number, kno3Weight: number): boolean => {
  if (!nano3Weight || !kno3Weight) return false;

  const total = nano3Weight + kno3Weight;
  if (total === 0) return false;

  const nano3Ratio = nano3Weight / total;
  const kno3Ratio = kno3Weight / total;

  // 标准配比：硝酸钠60%，硝酸钾40%
  const standardNano3Ratio = 0.6;
  const standardKno3Ratio = 0.4;

  // 允许±5%的偏差
  const tolerance = 0.05;

  const nano3Deviation = Math.abs(nano3Ratio - standardNano3Ratio);
  const kno3Deviation = Math.abs(kno3Ratio - standardKno3Ratio);

  return nano3Deviation <= tolerance && kno3Deviation <= tolerance;
};

const handleStatistics = async () => {
  // 动态导入统计组件
  if (!BinaryStatistics.value) {
    try {
      const module = await import('./components/BinaryStatistics.vue');
      BinaryStatistics.value = module.default;
    } catch (error) {
      console.error('加载统计组件失败:', error);
      ElMessage.error('加载统计组件失败');
      return;
    }
  }
  statisticsDialog.visible = true;
};

const handleFormSuccess = () => {
  editDialog.visible = false;
  getList();
};

const handleImportSuccess = () => {
  importDialog.visible = false;
  getList();
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
  const tagMap: Record<number, string> = { 1: 'success', 2: 'primary', 3: 'warning', 4: 'danger' };
  return tagMap[grade] || 'info';
};

const getQualityGradeText = (grade: number) => {
  const textMap: Record<number, string> = { 1: '优秀', 2: '良好', 3: '合格', 4: '不合格' };
  return textMap[grade] || '未知';
};

// 新增：格式化重量显示（吨）
const formatWeight = (weight: number) => {
  if (!weight && weight !== 0) return '-';
  return (weight / 1000).toFixed(2); // 将kg转换为吨，保留2位小数
};

// 新增：计算总化盐重量
const getTotalSaltWeight = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;
  return nano3Weight + kno3Weight;
};

// 新增：格式化配比显示
const formatRatio = (nano3Weight: number, kno3Weight: number) => {
  if (!nano3Weight && !kno3Weight) return '-';
  if (!nano3Weight) return `0:${(kno3Weight / 1000).toFixed(1)}`;
  if (!kno3Weight) return `${(nano3Weight / 1000).toFixed(1)}:0`;

  // 计算比例并简化
  const nano3Tons = nano3Weight / 1000;
  const kno3Tons = kno3Weight / 1000;
  const total = nano3Tons + kno3Tons;

  if (total === 0) return '-';

  const nano3Ratio = (nano3Tons / total * 10).toFixed(1);
  const kno3Ratio = (kno3Tons / total * 10).toFixed(1);

  return `${nano3Ratio}:${kno3Ratio}`;
};

// 新增：获取配比样式类
const getRatioClass = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;

  if (!nano3Weight && !kno3Weight) return '';

  const total = nano3Weight + kno3Weight;
  if (total === 0) return '';

  const nano3Ratio = nano3Weight / total;
  const targetRatio = 0.6; // 目标6:4配比中的6
  const deviation = Math.abs(nano3Ratio - targetRatio);

  if (deviation <= 0.02) return 'text-success'; // 偏差在2%以内为绿色
  if (deviation <= 0.05) return 'text-warning'; // 偏差在5%以内为橙色
  return 'text-danger'; // 偏差超过5%为红色
};

// 获取配比状态 - 用于筛选
const getRatioStatus = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;

  if (!nano3Weight && !kno3Weight) return 'normal';

  const total = nano3Weight + kno3Weight;
  if (total === 0) return 'normal';

  const nano3Ratio = nano3Weight / total;
  const targetRatio = 0.6; // 目标6:4配比中的6
  const deviation = Math.abs(nano3Ratio - targetRatio);

  // 偏差在5%以内为正常，超过5%为异常
  return deviation <= 0.05 ? 'normal' : 'abnormal';
};
</script>

<style scoped lang="scss">
.binary-record-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin: 16px 0 8px 0;
    }
  }

  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .mb8 {
    margin-bottom: 8px;
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
