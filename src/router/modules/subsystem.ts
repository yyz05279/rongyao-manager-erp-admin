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
    // 子系统管理主页面
    {
      path: 'index',
      component: () => import('@/views/erp/subsystem/index.vue'),
      name: 'SubsystemManagement',
      meta: {
        title: '子系统列表',
        icon: 'list'
      },
      permissions: ['erp:subsystem:list']
    }
  ]
};

export default subsystemRouter;

