/**
 * 财务管理 - 模拟数据
 * 包含付款单和收款单的真实业务场景示例数据
 */

import { 
  PaymentVO, 
  PaymentStatus, 
  PaymentMethod,
  ReceiptVO, 
  ReceiptStatus, 
  ReceiptMethod 
} from './payment-api-types';

/**
 * 供应商模拟数据
 */
export const mockSuppliers = [
  {
    id: 1,
    name: '北京科技有限公司',
    contact: '张经理',
    mobile: '13800138001',
    status: 0
  },
  {
    id: 2,
    name: '上海制造集团',
    contact: '李总监',
    mobile: '13800138002',
    status: 0
  },
  {
    id: 3,
    name: '深圳电子科技',
    contact: '王主管',
    mobile: '13800138003',
    status: 0
  }
];

/**
 * 客户模拟数据
 */
export const mockCustomers = [
  {
    id: 1,
    name: '华为技术有限公司',
    contact: '陈经理',
    mobile: '13900139001',
    status: '0'
  },
  {
    id: 2,
    name: '腾讯科技（深圳）有限公司',
    contact: '刘总监',
    mobile: '13900139002',
    status: '0'
  },
  {
    id: 3,
    name: '阿里巴巴（中国）有限公司',
    contact: '赵主管',
    mobile: '13900139003',
    status: '0'
  }
];

/**
 * 结算账户模拟数据
 */
export const mockAccounts = [
  {
    id: 1,
    name: '中国银行基本户',
    no: 'BOC001',
    defaultStatus: 0,
    status: 0
  },
  {
    id: 2,
    name: '工商银行一般户',
    no: 'ICBC001',
    defaultStatus: 1,
    status: 0
  },
  {
    id: 3,
    name: '支付宝企业账户',
    no: 'ALIPAY001',
    defaultStatus: 1,
    status: 0
  }
];

/**
 * 付款单模拟数据
 */
export const mockPayments: PaymentVO[] = [
  {
    id: 1,
    no: 'FK202401001',
    status: PaymentStatus.PAID,
    supplierId: 1,
    supplierName: '北京科技有限公司',
    supplierContact: '张经理',
    accountId: 1,
    accountName: '中国银行基本户',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    paymentTime: '2024-01-15 14:30:00',
    totalAmount: 150000.00,
    paidAmount: 150000.00,
    unpaidAmount: 0,
    currency: 'CNY',
    exchangeRate: 1.0,
    invoiceNo: 'INV202401001',
    contractNo: 'CT202401001',
    businessType: '设备采购',
    urgencyLevel: 2,
    remark: '设备采购款，已按合同约定支付',
    attachments: ['contract.pdf', 'invoice.pdf'],
    approverId: 1001,
    approverName: '财务总监',
    approvalTime: '2024-01-14 16:00:00',
    approvalComment: '审批通过，按时支付',
    items: [
      {
        id: 1,
        paymentId: 1,
        subjectCode: '1001',
        subjectName: '原材料',
        amount: 120000.00,
        remark: '生产设备'
      },
      {
        id: 2,
        paymentId: 1,
        subjectCode: '1002',
        subjectName: '运输费',
        amount: 30000.00,
        remark: '设备运输费用'
      }
    ],
    createBy: 2001,
    createByName: '采购员小王',
    createTime: '2024-01-10 09:00:00',
    updateBy: 2001,
    updateByName: '采购员小王',
    updateTime: '2024-01-15 14:30:00'
  },
  {
    id: 2,
    no: 'FK202401002',
    status: PaymentStatus.PENDING_APPROVAL,
    supplierId: 2,
    supplierName: '上海制造集团',
    supplierContact: '李总监',
    accountId: 1,
    accountName: '中国银行基本户',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    paymentTime: '2024-01-20 10:00:00',
    totalAmount: 280000.00,
    paidAmount: 0,
    unpaidAmount: 280000.00,
    currency: 'CNY',
    exchangeRate: 1.0,
    invoiceNo: 'INV202401002',
    contractNo: 'CT202401002',
    businessType: '原材料采购',
    urgencyLevel: 1,
    remark: '紧急采购，请尽快审批',
    attachments: ['purchase_order.pdf'],
    items: [
      {
        id: 3,
        paymentId: 2,
        subjectCode: '1001',
        subjectName: '原材料',
        amount: 280000.00,
        remark: '钢材采购'
      }
    ],
    createBy: 2002,
    createByName: '采购主管',
    createTime: '2024-01-18 14:20:00',
    updateBy: 2002,
    updateByName: '采购主管',
    updateTime: '2024-01-18 14:20:00'
  },
  {
    id: 3,
    no: 'FK202401003',
    status: PaymentStatus.DRAFT,
    supplierId: 3,
    supplierName: '深圳电子科技',
    supplierContact: '王主管',
    accountId: 2,
    accountName: '工商银行一般户',
    paymentMethod: PaymentMethod.ELECTRONIC,
    paymentTime: '2024-01-25 15:00:00',
    totalAmount: 95000.00,
    paidAmount: 0,
    unpaidAmount: 95000.00,
    currency: 'CNY',
    exchangeRate: 1.0,
    businessType: '电子元件采购',
    urgencyLevel: 3,
    remark: '草稿状态，待完善信息',
    items: [
      {
        id: 4,
        paymentId: 3,
        subjectCode: '1003',
        subjectName: '电子元件',
        amount: 95000.00,
        remark: '芯片采购'
      }
    ],
    createBy: 2003,
    createByName: '技术采购',
    createTime: '2024-01-22 11:30:00',
    updateBy: 2003,
    updateByName: '技术采购',
    updateTime: '2024-01-22 11:30:00'
  }
];

