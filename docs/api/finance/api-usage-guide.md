# 财务管理模块API接口使用指南

## 概述

本文档提供财务管理模块付款单和收款单API接口的完整使用指南，基于RuoYi-Vue-Plus架构设计。

## 技术规范

### 认证方式
- **认证类型**: Bearer Token (JWT)
- **请求头**: `Authorization: Bearer {token}`
- **客户端ID**: 通过环境变量 `VITE_APP_CLIENT_ID` 配置

### 请求格式
- **Content-Type**: `application/json;charset=utf-8`
- **编码**: UTF-8
- **时间格式**: `yyyy-MM-dd HH:mm:ss`
- **数字格式**: 金额保留2位小数

### 响应格式
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "timestamp": 1640995200000
}
```

### HTTP状态码
- `200` - 操作成功
- `400` - 参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误

## 付款单API接口

### 1. 查询付款单列表

**接口地址**: `GET /erp/finance/payment/list`

**请求参数**:
```javascript
{
  pageNum: 1,           // 页码
  pageSize: 10,         // 每页数量
  no: "FK202401001",    // 付款单编号
  status: 1,            // 状态：0-草稿，1-待审批，2-已审批，3-已拒绝，4-已付款，5-已取消
  supplierId: 1,        // 供应商ID
  supplierName: "北京科技", // 供应商名称（模糊查询）
  paymentTimeRange: ["2024-01-01 00:00:00", "2024-01-31 23:59:59"], // 付款时间范围
  amountRange: [1000, 100000], // 金额范围
  keyword: "设备采购"    // 关键字搜索
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "rows": [
      {
        "id": 1,
        "no": "FK202401001",
        "status": 4,
        "supplierName": "北京科技有限公司",
        "accountName": "中国银行基本户",
        "paymentMethod": "BANK_TRANSFER",
        "totalAmount": 150000.00,
        "paidAmount": 150000.00,
        "paymentTime": "2024-01-15 14:30:00",
        "createByName": "采购员小王",
        "createTime": "2024-01-10 09:00:00"
      }
    ],
    "total": 25,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 3
  }
}
```

### 2. 新增付款单

**接口地址**: `POST /erp/finance/payment`

**请求体**:
```json
{
  "supplierId": 1,
  "accountId": 1,
  "paymentMethod": "BANK_TRANSFER",
  "paymentTime": "2024-01-20 10:00:00",
  "totalAmount": 100000.00,
  "currency": "CNY",
  "invoiceNo": "INV202401003",
  "contractNo": "CT202401003",
  "businessType": "设备采购",
  "urgencyLevel": 2,
  "remark": "设备采购款",
  "items": [
    {
      "subjectCode": "1001",
      "subjectName": "原材料",
      "amount": 100000.00,
      "remark": "生产设备"
    }
  ]
}
```

### 3. 审批付款单

**接口地址**: `POST /erp/finance/payment/approve`

**请求体**:
```json
{
  "id": 1,
  "action": "APPROVE",  // APPROVE-通过，REJECT-拒绝
  "comment": "审批通过，按时支付"
}
```

## 收款单API接口

收款单API接口与付款单类似，主要区别：
- 基础路径为 `/erp/finance/receipt`
- 使用客户ID (`customerId`) 替代供应商ID
- 状态含义相同但业务流程针对收款

### 主要接口列表

1. **查询收款单列表**: `GET /erp/finance/receipt/list`
2. **查询收款单详情**: `GET /erp/finance/receipt/{id}`
3. **新增收款单**: `POST /erp/finance/receipt`
4. **修改收款单**: `PUT /erp/finance/receipt`
5. **删除收款单**: `DELETE /erp/finance/receipt/{id}`
6. **提交审批**: `POST /erp/finance/receipt/{id}/submit`
7. **审批收款单**: `POST /erp/finance/receipt/approve`
8. **确认收款**: `POST /erp/finance/receipt/{id}/confirm`
9. **收款单对账**: `POST /erp/finance/receipt/reconcile`
10. **获取统计信息**: `GET /erp/finance/receipt/statistics`

## 业务流程

### 付款单流程
1. **创建** → 草稿状态 (status: 0)
2. **提交审批** → 待审批状态 (status: 1)
3. **审批通过** → 已审批状态 (status: 2)
4. **确认付款** → 已付款状态 (status: 4)

### 收款单流程
1. **创建** → 草稿状态 (status: 0)
2. **提交审批** → 待审批状态 (status: 1)
3. **审批通过** → 已审批状态 (status: 2)
4. **确认收款** → 已收款状态 (status: 4)
5. **银行对账** → 完成对账

## 错误处理

### 常见错误码
- `600001` - 单据不存在
- `600002` - 单据状态不允许此操作
- `600003` - 金额不能为负数
- `600004` - 供应商/客户不存在
- `600005` - 结算账户不存在
- `600006` - 审批权限不足

### 错误响应示例
```json
{
  "code": 600002,
  "msg": "单据状态不允许此操作",
  "data": null,
  "timestamp": 1640995200000
}
```

## 最佳实践

1. **分页查询**: 建议每页数量不超过100条
2. **金额精度**: 统一使用2位小数
3. **时间格式**: 统一使用 `yyyy-MM-dd HH:mm:ss` 格式
4. **状态检查**: 操作前先检查单据状态
5. **权限验证**: 确保用户有相应的操作权限
6. **数据验证**: 提交前进行客户端数据验证
7. **异常处理**: 妥善处理网络异常和业务异常

## 接口调用示例

### JavaScript/TypeScript 示例

```typescript
import { listPayment, addPayment, approvePayment } from '@/api/finance/payment';

