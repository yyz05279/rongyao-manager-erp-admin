<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ItemTemplateManagement'
});
</script>

<template>
  <div class="item-template-management">
    <!-- 标题栏 -->
    <div class="header-section mb-4">
      <el-row :gutter="10">
        <el-col :span="12">
          <h3 class="section-title">
            <el-icon class="mr-2"><Menu /></el-icon>
            子项模板管理
          </h3>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="selectedItems.length === 0"
            @click="handleBatchDelete"
            v-hasPermi="['erp:subsystem:template:remove']"
          >
            批量删除
          </el-button>
          <el-button type="primary" icon="Plus" @click="handleAddItem" v-hasPermi="['erp:subsystem:template:add']">
            添加子项
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 子项列表 -->
    <el-card shadow="never" class="mb-4">
      <template #header>
        <span class="card-title">子项列表</span>
      </template>

      <el-table
        v-loading="loading"
        :data="itemList"
        @selection-change="handleItemSelectionChange"
        @row-click="handleItemClick"
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="子项编号" prop="itemCode" width="220" show-overflow-tooltip />
        <el-table-column label="子项名称" prop="itemName" width="200" show-overflow-tooltip />
        <!-- <el-table-column label="子项类型" prop="itemType" width="150" align="center" /> -->
        <el-table-column label="数量" prop="quantity" width="150" align="center" />
        <el-table-column label="单位" prop="unit" width="130" align="center" />
        <el-table-column label="是否必需" prop="isRequired" width="140" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isRequired" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="排序号" prop="sequenceNumber" width="100" align="center" /> -->
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看物料" placement="top">
              <el-button link type="primary" icon="View" @click.stop="handleViewMaterials(scope.row)" />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click.stop="handleEditItem(scope.row)" v-hasPermi="['erp:subsystem:template:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click.stop="handleDeleteItem(scope.row)" v-hasPermi="['erp:subsystem:template:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 物料详情对话框 -->
    <el-dialog :title="`物料列表 (${selectedItemName})`" v-model="materialDetailDialog.visible" width="1000px" append-to-body>
      <div class="mb-3">
        <el-button type="primary" icon="Plus" @click="handleAddMaterialInDialog" v-hasPermi="['erp:subsystem:template:add']">
          添加物料
        </el-button>
      </div>
      <el-table
        v-loading="materialLoading"
        :data="materialList"
        style="width: 100%"
      >
        <el-table-column label="物料编码" prop="materialCode" width="200" show-overflow-tooltip />
        <el-table-column label="物料名称" prop="materialName" min-width="200" show-overflow-tooltip />
        <el-table-column label="规格型号" prop="specifications" width="200" show-overflow-tooltip />
        <el-table-column label="默认数量" prop="quantity" width="120" align="center" />
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="是否必需" prop="isRequired" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.isRequired" type="success" size="small">是</el-tag>
            <el-tag v-else type="info" size="small">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remarks" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEditMaterial(scope.row)" v-hasPermi="['erp:subsystem:template:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDeleteMaterial(scope.row)" v-hasPermi="['erp:subsystem:template:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="materialDetailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 子项表单对话框 -->
    <el-dialog :title="itemDialog.title" v-model="itemDialog.visible" width="700px" append-to-body>
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="100px">
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item label="子项名称" prop="itemName">
              <el-input v-model="itemForm.itemName" placeholder="请输入子项名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子项类型" prop="itemType">
              <el-input v-model="itemForm.itemType" placeholder="如：组件、部件等" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认数量" prop="defaultQuantity">
              <el-input-number v-model="itemForm.defaultQuantity" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="itemForm.unit" placeholder="如：个、台等" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否必需" prop="isRequired">
              <el-switch v-model="itemForm.isRequired" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input v-model="itemForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="itemForm.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>

        <!-- ✅ 新增：物料配置（必填） -->
        <el-form-item label="物料配置" prop="materials" v-if="!itemForm.id">
          <div style="width: 100%">
            <el-button type="primary" icon="Plus" @click="handleAddItemMaterial" size="small">
              添加物料
            </el-button>
            <el-alert
              v-if="!itemForm.materials || itemForm.materials.length === 0"
              title="请至少添加一个物料"
              type="warning"
              show-icon
              :closable="false"
              style="margin-top: 10px"
            />
            <el-table
              v-if="itemForm.materials && itemForm.materials.length > 0"
              :data="itemForm.materials"
              style="width: 100%; margin-top: 10px"
              border
              size="small"
            >
              <el-table-column label="序号" type="index" width="80" align="center" :index="indexMethod" />
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
        <el-button @click="itemDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitItemForm" :loading="itemDialog.loading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 子项选择对话框 -->
    <item-template-selector-dialog
      v-model="itemSelectorVisible"
      :template-id="templateId"
      :existing-item-ids="existingItemIds"
      @confirm="handleItemsSelected"
      @refresh="loadItemList"
    />

    <!-- 物料选择对话框（用于子项详情中添加物料） -->
    <material-selector-dialog
      v-model="materialSelectorVisible"
      :existing-material-ids="existingMaterialIds"
      @confirm="handleMaterialsSelected"
    />

    <!-- 物料选择对话框（用于新增子项时添加物料） -->
    <material-selector-dialog
      v-model="itemMaterialSelectorVisible"
      :existing-material-ids="itemFormMaterialIds"
      @confirm="handleItemMaterialsSelected"
    />

    <!-- 物料编辑对话框 -->
    <el-dialog title="编辑物料" v-model="materialEditDialog.visible" width="600px" append-to-body>
      <el-form ref="materialFormRef" :model="materialForm" :rules="materialRules" label-width="100px">
        <el-form-item label="物料名称">
          <el-input :value="materialForm.materialName" disabled />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认数量" prop="defaultQuantity">
              <el-input-number v-model="materialForm.defaultQuantity" :min="0" :step="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否必需" prop="isRequired">
              <el-switch v-model="materialForm.isRequired" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  addItemTemplate,
  updateItemTemplate,
  delItemTemplate
} from '@/api/erp/subsystem/item-template';
import {
  getTemplateItems,
  removeItemFromTemplate,
  addItemToTemplate
} from '@/api/erp/subsystem/template';
import {
  getEquipmentSystemSubsystemItems,
  getEquipmentSystemItemMaterials
} from '@/api/erp/saltprocess/equipment-system/template';

