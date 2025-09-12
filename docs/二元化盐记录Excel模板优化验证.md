# 二元化盐记录Excel模板优化验证文档

## 修改概述

本次优化调整了二元化盐记录模块的Excel导入模板，确保模板结构与前端表格列完全一致，提升用户体验和数据导入的准确性。

## 修改内容

### 1. 模板结构调整

#### 修改前的模板列（旧版本）
```
记录编码, 批次号, 项目ID, 记录日期, 班次, 持续时间, 
NaNO3目标配比, NaNO3实际配比, NaNO3目标用量, NaNO3实际用量,
KNO3目标配比, KNO3实际配比, KNO3目标用量, KNO3实际用量,
反应温度, 反应压力, 反应时间, 实际产量, 产出率, 质量等级, 操作员, 备注
```

#### 修改后的模板列（新版本）
```
记录编码, 项目ID, 日期, 班次, 硝酸钠(t), 硝酸钾(t), 
硝酸钠：硝酸钾, 总计化盐(t), 熔盐液位(m), 熔盐温度(℃), 
天然气耗量(Nm³), 用电量(KWh), 人数, 记录人, 备注
```

### 2. 前端表格列对比

| 前端表格列标题 | 模板列标题 | 数据类型 | 单位 | 说明 |
|---------------|-----------|----------|------|------|
| 记录编码 | 记录编码 | string | - | 唯一标识 |
| 项目ID | 项目ID | number | - | 项目编号 |
| 日期 | 日期 | string | YYYY-MM-DD | 记录日期 |
| 班次 | 班次 | number | 1/2 | 1-白班, 2-夜班 |
| 硝酸钠(t) | 硝酸钠(t) | number | 吨 | 硝酸钠用量 |
| 硝酸钾(t) | 硝酸钾(t) | number | 吨 | 硝酸钾用量 |
| 硝酸钠：硝酸钾 | 硝酸钠：硝酸钾 | string | x.x:x.x | 配比格式 |
| 总计化盐(t) | 总计化盐(t) | number | 吨 | 总重量 |
| 熔盐液位(m) | 熔盐液位(m) | number | 米 | 液位高度 |
| 熔盐温度(℃) | 熔盐温度(℃) | number | 摄氏度 | 温度值 |
| 天然气耗量(Nm³) | 天然气耗量(Nm³) | number | 标准立方米 | 气体消耗 |
| 用电量(KWh) | 用电量(KWh) | number | 千瓦时 | 电力消耗 |
| 人数 | 人数 | number | 人 | 操作人员数量 |
| 记录人 | 记录人 | string | - | 记录员姓名 |

### 3. 示例数据优化

#### 示例数据1（正常配比）
```json
{
  "记录编码": "BIN_1733097600_001",
  "项目ID": 101,
  "日期": "2024-12-01",
  "班次": 1,
  "硝酸钠(t)": 3.60,
  "硝酸钾(t)": 2.40,
  "硝酸钠：硝酸钾": "6.0:4.0",
  "总计化盐(t)": 6.00,
  "熔盐液位(m)": 2.5,
  "熔盐温度(℃)": 565,
  "天然气耗量(Nm³)": 1200,
  "用电量(KWh)": 850,
  "人数": 8,
  "记录人": "张三",
  "备注": "正常生产"
}
```

#### 示例数据2（边界值配比）
```json
{
  "记录编码": "BIN_1733097600_002",
  "项目ID": 102,
  "日期": "2024-12-01",
  "班次": 2,
  "硝酸钠(t)": 3.58,
  "硝酸钾(t)": 2.42,
  "硝酸钠：硝酸钾": "5.9:4.1",
  "总计化盐(t)": 6.00,
  "熔盐液位(m)": 2.3,
  "熔盐温度(℃)": 570,
  "天然气耗量(Nm³)": 1180,
  "用电量(KWh)": 820,
  "人数": 6,
  "记录人": "李四",
  "备注": "夜班生产"
}
```

## 技术实现

### 1. 模板生成逻辑

**文件位置**: `src/views/erp/saltprocess/records/binary/components/ImportDialog.vue`

