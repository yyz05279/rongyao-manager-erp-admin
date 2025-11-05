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
          {{ templateInfo.subsystemCode }}
        </el-descriptions-item>
        <el-descriptions-item label="模板名称">
          {{ templateInfo.subsystemName }}
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          {{ templateInfo.category || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(templateInfo.status)" size="small">
            {{ getStatusText(templateInfo.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="子项数量">
          <el-tag type="primary">{{ templateInfo.totalItems || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="物料数量">
          <el-tag type="warning">{{ templateInfo.totalMaterials || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总重量"> {{ templateInfo.totalWeight?.toFixed(2) || '-' }} kg </el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ templateInfo.priority || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始日期">
          {{ templateInfo.startDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="结束日期">
          {{ templateInfo.endDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ templateInfo.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(templateInfo.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ parseTime(templateInfo.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 子项和物料列表 -->
    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="title">子项和物料列表</span>
          <div class="header-actions">
            <el-button type="primary" icon="Plus" size="small" @click="handleAddSubItem"> 新增子项 </el-button>
          </div>
        </div>
      </template>

      <!-- 子项展开列表 -->
      <el-collapse v-model="activeSubItems" accordion>
        <el-collapse-item v-for="subItem in subItemList" :key="subItem.id" :name="subItem.id">
          <template #title>
            <div class="subitem-header">
              <div class="subitem-info">
                <el-tag type="primary" size="small">子项</el-tag>
                <span class="subitem-code">{{ subItem.itemCode }}</span>
                <span class="subitem-name">{{ subItem.itemName }}</span>
                <el-tag type="info" size="small"> 物料: {{ subItem.materialCount || 0 }} </el-tag>
              </div>
              <div class="subitem-actions">
                <el-button link type="primary" icon="Plus" size="small" @click.stop="handleAddMaterial(subItem)"> 添加物料 </el-button>
                <el-button link type="primary" icon="Edit" size="small" @click.stop="handleEditSubItem(subItem)"> 编辑 </el-button>
                <el-button link type="danger" icon="Delete" size="small" @click.stop="handleDeleteSubItem(subItem)"> 删除 </el-button>
              </div>
            </div>
          </template>

          <!-- 物料列表 -->
          <el-table :data="subItem.materials || []" border size="small" style="margin-top: 10px;">
            <el-table-column label="物料编码" prop="materialCode" width="150" />
            <el-table-column label="物料名称" prop="materialName" width="150" />
            <el-table-column label="规格型号" prop="specification" width="120" />
            <el-table-column label="数量" prop="quantity" width="80" align="center" />
            <el-table-column label="单位" prop="unit" width="80" align="center" />
            <el-table-column label="单重(kg)" prop="unitWeight" width="100" align="center" />
            <el-table-column label="总重(kg)" prop="totalWeight" width="100" align="center" />
            <el-table-column label="制造商" prop="manufacturer" width="120" />
            <el-table-column label="易碎品" prop="isFragile" width="80" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.isFragile === 1 ? 'warning' : 'info'" size="small">
                  {{ scope.row.isFragile === 1 ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="危险品" prop="isHazardous" width="80" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.isHazardous === 1 ? 'danger' : 'info'" size="small">
                  {{ scope.row.isHazardous === 1 ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150" fixed="right">
              <template #default="scope">
                <el-button link type="primary" icon="Edit" size="small" @click="handleEditMaterial(scope.row)"> 编辑 </el-button>
                <el-button link type="danger" icon="Delete" size="small" @click="handleDeleteMaterial(scope.row)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!subItem.materials || subItem.materials.length === 0" description="暂无物料数据" />
        </el-collapse-item>
      </el-collapse>

      <el-empty v-if="subItemList.length === 0" description="暂无子项数据" />
    </el-card>

    <!-- 新增/编辑子项对话框 -->
    <el-dialog :title="subItemDialog.title" v-model="subItemDialog.visible" width="600px" append-to-body>
      <sub-item-form
        v-if="subItemDialog.visible"
        :subsystem-id="templateId"
        :sub-item-id="subItemDialog.subItemId"
        @success="handleSubItemFormSuccess"
        @cancel="subItemDialog.visible = false"
      />
    </el-dialog>

    <!-- 新增/编辑物料对话框 -->
    <el-dialog :title="materialDialog.title" v-model="materialDialog.visible" width="900px" append-to-body>
      <material-form
        v-if="materialDialog.visible"
        :sub-item-id="materialDialog.subItemId"
        :material-id="materialDialog.materialId"
        @success="handleMaterialFormSuccess"
        @cancel="materialDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SubsystemTemplateDetail'
});
</script>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSubsystemTemplate } from '@/api/erp/subsystem/template';
import { delSubsystemItem, delSubsystemMaterial, listSubsystemMaterial } from '@/api/erp/subsystem';
import type { SubsystemTemplateDetailVO, SubsystemItemVO, SubsystemMaterialVO } from '@/api/erp/subsystem/types';
import { parseTime } from '@/utils/ruoyi';
import SubItemForm from '../../../subsystem/components/SubItemForm.vue';
import MaterialForm from '../../../subsystem/components/MaterialForm.vue';

// Props
interface Props {
  templateId: string | number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
}>();

// 子项详情（包含物料列表）
interface SubItemDetail extends SubsystemItemVO {
  materials?: SubsystemMaterialVO[];
}

// 响应式数据
const loading = ref(false);
const templateInfo = ref<Partial<SubsystemTemplateDetailVO>>({});
const subItemList = ref<SubItemDetail[]>([]);
const activeSubItems = ref<(string | number)[]>([]);

// 对话框
const subItemDialog = reactive({
  visible: false,
  title: '',
  subItemId: ''
});

const materialDialog = reactive({
  visible: false,
  title: '',
  subsystemId: '',
  subItemId: '',
  materialId: ''
});

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
    subItemList.value = res.data.items || [];

    // 为每个子项加载物料列表
    await loadSubItemMaterials();
  } catch (error) {
    console.error('获取模板详情失败:', error);
    ElMessage.error('获取模板详情失败');
  } finally {
    loading.value = false;
  }
};

// 加载子项的物料列表
const loadSubItemMaterials = async () => {
  for (const subItem of subItemList.value) {
    try {
      const res = await listSubsystemMaterial({
        subsystemId: Number(props.templateId),
        itemId: subItem.id,
        pageNum: 1,
        pageSize: 100
      });
      const actualResponse = res as any;
      subItem.materials = actualResponse.rows || [];
    } catch (error) {
      console.error(`加载子项 ${subItem.id} 的物料列表失败:`, error);
      subItem.materials = [];
    }
  }
};

// ========== 子项操作 ==========

// 新增子项
const handleAddSubItem = () => {
  subItemDialog.title = '新增子项';
  subItemDialog.subItemId = '';
  subItemDialog.visible = true;
};

// 编辑子项
const handleEditSubItem = (subItem: SubItemDetail) => {
  subItemDialog.title = '编辑子项';
  subItemDialog.subItemId = subItem.id;
  subItemDialog.visible = true;
};

// 删除子项
const handleDeleteSubItem = async (subItem: SubItemDetail) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除子项"${subItem.itemName}"？删除后其下的物料也将被删除。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await delSubsystemItem(subItem.id);
    ElMessage.success('删除成功');
    getDetail();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除子项失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 子项表单提交成功
const handleSubItemFormSuccess = () => {
  subItemDialog.visible = false;
  getDetail();
};

// ========== 物料操作 ==========

// 新增物料
const handleAddMaterial = (subItem: SubItemDetail) => {
  materialDialog.title = '新增物料';
  materialDialog.subItemId = String(subItem.id);
  materialDialog.subsystemId = String(props.templateId);
  materialDialog.materialId = '';
  materialDialog.visible = true;
};

// 编辑物料
const handleEditMaterial = (material: SubsystemMaterialVO) => {
  materialDialog.title = '编辑物料';
  materialDialog.subsystemId = String(props.templateId);
  materialDialog.subItemId = String(material.itemId);
  materialDialog.materialId = String(material.id);
  materialDialog.visible = true;
};

// 删除物料
const handleDeleteMaterial = async (material: SubsystemMaterialVO) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除物料"${material.materialName}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await delSubsystemMaterial(material.id);
    ElMessage.success('删除成功');
    getDetail();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 物料表单提交成功
const handleMaterialFormSuccess = () => {
  materialDialog.visible = false;
  getDetail();
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
    ACTIVE: '生效',
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

  .subitem-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-right: 20px;

    .subitem-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .subitem-code {
        font-weight: 600;
        color: #409eff;
      }

      .subitem-name {
        font-size: 14px;
        color: #606266;
      }
    }

    .subitem-actions {
      display: flex;
      gap: 8px;
    }
  }

  ::v-deep(.el-collapse-item__header) {
    height: auto;
    line-height: normal;
    padding: 12px 0;
  }

  ::v-deep(.el-collapse-item__content) {
    padding-bottom: 15px;
  }
}
</style>

