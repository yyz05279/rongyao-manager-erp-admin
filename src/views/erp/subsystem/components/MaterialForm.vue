<template>
  <div class="material-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="物料编码" prop="materialCode">
            <el-input v-model="form.materialCode" placeholder="请输入物料编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料名称" prop="materialName">
            <el-input v-model="form.materialName" placeholder="请输入物料名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="规格型号" prop="specification">
            <el-input v-model="form.specification" placeholder="请输入规格型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数量" prop="quantity">
            <el-input-number
              v-model="form.quantity"
              placeholder="请输入数量"
              :min="0"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="制造商" prop="manufacturer">
            <el-input v-model="form.manufacturer" placeholder="请输入制造商" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单重(kg)" prop="unitWeight">
            <el-input-number
              v-model="form.unitWeight"
              placeholder="请输入单重"
              :min="0"
              :precision="2"
              style="width: 100%"
              @change="calculateTotalWeight"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总重(kg)" prop="totalWeight">
            <el-input-number
              v-model="form.totalWeight"
              placeholder="请输入总重"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="单体积(m³)" prop="unitVolume">
            <el-input-number
              v-model="form.unitVolume"
              placeholder="请输入单体积"
              :min="0"
              :precision="2"
              style="width: 100%"
              @change="calculateTotalVolume"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="总体积(m³)" prop="totalVolume">
            <el-input-number
              v-model="form.totalVolume"
              placeholder="请输入总体积"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="型号" prop="model">
            <el-input v-model="form.model" placeholder="请输入型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="序列号" prop="serialNumber">
            <el-input v-model="form.serialNumber" placeholder="请输入序列号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="生产日期" prop="productionDate">
            <el-date-picker
              v-model="form.productionDate"
              type="date"
              placeholder="请选择生产日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="包装方式" prop="packagingMethod">
            <el-input v-model="form.packagingMethod" placeholder="请输入包装方式" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否易碎品" prop="isFragile">
            <el-radio-group v-model="form.isFragile">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否危险品" prop="isHazardous">
            <el-radio-group v-model="form.isHazardous">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="form.remarks"
          type="textarea"
          :rows="3"
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

<script setup name="MaterialForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getSubsystemMaterial, addSubsystemMaterial, updateSubsystemMaterial } from '@/api/erp/subsystem';
import type { SubsystemMaterialForm } from '@/api/erp/subsystem/types';

// Props
interface Props {
  subItemId: string;
  materialId?: string;
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
const initFormData: SubsystemMaterialForm = {
  id: undefined,
  subItemId: props.subItemId,
  materialCode: '',
  materialName: '',
  specification: '',
  quantity: undefined,
  unit: '',
  unitWeight: undefined,
  totalWeight: undefined,
  unitVolume: undefined,
  totalVolume: undefined,
  manufacturer: '',
  model: '',
  serialNumber: '',
  productionDate: '',
  isFragile: 0,
  isHazardous: 0,
  packagingMethod: '',
  remarks: ''
};

const form = reactive<SubsystemMaterialForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  materialCode: [
    { required: true, message: '请输入物料编码', trigger: 'blur' }
  ],
  materialName: [
    { required: true, message: '请输入物料名称', trigger: 'blur' }
  ]
});

// 生命周期
onMounted(() => {
  if (props.materialId) {
    getMaterialDetail();
  }
});

// 监听materialId变化
watch(() => props.materialId, (newVal) => {
  if (newVal) {
    getMaterialDetail();
  } else {
    reset();
  }
});

// 获取物料详情
const getMaterialDetail = async () => {
  try {
    const res = await getSubsystemMaterial(props.materialId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取物料详情失败:', error);
    ElMessage.error('获取物料详情失败');
  }
};

// 计算总重量
const calculateTotalWeight = () => {
  if (form.unitWeight && form.quantity) {
    form.totalWeight = Number((form.unitWeight * form.quantity).toFixed(2));
  }
};

// 计算总体积
const calculateTotalVolume = () => {
  if (form.unitVolume && form.quantity) {
    form.totalVolume = Number((form.unitVolume * form.quantity).toFixed(2));
  }
};

// 监听数量变化，自动计算总重和总体积
watch(() => form.quantity, () => {
  calculateTotalWeight();
  calculateTotalVolume();
});

// 表单重置
const reset = () => {
  Object.assign(form, initFormData);
  form.subItemId = props.subItemId;
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
          await updateSubsystemMaterial(form);
          ElMessage.success('修改成功');
        } else {
          await addSubsystemMaterial(form);
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
.material-form {
  .dialog-footer {
    text-align: right;
    margin-top: 20px;
  }
}
</style>