**关键方法**: `downloadTemplate()`

```typescript
const downloadTemplate = () => {
  // 创建模板数据 - 与前端表格列结构完全一致
  const templateData = [
    {
      '记录编码': 'BIN_1733097600_001',
      '项目ID': 101,
      '日期': '2024-12-01',
      '班次': 1,
      '硝酸钠(t)': 3.60,
      '硝酸钾(t)': 2.40,
      '硝酸钠：硝酸钾': '6.0:4.0',
      '总计化盐(t)': 6.00,
      '熔盐液位(m)': 2.5,
      '熔盐温度(℃)': 565,
      '天然气耗量(Nm³)': 1200,
      '用电量(KWh)': 850,
      '人数': 8,
      '记录人': '张三',
      '备注': '正常生产'
    },
    // ... 第二行示例数据
  ];

  // 创建工作簿并设置列宽
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '二元化盐记录模板');

  // 设置列宽以提高可读性
  const colWidths = [
    { wch: 18 }, // 记录编码
    { wch: 8 },  // 项目ID
    { wch: 12 }, // 日期
    // ... 其他列宽设置
  ];
  ws['!cols'] = colWidths;

  // 下载文件
  XLSX.writeFile(wb, '二元化盐记录导入模板.xlsx');
  ElMessage.success('模板下载成功');
};
```

### 2. 数据解析逻辑

**新增方法**: `convertStandardTemplateToBinaryRecords()`

```typescript
const convertStandardTemplateToBinaryRecords = (data: any[]): BinaryRecordForm[] => {
  return data.map((item: any, index: number) => {
    // 解析配比字符串 "6.0:4.0" -> [6.0, 4.0]
    const parseRatio = (ratioStr: string) => {
      if (!ratioStr || typeof ratioStr !== 'string') return [6.0, 4.0];
      const parts = ratioStr.split(':');
      if (parts.length !== 2) return [6.0, 4.0];
      return [parseFloat(parts[0]) || 6.0, parseFloat(parts[1]) || 4.0];
    };

    const [nano3Ratio, kno3Ratio] = parseRatio(item['硝酸钠：硝酸钾']);

    return {
      recordCode: item['记录编码'] || `BIN_${Date.now()}_${String(index + 1).padStart(3, '0')}`,
      projectId: parseInt(item['项目ID']) || 101,
      recordDate: item['日期'] || now.toISOString().split('T')[0],
      shift: parseInt(item['班次']) || 1,
      
      // 重量数据：吨转换为kg（后端存储单位）
      nano3ActualWeight: (parseFloat(item['硝酸钠(t)']) || 0) * 1000,
      kno3ActualWeight: (parseFloat(item['硝酸钾(t)']) || 0) * 1000,
      
      // 工艺参数
      moltenSaltLevel: parseFloat(item['熔盐液位(m)']) || 2.5,
      moltenSaltTemperature: parseFloat(item['熔盐温度(℃)']) || 565,
      gasConsumption: parseFloat(item['天然气耗量(Nm³)']) || 1200,
      powerConsumption: parseFloat(item['用电量(KWh)']) || 850,
      staffCount: parseInt(item['人数']) || 8,
      recorderName: item['记录人'] || '系统导入',
      
      // 其他必要字段...
      remarks: item['备注'] || `从标准模板导入 - 硝酸钠${item['硝酸钠(t)']}吨, 硝酸钾${item['硝酸钾(t)']}吨, 人数${item['人数']}人`
    } as BinaryRecordForm;
  });
};
```

### 3. 智能解析逻辑

**增强的解析方法**: `parseExcelFile()`

