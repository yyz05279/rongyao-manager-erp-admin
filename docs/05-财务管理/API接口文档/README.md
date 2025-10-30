# 财务管理模块API接口规范

## 项目概述

本项目为基于RuoYi-Vue-Plus架构的财务管理模块API接口规范设计，包含付款单和收款单的完整业务流程管理。

## 技术架构

- **前端框架**: Vue 3 + TypeScript + Element Plus
- **HTTP客户端**: Axios
- **API风格**: RESTful
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 文件结构

```
docs/api/finance/
├── README.md                    # 项目说明文档
├── openapi-spec.yaml           # OpenAPI 3.0 规范文档
├── api-usage-guide.md          # API使用指南
├── common-types.ts             # 通用数据类型定义
├── payment-api-types.ts        # 付款单类型定义
├── payment-api.ts              # 付款单API接口
├── receipt-api-types.ts        # 收款单类型定义
├── receipt-api.ts              # 收款单API接口
└── mock-data.ts                # 模拟数据
```

## 核心功能

### 付款单管理
- ✅ 付款单CRUD操作
- ✅ 付款单审批流程
- ✅ 付款单状态管理
- ✅ 付款确认功能
- ✅ 批量操作支持
- ✅ 统计分析功能
- ✅ 导入导出功能
- ✅ 审批历史记录

### 收款单管理
- ✅ 收款单CRUD操作
- ✅ 收款单审批流程
- ✅ 收款单状态管理
- ✅ 收款确认功能
- ✅ 银行对账功能
- ✅ 批量操作支持
- ✅ 统计分析功能
- ✅ 导入导出功能

## API接口列表

### 付款单接口 (Payment APIs)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/erp/finance/payment/list` | 查询付款单列表 |
| GET | `/erp/finance/payment/{id}` | 查询付款单详情 |
| GET | `/erp/finance/payment/no/{no}` | 根据编号查询付款单 |
| POST | `/erp/finance/payment` | 新增付款单 |
| PUT | `/erp/finance/payment` | 修改付款单 |
| DELETE | `/erp/finance/payment/{id}` | 删除付款单 |
| POST | `/erp/finance/payment/{id}/submit` | 提交审批 |
| POST | `/erp/finance/payment/approve` | 审批付款单 |
| POST | `/erp/finance/payment/{id}/withdraw` | 撤回付款单 |
| POST | `/erp/finance/payment/{id}/cancel` | 取消付款单 |
| POST | `/erp/finance/payment/{id}/confirm` | 确认付款 |
| POST | `/erp/finance/payment/{id}/copy` | 复制付款单 |
| GET | `/erp/finance/payment/statistics` | 获取统计信息 |
| POST | `/erp/finance/payment/export` | 导出付款单 |
| POST | `/erp/finance/payment/import` | 导入付款单 |
| GET | `/erp/finance/payment/generateNo` | 生成付款单编号 |
| POST | `/erp/finance/payment/batch` | 批量操作 |

### 收款单接口 (Receipt APIs)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/erp/finance/receipt/list` | 查询收款单列表 |
| GET | `/erp/finance/receipt/{id}` | 查询收款单详情 |
| GET | `/erp/finance/receipt/no/{no}` | 根据编号查询收款单 |
| POST | `/erp/finance/receipt` | 新增收款单 |
| PUT | `/erp/finance/receipt` | 修改收款单 |
| DELETE | `/erp/finance/receipt/{id}` | 删除收款单 |
| POST | `/erp/finance/receipt/{id}/submit` | 提交审批 |
| POST | `/erp/finance/receipt/approve` | 审批收款单 |
| POST | `/erp/finance/receipt/{id}/withdraw` | 撤回收款单 |
| POST | `/erp/finance/receipt/{id}/cancel` | 取消收款单 |
| POST | `/erp/finance/receipt/{id}/confirm` | 确认收款 |
| POST | `/erp/finance/receipt/{id}/copy` | 复制收款单 |
| POST | `/erp/finance/receipt/reconcile` | 收款单对账 |
| GET | `/erp/finance/receipt/statistics` | 获取统计信息 |
| POST | `/erp/finance/receipt/export` | 导出收款单 |
| POST | `/erp/finance/receipt/import` | 导入收款单 |
| GET | `/erp/finance/receipt/generateNo` | 生成收款单编号 |
| POST | `/erp/finance/receipt/batch` | 批量操作 |

