<template>
  <el-dialog :model-value="visible" title="项目详情" width="700px" @close="onClose">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="项目ID">{{ projectId }}</el-descriptions-item>
      <el-descriptions-item label="项目名称">{{ detail.projectName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ detail.status || '-' }}</el-descriptions-item>
      <el-descriptions-item label="进度">{{ detail.progress ?? '-' }}%</el-descriptions-item>
      <el-descriptions-item label="开始日期">{{ detail.startDate || '-' }}</el-descriptions-item>
      <el-descriptions-item label="结束日期">{{ detail.endDate || '-' }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="onClose">关 闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="ProjectDetail" lang="ts">
import { reactive, watch } from 'vue'

interface Props {
  visible: boolean
  projectId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()

const detail = reactive({
  projectName: '',
  status: '',
  progress: 0,
  startDate: '',
  endDate: ''
})

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    // TODO: 根据 projectId 拉取详情
  }
)

const onClose = () => emit('update:visible', false)
</script>

<style scoped>
.dialog-footer { display: inline-flex; gap: 8px; }
</style>

