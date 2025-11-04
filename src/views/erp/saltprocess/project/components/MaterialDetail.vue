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
          <div>
            <span>数据预览 (共{{ totalCountExcludingShipping }}条物料记录)</span>
            <el-tag type="info" size="small" style="margin-left: 10px;">导入后会自动合并相同物料的数量</el-tag>
          </div>
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
        <el-tag type="info" effect="dark">已导入: {{ importedCount }}</el-tag>
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

    <!-- 物料汇总（不区分批次的汇总数据） -->
    <el-card shadow="never" class="list-card">
      <template #header>
        <div class="card-header">
          <div>
            <span>物料汇总统计</span>
            <el-tag type="success" size="small" style="margin-left: 10px;">不区分批次，相同物料自动合并</el-tag>
          </div>
          <el-button icon="Refresh" @click="handleRefreshMaterialList">刷新</el-button>
        </div>
      </template>

      <!-- 按Sheet分组展示已导入的物料 - 使用项目的sheetNames -->
      <el-tabs
        v-if="sheetNames.length > 0"
        v-model="activeImportedSheetTab"
        type="border-card"
        class="imported-sheet-tabs"
        @tab-change="handleImportedTabChange"
        v-loading="loading"
        element-loading-text="加载中..."
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-tab-pane
          v-for="sheetName in sheetNames"
          :key="sheetName"
          :label="`${sheetName} (${getSheetMaterialCount(sheetName)})`"
          :name="sheetName"
          :disabled="loading"
          lazy
        >
          <el-table v-if="activeImportedSheetTab === sheetName" :data="materialList" style="width: 100%" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="materialCode" label="物料编码" align="center" width="180" />
            <el-table-column prop="materialName" label="物料名称" align="center" width="150" show-overflow-tooltip />
            <el-table-column prop="specification" label="规格型号" align="center" width="120" show-overflow-tooltip />
            <el-table-column prop="quantity" label="数量" align="center" width="80" />
            <el-table-column prop="unit" label="单位" align="center" width="80" />
            <el-table-column prop="totalWeight" label="总重(kg)" align="center" width="100" />
            <el-table-column prop="manufacturer" label="制造商" align="center" width="120" show-overflow-tooltip />
            <el-table-column prop="materialType" label="物料类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getMaterialTypeTag(row.materialType)" size="small">
                  {{ getMaterialTypeName(row.materialType) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 无数据时显示 -->
      <el-empty v-else description="暂无物料数据，请先导入物料清单" />

      <!-- 分页 -->
      <pagination
        v-if="sheetNames.length > 0 && listTotal > 0"
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
    <el-dialog v-model="showResult" title="导入结果" width="900px">
      <div v-if="importResult">
        <!-- 导入结果标题 -->
        <el-result
          :icon="importResult.success ? 'success' : 'error'"
          :title="importResult.success ? '导入成功' : '导入失败'"
          :sub-title="importResult.summary"
        />

        <!-- 详细内容 -->
        <!-- 总体统计 -->
        <div class="result-stats">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-statistic title="总记录数" :value="importResult.totalRecords || importResult.totalUploadedRecords || 0">
                <template #suffix>条</template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="物料种类数" :value="importResult.uniqueMaterialCount || 0" class="primary-stat">
                <template #suffix>种</template>
              </el-statistic>
            </el-col>
            <el-col :span="6">
              <el-statistic title="新建产品" :value="importResult.newProductRecords || 0" class="success-stat">
                <template #suffix>个</template>
              </el-statistic>
            </el-col>
            <!-- 匹配产品已隐藏 -->
            <!-- <el-col :span="6">
              <el-statistic title="匹配产品" :value="importResult.matchedProductRecords || 0" class="info-stat">
                <template #suffix>个</template>
              </el-statistic>
            </el-col> -->
          </el-row>
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
                <el-tag v-if="row.batchCount > 0" type="info" size="small">
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
            <!-- 匹配产品列已隐藏 -->
            <!-- <el-table-column prop="matchedProductRecords" label="匹配产品" width="90" align="center" /> -->
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
          <h4>
            <el-icon style="vertical-align: middle; margin-right: 5px;"><CircleCloseFilled /></el-icon>
            错误信息（共 {{ importResult.errors.length }} 条）：
          </h4>
          <el-scrollbar max-height="200px">
            <div v-for="(error, index) in importResult.errors" :key="index" class="error-item">
              <el-tag type="danger" size="small" v-if="error.rowNumber">第{{ error.rowNumber }}行</el-tag>
              <span v-if="error.materialName">{{ error.materialName }}: </span>
              {{ error.errorMessage }}
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="MaterialDetail" lang="ts">
import { ref, computed, watch, onMounted, nextTick, shallowRef } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Close, CircleCloseFilled } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExcelParser, MaterialDataValidator } from '@/utils/excel-parser';
import {
  listMaterialSummary,
  importParsedMaterialData,
  exportMaterialList,
  createUploadBatch,
  getBatchStatistics,
  completeBatch
} from '@/api/erp/saltprocess/material';
import type { MaterialImportBo, MaterialSummaryQuery, MaterialSummaryVO } from '@/api/erp/saltprocess/material/types';
import MaterialImportConfigDialog from './MaterialImportConfigDialog.vue';