// 查询付款单列表
const queryPayments = async () => {
  try {
    const response = await listPayment({
      pageNum: 1,
      pageSize: 10,
      status: 1
    });
    console.log('付款单列表:', response.data);
  } catch (error) {
    console.error('查询失败:', error);
  }
};

// 新增付款单
const createPayment = async () => {
  try {
    const paymentData = {
      supplierId: 1,
      accountId: 1,
      paymentMethod: 'BANK_TRANSFER',
      paymentTime: '2024-01-20 10:00:00',
      totalAmount: 100000.00,
      items: [
        {
          subjectCode: '1001',
          subjectName: '原材料',
          amount: 100000.00
        }
      ]
    };
    const response = await addPayment(paymentData);
    console.log('创建成功:', response);
  } catch (error) {
    console.error('创建失败:', error);
  }
};

// 审批付款单
const approvePaymentOrder = async (id: number) => {
  try {
    const approvalData = {
      id: id,
      action: 'APPROVE',
      comment: '审批通过'
    };
    const response = await approvePayment(approvalData);
    console.log('审批成功:', response);
  } catch (error) {
    console.error('审批失败:', error);
  }
};
```

## 数据字典

### 付款状态 (PaymentStatus)
- `0` - 草稿
- `1` - 待审批
- `2` - 已审批
- `3` - 已拒绝
- `4` - 已付款
- `5` - 已取消

### 付款方式 (PaymentMethod)
- `CASH` - 现金
- `BANK_TRANSFER` - 银行转账
- `CHECK` - 支票
- `ELECTRONIC` - 电子支付
- `OTHER` - 其他

### 收款状态 (ReceiptStatus)
- `0` - 草稿
- `1` - 待审批
- `2` - 已审批
- `3` - 已拒绝
- `4` - 已收款
- `5` - 已取消

### 收款方式 (ReceiptMethod)
- `CASH` - 现金
- `BANK_TRANSFER` - 银行转账
- `CHECK` - 支票
- `ELECTRONIC` - 电子支付
- `CREDIT_CARD` - 信用卡
- `OTHER` - 其他
