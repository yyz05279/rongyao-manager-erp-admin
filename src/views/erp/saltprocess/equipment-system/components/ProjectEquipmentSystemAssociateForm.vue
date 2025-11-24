<template>
  <el-dialog
    v-model="dialogVisible"
    title="项目设备系统关联"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading" class="project-equipment-system-form">
      <!-- 项目选择 -->
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="选择项目" prop="projectId">
          <el-select
            v-model="formData.projectId"
            placeholder="请选择项目"
            filterable
            clearable
            style="width: 100%"
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in projectList"
              :key="project.id"
              :label="`${project.projectName} (${project.projectCode})`"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <!-- 设备系统模板搜索和表格 -->
        <el-form-item label="选择模板" prop="equipmentSystemIds">
          <div class="template-section">
            <!-- 搜索区域 -->
            <div class="search-area">
              <el-input
                v-model="searchForm.templateName"
                placeholder="请输入模板名称"
                clearable
                style="width: 200px; margin-right: 10px"
                @keyup.enter="handleSearch"
              />
              <el-input
                v-model="searchForm.templateCode"
                placeholder="请输入模板编号"
                clearable
                style="width: 200px; margin-right: 10px"
                @keyup.enter="handleSearch"
              />
              <el-select
                v-model="searchForm.systemType"
                placeholder="请选择类型"
                clearable
                style="width: 150px; margin-right: 10px"
              >
                <el-option label="固态" value="SOLID" />
                <el-option label="液态" value="LIQUID" />
                <el-option label="粉盐" value="POWDER" />
                <el-option label="燃烧器" value="BURNER" />
              </el-select>
              <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
              <el-button icon="Refresh" @click="handleReset">重置</el-button>
            </div>

            <!-- 模板表格 -->
            <div class="template-table-container">
              <el-table
                ref="tableRef"
                :data="templateList"
                border
                stripe
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="templateCode" label="模板编号" width="180" show-overflow-tooltip />
                <el-table-column prop="templateName" label="模板名称" min-width="150" show-overflow-tooltip />
                <!-- <el-table-column prop="systemType" label="子系统类型" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getSystemTypeTag(row.systemType)" size="small">
                      {{ getSystemTypeLabel(row.systemType) }}
                    </el-tag>
                  </template>
                </el-table-column> -->
                <el-table-column prop="category" label="分类" width="100" align="center" />
                <el-table-column prop="subsystemCount" label="子系统数量" width="100" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTag(row.status)" size="small">
                      {{ getStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 空数据提示 -->
              <div v-if="templateList.length === 0 && !loading" class="empty-data">
                <el-empty description="暂无可用模板" />
              </div>

              <!-- 分页组件 -->
              <div class="pagination-container">
                <div class="selected-info">
                  已选择 {{ selectedTemplates.length }} 项
                </div>
                <el-pagination
                  v-model:current-page="pageNum"
                  v-model:page-size="pageSize"
                  :total="total"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                />
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<script setup name="ProjectEquipmentSystemAssociateForm" lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElMessage, ElTable } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getProjectSimpleList } from '@/api/erp/saltprocess/project';
import { listEquipmentSystemTemplate } from '@/api/erp/saltprocess/equipment-system/template';
import { createFromTemplates } from '@/api/erp/saltprocess/equipment-system';
import type { EquipmentSystemTemplateVO } from '@/api/erp/saltprocess/equipment-system/types';

// ==================== 类型定义 ====================

/**
 * 表单数据接口
 */
interface FormData {
  projectId: string | null;
  equipmentSystemIds: string[];  // 使用 string 类型避免 Long 类型精度丢失
}

/**
 * 项目简化信息接口
 */
interface ProjectSimpleVO {
  id: string;
  projectName: string;
  projectCode: string;
}

/**
 * Props 接口
 */
interface Props {
  visible: boolean;
}

// ==================== Props & Emits ====================

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  success: [];
}>();

// ==================== 响应式数据 ====================

const formRef = ref<FormInstance>();
const tableRef = ref<InstanceType<typeof ElTable>>();
const loading = ref(false);
const submitLoading = ref(false);

// 项目列表
const projectList = ref<ProjectSimpleVO[]>([]);

// 模板列表
const templateList = ref<EquipmentSystemTemplateVO[]>([]);

// 选中的模板
const selectedTemplates = ref<EquipmentSystemTemplateVO[]>([]);

// 表单数据
const formData = reactive<FormData>({
  projectId: null,
  equipmentSystemIds: []
});

// 搜索表单
const searchForm = reactive({
  templateName: '',
  templateCode: '',
  systemType: ''
});

// 分页数据
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表单验证规则
const rules = reactive<FormRules>({
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  equipmentSystemIds: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少选择一个设备系统模板'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
});

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// ==================== 生命周期 ====================

onMounted(() => {
  loadProjectList();
  loadTemplateList();
});

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 弹窗打开时重新加载数据
      loadProjectList();
      loadTemplateList();
    } else {
      // 弹窗关闭时重置表单
      resetForm();
    }
  }
);

