/**
 * 通用项目管理模块 - 路由配置
 * 注意：此模块为通用项目管理，与 saltprocess/project（盐化工艺项目）模块功能互补
 * - saltprocess/project: 专门用于盐化工艺项目的工艺流程管理
 * - erp/project: 通用项目管理，适用于各种类型的企业项目
 */
import Layout from '@/layout/index.vue';
import { RouteOption } from 'vue-router';

const projectRouter: RouteOption = {
  path: '/erp/project',
  component: Layout,
  redirect: '/erp/project/index',
  name: 'ProjectManagement',
  meta: {
    title: '通用项目管理',
    icon: 'project-management',
    alwaysShow: true,
    roles: ['admin', 'project_manager']
  },
  children: [
    // 项目列表
    {
      path: 'index',
      component: () => import('@/views/erp/project/index.vue'),
      name: 'ProjectList',
      meta: {
        title: '项目列表',
        icon: 'list',
        permissions: ['erp:project:list']
      }
    },
    
    // 项目详情
    {
      path: 'detail/:id',
      component: () => import('@/views/erp/project/detail.vue'),
      name: 'ProjectDetail',
      hidden: true,
      meta: {
        title: '项目详情',
        activeMenu: '/erp/project/index',
        permissions: ['erp:project:list']
      }
    },
    
    // 创建项目
    {
      path: 'create',
      component: () => import('@/views/erp/project/form.vue'),
      name: 'ProjectCreate',
      hidden: true,
      meta: {
        title: '创建项目',
        activeMenu: '/erp/project/index',
        permissions: ['erp:project:add']
      }
    },
    
    // 编辑项目
    {
      path: 'edit/:id',
      component: () => import('@/views/erp/project/form.vue'),
      name: 'ProjectEdit',
      hidden: true,
      meta: {
        title: '编辑项目',
        activeMenu: '/erp/project/index',
        permissions: ['erp:project:edit']
      }
    },
    
    // 项目成员管理
    {
      path: 'members/:id',
      component: () => import('@/views/erp/project/members.vue'),
      name: 'ProjectMembers',
      hidden: true,
      meta: {
        title: '成员管理',
        activeMenu: '/erp/project/index',
        permissions: ['erp:project:member']
      }
    },
    
    // 项目任务管理
    {
      path: 'tasks/:id',
      component: () => import('@/views/erp/project/tasks.vue'),
      name: 'ProjectTasks',
      hidden: true,
      meta: {
        title: '任务管理',
        activeMenu: '/erp/project/index',
        permissions: ['erp:project:task']
      }
    },
    
    // 项目仪表板
    {
      path: 'dashboard',
      component: () => import('@/views/erp/project/dashboard.vue'),
      name: 'ProjectDashboard',
      meta: {
        title: '项目仪表板',
        icon: 'dashboard',
        permissions: ['erp:project:list']
      }
    },
    
    // 项目统计
    {
      path: 'statistics',
      component: () => import('@/views/erp/project/statistics.vue'),
      name: 'ProjectStatistics',
      meta: {
        title: '项目统计',
        icon: 'chart',
        permissions: ['erp:project:list']
      }
    }
  ]
} as RouteOption;

export default projectRouter;
