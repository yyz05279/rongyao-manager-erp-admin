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
        <!-- <el-form-item label="批次号" prop="batchNumber">
          <el-input
            v-model="queryParams.batchNumber"
            placeholder="请输入批次号"
            clearable
            style="width: 200px"
          />
        </el-form-item> -->
        <el-form-item label="项目名称" prop="projectName">
          <el-select
            v-model="queryParams.projectName"
            placeholder="请选择项目名称"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="project.projectName"
              :value="project.projectName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="记录日期" prop="recordDate">
          <el-date-picker
            v-model="queryParams.recordDate"
            type="date"
            placeholder="选择记录日期"
            style="width: 200px"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            @change="handleDateChange"
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
          <el-button type="warning" plain icon="Download" @click="handleExport">Excel导出</el-button>
        </el-col>
        <!-- TODO 暂时隐藏统计分析 -->
        <el-col :span="1.5" v-show="false">
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
        stripe
        border
        height="600"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="记录编码" prop="recordCode" width="140" show-overflow-tooltip />
        <el-table-column label="项目名称" prop="projectName" width="150" show-overflow-tooltip>
          <template #default="scope">
            {{ getProjectName(scope.row.projectId) }}
          </template>
        </el-table-column>
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
            {{ formatWeight(scope.row.totalSaltWeight || (scope.row.nano3ActualWeight + scope.row.kno3ActualWeight)) }}
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

    <!-- 导出参数选择对话框 -->
    <el-dialog title="Excel导出设置" v-model="exportDialog.visible" width="600px" append-to-body>
      <div class="export-dialog-content">
        <el-alert
          title="导出说明"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        >
          <template #default>
            <p>• 导出文件将使用预定义的Excel模版格式</p>
            <p>• 支持最多导出10,000条记录</p>
            <p>• 建议按日期范围分批导出大量数据</p>
          </template>
        </el-alert>

        <el-form :model="exportParams" label-width="120px">
          <el-form-item label="导出范围">
            <el-radio-group v-model="exportParams.exportType">
              <el-radio value="current">当前查询结果</el-radio>
              <el-radio value="custom">自定义条件</el-radio>
            </el-radio-group>
            <div class="form-item-tip">
              <span v-if="exportParams.exportType === 'current'">
                将导出当前页面查询条件下的所有数据
              </span>
              <span v-else>
                可以设置更详细的筛选条件进行导出
              </span>
            </div>
          </el-form-item>

        <template v-if="exportParams.exportType === 'custom'">
          <el-form-item label="项目ID">
            <el-input v-model="exportParams.projectId" placeholder="请输入项目ID" clearable />
          </el-form-item>

          <el-form-item label="日期范围">
            <el-date-picker
              v-model="exportParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>

          <el-form-item label="班次">
            <el-select v-model="exportParams.shift" placeholder="请选择班次" clearable>
              <el-option label="白班" :value="1" />
              <el-option label="夜班" :value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="批次号">
            <el-input v-model="exportParams.batchNumber" placeholder="请输入批次号" clearable />
          </el-form-item>
        </template>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="exportDialog.loading">
            确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BinaryRecord" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';

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
  exportBinaryRecordTemplate,
  getStatisticsData,
  getProjectList
} from '@/api/erp/saltprocess/records/binary';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(false);
const showSearch = ref(true);
const recordList = ref<any[]>([]);
const projectList = ref<any[]>([]);
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

const exportDialog = reactive({
  visible: false,
  loading: false
});

// 导出参数
const exportParams = reactive({
  exportType: 'current', // current: 当前查询结果, custom: 自定义条件
  projectId: '',
  dateRange: null as [string, string] | null,
  shift: undefined as number | undefined,
  batchNumber: ''
});

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  recordCode: '',
  batchNumber: '',
  projectId: undefined,      // 保留用于后端查询
  projectName: '阿克塞化盐服务项目',  // 默认选择阿克塞项目
  recordDate: '',
  ratioStatus: undefined
});

// 表单引用
const queryFormRef = ref();
const recordFormRef = ref();

// 生命周期
onMounted(() => {
  loadProjectList();
  getList();
});

// 加载项目列表
const loadProjectList = async () => {
  try {
    const response = await getProjectList();
    // 处理API响应数据
    if (response && response.rows) {
      projectList.value = Array.isArray(response.rows) ? response.rows : [];
    } else {
      projectList.value = [];
    }
    console.log('项目列表加载成功:', projectList.value);
  } catch (error) {
    console.error('加载项目列表失败:', error);
    ElMessage.error('加载项目列表失败');
  }
};

// 工具函数
const formatDate = (date: any): string => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  return '';
};

// 根据项目ID获取项目名称
const getProjectName = (projectId: number | string): string => {
  if (!projectId) return '未知项目';
  const project = projectList.value.find(p => p.id == projectId);
  return project ? project.projectName : '未知项目';
};

