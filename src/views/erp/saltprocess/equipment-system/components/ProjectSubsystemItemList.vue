<template>
  <div class="project-subsystem-item-list">
    <!-- 标题栏 -->
    <div class="header-section mb-4">
      <el-row :gutter="10">
        <el-col :span="12">
          <h3 class="section-title">
            <el-icon class="mr-2"><Menu /></el-icon>
            子项列表
          </h3>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="selectedItems.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button type="primary" icon="Plus" @click="handleAddItem">
            添加子项
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 子项列表 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <span class="card-title">子项列表</span>
      </template>

      <el-table
        v-loading="loading"
        :data="items"
        @selection-change="handleItemSelectionChange"
        @row-click="handleItemClick"
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="子项编号" prop="itemCode" width="220" show-overflow-tooltip />
        <el-table-column label="子项名称" prop="itemName" width="200" show-overflow-tooltip />
        <el-table-column label="数量" prop="quantity" width="150" align="center">
          <template #default="scope">
            {{ formatQuantity(scope.row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" width="130" align="center" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看物料" placement="top">
              <el-button link type="primary" icon="View" @click.stop="handleViewMaterials(scope.row)" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click.stop="handleEditItem(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click.stop="handleDeleteItem(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
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
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
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

// Emits
const emit = defineEmits<{
  /** 查看物料事件 */
  viewMaterials: [item: ProjectSubsystemItemVO];
  /** 编辑子项事件 */
  editItem: [item: ProjectSubsystemItemVO];
  /** 删除子项事件 */
  deleteItem: [item: ProjectSubsystemItemVO];
  /** 批量删除事件 */
  batchDelete: [items: ProjectSubsystemItemVO[]];
  /** 添加子项事件 */
  addItem: [];
  /** 行点击事件 */
  rowClick: [item: ProjectSubsystemItemVO];
}>();

// 响应式数据
const selectedItems = ref<ProjectSubsystemItemVO[]>([]);

// 子项选择变化
const handleItemSelectionChange = (selection: ProjectSubsystemItemVO[]) => {
  selectedItems.value = selection;
};

// 子项行点击
const handleItemClick = (row: ProjectSubsystemItemVO) => {
  emit('rowClick', row);
};

// 查看物料
const handleViewMaterials = (row: ProjectSubsystemItemVO) => {
  emit('viewMaterials', row);
};

// 编辑子项
const handleEditItem = (row: ProjectSubsystemItemVO) => {
  emit('editItem', row);
};

// 删除子项
const handleDeleteItem = async (row: ProjectSubsystemItemVO) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除子项"${row.itemName}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    emit('deleteItem', row);
  } catch (error) {
    // 用户取消删除
  }
};

// 批量删除子项
const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要删除的子项');
    return;
  }

  try {
    const itemNames = selectedItems.value.map(item => item.itemName).join('、');
    await ElMessageBox.confirm(
      `是否确认删除选中的 ${selectedItems.value.length} 个子项（${itemNames}）？`,
      '批量删除警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    emit('batchDelete', selectedItems.value);
    // 清空选中状态
    selectedItems.value = [];
  } catch (error) {
    // 用户取消删除
  }
};

// 添加子项
const handleAddItem = () => {
  emit('addItem');
};

// 格式化数量显示
const formatQuantity = (quantity?: number | string): string => {
  if (quantity === null || quantity === undefined) {
    return '-';
  }

  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return isNaN(num) ? '-' : num.toString();
};
</script>

<style scoped lang="scss">
.project-subsystem-item-list {
  .header-section {
    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .card-title {
    font-weight: 600;
    color: #303133;
  }

  .text-right {
    text-align: right;
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
