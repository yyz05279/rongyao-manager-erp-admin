<template>
  <div class="subsystem-template-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板编号" prop="templateCode">
            <el-input v-model="form.templateCode" placeholder="系统自动生成" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="form.templateName" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="请输入分类(如:解析系统、化盐系统)" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="如: v1.0" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="启用" value="ACTIVE" />
              <el-option label="停用" value="INACTIVE" />
              <el-option label="归档" value="ARCHIVED" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标准模板" prop="isStandard">
            <el-switch v-model="form.isStandard" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述信息" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SubsystemTemplateForm'
});
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  getSubsystemTemplate,
  addSubsystemTemplate,
  updateSubsystemTemplate,
  generateSubsystemTemplateCode
} from '@/api/erp/subsystem/template';
import type { SubsystemTemplateForm } from '@/api/erp/subsystem/types';

// Props
interface Props {
  templateId?: string | number;
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

// 表单数据
const initFormData: SubsystemTemplateForm = {
  id: undefined,
  templateCode: '',
  templateName: '',
  category: '',
  description: '',
  isStandard: false,
  version: 'v1.0',
  status: 'DRAFT',
  sourceProjectId: undefined,
  relatedProductId: undefined,
  remarks: ''
};

const form = reactive<SubsystemTemplateForm>({ ...initFormData });

// 表单验证规则
// 注意：模板编号唯一性由后台自动校验，前端无需验证
const rules = reactive<FormRules>({
  templateName: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 生命周期
onMounted(() => {
  if (props.templateId) {
    getTemplateDetail();
  } else {
    // 新增模式，自动生成编号
    handleGenerateCode();
  }
});

// 监听templateId变化
watch(() => props.templateId, (newVal) => {
  if (newVal) {
    getTemplateDetail();
  } else {
    reset();
  }
});

// 获取模板详情
const getTemplateDetail = async () => {
  try {
    const res = await getSubsystemTemplate(props.templateId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取模板详情失败:', error);
    ElMessage.error('获取模板详情失败');
  }
};

// 生成编号（自动调用，无需用户手动触发）
const handleGenerateCode = async () => {
  generateCodeLoading.value = true;
  try {
    const response = await generateSubsystemTemplateCode();
    form.templateCode = response.data;
  } catch (error) {
    console.error('生成编号失败:', error);
    ElMessage.error('生成编号失败');
  } finally {
    generateCodeLoading.value = false;
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
          await updateSubsystemTemplate(form);
          ElMessage.success('修改成功');
        } else {
          await addSubsystemTemplate(form);
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
.subsystem-template-form {
  .dialog-footer {
    text-align: right;
  }
}
</style>

