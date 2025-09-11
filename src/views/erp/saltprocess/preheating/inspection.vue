<template>
  <div class="preheating-inspection" v-loading="loading">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack" class="page-header">
      <template #content>
        <div class="header-content">
          <span class="task-title">{{ taskData.taskCode }} - 巡检管理</span>
          <el-tag :type="getStatusTag(taskData.status)" class="status-tag">
            {{ getStatusText(taskData.status) }}
          </el-tag>
        </div>
      </template>
      <template #extra>
        <el-button-group>
          <el-button
            type="primary"
            icon="Plus"
            @click="handleCreateInspection"
            v-hasPermi="['saltprocess:preheating:inspection:add']"
          >
            新增巡检
          </el-button>
          <el-button type="success" icon="Download" @click="exportInspections">
            导出巡检记录
          </el-button>
        </el-button-group>
      </template>
    </el-page-header>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="巡检编码" prop="inspectionCode">
          <el-input
            v-model="queryParams.inspectionCode"
            placeholder="请输入巡检编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="巡检员" prop="inspectorId">
          <el-select v-model="queryParams.inspectorId" placeholder="请选择巡检员" clearable style="width: 150px">
            <el-option
              v-for="inspector in inspectorList"
              :key="inspector.id"
              :label="inspector.name"
              :value="inspector.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="巡检结果" prop="overallResult">
          <el-select v-model="queryParams.overallResult" placeholder="请选择结果" clearable style="width: 120px">
            <el-option label="合格" value="PASS" />
            <el-option label="不合格" value="FAIL" />
            <el-option label="警告" value="WARNING" />
          </el-select>
        </el-form-item>
        <el-form-item label="巡检时间" prop="inspectionTime">
          <el-date-picker
            v-model="queryParams.inspectionTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 巡检列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="tableLoading"
        :data="inspectionList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="巡检编码" prop="inspectionCode" width="140" />
        <el-table-column label="巡检时间" prop="inspectionTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.inspectionTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="巡检员" prop="inspectorName" width="100" align="center" />
        <el-table-column label="巡检结果" prop="overallResult" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getInspectionResultTag(scope.row.overallResult)" size="small">
              {{ getInspectionResultText(scope.row.overallResult) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="检查点数" prop="checkPointCount" width="100" align="center">
          <template #default="scope">
            {{ scope.row.checkPoints?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="合格数" prop="passCount" width="80" align="center">
          <template #default="scope">
            {{ getPassCount(scope.row.checkPoints) }}
          </template>
        </el-table-column>
        <el-table-column label="问题数" prop="issueCount" width="80" align="center">
          <template #default="scope">
            {{ scope.row.issues?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="完成度" prop="completionRate" width="120" align="center">
          <template #default="scope">
            <el-progress
              :percentage="getCompletionRate(scope.row.checkPoints)"
              :status="getCompletionStatus(scope.row.overallResult)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remarks" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click.stop="handleView(scope.row)"
                v-hasPermi="['saltprocess:preheating:inspection:query']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['saltprocess:preheating:inspection:edit']"
              />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button
                link
                type="success"
                icon="CopyDocument"
                @click.stop="handleCopy(scope.row)"
                v-hasPermi="['saltprocess:preheating:inspection:add']"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['saltprocess:preheating:inspection:remove']"
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

    <!-- 巡检表单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1200px" append-to-body>
      <inspection-form
        v-if="dialog.visible"
        ref="inspectionFormRef"
        :task-id="taskId"
        :inspection-id="dialog.inspectionId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 巡检详情对话框 -->
    <el-dialog title="巡检详情" v-model="detailDialog.visible" width="1400px" append-to-body>
      <inspection-detail
        v-if="detailDialog.visible"
        :inspection-id="detailDialog.inspectionId"
        @close="detailDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="PreheatingInspection" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  Download,
  View,
  Edit,
  CopyDocument,
  Delete
} from '@element-plus/icons-vue';
import {
  getPreheatingTask,
  listPreheatingInspection,
  deletePreheatingInspection,
  copyPreheatingInspection,
  exportPreheatingInspectionList
} from '@/api/erp/saltprocess/preheating';
import type {
  PreheatingTaskVO,
  PreheatingInspectionQuery,
  PreheatingInspectionVO
} from '@/api/erp/saltprocess/preheating/types';
import { parseTime } from '@/utils/ruoyi';
import InspectionForm from './components/InspectionForm.vue';
import InspectionDetail from './components/InspectionDetail.vue';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const tableLoading = ref(false);
const taskId = ref(route.params.id as string);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const taskData = ref<PreheatingTaskVO>({} as PreheatingTaskVO);
const inspectionList = ref<PreheatingInspectionVO[]>([]);
const inspectorList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<PreheatingInspectionQuery>({
  pageNum: 1,
  pageSize: 10,
  taskId: taskId.value,
  inspectionCode: '',
  inspectorId: '',
  overallResult: '',
  inspectionTime: []
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  inspectionId: ''
});

const detailDialog = reactive({
  visible: false,
  inspectionId: ''
});

// 表单引用
const queryFormRef = ref();
const inspectionFormRef = ref();

// 生命周期
onMounted(() => {
  if (taskId.value) {
    loadTaskData();
    getList();
    loadInspectorList();
  }
});

// 方法
const loadTaskData = async () => {
  loading.value = true;
  try {
    const { data } = await getPreheatingTask(taskId.value);
    taskData.value = data;
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const getList = async () => {
  tableLoading.value = true;
  try {
    const { data } = await listPreheatingInspection(queryParams);
    inspectionList.value = data.rows;
    total.value = data.total;
  } catch (error) {
    console.error('获取巡检列表失败:', error);
  } finally {
    tableLoading.value = false;
  }
};

const loadInspectorList = async () => {
  // TODO: 从用户管理API获取巡检员列表
  inspectorList.value = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' }
  ];
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: PreheatingInspectionVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: PreheatingInspectionVO) => {
  handleView(row);
};

const handleCreateInspection = () => {
  dialog.title = '新增巡检';
  dialog.inspectionId = '';
  dialog.visible = true;
};

const handleUpdate = (row?: PreheatingInspectionVO) => {
  const inspectionId = row?.id || ids.value[0];
  dialog.title = '修改巡检';
  dialog.inspectionId = inspectionId;
  dialog.visible = true;
};

const handleView = (row: PreheatingInspectionVO) => {
  detailDialog.inspectionId = row.id;
  detailDialog.visible = true;
};

const handleCopy = async (row: PreheatingInspectionVO) => {
  try {
    await ElMessageBox.confirm(
      `是否确认复制巡检记录"${row.inspectionCode}"？`,
      '确认复制',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await copyPreheatingInspection(row.id);
    ElMessage.success('巡检记录复制成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制巡检记录失败:', error);
      ElMessage.error('复制巡检记录失败');
    }
  }
};

const handleDelete = async (row?: PreheatingInspectionVO) => {
  const inspectionIds = row?.id ? [row.id] : ids.value;
  const inspectionCodes = row?.inspectionCode ? [row.inspectionCode] : 
    inspectionList.value.filter(item => inspectionIds.includes(item.id)).map(item => item.inspectionCode);
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除巡检记录"${inspectionCodes.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deletePreheatingInspection(inspectionIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除巡检记录失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const exportInspections = async () => {
  try {
    await exportPreheatingInspectionList(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

const handleBack = () => {
  router.back();
};

// 工具方法
const getStatusText = (status: string): string => {
  const statusMap = {
    'PENDING': '待开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'FAILED': '失败',
    'CANCELLED': '已取消'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusTag = (status: string): string => {
  const tagMap = {
    'PENDING': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'warning'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getInspectionResultText = (result: string): string => {
  const resultMap = {
    'PASS': '合格',
    'FAIL': '不合格',
    'WARNING': '警告'
  };
  return resultMap[result as keyof typeof resultMap] || result;
};

const getInspectionResultTag = (result: string): string => {
  const tagMap = {
    'PASS': 'success',
    'FAIL': 'danger',
    'WARNING': 'warning'
  };
  return tagMap[result as keyof typeof tagMap] || '';
};

const getPassCount = (checkPoints: any[]): number => {
  if (!checkPoints) return 0;
  return checkPoints.filter(point => point.result === 'PASS').length;
};

const getCompletionRate = (checkPoints: any[]): number => {
  if (!checkPoints || checkPoints.length === 0) return 0;
  const completedCount = checkPoints.filter(point => point.result).length;
  return Math.round((completedCount / checkPoints.length) * 100);
};

const getCompletionStatus = (result: string): string => {
  if (result === 'FAIL') return 'exception';
  if (result === 'WARNING') return 'warning';
  return 'success';
};
</script>

<style scoped lang="scss">
.preheating-inspection {
  .page-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .task-title {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }

      .status-tag {
        font-size: 12px;
      }
    }
  }

  .search-card,
  .table-card {
    margin-bottom: 20px;
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
