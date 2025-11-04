<template>
  <div class="subitem-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="子项编码" prop="subItemCode">
        <el-input v-model="form.subItemCode" placeholder="请输入子项编码" />
      </el-form-item>
      <el-form-item label="子项名称" prop="subItemName">
        <el-input v-model="form.subItemName" placeholder="请输入子项名称" />
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

<script setup name="SubItemForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getSubItem, addSubItem, updateSubItem } from '@/api/erp/subsystem';
import type { SubItemForm } from '@/api/erp/subsystem/types';

// Props
interface Props {
  subsystemId: string;
  subItemId?: string;
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
const initFormData: SubItemForm = {
  id: undefined,
  subsystemId: props.subsystemId,
  subItemCode: '',
  subItemName: '',
  description: '',
  remark: ''
};

const form = reactive<SubItemForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  subItemCode: [
    { required: true, message: '请输入子项编码', trigger: 'blur' }
  ],
  subItemName: [
    { required: true, message: '请输入子项名称', trigger: 'blur' }
  ]
});

// 生命周期
onMounted(() => {
  if (props.subItemId) {
    getSubItemDetail();
  }
});

// 监听subItemId变化
watch(() => props.subItemId, (newVal) => {
  if (newVal) {
    getSubItemDetail();
  } else {
    reset();
  }
});

// 获取子项详情
const getSubItemDetail = async () => {
  try {
    const res = await getSubItem(props.subItemId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取子项详情失败:', error);
    ElMessage.error('获取子项详情失败');
  }
};

// 表单重置
const reset = () => {
  Object.assign(form, initFormData);
  form.subsystemId = props.subsystemId;
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
          await updateSubItem(form);
          ElMessage.success('修改成功');
        } else {
          await addSubItem(form);
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
.subitem-form {
  .dialog-footer {
    text-align: right;
  }
}
</style>

