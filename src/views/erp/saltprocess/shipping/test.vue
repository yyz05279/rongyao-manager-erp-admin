<template>
  <div class="shipping-test-container">
    <el-card class="test-header">
      <template #header>
        <div class="card-header">
          <h2>发货清单管理功能测试</h2>
          <el-tag type="info">离线测试环境</el-tag>
        </div>
      </template>
      <el-alert
        title="功能说明"
        description="本页面提供发货清单管理模块的离线测试功能，包括Mock数据展示、Excel导入导出测试等。所有功能均在前端实现，不依赖后端API。"
        type="info"
        show-icon
        :closable="false"
      />
    </el-card>

    <el-row :gutter="20">
      <!-- Mock数据展示 -->
      <el-col :span="24">
        <el-card class="test-section">
          <template #header>
            <div class="section-header">
              <h3>Mock数据展示</h3>
              <el-button-group>
                <el-button @click="refreshMockData" :loading="loading.mockData">
                  <el-icon><Refresh /></el-icon>
                  刷新数据
                </el-button>
                <el-button @click="showStatistics">
                  <el-icon><DataAnalysis /></el-icon>
                  统计信息
                </el-button>
              </el-button-group>
            </div>
          </template>

          <!-- 数据统计卡片 -->
          <el-row :gutter="16" class="statistics-cards">
            <el-col :span="6">
              <el-statistic title="总清单数" :value="statisticsData.totalLists">
                <template #suffix>
                  <el-icon><Document /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="总物品数" :value="statisticsData.totalItems">
                <template #suffix>
                  <el-icon><Box /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="总重量(kg)" :value="statisticsData.totalWeight" :precision="1">
                <template #suffix>
                  <el-icon><Box /></el-icon>
                </template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="总体积(m³)" :value="statisticsData.totalVolume" :precision="1">
                <template #suffix>
                  <el-icon><Box /></el-icon>
                </template>
              </el-statistic>
            </el-col>
          </el-row>

          <!-- 发货清单列表 -->
          <div class="table-container">
            <el-table 
              :data="paginatedShippingLists" 
              v-loading="loading.mockData"
              stripe
              border
              style="width: 100%"
            >
              <el-table-column prop="listCode" label="清单编号" width="120" />
              <el-table-column prop="projectName" label="项目名称" width="150" />
              <el-table-column prop="batchNumber" label="批次号" width="100" />
              <el-table-column prop="responsiblePerson" label="负责人" width="100" />
              <el-table-column prop="shippingDate" label="发货日期" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusTagType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="totalItems" label="总件数" width="80" />
              <el-table-column prop="totalWeight" label="总重量(kg)" width="120">
                <template #default="{ row }">
                  {{ row.totalWeight.toFixed(1) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button size="small" @click="viewDetails(row)">
                      <el-icon><View /></el-icon>
                      详情
                    </el-button>
                    <el-button size="small" @click="exportSingle(row)">
                      <el-icon><Download /></el-icon>
                      导出
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :total="filteredShippingLists.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              class="pagination"
            />
          </div>
        </el-card>
      </el-col>

      <!-- Excel导入测试 -->
      <el-col :span="12">
        <el-card class="test-section">
          <template #header>
            <h3>Excel导入测试</h3>
          </template>

          <el-steps :active="importStep" finish-status="success" class="import-steps">
            <el-step title="选择文件" />
            <el-step title="配置导入" />
            <el-step title="预览数据" />
            <el-step title="导入完成" />
          </el-steps>

          <div class="import-content">
            <!-- 步骤1: 文件选择 -->
            <div v-if="importStep === 0" class="step-content">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept=".xlsx,.xls"
                :on-change="handleFileSelect"
                drag
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将Excel文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 .xlsx 和 .xls 格式文件
                  </div>
                </template>
              </el-upload>

              <div v-if="selectedFile" class="file-info">
                <el-alert
                  :title="`已选择文件: ${selectedFile.name}`"
                  type="success"
                  show-icon
                  :closable="false"
                />
                <el-button type="primary" @click="nextStep" class="next-btn">
                  下一步
                </el-button>
              </div>

              <!-- 模板下载 -->
              <div class="template-section">
                <h4>Excel模板下载</h4>
                <el-row :gutter="12">
                  <el-col :span="12" v-for="template in templateConfigs" :key="template.fileType">
                    <el-card shadow="hover" class="template-card">
                      <h5>{{ template.templateName }}</h5>
                      <p>{{ template.description }}</p>
                      <el-button size="small" @click="downloadTemplate(template)">
                        <el-icon><Download /></el-icon>
                        下载模板
                      </el-button>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 步骤2: 配置导入 -->
            <div v-if="importStep === 1" class="step-content">
              <el-form :model="importConfig" label-width="120px">
                <el-form-item label="文件类型">
                  <el-select v-model="importConfig.fileType" placeholder="请选择文件类型">
                    <el-option
                      v-for="template in templateConfigs"
                      :key="template.fileType"
                      :label="template.templateName"
                      :value="template.fileType"
                    />
                  </el-select>
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

                <el-form-item label="表头行号">
                  <el-input-number v-model="importConfig.headerRow" :min="1" :max="10" />
                </el-form-item>
              </el-form>

              <div class="step-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button type="primary" @click="previewData" :loading="loading.preview">
                  预览数据
                </el-button>
              </div>
            </div>

            <!-- 步骤3: 数据预览 -->
            <div v-if="importStep === 2" class="step-content">
              <div v-if="importResult" class="preview-result">
                <el-alert
                  :title="`解析结果: 总行数 ${importResult.totalRows}, 成功 ${importResult.successRows}, 错误 ${importResult.errorRows}`"
                  :type="importResult.success ? 'success' : 'warning'"
                  show-icon
                  :closable="false"
                />

                <!-- 错误信息 -->
                <div v-if="importResult.errors.length > 0" class="error-section">
                  <h4>错误信息</h4>
                  <el-table :data="importResult.errors" max-height="200">
                    <el-table-column prop="row" label="行号" width="80" />
                    <el-table-column prop="field" label="字段" width="120" />
                    <el-table-column prop="message" label="错误信息" />
                  </el-table>
                </div>

                <!-- 预览数据 -->
                <div class="preview-data">
                  <h4>预览数据 (前10条)</h4>
                  <el-table :data="importResult.data.slice(0, 10)" max-height="300">
                    <el-table-column prop="itemName" label="物品名称" width="150" />
                    <el-table-column prop="specification" label="规格型号" width="120" />
                    <el-table-column prop="equipmentType" label="设备类型" width="100" />
                    <el-table-column prop="quantity" label="数量" width="80" />
                    <el-table-column prop="unit" label="单位" width="60" />
                    <el-table-column prop="manufacturer" label="制造商" width="120" />
                  </el-table>
                </div>
              </div>

              <div class="step-actions">
                <el-button @click="prevStep">上一步</el-button>
                <el-button 
                  type="primary" 
                  @click="confirmImport" 
                  :disabled="!importResult || !importResult.success"
                >
                  确认导入
                </el-button>
              </div>
            </div>

            <!-- 步骤4: 导入完成 -->
            <div v-if="importStep === 3" class="step-content">
              <el-result
                icon="success"
                title="导入完成"
                :sub-title="`成功导入 ${importResult?.successRows || 0} 条数据`"
              >
                <template #extra>
                  <el-button type="primary" @click="resetImport">重新导入</el-button>
                </template>
              </el-result>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Excel导出测试 -->
      <el-col :span="12">
        <el-card class="test-section">
          <template #header>
            <h3>Excel导出测试</h3>
          </template>

          <div class="export-options">
            <el-form :model="exportConfig" label-width="120px">
              <el-form-item label="导出类型">
                <el-radio-group v-model="exportConfig.type">
                  <el-radio label="summary">发货清单汇总</el-radio>
                  <el-radio label="items">发货明细汇总</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="exportConfig.type === 'items'" label="分组方式">
                <el-select v-model="exportConfig.groupBy" placeholder="请选择分组方式">
                  <el-option label="按设备类型" value="equipment_type" />
                  <el-option label="按制造商" value="manufacturer" />
                  <el-option label="按项目" value="project" />
                </el-select>
              </el-form-item>

              <el-form-item label="包含统计">
                <el-switch v-model="exportConfig.includeStatistics" />
              </el-form-item>

              <el-form-item label="文件名">
                <el-input v-model="exportConfig.fileName" placeholder="自动生成" />
              </el-form-item>
            </el-form>

            <div class="export-actions">
              <el-button 
                type="primary" 
                @click="exportData" 
                :loading="loading.export"
                size="large"
              >
                <el-icon><Download /></el-icon>
                导出Excel
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      :title="`发货清单详情 - ${detailDialog.data?.listCode}`"
      width="80%"
      top="5vh"
    >
      <div v-if="detailDialog.data" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="清单编号">{{ detailDialog.data.listCode }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ detailDialog.data.projectName }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ detailDialog.data.batchNumber }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detailDialog.data.responsiblePerson }}</el-descriptions-item>
          <el-descriptions-item label="发货日期">{{ detailDialog.data.shippingDate }}</el-descriptions-item>
          <el-descriptions-item label="发货状态">
            <el-tag :type="getStatusTagType(detailDialog.data.status)">
              {{ getStatusText(detailDialog.data.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总件数">{{ detailDialog.data.totalItems }}</el-descriptions-item>
          <el-descriptions-item label="总重量">{{ detailDialog.data.totalWeight }}kg</el-descriptions-item>
          <el-descriptions-item label="总体积">{{ detailDialog.data.totalVolume || '-' }}m³</el-descriptions-item>
        </el-descriptions>

        <!-- 发货明细 -->
        <div class="detail-section">
          <h4>发货明细</h4>
          <el-table :data="detailDialog.items" max-height="400">
            <el-table-column prop="itemName" label="物品名称" width="150" />
            <el-table-column prop="specification" label="规格型号" width="120" />
            <el-table-column prop="equipmentType" label="设备类型" width="100">
              <template #default="{ row }">
                {{ getEquipmentTypeText(row.equipmentType) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="unit" label="单位" width="60" />
            <el-table-column prop="unitWeight" label="单重(kg)" width="100" />
            <el-table-column prop="manufacturer" label="制造商" width="120" />
          </el-table>
        </div>

        <!-- 跟踪记录 -->
        <div class="detail-section">
          <h4>跟踪记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="record in detailDialog.trackingRecords"
              :key="record.id"
              :timestamp="formatDateTime(record.statusTime)"
              placement="top"
            >
              <el-card>
                <h5>{{ getStatusText(record.status) }}</h5>
                <p>位置: {{ record.location || '-' }}</p>
                <p>操作人: {{ record.operator }}</p>
                <p v-if="record.remarks">备注: {{ record.remarks }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
        <el-button type="primary" @click="exportSingle(detailDialog.data)">
          <el-icon><Download /></el-icon>
          导出此清单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ShippingTest" lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Refresh,
  DataAnalysis,
  Document,
  Box,
  View,
  Download,
  UploadFilled
} from '@element-plus/icons-vue';

// 导入Mock数据和工具类
import {
  mockShippingLists,
  mockShippingItems,
  mockShippingStatistics,
  mockTrackingRecords,
  getShippingItemsByListId,
  getTrackingRecordsByListId,
  filterShippingLists,
  paginateResults
} from '@/api/erp/saltprocess/shipping/mock-data';

import {
  ShippingListVO,
  ShippingItemVO,
  ShippingTrackingRecord,
  ShippingStatus,
  EquipmentType,
  ShippingExcelImportConfig,
  ShippingExcelImportResult
} from '@/api/erp/saltprocess/shipping/types';

import { ExcelImportParser, excelTemplateConfigs } from '@/utils/excel-import-test';
import { ExcelExportTool } from '@/utils/excel-export-test';
import { ExcelTemplateGenerator } from '@/utils/excel-template-generator';

// 响应式数据
const loading = reactive({
  mockData: false,
  preview: false,
  export: false
});

// Mock数据
const statisticsData = ref(mockShippingStatistics);
const shippingLists = ref<ShippingListVO[]>([...mockShippingLists]);
const filteredShippingLists = ref<ShippingListVO[]>([...mockShippingLists]);

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10
});

// 计算属性 - 分页后的数据
const paginatedShippingLists = computed(() => {
  const result = paginateResults(
    filteredShippingLists.value,
    pagination.currentPage,
    pagination.pageSize
  );
  return result.records;
});

// Excel导入相关
const importStep = ref(0);
const selectedFile = ref<File | null>(null);
const sheetNames = ref<string[]>([]);
const templateConfigs = ref(excelTemplateConfigs);
const importConfig = reactive<ShippingExcelImportConfig>({
  fileType: 'GENERAL',
  sheetName: '',
  headerRow: 1,
  columnMapping: {}
});
const importResult = ref<ShippingExcelImportResult | null>(null);
const excelParser = new ExcelImportParser();

// Excel导出配置
const exportConfig = reactive({
  type: 'summary',
  groupBy: 'equipment_type',
  includeStatistics: true,
  fileName: ''
});

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: null as ShippingListVO | null,
  items: [] as ShippingItemVO[],
  trackingRecords: [] as ShippingTrackingRecord[]
});

// 方法定义

/**
 * 刷新Mock数据
 */
const refreshMockData = async () => {
  loading.mockData = true;
  try {
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 重新加载数据
    shippingLists.value = [...mockShippingLists];
    filteredShippingLists.value = [...mockShippingLists];

    ElMessage.success('数据刷新成功');
  } catch (error) {
    ElMessage.error('数据刷新失败');
  } finally {
    loading.mockData = false;
  }
};

/**
 * 显示统计信息
 */
const showStatistics = () => {
  const statusStats = Object.entries(statisticsData.value.statusCounts)
    .map(([status, count]) => `${getStatusText(status as ShippingStatus)}: ${count}`)
    .join('\n');

  const equipmentStats = Object.entries(statisticsData.value.equipmentTypeCounts)
    .map(([type, count]) => `${getEquipmentTypeText(type as EquipmentType)}: ${count}`)
    .join('\n');

  ElMessageBox.alert(
    `状态统计:\n${statusStats}\n\n设备类型统计:\n${equipmentStats}`,
    '统计信息',
    { type: 'info' }
  );
};

/**
 * 查看详情
 */
const viewDetails = (row: ShippingListVO) => {
  detailDialog.data = row;
  detailDialog.items = getShippingItemsByListId(row.id);
  detailDialog.trackingRecords = getTrackingRecordsByListId(row.id);
  detailDialog.visible = true;
};

/**
 * 导出单个清单
 */
const exportSingle = async (row: ShippingListVO) => {
  try {
    const items = getShippingItemsByListId(row.id);
    const trackingRecords = getTrackingRecordsByListId(row.id);

    const exporter = new ExcelExportTool();
    exporter.exportSingleShippingList(row, items, trackingRecords);

    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error);
  }
};

