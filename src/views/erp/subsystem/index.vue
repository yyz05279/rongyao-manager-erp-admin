<template>
  <div class="subsystem-management p-2">
    <!-- 搜索筛选区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
          <el-form-item label="子系统名称" prop="subsystemName">
            <el-input
              v-model="queryParams.subsystemName"
              placeholder="请输入子系统名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="子系统编号" prop="subsystemCode">
            <el-input
              v-model="queryParams.subsystemCode"
              placeholder="请输入子系统编号"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="项目名称" prop="projectName">
            <el-input
              v-model="queryParams.projectName"
              placeholder="请输入项目名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-input
              v-model="queryParams.category"
              placeholder="请输入分类"
              clearable
              style="width: 180px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 180px">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="生效" value="ACTIVE" />
              <el-option label="停用" value="INACTIVE" />
              <el-option label="归档" value="ARCHIVED" />
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
            <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['erp:subsystem:add']"
            >
              新增子系统
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['erp:subsystem:edit']"
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
              v-hasPermi="['erp:subsystem:remove']"
            >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExport"
              v-hasPermi="['erp:subsystem:export']"
            >
              导出
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 子系统列表 -->
      <el-table
        v-loading="loading"
        :data="subsystemList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        style="cursor: pointer"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="子系统编码" prop="subsystemCode" width="150" />
        <el-table-column label="子系统名称" prop="subsystemName" min-width="180" show-overflow-tooltip />
        <el-table-column label="项目名称" prop="projectName" width="150" show-overflow-tooltip />
        <el-table-column label="分类" prop="category" width="100" align="center" />
        <el-table-column label="负责人" prop="responsiblePerson" width="100" align="center" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="子项数量" prop="totalItems" width="100" align="center">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.totalItems || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物料数量" prop="totalMaterials" width="100" align="center">
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
              <el-button
                link
                type="primary"
                icon="View"
                @click.stop="handleView(scope.row)"
                v-hasPermi="['erp:subsystem:query']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['erp:subsystem:edit']"
              />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button
                link
                type="success"
                icon="DocumentCopy"
                @click.stop="handleCopy(scope.row)"
                v-hasPermi="['erp:subsystem:add']"
              />
            </el-tooltip>
            <el-dropdown @command="(cmd) => handleCommand(cmd, scope.row)" v-hasPermi="['erp:subsystem:edit']">
              <el-button link type="info" icon="More" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="active" :disabled="scope.row.status === 'ACTIVE'">
                    <el-icon><Check /></el-icon> 生效
                  </el-dropdown-item>
                  <el-dropdown-item command="inactive" :disabled="scope.row.status === 'INACTIVE'">
                    <el-icon><Close /></el-icon> 停用
                  </el-dropdown-item>
                  <el-dropdown-item command="archived" :disabled="scope.row.status === 'ARCHIVED'">
                    <el-icon><FolderOpened /></el-icon> 归档
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['erp:subsystem:remove']"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 新增/修改子系统对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <subsystem-form
        v-if="dialog.visible"
        ref="subsystemFormRef"
        :subsystem-id="dialog.subsystemId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 子系统详情对话框 -->
    <el-dialog title="子系统详情" v-model="detailDialog.visible" width="1400px" append-to-body>
      <subsystem-detail
        v-if="detailDialog.visible"
        :subsystem-id="detailDialog.subsystemId"
        @close="detailDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="SubsystemManagement" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Close, FolderOpened } from '@element-plus/icons-vue';
import {
  listSubsystem,
  delSubsystem,
  updateSubsystemStatus,
  copySubsystem
} from '@/api/erp/subsystem';
import type { SubsystemQuery, SubsystemVO } from '@/api/erp/subsystem/types';
import { parseTime } from '@/utils/ruoyi';
import SubsystemForm from './components/SubsystemForm.vue';
import SubsystemDetail from './components/SubsystemDetail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const subsystemList = ref<SubsystemVO[]>([]);

// 查询参数
const queryParams = reactive<SubsystemQuery>({
  pageNum: 1,
  pageSize: 10,
  subsystemName: '',
  subsystemCode: '',
  projectName: '',
  category: '',
  status: undefined
});

// 对话框
const dialog = reactive<{
  visible: boolean;
  title: string;
  subsystemId: string | number;
}>({
  visible: false,
  title: '',
  subsystemId: ''
});

const detailDialog = reactive<{
  visible: boolean;
  subsystemId: string | number;
}>({
  visible: false,
  subsystemId: ''
});

// 表单引用
const queryFormRef = ref();
const subsystemFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
});

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await listSubsystem(queryParams);
    const actualResponse = response as any;
    subsystemList.value = actualResponse.rows || [];
    total.value = actualResponse.total || 0;
  } catch (error) {
    console.error('获取子系统列表失败:', error);
    ElMessage.error('获取子系统列表失败');
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
const handleSelectionChange = (selection: SubsystemVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 行点击
const handleRowClick = (row: SubsystemVO) => {
  handleView(row);
};

// 新增
const handleAdd = () => {
  dialog.title = '新增子系统';
  dialog.subsystemId = '';
  dialog.visible = true;
};

// 修改
const handleUpdate = (row?: SubsystemVO) => {
  const subsystemId = row?.id || ids.value[0];
  dialog.title = '修改子系统';
  dialog.subsystemId = subsystemId;
  dialog.visible = true;
};

// 查看详情
const handleView = (row: SubsystemVO) => {
  detailDialog.subsystemId = row.id;
  detailDialog.visible = true;
};

// 删除
const handleDelete = async (row?: SubsystemVO) => {
  const subsystemIds = row?.id ? [row.id] : ids.value;
  const subsystemNames = row?.subsystemName ? [row.subsystemName] :
    subsystemList.value.filter(item => subsystemIds.includes(item.id)).map(item => item.subsystemName);

  try {
    await ElMessageBox.confirm(
      `是否确认删除子系统"${subsystemNames.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await delSubsystem(subsystemIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除子系统失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 导出
const handleExport = () => {
  proxy?.download('erp/subsystem/export', {
    ...queryParams
  }, `subsystem_${new Date().getTime()}.xlsx`);
};

// 复制子系统
const handleCopy = async (row: SubsystemVO) => {
  try {
    await ElMessageBox.confirm(
      `是否确认复制子系统"${row.subsystemName}"?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );

    const response = await copySubsystem(row.id);
    ElMessage.success(`复制成功,新子系统ID: ${response.data}`);
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制子系统失败:', error);
      ElMessage.error('复制失败');
    }
  }
};

// 下拉菜单命令处理
const handleCommand = async (command: string, row: SubsystemVO): Promise<void> => {
  const statusMap: Record<string, { status: string; text: string }> = {
    active: { status: 'ACTIVE', text: '生效' },
    inactive: { status: 'INACTIVE', text: '停用' },
    archived: { status: 'ARCHIVED', text: '归档' }
  };

  const config = statusMap[command];
  if (!config) return;

  try {
    await updateSubsystemStatus(row.id, config.status);
    ElMessage.success(`已设置为${config.text}状态`);
    getList();
  } catch (error) {
    console.error('更新状态失败:', error);
    ElMessage.error('更新状态失败');
  }
};

// 获取状态标签类型
const getStatusTagType = (status: string): string => {
  const typeMap: Record<string, string> = {
    DRAFT: 'info',
    ACTIVE: 'success',
    INACTIVE: 'warning',
    ARCHIVED: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '生效',
    INACTIVE: '停用',
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
.subsystem-management {
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

