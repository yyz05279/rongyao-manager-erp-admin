---
type: "always_apply"
---

# 海棠企业管理系统 - 项目开发编码规范

## 目录
- [项目概述](#项目概述)
- [技术栈规范](#技术栈规范)
- [代码规范](#代码规范)
- [文件命名规范](#文件命名规范)
- [组件开发规范](#组件开发规范)
- [API接口规范](#api接口规范)
- [样式规范](#样式规范)
- [Git提交规范](#git提交规范)
- [功能开发流程](#功能开发流程)
- [首页更新规范](#首页更新规范)

## 项目概述

海棠企业管理系统是一个基于Vue3 + TypeScript + Element Plus的现代化企业级管理平台，专注于提供高效、安全、易用的业务管理解决方案。

### 核心技术栈
- **前端框架**: Vue 3.4.20
- **开发语言**: TypeScript 4.9.5
- **UI组件库**: Element Plus 2.2.27
- **构建工具**: Vite 4.3.1
- **状态管理**: Pinia 2.0.22
- **路由管理**: Vue Router 4.1.4
- **HTTP客户端**: Axios 1.3.4

## 技术栈规范

### 1. Vue 3 开发规范
- 统一使用 Composition API
- 使用 `<script setup>` 语法糖
- 组件必须使用 TypeScript
- 使用 `defineProps` 和 `defineEmits` 定义组件接口

```vue
<script setup name="ComponentName" lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props 定义
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

// Emits 定义
interface Emits {
  update: [value: string];
  change: [id: number];
}

const emit = defineEmits<Emits>();
</script>
```

### 2. TypeScript 规范
- 所有文件必须使用 TypeScript
- 严格类型检查，避免使用 `any`
- 定义清晰的接口和类型
- 使用泛型提高代码复用性

```typescript
// 接口定义
interface UserVO {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'inactive';
  createTime: string;
}

// API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

## 代码规范

### 1. 命名规范
- **变量名**: 使用 camelCase
- **常量名**: 使用 UPPER_SNAKE_CASE
- **函数名**: 使用 camelCase，动词开头
- **类名**: 使用 PascalCase
- **文件名**: 使用 kebab-case

```typescript
// 变量命名
const userName = 'admin';
const userList = ref<UserVO[]>([]);

// 常量命名
const API_BASE_URL = '/api/v1';
const MAX_RETRY_COUNT = 3;

// 函数命名
const getUserList = async () => {};
const handleSubmit = () => {};
const validateForm = () => {};

// 类命名
class UserService {}
class ApiClient {}
```

### 2. 函数规范
- 函数应该单一职责
- 函数名应该清晰表达功能
- 避免函数过长（建议不超过50行）
- 复杂逻辑应该拆分为多个小函数

```typescript
// 好的示例
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleUserSubmit = async (userData: UserForm) => {
  if (!validateEmail(userData.email)) {
    throw new Error('邮箱格式不正确');
  }
  
  await saveUser(userData);
  await refreshUserList();
};
```

### 3. 注释规范
- 复杂逻辑必须添加注释
- 公共函数必须添加 JSDoc 注释
- 组件必须添加功能说明注释

```typescript
/**
 * 获取用户列表
 * @param query 查询参数
 * @returns 用户列表数据
 */
const getUserList = async (query: UserQuery): Promise<UserVO[]> => {
  // 构建查询参数
  const params = buildQueryParams(query);
  
  // 发送请求
  const response = await request.get('/users', { params });
  
  return response.data;
};
```

## 文件命名规范

### 1. 目录结构
```
src/
├── api/                    # API接口
│   ├── system/            # 系统管理相关API
│   ├── erp/               # ERP业务相关API
│   └── monitor/           # 监控相关API
├── components/            # 公共组件
├── views/                 # 页面组件
│   ├── system/           # 系统管理页面
│   ├── erp/              # ERP业务页面
│   └── monitor/          # 监控页面
├── utils/                # 工具函数
├── types/                # 类型定义
└── assets/               # 静态资源
```

### 2. 文件命名
- **页面文件**: `kebab-case.vue`
- **组件文件**: `PascalCase.vue`
- **工具文件**: `kebab-case.ts`
- **类型文件**: `types.ts`

```
views/
├── user-management.vue
├── role-management.vue
└── system-config.vue

components/
├── UserForm.vue
├── DataTable.vue
└── SearchFilter.vue
```

## 组件开发规范

### 1. 组件结构
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup name="ComponentName" lang="ts">
// 导入
import { ref, computed, onMounted } from 'vue';

// 类型定义
interface Props {
  // props 定义
}

// Props 和 Emits
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const formData = ref<FormData>({});

// 计算属性
const isValid = computed(() => {
  // 计算逻辑
});

// 方法
const handleSubmit = () => {
  // 处理逻辑
};

// 生命周期
onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped lang="scss">
// 样式定义
</style>
```

### 2. 组件通信
- 父子组件通信使用 props 和 emits
- 跨组件通信使用 Pinia
- 避免使用 provide/inject（除非必要）

```vue
<!-- 父组件 -->
<template>
  <UserForm 
    :user-data="userData" 
    @submit="handleUserSubmit"
    @cancel="handleCancel"
  />
</template>

<!-- 子组件 -->
<script setup lang="ts">
interface Props {
  userData: UserForm;
}

interface Emits {
  submit: [data: UserForm];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>
```

## API接口规范

### 1. 接口文件结构
```typescript
// src/api/system/user/index.ts
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserVO, UserForm, UserQuery } from './types';

/**
 * 查询用户列表
 */
export const listUser = (query?: UserQuery): AxiosPromise<UserVO[]> => {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取用户详情
 */
export const getUser = (userId: string | number): AxiosPromise<UserVO> => {
  return request({
    url: '/system/user/' + userId,
    method: 'get'
  });
};
```

### 2. 类型定义
```typescript
// src/api/system/user/types.ts
export interface UserQuery {
  pageNum?: number;
  pageSize?: number;
  username?: string;
  status?: string;
}

export interface UserVO {
  userId: number;
  username: string;
  nickName: string;
  email: string;
  status: string;
  createTime: string;
}

export interface UserForm {
  userId?: number;
  username: string;
  nickName: string;
  email: string;
  password?: string;
}
```

## 样式规范

### 1. SCSS 规范
- 使用 SCSS 预处理器
- 采用 BEM 命名规范
- 使用 scoped 样式避免污染

```scss
<style scoped lang="scss">
.user-management {
  padding: 20px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    &-title {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  &__content {
    background: white;
    border-radius: 8px;
    padding: 24px;
  }
}
</style>
```

### 2. 响应式设计
- 使用 Element Plus 的栅格系统
- 关键断点：768px（平板）、1200px（桌面）

```vue
<template>
  <el-row :gutter="20">
    <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
      <!-- 内容 -->
    </el-col>
  </el-row>
</template>
```

## Git提交规范

### 1. 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. Type 类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 3. 示例
```
feat(user): 添加用户管理功能

- 实现用户列表查询
- 添加用户新增/编辑功能
- 完成用户状态管理

Closes #123
```

## 功能开发流程

### 1. 开发前准备
1. 创建功能分支：`git checkout -b feature/user-management`
2. 分析需求，设计接口和数据结构
3. 创建相关的类型定义文件

### 2. 开发步骤
1. **API接口开发**：先定义接口和类型
2. **页面组件开发**：实现页面逻辑和UI
3. **样式调整**：完善界面样式
4. **功能测试**：确保功能正常运行
5. **代码审查**：自查代码质量

### 3. 提交流程
1. 代码提交：`git commit -m "feat(user): 完成用户管理功能"`
2. 推送分支：`git push origin feature/user-management`
3. 创建合并请求
4. 代码审查通过后合并到主分支

## 首页更新规范

当有新功能开发完成时，需要更新首页的功能展示状态：

### 1. 更新概览数据
在 `src/views/index.vue` 中更新 `overviewData`：
```typescript
const overviewData = ref({
  completedFeatures: 26, // 增加已完成功能数量
  developingFeatures: 7,  // 调整开发中功能数量
  plannedFeatures: 12,
  totalModules: 3
});
```

### 2. 更新模块状态
更新对应模块的完成度和功能列表：
```typescript
{
  id: 'system',
  title: '系统管理',
  progress: 100, // 更新完成度
  completedFunctions: [
    // 添加新完成的功能
    { name: '新功能名称', version: 'v1.1.0' }
  ],
  plannedFunctions: [
    // 移除已完成的功能，添加新计划功能
  ]
}
```

### 3. 更新版本记录
当发布新版本时，更新 `versionHistory`：
```typescript
const versionHistory = ref([
  {
    version: 'v1.1.0',
    date: '2024-03-01',
    status: '已发布', // 更新状态
    tagType: 'success', // 更新标签类型
    type: 'released', // 更新类型
    // ... 其他信息
  }
]);
```

### 4. 更新检查清单
- [ ] 更新概览统计数据
- [ ] 更新模块完成度
- [ ] 移动功能从计划到已完成
- [ ] 更新版本发布状态
- [ ] 检查页面显示效果
- [ ] 提交代码并注明首页更新

---

## 总结

遵循以上规范可以确保：
1. 代码质量和可维护性
2. 团队协作效率
3. 项目的长期稳定发展
4. 功能状态的及时更新

所有开发人员都应该严格遵循这些规范，确保项目的高质量交付。
