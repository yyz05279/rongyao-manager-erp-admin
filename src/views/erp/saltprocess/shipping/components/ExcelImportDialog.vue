<template>
  <el-dialog v-model="dialogVisible" title="Excel导入发货清单" width="900px" :close-on-click-modal="false" @close="handleClose">
    <div class="import-container">
      <!-- 基本信息表单 -->
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="import-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="项目" prop="projectId">
              <el-select v-model="formData.projectId" placeholder="请选择项目" filterable style="width: 100%">
                <el-option v-for="project in projectList" :key="project.id" :label="project.name" :value="project.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNumber">
              <el-input v-model="formData.batchNumber" placeholder="请输入批次号，如：第一车" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsiblePersonId">
              <el-select v-model="formData.responsiblePersonId" placeholder="请选择负责人" filterable style="width: 100%">
                <el-option v-for="person in responsiblePersonList" :key="person.id" :label="person.name" :value="person.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-divider content-position="left">Excel文件导入</el-divider>

      <!-- Excel导入组件 -->
      <ItemImportDialog v-model:visible="importDialogVisible" @success="handleImportSuccess" />

      <div class="import-actions">
        <el-button type="primary" icon="Upload" @click="openImportDialog" :disabled="!isFormValid">选择Excel文件</el-button>
      </div>

      <!-- 导入预览 -->
      <div v-if="importedItems.length > 0" class="preview-section">
        <el-divider content-position="left">导入预览</el-divider>

        <!-- 统计信息 -->
        <div class="preview-stats">
          <el-alert :title="`共解析到 ${importedItems.length} 条数据，全部有效`" type="success" show-icon :closable="false" />
        </div>

        <el-table :data="importedItems.slice(0, 50)" border stripe size="small" max-height="400" class="preview-table">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="物品名称" prop="itemName" min-width="150" show-overflow-tooltip />
          <el-table-column label="规格型号" prop="specification" min-width="120" show-overflow-tooltip />
          <el-table-column label="数量" prop="quantity" width="80" align="center" />
          <el-table-column label="单位" prop="unit" width="60" align="center" />
          <el-table-column label="单重(kg)" prop="unitWeight" width="90" align="center">
            <template #default="{ row }">
              {{ row.unitWeight ? row.unitWeight.toFixed(2) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="设备类型" prop="equipmentType" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getEquipmentTypeTagType(row.equipmentType)">
                {{ getEquipmentTypeLabel(row.equipmentType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="制造商" prop="manufacturer" min-width="120" show-overflow-tooltip />
        </el-table>

        <div v-if="importedItems.length > 50" class="preview-tip">
          <span class="text-info">仅显示前50条数据，实际将导入全部{{ importedItems.length }}条数据</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="handleSubmit">创建发货清单</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="ExcelImportDialog" lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getProjectSimpleList, getResponsiblePersonList, createShippingListFromExcel } from '@/api/erp/saltprocess/shipping/api-config';
import type { ShippingItemForm, EquipmentType } from '@/api/erp/saltprocess/shipping/types';
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
const importedItems = ref<ShippingItemForm[]>([]);

// 表单数据
const formData = reactive({
  projectId: '',
  batchNumber: '',
  responsiblePersonId: ''
});

// 表单验证规则
const formRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  batchNumber: [
    { required: true, message: '请输入批次号', trigger: 'blur' },
    { min: 1, max: 50, message: '批次号长度在1到50个字符', trigger: 'blur' }
  ],
  responsiblePersonId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
};

// 基础数据
const projectList = ref<Array<{ id: string; name: string }>>([]);
const responsiblePersonList = ref<Array<{ id: string; name: string }>>([]);

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

const handleImportSuccess = (items: ShippingItemForm[]) => {
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

    const response = await createShippingListFromExcel(formData.projectId, formData.batchNumber, formData.responsiblePersonId, importedItems.value);

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
    MECHANICAL: '机械',
    ELECTRICAL: '电控',
    PIPELINE: '管路',
    BURNER: '燃烧器',
    AUXILIARY: '辅助',
    STANDARD_PARTS: '标准件'
  };
  return typeMap[type] || type;
};

const getEquipmentTypeTagType = (type: EquipmentType): string => {
  const tagTypeMap = {
    MECHANICAL: '',
    ELECTRICAL: 'success',
    PIPELINE: 'info',
    BURNER: 'warning',
    AUXILIARY: 'danger',
    STANDARD_PARTS: ''
  };
  return tagTypeMap[type] || '';
};

// 初始化数据
const initData = async () => {
  try {
    const [projectRes, personRes] = await Promise.all([getProjectSimpleList(), getResponsiblePersonList()]);

    // 处理项目列表数据
    projectList.value = (projectRes.data || []).map((item: any) => ({
      id: item.id || item.projectId,
      name: item.name || item.projectName
    }));

    // 处理负责人列表数据（后端返回格式：{userId, userName, nickName}）
    responsiblePersonList.value = (personRes.data || []).map((user: any) => ({
      id: String(user.userId || user.id),
      name: user.nickName || user.userName || user.name
    }));
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
    margin-bottom: 20px;
  }

  .preview-section {
    margin-top: 20px;

    .preview-stats {
      margin-bottom: 16px;
    }

    .preview-table {
      margin-top: 16px;
    }

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

// 响应式设计
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
}
</style>
