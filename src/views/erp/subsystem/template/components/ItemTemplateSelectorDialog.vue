<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ItemTemplateSelectorDialog'
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择子项模板"
    width="1200px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <!-- 搜索栏 -->
    <div class="search-section mb-3">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="子项名称">
          <el-input
            v-model="queryParams.itemName"
            placeholder="请输入子项名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="子项编号">
          <el-input
            v-model="queryParams.itemCode"
            placeholder="请输入子项编号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="子项类型">
          <el-input
            v-model="queryParams.itemType"
            placeholder="请输入子项类型"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区 -->
    <div class="action-section mb-3">
      <el-button type="success" icon="Plus" @click="handleAddNewTemplate">
        新增子项模板
      </el-button>
    </div>

    <!-- 子项列表 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="itemList"
      row-key="id"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      height="450"
    >
      <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="isAdded(scope.row)" type="success" size="small">已添加</el-tag>
          <el-tag v-else type="info" size="small">未添加</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="子项编号" prop="itemCode" width="150" show-overflow-tooltip />
      <el-table-column label="子项名称" prop="itemName" min-width="180" show-overflow-tooltip />
      <el-table-column label="子项类型" prop="itemType" width="120" align="center" />
      <el-table-column label="规格型号" prop="specification" width="150" show-overflow-tooltip />
      <el-table-column label="默认数量" prop="defaultQuantity" width="100" align="center" />
      <el-table-column label="单位" prop="unit" width="80" align="center" />
      <el-table-column label="是否必需" prop="isRequired" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.isRequired" type="success" size="small">是</el-tag>
          <el-tag v-else type="info" size="small">否</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section mt-3">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <span class="selected-info">已选择 {{ selectedItems.length }} 项</span>
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="selectedItems.length === 0">
            确定添加
          </el-button>
        </div>
      </div>
    </template>

    <!-- 新增子项模板对话框 -->
    <el-dialog
      :title="itemDialog.title"
      v-model="itemDialog.visible"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="100px">
        <el-row :gutter="20">
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
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="itemForm.unit" placeholder="如：个、台等" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
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
        <el-form-item label="物料配置" prop="materials">
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
              <el-table-column label="物料ID" prop="materialId" width="100" />
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

    <!-- 物料选择对话框 -->
    <material-selector-dialog
      v-model="itemMaterialSelectorVisible"
      :existing-material-ids="itemFormMaterialIds"
      @confirm="handleItemMaterialsSelected"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { listItemTemplate, addItemTemplate } from '@/api/erp/subsystem/item-template';
import { addItemToTemplate } from '@/api/erp/subsystem/template';
import type { MaterialVO } from '@/api/erp/material/material/types';
import type {
  SubsystemItemTemplateQuery,
  SubsystemItemTemplateVO,
  SubsystemItemTemplateForm
} from '@/api/erp/subsystem/types';
import MaterialSelectorDialog from './MaterialSelectorDialog.vue';

// Props
interface Props {
  modelValue: boolean;
  templateId: number | string;
  existingItemIds?: (number | string)[]; // 已添加的子项ID列表或itemCode列表（支持字符串）
}