// Props
interface Props {
  projectId: string;
  sheetNames?: string[]; // 项目的工作表名称列表
}

const props = withDefaults(defineProps<Props>(), {
  sheetNames: () => []
});

// Emits
const emit = defineEmits<{
  'import-success': []; // 导入成功事件
  'refresh-project': []; // 刷新项目详情事件
}>();

// 响应式数据
const uploadRef = ref();
const loading = ref(false);
// 使用 shallowRef 减少大数组的深层响应式开销
const materialData = shallowRef<any[]>([]);

// 监听 props.sheetNames 的变化
// 添加防抖机制，避免短时间内重复调用
let sheetNamesWatchTimer: ReturnType<typeof setTimeout> | null = null;
watch(() => props.sheetNames, (newSheetNames, oldSheetNames) => {
  console.log('📋 sheetNames发生变化:', {
    old: oldSheetNames,
    new: newSheetNames
  });

  // 清除之前的定时器
  if (sheetNamesWatchTimer) {
    clearTimeout(sheetNamesWatchTimer);
  }

  // 如果之前没有sheetNames，现在有了，自动加载第一个sheet的数据
  if ((!oldSheetNames || oldSheetNames.length === 0) && newSheetNames && newSheetNames.length > 0) {
    console.log('🔄 检测到sheetNames从空变为有数据，延迟100ms后加载第一个sheet');
    // 使用防抖，避免在短时间内多次触发
    sheetNamesWatchTimer = setTimeout(() => {
      activeImportedSheetTab.value = newSheetNames[0];
      loadMaterialList(newSheetNames[0]);
      sheetNamesWatchTimer = null;
    }, 100);
  }
}, { immediate: false, deep: true });
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
const sheetSwitching = ref(false); // 标签切换中

// 移除前端分页相关变量（改用后端分页）

