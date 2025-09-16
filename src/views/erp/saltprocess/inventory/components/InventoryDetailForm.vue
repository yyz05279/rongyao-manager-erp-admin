<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
  >
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="批次号" prop="batchNo">
          <el-input
            v-model="formData.batchNo"
            placeholder="请输入批次号"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="库位" prop="locationId">
          <el-select
            v-model="formData.locationId"
            placeholder="请选择库位"
            style="width: 100%"
          >
            <el-option
              v-for="location in locationList"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="formData.quantity"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入数量"
          />
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="单价" prop="unitPrice">
          <el-input-number
            v-model="formData.unitPrice"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入单价"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker
            v-model="formData.productionDate"
            type="date"
            placeholder="请选择生产日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="有效期" prop="expiryDate">
          <el-date-picker
            v-model="formData.expiryDate"
            type="date"
            placeholder="请选择有效期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="供应商" prop="supplierId">
          <el-select
            v-model="formData.supplierId"
            placeholder="请选择供应商"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="supplier in supplierList"
              :key="supplier.id"
              :label="supplier.name"
              :value="supplier.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="质量等级" prop="qualityGrade">
          <el-select
            v-model="formData.qualityGrade"
            placeholder="请选择质量等级"
            style="width: 100%"
            clearable
          >
            <el-option label="优等品" value="A" />
            <el-option label="一等品" value="B" />
            <el-option label="合格品" value="C" />
            <el-option label="不合格" value="D" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

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

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '更新' : '保存' }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  addInventoryDetail, 
  updateInventoryDetail,
  getLocationList,
  getSupplierList
} from '@/api/erp/saltprocess/inventory';
import type { InventoryDetailVO, InventoryDetailForm } from '@/api/erp/saltprocess/inventory/types';

// Props & Emits
interface Props {
  materialId: string;
  detailData?: InventoryDetailVO | null;
}

interface Emits {
  (e: 'success'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const locationList = ref<any[]>([]);
const supplierList = ref<any[]>([]);

// 计算属性
const isEdit = computed(() => !!props.detailData);

// 表单数据
const formData = reactive<InventoryDetailForm>({
  materialId: props.materialId,
  batchNo: '',
  locationId: '',
  quantity: 0,
  unitPrice: 0,
  productionDate: '',
  expiryDate: '',
  supplierId: '',
  qualityGrade: '',
  remarks: ''
});

// 表单验证规则
const formRules: FormRules = {
  batchNo: [
    { required: true, message: '请输入批次号', trigger: 'blur' }
  ],
  locationId: [
    { required: true, message: '请选择库位', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '数量必须大于0', trigger: 'blur' }
  ],
  unitPrice: [
    { type: 'number', min: 0, message: '单价不能小于0', trigger: 'blur' }
  ]
};

// 监听详情数据变化
watch(() => props.detailData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      materialId: props.materialId,
      batchNo: newData.batchNo,
      locationId: newData.locationId,
      quantity: newData.quantity,
      unitPrice: newData.unitPrice,
      productionDate: newData.productionDate,
      expiryDate: newData.expiryDate,
      supplierId: newData.supplierId,
      qualityGrade: newData.qualityGrade,
      remarks: newData.remarks
    });
  }
}, { immediate: true });

// 生命周期
onMounted(() => {
  loadLocationList();
  loadSupplierList();
});

// 方法
const loadLocationList = async () => {
  try {
    const { data } = await getLocationList();
    locationList.value = data;
  } catch (error) {
    console.error('加载库位列表失败:', error);
    // 使用模拟数据
    locationList.value = [
      { id: 'A01', name: 'A区-01号位' },
      { id: 'A02', name: 'A区-02号位' },
      { id: 'B01', name: 'B区-01号位' },
      { id: 'B02', name: 'B区-02号位' }
    ];
  }
};

const loadSupplierList = async () => {
  try {
    const { data } = await getSupplierList();
    supplierList.value = data;
  } catch (error) {
    console.error('加载供应商列表失败:', error);
    // 使用模拟数据
    supplierList.value = [
      { id: 'SUP001', name: '山东化工有限公司' },
      { id: 'SUP002', name: '江苏盐业集团' },
      { id: 'SUP003', name: '河北化学工业公司' }
    ];
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    if (isEdit.value) {
      await updateInventoryDetail(formData);
    } else {
      await addInventoryDetail(formData);
    }
    
    emit('success');
  } catch (error) {
    if (error !== 'validation failed') {
      ElMessage.error(isEdit.value ? '更新失败' : '保存失败');
    }
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InventoryDetailForm'
});
</script>

<style scoped lang="scss">
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
