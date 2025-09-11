<template>
  <div class="preheating-task-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      v-loading="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目" prop="projectId">
            <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%" @change="handleProjectChange">
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
          <el-form-item label="反应罐" prop="tankId">
            <el-select v-model="form.tankId" placeholder="请选择反应罐" style="width: 100%">
              <el-option
                v-for="tank in tankList"
                :key="tank.id"
                :label="tank.name"
                :value="tank.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="目标温度" prop="targetTemperature">
            <el-input-number
              v-model="form.targetTemperature"
              :min="0"
              :max="1000"
              :precision="1"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>°C</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标压力" prop="targetPressure">
            <el-input-number
              v-model="form.targetPressure"
              :min="0"
              :max="50"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>MPa</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="温度容差" prop="tolerance">
            <el-input-number
              v-model="form.tolerance"
              :min="0"
              :max="50"
              :precision="1"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>°C</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="持续时间" prop="duration">
            <el-input-number
              v-model="form.duration"
              :min="1"
              :max="1440"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>分钟</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="升温速率" prop="heatingRate">
            <el-input-number
              v-model="form.heatingRate"
              :min="0.1"
              :max="20"
              :precision="1"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>°C/min</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作员" prop="operatorId">
            <el-select v-model="form.operatorId" placeholder="请选择操作员" style="width: 100%">
              <el-option
                v-for="operator in operatorList"
                :key="operator.id"
                :label="operator.name"
                :value="operator.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划开始时间" prop="plannedStartTime">
            <el-date-picker
              v-model="form.plannedStartTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划结束时间" prop="plannedEndTime">
            <el-date-picker
              v-model="form.plannedEndTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 工艺参数配置 -->
      <el-divider content-position="left">工艺参数配置</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="搅拌速度" prop="stirringSpeed">
            <el-input-number
              v-model="form.stirringSpeed"
              :min="0"
              :max="1000"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>rpm</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="进料速率" prop="feedRate">
            <el-input-number
              v-model="form.feedRate"
              :min="0"
              :max="100"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>kg/min</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="循环流量" prop="circulationFlow">
            <el-input-number
              v-model="form.circulationFlow"
              :min="0"
              :max="1000"
              :precision="1"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>L/min</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 安全参数配置 -->
      <el-divider content-position="left">安全参数配置</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="最高温度限制" prop="maxTemperatureLimit">
            <el-input-number
              v-model="form.maxTemperatureLimit"
              :min="0"
              :max="1200"
              :precision="1"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>°C</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最高压力限制" prop="maxPressureLimit">
            <el-input-number
              v-model="form.maxPressureLimit"
              :min="0"
              :max="100"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            >
              <template #append>MPa</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="紧急停止条件" prop="emergencyStopCondition">
            <el-select v-model="form.emergencyStopCondition" placeholder="请选择条件" style="width: 100%">
              <el-option label="温度超限" value="TEMPERATURE_EXCEED" />
              <el-option label="压力超限" value="PRESSURE_EXCEED" />
              <el-option label="设备故障" value="EQUIPMENT_FAILURE" />
              <el-option label="手动停止" value="MANUAL_STOP" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          placeholder="请输入备注信息"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ form.id ? '更新' : '创建' }}
      </el-button>
    </div>
  </div>
</template>

<script setup name="PreheatingTaskForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getPreheatingTask,
  createPreheatingTask,
  updatePreheatingTask,
  getProjectList,
  getTankList,
  getOperatorList
} from '@/api/erp/saltprocess/preheating';
import type { PreheatingTaskForm } from '@/api/erp/saltprocess/preheating/types';

// Props
interface Props {
  taskId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  taskId: ''
});

// Emits
interface Emits {
  success: [];
  cancel: [];
}

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const formRef = ref();

// 表单数据
const form = reactive<PreheatingTaskForm>({
  id: '',
  projectId: '',
  tankId: '',
  targetTemperature: 80,
  targetPressure: 0.5,
  tolerance: 2,
  duration: 60,
  heatingRate: 2,
  operatorId: '',
  plannedStartTime: '',
  plannedEndTime: '',
  stirringSpeed: 100,
  feedRate: 5,
  circulationFlow: 50,
  maxTemperatureLimit: 120,
  maxPressureLimit: 2,
  emergencyStopCondition: 'TEMPERATURE_EXCEED',
  remarks: ''
});

// 选项数据
const projectList = ref<any[]>([]);
const tankList = ref<any[]>([]);
const operatorList = ref<any[]>([]);

