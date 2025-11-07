<template>
  <div class="equipment-system-template-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板编码" prop="templateCode">
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
          <el-form-item label="系统类型" prop="systemType">
            <el-select v-model="form.systemType" placeholder="请选择系统类型" style="width: 100%">
              <el-option label="固态" value="SOLID" />
              <el-option label="液态" value="LIQUID" />
              <el-option label="粉盐" value="POWDER" />
              <el-option label="燃烧器" value="BURNER" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="请输入分类(如:处理厂、生产线)" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="如: 1.0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="启用" value="ACTIVE" />
              <el-option label="归档" value="ARCHIVED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="标准模板" prop="isStandard">
            <el-switch v-model="form.isStandard" />
            <span class="ml-2 text-gray-500 text-xs">标准模板可用于快速创建项目设备系统</span>
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
  name: 'EquipmentSystemTemplateForm'
});
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  getEquipmentSystemTemplate,
  addEquipmentSystemTemplate,
  updateEquipmentSystemTemplate
} from '@/api/erp/saltprocess/equipment-system/template';
import type { EquipmentSystemTemplateForm } from '@/api/erp/saltprocess/equipment-system/types';

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

// 表单数据
const initFormData: EquipmentSystemTemplateForm = {
  id: undefined,
  templateCode: '',
  templateName: '',
  systemType: '',
  category: '',
  description: '',
  isStandard: false,
  version: '1.0',
  status: 'DRAFT',
  remarks: ''
};

const form = reactive<EquipmentSystemTemplateForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  systemType: [{ required: true, message: '请选择系统类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 生命周期
onMounted(() => {
  if (props.templateId) {
    getTemplateDetail();
  } else {
    // 新增模式，生成临时编码提示
    form.templateCode = '系统自动生成';
  }
});

// 监听templateId变化
watch(
  () => props.templateId,
  newVal => {
    if (newVal) {
      getTemplateDetail();
    } else {
      reset();
    }
  }
);

// 获取模板详情
const getTemplateDetail = async () => {
  try {
    const res = await getEquipmentSystemTemplate(props.templateId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取模板详情失败:', error);
    ElMessage.error('获取模板详情失败');
  }
};

// 表单重置
const reset = () => {
  Object.assign(form, initFormData);
  form.templateCode = '系统自动生成';
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

  await formRef.value.validate(async valid => {
    if (valid) {
      buttonLoading.value = true;
      try {
        // 移除用于显示的临时编码
        const submitData = { ...form };
        if (submitData.templateCode === '系统自动生成') {
          delete submitData.templateCode;
        }

        if (form.id) {
          await updateEquipmentSystemTemplate(submitData);
          ElMessage.success('修改成功');
        } else {
          await addEquipmentSystemTemplate(submitData);
          ElMessage.success('新增成功');
        }
        emit('success');
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('提交失败');
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.equipment-system-template-form {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .text-gray-500 {
    color: #6b7280;
  }

  .text-xs {
    font-size: 12px;
  }
}
</style>

