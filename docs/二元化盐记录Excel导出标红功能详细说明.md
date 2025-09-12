# 二元化盐记录Excel导出标红功能详细说明

## 功能概述

在二元化盐记录Excel导出功能中，新增了智能配比检测和标红功能。系统会自动检测每条记录的硝酸钠：硝酸钾配比是否符合标准6:4配比（允许±5%偏差），对不符合标准的记录进行整行标红处理，并在配比列添加警告标识和详细注释。

## 配比标准定义

### 1. 标准配比
- **标准比例**: 硝酸钠：硝酸钾 = 6:4 (60%:40%)
- **允许偏差**: ±5%
- **正常范围**: 硝酸钠 55%-65%，硝酸钾 35%-45%

### 2. 配比计算公式

```typescript
// 计算实际配比
const total = nano3Weight + kno3Weight;
const nano3Ratio = nano3Weight / total; // 硝酸钠比例
const kno3Ratio = kno3Weight / total;   // 硝酸钾比例

// 标准配比
const standardNano3Ratio = 0.6; // 60%
const standardKno3Ratio = 0.4;  // 40%

// 偏差计算
const nano3Deviation = Math.abs(nano3Ratio - standardNano3Ratio);
const kno3Deviation = Math.abs(kno3Ratio - standardKno3Ratio);

// 判断是否正常（允许5%偏差）
const tolerance = 0.05;
const isNormal = nano3Deviation <= tolerance && kno3Deviation <= tolerance;
```

### 3. 配比状态示例

| 硝酸钠重量(kg) | 硝酸钾重量(kg) | 实际配比 | 硝酸钠比例 | 偏差 | 状态 |
|---------------|---------------|----------|-----------|------|------|
| 3600 | 2400 | 6.0:4.0 | 60% | 0% | ✅ 正常 |
| 3580 | 2420 | 5.9:4.1 | 59.7% | 0.3% | ✅ 正常 |
| 3000 | 3000 | 5.0:5.0 | 50% | 10% | ❌ 异常 |
| 4200 | 1800 | 7.0:3.0 | 70% | 10% | ❌ 异常 |
| 2400 | 3600 | 4.0:6.0 | 40% | 20% | ❌ 异常 |
| 3900 | 2100 | 6.5:3.5 | 65% | 5% | ❌ 异常 |

## 技术实现

### 1. 配比检测方法

```typescript
// 判断配比是否正常（6:4标准，允许±5%偏差）
const isNormalRatio = (nano3Weight: number, kno3Weight: number): boolean => {
  if (!nano3Weight || !kno3Weight) return false;

  const total = nano3Weight + kno3Weight;
  if (total === 0) return false;

  const nano3Ratio = nano3Weight / total;
  const kno3Ratio = kno3Weight / total;

  // 标准配比：硝酸钠60%，硝酸钾40%
  const standardNano3Ratio = 0.6;
  const standardKno3Ratio = 0.4;

  // 允许±5%的偏差
  const tolerance = 0.05;

  const nano3Deviation = Math.abs(nano3Ratio - standardNano3Ratio);
  const kno3Deviation = Math.abs(kno3Ratio - standardKno3Ratio);

  return nano3Deviation <= tolerance && kno3Deviation <= tolerance;
};
```

### 2. 数据格式转换增强

```typescript
// 转换数据格式为Excel导出格式
const convertToExcelFormat = (data: any[]) => {
  return data.map(record => {
    const isAbnormal = !isNormalRatio(record.nano3ActualWeight, record.kno3ActualWeight);
    const ratioText = formatRatio(record.nano3ActualWeight, record.kno3ActualWeight);
    
    return {
      '记录编码': record.recordCode,
      '项目ID': record.projectId,
      '日期': record.recordDate,
      '班次': record.shift === 1 ? '白班' : '夜班',
      '硝酸钠(t)': formatWeight(record.nano3ActualWeight),
      '硝酸钾(t)': formatWeight(record.kno3ActualWeight),
      '硝酸钠：硝酸钾': isAbnormal ? `${ratioText} ⚠️` : ratioText, // 异常配比添加警告标识
      '总计化盐(t)': formatWeight(getTotalSaltWeight(record)),
      '熔盐液位(m)': record.moltenSaltLevel || '-',
      '熔盐温度(℃)': record.moltenSaltTemperature || '-',
      '天然气耗量(Nm³)': record.gasConsumption || '-',
      '用电量(KWh)': record.powerConsumption || '-',
      '人数': record.staffCount || '-',
      '记录人': record.recorderName || record.operatorName || '-'
    };
  });
};
```

### 3. 条件格式化应用

