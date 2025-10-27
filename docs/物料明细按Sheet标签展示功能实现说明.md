# 物料明细按 Sheet 标签展示功能实现说明

## 功能概述

根据项目详情接口返回的 `sheetNames` 数组，在物料明细页面展示对应的 Sheet 标签，并实现按 Sheet 名称过滤查询物料数据的功能。

## 需求描述

1. 项目详情接口现在返回 `sheetNames` 数组，包含该项目所有物料清单的工作表名称
2. 在项目详情页面切换到"物料明细"标签时，才调用物料明细列表接口
3. 根据 `sheetNames` 动态展示 Sheet 标签页
4. 默认选中第一个 Sheet，并传入该 sheetName 查询数据
5. 切换 Sheet 标签时，重新调用接口并传入对应的 sheetName

## 实现方案

### 1. 类型定义更新

#### 1.1 更新项目类型 (`src/api/erp/saltprocess/project/types.ts`)

在 `SaltProjectVO` 接口中添加 `sheetNames` 字段：

```typescript
export interface SaltProjectVO {
  // ... 其他字段
  sheetNames?: string[]; // 项目关联的物料清单工作表名称列表
  // ... 其他字段
}
```

#### 1.2 更新物料查询类型 (`src/api/erp/saltprocess/material/types.ts`)

在 `MaterialQuery` 接口中添加 `sheetName` 字段：

```typescript
export interface MaterialQuery {
  pageNum?: number;
  pageSize?: number;
  projectId?: string;
  materialName?: string;
  materialType?: string;
  batchNumber?: string;
  sheetName?: string; // 工作表名称（精确匹配）
}
```

### 2. ProjectDetail.vue 组件修改

#### 2.1 添加 materialDetailRef 引用

```vue
<material-detail
  ref="materialDetailRef"
  :project-id="projectId"
  :sheet-names="projectData.sheetNames || []"
/>
```

#### 2.2 监听标签切换

```typescript
const materialDetailRef = ref();

// 监听标签切换
watch(activeTab, (newTab, oldTab) => {
  // 当切换到物料明细标签时，触发数据加载
  if (newTab === 'material' && oldTab !== 'material') {
    setTimeout(() => {
      if (materialDetailRef.value && typeof materialDetailRef.value.initializeData === 'function') {
        materialDetailRef.value.initializeData();
      }
    }, 100);
  }
});
```

**优点：**

- 延迟加载：只有在用户真正需要查看物料明细时才加载数据
- 性能优化：避免不必要的 API 调用

### 3. MaterialDetail.vue 组件修改

#### 3.1 添加 sheetNames prop

```typescript
interface Props {
  projectId: string;
  sheetNames?: string[]; // 项目的工作表名称列表
}

const props = withDefaults(defineProps<Props>(), {
  sheetNames: () => []
});
```

#### 3.2 修改标签页展示逻辑

从原来的 `importedSheetGroups`（前端分组）改为使用传入的 `sheetNames`（后端提供）：

```vue
<el-tabs
  v-if="sheetNames.length > 0"
  v-model="activeImportedSheetTab"
  type="border-card"
  class="imported-sheet-tabs"
  @tab-change="handleImportedTabChange"
>
  <el-tab-pane
    v-for="sheetName in sheetNames"
    :key="sheetName"
    :label="`${sheetName} (${getSheetMaterialCount(sheetName)})`"
    :name="sheetName"
  >
    <!-- 表格内容 -->
  </el-tab-pane>
</el-tabs>
```

#### 3.3 修改数据加载逻辑

##### 移除自动加载

```typescript
onMounted(() => {
  // 移除自动加载，改为由父组件在标签切换时触发
});
```

##### 添加 initializeData 方法

```typescript
const initializeData = () => {
  console.log('初始化物料明细数据');
  console.log('sheetNames:', props.sheetNames);

  // 如果有 sheetNames，使用第一个 sheetName 加载数据
  if (props.sheetNames && props.sheetNames.length > 0) {
    activeImportedSheetTab.value = props.sheetNames[0];
    loadMaterialList(props.sheetNames[0]);
  } else {
    ElMessage.warning('项目暂无物料清单工作表');
  }
};

// 暴露方法给父组件
defineExpose({
  initializeData
});
```

##### 修改 loadMaterialList 支持 sheetName 参数

```typescript
const loadMaterialList = async (sheetName?: string) => {
  loading.value = true;
  try {
    // 构建查询参数，如果提供了 sheetName 则添加到查询条件中
    const query: MaterialQuery = {
      ...listQuery.value,
      sheetName: sheetName || undefined
    };

    const response: any = await listMaterial(query);
    const data = response.data || response;
    materialList.value = data.rows || [];
    listTotal.value = data.total || 0;
  } catch (error) {
    console.error('获取物料列表失败:', error);
    ElMessage.error('获取物料列表失败');
  } finally {
    loading.value = false;
  }
};
```

##### 修改标签切换处理

```typescript
const handleImportedTabChange = async (tabName: string) => {
  if (loading.value) return; // 防止重复切换

  // 先更新UI状态，让标签立即切换
  activeImportedSheetTab.value = tabName;

  // 重置分页
  listQuery.value.pageNum = 1;

  // 调用接口，传入选中的 sheetName
  await loadMaterialList(tabName);
};
```

#### 3.4 添加辅助方法

##### getSheetMaterialCount

```typescript
const getSheetMaterialCount = (sheetName: string): number => {
  // 如果当前激活的标签就是这个 sheet，返回当前的 total
  if (activeImportedSheetTab.value === sheetName) {
    return listTotal.value;
  }
  // 否则返回 0
  return 0;
};
```