/**
 * 分页大小改变
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
};

/**
 * 当前页改变
 */
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
};

/**
 * 文件选择处理
 */
const handleFileSelect = async (file: any) => {
  selectedFile.value = file.raw;

  try {
    // 读取Excel文件
    await excelParser.readFile(file.raw);
    sheetNames.value = excelParser.getSheetNames();

    // 设置默认工作表
    if (sheetNames.value.length > 0) {
      importConfig.sheetName = sheetNames.value[0];
    }

    ElMessage.success('文件读取成功');
  } catch (error) {
    ElMessage.error('文件读取失败: ' + error);
    selectedFile.value = null;
  }
};

/**
 * 下一步
 */
const nextStep = () => {
  if (importStep.value < 3) {
    importStep.value++;
  }
};

/**
 * 上一步
 */
const prevStep = () => {
  if (importStep.value > 0) {
    importStep.value--;
  }
};

/**
 * 预览数据
 */
const previewData = async () => {
  loading.preview = true;

  try {
    // 设置列映射（简化处理，实际应该根据模板配置）
    const selectedTemplate = templateConfigs.value.find(t => t.fileType === importConfig.fileType);
    if (selectedTemplate) {
      const columnMapping: { [key: string]: string } = {};
      selectedTemplate.columns.forEach((col, index) => {
        columnMapping[col.key] = String.fromCharCode(65 + index); // A, B, C...
      });
      importConfig.columnMapping = columnMapping;
    }

    // 设置配置并解析数据
    excelParser.setConfig(importConfig);
    importResult.value = excelParser.parseData();

    nextStep();
    ElMessage.success('数据预览成功');
  } catch (error) {
    ElMessage.error('数据预览失败: ' + error);
  } finally {
    loading.preview = false;
  }
};

