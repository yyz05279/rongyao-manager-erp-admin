<template>
  <div class="inspection-standard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item>巡检标准</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">巡检标准管理</h1>
        <div class="actions">
          <el-button type="primary" @click="handleAdd" v-has-permi="['erp:saltprocess:inspection-standard:add']">
            <el-icon><Plus /></el-icon>
            新增标准
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="标准名称" prop="standardName">
          <el-input
            v-model="queryParams.standardName"
            placeholder="请输入标准名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="巡检类型" prop="inspectionType">
          <el-select v-model="queryParams.inspectionType" placeholder="请选择巡检类型" clearable style="width: 150px">
            <el-option label="设备巡检" value="equipment" />
            <el-option label="工艺巡检" value="process" />
            <el-option label="安全巡检" value="safety" />
            <el-option label="质量巡检" value="quality" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="standardList" stripe border>
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="标准编号" prop="standardCode" width="150" />
        <el-table-column label="标准名称" prop="standardName" width="200" />
        <el-table-column label="巡检类型" prop="inspectionType" width="120">
          <template #default="scope">
            <el-tag :type="getInspectionTypeTag(scope.row.inspectionType)">
              {{ getInspectionTypeText(scope.row.inspectionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="巡检频率" prop="frequency" width="120" />
        <el-table-column label="检查项数量" prop="itemCount" width="100" />
        <el-table-column label="版本号" prop="version" width="100" />
        <el-table-column label="状态" prop="status" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
              {{ scope.row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="createBy" width="100" />
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleView(scope.row)"
              v-has-permi="['erp:saltprocess:inspection-standard:query']"
            >
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleEdit(scope.row)"
              v-has-permi="['erp:saltprocess:inspection-standard:edit']"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              v-has-permi="['erp:saltprocess:inspection-standard:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-show="total > 0"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标准名称" prop="standardName">
              <el-input v-model="formData.standardName" placeholder="请输入标准名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="巡检类型" prop="inspectionType">
              <el-select v-model="formData.inspectionType" placeholder="请选择巡检类型" style="width: 100%">
                <el-option label="设备巡检" value="equipment" />
                <el-option label="工艺巡检" value="process" />
                <el-option label="安全巡检" value="safety" />
                <el-option label="质量巡检" value="quality" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="巡检频率" prop="frequency">
              <el-select v-model="formData.frequency" placeholder="请选择巡检频率" style="width: 100%">
                <el-option label="每小时" value="hourly" />
                <el-option label="每班次" value="shift" />
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="formData.version" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标准描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标准描述"
          />
        </el-form-item>
        <el-form-item label="检查项配置" prop="checkItems">
          <el-input
            v-model="formData.checkItems"
            type="textarea"
            :rows="5"
            placeholder="请输入检查项配置（JSON格式）"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="1">启用</el-radio>
            <el-radio label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InspectionStandard" lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const total = ref(0);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  standardName: '',
  inspectionType: '',
  status: ''
});

const standardList = ref([]);

const formData = ref({
  standardId: undefined,
  standardName: '',
  inspectionType: '',
  frequency: '',
  version: '',
  description: '',
  checkItems: '',
  status: '1'
});

const formRules = {
  standardName: [{ required: true, message: '请输入标准名称', trigger: 'blur' }],
  inspectionType: [{ required: true, message: '请选择巡检类型', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择巡检频率', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
};

// 引用
const queryFormRef = ref();
const formRef = ref();

// 生命周期
onMounted(() => {
  getList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    // TODO: 调用API获取巡检标准列表
    // 模拟数据
    standardList.value = [
      {
        standardId: 1,
        standardCode: 'STD001',
        standardName: '预热设备巡检标准',
        inspectionType: 'equipment',
        frequency: '每班次',
        itemCount: 15,
        version: 'v1.0',
        status: '1',
        createBy: '管理员',
        createTime: '2024-12-01 10:00:00'
      }
    ];
    total.value = 1;
  } catch (error) {
    console.error('获取巡检标准列表失败:', error);
    ElMessage.error('获取巡检标准列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleAdd = () => {
  dialogTitle.value = '新增巡检标准';
  dialogVisible.value = true;
  resetForm();
};

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑巡检标准';
  dialogVisible.value = true;
  formData.value = { ...row };
};

const handleView = (row: any) => {
  // TODO: 实现查看详情
  ElMessage.info('查看功能待实现');
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该巡检标准吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // TODO: 调用删除API
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    // 用户取消删除
  }
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    
    // TODO: 调用新增/编辑API
    ElMessage.success(formData.value.standardId ? '编辑成功' : '新增成功');
    dialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const resetForm = () => {
  formData.value = {
    standardId: undefined,
    standardName: '',
    inspectionType: '',
    frequency: '',
    version: '',
    description: '',
    checkItems: '',
    status: '1'
  };
  formRef.value?.resetFields();
};

const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  queryParams.value.pageNum = val;
  getList();
};

const getInspectionTypeTag = (type: string) => {
  const tagMap = {
    equipment: 'primary',
    process: 'success',
    safety: 'danger',
    quality: 'warning'
  };
  return tagMap[type] || 'info';
};

const getInspectionTypeText = (type: string) => {
  const textMap = {
    equipment: '设备巡检',
    process: '工艺巡检',
    safety: '安全巡检',
    quality: '质量巡检'
  };
  return textMap[type] || '未知';
};
</script>

<style scoped lang="scss">
.inspection-standard-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;

      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }
    }
  }

  .search-card,
  .table-card {
    margin-bottom: 20px;
  }
}
</style>
