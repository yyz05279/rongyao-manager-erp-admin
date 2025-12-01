<template>
  <div class="quality-test-report">
    <el-alert type="info" title="检测报告（占位组件）" show-icon class="mb-12" />
    <el-empty description="检测报告展示待实现" />
  </div>
</template>
<script setup name="QualityTestReport" lang="ts">
interface Props { testId: string }
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
</script>
<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