/**
 * 确认导入
 */
const confirmImport = () => {
  if (importResult.value && importResult.value.success) {
    // 这里可以将数据添加到Mock数据中进行演示
    ElMessage.success(`导入成功，共导入 ${importResult.value.successRows} 条数据`);
    nextStep();
  }
};

/**
 * 重置导入
 */
const resetImport = () => {
  importStep.value = 0;
  selectedFile.value = null;
  sheetNames.value = [];
  importResult.value = null;
  Object.assign(importConfig, {
    fileType: 'GENERAL',
    sheetName: '',
    headerRow: 1,
    columnMapping: {}
  });
};

/**
 * 下载模板
 */
const downloadTemplate = (template: any) => {
  try {
    ExcelTemplateGenerator.downloadTemplate(template);
    ElMessage.success(`模板 ${template.templateName} 下载成功`);
  } catch (error) {
    ElMessage.error('模板下载失败: ' + error);
  }
};

/**
 * 导出数据
 */
const exportData = async () => {
  loading.export = true;

  try {
    const exporter = new ExcelExportTool();

    if (exportConfig.type === 'summary') {
      // 导出发货清单汇总
      exporter.exportShippingListSummary(
        shippingLists.value,
        exportConfig.includeStatistics ? statisticsData.value : undefined,
        {
          fileName: exportConfig.fileName || undefined
        }
      );
    } else {
      // 导出发货明细汇总
      exporter.exportShippingItemsSummary(
        mockShippingItems,
        exportConfig.groupBy as any,
        {
          fileName: exportConfig.fileName || undefined
        }
      );
    }

    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败: ' + error);
  } finally {
    loading.export = false;
  }
};

