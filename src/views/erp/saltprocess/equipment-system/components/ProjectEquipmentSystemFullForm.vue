<template>
  <div class="project-equipment-system-full-form">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 基本信息 -->
      <el-divider content-position="left">基本信息</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="系统编码" prop="systemCode">
            <el-input v-model="form.systemCode" placeholder="系统编码" :disabled="true" />
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
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="form.projectName" placeholder="项目名称" :disabled="true" />
          </el-form-item>
        </el-col>
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
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-input v-model="form.category" placeholder="请输入分类" />
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
        <el-col :span="12">
          <el-form-item label="优先级" prop="priority">
            <el-input-number v-model="form.priority" :min="1" :max="10" placeholder="1-10" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述信息" maxlength="500" show-word-limit />
      </el-form-item>

      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" maxlength="500" show-word-limit />
      </el-form-item>

      <!-- 子系统列表 -->
      <el-divider content-position="left">
        <span>子系统列表</span>
        <el-button type="primary" size="small" icon="Plus" @click="handleAddSubsystem" style="margin-left: 10px">
          添加子系统
        </el-button>
      </el-divider>

      <el-form-item prop="subsystems">
        <el-table :data="form.subsystems" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="子系统名称" prop="subsystemName" min-width="150" show-overflow-tooltip />
          <el-table-column label="子系统编码" prop="subsystemCode" width="150" show-overflow-tooltip />
          <el-table-column label="分类" prop="category" width="120" show-overflow-tooltip />
          <el-table-column label="类型" prop="subsystemType" width="120" show-overflow-tooltip />
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link size="small" icon="Edit" @click="handleEditSubsystem(scope.row, scope.$index)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" icon="Delete" @click="handleDeleteSubsystem(scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

    <!-- 子系统选择器对话框 -->
    <project-subsystem-selector
      v-if="subsystemSelectorVisible"
      v-model:visible="subsystemSelectorVisible"
      @confirm="handleSubsystemConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProjectEquipmentSystemFullForm'
});
</script>

<script setup name="ProjectEquipmentSystemFullForm" lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import {
  getProjectEquipmentSystem,
  updateProjectEquipmentSystemFull,
  batchAddSubsystemTemplates
} from '@/api/erp/saltprocess/equipment-system';
import type {
  ProjectEquipmentSystemFullForm,
  ProjectEquipmentSystemDetailVO
} from '@/api/erp/saltprocess/equipment-system/types';
import { getSimpleUserList } from '@/api/system/user';
import type { UserVO } from '@/api/system/user/types';
import ProjectSubsystemSelector from './ProjectSubsystemSelector.vue';

