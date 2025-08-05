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
  status: 1,            // 付款状态
  supplierId: 1,        // 供应商ID
  supplierName: "北京科技", // 供应商名称
  paymentTimeRange: ["2024-01-01 00:00:00", "2024-01-31 23:59:59"],
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
        "totalAmount": 150000.00,
        "paymentTime": "2024-01-15 14:30:00",
        "createByName": "采购员小王"
      }
    ],
    "total": 25,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 3
  }
}
```

### 2. 查询付款单详情

**接口地址**: `GET /erp/finance/payment/{id}`

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "no": "FK202401001",
    "status": 4,
    "supplierName": "北京科技有限公司",
    "accountName": "中国银行基本户",
    "paymentMethod": "BANK_TRANSFER",
    "totalAmount": 150000.00,
    "items": [
      {
        "subjectCode": "1001",
        "subjectName": "原材料",
        "amount": 120000.00,
        "remark": "生产设备"
      }
    ]
  }
}
```

### 3. 新增付款单

**接口地址**: `POST /erp/finance/payment`

**请求示例**:
```json
{
  "supplierId": 1,
  "accountId": 1,
  "paymentMethod": "BANK_TRANSFER",
  "paymentTime": "2024-01-20 10:00:00",
  "totalAmount": 100000.00,
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

### 4. 提交审批

**接口地址**: `POST /erp/finance/payment/{id}/submit`

### 5. 审批付款单

**接口地址**: `POST /erp/finance/payment/approve`

**请求示例**:
```json
{
  "id": 1,
  "action": "APPROVE",
  "comment": "审批通过，按时支付"
}
```

### 6. 确认付款

**接口地址**: `POST /erp/finance/payment/{id}/confirm`

**请求示例**:
```json
{
  "actualAmount": 150000.00,
  "paymentDate": "2024-01-15 14:30:00"
}
```

## 收款单API接口

### 1. 查询收款单列表

**接口地址**: `GET /erp/finance/receipt/list`

**请求参数**:
```javascript
{
  pageNum: 1,
  pageSize: 10,
  no: "SK202401001",
  status: 4,
  customerId: 1,
  customerName: "华为技术",
  receiptTimeRange: ["2024-01-01 00:00:00", "2024-01-31 23:59:59"]
}
```

### 2. 新增收款单

**接口地址**: `POST /erp/finance/receipt`

**请求示例**:
```json
{
  "customerId": 1,
  "accountId": 1,
  "receiptMethod": "BANK_TRANSFER",
  "receiptTime": "2024-01-12 10:30:00",
  "totalAmount": 500000.00,
  "businessType": "产品销售",
  "items": [
    {
      "subjectCode": "4001",
      "subjectName": "主营业务收入",
      "amount": 500000.00,
      "remark": "产品销售收入"
    }
  ]
}
```

## 业务状态说明

### 付款单状态
- `0` - 草稿：刚创建，可编辑
- `1` - 待审批：已提交，等待审批
- `2` - 已审批：审批通过，可付款
- `3` - 已拒绝：审批被拒绝
- `4` - 已付款：付款完成
- `5` - 已取消：单据取消

### 收款单状态
- `0` - 草稿：刚创建，可编辑
- `1` - 待审批：已提交，等待审批
- `2` - 已审批：审批通过，等待收款
- `3` - 已拒绝：审批被拒绝
- `4` - 已收款：收款完成
- `5` - 已取消：单据取消

## 业务流程

### 付款单流程
1. **创建** → 草稿状态
2. **提交审批** → 待审批状态
3. **审批通过** → 已审批状态
4. **确认付款** → 已付款状态

### 收款单流程
1. **创建** → 草稿状态
2. **提交审批** → 待审批状态
3. **审批通过** → 已审批状态
4. **确认收款** → 已收款状态

## 错误处理

### 常见错误码
- `600001` - 单据不存在
- `600002` - 单据状态不允许此操作
- `600003` - 供应商/客户不存在
- `600004` - 结算账户不存在
- `600005` - 金额不能为零或负数
- `600006` - 明细项不能为空

### 错误响应示例
```json
{
  "code": 600002,
  "msg": "单据状态不允许此操作",
  "data": null,
  "timestamp": 1640995200000
}
```

## 权限控制

### 功能权限
- `finance:payment:list` - 查看付款单列表
- `finance:payment:add` - 新增付款单
- `finance:payment:edit` - 编辑付款单
- `finance:payment:remove` - 删除付款单
- `finance:payment:approve` - 审批付款单
- `finance:receipt:list` - 查看收款单列表
- `finance:receipt:add` - 新增收款单
- `finance:receipt:edit` - 编辑收款单
- `finance:receipt:remove` - 删除收款单
- `finance:receipt:approve` - 审批收款单

### 数据权限
- 创建人只能查看自己创建的单据
- 审批人可以查看待审批的单据
- 财务人员可以查看所有单据

## 最佳实践

### 1. 分页查询优化
- 建议每页数量不超过100条
- 使用时间范围筛选提高查询效率
- 合理使用关键字搜索

### 2. 数据验证
- 金额必须大于0
- 付款/收款时间不能早于创建时间
- 明细项金额总和必须等于单据总金额

### 3. 并发控制
- 使用乐观锁防止并发修改
- 审批操作需要检查单据状态

### 4. 安全建议
- 敏感操作需要二次确认
- 重要金额变更需要审计日志
- 定期备份财务数据
