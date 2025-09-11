<template>
  <div class="preheating-data-record">
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
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="质量状态" prop="qualityStatus">
          <el-select
            v-model="queryParams.qualityStatus"
            placeholder="请选择质量状态"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in QUALITY_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operation-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['erp:saltprocess:preheating-record:add']"
          >
            新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['erp:saltprocess:preheating-record:edit']"
          >
            修改
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['erp:saltprocess:preheating-record:remove']"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['erp:saltprocess:preheating-record:export']"
          >
            导出
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx,.xls"
            :headers="uploadHeaders"
            :action="uploadUrl"
            :on-success="handleImportSuccess"
            :on-error="handleImportError"
            :before-upload="beforeUpload"
            :show-file-list="false"
            style="display: inline-block"
          >
            <el-button
              type="info"
              plain
              icon="Upload"
              v-hasPermi="['erp:saltprocess:preheating-record:import']"
            >
              导入
            </el-button>
          </el-upload>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleDownloadTemplate"
          >
            下载模板
          </el-button>
        </el-col>
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
        <el-table-column label="温度偏差(°C)" prop="temperatureDeviation" width="120">
          <template #default="scope">
            <span :class="getDeviationClass(scope.row.temperatureDeviation)">
              {{ scope.row.temperatureDeviation || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="设备状态" prop="equipmentStatus" width="100">
          <template #default="scope">
            <el-tag :type="getEquipmentStatusType(scope.row.equipmentStatus)">
              {{ getEquipmentStatusText(scope.row.equipmentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="质量状态" prop="qualityStatus" width="100">
          <template #default="scope">
            <el-tag :type="getQualityStatusType(scope.row.qualityStatus)">
              {{ getQualityStatusText(scope.row.qualityStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作员" prop="operatorName" width="100" />
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="scope">
            <el-button
              link
              type="primary"
              icon="View"
              @click="handleView(scope.row)"
              v-hasPermi="['erp:saltprocess:preheating-record:query']"
            >
              查看
            </el-button>
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['erp:saltprocess:preheating-record:edit']"
            >
              修改
            </el-button>
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['erp:saltprocess:preheating-record:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="preheatingDataRecordRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="记录编码" prop="recordCode">
              <el-input v-model="form.recordCode" placeholder="请输入记录编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务ID" prop="taskId">
              <el-input-number
                v-model="form.taskId"
                placeholder="请输入任务ID"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目ID" prop="projectId">
              <el-input-number
                v-model="form.projectId"
                placeholder="请输入项目ID"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="熔盐罐编号" prop="tankNumber">
              <el-input v-model="form.tankNumber" placeholder="请输入熔盐罐编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="记录日期" prop="recordDate">
              <el-date-picker
                v-model="form.recordDate"
                type="date"
                placeholder="选择记录日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="记录时间" prop="recordTime">
              <el-time-picker
                v-model="form.recordTime"
                placeholder="选择记录时间"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班次" prop="shift">
              <el-select v-model="form.shift" placeholder="请选择班次" style="width: 100%">
                <el-option
                  v-for="item in SHIFT_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="equipmentStatus">
              <el-select v-model="form.equipmentStatus" placeholder="请选择设备状态" style="width: 100%">
                <el-option
                  v-for="item in EQUIPMENT_STATUS_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标温度(°C)" prop="targetTemperature">
              <el-input-number
                v-model="form.targetTemperature"
                :precision="2"
                :min="0"
                :max="1000"
                placeholder="请输入目标温度"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际温度(°C)" prop="actualTemperature">
              <el-input-number
                v-model="form.actualTemperature"
                :precision="2"
                :min="0"
                :max="1000"
                placeholder="请输入实际温度"
                style="width: 100%"
                @change="calculateTemperatureDeviation"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标压力(MPa)" prop="targetPressure">
              <el-input-number
                v-model="form.targetPressure"
                :precision="3"
                :min="0"
                placeholder="请输入目标压力"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际压力(MPa)" prop="actualPressure">
              <el-input-number
                v-model="form.actualPressure"
                :precision="3"
                :min="0"
                placeholder="请输入实际压力"
                style="width: 100%"
                @change="calculatePressureDeviation"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作员ID" prop="operatorId">
              <el-input-number
                v-model="form.operatorId"
                placeholder="请输入操作员ID"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作员姓名" prop="operatorName">
              <el-input v-model="form.operatorName" placeholder="请输入操作员姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="form.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      title="预热数据记录详情"
      v-model="detailVisible"
      width="800px"
      append-to-body
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编码">{{ detailData.recordCode }}</el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ detailData.taskId }}</el-descriptions-item>
        <el-descriptions-item label="项目ID">{{ detailData.projectId }}</el-descriptions-item>
        <el-descriptions-item label="熔盐罐编号">{{ detailData.tankNumber }}</el-descriptions-item>
        <el-descriptions-item label="记录日期">{{ detailData.recordDate }}</el-descriptions-item>
        <el-descriptions-item label="记录时间">{{ detailData.recordTime }}</el-descriptions-item>
        <el-descriptions-item label="班次">
          <el-tag :type="detailData.shift === 1 ? 'primary' : 'warning'">
            {{ detailData.shift === 1 ? '白班' : '夜班' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备状态">
          <el-tag :type="getEquipmentStatusType(detailData.equipmentStatus)">
            {{ getEquipmentStatusText(detailData.equipmentStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="目标温度">{{ detailData.targetTemperature }}°C</el-descriptions-item>
        <el-descriptions-item label="实际温度">{{ detailData.actualTemperature }}°C</el-descriptions-item>
        <el-descriptions-item label="温度偏差">
          <span :class="getDeviationClass(detailData.temperatureDeviation)">
            {{ detailData.temperatureDeviation || '-' }}°C
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="升温速率">{{ detailData.heatingRate || '-' }}°C/h</el-descriptions-item>
        <el-descriptions-item label="目标压力">{{ detailData.targetPressure || '-' }}MPa</el-descriptions-item>
        <el-descriptions-item label="实际压力">{{ detailData.actualPressure || '-' }}MPa</el-descriptions-item>
        <el-descriptions-item label="加热功率">{{ detailData.heatingPower || '-' }}kW</el-descriptions-item>
        <el-descriptions-item label="加热效率">{{ detailData.heatingEfficiency || '-' }}%</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detailData.operatorName }}</el-descriptions-item>
        <el-descriptions-item label="监督员">{{ detailData.supervisorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import {
  PreheatingDataRecordService,
  type PreheatingDataRecordVo,
  type PreheatingDataRecordBo,
  type PreheatingDataRecordQuery,
  preheatingDataRecordRules,
  SHIFT_OPTIONS,
  EQUIPMENT_STATUS_OPTIONS,
  QUALITY_STATUS_OPTIONS
} from './前端集成示例代码';

// 响应式数据
const loading = ref(false);
const recordList = ref<PreheatingDataRecordVo[]>([]);
const total = ref(0);
const dialogVisible = ref(false);
const detailVisible = ref(false);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);

// 表单引用
const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

// 查询参数
const queryParams = reactive<PreheatingDataRecordQuery>({
  pageNum: 1,
  pageSize: 10,
  recordCode: '',
  taskId: undefined,
  projectId: undefined,
  tankNumber: '',
  recordDate: '',
  qualityStatus: undefined
});

// 表单数据
const form = reactive<PreheatingDataRecordBo>({
  recordCode: '',
  taskId: 0,
  projectId: 0,
  tankNumber: '',
  recordDate: '',
  recordTime: '',
  shift: 1,
  targetTemperature: 0,
  actualTemperature: 0,
  equipmentStatus: 1,
  operatorId: 0,
  operatorName: ''
});

// 详情数据
const detailData = ref<PreheatingDataRecordVo>({} as PreheatingDataRecordVo);

// 计算属性
const dialogTitle = computed(() => {
  return form.id ? '修改预热数据记录' : '添加预热数据记录';
});

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('satoken');
  return {
    Authorization: `Bearer ${token}`
  };
});

const uploadUrl = computed(() => {
  return `${process.env.VUE_APP_API_BASE_URL}/erp/saltprocess/preheating-record/import`;
});

// 生命周期
onMounted(() => {
  getList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const response = await PreheatingDataRecordService.getList(queryParams);
    recordList.value = response.rows;
    total.value = response.total;
  } catch (error) {
    console.error('获取列表失败:', error);
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

const handleAdd = () => {
  reset();
  dialogVisible.value = true;
};

const handleUpdate = (row?: PreheatingDataRecordVo) => {
  reset();
  const recordId = row?.id || ids.value[0];
  getRecord(recordId);
};

const handleView = (row: PreheatingDataRecordVo) => {
  detailData.value = { ...row };
  detailVisible.value = true;
};

const handleDelete = async (row?: PreheatingDataRecordVo) => {
  const recordIds = row?.id ? [row.id] : ids.value;
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除选中的${recordIds.length}条记录？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await PreheatingDataRecordService.delete(recordIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

const handleExport = async () => {
  try {
    await PreheatingDataRecordService.export(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
  }
};

const handleDownloadTemplate = async () => {
  try {
    await PreheatingDataRecordService.downloadTemplate();
    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('模板下载失败:', error);
  }
};

const handleSelectionChange = (selection: PreheatingDataRecordVo[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: PreheatingDataRecordVo) => {
  // 行点击事件处理
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    if (form.id) {
      await PreheatingDataRecordService.update(form);
      ElMessage.success('修改成功');
    } else {
      await PreheatingDataRecordService.create(form);
      ElMessage.success('新增成功');
    }
    
    dialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('提交失败:', error);
  }
};

const cancel = () => {
  dialogVisible.value = false;
  reset();
};

const reset = () => {
  Object.assign(form, {
    id: undefined,
    recordCode: '',
    taskId: 0,
    projectId: 0,
    tankNumber: '',
    recordDate: '',
    recordTime: '',
    shift: 1,
    targetTemperature: 0,
    actualTemperature: 0,
    equipmentStatus: 1,
    operatorId: 0,
    operatorName: '',
    remarks: ''
  });
  formRef.value?.resetFields();
};

const getRecord = async (id: number) => {
  try {
    const response = await PreheatingDataRecordService.getById(id);
    Object.assign(form, response.data);
    dialogVisible.value = true;
  } catch (error) {
    console.error('获取记录详情失败:', error);
  }
};

// 计算温度偏差
const calculateTemperatureDeviation = () => {
  if (form.targetTemperature && form.actualTemperature) {
    const deviation = form.actualTemperature - form.targetTemperature;
    // 这里可以将偏差值设置到表单中，如果需要的话
  }
};

// 计算压力偏差
const calculatePressureDeviation = () => {
  if (form.targetPressure && form.actualPressure) {
    const deviation = form.actualPressure - form.targetPressure;
    // 这里可以将偏差值设置到表单中，如果需要的话
  }
};

// 工具方法
const getDeviationClass = (deviation: number | undefined) => {
  if (!deviation) return '';
  if (Math.abs(deviation) <= 2) return 'text-success';
  if (Math.abs(deviation) <= 5) return 'text-warning';
  return 'text-danger';
};

const getEquipmentStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    1: 'success',
    2: 'danger',
    3: 'warning'
  };
  return typeMap[status] || '';
};

const getEquipmentStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: '正常',
    2: '异常',
    3: '维护'
  };
  return textMap[status] || '未知';
};

const getQualityStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    1: 'success',
    2: 'danger',
    3: 'warning'
  };
  return typeMap[status] || '';
};

const getQualityStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: '正常',
    2: '异常',
    3: '待检查'
  };
  return textMap[status] || '未知';
};

// 文件上传相关
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel';
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!');
    return false;
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!');
    return false;
  }
  
  return true;
};

const handleImportSuccess = (response: any) => {
  if (response.code === 200) {
    ElMessage.success('导入成功');
    getList();
  } else {
    ElMessage.error(response.msg || '导入失败');
  }
};

const handleImportError = () => {
  ElMessage.error('导入失败，请检查文件格式');
};
</script>

<style scoped>
.preheating-data-record {
  padding: 20px;
}

.search-card,
.operation-card,
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

.dialog-footer {
  text-align: right;
}
</style>
