<template>
  <el-dialog :model-value="visible" title="成员管理" width="800px" @close="onClose">
    <el-table :data="members" height="300">
      <el-table-column prop="name" label="姓名" width="160" />
      <el-table-column prop="role" label="角色" width="160" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="onClose">关 闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup name="ProjectMembers" lang="ts">
import { reactive, watch } from 'vue'

interface Props {
  visible: boolean
  projectId: string
  projectName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()

const members = reactive([
  { name: '张三', role: '项目经理', email: 'zhangsan@example.com' },
  { name: '李四', role: '开发', email: 'lisi@example.com' }
])

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    // TODO: 根据 projectId 拉取成员列表
  }
)

const onClose = () => emit('update:visible', false)
</script>

<style scoped>
.dialog-footer { display: inline-flex; gap: 8px; }
</style>

