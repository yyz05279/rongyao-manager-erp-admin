<template>
  <div>
    <el-card v-if="!isServiceAvailable" class="service-info-card">
      <template #header>
        <div class="card-header">
          <span>PowerJob 任务调度中心</span>
        </div>
      </template>
      <div class="service-info">
        <el-alert
          title="服务未启动"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>PowerJob 任务调度服务当前未运行。</p>
            <p><strong>服务地址：</strong>{{ url }}</p>
            <p><strong>启动说明：</strong></p>
            <ul>
              <li>请确保 PowerJob 服务已启动</li>
              <li>默认端口：7700</li>
              <li>PowerJob 是一个分布式任务调度与计算框架</li>
            </ul>
          </template>
        </el-alert>
        <div class="action-buttons">
          <el-button type="primary" @click="checkService">重新检测</el-button>
          <el-button type="success" @click="openInNewTab">在新窗口打开</el-button>
        </div>
      </div>
    </el-card>
    <i-frame v-else v-model:src="url"></i-frame>
  </div>
</template>

<script setup lang="ts">
const url = ref(import.meta.env.VITE_APP_POWERJOB_ADMIN);
const isServiceAvailable = ref(false);

// 检查服务是否可用
const checkService = async () => {
  try {
    await fetch(url.value, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    isServiceAvailable.value = true;
  } catch (error) {
    isServiceAvailable.value = false;
  }
};

// 在新窗口打开
const openInNewTab = () => {
  window.open(url.value, '_blank');
};

// 组件挂载时检查服务
onMounted(() => {
  checkService();
});
</script>

<style scoped>
.service-info-card {
  margin: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.service-info {
  padding: 20px 0;
}

.service-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.service-info li {
  margin: 5px 0;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}

.action-buttons .el-button {
  margin: 0 10px;
}
</style>
