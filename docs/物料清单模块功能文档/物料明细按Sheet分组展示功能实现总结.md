# 物料明细按 Sheet 分组展示功能实现总结

## 功能概述

对物料明细标签页进行了优化，现在可以根据 Excel 文件中的 Sheet 标签自动分组展示物料信息，提供更清晰、有组织的数据呈现方式。

## 功能特点

### 1. 数据预览区按 Sheet 分组

#### 1.1 自动分组

- 解析 Excel 文件后，自动按 Sheet 名称对物料数据进行分组
- 每个 Sheet 作为一个独立的标签页展示
- 标签页名称显示：`Sheet名称 (数据条数)`

#### 1.2 独立分页

- 每个 Sheet 标签页拥有独立的分页控制
- 默认每页显示 50 条记录
- 支持自定义分页大小

#### 1.3 数据编辑

- 每个 Sheet 标签页内的数据可独立编辑
- 支持物料名称、规格型号、数量、单位等字段的实时编辑
- 编辑后自动触发数据验证

### 2. 已导入数据按 Sheet 分组

#### 2.1 自动分组展示

- 已导入的物料数据按原 Sheet 名称分组展示
- 使用边框卡片样式的标签页，视觉效果更佳
- 未设置 Sheet 名称的数据归入"未分组"标签

#### 2.2 数据管理

- 支持查看每个 Sheet 的物料列表
- 支持删除操作
- 显示创建时间等详细信息

## 技术实现

### 1. 数据结构

```typescript
interface SheetGroup {
  sheetName: string;   // Sheet名称
  materials: any[];    // 该Sheet下的物料数据
}
```

### 2. 核心功能

#### 2.1 数据分组逻辑

```typescript
// 按Sheet分组的数据
const sheetGroups = computed<SheetGroup[]>(() => {
  if (materialData.value.length === 0) return [];

  const groups = new Map<string, any[]>();

  materialData.value.forEach(material => {
    const sheetName = material.sheetName || '未命名';
    if (!groups.has(sheetName)) {
      groups.set(sheetName, []);
    }
    const materials = groups.get(sheetName);
    if (materials) {
      materials.push(material);
    }
  });

  return Array.from(groups.entries()).map(([sheetName, materials]) => ({
    sheetName,
    materials
  }));
});
```

#### 2.2 分页处理

```typescript
// 获取指定Sheet的分页数据
const getSheetPaginatedData = (sheetName: string) => {
  const group = sheetGroups.value.find(g => g.sheetName === sheetName);
  if (!group) return [];

  const page = sheetPageMap.value[sheetName] || 1;
  const start = (page - 1) * sheetPageSize.value;
  const end = start + sheetPageSize.value;
  return group.materials.slice(start, end);
};
```

#### 2.3 初始化逻辑

使用 `watch` 监听数据变化，自动初始化标签页：

```typescript
// 监听sheetGroups变化，初始化tab和分页
watch(
  sheetGroups,
  (newGroups) => {
    if (newGroups.length > 0 && !activeSheetTab.value) {
      activeSheetTab.value = newGroups[0].sheetName;
      // 初始化分页
      newGroups.forEach(group => {
        if (!sheetPageMap.value[group.sheetName]) {
          sheetPageMap.value[group.sheetName] = 1;
        }
      });
    }
  },
  { immediate: true }
);
```

### 3. UI 组件

#### 3.1 数据预览区

```vue
<!-- 按Sheet分组的数据展示 -->
<el-tabs v-model="activeSheetTab" type="card" class="sheet-tabs">
  <el-tab-pane
    v-for="sheetGroup in sheetGroups"
    :key="sheetGroup.sheetName"
    :label="`${sheetGroup.sheetName} (${sheetGroup.materials.length})`"
    :name="sheetGroup.sheetName"
  >
    <!-- 数据表格 -->
    <el-table :data="getSheetPaginatedData(sheetGroup.sheetName)" ...>
      <!-- 表格列定义 -->
    </el-table>

    <!-- 分页 -->
    <pagination
      v-if="sheetGroup.materials.length > sheetPageSize"
      v-model:page="sheetPageMap[sheetGroup.sheetName]"
      v-model:limit="sheetPageSize"
      :total="sheetGroup.materials.length"
      @pagination="handleSheetPagination"
    />
  </el-tab-pane>
</el-tabs>
```

#### 3.2 已导入数据区

```vue
<!-- 按Sheet分组展示已导入的物料 -->
<el-tabs v-model="activeImportedSheetTab" type="border-card" class="imported-sheet-tabs">
  <el-tab-pane
    v-for="group in importedSheetGroups"
    :key="group.sheetName"
    :label="`${group.sheetName || '未分组'} (${group.materials.length})`"
    :name="group.sheetName || '未分组'"
  >
    <el-table :data="group.materials" ...>
      <!-- 表格列定义 -->
    </el-table>
  </el-tab-pane>
</el-tabs>

<!-- 无数据时显示 -->
<el-empty v-else description="暂无物料数据" />
```

