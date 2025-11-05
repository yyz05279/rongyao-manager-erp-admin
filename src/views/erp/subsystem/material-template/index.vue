<template>
  <div class="material-template-management p-2">
    <!-- 搜索筛选区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
          <el-form-item label="所属模板" prop="templateId">
            <el-select v-model="queryParams.templateId" placeholder="请选择模板" clearable filterable style="width: 240px" @change="handleTemplateChange">
              <el-option v-for="item in templateList" :key="item.id" :label="item.templateName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属子项" prop="itemTemplateId">
            <el-select v-model="queryParams.itemTemplateId" placeholder="请选择子项" clearable filterable style="width: 240px">
              <el-option v-for="item in itemTemplateList" :key="item.id" :label="item.itemName" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="物料名称" prop="materialName">
            <el-input v-model="queryParams.materialName" placeholder="请输入物料名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="物料编码" prop="materialCode">
            <el-input v-model="queryParams.materialCode" placeholder="请输入物料编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="是否必需" prop="isRequired">
            <el-select v-model="queryParams.isRequired" placeholder="请选择" clearable style="width: 120px">
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:subsystem:template:add']"> 新增物料 </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['erp:subsystem:template:edit']">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['erp:subsystem:template:remove']">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:subsystem:template:export']"> 导出 </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <!-- 物料列表 -->
      <el-table v-loading="loading" :data="materialList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="物料编码" prop="materialCode" width="150" show-overflow-tooltip />
        <el-table-column label="物料名称" prop="materialName" min-width="200" show-overflow-tooltip />
        <el-table-column label="所属模板" prop="templateId" width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ getTemplateName(scope.row.templateId) }}
          </template>
        </el-table-column>
        <el-table-column label="所属子项" prop="itemTemplateId" width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ getItemTemplateName(scope.row.itemTemplateId) }}
          </template>
        </el-table-column>
        <el-table-column label="规格型号" prop="specification" width="150" show-overflow-tooltip />
        <el-table-column label="默认数量" prop="defaultQuantity" width="120" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="是否必需" prop="isRequired" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isRequired" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click.stop="handleUpdate(scope.row)" v-hasPermi="['erp:subsystem:template:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click.stop="handleDelete(scope.row)" v-hasPermi="['erp:subsystem:template:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 新增/修改对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="700px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属模板" prop="templateId">
          <el-select
            v-model="form.templateId"
            placeholder="请选择模板"
            filterable
            style="width: 100%"
            :disabled="!!form.id"
            @change="handleFormTemplateChange"
          >
            <el-option v-for="item in templateList" :key="item.id" :label="item.templateName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属子项" prop="itemTemplateId">
          <el-select v-model="form.itemTemplateId" placeholder="请选择子项" filterable style="width: 100%" :disabled="!!form.id">
            <el-option v-for="item in formItemTemplateList" :key="item.id" :label="item.itemName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择物料" prop="materialId">
          <el-select
            v-model="form.materialId"
            placeholder="请选择物料"
            filterable
            remote
            :remote-method="searchMaterials"
            :loading="materialSearchLoading"
            style="width: 100%"
            :disabled="!!form.id"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.id"
              :label="`${item.materialCode || item.itemCode} - ${item.materialName || item.itemName}`"
              :value="item.id"
            >
              <span>{{ item.materialCode || item.itemCode }} - {{ item.materialName || item.itemName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.specification }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认数量" prop="defaultQuantity">
              <el-input-number v-model="form.defaultQuantity" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否必需" prop="isRequired">
              <el-switch v-model="form.isRequired" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="dialog.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MaterialTemplateManagement" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  listMaterialTemplate,
  getMaterialTemplate,
  addMaterialTemplate,
  updateMaterialTemplate,
  delMaterialTemplate
} from '@/api/erp/subsystem/material-template';
import { listItemTemplateByTemplateId } from '@/api/erp/subsystem/item-template';
import { listSubsystemTemplate } from '@/api/erp/subsystem/template';
import { listMaterial } from '@/api/erp/material/material';
import type {
  SubsystemMaterialTemplateQuery,
  SubsystemMaterialTemplateVO,
  SubsystemMaterialTemplateForm
} from '@/api/erp/subsystem/types';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const materialList = ref<SubsystemMaterialTemplateVO[]>([]);
const templateList = ref<any[]>([]);
const itemTemplateList = ref<any[]>([]);
const formItemTemplateList = ref<any[]>([]);

// 查询参数
const queryParams = reactive<SubsystemMaterialTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  templateId: undefined,
  itemTemplateId: undefined,
  materialCode: '',
  materialName: '',
  isRequired: undefined
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  loading: false
});

// 表单
const formRef = ref();
const form = reactive<SubsystemMaterialTemplateForm>({
  templateId: 0,
  itemTemplateId: 0,
  materialId: 0,
  defaultQuantity: 1,
  isRequired: true,
  remarks: ''
});

const rules = {
  templateId: [{ required: true, message: '请选择所属模板', trigger: 'change' }],
  itemTemplateId: [{ required: true, message: '请选择所属子项', trigger: 'change' }],
  materialId: [{ required: true, message: '请选择物料', trigger: 'change' }]
};

