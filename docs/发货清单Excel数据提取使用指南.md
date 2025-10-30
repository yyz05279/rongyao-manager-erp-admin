# 发货清单 Excel 数据提取使用指南

## 概述

本指南说明如何使用 `excel-parser.ts` 工具从 Excel 文件中智能提取发货类型、子系统等元数据信息。

## 功能特性

### 1. 从标题提取设备类型

支持从 Excel 标题中提取设备类型，例如：

- `淮安化盐系统-发货清单（机械）` → `MECHANICAL`
- `发货清单【电控】` → `ELECTRICAL`
- `管路设备清单` → `PIPELINE`

### 2. 从第二行提取子系统

支持从 Excel 第二行提取子系统信息，例如：

- `固态处理厂` → `固态处理厂`
- 支持多种字段名称：`subsystem`、`子系统`、`所属系统` 等

### 3. 智能分配默认值

- 明细级别可以覆盖主表级别的设置
- 如果明细没有指定，则继承主表的值

## 使用示例

### 基础用法

```typescript
import {
  extractEquipmentTypeFromTitle,
  extractSubsystemFromSecondRow,
  extractExcelMetadata,
  assignEquipmentTypes,
  assignSubsystems
} from '@/api/erp/saltprocess/shipping/excel-parser';
import { EnhancedShippingImportRequest } from '@/api/erp/saltprocess/shipping';

// 假设已经解析了 Excel 文件
const excelTitle = '淮安化盐系统-发货清单（机械）';
const excelSecondRow = { A: '固态处理厂' };
const sheetName = '第一批设备';

// 1. 提取元数据
const metadata = extractExcelMetadata({
  title: excelTitle,
  secondRow: excelSecondRow,
  sheetName: sheetName
});

console.log(metadata);
// 输出：
// {
//   shippingType: '机械',
//   equipmentType: 'MECHANICAL',
//   subsystem: '固态处理厂',
//   sheetName: '第一批设备'
// }

// 2. 构建导入请求
const importRequest: EnhancedShippingImportRequest = {
  projectId: '1',
  projectName: '淮安化盐项目',
  batchNumber: '第一车',
  shippingType: metadata.shippingType,      // ✅ 从标题提取
  subsystem: metadata.subsystem,            // ✅ 从第二行提取
  responsiblePersonId: 1,
  responsiblePerson: '张三',
  shippingDate: '2025-01-15',
  shippingItems: [
    {
      sequenceNo: 1,
      equipmentName: '螺旋给料机',
      quantity: 2,
      unit: '台',
      equipmentType: metadata.equipmentType, // ✅ 明细级别
      subsystem: metadata.subsystem,         // ✅ 明细级别
      sheetName: metadata.sheetName          // ✅ 明细级别
    }
  ]
};

// 3. 批量分配设备类型和子系统
let items = [
  { equipmentName: '螺旋给料机', quantity: 2, unit: '台' },
  { equipmentName: '输送带', quantity: 1, unit: '套', equipmentType: 'ELECTRICAL' }
];

// 为所有明细分配默认设备类型（如果明细没有指定）
items = assignEquipmentTypes(items, metadata.equipmentType);
// items[0].equipmentType = 'MECHANICAL' (继承)
// items[1].equipmentType = 'ELECTRICAL' (保持原值)

// 为所有明细分配默认子系统
items = assignSubsystems(items, metadata.subsystem);
// items[0].subsystem = '固态处理厂'
// items[1].subsystem = '固态处理厂'
```

### Vue 组件中的完整示例

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import * as XLSX from 'xlsx';
import {
  extractExcelMetadata,
  assignEquipmentTypes,
  assignSubsystems
} from '@/api/erp/saltprocess/shipping/excel-parser';
import {
  importEnhancedShippingList,
  type EnhancedShippingImportRequest,
  type EnhancedShippingItemForm
} from '@/api/erp/saltprocess/shipping';

// Excel 文件上传处理
const handleFileUpload = async (file: File) => {
  try {
    // 1. 读取 Excel 文件
    const workbook = await readExcelFile(file);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 2. 解析数据
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const titleRow = jsonData[0] as any[];
    const secondRow = jsonData[1] as any[];
    const dataRows = jsonData.slice(2); // 从第3行开始是数据

    // 3. 提取元数据
    const title = Array.isArray(titleRow) ? titleRow[0] : '';
    const metadata = extractExcelMetadata({
      title: String(title),
      secondRow: secondRow,
      sheetName: sheetName
    });

    console.log('提取的元数据:', metadata);
    // 输出: { shippingType: '机械', equipmentType: 'MECHANICAL', subsystem: '固态处理厂' }

    // 4. 解析明细数据
    let items: EnhancedShippingItemForm[] = dataRows.map((row: any[]) => ({
      sequenceNo: row[0],
      equipmentName: row[1],
      quantity: row[2],
      unit: row[3],
      specification: row[4],
      remarks1: row[5]
    }));

    // 5. 批量分配元数据到明细
    items = assignEquipmentTypes(items, metadata.equipmentType);
    items = assignSubsystems(items, metadata.subsystem);
    items = items.map(item => ({
      ...item,
      sheetName: metadata.sheetName
    }));

    // 6. 构建导入请求
    const importRequest: EnhancedShippingImportRequest = {
      projectId: formData.value.projectId,
      projectName: formData.value.projectName,
      batchNumber: formData.value.batchNumber,
      shippingType: metadata.shippingType,        // ✅ 主表级别
      subsystem: metadata.subsystem,              // ✅ 主表级别
      responsiblePersonId: formData.value.responsiblePersonId,
      responsiblePerson: formData.value.responsiblePerson,
      shippingDate: formData.value.shippingDate,
      shippingItems: items
    };

    // 7. 调用接口导入
    const result = await importEnhancedShippingList(importRequest);

    if (result.data.success) {
      ElMessage.success(`导入成功！${result.data.summary}`);
    } else {
      ElMessage.error('导入失败：' + (result.data.errors?.join(', ') || '未知错误'));
    }

  } catch (error) {
    console.error('Excel 解析失败:', error);
    ElMessage.error('Excel 解析失败');
  }
};