// 方法
const getList = async () => {
  loading.value = true;
  try {
    console.log('=== 开始调用二元记录API ===');
    console.log('原始查询参数:', queryParams);

    // 处理查询参数
    const processedParams: any = { ...queryParams };

    // 将项目名称转换为项目ID（用于后端查询）
    if (processedParams.projectName) {
      const selectedProject = projectList.value.find(p => p.projectName === processedParams.projectName);
      if (selectedProject) {
        processedParams.projectId = selectedProject.id;
      }
      // 删除projectName字段，因为后端不需要
      delete processedParams.projectName;
    }

    // 由于日期选择器已配置value-format="YYYY-MM-DD"，日期应该已经是字符串格式
    console.log('日期参数类型:', typeof processedParams.recordDate, '值:', processedParams.recordDate);

    // 清理空值参数（保留分页参数）
    const cleanedParams: any = {};
    Object.keys(processedParams).forEach(key => {
      const value = processedParams[key];
      if (key === 'pageNum' || key === 'pageSize') {
        // 分页参数始终保留
        cleanedParams[key] = value;
      } else if (value !== '' && value !== null && value !== undefined) {
        // 其他参数只有在有值时才保留
        cleanedParams[key] = value;
      }
    });

    console.log('处理后的查询参数:', cleanedParams);
    console.log('API URL:', '/erp/saltprocess/binary-record/list');

    // 调用API获取二元化盐记录列表
    const response = await listBinaryRecords(cleanedParams);

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

const handleDateChange = (value: string | null) => {
  console.log('日期选择器值变化:', value);
  queryParams.recordDate = value || '';
  // 可以选择是否自动触发查询
  // handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
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

const handleExport = () => {
  // 重置导出参数
  exportParams.exportType = 'current';
  exportParams.projectId = queryParams.projectId || '';
  exportParams.dateRange = null;
  exportParams.shift = undefined;
  exportParams.batchNumber = queryParams.batchNumber || '';

  // 显示导出对话框
  exportDialog.visible = true;
};

const confirmExport = () => {
  // 验证自定义条件
  if (exportParams.exportType === 'custom') {
    if (exportParams.dateRange && exportParams.dateRange.length === 2) {
      const startDate = new Date(exportParams.dateRange[0]);
      const endDate = new Date(exportParams.dateRange[1]);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 检查日期范围是否过大（超过1年）
      if (diffDays > 365) {
        ElMessage.warning('导出日期范围不能超过1年，请缩小日期范围');
        return;
      }
    }

    // 检查是否至少设置了一个筛选条件
    const hasCondition = exportParams.projectId ||
                        exportParams.dateRange ||
                        exportParams.shift ||
                        exportParams.batchNumber;

    if (!hasCondition) {
      ElMessage.warning('请至少设置一个筛选条件');
      return;
    }
  }

  // 构建导出参数
  const downloadParams: any = {};

  if (exportParams.exportType === 'current') {
    // 使用当前查询条件
    if (queryParams.projectId) {
      downloadParams.projectId = Number(queryParams.projectId);
    }
    if (queryParams.recordDate) {
      downloadParams.recordDate = queryParams.recordDate;
    }
    if (queryParams.batchNumber) {
      downloadParams.batchNumber = queryParams.batchNumber;
    }
  } else {
    // 使用自定义条件
    if (exportParams.projectId) {
      downloadParams.projectId = Number(exportParams.projectId);
    }
    if (exportParams.dateRange && exportParams.dateRange.length === 2) {
      downloadParams.startDate = exportParams.dateRange[0];
      downloadParams.endDate = exportParams.dateRange[1];
    }
    if (exportParams.shift) {
      downloadParams.shift = exportParams.shift;
    }
    if (exportParams.batchNumber) {
      downloadParams.batchNumber = exportParams.batchNumber;
    }
  }

  // 生成文件名（根据接口文档格式）
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
  const fileName = `二元盐化盐量记录表_${timestamp}.xlsx`;

  // 使用项目的通用下载方法
  proxy?.download('/erp/saltprocess/binary-record/export-template', downloadParams, fileName);

  // 关闭对话框
  exportDialog.visible = false;

  ElMessage.success('导出请求已提交，请稍候下载');
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

// 移除前端累计计算逻辑，改为使用后台返回的totalSaltWeight字段

// 新增：格式化配比显示
const formatRatio = (nano3Weight: number, kno3Weight: number) => {
  // 处理undefined、null或NaN的情况
  const nano3 = Number(nano3Weight) || 0;
  const kno3 = Number(kno3Weight) || 0;

  if (nano3 === 0 && kno3 === 0) return '-';
  if (nano3 === 0) return `0.0:${(kno3 / 1000).toFixed(1)}`;
  if (kno3 === 0) return `${(nano3 / 1000).toFixed(1)}:0.0`;

  // 计算比例并简化为6:4格式
  const total = nano3 + kno3;
  if (total === 0) return '-';

  // 计算百分比
  const nano3Percentage = (nano3 / total) * 100;
  const kno3Percentage = (kno3 / total) * 100;

  // 转换为6:4格式的比例（基于10的比例）
  const nano3Ratio = (nano3Percentage / 10).toFixed(1);
  const kno3Ratio = (kno3Percentage / 10).toFixed(1);

  return `${nano3Ratio}:${kno3Ratio}`;
};

// 新增：获取配比样式类
const getRatioClass = (row: any) => {
  // 处理undefined、null或NaN的情况
  const nano3Weight = Number(row.nano3ActualWeight) || 0;
  const kno3Weight = Number(row.kno3ActualWeight) || 0;

  if (nano3Weight === 0 && kno3Weight === 0) return '';

  const total = nano3Weight + kno3Weight;
  if (total === 0) return '';

  const nano3Ratio = nano3Weight / total;
  const targetRatio = 0.6; // 目标6:4配比中的6
  const deviation = Math.abs(nano3Ratio - targetRatio);

  // 根据用户要求：满足6:4配比使用绿色，不满足使用红色
  if (deviation <= 0.02) return 'text-success'; // 偏差在2%以内认为满足6:4配比，使用绿色
  return 'text-danger'; // 不满足6:4配比，使用红色
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

// 导出对话框样式
.export-dialog-content {
  .form-item-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
  }

  .el-alert {
    p {
      margin: 2px 0;
      font-size: 13px;
    }
  }
}

.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}
</style>