/**
 * 获取状态文本
 */
const getStatusText = (status: ShippingStatus | string): string => {
  const statusMap = {
    [ShippingStatus.DRAFT]: '草稿',
    [ShippingStatus.PENDING]: '待发货',
    [ShippingStatus.PARTIAL_SHIPPED]: '部分发货',
    [ShippingStatus.SHIPPED]: '已发货',
    [ShippingStatus.DELIVERED]: '已送达',
    [ShippingStatus.COMPLETED]: '已完成',
    [ShippingStatus.CANCELLED]: '已取消'
  };
  return statusMap[status as ShippingStatus] || status;
};

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: ShippingStatus): string => {
  const typeMap = {
    [ShippingStatus.DRAFT]: 'info',
    [ShippingStatus.PENDING]: 'warning',
    [ShippingStatus.PARTIAL_SHIPPED]: 'warning',
    [ShippingStatus.SHIPPED]: 'primary',
    [ShippingStatus.DELIVERED]: 'success',
    [ShippingStatus.COMPLETED]: 'success',
    [ShippingStatus.CANCELLED]: 'danger'
  };
  return typeMap[status] || 'info';
};

/**
 * 获取设备类型文本
 */
const getEquipmentTypeText = (type: EquipmentType | string): string => {
  const typeMap = {
    [EquipmentType.MECHANICAL]: '机械设备',
    [EquipmentType.ELECTRICAL]: '电控设备',
    [EquipmentType.PIPELINE]: '管路设备',
    [EquipmentType.BURNER]: '燃烧器',
    [EquipmentType.AUXILIARY]: '辅助设备',
    [EquipmentType.STANDARD_PARTS]: '标准件'
  };
  return typeMap[type as EquipmentType] || type;
};

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化数据
  refreshMockData();
});
</script>

