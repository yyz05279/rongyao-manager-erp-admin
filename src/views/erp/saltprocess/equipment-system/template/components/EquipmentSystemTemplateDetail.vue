<template>
  <div class="equipment-system-template-detail" v-loading="loading">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="模板编码">
        {{ detail.templateCode }}
      </el-descriptions-item>
      <el-descriptions-item label="模板名称">
        {{ detail.templateName }}
      </el-descriptions-item>
      <el-descriptions-item label="系统类型">
        <el-tag :type="getSystemTypeTagType(detail.systemType)" size="small">
          {{ getSystemTypeText(detail.systemType) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        {{ detail.category || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="版本号">
        {{ detail.version || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusTagType(detail.status)" size="small">
          {{ getStatusText(detail.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="标准模板">
        <el-tag v-if="detail.isStandard" type="success" size="small">是</el-tag>
        <el-tag v-else type="info" size="small">否</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="子系统数量">
        <el-tag type="info" size="small">{{ detail.subsystemCount || 0 }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="总子项数">
        <el-tag type="success" size="small">{{ detail.totalItems || 0 }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="总物料数">
        <el-tag type="warning" size="small">{{ detail.totalMaterials || 0 }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="预估总重量">
        {{ detail.estimatedWeight ? `${detail.estimatedWeight} kg` : '-' }}
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

    <!-- 统计信息卡片 -->
    <el-card v-if="detail.statistics" class="mt-4" shadow="never">
      <template #header>
        <span class="card-title">统计信息</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">已完成子系统</div>
            <div class="stat-value text-success">{{ detail.statistics.completedSubsystemCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">进行中子系统</div>
            <div class="stat-value text-primary">{{ detail.statistics.inProgressSubsystemCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">待处理子系统</div>
            <div class="stat-value text-warning">{{ detail.statistics.pendingSubsystemCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">总重量(kg)</div>
            <div class="stat-value text-info">{{ detail.statistics.totalWeight?.toFixed(2) || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 子系统模板管理 -->
    <el-card shadow="never" class="mt-4">
      <subsystem-template-management :template-id="templateId" @refresh="handleRefresh" />
    </el-card>

    <div class="dialog-footer mt-4">
      <el-button @click="handleClose">关 闭</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'EquipmentSystemTemplateDetail'
});
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getEquipmentSystemTemplate } from '@/api/erp/saltprocess/equipment-system/template';
import type { EquipmentSystemTemplateDetailVO } from '@/api/erp/saltprocess/equipment-system/types';
import { parseTime } from '@/utils/ruoyi';
import SubsystemTemplateManagement from './SubsystemTemplateManagement.vue';

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
const detail = ref<EquipmentSystemTemplateDetailVO>({} as EquipmentSystemTemplateDetailVO);

// 生命周期
onMounted(() => {
  getDetail();
});

// 获取详情
const getDetail = async () => {
  loading.value = true;
  try {
    const res = await getEquipmentSystemTemplate(props.templateId);
    detail.value = res.data;
  } catch (error) {
    console.error('获取模板详情失败:', error);
    ElMessage.error('获取模板详情失败');
  } finally {
    loading.value = false;
  }
};

// 处理刷新
const handleRefresh = () => {
  getDetail();
};

// 获取系统类型标签类型
const getSystemTypeTagType = (systemType: string): string => {
  const typeMap: Record<string, string> = {
    SOLID: 'primary',
    LIQUID: 'success',
    POWDER: 'warning',
    BURNER: 'danger'
  };
  return typeMap[systemType] || 'info';
};

// 获取系统类型文本
const getSystemTypeText = (systemType: string): string => {
  const textMap: Record<string, string> = {
    SOLID: '固态',
    LIQUID: '液态',
    POWDER: '粉盐',
    BURNER: '燃烧器'
  };
  return textMap[systemType] || systemType;
};

// 获取状态标签类型
const getStatusTagType = (status: string): string => {
  const typeMap: Record<string, string> = {
    DRAFT: 'info',
    ACTIVE: 'success',
    ARCHIVED: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '启用',
    ARCHIVED: '归档'
  };
  return textMap[status] || status;
};

// 关闭
const handleClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.equipment-system-template-detail {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-weight: 600;
    font-size: 16px;
  }

  .stat-item {
    text-align: center;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;

      &.text-success {
        color: #67c23a;
      }

      &.text-primary {
        color: #409eff;
      }

      &.text-warning {
        color: #e6a23c;
      }

      &.text-info {
        color: #909399;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }

  .mt-4 {
    margin-top: 20px;
  }
}
</style>

