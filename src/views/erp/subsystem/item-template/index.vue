<template>
  <div class="item-template-management p-2">
    <!-- 搜索筛选区域 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="90px">
          <el-form-item label="子项名称" prop="itemName">
            <el-input v-model="queryParams.itemName" placeholder="请输入子项名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="子项编号" prop="itemCode">
            <el-input v-model="queryParams.itemCode" placeholder="请输入子项编号" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="子项类型" prop="itemType">
            <el-input v-model="queryParams.itemType" placeholder="请输入子项类型" clearable style="width: 180px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:subsystem:template:add']"> 新增子项 </el-button>
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

      <!-- 子项列表 -->
      <el-table v-loading="loading" :data="itemList" @selection-change="handleSelectionChange" @row-click="handleRowClick">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="子项编号" prop="itemCode" width="150" show-overflow-tooltip />
        <el-table-column label="子项名称" prop="itemName" min-width="180" show-overflow-tooltip />
        <el-table-column label="子项类型" prop="itemType" width="120" align="center" />
        <el-table-column label="默认数量" prop="defaultQuantity" width="100" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="描述" prop="description" min-width="200" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看物料" placement="top">
              <el-button link type="primary" icon="View" @click.stop="handleViewMaterials(scope.row)" v-hasPermi="['erp:subsystem:template:query']" />
            </el-tooltip>
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子项名称" prop="itemName">
              <el-input v-model="form.itemName" placeholder="请输入子项名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子项类型" prop="itemType">
              <el-input v-model="form.itemType" placeholder="如:组件、部件等" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认数量" prop="defaultQuantity">
              <el-input-number v-model="form.defaultQuantity" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="如:个、台等" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="dialog.loading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 物料列表对话框 -->
    <el-dialog title="物料列表" v-model="materialDialog.visible" width="1200px" append-to-body>
      <div v-if="materialDialog.visible">
        <div class="mb-3">
          <el-button type="primary" icon="Plus" @click="handleAddMaterial" v-hasPermi="['erp:subsystem:template:add']">添加物料</el-button>
        </div>
        <el-table v-loading="materialLoading" :data="materialList" border>
          <el-table-column label="物料编码" prop="materialCode" width="150" show-overflow-tooltip />
          <el-table-column label="物料名称" prop="materialName" min-width="200" show-overflow-tooltip />
          <el-table-column label="规格型号" prop="specification" width="150" show-overflow-tooltip />
          <el-table-column label="默认数量" prop="defaultQuantity" width="120" align="center" />
          <el-table-column label="单位" prop="unit" width="80" align="center" />
          <el-table-column label="备注" prop="remarks" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleEditMaterial(scope.row)" v-hasPermi="['erp:subsystem:template:edit']">
                编辑
              </el-button>
              <el-button link type="danger" icon="Delete" @click="handleDeleteMaterial(scope.row)" v-hasPermi="['erp:subsystem:template:remove']">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 物料表单对话框 -->
    <el-dialog :title="materialFormDialog.title" v-model="materialFormDialog.visible" width="700px" append-to-body>
      <el-form ref="materialFormRef" :model="materialForm" :rules="materialRules" label-width="100px">
        <el-form-item label="选择物料" prop="materialId">
          <el-select
            v-model="materialForm.materialId"
            placeholder="请选择物料"
            filterable
            remote
            :remote-method="searchMaterials"
            :loading="materialSearchLoading"
            style="width: 100%"
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
        <el-form-item label="默认数量" prop="defaultQuantity">
          <el-input-number v-model="materialForm.defaultQuantity" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="materialForm.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="materialFormDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitMaterialForm" :loading="materialFormDialog.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ItemTemplateManagement" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  listItemTemplate,
  getItemTemplate,
  addItemTemplate,
  updateItemTemplate,
  delItemTemplate
} from '@/api/erp/subsystem/item-template';
import {
  listMaterialTemplateByItemId,
  addMaterialTemplate,
  updateMaterialTemplate,
  delMaterialTemplate
} from '@/api/erp/subsystem/material-template';
import { listMaterial } from '@/api/erp/material/material';
import type {
  SubsystemItemTemplateQuery,
  SubsystemItemTemplateVO,
  SubsystemItemTemplateForm,
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
const itemList = ref<SubsystemItemTemplateVO[]>([]);

// 查询参数
const queryParams = reactive<SubsystemItemTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  itemName: '',
  itemCode: '',
  itemType: ''
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  loading: false
});

// 表单
const formRef = ref();
const form = reactive<SubsystemItemTemplateForm>({
  itemName: '',
  itemType: '',
  description: '',
  defaultQuantity: 1,
  unit: '个',
  remarks: ''
});

const rules = {
  itemName: [{ required: true, message: '请输入子项名称', trigger: 'blur' }]
};

// 物料相关
const materialDialog = reactive({
  visible: false,
  itemId: 0,
  itemName: ''
});

const materialLoading = ref(false);
const materialList = ref<any[]>([]);

const materialFormDialog = reactive({
  visible: false,
  title: '',
  loading: false
});

