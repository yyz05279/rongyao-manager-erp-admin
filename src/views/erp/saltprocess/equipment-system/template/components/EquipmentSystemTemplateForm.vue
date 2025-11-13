<template>
  <div class="equipment-system-template-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板编码" prop="templateCode">
            <el-input v-model="form.templateCode" placeholder="系统自动生成" :disabled="true" />
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
          <el-form-item label="系统类型" prop="systemType">
            <el-select v-model="form.systemType" placeholder="请选择系统类型" style="width: 100%">
              <el-option label="固态" value="SOLID" />
              <el-option label="液态" value="LIQUID" />
              <el-option label="粉盐" value="POWDER" />
              <el-option label="燃烧器" value="BURNER" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="请输入分类(如:处理厂、生产线)" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="如: 1.0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="启用" value="ACTIVE" />
              <el-option label="归档" value="ARCHIVED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="标准模板" prop="isStandard">
            <el-switch v-model="form.isStandard" />
            <span class="ml-2 text-gray-500 text-xs">标准模板可用于快速创建项目设备系统</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述信息" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>

      <!-- 子系统模板管理 -->
      <el-form-item label="子系统模板" prop="subsystemTemplates">
        <div class="subsystem-management">
          <div class="subsystem-header">
            <el-button type="primary" icon="Plus" size="small" @click="handleAddSubsystem">添加子系统</el-button>
            <span class="subsystem-count">已添加 {{ form.subsystemTemplates.length }} 个子系统</span>
          </div>

          <!-- 已添加的子系统列表 -->
          <el-table
            v-if="form.subsystemTemplates.length > 0"
            :data="form.subsystemTemplates"
            border
            style="width: 100%; margin-top: 10px"
            max-height="300"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="添加方式" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.mode === 'reference' ? 'success' : 'primary'" size="small">
                  {{ scope.row.mode === 'reference' ? '引用模板' : '新建模板' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="子系统名称" min-width="150" show-overflow-tooltip>
              <template #default="scope">
                {{ getSubsystemDisplayName(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="类型" width="100" align="center">
              <template #default="scope">
                {{ getSubsystemTypeText(scope.row.subsystemType) }}
              </template>
            </el-table-column>
            <el-table-column prop="sequenceNumber" label="排序号" width="80" align="center" />
            <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleEditSubsystem(scope.$index)">编辑</el-button>
                <el-button link type="danger" icon="Delete" @click="handleRemoveSubsystem(scope.$index)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态提示 -->
          <el-empty
            v-else
            description="暂未添加子系统模板，请点击上方按钮添加"
            :image-size="80"
            style="padding: 20px 0"
          />
        </div>
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <!-- 子系统模板选择器 -->
    <subsystem-template-selector
      v-model="subsystemFormVisible"
      :existing-template-ids="existingTemplateIds"
      @confirm="handleSubsystemConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'EquipmentSystemTemplateForm'
});
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  getEquipmentSystemTemplate,
  addEquipmentSystemTemplate,
  updateEquipmentSystemTemplate
} from '@/api/erp/saltprocess/equipment-system/template';
import type { EquipmentSystemTemplateForm, SubsystemTemplateForm } from '@/api/erp/saltprocess/equipment-system/types';
import SubsystemTemplateSelector from './SubsystemTemplateSelector.vue';

// Props
interface Props {
  templateId?: string | number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const buttonLoading = ref(false);
const subsystemFormVisible = ref(false);

// 计算已添加的子系统模板ID列表
const existingTemplateIds = computed(() => {
  return form.subsystemTemplates
    .filter((item: any) => item.mode === 'reference' && item.referenceTemplateId)
    .map((item: any) => item.referenceTemplateId as number);
});

// 表单数据
const initFormData: EquipmentSystemTemplateForm = {
  id: undefined,
  templateCode: '',
  templateName: '',
  systemType: '',
  category: '',
  description: '',
  isStandard: false,
  version: '1.0',
  status: 'DRAFT',
  remarks: '',
  subsystemTemplates: []
};

const form = reactive<EquipmentSystemTemplateForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  systemType: [{ required: true, message: '请选择系统类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  subsystemTemplates: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (form.subsystemTemplates.length === 0) {
          callback(new Error('请至少添加一个子系统模板'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
});

// 生命周期
onMounted(() => {
  if (props.templateId) {
    getTemplateDetail();
  } else {
    // 新增模式，生成临时编码提示
    form.templateCode = '系统自动生成';
  }
});

// 监听templateId变化
watch(
  () => props.templateId,
  newVal => {
    if (newVal) {
      getTemplateDetail();
    } else {
      reset();
    }
  }
);

// 获取模板详情
const getTemplateDetail = async () => {
  try {
    const res = await getEquipmentSystemTemplate(props.templateId!);
    const data = res.data as any;

    // 复制基本信息
    Object.assign(form, data);

    // 处理子系统模板数据：添加mode字段用于前端显示
    if (data.subsystemTemplates && Array.isArray(data.subsystemTemplates)) {
      form.subsystemTemplates = data.subsystemTemplates.map((item: any) => ({
        ...item,
        mode: item.referenceTemplateId ? 'reference' : 'create'
      }));
    } else {
      form.subsystemTemplates = [];
    }
  } catch (error) {
    console.error('获取模板详情失败:', error);
    ElMessage.error('获取模板详情失败');
  }
};

// 表单重置
const reset = () => {
  Object.assign(form, initFormData);
  form.templateCode = '系统自动生成';
  form.subsystemTemplates = [];
  formRef.value?.resetFields();
};

// 取消
const cancel = () => {
  reset();
  emit('cancel');
};

// 获取子系统显示名称
const getSubsystemDisplayName = (subsystem: SubsystemTemplateForm & { mode?: string }): string => {
  if (subsystem.mode === 'reference') {
    return `[引用] ID: ${subsystem.referenceTemplateId}`;
  } else {
    return subsystem.subsystemName || '未命名';
  }
};

// 获取子系统类型文本
const getSubsystemTypeText = (type?: string): string => {
  const typeMap: Record<string, string> = {
    MECHANICAL: '机械设备',
    ELECTRICAL: '电控设备',
    PIPELINE: '管路设备'
  };
  return type ? typeMap[type] || type : '-';
};

// 添加子系统
const handleAddSubsystem = () => {
  subsystemFormVisible.value = true;
};

// 编辑子系统（暂不支持编辑，只能删除后重新添加）
const handleEditSubsystem = (index: number) => {
  ElMessage.info('暂不支持编辑，请删除后重新添加');
};

// 处理子系统确认（接收数组）
const handleSubsystemConfirm = (subsystemList: Array<SubsystemTemplateForm & { mode: string }>) => {
  // 批量添加子系统
  form.subsystemTemplates.push(...subsystemList);
  // 触发表单验证
  formRef.value?.validateField('subsystemTemplates');
};

// 移除子系统
const handleRemoveSubsystem = (index: number) => {
  form.subsystemTemplates.splice(index, 1);
  // 触发表单验证
  formRef.value?.validateField('subsystemTemplates');
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      buttonLoading.value = true;
      try {
        // 构造提交数据
        const submitData: any = { ...form };

        // 移除用于显示的临时编码
        if (submitData.templateCode === '系统自动生成') {
          delete submitData.templateCode;
        }

        // 处理子系统模板数据：移除mode字段（仅用于前端UI控制）
        submitData.subsystemTemplates = form.subsystemTemplates.map(item => {
          const { mode, ...rest } = item as any;
          return rest;
        });

        if (form.id) {
          await updateEquipmentSystemTemplate(submitData);
          ElMessage.success('修改成功');
        } else {
          await addEquipmentSystemTemplate(submitData);
          ElMessage.success('新增成功');
        }
        emit('success');
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('提交失败');
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.equipment-system-template-form {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .text-gray-500 {
    color: #6b7280;
  }

  .text-xs {
    font-size: 12px;
  }

  .subsystem-management {
    width: 100%;

    .subsystem-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .subsystem-count {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>

