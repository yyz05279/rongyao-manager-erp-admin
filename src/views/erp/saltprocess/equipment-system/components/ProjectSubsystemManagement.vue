<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProjectSubsystemManagement'
});
</script>

<template>
  <div class="project-subsystem-management">
    <!-- 标题栏 -->
    <div class="header-section mb-4">
      <el-row :gutter="10">
        <el-col :span="12">
          <h3 class="section-title">
            <el-icon class="mr-2"><Menu /></el-icon>
            项目子系统列表
          </h3>
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
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="子系统名称" width="100" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.subsystemName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="子系统编码" width="180" align="center">
          <template #default="scope">
            {{ scope.row.subsystemCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getSubsystemTypeTagType(scope.row.subsystemType)" size="small">
              {{ getSubsystemTypeText(scope.row.subsystemType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120" align="center">
          <template #default="scope">
            {{ scope.row.category || '-' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="规格型号" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.specification || '-' }}
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="制造商" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.manufacturer || '-' }}
          </template>
        </el-table-column> -->
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
        <!-- <el-table-column label="总重量(kg)" width="120" align="center">
          <template #default="scope">
            {{ formatWeight(scope.row.totalWeight) }}
          </template>
        </el-table-column> -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleViewSubsystem(scope.row)" v-has-permi="['erp:saltprocess:projectSubsystem:query']" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEditSubsystem(scope.row)" v-has-permi="['erp:saltprocess:projectSubsystem:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDeleteSubsystem(scope.row)" v-has-permi="['erp:saltprocess:projectSubsystem:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 子系统详情对话框 -->
    <el-dialog
      :title="`子系统详情 - ${viewDialog.subsystemName}`"
      v-model="viewDialog.visible"
      width="1200px"
      append-to-body
      destroy-on-close
    >
      <project-subsystem-detail
        v-if="viewDialog.visible && viewDialog.subsystemId"
        :subsystem-id="viewDialog.subsystemId"
      />
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
                <el-option label="归档" value="ARCHIVED" />
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
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import ProjectSubsystemDetail from './ProjectSubsystemDetail.vue';
import type { ProjectSubsystemVO } from '@/api/erp/saltprocess/equipment-system/types';
import { updateProjectSubsystem, deleteProjectSubsystem, type ProjectSubsystemUpdateForm } from '@/api/erp/saltprocess/subsystem';

// Emits
const emit = defineEmits<{ refresh: [] }>();

// Props
interface Props {
  systemId: string | number;
  /** 项目子系统列表数据(从父组件传递) */
  projectSubsystems?: ProjectSubsystemVO[];
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const subsystemList = ref<ProjectSubsystemVO[]>([]);

// 查看详情对话框
const viewDialog = ref({
  visible: false,
  subsystemId: null as string | number | null,
  subsystemName: ''
});

// 编辑对话框
const editDialog = ref({
  visible: false,
  loading: false
});
const editFormRef = ref<FormInstance>();
const editForm = ref<ProjectSubsystemUpdateForm>({
  id: '',
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
  category: [{ max: 50, message: '分类长度不能超过50个字符', trigger: 'blur' }],
  subsystemType: [{ max: 50, message: '子系统类型长度不能超过50个字符', trigger: 'blur' }],
  description: [{ max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }],
  remarks: [{ max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }]
};

// 监听props变化
watch(
  () => props.projectSubsystems,
  (newSubsystems) => {
    console.log('📋 ProjectSubsystemManagement - 接收到子系统数据:', newSubsystems);
    if (newSubsystems !== undefined) {
      subsystemList.value = newSubsystems;
      console.log('✅ 子系统列表已更新，数量:', subsystemList.value.length);
    }
  },
  { deep: true, immediate: true }
);

// 获取子系统类型标签类型
const getSubsystemTypeTagType = (type?: string): string => {
  const typeMap: Record<string, string> = {
    MECHANICAL: 'primary',
    ELECTRICAL: 'success',
    PIPELINE: 'warning'
  };
  return typeMap[type || ''] || 'info';
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

// 查看子系统详情
const handleViewSubsystem = (row: ProjectSubsystemVO) => {
  viewDialog.value.subsystemId = row.id;
  viewDialog.value.subsystemName = row.subsystemName || `ID: ${row.id}`;
  viewDialog.value.visible = true;
};

// 编辑子系统
const handleEditSubsystem = (row: ProjectSubsystemVO) => {
  if (!row.id) {
    ElMessage.warning('该子系统没有ID，无法编辑');
    return;
  }
  editForm.value = {
    id: row.id,
    subsystemName: row.subsystemName || '',
    category: row.category || '',
    subsystemType: row.subsystemType || '',
    description: row.description || '',
    status: row.status || 'DRAFT',
    remarks: row.remarks || ''
  };
  editDialog.value.visible = true;
};

// 提交编辑
const submitEdit = async () => {
  try {
    await editFormRef.value?.validate();
    editDialog.value.loading = true;
    await updateProjectSubsystem(editForm.value);
    ElMessage.success('编辑成功');
    editDialog.value.visible = false;
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

// 删除子系统
const handleDeleteSubsystem = async (row: ProjectSubsystemVO) => {
  try {
    await ElMessageBox.confirm('确定要删除该子系统吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await deleteProjectSubsystem(row.id);
    ElMessage.success('删除成功');
    emit('refresh');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除子系统失败:', error);
      ElMessage.error('删除失败');
    }
  }
};
</script>

<style scoped lang="scss">
.project-subsystem-management {
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