<style scoped lang="scss">
.shipping-test-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .test-header {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        color: #2c3e50;
      }
    }
  }

  .test-section {
    margin-bottom: 20px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: #34495e;
      }
    }

    .statistics-cards {
      margin-bottom: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;

      .el-statistic {
        text-align: center;
        color: white;

        :deep(.el-statistic__head) {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        :deep(.el-statistic__content) {
          color: white;
          font-weight: bold;
        }
      }
    }

    .table-container {
      .pagination {
        margin-top: 20px;
        text-align: right;
      }
    }

    .import-steps {
      margin-bottom: 30px;
    }

    .import-content {
      .step-content {
        min-height: 300px;
        padding: 20px 0;

        .file-info {
          margin-top: 20px;

          .next-btn {
            margin-top: 10px;
          }
        }

        .template-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;

          h4 {
            margin-bottom: 15px;
            color: #2c3e50;
          }

          .template-card {
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            h5 {
              margin: 0 0 8px 0;
              color: #2c3e50;
              font-size: 14px;
            }

            p {
              margin: 0 0 10px 0;
              color: #7f8c8d;
              font-size: 12px;
              line-height: 1.4;
            }
          }
        }

        .step-actions {
          margin-top: 30px;
          text-align: right;

          .el-button {
            margin-left: 10px;
          }
        }

        .preview-result {
          .error-section {
            margin: 20px 0;

            h4 {
              color: #e74c3c;
              margin-bottom: 10px;
            }
          }

          .preview-data {
            margin-top: 20px;

            h4 {
              color: #2c3e50;
              margin-bottom: 10px;
            }
          }
        }
      }
    }

    .export-options {
      .export-actions {
        margin-top: 30px;
        text-align: center;
      }
    }
  }

  .detail-content {
    .detail-section {
      margin-top: 30px;

      h4 {
        margin-bottom: 15px;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shipping-test-container {
    padding: 10px;

    .statistics-cards {
      .el-col {
        margin-bottom: 15px;
      }
    }

    .el-table {
      font-size: 12px;
    }

    .template-section {
      .el-col {
        margin-bottom: 10px;
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .shipping-test-container {
    background-color: #1a1a1a;

    .test-header,
    .test-section {
      :deep(.el-card) {
        background-color: #2d2d2d;
        border-color: #404040;
      }
    }

    .statistics-cards {
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    }

    h2, h3, h4, h5 {
      color: #e2e8f0 !important;
    }

    p {
      color: #a0aec0 !important;
    }
  }
}
</style>
