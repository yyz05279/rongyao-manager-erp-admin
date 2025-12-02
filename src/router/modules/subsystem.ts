/**
 * 子系统管理模块 - 路由配置
 */
import Layout from '@/layout/index.vue';
import { RouteOption } from 'vue-router';

const subsystemRouter: RouteOption = {
  path: '/subsystem',
  component: Layout,
  redirect: '/subsystem/index',
  name: 'Subsystem',
  meta: {
    title: '子系统管理',
    icon: 'component',
    alwaysShow: true
  },
  children: [
    // 子系统列表
    {
      path: 'index',
      component: () => import('@/views/erp/subsystem/index.vue'),
      name: 'SubsystemManagement',
      meta: {
        title: '子系统列表',
        icon: 'list'
      },
      permissions: ['erp:subsystem:list']
    },
    // 子系统模板
    {
      path: 'equipment-subsystem-template',
      component: () => import('@/views/erp/subsystem/template/index.vue'),
      name: 'SubsystemTemplate',
      meta: {
        title: '子系统模板',
        icon: 'document-copy'
      },
      permissions: ['erp:subsystem:template:list']
    },
    // 子项模板管理
    {
      path: 'equipment-item-template',
      component: () => import('@/views/erp/subsystem/item-template/index.vue'),
      name: 'ItemTemplateManagement',
      meta: {
        title: '子项模板管理',
        icon: 'menu'
      },
      permissions: ['erp:subsystem:template:list']
    }
  ]
} as RouteOption;

export default subsystemRouter;