// 表单验证规则
const rules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  tankId: [
    { required: true, message: '请选择反应罐', trigger: 'change' }
  ],
  targetTemperature: [
    { required: true, message: '请输入目标温度', trigger: 'blur' },
    { type: 'number', min: 0, max: 1000, message: '温度范围为0-1000°C', trigger: 'blur' }
  ],
  targetPressure: [
    { required: true, message: '请输入目标压力', trigger: 'blur' },
    { type: 'number', min: 0, max: 50, message: '压力范围为0-50MPa', trigger: 'blur' }
  ],
  tolerance: [
    { required: true, message: '请输入温度容差', trigger: 'blur' },
    { type: 'number', min: 0, max: 50, message: '容差范围为0-50°C', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入持续时间', trigger: 'blur' },
    { type: 'number', min: 1, max: 1440, message: '时间范围为1-1440分钟', trigger: 'blur' }
  ],
  heatingRate: [
    { required: true, message: '请输入升温速率', trigger: 'blur' },
    { type: 'number', min: 0.1, max: 20, message: '升温速率范围为0.1-20°C/min', trigger: 'blur' }
  ],
  operatorId: [
    { required: true, message: '请选择操作员', trigger: 'change' }
  ],
  plannedStartTime: [
    { required: true, message: '请选择计划开始时间', trigger: 'change' }
  ],
  plannedEndTime: [
    { required: true, message: '请选择计划结束时间', trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value && form.plannedStartTime && value <= form.plannedStartTime) {
          callback(new Error('结束时间必须大于开始时间'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// 监听项目变化，自动计算结束时间
watch(() => form.duration, (newDuration) => {
  if (form.plannedStartTime && newDuration) {
    const startTime = new Date(form.plannedStartTime);
    const endTime = new Date(startTime.getTime() + newDuration * 60 * 1000);
    form.plannedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
  }
});

watch(() => form.plannedStartTime, (newStartTime) => {
  if (newStartTime && form.duration) {
    const startTime = new Date(newStartTime);
    const endTime = new Date(startTime.getTime() + form.duration * 60 * 1000);
    form.plannedEndTime = endTime.toISOString().slice(0, 19).replace('T', ' ');
  }
});

// 生命周期
onMounted(() => {
  initData();
});

// 方法
const initData = async () => {
  await Promise.all([
    loadProjectList(),
    loadTankList(),
    loadOperatorList()
  ]);

  if (props.taskId) {
    await loadTaskData();
  }
};

const loadTaskData = async () => {
  if (!props.taskId) return;
  
  loading.value = true;
  try {
    const { data } = await getPreheatingTask(props.taskId);
    Object.assign(form, {
      id: data.id,
      projectId: data.projectId,
      tankId: data.tankId,
      targetTemperature: data.targetTemperature,
      targetPressure: data.targetPressure,
      tolerance: data.tolerance,
      duration: data.duration,
      heatingRate: data.heatingRate,
      operatorId: data.operatorId,
      plannedStartTime: data.plannedStartTime,
      plannedEndTime: data.plannedEndTime,
      stirringSpeed: data.processConfig?.stirringSpeed || 100,
      feedRate: data.processConfig?.feedRate || 5,
      circulationFlow: data.processConfig?.circulationFlow || 50,
      maxTemperatureLimit: data.safetyConfig?.maxTemperatureLimit || 120,
      maxPressureLimit: data.safetyConfig?.maxPressureLimit || 2,
      emergencyStopCondition: data.safetyConfig?.emergencyStopCondition || 'TEMPERATURE_EXCEED',
      remarks: data.remarks || ''
    });
  } catch (error) {
    console.error('加载任务数据失败:', error);
    ElMessage.error('加载任务数据失败');
  } finally {
    loading.value = false;
  }
};

const loadProjectList = async () => {
  try {
    const { data } = await getProjectList();
    projectList.value = data;
  } catch (error) {
    console.error('加载项目列表失败:', error);
  }
};

const loadTankList = async () => {
  try {
    const { data } = await getTankList();
    tankList.value = data;
  } catch (error) {
    console.error('加载反应罐列表失败:', error);
  }
};

const loadOperatorList = async () => {
  try {
    const { data } = await getOperatorList();
    operatorList.value = data;
  } catch (error) {
    console.error('加载操作员列表失败:', error);
  }
};

const handleProjectChange = (projectId: string) => {
  // 项目变化时可以加载对应的工艺配置
  console.log('项目变化:', projectId);
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (form.id) {
      await updatePreheatingTask(form);
      ElMessage.success('预热任务更新成功');
    } else {
      await createPreheatingTask(form);
      ElMessage.success('预热任务创建成功');
    }
    emit('success');
  } catch (error) {
    console.error('保存预热任务失败:', error);
    ElMessage.error('保存预热任务失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped lang="scss">
.preheating-task-form {
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebeef5;
  }

  .el-divider {
    margin: 24px 0 16px 0;
  }
}
</style>