```typescript
const parseExcelFile = async (file: File) => {
  try {
    // 1. 直接解析Excel文件
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 2. 检查是否为标准模板格式
    const firstRow = jsonData[0] as any;
    const isStandardTemplate = firstRow.hasOwnProperty('记录编码') && 
                              firstRow.hasOwnProperty('项目ID') && 
                              firstRow.hasOwnProperty('硝酸钠(t)') && 
                              firstRow.hasOwnProperty('硝酸钾(t)');

    let binaryRecords: BinaryRecordForm[];

    if (isStandardTemplate) {
      // 3a. 使用标准模板解析
      binaryRecords = convertStandardTemplateToBinaryRecords(jsonData);
      ElMessage.success(`成功解析标准模板 ${binaryRecords.length} 条记录`);
    } else {
      // 3b. 尝试使用原有的ExcelParser解析（兼容旧格式）
      // ... 原有解析逻辑
    }

    previewData.value = binaryRecords;
  } catch (error) {
    ElMessage.error(`文件解析失败: ${error}`);
  }
};
```

## 数据格式规范

### 1. 单位统一

| 字段 | 前端显示单位 | 后端存储单位 | 转换规则 |
|------|-------------|-------------|----------|
| 硝酸钠重量 | 吨(t) | 千克(kg) | 显示值 × 1000 |
| 硝酸钾重量 | 吨(t) | 千克(kg) | 显示值 × 1000 |
| 总计化盐 | 吨(t) | 千克(kg) | 显示值 × 1000 |
| 熔盐液位 | 米(m) | 米(m) | 无转换 |
| 熔盐温度 | 摄氏度(℃) | 摄氏度(℃) | 无转换 |
| 天然气耗量 | 标准立方米(Nm³) | 标准立方米(Nm³) | 无转换 |
| 用电量 | 千瓦时(KWh) | 千瓦时(KWh) | 无转换 |

### 2. 配比格式

- **格式**: "x.x:x.x" (如: "6.0:4.0")
- **含义**: 硝酸钠比例:硝酸钾比例
- **标准配比**: 6:4 (60%:40%)
- **偏差范围**: ±5% 为正常范围

### 3. 班次编码

- **1**: 白班 (08:00-20:00)
- **2**: 夜班 (20:00-08:00)

## 验证测试

### 1. 模板下载测试

**测试步骤**:
1. 访问二元化盐记录管理页面
2. 点击"导入化盐记录"按钮
3. 在导入对话框中点击"下载模板"按钮
4. 检查下载的Excel文件

**预期结果**:
- ✅ 文件名为"二元化盐记录导入模板.xlsx"
- ✅ 包含15列，与前端表格列完全一致
- ✅ 包含2行示例数据
- ✅ 列宽设置合理，内容清晰可读

### 2. 数据导入测试

**测试步骤**:
1. 下载标准模板
2. 填写测试数据
3. 上传填写好的Excel文件
4. 检查数据预览
5. 执行导入操作

**预期结果**:
- ✅ 正确识别为标准模板格式
- ✅ 数据解析准确，单位转换正确
- ✅ 配比格式解析正确
- ✅ 预览数据与前端表格显示一致

### 3. 兼容性测试

**测试场景**:
- 标准模板格式文件
- 旧版本模板格式文件
- 其他Excel格式文件

**预期结果**:
- ✅ 标准模板：使用新解析逻辑
- ✅ 旧版本模板：使用原有ExcelParser解析
- ✅ 其他格式：提示格式不支持

## 优化效果

### 1. 用户体验提升

- **模板一致性**: 模板列与前端表格完全一致，减少用户困惑
- **数据准确性**: 单位统一，减少数据填写错误
- **操作便捷性**: 提供完整示例数据，用户可直接参考

### 2. 开发维护性

- **代码清晰**: 新增专门的标准模板解析方法
- **向下兼容**: 保留原有解析逻辑，确保兼容性
- **扩展性**: 易于添加新的模板格式支持

### 3. 数据质量

- **格式规范**: 统一的数据格式和单位
- **验证完整**: 完善的数据验证和错误提示
- **业务准确**: 符合实际业务场景的示例数据

## 后续优化建议

1. **模板版本管理**: 考虑添加模板版本标识
2. **多语言支持**: 支持英文等其他语言的模板
3. **自定义模板**: 允许用户自定义模板格式
4. **批量验证**: 增强批量数据验证功能
5. **导入历史**: 记录导入历史和数据来源
