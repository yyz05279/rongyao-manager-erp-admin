<template>
  <div class="project-management">
    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目编码" prop="projectCode">
          <el-input
            v-model="queryParams.projectCode"
            placeholder="请输入项目编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="规划中" value="PLANNING" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已暂停" value="SUSPENDED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="queryParams.projectType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="二元化盐" value="BINARY_SALT" />
            <el-option label="三元化盐" value="TERNARY_SALT" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="managerId">
          <el-select v-model="queryParams.managerId" placeholder="请选择负责人" clearable style="width: 150px">
            <el-option
              v-for="manager in managerList"
              :key="manager.id"
              :label="manager.name"
              :value="manager.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['saltprocess:project:add']"
          >
            新增项目
          </el-button>
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['saltprocess:project:edit']"
          >
            修改
          </el-button>
        </el-col> -->
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['saltprocess:project:remove']"
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
            v-hasPermi="['saltprocess:project:export']"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
    </el-card>

    <!-- 项目列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="projectList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="项目编码" prop="projectCode" width="120" />
        <el-table-column label="项目名称" prop="projectName" min-width="200" show-overflow-tooltip />
        <el-table-column label="项目类型" prop="projectType" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getProjectTypeTag(scope.row.projectType)">
              {{ getProjectTypeText(scope.row.projectType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="项目状态" prop="status" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" prop="progress" width="120" align="center">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.progress"
              :status="getProgressStatus(scope.row.progress)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="当前阶段" prop="currentPhase" width="120" align="center" />
        <el-table-column label="项目负责人" prop="managerName" width="120" align="center" />
        <el-table-column label="开始时间" prop="startDate" width="120" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="endDate" width="120" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click.stop="handleView(scope.row)"
                v-hasPermi="['saltprocess:project:query']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['saltprocess:project:edit']"
              />
            </el-tooltip>
            <!-- <el-tooltip content="复制" placement="top">
              <el-button
                link
                type="success"
                icon="CopyDocument"
                @click.stop="handleCopy(scope.row)"
                v-hasPermi="['saltprocess:project:add']"
              />
            </el-tooltip> -->
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['saltprocess:project:remove']"
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

    <!-- 项目表单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <project-form
        v-if="dialog.visible"
        ref="projectFormRef"
        :project-id="dialog.projectId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 项目详情对话框 -->
    <el-dialog title="项目详情" v-model="detailDialog.visible" width="1200px" append-to-body>
      <project-detail
        v-if="detailDialog.visible"
        :project-id="detailDialog.projectId"
        @close="detailDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="SaltProcessProject" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// import { Search, Refresh, Plus, Edit, Delete, Download, View, CopyDocument } from '@element-plus/icons-vue';
import {
  listSaltProject,
  deleteSaltProject,
  copyProject,
  exportProjectList
} from '@/api/erp/saltprocess/project';
import type { SaltProjectQuery, SaltProjectVO } from '@/api/erp/saltprocess/project/types';
import { parseTime } from '@/utils/ruoyi';
import { getProjectTypeText, getProjectTypeTag } from '@/utils/project-type-converter';
import ProjectForm from './components/ProjectForm.vue';
import ProjectDetail from './components/ProjectDetail.vue';

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const projectList = ref<SaltProjectVO[]>([]);
const managerList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<SaltProjectQuery>({
  pageNum: 1,
  pageSize: 10,
  projectName: '',
  projectCode: '',
  status: undefined, // 修复类型错误：使用undefined而不是空字符串
  projectType: undefined, // 修复类型错误：使用undefined而不是空字符串
  managerId: ''
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  projectId: ''
});

const detailDialog = reactive({
  visible: false,
  projectId: ''
});

// 表单引用
const queryFormRef = ref();
const projectFormRef = ref();

// 生命周期
onMounted(() => {
  console.log('页面挂载，开始获取数据...');
  getList();
  getManagerList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const response = await listSaltProject(queryParams);
    console.log('API响应完整数据:', response);

    // 修复：API返回的数据结构是 {total: 4, rows: Array(4), code: 200, msg: '查询成功'}
    // 数据直接在响应根级别，不是嵌套在data属性下
    // 使用类型断言来处理实际的响应结构
    const actualResponse = response as any;
    console.log('API响应rows字段:', actualResponse.rows);
    console.log('API响应total字段:', actualResponse.total);
    console.log('API响应code字段:', actualResponse.code);
    console.log('API响应msg字段:', actualResponse.msg);

    // 检查第一条记录的详细结构
    if (actualResponse.rows && Array.isArray(actualResponse.rows) && actualResponse.rows.length > 0) {
      console.log('第一条记录详细结构:', actualResponse.rows[0]);
      console.log('第一条记录的projectType:', actualResponse.rows[0].projectType, typeof actualResponse.rows[0].projectType);
      console.log('第一条记录的status:', actualResponse.rows[0].status, typeof actualResponse.rows[0].status);
    }

    // 数据处理：确保字段不为null，并处理枚举值
    const processedRows = (actualResponse.rows || []).map((item: any) => ({
      ...item,
      // 确保基本字段不为null
      projectCode: item.projectCode || '',
      projectName: item.projectName || '未命名项目',
      managerName: item.managerName || '未分配',
      currentPhase: item.currentPhase || '未开始',
      progress: item.progress || 0,
      // 处理日期字段
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      createTime: item.createTime || '',
      // 枚举值保持原样，由显示函数处理
      projectType: item.projectType,
      status: item.status
    }));

    projectList.value = processedRows;
    total.value = actualResponse.total || 0;

    console.log('处理后的projectList:', projectList.value);
    console.log('设置后的total:', total.value);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

const getManagerList = async () => {
  // TODO: 获取负责人列表
  managerList.value = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' }
  ];
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: SaltProjectVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: SaltProjectVO) => {
  handleView(row);
};

const handleAdd = () => {
  dialog.title = '新增项目';
  dialog.projectId = '';
  dialog.visible = true;
};

const handleUpdate = (row?: SaltProjectVO) => {
  const projectId = row?.id || ids.value[0];
  dialog.title = '修改项目';
  dialog.projectId = projectId;
  dialog.visible = true;
};

const handleView = (row: SaltProjectVO) => {
  detailDialog.projectId = row.id;
  detailDialog.visible = true;
};

const handleCopy = async (row: SaltProjectVO) => {
  try {
    const { value: newProjectName } = await ElMessageBox.prompt(
      '请输入新项目名称',
      '复制项目',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '项目名称不能为空'
      }
    );
    
    await copyProject(row.id, newProjectName);
    ElMessage.success('项目复制成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('复制项目失败:', error);
      ElMessage.error('复制项目失败');
    }
  }
};

const handleDelete = async (row?: SaltProjectVO) => {
  const projectIds = row?.id ? [row.id] : ids.value;
  const projectNames = row?.projectName ? [row.projectName] : 
    projectList.value.filter(item => projectIds.includes(item.id)).map(item => item.projectName);
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除项目"${projectNames.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteSaltProject(projectIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除项目失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleExport = async () => {
  try {
    await exportProjectList(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
};

// 工具方法 - 使用导入的转换函数

const getStatusText = (status: string | number): string => {
  // 数字到字符串的映射（后端返回数字）
  const numberToStringMap = {
    1: 'PLANNING',
    2: 'IN_PROGRESS',
    3: 'COMPLETED',
    4: 'SUSPENDED',
    5: 'CANCELLED'
  };

  const stringStatus = typeof status === 'number' ? numberToStringMap[status as keyof typeof numberToStringMap] : status;

  const statusMap = {
    'PLANNING': '规划中',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'SUSPENDED': '已暂停',
    'CANCELLED': '已取消'
  };
  return statusMap[stringStatus as keyof typeof statusMap] || String(status);
};

const getStatusTag = (status: string | number): string => {
  // 数字到字符串的映射
  const numberToStringMap = {
    1: 'PLANNING',
    2: 'IN_PROGRESS',
    3: 'COMPLETED',
    4: 'SUSPENDED',
    5: 'CANCELLED'
  };

  const stringStatus = typeof status === 'number' ? numberToStringMap[status as keyof typeof numberToStringMap] : status;

  const tagMap = {
    'PLANNING': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'SUSPENDED': 'warning',
    'CANCELLED': 'danger'
  };
  return tagMap[stringStatus as keyof typeof tagMap] || '';
};

const getProgressStatus = (progress: number): string => {
  if (progress >= 100) return 'success';
  if (progress >= 80) return 'warning';
  if (progress > 0) return '';
  return 'exception';
};
</script>
