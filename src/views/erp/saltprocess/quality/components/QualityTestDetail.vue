<template>
  <div class="quality-test-detail">
    <el-alert type="info" title="检测详情（占位组件）" show-icon class="mb-12" />
    <el-descriptions :column="2" border>
      <el-descriptions-item label="检测ID">{{ testId }}</el-descriptions-item>
      <el-descriptions-item label="样品名称">--</el-descriptions-item>
      <el-descriptions-item label="检测类型">--</el-descriptions-item>
      <el-descriptions-item label="检测状态">--</el-descriptions-item>
      <el-descriptions-item label="检测结果">--</el-descriptions-item>
      <el-descriptions-item label="检测日期">--</el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">--</el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script setup name="QualityTestDetail" lang="ts">
interface Props { testId: string }
const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
</script>
<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

