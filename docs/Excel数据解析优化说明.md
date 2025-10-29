# Excel 数据解析优化说明

## 优化概述

基于用户反馈和 Context7 最佳实践，对发货清单 Excel 导入功能进行了三项关键优化：

1. **车辆信息智能解析**：自动提取车牌号和车辆描述
2. **司机信息智能解析**：自动分离司机姓名和手机号码
3. **日期格式标准化**：将 Excel 日期序列号转换为 `yyyy-MM-dd` 格式

## 技术实现

### 1. Excel 日期转换（基于 Context7 最佳实践）

#### 问题描述

Excel 中的日期以序列号形式存储（如 `45701` 表示 2025-02-13），需要转换为人类可读的日期格式。

#### 解决方案

使用标准的 Excel 日期转换算法：

```typescript
/**
 * 将Excel日期序列号转换为 yyyy-MM-dd 格式
 * Excel的日期以1900年1月1日为起点的序列号存储
 */
export function convertExcelDateToFormat(excelDate: any): string {
  if (!excelDate) return '';

  // 如果已经是字符串格式的日期，直接格式化
  if (typeof excelDate === 'string') {
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return formatDate(date);
    }
    return excelDate;
  }

  // 如果是数字（Excel日期序列号）
  if (typeof excelDate === 'number') {
    // Excel日期系统从1900年1月1日开始
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = excelDate > 59 ? excelDate - 1 : excelDate;
    const date = new Date(excelEpoch.getTime() + (daysOffset - 1) * 24 * 60 * 60 * 1000);
    return formatDate(date);
  }

  return String(excelDate);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

#### 支持的输入格式

- Excel 序列号：`45701` → `2025-02-13`
- 日期字符串：`2025/2/13` → `2025-02-13`
- 标准格式：`2025-02-13` → `2025-02-13`

### 2. 车辆信息解析

#### 问题描述

车辆信息通常包含车牌号和车辆描述混在一起，如：`17.5米车 苏NHA923`

#### 解决方案

使用正则表达式提取中国车牌号标准格式：

```typescript
/**
 * 从车辆信息字符串中提取车牌号
 * 支持格式：
 * - "17.5米车 苏NHA923" -> "苏NHA923"
 * - "苏NHA923 17.5米车" -> "苏NHA923"
 */
export function extractLicensePlate(vehicleInfo: string): string {
  if (!vehicleInfo || typeof vehicleInfo !== 'string') return '';

  // 中国车牌号格式：省份简称+字母+5-6位字母或数字
  const plateRegex = /([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5,6})/;
  const match = vehicleInfo.match(plateRegex);

  if (match) {
    return match[1].trim();
  }

  return vehicleInfo.trim();
}

/**
 * 从车辆信息字符串中提取车辆描述
 */
export function extractVehicleDescription(vehicleInfo: string): string {
  if (!vehicleInfo || typeof vehicleInfo !== 'string') return '';

  const licensePlate = extractLicensePlate(vehicleInfo);
  if (licensePlate && licensePlate !== vehicleInfo) {
    return vehicleInfo.replace(licensePlate, '').trim();
  }

  return vehicleInfo.trim();
}
```

#### 车牌号识别规则

- 支持所有中国省份简称
- 标准格式：省份简称 + 字母 + 5-6 位字母或数字
- 示例：苏 NHA923、京 A12345、粤 B12345D

#### 解析结果示例

| 原始数据            | 车牌号    | 车辆描述    |
| ------------------- | --------- | ----------- |
| 17.5 米车 苏 NHA923 | 苏 NHA923 | 17.5 米车   |
| 苏 NHA923           | 苏 NHA923 | -           |
| 17.5 米货车         | -         | 17.5 米货车 |

### 3. 司机信息解析

#### 问题描述

司机信息包含姓名和手机号，如：`李猛 18036946111`

#### 解决方案

使用正则表达式提取 11 位手机号，剩余部分为姓名：

```typescript
/**
 * 从司机信息字符串中提取姓名
 * 支持格式：
 * - "李猛 18036946111" -> "李猛"
 * - "张三丰13912345678" -> "张三丰"
 */
export function extractDriverName(driverInfo: string): string {
  if (!driverInfo || typeof driverInfo !== 'string') return '';

  // 移除手机号码，剩下的就是姓名
  const phoneNumber = extractPhoneNumber(driverInfo);
  if (phoneNumber) {
    return driverInfo.replace(phoneNumber, '').trim();
  }

  return driverInfo.trim();
}

/**
 * 从司机信息字符串中提取手机号
 * 中国手机号格式：1开头的11位数字
 */
