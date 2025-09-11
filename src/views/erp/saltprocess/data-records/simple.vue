<template>
  <div style="padding: 20px; background: yellow; border: 5px solid green;">
    <h1 style="color: red;">🎯 简单测试页面</h1>
    <p style="color: blue; font-size: 18px;">这是一个最简单的Vue组件</p>
    <p style="color: purple;">如果你能看到这个页面，说明路由和组件加载都是正常的</p>
  </div>
</template>

<script setup>
console.log('🎯 [SIMPLE] 简单组件开始加载...');
console.log('🎯 [SIMPLE] 当前时间:', new Date().toLocaleString());
console.log('🎯 [SIMPLE] 组件已成功导入');
</script>
