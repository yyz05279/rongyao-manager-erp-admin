<template>
  <div class="quality-review-form">
    <el-alert type="info" title="质量审核表单（占位组件）" show-icon class="mb-12" />
    <el-form label-width="120px">
      <el-form-item label="检测ID">
        <el-input :model-value="testId" readonly />
      </el-form-item>
      <el-form-item label="审核意见">
        <el-input type="textarea" rows="4" placeholder="请输入审核意见" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleOk">模拟审核通过</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup name="QualityReviewForm" lang="ts">
interface Props { testId?: string }
const props = defineProps<Props>()
const emit = defineEmits<{ success: []; cancel: [] }>()
const handleOk = () => emit('success')
const handleCancel = () => emit('cancel')
</script>
<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

