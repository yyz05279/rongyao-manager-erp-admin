<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleDialogVisibleChange"
    title="导入化盐记录"
    width="60%"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="import-container">

      <!-- Excel导入 -->
      <div v-if="importMethod === 'excel'" class="excel-import">
        <el-card class="import-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">📊 Excel文件导入</span>
              <el-button type="primary" size="small" @click="downloadTemplate">
                下载模板
              </el-button>
            </div>
          </template>
          
          <!-- 文件上传 -->
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
            :on-remove="handleFileRemove"
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
                只能上传 .xlsx/.xls 文件，且不超过 10MB
              </div>
            </template>
          </el-upload>

          <!-- 文件解析状态 -->
          <div v-if="importing" class="parsing-status">
            <el-alert
              :title="importProgressText"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <el-progress :percentage="50" :show-text="false" />
              </template>
            </el-alert>
          </div>

          <!-- 文件信息显示 -->
          <div v-if="fileInfo && !importing" class="file-info">
            <el-alert
              :title="`文件解析成功 - ${fileInfo.fileName}`"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <div class="file-details">
                  <p><strong>文件类型:</strong> {{ getFileTypeText(fileInfo.detectedType) }}</p>
                  <p><strong>数据行数:</strong> {{ previewData.length }}行</p>
                  <p><strong>解析时间:</strong> {{ new Date().toLocaleTimeString() }}</p>
                </div>
              </template>
            </el-alert>
          </div>

          <!-- 数据验证结果 -->
          <div v-if="validationResult" class="validation-section">
            <el-alert
              :title="`数据验证完成 - 共${validationResult.totalCount}条记录`"
              :type="validationResult.isValid ? 'success' : 'warning'"
              :description="`有效记录：${validationResult.validCount}条，无效记录：${validationResult.invalidCount}条`"
              show-icon
              :closable="false"
            />

            <!-- 错误详情 -->
            <div v-if="validationResult.errors.length > 0" class="error-details">
              <h5>❌ 验证错误 ({{ validationResult.errors.length }}条)</h5>
              <el-table
                :data="validationResult.errors.slice(0, 10)"
                border
                size="small"
                max-height="200"
              >
                <el-table-column label="行号" prop="rowIndex" width="60" align="center" />
                <el-table-column label="字段" prop="field" width="120" />
                <el-table-column label="错误值" prop="value" width="120" show-overflow-tooltip />
                <el-table-column label="错误类型" prop="errorType" width="100">
                  <template #default="scope">
                    <el-tag :type="getErrorTypeTag(scope.row.errorType)" size="small">
                      {{ getErrorTypeText(scope.row.errorType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="错误信息" prop="message" show-overflow-tooltip />
              </el-table>
              <div v-if="validationResult.errors.length > 10" class="more-tip">
                还有 {{ validationResult.errors.length - 10 }} 条错误未显示...
              </div>
            </div>

            <!-- 警告详情 -->
            <div v-if="validationResult.warnings.length > 0" class="warning-details">
              <h5>⚠️ 验证警告 ({{ validationResult.warnings.length }}条)</h5>
              <el-table
                :data="validationResult.warnings.slice(0, 5)"
                border
                size="small"
                max-height="150"
              >
                <el-table-column label="行号" prop="rowIndex" width="60" align="center" />
                <el-table-column label="字段" prop="field" width="120" />
                <el-table-column label="警告值" prop="value" width="120" show-overflow-tooltip />
                <el-table-column label="警告类型" prop="warningType" width="100">
                  <template #default="scope">
                    <el-tag type="warning" size="small">
                      {{ getWarningTypeText(scope.row.warningType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="警告信息" prop="message" show-overflow-tooltip />
              </el-table>
            </div>
          </div>

          <!-- 数据预览 -->
          <div v-if="previewData.length > 0" class="preview-section">
            <h4>📊 导入数据预览 (共 {{ previewData.length }} 条二元化盐记录)</h4>
            <el-table
              :data="previewData.slice(0, 5)"
              border
              size="small"
              max-height="400"
              style="width: 100%"
              :row-class-name="getRowClassName"
            >
              <el-table-column label="序号" type="index" width="60" align="center" />
              <el-table-column label="记录编码" prop="recordCode" width="140" show-overflow-tooltip />
              <el-table-column label="项目ID" prop="projectId" width="80" align="center" />
              <el-table-column label="日期" prop="recordDate" width="120" />
              <el-table-column label="班次" prop="shift" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.shift === 1 ? 'primary' : 'warning'">
                    {{ scope.row.shift === 1 ? '白班' : '夜班' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="硝酸钠(t)" prop="nano3ActualWeight" width="100">
                <template #default="scope">
                  {{ formatWeight(scope.row.nano3ActualWeight) }}
                </template>
              </el-table-column>
              <el-table-column label="硝酸钾(t)" prop="kno3ActualWeight" width="100">
                <template #default="scope">
                  {{ formatWeight(scope.row.kno3ActualWeight) }}
                </template>
              </el-table-column>
              <el-table-column label="硝酸钠：硝酸钾" width="130">
                <template #default="scope">
                  <span :class="getRatioClass(scope.row)">
                    {{ formatRatio(scope.row.nano3ActualWeight, scope.row.kno3ActualWeight) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="总计化盐(t)" width="110">
                <template #default="scope">
                  {{ formatWeight(getTotalSaltWeight(scope.row)) }}
                </template>
              </el-table-column>
              <el-table-column label="熔盐液位(m)" prop="moltenSaltLevel" width="110">
                <template #default="scope">
                  {{ scope.row.moltenSaltLevel || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="熔盐温度(℃)" prop="moltenSaltTemperature" width="110">
                <template #default="scope">
                  {{ scope.row.moltenSaltTemperature || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="天然气耗量(Nm³)" prop="gasConsumption" width="130">
                <template #default="scope">
                  {{ scope.row.gasConsumption || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="用电量(KWh)" prop="powerConsumption" width="120">
                <template #default="scope">
                  {{ scope.row.powerConsumption || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="人数" prop="staffCount" width="80">
                <template #default="scope">
                  {{ scope.row.staffCount || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="记录人" prop="recorderName" width="100">
                <template #default="scope">
                  {{ scope.row.recorderName || scope.row.operatorName || '-' }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="previewData.length > 5" class="more-tip">
              还有 {{ previewData.length - 5 }} 条记录未显示，导入时将处理全部数据...
            </div>
          </div>

          <!-- 导入进度 -->
          <div v-if="importing" class="import-progress">
            <el-progress
              :percentage="importProgress"
              :status="importStatus"
              :stroke-width="8"
            />
            <p class="progress-text">{{ importProgressText }}</p>
          </div>

          <!-- 导入结果 -->
          <div v-if="importResult" class="import-result">
            <el-alert
              :title="importResult.title"
              :type="importResult.type"
              :description="importResult.description"
              show-icon
              :closable="false"
            />
          </div>
        </el-card>
      </div>

      <!-- 手动录入 -->
      <div v-if="importMethod === 'manual'" class="manual-input">
        <el-card class="import-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">✏️ 手动录入记录</span>
              <el-button type="primary" size="small" @click="addRecord">
                添加记录
              </el-button>
            </div>
          </template>

          <div v-if="manualRecords.length === 0" class="empty-state">
            <el-empty description="暂无记录，点击上方按钮添加记录" />
          </div>

          <div v-else class="manual-records">
            <el-table :data="manualRecords" border size="small">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="recordCode" label="记录编码" width="120" />
              <el-table-column prop="batchNumber" label="批次号" width="120" />
              <el-table-column prop="projectId" label="项目ID" width="80" />
              <el-table-column prop="operatorName" label="操作员" width="100" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="editRecord(scope.$index)">
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" @click="deleteRecord(scope.$index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleImport" 
          :loading="importing"
          :disabled="!canImport"
        >
          {{ importing ? '导入中...' : '开始导入' }}
        </el-button>
      </div>
    </template>

    <!-- 手动录入表单弹窗 -->
    <EditForm
      v-model:visible="editFormVisible"
      :title="editFormTitle"
      :record-id="null"
      @success="handleRecordSaved"
    />
  </el-dialog>
</template>

<script setup name="ImportDialog" lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadInstance, UploadRawFile } from 'element-plus';
import * as XLSX from 'xlsx';
import EditForm from './EditForm.vue';
import type {
  BinaryRecordForm,
  ValidationResult,
  ImportError,
  ImportWarning,
  BatchImportResult
} from '@/api/erp/saltprocess/records/binary/types';
import {
  batchImportBinaryRecord,
  validateBatchImportData
} from '@/api/erp/saltprocess/records/binary';
import { ExcelParser } from '@/utils/excel-parser';
import type {
  ExcelFileInfo,
  ExcelImportError
} from '@/api/erp/saltprocess/records/excel-import/types';

// Props
interface Props {
  visible: boolean;
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [];
}>();

// 响应式数据
const importMethod = ref<'excel' | 'manual'>('excel');
const uploadRef = ref<UploadInstance>();
const previewData = ref<BinaryRecordForm[]>([]);
const importing = ref(false);
const importProgress = ref(0);
const importStatus = ref<'success' | 'exception' | undefined>();
const importProgressText = ref('');
const importResult = ref<{
  title: string;
  type: 'success' | 'warning' | 'error';
  description: string;
} | null>(null);

// Excel解析相关
const fileInfo = ref<ExcelFileInfo | null>(null);
const importErrors = ref<ExcelImportError[]>([]);
const excelParser = new ExcelParser();

// 数据验证相关
const validationResult = ref<ValidationResult | null>(null);
const validatedData = ref<BinaryRecordForm[]>([]);
const validating = ref(false);

// 手动录入相关
const manualRecords = ref<BinaryRecordForm[]>([]);
const editFormVisible = ref(false);
const editFormTitle = ref('新增记录');

// 计算属性
const canImport = computed(() => {
  const result = {
    importing: importing.value,
    validating: validating.value,
    importMethod: importMethod.value,
    previewDataLength: previewData.value.length,
    hasValidationResult: !!validationResult.value,
    validCount: validationResult.value?.validCount || 0,
    manualRecordsLength: manualRecords.value.length
  };

  console.log('canImport 计算状态:', result);

  // 如果正在导入或验证中，禁用按钮
  if (importing.value || validating.value) {
    console.log('按钮禁用原因: 正在导入或验证中');
    return false;
  }

  if (importMethod.value === 'excel') {
    // Excel导入需要有预览数据
    if (previewData.value.length === 0) {
      console.log('按钮禁用原因: 没有预览数据');
      return false;
    }

    // 如果有验证结果，检查是否有有效记录
    if (validationResult.value) {
      const canImportResult = validationResult.value.validCount > 0;
      console.log('基于验证结果的导入判断:', canImportResult, '有效记录数:', validationResult.value.validCount);
      return canImportResult;
    }

    // 如果还没有验证结果，但有预览数据，允许导入
    console.log('没有验证结果但有预览数据，允许导入');
    return true;
  } else {
    // 手动录入模式
    const canImportManual = manualRecords.value.length > 0;
    console.log('手动录入模式导入判断:', canImportManual);
    return canImportManual;
  }
});



// 下载模板
const downloadTemplate = () => {
  // 创建模板数据 - 与前端表格列结构完全一致
  const templateData = [
    {
      '记录编码': 'BIN_1733097600_001',
      '项目ID': 101,
      '日期': '2024-12-01',
      '班次': 1,
      '硝酸钠(t)': 3.60,
      '硝酸钾(t)': 2.40,
      '硝酸钠：硝酸钾': '6.0:4.0',
      '总计化盐(t)': 6.00,
      '熔盐液位(m)': 2.5,
      '熔盐温度(℃)': 565,
      '天然气耗量(Nm³)': 1200,
      '用电量(KWh)': 850,
      '人数': 8,
      '记录人': '张三',
      '备注': '正常生产'
    },
    {
      '记录编码': 'BIN_1733097600_002',
      '项目ID': 102,
      '日期': '2024-12-01',
      '班次': 2,
      '硝酸钠(t)': 3.58,
      '硝酸钾(t)': 2.42,
      '硝酸钠：硝酸钾': '5.9:4.1',
      '总计化盐(t)': 6.00,
      '熔盐液位(m)': 2.3,
      '熔盐温度(℃)': 570,
      '天然气耗量(Nm³)': 1180,
      '用电量(KWh)': 820,
      '人数': 6,
      '记录人': '李四',
      '备注': '夜班生产'
    }
  ];

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '二元化盐记录模板');

  // 设置列宽以提高可读性
  const colWidths = [
    { wch: 18 }, // 记录编码
    { wch: 8 },  // 项目ID
    { wch: 12 }, // 日期
    { wch: 8 },  // 班次
    { wch: 12 }, // 硝酸钠(t)
    { wch: 12 }, // 硝酸钾(t)
    { wch: 15 }, // 硝酸钠：硝酸钾
    { wch: 12 }, // 总计化盐(t)
    { wch: 12 }, // 熔盐液位(m)
    { wch: 12 }, // 熔盐温度(℃)
    { wch: 15 }, // 天然气耗量(Nm³)
    { wch: 12 }, // 用电量(KWh)
    { wch: 8 },  // 人数
    { wch: 10 }, // 记录人
    { wch: 15 }  // 备注
  ];
  ws['!cols'] = colWidths;

  // 下载文件
  XLSX.writeFile(wb, '二元化盐记录导入模板.xlsx');
  ElMessage.success('模板下载成功');
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
    // 重置所有相关状态
    resetImportState();

    // 显示加载状态
    importing.value = true;
    importProgressText.value = '正在解析Excel文件...';

    try {
      await parseExcelFile(file.raw);
    } catch (error) {
      console.error('文件解析失败:', error);
      ElMessage.error('文件解析失败，请检查文件格式');
    } finally {
      importing.value = false;
      importProgressText.value = '';
    }
  }
};

// 重置导入状态
const resetImportState = () => {
  // 清空之前的数据
  previewData.value = [];
  validatedData.value = [];
  fileInfo.value = null;
  importErrors.value = [];
  validationResult.value = null;
  importResult.value = null;

  // 重置状态
  importing.value = false;
  validating.value = false;
  importProgress.value = 0;
  importStatus.value = undefined;
  importProgressText.value = '';

  console.log('导入状态已重置，准备处理新文件');
};

// 处理文件超出限制（替换文件）
const handleFileExceed = (files: File[]) => {
  if (uploadRef.value) {
    // 清除现有文件
    uploadRef.value.clearFiles();

    // 重置状态
    resetImportState();

    // 添加新文件并自动解析
    const file = files[0];
    if (file) {
      ElMessage.info('正在替换文件并重新解析...');

      // 模拟文件变化事件
      handleFileChange({
        raw: file,
        name: file.name,
        size: file.size
      });
    }
  }
};

// 处理文件移除
const handleFileRemove = () => {
  resetImportState();
  ElMessage.info('已清除文件和解析数据');
};

// 获取文件类型文本
const getFileTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'molten_salt_inventory': '熔盐库存表',
    'salt_process': '化盐工艺表',
    'standard_template': '标准模板',
    'unknown': '未知格式'
  };
  return typeMap[type] || '未知格式';
};

// 解析Excel文件 - 支持标准模板格式
const parseExcelFile = async (file: File) => {
  console.log('开始解析新的Excel文件:', file.name);

  try {
    // 更新解析状态
    importProgressText.value = `正在读取文件: ${file.name}`;

    // 1. 直接解析Excel文件
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      ElMessage.warning('Excel文件中没有数据');
      return;
    }

    importProgressText.value = `正在解析 ${jsonData.length} 行数据...`;

    // 2. 检查是否为标准模板格式
    const firstRow = jsonData[0] as any;
    const isStandardTemplate = firstRow.hasOwnProperty('记录编码') &&
                              firstRow.hasOwnProperty('项目ID') &&
                              firstRow.hasOwnProperty('硝酸钠(t)') &&
                              firstRow.hasOwnProperty('硝酸钾(t)');

    let binaryRecords: BinaryRecordForm[];

    if (isStandardTemplate) {
      // 3a. 使用标准模板解析
      binaryRecords = convertStandardTemplateToBinaryRecords(jsonData);

      // 设置标准模板的文件信息
      fileInfo.value = {
        fileName: file.name,
        fileSize: file.size,
        sheetNames: [sheetName],
        detectedType: 'standard_template' as any,
        config: {
          headerRow: 1,
          dataStartRow: 2,
          columnMapping: {},
          requiredFields: ['记录编码', '项目ID', '硝酸钠(t)', '硝酸钾(t)']
        }
      };

      ElMessage.success(`成功解析标准模板 ${binaryRecords.length} 条记录`);
    } else {
      // 3b. 尝试使用原有的ExcelParser解析
      fileInfo.value = await excelParser.parseFile(file);

      if (!fileInfo.value || fileInfo.value.detectedType === 'unknown') {
        ElMessage.warning('未识别的Excel文件类型，请使用标准模板或检查文件格式');
        return;
      }

      let result: any;
      if (fileInfo.value.detectedType === 'molten_salt_inventory') {
        result = await excelParser.importMoltenSaltInventory();
      } else if (fileInfo.value.detectedType === 'salt_process') {
        result = await excelParser.importSaltProcess();
      } else {
        ElMessage.warning('当前文件类型不支持二元化盐记录导入');
        return;
      }

      binaryRecords = convertToBinaryRecords(result.data);

      if (result.errors.length > 0) {
        ElMessage.warning(`解析完成，但有 ${result.errors.length} 条记录存在错误`);
      }
    }

    previewData.value = binaryRecords;

    if (binaryRecords.length === 0) {
      ElMessage.warning('未解析到任何数据，请检查Excel文件格式');
      return;
    }

    // 自动进行数据验证
    await validateImportData(binaryRecords);

  } catch (error) {
    ElMessage.error(`文件解析失败: ${error}`);
    console.error('Excel解析错误:', error);
  }
};

// 将标准模板数据转换为二元化盐记录格式
const convertStandardTemplateToBinaryRecords = (data: any[]): BinaryRecordForm[] => {
  return data.map((item: any, index: number) => {
    // 生成当前时间作为默认值
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // 解析配比字符串 "6.0:4.0" -> [6.0, 4.0]
    const parseRatio = (ratioStr: string) => {
      if (!ratioStr || typeof ratioStr !== 'string') return [6.0, 4.0];
      const parts = ratioStr.split(':');
      if (parts.length !== 2) return [6.0, 4.0];
      return [parseFloat(parts[0]) || 6.0, parseFloat(parts[1]) || 4.0];
    };

    const [nano3Ratio, kno3Ratio] = parseRatio(item['硝酸钠：硝酸钾']);

    return {
      recordCode: item['记录编码'] || `BIN_${Date.now()}_${String(index + 1).padStart(3, '0')}`,
      batchNumber: `BATCH_${(item['日期'] || now.toISOString().split('T')[0]).replace(/-/g, '')}_${String(index + 1).padStart(3, '0')}`,
      projectId: parseInt(item['项目ID']) || 101,
      recordDate: item['日期'] || now.toISOString().split('T')[0],
      startTime: timeStr,
      endTime: timeStr,
      shift: parseInt(item['班次']) || 1,

      // NaNO3配比信息 - 从模板中的吨数转换为kg
      nano3TargetRatio: nano3Ratio / 10, // 转换为小数形式
      nano3ActualRatio: nano3Ratio / 10,
      nano3TargetWeight: (parseFloat(item['硝酸钠(t)']) || 0) * 1000, // 吨转kg
      nano3ActualWeight: (parseFloat(item['硝酸钠(t)']) || 0) * 1000,

      // KNO3配比信息 - 从模板中的吨数转换为kg
      kno3TargetRatio: kno3Ratio / 10, // 转换为小数形式
      kno3ActualRatio: kno3Ratio / 10,
      kno3TargetWeight: (parseFloat(item['硝酸钾(t)']) || 0) * 1000, // 吨转kg
      kno3ActualWeight: (parseFloat(item['硝酸钾(t)']) || 0) * 1000,

      // 工艺参数
      reactionTemperature: parseFloat(item['熔盐温度(℃)']) || 565,
      reactionTime: 120, // 默认反应时间(分钟)
      stirringSpeed: 100, // 默认搅拌速度
      heatingPower: 50, // 默认加热功率
      phValue: 7.0, // 默认pH值
      density: 2.1, // 默认密度

      // 质量信息
      moistureContent: 0.5, // 默认水分含量
      purity: 99.0, // 默认纯度
      qualityGrade: 1, // 默认质量等级
      qualityCheckResult: 1, // 默认质检结果
      qualityIssues: '',
      correctiveActions: '',

      // 产量信息
      targetOutput: (parseFloat(item['总计化盐(t)']) || 0) * 1000, // 吨转kg
      actualOutput: (parseFloat(item['总计化盐(t)']) || 0) * 1000,

      // 成本信息
      materialCost: 0, // 默认材料成本
      energyCost: 0, // 默认能源成本
      laborCost: 0, // 默认人工成本

      // 新增字段 - 直接从模板读取
      moltenSaltLevel: parseFloat(item['熔盐液位(m)']) || 2.5,
      moltenSaltTemperature: parseFloat(item['熔盐温度(℃)']) || 565,
      gasConsumption: parseFloat(item['天然气耗量(Nm³)']) || 1200,
      powerConsumption: parseFloat(item['用电量(KWh)']) || 850,
      staffCount: parseInt(item['人数']) || 8,
      recorderName: item['记录人'] || '系统导入',
      cumulativeSaltAmount: 0, // 累积化盐量 - 需要后续计算

      operatorId: 1, // 默认操作员ID
      supervisorId: 1, // 默认监督员ID
      remarks: item['备注'] || `从标准模板导入 - 硝酸钠${item['硝酸钠(t)']}吨, 硝酸钾${item['硝酸钾(t)']}吨, 人数${item['人数']}人`
    } as BinaryRecordForm;
  });
};

// 将Excel解析的数据转换为二元化盐记录格式
const convertToBinaryRecords = (data: any[]): BinaryRecordForm[] => {
  return data.map((item: any, index: number) => {
    // 生成当前时间作为默认值
    const now = new Date();
    const dateStr = item.date || now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    return {
      recordCode: item.recordCode || `BIN_${Date.now()}_${String(index + 1).padStart(3, '0')}`,
      batchNumber: item.batchNumber || `BATCH_${dateStr.replace(/-/g, '')}_${String(index + 1).padStart(3, '0')}`,
      projectId: item.projectId || 101, // 从Excel读取项目ID，默认101
      recordDate: dateStr,
      startTime: timeStr,
      endTime: timeStr,
      shift: item.shift || 1, // 从Excel读取班次，默认白班

      // NaNO3配比信息
      nano3TargetRatio: 0.6, // 默认NaNO3目标配比
      nano3ActualRatio: 0.6, // 默认NaNO3实际配比
      nano3TargetWeight: (item.sodiumWeight || (item.sodiumBags || 0) * 1.2) * 1000, // 吨转换为kg
      nano3ActualWeight: (item.sodiumWeight || (item.sodiumBags || 0) * 1.2) * 1000, // 吨转换为kg

      // KNO3配比信息
      kno3TargetRatio: 0.4, // 默认KNO3目标配比
      kno3ActualRatio: 0.4, // 默认KNO3实际配比
      kno3TargetWeight: (item.potassiumWeight || (item.potassiumBags || 0) * 1.0) * 1000, // 吨转换为kg
      kno3ActualWeight: (item.potassiumWeight || (item.potassiumBags || 0) * 1.0) * 1000, // 吨转换为kg

      // 工艺参数
      reactionTemperature: 850, // 默认反应温度
      reactionTime: 120, // 默认反应时间(分钟)
      stirringSpeed: 100, // 默认搅拌速度
      heatingPower: 50, // 默认加热功率
      phValue: 7.0, // 默认pH值
      density: 2.1, // 默认密度

      // 质量信息
      moistureContent: 0.5, // 默认水分含量
      purity: 99.0, // 默认纯度
      qualityGrade: 1, // 默认质量等级
      qualityCheckResult: 1, // 默认质检结果

      // 产量信息
      targetOutput: item.totalWeight || 0, // 目标产量
      actualOutput: item.totalWeight || 0, // 实际产量

      // 成本信息
      materialCost: 0, // 默认材料成本
      energyCost: 0, // 默认能源成本
      laborCost: 0, // 默认人工成本

      // 新增字段 - 根据Excel表格结构
      moltenSaltLevel: parseFloat(item.moltenSaltLevel) || 2.5, // 熔盐液位(m) - 默认2.5m
      moltenSaltTemperature: parseFloat(item.moltenSaltTemperature) || 565, // 熔盐温度(℃) - 默认565℃
      gasConsumption: parseFloat(item.gasConsumption) || 1200, // 天然气耗量(Nm³) - 默认1200
      powerConsumption: parseFloat(item.powerConsumption) || 850, // 用电量(KWh) - 默认850
      staffCount: parseInt(item.staffCount) || 8, // 人数 - 默认8人
      recorderName: item.recorderName || item.operatorName || '系统导入', // 记录人
      cumulativeSaltAmount: 0, // 累积化盐量 - 需要后续计算

      operatorId: 1, // 默认操作员ID
      remarks: `从Excel导入 - 原始数据: 钠盐${item.sodiumBags || 0}袋(${((item.sodiumBags || 0) * 1.2).toFixed(1)}吨), 钾盐${item.potassiumBags || 0}袋(${((item.potassiumBags || 0) * 1.0).toFixed(1)}吨), 人数${item.staffCount || 0}人`
    } as BinaryRecordForm;
  });
};

// 数据验证方法
const validateImportData = async (data: BinaryRecordForm[]) => {
  try {
    validating.value = true;
    validationResult.value = null;

    console.log('开始数据验证，记录数量:', data.length);

    // 前端基础验证
    const frontendValidation = performFrontendValidation(data);
    console.log('前端验证结果:', frontendValidation);

    // 暂时只使用前端验证，避免后端API调用失败影响流程
    validationResult.value = frontendValidation;

    // 保存验证通过的数据
    if (validationResult.value) {
      validatedData.value = data.filter((_, index) => {
        return !validationResult.value!.errors.some(error => error.rowIndex === index + 1);
      });
      console.log('验证通过的数据数量:', validatedData.value.length);
    }

    const message = `数据验证完成 - 有效记录：${validationResult.value?.validCount || 0}条`;
    console.log(message);
    ElMessage.success(message);

  } catch (error) {
    console.error('数据验证错误:', error);
    ElMessage.error(`数据验证失败: ${error}`);

    // 即使验证失败，也要设置一个基本的验证结果，允许用户继续操作
    validationResult.value = {
      isValid: true,
      totalCount: data.length,
      validCount: data.length,
      invalidCount: 0,
      errors: [],
      warnings: []
    };
    validatedData.value = data;
  } finally {
    validating.value = false;
    console.log('验证状态重置，validating:', validating.value);
  }
};

// 前端数据验证
const performFrontendValidation = (data: BinaryRecordForm[]): ValidationResult => {
  console.log('开始前端验证，数据数量:', data.length);

  const errors: ImportError[] = [];
  const warnings: ImportWarning[] = [];

  data.forEach((record, index) => {
    const rowIndex = index + 1;

    // 必填字段验证
    if (!record.recordCode) {
      errors.push({
        rowIndex,
        field: '记录编码',
        value: record.recordCode,
        message: '记录编码不能为空',
        errorType: 'validation'
      });
    }

    if (!record.projectId) {
      errors.push({
        rowIndex,
        field: '项目ID',
        value: record.projectId,
        message: '项目ID不能为空',
        errorType: 'validation'
      });
    }

    if (!record.recordDate) {
      errors.push({
        rowIndex,
        field: '日期',
        value: record.recordDate,
        message: '记录日期不能为空',
        errorType: 'validation'
      });
    }

    // 重量数据验证
    if (!record.nano3ActualWeight || record.nano3ActualWeight <= 0) {
      errors.push({
        rowIndex,
        field: '硝酸钠重量',
        value: record.nano3ActualWeight,
        message: '硝酸钠重量必须大于0',
        errorType: 'validation'
      });
    }

    if (!record.kno3ActualWeight || record.kno3ActualWeight <= 0) {
      errors.push({
        rowIndex,
        field: '硝酸钾重量',
        value: record.kno3ActualWeight,
        message: '硝酸钾重量必须大于0',
        errorType: 'validation'
      });
    }

    // 配比验证
    if (record.nano3ActualWeight && record.kno3ActualWeight) {
      const total = record.nano3ActualWeight + record.kno3ActualWeight;
      const nano3Ratio = record.nano3ActualWeight / total;
      const targetRatio = 0.6; // 6:4配比中的6
      const deviation = Math.abs(nano3Ratio - targetRatio);

      if (deviation > 0.1) { // 偏差超过10%为错误
        errors.push({
          rowIndex,
          field: '配比',
          value: `${(nano3Ratio * 100).toFixed(1)}:${((1 - nano3Ratio) * 100).toFixed(1)}`,
          message: `配比严重偏离标准6:4，偏差${(deviation * 100).toFixed(1)}%`,
          errorType: 'business'
        });
      } else if (deviation > 0.05) { // 偏差超过5%为警告
        warnings.push({
          rowIndex,
          field: '配比',
          value: `${(nano3Ratio * 100).toFixed(1)}:${((1 - nano3Ratio) * 100).toFixed(1)}`,
          message: `配比偏离标准6:4，偏差${(deviation * 100).toFixed(1)}%`,
          warningType: 'ratio'
        });
      }
    }

    // 班次验证
    if (record.shift && ![1, 2].includes(record.shift)) {
      errors.push({
        rowIndex,
        field: '班次',
        value: record.shift,
        message: '班次只能是1(白班)或2(夜班)',
        errorType: 'validation'
      });
    }

    // 日期格式验证
    if (record.recordDate && !/^\d{4}-\d{2}-\d{2}$/.test(record.recordDate)) {
      errors.push({
        rowIndex,
        field: '日期',
        value: record.recordDate,
        message: '日期格式应为YYYY-MM-DD',
        errorType: 'format'
      });
    }
  });

  // 重复记录检查
  const recordCodes = data.map(r => r.recordCode).filter(Boolean);
  const duplicateCodes = recordCodes.filter((code, index) => recordCodes.indexOf(code) !== index);

  duplicateCodes.forEach(code => {
    const duplicateIndexes = data
      .map((record, index) => ({ record, index }))
      .filter(({ record }) => record.recordCode === code)
      .map(({ index }) => index + 1);

    duplicateIndexes.forEach(rowIndex => {
      errors.push({
        rowIndex,
        field: '记录编码',
        value: code,
        message: `记录编码重复，重复行：${duplicateIndexes.join(', ')}`,
        errorType: 'duplicate'
      });
    });
  });

  const totalCount = data.length;

  // 计算有错误的行数（去重）
  const errorRows = new Set(errors.map(error => error.rowIndex));
  const invalidCount = errorRows.size;
  const validCount = totalCount - invalidCount;

  const result = {
    isValid: errors.length === 0,
    totalCount,
    validCount,
    invalidCount,
    errors,
    warnings
  };

  console.log('前端验证结果:', result);
  return result;
};

// 添加手动记录
const addRecord = () => {
  editFormTitle.value = '新增记录';
  editFormVisible.value = true;
};

// 编辑手动记录
const editRecord = (_index: number) => {
  // TODO: 实现编辑功能
  ElMessage.info('编辑功能开发中...');
};

// 删除手动记录
const deleteRecord = (index: number) => {
  manualRecords.value.splice(index, 1);
  ElMessage.success('删除成功');
};

// 记录保存成功
const handleRecordSaved = () => {
  // TODO: 将新记录添加到手动记录列表
  ElMessage.success('记录添加成功');
};

// 格式化重量显示（吨）- 与主列表页面保持一致
const formatWeight = (weight: number) => {
  if (!weight && weight !== 0) return '-';
  return (weight / 1000).toFixed(2); // 将kg转换为吨，保留2位小数
};

// 计算总化盐重量 - 与主列表页面保持一致
const getTotalSaltWeight = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;
  return nano3Weight + kno3Weight;
};

// 格式化配比显示 - 与主列表页面保持一致
const formatRatio = (nano3Weight: number, kno3Weight: number) => {
  if (!nano3Weight && !kno3Weight) return '-';
  if (!nano3Weight) return `0:${(kno3Weight / 1000).toFixed(1)}`;
  if (!kno3Weight) return `${(nano3Weight / 1000).toFixed(1)}:0`;

  // 计算比例并简化
  const nano3Tons = nano3Weight / 1000;
  const kno3Tons = kno3Weight / 1000;
  const total = nano3Tons + kno3Tons;

  if (total === 0) return '-';

  const nano3Ratio = (nano3Tons / total * 10).toFixed(1);
  const kno3Ratio = (kno3Tons / total * 10).toFixed(1);

  return `${nano3Ratio}:${kno3Ratio}`;
};

// 获取配比样式类 - 与主列表页面保持一致
const getRatioClass = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;

  if (!nano3Weight && !kno3Weight) return '';

  const total = nano3Weight + kno3Weight;
  if (total === 0) return '';

  const nano3Ratio = nano3Weight / total;
  const targetRatio = 0.6; // 目标6:4配比中的6
  const deviation = Math.abs(nano3Ratio - targetRatio);

  if (deviation <= 0.02) return 'text-success'; // 偏差在2%以内为绿色
  if (deviation <= 0.05) return 'text-warning'; // 偏差在5%以内为橙色
  return 'text-danger'; // 偏差超过5%为红色
};

// 获取错误类型标签样式
const getErrorTypeTag = (errorType: string) => {
  const tagMap: Record<string, string> = {
    'validation': 'danger',
    'business': 'warning',
    'duplicate': 'info',
    'format': 'danger'
  };
  return tagMap[errorType] || 'info';
};

// 获取错误类型文本
const getErrorTypeText = (errorType: string) => {
  const textMap: Record<string, string> = {
    'validation': '验证错误',
    'business': '业务错误',
    'duplicate': '重复数据',
    'format': '格式错误'
  };
  return textMap[errorType] || '未知错误';
};

// 获取警告类型文本
const getWarningTypeText = (warningType: string) => {
  const textMap: Record<string, string> = {
    'ratio': '配比警告',
    'range': '范围警告',
    'suggestion': '建议优化'
  };
  return textMap[warningType] || '未知警告';
};

// 获取表格行样式类名
const getRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  if (!validationResult.value) return '';

  const hasError = validationResult.value.errors.some(error => error.rowIndex === rowIndex + 1);
  const hasWarning = validationResult.value.warnings.some(warning => warning.rowIndex === rowIndex + 1);

  if (hasError) return 'error-row';
  if (hasWarning) return 'warning-row';
  return '';
};

// 开始导入
const handleImport = async () => {
  const records = importMethod.value === 'excel' ? previewData.value : manualRecords.value;

  if (records.length === 0) {
    ElMessage.warning('没有可导入的记录');
    return;
  }

  // 检查是否有验证结果
  if (importMethod.value === 'excel' && validationResult.value) {
    if (!validationResult.value.isValid) {
      const proceed = await ElMessageBox.confirm(
        `检测到 ${validationResult.value.invalidCount} 条无效记录，是否跳过无效记录，仅导入 ${validationResult.value.validCount} 条有效记录？`,
        '数据验证警告',
        {
          confirmButtonText: '仅导入有效记录',
          cancelButtonText: '取消导入',
          type: 'warning'
        }
      ).catch(() => false);

      if (!proceed) {
        return;
      }
    }
  }

  importing.value = true;
  importProgress.value = 0;
  importStatus.value = undefined;
  importProgressText.value = '开始导入...';

  try {
    // 使用验证通过的数据或全部数据
    const dataToImport = (importMethod.value === 'excel' && validatedData.value.length > 0)
      ? validatedData.value
      : records;

    importProgressText.value = '正在提交数据到服务器...';
    importProgress.value = 20;

    // 调用批量导入API
    const response = await batchImportBinaryRecord(dataToImport);
    const result = response.data;

    importProgress.value = 80;
    importProgressText.value = '正在处理导入结果...';

    // 处理导入结果
    if (result.success) {
      importStatus.value = 'success';
      importProgressText.value = '导入完成';

      let description = `成功导入 ${result.successCount} 条记录`;
      if (result.failureCount > 0) {
        description += `，失败 ${result.failureCount} 条`;
      }
      if (result.skippedCount > 0) {
        description += `，跳过 ${result.skippedCount} 条`;
      }

      importResult.value = {
        title: '导入完成',
        type: result.failureCount > 0 ? 'warning' : 'success',
        description
      };

      // 显示详细错误信息
      if (result.errors.length > 0) {
        console.warn('导入错误详情:', result.errors);
        ElMessage.warning(`导入完成，但有 ${result.errors.length} 条记录处理失败`);
      } else {
        ElMessage.success('所有记录导入成功');
      }

      emit('success');

      // 延迟关闭弹窗
      setTimeout(() => {
        handleClose();
      }, 3000);

    } else {
      throw new Error(result.message || '导入失败');
    }

    importProgress.value = 100;

  } catch (error: any) {
    importStatus.value = 'exception';
    importProgressText.value = '导入失败';

    let errorMessage = '导入过程中发生错误';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    importResult.value = {
      title: '导入失败',
      type: 'error',
      description: errorMessage
    };

    ElMessage.error(`导入失败: ${errorMessage}`);
    console.error('导入错误:', error);
  } finally {
    importing.value = false;
  }
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
    // 使用统一的重置函数
    resetImportState();

    // 重置导入方法和手动录入数据
    importMethod.value = 'excel';
    manualRecords.value = [];

    // 清除上传组件中的文件
    uploadRef.value?.clearFiles();

    console.log('对话框已关闭，所有状态已重置');
  }, 300);
};
</script>

<style scoped lang="scss">
.import-container {
  .method-card {
    margin-bottom: 20px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .import-card {
    .upload-demo {
      margin-bottom: 20px;
    }

    .preview-section {
      margin-top: 20px;
      
      h4 {
        margin-bottom: 12px;
        color: #303133;
      }

      .more-tip {
        text-align: center;
        color: #909399;
        margin-top: 8px;
        font-size: 12px;
      }
    }

    .import-progress {
      margin-top: 20px;
      
      .progress-text {
        text-align: center;
        margin-top: 8px;
        color: #606266;
        font-size: 14px;
      }
    }

    .import-result {
      margin-top: 20px;
    }
  }

  .manual-input {
    .empty-state {
      text-align: center;
      padding: 40px 0;
    }

    .manual-records {
      margin-top: 20px;
    }
  }

  // 配比颜色样式类 - 与主列表页面保持一致
  .text-success {
    color: #67c23a;
    font-weight: 600;
  }

  .text-warning {
    color: #e6a23c;
    font-weight: 600;
  }

  .text-danger {
    color: #f56c6c;
    font-weight: 600;
  }

  // 验证结果样式
  .validation-section {
    margin-top: 20px;

    .error-details, .warning-details {
      margin-top: 15px;

      h5 {
        margin-bottom: 10px;
        color: #303133;
        font-size: 14px;
      }
    }
  }

  // 表格行样式
  :deep(.error-row) {
    background-color: #fef0f0 !important;

    td {
      color: #f56c6c;
    }
  }

  :deep(.warning-row) {
    background-color: #fdf6ec !important;

    td {
      color: #e6a23c;
    }
  }

  // 更多提示样式
  .more-tip {
    text-align: center;
    color: #909399;
    margin-top: 8px;
    font-size: 12px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImportDialog'
});
</script>
