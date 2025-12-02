<template>
  <div class="saltmaking-task-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              placeholder="请选择项目"
              style="width: 100%"
              @change="handleProjectChange"
            >
              <el-option
                v-for="project in projectList"
                :key="project.id"
                :label="project.projectName"
                :value="project.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="反应罐" prop="reactorId">
            <el-select
              v-model="formData.reactorId"
              placeholder="请选择反应罐"
              style="width: 100%"
            >
              <el-option
                v-for="reactor in reactorList"
                :key="reactor.id"
                :label="reactor.name"
                :value="reactor.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="化盐类型" prop="saltType">
            <el-select
              v-model="formData.saltType"
              placeholder="请选择化盐类型"
              style="width: 100%"
              @change="handleSaltTypeChange"
            >
              <el-option label="二元化盐" value="BINARY_SALT" />
              <el-option label="三元化盐" value="TERNARY_SALT" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标产量" prop="targetOutput">
            <el-input-number
              v-model="formData.targetOutput"
              :min="1"
              :max="10000"
              :precision="2"
              placeholder="请输入目标产量"
              style="width: 100%"
            >
              <template #append>kg</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="操作员" prop="operatorId">
            <el-select
              v-model="formData.operatorId"
              placeholder="请选择操作员"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="operator in operatorList"
                :key="operator.id"
                :label="operator.name"
                :value="operator.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配比配置" prop="ratioConfigId">
            <el-select
              v-model="formData.ratioConfigId"
              placeholder="请选择配比配置"
              style="width: 100%"
            >
              <el-option
                v-for="config in ratioConfigList"
                :key="config.id"
                :label="config.name"
                :value="config.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划开始时间" prop="plannedStartTime">
            <el-date-picker
              v-model="formData.plannedStartTime"
              type="datetime"
              placeholder="请选择计划开始时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划结束时间" prop="plannedEndTime">
            <el-date-picker
              v-model="formData.plannedEndTime"
              type="datetime"
              placeholder="请选择计划结束时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">工艺参数</el-divider>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="目标温度" prop="targetTemperature">
            <el-input-number
              v-model="formData.targetTemperature"
              :min="0"
              :max="500"
              :precision="1"
              placeholder="请输入目标温度"
              style="width: 100%"
            >
              <template #append>°C</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="目标压力" prop="targetPressure">
            <el-input-number
              v-model="formData.targetPressure"
              :min="0"
              :max="10"
              :precision="2"
              placeholder="请输入目标压力"
              style="width: 100%"
            >
              <template #append>MPa</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="搅拌速度" prop="stirringSpeed">
            <el-input-number
              v-model="formData.stirringSpeed"
              :min="0"
              :max="1000"
              :precision="0"
              placeholder="请输入搅拌速度"
              style="width: 100%"
            >
              <template #append>rpm</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ formData.id ? '更新' : '创建' }}
      </el-button>
    </div>
  </div>
</template>

<script setup name="SaltmakingTaskForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, FormRules } from 'element-plus';
import {
  getSaltmakingTask,
  createSaltmakingTask,
  updateSaltmakingTask
} from '@/api/erp/saltprocess/saltmaking';
import type { SaltmakingTaskForm } from '@/api/erp/saltprocess/saltmaking/types';
import { SaltType } from '@/api/erp/saltprocess/types';