const materialFormRef = ref();
const materialForm = reactive<SubsystemMaterialTemplateForm>({
  itemTemplateId: 0,
  materialId: 0,
  defaultQuantity: 1,
  remarks: ''
});

const materialRules = {
  materialId: [{ required: true, message: '请选择物料', trigger: 'change' }]
};

const materialSearchLoading = ref(false);
const materialOptions = ref<any[]>([]);

// 表单引用
const queryFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
});

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await listItemTemplate(queryParams);
    const actualResponse = response as any;
    itemList.value = actualResponse.rows || [];
    total.value = actualResponse.total || 0;
  } catch (error) {
    console.error('获取子项列表失败:', error);
    ElMessage.error('获取子项列表失败');
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
  handleQuery();
};

// 多选框选中数据
const handleSelectionChange = (selection: SubsystemItemTemplateVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 行点击
const handleRowClick = (row: SubsystemItemTemplateVO) => {
  // 可以在这里添加行点击逻辑
};

// 新增
const handleAdd = () => {
  resetForm();
  dialog.title = '新增子项';
  dialog.visible = true;
};

// 修改
const handleUpdate = async (row?: SubsystemItemTemplateVO) => {
  resetForm();
  const itemId = row?.id || ids.value[0];
  try {
    const response = await getItemTemplate(itemId);
    Object.assign(form, response.data);
    dialog.title = '修改子项';
    dialog.visible = true;
  } catch (error) {
    console.error('获取子项详情失败:', error);
    ElMessage.error('获取子项详情失败');
  }
};

// 删除
const handleDelete = async (row?: SubsystemItemTemplateVO) => {
  const itemIds = row?.id ? [row.id] : ids.value;
  const itemNames = row?.itemName
    ? [row.itemName]
    : itemList.value.filter(item => itemIds.includes(item.id)).map(item => item.itemName);

  try {
    await ElMessageBox.confirm(`是否确认删除子项"${itemNames.join('、')}"？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delItemTemplate(itemIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除子项失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 导出
const handleExport = () => {
  proxy?.download(
    'erp/subsystem/item-template/export',
    {
      ...queryParams
    },
    `item_template_${new Date().getTime()}.xlsx`
  );
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    dialog.loading = true;
    if (form.id) {
      await updateItemTemplate(form);
      ElMessage.success('修改成功');
    } else {
      await addItemTemplate(form);
      ElMessage.success('新增成功');
    }

    dialog.visible = false;
    getList();
  } catch (error) {
    if (error !== false) {
      console.error('保存子项失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    dialog.loading = false;
  }
};

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.itemName = '';
  form.itemType = '';
  form.description = '';
  form.defaultQuantity = 1;
  form.unit = '个';
  form.remarks = '';
  formRef.value?.clearValidate();
};

// 查看物料
const handleViewMaterials = (row: SubsystemItemTemplateVO) => {
  materialDialog.itemId = row.id;
  materialDialog.itemName = row.itemName;
  materialDialog.visible = true;
  loadMaterialList();
};

// 加载物料列表
const loadMaterialList = async () => {
  if (!materialDialog.itemId) return;

  materialLoading.value = true;
  try {
    const response = await listMaterialTemplateByItemId(materialDialog.itemId);
    materialList.value = response.data || [];
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
  } finally {
    materialLoading.value = false;
  }
};

// 添加物料
const handleAddMaterial = () => {
  resetMaterialForm();
  materialForm.itemTemplateId = materialDialog.itemId;
  materialFormDialog.title = '添加物料';
  materialFormDialog.visible = true;
};

// 编辑物料
const handleEditMaterial = (row: any) => {
  resetMaterialForm();
  Object.assign(materialForm, row);
  materialFormDialog.title = '编辑物料';
  materialFormDialog.visible = true;
};

// 删除物料
const handleDeleteMaterial = async (row: any) => {
  try {
    await ElMessageBox.confirm(`是否确认删除物料"${row.materialName}"？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delMaterialTemplate(row.id);
    ElMessage.success('删除成功');
    loadMaterialList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error);
      ElMessage.error('删除失败');
    }
  }
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

// 提交物料表单
const submitMaterialForm = async () => {
  try {
    await materialFormRef.value?.validate();

    materialFormDialog.loading = true;
    if (materialForm.id) {
      await updateMaterialTemplate(materialForm);
      ElMessage.success('修改成功');
    } else {
      await addMaterialTemplate(materialForm);
      ElMessage.success('添加成功');
    }

    materialFormDialog.visible = false;
    loadMaterialList();
  } catch (error) {
    if (error !== false) {
      console.error('保存物料失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    materialFormDialog.loading = false;
  }
};

// 重置物料表单
const resetMaterialForm = () => {
  materialForm.id = undefined;
  materialForm.materialId = 0;
  materialForm.defaultQuantity = 1;
  materialForm.remarks = '';
  materialFormRef.value?.clearValidate();
};
</script>

<style scoped lang="scss">
.item-template-management {
  .mb-3 {
    margin-bottom: 12px;
  }
}
</style>

