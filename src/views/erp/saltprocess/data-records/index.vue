<template>
  <div style="padding: 20px; background: white; min-height: 500px; border: 3px solid red;" class="salt-data-records">
    <div style="background: #ff0000; color: white; padding: 10px; margin-bottom: 20px; font-weight: bold;">
      🚨 调试模式 - 如果你能看到这个红色框，说明Vue组件已经渲染
    </div>
    <h1 style="color: #409eff; margin-bottom: 20px;">🧪 化盐项目数据记录系统</h1>
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #059669; font-weight: bold;">✅ 页面加载成功！路由配置正确！</p>
      <p style="margin: 10px 0 0 0; color: #374151; font-size: 14px;">当前时间: {{ currentTime }}</p>
      <p style="margin: 5px 0 0 0; color: #374151; font-size: 14px;">组件状态: {{ componentStatus }}</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;" data-stats="true">
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;" data-card="preheating">
        <h2 style="color: #3b82f6; margin: 0 0 10px 0;">156</h2>
        <p style="margin: 0; color: #64748b;">预热记录</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;" data-card="binary">
        <h2 style="color: #10b981; margin: 0 0 10px 0;">89</h2>
        <p style="margin: 0; color: #64748b;">二元化盐记录</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;" data-card="ternary">
        <h2 style="color: #f59e0b; margin: 0 0 10px 0;">67</h2>
        <p style="margin: 0; color: #64748b;">三元化盐记录</p>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e2e8f0;" data-card="quality">
        <h2 style="color: #ef4444; margin: 0 0 10px 0;">96.8%</h2>
        <p style="margin: 0; color: #64748b;">质量合格率</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">🔥 预热数据记录</h3>
        <p style="color: #6b7280; margin: 0 0 10px 0;">管理熔盐罐预热过程的温度、压力、能耗等关键数据记录</p>
        <p style="color: #374151; margin: 0; font-size: 14px;"><strong>今日记录:</strong> 12 | <strong>平均温度:</strong> 448.5°C</p>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">⚗️ 二元化盐记录</h3>
        <p style="color: #6b7280; margin: 0 0 10px 0;">记录NaNO3和KNO3二元化盐生产过程的配比、反应、质量数据</p>
        <p style="color: #374151; margin: 0; font-size: 14px;"><strong>今日产量:</strong> 2580kg | <strong>产出率:</strong> 94.2%</p>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="color: #1f2937; margin: 0 0 15px 0;">🧬 三元化盐记录</h3>
        <p style="color: #6b7280; margin: 0 0 10px 0;">管理NaNO3、KNO3、NaNO2三元化盐生产的完整工艺数据</p>
        <p style="color: #374151; margin: 0; font-size: 14px;"><strong>今日产量:</strong> 1890kg | <strong>稳定性指数:</strong> 8.7</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
      <button style="padding: 15px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">➕ 新增预热记录</button>
      <button style="padding: 15px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">➕ 新增二元记录</button>
      <button style="padding: 15px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">➕ 新增三元记录</button>
      <button style="padding: 15px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">📊 数据导出</button>
    </div>
  </div>
</template>

<script setup name="SaltDataRecords">
// 极简版本 - 化盐数据记录页面
console.log('🚀 [SaltDataRecords] 开始加载化盐数据记录页面...');
console.log('🚀 [SaltDataRecords] 当前时间:', new Date().toLocaleString());
console.log('🚀 [SaltDataRecords] 当前URL:', window.location.href);
console.log('🚀 [SaltDataRecords] 组件名称:', 'SaltDataRecords');

import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue';

// 响应式数据
const currentTime = ref(new Date().toLocaleString());
const componentStatus = ref('初始化中...');

onBeforeMount(() => {
  console.log('🔄 [SaltDataRecords] onBeforeMount - 组件即将挂载');
  componentStatus.value = '即将挂载...';
});

onMounted(() => {
  console.log('✅ [SaltDataRecords] onMounted - 组件已成功挂载到DOM');
  componentStatus.value = '已挂载成功';

  // 更新时间
  setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);

  console.log('✅ [SaltDataRecords] DOM元素检查:', document.querySelector('.salt-data-records'));

  // 检查页面元素是否存在
  setTimeout(() => {
    const titleElement = document.querySelector('h1');
    const statsElements = document.querySelectorAll('[data-stats]');
    const debugElement = document.querySelector('.salt-data-records');

    console.log('🔍 [SaltDataRecords] 页面元素检查:');
    console.log('  - 根元素:', debugElement);
    console.log('  - 标题元素:', titleElement);
    console.log('  - 统计卡片数量:', statsElements.length);
    console.log('  - 页面内容包含目标文字:', document.body.innerHTML.includes('化盐项目数据记录系统'));
    console.log('  - 完整页面HTML长度:', document.body.innerHTML.length);

    componentStatus.value = `已完成检查 - 找到${statsElements.length}个统计卡片`;
  }, 100);
});

onBeforeUnmount(() => {
  console.log('🔄 [SaltDataRecords] onBeforeUnmount - 组件即将卸载');
});

console.log('✅ [SaltDataRecords] 脚本执行完成，等待组件挂载...');
</script>