// 物料列表 - 使用 shallowRef，改为汇总数据
const materialList = shallowRef<MaterialSummaryVO[]>([]);
const listTotal = ref(0);
const listQuery = ref<MaterialSummaryQuery>({
  pageNum: 1,
  pageSize: 50, // 使用后端分页，每页50条
  projectId: props.projectId // 保持字符串类型，避免大数精度丢失
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

// const warningCount = computed(() => {
//   return materialData.value.filter(item => {
//     const sheetName = (item.sheetName || '').toLowerCase();
//     const isShippingList = sheetName.includes('发货') || sheetName.includes('装车');
//     return item.hasWarnings && !isShippingList;
//   }).length;
// });

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

// importedSheetGroups 已移除，改用 sheetNames prop 和后端分页

// 监听 sheetNames 变化，初始化 activeImportedSheetTab
watch(
  () => props.sheetNames,
  (newSheetNames) => {
    if (newSheetNames && newSheetNames.length > 0) {
      // 如果没有激活的tab或激活的tab不存在，设置第一个
      if (!activeImportedSheetTab.value || !newSheetNames.includes(activeImportedSheetTab.value)) {
        activeImportedSheetTab.value = newSheetNames[0];
      }
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

// activeImportedSheetTab 的变化由 handleImportedTabChange 处理，不需要额外的 watch

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

/**
 * 初始化数据加载（由父组件调用）
 * 当切换到物料明细标签时调用此方法
 */
const initializeData = () => {
  console.log('🔧 初始化物料明细数据');
  console.log('📋 当前props.sheetNames:', props.sheetNames);
  console.log('📋 sheetNames长度:', props.sheetNames?.length);
  console.log('📋 sheetNames是否为数组:', Array.isArray(props.sheetNames));

  // 如果有 sheetNames，使用第一个 sheetName 加载数据
  if (props.sheetNames && props.sheetNames.length > 0) {
    console.log('✅ 有sheetNames，加载第一个sheet:', props.sheetNames[0]);
    activeImportedSheetTab.value = props.sheetNames[0];
    loadMaterialList(props.sheetNames[0]);
  } else {
    console.log('⚠️ 暂无物料清单工作表，等待导入数据或父组件传递sheetNames');
  }
};

/**
 * 获取指定 sheet 的物料数量（用于标签显示）
 * @param sheetName 工作表名称
 */
const getSheetMaterialCount = (sheetName: string): number => {
  // 如果当前激活的标签就是这个 sheet，返回当前的 total
  if (activeImportedSheetTab.value === sheetName) {
    return listTotal.value;
  }
  // 否则返回 0 或者可以考虑缓存各个 sheet 的数量
  return 0;
};

/**
 * 刷新当前选中的物料列表
 */
const handleRefreshMaterialList = () => {
  if (activeImportedSheetTab.value) {
    listQuery.value.pageNum = 1; // 重置到第一页
    loadMaterialList(activeImportedSheetTab.value);
  } else {
    initializeData();
  }
};


// 暴露方法给父组件
defineExpose({
  initializeData
});

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
  if (loading.value) return; // 防止重复切换

  // 先更新UI状态，让标签立即切换
  activeImportedSheetTab.value = tabName;

  // 重置分页
  listQuery.value.pageNum = 1;

  // 调用接口，传入选中的 sheetName
  await loadMaterialList(tabName);
};

// 生命周期
onMounted(() => {
  // 移除自动加载，改为由父组件在标签切换时触发
  console.log('🎨 MaterialDetail组件已挂载');
  console.log('📋 挂载时的props.sheetNames:', props.sheetNames);
  console.log('📋 挂载时的props.projectId:', props.projectId);
});

// 方法
/**
 * 加载物料汇总列表
 * @param sheetName 可选的工作表名称，用于过滤数据
 */
// 防止重复调用的变量
let lastLoadParams: string | null = null;
const loadMaterialList = async (sheetName?: string) => {
  // 防止重复调用：如果正在加载相同的数据，则跳过
  const currentParams = JSON.stringify({
    sheetName,
    pageNum: listQuery.value.pageNum,
    pageSize: listQuery.value.pageSize,
    projectId: props.projectId
  });

  if (loading.value && lastLoadParams === currentParams) {
    console.log('⚠️ 跳过重复调用 loadMaterialList，参数相同且正在加载中:', currentParams);
    return;
  }

  lastLoadParams = currentParams;
  loading.value = true;

  try {
    // 构建查询参数，如果提供了 sheetName 则添加到查询条件中
    const query: MaterialSummaryQuery = {
      ...listQuery.value,
      sheetName: sheetName || undefined
    };

    const response: any = await listMaterialSummary(query);

    // 调试日志 - 查看物料汇总API响应
    console.log('=== 物料汇总API响应 ===');
    console.log('查询参数:', query);
    console.log('完整响应:', response);
    console.log('响应数据:', response.data);
    console.log('rows数据:', response.data?.rows || response.rows);
    console.log('total:', response.data?.total || response.total);

    // 兼容两种数据结构
    const data = response.data || response;
    materialList.value = data.rows || [];
    listTotal.value = data.total || 0;

    console.log('最终汇总列表:', materialList.value);
    console.log('数据条数:', materialList.value.length);
  } catch (error) {
    console.error('获取物料汇总列表失败:', error);
    ElMessage.error('获取物料汇总列表失败');
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
      ElMessage.success(`成功解析 ${materialCount} 条物料记录（已自动过滤 ${shippingCount} 条发货清单），导入后会自动合并相同物料的数量`);
    } else {
      ElMessage.success(`成功解析 ${materialCount} 条物料记录，导入后会自动合并相同物料的数量`);
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
  if (activeImportedSheetTab.value) {
    loadMaterialList(activeImportedSheetTab.value);
  }
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

  try {
    await submitDataWithConfig(processConfig);
  } finally {
    // 导入完成后，设置状态并关闭弹窗
    importing.value = false;
    importConfigDialog.value = false;
  }
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
// 注意：此函数已废弃，当前使用 submitDataWithConfig
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        emit('import-success');
        emit('refresh-project'); // 触发父组件刷新，会自动更新sheetNames并加载列表
      }
    } else if (importResult.value.success) {
      ElMessage.success('数据导入成功！相同物料已自动合并数量');
      // 清空数据
      materialData.value = [];
      uploadRef.value?.clearFiles();
      // 刷新列表
      emit('import-success');
      emit('refresh-project'); // 触发父组件刷新，会自动更新sheetNames并加载列表
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

// 使用配置提交数据 - 支持Sheet选择和自定义批次大小（三步法）
const submitDataWithConfig = async (config: any) => {
  submitting.value = true;
  let preUploadId: number | null = null; // ⭐ 预上传ID

  try {
    const { selectedSheets, batchSizeMap } = config;
    const batchNumber = new Date().getTime().toString();
    const importResults: any[] = [];
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    // 过滤选中的Sheet
    const selectedGroups = sheetGroups.value.filter(group =>
      selectedSheets.includes(group.sheetName)
    );

    // 计算总数和总批次数
    let totalMaterialCount = 0;
    let totalBatchCount = 0;
    // 使用 Map 收集和合并所有批次的重复物料，key 为物料的唯一标识（materialName + specification）
    const existedItemsMap = new Map<string, any>();
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

    // ⭐⭐⭐ 步骤1：获取预上传ID ⭐⭐⭐
    try {
      importProgress.value.message = '⭐ 步骤1：正在获取预上传ID...';
      const batchResponse = await createUploadBatch({
        batchName: `物料导入-${new Date().toLocaleString()}`,
        projectId: props.projectId,
        projectName: undefined,
        responsiblePerson: undefined,
        remarks: `分批导入 ${totalMaterialCount} 条物料，共 ${totalBatchCount} 批次`
      });
      preUploadId = batchResponse.data;
      console.log('✅ 步骤1完成 - 预上传ID:', preUploadId);
      importProgress.value.message = `✅ 步骤1完成 - 预上传ID: ${preUploadId}`;
      // 显示一下，让用户看到
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('❌ 获取预上传ID失败:', error);
      ElMessage.error('获取预上传ID失败: ' + (error.message || '未知错误'));
      throw error;
    }

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

        // ⭐⭐⭐ 步骤2：分批上传物料（携带预上传ID） ⭐⭐⭐
        const importData: MaterialImportBo = {
          uploadBatchId: preUploadId!, // ⭐ 传入预上传ID
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

          // 🔍 详细调试日志：查看后端返回的完整数据结构
          console.log('🔍 后端返回的完整响应:', {
            success: result.success,
            successCount: result.successCount,
            skippedRecords: result.skippedRecords,
            existedItems: result.existedItems,
            duplicateItems: result.duplicateItems,
            newProductRecords: result.newProductRecords,
            matchedProductRecords: result.matchedProductRecords,
            uniqueMaterialCount: result.uniqueMaterialCount,
            fullResult: result
          });

          if (result && result.success) {
            const batchSuccess = result.successCount || batchMaterials.length;
            sheetSuccessCount += batchSuccess;

            // 注意：单次上传返回的统计是累积的，但完整统计由步骤3获取
            console.log(`📊 本批次上传成功 - 成功: ${batchSuccess}条`);

            // 收集重复物料信息（优先使用新结构 existedItems）
            if (result.existedItems && result.existedItems.length > 0) {
              console.log('✅ 发现 existedItems 数据:', result.existedItems);
              // v2.0 新结构：按已存在物料分组
              result.existedItems.forEach((existedItemVo: any) => {
                // 后端返回的数据结构：existedItem 包含 duplicateItems
                const existedItemRaw = existedItemVo.existedItem;

                // 提取 duplicateItems（可能在 existedItem 里面，也可能在外面）
                const duplicateItems = existedItemRaw.duplicateItems || existedItemVo.duplicateItems || [];

                // 构建标准的 existedItem（不包含 duplicateItems）
                const existedItem = {
                  id: existedItemRaw.id,
                  materialName: existedItemRaw.materialName,
                  specification: existedItemRaw.specification,
                  quantity: existedItemRaw.quantity,
                  unit: existedItemRaw.unit,
                  sheetName: existedItemRaw.sheetName,
                  itemCode: existedItemRaw.itemCode,
                  equipmentType: existedItemRaw.equipmentType
                };

                const materialKey = `${existedItem.materialName}_${existedItem.specification || ''}`;

                if (existedItemsMap.has(materialKey)) {
                  // 合并重复项到现有物料
                  const existing = existedItemsMap.get(materialKey);
                  existing.duplicateItems.push(...duplicateItems);
                } else {
                  // 新增物料
                  existedItemsMap.set(materialKey, {
                    existedItem: existedItem,
                    duplicateItems: [...duplicateItems]
                  });
                }
              });
            } else if (result.duplicateItems && result.duplicateItems.length > 0) {
              console.log('⚠️ 使用降级处理：duplicateItems 扁平结构', result.duplicateItems);
              // v1.0 兼容：扁平结构，需要手动分组（降级处理）
              result.duplicateItems.forEach((duplicateItem: any) => {
                const materialKey = `${duplicateItem.materialName}_${duplicateItem.specification || ''}`;
                if (!existedItemsMap.has(materialKey)) {
                  existedItemsMap.set(materialKey, {
                    existedItem: {
                      materialName: duplicateItem.materialName,
                      specification: duplicateItem.specification,
                      quantity: 0, // 旧结构没有数据库数量信息
                      unit: duplicateItem.unit
                    },
                    duplicateItems: []
                  });
                }
                existedItemsMap.get(materialKey).duplicateItems.push(duplicateItem);
              });
            }

            // 统计跳过数量
            if (result.skippedRecords && result.skippedRecords > 0) {
              totalSkipped += result.skippedRecords;
              console.log(`📊 本批次跳过 ${result.skippedRecords} 条，累计跳过 ${totalSkipped} 条`);
            }

            // 🔍 检查是否有重复数据但没有详细信息的情况
            if (result.skippedRecords > 0 && !result.existedItems && !result.duplicateItems) {
              console.warn('⚠️ 警告：有跳过记录但没有 existedItems 或 duplicateItems 数据！');
              console.warn('后端返回:', result);
            }

            // 标记已导入
            batchMaterials.forEach(material => {
              (material as any).imported = true;
            });

            // 更新进度 - 使用 sheetSuccessCount 而不是直接累加到 totalSuccess
            importProgress.value.importedCount += batchSuccess;
            importProgress.value.percentage = Math.round((currentGlobalBatch / totalBatchCount) * 100);
            importProgress.value.message = `✅ ${group.sheetName} 第${batchIndex + 1}批上传成功，已导入 ${importProgress.value.importedCount}/${totalMaterialCount} 条`;

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

      // 累加每个Sheet的统计结果到总计
      totalSuccess += sheetSuccessCount;
      totalFailed += sheetFailedCount;
      console.log(`📊 Sheet累加完成 [${group.sheetName}] - 成功: ${sheetSuccessCount}, 失败: ${sheetFailedCount}`);

      importResults.push({
        sheetName: group.sheetName,
        success: sheetSuccessCount > 0,
        totalRecords: validMaterials.length,
        successRecords: sheetSuccessCount,
        failedRecords: sheetFailedCount,
        newProductRecords: 0, // 由步骤3统计接口获取完整数据
        matchedProductRecords: 0, // 由步骤3统计接口获取完整数据
        batchCount: totalBatches,
        errors: sheetErrors
      });
    }

    // 设置最终进度
    importProgress.value.percentage = 100;
    importProgress.value.status = totalSuccess > 0 ? 'success' : 'exception';
    importProgress.value.message = totalSuccess > 0
      ? `🎉 步骤2完成！成功导入 ${totalSuccess} 条，失败 ${totalFailed} 条`
      : '❌ 导入失败，请查看详细信息';

    // ⭐⭐⭐ 步骤3：获取统计数据（使用预上传ID） ⭐⭐⭐
    let batchStatistics: any = null;
    if (preUploadId && totalSuccess > 0) {
      try {
        importProgress.value.message = '⭐ 步骤3：正在获取完整批次统计数据...';
        await new Promise(resolve => setTimeout(resolve, 300));

        const statisticsResponse = await getBatchStatistics(preUploadId);
        batchStatistics = statisticsResponse.data;
        console.log('✅ 步骤3完成 - 完整批次统计:', JSON.stringify(batchStatistics, null, 2));
        console.log('📊 关键数据提取:', {
          totalUploadedRecords: batchStatistics?.totalUploadedRecords,
          uniqueMaterialCount: batchStatistics?.uniqueMaterialCount,
          newMaterialRecords: batchStatistics?.newMaterialRecords,
          matchedMaterialRecords: batchStatistics?.matchedMaterialRecords,
          totalWeight: batchStatistics?.totalWeight,
          totalVolume: batchStatistics?.totalVolume,
          fileSourceStats: batchStatistics?.fileSourceStats
        });

        importProgress.value.message = `✅ 步骤3完成 - 获取到完整统计数据`;
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error('⚠️ 获取批次统计失败（不影响导入结果）:', error);
        ElMessage.warning('获取批次统计失败，将使用上传返回的基础数据');
        // 不抛出错误，继续显示结果
      }
    }

    console.log('🔍 最终batchStatistics值:', batchStatistics);
    console.log('🔍 batchStatistics是否存在:', !!batchStatistics);
    if (batchStatistics) {
      console.log('🔍 batchStatistics.newMaterialRecords:', batchStatistics.newMaterialRecords);
      console.log('🔍 batchStatistics.matchedMaterialRecords:', batchStatistics.matchedMaterialRecords);
    }

    // 转换 Map 为数组
    const existedItemsList = Array.from(existedItemsMap.values());

    // 🔍 调试日志：检查重复数据
    console.log('📊 重复数据统计:', {
      totalSkipped,
      existedItemsMapSize: existedItemsMap.size,
      existedItemsListLength: existedItemsList.length,
      existedItemsList: existedItemsList
    });

    // ⭐ 使用步骤3统计接口的数据构建Sheet导入详情
    let finalSheetResults = importResults;
    if (batchStatistics && batchStatistics.fileSourceStats && batchStatistics.fileSourceStats.length > 0) {
      // 使用步骤3返回的统计数据
      finalSheetResults = batchStatistics.fileSourceStats.map((stat: any) => {
        // 查找对应的原始结果（如果有）
        const originalResult = importResults.find((r: any) => r.sheetName === stat.sheetName);

        return {
          sheetName: stat.sheetName,
          fileName: stat.fileName,
          totalRecords: stat.recordCount, // ⭐ 使用统计接口的记录数
          successRecords: totalSuccess, // 所有批次成功数
          failedRecords: totalFailed,
          newProductRecords: batchStatistics.newMaterialRecords || 0, // ⭐ 使用统计接口的新建数
          matchedProductRecords: batchStatistics.matchedMaterialRecords || 0, // ⭐ 使用统计接口的匹配数
          batchCount: originalResult?.batchCount || 0,
          success: totalSuccess > 0,
          errors: originalResult?.errors || []
        };
      });
    }

    // 显示导入结果（优先使用步骤3返回的完整统计数据）
    const newProductRecords = batchStatistics?.newMaterialRecords || 0;
    const matchedProductRecords = batchStatistics?.matchedMaterialRecords || 0;

    console.log('🔍 准备赋值给importResult:', {
      'batchStatistics?.newMaterialRecords': batchStatistics?.newMaterialRecords,
      'batchStatistics?.matchedMaterialRecords': batchStatistics?.matchedMaterialRecords,
      'newProductRecords': newProductRecords,
      'matchedProductRecords': matchedProductRecords
    });

    importResult.value = {
      success: totalSuccess > 0,
      summary: totalSkipped > 0
        ? `成功导入 ${totalSuccess} 条，失败 ${totalFailed} 条，重复跳过 ${totalSkipped} 条`
        : `成功导入 ${totalSuccess} 条，失败 ${totalFailed} 条`,
      totalRecords: batchStatistics?.totalUploadedRecords || (totalSuccess + totalFailed), // ⭐ 优先使用步骤3的统计
      successRecords: totalSuccess,
      failedRecords: totalFailed,
      skippedRecords: totalSkipped,
      uniqueMaterialCount: batchStatistics?.uniqueMaterialCount || 0, // ⭐ 使用步骤3的完整统计
      newProductRecords: newProductRecords, // ⭐ 使用步骤3的完整统计
      matchedProductRecords: matchedProductRecords, // ⭐ 使用步骤3的完整统计
      totalWeight: batchStatistics?.totalWeight, // ⭐ 额外的统计数据
      totalVolume: batchStatistics?.totalVolume, // ⭐ 额外的统计数据
      sheetResults: finalSheetResults, // ⭐ 使用步骤3构建的Sheet结果
      errors: importResults.flatMap(r => r.errors),
      existedItems: existedItemsList, // 已存在物料信息（v2.0新结构），不再过滤空数组
      batchStatistics: batchStatistics // ⭐ 完整批次统计数据
    };

    console.log('🔍 importResult.value最终值:', {
      newProductRecords: importResult.value.newProductRecords,
      matchedProductRecords: importResult.value.matchedProductRecords,
      uniqueMaterialCount: importResult.value.uniqueMaterialCount
    });

    console.log('📋 最终导入结果:', importResult.value);
    console.log('🔍 importResult.value.skippedRecords:', importResult.value.skippedRecords);
    console.log('🔍 importResult.value.existedItems:', importResult.value.existedItems);
    console.log('🔍 importResult.value.existedItems.length:', importResult.value.existedItems?.length);
    console.log('✅ 产品统计（步骤3完整批次统计） - 总记录:', importResult.value.totalRecords, '| 物料种类:', importResult.value.uniqueMaterialCount, '| 新建:', importResult.value.newProductRecords, '| 匹配:', importResult.value.matchedProductRecords);

    showResult.value = true;

    // 使用 nextTick 确保 DOM 更新后再检查
    await nextTick();
    console.log('🔍 DOM 更新后检查: showResult.value =', showResult.value);
    console.log('🔍 DOM 更新后检查: importResult.value =', importResult.value);

    // （可选）完成批次上传
    if (preUploadId && totalSuccess > 0) {
      try {
        await completeBatch(preUploadId);
        console.log('✅ 批次已标记为完成');
      } catch (error: any) {
        console.error('⚠️ 标记批次完成失败（不影响导入结果）:', error);
      }
    }

    // 导入完成处理
    if (totalSuccess > 0) {
      // ⭐ 标记所有已上传的数据为"已导入"状态
      selectedGroups.forEach(group => {
        const validMaterials = group.materials.filter((item) => {
          const itemSheetName = (item.sheetName || '').toLowerCase();
          return !itemSheetName.includes('发货') && !itemSheetName.includes('装车') && !item.hasErrors;
        });
        validMaterials.forEach(material => {
          (material as any).imported = true;
        });
      });

      // 触发响应式更新
      materialData.value = [...materialData.value];
      console.log('✅ 已标记所有导入数据的状态，已导入数量:', importedCount.value);


      // ⭐ 发送导入成功事件，通知父组件刷新项目详情
      emit('import-success');
      emit('refresh-project');

      // ⚠️ 不需要手动调用 loadMaterialList
      // 因为：
      // 1. refresh-project 事件会触发父组件更新 projectData.sheetNames
      // 2. props.sheetNames 更新会触发子组件的 watch
      // 3. watch 会自动调用 loadMaterialList
      // 避免重复调用接口

      ElMessage.success(`✅ 三步法导入完成！成功导入 ${totalSuccess} 条数据，${importResult.value.uniqueMaterialCount} 种物料`);
    } else {
      ElMessage.error('导入失败，请查看详细信息');
    }

  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
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
    // 构建导出参数，确保 projectId 为字符串类型
    const exportQuery = {
      projectId: String(listQuery.value.projectId),
      sheetName: listQuery.value.sheetName,
      pageNum: listQuery.value.pageNum,
      pageSize: listQuery.value.pageSize
    };
    await exportMaterialList(exportQuery);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
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
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 8px;

    :deep(.el-statistic) {
      text-align: center;

      .el-statistic__head {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      .el-statistic__content {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }
    }

    // 不同类型的统计数据颜色
    :deep(.success-stat .el-statistic__content) {
      color: #67c23a;
    }

    :deep(.error-stat .el-statistic__content) {
      color: #f56c6c;
    }

    :deep(.warning-stat .el-statistic__content) {
      color: #e6a23c;
    }

    :deep(.primary-stat .el-statistic__content) {
      color: #409eff;
    }

    :deep(.info-stat .el-statistic__content) {
      color: #909399;
    }
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

  .duplicate-list {
    margin-top: 20px;
    text-align: left;

    h4 {
      margin-bottom: 10px;
      font-size: 14px;
      color: #e6a23c;
      font-weight: 600;
      display: flex;
      align-items: center;
    }

    :deep(.el-table) {
      font-size: 13px;
    }

    .existed-item-group {
      margin-bottom: 20px;
      padding: 12px;
      background-color: #fafafa;
      border-radius: 4px;
      border: 1px solid #e4e7ed;

      &:last-child {
        margin-bottom: 0;
      }

      .existed-item-header {
        padding: 10px;
        background-color: #f0f9ff;
        border-radius: 4px;
        border-left: 4px solid #409eff;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;

        .material-name {
          font-size: 14px;
          font-weight: 600;
      color: #303133;
        }

        .material-spec {
          font-size: 13px;
          color: #606266;
        }

        .material-info {
          font-size: 12px;
          color: #909399;
          margin-left: 8px;
        }

        .duplicate-count {
          font-size: 12px;
          color: #e6a23c;
          font-weight: 600;
          margin-left: 8px;
        }
      }

      .duplicate-items-list {
        margin-top: 12px;

        .accumulate-tip {
          margin: 12px 0 0 40px;
          padding: 10px 12px;
          background-color: #f4f4f5;
          border-left: 3px solid #909399;
          border-radius: 4px;
          font-size: 13px;
          color: #606266;
          display: flex;
          align-items: flex-start;
          gap: 8px;

          .el-icon {
            margin-top: 2px;
            color: #909399;
          }

          strong {
            color: #409eff;
            font-weight: 600;
          }
        }
      }
    }
  }

  .error-list {
    margin-top: 20px;
    text-align: left;

    h4 {
      margin-bottom: 10px;
      font-size: 14px;
      color: #f56c6c;
      font-weight: 600;
      display: flex;
      align-items: center;
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
