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
          <el-form-item label="负责人" prop="responsiblePersonId">
            <el-select
              v-model="form.responsiblePersonId"
              placeholder="请选择负责人"
              filterable
              clearable
              style="width: 100%"
              :loading="userListLoading"
              @change="handleResponsiblePersonChange"
            >
              <el-option
                v-for="user in userList"
                :key="user.userId"
                :label="user.nickName || user.userName"
                :value="user.userId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="负责人姓名" prop="responsiblePerson">
            <el-input v-model="form.responsiblePerson" placeholder="系统自动填充" :disabled="true" />
          </el-form-item>
        </el-col> -->
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
import { getSimpleUserList } from '@/api/system/user';
import type { UserVO } from '@/api/system/user/types';

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
const userListLoading = ref(false);
const userList = ref<UserVO[]>([]);

// 表单数据
const initFormData: ProjectEquipmentSystemForm = {
  id: undefined,
  systemCode: '',
  systemName: '',
  projectId: '',
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
  // 获取用户列表
  getUserList();

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

/**
 * 获取用户列表
 * 从系统用户接口获取简化的用户列表，用于负责人下拉选择
 */
const getUserList = async () => {
  userListLoading.value = true;
  try {
    const res = await getSimpleUserList();
    userList.value = res.data || [];
    console.log('获取用户列表成功:', userList.value.length, '个用户');
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
    userList.value = [];
  } finally {
    userListLoading.value = false;
  }
};

/**
 * 处理负责人选择变更
 * 当用户选择负责人时，自动填充负责人姓名
 */
const handleResponsiblePersonChange = (userId: string | number | undefined) => {
  if (!userId) {
    // 清空选择
    form.responsiblePerson = '';
    return;
  }

  // 根据选中的userId查找对应的用户信息
  const selectedUser = userList.value.find(user => user.userId === userId);
  if (selectedUser) {
    // 自动填充负责人姓名（优先使用昵称，其次使用用户名）
    form.responsiblePerson = selectedUser.nickName || selectedUser.userName || '';
    console.log('选择负责人:', selectedUser.nickName || selectedUser.userName, '(ID:', userId, ')');
  }
};

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

