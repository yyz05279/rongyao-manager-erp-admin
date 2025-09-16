<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleDialogVisibleChange"
    :title="title"
    width="80%"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      v-loading="loading"
    >
      <!-- 基本信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">📋 基本信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="记录编码" prop="recordCode">
              <el-input v-model="formData.recordCode" placeholder="请输入记录编码" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称" prop="projectName">
              <el-select
                v-model="formData.projectName"
                placeholder="请选择项目名称"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="project in projectList"
                  :key="project.id"
                  :label="project.projectName"
                  :value="project.projectName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="记录日期" prop="recordDate">
              <el-date-picker
                v-model="formData.recordDate"
                type="date"
                placeholder="选择记录日期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="班次" prop="shift">
              <el-select v-model="formData.shift" placeholder="请选择班次" style="width: 100%">
                <el-option label="白班" :value="1" />
                <el-option label="夜班" :value="2" />
              </el-select>
              <div class="shift-display" v-if="formData.shift">
                <el-tag :type="formData.shift === 1 ? 'primary' : 'warning'">
                  {{ formData.shift === 1 ? '白班' : '夜班' }}
                </el-tag>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 化盐重量信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">⚗️ 化盐重量信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="硝酸钠(t)" prop="nano3ActualWeight">
              <el-input-number
                v-model="formData.nano3ActualWeight"
                :precision="0"
                :min="0"
                style="width: 100%"
                placeholder="单位：kg"
              />
              <div class="weight-display" v-if="formData.nano3ActualWeight">
                显示：{{ formatWeight(formData.nano3ActualWeight) }}吨
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="硝酸钾(t)" prop="kno3ActualWeight">
              <el-input-number
                v-model="formData.kno3ActualWeight"
                :precision="0"
                :min="0"
                style="width: 100%"
                placeholder="单位：kg"
              />
              <div class="weight-display" v-if="formData.kno3ActualWeight">
                显示：{{ formatWeight(formData.kno3ActualWeight) }}吨
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="硝酸钠：硝酸钾">
              <div class="ratio-display">
                <span :class="getRatioClass(formData)">
                  {{ formatRatio(formData.nano3ActualWeight, formData.kno3ActualWeight) }}
                </span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="总计化盐(t)">
              <div class="total-weight-display">
                {{ formatWeight(getTotalSaltWeight(formData)) }}吨
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 工艺参数 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">🌡️ 工艺参数</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="熔盐液位(m)" prop="moltenSaltLevel">
              <el-input-number
                v-model="formData.moltenSaltLevel"
                :precision="1"
                :min="0"
                :max="10"
                style="width: 100%"
                placeholder="熔盐罐液位"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="熔盐温度(℃)" prop="moltenSaltTemperature">
              <el-input-number
                v-model="formData.moltenSaltTemperature"
                :precision="0"
                :min="0"
                :max="1000"
                style="width: 100%"
                placeholder="熔盐罐温度"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 能耗数据 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">⚡ 能耗数据</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="天然气耗量(Nm³)" prop="gasConsumption">
              <el-input-number
                v-model="formData.gasConsumption"
                :precision="0"
                :min="0"
                style="width: 100%"
                placeholder="每班天然气耗量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用电量(KWh)" prop="powerConsumption">
              <el-input-number
                v-model="formData.powerConsumption"
                :precision="0"
                :min="0"
                style="width: 100%"
                placeholder="每班用电量"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 人员信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">👤 人员信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="人数" prop="staffCount">
              <el-input-number
                v-model="formData.staffCount"
                :precision="0"
                :min="1"
                :max="50"
                style="width: 100%"
                placeholder="当班人数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="记录人" prop="recorderName">
              <el-input v-model="formData.recorderName" placeholder="请输入记录人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="EditForm" lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getBinaryRecord, addBinaryRecord, updateBinaryRecord, getProjectList } from '@/api/erp/saltprocess/records/binary';
import type { BinaryRecordForm } from '@/api/erp/saltprocess/records/binary/types';

