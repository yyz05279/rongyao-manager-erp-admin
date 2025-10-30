<template>
  <el-dialog
    v-model="dialogVisible"
    title="Excel导入发货清单"
    width="95%"
    :close-on-click-modal="false"
    @close="handleClose"
    class="enhanced-import-dialog"
  >
    <div class="import-container">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center class="import-steps">
        <el-step title="上传文件" description="选择Excel文件" />
        <el-step title="预览数据" description="确认导入数据" />
        <el-step title="完成导入" description="保存到系统" />
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
            将发货清单Excel文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持.xlsx和.xls格式，文件大小不超过10MB
              <br />
              <span class="text-info">请确保Excel包含"设备发货时间"sheet和车次明细sheet（如"第一车"）</span>
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
                <div v-if="parsedData.availableSheets.length > 0" class="file-sheets">
                  <el-tag v-for="sheet in parsedData.availableSheets" :key="sheet" size="small" class="sheet-tag">
                    {{ sheet }}
                  </el-tag>
                </div>
              </div>
              <el-button type="danger" link @click="removeFile">
                <el-icon><delete /></el-icon>
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 步骤2：数据预览 -->
      <div v-show="currentStep === 1" class="step-content preview-content">
        <el-alert
          v-if="parsedData.shippingTimes.length === 0 && parsedData.equipmentDetails.length === 0"
          title="未解析到有效数据，请检查Excel文件格式"
          type="warning"
          show-icon
          :closable="false"
        />

        <template v-else>
          <!-- 第一部分：导入配置（移到最前面） -->
          <div class="section config-section">
            <el-divider content-position="left">
              <div class="section-title">
                <el-icon><setting /></el-icon>
                <span>导入配置</span>
              </div>
            </el-divider>

            <el-form :model="importConfig" label-width="120px" class="config-form">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="项目" required>
                    <el-select
                      v-model="importConfig.projectId"
                      placeholder="请选择项目"
                      filterable
                      style="width: 100%"
                      @change="handleProjectChange"
                      @focus="() => console.log('✅ 项目选择器获得焦点')"
                      @blur="() => console.log('✅ 项目选择器失去焦点')"
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
                <el-col :span="8">
                  <el-form-item label="负责人" required>
                    <el-select
                      v-model="importConfig.responsiblePersonId"
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
                <el-col :span="8">
                  <el-form-item label="批次号" required>
                    <el-input
                      v-model="importConfig.batchNumber"
                      placeholder="请输入批次号，如：第一车"
                      maxlength="50"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <!-- 第二部分：设备发货时间 -->
          <div v-if="parsedData.shippingTimes.length > 0" class="section shipping-time-section">
            <el-divider content-position="left">
              <div class="section-title">
                <el-icon><calendar /></el-icon>
                <span>设备发货时间</span>
              </div>
            </el-divider>

            <el-table
              :data="parsedData.shippingTimes"
              border
              stripe
              size="default"
              class="shipping-time-table"
            >
              <el-table-column label="序号" prop="序号" width="100" align="center" />
              <el-table-column label="名称" prop="名称" width="400" show-overflow-tooltip />
              <el-table-column label="明细" prop="明细" width="200" align="center" />
              <el-table-column label="发货时间" prop="发货时间" width="180" align="center">
                <template #default="{ row }">
                  <el-tag type="success" size="large" effect="dark" class="shipping-date-tag">
                    <el-icon style="margin-right: 4px;"><calendar /></el-icon>
                    {{ row.发货时间 }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 第三部分：司机车辆信息 -->
          <div v-if="parsedData.shippingTimes.length > 0" class="section driver-vehicle-section">
            <el-divider content-position="left">
              <div class="section-title">
                <el-icon><user /></el-icon>
                <span>司机车辆信息</span>
              </div>
            </el-divider>

            <div
              v-for="(record, idx) in parsedData.shippingTimes"
              :key="idx"
              class="driver-info-card"
            >
              <div class="info-section">
                <div class="info-row">
                  <div class="info-label">车牌号：</div>
                  <div class="info-value">
                    <span v-if="record.车牌号" class="license-plate">{{ record.车牌号 }}</span>
                    <span v-else class="text-muted">未填写</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-label">车辆描述：</div>
                  <div class="info-value">{{ record.车辆描述 || '-' }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">司机姓名：</div>
                  <div class="info-value">{{ record.司机姓名 || '-' }}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">司机电话：</div>
                  <div class="info-value text-primary">{{ record.司机电话 || '-' }}</div>
                </div>
              </div>

              <div class="license-section">
                <div class="license-title">
                  <el-icon><picture /></el-icon>
                  <span>司机驾照</span>
                </div>

                <div v-if="driverLicenseImages.length === 0" class="license-upload-empty">
                  <el-upload
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    :limit="1"
                    :on-change="handleLicenseUpload"
                  >
                    <div class="upload-box">
                      <el-icon :size="36" class="upload-icon"><plus /></el-icon>
                      <div class="upload-text">点击上传驾照</div>
                    </div>
                  </el-upload>
                </div>

                <div v-else class="license-image-preview">
                  <el-image
                    :src="driverLicenseImages[0].url"
                    :preview-src-list="driverLicenseImages.map(img => img.url)"
                    fit="contain"
                    class="license-img"
                  />
                  <div class="license-actions">
                    <el-button
                      type="primary"
                      size="small"
                      :icon="Plus"
                      @click="triggerLicenseUpload"
                    >
                      更换
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      @click="removeLicenseImage(0)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 隐藏的上传组件 -->
            <el-upload
              ref="licenseUploadRef"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :limit="1"
              :on-change="handleLicenseUpload"
              style="display: none;"
            />
          </div>

          <!-- 第四部分：设备明细（按sheet分组） -->
          <div
            v-for="(detail, index) in parsedData.equipmentDetails"
            :key="index"
            class="section equipment-detail-section"
          >
            <el-divider content-position="left">
              <div class="section-title">
                <el-icon><box /></el-icon>
                <span>{{ detail.sheetName }} - 设备明细</span>
                <el-tag size="small" type="info" class="count-tag">
                  共 {{ detail.data.length }} 项
                </el-tag>
              </div>
            </el-divider>

            <!-- 动态表格：根据实际数据字段生成列，支持合并单元格 -->
            <el-table
              :data="detail.data"
              border
              stripe
              size="default"
              max-height="500"
              class="equipment-detail-table"
              :span-method="createSpanMethod(detail.data)"
            >
              <el-table-column
                v-for="(column, colIndex) in getTableColumns(detail.data)"
                :key="colIndex"
                :label="column"
                :prop="column"
                :min-width="getColumnWidth(column)"
                :align="getColumnAlign(column)"
                show-overflow-tooltip
              >
                <template #default="{ row }">
                  {{ formatCellValue(row[column]) }}
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 第五部分：发货照片 -->
          <div class="section image-section">
            <el-divider content-position="left">
              <div class="section-title">
                <el-icon><picture /></el-icon>
                <span>发货照片</span>
              </div>
            </el-divider>

            <div v-if="uploadedImages.length === 0" class="no-images">
              <el-empty description="暂无图片">
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  multiple
                  :on-change="handleImageUpload"
                >
                  <el-button type="primary" :icon="Plus">添加发货照片</el-button>
                </el-upload>
              </el-empty>
            </div>

            <div v-else class="image-gallery">
              <div v-for="(image, idx) in uploadedImages" :key="idx" class="image-item">
                <el-image
                  :src="image.url"
                  :preview-src-list="uploadedImages.map(img => img.url)"
                  :initial-index="idx"
                  fit="cover"
                  class="preview-image"
                />
                <div class="image-actions">
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    circle
                    @click="removeImage(idx)"
                  />
                </div>
              </div>

              <!-- 添加更多按钮 -->
              <div class="image-item add-more">
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  multiple
                  :on-change="handleImageUpload"
                >
                  <div class="add-image-btn">
                    <el-icon :size="40"><plus /></el-icon>
                    <div class="add-text">添加照片</div>
                  </div>
                </el-upload>
              </div>
            </div>
          </div>

        </template>
      </div>

      <!-- 步骤3：完成 -->
      <div v-show="currentStep === 2" class="step-content">
        <el-result
          icon="success"
          title="导入完成"
          sub-title="发货清单已成功导入系统"
        >
          <template #extra>
            <el-button type="primary" @click="handleViewList">查看清单</el-button>
            <el-button @click="handleClose">关闭</el-button>
          </template>
        </el-result>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0 && currentStep < 2" @click="prevStep">上一步</el-button>
        <el-button
          v-if="currentStep === 0"
          type="primary"
          :disabled="!canGoNext"
          :loading="parsing"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 1"
          type="primary"
          :disabled="!canImport"
          :loading="importing"
          @click="handleImport"
        >
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 批次已存在提示对话框 -->
  <el-dialog
    v-model="batchExistsDialogVisible"
    title="批次已存在"
    width="500px"
    :close-on-click-modal="false"
    @close="handleBatchExistsDialogClose"
  >
    <el-alert
      type="warning"
      :closable="false"
      show-icon
    >
      <template #title>
        <span style="font-size: 16px; font-weight: bold;">
          该项目的批次"{{ importConfig.batchNumber }}"已存在发货清单
        </span>
      </template>
    </el-alert>

    <div style="margin-top: 20px; padding: 15px; background: #f5f7fa; border-radius: 4px;">
      <p style="margin: 0; color: #606266;">
        继续导入将会覆盖或重复创建数据，建议先查看已存在的清单详情。
      </p>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="batchExistsDialogVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="handleViewExistingBatch">
          查看清单详情
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="EnhancedShippingImportDialog" lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import {
  UploadFilled,
  Document,
  Delete,
  Calendar,
  Box,
  Plus,
  Setting,
  User
} from '@element-plus/icons-vue';
import {
  EnhancedShippingExcelParser,
  type EnhancedShippingParseResult
} from '@/utils/enhanced-shipping-excel-parser';
import {
  getProjectSimpleList,
  getResponsiblePersonList,
  importEnhancedShippingList,
  checkBatchExists,
  type EnhancedShippingImportRequest
} from '@/api/erp/saltprocess/shipping/api-config';
import type { EnhancedShippingItemForm } from '@/api/erp/saltprocess/shipping/types';
import { uploadImages } from '@/api/erp/common/upload';
import type { BizType } from '@/api/erp/common/upload/types';

// Props & Emits
interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success', listId?: string): void;
  (e: 'view-existing-batch', data: { projectId: string; batchNumber: string }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Router
const router = useRouter();

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const currentStep = ref(0);
const parsing = ref(false);
const importing = ref(false);
const selectedFile = ref<File | null>(null);

// 解析结果
const parsedData = ref<EnhancedShippingParseResult>({
  success: false,
  message: '',
  shippingTimes: [],
  equipmentDetails: [],
  images: [],
  availableSheets: []
});

// 上传的发货照片
const uploadedImages = ref<{ file: File; url: string }[]>([]);

// 上传的司机驾照照片
const driverLicenseImages = ref<{ file: File; url: string }[]>([]);

// 驾照上传引用
const licenseUploadRef = ref();

// 导入配置
const importConfig = reactive({
  projectId: '',
  responsiblePersonId: '',
  batchNumber: ''
});

// 批次已存在对话框
const batchExistsDialogVisible = ref(false);
const existingShippingListId = ref('');
const existingBatchInfo = reactive({
  projectId: '',
  batchNumber: ''
});

// 基础数据
const projectList = ref<Array<{ id: string; name: string }>>([]);
const responsiblePersonList = ref<Array<{ id: string; name: string }>>([]);

// Excel解析器
const excelParser = new EnhancedShippingExcelParser();

// 计算属性
const canGoNext = computed(() => {
  return selectedFile.value !== null && parsedData.value.availableSheets.length > 0;
});

const canImport = computed(() => {
  return (
    importConfig.projectId &&
    importConfig.responsiblePersonId &&
    importConfig.batchNumber &&
    (parsedData.value.shippingTimes.length > 0 || parsedData.value.equipmentDetails.length > 0)
  );
});

// 方法
const handleFileChange = async (file: any) => {
  selectedFile.value = file.raw;
  parsing.value = true;

  try {
    // 解析文件
    const result = await excelParser.parseFile(file.raw);

    // 验证文件
    const validation = EnhancedShippingExcelParser.validateShippingListExcel(result.sheets);
    if (!validation.valid) {
      ElMessage.warning(validation.message);
      selectedFile.value = null;
      return;
    }

    // 完整解析
    parsedData.value = await excelParser.parseShippingListExcel();

    if (parsedData.value.success) {
      ElMessage.success('文件解析成功');

      // 自动填充批次号（从第一个车次sheet名称）
      if (parsedData.value.equipmentDetails.length > 0 && !importConfig.batchNumber) {
        importConfig.batchNumber = parsedData.value.equipmentDetails[0].sheetName;
      }
    } else {
      ElMessage.error(parsedData.value.message);
    }
  } catch (error) {
    ElMessage.error(`文件解析失败: ${error}`);
    selectedFile.value = null;
  } finally {
    parsing.value = false;
  }
};

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件');
};

const removeFile = () => {
  selectedFile.value = null;
  parsedData.value = {
    success: false,
    message: '',
    shippingTimes: [],
    equipmentDetails: [],
    images: [],
    availableSheets: []
  };
};

// 项目选择后检查批次是否存在
const handleProjectChange = async (projectId: string) => {
  console.log('=== handleProjectChange 被调用 ===');
  console.log('传入的 projectId:', projectId);
  console.log('当前的 batchNumber:', importConfig.batchNumber);
  console.log('importConfig 完整对象:', JSON.stringify(importConfig));

  if (!projectId) {
    console.log('❌ 项目ID为空，跳过检查');
    return;
  }

  if (!importConfig.batchNumber) {
    console.log('⚠️ 批次号为空，跳过检查（可能还未解析Excel）');
    return;
  }

  console.log('✅ 开始检查批次是否存在', { 
    projectId, 
    batchNumber: importConfig.batchNumber 
  });

  try {
    // 调用批次检查接口
    console.log('正在调用 checkBatchExists 接口...');
    const response = await checkBatchExists(projectId, importConfig.batchNumber);
    console.log('📦 接口返回完整响应:', response);
    console.log('📊 批次检查结果 (response.data):', response.data);
    console.log('📊 response.data的类型:', typeof response.data);

    // 后端返回 boolean 值：true-已存在，false-不存在
    const exists = response.data === true || response.data === 'true';
    
    if (exists) {
      // 批次已存在，显示提示对话框
      console.log('⚠️ 批次已存在，显示对话框');
      
      // 保存批次信息，用于跳转详情页
      existingBatchInfo.projectId = projectId;
      existingBatchInfo.batchNumber = importConfig.batchNumber.trim();  // 去除首尾空格
      console.log('✅ 保存批次信息:', existingBatchInfo);
      
      batchExistsDialogVisible.value = true;
    } else {
      // 批次不存在，可以继续导入
      console.log('✅ 批次不存在，可以导入');
      ElMessage.success('批次检查通过，可以导入');
    }
  } catch (error) {
    console.error('❌ 检查批次失败:', error);
    ElMessage.error('检查批次失败，请重试');
  }
};

// 查看已存在的清单详情
const handleViewExistingBatch = () => {
  console.log('✅ 查看清单详情，触发事件给父组件处理', existingBatchInfo);

  // 关闭批次对话框
  batchExistsDialogVisible.value = false;
  
  // 关闭主对话框
  emit('update:visible', false);
  
  // 触发事件，让父组件（列表页）处理跳转
  emit('view-existing-batch', {
    projectId: existingBatchInfo.projectId,
    batchNumber: existingBatchInfo.batchNumber
  });
  
  console.log('✅ 已触发 view-existing-batch 事件');
};

// 批次已存在对话框关闭时的处理
const handleBatchExistsDialogClose = () => {
  // 关闭批次已存在对话框
  batchExistsDialogVisible.value = false;
  // 同时关闭Excel导入弹窗
  handleClose();
};

const handleImageUpload = (file: any) => {
  const imageFile = file.raw;
  const url = URL.createObjectURL(imageFile);
  uploadedImages.value.push({ file: imageFile, url });
};

const removeImage = (index: number) => {
  URL.revokeObjectURL(uploadedImages.value[index].url);
  uploadedImages.value.splice(index, 1);
};

const handleLicenseUpload = (file: any) => {
  const imageFile = file.raw;
  const url = URL.createObjectURL(imageFile);

  // 如果已有照片，先清除旧的
  if (driverLicenseImages.value.length > 0) {
    URL.revokeObjectURL(driverLicenseImages.value[0].url);
  }

  // 只保留最新的一张照片
  driverLicenseImages.value = [{ file: imageFile, url }];
};

const removeLicenseImage = (index: number) => {
  URL.revokeObjectURL(driverLicenseImages.value[index].url);
  driverLicenseImages.value.splice(index, 1);
};

// 触发驾照上传
const triggerLicenseUpload = () => {
  licenseUploadRef.value?.$el?.querySelector('input')?.click();
};

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

/**
 * 上传图片到服务器
 */
const uploadImagesToServer = async (
  images: { file: File; url: string }[],
  bizType: BizType
): Promise<string[]> => {
  if (!images || images.length === 0) {
    return [];
  }

  try {
    const files = images.map(img => img.file);
    console.log(`[${bizType}] 开始上传 ${files.length} 张图片...`);

    const response = await uploadImages(files, bizType);

    // 检查响应数据结构
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('图片上传接口返回数据格式错误');
    }

    // 过滤成功的上传结果
    const successResults = response.data.filter(item => item.success);

    // 如果有任何图片上传失败，抛出错误
    if (successResults.length < files.length) {
      const failedCount = files.length - successResults.length;
      const failedFiles = response.data
        .filter(item => !item.success)
        .map(item => item.originalFileName)
        .join(', ');
      throw new Error(`有 ${failedCount} 张图片上传失败：${failedFiles}`);
    }

    const urls = successResults.map(item => item.fileUrl || '').filter(url => url);
    console.log(`[${bizType}] 上传成功，共 ${urls.length} 张`);

    return urls;
  } catch (error: any) {
    console.error(`[${bizType}] 图片上传失败:`, error);
    throw error; // 重新抛出错误，让调用方处理
  }
};

/**
 * 转换设备明细数据格式
 */
const convertEquipmentDetails = (): EnhancedShippingItemForm[] => {
  const allItems: EnhancedShippingItemForm[] = [];

  parsedData.value.equipmentDetails.forEach(sheet => {
    sheet.data.forEach(detail => {
      // 🔥 支持多种可能的重量字段名称
      const weight = detail.重量 || detail['重量（吨）'] || detail['重量(吨)'] || detail.重量吨 || undefined;
      
      allItems.push({
        sequenceNo: detail.序号,
        equipmentName: detail.名称 || '',
        subItemName: detail.分项,
        quantity: detail.数量 || 0,
        unit: detail.单位 || '套',
        weight: weight,  // 使用动态提取的重量值
        specification: detail.分项 || '',
        equipmentType: inferEquipmentType(detail.名称 || ''),
        remarks1: detail.备注,
        remarks: detail.备注
      });
    });
  });

  return allItems;
};

/**
 * 根据设备名称推断设备类型
 */
const inferEquipmentType = (name: string): string => {
  if (name.includes('输送') || name.includes('传送') || name.includes('提升')) {
    return 'MECHANICAL';
  }
  if (name.includes('粉碎') || name.includes('破碎') || name.includes('分解')) {
    return 'MECHANICAL';
  }
  if (name.includes('钢平台') || name.includes('立柱') || name.includes('护栏')) {
    return 'AUXILIARY';
  }
  if (name.includes('除尘') || name.includes('风机')) {
    return 'AUXILIARY';
  }
  if (name.includes('电控') || name.includes('配电') || name.includes('电机')) {
    return 'ELECTRICAL';
  }
  if (name.includes('管道') || name.includes('阀门')) {
    return 'PIPELINE';
  }
  if (name.includes('燃烧')) {
    return 'BURNER';
  }
  return 'AUXILIARY';
};

/**
 * 执行导入
 */
const handleImport = async () => {
  if (!canImport.value) {
    ElMessage.warning('请完善导入配置');
    return;
  }

  importing.value = true;

  try {
    let shippingPhotoUrls: string[] = [];
    let driverLicensePhotoUrls: string[] = [];

    console.log('=== 开始导入流程 ===');
    console.log('发货照片数量:', uploadedImages.value.length);
    console.log('驾照图片数量:', driverLicenseImages.value.length);

    // 并行上传所有图片（发货照片 + 司机驾照）
    const uploadTasks: Promise<{ type: string; count: number }>[] = [];

    if (uploadedImages.value.length > 0 || driverLicenseImages.value.length > 0) {
      ElMessage.info('正在上传图片...');

      // 1. 添加发货照片上传任务
      if (uploadedImages.value.length > 0) {
        console.log('✅ 添加发货照片上传任务');
        const shippingPhotoTask = uploadImagesToServer(
          uploadedImages.value,
          'shipping-photos'
        ).then(urls => {
          shippingPhotoUrls = urls;
          return { type: 'shipping-photos', count: urls.length };
        });
        uploadTasks.push(shippingPhotoTask);
      } else {
        console.log('⏭️  跳过发货照片上传（无图片）');
      }

      // 2. 添加司机驾照上传任务
      if (driverLicenseImages.value.length > 0) {
        console.log('✅ 添加司机驾照上传任务');
        const licensePhotoTask = uploadImagesToServer(
          driverLicenseImages.value,
          'driver-license'
        ).then(urls => {
          driverLicensePhotoUrls = urls;
          return { type: 'driver-license', count: urls.length };
        });
        uploadTasks.push(licensePhotoTask);
      } else {
        console.log('⏭️  跳过司机驾照上传（无图片）');
      }

      console.log(`📦 总共创建了 ${uploadTasks.length} 个上传任务`);

      // 3. 等待所有上传任务完成
      try {
        const results = await Promise.all(uploadTasks);

        // 显示上传成功消息
        const totalCount = results.reduce((sum, r) => sum + r.count, 0);
        ElMessage.success(`图片上传成功（共${totalCount}张）`);
      } catch (error: any) {
        console.error('图片上传失败:', error);
        ElMessage.error(`图片上传失败: ${error.message}`);
        throw error; // 上传失败，中断流程
      }
    }

    // 4. 转换设备明细数据
    const shippingItems = convertEquipmentDetails();
    
    // 🔍 调试日志：检查重量数据是否正确提取
    console.log('=== 设备明细数据检查 ===');
    console.log('总数量:', shippingItems.length);
    const itemsWithWeight = shippingItems.filter(item => item.weight);
    console.log('包含重量数据的项:', itemsWithWeight.length);
    if (itemsWithWeight.length > 0) {
      console.log('重量数据示例:', itemsWithWeight.slice(0, 3).map(item => ({
        名称: item.equipmentName,
        重量: item.weight,
        单位: '吨'
      })));
    } else {
      console.warn('⚠️ 没有提取到任何重量数据！');
      console.log('原始数据示例:', parsedData.value.equipmentDetails.slice(0, 1).map(sheet => ({
        sheetName: sheet.sheetName,
        字段名: Object.keys(sheet.data[0] || {})
      })));
    }

    // 5. 提取发货时间信息（使用第一条记录）
    const firstTimeRecord = parsedData.value.shippingTimes[0];

    // 6. 构建导入请求数据
    const importData: EnhancedShippingImportRequest = {
      // 基本信息
      projectId: importConfig.projectId,
      batchNumber: importConfig.batchNumber,
      responsiblePersonId: importConfig.responsiblePersonId,
      shippingDate: firstTimeRecord?.发货时间 || new Date().toISOString().split('T')[0],
      shippingType: 'NORMAL',  // 发货类型：正常发货
      shippingMethod: 'TRUCK',

      // 车辆信息
      vehiclePlate: firstTimeRecord?.车牌号,
      vehicleDescription: firstTimeRecord?.车辆描述,
      vehicleInfo: firstTimeRecord?.车辆信息,

      // 司机信息
      driverName: firstTimeRecord?.司机姓名,
      driverPhone: firstTimeRecord?.司机电话,
      driverInfo: firstTimeRecord?.司机姓名及电话,

      // 图片URL列表（只有上传成功才会有值）
      shippingPhotoUrls,
      driverLicensePhotoUrls,

      // 设备明细
      shippingItems
    };

    // 7. 调用增强版导入接口
    ElMessage.info('正在保存发货清单...');
    const response = await importEnhancedShippingList(importData);

    if (response.data.success) {
      ElMessage.success(`导入成功！清单编号：${response.data.listCode || '-'}`);
      currentStep.value = 2;
      emit('success', response.data);
    } else {
      ElMessage.error(`导入失败: ${response.data.summary || '未知错误'}`);
      if (response.data.errors && response.data.errors.length > 0) {
        console.error('导入错误详情:', response.data.errors);
      }
    }
  } catch (error: any) {
    console.error('导入失败:', error);
    // 只显示错误消息，不再重复显示（因为已经在具体步骤中显示过了）
    if (!error.message?.includes('上传失败')) {
      ElMessage.error(`导入失败: ${error.message || '未知错误'}`);
    }
  } finally {
    importing.value = false;
  }
};

const handleViewList = () => {
  emit('success');
  handleClose();
};

const handleClose = () => {
  // 清理资源
  uploadedImages.value.forEach(img => URL.revokeObjectURL(img.url));
  driverLicenseImages.value.forEach(img => URL.revokeObjectURL(img.url));

  // 重置状态
  currentStep.value = 0;
  selectedFile.value = null;
  parsedData.value = {
    success: false,
    message: '',
    shippingTimes: [],
    equipmentDetails: [],
    images: [],
    availableSheets: []
  };
  uploadedImages.value = [];
  driverLicenseImages.value = [];
  Object.assign(importConfig, {
    projectId: '',
    responsiblePersonId: '',
    batchNumber: ''
  });

  emit('update:visible', false);
};

// 工具函数
const formatFileSize = (bytes: number): string => {
  return EnhancedShippingExcelParser.formatFileSize(bytes);
};

const getTableColumns = (data: any[]): string[] => {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
};

const getColumnWidth = (column: string): number => {
  const widthMap: Record<string, number> = {
    '序号': 80,
    '数量': 80,
    '单位': 80,
    '备注': 150,
    '重量': 100,
    '重量（吨）': 120
  };
  return widthMap[column] || 150;
};

const getColumnAlign = (column: string): string => {
  const centerColumns = ['序号', '数量', '单位', '重量', '重量（吨）'];
  return centerColumns.includes(column) ? 'center' : 'left';
};

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

/**
 * 创建span method函数的工厂函数
 * 用于解决Vue模板中的类型推断问题
 */
const createSpanMethod = (data: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (params: any) => getSpanMethod(params, data);
};

/**
 * 计算表格合并单元格
 * 合并相同的"名称"、"序号"和"重量"列
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSpanMethod = (params: any, data: any[]) => {
  const { row, column, rowIndex } = params;
  // 需要合并的列名
  const mergeColumns = ['序号', '名称', '重量', '重量（吨）', '重量(吨)'];

  const columnName = column.property;

  // 只处理需要合并的列
  if (!mergeColumns.includes(columnName)) {
    return { rowspan: 1, colspan: 1 };
  }

  // 如果当前行的值为空，不合并
  if (!row[columnName]) {
    return { rowspan: 1, colspan: 1 };
  }

  // 计算连续相同值的行数
  let rowspan = 1;
  const currentValue = row[columnName];

  // 向下查找相同的值
  for (let i = rowIndex + 1; i < data.length; i++) {
    if (data[i][columnName] === currentValue) {
      rowspan++;
    } else {
      break;
    }
  }

  // 检查是否是合并区域的第一行
  const isFirstRow = rowIndex === 0 || data[rowIndex - 1][columnName] !== currentValue;

  if (isFirstRow) {
    return { rowspan, colspan: 1 };
  } else {
    // 不是第一行，隐藏此单元格
    return { rowspan: 0, colspan: 0 };
  }
};

// 初始化数据
const initData = async () => {
  try {
    console.log('开始加载项目列表和负责人列表...');
    const [projectRes, personRes] = await Promise.all([
      getProjectSimpleList(),
      getResponsiblePersonList()
    ]);

    console.log('项目列表响应:', projectRes);
    console.log('负责人列表响应:', personRes);

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

    console.log('项目列表数量:', projectList.value.length);
    console.log('负责人列表数量:', responsiblePersonList.value.length);
    console.log('转换后的负责人列表:', responsiblePersonList.value);
  } catch (error: any) {
    console.error('获取基础数据失败:', error);
    console.error('错误详情:', error.response || error.message);
    ElMessage.error(`获取基础数据失败: ${error.message || '未知错误'}`);
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.enhanced-import-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.import-container {
  .import-steps {
    margin-bottom: 30px;
  }

  .step-content {
    min-height: 500px;

    &.preview-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .upload-area {
      margin-bottom: 20px;

      :deep(.el-upload-dragger) {
        width: 100%;
        height: 200px;
        border: 2px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        transition: border-color 0.3s;

        &:hover {
          border-color: #409eff;
        }
      }

      .text-info {
        color: #909399;
        font-size: 13px;
        margin-top: 8px;
      }
    }

    .file-info {
      margin-bottom: 20px;

      .file-details {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .file-meta {
          flex: 1;

          .file-name {
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .file-size {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
          }

          .file-sheets {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;

            .sheet-tag {
              margin: 0;
            }
          }
        }
      }
    }

    .section {
      margin-bottom: 30px;

      .el-divider {
        margin: 20px 0;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;

          .el-icon {
            font-size: 18px;
          }

          .count-tag {
            margin-left: 8px;
          }
        }
      }

      .shipping-time-table,
      .equipment-detail-table {
        width: 100%;
      }

      .shipping-date-tag {
        font-size: 15px;
        font-weight: 600;
        padding: 8px 16px;
        display: inline-flex;
        align-items: center;
      }

      .text-muted {
        color: #909399;
        font-size: 14px;
      }

      .text-primary {
        color: #409eff;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .image-section {
      .no-images {
        padding: 40px 0;
      }

      .image-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        padding: 20px 0;

        .image-item {
          position: relative;
          aspect-ratio: 1;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          overflow: hidden;
          background: #f5f7fa;

          &.add-more {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              background: #ecf5ff;

              .add-image-btn {
                color: #409eff;
              }
            }

            .add-image-btn {
              text-align: center;
              color: #909399;
              transition: color 0.3s;

              .add-text {
                margin-top: 8px;
                font-size: 14px;
              }
            }
          }

          .preview-image {
            width: 100%;
            height: 100%;
          }

          .image-actions {
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover .image-actions {
            opacity: 1;
          }
        }
      }
    }

    .config-section {
      .config-form {
        background: #f5f7fa;
        padding: 20px;
        border-radius: 4px;
      }
    }

    // 司机车辆信息样式
    .driver-vehicle-section {
      .driver-info-card {
        display: flex;
        gap: 20px;
        padding: 20px;
        background: #ecf5ff;
        border: 1px solid #b3d8ff;
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
        }

        .info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;

          .info-row {
            display: flex;
            align-items: center;

            .info-label {
              min-width: 90px;
              font-weight: 600;
              color: #606266;
              font-size: 14px;
            }

            .info-value {
              flex: 1;
              color: #303133;
              font-size: 14px;

              .license-plate {
                display: inline-block;
                padding: 6px 12px;
                background: #FFD700; // 黄色车牌背景
                color: #000;         // 黑色字体
                font-weight: 700;
                font-size: 16px;
                font-family: 'Arial Black', 'Microsoft YaHei Bold', sans-serif;
                letter-spacing: 2px;
                border: 2px solid #333;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
            }
          }
        }

        .license-section {
          flex-shrink: 0;
          width: 300px;
          display: flex;
          flex-direction: column;
          margin-left: 20px;

          .license-title {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 12px;
            font-weight: 600;
            font-size: 14px;
            color: #303133;

            .el-icon {
              color: #409eff;
            }
          }

          .license-upload-empty {
            .upload-box {
              width: 300px;
              height: 188px; // 保持 1.6:1 比例
              border: 2px dashed #b3d8ff;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s;
              background: rgba(255, 255, 255, 0.7);

              &:hover {
                border-color: #409eff;
                background: #fff;

                .upload-icon {
                  color: #409eff;
                }
              }

              .upload-icon {
                color: #909399;
                transition: color 0.3s;
              }

              .upload-text {
                margin-top: 8px;
                font-size: 13px;
                color: #606266;
              }
            }
          }

          .license-image-preview {
            position: relative;
            width: 300px;
            height: 188px;
            border: 2px solid #409eff;
            border-radius: 8px;
            overflow: hidden;
            background: #fff;

            .license-img {
              width: 100%;
              height: 100%;
              display: block;
            }

            .license-actions {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 10px;
              background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
              display: flex;
              justify-content: center;
              gap: 8px;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .license-actions {
              opacity: 1;
            }
          }
        }
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
@media (max-width: 1200px) {
  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
  }

  .driver-info-card {
    flex-direction: column !important;

    .license-section {
      width: 100% !important;

      .upload-box,
      .license-image-preview {
        width: 100% !important;
        max-width: 400px;
        margin: 0 auto;
      }
    }
  }
}

@media (max-width: 768px) {
  .enhanced-import-dialog {
    :deep(.el-dialog) {
      width: 98% !important;
      margin: 1vh auto;
    }
  }

  .image-gallery {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .driver-info-card {
    padding: 16px !important;

    .license-section {
      .upload-box,
      .license-image-preview {
        height: auto !important;
        aspect-ratio: 1.6 !important; // 保持 1.6:1 比例
      }
    }
  }
}

@media (max-width: 480px) {
  .driver-info-card {
    padding: 12px !important;

    .info-section {
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .info-label {
          min-width: auto;
        }
      }
    }
  }
}
</style>

