# 子系统管理模块

## 模块概述

子系统管理模块是一个三级嵌套结构的管理系统，用于管理项目中的子系统、子项和物料信息。

**三级结构：**

```
子系统（Subsystem）
  └── 子项（SubItem）
        └── 物料（Material）
```

## 文档索引

1. [子系统管理模块使用指南](./子系统管理模块使用指南.md)

   - 功能概述
   - 完整的 API 接口说明
   - 数据模型定义
   - 使用操作说明

2. [菜单权限配置图解](./菜单权限配置图解.md)
   - 菜单配置步骤
   - 权限分配说明
   - 配置清单和常见问题

## 功能特性

### ✅ 已实现功能

#### 子系统管理

- ✅ 子系统列表查询（分页、搜索、筛选）
- ✅ 子系统新增
- ✅ 子系统编辑
- ✅ 子系统删除（级联删除子项和物料）
- ✅ 子系统详情查看
- ✅ 子系统数据导出
- ✅ 关联项目信息

#### 子项管理

- ✅ 子项列表展示（折叠面板形式）
- ✅ 子项新增
- ✅ 子项编辑
- ✅ 子项删除（级联删除物料）
- ✅ 子项统计信息（物料数量、重量、体积）

#### 物料管理

- ✅ 物料列表展示（表格形式）
- ✅ 物料新增
- ✅ 物料编辑
- ✅ 物料删除
- ✅ 物料详细信息管理
- ✅ 自动计算总重量和总体积
- ✅ 易碎品/危险品标识
- ✅ 物料数据导出

#### 权限控制

- ✅ 菜单显示权限
- ✅ 按钮操作权限
- ✅ 多级权限控制（子系统、子项、物料）

#### UI/UX 特性

- ✅ 响应式布局
- ✅ 搜索和筛选功能
- ✅ 批量操作支持
- ✅ 数据统计展示
- ✅ 友好的交互提示
- ✅ 表单验证

## 技术实现

### 前端技术栈

- Vue 3.4.20 (Composition API)
- TypeScript 4.9.5
- Element Plus 2.2.27
- Vite 4.3.1

### 目录结构

```
src/
├── api/erp/subsystem/          # API接口层
│   ├── index.ts               # API方法定义
│   └── types.ts               # TypeScript类型定义
│
├── views/erp/subsystem/        # 页面组件层
│   ├── index.vue              # 主列表页面
│   └── components/            # 子组件
│       ├── SubsystemForm.vue      # 子系统表单
│       ├── SubsystemDetail.vue    # 子系统详情（含子项和物料）
│       ├── SubItemForm.vue        # 子项表单
│       └── MaterialForm.vue       # 物料表单
│
└── router/modules/             # 路由配置
    └── subsystem.ts           # 子系统管理独立路由模块
```

### 代码规范

遵循项目编码规范：

- ✅ 使用 Composition API
- ✅ 使用 `<script setup>` 语法糖
- ✅ 完整的 TypeScript 类型定义
- ✅ Props 和 Emits 明确定义
- ✅ 响应式数据合理使用
- ✅ 生命周期钩子规范使用
- ✅ 样式使用 SCSS 和 scoped

**重要说明**：子系统管理作为独立的一级菜单模块，不属于化盐工艺流程，拥有独立的路由配置文件 `/src/router/modules/subsystem.ts`。

## API 接口设计

### 基础 URL

```
/erp/subsystem
```

### 接口列表

#### 子系统接口（8 个）

- `GET /list` - 查询列表
- `GET /{id}` - 获取详情
- `GET /{id}/detail` - 获取完整详情
- `POST /` - 新增
- `PUT /` - 修改
- `DELETE /{ids}` - 删除
- `GET /export` - 导出
- `GET /statistics` - 统计信息

#### 子项接口（5 个）

- `GET /subitem/list` - 查询列表
- `GET /subitem/{id}` - 获取详情
- `POST /subitem` - 新增
- `PUT /subitem` - 修改
- `DELETE /subitem/{ids}` - 删除

#### 物料接口（6 个）

- `GET /material/list` - 查询列表
- `GET /material/{id}` - 获取详情
- `POST /material` - 新增
- `PUT /material` - 修改
- `DELETE /material/{ids}` - 删除
- `GET /material/export` - 导出

## 权限体系

### 权限标识规范

