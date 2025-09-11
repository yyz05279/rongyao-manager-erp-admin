<template>
  <div class="process-template-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item>工艺模板</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">工艺模板管理</h1>
        <div class="actions">
          <el-button type="primary" @click="handleAdd" v-has-permi="['erp:saltprocess:process-template:add']">
            <el-icon><Plus /></el-icon>
            新增模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item label="模板名称" prop="templateName">
          <el-input
            v-model="queryParams.templateName"
            placeholder="请输入模板名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="工艺类型" prop="processType">
          <el-select v-model="queryParams.processType" placeholder="请选择工艺类型" clearable style="width: 150px">
            <el-option label="预热工艺" value="preheating" />
            <el-option label="化盐工艺" value="saltmaking" />
            <el-option label="提温工艺" value="heating" />
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
      <el-table v-loading="loading" :data="templateList" stripe border>
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="模板编号" prop="templateCode" width="150" />
        <el-table-column label="模板名称" prop="templateName" width="200" />
        <el-table-column label="工艺类型" prop="processType" width="120">
          <template #default="scope">
            <el-tag :type="getProcessTypeTag(scope.row.processType)">
              {{ getProcessTypeText(scope.row.processType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="适用产品" prop="applicableProduct" width="150" />
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
              v-has-permi="['erp:saltprocess:process-template:query']"
            >
              查看
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleEdit(scope.row)"
              v-has-permi="['erp:saltprocess:process-template:edit']"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              v-has-permi="['erp:saltprocess:process-template:remove']"
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
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="formData.templateName" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工艺类型" prop="processType">
              <el-select v-model="formData.processType" placeholder="请选择工艺类型" style="width: 100%">
                <el-option label="预热工艺" value="preheating" />
                <el-option label="化盐工艺" value="saltmaking" />
                <el-option label="提温工艺" value="heating" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="适用产品" prop="applicableProduct">
              <el-input v-model="formData.applicableProduct" placeholder="请输入适用产品" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="formData.version" placeholder="请输入版本号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="工艺参数" prop="processParams">
          <el-input
            v-model="formData.processParams"
            type="textarea"
            :rows="5"
            placeholder="请输入工艺参数（JSON格式）"
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

<script setup name="ProcessTemplate" lang="ts">
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
  templateName: '',
  processType: '',
  status: ''
});

const templateList = ref([]);

const formData = ref({
  templateId: undefined,
  templateName: '',
  processType: '',
  applicableProduct: '',
  version: '',
  description: '',
  processParams: '',
  status: '1'
});

const formRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  processType: [{ required: true, message: '请选择工艺类型', trigger: 'change' }],
  applicableProduct: [{ required: true, message: '请输入适用产品', trigger: 'blur' }],
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
    // TODO: 调用API获取工艺模板列表
    // 模拟数据
    templateList.value = [
      {
        templateId: 1,
        templateCode: 'TPL001',
        templateName: '标准预热工艺模板',
        processType: 'preheating',
        applicableProduct: '二元化盐',
        version: 'v1.0',
        status: '1',
        createBy: '管理员',
        createTime: '2024-12-01 10:00:00'
      }
    ];
    total.value = 1;
  } catch (error) {
    console.error('获取工艺模板列表失败:', error);
    ElMessage.error('获取工艺模板列表失败');
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
  dialogTitle.value = '新增工艺模板';
  dialogVisible.value = true;
  resetForm();
};

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑工艺模板';
  dialogVisible.value = true;
  formData.value = { ...row };
};

const handleView = (row: any) => {
  // TODO: 实现查看详情
  ElMessage.info('查看功能待实现');
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该工艺模板吗？', '提示', {
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
    ElMessage.success(formData.value.templateId ? '编辑成功' : '新增成功');
    dialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

const resetForm = () => {
  formData.value = {
    templateId: undefined,
    templateName: '',
    processType: '',
    applicableProduct: '',
    version: '',
    description: '',
    processParams: '',
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

const getProcessTypeTag = (type: string) => {
  const tagMap = {
    preheating: 'primary',
    saltmaking: 'success',
    heating: 'warning'
  };
  return tagMap[type] || 'info';
};

const getProcessTypeText = (type: string) => {
  const textMap = {
    preheating: '预热工艺',
    saltmaking: '化盐工艺',
    heating: '提温工艺'
  };
  return textMap[type] || '未知';
};
</script>

<style scoped lang="scss">
.process-template-container {
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