const materialSearchLoading = ref(false);
const materialOptions = ref<any[]>([]);

// 表单引用
const queryFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
  loadTemplateList();
});

// 加载模板列表
const loadTemplateList = async () => {
  try {
    const response = await listSubsystemTemplate({ pageNum: 1, pageSize: 1000 });
    templateList.value = (response as any).rows || [];
  } catch (error) {
    console.error('加载模板列表失败:', error);
  }
};

// 模板变化 - 加载子项列表
const handleTemplateChange = async (templateId: number) => {
  queryParams.itemTemplateId = undefined;
  if (templateId) {
    await loadItemTemplateList(templateId);
  } else {
    itemTemplateList.value = [];
  }
};

// 表单模板变化
const handleFormTemplateChange = async (templateId: number) => {
  form.itemTemplateId = 0;
  if (templateId) {
    await loadFormItemTemplateList(templateId);
  } else {
    formItemTemplateList.value = [];
  }
};

// 加载子项列表
const loadItemTemplateList = async (templateId: number) => {
  try {
    const response = await listItemTemplateByTemplateId(templateId);
    itemTemplateList.value = response.data || [];
  } catch (error) {
    console.error('加载子项列表失败:', error);
  }
};

// 加载表单子项列表
const loadFormItemTemplateList = async (templateId: number) => {
  try {
    const response = await listItemTemplateByTemplateId(templateId);
    formItemTemplateList.value = response.data || [];
  } catch (error) {
    console.error('加载子项列表失败:', error);
  }
};

// 获取模板名称
const getTemplateName = (templateId: number) => {
  const template = templateList.value.find(t => t.id === templateId);
  return template ? template.templateName : '-';
};

// 获取子项名称
const getItemTemplateName = (itemTemplateId: number) => {
  // 合并所有可能的子项列表
  const allItems = [...itemTemplateList.value, ...formItemTemplateList.value];
  const item = allItems.find(i => i.id === itemTemplateId);
  return item ? item.itemName : '-';
};

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await listMaterialTemplate(queryParams);
    const actualResponse = response as any;
    materialList.value = actualResponse.rows || [];
    total.value = actualResponse.total || 0;
  } catch (error) {
    console.error('获取物料列表失败:', error);
    ElMessage.error('获取物料列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  itemTemplateList.value = [];
  handleQuery();
};

// 多选框选中数据
const handleSelectionChange = (selection: SubsystemMaterialTemplateVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 新增
const handleAdd = () => {
  resetForm();
  dialog.title = '新增物料';
  dialog.visible = true;
};

// 修改
const handleUpdate = async (row?: SubsystemMaterialTemplateVO) => {
  resetForm();
  const materialId = row?.id || ids.value[0];
  try {
    const response = await getMaterialTemplate(materialId);
    Object.assign(form, response.data);

    // 加载对应的子项列表
    if (form.templateId) {
      await loadFormItemTemplateList(form.templateId);
    }

    dialog.title = '修改物料';
    dialog.visible = true;
  } catch (error) {
    console.error('获取物料详情失败:', error);
    ElMessage.error('获取物料详情失败');
  }
};

// 删除
const handleDelete = async (row?: SubsystemMaterialTemplateVO) => {
  const materialIds = row?.id ? [row.id] : ids.value;
  const materialNames = row?.materialName
    ? [row.materialName]
    : materialList.value.filter(item => materialIds.includes(item.id)).map(item => item.materialName);

  try {
    await ElMessageBox.confirm(`是否确认删除物料"${materialNames.join('、')}"？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delMaterialTemplate(materialIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 导出
const handleExport = () => {
  proxy?.download(
    'erp/subsystem/material-template/export',
    {
      ...queryParams
    },
    `material_template_${new Date().getTime()}.xlsx`
  );
};

// 搜索物料
const searchMaterials = async (query: string) => {
  if (!query) {
    materialOptions.value = [];
    return;
  }

  materialSearchLoading.value = true;
  try {
    const response = await listMaterial({
      name: query,
      pageNum: 1,
      pageSize: 20
    });
    materialOptions.value = (response as any).rows || [];
  } catch (error) {
    console.error('搜索物料失败:', error);
  } finally {
    materialSearchLoading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    dialog.loading = true;
    if (form.id) {
      await updateMaterialTemplate(form);
      ElMessage.success('修改成功');
    } else {
      await addMaterialTemplate(form);
      ElMessage.success('新增成功');
    }

    dialog.visible = false;
    getList();
  } catch (error) {
    if (error !== false) {
      console.error('保存物料失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    dialog.loading = false;
  }
};

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.templateId = 0;
  form.itemTemplateId = 0;
  form.materialId = 0;
  form.defaultQuantity = 1;
  form.isRequired = true;
  form.remarks = '';
  formItemTemplateList.value = [];
  formRef.value?.clearValidate();
};
</script>

<style scoped lang="scss">
.material-template-management {
  // 样式可以根据需要添加
}
</style>