```
erp:subsystem:list          # 子系统列表
erp:subsystem:query         # 子系统查询
erp:subsystem:add           # 子系统新增
erp:subsystem:edit          # 子系统编辑
erp:subsystem:remove        # 子系统删除
erp:subsystem:export        # 子系统导出

erp:subsystem:subitem:list    # 子项列表
erp:subsystem:subitem:query   # 子项查询
erp:subsystem:subitem:add     # 子项新增
erp:subsystem:subitem:edit    # 子项编辑
erp:subsystem:subitem:remove  # 子项删除

erp:subsystem:material:list    # 物料列表
erp:subsystem:material:query   # 物料查询
erp:subsystem:material:add     # 物料新增
erp:subsystem:material:edit    # 物料编辑
erp:subsystem:material:remove  # 物料删除
erp:subsystem:material:export  # 物料导出
```

## 数据库设计建议

### 表结构建议

#### 1. 子系统表 (subsystem)

```sql
CREATE TABLE `subsystem` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `subsystem_code` varchar(50) NOT NULL COMMENT '子系统编码',
  `subsystem_name` varchar(100) NOT NULL COMMENT '子系统名称',
  `project_id` bigint(20) DEFAULT NULL COMMENT '项目ID',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态（0-禁用，1-启用）',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subsystem_code` (`subsystem_code`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='子系统表';
```

#### 2. 子项表 (subsystem_subitem)

```sql
CREATE TABLE `subsystem_subitem` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `subsystem_id` bigint(20) NOT NULL COMMENT '子系统ID',
  `subitem_code` varchar(50) NOT NULL COMMENT '子项编码',
  `subitem_name` varchar(100) NOT NULL COMMENT '子项名称',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_subsystem_id` (`subsystem_id`),
  KEY `idx_subitem_code` (`subitem_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='子项表';
```

#### 3. 物料表 (subsystem_material)

```sql
CREATE TABLE `subsystem_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `subitem_id` bigint(20) NOT NULL COMMENT '子项ID',
  `material_code` varchar(50) NOT NULL COMMENT '物料编码',
  `material_name` varchar(100) NOT NULL COMMENT '物料名称',
  `specification` varchar(100) DEFAULT NULL COMMENT '规格型号',
  `quantity` int(11) DEFAULT NULL COMMENT '数量',
  `unit` varchar(20) DEFAULT NULL COMMENT '单位',
  `unit_weight` decimal(10,2) DEFAULT NULL COMMENT '单重(kg)',
  `total_weight` decimal(10,2) DEFAULT NULL COMMENT '总重(kg)',
  `unit_volume` decimal(10,2) DEFAULT NULL COMMENT '单体积(m³)',
  `total_volume` decimal(10,2) DEFAULT NULL COMMENT '总体积(m³)',
  `manufacturer` varchar(100) DEFAULT NULL COMMENT '制造商',
  `model` varchar(50) DEFAULT NULL COMMENT '型号',
  `serial_number` varchar(50) DEFAULT NULL COMMENT '序列号',
  `production_date` date DEFAULT NULL COMMENT '生产日期',
  `is_fragile` tinyint(1) DEFAULT 0 COMMENT '是否易碎品（0-否，1-是）',
  `is_hazardous` tinyint(1) DEFAULT 0 COMMENT '是否危险品（0-否，1-是）',
  `packaging_method` varchar(100) DEFAULT NULL COMMENT '包装方式',
  `remarks` varchar(500) DEFAULT NULL COMMENT '备注',
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_subitem_id` (`subitem_id`),
  KEY `idx_material_code` (`material_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='子系统物料表';
```

## 使用示例

### 典型使用场景

1. **新建项目的子系统管理**

   - 创建项目后，为项目创建多个子系统
   - 每个子系统下创建若干子项
   - 为每个子项添加详细的物料清单

2. **物料清单管理**

   - 按子系统、子项分类管理物料
   - 统计每个子系统/子项的物料数量、重量、体积
   - 导出物料清单用于采购或发货

3. **项目进度跟踪**
   - 通过子系统完成情况跟踪项目进度
   - 查看每个子系统的物料到货情况
   - 统计整体项目物料信息

## 后续优化建议

### 功能增强

- [ ] 物料批量导入（Excel）
- [ ] 子系统模板管理
- [ ] 物料图片上传
- [ ] 物料条码生成
- [ ] 子系统复制功能
- [ ] 物料库存管理对接
- [ ] 物料成本核算
- [ ] 报表统计功能

### 性能优化

- [ ] 大数据量分页优化
- [ ] 列表虚拟滚动
- [ ] 数据缓存策略
- [ ] 图片懒加载

### 用户体验

- [ ] 拖拽排序
- [ ] 批量编辑
- [ ] 快捷键支持
- [ ] 自定义列显示
- [ ] 数据筛选器保存

## 联系方式

如有问题或建议，请联系开发团队。

## 更新日志

### v1.0.0 (2025-01-04)

- ✅ 初始版本发布
- ✅ 完成基础 CRUD 功能
- ✅ 实现三级嵌套结构管理
- ✅ 完成权限体系配置
- ✅ 编写完整文档
