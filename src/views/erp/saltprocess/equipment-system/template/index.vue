<template>
  <div class="equipment-system-template-management p-2">
    <!-- 搜索筛选区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="queryParams.templateName" placeholder="请输入模板名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="模板编码" prop="templateCode">
            <el-input v-model="queryParams.templateCode" placeholder="请输入模板编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="系统类型" prop="systemType">
            <el-select v-model="queryParams.systemType" placeholder="请选择系统类型" clearable style="width: 180px">
              <el-option label="固态" value="SOLID" />
              <el-option label="液态" value="LIQUID" />
              <el-option label="粉盐" value="POWDER" />
              <el-option label="燃烧器" value="BURNER" />
            </el-select>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-input v-model="queryParams.category" placeholder="请输入分类" clearable style="width: 180px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 180px">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="启用" value="ACTIVE" />
              <el-option label="归档" value="ARCHIVED" />
            </el-select>
          </el-form-item>
          <el-form-item label="标准模板" prop="isStandard">
            <el-select v-model="queryParams.isStandard" placeholder="请选择" clearable style="width: 120px">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <!-- 操作按钮区域 -->
    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:add']">
              新增模板
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:edit']"
            >
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:remove']"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 模板列表 -->
      <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange" @row-click="handleRowClick" style="cursor: pointer">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模板编码" prop="templateCode" width="180" show-overflow-tooltip />
        <el-table-column label="模板名称" prop="templateName" min-width="200" show-overflow-tooltip />
        <el-table-column label="系统类型" prop="systemType" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSystemTypeTagType(scope.row.systemType)" size="small">
              {{ getSystemTypeText(scope.row.systemType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="category" width="120" align="center" />
        <el-table-column label="版本" prop="version" width="80" align="center" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标准模板" prop="isStandard" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isStandard" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="子系统数量" prop="subsystemCount" width="110" align="center">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.subsystemCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总子项数" prop="totalItems" width="100" align="center">
          <template #default="scope">
            <el-tag type="success" size="small">{{ scope.row.totalItems || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总物料数" prop="totalMaterials" width="100" align="center">
          <template #default="scope">
            <el-tag type="warning" size="small">{{ scope.row.totalMaterials || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button link type="primary" icon="View" @click.stop="handleView(scope.row)" v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:query']" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)" v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:edit']" />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button
                link
                type="success"
                icon="DocumentCopy"
                @click.stop="handleCopy(scope.row)"
                v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:add']"
              />
            </el-tooltip>
            <el-tooltip content="发布" placement="top" v-if="scope.row.status === 'DRAFT'">
              <el-button link type="success" icon="Check" @click.stop="handlePublish(scope.row)" v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click.stop="handleDelete(scope.row)" v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 新增/修改模板对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <equipment-system-template-form
        v-if="dialog.visible"
        ref="templateFormRef"
        :template-id="dialog.templateId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 模板详情对话框 -->
    <el-dialog title="模板详情" v-model="detailDialog.visible" width="1400px" append-to-body>
      <equipment-system-template-detail v-if="detailDialog.visible" :template-id="detailDialog.templateId" @close="detailDialog.visible = false" />
    </el-dialog>
  </div>
</template>

<script setup name="EquipmentSystemTemplateManagement" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  listEquipmentSystemTemplate,
  delEquipmentSystemTemplate,
  publishEquipmentSystemTemplate,
  copyEquipmentSystemTemplate
} from '@/api/erp/saltprocess/equipment-system/template';
import type { EquipmentSystemTemplateQuery, EquipmentSystemTemplateVO } from '@/api/erp/saltprocess/equipment-system/types';
import { parseTime } from '@/utils/ruoyi';
import EquipmentSystemTemplateForm from './components/EquipmentSystemTemplateForm.vue';
import EquipmentSystemTemplateDetail from './components/EquipmentSystemTemplateDetail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const templateList = ref<EquipmentSystemTemplateVO[]>([]);

// 查询参数
const queryParams = reactive<EquipmentSystemTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  templateName: '',
  templateCode: '',
  systemType: undefined,
  category: '',
  status: undefined,
  isStandard: undefined
});

// 对话框
const dialog = reactive<{
  visible: boolean;
  title: string;
  templateId: string | number;
}>({
  visible: false,
  title: '',
  templateId: ''
});

const detailDialog = reactive<{
  visible: boolean;
  templateId: string | number;
}>({
  visible: false,
  templateId: ''
});

// 表单引用
const queryFormRef = ref();
const templateFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
});

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await listEquipmentSystemTemplate(queryParams);
    const actualResponse = response as any;
    templateList.value = actualResponse.rows || [];
    total.value = actualResponse.total || 0;
  } catch (error) {
    console.error('获取模板列表失败:', error);
    ElMessage.error('获取模板列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置搜索
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 多选框选中数据
const handleSelectionChange = (selection: EquipmentSystemTemplateVO[]) => {
  ids.value = selection.map(item => item.id as number);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 行点击
const handleRowClick = (row: EquipmentSystemTemplateVO) => {
  handleView(row);
};

// 新增
const handleAdd = () => {
  dialog.title = '新增模板';
  dialog.templateId = '';
  dialog.visible = true;
};

// 修改
const handleUpdate = (row?: EquipmentSystemTemplateVO) => {
  const templateId = row?.id || ids.value[0];
  dialog.title = '修改模板';
  dialog.templateId = templateId;
  dialog.visible = true;
};

// 查看详情
const handleView = (row: EquipmentSystemTemplateVO) => {
  detailDialog.templateId = row.id;
  detailDialog.visible = true;
};

// 删除
const handleDelete = async (row?: EquipmentSystemTemplateVO) => {
  const templateIds = row?.id ? [row.id] : ids.value;
  const templateNames = row?.templateName
    ? [row.templateName]
    : templateList.value.filter(item => templateIds.includes(item.id as number)).map(item => item.templateName);

  try {
    await ElMessageBox.confirm(`是否确认删除模板"${templateNames.join('、')}"？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delEquipmentSystemTemplate(templateIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模板失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 导出
const handleExport = () => {
  proxy?.download('erp/saltprocess/equipmentSystemTemplate/export', {
    ...queryParams
  }, `equipment_system_template_${new Date().getTime()}.xlsx`);
};

// 复制模板
const handleCopy = async (row: EquipmentSystemTemplateVO) => {
  try {
    await ElMessageBox.confirm(`是否确认复制模板"${row.templateName}"?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });

    const response = await copyEquipmentSystemTemplate(row.id);
    ElMessage.success(`复制成功,新模板ID: ${response.data}`);
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制模板失败:', error);
      ElMessage.error('复制失败');
    }
  }
};

// 发布模板
const handlePublish = async (row?: EquipmentSystemTemplateVO): Promise<void> => {
  const templateId = row?.id || ids.value[0];
  if (!templateId) {
    ElMessage.warning('请选择要发布的模板');
    return;
  }

  try {
    await ElMessageBox.confirm('确认发布该模板吗？发布后可用于创建项目设备系统', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await publishEquipmentSystemTemplate(templateId);
    ElMessage.success('发布成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('发布失败:', error);
      ElMessage.error('发布失败');
    }
  }
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

// 表单提交成功
const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};
</script>

<style scoped lang="scss">
.equipment-system-template-management {
  .search-card {
    margin-bottom: 10px;
  }

  .toolbar-card {
    margin-bottom: 10px;
  }

  .table-card {
    .el-table {
      ::v-deep(.el-table__row) {
        cursor: pointer;

        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
}
</style>

