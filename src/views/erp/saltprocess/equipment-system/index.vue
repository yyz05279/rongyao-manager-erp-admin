<template>
  <div class="project-equipment-system-management p-2">
    <!-- 搜索筛选区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
          <el-form-item label="系统名称" prop="systemName">
            <el-input v-model="queryParams.systemName" placeholder="请输入系统名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="系统编码" prop="systemCode">
            <el-input v-model="queryParams.systemCode" placeholder="请输入系统编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="项目ID" prop="projectId">
            <el-input v-model="queryParams.projectId" placeholder="请输入项目ID" clearable style="width: 180px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="系统类型" prop="systemType">
            <el-select v-model="queryParams.systemType" placeholder="请选择系统类型" clearable style="width: 180px">
              <el-option label="固态" value="SOLID" />
              <el-option label="液态" value="LIQUID" />
              <el-option label="粉盐" value="POWDER" />
              <el-option label="燃烧器" value="BURNER" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 180px">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="活跃" value="ACTIVE" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已归档" value="ARCHIVED" />
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:add']">
              新增
            </el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="success" plain icon="Link" @click="handleAssociate" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:add']">
              从模板关联
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['erp:saltprocess:projectEquipmentSystem:edit']"
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
              v-hasPermi="['erp:saltprocess:projectEquipmentSystem:remove']"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 设备系统列表 -->
      <el-table v-loading="loading" :data="systemList" @selection-change="handleSelectionChange" @row-click="handleRowClick" style="cursor: pointer">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="系统编码" prop="systemCode" width="180" show-overflow-tooltip />
        <el-table-column label="系统名称" prop="systemName" min-width="200" show-overflow-tooltip />
        <el-table-column label="项目名称" prop="projectName" width="150" show-overflow-tooltip />
        <el-table-column label="系统类型" prop="systemType" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSystemTypeTagType(scope.row.systemType)" size="small">
              {{ getSystemTypeText(scope.row.systemType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="category" width="120" align="center" />
        <el-table-column label="负责人" prop="responsiblePerson" width="100" align="center" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
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
        <el-table-column label="总重量(kg)" prop="totalWeight" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.totalWeight?.toFixed(2) || '-' }}</span>
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
              <el-button link type="primary" icon="View" @click.stop="handleView(scope.row)" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:query']" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:edit']" />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button
                link
                type="success"
                icon="DocumentCopy"
                @click.stop="handleCopy(scope.row)"
                v-hasPermi="['erp:saltprocess:projectEquipmentSystem:add']"
              />
            </el-tooltip>
            <el-dropdown @command="createDropdownHandler(scope.row)" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:edit']">
              <el-button link type="info" icon="More" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="active" :disabled="scope.row.status === 'ACTIVE'">
                    <el-icon><Check /></el-icon> 激活
                  </el-dropdown-item>
                  <el-dropdown-item command="completed" :disabled="scope.row.status === 'COMPLETED'">
                    <el-icon><CircleCheck /></el-icon> 完成
                  </el-dropdown-item>
                  <el-dropdown-item command="archived" :disabled="scope.row.status === 'ARCHIVED'">
                    <el-icon><FolderOpened /></el-icon> 归档
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click.stop="handleDelete(scope.row)" v-hasPermi="['erp:saltprocess:projectEquipmentSystem:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 新增/修改设备系统对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <project-equipment-system-form
        v-if="dialog.visible"
        ref="systemFormRef"
        :system-id="dialog.systemId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 设备系统详情对话框 -->
    <el-dialog title="设备系统详情" v-model="detailDialog.visible" width="1400px" append-to-body>
      <project-equipment-system-detail v-if="detailDialog.visible" :system-id="detailDialog.systemId" @close="detailDialog.visible = false" />
    </el-dialog>

    <!-- 关联设备系统对话框 -->
    <project-equipment-system-associate-form
      v-if="associateDialog.visible"
      v-model:visible="associateDialog.visible"
      @success="handleAssociateSuccess"
    />
  </div>
</template>

