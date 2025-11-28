<template>
  <div class="inspection-detail">
    <el-alert type="info" title="巡检详情（占位组件）" show-icon class="mb-12" />
    <el-descriptions :column="2" border>
      <el-descriptions-item label="巡检ID">{{ inspectionId }}</el-descriptions-item>
      <el-descriptions-item label="状态">--</el-descriptions-item>
      <el-descriptions-item label="巡检时间">--</el-descriptions-item>
      <el-descriptions-item label="巡检员">--</el-descriptions-item>
      <el-descriptions-item label="结果">--</el-descriptions-item>
      <el-descriptions-item label="备注">--</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup name="PreheatingInspectionDetail" lang="ts">
interface Props {
  inspectionId: string
}
const props = defineProps<Props>()
</script>

<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

