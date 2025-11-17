<template>
  <div class="item-management">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb-3">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:add']"
        >
          新增子项
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="Delete"
          :disabled="multiple"
          @click="handleBatchDelete"
          v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:remove']"
        >
          批量删除
        </el-button>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="itemList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="子项编码" prop="templateCode" width="120" />
      <el-table-column label="子项名称" prop="itemName" min-width="150" />
      <el-table-column label="子项类型" prop="itemType" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.itemType === 'MAIN'" type="primary">主要部件</el-tag>
          <el-tag v-else-if="row.itemType === 'FASTENER'" type="success">紧固件</el-tag>
          <el-tag v-else-if="row.itemType === 'ACCESSORY'" type="info">附件</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="规格型号" prop="specification" min-width="150" show-overflow-tooltip />
      <el-table-column label="默认数量" prop="defaultQuantity" width="100" align="right" />
      <el-table-column label="默认单位" prop="defaultUnit" width="100" />
      <el-table-column label="预估单重(kg)" prop="estimatedUnitWeight" width="120" align="right" />
      <el-table-column label="排序号" prop="sequenceNumber" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'ACTIVE'" type="success">启用</el-tag>
          <el-tag v-else type="info">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleEdit(row)"
            v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:edit']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            @click="handleDelete(row)"
            v-hasPermi="['erp:saltprocess:equipmentSystemTemplate:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子项模板编码" prop="templateCode">
              <el-input v-model="formData.templateCode" placeholder="请输入子项模板编码" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子项名称" prop="itemName">
              <el-input v-model="formData.itemName" placeholder="请输入子项名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子项类型" prop="itemType">
              <el-select v-model="formData.itemType" placeholder="请选择子项类型" clearable>
                <el-option label="主要部件" value="MAIN" />
                <el-option label="紧固件" value="FASTENER" />
                <el-option label="附件" value="ACCESSORY" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态">
                <el-option label="启用" value="ACTIVE" />
                <el-option label="停用" value="INACTIVE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="规格型号" prop="specification">
          <el-input
            v-model="formData.specification"
            type="textarea"
            :rows="2"
            placeholder="请输入规格型号"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入描述"
            maxlength="500"
          />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ItemManagement">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import {
  getEquipmentSystemSubsystemItems,
  addSubsystemItem,
  updateSubsystemItem,
  removeSubsystemItems
} from '@/api/erp/saltprocess/equipment-system/template';
import { ItemTemplateForm, ItemTemplateVO } from '@/api/erp/saltprocess/equipment-system/types';

// Props
interface Props {
  subsystemTemplateId: string | number;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const itemList = ref<ItemTemplateVO[]>([]);
const selectedIds = ref<Array<string | number>>([]);
const multiple = computed(() => !selectedIds.value.length);

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref<FormInstance>();
const formData = reactive<ItemTemplateForm>({
  templateCode: '',
  itemName: '',
  itemType: '',
  specification: '',
  description: '',
  defaultQuantity: undefined,
  defaultUnit: '',
  estimatedUnitWeight: undefined,
  sequenceNumber: 0,
  status: 'ACTIVE',
  remarks: ''
});

// 表单验证规则
const formRules: FormRules = {
  templateCode: [
    { required: true, message: '请输入子项模板编码', trigger: 'blur' },
    { max: 50, message: '子项模板编码不能超过50个字符', trigger: 'blur' }
  ],
  itemName: [
    { required: true, message: '请输入子项名称', trigger: 'blur' },
    { max: 100, message: '子项名称不能超过100个字符', trigger: 'blur' }
  ],
  itemType: [
    { max: 50, message: '子项类型不能超过50个字符', trigger: 'blur' }
  ],
  specification: [
    { max: 500, message: '规格型号不能超过500个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不能超过500个字符', trigger: 'blur' }
  ],
  defaultQuantity: [
    { type: 'number', min: 0.01, message: '默认数量不能小于0.01', trigger: 'blur' }
  ],
  defaultUnit: [
    { max: 20, message: '默认单位不能超过20个字符', trigger: 'blur' }
  ],
  estimatedUnitWeight: [
    { type: 'number', min: 0, message: '预估单重不能小于0', trigger: 'blur' }
  ],
  sequenceNumber: [
    { type: 'number', min: 0, message: '排序号不能小于0', trigger: 'blur' }
  ],
  status: [
    { max: 20, message: '状态不能超过20个字符', trigger: 'blur' }
  ],
  remarks: [
    { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
  ]
};

// 加载子项列表
const loadItemList = async () => {
  loading.value = true;
  try {
    const response = await getEquipmentSystemSubsystemItems(props.subsystemTemplateId);
    itemList.value = response.data;
  } catch (error) {
    ElMessage.error('加载子项列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 表格选择变化
const handleSelectionChange = (selection: ItemTemplateVO[]) => {
  selectedIds.value = selection.map(item => item.id);
};

// 重置表单
const resetForm = () => {
  formData.id = undefined;
  formData.templateCode = '';
  formData.itemName = '';
  formData.itemType = '';
  formData.specification = '';
  formData.description = '';
  formData.defaultQuantity = undefined;
  formData.defaultUnit = '';
  formData.estimatedUnitWeight = undefined;
  formData.sequenceNumber = 0;
  formData.status = 'ACTIVE';
  formData.remarks = '';
  formRef.value?.clearValidate();
};

// 新增
const handleAdd = () => {
  resetForm();
  dialogTitle.value = '新增子项模板';
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: ItemTemplateVO) => {
  resetForm();
  Object.assign(formData, row);
  dialogTitle.value = '编辑子项模板';
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      if (formData.id) {
        // 编辑
        await updateSubsystemItem(props.subsystemTemplateId, formData.id, formData);
        ElMessage.success('子项模板更新成功');
      } else {
        // 新增
        await addSubsystemItem(props.subsystemTemplateId, formData);
        ElMessage.success('子项模板新增成功');
      }
      dialogVisible.value = false;
      await loadItemList();
    } catch (error) {
      ElMessage.error(formData.id ? '子项模板更新失败' : '子项模板新增失败');
      console.error(error);
    }
  });
};

// 删除
const handleDelete = async (row: ItemTemplateVO) => {
  try {
    await ElMessageBox.confirm('确定要删除该子项模板吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await removeSubsystemItems(props.subsystemTemplateId, row.id);
    ElMessage.success('子项模板删除成功');
    await loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('子项模板删除失败');
      console.error(error);
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个子项模板吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await removeSubsystemItems(props.subsystemTemplateId, selectedIds.value);
    ElMessage.success('子项模板批量删除成功');
    await loadItemList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('子项模板批量删除失败');
      console.error(error);
    }
  }
};

// 初始化
loadItemList();
</script>

<style scoped lang="scss">
.item-management {
  padding: 20px;
}
</style>

