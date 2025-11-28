<template>
  <div class="heating-task-form">
    <el-alert type="info" title="提温任务表单（占位组件）" show-icon class="mb-12" />
    <el-form label-width="120px">
      <el-form-item label="任务ID">
        <el-input :model-value="taskId" readonly />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleOk">模拟保存并回调 success</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup name="HeatingTaskForm" lang="ts">
interface Props {
  taskId?: string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const handleOk = () => emit('success')
const handleCancel = () => emit('cancel')
</script>

<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

