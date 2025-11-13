<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SubsystemTemplateSelector'
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
        <el-form-item label="子系统类型">
          <el-select
            v-model="queryParams.subsystemType"
            placeholder="请选择类型"
            clearable
            @clear="handleSearch"
            style="width: 150px"
          >
            <el-option label="机械设备" value="MECHANICAL" />
            <el-option label="电控设备" value="ELECTRICAL" />
            <el-option label="管路设备" value="PIPELINE" />
          </el-select>
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
      <el-table-column label="子系统类型" width="120" align="center">
        <template #default="scope">
          {{ getSubsystemTypeText(scope.row.subsystemType) }}
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="category" width="120" show-overflow-tooltip />
      <el-table-column label="规格型号" prop="specification" width="150" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'ACTIVE'" type="success" size="small">启用</el-tag>
          <el-tag v-else type="info" size="small">禁用</el-tag>
        </template>
      </el-table-column>
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
        <span class="selected-info">已选择 {{ selectedTemplates.length }} 项</span>
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="selectedTemplates.length === 0">
            确定添加
          </el-button>
        </div>
      </div>
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
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { listSubsystemTemplate } from '@/api/erp/subsystem/template';
import type { SubsystemTemplateVO, SubsystemTemplateQuery } from '@/api/erp/subsystem/types';
import type { SubsystemTemplateForm as SubsystemTemplateFormType } from '@/api/erp/saltprocess/equipment-system/types';
import SubsystemTemplateFormWithItems from './SubsystemTemplateFormWithItems.vue';

// Props
interface Props {
  modelValue: boolean;
  existingTemplateIds?: number[]; // 已添加的子系统模板ID列表
}

const props = withDefaults(defineProps<Props>(), {
  existingTemplateIds: () => []
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

const queryParams = reactive<SubsystemTemplateQuery & { subsystemType?: string }>({
  pageNum: 1,
  pageSize: 10,
  templateName: '',
  templateCode: '',
  subsystemType: ''
});

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 监听对话框打开
watch(dialogVisible, (newVal) => {
  if (newVal) {
    loadTemplateList();
  } else {
    resetSearch();
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

// 检查模板是否已添加
const isAdded = (row: SubsystemTemplateVO): boolean => {
  return props.existingTemplateIds.includes(row.id as number);
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
  queryParams.subsystemType = '';
  queryParams.pageNum = 1;
  loadTemplateList();
};

// 重置所有状态
const resetSearch = () => {
  queryParams.templateName = '';
  queryParams.templateCode = '';
  queryParams.subsystemType = '';
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  selectedTemplates.value = [];
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

// 获取子系统类型文本
const getSubsystemTypeText = (type?: string): string => {
  const typeMap: Record<string, string> = {
    MECHANICAL: '机械设备',
    ELECTRICAL: '电控设备',
    PIPELINE: '管路设备'
  };
  return type ? typeMap[type] || type : '-';
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

  // 将选中的模板转换为SubsystemTemplateFormType格式
  const result: Array<SubsystemTemplateFormType & { mode: string }> = selectedTemplates.value.map((template, index) => ({
    mode: 'reference',
    referenceTemplateId: template.id as number,
    referenceTemplateName: template.templateName, // 添加模板名称用于前端显示
    sequenceNumber: index + 1,
    remarks: ''
  }));

  emit('confirm', result);
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

.action-section {
  display: flex;
  justify-content: flex-start;
  padding: 8px 0;
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
