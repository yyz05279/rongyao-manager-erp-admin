<template>
  <div class="inventory-transfer-form">
    <el-alert type="info" title="库存调拨表单（占位组件）" show-icon class="mb-12" />
    <el-form label-width="120px">
      <el-form-item label="源仓库">
        <el-input placeholder="请选择源仓库" />
      </el-form-item>
      <el-form-item label="目标仓库">
        <el-input placeholder="请选择目标仓库" />
      </el-form-item>
      <el-form-item label="物料">
        <el-input placeholder="请选择物料" />
      </el-form-item>
      <el-form-item label="数量">
        <el-input placeholder="请输入数量" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleOk">模拟保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup name="InventoryTransferForm" lang="ts">
const emit = defineEmits<{ success: []; cancel: [] }>()
const handleOk = () => emit('success')
const handleCancel = () => emit('cancel')
</script>
<style scoped>
.mb-12 { margin-bottom: 12px; }
</style>