const props = withDefaults(defineProps<Props>(), {
  existingItemIds: () => []
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [items: SubsystemItemTemplateVO[]];
  refresh: []; // 刷新列表
}>();

// 响应式数据
const loading = ref(false);
const itemList = ref<SubsystemItemTemplateVO[]>([]);
const selectedItems = ref<SubsystemItemTemplateVO[]>([]);
const total = ref(0);

// 本地维护的已选中子项ID集合（用于跨分页保持选中状态）
const selectedItemIds = ref<Set<number | string>>(new Set());

// 标志位：是否正在恢复选中状态
const isRestoringSelection = ref(false);

const queryParams = reactive<SubsystemItemTemplateQuery>({
  pageNum: 1,
  pageSize: 10,
  templateId: undefined, // 将在加载时设置
  itemName: '',
  itemCode: '',
  itemType: ''
});

// 子项表单
const itemFormRef = ref();
const itemDialog = reactive({
  visible: false,
  title: '新增子项模板',
  loading: false
});

const itemForm = reactive<SubsystemItemTemplateForm>({
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

// 物料选择对话框
const itemMaterialSelectorVisible = ref(false);

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 计算新增子项表单中已选择的物料ID列表
const itemFormMaterialIds = computed(() => {
  return itemForm.materials?.map(item => Number(item.materialId)) || [];
});

// 监听对话框打开
watch(dialogVisible, (newVal) => {
  if (newVal) {
    console.log('========== ItemTemplateSelectorDialog 对话框打开 ==========');
    console.log('接收到的 props.templateId:', props.templateId);
    console.log('接收到的 props.existingItemIds (原始):', props.existingItemIds);

    // 初始化本地选中ID集合
    selectedItemIds.value = new Set(props.existingItemIds.map(id => typeof id === 'string' ? id : Number(id)));
    console.log('初始化 selectedItemIds:', Array.from(selectedItemIds.value));

    // 设置 templateId 参数用于标记已添加的子项
    queryParams.templateId = props.templateId;
    loadItemList();
  } else {
    resetSearch();
  }
});

// 加载子项列表
const loadItemList = async () => {
  loading.value = true;
  try {
    console.log('========== 加载子项列表 ==========');
    console.log('queryParams:', queryParams);

    const response: any = await listItemTemplate(queryParams);
    console.log('后端响应:', response);

    // 🔒 在数据赋值之前设置标志位
    isRestoringSelection.value = true;
    console.log('🔒 设置 isRestoringSelection = true（数据赋值前）');

    // 处理响应数据
    let rawData: any[] = [];
    if (response.rows) {
      rawData = response.rows;
      total.value = response.total || 0;
    } else {
      rawData = [];
      total.value = 0;
    }

    itemList.value = rawData;
    console.log('处理后的 itemList:', itemList.value);

    // 自动勾选已添加的子项
    autoSelectAddedItems();
  } catch (error) {
    console.error('加载子项列表失败:', error);
    ElMessage.error('加载子项列表失败');
    isRestoringSelection.value = false; // 确保出错时重置标志位
    itemList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 检查子项是否已添加（优先使用前端 itemCode 匹配）
const isAdded = (row: SubsystemItemTemplateVO): boolean => {
  // 优先使用前端的 itemCode 匹配（因为后端的 isAdded 字段可能不准确）
  // 支持两种匹配方式：
  // 1. 通过 itemCode 匹配（字符串）
  // 2. 通过 id 匹配（数字）
  const hasItemCode = row.itemCode && props.existingItemIds.includes(row.itemCode);
  const hasId = props.existingItemIds.includes(Number(row.id));

  // 如果前端匹配成功，直接返回 true
  if (hasItemCode || hasId) {
    console.log(`[isAdded] ${row.itemName} - 前端匹配成功:`, {
      itemCode: row.itemCode,
      hasItemCode,
      id: row.id,
      hasId
    });
    return true;
  }

  // 如果前端匹配失败，再检查后端的 isAdded 字段
  if (row.isAdded === true) {
    console.log(`[isAdded] ${row.itemName} - 后端 isAdded 为 true`);
    return true;
  }

  // 都不匹配，返回 false
  console.log(`[isAdded] ${row.itemName} - 未添加`);
  return false;
};

// 检查行是否可选择（已添加的不能再选）
const checkSelectable = (row: SubsystemItemTemplateVO): boolean => {
  return !isAdded(row);
};

// 自动勾选已添加的子项（基于 isAdded 字段或 existingItemIds）
const autoSelectAddedItems = async () => {
  await nextTick();
  if (!tableRef.value) {
    console.warn('表格组件未找到，无法自动勾选');
    isRestoringSelection.value = false; // 确保重置标志位
    return;
  }

  // 恢复勾选
  let selectedCount = 0;
  itemList.value.forEach((item) => {
    if (selectedItemIds.value.has(item.id) || (item.itemCode && selectedItemIds.value.has(item.itemCode))) {
      tableRef.value.toggleRowSelection(item, true);
      selectedCount++;
    }
  });

  console.log(`已恢复勾选 ${selectedCount} 个子项（本地选中总数: ${selectedItemIds.value.size}）`);

  // 恢复完成后，重置标志位
  isRestoringSelection.value = false;
  console.log('🔓 设置 isRestoringSelection = false，恢复正常事件处理');
};

// 选择变化
const handleSelectionChange = (selection: SubsystemItemTemplateVO[]) => {
  selectedItems.value = selection;

  if (isRestoringSelection.value) {
    console.log('⚠️ 正在恢复选中状态，跳过 selectedItemIds 更新');
    return;
  }

  // 更新本地选中ID集合
  selectedItemIds.value.clear();
  selection.forEach(item => {
    selectedItemIds.value.add(item.id);
    if (item.itemCode) {
      selectedItemIds.value.add(item.itemCode);
    }
  });
  console.log('选择变化 - 更新后的 selectedItemIds:', Array.from(selectedItemIds.value));
};

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  loadItemList();
};

// 重置搜索
const handleReset = () => {
  queryParams.itemName = '';
  queryParams.itemCode = '';
  queryParams.itemType = '';
  queryParams.pageNum = 1;
  loadItemList();
};

// 重置所有状态
const resetSearch = () => {
  queryParams.itemName = '';
  queryParams.itemCode = '';
  queryParams.itemType = '';
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.templateId = undefined;
  selectedItems.value = [];
  selectedItemIds.value.clear(); // 清空本地状态
};

// 引用表格组件
const tableRef = ref();

// 页码变化
const handlePageChange = (page: number) => {
  queryParams.pageNum = page;
  loadItemList();
};

// 每页条数变化
const handlePageSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  loadItemList();
};

// 新增子项模板
const handleAddNewTemplate = () => {
  resetItemForm();
  itemDialog.visible = true;
};

// 提交子项表单
const submitItemForm = async () => {
  try {
    await itemFormRef.value?.validate();

    // ✅ 检查物料是否已添加
    if (!itemForm.materials || itemForm.materials.length === 0) {
      ElMessage.warning('请至少添加一个物料');
      return;
    }

    itemDialog.loading = true;

    console.log('开始创建子项模板:', itemForm);

    // ✅ 步骤1: 创建子项模板并绑定物料（一次性完成）
    const createData = {
      templateId: props.templateId, // ✅ 传递子系统模板ID，自动关联
      itemName: itemForm.itemName,
      itemType: itemForm.itemType,
      description: itemForm.description,
      defaultQuantity: itemForm.defaultQuantity,
      unit: itemForm.unit,
      isRequired: itemForm.isRequired,
      remarks: itemForm.remarks,
      materials: itemForm.materials // ✅ 传递物料列表
    };

    await addItemTemplate(createData);

    console.log('子项模板创建并关联成功');
    ElMessage.success('新增子项模板并关联成功');

    itemDialog.visible = false;

    // 刷新列表
    loadItemList();
    emit('refresh');
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

// 确认选择
const handleConfirm = () => {
  console.log('=== ItemTemplateSelectorDialog handleConfirm 被调用 ===');
  console.log('选中的子项数量:', selectedItems.value.length);
  console.log('选中的子项:', selectedItems.value);

  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要添加的子项');
    return;
  }

  // 过滤掉已添加的子项（只提交新增的子项）
  const newItems = selectedItems.value.filter(item => !isAdded(item));

  if (newItems.length === 0) {
    ElMessage.warning('没有新增的子项可添加');
    return;
  }

  console.log('准备 emit confirm 事件，只提交新增的子项:', newItems);
  console.log('新增子项数量:', newItems.length);
  console.log('新增子项数据示例:', JSON.stringify(newItems[0], null, 2));
  emit('confirm', newItems);
  console.log('emit confirm 事件完成');
  dialogVisible.value = false;
  console.log('对话框已关闭');
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.search-section {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;

  .el-form {
    margin-bottom: 0;
  }
}

.action-section {
  display: flex;
  justify-content: flex-start;
  padding: 8px 0;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-info {
    color: #606266;
    font-size: 14px;
  }
}

.mb-3 {
  margin-bottom: 16px;
}

.mt-3 {
  margin-top: 16px;
}
</style>

