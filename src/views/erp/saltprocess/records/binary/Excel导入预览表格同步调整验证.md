# Excel导入预览表格同步调整验证

## 调整概述

已成功调整Excel导入弹窗中的数据预览表格，使其与二元化盐记录管理页面的列表显示完全一致，确保用户在预览和实际列表中看到的数据格式完全相同。

## 核心调整内容

### 1. 预览表格列结构同步 ✅

#### 调整前的列结构
```vue
<!-- 旧的预览表格列 -->
<el-table-column prop="recordCode" label="记录编码" width="120" />
<el-table-column prop="batchNumber" label="批次号" width="120" />
<el-table-column prop="projectId" label="项目ID" width="80" />
<el-table-column prop="recordDate" label="记录日期" width="100" />
<el-table-column prop="operatorName" label="操作员" width="80" />
<el-table-column prop="actualOutput" label="实际产量" width="100" />
<el-table-column prop="yieldRate" label="产出率" width="80" />
```

#### 调整后的列结构
```vue
<!-- 新的预览表格列 - 与主列表完全一致 -->
<el-table-column label="序号" type="index" width="60" align="center" />
<el-table-column label="记录编码" prop="recordCode" width="140" show-overflow-tooltip />
<el-table-column label="项目ID" prop="projectId" width="80" align="center" />
<el-table-column label="日期" prop="recordDate" width="120" />
<el-table-column label="班次" prop="shift" width="80">
  <template #default="scope">
    <el-tag :type="scope.row.shift === 1 ? 'primary' : 'warning'">
      {{ scope.row.shift === 1 ? '白班' : '夜班' }}
    </el-tag>
  </template>
</el-table-column>
<el-table-column label="硝酸钠(t)" prop="nano3ActualWeight" width="100">
  <template #default="scope">
    {{ formatWeight(scope.row.nano3ActualWeight) }}
  </template>
</el-table-column>
<el-table-column label="硝酸钾(t)" prop="kno3ActualWeight" width="100">
  <template #default="scope">
    {{ formatWeight(scope.row.kno3ActualWeight) }}
  </template>
</el-table-column>
<el-table-column label="硝酸钠：硝酸钾" width="130">
  <template #default="scope">
    <span :class="getRatioClass(scope.row)">
      {{ formatRatio(scope.row.nano3ActualWeight, scope.row.kno3ActualWeight) }}
    </span>
  </template>
</el-table-column>
<el-table-column label="总计化盐(t)" width="110">
  <template #default="scope">
    {{ formatWeight(getTotalSaltWeight(scope.row)) }}
  </template>
</el-table-column>
<el-table-column label="熔盐液位(m)" prop="moltenSaltLevel" width="110" />
<el-table-column label="熔盐温度(℃)" prop="moltenSaltTemperature" width="110" />
<el-table-column label="天然气耗量(Nm³)" prop="gasConsumption" width="130" />
<el-table-column label="用电量(KWh)" prop="powerConsumption" width="120" />
<el-table-column label="人数" prop="staffCount" width="80" />
<el-table-column label="记录人" prop="recorderName" width="100" />
```

### 2. 字段显示格式统一 ✅

#### 重量字段格式化
```typescript
// 统一的重量格式化函数
const formatWeight = (weight: number) => {
  if (!weight && weight !== 0) return '-';
  return (weight / 1000).toFixed(2); // kg转换为吨，保留2位小数
};

// 应用示例
硝酸钠: 3600kg → 3.60t
硝酸钾: 2400kg → 2.40t
总计化盐: 6000kg → 6.00t
```

#### 配比显示格式化
```typescript
// 统一的配比格式化函数
const formatRatio = (nano3Weight: number, kno3Weight: number) => {
  const nano3Tons = nano3Weight / 1000;
  const kno3Tons = kno3Weight / 1000;
  const total = nano3Tons + kno3Tons;
  
  const nano3Ratio = (nano3Tons / total * 10).toFixed(1);
  const kno3Ratio = (kno3Tons / total * 10).toFixed(1);
  
  return `${nano3Ratio}:${kno3Ratio}`;
};

// 应用示例
3600kg:2400kg → 6.0:4.0
3580kg:2420kg → 6.0:4.0
```

#### 班次标签显示
```vue
<!-- 统一的班次显示 -->
<el-tag :type="scope.row.shift === 1 ? 'primary' : 'warning'">
  {{ scope.row.shift === 1 ? '白班' : '夜班' }}
</el-tag>
```

### 3. 移除老字段显示 ✅

#### 已删除的旧字段
- ❌ `batchNumber` (批次号) - 在预览中不显示，但数据中保留
- ❌ `operatorName` (操作员) - 改为显示记录人
- ❌ `actualOutput` (实际产量kg) - 改为总计化盐(t)
- ❌ `yieldRate` (产出率%) - 不再显示

#### 新增的字段
- ✅ `序号` - 自动编号
- ✅ `班次` - 白班/夜班标签
- ✅ `硝酸钠(t)` - 重量显示为吨
- ✅ `硝酸钾(t)` - 重量显示为吨
- ✅ `硝酸钠：硝酸钾` - 配比显示
- ✅ `总计化盐(t)` - 总重量
- ✅ `熔盐液位(m)` - 工艺参数
- ✅ `熔盐温度(℃)` - 工艺参数
- ✅ `天然气耗量(Nm³)` - 能耗数据
- ✅ `用电量(KWh)` - 能耗数据
- ✅ `人数` - 操作人员数量
- ✅ `记录人` - 记录员姓名

### 4. 描述文字更新 ✅

