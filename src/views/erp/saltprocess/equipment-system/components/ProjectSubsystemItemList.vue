<template>
  <div class="project-subsystem-item-list">
    <!-- 子项列表 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon class="mr-2"><Menu /></el-icon>
            子项列表
          </span>
          <el-tag v-if="items && items.length > 0" type="success" size="small">
            共 {{ items.length }} 个
          </el-tag>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="items"
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column label="子项编号" prop="itemCode" width="220" show-overflow-tooltip />
        <el-table-column label="子项名称" prop="itemName" width="200" show-overflow-tooltip />
        <el-table-column label="子项类型" prop="itemType" width="120" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.itemType" :type="getItemTypeTagType(scope.row.itemType)" size="small">
              {{ scope.row.itemType }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" prop="quantity" width="100" align="center">
          <template #default="scope">
            {{ formatQuantity(scope.row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" width="100" align="center" />
        <el-table-column label="单件重量" prop="unitWeight" width="120" align="center">
          <template #default="scope">
            {{ formatWeight(scope.row.unitWeight) }}
          </template>
        </el-table-column>
        <el-table-column label="总重量" prop="totalWeight" width="120" align="center">
          <template #default="scope">
            {{ formatWeight(scope.row.totalWeight) }}
          </template>
        </el-table-column>
        <el-table-column label="材料数量" prop="materialCount" width="110" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.materialCount > 0" type="warning" size="small">
              {{ scope.row.materialCount }}
            </el-tag>
            <span v-else class="text-muted">0</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="!loading && (!items || items.length === 0)" class="empty-state">
        <el-empty description="暂无子项数据" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProjectSubsystemItemList'
});
</script>

<script setup lang="ts">
import type { ProjectSubsystemItemVO } from '@/api/erp/saltprocess/equipment-system/types';

// Props
interface Props {
  /** 子项列表数据 */
  items?: ProjectSubsystemItemVO[];
  /** 加载状态 */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// 获取子项类型标签类型
const getItemTypeTagType = (itemType?: string): string => {
  const typeMap: Record<string, string> = {
    '组件': 'primary',
    '部件': 'success',
    '配件': 'warning',
    '紧固件': 'info'
  };
  return typeMap[itemType || ''] || 'info';
};

// 获取状态标签类型
const getStatusTagType = (status?: string): string => {
  const typeMap: Record<string, string> = {
    DRAFT: 'info',
    ACTIVE: 'success',
    INACTIVE: 'warning',
    ARCHIVED: 'danger'
  };
  return typeMap[status || ''] || 'info';
};

// 获取状态文本
const getStatusText = (status?: string): string => {
  const textMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '启用',
    INACTIVE: '停用',
    ARCHIVED: '归档'
  };
  return textMap[status || ''] || status || '-';
};

// 格式化数量显示
const formatQuantity = (quantity?: number | string): string => {
  if (quantity === null || quantity === undefined) {
    return '-';
  }
  
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return isNaN(num) ? '-' : num.toString();
};

// 格式化重量显示
const formatWeight = (weight?: number | string): string => {
  if (weight === null || weight === undefined) {
    return '-';
  }

  const num = typeof weight === 'string' ? parseFloat(weight) : weight;
  if (isNaN(num)) {
    return '-';
  }
  
  return num === 0 ? '0.00 kg' : `${num.toFixed(2)} kg`;
};
</script>

<style scoped lang="scss">
.project-subsystem-item-list {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #303133;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mr-2 {
    margin-right: 8px;
  }

  .text-muted {
    color: #909399;
  }

  .empty-state {
    padding: 40px 0;
  }
}
</style>
