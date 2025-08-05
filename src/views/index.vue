<template>
  <div class="app-container home">
    <!-- 系统标题区域 -->
    <div class="header-section">
      <h1 class="system-title">海棠企业管理系统</h1>
      <p class="system-desc">现代化的企业级管理平台，专注于提供高效、安全、易用的业务管理解决方案</p>
      <div class="version-info">
        <el-tag type="success">v1.0.0</el-tag>
        <el-tag type="primary">企业级解决方案</el-tag>
        <el-tag type="warning">持续迭代中</el-tag>
      </div>
    </div>

    <!-- 功能开发状态概览 -->
    <div class="overview-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="overview-card completed">
            <div class="overview-icon">
              <svg-icon icon-class="star" />
            </div>
            <div class="overview-content">
              <div class="overview-number">{{ overviewData.completedFeatures }}</div>
              <div class="overview-label">已完成功能</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="overview-card developing">
            <div class="overview-icon">
              <svg-icon icon-class="build" />
            </div>
            <div class="overview-content">
              <div class="overview-number">{{ overviewData.developingFeatures }}</div>
              <div class="overview-label">开发中功能</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="overview-card planned">
            <div class="overview-icon">
              <svg-icon icon-class="guide" />
            </div>
            <div class="overview-content">
              <div class="overview-number">{{ overviewData.plannedFeatures }}</div>
              <div class="overview-label">计划中功能</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6">
          <div class="overview-card total">
            <div class="overview-icon">
              <svg-icon icon-class="component" />
            </div>
            <div class="overview-content">
              <div class="overview-number">{{ overviewData.totalModules }}</div>
              <div class="overview-label">功能模块</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 功能模块开发状态 -->
    <div class="modules-section">
      <h2 class="section-title">功能模块开发状态</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8" v-for="module in moduleList" :key="module.id">
          <div class="module-card">
            <div class="module-header">
              <div class="module-icon" :class="module.iconClass">
                <svg-icon :icon-class="module.icon" />
              </div>
              <div class="module-info">
                <h3 class="module-title">{{ module.title }}</h3>
                <el-tag :type="module.statusType" size="small">{{ module.status }}</el-tag>
              </div>
            </div>
            <div class="module-content">
              <p class="module-desc">{{ module.description }}</p>
              <div class="module-progress">
                <div class="progress-info">
                  <span class="progress-text">完成度</span>
                  <span class="progress-percent">{{ module.progress }}%</span>
                </div>
                <el-progress :percentage="module.progress" :color="module.progressColor" :show-text="false" />
              </div>
              <div class="module-functions">
                <div class="function-category">
                  <h4 class="category-title">已完成功能</h4>
                  <div class="function-list">
                    <div
                      class="function-item completed"
                      v-for="func in module.completedFunctions"
                      :key="func.name"
                    >
                      <svg-icon icon-class="star" class="function-status" />
                      <span class="function-name">{{ func.name }}</span>
                      <span class="function-version">{{ func.version }}</span>
                    </div>
                  </div>
                </div>
                <div class="function-category" v-if="module.plannedFunctions && module.plannedFunctions.length > 0">
                  <h4 class="category-title">计划功能</h4>
                  <div class="function-list">
                    <div
                      class="function-item planned"
                      v-for="func in module.plannedFunctions"
                      :key="func.name"
                    >
                      <svg-icon icon-class="guide" class="function-status" />
                      <span class="function-name">{{ func.name }}</span>
                      <span class="function-version">{{ func.version }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 版本迭代记录 -->
    <div class="changelog-section">
      <h2 class="section-title">版本迭代记录</h2>
      <div class="changelog-timeline">
        <div class="timeline-item" v-for="version in versionHistory" :key="version.version">
          <div class="timeline-marker" :class="version.type">
            <svg-icon :icon-class="version.icon" />
          </div>
          <div class="timeline-content">
            <div class="version-header">
              <h3 class="version-title">{{ version.version }}</h3>
              <span class="version-date">{{ version.date }}</span>
              <el-tag :type="version.tagType" size="small">{{ version.status }}</el-tag>
            </div>
            <p class="version-desc">{{ version.description }}</p>
            <div class="version-features">
              <div class="feature-item" v-for="feature in version.features" :key="feature">
                <svg-icon icon-class="star" />
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="Index" lang="ts">
import { initWebSocket } from '@/utils/websocket';

// 功能开发状态概览数据
const overviewData = ref({
  completedFeatures: 25,
  developingFeatures: 8,
  plannedFeatures: 12,
  totalModules: 3
});

// 功能模块数据（重新设计为开发状态展示）
const moduleList = ref([
  {
    id: 'system',
    title: '系统管理',
    description: '用户、角色、权限等系统基础管理功能',
    icon: 'system',
    iconClass: 'system-module',
    status: '已完成',
    statusType: 'success',
    progress: 100,
    progressColor: '#67c23a',
    completedFunctions: [
      { name: '用户管理', version: 'v1.0.0' },
      { name: '角色管理', version: 'v1.0.0' },
      { name: '部门管理', version: 'v1.0.0' },
      { name: '菜单管理', version: 'v1.0.0' },
      { name: '字典管理', version: 'v1.0.0' },
      { name: '参数配置', version: 'v1.0.0' },
      { name: '通知公告', version: 'v1.0.0' },
      { name: 'OSS管理', version: 'v1.0.0' }
    ],
    plannedFunctions: [
      { name: '岗位管理', version: 'v1.1.0' },
      { name: '租户管理', version: 'v1.2.0' }
    ]
  },
  {
    id: 'erp',
    title: 'ERP业务',
    description: '财务、采购、销售、库存等核心业务管理',
    icon: 'shopping',
    iconClass: 'erp-module',
    status: '开发中',
    statusType: 'warning',
    progress: 75,
    progressColor: '#e6a23c',
    completedFunctions: [
      { name: '付款管理', version: 'v1.0.0' },
      { name: '收款管理', version: 'v1.0.0' },
      { name: '结算账户', version: 'v1.0.0' },
      { name: '产品管理', version: 'v1.0.0' },
      { name: '产品分类', version: 'v1.0.0' },
      { name: '采购订单', version: 'v1.0.0' },
      { name: '采购入库', version: 'v1.0.0' },
      { name: '供应商管理', version: 'v1.0.0' },
      { name: '客户管理', version: 'v1.0.0' }
    ],
    plannedFunctions: [
      { name: '销售订单', version: 'v1.1.0' },
      { name: '销售出库', version: 'v1.1.0' },
      { name: '库存盘点', version: 'v1.2.0' },
      { name: '财务报表', version: 'v1.2.0' },
      { name: '成本核算', version: 'v1.3.0' }
    ]
  },
  {
    id: 'monitor',
    title: '监控工具',
    description: '系统监控、日志管理、性能分析等工具',
    icon: 'monitor',
    iconClass: 'monitor-module',
    status: '已完成',
    statusType: 'success',
    progress: 100,
    progressColor: '#67c23a',
    completedFunctions: [
      { name: '在线用户', version: 'v1.0.0' },
      { name: '登录日志', version: 'v1.0.0' },
      { name: '操作日志', version: 'v1.0.0' },
      { name: '缓存监控', version: 'v1.0.0' }
    ],
    plannedFunctions: [
      { name: '性能监控', version: 'v1.1.0' },
      { name: '错误追踪', version: 'v1.2.0' }
    ]
  }
]);

// 版本迭代记录
const versionHistory = ref([
  {
    version: 'v1.0.0',
    date: '2024-01-15',
    status: '已发布',
    tagType: 'success',
    type: 'released',
    icon: 'star',
    description: '系统基础功能完成，包含用户管理、权限控制、基础ERP功能和监控工具',
    features: [
      '完整的用户权限管理体系',
      '基础ERP业务流程',
      '系统监控和日志管理',
      '响应式前端界面'
    ]
  },
  {
    version: 'v1.1.0',
    date: '2024-03-01',
    status: '开发中',
    tagType: 'warning',
    type: 'developing',
    icon: 'build',
    description: '增强ERP功能，完善销售管理模块，优化用户体验',
    features: [
      '销售订单管理',
      '销售出库流程',
      '岗位管理功能',
      '界面优化升级'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2024-05-01',
    status: '计划中',
    tagType: 'info',
    type: 'planned',
    icon: 'guide',
    description: '完善库存管理，增加财务报表，提升系统性能',
    features: [
      '库存盘点功能',
      '财务报表模块',
      '租户管理系统',
      '性能监控工具'
    ]
  },
  {
    version: 'v1.3.0',
    date: '2024-07-01',
    status: '规划中',
    tagType: 'info',
    type: 'planned',
    icon: 'guide',
    description: '高级功能开发，包含成本核算、数据分析等企业级功能',
    features: [
      '成本核算系统',
      '数据分析平台',
      '工作流引擎',
      '移动端支持'
    ]
  }
]);

onMounted(() => {
  let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://'
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + "/resource/websocket");
});
</script>

<style scoped lang="scss">
.home {
  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #676a6c;
  overflow-x: hidden;

  // 系统标题区域
  .header-section {
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    margin-bottom: 30px;
    color: white;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="50" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="30" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .system-title {
      font-size: 36px;
      font-weight: 300;
      margin: 0 0 15px 0;
      position: relative;
      z-index: 1;

      @media (max-width: 768px) {
        font-size: 28px;
      }
    }

    .system-desc {
      font-size: 16px;
      margin: 0 0 20px 0;
      opacity: 0.9;
      position: relative;
      z-index: 1;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;

      @media (max-width: 768px) {
        font-size: 14px;
      }
    }

    .version-info {
      position: relative;
      z-index: 1;

      .el-tag {
        margin: 0 8px;

        @media (max-width: 768px) {
          margin: 4px;
          display: inline-block;
        }
      }
    }
  }

  // 功能开发状态概览区域
  .overview-section {
    margin-bottom: 30px;

    .overview-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      @media (max-width: 768px) {
        padding: 16px;
        flex-direction: column;
        text-align: center;
      }

      .overview-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;

        @media (max-width: 768px) {
          margin-right: 0;
          margin-bottom: 12px;
        }
      }

      &.completed .overview-icon {
        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        color: white;
      }

      &.developing .overview-icon {
        background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
        color: white;
      }

      &.planned .overview-icon {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        color: white;
      }

      &.total .overview-icon {
        background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
        color: white;
      }

      .overview-content {
        flex: 1;

        .overview-number {
          font-size: 28px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }

        .overview-label {
          font-size: 14px;
          color: #7f8c8d;
        }
      }
    }
  }

  // 功能模块区域
  .modules-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 24px;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 20px;
      text-align: center;
    }

    .module-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 20px;
      height: 100%;
      border: 1px solid rgba(0, 0, 0, 0.05);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      @media (max-width: 768px) {
        padding: 20px;
      }

      .module-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20px;

        .module-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 20px;
          flex-shrink: 0;

          &.system-module {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          &.erp-module {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }

          &.monitor-module {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
          }
        }

        .module-info {
          flex: 1;

          .module-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 8px 0;
          }
        }
      }

      .module-content {
        .module-desc {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .module-progress {
          margin-bottom: 20px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .progress-text {
              font-size: 14px;
              color: #606266;
              font-weight: 500;
            }

            .progress-percent {
              font-size: 14px;
              color: #409eff;
              font-weight: 600;
            }
          }
        }

        .module-functions {
          .function-category {
            margin-bottom: 20px;

            &:last-child {
              margin-bottom: 0;
            }

            .category-title {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
              margin: 0 0 12px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #f0f0f0;
            }

            .function-list {
              .function-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border-radius: 6px;
                margin-bottom: 4px;
                transition: all 0.2s ease;
                border: 1px solid transparent;

                &.completed {
                  background: rgba(103, 194, 58, 0.1);
                  border-color: rgba(103, 194, 58, 0.2);

                  .function-status {
                    color: #67c23a;
                  }

                  .function-name {
                    color: #67c23a;
                  }

                  .function-version {
                    background: #67c23a;
                    color: white;
                  }
                }

                &.planned {
                  background: rgba(64, 158, 255, 0.1);
                  border-color: rgba(64, 158, 255, 0.2);

                  .function-status {
                    color: #409eff;
                  }

                  .function-name {
                    color: #409eff;
                  }

                  .function-version {
                    background: #409eff;
                    color: white;
                  }
                }

                .function-status {
                  font-size: 12px;
                  margin-right: 8px;
                }

                .function-name {
                  flex: 1;
                  font-size: 13px;
                  font-weight: 500;
                }

                .function-version {
                  font-size: 11px;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-weight: 500;
                }

                &:last-child {
                  margin-bottom: 0;
                }
              }
            }
          }
        }
      }
    }
  }

  // 版本迭代记录区域
  .changelog-section {
    .section-title {
      font-size: 24px;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }

    .changelog-timeline {
      position: relative;
      padding-left: 30px;

      &::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, #e1e4e8, #f6f8fa);
      }

      .timeline-item {
        position: relative;
        margin-bottom: 40px;

        &:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -22px;
          top: 8px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &.released {
            background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
            color: white;
          }

          &.developing {
            background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
            color: white;
          }

          &.planned {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
            color: white;
          }
        }

        .timeline-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          }

          .version-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 12px;

            .version-title {
              font-size: 20px;
              font-weight: 600;
              color: #2c3e50;
              margin: 0;
            }

            .version-date {
              font-size: 14px;
              color: #7f8c8d;
            }
          }

          .version-desc {
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
            margin-bottom: 16px;
          }

          .version-features {
            .feature-item {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
              font-size: 13px;
              color: #606266;

              &:last-child {
                margin-bottom: 0;
              }

              svg {
                color: #67c23a;
                margin-right: 8px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
