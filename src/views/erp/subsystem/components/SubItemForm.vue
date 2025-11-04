<template>
  <div class="subitem-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="子项编号" prop="itemCode">
            <el-input
              v-model="form.itemCode"
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
          <el-form-item label="子项名称" prop="itemName">
            <el-input v-model="form.itemName" placeholder="请输入子项名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="子项类型" prop="itemType">
            <el-input v-model="form.itemType" placeholder="如:系统、设备" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格型号" prop="specification">
            <el-input v-model="form.specification" placeholder="请输入规格型号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="数量" prop="quantity">
            <el-input-number v-model="form.quantity" :min="1" placeholder="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="如:套、个" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="重量(kg)" prop="weight">
            <el-input-number v-model="form.weight" :precision="2" :min="0" placeholder="0.00" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序号" prop="sequenceNumber">
            <el-input-number v-model="form.sequenceNumber" :min="1" placeholder="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="待处理" value="PENDING" />
              <el-option label="进行中" value="IN_PROGRESS" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已暂停" value="SUSPENDED" />
            </el-select>
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

<script setup name="SubItemForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  getSubsystemItem,
  addSubsystemItem,
  updateSubsystemItem,
  generateSubsystemItemCode,
  getSubsystem
} from '@/api/erp/subsystem';
import type { SubsystemItemForm } from '@/api/erp/subsystem/types';

// Props
interface Props {
  subsystemId: string | number;
  subItemId?: string | number;
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
const subsystemCode = ref('');

// 表单数据
const initFormData: SubsystemItemForm = {
  id: undefined,
  subsystemId: Number(props.subsystemId),
  itemCode: '',
  itemName: '',
  itemType: '',
  specification: '',
  description: '',
  sequenceNumber: 1,
  parentItemId: 0,
  quantity: 1,
  unit: '',
  weight: undefined,
  status: 'PENDING',
  remarks: ''
};

const form = reactive<SubsystemItemForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  itemName: [
    { required: true, message: '请输入子项名称', trigger: 'blur' }
  ]
});

// 生命周期
onMounted(() => {
  loadSubsystemCode();
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

// 加载子系统编码
const loadSubsystemCode = async () => {
  try {
    const res = await getSubsystem(props.subsystemId);
    subsystemCode.value = res.data.subsystemCode;
  } catch (error) {
    console.error('获取子系统编码失败:', error);
  }
};

// 获取子项详情
const getSubItemDetail = async () => {
  try {
    const res = await getSubsystemItem(props.subItemId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取子项详情失败:', error);
    ElMessage.error('获取子项详情失败');
  }
};

// 生成编号
const handleGenerateCode = async () => {
  if (!subsystemCode.value) {
    ElMessage.warning('子系统编号未加载');
    return;
  }

  generateCodeLoading.value = true;
  try {
    const response = await generateSubsystemItemCode(subsystemCode.value);
    form.itemCode = response.data;
    ElMessage.success('编号生成成功');
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
  form.subsystemId = Number(props.subsystemId);
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
          await updateSubsystemItem(form);
          ElMessage.success('修改成功');
        } else {
          await addSubsystemItem(form);
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

