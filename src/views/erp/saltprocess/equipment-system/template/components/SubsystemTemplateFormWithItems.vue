<template>
  <div class="subsystem-template-form-with-items">
    <!-- 基础信息表单 -->
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板编号" prop="templateCode">
            <el-input v-model="form.templateCode" placeholder="留空自动生成" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="form.templateName" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="请输入分类" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="如: v1.0" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="启用" value="ACTIVE" />
              <el-option label="停用" value="INACTIVE" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标准模板" prop="isStandard">
            <el-switch v-model="form.isStandard" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注" />
      </el-form-item>

      <!-- 子项列表（仅在非隐藏模式下显示） -->
      <el-form-item v-if="!hideItems" label="子项配置" prop="items" required>
        <div style="width: 100%">
          <div class="mb-2">
            <el-button type="primary" icon="Plus" size="small" @click="handleAddItem">
              添加子项
            </el-button>
            <el-alert
              v-if="!form.items || form.items.length === 0"
              title="请至少添加一个子项模板"
              type="warning"
              show-icon
              :closable="false"
              style="margin-top: 10px"
            />
          </div>

          <el-table
            v-if="form.items && form.items.length > 0"
            :data="form.items"
            border
            size="small"
            style="width: 100%; margin-top: 10px"
          >
            <el-table-column label="子项名称" prop="itemName" min-width="150" show-overflow-tooltip />
            <el-table-column label="子项类型" prop="itemType" width="120" align="center" />
            <el-table-column label="数量" prop="quantity" width="100" align="center" />
            <el-table-column label="排序" prop="sequenceNumber" width="80" align="center" />
            <el-table-column label="必需" prop="isRequired" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.isRequired" type="success" size="small">是</el-tag>
                <el-tag v-else type="info" size="small">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" icon="Delete" @click="handleRemoveItem($index)" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <div class="dialog-footer" style="text-align: right; margin-top: 20px">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </div>

    <!-- 子项选择器对话框 -->
    <item-template-selector-dialog
      v-model="itemSelectorVisible"
      :template-id="0"
      :existing-item-ids="existingItemIds"
      @confirm="handleItemsConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SubsystemTemplateFormWithItems'
});
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { generateSubsystemTemplateCode, addSubsystemTemplate } from '@/api/erp/subsystem/template';
import type { SubsystemTemplateForm } from '@/api/erp/subsystem/types';
import ItemTemplateSelectorDialog from '@/views/erp/subsystem/template/components/ItemTemplateSelectorDialog.vue';

// Props
interface Props {
  hideItems?: boolean; // 是否隐藏子项列表（编辑模式下使用）
  initialData?: Partial<SubsystemTemplateForm>; // 初始数据（编辑模式下使用）
}

const props = withDefaults(defineProps<Props>(), {
  hideItems: false,
  initialData: undefined
});