## 数据模型

### 核心实体
- **PaymentVO**: 付款单视图对象
- **PaymentForm**: 付款单表单对象
- **PaymentQuery**: 付款单查询对象
- **ReceiptVO**: 收款单视图对象
- **ReceiptForm**: 收款单表单对象
- **ReceiptQuery**: 收款单查询对象

### 枚举类型
- **PaymentStatus**: 付款单状态
- **PaymentMethod**: 付款方式
- **ReceiptStatus**: 收款单状态
- **ReceiptMethod**: 收款方式

### 通用类型
- **BaseEntity**: 基础实体
- **PageQuery**: 分页查询
- **ApiResponse**: 统一响应格式
- **PageResult**: 分页响应结果

## 业务流程

### 付款单业务流程
```
创建付款单 → 草稿状态 → 提交审批 → 待审批状态 → 审批通过 → 已审批状态 → 确认付款 → 已付款状态
                ↓           ↓                    ↓
              保存草稿    撤回/取消           审批拒绝 → 已拒绝状态
```

### 收款单业务流程
```
创建收款单 → 草稿状态 → 提交审批 → 待审批状态 → 审批通过 → 已审批状态 → 确认收款 → 已收款状态 → 银行对账
                ↓           ↓                    ↓
              保存草稿    撤回/取消           审批拒绝 → 已拒绝状态
```

## 特色功能

### 1. 完整的审批流程
- 支持多级审批
- 审批历史记录
- 审批意见管理
- 撤回和取消功能

### 2. 灵活的查询功能
- 多条件组合查询
- 时间范围查询
- 金额范围查询
- 关键字模糊搜索
- 自定义排序

### 3. 强大的统计分析
- 按状态统计
- 按时间统计
- 金额汇总分析
- 图表数据支持

### 4. 便捷的批量操作
- 批量审批
- 批量删除
- 批量导出
- 批量状态变更

### 5. 完善的数据管理
- 导入导出功能
- 模板下载
- 数据验证
- 错误处理

## 安全特性

### 1. 认证授权
- JWT Token认证
- 权限控制
- 操作日志记录

### 2. 数据验证
- 参数校验
- 业务规则验证
- 状态流转控制

### 3. 错误处理
- 统一错误码
- 详细错误信息
- 异常日志记录

## 使用说明

### 1. 快速开始
1. 查看 `openapi-spec.yaml` 了解完整API规范
2. 阅读 `api-usage-guide.md` 学习接口使用方法
3. 参考 `mock-data.ts` 了解数据结构

### 2. 集成步骤
1. 导入类型定义文件
2. 配置HTTP客户端
3. 设置认证信息
4. 调用相应接口

### 3. 示例代码
```typescript
import { listPayment, addPayment } from '@/api/finance/payment';

// 查询付款单列表
const payments = await listPayment({ pageNum: 1, pageSize: 10 });

// 创建付款单
const result = await addPayment({
  supplierId: 1,
  accountId: 1,
  totalAmount: 100000.00,
  // ... 其他字段
});
```

## 版本信息

- **当前版本**: v1.0.0
- **最后更新**: 2024-01-25
- **兼容性**: RuoYi-Vue-Plus 5.1.2+

## 联系方式

如有问题或建议，请联系开发团队：
- 邮箱: dev@example.com
- 文档: 查看项目文档
- 问题反馈: 提交Issue

## 许可证

本项目采用 MIT 许可证，详情请查看 LICENSE 文件。
