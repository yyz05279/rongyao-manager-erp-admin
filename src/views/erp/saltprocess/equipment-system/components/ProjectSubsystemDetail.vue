<template>
  <div class="project-subsystem-detail">
    <!-- 基本信息 -->
    <el-descriptions :column="2" border class="mb-4">
      <el-descriptions-item label="子系统编码">
        {{ detail.subsystemCode }}
      </el-descriptions-item>
      <el-descriptions-item label="子系统名称">
        {{ detail.subsystemName }}
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        {{ detail.category || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="规格型号">
        {{ detail.specification || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="型号">
        {{ detail.model || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="制造商">
        {{ detail.manufacturer || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusTagType(detail.status)" size="small">
          {{ getStatusText(detail.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="子项数量">
        <el-tag type="success" size="small">{{ detail.itemCount || 0 }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="物料数量">
        <el-tag type="warning" size="small">{{ detail.materialCount || 0 }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="总重量">
        {{ formatWeight(detail.totalWeight) }}
      </el-descriptions-item>
      <el-descriptions-item label="排序号">
        {{ detail.sequenceNumber || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ parseTime(detail.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ parseTime(detail.updateTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        {{ detail.description || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ detail.remarks || '-' }}
      </el-descriptions-item>
    </el-descriptions>

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
        v-loading="itemLoading"
        :data="itemList"
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
        <el-table-column label="类型" prop="itemType" width="130" align="center" />
        <el-table-column label="操作" align="center" width="220" fixed="right">
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

    <!-- 物料详情对话框 -->
    <el-dialog
      :title="`物料列表 (${selectedItemName})`"
      v-model="materialDetailDialog.visible"
      width="1200px"
      append-to-body
    >
      <div class="mb-3">
        <el-button type="primary" icon="Plus" @click="handleAddMaterialInDialog">
          添加物料
        </el-button>
      </div>
      <el-table
        v-loading="materialLoading"
        :data="materialList"
        style="width: 100%"
      >
        <el-table-column label="物料编码" prop="materialCode" width="180" show-overflow-tooltip />
        <el-table-column label="物料名称" prop="materialName" min-width="200" show-overflow-tooltip />
        <el-table-column label="规格型号" prop="specification" width="180" show-overflow-tooltip />
        <el-table-column label="数量" prop="quantity" width="100" align="center">
          <template #default="scope">
            {{ formatQuantity(scope.row.quantity) }}
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="备注" prop="remarks" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEditMaterial(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDeleteMaterial(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="materialDetailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProjectSubsystemDetail'
});
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getProjectSubsystem } from '@/api/erp/saltprocess/subsystem';
import { getSubsystemItems, getItemMaterials } from '@/api/erp/saltprocess/project-item';
import { parseTime } from '@/utils/ruoyi';
import type {
  ProjectSubsystemVO
} from '@/api/erp/saltprocess/equipment-system/types';
import type {
  ProjectSubsystemItemVO as QueryProjectItemVO,
  ProjectItemMaterialVO
} from '@/api/erp/saltprocess/project-item';

// Props
interface Props {
  subsystemId: string | number;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const itemLoading = ref(false);
const materialLoading = ref(false);

const detail = ref<ProjectSubsystemVO>({} as ProjectSubsystemVO);
const itemList = ref<QueryProjectItemVO[]>([]);
const materialList = ref<ProjectItemMaterialVO[]>([]);
const selectedItems = ref<QueryProjectItemVO[]>([]);
const selectedItemId = ref<string | number | null>(null);
const selectedItemName = ref<string>('');

// 物料详情弹窗
const materialDetailDialog = ref({
  visible: false
});

// 生命周期
onMounted(() => {
  getDetail();
});

// 获取详情
const getDetail = async () => {
  loading.value = true;
  try {
    const res = await getProjectSubsystem(props.subsystemId);
    detail.value = res.data;

    // 同时加载子项列表
    if (res.data.id) {
      await loadItemList();
    }
  } catch (error) {
    console.error('获取子系统详情失败:', error);
    ElMessage.error('获取子系统详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载子项列表
const loadItemList = async () => {
  if (!detail.value.id) return;

  itemLoading.value = true;
  try {
    const res = await getSubsystemItems(detail.value.id);
    itemList.value = res.data || [];
  } catch (error) {
    console.error('加载子项列表失败:', error);
    ElMessage.error('加载子项列表失败');
  } finally {
    itemLoading.value = false;
  }
};

// 加载物料列表
const loadMaterialList = async () => {
  if (!selectedItemId.value) return;

  materialLoading.value = true;
  try {
    const res = await getItemMaterials(selectedItemId.value);
    materialList.value = res.data || [];
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
  } finally {
    materialLoading.value = false;
  }
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

// 格式化重量显示
const formatWeight = (weight?: number | string | null): string => {
  if (weight === null || weight === undefined) {
    return '-';
  }

  if (typeof weight === 'string') {
    const num = parseFloat(weight);
    return isNaN(num) ? '-' : `${num.toFixed(2)} kg`;
  }

  return `${weight.toFixed(2)} kg`;
};

// 格式化数量
const formatQuantity = (quantity?: number | string): string => {
  if (quantity === null || quantity === undefined) {
    return '-';
  }
  if (typeof quantity === 'string') {
    const num = parseFloat(quantity);
    return isNaN(num) ? '-' : num.toString();
  }
  return quantity.toString();
};

// 子项选择变化
const handleItemSelectionChange = (selection: QueryProjectItemVO[]) => {
  selectedItems.value = selection;
};

// 子项行点击
const handleItemClick = (row: QueryProjectItemVO) => {
  selectedItemId.value = row.id;
  selectedItemName.value = row.itemName;
};

// 查看物料
const handleViewMaterials = async (row: QueryProjectItemVO) => {
  selectedItemId.value = row.id;
  selectedItemName.value = row.itemName;
  materialDetailDialog.value.visible = true;
  await loadMaterialList();
};

// 编辑子项
const handleEditItem = (row: QueryProjectItemVO) => {
  ElMessage.info(`编辑子项"${row.itemName}"`);
  // TODO: 实现编辑子项功能
};

// 删除子项
const handleDeleteItem = async (row: QueryProjectItemVO) => {
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

    ElMessage.success(`删除子项"${row.itemName}"成功`);
    // TODO: 调用删除API
    // 刷新数据
    await loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除子项失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 批量删除
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

    ElMessage.success(`批量删除 ${selectedItems.value.length} 个子项成功`);
    // TODO: 调用批量删除API
    // 清空选中状态
    selectedItems.value = [];
    // 刷新列表
    await loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 添加子项
const handleAddItem = () => {
  ElMessage.info('添加新子项');
  // TODO: 实现添加子项功能
};

// 在物料弹窗中添加物料
const handleAddMaterialInDialog = () => {
  ElMessage.info('添加物料');
  // TODO: 实现添加物料功能
};

// 编辑物料
const handleEditMaterial = (row: ProjectItemMaterialVO) => {
  ElMessage.info(`编辑物料"${row.materialName}"`);
  // TODO: 实现编辑物料功能
};

// 删除物料
const handleDeleteMaterial = async (row: ProjectItemMaterialVO) => {
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

    ElMessage.success(`删除物料"${row.materialName}"成功`);
    // TODO: 调用删除API
    // 刷新物料列表
    await loadMaterialList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error);
      ElMessage.error('删除失败');
    }
  }
};
</script>

<style scoped lang="scss">
.project-subsystem-detail {
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

  .mb-3 {
    margin-bottom: 12px;
  }
}
</style>