/**
 * 收款单模拟数据
 */
export const mockReceipts: ReceiptVO[] = [
  {
    id: 1,
    no: 'SK202401001',
    status: ReceiptStatus.RECEIVED,
    customerId: 1,
    customerName: '华为技术有限公司',
    customerContact: '陈经理',
    accountId: 1,
    accountName: '中国银行基本户',
    receiptMethod: ReceiptMethod.BANK_TRANSFER,
    receiptTime: '2024-01-12 10:30:00',
    totalAmount: 500000.00,
    receivedAmount: 500000.00,
    unreceivedAmount: 0,
    currency: 'CNY',
    exchangeRate: 1.0,
    invoiceNo: 'SINV202401001',
    contractNo: 'SCT202401001',
    businessType: '产品销售',
    urgencyLevel: 2,
    remark: '产品销售收款，已到账',
    attachments: ['sales_contract.pdf', 'delivery_note.pdf'],
    approverId: 1001,
    approverName: '财务总监',
    approvalTime: '2024-01-11 14:00:00',
    approvalComment: '审批通过，确认收款',
    items: [
      {
        id: 1,
        receiptId: 1,
        subjectCode: '4001',
        subjectName: '主营业务收入',
        amount: 500000.00,
        remark: '产品销售收入'
      }
    ],
    createBy: 3001,
    createByName: '销售经理',
    createTime: '2024-01-08 09:15:00',
    updateBy: 3001,
    updateByName: '销售经理',
    updateTime: '2024-01-12 10:30:00'
  },
  {
    id: 2,
    no: 'SK202401002',
    status: ReceiptStatus.APPROVED,
    customerId: 2,
    customerName: '腾讯科技（深圳）有限公司',
    customerContact: '刘总监',
    accountId: 1,
    accountName: '中国银行基本户',
    receiptMethod: ReceiptMethod.BANK_TRANSFER,
    receiptTime: '2024-01-22 16:00:00',
    totalAmount: 320000.00,
    receivedAmount: 0,
    unreceivedAmount: 320000.00,
    currency: 'CNY',
    exchangeRate: 1.0,
    invoiceNo: 'SINV202401002',
    contractNo: 'SCT202401002',
    businessType: '技术服务',
    urgencyLevel: 1,
    remark: '技术服务费，已审批待收款',
    attachments: ['service_agreement.pdf'],
    approverId: 1001,
    approverName: '财务总监',
    approvalTime: '2024-01-20 11:00:00',
    approvalComment: '审批通过，等待客户付款',
    items: [
      {
        id: 2,
        receiptId: 2,
        subjectCode: '4002',
        subjectName: '技术服务收入',
        amount: 320000.00,
        remark: '软件开发服务'
      }
    ],
    createBy: 3002,
    createByName: '项目经理',
    createTime: '2024-01-18 13:45:00',
    updateBy: 3002,
    updateByName: '项目经理',
    updateTime: '2024-01-20 11:00:00'
  },
  {
    id: 3,
    no: 'SK202401003',
    status: ReceiptStatus.PENDING_APPROVAL,
    customerId: 3,
    customerName: '阿里巴巴（中国）有限公司',
    customerContact: '赵主管',
    accountId: 3,
    accountName: '支付宝企业账户',
    receiptMethod: ReceiptMethod.ELECTRONIC,
    receiptTime: '2024-01-28 14:00:00',
    totalAmount: 180000.00,
    receivedAmount: 0,
    unreceivedAmount: 180000.00,
    currency: 'CNY',
    exchangeRate: 1.0,
    invoiceNo: 'SINV202401003',
    contractNo: 'SCT202401003',
    businessType: '咨询服务',
    urgencyLevel: 2,
    remark: '管理咨询服务费，待审批',
    attachments: ['consulting_proposal.pdf'],
    items: [
      {
        id: 3,
        receiptId: 3,
        subjectCode: '4003',
        subjectName: '咨询服务收入',
        amount: 180000.00,
        remark: '管理咨询服务'
      }
    ],
    createBy: 3003,
    createByName: '咨询顾问',
    createTime: '2024-01-25 16:20:00',
    updateBy: 3003,
    updateByName: '咨询顾问',
    updateTime: '2024-01-25 16:20:00'
  }
];

