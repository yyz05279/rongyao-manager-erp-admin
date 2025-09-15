<template>
  <el-dialog
    v-model="dialogVisible"
    title="Excel导入发货清单"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-container">
      <!-- 基本信息表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="import-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="项目" prop="projectId">
              <el-select
                v-model="formData.projectId"
                placeholder="请选择项目"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="project in projectList"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNumber">
              <el-input
                v-model="formData.batchNumber"
                placeholder="请输入批次号，如：第一车"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsiblePersonId">
              <el-select
                v-model="formData.responsiblePersonId"
                placeholder="请选择负责人"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="person in responsiblePersonList"
                  :key="person.id"
                  :label="person.name"
                  :value="person.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider content-position="left">Excel文件导入</el-divider>

      <!-- Excel导入组件 -->
      <ItemImportDialog
        v-model:visible="importDialogVisible"
        @success="handleImportSuccess"
      />
      
      <div class="import-actions">
        <el-button
          type="primary"
          icon="Upload"
          @click="openImportDialog"
          :disabled="!isFormValid"
        >
          选择Excel文件
        </el-button>
        <div v-if="importedItems.length > 0" class="import-result">
          <el-tag type="success" size="large">
            已导入 {{ importedItems.length }} 项明细
          </el-tag>
        </div>
      </div>

      <!-- 导入预览 -->
      <div v-if="importedItems.length > 0" class="preview-section">
        <el-divider content-position="left">导入预览</el-divider>
        <el-table
          :data="importedItems.slice(0, 10)"
          border
          size="small"
          max-height="300"
        >
          <el-table-column label="物品名称" prop="itemName" min-width="150" />
          <el-table-column label="规格型号" prop="specification" min-width="120" />
          <el-table-column label="数量" prop="quantity" width="80" />
          <el-table-column label="单位" prop="unit" width="60" />
          <el-table-column label="重量(kg)" prop="weight" width="90" />
          <el-table-column label="设备类型" prop="equipmentType" width="100">
            <template #default="{ row }">
              {{ getEquipmentTypeLabel(row.equipmentType) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-if="importedItems.length > 10" class="preview-tip">
          <span class="text-info">仅显示前10条数据，实际将导入全部{{ importedItems.length }}条数据</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          创建发货清单
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="ExcelImportDialog" lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  getProjectSimpleList,
  getResponsiblePersonList,
  createShippingListFromExcel
} from '@/api/erp/saltprocess/shipping/api-config';
import type { ShippingItemVO, EquipmentType } from '@/api/erp/saltprocess/shipping/types';
import ItemImportDialog from './ItemImportDialog.vue';

// Props & Emits
interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'success', id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const formRef = ref();
const submitting = ref(false);
const importDialogVisible = ref(false);
const importedItems = ref<ShippingItemVO[]>([]);

// 表单数据
const formData = reactive({
  projectId: '',
  batchNumber: '',
  responsiblePersonId: ''
});

// 表单验证规则
const formRules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  batchNumber: [
    { required: true, message: '请输入批次号', trigger: 'blur' },
    { min: 1, max: 50, message: '批次号长度在1到50个字符', trigger: 'blur' }
  ],
  responsiblePersonId: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ]
};

// 基础数据
const projectList = ref<Array<{id: string, name: string}>>([]);
const responsiblePersonList = ref<Array<{id: string, name: string}>>([]);

// 计算属性
const isFormValid = computed(() => {
  return formData.projectId && formData.batchNumber && formData.responsiblePersonId;
});

const canSubmit = computed(() => {
  return isFormValid.value && importedItems.value.length > 0 && !submitting.value;
});

// 方法
const openImportDialog = () => {
  if (!isFormValid.value) {
    ElMessage.warning('请先完善基本信息');
    return;
  }
  importDialogVisible.value = true;
};

const handleImportSuccess = (items: ShippingItemVO[]) => {
  importedItems.value = items;
  ElMessage.success(`成功导入${items.length}项明细`);
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    if (importedItems.value.length === 0) {
      ElMessage.warning('请先导入Excel数据');
      return;
    }
    
    submitting.value = true;
    
    const response = await createShippingListFromExcel(
      formData.projectId,
      formData.batchNumber,
      formData.responsiblePersonId,
      importedItems.value
    );
    
    ElMessage.success('发货清单创建成功');
    emit('success', response.data);
    handleClose();
  } catch (error) {
    if (error !== 'validation failed') {
      ElMessage.error('创建发货清单失败');
    }
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  // 重置表单
  formRef.value?.resetFields();
  importedItems.value = [];
  importDialogVisible.value = false;
  
  emit('update:visible', false);
};

const getEquipmentTypeLabel = (type: EquipmentType): string => {
  const typeMap = {
    mechanical: '机械',
    electrical: '电控',
    pipeline: '管路',
    burner: '燃烧器',
    auxiliary: '辅助',
    standard_parts: '标准件'
  };
  return typeMap[type] || type;
};

// 初始化数据
const initData = async () => {
  try {
    const [projectRes, personRes] = await Promise.all([
      getProjectSimpleList(),
      getResponsiblePersonList()
    ]);
    
    projectList.value = projectRes.data;
    responsiblePersonList.value = personRes.data;
  } catch (error) {
    ElMessage.error('获取基础数据失败');
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.import-container {
  .import-form {
    margin-bottom: 20px;
  }
  
  .import-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    
    .import-result {
      flex: 1;
    }
  }
  
  .preview-section {
    .preview-tip {
      margin-top: 12px;
      text-align: center;
      
      .text-info {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