// 辅助函数：读取 Excel 文件
const readExcelFile = (file: File): Promise<XLSX.WorkBook> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
</script>
```

## API 接口数据结构

### 主表级别字段

```typescript
{
  "projectId": "1",
  "projectName": "淮安化盐项目",
  "batchNumber": "第一车",
  "shippingType": "机械",           // ✅ 从标题提取 (可选)
  "subsystem": "固态处理厂",         // ✅ 从第二行提取 (可选)
  "responsiblePersonId": 1,
  "responsiblePerson": "张三",
  "shippingDate": "2025-01-15",
  "shippingItems": [...]
}
```

### 明细级别字段

```typescript
{
  "sequenceNo": 1,
  "equipmentName": "螺旋给料机",
  "quantity": 2,
  "unit": "台",
  "equipmentType": "MECHANICAL",    // ✅ 从标题提取 (可选)
  "subsystem": "固态处理厂",         // ✅ 继承主表或独立设置 (可选)
  "sheetName": "第一批设备",         // ✅ 从 Sheet 名称获取 (可选)
  "specification": "规格型号",
  "remarks1": "备注信息"
}
```

## 支持的设备类型映射

| 中文名称 | Excel 标识                     | 枚举值         |
| -------- | ------------------------------ | -------------- |
| 机械     | 机械、机械设备、（机械）       | MECHANICAL     |
| 电控     | 电控、电气、电控设备、（电控） | ELECTRICAL     |
| 管路     | 管路、管道、管路设备、（管路） | PIPELINE       |
| 燃烧器   | 燃烧器、（燃烧器）             | BURNER         |
| 辅助设备 | 辅助、辅助设备、（辅助）       | AUXILIARY      |
| 标准件   | 标准件、（标准件）             | STANDARD_PARTS |

## 注意事项

1. **优先级规则**：明细级别 > 主表级别 > 默认值
2. **字段可选**：所有新增字段都是可选的，不影响现有功能
3. **向后兼容**：保留了 `shippingType` 字段，与新的 `equipmentType` 共存
4. **灵活性**：可以在 Excel 中为每个明细单独指定不同的设备类型和子系统

## 常见问题

### Q1: 如果标题中没有设备类型怎么办？

A: 可以在代码中指定默认值，或者让用户手动选择：

```typescript
const metadata = extractExcelMetadata({ title: excelTitle });
if (!metadata.equipmentType) {
  // 使用默认值或提示用户选择
  metadata.equipmentType = EquipmentType.MECHANICAL;
}
```

### Q2: 如何处理多个 Sheet？

A: 遍历所有 Sheet，为每个 Sheet 独立提取元数据：

```typescript
workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const metadata = extractExcelMetadata({
    title: excelTitle,
    secondRow: getSecondRow(worksheet),
    sheetName: sheetName  // ✅ 每个 Sheet 独立标识
  });

  // 处理该 Sheet 的数据...
});
```

### Q3: 第二行数据格式不统一怎么办？

A: `extractSubsystemFromSecondRow` 函数会智能识别多种格式：

- 字符串：直接返回
- 对象：从多个可能的字段中查找
- 数组：取第一个非空值

## 测试建议

建议在实际使用前测试以下场景：

1. ✅ 标题包含括号的情况：`淮安化盐系统-发货清单（机械）`
2. ✅ 标题不包含括号的情况：`机械设备发货清单`
3. ✅ 第二行为字符串：`固态处理厂`
4. ✅ 第二行为对象：`{ subsystem: '固态处理厂' }`
5. ✅ 明细覆盖主表设置：部分明细有独立的设备类型
6. ✅ 多 Sheet 场景：每个 Sheet 有不同的元数据

## 相关文档

- [发货清单接口文档](./发货清清单导入API接口设计.md)
- [类型定义文档](../src/api/erp/saltprocess/shipping/types.ts)
- [API 接口文档](../src/api/erp/saltprocess/shipping/index.ts)
