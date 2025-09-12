<template>
  <div class="data-display-container">
    <!-- 数据统计卡片 -->
    <div class="statistics-section" v-if="showStatistics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="总记录数" :value="statistics.totalRecords" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="有效记录" :value="statistics.validRecords" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="错误记录" :value="statistics.errorRecords" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <el-statistic title="计算字段" :value="statistics.calculatedFields" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选工具栏 -->
    <el-card class="filter-card" shadow="never" v-if="showFilters">
      <el-form :model="filterForm" :inline="true" size="small">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleFilterChange"
          />
        </el-form-item>
        
        <el-form-item label="记录人" v-if="dataType === 'salt_process'">
          <el-input
            v-model="filterForm.recorder"
            placeholder="请输入记录人"
            clearable
            @change="handleFilterChange"
          />
        </el-form-item>
        
        <el-form-item label="重量范围" v-if="dataType === 'molten_salt_inventory'">
          <el-input-number
            v-model="filterForm.minWeight"
            placeholder="最小重量"
            :min="0"
            @change="handleFilterChange"
          />
          <span style="margin: 0 8px;">-</span>
          <el-input-number
            v-model="filterForm.maxWeight"
            placeholder="最大重量"
            :min="0"
            @change="handleFilterChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="exportData">导出数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <span class="table-title">{{ tableTitle }}</span>
          <div class="table-actions">
            <el-button size="small" @click="refreshData">
              <el-icon><refresh /></el-icon>
              刷新
            </el-button>
            <el-button size="small" @click="toggleFullscreen">
              <el-icon><full-screen /></el-icon>
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 熔盐入库统计表 -->
      <el-table
        v-if="dataType === 'molten_salt_inventory'"
        :data="filteredData"
        border
        stripe
        :height="tableHeight"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="sodiumBags" label="钠(袋)" width="80" sortable />
        <el-table-column prop="potassiumBags" label="钾(袋)" width="80" sortable />
        <el-table-column prop="sodiumWeight" label="钠重量(吨)" width="100" sortable>
          <template #default="{ row }">
            <span class="calculated-field">{{ row.sodiumWeight?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="potassiumWeight" label="钾重量(吨)" width="100" sortable>
          <template #default="{ row }">
            <span class="calculated-field">{{ row.potassiumWeight?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalWeight" label="总重量(吨)" width="100" sortable>
          <template #default="{ row }">
            <span class="calculated-field total-weight">{{ row.totalWeight?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalCrushingAmount" label="总粉碎量" width="100" sortable />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>

      <!-- 化盐量记录表 -->
      <el-table
        v-else-if="dataType === 'salt_process'"
        :data="filteredData"
        border
        stripe
        :height="tableHeight"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="sequenceNumber" label="记录序号" width="80" sortable />
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="wasteAmount" label="垃圾" width="80" sortable />
        <el-table-column prop="sodiumNitrate" label="硝酸钠" width="80" sortable />
        <el-table-column prop="potassiumNitrate" label="硝酸钾" width="80" sortable />
        <el-table-column prop="totalNitrate" label="总硝酸盐" width="100" sortable>
          <template #default="{ row }">
            <span class="calculated-field">{{ row.totalNitrate?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="saltPerWaste" label="每垃圾化盐量" width="120" sortable />
        <el-table-column prop="accumulatedSalt" label="累积化盐量" width="120" sortable />
        <el-table-column prop="moltenSaltTemperature" label="温度(°C)" width="100" sortable>
          <template #default="{ row }">
            <el-tag 
              :type="getTemperatureTagType(row.moltenSaltTemperature)" 
              size="small"
            >
              {{ row.moltenSaltTemperature }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="moltenSaltLevel" label="液位(m)" width="100" sortable />
        <el-table-column prop="gasConsumptionPerWaste" label="天然气耗量" width="120" sortable />
        <el-table-column prop="powerConsumptionPerWaste" label="用电量" width="100" sortable />
        <el-table-column prop="efficiency" label="效率(%)" width="80" sortable>
          <template #default="{ row }">
            <span class="calculated-field efficiency">{{ row.efficiency?.toFixed(1) }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="staffCount" label="人数" width="60" />
        <el-table-column prop="recorder" label="记录人" width="80" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" v-if="showPagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, FullScreen } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import type {
  MoltenSaltInventoryRecord,
  SaltProcessRecord
} from '@/api/erp/saltprocess/records/excel-import/types';

// Props
interface Props {
  data: (MoltenSaltInventoryRecord | SaltProcessRecord)[];
  dataType: 'molten_salt_inventory' | 'salt_process';
  loading?: boolean;
  showStatistics?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  tableHeight?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showStatistics: true,
  showFilters: true,
  showPagination: true,
  tableHeight: 400
});

// Emits
const emit = defineEmits<{
  'refresh': [];
  'export': [data: any[]];
}>();

// 响应式数据
const currentPage = ref(1);
const pageSize = ref(20);
const isFullscreen = ref(false);

// 筛选表单
const filterForm = reactive({
  dateRange: [] as string[],
  recorder: '',
  minWeight: undefined as number | undefined,
  maxWeight: undefined as number | undefined
});

// 计算属性
const tableTitle = computed(() => {
  return props.dataType === 'molten_salt_inventory' ? '熔盐入库统计数据' : '化盐量记录数据';
});

const statistics = computed(() => {
  const totalRecords = props.data.length;
  const validRecords = props.data.filter(record => record.date).length;
  const errorRecords = totalRecords - validRecords;
  
  let calculatedFields = 0;
  if (props.dataType === 'molten_salt_inventory') {
    calculatedFields = props.data.filter(record => 
      (record as MoltenSaltInventoryRecord).sodiumWeight || 
      (record as MoltenSaltInventoryRecord).potassiumWeight
    ).length;
  } else {
    calculatedFields = props.data.filter(record => 
      (record as SaltProcessRecord).totalNitrate || 
      (record as SaltProcessRecord).efficiency
    ).length;
  }

  return {
    totalRecords,
    validRecords,
    errorRecords,
    calculatedFields
  };
});

const filteredData = computed(() => {
  let filtered = [...props.data];

  // 日期范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange;
    filtered = filtered.filter(record => {
      const recordDate = record.date;
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  // 记录人筛选
  if (filterForm.recorder && props.dataType === 'salt_process') {
    filtered = filtered.filter(record => 
      (record as SaltProcessRecord).recorder?.includes(filterForm.recorder)
    );
  }

  // 重量范围筛选
  if (props.dataType === 'molten_salt_inventory') {
    if (filterForm.minWeight !== undefined) {
      filtered = filtered.filter(record => 
        (record as MoltenSaltInventoryRecord).totalWeight! >= filterForm.minWeight!
      );
    }
    if (filterForm.maxWeight !== undefined) {
      filtered = filtered.filter(record => 
        (record as MoltenSaltInventoryRecord).totalWeight! <= filterForm.maxWeight!
      );
    }
  }

  // 分页
  if (props.showPagination) {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filtered.slice(start, end);
  }

  return filtered;
});

const totalRecords = computed(() => {
  return props.data.length;
});

// 方法
const getTemperatureTagType = (temperature: number) => {
  if (temperature < 400) return 'info';
  if (temperature < 450) return 'warning';
  if (temperature < 500) return 'success';
  return 'danger';
};

const handleFilterChange = () => {
  currentPage.value = 1; // 重置到第一页
};

const resetFilters = () => {
  filterForm.dateRange = [];
  filterForm.recorder = '';
  filterForm.minWeight = undefined;
  filterForm.maxWeight = undefined;
  currentPage.value = 1;
};

const refreshData = () => {
  emit('refresh');
};

const exportData = () => {
  const dataToExport = props.showPagination ? props.data : filteredData.value;
  
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dataToExport);
  
  const sheetName = props.dataType === 'molten_salt_inventory' ? '熔盐入库统计' : '化盐量记录';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const fileName = `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  ElMessage.success('数据导出成功');
  emit('export', dataToExport);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  // 这里可以添加全屏逻辑
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
};

// 监听数据变化，重置分页
watch(() => props.data, () => {
  currentPage.value = 1;
});
</script>

<style scoped lang="scss">
.data-display-container {
  .statistics-section {
    margin-bottom: 20px;

    .stat-card {
      text-align: center;
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .table-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .table-actions {
        display: flex;
        gap: 8px;
      }
    }

    .calculated-field {
      color: #67c23a;
      font-weight: 500;

      &.total-weight {
        color: #409eff;
        font-weight: 600;
      }

      &.efficiency {
        color: #e6a23c;
      }
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style>