// Emits
const emit = defineEmits<{
  success: [templateId: number];
  cancel: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const itemSelectorVisible = ref(false);

// 表单数据
const form = reactive<SubsystemTemplateForm & { items: any[] }>({
  templateCode: '',
  templateName: '',
  category: '',
  description: '',
  isStandard: false,
  version: 'v1.0',
  status: 'DRAFT',
  remarks: '',
  items: []
});

// 表单验证规则
// 表单验证规则（根据 hideItems 动态调整）
const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    templateName: [
      { required: true, message: '请输入模板名称', trigger: 'blur' }
    ]
  };

  // 只有在不隐藏子项列表时才验证 items
  if (!props.hideItems) {
    baseRules.items = [
      {
        validator: (rule, value, callback) => {
          if (!value || value.length === 0) {
            callback(new Error('请至少添加一个子项模板'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ];
  }

  return baseRules;
});

// 已存在的子项ID列表
const existingItemIds = computed(() => {
  console.log('计算 existingItemIds，form.items 原始数据:', JSON.parse(JSON.stringify(form.items)));

  const ids = form.items
    .filter(item => {
      const hasId = item.itemTemplateId !== undefined && item.itemTemplateId !== null;
      if (!hasId) {
        console.warn('发现无效的子项（缺少 itemTemplateId）:', item);
      }
      return hasId;
    })
    .map(item => {
      const id = Number(item.itemTemplateId);
      if (isNaN(id)) {
        console.error('无法转换为数字的 itemTemplateId:', item.itemTemplateId, '完整对象:', item);
      }
      return id;
    })
    .filter(id => !isNaN(id)); // 过滤掉 NaN 值

  console.log('计算后的 existingItemIds:', ids);
  return ids;
});

// 生命周期
onMounted(async () => {
  // 如果有初始数据，填充表单
  if (props.initialData) {
    Object.assign(form, props.initialData);
  } else {
    // 否则生成新的模板编号
    try {
      const response = await generateSubsystemTemplateCode();
      form.templateCode = response.data;
    } catch (error) {
      console.error('生成模板编号失败:', error);
    }
  }
});

// 添加子项
const handleAddItem = () => {
  console.log('========== 打开子项选择对话框 ==========');
  console.log('当前 form.items 原始数据:', form.items);
  console.log('当前 form.items JSON:', JSON.parse(JSON.stringify(form.items)));
  console.log('即将传入的 existingItemIds:', existingItemIds.value);
  console.log('existingItemIds 详细信息:', existingItemIds.value.map(id => ({
    value: id,
    type: typeof id,
    isNaN: isNaN(id),
    isNumber: typeof id === 'number',
    isValidNumber: typeof id === 'number' && !isNaN(id)
  })));
  itemSelectorVisible.value = true;
};

// 子项选择确认
const handleItemsConfirm = (items: any[]) => {
  console.log('handleItemsConfirm 接收到的 items:', JSON.parse(JSON.stringify(items)));

  // 添加选中的子项到表单
  items.forEach((item, index) => {
    console.log(`\n========== 处理第 ${index + 1} 个子项 ==========`);
    console.log('完整的 item 对象:', item);
    console.log('item.id 原始值:', item.id);
    console.log('item.id 类型:', typeof item.id);
    console.log('item.id 是否为对象:', typeof item.id === 'object');
    console.log('item.id JSON:', JSON.stringify(item.id));
    console.log('item 的所有键:', Object.keys(item));

    // 尝试不同的 ID 字段
    const possibleIds = {
      id: item.id,
      itemId: item.itemId,
      itemTemplateId: item.itemTemplateId,
      templateId: item.templateId
    };
    console.log('可能的 ID 字段:', possibleIds);

    // 确保 id 存在且有效
    if (!item.id) {
      console.error('子项缺少 id 字段:', item);
      ElMessage.error(`子项 "${item.itemName || '未知'}" 缺少 ID，无法添加`);
      return;
    }

    const newItem = {
      itemTemplateId: item.id,
      itemName: item.itemName,
      itemType: item.itemType,
      quantity: item.quantity || 1,
      sequenceNumber: form.items.length + index + 1,
      isRequired: item.isRequired || false,
      remarks: ''
    };

    console.log('准备添加到 form.items 的数据:', newItem);
    console.log('newItem.itemTemplateId 类型:', typeof newItem.itemTemplateId);
    console.log('newItem.itemTemplateId 转为数字:', Number(newItem.itemTemplateId));
    console.log('转换后是否为 NaN:', isNaN(Number(newItem.itemTemplateId)));

    form.items.push(newItem);
    console.log(`第 ${index + 1} 个子项添加完成`);
  });

  console.log('添加后的 form.items:', JSON.parse(JSON.stringify(form.items)));

  // 触发表单验证
  formRef.value?.validateField('items');
};

// 移除子项
const handleRemoveItem = (index: number) => {
  form.items.splice(index, 1);
  // 触发表单验证
  formRef.value?.validateField('items');
};

// 取消
const handleCancel = () => {
  emit('cancel');
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        // 构造提交数据，包含子项列表
        const templateData: SubsystemTemplateForm = {
          templateCode: form.templateCode,
          templateName: form.templateName,
          category: form.category,
          description: form.description,
          isStandard: form.isStandard,
          version: form.version,
          status: form.status,
          remarks: form.remarks,
          // 添加子项列表（如果有）
          items: form.items.length > 0 ? form.items.map(item => ({
            itemTemplateId: item.itemTemplateId,
            quantity: item.quantity,
            sequenceNumber: item.sequenceNumber,
            isRequired: item.isRequired,
            remarks: item.remarks
          })) : undefined
        };

        // 调用新增接口，一次性创建模板和子项
        // 根据API文档，响应格式为：{ code: 200, msg: "操作成功", data: TemplateVO }
        const templateResponse = await addSubsystemTemplate(templateData);

        // 获取新创建的模板ID
        const templateId = (templateResponse as any).data?.id;

        if (!templateId) {
          throw new Error('未能获取新创建的模板ID，请检查后端响应格式');
        }

        ElMessage.success('新建子系统模板成功');
        emit('success', templateId);
      } catch (error: any) {
        console.error('新建子系统模板失败:', error);
        ElMessage.error(error.message || '新建子系统模板失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.subsystem-template-form-with-items {
  .mb-2 {
    margin-bottom: 8px;
  }

  .dialog-footer {
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
}
</style>


