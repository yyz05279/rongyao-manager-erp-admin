<template>
  <div class="ternary-record-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records' }">化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item>三元化盐记录</el-breadcrumb-item>
      </el-breadcrumb>
      <h1 class="page-title">三元化盐记录管理</h1>
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
        <el-form-item label="稳定性指数" prop="stabilityIndex">
          <el-input-number
            v-model="queryParams.stabilityIndex"
            placeholder="稳定性指数"
            :precision="2"
            :min="0"
            :max="10"
            clearable
            style="width: 150px"
          />
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
          <el-button type="info" plain icon="TrendCharts" @click="handleStabilityAnalysis">稳定性分析</el-button>
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
        <el-table-column label="记录编码" prop="recordCode" width="150" show-overflow-tooltip />
        <el-table-column label="批次号" prop="batchNumber" width="120" />
        <el-table-column label="项目ID" prop="projectId" width="100" />
        <el-table-column label="记录日期" prop="recordDate" width="120" />
        <el-table-column label="班次" prop="shift" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.shift === 1 ? 'primary' : 'warning'">
              {{ scope.row.shift === 1 ? '白班' : '夜班' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="NaNO3配比(%)" prop="nano3ActualRatio" width="120" />
        <el-table-column label="KNO3配比(%)" prop="kno3ActualRatio" width="120" />
        <el-table-column label="NaNO2配比(%)" prop="nano2ActualRatio" width="120" />
        <el-table-column label="稳定性指数" prop="stabilityIndex" width="120">
          <template #default="scope">
            <span :class="getStabilityClass(scope.row.stabilityIndex)">
              {{ scope.row.stabilityIndex }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="实际产量(kg)" prop="actualOutput" width="120" />
        <el-table-column label="产出率(%)" prop="yieldRate" width="100">
          <template #default="scope">
            <span :class="getYieldRateClass(scope.row.yieldRate)">
              {{ scope.row.yieldRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="质量等级" prop="qualityGrade" width="100">
          <template #default="scope">
            <el-tag :type="getQualityGradeTag(scope.row.qualityGrade)">
              {{ getQualityGradeText(scope.row.qualityGrade) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作员" prop="operatorName" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div style="display: flex; gap: 8px; justify-content: flex-start;">
              <el-button type="primary" size="small" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button type="success" size="small" @click="handleUpdate(scope.row)">
                修改
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
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

    <!-- 记录表单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1000px" append-to-body>
      <ternary-record-form
        v-if="dialog.visible"
        ref="recordFormRef"
        :record-id="dialog.recordId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 稳定性分析对话框 -->
    <el-dialog title="三元化盐稳定性分析" v-model="stabilityDialog.visible" width="1200px" append-to-body>
      <ternary-stability-analysis
        v-if="stabilityDialog.visible"
        @close="stabilityDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="TernaryRecord" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { parseTime } from '@/utils/ruoyi';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const showSearch = ref(true);
const recordList = ref([]);
const total = ref(0);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  recordId: null
});

const stabilityDialog = reactive({
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
  stabilityIndex: undefined
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
    // TODO: 调用API获取三元化盐记录列表
    // 模拟数据
    recordList.value = [
      {
        id: '1',
        recordCode: 'TM20241201001',
        batchNumber: 'T20241201001',
        projectId: 201,
        recordDate: '2024-12-01',
        shift: 1,
        nano3ActualRatio: 50.5,
        kno3ActualRatio: 35.2,
        nano2ActualRatio: 14.3,
        stabilityIndex: 8.5,
        actualOutput: 1850,
        yieldRate: 97.8,
        qualityGrade: 1,
        operatorName: '王五'
      },
      {
        id: '2',
        recordCode: 'TM20241201002',
        batchNumber: 'T20241201002',
        projectId: 202,
        recordDate: '2024-12-01',
        shift: 2,
        nano3ActualRatio: 49.8,
        kno3ActualRatio: 35.8,
        nano2ActualRatio: 14.4,
        stabilityIndex: 7.9,
        actualOutput: 1780,
        yieldRate: 95.2,
        qualityGrade: 2,
        operatorName: '赵六'
      }
    ];
    total.value = 2;
  } catch (error) {
    console.error('获取三元化盐记录列表失败:', error);
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
  dialog.title = '新增三元化盐记录';
  dialog.recordId = null;
  dialog.visible = true;
};

const handleUpdate = (row?: any) => {
  const recordId = row?.id || ids.value[0];
  dialog.title = '修改三元化盐记录';
  dialog.recordId = recordId;
  dialog.visible = true;
};

const handleView = (row: any) => {
  router.push(`/saltprocess/records/ternary/detail/${row.id}`);
};

const handleDelete = async (row?: any) => {
  const recordIds = row?.id ? [row.id] : ids.value;
  try {
    await ElMessageBox.confirm('是否确认删除选中的三元化盐记录？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // TODO: 调用删除API
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中');
};

const handleStabilityAnalysis = () => {
  stabilityDialog.visible = true;
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

const getStabilityClass = (index: number) => {
  if (index >= 8.0) return 'text-success';
  if (index >= 6.0) return 'text-warning';
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
.ternary-record-container {
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