// ==================== 方法 ====================

/**
 * 加载项目列表（使用简化列表接口）
 */
const loadProjectList = async () => {
  try {
    loading.value = true;
    const res = await getProjectSimpleList();
    projectList.value = res.data || [];
  } catch (error) {
    console.error('加载项目列表失败:', error);
    ElMessage.error('加载项目列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 加载设备系统模板列表（支持分页和搜索）
 */
const loadTemplateList = async () => {
  try {
    loading.value = true;
    const res = await listEquipmentSystemTemplate({
      status: 'ACTIVE',
      templateName: searchForm.templateName || undefined,
      templateCode: searchForm.templateCode || undefined,
      systemType: searchForm.systemType || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    // 增加日志以调试 API 返回的确切结构
    console.log('设备系统模板接口返回:', res);

    // 采用更安全的方式访问数据，兼容多种可能的返回结构
    const responseData = res.data || res;
    templateList.value = responseData.rows || [];
    total.value = responseData.total || 0;
  } catch (error) {
    console.error('加载模板列表失败:', error);
    ElMessage.error('加载模板列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 项目选择变化处理
 */
const handleProjectChange = () => {
  // 项目变化时可以做一些处理，比如清空已选模板
  // selectedTemplates.value = [];
  // tableRef.value?.clearSelection();
};

/**
 * 搜索处理
 */
const handleSearch = () => {
  pageNum.value = 1;  // 搜索时重置页码
  loadTemplateList();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  searchForm.templateName = '';
  searchForm.templateCode = '';
  searchForm.systemType = '';
  pageNum.value = 1;
  loadTemplateList();
};

/**
 * 页码变化处理
 */
const handlePageChange = (page: number) => {
  pageNum.value = page;
  loadTemplateList();
};

/**
 * 每页数量变化处理
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  pageNum.value = 1;  // 改变每页数量时重置页码
  loadTemplateList();
};

/**
 * 表格选择变化处理
 */
const handleSelectionChange = (selection: EquipmentSystemTemplateVO[]) => {
  selectedTemplates.value = selection;
  // 保持 string 类型，避免精度丢失
  formData.equipmentSystemIds = selection.map(item => String(item.id));
};

/**
 * 获取系统类型标签样式
 */
const getSystemTypeTag = (type: string): string => {
  const tagMap: Record<string, string> = {
    SOLID: 'primary',
    LIQUID: 'success',
    POWDER: 'warning',
    BURNER: 'danger'
  };
  return tagMap[type] || 'info';
};

/**
 * 获取系统类型标签文本
 */
const getSystemTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    SOLID: '固态',
    LIQUID: '液态',
    POWDER: '粉盐',
    BURNER: '燃烧器'
  };
  return labelMap[type] || type;
};

/**
 * 获取状态标签样式
 */
const getStatusTag = (status: string): string => {
  const tagMap: Record<string, string> = {
    DRAFT: 'info',
    ACTIVE: 'success',
    ARCHIVED: 'warning'
  };
  return tagMap[status] || 'info';
};

/**
 * 获取状态标签文本
 */
const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '启用',
    ARCHIVED: '归档'
  };
  return labelMap[status] || status;
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 表单验证
    await formRef.value.validate();

    // 二次验证
    if (!formData.projectId) {
      ElMessage.warning('请选择项目');
      return;
    }

    if (formData.equipmentSystemIds.length === 0) {
      ElMessage.warning('请至少选择一个设备系统模板');
      return;
    }

    // 提交数据
    submitLoading.value = true;
    const submitData = {
      projectId: formData.projectId as string,  // 保持 string 类型，避免精度丢失
      templateIds: formData.equipmentSystemIds
    };

    await createFromTemplates(submitData);

    ElMessage.success('关联成功');
    emit('success');
    dialogVisible.value = false;
  } catch (error: any) {
    console.error('关联失败:', error);
    const errorMsg = error?.message || '关联失败，请稍后重试';
    ElMessage.error(errorMsg);
  } finally {
    submitLoading.value = false;
  }
};

/**
 * 关闭弹窗
 */
const handleClose = () => {
  dialogVisible.value = false;
};

/**
 * 重置表单
 */
const resetForm = () => {
  formData.projectId = null;
  formData.equipmentSystemIds = [];
  selectedTemplates.value = [];
  searchForm.templateName = '';
  searchForm.templateCode = '';
  searchForm.systemType = '';
  pageNum.value = 1;
  pageSize.value = 10;
  total.value = 0;
  tableRef.value?.clearSelection();
  formRef.value?.resetFields();
};
</script>

<style scoped lang="scss">
.project-equipment-system-form {
  padding: 10px 0;

  .template-section {
    width: 100%;

    .search-area {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
    }

    .template-table-container {
      .empty-data {
        padding: 40px 0;
        text-align: center;
      }

      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding: 12px 0;

        .selected-info {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  :deep(.el-table) {
    font-size: 14px;

    .el-table__header th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }

    .el-table__body td {
      padding: 12px 0;
    }

    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__sizes,
    .el-pagination__jump {
      font-size: 13px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
