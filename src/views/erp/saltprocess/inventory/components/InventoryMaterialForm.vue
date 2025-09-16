<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
  >
    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="物料编码" prop="materialCode">
          <el-input
            v-model="formData.materialCode"
            placeholder="请输入物料编码"
            maxlength="50"
            show-word-limit
            :disabled="isEdit"
          />
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="物料名称" prop="materialName">
          <el-input
            v-model="formData.materialName"
            placeholder="请输入物料名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="物料类型" prop="materialType">
          <el-select
            v-model="formData.materialType"
            placeholder="请选择物料类型"
            style="width: 100%"
          >
            <el-option label="原料" value="RAW_MATERIAL" />
            <el-option label="成品" value="FINISHED_PRODUCT" />
            <el-option label="半成品" value="SEMI_FINISHED" />
            <el-option label="辅料" value="AUXILIARY" />
          </el-select>
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="计量单位" prop="unit">
          <el-select
            v-model="formData.unit"
            placeholder="请选择计量单位"
            style="width: 100%"
          >
            <el-option label="吨" value="t" />
            <el-option label="千克" value="kg" />
            <el-option label="克" value="g" />
            <el-option label="升" value="L" />
            <el-option label="毫升" value="mL" />
            <el-option label="个" value="个" />
            <el-option label="件" value="件" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="规格型号" prop="specification">
          <el-input
            v-model="formData.specification"
            placeholder="请输入规格型号"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="安全库存" prop="safetyStock">
          <el-input-number
            v-model="formData.safetyStock"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入安全库存"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :span="12">
        <el-form-item label="最大库存" prop="maxStock">
          <el-input-number
            v-model="formData.maxStock"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入最大库存"
          />
        </el-form-item>
      </el-col>
      
      <el-col :span="12">
        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="formData.warehouseId"
            placeholder="请选择仓库"
            style="width: 100%"
          >
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="存储条件" prop="storageConditions">
      <el-input
        v-model="formData.storageConditions"
        type="textarea"
        :rows="2"
        placeholder="请输入存储条件要求"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>

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
  getInventoryMaterial,
  addInventoryMaterial, 
  updateInventoryMaterial,
  getWarehouseList
} from '@/api/erp/saltprocess/inventory';
import type { InventoryMaterialVO, InventoryMaterialForm } from '@/api/erp/saltprocess/inventory/types';

// Props & Emits
interface Props {
  materialId?: string;
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
const warehouseList = ref<any[]>([]);

// 计算属性
const isEdit = computed(() => !!props.materialId);

// 表单数据
const formData = reactive<InventoryMaterialForm>({
  materialCode: '',
  materialName: '',
  materialType: 'RAW_MATERIAL',
  specification: '',
  unit: 't',
  safetyStock: 0,
  maxStock: 0,
  warehouseId: '',
  storageConditions: '',
  remarks: ''
});

// 表单验证规则
const formRules: FormRules = {
  materialCode: [
    { required: true, message: '请输入物料编码', trigger: 'blur' }
  ],
  materialName: [
    { required: true, message: '请输入物料名称', trigger: 'blur' }
  ],
  materialType: [
    { required: true, message: '请选择物料类型', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请选择计量单位', trigger: 'change' }
  ],
  warehouseId: [
    { required: true, message: '请选择仓库', trigger: 'change' }
  ],
  safetyStock: [
    { type: 'number', min: 0, message: '安全库存不能小于0', trigger: 'blur' }
  ],
  maxStock: [
    { type: 'number', min: 0, message: '最大库存不能小于0', trigger: 'blur' }
  ]
};

// 生命周期
onMounted(() => {
  loadWarehouseList();
  if (isEdit.value) {
    loadMaterialData();
  }
});

// 方法
const loadWarehouseList = async () => {
  try {
    const { data } = await getWarehouseList();
    warehouseList.value = data;
  } catch (error) {
    console.error('加载仓库列表失败:', error);
    // 使用模拟数据
    warehouseList.value = [
      { id: '1', name: '原料仓库' },
      { id: '2', name: '成品仓库' },
      { id: '3', name: '辅料仓库' }
    ];
  }
};

const loadMaterialData = async () => {
  if (!props.materialId) return;
  
  try {
    const { data } = await getInventoryMaterial(props.materialId);
    Object.assign(formData, {
      materialCode: data.materialCode,
      materialName: data.materialName,
      materialType: data.materialType,
      specification: data.specification,
      unit: data.unit,
      safetyStock: data.safetyStock,
      maxStock: data.maxStock,
      warehouseId: data.warehouseId,
      storageConditions: data.storageConditions,
      remarks: data.remarks
    });
  } catch (error) {
    console.error('加载物料数据失败:', error);
    ElMessage.error('加载物料数据失败');
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    if (isEdit.value) {
      await updateInventoryMaterial({ ...formData, id: props.materialId });
    } else {
      await addInventoryMaterial(formData);
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
  name: 'InventoryMaterialForm'
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
