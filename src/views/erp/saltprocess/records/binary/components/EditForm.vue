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
      label-width="120px"
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
            <el-form-item label="批次号" prop="batchNumber">
              <el-input v-model="formData.batchNumber" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目ID" prop="projectId">
              <el-input v-model="formData.projectId" placeholder="请输入项目ID" />
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
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="持续时间" prop="duration">
              <el-input-number
                v-model="formData.duration"
                placeholder="持续时间(分钟)"
                :min="1"
                :max="1440"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- NaNO3配比信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">⚗️ NaNO3 (硝酸钠) 配比信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标配比(%)" prop="nano3TargetRatio">
              <el-input-number
                v-model="formData.nano3TargetRatio"
                :precision="2"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际配比(%)" prop="nano3ActualRatio">
              <el-input-number
                v-model="formData.nano3ActualRatio"
                :precision="2"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标用量(kg)" prop="nano3TargetWeight">
              <el-input-number
                v-model="formData.nano3TargetWeight"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际用量(kg)" prop="nano3ActualWeight">
              <el-input-number
                v-model="formData.nano3ActualWeight"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- KNO3配比信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">🧪 KNO3 (硝酸钾) 配比信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标配比(%)" prop="kno3TargetRatio">
              <el-input-number
                v-model="formData.kno3TargetRatio"
                :precision="2"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际配比(%)" prop="kno3ActualRatio">
              <el-input-number
                v-model="formData.kno3ActualRatio"
                :precision="2"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标用量(kg)" prop="kno3TargetWeight">
              <el-input-number
                v-model="formData.kno3TargetWeight"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际用量(kg)" prop="kno3ActualWeight">
              <el-input-number
                v-model="formData.kno3ActualWeight"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
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
            <el-form-item label="反应温度(°C)" prop="reactionTemperature">
              <el-input-number
                v-model="formData.reactionTemperature"
                :precision="1"
                :min="0"
                :max="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反应压力(MPa)" prop="reactionPressure">
              <el-input-number
                v-model="formData.reactionPressure"
                :precision="2"
                :min="0"
                :max="10"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="反应时间(分钟)" prop="reactionTime">
              <el-input-number
                v-model="formData.reactionTime"
                :min="1"
                :max="1440"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 质量指标 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">📊 质量指标</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="实际产量(kg)" prop="actualOutput">
              <el-input-number
                v-model="formData.actualOutput"
                :precision="2"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="产出率(%)" prop="yieldRate">
              <el-input-number
                v-model="formData.yieldRate"
                :precision="2"
                :min="0"
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="质量等级" prop="qualityGrade">
              <el-select v-model="formData.qualityGrade" placeholder="请选择质量等级" style="width: 100%">
                <el-option label="优秀" :value="1" />
                <el-option label="良好" :value="2" />
                <el-option label="合格" :value="3" />
                <el-option label="不合格" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 操作信息 -->
      <el-card class="form-card" shadow="never">
        <template #header>
          <span class="card-title">👤 操作信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="操作员" prop="operatorName">
              <el-input v-model="formData.operatorName" placeholder="请输入操作员姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
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

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getBinaryRecord, addBinaryRecord, updateBinaryRecord } from '@/api/erp/saltprocess/records/binary';
import type { BinaryRecordForm, BinaryRecordVO } from '@/api/erp/saltprocess/records/binary/types';

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

// 计算属性
const isEdit = computed(() => !!props.recordId);

// 表单数据
const formData = reactive<BinaryRecordForm>({
  recordCode: '',
  batchNumber: '',
  projectId: '',
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

// 表单验证规则
const formRules: FormRules = {
  recordCode: [
    { required: true, message: '请输入记录编码', trigger: 'blur' }
  ],
  batchNumber: [
    { required: true, message: '请输入批次号', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请输入项目ID', trigger: 'blur' }
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
    const { data } = await getBinaryRecord(props.recordId);
    Object.assign(formData, data);
  } catch (error) {
    ElMessage.error('获取记录详情失败');
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
    projectId: '',
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
    if (isEdit.value) {
      await updateBinaryRecord({ ...formData, id: props.recordId });
      ElMessage.success('更新成功');
    } else {
      await addBinaryRecord(formData);
      ElMessage.success('保存成功');
    }
    emit('success');
    handleClose();
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '保存失败');
    console.error('提交失败:', error);
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

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