// Props
interface Props {
  taskId?: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const formRef = ref();

const formData = reactive<SaltmakingTaskForm>({
  id: '',
  projectId: '',
  reactorId: '',
  saltType: SaltType.BINARY,
  targetOutput: 1000,
  operatorId: '',
  plannedStartTime: '',
  plannedEndTime: '',
  targetTemperature: 250,
  targetPressure: 0.2,
  stirringSpeed: 100,
  ratioConfigId: '',
  remarks: ''
});

// 选项数据
const projectList = ref<any[]>([]);
const reactorList = ref<any[]>([]);
const operatorList = ref<any[]>([]);
const ratioConfigList = ref<any[]>([]);

// 表单验证规则
const formRules: FormRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  reactorId: [{ required: true, message: '请选择反应罐', trigger: 'change' }],
  saltType: [{ required: true, message: '请选择化盐类型', trigger: 'change' }],
  targetOutput: [{ required: true, message: '请输入目标产量', trigger: 'blur' }],
  operatorId: [{ required: true, message: '请选择操作员', trigger: 'change' }],
  plannedStartTime: [{ required: true, message: '请选择计划开始时间', trigger: 'change' }],
  plannedEndTime: [{ required: true, message: '请选择计划结束时间', trigger: 'change' }],
  targetTemperature: [{ required: true, message: '请输入目标温度', trigger: 'blur' }],
  targetPressure: [{ required: true, message: '请输入目标压力', trigger: 'blur' }],
  stirringSpeed: [{ required: true, message: '请输入搅拌速度', trigger: 'blur' }],
  ratioConfigId: [{ required: true, message: '请选择配比配置', trigger: 'change' }]
};

// 监听taskId变化
watch(() => props.taskId, (newVal) => {
  if (newVal) {
    loadTaskData(newVal);
  } else {
    resetForm();
  }
}, { immediate: true });

// 生命周期
onMounted(() => {
  loadSelectOptions();
});

// 方法
const loadTaskData = async (taskId: string) => {
  loading.value = true;
  try {
    const { data } = await getSaltmakingTask(taskId);
    Object.assign(formData, data);
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const loadSelectOptions = async () => {
  // TODO: 加载选项数据
  // 模拟数据
  projectList.value = [
    { id: '1', projectName: '项目A - 二元化盐生产' },
    { id: '2', projectName: '项目B - 三元化盐生产' }
  ];
  
  reactorList.value = [
    { id: '1', name: '反应罐1号 (容量: 2000L)' },
    { id: '2', name: '反应罐2号 (容量: 3000L)' },
    { id: '3', name: '反应罐3号 (容量: 2500L)' }
  ];
  
  operatorList.value = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' }
  ];
  
  ratioConfigList.value = [
    { id: '1', name: '标准二元配比 (NaNO3:60%, KNO3:40%)' },
    { id: '2', name: '标准三元配比 (NaNO3:53%, KNO3:40%, NaNO2:7%)' },
    { id: '3', name: '高效二元配比 (NaNO3:65%, KNO3:35%)' }
  ];
};

const handleProjectChange = (projectId: string) => {
  // 根据项目类型自动设置默认参数
  const project = projectList.value.find(p => p.id === projectId);
  if (project?.projectName.includes('三元')) {
    formData.saltType = SaltType.TERNARY_SALT;
    formData.targetTemperature = 220;
  } else {
    formData.saltType = SaltType.BINARY_SALT;
    formData.targetTemperature = 250;
  }
};

const handleSaltTypeChange = (saltType: string) => {
  // 根据化盐类型调整默认参数
  if (saltType === 'TERNARY_SALT') {
    formData.targetTemperature = 220;
    formData.targetPressure = 0.15;
  } else {
    formData.targetTemperature = 250;
    formData.targetPressure = 0.2;
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    submitting.value = true;
    
    if (formData.id) {
      await updateSaltmakingTask(formData);
      ElMessage.success('任务更新成功');
    } else {
      await createSaltmakingTask(formData);
      ElMessage.success('任务创建成功');
    }
    
    emit('success');
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};

const resetForm = () => {
  Object.assign(formData, {
    id: '',
    projectId: '',
    reactorId: '',
    saltType: 'BINARY_SALT',
    targetOutput: 1000,
    operatorId: '',
    plannedStartTime: '',
    plannedEndTime: '',
    targetTemperature: 250,
    targetPressure: 0.2,
    stirringSpeed: 100,
    ratioConfigId: '',
    remarks: ''
  });
  formRef.value?.resetFields();
};
</script>

<style scoped lang="scss">
.saltmaking-task-form {
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
  }
}
</style>
