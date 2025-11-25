# ProjectSubsystemItemList 组件样式调整说明

## 调整目标

将 `ProjectSubsystemItemList.vue` 组件的样式和布局调整为与参考组件 `ItemTemplateManagement.vue` 保持视觉一致。

## 参考组件

**路径：** `/src/views/erp/subsystem/template/components/ItemTemplateManagement.vue`

## 主要调整内容

### 1. 标题区域布局调整

**调整前：**
```vue
<div class="header-section mb-4">
  <el-row :gutter="10">
    <el-col :span="12">
      <h3 class="section-title">
        <el-icon class="mr-2"><Menu /></el-icon>
        子项列表
        <el-tag v-if="items && items.length > 0" type="success" size="small" class="ml-2">
          共 {{ items.length }} 个子项
        </el-tag>
      </h3>
    </el-col>
  </el-row>
</div>
```

**调整后：**
```vue
<el-card shadow="never" class="mb-4">
  <template #header>
    <div class="card-header">
      <span class="card-title">
        <el-icon class="mr-2"><Menu /></el-icon>
        子项列表
      </span>
      <el-tag v-if="items && items.length > 0" type="success" size="small">
        共 {{ items.length }} 个
      </el-tag>
    </div>
  </template>
  <!-- 表格内容 -->
</el-card>
```

**改进点：**
- 使用 `el-card` 的 `header` 插槽显示标题
- 标题和统计标签分别位于左右两侧
- 简化标签文本："共 X 个子项" → "共 X 个"

### 2. 表格样式调整

**调整前：**
```vue
<el-table
  v-loading="loading"
  :data="items"
  style="width: 100%"
  stripe
  border
>
```

**调整后：**
```vue
<el-table
  v-loading="loading"
  :data="items"
  highlight-current-row
  style="width: 100%"
>
```

**改进点：**
- 移除 `stripe` 属性（斑马纹）
- 移除 `border` 属性（边框）
- 添加 `highlight-current-row` 属性（行高亮）
- 使用更简洁的表格样式

### 3. 表格列宽调整

| 列名 | 调整前宽度 | 调整后宽度 | 说明 |
|------|-----------|-----------|------|
| 序号 | 80 | 已移除 | 移除序号列，直接使用子项编号 |
| 子项编号 | 200 | 220 | 增加宽度以适应更长的编号 |
| 子项名称 | min-width 180 | 200 | 改为固定宽度 |
| 子项类型 | 120 | 120 | 保持不变 |
| 数量 | 100 | 100 | 保持不变 |
| 单位 | 80 | 100 | 增加宽度 |
| 单件重量 | 120 | 120 | 保持不变 |
| 总重量 | 120 | 120 | 保持不变 |
| 材料数量 | 100 | 110 | 略微增加宽度 |
| 状态 | 100 | 100 | 保持不变 |

### 4. 列标签调整

**调整前：**
- 列名：子项编码
- 显示逻辑：始终显示标签，空值显示 "-"

**调整后：**
- 列名：子项编号（与参考组件一致）
- 显示逻辑：有值时显示标签，空值显示灰色文本 "-"

```vue
<el-table-column label="子项类型" prop="itemType" width="120" align="center">
  <template #default="scope">
    <el-tag v-if="scope.row.itemType" :type="getItemTypeTagType(scope.row.itemType)" size="small">
      {{ scope.row.itemType }}
    </el-tag>
    <span v-else class="text-muted">-</span>
  </template>
</el-table-column>
```

### 5. 样式类调整

**移除的样式类：**
```scss
.header-section {
  .section-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.ml-2 {
  margin-left: 8px;
}
```

**新增的样式类：**
```scss
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}
```

**保留的样式类：**
```scss
.mb-4 {
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}

.text-muted {
  color: #909399;
}

.empty-state {
  padding: 40px 0;
}
```

## 视觉效果对比

### 调整前
- 标题独立于卡片外部
- 表格带有斑马纹和边框
- 包含序号列
- 列宽较窄

### 调整后
- 标题位于卡片头部
- 表格简洁无边框
- 移除序号列
- 列宽更合理
- 与参考组件视觉一致

## 技术特性

✅ 保持功能逻辑不变  
✅ 仅调整样式和布局  
✅ 符合 Element Plus 设计规范  
✅ 与参考组件视觉统一  
✅ 响应式设计  
✅ 代码结构清晰  

## Git 提交信息

```
style(saltprocess): 调整ProjectSubsystemItemList组件样式以匹配参考设计

参考组件：ItemTemplateManagement.vue
提交哈希：4b6a06f
```

## 测试建议

1. 测试标题和统计标签的显示效果
2. 测试表格行高亮效果
3. 测试空状态显示
4. 测试不同数据量下的表格显示
5. 测试响应式布局
6. 对比参考组件，确认视觉一致性

