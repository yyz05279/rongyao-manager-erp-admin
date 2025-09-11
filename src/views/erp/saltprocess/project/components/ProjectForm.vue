<template>
  <div class="project-form">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      v-loading="loading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="projectName">
            <el-input
              v-model="form.projectName"
              placeholder="请输入项目名称"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目类型" prop="projectType">
            <el-select v-model="form.projectType" placeholder="请选择项目类型" style="width: 100%">
              <el-option label="二元化盐" value="BINARY_SALT" />
              <el-option label="三元化盐" value="TERNARY_SALT" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目负责人" prop="managerId">
            <el-select v-model="form.managerId" placeholder="请选择项目负责人" style="width: 100%">
              <el-option
                v-for="manager in managerList"
                :key="manager.id"
                :label="manager.name"
                :value="manager.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startDate">
            <el-date-picker
              v-model="form.startDate"
              type="date"
              placeholder="选择开始时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endDate">
            <el-date-picker
              v-model="form.endDate"
              type="date"
              placeholder="选择结束时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺配置" prop="processConfigId">
            <el-select v-model="form.processConfigId" placeholder="请选择工艺配置" style="width: 100%">
              <el-option
                v-for="config in processConfigs"
                :key="config.id"
                :label="config.configName"
                :value="config.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="质量标准" prop="qualityStandardId">
            <el-select v-model="form.qualityStandardId" placeholder="请选择质量标准" style="width: 100%">
              <el-option
                v-for="standard in qualityStandards"
                :key="standard.id"
                :label="standard.standardName"
                :value="standard.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资源计划" prop="resourcePlanId">
            <el-select v-model="form.resourcePlanId" placeholder="请选择资源计划" style="width: 100%">
              <el-option
                v-for="plan in resourcePlans"
                :key="plan.id"
                :label="plan.planName"
                :value="plan.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入项目描述"
          :rows="4"
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

<script setup name="ProjectForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getSaltProject,
  createSaltProject,
  updateSaltProject,
  getProcessConfigs,
  getQualityStandards,
  getResourcePlans
} from '@/api/erp/saltprocess/project';
import type { SaltProjectForm } from '@/api/erp/saltprocess/project/types';

// Props
interface Props {
  projectId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  projectId: ''
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
const form = reactive<SaltProjectForm>({
  id: '',
  projectName: '',
  projectType: 'BINARY_SALT',
  managerId: '',
  startDate: '',
  endDate: '',
  description: '',
  processConfigId: '',
  qualityStandardId: '',
  resourcePlanId: ''
});

// 选项数据
const managerList = ref<any[]>([]);
const processConfigs = ref<any[]>([]);
const qualityStandards = ref<any[]>([]);
const resourcePlans = ref<any[]>([]);

// 表单验证规则
const rules = {
  projectName: [
    { required: true, message: '项目名称不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '项目名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  projectType: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  managerId: [
    { required: true, message: '请选择项目负责人', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value && form.startDate && value <= form.startDate) {
          callback(new Error('结束时间必须大于开始时间'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// 监听项目类型变化，更新相关配置选项
watch(() => form.projectType, (newType) => {
  if (newType) {
    loadProcessConfigs(newType);
    loadQualityStandards(newType);
  }
});

// 生命周期
onMounted(() => {
  initData();
});

// 方法
const initData = async () => {
  await Promise.all([
    loadManagerList(),
    loadResourcePlans()
  ]);

  if (props.projectId) {
    await loadProjectData();
  } else {
    // 新增时加载默认配置
    if (form.projectType) {
      await Promise.all([
        loadProcessConfigs(form.projectType),
        loadQualityStandards(form.projectType)
      ]);
    }
  }
};

const loadProjectData = async () => {
  if (!props.projectId) return;
  
  loading.value = true;
  try {
    const { data } = await getSaltProject(props.projectId);
    Object.assign(form, {
      id: data.id,
      projectName: data.projectName,
      projectType: data.projectType,
      managerId: data.managerId,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      processConfigId: data.processConfig?.id || '',
      qualityStandardId: data.qualityStandards?.[0]?.id || '',
      resourcePlanId: data.resourcePlan?.id || ''
    });

    // 加载相关配置
    await Promise.all([
      loadProcessConfigs(data.projectType),
      loadQualityStandards(data.projectType)
    ]);
  } catch (error) {
    console.error('加载项目数据失败:', error);
    ElMessage.error('加载项目数据失败');
  } finally {
    loading.value = false;
  }
};

const loadManagerList = async () => {
  // TODO: 从用户管理API获取负责人列表
  managerList.value = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' }
  ];
};

const loadProcessConfigs = async (projectType: string) => {
  try {
    const { data } = await getProcessConfigs(projectType);
    processConfigs.value = data;
  } catch (error) {
    console.error('加载工艺配置失败:', error);
  }
};

const loadQualityStandards = async (projectType: string) => {
  try {
    const { data } = await getQualityStandards(projectType);
    qualityStandards.value = data;
  } catch (error) {
    console.error('加载质量标准失败:', error);
  }
};

const loadResourcePlans = async () => {
  try {
    const { data } = await getResourcePlans();
    resourcePlans.value = data;
  } catch (error) {
    console.error('加载资源计划失败:', error);
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (form.id) {
      await updateSaltProject(form);
      ElMessage.success('项目更新成功');
    } else {
      await createSaltProject(form);
      ElMessage.success('项目创建成功');
    }
    emit('success');
  } catch (error) {
    console.error('保存项目失败:', error);
    ElMessage.error('保存项目失败');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped lang="scss">
.project-form {
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
