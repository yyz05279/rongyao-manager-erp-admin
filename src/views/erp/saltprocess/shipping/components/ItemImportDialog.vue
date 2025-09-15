<template>
  <el-dialog
    v-model="dialogVisible"
    title="Excel导入发货明细"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-container">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center class="import-steps">
        <el-step title="上传文件" description="选择Excel文件" />
        <el-step title="配置导入" description="设置导入参数" />
        <el-step title="预览数据" description="确认导入数据" />
      </el-steps>

      <!-- 步骤1：文件上传 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将Excel文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持.xlsx和.xls格式，文件大小不超过10MB
            </div>
          </template>
        </el-upload>

        <div v-if="selectedFile" class="file-info">
          <el-card shadow="never">
            <div class="file-details">
              <el-icon><document /></el-icon>
              <div class="file-meta">
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
              <el-button type="danger" link @click="removeFile">
                <el-icon><delete /></el-icon>
              </el-button>
            </div>
          </el-card>
        </div>

        <div class="template-section">
          <el-divider content-position="center">模板下载</el-divider>
          <div class="template-buttons">
            <el-button
              v-for="template in templateTypes"
              :key="template.value"
              type="primary"
              plain
              @click="downloadTemplate(template.value)"
            >
              {{ template.label }}模板
            </el-button>
          </div>
        </div>
      </div>

      <!-- 步骤2：配置导入 -->
      <div v-show="currentStep === 1" class="step-content">
        <el-form :model="importConfig" label-width="120px">
          <el-form-item label="文件类型">
            <el-radio-group v-model="importConfig.fileType">
              <el-radio
                v-for="type in templateTypes"
                :key="type.value"
                :label="type.value"
              >
                {{ type.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="工作表">
            <el-select v-model="importConfig.sheetName" placeholder="请选择工作表">
              <el-option
                v-for="sheet in sheetNames"
                :key="sheet"
                :label="sheet"
                :value="sheet"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="表头行">
            <el-input-number
              v-model="importConfig.headerRow"
              :min="1"
              :max="10"
              placeholder="表头所在行号"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3：数据预览 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="preview-header">
          <el-alert
            :title="`共解析到 ${previewData.length} 条数据，其中 ${validDataCount} 条有效，${errorDataCount} 条错误`"
            type="info"
            show-icon
            :closable="false"
          />
        </div>

        <el-table
          :data="previewData.slice(0, 50)"
          max-height="400"
          border
          stripe
        >
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="物品名称" prop="itemName" min-width="150" />
          <el-table-column label="规格型号" prop="specification" min-width="120" />
          <el-table-column label="数量" prop="quantity" width="80" />
          <el-table-column label="单位" prop="unit" width="60" />
          <el-table-column label="单重(kg)" prop="unitWeight" width="90">
            <template #default="{ row }">
              {{ row.unitWeight?.toFixed(2) || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="设备类型" prop="equipmentType" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getEquipmentTypeLabel(row.equipmentType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag
                :type="row._hasError ? 'danger' : 'success'"
                size="small"
              >
                {{ row._hasError ? '错误' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="previewData.length > 50" class="preview-tip">
          <span class="text-info">仅显示前50条数据，实际将导入全部数据</span>
        </div>

        <!-- 错误信息 -->
        <div v-if="importErrors.length > 0" class="error-section">
          <el-divider content-position="left">错误信息</el-divider>
          <el-table :data="importErrors.slice(0, 20)" max-height="200" border>
            <el-table-column label="行号" prop="row" width="80" />
            <el-table-column label="字段" prop="field" width="120" />
            <el-table-column label="错误信息" prop="message" />
          </el-table>
          <div v-if="importErrors.length > 20" class="error-tip">
            <span class="text-warning">仅显示前20条错误信息</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button
          v-if="currentStep < 2"
          type="primary"
          :disabled="!canNextStep"
          :loading="processing"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          :disabled="validDataCount === 0"
          @click="handleConfirm"
        >
          导入数据
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Document, Delete } from '@element-plus/icons-vue';
import { ShippingExcelParser, SHIPPING_EXCEL_CONFIGS } from '@/utils/shipping-excel-parser';
import type {
  ShippingExcelImportConfig,
  ShippingItemForm,
  EquipmentType
} from '@/api/erp/saltprocess/shipping/types';

// Props & Emits
interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success', data: ShippingItemForm[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const currentStep = ref(0);
const processing = ref(false);
const selectedFile = ref<File | null>(null);
const sheetNames = ref<string[]>([]);
const previewData = ref<(ShippingItemForm & { _hasError?: boolean })[]>([]);
const importErrors = ref<{ row: number; field: string; message: string }[]>([]);

// 导入配置
const importConfig = reactive<ShippingExcelImportConfig>({
  fileType: 'GENERAL',
  headerRow: 1,
  columnMapping: {}
});

// 模板类型
const templateTypes = [
  { label: '通用清单', value: 'GENERAL' },
  { label: '机械设备', value: 'MECHANICAL' },
  { label: '电控设备', value: 'ELECTRICAL' },
  { label: '管路设备', value: 'PIPELINE' },
  { label: '燃烧器', value: 'BURNER' }
];

// 计算属性
const canNextStep = computed(() => {
  switch (currentStep.value) {
    case 0:
      return selectedFile.value !== null;
    case 1:
      return importConfig.fileType && importConfig.sheetName;
    default:
      return false;
  }
});

const validDataCount = computed(() => {
  return previewData.value.filter(item => !item._hasError).length;
});

const errorDataCount = computed(() => {
  return previewData.value.filter(item => item._hasError).length;
});

// Excel解析器
const excelParser = new ShippingExcelParser();

// 方法
const handleFileChange = async (file: any) => {
  selectedFile.value = file.raw;
  
  try {
    const result = await excelParser.parseFile(file.raw);
    sheetNames.value = result.sheets;
    importConfig.sheetName = result.sheets[0];
    
    // 自动识别文件类型
    const detectedType = excelParser.identifyShippingListType();
    importConfig.fileType = detectedType;
    importConfig.columnMapping = SHIPPING_EXCEL_CONFIGS[detectedType].columnMapping;
    
    ElMessage.success('文件解析成功');
  } catch (error) {
    ElMessage.error(`文件解析失败: ${error}`);
    selectedFile.value = null;
  }
};

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件');
};

const removeFile = () => {
  selectedFile.value = null;
  sheetNames.value = [];
};

const downloadTemplate = (templateType: string) => {
  try {
    const blob = ShippingExcelParser.generateTemplate(templateType as keyof typeof SHIPPING_EXCEL_CONFIGS);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateTypes.find(t => t.value === templateType)?.label}模板.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('模板下载成功');
  } catch (error) {
    ElMessage.error('模板下载失败');
  }
};

const nextStep = async () => {
  if (currentStep.value === 1) {
    // 解析数据
    await parseExcelData();
  }
  
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const parseExcelData = async () => {
  if (!selectedFile.value) return;
  
  processing.value = true;
  try {
    const result = await excelParser.importShippingData(importConfig, importConfig.sheetName);
    previewData.value = result.data.map(item => ({
      ...item,
      _hasError: false
    }));
    importErrors.value = result.errors;
    
    // 标记有错误的数据
    result.errors.forEach(error => {
      const item = previewData.value[error.row - 2]; // 减去表头行
      if (item) {
        item._hasError = true;
      }
    });
    
    ElMessage.success('数据解析完成');
  } catch (error) {
    ElMessage.error(`数据解析失败: ${error}`);
  } finally {
    processing.value = false;
  }
};

const handleConfirm = () => {
  const validData = previewData.value.filter(item => !item._hasError);
  if (validData.length === 0) {
    ElMessage.warning('没有有效数据可以导入');
    return;
  }
  
  // 移除临时字段
  const cleanData = validData.map(item => {
    const { _hasError, ...cleanItem } = item;
    return cleanItem;
  });
  
  emit('success', cleanData);
  handleClose();
};

const handleClose = () => {
  // 重置状态
  currentStep.value = 0;
  selectedFile.value = null;
  sheetNames.value = [];
  previewData.value = [];
  importErrors.value = [];
  Object.assign(importConfig, {
    fileType: 'GENERAL',
    headerRow: 1,
    columnMapping: {}
  });
  
  emit('update:visible', false);
};

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
</script>

<style scoped lang="scss">
.import-container {
  .import-steps {
    margin-bottom: 30px;
  }
  
  .step-content {
    min-height: 400px;
    padding: 20px 0;
    
    .upload-area {
      margin-bottom: 20px;
      
      :deep(.el-upload-dragger) {
        width: 100%;
        height: 180px;
        border: 2px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: border-color 0.3s;
        
        &:hover {
          border-color: #409eff;
        }
      }
    }
    
    .file-info {
      margin-bottom: 20px;
      
      .file-details {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .file-meta {
          flex: 1;
          
          .file-name {
            font-weight: 500;
            color: #303133;
          }
          
          .file-size {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }
    
    .template-section {
      .template-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
    
    .preview-header {
      margin-bottom: 16px;
    }
    
    .preview-tip,
    .error-tip {
      margin-top: 12px;
      text-align: center;
    }

    .text-info {
      color: #909399;
      font-size: 14px;
    }

    .text-warning {
      color: #e6a23c;
      font-size: 14px;
    }
    
    .error-section {
      margin-top: 20px;
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
  
  .import-container {
    .step-content {
      padding: 10px 0;
      
      .template-buttons {
        flex-direction: column;
        align-items: center;
        
        .el-button {
          width: 200px;
        }
      }
    }
  }
}
</style>
