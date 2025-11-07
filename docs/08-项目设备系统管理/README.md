# 项目设备系统管理模块 - 总览

## 模块简介

项目设备系统管理模块是海棠企业管理系统中化盐工艺流程管理的核心功能模块之一，用于管理化盐处理厂的设备系统配置和项目设备系统实例。

## 模块功能

本模块包含两个主要子模块：

1. **设备系统模板管理**: 创建和管理可复用的设备系统模板
2. **项目设备系统管理**: 基于模板或自定义创建项目设备系统实例

## 系统类型

支持四种设备系统类型：

- **固态 (SOLID)**: 固态处理厂设备系统
- **液态 (LIQUID)**: 液态处理厂设备系统
- **粉盐 (POWDER)**: 粉盐处理设备系统
- **燃烧器 (BURNER)**: 燃烧器设备系统

## 文档列表

### 1. API 接口文档

- [化盐项目设备系统管理 API 文档](./化盐项目设备系统管理API文档.md)
  - 完整的 API 接口说明
  - 请求参数和响应格式
  - 数据模型定义
  - 错误码说明

### 2. 使用指南

- [设备系统管理使用指南](./设备系统管理使用指南.md)
  - 模块功能介绍
  - 详细操作步骤
  - 最佳实践
  - 常见问题解答

### 3. 菜单权限配置

- [设备系统管理菜单权限配置](./设备系统管理菜单权限配置.md)
  - 菜单结构说明
  - 权限标识配置
  - 配置步骤详解
  - SQL 脚本参考

## 技术架构

### 前端技术栈

- **框架**: Vue 3 + TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios

### 前端文件结构

```
src/
├── api/erp/saltprocess/equipment-system/
│   ├── types.ts                    # 类型定义
│   ├── template.ts                 # 模板管理API
│   └── index.ts                    # 项目设备系统API
└── views/erp/saltprocess/equipment-system/
    ├── template/
    │   ├── index.vue               # 模板管理列表页
    │   └── components/
    │       ├── EquipmentSystemTemplateForm.vue    # 模板表单
    │       └── EquipmentSystemTemplateDetail.vue  # 模板详情
    ├── index.vue                   # 项目设备系统列表页
    └── components/
        ├── ProjectEquipmentSystemForm.vue         # 设备系统表单
        └── ProjectEquipmentSystemDetail.vue       # 设备系统详情
```

### 后端接口规范

- **接口基础路径**: `/erp/saltprocess`
- **认证方式**: Sa-Token
- **数据格式**: JSON
- **响应格式**: 统一响应格式 (code, msg, data)

## 菜单路径

```
化盐工艺流程管理
  └─ 设备系统管理
       ├─ 设备系统模板管理    (/equipment-system/template)
       └─ 项目设备系统管理    (/equipment-system/list)
```

## 权限标识

### 设备系统模板管理

- `erp:saltprocess:equipmentSystemTemplate:list` - 查询模板列表
- `erp:saltprocess:equipmentSystemTemplate:query` - 查询模板详情
- `erp:saltprocess:equipmentSystemTemplate:add` - 新增模板
- `erp:saltprocess:equipmentSystemTemplate:edit` - 修改模板
- `erp:saltprocess:equipmentSystemTemplate:remove` - 删除模板
- `erp:saltprocess:equipmentSystemTemplate:export` - 导出模板

### 项目设备系统管理

- `erp:saltprocess:projectEquipmentSystem:list` - 查询设备系统列表
- `erp:saltprocess:projectEquipmentSystem:query` - 查询设备系统详情
- `erp:saltprocess:projectEquipmentSystem:add` - 新增设备系统
- `erp:saltprocess:projectEquipmentSystem:edit` - 修改设备系统
- `erp:saltprocess:projectEquipmentSystem:remove` - 删除设备系统
- `erp:saltprocess:projectEquipmentSystem:export` - 导出设备系统

## 核心功能特性

### 1. 设备系统模板管理

- 创建可复用的设备系统模板
- 支持标准模板和自定义模板
- 模板版本管理
- 模板状态管理（草稿、启用、归档）
- 模板复制功能
- 模板发布功能

### 2. 项目设备系统管理

- 从模板快速创建设备系统
- 自定义创建设备系统
- 设备系统状态管理（草稿、活跃、已完成、已归档）
- 设备系统复制功能
- 负责人管理
- 优先级管理

### 3. 数据统计

- 子系统数量统计
- 子项数量统计
- 物料数量统计
- 总重量统计

## 业务流程

### 模板管理流程

```
创建模板 → 编辑完善 → 发布启用 → 应用到项目 → 版本迭代 → 归档
```

### 项目设备系统流程

```
创建设备系统 → 配置详细信息 → 激活 → 进行中 → 完成 → 归档
```

## 开发规范

### 命名规范

- **组件命名**: PascalCase (如: `EquipmentSystemTemplateForm`)
- **文件命名**: kebab-case (如: `equipment-system-template.vue`)
- **API 函数命名**: camelCase (如: `listEquipmentSystemTemplate`)
- **类型命名**: PascalCase (如: `EquipmentSystemTemplateVO`)

### 代码规范

- 使用 TypeScript 严格类型检查
- 使用 Composition API
- 使用 `<script setup>` 语法糖
- 遵循 Vue3 最佳实践
- 遵循 Element Plus 组件使用规范

## 部署说明

### 前端部署

1. 确保文件结构正确
2. 配置菜单和权限
3. 构建前端代码：`npm run build:prod`
4. 部署到 Web 服务器

### 后端部署

1. 确保数据库表结构正确
2. 配置接口路由
3. 部署后端服务
4. 测试接口可用性

## 测试建议

### 功能测试

- [ ] 设备系统模板 CRUD 功能
- [ ] 设备系统模板发布功能
- [ ] 设备系统模板复制功能
- [ ] 项目设备系统 CRUD 功能
- [ ] 项目设备系统状态管理
- [ ] 项目设备系统复制功能
- [ ] 权限控制测试
- [ ] 数据导出功能

### 性能测试

- [ ] 列表查询性能
- [ ] 大数据量导出性能
- [ ] 并发操作测试

### 兼容性测试

- [ ] 不同浏览器兼容性
- [ ] 移动端适配

## 常见问题

### Q1: 如何创建设备系统模板？

参见[设备系统管理使用指南](./设备系统管理使用指南.md)第 3.1 节。

### Q2: 如何配置菜单权限？

参见[设备系统管理菜单权限配置](./设备系统管理菜单权限配置.md)第 5 节。

### Q3: API 接口返回格式是什么？

参见[化盐项目设备系统管理 API 文档](./化盐项目设备系统管理API文档.md)第 10 节。

## 版本历史

| 版本 | 日期       | 说明                   | 作者         |
| ---- | ---------- | ---------------------- | ------------ |
| v1.0 | 2025-11-07 | 初始版本，包含核心功能 | 海棠开发团队 |

## 联系方式

- **技术支持**: tech@haitang-erp.com
- **文档维护**: doc@haitang-erp.com
- **GitHub**: https://github.com/haitang-erp/haitang-erp

---

**最后更新**: 2025-11-07  
**维护团队**: 海棠开发团队
