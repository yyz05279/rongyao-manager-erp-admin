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

    <!-- 操作按钮区 -->
    <div class="action-section mb-3">
      <el-button type="success" icon="Plus" @click="handleAddNewTemplate">
        新建子系统模板
      </el-button>
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
      <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="isAdded(scope.row)" type="success" size="small">已添加</el-tag>
          <el-tag v-else type="info" size="small">未添加</el-tag>
        </template>
      </el-table-column>
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

    <!-- 新建子系统模板对话框 -->
    <el-dialog
      title="新建子系统模板"
      v-model="newTemplateDialog.visible"
      width="900px"
      append-to-body
      :close-on-click-modal="false"
      @close="handleNewTemplateDialogClose"
    >
      <subsystem-template-form-with-items
        v-if="newTemplateDialog.visible"
        ref="newTemplateFormRef"
        @success="handleNewTemplateSuccess"
        @cancel="newTemplateDialog.visible = false"
      />
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { listSubsystemTemplate } from '@/api/erp/subsystem/template';
import type { SubsystemTemplateVO, SubsystemTemplateQuery } from '@/api/erp/subsystem/types';
import type { SubsystemTemplateForm as SubsystemTemplateFormType } from '@/api/erp/saltprocess/equipment-system/types';
import SubsystemTemplateFormWithItems from '../../equipment-system/template/components/SubsystemTemplateFormWithItems.vue';

// Props
interface Props {
  modelValue: boolean;
  existingTemplateIds?: Array<string | number>; // 已添加的子系统模板ID列表（字符串或数字均可）
}

const props = withDefaults(defineProps<Props>(), {
  existingTemplateIds: () => [] as Array<string | number>
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [templates: Array<SubsystemTemplateFormType & { mode: string }>];
}>();

// 响应式数据
const loading = ref(false);
const templateList = ref<SubsystemTemplateVO[]>([]);
const selectedTemplates = ref<SubsystemTemplateVO[]>([]);
const total = ref(0);
const tableRef = ref();
const newTemplateFormRef = ref();

// 新建子系统模板对话框
const newTemplateDialog = reactive({
  visible: false
});

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
watch(dialogVisible, async (newValue) => {
  if (newValue) {
    await loadTemplateList();
    // 加载完成后自动勾选已添加的模板
    await nextTick();
    try {
      // 先清空所有选择
      tableRef.value?.clearSelection?.();
      selectedTemplates.value = [];
      templateList.value.forEach((row) => {
        if (isAdded(row)) {
          tableRef.value?.toggleRowSelection?.(row, true);
        }
      });
    } catch (e) {
      // 忽略选择联动异常，保证不影响主流程
      console.warn('自动勾选已添加模板时出现异常:', e);
    }
  }
});

// 同步选择状态：将已添加的模板行勾选并禁用复选框
const syncSelection = async () => {
  await nextTick();
  try {
    tableRef.value?.clearSelection?.();
    selectedTemplates.value = [];
    templateList.value.forEach((row) => {
      if (isAdded(row)) {
        tableRef.value?.toggleRowSelection?.(row, true);
      }
    });
  } catch (e) {
    console.warn('同步选择状态时出现异常:', e);
  }
};


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

    // 加载完成后，同步勾选已添加的模板
    await syncSelection();
  } catch (error) {
    console.error('加载子系统模板列表失败:', error);
    ElMessage.error('加载子系统模板列表失败');
    templateList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 监听已添加模板ID变化，动态同步勾选状态
watch(
  () => props.existingTemplateIds,
  async () => {
    await syncSelection();
  },
  { deep: true }
);

// 监听模板列表变化（分页/搜索时），也同步勾选状态
watch(
  () => templateList.value,
  async () => {
    await syncSelection();
  }
);


// 检查模板是否已添加（统一转为字符串比较，避免类型不一致）
const isAdded = (row: SubsystemTemplateVO): boolean => {
  const ids = (props.existingTemplateIds || []).map((v) => String(v));
  return ids.includes(String(row.id));
};

// 检查行是否可选择（已添加的不能再选）
const checkSelectable = (row: SubsystemTemplateVO): boolean => {
  return !isAdded(row);
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

// 新建子系统模板
const handleAddNewTemplate = () => {
  newTemplateDialog.visible = true;
};

// 新建子系统模板成功
const handleNewTemplateSuccess = async (templateId: number) => {
  // 关闭对话框
  newTemplateDialog.visible = false;

  // 刷新列表
  await loadTemplateList();

  ElMessage.success('新建子系统模板成功');

  // 尝试自动选中新建的模板
  const newTemplate = templateList.value.find(t => t.id === templateId);
  if (newTemplate && tableRef.value) {
    // 自动勾选新建的模板
    tableRef.value.toggleRowSelection(newTemplate, true);
    selectedTemplates.value.push(newTemplate);
  }
};

// 新建子系统模板对话框关闭
const handleNewTemplateDialogClose = () => {
  newTemplateDialog.visible = false;
};

// 确认选择
const handleConfirm = () => {
  if (selectedTemplates.value.length === 0) {
    ElMessage.warning('请选择要添加的子系统模板');
    return;
  }

  // 过滤掉已添加的模板，只保留新选择的模板（防御性编程）
  const newTemplates = selectedTemplates.value.filter(template => {
    return !isAdded(template);
  });

  // 如果所有选中的模板都已添加
  if (newTemplates.length === 0) {
    ElMessage.warning('所选模板均已添加，请选择其他模板');
    return;
  }

  // 如果部分模板已添加，提示用户实际添加的数量
  // const filteredCount = selectedTemplates.value.length - newTemplates.length;
  // if (filteredCount > 0) {
  //   ElMessage.info(`已过滤 ${filteredCount} 个已添加的模板，将添加 ${newTemplates.length} 个新模板`);
  // }

  console.log('🎯 [ProjectSubsystemSelector.handleConfirm] 确认添加子系统模板');
  console.log('📊 原始选中数量:', selectedTemplates.value.length);
  console.log('📊 过滤后数量:', newTemplates.length);
  console.log('📋 将要添加的模板:', newTemplates.map(t => ({ id: t.id, name: t.templateName })));

  // 将选中的模板转换为SubsystemTemplateFormType格式
  const result: Array<SubsystemTemplateFormType & { mode: string }> = newTemplates.map((template, index) => ({
    mode: 'reference',
    referenceTemplateId: template.id as number,
    referenceTemplateName: template.templateName, // 添加模板名称用于前端显示
    sequenceNumber: index + 1,
    remarks: ''
  }));

  emit('confirm', result);
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
  justify-content: flex-start;
  padding: 8px 0;
}

.mb-3 {
  margin-bottom: 16px;
}
</style>