import {
  listMaterialTemplateByItemId,
  addMaterialTemplate,
  updateMaterialTemplate,
  delMaterialTemplate,
  addMaterialTemplateBatch
} from '@/api/erp/subsystem/material-template';
import { listMaterial } from '@/api/erp/material/material';
import type { MaterialVO } from '@/api/erp/material/material/types';
import type {
  SubsystemItemTemplateVO,
  SubsystemItemTemplateForm,
  SubsystemMaterialTemplateVO,
  SubsystemMaterialTemplateForm,
  TemplateItemRelVO
} from '@/api/erp/subsystem/types';
import MaterialSelectorDialog from './MaterialSelectorDialog.vue';
import ItemTemplateSelectorDialog from './ItemTemplateSelectorDialog.vue';

// Props
interface Props {
  templateId: number | string;
  /** 子项列表数据(从父组件传递,避免重复调用API) */
  items?: TemplateItemRelVO[];
  /** 是否使用设备系统模式的API */
  useEquipmentSystemApi?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  useEquipmentSystemApi: false
});

// 响应式数据
const loading = ref(false);
const materialLoading = ref(false);
const itemList = ref<TemplateItemRelVO[]>([]);
const materialList = ref<SubsystemMaterialTemplateVO[]>([]);
const selectedItems = ref<TemplateItemRelVO[]>([]); // ✅ 新增：已选中的子项列表
const selectedItemId = ref<string | number | null>(null);
const selectedItemName = ref<string>('');
const materialSelectorVisible = ref(false);
const itemSelectorVisible = ref(false);

// 子项表单
const itemFormRef = ref();
const itemDialog = reactive({
  visible: false,
  title: '',
  loading: false
});

const itemForm = reactive<SubsystemItemTemplateForm>({
  templateId: 0,
  itemName: '',
  itemType: '',
  description: '',
  defaultQuantity: 1,
  unit: '个',
  isRequired: true,
  remarks: '',
  materials: [] // 物料列表
});

