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
      v-loading="loading"
      :data="materialList"
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
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { listMaterial } from '@/api/erp/material/material';
import type { MaterialVO } from '@/api/erp/material/material/types';

// Props
interface Props {
  modelValue: boolean;
  existingMaterialIds?: number[]; // 已添加的物料ID列表
}

const props = withDefaults(defineProps<Props>(), {
  existingMaterialIds: () => []
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
  if (newVal) {
    loadMaterialList();
  } else {
    resetSearch();
  }
});

// 加载物料列表
const loadMaterialList = async () => {
  loading.value = true;
  try {
    const response: any = await listMaterial(queryParams);

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
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
    materialList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 检查物料是否已添加
const isAdded = (row: MaterialVO): boolean => {
  return props.existingMaterialIds.includes(row.id as number);
};

// 检查行是否可选择（已添加的不能再选）
const checkSelectable = (row: MaterialVO): boolean => {
  return !isAdded(row);
};

// 选择变化
const handleSelectionChange = (selection: MaterialVO[]) => {
  selectedMaterials.value = selection;
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
  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请选择要添加的物料');
    return;
  }

  emit('confirm', selectedMaterials.value);
  dialogVisible.value = false;
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

