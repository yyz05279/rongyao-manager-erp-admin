<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'MaterialSelectorDialog'
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择物料"
    width="1000px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <!-- 搜索栏 -->
    <div class="search-section mb-3">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="物料名称">
          <el-input
            v-model="queryParams.materialName"
            placeholder="请输入物料名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="物料编码">
          <el-input
            v-model="queryParams.materialCode"
            placeholder="请输入物料编码"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 物料列表 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="materialList"
      row-key="materialCode"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      height="450"
    >
      <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="isAdded(scope.row)" type="success" size="small">已添加</el-tag>
          <el-tag v-else type="info" size="small">未添加</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="物料编码" prop="materialCode" width="150" show-overflow-tooltip />
      <el-table-column label="物料名称" prop="materialName" min-width="200" show-overflow-tooltip />
      <el-table-column label="规格型号" prop="specification" width="150" show-overflow-tooltip />
      <el-table-column label="单位" prop="unit" width="80" align="center" />
      <el-table-column label="材质" prop="materialCategory" width="120" show-overflow-tooltip />
      <el-table-column label="制造商" prop="manufacturer" width="150" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section mt-3">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <span class="selected-info">已选择 {{ selectedMaterials.length }} 项</span>
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="selectedMaterials.length === 0">
            确定添加
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { listMaterial } from '@/api/erp/material/material';
import type { MaterialVO } from '@/api/erp/material/material/types';

// Props
interface Props {
  modelValue: boolean;
  existingMaterialIds?: number[]; // 已添加的物料ID列表（用于ID匹配）
  existingMaterialCodes?: string[]; // 已添加的物料编码列表（用于编码匹配）
}

const props = withDefaults(defineProps<Props>(), {
  existingMaterialIds: () => [],
  existingMaterialCodes: () => []
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [materials: MaterialVO[]];
}>();

// 响应式数据
const loading = ref(false);
const materialList = ref<MaterialVO[]>([]);
const selectedMaterials = ref<MaterialVO[]>([]);
const total = ref(0);
const tableRef = ref();

// 本地维护的已选中物料编码集合（用于跨分页保持选中状态）
const selectedMaterialCodes = ref<Set<string>>(new Set());

// 标志位：是否正在恢复选中状态（防止 clearSelection 触发 handleSelectionChange 清空本地状态）
const isRestoringSelection = ref(false);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  materialName: '',
  materialCode: ''
});

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 监听对话框打开
watch(dialogVisible, (newVal) => {
  console.log('=== MaterialSelectorDialog 对话框状态变化 ===');
  console.log('对话框是否打开:', newVal);
  console.log('传入的 existingMaterialIds:', props.existingMaterialIds);
  console.log('传入的 existingMaterialCodes:', props.existingMaterialCodes);

  if (newVal) {
    // 初始化已选中物料编码集合（包含已添加的物料）
    selectedMaterialCodes.value = new Set(props.existingMaterialCodes);
    console.log('初始化 selectedMaterialCodes:', Array.from(selectedMaterialCodes.value));
    loadMaterialList();
  } else {
    resetSearch();
  }
});

