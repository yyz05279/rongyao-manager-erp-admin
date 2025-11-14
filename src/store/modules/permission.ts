import { defineStore } from 'pinia';
import router, { constantRoutes, dynamicRoutes } from '@/router';
import store from '@/store';
import { getRouters } from '@/api/menu';
import Layout from '@/layout/index.vue';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import auth from '@/plugins/auth';
import { RouteOption } from 'vue-router';
// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue');

// 组件路径映射表 - 用于后台菜单配置缺少component时的回退方案
const componentPathMap: Record<string, any> = {
  // 子系统管理
  '/subsystem/item-template': () => import('@/views/erp/subsystem/item-template/index.vue'),
  'item-template': () => import('@/views/erp/subsystem/item-template/index.vue'),
  '/subsystem/template': () => import('@/views/erp/subsystem/template/index.vue'),
  'template': () => import('@/views/erp/subsystem/template/index.vue'),
  '/subsystem/index': () => import('@/views/erp/subsystem/index.vue'),
  'index': () => import('@/views/erp/subsystem/index.vue'),

  // 化盐工艺流程
  '/saltprocess/record': () => import('@/views/erp/saltprocess/records/index.vue'),
  'record': () => import('@/views/erp/saltprocess/records/index.vue'),
  '/saltprocess/making-task': () => import('@/views/erp/saltprocess/saltmaking/task.vue'),
  'making-task': () => import('@/views/erp/saltprocess/saltmaking/task.vue'),
  '/saltprocess/preheating-task': () => import('@/views/erp/saltprocess/preheating/task.vue'),
  'preheating-task': () => import('@/views/erp/saltprocess/preheating/task.vue'),
};

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteOption[]>([]);
  const addRoutes = ref<RouteOption[]>([]);
  const defaultRoutes = ref<RouteOption[]>([]);
  const topbarRouters = ref<RouteOption[]>([]);
  const sidebarRouters = ref<RouteOption[]>([]);

  const setRoutes = (newRoutes: RouteOption[]): void => {
    addRoutes.value = newRoutes;
    routes.value = constantRoutes.concat(newRoutes);
  };
  const setDefaultRoutes = (routes: RouteOption[]): void => {
    defaultRoutes.value = constantRoutes.concat(routes);
  };
  const setTopbarRoutes = (routes: RouteOption[]): void => {
    topbarRouters.value = routes;
  };
  const setSidebarRouters = (routes: RouteOption[]): void => {
    sidebarRouters.value = routes;
  };
  const generateRoutes = async (): Promise<RouteOption[]> => {
    const res = await getRouters();
    const { data } = res;

    // 如果后台返回数据为空，使用空数组避免错误
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️  后台路由数据为空，将只使用静态路由');
      setRoutes([]);
      setSidebarRouters(constantRoutes);
      setDefaultRoutes([]);
      setTopbarRoutes([]);
      return new Promise<RouteOption[]>((resolve) => resolve([]));
    }

    const sdata = JSON.parse(JSON.stringify(data));
    const rdata = JSON.parse(JSON.stringify(data));
    const defaultData = JSON.parse(JSON.stringify(data));

    // filterAsyncRouter 中会自动从静态路由获取 component
    const sidebarRoutes = filterAsyncRouter(sdata);
    const rewriteRoutes = filterAsyncRouter(rdata, undefined, true);
    const defaultRoutes = filterAsyncRouter(defaultData);

    // 处理前端动态路由（包括化盐记录等固定展示的路由）
    const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
    asyncRoutes.forEach((route) => {
      router.addRoute(route);
    });

    setRoutes(rewriteRoutes);
    setSidebarRouters(constantRoutes.concat(sidebarRoutes));
    setDefaultRoutes(sidebarRoutes);
    setTopbarRoutes(defaultRoutes);
    return new Promise<RouteOption[]>((resolve) => resolve(rewriteRoutes));
  };

  /**
   * 遍历后台传来的路由字符串，转换为组件对象
   * @param asyncRouterMap 后台传来的路由字符串
   * @param lastRouter 上一级路由
   * @param type 是否是重写路由
   */
  const filterAsyncRouter = (asyncRouterMap: RouteOption[], lastRouter?: RouteOption, type = false): RouteOption[] => {
    return asyncRouterMap.filter((route) => {
      // 清理路由数据中的空格(防止后台配置错误导致URL中出现%20)
      if (route.path) {
        route.path = route.path.trim();
      }
      if (route.name && typeof route.name === 'string') {
        route.name = route.name.trim();
      }
      if (route.component && typeof route.component === 'string') {
        route.component = route.component.trim();
      }
      if (route.meta) {
        if (route.meta.title) {
          route.meta.title = route.meta.title.trim();
        }
      }

      // 过滤租户管理相关路由 - 如需重新启用请注释掉下面的过滤逻辑
      if (route.path === '/system/tenant' ||
          route.path === '/system/tenantPackage' ||
          route.path === 'tenant' ||
          route.path === 'tenantPackage' ||
          (route.meta && (route.meta.title === '租户管理' || route.meta.title === '租户套餐管理'))) {
        return false;
      }

      if (type && route.children) {
        route.children = filterChildren(route.children, undefined);
      }
      if (route.component) {
        // Layout ParentView 组件特殊处理
        if (route.component === 'Layout') {
          route.component = Layout;
        } else if (route.component === 'ParentView') {
          route.component = ParentView;
        } else if (route.component === 'InnerLink') {
          route.component = InnerLink;
        } else {
          route.component = loadView(route.component);
        }
      }

      // 如果没有component，尝试从静态路由中获取
      if (!route.component && route.path) {
        const findComponentFromStatic = (targetPath: string, routes: RouteOption[], parentPath = ''): any => {
          for (const r of routes) {
            // 构建当前路由的完整路径
            let currentPath = r.path;
            if (parentPath && !r.path.startsWith('/')) {
              currentPath = `${parentPath}/${r.path}`;
            }
            const normalized = currentPath.replace(/\/+/g, '/');
            const targetNormalized = targetPath.replace(/\/+/g, '/');

            // 匹配路径
            if (normalized === targetNormalized || r.path === targetPath) {
              return r.component;
            }

            // 递归查找子路由
            if (r.children && r.children.length > 0) {
              const found = findComponentFromStatic(targetPath, r.children, normalized);
              if (found) return found;
            }
          }
          return null;
        };

        // 构建完整路径 - 需要考虑父路由的完整路径
        let fullPath = route.path;
        if (lastRouter) {
          // 如果父路由路径不是以/开头，说明它也是相对路径
          if (lastRouter.path && lastRouter.path.startsWith('/')) {
            fullPath = `${lastRouter.path}/${route.path}`;
          } else if (lastRouter.path) {
            // 父路由是相对路径，需要找到完整的基础路径
            fullPath = `/${lastRouter.path}/${route.path}`;
          }
        } else if (!route.path.startsWith('/')) {
          fullPath = `/${route.path}`;
        }

        const normalizedPath = fullPath.replace(/\/+/g, '/');

        // 尝试多种匹配方式
        let component = findComponentFromStatic(normalizedPath, constantRoutes);
        if (!component) {
          component = findComponentFromStatic(route.path, constantRoutes);
        }
        if (!component && lastRouter?.path) {
          component = findComponentFromStatic(`${lastRouter.path}/${route.path}`.replace(/\/+/g, '/'), constantRoutes);
        }

        if (component) {
          route.component = component;
          console.log(`✅ 从静态路由获取 component: ${route.path} (完整路径: ${normalizedPath})`);
        } else {
          // 尝试从映射表中获取
          const mappedComponent = componentPathMap[normalizedPath] || componentPathMap[route.path];
          if (mappedComponent) {
            route.component = mappedComponent;
            console.log(`✅ 从映射表获取 component: ${route.path} (完整路径: ${normalizedPath})`);
          } else {
            console.warn(`⚠️  无法为路由 ${route.path} 找到 component (完整路径: ${normalizedPath})`);
          }
        }
      }

      if (route.children != null && route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, route, type);
        // 如果所有子路由都被过滤掉了，也过滤掉父路由
        if (route.children.length === 0) {
          return false;
        }
      } else {
        delete route.children;
        delete route.redirect;
      }

      // 只在特定情况下过滤路由：
      // 1. 不是目录类型（有children的通常是目录，需要保留）
      // 2. 不是外链
      // 3. 确实缺少component
      // 注意：很多父路由只有children没有component，这是正常的，不应该过滤
      return true;
    });
  };
  const filterChildren = (childrenMap: RouteOption[], lastRouter?: RouteOption): RouteOption[] => {
    let children: RouteOption[] = [];
    childrenMap.forEach((el) => {
      // 过滤租户管理相关路由 - 如需重新启用请注释掉下面的过滤逻辑
      if (el.path === '/system/tenant' ||
          el.path === '/system/tenantPackage' ||
          el.path === 'tenant' ||
          el.path === 'tenantPackage' ||
          (el.meta && (el.meta.title === '租户管理' || el.meta.title === '租户套餐管理'))) {
        return; // 跳过租户相关路由
      }

      if (el.children && el.children.length) {
        if (el.component === 'ParentView' && !lastRouter) {
          el.children.forEach((c) => {
            // 过滤租户管理相关路由
            if (c.path === 'tenant' ||
                c.path === 'tenantPackage' ||
                (c.meta && (c.meta.title === '租户管理' || c.meta.title === '租户套餐管理'))) {
              return; // 跳过租户相关路由
            }

            c.path = el.path + '/' + c.path;
            if (c.children && c.children.length) {
              children = children.concat(filterChildren(c.children, c));
              return;
            }
            children.push(c);
          });
          return;
        }
      }
      if (lastRouter) {
        el.path = lastRouter.path + '/' + el.path;
        if (el.children && el.children.length) {
          children = children.concat(filterChildren(el.children, el))
          return
        }
      }
      children = children.concat(el);
    });
    return children;
  };


  return { routes, setRoutes, generateRoutes, setSidebarRouters, topbarRouters, sidebarRouters, defaultRoutes };
});

// 动态路由遍历，验证是否具备权限
export const filterDynamicRoutes = (routes: RouteOption[]) => {
  const res: RouteOption[] = [];
  routes.forEach((route) => {
    // 化盐记录相关路由无需权限验证，直接添加
    const isSaltRecordRoute = route.name && (
      route.name.includes('SaltDataRecords') ||
      route.name.includes('PreheatingRecords') ||
      route.name.includes('BinaryRecords') ||
      route.name.includes('TernaryRecords') ||
      route.path?.includes('saltprocess')
    );

    if (isSaltRecordRoute) {
      res.push(route);
    } else if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route);
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route);
      }
    } else {
      // 没有权限要求的路由直接添加
      res.push(route);
    }
  });
  return res;
};

export const loadView = (view: any) => {
  let res;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]();
    }
  }
  return res;
};

// 非setup
export const usePermissionStoreHook = () => {
  return usePermissionStore(store);
};

export default usePermissionStore;
