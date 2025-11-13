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
        <el-table-column label="添加方式" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.mode === 'reference' ? 'success' : 'info'" size="small">
              {{ scope.row.mode === 'reference' ? '引用模板' : '新建模板' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="子系统名称" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ getSubsystemDisplayName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" align="center">
          <template #default="scope">
            {{ getSubsystemTypeText(scope.row.subsystemType) }}
          </template>
        </el-table-column>
        <el-table-column prop="sequenceNumber" label="排序号" width="100" align="center" />
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template #default="scope">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Menu } from '@element-plus/icons-vue';
import type { SubsystemTemplateForm } from '@/api/erp/saltprocess/equipment-system/types';
import { getEquipmentSystemTemplate, updateEquipmentSystemTemplate } from '@/api/erp/saltprocess/equipment-system/template';
import { getSubsystemTemplate } from '@/api/erp/subsystem/template';
import SubsystemTemplateSelector from './SubsystemTemplateSelector.vue';

// Props
interface Props {
  templateId: string | number;
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

// 计算已添加的子系统模板ID列表
const existingTemplateIds = computed(() => {
  return subsystemList.value
    .filter((item: any) => item.mode === 'reference' && item.referenceTemplateId)
    .map((item: any) => item.referenceTemplateId as number);
});

// 加载子系统列表
const loadSubsystemList = async () => {
  loading.value = true;
  try {
    const res = await getEquipmentSystemTemplate(props.templateId);
    const data = res.data as any;

    if (data.subsystemTemplates && Array.isArray(data.subsystemTemplates)) {
      // 为每个引用的子系统模板获取名称
      const subsystemTemplatesWithNames = await Promise.all(
        data.subsystemTemplates.map(async (item: any) => {
          const mode = item.referenceTemplateId ? 'reference' : 'create';
          let referenceTemplateName = undefined;

          if (mode === 'reference' && item.referenceTemplateId) {
            try {
              const templateRes = await getSubsystemTemplate(item.referenceTemplateId);
              referenceTemplateName = (templateRes.data as any).templateName;
            } catch (error) {
              console.error(`获取子系统模板名称失败 (ID: ${item.referenceTemplateId}):`, error);
            }
          }

          return {
            ...item,
            mode,
            referenceTemplateName
          };
        })
      );

      subsystemList.value = subsystemTemplatesWithNames;
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

// 监听templateId变化
watch(
  () => props.templateId,
  (newVal) => {
    if (newVal) {
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
    // 添加到列表
    const newSubsystems = newSubsystemList.map((item, index) => ({
      ...item,
      sequenceNumber: subsystemList.value.length + index + 1
    }));

    // 更新到后端
    await saveSubsystems([...subsystemList.value, ...newSubsystems]);

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


