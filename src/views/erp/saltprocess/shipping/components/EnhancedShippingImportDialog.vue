<template>
  <el-dialog
    v-model="dialogVisible"
    title="Excel导入发货清单（增强版）"
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
                    <el-select v-model="importConfig.projectId" placeholder="请选择项目" filterable style="width: 100%">
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
              :span-method="(params) => getSpanMethod(params, detail.data)"
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
</template>

<script setup name="EnhancedShippingImportDialog" lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  UploadFilled,
  Document,
  Delete,
  Calendar,
  Box,
  Picture,
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
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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
    const response = await uploadImages(files, bizType);

    // 过滤成功的上传结果
    const successResults = response.data.filter(item => item.success);

    if (successResults.length < files.length) {
      const failedCount = files.length - successResults.length;
      ElMessage.warning(`有 ${failedCount} 张图片上传失败`);
    }

    return successResults.map(item => item.fileUrl || '').filter(url => url);
  } catch (error: any) {
    console.error(`${bizType} 图片上传失败:`, error);
    ElMessage.error(`图片上传失败: ${error.message || '未知错误'}`);
    return [];
  }
};

/**
 * 转换设备明细数据格式
 */
const convertEquipmentDetails = (): EnhancedShippingItemForm[] => {
  const allItems: EnhancedShippingItemForm[] = [];

  parsedData.value.equipmentDetails.forEach(sheet => {
    sheet.data.forEach(detail => {
      allItems.push({
        sequenceNo: detail.序号,
        equipmentName: detail.名称 || '',
        subItemName: detail.分项,
        quantity: detail.数量 || 0,
        unit: detail.单位 || '套',
        weight: detail.重量,
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
    // 1. 上传发货照片
    ElMessage.info('正在上传发货照片...');
    const shippingPhotoUrls = await uploadImagesToServer(
      uploadedImages.value,
      'shipping-photos'
    );

    // 2. 上传司机驾照
    ElMessage.info('正在上传司机驾照...');
    const driverLicensePhotoUrls = await uploadImagesToServer(
      driverLicenseImages.value,
      'driver-license'
    );

    // 3. 转换设备明细数据
    const shippingItems = convertEquipmentDetails();

    // 4. 提取发货时间信息（使用第一条记录）
    const firstTimeRecord = parsedData.value.shippingTimes[0];

    // 5. 构建导入请求数据
    const importData: EnhancedShippingImportRequest = {
      // 基本信息
      projectId: importConfig.projectId,
      batchNumber: importConfig.batchNumber,
      responsiblePersonId: importConfig.responsiblePersonId,
      shippingDate: firstTimeRecord?.发货时间 || new Date().toISOString().split('T')[0],
      shippingMethod: 'TRUCK',

      // 车辆信息
      vehiclePlate: firstTimeRecord?.车牌号,
      vehicleDescription: firstTimeRecord?.车辆描述,
      vehicleInfo: firstTimeRecord?.车辆信息,

      // 司机信息
      driverName: firstTimeRecord?.司机姓名,
      driverPhone: firstTimeRecord?.司机电话,
      driverInfo: firstTimeRecord?.司机姓名及电话,

      // 图片URL列表
      shippingPhotoUrls,
      driverLicensePhotoUrls,

      // 设备明细
      shippingItems
    };

    // 6. 调用增强版导入接口
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
    ElMessage.error(`导入失败: ${error.message || '未知错误'}`);
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
 * 计算表格合并单元格
 * 合并相同的"名称"、"序号"和"重量"列
 */
const getSpanMethod = ({ row, column, rowIndex, columnIndex }: any, data: any[]) => {
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
    const [projectRes, personRes] = await Promise.all([
      getProjectSimpleList(),
      getResponsiblePersonList()
    ]);

    projectList.value = projectRes.data || [];
    responsiblePersonList.value = personRes.data || [];
  } catch (error) {
    ElMessage.error('获取基础数据失败');
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