### 4. 样式设计

#### 4.1 数据预览区标签页样式

```scss
.sheet-tabs {
  margin-top: 15px;

  :deep(.el-tabs__header) {
    margin-bottom: 15px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.el-tabs__content) {
    overflow: visible;
  }
}
```

#### 4.2 已导入数据标签页样式

```scss
.imported-sheet-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 15px;
    background-color: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 8px 20px;

    &.is-active {
      background-color: #fff;
    }
  }
}
```

## 使用场景

### 1. 多 Sheet Excel 文件导入

当用户上传包含多个 Sheet 的 Excel 文件时：

- 每个 Sheet 自动解析并分组
- 用户可以分别查看和编辑每个 Sheet 的数据
- 验证和导入时保持 Sheet 的独立性

### 2. 分类管理物料数据

用户可以在 Excel 中按类别创建不同的 Sheet：

- **电控设备汇总** - 所有电控相关物料
- **机械设备汇总** - 所有机械相关物料
- **通用物料汇总** - 通用耗材和配件
- **发货清单** - 实际发货信息

### 3. 项目阶段管理

用户可以按项目阶段创建 Sheet：

- **采购清单** - 需要采购的物料
- **库存清单** - 现有库存物料
- **发货清单** - 已发货物料
- **待补货清单** - 需要补充的物料

## 优势总结

### 1. 数据组织清晰

- ✅ 按 Sheet 自动分组，结构清晰
- ✅ 标签页显示数据条数，一目了然
- ✅ 避免数据混乱，便于管理

### 2. 操作便捷

- ✅ 快速切换不同 Sheet 的数据
- ✅ 独立编辑和验证每个 Sheet
- ✅ 支持大量数据的分页浏览

### 3. 用户体验优化

- ✅ 保留原 Excel 文件的 Sheet 结构
- ✅ 符合用户原有的数据组织习惯
- ✅ 视觉效果更加美观和专业

### 4. 数据追溯性

- ✅ 保留 Sheet 来源信息
- ✅ 便于追溯数据来源
- ✅ 支持按 Sheet 进行数据筛选和查询

## 兼容性说明

### 1. 单 Sheet 文件

- 如果 Excel 文件只有一个 Sheet，也会正常展示
- 标签页显示该 Sheet 的名称和数据条数
- 功能与多 Sheet 文件完全一致

### 2. 无 Sheet 名称

- 如果无法获取 Sheet 名称，自动命名为"未命名"
- 已导入数据中无 Sheet 名称的归入"未分组"
- 不影响正常的数据展示和操作

### 3. Sheet 名称重复

- 系统会保留所有同名 Sheet 的数据
- 在同一个标签页中展示所有数据
- 用户可以通过其他字段区分不同来源

## 后续优化建议

### 1. Sheet 管理增强

- 支持重命名 Sheet
- 支持合并多个 Sheet
- 支持删除指定 Sheet 的数据

### 2. 数据筛选

- 支持跨 Sheet 的数据搜索
- 支持按 Sheet 筛选已导入数据
- 支持多 Sheet 数据对比

### 3. 批量操作

- 支持批量选择多个 Sheet
- 支持批量导入多个 Sheet
- 支持批量验证和导出

### 4. 可视化展示

- 添加 Sheet 数据统计图表
- 显示各 Sheet 的物料类型分布
- 展示 Sheet 之间的关联关系

## 测试建议

### 1. 功能测试

- [ ] 上传单 Sheet Excel 文件
- [ ] 上传多 Sheet Excel 文件
- [ ] 上传无 Sheet 名称的文件
- [ ] 测试 Sheet 切换功能
- [ ] 测试每个 Sheet 的分页功能
- [ ] 测试数据编辑和验证

### 2. 边界测试

- [ ] 测试大量 Sheet (>10 个)
- [ ] 测试单 Sheet 大量数据 (>1000 条)
- [ ] 测试空 Sheet
- [ ] 测试特殊字符 Sheet 名称

### 3. 性能测试

- [ ] 大文件解析性能
- [ ] 多 Sheet 切换响应速度
- [ ] 数据编辑响应速度
- [ ] 内存占用情况

## 总结

本次优化成功实现了物料明细数据按 Excel Sheet 标签分组展示的功能，大大提升了数据的组织性和可读性。用户现在可以：

1. **清晰地查看**不同 Sheet 的物料数据
2. **独立地编辑**每个 Sheet 的内容
3. **快速地切换**不同 Sheet 进行查看
4. **方便地管理**大量分类物料数据

这个功能特别适合处理复杂的、多分类的物料清单，符合实际业务场景的需求，为用户提供了更好的数据管理体验。🎉
