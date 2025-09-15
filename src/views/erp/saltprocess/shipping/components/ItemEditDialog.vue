<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑发货明细' : '新增发货明细'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="物品名称" prop="itemName">
            <el-input
              v-model="formData.itemName"
              placeholder="请输入物品名称"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="规格型号" prop="specification">
            <el-input
              v-model="formData.specification"
              placeholder="请输入规格型号"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="设备类型" prop="equipmentType">
            <el-select
              v-model="formData.equipmentType"
              placeholder="请选择设备类型"
              style="width: 100%"
            >
              <el-option label="机械设备" value="MECHANICAL" />
              <el-option label="电控设备" value="ELECTRICAL" />
              <el-option label="管路设备" value="PIPELINE" />
              <el-option label="燃烧器" value="BURNER" />
              <el-option label="辅助设备" value="AUXILIARY" />
              <el-option label="标准件" value="STANDARD_PARTS" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="数量" prop="quantity">
            <el-input-number
              v-model="formData.quantity"
              :min="1"
              :max="99999"
              style="width: 100%"
              @change="calculateTotalWeight"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="单位" prop="unit">
            <el-select
              v-model="formData.unit"
              placeholder="请选择单位"
              style="width: 100%"
              allow-create
              filterable
            >
              <el-option label="个" value="个" />
              <el-option label="台" value="台" />
              <el-option label="套" value="套" />
              <el-option label="件" value="件" />
              <el-option label="只" value="只" />
              <el-option label="根" value="根" />
              <el-option label="米" value="米" />
              <el-option label="公斤" value="公斤" />
              <el-option label="吨" value="吨" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="单重(kg)" prop="unitWeight">
            <el-input-number
              v-model="formData.unitWeight"
              :min="0"
              :precision="2"
              style="width: 100%"
              @change="calculateTotalWeight"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="单体积(m³)" prop="unitVolume">
            <el-input-number
              v-model="formData.unitVolume"
              :min="0"
              :precision="3"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="制造商" prop="manufacturer">
            <el-input
              v-model="formData.manufacturer"
              placeholder="请输入制造商"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="型号" prop="model">
            <el-input
              v-model="formData.model"
              placeholder="请输入型号"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="序列号" prop="serialNumber">
            <el-input
              v-model="formData.serialNumber"
              placeholder="请输入序列号"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="包装方式" prop="packageType">
            <el-select
              v-model="formData.packageType"
              placeholder="请选择包装方式"
              style="width: 100%"
              allow-create
              filterable
            >
              <el-option label="木箱" value="木箱" />
              <el-option label="纸箱" value="纸箱" />
              <el-option label="编织袋" value="编织袋" />
              <el-option label="托盘" value="托盘" />
              <el-option label="裸装" value="裸装" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="包装件数" prop="packageQuantity">
            <el-input-number
              v-model="formData.packageQuantity"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="特殊标识">
            <el-checkbox-group v-model="specialFlags">
              <el-checkbox label="isFragile">易碎品</el-checkbox>
              <el-checkbox label="isHazardous">危险品</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="存储要求" prop="storageRequirement">
            <el-input
              v-model="formData.storageRequirement"
              placeholder="请输入存储要求"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 计算结果显示 -->
      <div v-if="formData.quantity && formData.unitWeight" class="calculation-result">
        <el-divider content-position="left">计算结果</el-divider>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-statistic
              title="总重量"
              :value="totalWeight"
              suffix="kg"
              :precision="2"
            />
          </el-col>
          <el-col :span="8">
            <el-statistic
              title="总体积"
              :value="totalVolume"
              suffix="m³"
              :precision="3"
            />
          </el-col>
          <el-col :span="8">
            <el-statistic
              title="包装件数"
              :value="formData.packageQuantity || 1"
              suffix="件"
            />
          </el-col>
        </el-row>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type {
  ShippingItemForm,
  EquipmentType
} from '@/api/erp/saltprocess/shipping/types';

// Props & Emits
interface Props {
  visible: boolean;
  itemData: ShippingItemForm;
  isEdit: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', data: ShippingItemForm): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const submitting = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<ShippingItemForm>({
  itemName: '',
  specification: '',
  equipmentType: 'AUXILIARY' as EquipmentType,
  quantity: 1,
  unit: '个',
  unitWeight: 0,
  unitVolume: 0,
  manufacturer: '',
  model: '',
  serialNumber: '',
  packageType: '',
  packageQuantity: 1,
  isFragile: false,
  isHazardous: false,
  storageRequirement: '',
  remarks: ''
});

// 特殊标识
const specialFlags = ref<string[]>([]);

// 表单验证规则
const formRules: FormRules = {
  itemName: [
    { required: true, message: '请输入物品名称', trigger: 'blur' },
    { min: 1, max: 200, message: '物品名称长度在1到200个字符', trigger: 'blur' }
  ],
  equipmentType: [
    { required: true, message: '请选择设备类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  unit: [
    { required: true, message: '请选择单位', trigger: 'change' }
  ]
};

// 计算属性
const totalWeight = computed(() => {
  return (formData.quantity || 0) * (formData.unitWeight || 0);
});

const totalVolume = computed(() => {
  return (formData.quantity || 0) * (formData.unitVolume || 0);
});

// 方法
const calculateTotalWeight = () => {
  // 触发计算属性更新
};

const handleConfirm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    // 更新特殊标识
    formData.isFragile = specialFlags.value.includes('isFragile');
    formData.isHazardous = specialFlags.value.includes('isHazardous');
    
    emit('confirm', { ...formData });
    handleClose();
  } catch (error) {
    if (error !== 'validation failed') {
      ElMessage.error('保存失败');
    }
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  formRef.value?.resetFields();
  specialFlags.value = [];
  emit('update:visible', false);
};

// 监听props变化，更新表单数据
watch(
  () => props.itemData,
  (newData) => {
    if (newData && props.visible) {
      Object.assign(formData, newData);
      
      // 更新特殊标识
      specialFlags.value = [];
      if (newData.isFragile) specialFlags.value.push('isFragile');
      if (newData.isHazardous) specialFlags.value.push('isHazardous');
    }
  },
  { deep: true, immediate: true }
);

// 监听对话框打开，重置表单
watch(
  () => props.visible,
  (visible) => {
    if (visible && !props.isEdit) {
      // 新增模式，重置为默认值
      Object.assign(formData, {
        itemName: '',
        specification: '',
        equipmentType: 'AUXILIARY' as EquipmentType,
        quantity: 1,
        unit: '个',
        unitWeight: 0,
        unitVolume: 0,
        manufacturer: '',
        model: '',
        serialNumber: '',
        packageType: '',
        packageQuantity: 1,
        isFragile: false,
        isHazardous: false,
        storageRequirement: '',
        remarks: ''
      });
      specialFlags.value = [];
    }
  }
);
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.calculation-result {
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

// 响应式设计
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
  
  .el-col {
    margin-bottom: 16px;
  }
}
</style>
