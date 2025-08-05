<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>海棠企业管理系统</h2>
        <p>
          海棠企业管理系统是一个现代化的企业级管理平台，专注于提供高效、安全、易用的业务管理解决方案。
          <br />
          * 前端技术栈 Vue3、TypeScript、Element Plus<br />
          * 响应式设计 支持多终端设备访问<br />
          * 权限管理 基于角色的访问控制系统<br />
          * 数据安全 多层次的数据保护机制<br />
          * 财务管理 完整的财务流程管理<br />
          * 人事管理 员工信息与组织架构管理<br />
          * 项目管理 项目进度与资源管理<br />
          * 客户管理 客户关系维护与跟进<br />
          * 供应商管理 供应商信息与合作管理<br />
          * 库存管理 物料库存实时监控<br />
          * 报表分析 多维度数据分析与可视化<br />
          * 工作流程 灵活的业务流程配置<br />
          * 消息通知 实时消息推送与提醒<br />
          * 系统监控 全方位的系统运行监控<br />
        </p>
        <p><b>当前版本:</b> <span>v1.0.0</span></p>
        <p>
          <el-tag type="success">企业级解决方案</el-tag>
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>系统核心功能</h2>
        <p>
          海棠企业管理系统提供全面的企业管理功能模块，满足不同规模企业的管理需求。
          <br />
          * 用户管理 完善的用户权限体系<br />
          * 角色管理 灵活的角色权限配置<br />
          * 部门管理 组织架构层级管理<br />
          * 菜单管理 动态菜单权限控制<br />
          * 财务管理 收支流水全程跟踪<br />
          * 付款管理 付款流程规范化管理<br />
          * 收款管理 收款记录自动化处理<br />
          * 客户管理 客户信息集中管理<br />
          * 供应商管理 供应商资质评估<br />
          * 合同管理 合同全生命周期管理<br />
          * 项目管理 项目进度实时监控<br />
          * 库存管理 物料出入库管理<br />
          * 报表统计 多维度数据分析<br />
          * 系统监控 运行状态实时监控<br />
          * 操作日志 用户行为全程记录<br />
          * 数据备份 重要数据安全保障<br />
        </p>
        <p><b>系统特色:</b></p>
        <p>
          <el-tag type="primary">安全可靠</el-tag>
          <el-tag type="success">易于使用</el-tag>
          <el-tag type="warning">功能完善</el-tag>
        </p>
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>

<script setup name="Index" lang="ts">
import { initWebSocket } from '@/utils/websocket';

onMounted(() => {
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + "/resource/websocket");
});

const goTarget = (url:string) => {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>