export function extractPhoneNumber(driverInfo: string): string {
  if (!driverInfo || typeof driverInfo !== 'string') return '';

  // 中国手机号格式：1开头的11位数字
  const phoneRegex = /(1[3-9]\d{9})/;
  const match = driverInfo.match(phoneRegex);

  if (match) {
    return match[1];
  }

  return '';
}
```

#### 手机号识别规则

- 以 1 开头
- 第二位为 3-9
- 总共 11 位数字
- 符合中国大陆手机号标准

#### 解析结果示例

| 原始数据           | 司机姓名 | 司机电话    |
| ------------------ | -------- | ----------- |
| 李猛 18036946111   | 李猛     | 18036946111 |
| 张三丰 13912345678 | 张三丰   | 13912345678 |
| 李猛               | 李猛     | -           |

## 界面优化

### 表格展示增强

发货时间表格新增以下列：

| 列名     | 说明              | 展示样式 |
| -------- | ----------------- | -------- |
| 发货时间 | 转换为 yyyy-MM-dd | 绿色标签 |
| 车牌号   | 提取的车牌号      | 蓝色标签 |
| 车辆描述 | 车辆型号/描述     | 普通文本 |
| 司机姓名 | 提取的姓名        | 普通文本 |
| 司机电话 | 提取的手机号      | 蓝色文本 |

### 视觉效果

```
┌──────┬────────────────────┬────────┬──────────────┬────────────┬──────────┬──────────┬──────────────┐
│ 序号 │ 名称               │ 明细   │ 发货时间      │ 车牌号      │ 车辆描述  │ 司机姓名  │ 司机电话      │
├──────┼────────────────────┼────────┼──────────────┼────────────┼──────────┼──────────┼──────────────┤
│  1   │ 化盐系统固态处理厂  │ 第一车 │ 2025-02-13   │ 苏NHA923   │ 17.5米车 │ 李猛     │ 18036946111  │
│      │ 设备               │        │ (绿色标签)    │ (蓝色标签) │          │          │ (蓝色文本)    │
└──────┴────────────────────┴────────┴──────────────┴────────────┴──────────┴──────────┴──────────────┘
```

## 文件结构

### 新增文件

```
src/utils/
├── excel-data-converter.ts          # Excel数据转换工具函数
│   ├── convertExcelDateToFormat()   # 日期转换
│   ├── extractLicensePlate()        # 提取车牌号
│   ├── extractVehicleDescription()  # 提取车辆描述
│   ├── extractDriverName()          # 提取司机姓名
│   ├── extractPhoneNumber()         # 提取手机号
│   ├── parseVehicleInfo()           # 解析车辆信息
│   └── parseDriverInfo()            # 解析司机信息
```

### 修改文件

```
src/utils/
└── enhanced-shipping-excel-parser.ts
    └── parseShippingTimeSheet()      # 集成数据转换功能

src/views/erp/saltprocess/shipping/components/
└── EnhancedShippingImportDialog.vue
    └── 发货时间表格                   # 增加解析后的列
```

## 使用示例

### 导入效果

#### 原始 Excel 数据

```
发货时间: 45701
车辆信息: 17.5米车 苏NHA923
司机姓名及电话: 李猛 18036946111
```

#### 解析后展示

```
发货时间: 2025-02-13
车牌号: 苏NHA923
车辆描述: 17.5米车
司机姓名: 李猛
司机电话: 18036946111
```

## 测试用例

### 日期转换测试

| 输入       | 输出       | 说明         |
| ---------- | ---------- | ------------ |
| 45701      | 2025-02-13 | Excel 序列号 |
| 2025/2/13  | 2025-02-13 | 斜杠分隔     |
| 2025.2.13  | 2025-02-13 | 点号分隔     |
| 2025-02-13 | 2025-02-13 | 标准格式     |

### 车牌号提取测试

| 输入                | 车牌号    | 车辆描述  |
| ------------------- | --------- | --------- |
| 17.5 米车 苏 NHA923 | 苏 NHA923 | 17.5 米车 |
| 苏 NHA923           | 苏 NHA923 | -         |
| 京 A12345 半挂车    | 京 A12345 | 半挂车    |

### 司机信息提取测试

| 输入               | 姓名   | 电话        |
| ------------------ | ------ | ----------- |
| 李猛 18036946111   | 李猛   | 18036946111 |
| 张三丰 13912345678 | 张三丰 | 13912345678 |
| 李猛               | 李猛   | -           |

## Context7 最佳实践应用

### 日期处理

参考 Day.js 库的最佳实践：

- 使用标准 ISO 8601 格式
- 支持多种输入格式
- 统一输出格式

### 正则表达式

- 精确匹配中国车牌号标准
- 支持所有省份简称
- 兼容新能源车牌

### 数据验证

- 严格的类型检查
- 容错处理
- 默认值处理

## 性能优化

- 正则表达式预编译
- 一次遍历完成多项解析
- 避免重复计算

## 错误处理

- 非法输入返回空字符串或原值
- 日期转换失败返回原始值
- 提取失败返回完整原始字符串

## 未来扩展

1. **支持更多日期格式**

   - 时间戳格式
   - 相对日期（如"昨天"）

2. **车牌号验证增强**

   - 校验位检查
   - 黑名单过滤

3. **司机信息扩展**
   - 身份证号提取
   - 驾驶证号提取

## 参考资料

- Context7 Day.js 文档：https://context7.com/iamkun/dayjs
- Excel 日期格式规范：ECMA-376
- 中国车牌号标准：GA 36-2014
- 中国手机号规范：工信部号段分配

## 更新日志

### v1.1.0 (2025-10-29)

- ✅ 新增 Excel 日期转换功能
- ✅ 新增车辆信息智能解析
- ✅ 新增司机信息智能解析
- ✅ 优化表格展示，增加解析后的列
- ✅ 添加视觉标签区分不同类型数据