// Props
interface Props {
  visible: boolean;
  title: string;
  recordId?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  recordId: null
});

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [];
}>();

// 响应式数据
const loading = ref(false);
const formRef = ref<FormInstance>();
const projectList = ref<any[]>([]);

// 计算属性
const isEdit = computed(() => !!props.recordId);

// 表单数据
const formData = reactive<BinaryRecordForm>({
  recordCode: '',
  batchNumber: '',
  projectId: 101,
  projectName: '阿克塞化盐服务项目',  // 默认选择阿克塞项目
  recordDate: '',
  startTime: '',
  endTime: '',
  shift: 1,
  nano3TargetRatio: 0,
  nano3ActualRatio: 0,
  nano3TargetWeight: 0,
  nano3ActualWeight: 0,
  kno3TargetRatio: 0,
  kno3ActualRatio: 0,
  kno3TargetWeight: 0,
  kno3ActualWeight: 0,
  reactionTemperature: 0,
  reactionTime: 0,
  stirringSpeed: 0,
  heatingPower: 0,
  phValue: 0,
  density: 0,
  moistureContent: 0,
  purity: 0,
  qualityGrade: 1,
  qualityCheckResult: 1,
  qualityIssues: '',
  correctiveActions: '',
  targetOutput: 0,
  actualOutput: 0,
  materialCost: 0,
  energyCost: 0,
  laborCost: 0,
  moltenSaltLevel: 0,
  moltenSaltTemperature: 0,
  gasConsumption: 0,
  powerConsumption: 0,
  staffCount: 1,
  recorderName: '',
  cumulativeSaltAmount: 0,
  operatorId: 1,
  supervisorId: 1,
  remarks: ''
});

// 项目名称映射
const getProjectName = (projectId: number) => {
  const projectMap: Record<number, string> = {
    101: '阿克塞化盐服务项目',
    102: '青海盐湖项目',
    103: '新疆化工项目',
    104: '内蒙古盐化项目'
  };
  return projectMap[projectId] || `项目${projectId}`;
};

// 格式化重量显示（吨）- 复用列表页面函数
const formatWeight = (weight: number) => {
  if (!weight && weight !== 0) return '-';
  return (weight / 1000).toFixed(2); // 将kg转换为吨，保留2位小数
};

// 计算总化盐重量 - 复用列表页面函数
const getTotalSaltWeight = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;
  return nano3Weight + kno3Weight;
};

// 格式化配比显示 - 复用列表页面函数
const formatRatio = (nano3Weight: number, kno3Weight: number) => {
  if (!nano3Weight && !kno3Weight) return '-';
  if (!nano3Weight) return `0:${(kno3Weight / 1000).toFixed(1)}`;
  if (!kno3Weight) return `${(nano3Weight / 1000).toFixed(1)}:0`;

  // 计算比例并简化
  const total = nano3Weight + kno3Weight;
  const nano3Ratio = (nano3Weight / total * 10).toFixed(1);
  const kno3Ratio = (kno3Weight / total * 10).toFixed(1);

  return `${nano3Ratio}:${kno3Ratio}`;
};

// 获取配比样式类 - 复用列表页面函数
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

// 表单验证规则
const formRules: FormRules = {
  recordCode: [
    { required: true, message: '请输入记录编码', trigger: 'blur' }
  ],
  batchNumber: [
    { required: true, message: '请输入批次号', trigger: 'blur' }
  ],
  projectName: [
    { required: true, message: '请选择项目名称', trigger: 'change' }
  ],
  recordDate: [
    { required: true, message: '请选择记录日期', trigger: 'change' }
  ],
  shift: [
    { required: true, message: '请选择班次', trigger: 'change' }
  ],
  operatorName: [
    { required: true, message: '请输入操作员姓名', trigger: 'blur' }
  ]
};

