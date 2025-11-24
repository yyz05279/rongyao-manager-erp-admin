<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SubsystemTemplateManagement'
});
</script>

<template>
  <div class="subsystem-template-management">
    <!-- 标题栏 -->
    <div class="header-section mb-4">
      <el-row :gutter="10">
        <el-col :span="12">
          <h3 class="section-title">
            <el-icon class="mr-2"><Menu /></el-icon>
            子系统模板管理
          </h3>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="selectedSubsystems.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button type="primary" icon="Plus" @click="handleAddSubsystem">
            添加子系统
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 子系统列表 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <span class="card-title">子系统列表</span>
      </template>

      <el-table
        v-loading="loading"
        :data="subsystemList"
        @selection-change="handleSelectionChange"
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="子系统名称" min-width="100" show-overflow-tooltip>
          <template #default="scope">
            {{ getSubsystemDisplayName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="180" align="center">
          <template #default="scope">
            {{ getSubsystemTypeText(scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="180" align="center">
          <template #default="scope">
            {{ getSubsystemTypeText(scope.row.subsystemType) }}
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
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleViewSubsystem(scope.row)" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEditSubsystem(scope.row, scope.$index)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.$index)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 子系统模板选择器 -->
    <subsystem-template-selector
      v-model="subsystemFormVisible"
      :existing-template-ids="existingTemplateIds"
      @confirm="handleSubsystemConfirm"
    />

    <!-- 子系统详情对话框（引用模式） -->
    <el-dialog
      v-if="viewDialog.mode === 'reference'"
      :title="`子系统模版详情 - ${viewDialog.subsystemName}`"
      v-model="viewDialog.visible"
      width="1200px"
      append-to-body
      destroy-on-close
    >
      <subsystem-template-detail
        v-if="viewDialog.visible && viewDialog.subsystemId"
        :template-id="viewDialog.subsystemId"
        :use-equipment-system-api="true"
      />
      <template #footer>
        <el-button @click="viewDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 子系统详情对话框（新建模式） -->
    <el-dialog
      v-if="viewDialog.mode === 'create'"
      :title="`子系统详情 - ${viewDialog.subsystemName}`"
      v-model="viewDialog.visible"
      width="800px"
      append-to-body
    >
      <el-descriptions :column="2" border v-if="viewDialog.subsystemData">
        <el-descriptions-item label="子系统名称">
          {{ viewDialog.subsystemData.subsystemName }}
        </el-descriptions-item>
        <el-descriptions-item label="子系统类型">
          {{ getSubsystemTypeText(viewDialog.subsystemData.subsystemType) }}
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          {{ viewDialog.subsystemData.category || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="规格型号">
          {{ viewDialog.subsystemData.specification || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="型号">
          {{ viewDialog.subsystemData.model || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="制造商">
          {{ viewDialog.subsystemData.manufacturer || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="子项数量">
          <el-tag type="success" size="small">{{ viewDialog.subsystemData.itemCount || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物料数量">
          <el-tag type="warning" size="small">{{ viewDialog.subsystemData.materialCount || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预估重量">
          {{ viewDialog.subsystemData.estimatedWeight ? `${viewDialog.subsystemData.estimatedWeight} kg` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(viewDialog.subsystemData.status)" size="small">
            {{ getStatusText(viewDialog.subsystemData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(viewDialog.subsystemData.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ viewDialog.subsystemData.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ viewDialog.subsystemData.remarks || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="viewDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑子系统对话框 -->
    <el-dialog
      title="编辑子系统"
      v-model="editDialog.visible"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子系统名称" prop="subsystemName">
              <el-input v-model="editForm.subsystemName" placeholder="请输入子系统名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-input v-model="editForm.category" placeholder="请输入分类" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子系统类型" prop="subsystemType">
              <el-input v-model="editForm.subsystemType" placeholder="请输入子系统类型" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="草稿" value="DRAFT" />
                <el-option label="启用" value="ACTIVE" />
                <el-option label="停用" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input v-model="editForm.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div class="dialog-footer" style="text-align: right; margin-top: 20px">
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="editDialog.loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import type { SubsystemTemplateForm, SubsystemTemplateUpdateForm } from '@/api/erp/saltprocess/equipment-system/types';
import { getEquipmentSystemTemplate, updateEquipmentSystemTemplate, updateSubsystemTemplate } from '@/api/erp/saltprocess/equipment-system/template';
import { parseTime } from '@/utils/ruoyi';
import SubsystemTemplateSelector from './SubsystemTemplateSelector.vue';
import SubsystemTemplateDetail from '@/views/erp/subsystem/template/components/SubsystemTemplateDetail.vue';

// Props
interface Props {
  templateId: string | number;
  /** 子系统模版列表数据(从父组件传递,避免重复调用API) */
  subsystemTemplates?: Array<SubsystemTemplateForm & { mode?: string }>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  refresh: [];
}>();

// 响应式数据
const loading = ref(false);
const subsystemFormVisible = ref(false);
const subsystemList = ref<Array<SubsystemTemplateForm & { mode?: string }>>([]);
const selectedSubsystems = ref<Array<SubsystemTemplateForm & { mode?: string }>>([]);

// 查看详情对话框
const viewDialog = ref({
  visible: false,
  mode: '' as 'reference' | 'create' | '',
  subsystemId: null as string | number | null,
  subsystemName: '',
  subsystemData: null as any
});

// 编辑对话框
const editDialog = ref({
  visible: false,
  loading: false
});

const editFormRef = ref();
const editForm = ref<{
  id: string | number;
  index: number;
  subsystemName: string;
  category: string;
  subsystemType: string;
  description: string;
  status: string;
  remarks: string;
}>({
  id: '',
  index: -1,
  subsystemName: '',
  category: '',
  subsystemType: '',
  description: '',
  status: '',
  remarks: ''
});

const editRules = {
  subsystemName: [
    { required: true, message: '请输入子系统名称', trigger: 'blur' },
    { max: 100, message: '子系统名称长度不能超过100个字符', trigger: 'blur' }
  ],
  category: [
    { max: 50, message: '分类长度不能超过50个字符', trigger: 'blur' }
  ],
  subsystemType: [
    { max: 50, message: '子系统类型长度不能超过50个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ],
  remarks: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
};

// 计算已添加的子系统模板ID列表
const existingTemplateIds = computed(() => {
  return subsystemList.value
    .filter((item: any) => item.mode === 'reference' && item.referenceTemplateId)
    .map((item: any) => item.referenceTemplateId as number);
});

// 加载子系统列表
const loadSubsystemList = async () => {
  // 如果父组件已经传递了数据(数组长度>0或者是空数组),直接使用,避免重复调用API
  if (props.subsystemTemplates !== undefined) {
    await processSubsystemTemplates(props.subsystemTemplates);
    return;
  }

  // 如果没有传递数据(undefined),则调用API获取
  loading.value = true;
  try {
    const res = await getEquipmentSystemTemplate(props.templateId);
    const data = res.data as any;

    if (data.subsystemTemplates && Array.isArray(data.subsystemTemplates)) {
      await processSubsystemTemplates(data.subsystemTemplates);
    } else {
      subsystemList.value = [];
    }
  } catch (error) {
    console.error('加载子系统列表失败:', error);
    ElMessage.error('加载子系统列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理子系统模版数据
// 注意：后端已经返回了完整的子系统信息（包括subsystemName），不需要额外调用API获取名称
const processSubsystemTemplates = async (templates: any[]) => {
  const subsystemTemplatesWithMode = templates.map((item: any) => {
    const mode = item.referenceTemplateId ? 'reference' : 'create';

    return {
      ...item,
      mode,
      // 后端已经返回了subsystemName，不需要额外获取referenceTemplateName
      // 如果需要显示引用的模板名称，可以直接使用subsystemName
      referenceTemplateName: item.subsystemName
    };
  });

  subsystemList.value = subsystemTemplatesWithMode;
};

// 监听props变化
watch(
  () => props.subsystemTemplates,
  (newSubsystemTemplates) => {
    // 如果父组件传递了数据,直接使用
    if (newSubsystemTemplates !== undefined) {
      processSubsystemTemplates(newSubsystemTemplates);
    }
  },
  { deep: true }
);

// 监听templateId变化
watch(
  () => props.templateId,
  (newTemplateId) => {
    if (newTemplateId) {
      loadSubsystemList();
    }
  },
  { immediate: true }
);

// 获取子系统显示名称
const getSubsystemDisplayName = (subsystem: SubsystemTemplateForm & { mode?: string }): string => {
  if (subsystem.mode === 'reference') {
    return subsystem.referenceTemplateName || `ID: ${subsystem.referenceTemplateId}`;
  } else {
    return subsystem.subsystemName || '未命名';
  }
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

// 选择变化
const handleSelectionChange = (selection: Array<SubsystemTemplateForm & { mode?: string }>) => {
  selectedSubsystems.value = selection;
};

// 添加子系统
const handleAddSubsystem = () => {
  subsystemFormVisible.value = true;
};

// 处理子系统确认
const handleSubsystemConfirm = async (newSubsystemList: Array<SubsystemTemplateForm & { mode: string }>) => {
  try {
    // 更新到后端
    await saveSubsystems([...subsystemList.value, ...newSubsystemList]);

    ElMessage.success('添加成功');
    loadSubsystemList();
    emit('refresh');
  } catch (error) {
    console.error('添加子系统失败:', error);
    ElMessage.error('添加子系统失败');
  }
};

// 删除子系统
const handleDelete = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该子系统吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const newList = [...subsystemList.value];
    newList.splice(index, 1);

    await saveSubsystems(newList);

    ElMessage.success('删除成功');
    loadSubsystemList();
    emit('refresh');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除子系统失败:', error);
      ElMessage.error('删除子系统失败');
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedSubsystems.value.length} 个子系统吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const newList = subsystemList.value.filter(
      item => !selectedSubsystems.value.includes(item)
    );

    await saveSubsystems(newList);

    ElMessage.success('删除成功');
    selectedSubsystems.value = [];
    loadSubsystemList();
    emit('refresh');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除子系统失败:', error);
      ElMessage.error('批量删除子系统失败');
    }
  }
};

// 保存子系统列表
const saveSubsystems = async (newList: Array<SubsystemTemplateForm & { mode?: string }>) => {
  // 移除用于显示的字段
  const submitData = newList.map(item => {
    const { mode, referenceTemplateName, ...rest } = item as any;
    return rest;
  });

  // 获取当前模板数据
  const res = await getEquipmentSystemTemplate(props.templateId);
  const templateData = res.data as any;

  // 更新子系统列表
  await updateEquipmentSystemTemplate({
    ...templateData,
    subsystemTemplates: submitData
  });
};

// 查看子系统详情
const handleViewSubsystem = (row: SubsystemTemplateForm & { mode?: string; referenceTemplateName?: string; id?: string | number }) => {
  // 无论是引用模式还是新建模式，都使用子系统的ID来调用API获取详情
  // 因为新建模式的子系统也会保存到数据库中，有自己的ID和子项数据
  if (row.id) {
    viewDialog.value.mode = 'reference';  // 使用reference模式来触发API调用
    viewDialog.value.subsystemId = row.id;  // 使用子系统自己的ID
    viewDialog.value.subsystemName = row.subsystemName || row.referenceTemplateName || `ID: ${row.id}`;
    viewDialog.value.subsystemData = null;
    viewDialog.value.visible = true;
  } else {
    // 如果没有ID（理论上不应该出现这种情况），显示基本信息
    console.warn('子系统没有ID，无法调用API');
    viewDialog.value.mode = 'create';
    viewDialog.value.subsystemId = null;
    viewDialog.value.subsystemName = row.subsystemName || '未命名';
    viewDialog.value.subsystemData = row;
    viewDialog.value.visible = true;
  }
};

// 编辑子系统
const handleEditSubsystem = (row: SubsystemTemplateForm & { mode?: string }, index: number) => {
  // 检查是否有ID
  if (!row.id) {
    ElMessage.warning('该子系统没有ID，无法编辑');
    return;
  }

  // 填充表单数据（保持ID为字符串格式，避免雪花算法ID精度丢失）
  editForm.value = {
    id: row.id,  // 直接使用原始ID，不进行Number()转换
    index: index,
    subsystemName: row.subsystemName || '',
    category: row.category || '',
    subsystemType: row.subsystemType || '',
    description: row.description || '',
    status: row.status || '',
    remarks: row.remarks || ''
  };
  editDialog.value.visible = true;
};

// 提交编辑
const submitEdit = async () => {
  try {
    await editFormRef.value?.validate();

    editDialog.value.loading = true;

    // 构建提交数据（移除index字段）
    const { index, ...submitData } = editForm.value;

    // 调用子系统模板修改接口
    await updateSubsystemTemplate(submitData as SubsystemTemplateUpdateForm);

    ElMessage.success('编辑成功');
    editDialog.value.visible = false;

    // 刷新列表
    await loadSubsystemList();
    emit('refresh');
  } catch (error: any) {
    if (error !== false) {
      console.error('编辑子系统失败:', error);
      ElMessage.error('编辑失败');
    }
  } finally {
    editDialog.value.loading = false;
  }
};
</script>

<style scoped lang="scss">
.subsystem-template-management {
  .header-section {
    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;

      .mr-2 {
        margin-right: 8px;
      }
    }

    .text-right {
      text-align: right;
    }
  }

  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .mb-4 {
    margin-bottom: 20px;
  }
}
</style>


