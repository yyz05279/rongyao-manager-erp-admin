<template>
  <el-dialog
    v-model="dialogVisible"
    title="物料导入配置"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-config-container">
      <!-- 导入说明 -->
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        <template #default>
          <p>• 可以选择要导入的Sheet和每批次导入数量</p>
          <p>• 建议每批导入20-100条数据，避免单次数据量过大</p>
          <p>• 已导入的数据将标记为"已导入"状态，不会重复导入</p>
        </template>
      </el-alert>

      <!-- 全局配置 -->
      <el-card shadow="never" style="margin-bottom: 20px;">
        <template #header>
          <span class="card-title">全局配置</span>
        </template>
        <el-form label-width="120px">
          <el-form-item label="每批导入数量">
            <el-input-number
              v-model="globalBatchSize"
              :min="20"
              :max="100"
              :step="10"
              controls-position="right"
            />
            <span style="margin-left: 10px; color: #909399;">条/批次（将应用到所有Sheet）</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="applyGlobalConfig">
              应用到所有Sheet
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 导入进度 -->
      <el-card v-if="importing" shadow="never" style="margin-bottom: 20px;">
        <template #header>
          <span class="card-title">导入进度</span>
        </template>
        <div class="import-progress">
          <el-progress
            :percentage="progressPercentage"
            :status="progressStatus"
            :stroke-width="20"
          >
            <template #default="{ percentage }">
              <span class="percentage-text">{{ percentage }}%</span>
            </template>
          </el-progress>
          <div class="progress-info">
            <el-descriptions :column="2" border size="small" style="margin-top: 15px;">
              <el-descriptions-item label="当前Sheet">{{ currentSheet }}</el-descriptions-item>
              <el-descriptions-item label="当前批次">{{ currentBatch }} / {{ totalBatches }}</el-descriptions-item>
              <el-descriptions-item label="已导入">{{ importedCount }}条</el-descriptions-item>
              <el-descriptions-item label="总计">{{ totalCount }}条</el-descriptions-item>
            </el-descriptions>
            <div class="progress-message" style="margin-top: 10px; color: #606266;">
              {{ progressMessage }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- Sheet列表配置 -->
      <el-card v-if="!importing" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">Sheet导入配置</span>
            <div>
              <el-button size="small" @click="selectAllSheets">全选</el-button>
              <el-button size="small" @click="deselectAllSheets">取消全选</el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="sheetConfigs"
          style="width: 100%"
          border
          max-height="400"
        >
          <el-table-column width="50" align="center">
            <template #default="{ row }">
              <el-checkbox
                v-model="row.selected"
                :disabled="row.isFullyImported"
              />
            </template>
          </el-table-column>

          <el-table-column label="Sheet名称" min-width="150">
            <template #default="{ row }">
              <div class="sheet-name-cell">
                <span>{{ row.sheetName }}</span>
                <el-tag v-if="row.isFullyImported" type="success" size="small" style="margin-left: 8px;">
                  全部已导入
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="物料类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getMaterialTypeTag(row.materialType)">
                {{ getMaterialTypeName(row.materialType) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="总数" width="80" align="center">
            <template #default="{ row }">
              {{ row.totalCount }}
            </template>
          </el-table-column>

          <el-table-column label="待导入" width="90" align="center">
            <template #default="{ row }">
              <span :class="{ 'text-warning': row.pendingCount > 0 }">
                {{ row.pendingCount }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="已导入" width="90" align="center">
            <template #default="{ row }">
              <span :class="{ 'text-success': row.importedCount > 0 }">
                {{ row.importedCount }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="每批导入" width="150" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.batchSize"
                :min="20"
                :max="100"
                :step="10"
                size="small"
                controls-position="right"
                :disabled="!row.selected || row.isFullyImported"
              />
            </template>
          </el-table-column>

          <el-table-column label="预计批次" width="100" align="center">
            <template #default="{ row }">
              <span v-if="row.pendingCount > 0">
                {{ Math.ceil(row.pendingCount / row.batchSize) }} 批
              </span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 统计信息 -->
        <div class="summary-bar">
          <el-tag type="info">已选: {{ selectedCount }} 个Sheet</el-tag>
          <el-tag type="warning">待导入: {{ totalPendingCount }} 条</el-tag>
          <el-tag type="primary">预计批次: {{ totalBatchCount }} 批</el-tag>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="!importing" @click="handleClose">取消</el-button>
        <el-button
          v-if="!importing"
          type="primary"
          @click="handleConfirm"
          :disabled="selectedCount === 0 || totalPendingCount === 0"
        >
          开始导入 ({{ totalPendingCount }}条)
        </el-button>
        <el-button v-if="importing && progressPercentage === 100" type="primary" @click="handleClose">
          完成
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'MaterialImportConfigDialog'
});
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

// Props & Emits
interface Props {
  visible: boolean;
  sheetGroups: Array<{
    sheetName: string;
    materials: any[];
  }>;
  importing?: boolean;
  progressPercentage?: number;
  progressStatus?: 'success' | 'exception' | 'warning' | '';
  currentSheet?: string;
  currentBatch?: number;
  totalBatches?: number;
  importedCount?: number;
  totalCount?: number;
  progressMessage?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', config: ImportConfig): void;
}

interface SheetConfig {
  sheetName: string;
  materialType: string;
  totalCount: number;
  pendingCount: number;
  importedCount: number;
  selected: boolean;
  batchSize: number;
  isFullyImported: boolean;
}

interface ImportConfig {
  sheets: Array<{
    sheetName: string;
    batchSize: number;
  }>;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const dialogVisible = ref(false);
const globalBatchSize = ref(50);
const sheetConfigs = ref<SheetConfig[]>([]);

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
    if (val) {
      initSheetConfigs();
    }
  },
  { immediate: true }
);

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 计算属性
const selectedCount = computed(() => {
  return sheetConfigs.value.filter(s => s.selected).length;
});

const totalPendingCount = computed(() => {
  return sheetConfigs.value
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.pendingCount, 0);
});

const totalBatchCount = computed(() => {
  return sheetConfigs.value
    .filter(s => s.selected)
    .reduce((sum, s) => sum + Math.ceil(s.pendingCount / s.batchSize), 0);
});

// 方法
const initSheetConfigs = () => {
  sheetConfigs.value = props.sheetGroups
    .filter(group => {
      // 过滤发货清单：根据Sheet名称判断
      const lowerSheetName = group.sheetName.toLowerCase();
      return !lowerSheetName.includes('发货') && !lowerSheetName.includes('装车');
    })
    .map(group => {
      const totalCount = group.materials.length;
      const importedCount = group.materials.filter((m: any) => m.imported).length;
      const pendingCount = totalCount - importedCount;
      const isFullyImported = pendingCount === 0;

      return {
        sheetName: group.sheetName,
        materialType: inferMaterialType(group.sheetName, group.materials[0]),
        totalCount,
        pendingCount,
        importedCount,
        selected: !isFullyImported, // 默认选中未完全导入的Sheet
        batchSize: 50,
        isFullyImported
      };
    });
};

const inferMaterialType = (sheetName: string, sampleMaterial: any): string => {
  const name = sheetName.toLowerCase();
  if (name.includes('电控')) return 'ELECTRICAL';
  if (name.includes('机械')) return 'MECHANICAL';
  if (name.includes('管路')) return 'PIPELINE';
  if (name.includes('发货') || name.includes('装车')) return 'SHIPPING_INFO';
  return sampleMaterial?.materialType || 'GENERAL';
};

const getMaterialTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    GENERAL: '',
    MECHANICAL: 'success',
    ELECTRICAL: 'warning',
    PIPELINE: 'primary',
    SHIPPING_INFO: 'info'
  };
  return tagMap[type] || '';
};

const getMaterialTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    GENERAL: '通用物料',
    MECHANICAL: '机械设备',
    ELECTRICAL: '电控设备',
    PIPELINE: '管路设备',
    SHIPPING_INFO: '发货信息'
  };
  return nameMap[type] || '未知类型';
};

const applyGlobalConfig = () => {
  sheetConfigs.value.forEach(sheet => {
    if (!sheet.isFullyImported) {
      sheet.batchSize = globalBatchSize.value;
    }
  });
  ElMessage.success('已应用全局配置到所有待导入的Sheet');
};

const selectAllSheets = () => {
  sheetConfigs.value.forEach(sheet => {
    if (!sheet.isFullyImported) {
      sheet.selected = true;
    }
  });
};

const deselectAllSheets = () => {
  sheetConfigs.value.forEach(sheet => {
    sheet.selected = false;
  });
};

const handleClose = () => {
  dialogVisible.value = false;
};

const handleConfirm = () => {
  const selectedSheets = sheetConfigs.value
    .filter(s => s.selected && s.pendingCount > 0)
    .map(s => ({
      sheetName: s.sheetName,
      batchSize: s.batchSize
    }));

  if (selectedSheets.length === 0) {
    ElMessage.warning('请至少选择一个待导入的Sheet');
    return;
  }

  emit('confirm', { sheets: selectedSheets });
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.import-config-container {
  .card-title {
    font-weight: 600;
    font-size: 14px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sheet-name-cell {
    display: flex;
    align-items: center;
  }

  .text-warning {
    color: #e6a23c;
    font-weight: 600;
  }

  .text-success {
    color: #67c23a;
    font-weight: 600;
  }

  .text-muted {
    color: #909399;
  }

  .summary-bar {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
    display: flex;
    gap: 12px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.import-progress {
  .percentage-text {
    font-weight: bold;
    font-size: 16px;
  }

  .progress-info {
    margin-top: 20px;
  }

  .progress-message {
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
  }
}
</style>

