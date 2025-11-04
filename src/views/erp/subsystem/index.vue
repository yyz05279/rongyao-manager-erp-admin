<template>
  <div class="subsystem-management p-2">
    <!-- 搜索筛选区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
          <el-form-item label="子系统名称" prop="subsystemName">
            <el-input
              v-model="queryParams.subsystemName"
              placeholder="请输入子系统名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="子系统编码" prop="subsystemCode">
            <el-input
              v-model="queryParams.subsystemCode"
              placeholder="请输入子系统编码"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="子项数量" prop="subItemCount" width="100" align="center">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.subItemCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物料数量" prop="materialCount" width="100" align="center">
          <template #default="scope">
            <el-tag type="warning" size="small">{{ scope.row.materialCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总重量(kg)" prop="totalWeight" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.totalWeight?.toFixed(2) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总体积(m³)" prop="totalVolume" width="120" align="center">
          <template #default="scope">
            <span>{{ scope.row.totalVolume?.toFixed(2) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width" fixed="right">
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
import { listSubsystem, delSubsystem, getSubsystemStatistics } from '@/api/erp/subsystem';
import type { SubsystemQuery, SubsystemVO } from '@/api/erp/subsystem/types';
import { parseTime } from '@/utils/ruoyi';
import SubsystemForm from './components/SubsystemForm.vue';
import SubsystemDetail from './components/SubsystemDetail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
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
  status: undefined
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  subsystemId: ''
});

const detailDialog = reactive({
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