/**
 * 会计科目模拟数据
 */
export const mockAccountSubjects = [
  {
    code: '1001',
    name: '原材料',
    type: 'ASSET',
    level: 2,
    parentCode: '1000',
    enabled: true,
    remark: '生产用原材料'
  },
  {
    code: '1002',
    name: '运输费',
    type: 'EXPENSE',
    level: 2,
    parentCode: '1000',
    enabled: true,
    remark: '货物运输费用'
  },
  {
    code: '1003',
    name: '电子元件',
    type: 'ASSET',
    level: 2,
    parentCode: '1000',
    enabled: true,
    remark: '电子产品元件'
  },
  {
    code: '4001',
    name: '主营业务收入',
    type: 'REVENUE',
    level: 2,
    parentCode: '4000',
    enabled: true,
    remark: '主要业务收入'
  },
  {
    code: '4002',
    name: '技术服务收入',
    type: 'REVENUE',
    level: 2,
    parentCode: '4000',
    enabled: true,
    remark: '技术服务收入'
  },
  {
    code: '4003',
    name: '咨询服务收入',
    type: 'REVENUE',
    level: 2,
    parentCode: '4000',
    enabled: true,
    remark: '咨询服务收入'
  }
];

/**
 * 审批历史模拟数据
 */
export const mockApprovalHistory = [
  {
    id: 1,
    documentId: 1,
    documentType: 'PAYMENT',
    approverId: 1001,
    approverName: '财务总监',
    action: 'APPROVE',
    comment: '审批通过，按时支付',
    approvalTime: '2024-01-14 16:00:00',
    statusChange: {
      from: PaymentStatus.PENDING_APPROVAL,
      to: PaymentStatus.APPROVED
    }
  },
  {
    id: 2,
    documentId: 1,
    documentType: 'RECEIPT',
    approverId: 1001,
    approverName: '财务总监',
    action: 'APPROVE',
    comment: '审批通过，确认收款',
    approvalTime: '2024-01-11 14:00:00',
    statusChange: {
      from: ReceiptStatus.PENDING_APPROVAL,
      to: ReceiptStatus.APPROVED
    }
  }
];

/**
 * 统计数据模拟
 */
export const mockPaymentStatistics = {
  totalCount: 25,
  totalAmount: 2850000.00,
  paidAmount: 1650000.00,
  pendingAmount: 1200000.00,
  statusStatistics: [
    {
      status: PaymentStatus.DRAFT,
      count: 3,
      amount: 285000.00
    },
    {
      status: PaymentStatus.PENDING_APPROVAL,
      count: 8,
      amount: 915000.00
    },
    {
      status: PaymentStatus.APPROVED,
      count: 6,
      amount: 720000.00
    },
    {
      status: PaymentStatus.PAID,
      count: 8,
      amount: 930000.00
    }
  ],
  monthlyStatistics: [
    {
      month: '2024-01',
      count: 25,
      amount: 2850000.00
    },
    {
      month: '2023-12',
      count: 18,
      amount: 2100000.00
    },
    {
      month: '2023-11',
      count: 22,
      amount: 2650000.00
    }
  ]
};

export const mockReceiptStatistics = {
  totalCount: 18,
  totalAmount: 1980000.00,
  receivedAmount: 1280000.00,
  pendingAmount: 700000.00,
  statusStatistics: [
    {
      status: ReceiptStatus.DRAFT,
      count: 2,
      amount: 150000.00
    },
    {
      status: ReceiptStatus.PENDING_APPROVAL,
      count: 5,
      amount: 550000.00
    },
    {
      status: ReceiptStatus.APPROVED,
      count: 4,
      amount: 480000.00
    },
    {
      status: ReceiptStatus.RECEIVED,
      count: 7,
      amount: 800000.00
    }
  ],
  monthlyStatistics: [
    {
      month: '2024-01',
      count: 18,
      amount: 1980000.00
    },
    {
      month: '2023-12',
      count: 15,
      amount: 1750000.00
    },
    {
      month: '2023-11',
      count: 20,
      amount: 2200000.00
    }
  ]
};
