<template>
  <div class="saltprocess-project-form">
    <ProjectForm :project-id="projectId" @success="handleSuccess" @cancel="handleCancel" />
  </div>
</template>

<script setup name="SaltProcessProjectFormPage" lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectForm from './components/ProjectForm.vue'

const route = useRoute()
const router = useRouter()

const projectId = computed(() => String(route.params.id ?? ''))

const handleSuccess = () => {
  router.push('/saltprocess/project')
}

const handleCancel = () => {
  router.push('/saltprocess/project')
}
</script>

<style scoped lang="scss">
.saltprocess-project-form {
  padding: 12px;
}
</style>