const itemRules = {
  itemName: [{ required: true, message: '请输入子项名称', trigger: 'blur' }],
  materials: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个物料'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

// 物料详情弹窗
const materialDetailDialog = reactive({
  visible: false
});

// 新增子项时的物料选择
const itemMaterialSelectorVisible = ref(false);

// 物料编辑表单
const materialFormRef = ref();
const materialEditDialog = reactive({
  visible: false,
  loading: false
});

const materialForm = reactive<SubsystemMaterialTemplateForm & { materialName?: string }>({
  templateId: 0,
  itemTemplateId: 0,
  materialId: 0,
  materialName: '',
  defaultQuantity: 1,
  isRequired: true,
  remarks: ''
});

const materialRules = {
  defaultQuantity: [{ required: true, message: '请输入默认数量', trigger: 'blur' }]
};

// 计算已存在的物料ID列表
const existingMaterialIds = computed(() => {
  return materialList.value.map(item => Number(item.materialId));
});

// 计算已存在的子项ID列表
const existingItemIds = computed(() => {
  return itemList.value.map(item => Number(item.id));
});

// 计算新增子项表单中已选择的物料ID列表
const itemFormMaterialIds = computed(() => {
  return itemForm.materials?.map(item => Number(item.materialId)) || [];
});

// 加载子项列表
const loadItemList = async () => {
  if (!props.templateId) return;

  // 如果父组件已经传递了items数据(数组长度>0或者是空数组),直接使用,避免重复调用API
  if (props.items !== undefined) {
    itemList.value = props.items;
    return;
  }

  // 如果没有传递数据(undefined),则调用API获取
  loading.value = true;
  try {
    // 根据模式选择不同的API
    const response = props.useEquipmentSystemApi
      ? await getEquipmentSystemSubsystemItems(props.templateId)
      : await getTemplateItems(props.templateId);
    itemList.value = response.data || [];
  } catch (error) {
    console.error('加载子项列表失败:', error);
    ElMessage.error('加载子项列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载物料列表
const loadMaterialList = async () => {
  if (!selectedItemId.value) return;

  materialLoading.value = true;
  try {
    // 根据模式选择不同的API
    const response = props.useEquipmentSystemApi
      ? await getEquipmentSystemItemMaterials(selectedItemId.value)
      : await listMaterialTemplateByItemId(
          selectedItemId.value,
          props.templateId // ✅ 传递子系统模板ID，确保数据隔离
        );

    // ✅ 后端已经按照 templateId 过滤，直接使用返回的数据
    materialList.value = response.data || [];
  } catch (error) {
    console.error('加载物料列表失败:', error);
    ElMessage.error('加载物料列表失败');
  } finally {
    materialLoading.value = false;
  }
};

// 监听items变化
watch(
  () => props.items,
  (newItems) => {
    // 如果父组件传递了数据,直接使用
    if (newItems !== undefined) {
      itemList.value = newItems;
    }
  },
  { deep: true }
);

// 监听templateId变化
watch(
  () => props.templateId,
  (newTemplateId) => {
    if (newTemplateId) {
      loadItemList();
    }
  },
  { immediate: true }
);

// 子项选择变化
const handleItemSelectionChange = (selection: TemplateItemRelVO[]) => {
  selectedItems.value = selection;
};

// 子项行点击
const handleItemClick = (row: any) => {
  // 后端返回的字段名是 itemTemplateId
  selectedItemId.value = row.itemTemplateId || row.id;
  selectedItemName.value = row.itemName;
};

// 添加子项（打开选择器）
const handleAddItem = () => {
  itemSelectorVisible.value = true;
};

// 处理选中的子项模板
const handleItemsSelected = async (items: SubsystemItemTemplateVO[]) => {
  try {
    console.log('开始批量添加子项，选中的子项:', items);

    // ✅ 使用正确的接口：addItemToTemplate（将已存在的子项关联到子系统模板）
    // ✅ 传递子项模板ID（itemTemplateId），不会创建新子项
    const promises = items.map(item => {
      const data = {
        itemTemplateId: item.id!,  // ✅ 传递已存在子项的ID
        quantity: item.defaultQuantity || 1,
        isRequired: item.isRequired ?? true,
        remarks: item.remarks || ''
      };
      console.log(`添加子项[${item.itemName}]到模板，参数:`, data);
      return addItemToTemplate(props.templateId, data);
    });

    await Promise.all(promises);
    ElMessage.success(`成功添加 ${items.length} 个子项到模板`);
    loadItemList();
  } catch (error) {
    console.error('批量添加子项失败:', error);
    ElMessage.error('添加子项失败');
  }
};

// 编辑子项
const handleEditItem = (row: any) => {
  resetItemForm();
  // 确保使用正确的字段
  Object.assign(itemForm, {
    ...row,
    id: row.itemTemplateId || row.id
  });
  itemDialog.title = '编辑子项';
  itemDialog.visible = true;
};

// 删除子项（从模板移除）
const handleDeleteItem = async (row: any) => {
  try {
    // 获取 itemTemplateId（后端返回的字段名是 itemTemplateId）
    const itemTemplateId = row.itemTemplateId || row.id;

    // 打印调试信息
    console.log('删除子项参数:', {
      templateId: props.templateId,
      itemTemplateId: itemTemplateId,
      row: row
    });

    // 验证参数
    if (!props.templateId || !itemTemplateId) {
      ElMessage.error(`参数错误：templateId=${props.templateId}, itemTemplateId=${itemTemplateId}`);
      return;
    }

    await ElMessageBox.confirm(
      `是否确认从模板中移除子项"${row.itemName}"？该操作会同时清理该子项在模板中的所有物料记录。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 调用从模板移除子项的接口，需要传入 templateId 和 itemTemplateId
    await removeItemFromTemplate(props.templateId, itemTemplateId);
    ElMessage.success('移除成功');
    loadItemList();

    // 如果当前选中的子项被删除，清空选中状态
    if (selectedItemId.value === itemTemplateId) {
      selectedItemId.value = null;
      selectedItemName.value = '';
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除子项失败:', error);
      ElMessage.error('移除失败');
    }
  }
};

// ✅ 新增：批量删除子项
const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要删除的子项');
    return;
  }

  try {
    const itemNames = selectedItems.value.map(item => item.itemName).join('、');

    await ElMessageBox.confirm(
      `是否确认从模板中移除选中的 ${selectedItems.value.length} 个子项（${itemNames}）？该操作会同时清理这些子项在模板中的所有物料记录。`,
      '批量删除警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 批量删除
    const deletePromises = selectedItems.value.map(item => {
      const itemTemplateId = item.itemTemplateId || item.id;
      return removeItemFromTemplate(props.templateId, itemTemplateId);
    });

    await Promise.all(deletePromises);

    ElMessage.success(`成功移除 ${selectedItems.value.length} 个子项`);

    // 清空选中状态
    selectedItems.value = [];

    // 刷新列表
    loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除子项失败:', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 查看物料
const handleViewMaterials = async (row: any) => {
  // 后端返回的字段名是 itemTemplateId
  selectedItemId.value = row.itemTemplateId || row.id;
  selectedItemName.value = row.itemName;

  // 打开弹窗
  materialDetailDialog.visible = true;

  // 加载物料列表
  await loadMaterialList();
};

// 提交子项表单
const submitItemForm = async () => {
  try {
    await itemFormRef.value?.validate();

    // ✅ 新增模式：检查物料是否已添加
    if (!itemForm.id) {
      if (!itemForm.materials || itemForm.materials.length === 0) {
        ElMessage.warning('请至少添加一个物料');
        return;
      }
    }

    itemDialog.loading = true;
    if (itemForm.id) {
      // 编辑模式：不传递 materials
      const { materials, ...updateData } = itemForm;
      await updateItemTemplate(updateData);
      ElMessage.success('修改成功');
    } else {
      // 新增模式：传递完整数据（包含 materials）
      await addItemTemplate({
        ...itemForm,
        templateId: props.templateId
      });
      ElMessage.success('添加成功');
    }

    itemDialog.visible = false;
    loadItemList();
  } catch (error) {
    if (error !== false) {
      console.error('保存子项失败:', error);
      ElMessage.error('保存失败');
    }
  } finally {
    itemDialog.loading = false;
  }
};

// 重置子项表单
const resetItemForm = () => {
  itemForm.id = undefined;
  itemForm.itemName = '';
  itemForm.itemType = '';
  itemForm.description = '';
  itemForm.defaultQuantity = 1;
  itemForm.unit = '个';
  itemForm.isRequired = true;
  itemForm.remarks = '';
  itemForm.materials = []; // ✅ 重置物料列表
  itemFormRef.value?.clearValidate();
};

// ✅ 新增：在新增子项表单中添加物料
const handleAddItemMaterial = () => {
  itemMaterialSelectorVisible.value = true;
};

// ✅ 新增：处理新增子项时选择的物料
const handleItemMaterialsSelected = (materials: MaterialVO[]) => {
  if (!itemForm.materials) {
    itemForm.materials = [];
  }

  materials.forEach(material => {
    // 避免重复添加
    if (!itemForm.materials!.some(m => m.materialId === material.id)) {
      itemForm.materials!.push({
        materialId: material.id as number,
        materialName: material.materialName || '', // 保存物料名称
        defaultQuantity: 1,
        isRequired: true,
        remarks: ''
      });
    }
  });

  // 手动触发表单验证
  itemFormRef.value?.validateField('materials');
};

// ✅ 新增：移除新增子项表单中的物料
const handleRemoveItemMaterial = (index: number) => {
  if (itemForm.materials) {
    itemForm.materials.splice(index, 1);
    // 手动触发表单验证
    itemFormRef.value?.validateField('materials');
  }
};

// 在物料弹窗中添加物料
const handleAddMaterialInDialog = () => {
  materialSelectorVisible.value = true;
};

// 处理选择的物料
const handleMaterialsSelected = async (materials: MaterialVO[]) => {
  try {
    const materialTemplates: SubsystemMaterialTemplateForm[] = materials.map(material => ({
      templateId: props.templateId,
      itemTemplateId: selectedItemId.value!,
      materialId: material.id as number,
      defaultQuantity: 1,
      isRequired: true,
      remarks: ''
    }));

    await addMaterialTemplateBatch(materialTemplates);
    ElMessage.success(`成功添加 ${materials.length} 个物料`);
    loadMaterialList();
  } catch (error) {
    console.error('批量添加物料失败:', error);
    ElMessage.error('添加物料失败');
  }
};

// 编辑物料
const handleEditMaterial = (row: SubsystemMaterialTemplateVO) => {
  resetMaterialForm();
  Object.assign(materialForm, row);
  // ✅ 确保templateId始终为当前子系统模板ID，保证数据隔离
  materialForm.templateId = props.templateId;
  // ✅ 确保itemTemplateId正确设置
  materialForm.itemTemplateId = selectedItemId.value!;
  materialEditDialog.visible = true;
};

// 删除物料
const handleDeleteMaterial = async (row: SubsystemMaterialTemplateVO) => {
  try {
    await ElMessageBox.confirm(`是否确认删除物料"${row.materialName}"?`, '警告', {
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

// 提交物料编辑表单
const submitMaterialEditForm = async () => {
  try {
    await materialFormRef.value?.validate();

    materialEditDialog.loading = true;
    await updateMaterialTemplate(materialForm);
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

// 序号索引方法
const indexMethod = (index: number) => {
  return index + 1;
};

// 重置物料表单
const resetMaterialForm = () => {
  materialForm.id = undefined;
  // ✅ 重置时保留关联ID，确保数据隔离
  materialForm.templateId = props.templateId;
  materialForm.itemTemplateId = selectedItemId.value || 0;
  materialForm.materialId = 0;
  materialForm.materialName = '';
  materialForm.defaultQuantity = 1;
  materialForm.isRequired = true;
  materialForm.remarks = '';
  materialFormRef.value?.clearValidate();
};
</script>

<style scoped lang="scss">
.item-template-management {
  .header-section {
    .section-title {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .card-title {
    font-weight: 600;
    color: #303133;
  }

  .text-right {
    text-align: right;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mr-2 {
    margin-right: 8px;
  }

  .mb-3 {
    margin-bottom: 12px;
  }
}
</style>

