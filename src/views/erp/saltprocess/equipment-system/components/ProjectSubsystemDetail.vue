<template>
  <div class="project-subsystem-detail" v-loading="loading">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="子系统编码">
        {{ detail.subsystemCode }}
      </el-descriptions-item>
      <el-descriptions-item label="子系统名称">
        {{ detail.subsystemName }}
      </el-descriptions-item>
      <el-descriptions-item label="子系统类型">
        <el-tag :type="getSubsystemTypeTagType(detail.subsystemType)" size="small">
          {{ getSubsystemTypeText(detail.subsystemType) }}
        </el-tag>
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
        {{ detail.totalWeight ? `${detail.totalWeight.toFixed(2)} kg` : '-' }}
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
import { ElMessage } from 'element-plus';
import { getProjectSubsystem } from '@/api/erp/saltprocess/subsystem';
import { parseTime } from '@/utils/ruoyi';

// 项目子系统详情接口
interface ProjectSubsystemDetailVO {
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
  subsystemId: string | number;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const detail = ref<ProjectSubsystemDetailVO>({} as ProjectSubsystemDetailVO);

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
  } catch (error) {
    console.error('获取子系统详情失败:', error);
    ElMessage.error('获取子系统详情失败');
  } finally {
    loading.value = false;
  }
};

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
</script>

<style scoped lang="scss">
.project-subsystem-detail {
  padding: 0;
}
</style>

