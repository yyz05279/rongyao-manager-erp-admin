<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProjectSubsystemSelector'
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择子系统模板"
    width="1200px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <!-- 搜索栏 -->
    <div class="search-section mb-3">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="模板名称">
          <el-input
            v-model="queryParams.templateName"
            placeholder="请输入模板名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="模板编号">
          <el-input
            v-model="queryParams.templateCode"
            placeholder="请输入模板编号"
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

    <!-- 子系统模板列表 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="templateList"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      height="450"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="模板编号" prop="templateCode" width="150" show-overflow-tooltip />
      <el-table-column label="模板名称" prop="templateName" min-width="180" show-overflow-tooltip />
      <el-table-column label="分类" width="120" align="center">
        <template #default="scope">
          {{ scope.row.category || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="子项数" width="100" align="center">
        <template #default="scope">
          <el-tag type="success" size="small">{{ scope.row.itemCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="物料数" width="100" align="center">
        <template #default="scope">
          <el-tag type="warning" size="small">{{ scope.row.materialCount || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)" size="small">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
      style="margin-top: 20px"
    />

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="selectedTemplates.length === 0">
        确定（已选{{ selectedTemplates.length }}个）
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { listSubsystemTemplate } from '@/api/erp/subsystem/template';
import type { SubsystemTemplateVO, SubsystemTemplateQuery } from '@/api/erp/subsystem/types';

// Props
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [templates: SubsystemTemplateVO[]];
}>();

// 响应式数据
const loading = ref(false);
const templateList = ref<SubsystemTemplateVO[]>([]);
const selectedTemplates = ref<SubsystemTemplateVO[]>([]);
const total = ref(0);
const tableRef = ref();

const queryParams = reactive<SubsystemTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  templateName: '',
  templateCode: ''
});

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 监听对话框打开
watch(dialogVisible, (newValue) => {
  if (newValue) {
    loadTemplateList();
  }
});

// 加载子系统模板列表
const loadTemplateList = async () => {
  loading.value = true;
  try {
    const response: any = await listSubsystemTemplate(queryParams);

    // 处理响应数据
    if (response.rows) {
      // 只显示独立的子系统模板（systemTemplateId为null）
      templateList.value = (response.rows || []).filter((item: any) => !item.systemTemplateId);
      total.value = templateList.value.length;
    } else if (Array.isArray(response.data)) {
      templateList.value = (response.data || []).filter((item: any) => !item.systemTemplateId);
      total.value = templateList.value.length;
    } else {
      templateList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('加载子系统模板列表失败:', error);
    ElMessage.error('加载子系统模板列表失败');
    templateList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 选择变化
const handleSelectionChange = (selection: SubsystemTemplateVO[]) => {
  selectedTemplates.value = selection;
};

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  loadTemplateList();
};

// 重置搜索
const handleReset = () => {
  queryParams.templateName = '';
  queryParams.templateCode = '';
  queryParams.pageNum = 1;
  loadTemplateList();
};

// 页码变化
const handlePageChange = (page: number) => {
  queryParams.pageNum = page;
  loadTemplateList();
};

// 每页条数变化
const handlePageSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  loadTemplateList();
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

// 确认选择
const handleConfirm = () => {
  if (selectedTemplates.value.length === 0) {
    ElMessage.warning('请选择要添加的子系统模板');
    return;
  }

  emit('confirm', selectedTemplates.value);
  dialogVisible.value = false;
  // 重置选择
  selectedTemplates.value = [];
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  // 重置选择
  selectedTemplates.value = [];
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

.action-section {
  display: flex;
  justify-content: flex-end;
}

.mb-3 {
  margin-bottom: 16px;
}
</style>