##### handleRefreshMaterialList

```typescript
const handleRefreshMaterialList = () => {
  if (activeImportedSheetTab.value) {
    listQuery.value.pageNum = 1; // 重置到第一页
    loadMaterialList(activeImportedSheetTab.value);
  } else {
    initializeData();
  }
};
```

### 4. 移除的代码

#### 4.1 移除的计算属性

- `importedSheetGroups`：不再需要前端分组，改用后端提供的 `sheetNames`

#### 4.2 移除的变量

- `currentImportedSheetData`：不再需要，直接使用 `materialList`
- `importedSheetSwitching`：不再需要，使用统一的 `loading` 状态

#### 4.3 移除的方法

- `updateCurrentImportedSheetData`：不再需要前端分页和数据切片

## 数据流程

```
1. 用户打开项目详情对话框
   ↓
2. ProjectDetail.vue 调用项目详情接口
   ↓
3. 接口返回项目数据（包含 sheetNames）
   ↓
4. 传递 sheetNames 给 MaterialDetail 组件
   ↓
5. 用户切换到"物料明细"标签
   ↓
6. ProjectDetail.vue 监听到标签切换
   ↓
7. 调用 MaterialDetail.initializeData()
   ↓
8. MaterialDetail 使用 sheetNames[0] 调用物料列表接口
   ↓
9. 接口返回该 Sheet 的物料数据
   ↓
10. 用户切换 Sheet 标签
    ↓
11. handleImportedTabChange 被触发
    ↓
12. 使用新的 sheetName 重新调用接口
    ↓
13. 更新数据展示
```

## API 调用示例

### 请求参数

```typescript
{
  pageNum: 1,
  pageSize: 50,
  projectId: "1",
  sheetName: "电控设备汇总" // 新增参数
}
```

### 响应数据

```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 15,
    "rows": [
      {
        "id": 1001,
        "materialName": "三相异步电动机",
        "specification": "Y2-132M-4 7.5KW",
        "quantity": 2,
        "unit": "台",
        "sheetName": "电控设备汇总",
        // ... 其他字段
      }
      // ... 更多数据
    ]
  }
}
```

## 优化亮点

### 1. 延迟加载

- 只有在切换到"物料明细"标签时才加载数据
- 避免了不必要的 API 调用，提升性能

### 2. 后端分页

- 不再使用前端分组和分页
- 直接使用后端接口的 `sheetName` 参数过滤
- 减少前端内存占用

### 3. 数据一致性

- Sheet 名称由后端提供，避免前端和后端不一致
- 标签数量始终与项目实际的 Sheet 数量一致

### 4. 用户体验

- 标签切换流畅，有 loading 状态提示
- 显示每个 Sheet 的数据数量
- 支持刷新当前 Sheet 数据

## 测试要点

### 1. 功能测试

- [ ] 首次打开项目详情，不自动加载物料数据
- [ ] 切换到"物料明细"标签，自动加载第一个 Sheet 的数据
- [ ] 切换 Sheet 标签，正确加载对应 Sheet 的数据
- [ ] 刷新按钮正常工作，重新加载当前 Sheet 数据
- [ ] 分页功能正常，切换 Sheet 后分页重置为第一页

### 2. 边界测试

- [ ] 项目没有物料清单（sheetNames 为空）
- [ ] 项目只有一个 Sheet
- [ ] 项目有多个 Sheet
- [ ] Sheet 没有数据的情况
- [ ] 网络请求失败的情况

### 3. 性能测试

- [ ] 频繁切换 Sheet 标签不会导致性能问题
- [ ] 大量数据时（100+ 条）展示流畅
- [ ] 不会产生重复的 API 请求

## 文件修改清单

### 类型文件

- [x] `src/api/erp/saltprocess/project/types.ts` - 添加 sheetNames 字段
- [x] `src/api/erp/saltprocess/material/types.ts` - 添加 sheetName 查询参数

### 组件文件

- [x] `src/views/erp/saltprocess/project/components/ProjectDetail.vue` - 监听标签切换，传递 sheetNames
- [x] `src/views/erp/saltprocess/project/components/MaterialDetail.vue` - 实现按 Sheet 加载数据

## 兼容性说明

### 向后兼容

- 如果后端接口暂未返回 `sheetNames`，组件会显示空状态提示
- `sheetName` 查询参数为可选，不传值时返回所有数据（保持原有行为）

### 数据迁移

- 不需要数据库迁移
- 现有数据无影响

## 注意事项

1. **后端接口要求**：

   - 项目详情接口需要返回 `sheetNames` 字段
   - 物料列表接口需要支持 `sheetName` 查询参数（精确匹配）

2. **TypeScript 类型**：

   - 确保类型定义与后端接口一致
   - 新增字段都设置为可选，保证兼容性

3. **性能考虑**：

   - 使用后端分页，避免前端处理大量数据
   - 延迟加载，只在需要时才请求数据

4. **用户体验**：
   - 标签切换有 loading 状态
   - 空状态有友好提示
   - 错误有明确的错误信息

## 后续优化建议

1. **Sheet 数量缓存**：

   - 可以考虑在首次加载时获取所有 Sheet 的数量
   - 缓存起来，避免标签显示"(0)"的情况

2. **预加载**：

   - 可以考虑预加载下一个 Sheet 的数据
   - 提升用户体验

3. **搜索功能增强**：
   - 支持跨 Sheet 搜索
   - 搜索结果显示所属 Sheet

---

**实现日期**：2025-10-27  
**文档版本**：v1.0  
**实现人员**：AI Assistant
