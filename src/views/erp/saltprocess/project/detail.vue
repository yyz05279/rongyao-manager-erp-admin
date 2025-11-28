<template>
  <div class="saltprocess-project-detail">
    <ProjectDetail :project-id="projectId" @close="handleClose" />
  </div>
</template>

<script setup name="SaltProcessProjectDetailPage" lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectDetail from './components/ProjectDetail.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => String(route.params.id ?? ''))

const handleClose = () => {
  router.push('/saltprocess/project')
}
</script>

<style scoped lang="scss">
.saltprocess-project-detail {
  padding: 12px;
}
</style>

