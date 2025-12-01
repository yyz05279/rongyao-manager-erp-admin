<template>
  <el-dialog :model-value="visible" :title="title || (projectId ? '编辑项目' : '新增项目')" width="600px" @close="onClose">
    <el-form :model="form" label-width="100px">
      <el-form-item label="项目名称">
        <el-input v-model="form.projectName" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="项目状态">
        <el-select v-model="form.status" placeholder="请选择">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="规划中" value="PLANNING" />
          <el-option label="进行中" value="IN_PROGRESS" />
          <el-option label="已完成" value="COMPLETED" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期">
        <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期" />
      </el-form-item>
      <el-form-item label="结束日期">
        <el-date-picker v-model="form.endDate" type="date" placeholder="选择日期" />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('update:visible', false)">取 消</el-button>
        <el-button type="primary" @click="onSubmit">保 存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="ProjectForm" lang="ts">
import { reactive, watch } from 'vue'

interface Props {
  visible: boolean
  projectId?: string
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'success'): void
}>()

const form = reactive({
  projectName: '',
  status: 'DRAFT',
  startDate: '',
  endDate: ''
})

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    // 如果是编辑，实际场景应根据 projectId 拉取详情，这里占位
    if (props.projectId) {
      // TODO: 拉取并填充表单
    } else {
      form.projectName = ''
      form.status = 'DRAFT'
      form.startDate = ''
      form.endDate = ''
    }
  },
  { immediate: true }
)

const onSubmit = () => {
  // TODO: 提交保存逻辑
  emit('success')
}

const onClose = () => emit('update:visible', false)
</script>

<style scoped>
.dialog-footer {
  display: inline-flex;
  gap: 8px;
}
</style>

