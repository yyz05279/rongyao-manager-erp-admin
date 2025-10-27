<template>
  <div class="material-detail">
    <!-- 操作栏 -->
    <el-card shadow="never" class="operation-card">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            accept=".xlsx,.xls"
            :limit="1"
            :show-file-list="false"
          >
            <el-button type="primary" icon="Upload">导入Excel</el-button>
          </el-upload>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-button icon="Download" @click="downloadTemplate">下载模板</el-button>
          <el-button type="success" icon="Download" :disabled="materialData.length === 0" @click="handleExport"> 导出数据 </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 解析进度 -->
    <el-card v-if="parsing" shadow="never" class="progress-card">
      <el-progress :percentage="parseProgress" :status="parseStatus" :stroke-width="8">
        <template #default="{ percentage }">
          <span class="percentage-value">{{ percentage }}%</span>
        </template>
      </el-progress>
      <p class="progress-text">{{ parseMessage }}</p>
    </el-card>

    <!-- 数据预览和编辑 -->
    <el-card v-if="materialData.length > 0" shadow="never" class="preview-card">
      <template #header>
        <div class="card-header">
          <span>数据预览 (共{{ totalCountExcludingShipping }}条物料记录)</span>
          <div>
            <el-button @click="validateData">验证数据</el-button>
            <el-button type="primary" @click="openImportConfig" :loading="submitting" icon="Upload"> 配置并导入 </el-button>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="statistics-bar">
        <el-tag type="info">总计: {{ totalCountExcludingShipping }}</el-tag>
        <el-tag type="success">有效: {{ validCount }}</el-tag>
        <el-tag type="warning">待导入: {{ pendingCount }}</el-tag>
        <el-tag type="primary">已导入: {{ importedCount }}</el-tag>
        <el-tag type="danger" v-if="errorCount > 0">错误: {{ errorCount }}</el-tag>
      </div>

      <!-- 按Sheet分组的数据展示 -->
      <el-tabs
        v-model="activeSheetTab"
        type="card"
        class="sheet-tabs"
        @tab-change="handleSheetTabChange"
        v-loading="sheetSwitching"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-tab-pane
          v-for="sheetGroup in sheetGroups"
          :key="sheetGroup.sheetName"
          :label="`${sheetGroup.sheetName} (${sheetGroup.materials.length})`"
          :name="sheetGroup.sheetName"
          :disabled="sheetSwitching"
          lazy
        >
          <el-table
            v-if="activeSheetTab === sheetGroup.sheetName"
            :data="currentSheetData"
            style="width: 100%"
            :row-class-name="getRowClassName"
            max-height="500"
            border
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.imported" type="success" size="small">已导入</el-tag>
                <el-tag v-else-if="row.hasErrors" type="danger" size="small">错误</el-tag>
                <el-tag v-else type="warning" size="small">待导入</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="materialName" label="物料名称" width="200" show-overflow-tooltip>
              <template #default="{ row, $index }">
                <el-input
                  v-model="row.materialName"
                  @change="validateRowBySheet($index)"
                  :class="{ 'error-input': row.errors?.materialName }"
                  size="small"
                />
                <div v-if="row.errors?.materialName" class="error-text">
                  {{ row.errors.materialName }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="规格型号" width="180" show-overflow-tooltip>
              <template #default="{ row, $index }">
                <el-input v-model="row.specification" @change="validateRowBySheet($index)" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="120" align="center">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.quantity"
                  @change="validateRowBySheet($index)"
                  :min="0"
                  :precision="2"
                  size="small"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="100" align="center">
              <template #default="{ row }">
                <el-select v-model="row.unit" placeholder="选择单位" size="small">
                  <el-option label="台" value="台" />
                  <el-option label="套" value="套" />
                  <el-option label="件" value="件" />
                  <el-option label="个" value="个" />
                  <el-option label="支" value="支" />
                  <el-option label="根" value="根" />
                  <el-option label="米" value="米" />
                  <el-option label="kg" value="kg" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="materialType" label="物料类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getMaterialTypeTag(row.materialType)">
                  {{ getMaterialTypeName(row.materialType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="materialCategory" label="材质" width="100" show-overflow-tooltip />
            <el-table-column prop="manufacturer" label="制造商" width="120" show-overflow-tooltip />
            <el-table-column prop="remarks1" label="备注1" width="150" show-overflow-tooltip />
            <el-table-column prop="remarks2" label="备注2" width="150" show-overflow-tooltip />
            <el-table-column label="状态" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-icon v-if="!row.hasErrors" color="green" size="20"><Check /></el-icon>
                <el-icon v-else color="red" size="20"><Close /></el-icon>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <pagination
            v-if="currentSheetTotal > sheetPageSize"
            v-model:page="currentSheetPage"
            v-model:limit="sheetPageSize"
            :total="currentSheetTotal"
            @pagination="handleSheetPagination"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 物料列表（已导入的数据） -->
    <el-card shadow="never" class="list-card">
      <template #header>
        <div class="card-header">
          <span>物料清单</span>
          <el-button icon="Refresh" @click="loadMaterialList">刷新</el-button>
        </div>
      </template>

      <!-- 按Sheet分组展示已导入的物料 -->
      <el-tabs
        v-if="importedSheetGroups.length > 0"
        v-model="activeImportedSheetTab"
        type="border-card"
        class="imported-sheet-tabs"
        @tab-change="handleImportedTabChange"
        v-loading="importedSheetSwitching"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-tab-pane
          v-for="group in importedSheetGroups"
          :key="group.sheetName"
          :label="`${group.sheetName || '未分组'} (${group.materials.length})`"
          :name="group.sheetName || '未分组'"
          :disabled="importedSheetSwitching"
          lazy
        >
          <el-table
            v-if="activeImportedSheetTab === (group.sheetName || '未分组')"
            v-loading="loading"
            :data="currentImportedSheetData"
            style="width: 100%"
            border
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="materialName" label="物料名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="specification" label="规格型号" min-width="160" show-overflow-tooltip />
            <el-table-column prop="quantity" label="数量" width="100" align="center" />
            <el-table-column prop="unit" label="单位" width="80" align="center" />
            <el-table-column prop="materialType" label="物料类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getMaterialTypeTag(row.materialType)">
                  {{ getMaterialTypeName(row.materialType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="materialCategory" label="材质" width="100" show-overflow-tooltip />
            <el-table-column prop="manufacturer" label="制造商" width="120" show-overflow-tooltip />
            <el-table-column prop="remarks1" label="备注1" width="150" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="160" align="center">
              <template #default="{ row }">
                {{ parseTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 无数据时显示 -->
      <el-empty v-else description="暂无物料数据" />

      <!-- 全局分页（所有Sheet的数据） -->
      <pagination
        v-if="importedSheetGroups.length > 0"
        v-model:page="listQuery.pageNum"
        v-model:limit="listQuery.pageSize"
        :total="listTotal"
        @pagination="handleMaterialPagination"
        style="margin-top: 20px;"
      />
    </el-card>

    <!-- 导入配置弹窗 -->
    <MaterialImportConfigDialog
      v-model:visible="importConfigDialog"
      :sheet-groups="sheetGroups"
      :importing="importing"
      :progress-percentage="importProgress.percentage"
      :progress-status="importProgress.status"
      :current-sheet="importProgress.currentSheet"
      :current-batch="importProgress.currentBatch"
      :total-batches="importProgress.totalBatches"
      :imported-count="importProgress.importedCount"
      :total-count="importProgress.totalCount"
      :progress-message="importProgress.message"
      @confirm="handleImportConfigConfirm"
    />

    <!-- 导入结果对话框 -->
    <el-dialog v-model="showResult" title="导入结果" width="800px">
      <div v-if="importResult">
        <el-result
          :icon="importResult.success ? 'success' : 'error'"
          :title="importResult.success ? '导入成功' : '导入失败'"
          :sub-title="importResult.summary"
        >
          <template #extra>
            <!-- 总体统计 -->
            <div class="result-stats">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="总记录数">
                  {{ importResult.totalRecords }}
                </el-descriptions-item>
                <el-descriptions-item label="成功记录">
                  <el-tag type="success">{{ importResult.successRecords }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="失败记录">
                  <el-tag type="danger" v-if="importResult.failedRecords > 0">{{ importResult.failedRecords }}</el-tag>
                  <span v-else>0</span>
                </el-descriptions-item>
                <el-descriptions-item label="跳过记录">
                  <el-tag type="info" v-if="importResult.skippedRecords > 0">{{ importResult.skippedRecords }}</el-tag>
                  <span v-else>0</span>
                </el-descriptions-item>
                <el-descriptions-item label="新建产品">
                  {{ importResult.newProductRecords }}
                </el-descriptions-item>
                <el-descriptions-item label="匹配产品">
                  {{ importResult.matchedProductRecords }}
                </el-descriptions-item>
                <el-descriptions-item label="处理Sheet数">
                  {{ importResult.sheetResults?.length || 0 }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 各Sheet导入详情 -->
            <div v-if="importResult.sheetResults && importResult.sheetResults.length > 0" class="sheet-results">
              <h4>各Sheet导入详情：</h4>
              <el-table :data="importResult.sheetResults" border size="small" style="margin-top: 10px;">
                <el-table-column prop="sheetName" label="Sheet名称" min-width="120">
                  <template #default="{ row }">
                    <el-tag :type="getSheetResultTag(row.sheetName)" size="small">
                      {{ row.sheetName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="totalRecords" label="总记录数" width="90" align="center" />
                <el-table-column prop="batchCount" label="批次数" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.batchCount > 0" type="primary" size="small">
                      {{ row.batchCount }}
                    </el-tag>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="successRecords" label="成功" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag type="success" size="small" v-if="row.successRecords > 0">
                      {{ row.successRecords }}
                    </el-tag>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column prop="failedRecords" label="失败" width="70" align="center">
                  <template #default="{ row }">
                    <el-tag type="danger" size="small" v-if="row.failedRecords > 0">
                      {{ row.failedRecords }}
                    </el-tag>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column prop="newProductRecords" label="新建产品" width="90" align="center" />
                <el-table-column prop="matchedProductRecords" label="匹配产品" width="90" align="center" />
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.skipped" type="info" size="small">已跳过</el-tag>
                    <el-tag v-else :type="row.success ? 'success' : 'danger'" size="small">
                      {{ row.success ? '成功' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 错误信息 -->
            <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
              <h4>错误信息：</h4>
              <el-scrollbar max-height="200px">
                <div v-for="(error, index) in importResult.errors" :key="index" class="error-item">
                  <el-tag type="danger" size="small" v-if="error.rowNumber">第{{ error.rowNumber }}行</el-tag>
                  <span v-if="error.materialName">{{ error.materialName }}: </span>
                  {{ error.errorMessage }}
                </div>
              </el-scrollbar>
            </div>
          </template>
        </el-result>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="MaterialDetail" lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { parseTime } from '@/utils/ruoyi';
import { ExcelParser, MaterialDataValidator } from '@/utils/excel-parser';
import {
  listMaterial,
  deleteMaterial,
  importParsedMaterialData,
  exportMaterialList
} from '@/api/erp/saltprocess/material';
import type { MaterialVO, MaterialQuery, MaterialImportBo } from '@/api/erp/saltprocess/material/types';
import MaterialImportConfigDialog from './MaterialImportConfigDialog.vue';

// Props
interface Props {
  projectId: string;
}

const props = defineProps<Props>();

// 响应式数据
const uploadRef = ref();
const loading = ref(false);
// 使用 shallowRef 减少大数组的深层响应式开销
const materialData = shallowRef<any[]>([]);
const parsing = ref(false);
const parseProgress = ref(0);
const parseStatus = ref<'success' | 'exception' | 'warning' | ''>('');
const parseMessage = ref('');
const submitting = ref(false);
const showResult = ref(false);
const importResult = ref<any>(null);

// 导入配置弹窗
const importConfigDialog = ref(false);
const importing = ref(false);
const importProgress = ref({
  percentage: 0,
  status: '' as 'success' | 'exception' | 'warning' | '',
  currentSheet: '',
  currentBatch: 0,
  totalBatches: 0,
  importedCount: 0,
  totalCount: 0,
  message: ''
});

// Sheet分组相关
const activeSheetTab = ref('');
const sheetPageSize = ref(50);
const sheetPageMap = ref<Record<string, number>>({});
const activeImportedSheetTab = ref('');
const currentSheetPage = ref(1);
const currentSheetTotal = ref(0);
// 使用 shallowRef 减少当前显示数据的响应式开销
const currentSheetData = shallowRef<any[]>([]);
const currentImportedSheetData = shallowRef<MaterialVO[]>([]);
const sheetSwitching = ref(false); // 标签切换中
const importedSheetSwitching = ref(false); // 已导入标签切换中

// 移除前端分页相关变量（改用后端分页）

// 物料列表 - 使用 shallowRef
const materialList = shallowRef<MaterialVO[]>([]);
const listTotal = ref(0);
const listQuery = ref<MaterialQuery>({
  pageNum: 1,
  pageSize: 50, // 使用后端分页，每页50条
  projectId: props.projectId
});

// 计算属性
// 排除发货清单后的总数
const totalCountExcludingShipping = computed(() => {
  return materialData.value.filter(item => {
    const sheetName = (item.sheetName || '').toLowerCase();
    return !sheetName.includes('发货') && !sheetName.includes('装车');
  }).length;
});

const validCount = computed(() => {
  return materialData.value.filter(item => {
    const sheetName = (item.sheetName || '').toLowerCase();
    const isShippingList = sheetName.includes('发货') || sheetName.includes('装车');
    return !item.hasErrors && !isShippingList;
  }).length;
});

const errorCount = computed(() => {
  return materialData.value.filter(item => {
    const sheetName = (item.sheetName || '').toLowerCase();
    const isShippingList = sheetName.includes('发货') || sheetName.includes('装车');
    return item.hasErrors && !isShippingList;
  }).length;
});

const warningCount = computed(() => {
  return materialData.value.filter(item => {
    const sheetName = (item.sheetName || '').toLowerCase();
    const isShippingList = sheetName.includes('发货') || sheetName.includes('装车');
    return item.hasWarnings && !isShippingList;
  }).length;
});

// 待导入数量（排除发货清单）
const pendingCount = computed(() => {
  return materialData.value.filter(item => {
    const sheetName = (item.sheetName || '').toLowerCase();
    const isShippingList = sheetName.includes('发货') || sheetName.includes('装车');
    return !(item as any).imported && !item.hasErrors && !isShippingList;
  }).length;
});

// 已导入数量（排除发货清单）
const importedCount = computed(() => {
  return materialData.value.filter(item => {
    const sheetName = (item.sheetName || '').toLowerCase();
    const isShippingList = sheetName.includes('发货') || sheetName.includes('装车');
    return (item as any).imported && !isShippingList;
  }).length;
});

// 按Sheet分组的数据
interface SheetGroup {
  sheetName: string;
  materials: any[];
}

// 使用优化的计算属性，减少不必要的重新计算
const sheetGroups = computed<SheetGroup[]>(() => {
  if (materialData.value.length === 0) return [];

  const groups = new Map<string, any[]>();
  const dataArray = materialData.value; // 缓存数组引用

  // 使用 for 循环而不是 forEach，性能更好
  for (let i = 0; i < dataArray.length; i++) {
    const material = dataArray[i];
    const sheetName = material.sheetName || '未命名';

    // 过滤发货清单：根据Sheet名称判断
    const lowerSheetName = sheetName.toLowerCase();
    if (lowerSheetName.includes('发货') || lowerSheetName.includes('装车')) {
      continue; // 跳过发货清单
    }

    if (!groups.has(sheetName)) {
      groups.set(sheetName, []);
    }
    const sheetMaterials = groups.get(sheetName);
    if (sheetMaterials) {
      sheetMaterials.push(material);
    }
  }

  // 优化：提前创建结果数组
  const result: SheetGroup[] = [];
  groups.forEach((materials, sheetName) => {
    result.push({ sheetName, materials });
  });

  return result;
});

// 监听sheetGroups变化，初始化tab和分页
watch(
  sheetGroups,
  (newGroups) => {
    if (newGroups.length > 0) {
      // 初始化分页映射
      newGroups.forEach(group => {
        if (!sheetPageMap.value[group.sheetName]) {
          sheetPageMap.value[group.sheetName] = 1;
        }
      });

      // 如果没有激活的tab或激活的tab不存在，设置第一个
      if (!activeSheetTab.value || !newGroups.find(g => g.sheetName === activeSheetTab.value)) {
        activeSheetTab.value = newGroups[0].sheetName;
      }

      // 更新当前显示的数据
      updateCurrentSheetData();
    }
  },
  { immediate: true }
);

// 按Sheet分组的已导入数据 - 优化版本
const importedSheetGroups = computed<SheetGroup[]>(() => {
  if (materialList.value.length === 0) return [];

  const groups = new Map<string, MaterialVO[]>();
  const dataArray = materialList.value; // 缓存数组引用

  // 使用 for 循环优化性能
  for (let i = 0; i < dataArray.length; i++) {
    const material = dataArray[i];
    const sheetName = material.sheetName || '未分组';
    if (!groups.has(sheetName)) {
      groups.set(sheetName, []);
    }
    const sheetMaterials = groups.get(sheetName);
    if (sheetMaterials) {
      sheetMaterials.push(material);
    }
  }

  // 优化：提前创建结果数组
  const result: SheetGroup[] = [];
  groups.forEach((materials, sheetName) => {
    result.push({ sheetName, materials });
  });

  return result;
});

// 监听importedSheetGroups变化，初始化tab
watch(
  importedSheetGroups,
  (newGroups) => {
    if (newGroups.length > 0) {
      // 如果没有激活的tab或激活的tab不存在，设置第一个
      if (!activeImportedSheetTab.value || !newGroups.find(g => g.sheetName === activeImportedSheetTab.value)) {
        activeImportedSheetTab.value = newGroups[0].sheetName;
      }
      // 更新当前显示的数据
      updateCurrentImportedSheetData();
    }
  },
  { immediate: true }
);

// 监听activeSheetTab变化 - 使用异步更新避免阻塞UI
watch(activeSheetTab, async () => {
  // 先让Vue更新DOM（标签选中状态）
  await nextTick();
  // 然后再更新数据
  updateCurrentSheetData();
});

// 监听activeImportedSheetTab变化 - 使用异步更新避免阻塞UI
watch(activeImportedSheetTab, async () => {
  // 先让Vue更新DOM（标签选中状态）
  await nextTick();
  // 然后再更新数据
  updateCurrentImportedSheetData();
});

// 更新当前Sheet的显示数据
const updateCurrentSheetData = () => {
  // 使用 requestAnimationFrame 在下一帧更新数据，避免阻塞当前帧的渲染
  requestAnimationFrame(() => {
    const group = sheetGroups.value.find(g => g.sheetName === activeSheetTab.value);
    if (!group) {
      currentSheetData.value = [];
      currentSheetTotal.value = 0;
      currentSheetPage.value = 1;
      return;
    }

    currentSheetTotal.value = group.materials.length;
    const page = sheetPageMap.value[activeSheetTab.value] || 1;
    currentSheetPage.value = page;

    const start = (page - 1) * sheetPageSize.value;
    const end = start + sheetPageSize.value;
    // shallowRef 需要整体替换才能触发更新
    const newData = group.materials.slice(start, end);
    currentSheetData.value = newData;
  });
};

// 更新当前已导入Sheet的显示数据（直接显示全部，不分页）
const updateCurrentImportedSheetData = () => {
  // 使用 requestAnimationFrame 在下一帧更新数据，避免阻塞当前帧的渲染
  requestAnimationFrame(() => {
    const group = importedSheetGroups.value.find(g => g.sheetName === activeImportedSheetTab.value);
    if (!group) {
      currentImportedSheetData.value = [];
      return;
    }
    // 直接显示该Sheet的所有数据
    currentImportedSheetData.value = group.materials;
  });
};

// 处理Sheet标签页切换
const handleSheetTabChange = async (tabName: string) => {
  if (sheetSwitching.value) return; // 防止重复切换

  // 先更新UI状态，让标签立即切换
  activeSheetTab.value = tabName;

  // 立即开始显示加载动画
  sheetSwitching.value = true;

  // 等待DOM更新（标签选中状态变化）和数据处理完成
  await nextTick();
  // 再等待一次，确保数据更新完成
  await nextTick();

  // 使用setTimeout确保视觉效果（最小显示时间100ms）
  setTimeout(() => {
    sheetSwitching.value = false;
  }, 100);
};

// 处理已导入Sheet标签页切换
const handleImportedTabChange = async (tabName: string) => {
  if (importedSheetSwitching.value) return; // 防止重复切换

  // 先更新UI状态，让标签立即切换
  activeImportedSheetTab.value = tabName;

  // 立即开始显示加载动画
  importedSheetSwitching.value = true;

  // 等待DOM更新（标签选中状态变化）和数据处理完成
  await nextTick();
  // 再等待一次，确保数据更新完成
  await nextTick();

  // 使用setTimeout确保视觉效果（最小显示时间100ms）
  setTimeout(() => {
    importedSheetSwitching.value = false;
  }, 100);
};

// 生命周期
onMounted(() => {
  loadMaterialList();
});

// 方法
const loadMaterialList = async () => {
  loading.value = true;
  try {
    const response: any = await listMaterial(listQuery.value);

    // 调试日志 - 查看物料列表API响应
    console.log('=== 物料列表API响应 ===');
    console.log('完整响应:', response);
    console.log('响应数据:', response.data);
    console.log('rows数据:', response.data?.rows || response.rows);
    console.log('total:', response.data?.total || response.total);

    // 兼容两种数据结构
    const data = response.data || response;
    materialList.value = data.rows || [];
    listTotal.value = data.total || 0;

    console.log('最终materialList:', materialList.value);
    console.log('数据条数:', materialList.value.length);
  } catch (error) {
    console.error('获取物料列表失败:', error);
    ElMessage.error('获取物料列表失败');
  } finally {
    loading.value = false;
  }
};

// 文件上传前验证
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';
  const isLt50M = file.size / 1024 / 1024 < 50;

  if (!isExcel) {
    ElMessage.error('只支持Excel文件格式!');
    return false;
  }
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过50MB!');
    return false;
  }
  return false; // 阻止自动上传，手动处理
};

// 文件选择处理
const handleFileChange = (file: any) => {
  if (file.raw) {
    parseExcelFile(file.raw);
  }
};

// Excel文件解析
const parseExcelFile = async (file: File) => {
  parsing.value = true;
  parseProgress.value = 0;
  parseMessage.value = '正在读取文件...';
  parseStatus.value = '';

  try {
    parseProgress.value = 20;
    parseMessage.value = '正在解析Excel结构...';

    // 使用工具类解析
    const parsedMaterials = await ExcelParser.parseFile(file);

    parseProgress.value = 90;
    parseMessage.value = '正在验证数据...';

    // 数据验证
    materialData.value = MaterialDataValidator.validateMaterials(parsedMaterials);
    MaterialDataValidator.checkDuplicates(materialData.value);

    parseProgress.value = 100;
    parseMessage.value = '解析完成!';
    parseStatus.value = 'success';

    setTimeout(() => {
      parsing.value = false;
    }, 1000);

    // 统计发货清单和物料清单数量
    const shippingCount = materialData.value.filter(item => {
      const sheetName = (item.sheetName || '').toLowerCase();
      return sheetName.includes('发货') || sheetName.includes('装车');
    }).length;
    const materialCount = materialData.value.length - shippingCount;

    if (shippingCount > 0) {
      ElMessage.success(`成功解析 ${materialCount} 条物料记录（已自动过滤 ${shippingCount} 条发货清单）`);
    } else {
      ElMessage.success(`成功解析 ${materialCount} 条物料记录`);
    }
  } catch (error: any) {
    console.error('Excel解析失败:', error);
    parseStatus.value = 'exception';
    parseMessage.value = '解析失败: ' + error.message;
    ElMessage.error('Excel文件解析失败: ' + error.message);

    setTimeout(() => {
      parsing.value = false;
    }, 2000);
  }
};

// 按Sheet验证行数据
const validateRowBySheet = (index: number) => {
  // 直接从当前显示的数据中获取
  const material = currentSheetData.value[index];
  if (material) {
    MaterialDataValidator.validateMaterial(material);
    // shallowRef 需要整体替换才能触发更新
    currentSheetData.value = [...currentSheetData.value];
  }
};

// Sheet分页处理
const handleSheetPagination = () => {
  // 更新当前sheet的分页页码
  sheetPageMap.value[activeSheetTab.value] = currentSheetPage.value;
  // 更新显示数据
  updateCurrentSheetData();
};

// 物料列表分页处理
const handleMaterialPagination = () => {
  loadMaterialList();
};

// 打开导入配置弹窗
const openImportConfig = () => {
  if (errorCount.value > 0) {
    ElMessage.warning('请先修复所有错误数据后再导入');
    return;
  }

  if (pendingCount.value === 0) {
    ElMessage.info('没有待导入的数据，所有数据已导入完成');
    return;
  }

  importConfigDialog.value = true;
};

// 处理导入配置确认
const handleImportConfigConfirm = async (config: any) => {
  console.log('导入配置:', config);
  // 不关闭弹窗，开始导入流程
  importing.value = true;

  // 转换配置格式
  const processConfig = {
    selectedSheets: config.sheets.map((s: any) => s.sheetName),
    batchSizeMap: config.sheets.reduce((map: any, s: any) => {
      map[s.sheetName] = s.batchSize;
      return map;
    }, {})
  };

  await submitDataWithConfig(processConfig);

  // 导入完成后，设置状态
  importing.value = false;
};

// 验证所有数据
const validateData = async () => {
  try {
    // 前端验证
    materialData.value.forEach(material => {
      MaterialDataValidator.validateMaterial(material);
    });

    // TODO: 后端验证（可选）
    // const result: any = await validateParsedMaterialData({
    //   projectId: props.projectId,
    //   materialItems: materialData.value
    // });

    ElMessage.success('数据验证完成');
  } catch (error) {
    console.error('数据验证失败:', error);
    ElMessage.error('数据验证失败');
  }
};

// 提交数据 - 按Sheet分组分批上传（每批10条，过滤发货清单）
const submitData = async () => {
  // 检查是否有错误
  if (errorCount.value > 0) {
    try {
      await ElMessageBox.confirm(
        `检测到 ${errorCount.value} 条错误记录，是否继续导入有效数据？`,
        '确认导入',
        {
          confirmButtonText: '继续导入',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
    } catch {
      return;
    }
  }

  submitting.value = true;

  try {
    // 按Sheet分组导入
    const batchNumber = new Date().getTime().toString();
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
    const BATCH_SIZE = 20; // 每批上传20条数据
    const IS_DEV_MODE = import.meta.env.MODE === 'development'; // 开发模式判断
    const importResults: any[] = [];
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalNewProducts = 0;
    let totalMatchedProducts = 0;
    let totalSkipped = 0; // 跳过的发货清单数量
    let userCancelled = false; // 用户取消标志

    // 遍历每个Sheet分组
    for (const group of sheetGroups.value) {
      // 如果用户已取消，停止处理后续Sheet
      if (userCancelled) {
        console.info(`⚠ 用户已取消上传，停止处理剩余Sheet`);
        break;
      }

      // 双重检查：确保不处理发货清单
      const lowerSheetName = group.sheetName.toLowerCase();
      if (lowerSheetName.includes('发货') || lowerSheetName.includes('装车')) {
        console.warn(`跳过发货清单Sheet: ${group.sheetName}`);
        totalSkipped += group.materials.length;
        continue;
      }

      // 获取物料类型（从Sheet名称或第一条数据推断）
      const materialType = inferMaterialType(group.sheetName, group.materials[0]);

      // 【关键】过滤发货清单：只保留非SHIPPING_INFO类型的物料
      const filteredMaterials = group.materials.filter((item) => {
        // 基于Sheet名称的额外检查
        const itemSheetName = (item.sheetName || '').toLowerCase();
        if (itemSheetName.includes('发货') || itemSheetName.includes('装车')) {
          return false; // 排除发货清单数据
        }

        const itemType = item.materialType || materialType;
        return itemType !== 'SHIPPING_INFO';
      });

      // 如果过滤后没有数据，记录跳过信息
      if (filteredMaterials.length === 0) {
        const skippedCount = group.materials.length;
        totalSkipped += skippedCount;
        console.info(`跳过发货清单Sheet: ${group.sheetName}，共${skippedCount}条记录`);
        importResults.push({
          sheetName: group.sheetName,
          success: true,
          totalRecords: skippedCount,
          successRecords: 0,
          failedRecords: 0,
          newProductRecords: 0,
          matchedProductRecords: 0,
          batchCount: 0,
          skipped: true,
          skipReason: '发货清单数据已过滤（数据不完整）',
          errors: []
        });
        continue;
      }

      // 再次过滤：只保留有效记录（没有错误的）
      const validMaterials = filteredMaterials.filter((item) => !item.hasErrors);

      if (validMaterials.length === 0) {
        console.warn(`Sheet ${group.sheetName} 过滤后无有效数据`);
        continue;
      }

      // 【核心】分批处理：将数据分成每批20条
      const totalBatches = Math.ceil(validMaterials.length / BATCH_SIZE);
      console.info(`Sheet ${group.sheetName}: 共${validMaterials.length}条数据，分${totalBatches}批上传，每批${BATCH_SIZE}条`);

      let sheetSuccessCount = 0;
      let sheetFailedCount = 0;
      let sheetNewProducts = 0;
      let sheetMatchedProducts = 0;
      const sheetErrors: any[] = [];

      // 分批上传
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, validMaterials.length);
        const batchMaterials = validMaterials.slice(start, end);

        console.info(`正在上传第 ${batchIndex + 1}/${totalBatches} 批，共${batchMaterials.length}条数据...`);

        // 【开发模式】如果不是第一批，弹出确认框
        if (IS_DEV_MODE && batchIndex > 0) {
          try {
            await ElMessageBox.confirm(
              `第 ${batchIndex} 批已上传完成！\n\n` +
                `当前Sheet: ${group.sheetName}\n` +
                `成功: ${sheetSuccessCount} 条\n` +
                `失败: ${sheetFailedCount} 条\n\n` +
                `是否继续上传第 ${batchIndex + 1} 批？`,
              '开发模式 - 批次确认',
              {
                confirmButtonText: '继续上传',
                cancelButtonText: '停止上传',
                type: 'info',
                distinguishCancelAndClose: true
              }
            );
            console.info(`✓ 用户确认，继续上传第 ${batchIndex + 1} 批`);
          } catch (action) {
            // 用户点击取消、关闭按钮或按ESC键
            console.warn(`⚠ 用户取消上传，已完成 ${batchIndex} 批，停止所有上传操作`);
            ElMessage({
              type: 'warning',
              message:
                `上传已停止！\n` +
                `当前Sheet: ${group.sheetName}\n` +
                `已完成: ${batchIndex}/${totalBatches} 批\n` +
                `成功: ${sheetSuccessCount} 条，失败: ${sheetFailedCount} 条`,
              duration: 5000,
              showClose: true
            });
            userCancelled = true; // 设置取消标志
            break; // 跳出当前Sheet的批次循环
          }
        }

        // 构建分批导入请求参数
        const importData: MaterialImportBo = {
          // 项目信息
          projectId: props.projectId,
          projectName: undefined,

          // 批次信息（包含批次编号）
          batchNumber: `${batchNumber}-${group.sheetName}-Batch${batchIndex + 1}`,

          // 负责人信息（可选）
          responsiblePerson: undefined,
          responsiblePersonId: undefined,

          // 发货日期信息
          shippingDate: currentDate,
          expectedDeliveryDate: undefined,

          // 发货方式和车辆信息（可选）
          shippingMethod: undefined,
          vehicleInfo: undefined,
          driverInfo: undefined,

          // 备注和来源
          fileSource: `前端Excel解析-${group.sheetName}`,
          remarks: `Sheet: ${group.sheetName}, 第${batchIndex + 1}/${totalBatches}批, 本批${batchMaterials.length}条`,

          // 物料明细列表
          materialItems: batchMaterials.map((item) => ({
            // 基本信息
            sequenceNumber: item.sequenceNumber,
            materialType: materialType || item.materialType,
            materialName: item.materialName,
            specification: item.specification,
            quantity: item.quantity,
            unit: item.unit,

            // 材质和制造商信息
            materialCategory: item.materialCategory,
            manufacturer: item.manufacturer,
            model: item.model,

            // 备注信息
            remarks1: item.remarks1,
            remarks2: item.remarks2,

            // 重量和体积信息
            unitWeight: item.unitWeight,
            totalWeight: item.totalWeight,
            unitVolume: item.unitVolume,
            totalVolume: item.totalVolume,

            // 包装信息
            packageType: item.packageType,
            packageQuantity: item.packageQuantity,

            // 特殊属性
            isFragile: item.isFragile || false,
            isHazardous: item.isHazardous || false,
            storageRequirement: item.storageRequirement,

            // 来源和位置信息
            fileSource: item.fileSource,
            sheetName: item.sheetName || group.sheetName,
            rowNumber: item.rowNumber,

            // 验证状态
            hasErrors: item.hasErrors || false,
            hasWarnings: item.hasWarnings || false
          }))
        };

        try {
          const response: any = await importParsedMaterialData(importData);
          // 后端返回结构：{ code: 200, data: { success: true, ... } }
          const result = response.data || response;

          if (result.success) {
            sheetSuccessCount += result.successRecords || 0;
            sheetNewProducts += result.newProductRecords || 0;
            sheetMatchedProducts += result.matchedProductRecords || 0;
            console.info(
              `✓ 第${batchIndex + 1}批上传成功: ${result.successRecords}条 ` +
                `(累计成功: ${sheetSuccessCount}/${validMaterials.length})`
            );
          } else {
            sheetFailedCount += result.failedRecords || 0;
            if (result.errors) {
              sheetErrors.push(...result.errors);
            }
            console.warn(`✗ 第${batchIndex + 1}批上传失败: ${result.failedRecords}条`);
          }

          // 【非开发模式】添加小延迟，避免请求过快
          // 【开发模式】由确认框控制节奏，不需要额外延迟
          if (!IS_DEV_MODE && batchIndex < totalBatches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } catch (error: any) {
          sheetFailedCount += batchMaterials.length;
          sheetErrors.push({
            errorMessage: `第${batchIndex + 1}批上传失败: ${error.message || '未知错误'}`
          });
          console.error(`✗ 第${batchIndex + 1}批上传异常:`, error);
        }
      }

      // 汇总该Sheet的结果
      importResults.push({
        sheetName: group.sheetName,
        success: sheetSuccessCount > 0,
        totalRecords: group.materials.length,
        filteredRecords: filteredMaterials.length,
        successRecords: sheetSuccessCount,
        failedRecords: sheetFailedCount,
        newProductRecords: sheetNewProducts,
        matchedProductRecords: sheetMatchedProducts,
        batchCount: totalBatches,
        skipped: false,
        errors: sheetErrors
      });

      totalSuccess += sheetSuccessCount;
      totalFailed += sheetFailedCount;
      totalNewProducts += sheetNewProducts;
      totalMatchedProducts += sheetMatchedProducts;
    }

    // 汇总结果
    const processedSheets = sheetGroups.value.length;
    const validSheets = importResults.filter((r) => !r.skipped).length;
    const totalBatches = importResults.reduce((sum, r) => sum + (r.batchCount || 0), 0);

    // 构建汇总信息
    let summaryText = `共处理 ${processedSheets} 个Sheet(${totalBatches}批次)，有效${validSheets}个，跳过${totalSkipped}条发货清单记录，成功导入 ${totalSuccess} 条物料，失败 ${totalFailed} 条`;

    // 如果用户取消了上传，添加提示
    if (userCancelled) {
      summaryText += `（用户主动停止上传）`;
    }

    importResult.value = {
      success: importResults.some((r) => r.success),
      summary: summaryText,
      totalRecords: materialData.value.length - totalSkipped,
      successRecords: totalSuccess,
      failedRecords: totalFailed,
      skippedRecords: totalSkipped,
      newProductRecords: totalNewProducts,
      matchedProductRecords: totalMatchedProducts,
      sheetResults: importResults,
      errors: importResults.flatMap((r) => r.errors),
      userCancelled: userCancelled // 添加取消标志
    };

    showResult.value = true;

    if (userCancelled) {
      // 用户取消上传
      if (totalSuccess > 0) {
        ElMessage({
          type: 'warning',
          message: `上传已停止！已成功导入 ${totalSuccess} 条数据`,
          duration: 5000,
          showClose: true
        });
      } else {
        ElMessage.info('上传已取消，未导入任何数据');
      }
      // 如果有部分数据导入成功，刷新列表
      if (totalSuccess > 0) {
        loadMaterialList();
      }
    } else if (importResult.value.success) {
      ElMessage.success('数据导入成功!');
      // 清空数据
      materialData.value = [];
      uploadRef.value?.clearFiles();
      // 刷新列表
      loadMaterialList();
    } else {
      ElMessage.error('部分或全部数据导入失败，请查看详细信息');
    }
  } catch (error: any) {
    console.error('数据导入失败:', error);
    ElMessage.error('数据导入失败: ' + (error.message || '未知错误'));
  } finally {
    submitting.value = false;
  }
};

// 使用配置提交数据 - 支持Sheet选择和自定义批次大小
const submitDataWithConfig = async (config: any) => {
  submitting.value = true;

  try {
    const { selectedSheets, batchSizeMap } = config;
    const batchNumber = new Date().getTime().toString();
    const importResults: any[] = [];
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalNewProducts = 0;
    let totalMatchedProducts = 0;
    let totalSkipped = 0;

    // 过滤选中的Sheet
    const selectedGroups = sheetGroups.value.filter(group =>
      selectedSheets.includes(group.sheetName)
    );

    // 计算总数和总批次数
    let totalMaterialCount = 0;
    let totalBatchCount = 0;
    selectedGroups.forEach(group => {
      const batchSize = batchSizeMap[group.sheetName] || 50;
      const validMaterials = group.materials.filter((item) => {
        const itemSheetName = (item.sheetName || '').toLowerCase();
        return !itemSheetName.includes('发货') && !itemSheetName.includes('装车') && !(item as any).imported && !item.hasErrors;
      });
      totalMaterialCount += validMaterials.length;
      totalBatchCount += Math.ceil(validMaterials.length / batchSize);
    });

    // 初始化进度
    importProgress.value = {
      percentage: 0,
      status: '',
      currentSheet: '',
      currentBatch: 0,
      totalBatches: totalBatchCount,
      importedCount: 0,
      totalCount: totalMaterialCount,
      message: '准备开始导入...'
    };

    let currentGlobalBatch = 0; // 全局批次计数器

    for (const group of selectedGroups) {
      // 双重检查：确保不处理发货清单
      const lowerSheetName = group.sheetName.toLowerCase();
      if (lowerSheetName.includes('发货') || lowerSheetName.includes('装车')) {
        console.warn(`跳过发货清单Sheet: ${group.sheetName}`);
        continue;
      }

      const materialType = inferMaterialType(group.sheetName, group.materials[0]);
      const batchSize = batchSizeMap[group.sheetName] || 50; // 使用该Sheet配置的批次大小

      // 过滤：1. 必须是当前Sheet 2. 非发货清单 3. 未导入 4. 无错误
      const validMaterials = group.materials.filter((item) => {
        // 严格检查：必须属于当前Sheet
        if (item.sheetName !== group.sheetName) {
          console.warn(`⚠️ 数据Sheet不匹配: 预期 ${group.sheetName}, 实际 ${item.sheetName}`);
          return false;
        }

        // 基于Sheet名称的额外检查
        const itemSheetName = (item.sheetName || '').toLowerCase();
        if (itemSheetName.includes('发货') || itemSheetName.includes('装车')) {
          console.warn(`⚠️ 排除发货清单数据: ${item.sheetName}`);
          return false; // 排除发货清单数据
        }

        const itemType = item.materialType || materialType;
        const isValid = itemType !== 'SHIPPING_INFO' &&
               !(item as any).imported &&
               !item.hasErrors;

        return isValid;
      });

      if (validMaterials.length === 0) {
        console.info(`Sheet ${group.sheetName} 无待导入数据`);
        continue;
      }

      const totalBatches = Math.ceil(validMaterials.length / batchSize);
      console.info(`Sheet ${group.sheetName}: 共${validMaterials.length}条待导入数据，分${totalBatches}批上传，每批${batchSize}条`);

      let sheetSuccessCount = 0;
      let sheetFailedCount = 0;
      let sheetNewProducts = 0;
      let sheetMatchedProducts = 0;
      const sheetErrors: any[] = [];

      // 分批上传
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, validMaterials.length);
        const batchMaterials = validMaterials.slice(start, end);

        // 更新进度信息
        currentGlobalBatch++;
        importProgress.value.currentSheet = group.sheetName;
        importProgress.value.currentBatch = currentGlobalBatch;
        importProgress.value.message = `正在导入 ${group.sheetName} - 第 ${batchIndex + 1}/${totalBatches} 批，共 ${batchMaterials.length} 条数据...`;

        console.info(`正在上传第 ${batchIndex + 1}/${totalBatches} 批，共${batchMaterials.length}条数据...`);

        // 构造导入数据 - 最后一次安全检查，并只提取物料清单需要的字段
        const safeMaterialItems = batchMaterials
          .filter((item) => {
            const itemSheetName = (item.sheetName || '').toLowerCase();
            const isSafe = !itemSheetName.includes('发货') && !itemSheetName.includes('装车');
            if (!isSafe) {
              console.error(`🚫 最后检查发现发货清单数据！Sheet: ${item.sheetName}, 物料: ${item.materialName}`);
            }
            return isSafe;
          })
          .map((item) => ({
            // 只提取物料清单需要的字段，不包含发货相关字段
            sequenceNumber: item.sequenceNumber,
            materialType: item.materialType || materialType,
            materialName: item.materialName,
            specification: item.specification,
            quantity: item.quantity,
            unit: item.unit,
            materialCategory: item.materialCategory,
            manufacturer: item.manufacturer,
            model: item.model,
            remarks1: item.remarks1,
            remarks2: item.remarks2,
            unitWeight: item.unitWeight,
            totalWeight: item.totalWeight,
            unitVolume: item.unitVolume,
            totalVolume: item.totalVolume,
            packageType: item.packageType,
            packageQuantity: item.packageQuantity,
            isFragile: item.isFragile,
            isHazardous: item.isHazardous,
            storageRequirement: item.storageRequirement,
            fileSource: item.fileSource,
            sheetName: group.sheetName,
            rowNumber: item.rowNumber,
            hasErrors: item.hasErrors || false,
            hasWarnings: item.hasWarnings || false
          }));

        // 如果过滤后没有数据，跳过此批次
        if (safeMaterialItems.length === 0) {
          console.warn(`⚠️ 批次 ${batchIndex + 1} 过滤后无数据，跳过`);
          continue;
        }

        const importData: MaterialImportBo = {
          projectId: props.projectId,
          batchNumber: `${batchNumber}_${group.sheetName}_${batchIndex + 1}`,
          fileSource: '前端Excel解析-物料清单批量导入',
          remarks: `Sheet: ${group.sheetName}, 批次: ${batchIndex + 1}`,
          materialItems: safeMaterialItems
        };

        // 调试日志：确认没有发货清单数据
        console.log(`📦 导入数据检查 - Sheet: ${group.sheetName}, 批次: ${batchIndex + 1}, 数量: ${importData.materialItems.length}`);
        console.log(`📋 完整导入数据结构:`, JSON.parse(JSON.stringify(importData)));
        console.log(`📋 第一条物料数据:`, importData.materialItems[0]);

        try {
          const response: any = await importParsedMaterialData(importData);
          const result = response.data || response;

          if (result && result.success) {
            const batchSuccess = result.successCount || batchMaterials.length;
            sheetSuccessCount += batchSuccess;
            sheetNewProducts += result.newProductCount || 0;
            sheetMatchedProducts += result.matchedProductCount || 0;

            // 标记已导入
            batchMaterials.forEach(material => {
              (material as any).imported = true;
            });

            // 更新进度
            totalSuccess += batchSuccess;
            importProgress.value.importedCount = totalSuccess;
            importProgress.value.percentage = Math.round((currentGlobalBatch / totalBatchCount) * 100);
            importProgress.value.message = `✅ ${group.sheetName} 第${batchIndex + 1}批上传成功，已导入 ${totalSuccess}/${totalMaterialCount} 条`;

            console.info(`✅ Sheet ${group.sheetName} 第${batchIndex + 1}批上传成功: ${batchSuccess}条`);
          } else {
            sheetFailedCount += batchMaterials.length;
            sheetErrors.push(...(result.errors || []));
            console.error(`❌ Sheet ${group.sheetName} 第${batchIndex + 1}批上传失败`);
          }
        } catch (error: any) {
          sheetFailedCount += batchMaterials.length;
          sheetErrors.push({
            batchIndex: batchIndex + 1,
            errorMessage: error.message || '网络请求失败'
          });
          console.error(`❌ Sheet ${group.sheetName} 第${batchIndex + 1}批上传异常:`, error);
        }
      }

      totalSuccess += sheetSuccessCount;
      totalFailed += sheetFailedCount;
      totalNewProducts += sheetNewProducts;
      totalMatchedProducts += sheetMatchedProducts;

      importResults.push({
        sheetName: group.sheetName,
        success: sheetSuccessCount > 0,
        totalRecords: validMaterials.length,
        successRecords: sheetSuccessCount,
        failedRecords: sheetFailedCount,
        newProductRecords: sheetNewProducts,
        matchedProductRecords: sheetMatchedProducts,
        batchCount: totalBatches,
        errors: sheetErrors
      });
    }

    // 设置最终进度
    importProgress.value.percentage = 100;
    importProgress.value.status = totalSuccess > 0 ? 'success' : 'exception';
    importProgress.value.message = totalSuccess > 0
      ? `🎉 导入完成！成功导入 ${totalSuccess} 条，失败 ${totalFailed} 条`
      : '❌ 导入失败，请查看详细信息';

    // 显示导入结果
    importResult.value = {
      success: totalSuccess > 0,
      summary: `成功导入 ${totalSuccess} 条，失败 ${totalFailed} 条`,
      details: {
        totalSuccess,
        totalFailed,
        totalNewProducts,
        totalMatchedProducts,
        totalSkipped
      },
      sheetResults: importResults,
      errors: importResults.flatMap(r => r.errors)
    };
    showResult.value = true;

    // 刷新物料列表
    if (totalSuccess > 0) {
      await loadMaterialList();
      ElMessage.success(`成功导入 ${totalSuccess} 条数据!`);
    } else {
      ElMessage.error('导入失败，请查看详细信息');
    }

  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败');
    // 设置错误状态
    importProgress.value.percentage = 100;
    importProgress.value.status = 'exception';
    importProgress.value.message = '❌ 导入过程中发生错误';
  } finally {
    submitting.value = false;
  }
};

// 根据Sheet名称和数据推断物料类型
const inferMaterialType = (sheetName: string, sampleMaterial: any): string => {
  const name = sheetName.toLowerCase();

  // 根据Sheet名称判断
  if (name.includes('电控')) return 'ELECTRICAL';
  if (name.includes('机械')) return 'MECHANICAL';
  if (name.includes('发货') || name.includes('装车')) return 'SHIPPING_INFO';

  // 如果无法从Sheet名称判断，使用原有的物料类型
  return sampleMaterial?.materialType || 'GENERAL';
};

// 下载模板
const downloadTemplate = () => {
  try {
    const wb = ExcelParser.createTemplate();
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, '物料清单导入模板.xlsx');

    ElMessage.success('模板下载成功');
  } catch (error: any) {
    console.error('模板下载失败:', error);
    ElMessage.error('模板下载失败: ' + error.message);
  }
};

// 导出数据
const handleExport = async () => {
  try {
    await exportMaterialList(listQuery.value);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

// 删除物料
const handleDelete = async (row: MaterialVO) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除物料"${row.materialName}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    if (row.id) {
      await deleteMaterial(row.id);
      ElMessage.success('删除成功');
      loadMaterialList();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 获取物料类型标签样式
const getMaterialTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    GENERAL: '',
    MECHANICAL: 'success',
    ELECTRICAL: 'warning',
    SHIPPING_INFO: 'info'
  };
  return tagMap[type] || '';
};

// 获取物料类型名称
const getMaterialTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    GENERAL: '通用物料',
    MECHANICAL: '机械设备',
    ELECTRICAL: '电控设备',
    SHIPPING_INFO: '发货信息'
  };
  return nameMap[type] || '未知类型';
};

// 获取行样式
const getRowClassName = ({ row }: { row: any }) => {
  if (row.hasErrors) return 'error-row';
  if (row.hasWarnings) return 'warning-row';
  if ((row as any).imported) return 'imported-row';
  return '';
};

// 获取Sheet结果标签类型
const getSheetResultTag = (sheetName: string) => {
  const name = sheetName.toLowerCase();
  if (name.includes('电控')) return 'warning';
  if (name.includes('机械')) return 'success';
  if (name.includes('发货') || name.includes('装车')) return 'info';
  return '';
};
</script>

<style scoped lang="scss">
.material-detail {
  .operation-card,
  .progress-card,
  .preview-card,
  .list-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .progress-card {
    text-align: center;
  }

  .progress-text {
    margin-top: 10px;
    color: #666;
  }

  .percentage-value {
    font-weight: bold;
  }

  .statistics-bar {
    margin-bottom: 15px;

    .el-tag {
      margin-right: 10px;
    }
  }

  .error-input {
    :deep(.el-input__wrapper) {
      border-color: #f56c6c !important;
    }
  }

  .error-text {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 2px;
  }

  :deep(.error-row) {
    background-color: #fef0f0;
  }

  :deep(.warning-row) {
    background-color: #fdf6ec;
  }

  :deep(.imported-row) {
    background-color: #f0f9ff;
    opacity: 0.7;

    td {
      color: #909399 !important;
    }
  }

  .result-stats {
    margin: 20px 0;
  }

  .sheet-results {
    margin-top: 20px;
    text-align: left;

    h4 {
      margin-bottom: 10px;
      font-size: 14px;
      color: #303133;
      font-weight: 600;
    }

    :deep(.el-table) {
      font-size: 13px;
    }
  }

  .error-list {
    margin-top: 20px;
    text-align: left;

    h4 {
      margin-bottom: 10px;
      font-size: 14px;
      color: #303133;
    }
  }

  .error-item {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #fef0f0;
    border-radius: 4px;
    font-size: 13px;
  }

  // Sheet分组标签页样式
  .sheet-tabs {
    margin-top: 15px;
    position: relative;
    min-height: 300px;

    // 加载状态下禁用指针事件样式优化
    &:has(.el-loading-mask) {
      :deep(.el-tabs__item) {
        cursor: not-allowed;
        opacity: 0.6;

        &:not(.is-active) {
          pointer-events: none;
        }
      }
    }

    :deep(.el-tabs__header) {
      margin-bottom: 15px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      font-weight: 500;
    }

    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }

  .imported-sheet-tabs {
    position: relative;
    min-height: 300px;

    // 加载状态下禁用指针事件样式优化
    &:has(.el-loading-mask) {
      :deep(.el-tabs__item) {
        cursor: not-allowed;
        opacity: 0.6;

        &:not(.is-active) {
          pointer-events: none;
        }
      }
    }

    :deep(.el-tabs__header) {
      margin-bottom: 15px;
      background-color: #f5f7fa;
      padding: 10px;
      border-radius: 4px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 8px 20px;

      &.is-active {
        background-color: #fff;
      }
    }
  }
}
</style>
