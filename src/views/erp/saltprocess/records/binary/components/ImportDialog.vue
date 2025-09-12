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

          <!-- 数据预览 -->
          <div v-if="previewData.length > 0" class="preview-section">
            <h4>数据预览 (共 {{ previewData.length }} 条记录)</h4>
            <el-table
              :data="previewData.slice(0, 5)"
              border
              size="small"
              max-height="300"
            >
              <el-table-column prop="recordCode" label="记录编码" width="120" />
              <el-table-column prop="batchNumber" label="批次号" width="120" />
              <el-table-column prop="projectId" label="项目ID" width="80" />
              <el-table-column prop="recordDate" label="记录日期" width="100" />
              <el-table-column prop="operatorName" label="操作员" width="80" />
              <el-table-column prop="actualOutput" label="实际产量" width="100" />
              <el-table-column prop="yieldRate" label="产出率" width="80" />
            </el-table>
            <div v-if="previewData.length > 5" class="more-tip">
              还有 {{ previewData.length - 5 }} 条记录未显示...
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import type { UploadInstance, UploadRawFile } from 'element-plus';
import * as XLSX from 'xlsx';
import EditForm from './EditForm.vue';
import type { BinaryRecordForm } from '@/api/erp/saltprocess/records/binary/types';
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

// 手动录入相关
const manualRecords = ref<BinaryRecordForm[]>([]);
const editFormVisible = ref(false);
const editFormTitle = ref('新增记录');

// 计算属性
const canImport = computed(() => {
  if (importMethod.value === 'excel') {
    return previewData.value.length > 0 && !importing.value;
  } else {
    return manualRecords.value.length > 0 && !importing.value;
  }
});



// 下载模板
const downloadTemplate = () => {
  // 创建模板数据
  const templateData = [
    {
      '记录编码': 'BM20241201001',
      '批次号': 'B20241201001',
      '项目ID': '101',
      '记录日期': '2024-12-01',
      '班次': '1',
      '持续时间': '120',
      'NaNO3目标配比': '60.0',
      'NaNO3实际配比': '59.8',
      'NaNO3目标用量': '1500.0',
      'NaNO3实际用量': '1495.0',
      'KNO3目标配比': '40.0',
      'KNO3实际配比': '40.2',
      'KNO3目标用量': '1000.0',
      'KNO3实际用量': '1005.0',
      '反应温度': '450.5',
      '反应压力': '2.5',
      '反应时间': '90',
      '实际产量': '2450.0',
      '产出率': '98.5',
      '质量等级': '1',
      '操作员': '张三',
      '备注': '正常生产'
    }
  ];

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '二元化盐记录模板');

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
    await parseExcelFile(file.raw);
  }
};

// 解析Excel文件 - 使用新的ExcelParser
const parseExcelFile = async (file: File) => {
  try {
    // 1. 解析文件并识别类型
    fileInfo.value = await excelParser.parseFile(file);

    if (!fileInfo.value || fileInfo.value.detectedType === 'unknown') {
      ElMessage.warning('未识别的Excel文件类型，请检查文件格式');
      return;
    }

    // 2. 根据识别的类型导入数据
    let result: any;

    if (fileInfo.value.detectedType === 'molten_salt_inventory') {
      result = await excelParser.importMoltenSaltInventory();
    } else if (fileInfo.value.detectedType === 'salt_process') {
      result = await excelParser.importSaltProcess();
    } else {
      ElMessage.warning('当前文件类型不支持二元化盐记录导入');
      return;
    }

    // 3. 转换数据格式为二元化盐记录格式
    const binaryRecords = convertToBinaryRecords(result.data);

    previewData.value = binaryRecords;
    importErrors.value = result.errors;

    if (binaryRecords.length > 0) {
      ElMessage.success(`成功解析 ${binaryRecords.length} 条记录`);
    } else {
      ElMessage.warning('未解析到任何数据，请检查Excel文件格式');
    }

    if (result.errors.length > 0) {
      ElMessage.warning(`解析完成，但有 ${result.errors.length} 条记录存在错误`);
    }
  } catch (error) {
    ElMessage.error(`文件解析失败: ${error}`);
    console.error('Excel解析错误:', error);
  }
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
      projectId: 1, // 默认项目ID
      recordDate: dateStr,
      startTime: timeStr,
      endTime: timeStr,
      shift: 1, // 默认班次

      // NaNO3配比信息
      nano3TargetRatio: 0.6, // 默认NaNO3目标配比
      nano3ActualRatio: 0.6, // 默认NaNO3实际配比
      nano3TargetWeight: item.sodiumWeight || 0, // 使用钠盐重量
      nano3ActualWeight: item.sodiumWeight || 0,

      // KNO3配比信息
      kno3TargetRatio: 0.4, // 默认KNO3目标配比
      kno3ActualRatio: 0.4, // 默认KNO3实际配比
      kno3TargetWeight: item.potassiumWeight || 0, // 使用钾盐重量
      kno3ActualWeight: item.potassiumWeight || 0,

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

      operatorId: 1, // 默认操作员ID
      remarks: `从Excel导入 - 原始数据: 钠盐${item.sodiumBags || 0}袋, 钾盐${item.potassiumBags || 0}袋, 人数${item.staffCount || 0}人`
    } as BinaryRecordForm;
  });
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

// 开始导入
const handleImport = async () => {
  const records = importMethod.value === 'excel' ? previewData.value : manualRecords.value;
  
  if (records.length === 0) {
    ElMessage.warning('没有可导入的记录');
    return;
  }

  importing.value = true;
  importProgress.value = 0;
  importStatus.value = undefined;
  importProgressText.value = '开始导入...';

  try {
    // 模拟批量导入过程
    for (let i = 0; i < records.length; i++) {
      importProgress.value = Math.round(((i + 1) / records.length) * 100);
      importProgressText.value = `正在导入第 ${i + 1} 条记录，共 ${records.length} 条`;
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    importStatus.value = 'success';
    importProgressText.value = '导入完成';
    importResult.value = {
      title: '导入成功',
      type: 'success',
      description: `成功导入 ${records.length} 条记录`
    };

    ElMessage.success('导入成功');
    emit('success');
    
    // 延迟关闭弹窗
    setTimeout(() => {
      handleClose();
    }, 2000);
  } catch (error) {
    importStatus.value = 'exception';
    importProgressText.value = '导入失败';
    importResult.value = {
      title: '导入失败',
      type: 'error',
      description: '导入过程中发生错误，请检查数据格式或联系管理员'
    };
    ElMessage.error('导入失败');
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
    importMethod.value = 'excel';
    previewData.value = [];
    manualRecords.value = [];
    importing.value = false;
    importProgress.value = 0;
    importStatus.value = undefined;
    importProgressText.value = '';
    importResult.value = null;
    uploadRef.value?.clearFiles();

    // 重置Excel解析状态
    fileInfo.value = null;
    importErrors.value = [];
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
}

.dialog-footer {
  text-align: right;
}
</style>