<script setup name="ProjectEquipmentSystemManagement" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  listProjectEquipmentSystem,
  delProjectEquipmentSystem,
  updateSystemStatus,
  copyProjectEquipmentSystem
} from '@/api/erp/saltprocess/equipment-system';
import type { ProjectEquipmentSystemQuery, ProjectEquipmentSystemVO } from '@/api/erp/saltprocess/equipment-system/types';
import { parseTime } from '@/utils/ruoyi';
import ProjectEquipmentSystemForm from './components/ProjectEquipmentSystemForm.vue';
import ProjectEquipmentSystemAssociateForm from './components/ProjectEquipmentSystemAssociateForm.vue';
import ProjectEquipmentSystemDetail from './components/ProjectEquipmentSystemDetail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const systemList = ref<ProjectEquipmentSystemVO[]>([]);
// 查询参数
const queryParams = reactive<ProjectEquipmentSystemQuery>({
  pageNum: 1,
  pageSize: 10,
  projectId: undefined,
  systemName: '',
  systemCode: '',
  systemType: undefined,
  status: undefined
});

// 对话框
const dialog = reactive<{
  visible: boolean;
  title: string;
  systemId: string | number;
}>({
  visible: false,
  title: '',
  systemId: ''
});

const associateDialog = reactive({
  visible: false
});

const detailDialog = reactive<{
  visible: boolean;
  systemId: string | number;
}>({
  visible: false,
  systemId: ''
});

// 表单引用
const queryFormRef = ref();
const systemFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
});

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await listProjectEquipmentSystem(queryParams);
    const actualResponse = response as any;
    systemList.value = actualResponse.rows || [];
    total.value = actualResponse.total || 0;
  } catch (error) {
    console.error('获取设备系统列表失败:', error);
    ElMessage.error('获取设备系统列表失败');
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
const handleSelectionChange = (selection: ProjectEquipmentSystemVO[]) => {
  ids.value = selection.map(item => item.id as number);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 行点击
const handleRowClick = (row: ProjectEquipmentSystemVO) => {
  handleView(row);
};

// 新增
const handleAdd = () => {
  dialog.title = '新增设备系统';
  dialog.systemId = '';
  dialog.visible = true;
};

// 修改
const handleUpdate = (row?: ProjectEquipmentSystemVO) => {
  const systemId = row?.id || ids.value[0];
  dialog.title = '修改设备系统';
  dialog.systemId = systemId;
  dialog.visible = true;
};

// 查看详情
const handleView = (row: ProjectEquipmentSystemVO) => {
  detailDialog.systemId = row.id;
  detailDialog.visible = true;
};

// 关联
const handleAssociate = () => {
  associateDialog.visible = true;
};

// 关联成功
const handleAssociateSuccess = () => {
  associateDialog.visible = false;
  getList();
};

// 删除
const handleDelete = async (row?: ProjectEquipmentSystemVO) => {
  const systemIds = row?.id ? [row.id] : ids.value;
  const systemNames = row?.systemName
    ? [row.systemName]
    : systemList.value.filter(item => systemIds.includes(item.id as number)).map(item => item.systemName);

  try {
    await ElMessageBox.confirm(`是否确认删除设备系统"${systemNames.join('、')}"？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delProjectEquipmentSystem(systemIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除设备系统失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 导出
const handleExport = () => {
  proxy?.download(
    'erp/saltprocess/projectEquipmentSystem/export',
    {
      ...queryParams
    },
    `project_equipment_system_${new Date().getTime()}.xlsx`
  );
};

// 复制设备系统
const handleCopy = async (row: ProjectEquipmentSystemVO) => {
  try {
    await ElMessageBox.confirm(`是否确认复制设备系统"${row.systemName}"?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });

    const response = await copyProjectEquipmentSystem(row.id);
    ElMessage.success(`复制成功,新设备系统ID: ${response.data}`);
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制设备系统失败:', error);
      ElMessage.error('复制失败');
    }
  }
};

// 下拉菜单命令包装函数工厂
const createDropdownHandler = (row: ProjectEquipmentSystemVO) => {
  return (command: string) => {
    handleCommand(command, row);
  };
};

// 下拉菜单命令处理
const handleCommand = async (command: string, row: ProjectEquipmentSystemVO): Promise<void> => {
  const statusMap: Record<string, { status: string; text: string }> = {
    active: { status: 'ACTIVE', text: '激活' },
    completed: { status: 'COMPLETED', text: '完成' },
    archived: { status: 'ARCHIVED', text: '归档' }
  };

  const config = statusMap[command];
  if (!config) return;

  try {
    await updateSystemStatus(row.id, config.status);
    ElMessage.success(`已设置为${config.text}状态`);
    getList();
  } catch (error) {
    console.error('更新状态失败:', error);
    ElMessage.error('更新状态失败');
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
    COMPLETED: 'primary',
    ARCHIVED: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '活跃',
    COMPLETED: '已完成',
    ARCHIVED: '已归档'
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
.project-equipment-system-management {
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

