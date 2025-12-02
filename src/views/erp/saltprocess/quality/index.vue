<template>
  <div class="quality-management">
    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="检测编号" prop="testCode">
          <el-input
            v-model="queryParams.testCode"
            placeholder="请输入检测编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="样品名称" prop="sampleName">
          <el-input
            v-model="queryParams.sampleName"
            placeholder="请输入样品名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="检测类型" prop="testType">
          <el-select v-model="queryParams.testType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="原料检测" value="RAW_MATERIAL" />
            <el-option label="过程检测" value="PROCESS" />
            <el-option label="成品检测" value="FINISHED_PRODUCT" />
            <el-option label="环境检测" value="ENVIRONMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测状态" prop="testStatus">
          <el-select v-model="queryParams.testStatus" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="待检测" value="PENDING" />
            <el-option label="检测中" value="TESTING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="不合格" value="FAILED" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测结果" prop="testResult">
          <el-select v-model="queryParams.testResult" placeholder="请选择结果" clearable style="width: 120px">
            <el-option label="合格" value="PASS" />
            <el-option label="不合格" value="FAIL" />
            <el-option label="待定" value="PENDING" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测日期" prop="testDateRange">
          <el-date-picker
            v-model="queryParams.testDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['saltprocess:quality:add']"
          >
            新增检测
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Check"
            :disabled="single"
            @click="handleApprove"
            v-hasPermi="['saltprocess:quality:approve']"
          >
            审核通过
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Close"
            :disabled="single"
            @click="handleReject"
            v-hasPermi="['saltprocess:quality:reject']"
          >
            审核拒绝
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            icon="Document"
            @click="handleReport"
            v-hasPermi="['saltprocess:quality:report']"
          >
            质量报告
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['saltprocess:quality:remove']"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['saltprocess:quality:export']"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
    </el-card>

    <!-- 质量概览 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.totalTests }}</div>
              <div class="item-label">总检测数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon pass">
              <el-icon><Check /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.passCount }}</div>
              <div class="item-label">合格数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon fail">
              <el-icon><Close /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.failCount }}</div>
              <div class="item-label">不合格数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon rate">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.passRate }}%</div>
              <div class="item-label">合格率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 检测列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="qualityList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="检测编号" prop="testCode" width="140" />
        <el-table-column label="样品名称" prop="sampleName" min-width="180" show-overflow-tooltip />
        <el-table-column label="检测类型" prop="testType" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getTestTypeTag(scope.row.testType)">
              {{ getTestTypeText(scope.row.testType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批次号" prop="batchNumber" width="120" />
        <el-table-column label="检测项目" prop="testItems" width="150" show-overflow-tooltip />
        <el-table-column label="检测标准" prop="testStandard" width="120" show-overflow-tooltip />
        <el-table-column label="检测状态" prop="testStatus" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getTestStatusTag(scope.row.testStatus)" size="small">
              {{ getTestStatusText(scope.row.testStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检测结果" prop="testResult" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getTestResultTag(scope.row.testResult)" size="small">
              {{ getTestResultText(scope.row.testResult) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="合格率" prop="passRate" width="100" align="center">
          <template #default="scope">
            <span :class="getPassRateClass(scope.row.passRate)">
              {{ scope.row.passRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="检测员" prop="testerName" width="100" align="center" />
        <el-table-column label="审核员" prop="reviewerName" width="100" align="center" />
        <el-table-column label="检测日期" prop="testDate" width="120" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.testDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成日期" prop="completionDate" width="120" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.completionDate, '{y}-{m}-{d}') || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click.stop="handleView(scope.row)"
                v-hasPermi="['saltprocess:quality:query']"
              />
            </el-tooltip>
            <el-tooltip content="检测报告" placement="top">
              <el-button
                link
                type="success"
                icon="Document"
                @click.stop="handleViewReport(scope.row)"
                v-hasPermi="['saltprocess:quality:report']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['saltprocess:quality:edit']"
                :disabled="scope.row.testStatus === 'COMPLETED'"
              />
            </el-tooltip>
            <el-tooltip content="审核" placement="top">
              <el-button
                link
                type="warning"
                icon="Check"
                @click.stop="handleReview(scope.row)"
                v-hasPermi="['saltprocess:quality:review']"
                :disabled="scope.row.testStatus !== 'TESTING'"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['saltprocess:quality:remove']"
                :disabled="scope.row.testStatus === 'COMPLETED'"
              />
            </el-tooltip>
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

    <!-- 检测表单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <quality-test-form
        v-if="dialog.visible"
        ref="testFormRef"
        :test-id="dialog.testId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog title="质量审核" v-model="reviewDialog.visible" width="600px" append-to-body>
      <quality-review-form
        v-if="reviewDialog.visible"
        :test-id="reviewDialog.testId"
        @success="handleReviewSuccess"
        @cancel="reviewDialog.visible = false"
      />
    </el-dialog>

    <!-- 检测报告对话框 -->
    <el-dialog title="检测报告" v-model="reportDialog.visible" width="1200px" append-to-body>
      <quality-test-report
        v-if="reportDialog.visible"
        :test-id="reportDialog.testId"
        @close="reportDialog.visible = false"
      />
    </el-dialog>

    <!-- 质量报告对话框 -->
    <el-dialog title="质量分析报告" v-model="qualityReportDialog.visible" width="1400px" append-to-body>
      <quality-analysis-report
        v-if="qualityReportDialog.visible"
        @close="qualityReportDialog.visible = false"
      />
    </el-dialog>

    <!-- 检测详情对话框 -->
    <el-dialog title="检测详情" v-model="detailDialog.visible" width="1200px" append-to-body>
      <quality-test-detail
        v-if="detailDialog.visible"
        :test-id="detailDialog.testId"
        @close="detailDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="QualityManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  Check,
  Close,
  Document,
  Delete,
  Download,
  View,
  Edit,
  TrendCharts
} from '@element-plus/icons-vue';
import {
  listQualityTest,
  deleteQualityTest,
  approveQualityTest,
  rejectQualityTest,
  getQualityOverview,
  exportQualityTestList
} from '@/api/erp/saltprocess/quality';
import type { QualityTestQuery, QualityTestVO } from '@/api/erp/saltprocess/quality/types';
import { parseTime } from '@/utils/ruoyi';
import QualityTestForm from './components/QualityTestForm.vue';
import QualityReviewForm from './components/QualityReviewForm.vue';
import QualityTestReport from './components/QualityTestReport.vue';
import QualityAnalysisReport from './components/QualityAnalysisReport.vue';
import QualityTestDetail from './components/QualityTestDetail.vue';

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const qualityList = ref<QualityTestVO[]>([]);
const overviewData = ref<any>({
  totalTests: 0,
  passCount: 0,
  failCount: 0,
  passRate: 0
});

// 查询参数
const queryParams = reactive<QualityTestQuery>({
  pageNum: 1,
  pageSize: 10,
  testCode: '',
  sampleName: '',
  testType: '',
  testStatus: '',
  testResult: '',
  testDateRange: ['', '']
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  testId: ''
});

const reviewDialog = reactive({
  visible: false,
  testId: ''
});

const reportDialog = reactive({
  visible: false,
  testId: ''
});

const qualityReportDialog = reactive({
  visible: false
});

const detailDialog = reactive({
  visible: false,
  testId: ''
});

// 表单引用
const queryFormRef = ref();
const testFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
  loadOverviewData();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const { data } = await listQualityTest(queryParams);
    qualityList.value = data.rows;
    total.value = data.total;
  } catch (error) {
    console.error('获取质量检测列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadOverviewData = async () => {
  try {
    const { data } = await getQualityOverview();
    overviewData.value = data;
  } catch (error) {
    console.error('加载概览数据失败:', error);
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

const handleSelectionChange = (selection: QualityTestVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: QualityTestVO) => {
  handleView(row);
};

const handleAdd = () => {
  dialog.title = '新增质量检测';
  dialog.testId = '';
  dialog.visible = true;
};

const handleUpdate = (row?: QualityTestVO) => {
  const testId = row?.id || ids.value[0];
  dialog.title = '修改质量检测';
  dialog.testId = testId;
  dialog.visible = true;
};

const handleView = (row: QualityTestVO) => {
  detailDialog.testId = row.id;
  detailDialog.visible = true;
};

const handleViewReport = (row: QualityTestVO) => {
  reportDialog.testId = row.id;
  reportDialog.visible = true;
};

const handleReview = (row: QualityTestVO) => {
  reviewDialog.testId = row.id;
  reviewDialog.visible = true;
};

const handleApprove = async (row?: QualityTestVO) => {
  const testId = row?.id || ids.value[0];
  const testCode = row?.inspectionNo || qualityList.value.find(item => item.id === testId)?.inspectionNo;
  
  try {
    await ElMessageBox.confirm(
      `是否确认审核通过检测"${testCode}"？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await approveQualityTest(testId);
    ElMessage.success('审核通过成功');
    getList();
    loadOverviewData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error);
      ElMessage.error('审核通过失败');
    }
  }
};

const handleReject = async (row?: QualityTestVO) => {
  const testId = row?.id || ids.value[0];
  const testCode = row?.inspectionNo || qualityList.value.find(item => item.id === testId)?.inspectionNo;
  
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入拒绝原因`,
      `拒绝检测"${testCode}"`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '拒绝原因不能为空'
      }
    );
    
    await rejectQualityTest(testId, reason);
    ElMessage.success('审核拒绝成功');
    getList();
    loadOverviewData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核拒绝失败:', error);
      ElMessage.error('审核拒绝失败');
    }
  }
};

const handleReport = () => {
  qualityReportDialog.visible = true;
};

const handleDelete = async (row?: QualityTestVO) => {
  const testIds = row?.id ? [row.id] : ids.value;
  const testCodes = row?.inspectionNo ? [row.inspectionNo] :
    qualityList.value.filter(item => testIds.includes(item.id)).map(item => item.inspectionNo);
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除检测"${testCodes.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteQualityTest(testIds);
    ElMessage.success('删除成功');
    getList();
    loadOverviewData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除检测失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleExport = async () => {
  try {
    await exportQualityTestList(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
  loadOverviewData();
};

const handleReviewSuccess = () => {
  reviewDialog.visible = false;
  getList();
  loadOverviewData();
};

// 工具方法
const getTestTypeText = (type: string): string => {
  const typeMap = {
    'RAW_MATERIAL': '原料检测',
    'PROCESS': '过程检测',
    'FINISHED_PRODUCT': '成品检测',
    'ENVIRONMENT': '环境检测'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getTestTypeTag = (type: string): string => {
  const tagMap = {
    'RAW_MATERIAL': 'primary',
    'PROCESS': 'success',
    'FINISHED_PRODUCT': 'warning',
    'ENVIRONMENT': 'info'
  };
  return tagMap[type as keyof typeof tagMap] || '';
};

const getTestStatusText = (status: string): string => {
  const statusMap = {
    'PENDING': '待检测',
    'TESTING': '检测中',
    'COMPLETED': '已完成',
    'FAILED': '不合格'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getTestStatusTag = (status: string): string => {
  const tagMap = {
    'PENDING': 'info',
    'TESTING': 'primary',
    'COMPLETED': 'success',
    'FAILED': 'danger'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getTestResultText = (result: string): string => {
  const resultMap = {
    'PASS': '合格',
    'FAIL': '不合格',
    'PENDING': '待定'
  };
  return resultMap[result as keyof typeof resultMap] || result;
};

const getTestResultTag = (result: string): string => {
  const tagMap = {
    'PASS': 'success',
    'FAIL': 'danger',
    'PENDING': 'warning'
  };
  return tagMap[result as keyof typeof tagMap] || '';
};

const getPassRateClass = (rate: number): string => {
  if (rate >= 95) return 'text-success';
  if (rate >= 80) return 'text-warning';
  return 'text-danger';
};
</script>

<style scoped lang="scss">
.quality-management {
  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .overview-section {
    margin-bottom: 20px;

    .overview-card {
      .overview-item {
        display: flex;
        align-items: center;
        padding: 20px;

        .item-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.pass {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }

          &.fail {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.rate {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
        }

        .item-content {
          flex: 1;

          .item-value {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            line-height: 1;
            margin-bottom: 8px;
          }

          .item-label {
            font-size: 14px;
            color: #8492a6;
          }
        }
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