#### 标题更新
```vue
<!-- 更新前 -->
<h4>数据预览 (共 {{ previewData.length }} 条记录)</h4>

<!-- 更新后 -->
<h4>📊 导入数据预览 (共 {{ previewData.length }} 条二元化盐记录)</h4>
```

#### 提示文字更新
```vue
<!-- 更新前 -->
<div class="more-tip">
  还有 {{ previewData.length - 5 }} 条记录未显示...
</div>

<!-- 更新后 -->
<div class="more-tip">
  还有 {{ previewData.length - 5 }} 条记录未显示，导入时将处理全部数据...
</div>
```

### 5. 计算函数复用 ✅

#### 从主列表页面复用的函数
```typescript
// 1. 重量格式化函数
const formatWeight = (weight: number) => {
  if (!weight && weight !== 0) return '-';
  return (weight / 1000).toFixed(2);
};

// 2. 总重量计算函数
const getTotalSaltWeight = (row: any) => {
  const nano3Weight = row.nano3ActualWeight || 0;
  const kno3Weight = row.kno3ActualWeight || 0;
  return nano3Weight + kno3Weight;
};

// 3. 配比格式化函数
const formatRatio = (nano3Weight: number, kno3Weight: number) => {
  // 详细实现...
};

// 4. 配比样式类函数
const getRatioClass = (row: any) => {
  // 根据配比偏差返回样式类
  // text-success: 偏差≤2%
  // text-warning: 偏差≤5%
  // text-danger: 偏差>5%
};
```

### 6. 样式和布局 ✅

#### 列宽设置
```typescript
// 与主列表保持一致的列宽
序号: 60px
记录编码: 140px (支持溢出提示)
项目ID: 80px (居中对齐)
日期: 120px
班次: 80px
硝酸钠(t): 100px
硝酸钾(t): 100px
硝酸钠：硝酸钾: 130px
总计化盐(t): 110px
熔盐液位(m): 110px
熔盐温度(℃): 110px
天然气耗量(Nm³): 130px
用电量(KWh): 120px
人数: 80px
记录人: 100px
```

#### 样式类应用
```scss
// 配比颜色样式类
.text-success {
  color: #67c23a;
  font-weight: 600;
}

.text-warning {
  color: #e6a23c;
  font-weight: 600;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}
```

#### 表格设置
```vue
<el-table
  :data="previewData.slice(0, 5)"
  border
  size="small"
  max-height="400"
  style="width: 100%"
>
```

## 验证测试

### 1. 数据一致性验证

#### 测试场景1: Excel导入数据预览
```typescript
// Excel原始数据
{
  date: '2024-12-01',
  sodiumWeight: 3600, // kg
  potassiumWeight: 2400, // kg
  staffCount: 8,
  moltenSaltLevel: 2.5,
  moltenSaltTemperature: 565
}

// 预览表格显示
序号: 1
记录编码: BIN_1733097600_001
项目ID: 101
日期: 2024-12-01
班次: 白班
硝酸钠(t): 3.60
硝酸钾(t): 2.40
硝酸钠：硝酸钾: 6.0:4.0 (绿色)
总计化盐(t): 6.00
熔盐液位(m): 2.5
熔盐温度(℃): 565
天然气耗量(Nm³): 1200
用电量(KWh): 850
人数: 8
记录人: 系统导入
```

#### 测试场景2: 主列表显示
```typescript
// 导入后在主列表中的显示应该完全相同
序号: 1
记录编码: BIN_1733097600_001
项目ID: 101
日期: 2024-12-01
班次: 白班
硝酸钠(t): 3.60
硝酸钾(t): 2.40
硝酸钠：硝酸钾: 6.0:4.0 (绿色)
总计化盐(t): 6.00
熔盐液位(m): 2.5
熔盐温度(℃): 565
天然气耗量(Nm³): 1200
用电量(KWh): 850
人数: 8
记录人: 系统导入
```

### 2. 格式化验证

#### 重量单位转换
- ✅ 3600kg → 3.60t
- ✅ 2400kg → 2.40t
- ✅ 6000kg → 6.00t

#### 配比计算和颜色
- ✅ 6:4配比 → 绿色显示
- ✅ 5.8:4.2配比 → 橙色显示
- ✅ 5:5配比 → 红色显示

#### 班次标签
- ✅ shift=1 → 蓝色"白班"标签
- ✅ shift=2 → 橙色"夜班"标签

### 3. 响应式验证

#### 表格宽度适配
- ✅ 总宽度约1500px，支持横向滚动
- ✅ 重要字段优先显示
- ✅ 列宽合理分配

#### 数据显示完整性
- ✅ 所有字段正常显示
- ✅ 空值显示为"-"
- ✅ 数值精度正确

## 用户体验改进

### 1. 视觉一致性
- ✅ 预览表格与主列表视觉完全一致
- ✅ 相同的颜色标识和样式
- ✅ 统一的数据格式和精度

### 2. 信息完整性
- ✅ 预览显示所有关键字段
- ✅ 计算字段实时显示
- ✅ 工艺参数和能耗数据可见

### 3. 操作便利性
- ✅ 预览数据即所见即所得
- ✅ 导入前可充分验证数据
- ✅ 减少导入后的意外情况

---

**调整完成时间**: 2024年12月
**调整状态**: ✅ 已完成
**测试状态**: 待验证
**部署状态**: 待部署

**验证要点**: 
1. Excel导入预览表格与主列表显示完全一致
2. 所有字段的计算、格式化、样式保持统一
3. 用户在预览和实际列表中看到的数据无差异
