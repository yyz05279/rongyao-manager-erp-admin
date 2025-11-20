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
/**
 * 子系统模板基础信息表单组件
 *
 * 功能说明：
 * - ✅ 负责子系统模板基础信息的新增和编辑
 * - ✅ 包含字段：模板编号、名称、分类、版本、状态、描述、备注等
 * - ❌ 不包含子项列表的管理（子项管理由独立的子项管理组件负责）
 *
 * API 接口说明（基于 v1.1 规范）：
 * - 新增：POST /erp/subsystem/template
 * - 编辑：PUT /erp/subsystem/template（仅更新基础信息，不影响子项）
 *
 * 使用场景：
 * 1. 创建新的子系统模板
 * 2. 修改模板的基础信息（名称、描述、备注等）
 * 3. 更新模板状态（草稿、启用、停用、归档）
 *
 * @author haitang
 * @version v1.1
 * @date 2025-01-20
 */
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

/**
 * 提交表单
 *
 * 根据 API v1.1 规范：
 * - 新增模式：调用 POST /erp/subsystem/template 接口，可以同时传入子项列表
 * - 编辑模式：调用 PUT /erp/subsystem/template 接口，仅更新基础信息，不影响子项列表
 *
 * 注意事项：
 * 1. 编辑模式下，即使form中包含items字段，后端也会忽略，不会重复添加子项
 * 2. 如需更新子项列表，应使用专门的子项管理功能，调用 PUT /erp/subsystem/template/{id}/items 接口
 * 3. 此表单组件仅负责基础信息的维护
 */
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (form.id) {
          // 编辑模式：仅更新基础信息
          // 构建基础信息对象，确保不包含子项列表
          const baseInfo: SubsystemTemplateForm = {
            id: form.id,
            templateCode: form.templateCode,
            templateName: form.templateName,
            category: form.category,
            description: form.description,
            isStandard: form.isStandard,
            version: form.version,
            status: form.status,
            sourceProjectId: form.sourceProjectId,
            relatedProductId: form.relatedProductId,
            remarks: form.remarks
            // 注意：不传入 items 字段
          };

          await updateSubsystemTemplate(baseInfo);
          ElMessage.success('修改成功');
        } else {
          // 新增模式：可以包含子项列表（如果有的话）
          await addSubsystemTemplate(form);
          ElMessage.success('新增成功');
        }
        emit('success');
      } catch (error: any) {
        console.error('提交失败:', error);
        // 提供更详细的错误信息
        const errorMessage = error?.response?.data?.msg || error?.message || '操作失败';
        ElMessage.error(errorMessage);
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

