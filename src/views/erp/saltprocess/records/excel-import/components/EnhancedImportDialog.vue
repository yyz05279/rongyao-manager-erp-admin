<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleDialogVisibleChange"
    title="Excel数据导入"
    width="80%"
    :before-close="handleClose"
    destroy-on-close
    class="enhanced-import-dialog"
  >
    <div class="import-container">
      <!-- 文件上传区域 -->
      <el-card class="upload-card" shadow="never" v-if="!fileInfo">
        <template #header>
          <div class="card-header">
            <span class="card-title">📁 选择Excel文件</span>
            <el-button type="primary" size="small" @click="downloadTemplate">
              下载模板
            </el-button>
          </div>
        </template>
        
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".xlsx,.xls"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将Excel文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .xlsx/.xls 格式，文件大小不超过 10MB<br>
              自动识别：熔盐入库统计表、化盐量记录表
            </div>
          </template>
        </el-upload>
      </el-card>

      <!-- 文件信息和配置 -->
      <div v-if="fileInfo && !importResult" class="file-info-section">
        <el-card class="file-info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">📊 文件信息</span>
              <el-button size="small" @click="resetFile">重新选择</el-button>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名">{{ fileInfo.fileName }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(fileInfo.fileSize) }}</el-descriptions-item>
            <el-descriptions-item label="工作表">
              <el-tag v-for="sheet in fileInfo.sheetNames" :key="sheet" size="small" class="sheet-tag">
                {{ sheet }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="检测类型">
              <el-tag :type="getTypeTagType(fileInfo.detectedType)" size="small">
                {{ getTypeDisplayName(fileInfo.detectedType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="使用工作表">
              <el-tag type="primary" size="small">
                {{ fileInfo.config.sheetName || fileInfo.sheetNames[0] || '未知' }}
                <span v-if="!fileInfo.config.sheetName" style="margin-left: 4px;">(自动选择)</span>
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 导入配置 -->
          <div class="import-config" v-if="fileInfo.detectedType !== 'unknown'">
            <h4>导入配置</h4>
            <el-form :model="importConfig" label-width="120px" size="small">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="工作表">
                    <el-select v-model="importConfig.sheetName" placeholder="选择工作表">
                      <el-option
                        v-for="sheet in fileInfo.sheetNames"
                        :key="sheet"
                        :label="sheet"
                        :value="sheet"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="数据开始行">
                    <el-input-number v-model="importConfig.dataStartRow" :min="1" :max="100" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-card>

        <!-- 数据预览 -->
        <el-card class="preview-card" shadow="never" v-if="previewDataList.length > 0">
          <template #header>
            <div class="card-header">
              <span class="card-title">👀 数据预览</span>
              <div class="preview-stats">
                <el-tag size="small">共 {{ previewDataList.length }} 条记录</el-tag>
                <el-tag size="small" type="success" v-if="validRecords > 0">有效 {{ validRecords }}</el-tag>
                <el-tag size="small" type="danger" v-if="errorRecords > 0">错误 {{ errorRecords }}</el-tag>
              </div>
            </div>
          </template>

          <!-- 熔盐入库统计表预览 -->
          <div v-if="fileInfo.detectedType === 'molten_salt_inventory'">
            <el-table
              :data="previewDataList.slice(0, 5)"
              border
              size="small"
              max-height="300"
            >
              <el-table-column prop="recordCode" label="记录编码" width="180">
                <template #default="{ row }">
                  <span class="auto-generated-field">{{ row.recordCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="batchNumber" label="批次号" width="140">
                <template #default="{ row }">
                  <span class="auto-generated-field">{{ row.batchNumber }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="sodiumBags" label="钠(袋)" width="80" />
              <el-table-column prop="potassiumBags" label="钾(袋)" width="80" />
              <el-table-column prop="sodiumWeight" label="钠重量(吨)" width="100">
                <template #default="{ row }">
                  <span class="calculated-field">{{ row.sodiumWeight?.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="potassiumWeight" label="钾重量(吨)" width="100">
                <template #default="{ row }">
                  <span class="calculated-field">{{ row.potassiumWeight?.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="totalWeight" label="总重量(吨)" width="100">
                <template #default="{ row }">
                  <span class="calculated-field">{{ row.totalWeight?.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="totalCrushingAmount" label="总粉碎量" width="100" />
              <el-table-column prop="staffCount" label="人数" width="80" />
            </el-table>
          </div>

          <!-- 化盐量记录表预览 -->
          <div v-else-if="fileInfo.detectedType === 'salt_process'">
            <el-table
              :data="previewDataList.slice(0, 5)"
              border
              size="small"
              max-height="300"
            >
              <el-table-column prop="recordCode" label="记录编码" width="180">
                <template #default="{ row }">
                  <span class="auto-generated-field">{{ row.recordCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="batchNumber" label="批次号" width="140">
                <template #default="{ row }">
                  <span class="auto-generated-field">{{ row.batchNumber }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="sequenceNumber" label="序号" width="60" />
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="wasteAmount" label="垃圾" width="80" />
              <el-table-column prop="sodiumNitrate" label="硝酸钠" width="80" />
              <el-table-column prop="potassiumNitrate" label="硝酸钾" width="80" />
              <el-table-column prop="totalNitrate" label="总硝酸盐" width="100">
                <template #default="{ row }">
                  <span class="calculated-field">{{ row.totalNitrate?.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="saltPerWaste" label="每垃圾化盐量" width="120" />
              <el-table-column prop="efficiency" label="效率(%)" width="80">
                <template #default="{ row }">
                  <span class="calculated-field">{{ row.efficiency?.toFixed(1) }}%</span>
                </template>
              </el-table-column>
              <el-table-column prop="recorder" label="记录人" width="80" />
            </el-table>
          </div>

          <div v-if="previewDataList.length > 5" class="more-tip">
            还有 {{ previewDataList.length - 5 }} 条记录未显示...
          </div>
        </el-card>

        <!-- 错误信息 -->
        <el-card class="error-card" shadow="never" v-if="importErrors.length > 0">
          <template #header>
            <div class="card-header">
              <span class="card-title">⚠️ 数据验证错误</span>
              <el-tag type="danger" size="small">{{ importErrors.length }} 个错误</el-tag>
            </div>
          </template>

          <el-alert
            title="数据导入提示"
            type="warning"
            :closable="false"
            style="margin-bottom: 16px;"
          >
            <template #default>
              <p>发现以下数据问题，请修正后重新导入：</p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>记录编码和批次号无需在Excel中填写，系统将自动生成</li>
                <li>请确保必填字段（日期、数量等）不为空</li>
                <li>数字字段请填写有效数值</li>
                <li>日期格式建议使用：YYYY-MM-DD</li>
              </ul>
            </template>
          </el-alert>

          <el-table
            :data="importErrors.slice(0, 10)"
            border
            size="small"
            max-height="200"
          >
            <el-table-column prop="row" label="行号" width="60" />
            <el-table-column prop="field" label="字段" width="120" />
            <el-table-column prop="type" label="错误类型" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="getErrorTypeTagType(row.type)"
                  size="small"
                >
                  {{ getErrorTypeDisplayName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="错误信息" />
            <el-table-column prop="originalValue" label="原始值" width="120">
              <template #default="{ row }">
                <span class="error-value">{{ row.originalValue || '(空)' }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="importErrors.length > 10" class="more-errors">
            还有 {{ importErrors.length - 10 }} 个错误未显示...
          </div>
        </el-card>
      </div>

      <!-- 导入进度 -->
      <div v-if="importing" class="import-progress">
        <el-card shadow="never">
          <h4>{{ progress.currentStep }}</h4>
          <el-progress
            :percentage="progress.progress"
            :status="progress.status === 'error' ? 'exception' : undefined"
            :stroke-width="8"
          />
          <p class="progress-text">
            已处理 {{ progress.processedRows }} / {{ progress.totalRows }} 条记录
          </p>
        </el-card>
      </div>

      <!-- 导入结果 -->
      <div v-if="importResult" class="import-result">
        <el-card shadow="never">
          <el-result
            :icon="importResult.success ? 'success' : 'error'"
            :title="importResult.success ? '导入成功' : '导入失败'"
            :sub-title="importResult.message"
          >
            <template #extra>
              <div class="result-stats" v-if="importResult.success">
                <el-statistic title="总记录数" :value="importResult.summary.totalRows" />
                <el-statistic title="成功导入" :value="importResult.summary.successRows" />
                <el-statistic title="错误记录" :value="importResult.summary.errorRows" />
              </div>
              <div class="result-actions">
                <el-button type="primary" @click="handleClose" v-if="importResult.success">
                  完成
                </el-button>
                <el-button @click="resetImport" v-else>重新导入</el-button>
              </div>
            </template>
          </el-result>
        </el-card>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="startImport"
          :disabled="!canImport"
          :loading="importing"
        >
          {{ importing ? '导入中...' : '开始导入' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadInstance, UploadRawFile } from 'element-plus';
import * as XLSX from 'xlsx';
import { ExcelParser } from '@/utils/excel-parser';
import type {
  ExcelFileInfo,
  ExcelImportConfig,
  ExcelImportResult,
  ExcelImportError,
  ImportProgress
} from '@/api/erp/saltprocess/records/excel-import/types';

// Props
interface Props {
  visible: boolean;
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [data: any[]];
}>();

// 响应式数据
const uploadRef = ref<UploadInstance>();
const fileInfo = ref<ExcelFileInfo | null>(null);
const previewDataList = ref<any[]>([]);
const importErrors = ref<ExcelImportError[]>([]);
const importing = ref(false);
const importResult = ref<ExcelImportResult<any> | null>(null);

// 导入配置
const importConfig = reactive<Partial<ExcelImportConfig>>({
  sheetName: '',
  dataStartRow: 2
});

// 导入进度
const progress = reactive<ImportProgress>({
  status: 'idle',
  currentStep: '',
  progress: 0,
  processedRows: 0,
  totalRows: 0,
  errors: []
});

// Excel解析器
const excelParser = new ExcelParser();

// 计算属性
const canImport = computed(() => {
  return fileInfo.value &&
         fileInfo.value.detectedType !== 'unknown' &&
         previewDataList.value.length > 0 &&
         !importing.value;
});

const validRecords = computed(() => {
  return previewDataList.value.length - importErrors.value.length;
});

const errorRecords = computed(() => {
  return importErrors.value.length;
});

// 方法
const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getTypeTagType = (type: string) => {
  switch (type) {
    case 'molten_salt_inventory': return 'success';
    case 'salt_process': return 'primary';
    default: return 'warning';
  }
};

const getTypeDisplayName = (type: string) => {
  switch (type) {
    case 'molten_salt_inventory': return '熔盐入库统计表';
    case 'salt_process': return '化盐量记录表';
    default: return '未知类型';
  }
};

const getErrorTypeTagType = (type: string) => {
  switch (type) {
    case 'validation': return 'danger';
    case 'parsing': return 'warning';
    case 'calculation': return 'info';
    default: return 'info';
  }
};

const getErrorTypeDisplayName = (type: string) => {
  switch (type) {
    case 'validation': return '验证错误';
    case 'parsing': return '解析错误';
    case 'calculation': return '计算错误';
    default: return '未知错误';
  }
};

// 文件上传前验证
const beforeUpload = (file: UploadRawFile) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel';
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!');
    return false;
  }
  return true;
};

// 文件变化处理
const handleFileChange = async (file: any) => {
  if (file.raw) {
    try {
      // 设置进度回调
      excelParser.setProgressCallback((progressInfo) => {
        Object.assign(progress, progressInfo);
      });

      // 解析文件
      const info = await excelParser.parseFile(file.raw);
      fileInfo.value = info;
      
      // 设置默认配置
      importConfig.sheetName = info.config.sheetName || info.sheetNames[0];
      importConfig.dataStartRow = info.config.dataStartRow;

      // 预览数据
      await loadPreviewData();
    } catch (error) {
      ElMessage.error(`文件解析失败: ${error}`);
      console.error('文件解析错误:', error);
    }
  }
};

// 预览数据
const loadPreviewData = async () => {
  if (!fileInfo.value) return;

  try {
    let result: ExcelImportResult<any>;

    if (fileInfo.value.detectedType === 'molten_salt_inventory') {
      result = await excelParser.importMoltenSaltInventory(importConfig);
    } else if (fileInfo.value.detectedType === 'salt_process') {
      result = await excelParser.importSaltProcess(importConfig);
    } else {
      ElMessage.warning('未识别的表格类型，请检查文件格式');
      return;
    }
    previewDataList.value = result.data;
    importErrors.value = result.errors;

    if (result.data.length > 0) {
      ElMessage.success(`成功解析 ${result.data.length} 条记录`);
    } else {
      ElMessage.warning('未解析到任何数据，请检查Excel文件格式');
    }

    if (result.errors.length > 0) {
      ElMessage.warning(`发现 ${result.errors.length} 个数据错误，请检查后重新导入`);
    }
  } catch (error) {
    ElMessage.error(`数据预览失败: ${error}`);
    console.error('数据预览错误:', error);
  }
};

// 开始导入
const startImport = async () => {
  if (!canImport.value) return;

  try {
    importing.value = true;
    importResult.value = null;

    // 模拟导入过程
    let result: ExcelImportResult<any>;

    if (fileInfo.value!.detectedType === 'molten_salt_inventory') {
      result = await excelParser.importMoltenSaltInventory(importConfig);
    } else {
      result = await excelParser.importSaltProcess(importConfig);
    }

    importResult.value = {
      ...result,
      message: result.success
        ? `成功导入 ${result.summary.successRows} 条记录`
        : `导入失败，${result.summary.errorRows} 条记录有错误`
    };

    if (result.success) {
      ElMessage.success('数据导入成功');
      emit('success', result.data);
    } else {
      ElMessage.error('数据导入失败，请检查错误信息');
    }
  } catch (error) {
    ElMessage.error(`导入失败: ${error}`);
    importResult.value = {
      success: false,
      data: [],
      errors: [],
      summary: { totalRows: 0, successRows: 0, errorRows: 0, calculatedFields: [] },
      message: `导入过程中发生错误: ${error}`
    };
  } finally {
    importing.value = false;
  }
};

// 下载模板
const downloadTemplate = () => {
  // 创建熔盐入库统计表模板
  const moltenSaltTemplate = [
    {
      '日期': '2024-12-01',
      '钠（单位：袋）': 24,
      '钾（单位：袋）': 30,
      '总粉碎量': 54,
      '备注': '系统将自动生成记录编码和批次号'
    },
    {
      '日期': '2024-12-02',
      '钠（单位：袋）': 16,
      '钾（单位：袋）': 20,
      '总粉碎量': 36,
      '备注': ''
    }
  ];

  // 创建化盐量记录表模板
  const saltProcessTemplate = [
    {
      '序号': 1,
      '日期': '2024-12-01',
      '垃圾': 100,
      '硝酸钠': 60,
      '硝酸钾': 40,
      '每垃圾化盐量': 1.2,
      '累积化盐量': 120,
      '熔盐罐熔盐温度': 450,
      '熔盐罐熔盐液位': 2.5,
      '每垃圾天然气耗量': 15,
      '每垃圾用电量': 8,
      '人数': 3,
      '记录人': '张三',
      '备注': '系统将自动生成记录编码和批次号'
    }
  ];

  // 创建工作簿
  const wb = XLSX.utils.book_new();

  // 添加熔盐入库统计表
  const ws1 = XLSX.utils.json_to_sheet(moltenSaltTemplate);
  XLSX.utils.book_append_sheet(wb, ws1, '熔盐入库统计表');

  // 添加化盐量记录表
  const ws2 = XLSX.utils.json_to_sheet(saltProcessTemplate);
  XLSX.utils.book_append_sheet(wb, ws2, '化盐量记录表');

  // 下载文件
  XLSX.writeFile(wb, '盐化工艺数据导入模板.xlsx');
  ElMessage.success('模板下载成功');
};

// 重置文件
const resetFile = () => {
  fileInfo.value = null;
  previewDataList.value = [];
  importErrors.value = [];
  importResult.value = null;
  uploadRef.value?.clearFiles();
};

// 重置导入
const resetImport = () => {
  importResult.value = null;
  importing.value = false;
  Object.assign(progress, {
    status: 'idle',
    currentStep: '',
    progress: 0,
    processedRows: 0,
    totalRows: 0,
    errors: []
  });
};

// 处理弹窗可见性变化
const handleDialogVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
  // 重置状态
  setTimeout(() => {
    resetFile();
    resetImport();
  }, 300);
};
</script>

<style scoped lang="scss">
.enhanced-import-dialog {
  .import-container {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .upload-card {
      margin-bottom: 20px;

      .upload-demo {
        .el-upload__tip {
          text-align: center;
          color: #909399;
          font-size: 12px;
          line-height: 1.5;
        }
      }
    }

    .file-info-section {
      .file-info-card {
        margin-bottom: 20px;

        .sheet-tag {
          margin-right: 8px;
        }

        .import-config {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #ebeef5;

          h4 {
            margin-bottom: 16px;
            color: #303133;
          }
        }
      }

      .preview-card {
        margin-bottom: 20px;

        .preview-stats {
          display: flex;
          gap: 8px;
        }

        .calculated-field {
          color: #67c23a;
          font-weight: 500;
        }

        .more-tip {
          text-align: center;
          color: #909399;
          margin-top: 12px;
          font-size: 12px;
        }
      }

      .error-card {
        margin-bottom: 20px;

        .more-errors {
          text-align: center;
          color: #f56c6c;
          margin-top: 12px;
          font-size: 12px;
        }
      }
    }

    .import-progress {
      margin: 20px 0;

      h4 {
        margin-bottom: 16px;
        color: #303133;
      }

      .progress-text {
        text-align: center;
        margin-top: 12px;
        color: #606266;
        font-size: 14px;
      }
    }

    .import-result {
      .result-stats {
        display: flex;
        gap: 40px;
        justify-content: center;
        margin-bottom: 20px;
      }

      .result-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }

  // 字段样式
  .calculated-field {
    color: #67c23a;
    font-weight: 500;
  }

  .auto-generated-field {
    color: #409eff;
    font-weight: 500;
    font-style: italic;
  }

  .error-value {
    color: #f56c6c;
    font-family: monospace;
  }

  .error-card {
    .more-errors {
      text-align: center;
      color: #f56c6c;
      margin-top: 12px;
      font-size: 12px;
    }
  }
}
</style>
