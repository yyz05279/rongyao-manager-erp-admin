<template>
  <div class="subsystem-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="子系统编码" prop="subsystemCode">
        <el-input v-model="form.subsystemCode" placeholder="请输入子系统编码" />
      </el-form-item>
      <el-form-item label="子系统名称" prop="subsystemName">
        <el-input v-model="form.subsystemName" placeholder="请输入子系统名称" />
      </el-form-item>
      <el-form-item label="关联项目" prop="projectId">
        <el-select v-model="form.projectId" placeholder="请选择关联项目" clearable style="width: 100%">
          <el-option
            v-for="project in projectList"
            :key="project.id"
            :label="project.projectName"
            :value="project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述信息"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
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
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getSubsystem, addSubsystem, updateSubsystem } from '@/api/erp/subsystem';
import { listSaltProject } from '@/api/erp/saltprocess/project';
import type { SubsystemForm } from '@/api/erp/subsystem/types';
import type { SaltProjectVO } from '@/api/erp/saltprocess/project/types';

// Props
interface Props {
  subsystemId?: string;
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
const projectList = ref<SaltProjectVO[]>([]);

// 表单数据
const initFormData: SubsystemForm = {
  id: undefined,
  subsystemCode: '',
  subsystemName: '',
  projectId: undefined,
  status: 1,
  description: '',
  remark: ''
};

const form = reactive<SubsystemForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  subsystemCode: [
    { required: true, message: '请输入子系统编码', trigger: 'blur' }
  ],
  subsystemName: [
    { required: true, message: '请输入子系统名称', trigger: 'blur' }
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
    const response = await listSaltProject({ pageNum: 1, pageSize: 100 });
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

