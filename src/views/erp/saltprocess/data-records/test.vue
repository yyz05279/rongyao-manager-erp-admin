<template>
  <div>
    <h1>测试页面 - 化盐记录</h1>
    <p>如果你能看到这个页面，说明路由配置是正确的</p>
    <p>当前时间: {{ currentTime }}</p>
    <p>页面状态: 正常加载</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

console.log('🧪 [TEST] 测试页面开始加载...');

const currentTime = ref(new Date().toLocaleString());

onMounted(() => {
  console.log('🧪 [TEST] 测试页面已挂载');
  setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
});
</script>

<style scoped>
div {
  padding: 20px;
  background: #f0f0f0;
  border: 2px solid #ccc;
  margin: 20px;
}

h1 {
  color: red;
  font-size: 24px;
}

p {
  color: blue;
  font-size: 16px;
}
</style>
