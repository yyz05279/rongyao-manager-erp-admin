<template>
  <div class="preheating-record-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/data-records' }">数据记录</el-breadcrumb-item>
        <el-breadcrumb-item>预热记录</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">预热数据记录管理</h1>
        <div class="actions">
          <el-button type="primary" @click="handleAdd" v-has-permi="['erp:saltprocess:preheating-record:add']">
            <el-icon><Plus /></el-icon>
            新增记录
          </el-button>
          <el-button type="success" @click="handleImport" v-has-permi="['erp:saltprocess:preheating-record:import']">
            <el-icon><Upload /></el-icon>
            导入数据
          </el-button>
          <el-button type="warning" @click="handleExport" v-has-permi="['erp:saltprocess:preheating-record:export']">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
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
        <el-form-item label="任务ID" prop="taskId">
          <el-input-number
            v-model="queryParams.taskId"
            placeholder="请输入任务ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="熔盐罐编号" prop="tankNumber">
          <el-input
            v-model="queryParams.tankNumber"
            placeholder="请输入熔盐罐编号"
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
        <el-form-item label="质量状态" prop="qualityStatus">
          <el-select v-model="queryParams.qualityStatus" placeholder="请选择质量状态" clearable style="width: 150px">
            <el-option label="正常" :value="1" />
            <el-option label="异常" :value="2" />
            <el-option label="待检查" :value="3" />
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
          <el-button type="primary" plain icon="Plus" @click="handleAdd">新增记录</el-button>
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
          <el-button type="info" plain icon="Upload" @click="handleImport">导入</el-button>
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
        <el-table-column label="任务ID" prop="taskId" width="100" />
        <el-table-column label="熔盐罐编号" prop="tankNumber" width="120" />
        <el-table-column label="记录日期" prop="recordDate" width="120" />
        <el-table-column label="记录时间" prop="recordTime" width="120" />
        <el-table-column label="班次" prop="shift" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.shift === 1 ? 'primary' : 'warning'">
              {{ scope.row.shift === 1 ? '白班' : '夜班' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标温度(°C)" prop="targetTemperature" width="120" />
        <el-table-column label="实际温度(°C)" prop="actualTemperature" width="120" />
        <el-table-column label="设备状态" prop="equipmentStatus" width="100">
          <template #default="scope">
            <el-tag :type="getEquipmentStatusTag(scope.row.equipmentStatus)">
              {{ getEquipmentStatusText(scope.row.equipmentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="质量状态" prop="qualityStatus" width="100">
          <template #default="scope">
            <el-tag :type="getQualityStatusTag(scope.row.qualityStatus)">
              {{ getQualityStatusText(scope.row.qualityStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作员" prop="operatorName" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="text" size="small" @click="handleUpdate(scope.row)">
              修改
            </el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row)" style="color: #f56c6c">
              删除
            </el-button>
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <preheating-record-form
        v-if="dialog.visible"
        ref="recordFormRef"
        :record-id="dialog.recordId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="PreheatingRecord" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { parseTime } from '@/utils/ruoyi';
import type { PreheatingRecordVO, PreheatingRecordQuery } from '@/api/erp/saltprocess/records/preheating/types';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const showSearch = ref(true);
const recordList = ref<PreheatingRecordVO[]>([]);
const total = ref(0);
const ids = ref<(string | number)[]>([]);
const single = ref(true);
const multiple = ref(true);

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  recordId: null
});

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  recordCode: '',
  taskId: undefined,
  projectId: undefined,
  tankNumber: '',
  recordDate: '',
  qualityStatus: undefined
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
    // TODO: 调用API获取预热记录列表
    // 模拟数据
    recordList.value = [
      {
        id: 1,
        recordCode: 'PH20241201001',
        taskId: 1001,
        projectId: 2001,
        tankNumber: 'T001',
        recordDate: '2024-12-01',
        recordTime: '14:30:00',
        shift: 1,
        targetTemperature: 350,
        actualTemperature: 348,
        temperatureDeviation: -2,
        heatingRate: 25.5,
        targetPressure: 2.5,
        actualPressure: 2.48,
        pressureDeviation: -0.02,
        heatingPower: 1200,
        heatingEfficiency: 85.6,
        equipmentStatus: 1,
        alarmStatus: 0,
        energyConsumption: 2580.5,
        hourlyConsumption: 52.4,
        operatorId: 3001,
        operatorName: '张三',
        supervisorId: 3002,
        supervisorName: '李四',
        qualityStatus: 1,
        deviationReason: '',
        correctiveAction: '',
        remarks: '预热过程正常',
        createTime: '2024-12-01 14:30:00',
        updateTime: '2024-12-01 14:30:00'
      },
      {
        id: 2,
        recordCode: 'PH20241201002',
        taskId: 1002,
        projectId: 2001,
        tankNumber: 'T002',
        recordDate: '2024-12-01',
        recordTime: '15:45:00',
        shift: 1,
        targetTemperature: 360,
        actualTemperature: 362,
        temperatureDeviation: 2,
        heatingRate: 26.0,
        targetPressure: 2.6,
        actualPressure: 2.58,
        pressureDeviation: -0.02,
        heatingPower: 1250,
        heatingEfficiency: 86.2,
        equipmentStatus: 1,
        alarmStatus: 0,
        energyConsumption: 2650.8,
        hourlyConsumption: 53.2,
        operatorId: 3002,
        operatorName: '李四',
        supervisorId: 3001,
        supervisorName: '张三',
        qualityStatus: 2,
        deviationReason: '温度偏高',
        correctiveAction: '调整加热功率',
        remarks: '需要关注温度控制',
        createTime: '2024-12-01 15:45:00',
        updateTime: '2024-12-01 15:45:00'
      }
    ];
    total.value = 2;
  } catch (error) {
    console.error('获取预热记录列表失败:', error);
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
  dialog.title = '新增预热记录';
  dialog.recordId = null;
  dialog.visible = true;
};

const handleUpdate = (row?: any) => {
  const recordId = row?.id || ids.value[0];
  dialog.title = '修改预热记录';
  dialog.recordId = recordId;
  dialog.visible = true;
};

const handleView = (row: any) => {
  router.push(`/saltprocess/records/preheating/detail/${row.id}`);
};

const handleDelete = async (row?: any) => {
  const recordIds = row?.id ? [row.id] : ids.value;
  try {
    await ElMessageBox.confirm('是否确认删除选中的预热记录？', '系统提示', {
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

const handleImport = () => {
  // TODO: 实现导入功能
  ElMessage.info('导入功能开发中');
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

const getEquipmentStatusTag = (status: number): string => {
  const tagMap: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' };
  return tagMap[status] || 'info';
};

const getEquipmentStatusText = (status: number): string => {
  const textMap: Record<number, string> = { 1: '正常', 2: '维护', 3: '故障' };
  return textMap[status] || '未知';
};

const getQualityStatusTag = (status: number): string => {
  const tagMap: Record<number, string> = { 1: 'success', 2: 'danger', 3: 'warning' };
  return tagMap[status] || 'info';
};

const getQualityStatusText = (status: number): string => {
  const textMap: Record<number, string> = { 1: '正常', 2: '异常', 3: '待检查' };
  return textMap[status] || '未知';
};


</script>

<style scoped lang="scss">
.preheating-record-container {
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
}
</style>
