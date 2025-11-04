<template>
  <div class="subsystem-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="子系统编号" prop="subsystemCode">
            <el-input
              v-model="form.subsystemCode"
              placeholder="不填写则自动生成"
              :disabled="!!form.id"
            >
              <template #append>
                <el-button
                  v-if="!form.id"
                  icon="Refresh"
                  @click="handleGenerateCode"
                  :loading="generateCodeLoading"
                >
                  生成
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="子系统名称" prop="subsystemName">
            <el-input v-model="form.subsystemName" placeholder="请输入子系统名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联项目" prop="projectId">
            <el-select
              v-model="form.projectId"
              placeholder="请选择关联项目"
              clearable
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
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="请输入分类(如:机械、电气)" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="responsiblePerson">
            <el-input v-model="form.responsiblePerson" placeholder="请输入负责人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="生效" value="ACTIVE" />
              <el-option label="停用" value="INACTIVE" />
              <el-option label="归档" value="ARCHIVED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="form.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="form.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-input-number
              v-model="form.priority"
              :min="1"
              :max="10"
              placeholder="1-10"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述信息"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script setup name="SubsystemForm" lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  getSubsystem,
  addSubsystem,
  updateSubsystem,
  generateSubsystemCode,
  checkSubsystemCodeUnique
} from '@/api/erp/subsystem';
import { listProject } from '@/api/erp/project';
import type { SubsystemForm } from '@/api/erp/subsystem/types';
import type { ProjectVO } from '@/api/erp/project/types';

// Props
interface Props {
  subsystemId?: string | number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const buttonLoading = ref(false);
const generateCodeLoading = ref(false);
const projectList = ref<ProjectVO[]>([]);

// 表单数据
const initFormData: SubsystemForm = {
  id: undefined,
  subsystemCode: '',
  subsystemName: '',
  projectId: 0,
  projectName: '',
  category: '',
  description: '',
  responsiblePerson: '',
  responsiblePersonId: undefined,
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  priority: 1,
  remarks: ''
};

const form = reactive<SubsystemForm>({ ...initFormData });

// 当前选中的项目编码
const selectedProjectCode = computed(() => {
  const project = projectList.value.find(p => p.id === form.projectId);
  return project?.projectCode || '';
});

// 自定义编号唯一性校验
const validateCodeUnique = async (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
    return;
  }

  try {
    const response = await checkSubsystemCodeUnique(value, form.id);
    if (response.data === false) {
      callback(new Error('子系统编号已存在'));
    } else {
      callback();
    }
  } catch (error) {
    callback();
  }
};

// 表单验证规则
const rules = reactive<FormRules>({
  subsystemCode: [
    { validator: validateCodeUnique, trigger: 'blur' }
  ],
  subsystemName: [
    { required: true, message: '请输入子系统名称', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择关联项目', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 生命周期
onMounted(() => {
  getProjectList();
  if (props.subsystemId) {
    getSubsystemDetail();
  }
});

// 监听subsystemId变化
watch(() => props.subsystemId, (newVal) => {
  if (newVal) {
    getSubsystemDetail();
  } else {
    reset();
  }
});

// 获取项目列表
const getProjectList = async () => {
  try {
    const response = await listProject({ pageNum: 1, pageSize: 100 });
    const actualResponse = response as any;
    projectList.value = actualResponse.rows || [];
  } catch (error) {
    console.error('获取项目列表失败:', error);
  }
};

// 获取子系统详情
const getSubsystemDetail = async () => {
  try {
    const res = await getSubsystem(props.subsystemId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取子系统详情失败:', error);
    ElMessage.error('获取子系统详情失败');
  }
};

// 生成编号
const handleGenerateCode = async () => {
  if (!form.projectId) {
    ElMessage.warning('请先选择关联项目');
    return;
  }

  if (!selectedProjectCode.value) {
    ElMessage.warning('所选项目没有项目编号');
    return;
  }

  generateCodeLoading.value = true;
  try {
    const response = await generateSubsystemCode(selectedProjectCode.value);
    form.subsystemCode = response.data;
    ElMessage.success('编号生成成功');
  } catch (error) {
    console.error('生成编号失败:', error);
    ElMessage.error('生成编号失败');
  } finally {
    generateCodeLoading.value = false;
  }
};

// 项目变更事件
const handleProjectChange = (projectId: number) => {
  const project = projectList.value.find(p => p.id === projectId);
  if (project) {
    form.projectName = project.projectName;
    // 清空编号,因为项目变了
    if (!form.id) {
      form.subsystemCode = '';
    }
  }
};

// 表单重置
const reset = () => {
  Object.assign(form, initFormData);
  formRef.value?.resetFields();
};

// 取消
const cancel = () => {
  reset();
  emit('cancel');
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (form.id) {
          await updateSubsystem(form);
          ElMessage.success('修改成功');
        } else {
          await addSubsystem(form);
          ElMessage.success('新增成功');
        }
        emit('success');
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('操作失败');
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.subsystem-form {
  .dialog-footer {
    text-align: right;
  }
}
</style>