// Props
interface Props {
  systemId: string | number;
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
const subsystemSelectorVisible = ref(false);

// 表单数据
const initFormData: ProjectEquipmentSystemFullForm = {
  id: '',
  projectId: '',
  projectName: '',
  templateId: undefined,
  systemCode: '',
  systemName: '',
  systemType: '',
  category: '',
  description: '',
  responsiblePersonId: undefined,
  responsiblePerson: '',
  status: 'DRAFT',
  priority: 1,
  sequenceNumber: undefined,
  remarks: '',
  version: undefined,
  subsystems: []
};

const form = reactive<ProjectEquipmentSystemFullForm>({ ...initFormData });

// 表单验证规则
const rules = reactive<FormRules>({
  systemName: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  systemCode: [{ required: true, message: '系统编码不能为空', trigger: 'blur' }],
  subsystems: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (form.subsystems.length === 0) {
          callback(new Error('请至少添加一个子系统'));
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
  console.log('ProjectEquipmentSystemFullForm mounted, systemId:', props.systemId);
  getUserList();
  if (props.systemId) {
    console.log('systemId存在，开始获取系统详情');
    getSystemDetail();
  } else {
    console.warn('systemId为空，无法获取系统详情');
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
 */
const getUserList = async () => {
  try {
    userListLoading.value = true;
    const response = await getSimpleUserList();
    userList.value = response.data || [];
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    userListLoading.value = false;
  }
};

/**
 * 获取系统详情
 */
const getSystemDetail = async () => {
  try {
    console.log('开始获取系统详情，systemId:', props.systemId);
    const res = await getProjectEquipmentSystem(props.systemId!);
    const data = res.data as ProjectEquipmentSystemDetailVO;
    console.log('获取到的系统详情数据:', data);

    // 复制基本信息
    Object.assign(form, {
      id: data.id,
      projectId: data.projectId,
      projectName: data.projectName,
      templateId: data.templateId,
      systemCode: data.systemCode,
      systemName: data.systemName,
      systemType: data.systemType,
      category: data.category,
      description: data.description,
      responsiblePersonId: data.responsiblePersonId,
      responsiblePerson: data.responsiblePerson,
      status: data.status,
      priority: data.priority,
      sequenceNumber: data.sequenceNumber,
      remarks: data.remarks,
      version: data.version
    });

    console.log('表单数据已更新，form.id:', form.id);

    // 处理项目子系统数据
    if (data.projectSubsystems && Array.isArray(data.projectSubsystems)) {
      form.subsystems = data.projectSubsystems.map(item => ({
        id: item.id,
        projectSystemId: item.projectSystemId,
        projectId: item.projectId,
        templateId: item.templateId || undefined,
        subsystemCode: item.subsystemCode,
        subsystemName: item.subsystemName,
        subsystemType: item.subsystemType || undefined,
        category: item.category || undefined,
        specification: item.specification || undefined,
        model: item.model || undefined,
        manufacturer: item.manufacturer || undefined,
        description: item.description || undefined,
        status: item.status || undefined,
        sequenceNumber: item.sequenceNumber || undefined,
        remarks: item.remarks || undefined
      }));
    } else {
      form.subsystems = [];
    }
  } catch (error) {
    console.error('获取系统详情失败:', error);
    ElMessage.error('获取系统详情失败');
  }
};

/**
 * 重置表单
 */
const reset = () => {
  Object.assign(form, initFormData);
  form.subsystems = [];
  formRef.value?.resetFields();
};

/**
 * 处理负责人变更
 */
const handleResponsiblePersonChange = (userId: string | number) => {
  if (userId) {
    const user = userList.value.find(u => u.userId === userId);
    if (user) {
      form.responsiblePerson = user.nickName || user.userName;
    }
  } else {
    form.responsiblePerson = '';
  }
};

/**
 * 添加子系统
 */
const handleAddSubsystem = () => {
  subsystemSelectorVisible.value = true;
};

/**
 * 处理子系统选择确认
 */
const handleSubsystemConfirm = (selectedTemplates: any[]) => {
  // 将选中的子系统模板添加到表单中
  selectedTemplates.forEach(template => {
    const subsystem: any = {
      projectSystemId: form.id,
      projectId: form.projectId,
      templateId: template.id,
      subsystemCode: template.templateCode || '',
      subsystemName: template.templateName || '',
      subsystemType: template.subsystemType,
      category: template.category,
      description: template.description,
      status: 'DRAFT',
      remarks: `从模板创建：${template.templateName}`
    };
    form.subsystems.push(subsystem);
  });

  ElMessage.success(`成功添加 ${selectedTemplates.length} 个子系统`);
};

/**
 * 编辑子系统
 */
const handleEditSubsystem = (row: any, index: number) => {
  ElMessageBox.prompt('请输入子系统名称', '编辑子系统', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: row.subsystemName,
    inputValidator: (value: string) => {
      if (!value || value.trim() === '') {
        return '子系统名称不能为空';
      }
      return true;
    }
  }).then(({ value }) => {
    form.subsystems[index].subsystemName = value;
    ElMessage.success('修改成功');
  }).catch(() => {
    // 用户取消
  });
};

/**
 * 删除子系统
 */
const handleDeleteSubsystem = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该子系统吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    form.subsystems.splice(index, 1);
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
};

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    DRAFT: 'info',
    ACTIVE: 'success',
    COMPLETED: 'warning',
    ARCHIVED: 'danger'
  };
  return typeMap[status] || 'info';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    DRAFT: '草稿',
    ACTIVE: '活跃',
    COMPLETED: '已完成',
    ARCHIVED: '已归档'
  };
  return textMap[status] || status;
};

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      buttonLoading.value = true;
      try {
        console.log('准备提交表单，form.id:', form.id);
        console.log('完整表单数据:', form);

        // 构造提交数据 - 参考基本编辑表单的数据处理方式
        const submitData: ProjectEquipmentSystemFullForm = {
          ...form,
          // 确保ID字段存在（完整编辑必须有ID）
          id: form.id,
          projectId: form.projectId,
          subsystems: form.subsystems.map(item => ({
            projectSystemId: form.id,
            projectId: form.projectId,
            templateId: item.templateId,
            subsystemCode: item.subsystemCode,
            subsystemName: item.subsystemName,
            subsystemType: item.subsystemType,
            category: item.category,
            specification: item.specification,
            model: item.model,
            manufacturer: item.manufacturer,
            description: item.description,
            status: item.status,
            sequenceNumber: item.sequenceNumber,
            remarks: item.remarks
          }))
        };

        console.log('提交数据:', submitData);

        // 完整编辑功能 - 始终使用PUT方法
        console.log('使用PUT方法调用完整编辑接口');
        await updateProjectEquipmentSystemFull(submitData);
        ElMessage.success('修改成功');

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

/**
 * 取消
 */
const cancel = () => {
  emit('cancel');
};
</script>

<style scoped lang="scss">
.project-equipment-system-full-form {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebeef5;
  }

  .el-divider {
    margin: 24px 0 16px 0;

    .el-divider__text {
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .el-table {
    margin-top: 16px;

    .el-button {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .el-form-item {
    margin-bottom: 18px;
  }

  .el-input-number {
    width: 100%;
  }

  .el-select {
    width: 100%;
  }
}
</style>


