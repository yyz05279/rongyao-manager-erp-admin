/**
 * 化盐工艺流程管理模块 - 路由配置
 */
import Layout from '@/layout/index.vue';
import { RouteOption } from 'vue-router';

const saltprocessRouter: RouteOption = {
  path: '/saltprocess',
  component: Layout,
  redirect: '/saltprocess/dashboard',
  name: 'SaltProcess',
  meta: {
    title: '化盐工艺流程',
    icon: 'chemistry',
    alwaysShow: true
  },
  children: [
    // 工艺流程总览
    {
      path: 'dashboard',
      component: () => import('@/views/erp/saltprocess/dashboard/index.vue'),
      name: 'SaltProcessDashboard',
      meta: {
        title: '工艺流程总览',
        icon: 'dashboard'
      }
    },
    
    // 项目管理
    {
      path: 'project',
      component: () => import('@/views/erp/saltprocess/project/index.vue'),
      name: 'SaltProcessProject',
      meta: {
        title: '项目管理',
        icon: 'project'
      }
    },
    {
      path: 'project/detail/:id',
      component: () => import('@/views/erp/saltprocess/project/detail.vue'),
      name: 'SaltProcessProjectDetail',
      hidden: true,
      meta: {
        title: '项目详情',
        activeMenu: '/saltprocess/project'
      }
    },
    {
      path: 'project/create',
      component: () => import('@/views/erp/saltprocess/project/form.vue'),
      name: 'SaltProcessProjectCreate',
      hidden: true,
      meta: {
        title: '创建项目',
        activeMenu: '/saltprocess/project'
      }
    },
    {
      path: 'project/edit/:id',
      component: () => import('@/views/erp/saltprocess/project/form.vue'),
      name: 'SaltProcessProjectEdit',
      hidden: true,
      meta: {
        title: '编辑项目',
        activeMenu: '/saltprocess/project'
      }
    },

    // 预热管理
    {
      path: 'preheating',
      component: () => import('@/views/erp/saltprocess/preheating/index.vue'),
      name: 'SaltProcessPreheating',
      meta: {
        title: '预热管理',
        icon: 'heating'
      }
    },
    {
      path: 'preheating/task/:id',
      component: () => import('@/views/erp/saltprocess/preheating/task.vue'),
      name: 'SaltProcessPreheatingTask',
      hidden: true,
      meta: {
        title: '预热任务',
        activeMenu: '/saltprocess/preheating'
      }
    },
    {
      path: 'preheating/monitor/:id',
      component: () => import('@/views/erp/saltprocess/preheating/monitor.vue'),
      name: 'SaltProcessPreheatingMonitor',
      hidden: true,
      meta: {
        title: '预热监控',
        activeMenu: '/saltprocess/preheating'
      }
    },
    {
      path: 'preheating/inspection/:id',
      component: () => import('@/views/erp/saltprocess/preheating/inspection.vue'),
      name: 'SaltProcessPreheatingInspection',
      hidden: true,
      meta: {
        title: '预热巡检',
        activeMenu: '/saltprocess/preheating'
      }
    },

    // 化盐工艺
    {
      path: 'saltmaking',
      component: () => import('@/views/erp/saltprocess/saltmaking/index.vue'),
      name: 'SaltProcessSaltmaking',
      meta: {
        title: '化盐工艺',
        icon: 'chemistry-flask'
      }
    },
    {
      path: 'saltmaking/task/:id',
      component: () => import('@/views/erp/saltprocess/saltmaking/task.vue'),
      name: 'SaltProcessSaltmakingTask',
      hidden: true,
      meta: {
        title: '化盐任务',
        activeMenu: '/saltprocess/saltmaking'
      }
    },
    {
      path: 'saltmaking/monitor/:id',
      component: () => import('@/views/erp/saltprocess/saltmaking/monitor.vue'),
      name: 'SaltProcessSaltmakingMonitor',
      hidden: true,
      meta: {
        title: '化盐监控',
        activeMenu: '/saltprocess/saltmaking'
      }
    },
    {
      path: 'saltmaking/ratio/:id',
      component: () => import('@/views/erp/saltprocess/saltmaking/ratio.vue'),
      name: 'SaltProcessSaltmakingRatio',
      hidden: true,
      meta: {
        title: '配比控制',
        activeMenu: '/saltprocess/saltmaking'
      }
    },

    // 提温工艺
    {
      path: 'heating',
      component: () => import('@/views/erp/saltprocess/heating/index.vue'),
      name: 'SaltProcessHeating',
      meta: {
        title: '提温工艺',
        icon: 'temperature'
      }
    },
    {
      path: 'heating/task/:id',
      component: () => import('@/views/erp/saltprocess/heating/task.vue'),
      name: 'SaltProcessHeatingTask',
      hidden: true,
      meta: {
        title: '提温任务',
        activeMenu: '/saltprocess/heating'
      }
    },
    {
      path: 'heating/monitor/:id',
      component: () => import('@/views/erp/saltprocess/heating/monitor.vue'),
      name: 'SaltProcessHeatingMonitor',
      hidden: true,
      meta: {
        title: '提温监控',
        activeMenu: '/saltprocess/heating'
      }
    },
    {
      path: 'heating/stages/:id',
      component: () => import('@/views/erp/saltprocess/heating/stages.vue'),
      name: 'SaltProcessHeatingStages',
      hidden: true,
      meta: {
        title: '分阶段控制',
        activeMenu: '/saltprocess/heating'
      }
    },

    // 库存管理
    {
      path: 'inventory',
      component: () => import('@/views/erp/saltprocess/inventory/index.vue'),
      name: 'SaltProcessInventory',
      meta: {
        title: '库存管理',
        icon: 'warehouse'
      }
    },
    {
      path: 'inventory/detail/:id',
      component: () => import('@/views/erp/saltprocess/inventory/detail.vue'),
      name: 'SaltProcessInventoryDetail',
      hidden: true,
      meta: {
        title: '库存详情',
        activeMenu: '/saltprocess/inventory'
      }
    },
    {
      path: 'inventory/transaction',
      component: () => import('@/views/erp/saltprocess/inventory/transaction.vue'),
      name: 'SaltProcessInventoryTransaction',
      hidden: true,
      meta: {
        title: '出入库记录',
        activeMenu: '/saltprocess/inventory'
      }
    },
    {
      path: 'inventory/count',
      component: () => import('@/views/erp/saltprocess/inventory/count.vue'),
      name: 'SaltProcessInventoryCount',
      hidden: true,
      meta: {
        title: '库存盘点',
        activeMenu: '/saltprocess/inventory'
      }
    },
    {
      path: 'inventory/alert',
      component: () => import('@/views/erp/saltprocess/inventory/alert.vue'),
      name: 'SaltProcessInventoryAlert',
      hidden: true,
      meta: {
        title: '库存预警',
        activeMenu: '/saltprocess/inventory'
      }
    },

    // 质量管理
    {
      path: 'quality',
      component: () => import('@/views/erp/saltprocess/quality/index.vue'),
      name: 'SaltProcessQuality',
      meta: {
        title: '质量管理',
        icon: 'quality'
      }
    },
    {
      path: 'quality/inspection/:id',
      component: () => import('@/views/erp/saltprocess/quality/inspection.vue'),
      name: 'SaltProcessQualityInspection',
      hidden: true,
      meta: {
        title: '质量检验',
        activeMenu: '/saltprocess/quality'
      }
    },
    {
      path: 'quality/batch',
      component: () => import('@/views/erp/saltprocess/quality/batch.vue'),
      name: 'SaltProcessQualityBatch',
      hidden: true,
      meta: {
        title: '批次管理',
        activeMenu: '/saltprocess/quality'
      }
    },
    {
      path: 'quality/batch/detail/:id',
      component: () => import('@/views/erp/saltprocess/quality/batch-detail.vue'),
      name: 'SaltProcessQualityBatchDetail',
      hidden: true,
      meta: {
        title: '批次详情',
        activeMenu: '/saltprocess/quality'
      }
    },
    {
      path: 'quality/nonconformity',
      component: () => import('@/views/erp/saltprocess/quality/nonconformity.vue'),
      name: 'SaltProcessQualityNonconformity',
      hidden: true,
      meta: {
        title: '不合格品处理',
        activeMenu: '/saltprocess/quality'
      }
    },
    {
      path: 'quality/standard',
      component: () => import('@/views/erp/saltprocess/quality/standard.vue'),
      name: 'SaltProcessQualityStandard',
      hidden: true,
      meta: {
        title: '质量标准',
        activeMenu: '/saltprocess/quality'
      }
    },

    // 数据分析
    {
      path: 'analytics',
      component: () => import('@/views/erp/saltprocess/analytics/index.vue'),
      name: 'SaltProcessAnalytics',
      meta: {
        title: '数据分析',
        icon: 'chart'
      }
    },
    {
      path: 'analytics/production',
      component: () => import('@/views/erp/saltprocess/analytics/production.vue'),
      name: 'SaltProcessAnalyticsProduction',
      hidden: true,
      meta: {
        title: '生产分析',
        activeMenu: '/saltprocess/analytics'
      }
    },
    {
      path: 'analytics/quality',
      component: () => import('@/views/erp/saltprocess/analytics/quality.vue'),
      name: 'SaltProcessAnalyticsQuality',
      hidden: true,
      meta: {
        title: '质量分析',
        activeMenu: '/saltprocess/analytics'
      }
    },
    {
      path: 'analytics/cost',
      component: () => import('@/views/erp/saltprocess/analytics/cost.vue'),
      name: 'SaltProcessAnalyticsCost',
      hidden: true,
      meta: {
        title: '成本分析',
        activeMenu: '/saltprocess/analytics'
      }
    },
    {
      path: 'analytics/equipment',
      component: () => import('@/views/erp/saltprocess/analytics/equipment.vue'),
      name: 'SaltProcessAnalyticsEquipment',
      hidden: true,
      meta: {
        title: '设备分析',
        activeMenu: '/saltprocess/analytics'
      }
    },
    {
      path: 'analytics/report',
      component: () => import('@/views/erp/saltprocess/analytics/report.vue'),
      name: 'SaltProcessAnalyticsReport',
      hidden: true,
      meta: {
        title: '分析报告',
        activeMenu: '/saltprocess/analytics'
      }
    }
  ]
};

export default saltprocessRouter;