// 加载物料列表
const loadMaterialList = async () => {
  console.log('=== 开始加载物料列表 ===');
  console.log('查询参数:', queryParams);

  loading.value = true;
  try {
    const response: any = await listMaterial(queryParams);
    console.log('API 响应:', response);

    // 🔒 在数据赋值之前设置标志位，防止数据变化触发 handleSelectionChange 清空本地状态
    isRestoringSelection.value = true;
    console.log('🔒 设置 isRestoringSelection = true（数据赋值前）');

    // 处理响应数据
    if (response.rows) {
      materialList.value = response.rows;
      total.value = response.total || 0;
    } else if (Array.isArray(response.data)) {
      materialList.value = response.data;
      total.value = response.data.length;
    } else {
      materialList.value = [];
      total.value = 0;
    }

    console.log('加载的物料列表数量:', materialList.value.length);
    console.log('物料列表数据:', materialList.value);

    // 自动勾选已添加的物料
    autoSelectAddedMaterials();
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');

    // 出错时也要重置标志位
    isRestoringSelection.value = false;
    materialList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 检查物料是否已添加
const isAdded = (row: MaterialVO): boolean => {
  // 优先使用 materialCode 匹配（用于设备系统模板）
  if (props.existingMaterialCodes.length > 0 && row.materialCode) {
    const resultByCode = props.existingMaterialCodes.includes(row.materialCode);
    console.log(`检查物料 ${row.materialName}(编码: ${row.materialCode}) 是否已添加(通过编码):`, resultByCode);
    return resultByCode;
  }

  // 否则使用 ID 匹配（用于子系统模板）
  const resultById = props.existingMaterialIds.includes(row.id as number);
  console.log(`检查物料 ${row.materialName}(ID: ${row.id}) 是否已添加(通过ID):`, resultById);
  return resultById;
};

// 检查行是否可选择（已添加的不能再选）
const checkSelectable = (row: MaterialVO): boolean => {
  return !isAdded(row);
};

// 自动勾选已添加的物料（基于本地维护的选中列表）
const autoSelectAddedMaterials = async () => {
  console.log('=== 开始自动勾选已添加的物料 ===');
  console.log('existingMaterialIds:', props.existingMaterialIds);
  console.log('existingMaterialCodes:', props.existingMaterialCodes);
  console.log('selectedMaterialCodes:', Array.from(selectedMaterialCodes.value));
  console.log('materialList 数量:', materialList.value.length);

  // 使用 nextTick 确保表格渲染完成
  await nextTick();

  if (!tableRef.value) {
    console.warn('表格组件未找到，无法自动勾选');
    // 重置标志位
    isRestoringSelection.value = false;
    return;
  }

  // 注意：isRestoringSelection 已经在 loadMaterialList 中设置为 true

  // 清空表格的选择状态（但不清空 selectedMaterialCodes）
  tableRef.value.clearSelection();
  console.log('✓ 已清空表格选择状态');

  // 根据本地维护的选中列表恢复勾选状态
  let selectedCount = 0;
  materialList.value.forEach((material) => {
    // 检查物料编码是否在本地选中列表中
    const materialCode = material.materialCode;
    if (materialCode && selectedMaterialCodes.value.has(materialCode)) {
      console.log(`恢复勾选物料: ${material.materialName}(编码: ${materialCode})`);
      tableRef.value.toggleRowSelection(material, true);
      selectedCount++;
    }
  });

  console.log(`已恢复勾选 ${selectedCount} 个物料（本地选中总数: ${selectedMaterialCodes.value.size}）`);

  // 恢复完成后，重置标志位
  isRestoringSelection.value = false;
  console.log('🔓 设置 isRestoringSelection = false，恢复正常事件处理');
};

// 选择变化（同步更新本地选中列表）
const handleSelectionChange = (selection: MaterialVO[]) => {
  selectedMaterials.value = selection;

  // 🔒 如果正在恢复选中状态，不要更新 selectedMaterialCodes（防止被 clearSelection 清空）
  if (isRestoringSelection.value) {
    console.log('⚠️ 正在恢复选中状态，跳过 selectedMaterialCodes 更新');
    console.log('选择变化 - 当前选中物料数:', selection.length);
    console.log('选择变化 - 保持 selectedMaterialCodes 不变:', Array.from(selectedMaterialCodes.value));
    return;
  }

  // 正常情况下，更新本地选中物料编码集合
  selectedMaterialCodes.value.clear();
  selection.forEach((material) => {
    if (material.materialCode) {
      selectedMaterialCodes.value.add(material.materialCode);
    }
  });

  console.log('选择变化 - 当前选中物料数:', selection.length);
  console.log('选择变化 - 更新后的 selectedMaterialCodes:', Array.from(selectedMaterialCodes.value));
};

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  loadMaterialList();
};

// 重置搜索
const handleReset = () => {
  queryParams.materialName = '';
  queryParams.materialCode = '';
  queryParams.pageNum = 1;
  loadMaterialList();
};

// 重置所有状态
const resetSearch = () => {
  queryParams.materialName = '';
  queryParams.materialCode = '';
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  selectedMaterials.value = [];
  selectedMaterialCodes.value.clear();
};

// 页码变化
const handlePageChange = (page: number) => {
  queryParams.pageNum = page;
  loadMaterialList();
};

// 每页条数变化
const handlePageSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  loadMaterialList();
};

// 确认选择
const handleConfirm = () => {
  console.log('=== MaterialSelectorDialog handleConfirm 被调用 ===');
  console.log('选中的物料数量:', selectedMaterials.value.length);
  console.log('选中的物料:', selectedMaterials.value);

  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请选择要添加的物料');
    return;
  }

  // 过滤掉已添加的物料，只保留新选择的物料
  const newMaterials = selectedMaterials.value.filter(material => {
    // 优先使用 materialCode 匹配（用于设备系统模板）
    if (props.existingMaterialCodes.length > 0 && material.materialCode) {
      return !props.existingMaterialCodes.includes(material.materialCode);
    }
    // 否则使用 ID 匹配（用于子系统模板）
    return !props.existingMaterialIds.includes(material.id as number);
  });

  console.log('过滤后的新物料数量:', newMaterials.length);
  console.log('过滤后的新物料:', newMaterials);

  if (newMaterials.length === 0) {
    ElMessage.warning('所选物料均已添加，请选择其他物料');
    return;
  }

  console.log('准备 emit confirm 事件，传递的数据:', newMaterials);
  emit('confirm', newMaterials);
  console.log('emit confirm 事件完成');

  // 清空本地选中状态
  selectedMaterialCodes.value.clear();
  dialogVisible.value = false;
  console.log('对话框已关闭');
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.search-section {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;

  .el-form {
    margin-bottom: 0;
  }
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-info {
    color: #606266;
    font-size: 14px;
  }
}

.mb-3 {
  margin-bottom: 16px;
}

.mt-3 {
  margin-top: 16px;
}
</style>

