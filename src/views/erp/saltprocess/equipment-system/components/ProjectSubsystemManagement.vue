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
        <el-table-column label="子系统名称" min-width="200" show-overflow-tooltip>
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
        <el-table-column label="规格型号" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.specification || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="制造商" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.manufacturer || '-' }}
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
        <el-table-column label="总重量(kg)" width="120" align="center">
          <template #default="scope">
            {{ scope.row.totalWeight ? scope.row.totalWeight.toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click="handleViewSubsystem(scope.row)" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Menu } from '@element-plus/icons-vue';
import ProjectSubsystemDetail from './ProjectSubsystemDetail.vue';

// 项目子系统数据接口
interface ProjectSubsystemVO {
  id: string | number;
  projectSystemId: string | number;
  projectId: string | number;
  templateId?: string | number;
  subsystemCode: string;
  subsystemName: string;
  subsystemType: string;
  category?: string;
  specification?: string;
  model?: string;
  manufacturer?: string;
  description?: string;
  itemCount?: number;
  materialCount?: number;
  totalWeight?: number;
  status: string;
  sequenceNumber?: number;
  remarks?: string;
  version?: number;
  createTime?: string;
  updateTime?: string;
}

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

// 监听props变化
watch(
  () => props.projectSubsystems,
  (newSubsystems) => {
    if (newSubsystems !== undefined) {
      subsystemList.value = newSubsystems;
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