// 加载项目列表
const loadProjectList = async () => {
  try {
    const response = await getProjectList();
    // 处理API响应数据
    if (response && response.data) {
      projectList.value = Array.isArray(response.data) ? response.data : [];
    } else {
      projectList.value = [];
    }
  } catch (error) {
    console.error('加载项目列表失败:', error);
    // 如果API失败，使用默认项目列表
    projectList.value = [
      { id: '101', projectName: '阿克塞化盐服务项目' },
      { id: '102', projectName: '青海盐湖项目' },
      { id: '103', projectName: '新疆化工项目' }
    ];
  }
};

// 生命周期
onMounted(() => {
  loadProjectList();
});

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal && props.recordId) {
    getRecordDetail();
  } else if (newVal) {
    resetForm();
  }
});

// 获取记录详情
const getRecordDetail = async () => {
  if (!props.recordId) return;

  loading.value = true;
  try {
    const response = await getBinaryRecord(props.recordId);
    // 直接使用返回的数据，假设API返回的就是记录对象
    const recordData = response.data;

    // 将项目ID转换为项目名称
    const extendedRecordData = recordData as any;
    if (extendedRecordData.projectId) {
      const project = projectList.value.find(p => p.id == extendedRecordData.projectId);
      extendedRecordData.projectName = project ? project.projectName : '未知项目';
    }

    Object.assign(formData, extendedRecordData);
  } catch (error: any) {
    ElMessage.error(`获取记录详情失败: ${error.message || '请检查API服务状态'}`);
    console.error('获取记录详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    recordCode: '',
    batchNumber: '',
    projectId: 101,
    projectName: '阿克塞化盐服务项目',
    recordDate: '',
    shift: 1,
    duration: 0,
    nano3TargetRatio: 0,
    nano3ActualRatio: 0,
    nano3TargetWeight: 0,
    nano3ActualWeight: 0,
    kno3TargetRatio: 0,
    kno3ActualRatio: 0,
    kno3TargetWeight: 0,
    kno3ActualWeight: 0,
    reactionTemperature: 0,
    reactionPressure: 0,
    reactionTime: 0,
    actualOutput: 0,
    yieldRate: 0,
    qualityGrade: 1,
    operatorName: '',
    remark: ''
  });
  formRef.value?.clearValidate();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    // 准备提交数据，将项目名称转换为项目ID
    const submitData = { ...formData };
    if (submitData.projectName) {
      const selectedProject = projectList.value.find(p => p.projectName === submitData.projectName);
      if (selectedProject) {
        submitData.projectId = selectedProject.id;
      }
      // 删除projectName字段，因为后端不需要
      delete submitData.projectName;
    }

    if (isEdit.value) {
      // 更新记录
      const response = await updateBinaryRecord({ ...submitData, id: props.recordId || undefined });
      if (response.code === 200) {
        ElMessage.success('更新成功');
      } else {
        throw new Error(response.msg || '更新失败');
      }
    } else {
      // 新增记录
      const response = await addBinaryRecord(submitData);
      if (response.code === 200) {
        ElMessage.success('保存成功');
      } else {
        throw new Error(response.msg || '保存失败');
      }
    }
    emit('success');
    handleClose();
  } catch (error: any) {
    console.error('API调用失败:', error);
    ElMessage.error(`${isEdit.value ? '更新' : '保存'}失败: ${error.message || '请检查API服务状态'}`);
  } finally {
    loading.value = false;
  }
};

// 处理弹窗可见性变化
const handleDialogVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.form-card {
  margin-bottom: 20px;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.dialog-footer {
  text-align: right;
}

// 项目信息显示
.project-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

// 班次显示
.shift-display {
  margin-top: 8px;
}

// 重量显示
.weight-display {
  font-size: 12px;
  color: #409eff;
  margin-top: 4px;
  font-weight: 500;
}

// 配比显示
.ratio-display {
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 总重量显示
.total-weight-display {
  padding: 8px 12px;
  background-color: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  text-align: center;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 配比颜色样式 - 与列表页面保持一致
.text-success {
  color: #67c23a !important;
}

.text-warning {
  color: #e6a23c !important;
}

.text-danger {
  color: #f56c6c !important;
}

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EditForm'
});
</script>
