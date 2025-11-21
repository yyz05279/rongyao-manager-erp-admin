<template>
  <div class="project-equipment-system-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="系统编码" prop="systemCode">
            <el-input v-model="form.systemCode" placeholder="系统自动生成" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="系统名称" prop="systemName">
            <el-input v-model="form.systemName" placeholder="请输入系统名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目ID" prop="projectId">
            <el-input v-model="form.projectId" placeholder="系统自动生成" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="form.projectName" placeholder="请输入项目名称" :disabled="true" />
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
            <el-input v-model="form.category" placeholder="请输入分类" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板ID" prop="templateId">
            <el-input v-model="form.templateId" :min="0" placeholder="系统自动生成" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="草稿" value="DRAFT" />
              <el-option label="活跃" value="ACTIVE" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已归档" value="ARCHIVED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人ID" prop="responsiblePersonId">
            <el-input-number v-model="form.responsiblePersonId" :min="0" placeholder="请输入负责人ID" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人姓名" prop="responsiblePerson">
            <el-input v-model="form.responsiblePerson" placeholder="请输入负责人姓名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-input-number v-model="form.priority" :min="1" :max="10" placeholder="1-10，数字越大优先级越高" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述信息" />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script setup name="ProjectEquipmentSystemForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getProjectEquipmentSystem, addProjectEquipmentSystem, updateProjectEquipmentSystem } from '@/api/erp/saltprocess/equipment-system';
import type { ProjectEquipmentSystemForm } from '@/api/erp/saltprocess/equipment-system/types';

// Props
interface Props {
  systemId?: string | number;
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

// 表单数据
const initFormData: ProjectEquipmentSystemForm = {
  id: undefined,
  systemCode: '',
  systemName: '',
  projectId: 0,
  projectName: '',
  templateId: undefined,
  systemType: '',
  category: '',
  description: '',
  responsiblePersonId: undefined,
  responsiblePerson: '',
  status: 'DRAFT',
  priority: 1,
  remarks: ''
};

const form = reactive<ProjectEquipmentSystemForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  projectId: [{ required: true, message: '请输入项目ID', trigger: 'blur' }],
  systemType: [{ required: true, message: '请选择系统类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 生命周期
onMounted(() => {
  if (props.systemId) {
    getSystemDetail();
  } else {
    // 新增模式，生成临时编码提示
    form.systemCode = '系统自动生成';
  }
});

// 监听systemId变化
watch(
  () => props.systemId,
  newVal => {
    if (newVal) {
      getSystemDetail();
    } else {
      reset();
    }
  }
);

// 获取设备系统详情
const getSystemDetail = async () => {
  try {
    const res = await getProjectEquipmentSystem(props.systemId!);
    Object.assign(form, res.data);
  } catch (error) {
    console.error('获取设备系统详情失败:', error);
    ElMessage.error('获取设备系统详情失败');
  }
};

// 表单重置
const reset = () => {
  Object.assign(form, initFormData);
  form.systemCode = '系统自动生成';
  formRef.value?.resetFields();
};

// 取消
const cancel = () => {
  reset();
  emit('cancel');
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      buttonLoading.value = true;
      try {
        // 移除用于显示的临时编码
        const submitData = { ...form };
        if (submitData.systemCode === '系统自动生成') {
          delete submitData.systemCode;
        }

        if (form.id) {
          await updateProjectEquipmentSystem(submitData);
          ElMessage.success('修改成功');
        } else {
          await addProjectEquipmentSystem(submitData);
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
.project-equipment-system-form {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
  }
}
</style>

