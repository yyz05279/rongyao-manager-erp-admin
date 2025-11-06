<template>
  <div class="subsystem-template-detail" v-loading="loading">
    <!-- 模板基本信息 -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="title">模板基本信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="模板编号">
          {{ templateInfo.templateCode }}
        </el-descriptions-item>
        <el-descriptions-item label="模板名称">
          {{ templateInfo.templateName }}
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          {{ templateInfo.category || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号">
          {{ templateInfo.version || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(templateInfo.status)" size="small">
            {{ getStatusText(templateInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="标准模板">
          <el-tag v-if="templateInfo.isStandard" type="success" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="子项数量">
          <el-tag type="primary">{{ templateInfo.totalItems || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物料数量">
          <el-tag type="warning">{{ templateInfo.totalMaterials || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ templateInfo.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ templateInfo.remarks || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ templateInfo.createByName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(templateInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新人">
          {{ templateInfo.updateByName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ parseTime(templateInfo.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 子项和物料模板管理 -->
    <el-card shadow="never" class="detail-card">
      <item-template-management :template-id="templateId" />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SubsystemTemplateDetail'
});
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getSubsystemTemplate } from '@/api/erp/subsystem/template';
import type { SubsystemTemplateDetailVO } from '@/api/erp/subsystem/types';
import { parseTime } from '@/utils/ruoyi';
import ItemTemplateManagement from './ItemTemplateManagement.vue';

// Props
interface Props {
  templateId: string | number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
}>();

// 响应式数据
const loading = ref(false);
const templateInfo = ref<Partial<SubsystemTemplateDetailVO>>({});

// 生命周期
onMounted(() => {
  getDetail();
});

// 获取详情
const getDetail = async () => {
  loading.value = true;
  try {
    const res = await getSubsystemTemplate(props.templateId);
    templateInfo.value = res.data;
  } catch (error) {
    console.error('获取模板详情失败:', error);
    ElMessage.error('获取模板详情失败');
  } finally {
    loading.value = false;
  }
};

// 获取状态标签类型
const getStatusTagType = (status: string | undefined): string => {
  if (!status) return 'info';
  const typeMap: Record<string, string> = {
    DRAFT: 'info',
    ACTIVE: 'success',
    INACTIVE: 'warning',
    ARCHIVED: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string | undefined): string => {
  if (!status) return '-';
  const textMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '启用',
    INACTIVE: '停用',
    ARCHIVED: '归档'
  };
  return textMap[status] || status;
};
</script>

<style scoped lang="scss">
.subsystem-template-detail {
  .detail-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>

