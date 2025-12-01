<template>
  <div class="heating-stages-management">
    <el-alert type="info" title="提温阶段管理（占位组件）" show-icon class="mb-12" />
    <el-empty description="阶段管理功能待实现" />
  </div>
</template>
<script setup name="HeatingStagesManagement" lang="ts">
interface Props { taskId: string }
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
</script>
<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

