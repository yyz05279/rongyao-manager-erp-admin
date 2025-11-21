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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:subsystem:template:add']"> 新增模版 </el-button>
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
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1000px" append-to-body>
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

        <!-- 物料配置 -->
        <el-divider content-position="left">物料数据配置</el-divider>
        <el-form-item label="物料配置" prop="materials">
          <div style="width: 100%">
            <el-button 
              type="primary" 
              icon="Plus" 
              @click="handleAddItemMaterial" 
              size="small"
            >
              添加物料
            </el-button>
            <el-alert
              v-if="!form.materials || form.materials.length === 0"
              title="请至少添加一个物料"
              type="warning"
              show-icon
              :closable="false"
              style="margin-top: 10px"
            />
            <el-table
              v-if="form.materials && form.materials.length > 0"
              :data="form.materials"
              style="width: 100%; margin-top: 10px"
              border
              size="small"
              v-loading="editMaterialLoading"
            >
              <el-table-column label="序号" type="index" width="80" align="center" :index="(index) => index + 1" />
              <el-table-column label="物料名称" prop="materialName" min-width="200" show-overflow-tooltip />
              <el-table-column label="默认数量" prop="defaultQuantity" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.defaultQuantity"
                    :min="0"
                    :step="1"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="是否必需" prop="isRequired" width="100" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.isRequired" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="备注" prop="remarks" min-width="150">
                <template #default="{ row }">
                  <el-input v-model="row.remarks" placeholder="备注" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ $index }">
                  <el-button
                    link
                    type="danger"
                    icon="Delete"
                    @click="handleRemoveItemMaterial($index)"
                    size="small"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
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

    <!-- 物料选择对话框（用于子项详情中添加物料） -->
    <material-selector-dialog
      v-model="materialSelectorVisible"
      :existing-material-codes="existingMaterialCodes"
      @confirm="handleMaterialsSelected"
    />

    <!-- 物料选择对话框（用于新增子项时添加物料） -->
    <material-selector-dialog
      v-model="itemMaterialSelectorVisible"
      :existing-material-codes="itemFormMaterialCodes"
      @confirm="handleItemMaterialsSelected"
    />

    <!-- 物料编辑对话框 -->
    <el-dialog title="编辑物料" v-model="materialEditDialog.visible" width="600px" append-to-body>
      <el-form ref="materialFormRef" :model="materialForm" :rules="materialRules" label-width="100px">
        <el-form-item label="物料名称">
          <el-input :value="materialForm.materialName" disabled />
        </el-form-item>
        <el-form-item label="默认数量" prop="defaultQuantity">
          <el-input-number v-model="materialForm.defaultQuantity" :min="0" :step="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="materialForm.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="materialEditDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitMaterialEditForm" :loading="materialEditDialog.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ItemTemplateManagement" lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, ComponentInternalInstance, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import {
  listItemTemplate,
  getItemTemplate,
  addItemTemplate,
  updateItemTemplate,
  delItemTemplate,
  getItemMaterials,
  addItemMaterials,
  updateItemMaterials,
  deleteItemMaterials
} from '@/api/erp/subsystem/item-template';
import {
  addMaterialTemplate,
  addMaterialTemplateBatch
} from '@/api/erp/subsystem/material-template';
import { listMaterial } from '@/api/erp/material/material';
import type { MaterialVO } from '@/api/erp/material/material/types';
import MaterialSelectorDialog from './components/MaterialSelectorDialog.vue';
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
const ids = ref<(string | number)[]>([]);
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
  remarks: '',
  materials: [] // 物料列表
});

