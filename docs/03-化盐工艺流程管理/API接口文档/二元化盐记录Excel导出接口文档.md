# 二元化盐记录Excel导出接口文档

## 概述

本文档描述了海棠ERP系统中二元化盐记录数据的Excel导出功能，基于预定义的Excel模版格式导出数据。

## 接口信息

### 基于模版导出二元化盐记录

**接口地址：** `POST /erp/saltprocess/binary-record/export-template`

**接口描述：** 使用预定义的Excel模版格式导出二元化盐记录数据

**权限要求：** `erp:saltprocess:binary-record:export`

**请求方式：** POST

**Content-Type：** `application/x-www-form-urlencoded` 或 `application/json`

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| taskId | Long | 否 | 任务ID | 1 |
| projectId | Long | 否 | 项目ID | 1 |
| batchNumber | String | 否 | 批次号 | BATCH-001 |
| recordDate | Date | 否 | 记录日期 | 2025-01-14 |
| startDate | Date | 否 | 开始日期 | 2025-01-01 |
| endDate | Date | 否 | 结束日期 | 2025-01-31 |
| shift | Integer | 否 | 班次：1-白班,2-夜班 | 1 |
| operatorId | Long | 否 | 操作员ID | 1 |
| qualityGrade | Integer | 否 | 质量等级 | 1 |
| qualityCheckResult | Integer | 否 | 质检结果 | 1 |

#### 请求示例

```bash
# 导出所有记录
curl -X POST "http://localhost:8081/erp/saltprocess/binary-record/export-template" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d "{}"

# 按日期范围导出
curl -X POST "http://localhost:8081/erp/saltprocess/binary-record/export-template" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"startDate\": \"2025-01-01\",
    \"endDate\": \"2025-01-31\"
  }"

# 按项目和班次导出
curl -X POST "http://localhost:8081/erp/saltprocess/binary-record/export-template" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": 1,
    \"shift\": 1
  }"
```

#### 响应说明

**成功响应：**
- **Content-Type：** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition：** `attachment; filename="二元盐化盐量记录表_20250114_143022.xlsx"`
- **响应体：** Excel文件的二进制数据

**错误响应：**
```json
{
  "code": 500,
  "msg": "导出失败: 没有找到符合条件的数据，请调整查询条件后重试"
}
```

#### 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 参数错误 | 检查请求参数格式和类型 |
| 401 | 未授权 | 检查登录状态和token |
| 403 | 权限不足 | 联系管理员分配导出权限 |
| 500 | 服务器内部错误 | 查看具体错误信息或联系技术支持 |

## Excel模版格式

### 文件结构

导出的Excel文件包含以下结构：

1. **第1行：** 标题 - "江苏联储 项目化盐量记录表"
2. **第2行：** 空行（用于格式美化）
3. **第3行：** 表头（15个字段）
4. **第4行开始：** 数据行
5. **最后一行：** 备注说明

### 字段说明

| 列号 | 字段名 | 数据类型 | 说明 |
|------|--------|----------|------|
| A | 序号 | Integer | 自动生成的序号，从1开始 |
| B | 日期 | Date | 记录日期，格式：yyyy-MM-dd |
| C | 班次（白/夜班） | String | 白班/夜班 |
| D | 硝酸钠（t） | Decimal | 硝酸钠重量，单位：吨 |
| E | 硝酸钾（t） | Decimal | 硝酸钾重量，单位：吨 |
| F | 硝酸钠：硝酸钾 | String | 配比，格式：60.0:40.0 |
| G | 每班化盐量（t） | Decimal | 每班化盐总量，单位：吨 |
| H | 累积化盐量（t） | Decimal | 累积化盐总量，单位：吨 |
| I | 熔盐罐熔盐液位（m） | Decimal | 熔盐液位，单位：米 |
| J | 熔盐罐熔盐温度（℃） | Decimal | 熔盐温度，单位：摄氏度 |
| K | 每班天然气耗量（Nm3） | Decimal | 天然气消耗量，单位：标准立方米 |
| L | 每班用电量(KWh) | Decimal | 用电量，单位：千瓦时 |
| M | 人数 | Integer | 操作人员数量 |
| N | 记录人 | String | 记录人姓名 |
| O | 备注 | String | 备注信息 |

### 计算字段

以下字段由系统自动计算：

1. **序号：** 按导出顺序自动生成
2. **硝酸钠：硝酸钾：** 根据硝酸钠和硝酸钾重量计算配比
3. **每班化盐量：** 硝酸钠重量 + 硝酸钾重量

## 性能和限制

### 导出限制

- **最大导出记录数：** 10,000条
- **文件大小限制：** 约50MB
- **超时时间：** 60秒

### 性能优化

1. **分页查询：** 大数据量时自动分页处理
2. **内存管理：** 流式处理，避免内存溢出
3. **异常处理：** 完善的错误处理和用户友好的错误信息

### 建议

1. **合理设置查询条件：** 避免导出过多数据
2. **分批导出：** 大量数据建议按时间范围分批导出
3. **网络稳定：** 确保网络连接稳定，避免下载中断

## 测试用例

### 测试场景1：正常导出

**请求：**
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "projectId": 1
}
```

**预期结果：** 成功下载Excel文件，包含指定条件的记录

### 测试场景2：无数据导出

**请求：**
```json
{
  "startDate": "2030-01-01",
  "endDate": "2030-01-31"
}
```

**预期结果：** 返回错误信息"没有找到符合条件的数据"

### 测试场景3：大数据量导出

**请求：**
```json
{}
```

**预期结果：** 
- 如果记录数 ≤ 10,000：正常导出
- 如果记录数 > 10,000：返回错误信息提示数据量过大

## 更新日志

### v1.0.0 (2025-01-14)
- 初始版本
- 支持基于模版的Excel导出
- 支持多种查询条件筛选
- 完善的错误处理和性能优化

## 技术实现

### 核心技术栈

- **Excel处理：** EasyExcel
- **模版引擎：** EasyExcel模版填充
- **数据转换：** MapStruct
- **异常处理：** 自定义ServiceException

### 关键类

- **控制器：** `ErpSaltBinaryMakingRecordController`
- **服务层：** `ErpSaltBinaryMakingRecordServiceImpl`
- **导出VO：** `ErpSaltBinaryMakingRecordExportVo`
- **数据转换：** `ErpSaltBinaryMakingRecordExportConvert`

### 模版文件位置

```
haitang-modules/haitang-erp/src/main/resources/excel/二元盐化盐量记录表模版.xlsx
```