```typescript
// 应用条件格式化 - 标红不满足6:4配比的数据
const applyConditionalFormatting = (ws: any, data: any[]) => {
  if (!ws['!ref']) return;

  // 定义标红样式
  const redStyle = {
    fill: {
      fgColor: { rgb: "FFCCCC" } // 浅红色背景
    },
    font: {
      color: { rgb: "CC0000" }, // 红色字体
      bold: true
    },
    border: {
      top: { style: "thin", color: { rgb: "CC0000" } },
      bottom: { style: "thin", color: { rgb: "CC0000" } },
      left: { style: "thin", color: { rgb: "CC0000" } },
      right: { style: "thin", color: { rgb: "CC0000" } }
    }
  };

  // 遍历数据行，检查配比是否符合6:4标准
  data.forEach((record, index) => {
    const rowIndex = index + 2; // Excel行号从2开始（第1行是标题）
    const isAbnormalRatio = !isNormalRatio(record.nano3ActualWeight, record.kno3ActualWeight);

    if (isAbnormalRatio) {
      // 标红整行数据
      const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
      columns.forEach(col => {
        const cellRef = `${col}${rowIndex}`;
        if (ws[cellRef]) {
          ws[cellRef].s = redStyle;
        }
      });

      // 特别标注配比列（第7列：硝酸钠：硝酸钾）
      const ratioCell = `G${rowIndex}`;
      if (ws[ratioCell]) {
        ws[ratioCell].s = {
          ...redStyle,
          font: {
            ...redStyle.font,
            size: 12,
            bold: true
          }
        };
        // 添加注释
        ws[ratioCell].c = [{
          a: "系统",
          t: `配比异常：不符合标准6:4配比\n当前配比：${formatRatio(record.nano3ActualWeight, record.kno3ActualWeight)}\n偏差超出正常范围(±5%)`
        }];
      }
    }
  });
};
```

## 样式设计

### 1. 异常配比行样式

- **背景色**: 浅红色 (#FFCCCC)
- **字体色**: 红色 (#CC0000)
- **字体**: 加粗
- **边框**: 红色细线边框
- **特殊标识**: 配比列添加 ⚠️ 警告图标

### 2. 正常配比行样式

- **背景色**: 白色 (#FFFFFF)
- **字体色**: 黑色 (#000000)
- **字体**: 正常
- **边框**: 无特殊边框

### 3. 标题行样式

- **背景色**: 浅蓝色 (#E6F3FF)
- **字体色**: 黑色 (#000000)
- **字体**: 加粗，12号字体
- **对齐**: 居中对齐
- **边框**: 黑色细线边框

### 4. 配比列特殊处理

- **异常配比**: 
  - 添加 ⚠️ 警告图标
  - 鼠标悬停显示详细注释
  - 注释内容包含：当前配比值、偏差说明
- **正常配比**: 
  - 显示标准配比格式
  - 无特殊标识

## 测试数据示例

### 1. 正常配比数据

```json
{
  "id": "1",
  "recordCode": "BIN_1733097600_001",
  "nano3ActualWeight": 3600, // 60%
  "kno3ActualWeight": 2400,  // 40%
  "配比状态": "正常",
  "显示效果": "白色背景，黑色字体"
}
```

### 2. 异常配比数据

```json
{
  "id": "4",
  "recordCode": "BIN_1733270400_001",
  "nano3ActualWeight": 4200, // 70%
  "kno3ActualWeight": 1800,  // 30%
  "配比状态": "异常",
  "偏差": "硝酸钠超出10%",
  "显示效果": "红色背景，红色字体，整行标红"
}
```

```json
{
  "id": "5",
  "recordCode": "BIN_1733356800_001",
  "nano3ActualWeight": 2400, // 40%
  "kno3ActualWeight": 3600,  // 60%
  "配比状态": "异常",
  "偏差": "配比颠倒",
  "显示效果": "红色背景，红色字体，整行标红"
}
```

## 用户体验优化

### 1. 视觉识别

- **一目了然**: 异常配比数据整行标红，快速识别问题记录
- **层次分明**: 不同状态使用不同颜色，视觉层次清晰
- **重点突出**: 配比列特别加粗，重点信息突出显示

### 2. 信息提示

- **警告图标**: 异常配比添加 ⚠️ 图标，直观提示
- **详细注释**: 鼠标悬停显示具体偏差信息
- **状态说明**: 清晰说明配比异常的具体原因

### 3. 操作便利

- **批量识别**: 一次导出即可识别所有异常配比记录
- **数据完整**: 保留所有原始数据，仅在显示上做标识
- **格式兼容**: 导出文件仍可作为导入模板使用

## 业务价值

### 1. 质量控制

- **及时发现**: 快速识别配比异常的生产记录
- **趋势分析**: 通过标红数据分析配比控制趋势
- **问题追溯**: 便于追溯配比异常的原因和责任人

### 2. 生产管理

- **标准化**: 强化6:4标准配比的重要性
- **规范化**: 促进生产操作的标准化和规范化
- **可视化**: 将抽象的配比数据可视化展示

### 3. 决策支持

- **数据驱动**: 为生产决策提供直观的数据支持
- **风险预警**: 及时发现潜在的质量风险
- **持续改进**: 为工艺优化提供数据基础

## 注意事项

### 1. 配比计算精度

- 使用浮点数计算时注意精度问题
- 建议保留足够的小数位数进行比较
- 避免因精度问题导致的误判

### 2. 样式兼容性

- 确保Excel样式在不同版本中的兼容性
- 测试在不同操作系统下的显示效果
- 考虑打印时的样式表现

### 3. 性能考虑

- 大数据量时样式应用可能影响性能
- 建议对超大数据集进行分批处理
- 监控内存使用情况，避免内存溢出

### 4. 用户培训

- 向用户说明标红规则和含义
- 提供配比标准的培训材料
- 建立异常配比的处理流程

## 后续优化建议

1. **多级预警**: 根据偏差程度设置不同的颜色等级
2. **统计汇总**: 在Excel中添加异常配比统计汇总
3. **趋势图表**: 生成配比趋势图表
4. **自动报告**: 自动生成配比异常分析报告
5. **移动端适配**: 考虑移动端查看Excel的体验优化