// ✅ 改为计算属性，实现动态验证规则
const rules = computed(() => ({
  itemName: [{ required: true, message: '请输入子项名称', trigger: 'blur' }],
  materials: [
    {
      // 仅在新增模式下，物料为必填项
      required: !form.id,
      validator: (rule: any, value: any, callback: any) => {
        if (!form.id && (!value || value.length === 0)) {
          callback(new Error('请至少添加一个物料'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
}));

// 物料相关
const materialDialog = reactive({
  visible: false,
  itemId: 0 as string | number,
  itemName: ''
});

const materialLoading = ref(false);
const materialList = ref<any[]>([]);
const materialSelectorVisible = ref(false);

// 新增子项时的物料选择
const itemMaterialSelectorVisible = ref(false);

// 编辑模式下的物料加载状态
const editMaterialLoading = ref(false);

// 记录编辑模式下的原始物料列表（用于比对变更）
const originalMaterials = ref<any[]>([]);

const materialEditDialog = reactive({
  visible: false,
  loading: false
});

const materialFormRef = ref();
const materialForm = reactive<SubsystemMaterialTemplateForm & { materialName?: string }>({
  itemTemplateId: 0,
  materialId: 0,
  materialName: '',
  defaultQuantity: 1,
  remarks: ''
});

const materialRules = {
  defaultQuantity: [{ required: true, message: '请输入默认数量', trigger: 'blur' }]
};

// 计算已存在的物料编码列表（用于物料选择对话框的去重）
const existingMaterialCodes = computed(() => {
  return materialList.value.map(item => item.materialCode).filter(Boolean);
});

// 计算新增子项表单中已选择的物料编码列表
const itemFormMaterialCodes = computed(() => {
  return form.materials?.map(item => item.materialCode).filter(Boolean) || [];
});

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
  dialog.title = '新增子项模版';
  dialog.visible = true;
};

// 修改
const handleUpdate = async (row?: SubsystemItemTemplateVO) => {
  resetForm();
  const itemId = row?.id || ids.value[0];
  try {
    // 获取子项详情
    const response = await getItemTemplate(itemId);
    Object.assign(form, response.data);
    
    // ✅ 编辑模式：加载物料列表
    if (form.id) {
      await loadEditMaterialList(form.id);
    }

    

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

// ✅ 新增：比对物料列表是否有变更
const haveMaterialsChanged = (original: any[], current: any[]) => {
  if (original.length !== current.length) {
    return true; // 数量不同，肯定有变更
  }

  // 创建一个 map 用于快速查找原始物料
  const originalMap = new Map(original.map(m => [m.id || m.materialId, m]));

  for (const material of current) {
    const key = material.id || material.materialId;
    const originalMaterial = originalMap.get(key);

    if (!originalMaterial) {
      // 在原始列表中找不到当前物料（可能是一个被删除后又新增了另一个）
      return true;
    }

    // 比较关键字段是否有变化
    // 1. 统一转换为数字进行比较，避免 "1.00" !== 1 的问题
    const originalQty = Number(originalMaterial.defaultQuantity);
    const currentQty = Number(material.defaultQuantity);

    // 2. 将 null 或 undefined 的 remarks 视为空字符串进行比较
    const originalRemarks = originalMaterial.remarks || '';
    const currentRemarks = material.remarks || '';

    if (
      originalQty !== currentQty ||
      originalMaterial.isRequired !== material.isRequired ||
      originalRemarks !== currentRemarks
    ) {
      return true;
    }
  }

  return false; // 如果所有物料都匹配，则没有变更
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    dialog.loading = true;

    if (form.id) {
      // 编辑模式
      const { materials, ...updateData } = form;
      await updateItemTemplate(updateData); // 1. 首先更新基础信息

      // 2. 检查物料是否有变更
      const materialsChanged = haveMaterialsChanged(originalMaterials.value, form.materials || []);
      if (materialsChanged) {
        await syncMaterialChanges(form.id, form.materials || [], originalMaterials.value);
        ElMessage.success('子项和物料已更新');
      } else {
        ElMessage.success('子项信息已更新');
      }
    } else {
      // 新增模式
      if (!form.materials || form.materials.length === 0) {
        ElMessage.warning('请至少添加一个物料');
        dialog.loading = false;
        return;
      }
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

// ✅ 新增：同步物料变更
const syncMaterialChanges = async (
  itemTemplateId: string | number,
  currentMaterials: any[],
  originalMaterialsList: any[]
) => {
  try {
    // 1. 找出新增的物料（没有id的记录）
    const addedMaterials = currentMaterials.filter(m => !m.id);
    if (addedMaterials.length > 0) {
      // ✅ 使用新的RESTful风格API批量添加物料
      // 注意：这里是独立的子项模板管理，不需要templateId
      const addData = addedMaterials.map(m => ({
        materialId: m.materialId,
        defaultQuantity: m.defaultQuantity,
        isRequired: m.isRequired,
        remarks: m.remarks
      }));
      await addItemMaterials(itemTemplateId as number, addData);
    }

    // 2. 找出需要更新的物料（有id且数据有变化）
    const updatedMaterials = currentMaterials.filter(m => {
      if (!m.id) return false;
      const original = originalMaterialsList.find(o => o.id === m.id);
      if (!original) return false;
      // 比较关键字段是否有变化
      return (
        m.defaultQuantity !== original.defaultQuantity ||
        m.isRequired !== original.isRequired ||
        m.remarks !== original.remarks
      );
    });
    
    if (updatedMaterials.length > 0) {
      // ✅ 使用新的RESTful批量更新接口
      const updateData = updatedMaterials.map(m => ({
        id: m.id,
        materialId: m.materialId,
        defaultQuantity: m.defaultQuantity,
        isRequired: m.isRequired,
        remarks: m.remarks
      }));
      await updateItemMaterials(itemTemplateId as number, updateData);
    }

    // 3. 找出需要删除的物料（在原始列表中但不在当前列表中）
    // 按需求：在子项编辑弹窗保存时，不再调用删除接口，仅上传当前物料数据
    const currentMaterialIds = currentMaterials.filter(m => m.id).map(m => m.id);
    const deletedMaterials = originalMaterialsList.filter(m => !currentMaterialIds.includes(m.id));
    // if (deletedMaterials.length > 0) {
    //   const deleteIds = deletedMaterials.map(m => Number(m.id));
    //   await deleteItemMaterials(Number(itemTemplateId), deleteIds);
    // }
  } catch (error) {
    console.error('同步物料变更失败:', error);
    throw error;
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
  form.materials = []; // ✅ 重置物料列表
  originalMaterials.value = []; // ✅ 重置原始物料列表
  
  formRef.value?.clearValidate();
};

// ✅ 新增：在新增子项表单中添加物料
const handleAddItemMaterial = () => {
  itemMaterialSelectorVisible.value = true;
};

// ✅ 新增：处理新增子项时选择的物料
const handleItemMaterialsSelected = (materials: MaterialVO[]) => {
  if (!form.materials) {
    form.materials = [];
  }

  materials.forEach(material => {
    // 避免重复添加（使用 materialCode 判断）
    if (!form.materials!.some(m => m.materialCode === material.materialCode)) {
      form.materials!.push({
        materialId: material.id as number,
        materialCode: material.materialCode, // 保存物料编码
        materialName: material.materialName, // 保存物料名称
        defaultQuantity: 1,
        isRequired: true,
        remarks: ''
      } as any); // 临时使用 any，后续需要更新类型定义
    }
  });

  // 手动触发表单验证
  formRef.value?.validateField('materials');
};

// ✅ 新增：移除新增子项表单中的物料
const handleRemoveItemMaterial = (index: number) => {
  if (form.materials) {
    form.materials.splice(index, 1);
    // 手动触发表单验证
    formRef.value?.validateField('materials');
  }
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
    // ✅ 修复：子项模板管理页面应该调用专门的模板物料接口
    // 该接口查询 template_id = NULL 的模板物料，不是子系统物料
    const response = await getItemMaterials(materialDialog.itemId);
    materialList.value = response.data || [];

    // 调试日志：查看物料列表数据
    console.log('========== 物料列表数据 ==========');
    console.log('materialList:', materialList.value);
    console.log('existingMaterialCodes:', existingMaterialCodes.value);
    console.log('物料编码列表:', materialList.value.map(item => item.materialCode));
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
  } finally {
    materialLoading.value = false;
  }
};

// ✅ 新增：加载编辑模式下的物料列表
const loadEditMaterialList = async (itemId: string | number) => {
  editMaterialLoading.value = true;
  try {
    const response = await getItemMaterials(itemId);
    const materials = response.data || [];
    // 将物料数据映射到表单的materials字段
    form.materials = materials.map((item: any) => ({
      id: item.id,
      materialId: item.materialId,
      materialCode: item.materialCode, // 保存物料编码
      materialName: item.materialName,
      defaultQuantity: item.defaultQuantity,
      isRequired: item.isRequired,
      remarks: item.remarks
    })) as any; // 临时使用 any
    // 保存原始物料列表（深拷贝）用于比对变更
    originalMaterials.value = JSON.parse(JSON.stringify(form.materials));
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
    form.materials = [];
    originalMaterials.value = [];
  } finally {
    editMaterialLoading.value = false;
  }
};

// 添加物料
const handleAddMaterial = () => {
  console.log('========== 打开物料选择对话框 ==========');
  console.log('materialList:', materialList.value);
  console.log('existingMaterialCodes:', existingMaterialCodes.value);
  materialSelectorVisible.value = true;
};

// 处理选择的物料
const handleMaterialsSelected = async (materials: MaterialVO[]) => {
  try {
    // ✅ 使用新的RESTful风格API批量添加物料
    // 注意：这里是独立的子项模板管理，不需要templateId
    const materialTemplates = materials.map(material => ({
      materialId: material.id as number,
      defaultQuantity: 1,
      isRequired: true,
      remarks: ''
    }));

    await addItemMaterials(materialDialog.itemId as number, materialTemplates);
    ElMessage.success(`成功添加 ${materials.length} 个物料`);
    loadMaterialList();
  } catch (error) {
    console.error('批量添加物料失败:', error);
    ElMessage.error('添加物料失败');
  }
};

// 编辑物料
const handleEditMaterial = (row: any) => {
  resetMaterialForm();
  Object.assign(materialForm, row);
  materialEditDialog.visible = true;
};

// 删除物料
const handleDeleteMaterial = async (row: any) => {
  try {
    await ElMessageBox.confirm(`是否确认删除物料"${row.materialName}"？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // ✅ 使用新的批量删除接口（移除 Number() 转换，避免精度丢失）
    await deleteItemMaterials(materialDialog.itemId, [row.id]);
    ElMessage.success('删除成功');
    loadMaterialList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 提交物料编辑表单
const submitMaterialEditForm = async () => {
  try {
    await materialFormRef.value?.validate();

    materialEditDialog.loading = true;
    // ✅ 使用新的RESTful风格批量更新接口（单条也用数组）
    const updateData = [{
      id: materialForm.id,
      materialId: materialForm.materialId,
      defaultQuantity: materialForm.defaultQuantity,
      remarks: materialForm.remarks
    }];
    await updateItemMaterials(materialDialog.itemId as number, updateData);
    ElMessage.success('修改成功');

    materialEditDialog.visible = false;
    loadMaterialList();
  } catch (error) {
    if (error !== false) {
      console.error('保存物料失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    materialEditDialog.loading = false;
  }
};

// 重置物料表单
const resetMaterialForm = () => {
  materialForm.id = undefined;
  materialForm.itemTemplateId = 0;
  materialForm.materialId = 0;
  materialForm.materialName = '';
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

