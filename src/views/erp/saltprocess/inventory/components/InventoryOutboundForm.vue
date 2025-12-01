<template>
  <div class="inventory-outbound-form">
    <el-alert type="info" title="出库单表单（占位组件）" show-icon class="mb-12" />
    <el-form label-width="120px">
      <el-form-item label="物料ID">
        <el-input :model-value="materialId" readonly />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleOk">模拟保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup name="InventoryOutboundForm" lang="ts">
interface Props { materialId?: string }
const props = defineProps<Props>()
const emit = defineEmits<{ success: []; cancel: [] }>()
const handleOk = () => emit('success')
const handleCancel = () => emit('cancel')
</script>
<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

